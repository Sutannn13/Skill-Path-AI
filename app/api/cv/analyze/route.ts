import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { TargetRole } from '@/types'
import { ExperienceLevel } from '@/lib/constants/experience'
import { extractCvText, CvExtractionError, MAX_CV_BYTES } from '@/lib/cv/extract'
import { analyzeCvHeuristic } from '@/lib/cv/heuristics'
import { analyzeCvWithGemini, mergeCvAnalysis } from '@/lib/cv/gemini-cv'
import { CvAnalysisResponse } from '@/lib/cv/types'
import {
  ANALYSIS_STEPS,
  encodeStep,
  type AnalysisStepEvent,
  type StepNumber,
} from '@/lib/cv/stream-progress'

export const dynamic = 'force-dynamic'
// pdf-parse + mammoth need the Node.js runtime (Buffer, dynamic require).
export const runtime = 'nodejs'
export const maxDuration = 60

const targetRoleSchema = z.enum([
  'frontend-developer',
  'backend-developer',
  'fullstack-developer',
  'ui-engineer',
  'mobile-developer',
  'data-analyst',
])

const experienceLevelSchema = z.enum(['internship', 'entry', 'junior', 'mid', 'senior'])

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function jsonError(code: string, message: string, status: number) {
  return NextResponse.json({ code, error: code, message }, { status })
}

/** Check whether the client wants NDJSON streaming. */
function wantsStream(request: NextRequest): boolean {
  const accept = request.headers.get('accept') || ''
  return (
    accept.includes('application/x-ndjson') ||
    accept.includes('text/event-stream')
  )
}

/** Emit a step event into the stream. */
function emitStep(
  controller: ReadableStreamDefaultController<Uint8Array>,
  step: StepNumber,
  status: 'running' | 'done' | 'error',
  extra?: { error?: string; result?: CvAnalysisResponse }
) {
  const label = ANALYSIS_STEPS.find((s) => s.step === step)?.label ?? ''
  const event: AnalysisStepEvent = { step, label, status, ...extra }
  controller.enqueue(encodeStep(event))
}

// ---------------------------------------------------------------------------
// POST handler
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest): Promise<Response> {
  // ── Validate inputs (shared by both modes) ────────────────────────────
  const contentType = request.headers.get('content-type') || ''
  if (!contentType.includes('multipart/form-data')) {
    return jsonError('INVALID_CONTENT_TYPE', 'Kirim file melalui multipart/form-data.', 415)
  }

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return jsonError('INVALID_BODY', 'Gagal membaca form data.', 400)
  }

  const file = formData.get('file')
  const rawRole = formData.get('targetRole')
  const rawLevel = formData.get('experienceLevel')

  if (!(file instanceof File)) {
    return jsonError('NO_FILE', 'Tidak ada file CV yang diunggah.', 400)
  }

  const roleParse = targetRoleSchema.safeParse(rawRole)
  if (!roleParse.success) {
    return jsonError('INVALID_ROLE', 'Role tujuan tidak valid.', 400)
  }
  const targetRole = roleParse.data as TargetRole

  const levelParse = experienceLevelSchema.safeParse(rawLevel)
  const experienceLevel: ExperienceLevel = levelParse.success ? levelParse.data : 'entry'

  if (file.size > MAX_CV_BYTES) {
    return jsonError(
      'FILE_TOO_LARGE',
      'Ukuran file melebihi 5 MB. Kompres atau ekspor ulang CV Anda.',
      413
    )
  }

  // Read the file buffer eagerly — it is needed by both code paths.
  const buffer = Buffer.from(await file.arrayBuffer())
  const fileName = file.name
  const fileType = file.type

  // ── Choose streaming vs. classic JSON mode ────────────────────────────
  if (wantsStream(request)) {
    return buildStreamResponse(buffer, fileName, fileType, targetRole, experienceLevel)
  }
  return buildJsonResponse(buffer, fileName, fileType, targetRole, experienceLevel)
}

// ---------------------------------------------------------------------------
// Classic JSON response (non-streaming fallback)
// ---------------------------------------------------------------------------

async function buildJsonResponse(
  buffer: Buffer,
  fileName: string,
  fileType: string,
  targetRole: TargetRole,
  experienceLevel: ExperienceLevel
): Promise<NextResponse> {
  try {
    const extracted = await extractCvText(buffer, fileName, fileType)

    const heuristic = analyzeCvHeuristic({
      text: extracted.text,
      wordCount: extracted.wordCount,
      targetRole,
      experienceLevel,
      links: extracted.links,
    })

    const ai = await analyzeCvWithGemini({
      text: extracted.text,
      targetRole,
      experienceLevel,
      links: extracted.links,
    })
    const analysis = ai ? mergeCvAnalysis(heuristic, ai) : heuristic

    const payload: CvAnalysisResponse = {
      analysis,
      extracted: { text: extracted.text, links: extracted.links },
      meta: {
        fileName,
        fileType: extracted.fileType,
        targetRole,
        experienceLevel,
        wordCount: extracted.wordCount,
        analyzedAt: new Date().toISOString(),
        source: analysis.source,
      },
    }
    return NextResponse.json(payload)
  } catch (error) {
    if (error instanceof CvExtractionError) {
      const status =
        error.code === 'UNSUPPORTED_TYPE' ? 415 : error.code === 'FILE_TOO_LARGE' ? 413 : 422
      return NextResponse.json(
        { code: error.code, error: 'Extraction failed', message: error.message },
        { status }
      )
    }
    console.error('[CV] analyze error:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    })
    return jsonError('INTERNAL_ERROR', 'Terjadi kesalahan saat menganalisis CV. Silakan coba lagi.', 500)
  }
}

// ---------------------------------------------------------------------------
// Streaming NDJSON response
// ---------------------------------------------------------------------------

function buildStreamResponse(
  buffer: Buffer,
  fileName: string,
  fileType: string,
  targetRole: TargetRole,
  experienceLevel: ExperienceLevel
): Response {
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        // Step 1: Membaca file CV
        emitStep(controller, 1, 'running')
        // Buffer already read; this step signals file acceptance.
        emitStep(controller, 1, 'done')

        // Step 2: Mengekstrak teks & struktur
        emitStep(controller, 2, 'running')
        let extracted
        try {
          extracted = await extractCvText(buffer, fileName, fileType)
        } catch (error) {
          const msg =
            error instanceof CvExtractionError
              ? error.message
              : 'Gagal mengekstrak teks dari file.'
          emitStep(controller, 2, 'error', { error: msg })
          controller.close()
          return
        }
        emitStep(controller, 2, 'done')

        // Step 3: Memeriksa keterbacaan ATS
        emitStep(controller, 3, 'running')
        let heuristic
        try {
          heuristic = analyzeCvHeuristic({
            text: extracted.text,
            wordCount: extracted.wordCount,
            targetRole,
            experienceLevel,
            links: extracted.links,
          })
        } catch (error) {
          emitStep(controller, 3, 'error', {
            error: 'Gagal memeriksa keterbacaan ATS: ' + (error instanceof Error ? error.message : 'unknown'),
          })
          controller.close()
          return
        }
        emitStep(controller, 3, 'done')

        // Step 4: Mencocokkan skill dengan role tujuan
        emitStep(controller, 4, 'running')
        // Role matching is part of heuristic — already computed above. This step
        // exists to give the user visible feedback that skill matching happened.
        emitStep(controller, 4, 'done')

        // Step 5: Menganalisis dengan AI (Gemini)
        emitStep(controller, 5, 'running')
        let ai = null
        try {
          ai = await analyzeCvWithGemini({
            text: extracted.text,
            targetRole,
            experienceLevel,
            links: extracted.links,
          })
        } catch (error) {
          // AI failure is non-fatal: we fall back to heuristic.
          console.error('[CV] Gemini stream error:', error instanceof Error ? error.message : error)
        }
        emitStep(controller, 5, 'done')

        // Step 6: Menyusun rekomendasi & checklist revisi
        emitStep(controller, 6, 'running')
        const analysis = ai ? mergeCvAnalysis(heuristic, ai) : heuristic

        const payload: CvAnalysisResponse = {
          analysis,
          extracted: { text: extracted.text, links: extracted.links },
          meta: {
            fileName,
            fileType: extracted.fileType,
            targetRole,
            experienceLevel,
            wordCount: extracted.wordCount,
            analyzedAt: new Date().toISOString(),
            source: analysis.source,
          },
        }
        emitStep(controller, 6, 'done', { result: payload })

        controller.close()
      } catch (error) {
        // Catch-all: emit error on step 1 if we never got further.
        console.error('[CV] stream fatal error:', {
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        })
        try {
          emitStep(controller, 1, 'error', {
            error: 'Terjadi kesalahan tak terduga. Silakan coba lagi.',
          })
          controller.close()
        } catch {
          // Stream may already be closed.
        }
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'application/x-ndjson; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}

// ---------------------------------------------------------------------------
// GET (unchanged)
// ---------------------------------------------------------------------------

export async function GET(): Promise<NextResponse> {
  return NextResponse.json(
    {
      error: 'Method not allowed',
      message: 'Gunakan POST /api/cv/analyze dengan multipart/form-data berisi file, targetRole, experienceLevel.',
    },
    { status: 405 }
  )
}
