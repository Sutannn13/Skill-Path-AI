import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { TargetRole } from '@/types'
import { ExperienceLevel } from '@/lib/constants/experience'
import { extractCvText, CvExtractionError, MAX_CV_BYTES } from '@/lib/cv/extract'
import { analyzeCvHeuristic } from '@/lib/cv/heuristics'
import { analyzeCvWithGemini, mergeCvAnalysis } from '@/lib/cv/gemini-cv'
import { CvAnalysisResponse } from '@/lib/cv/types'

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

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const contentType = request.headers.get('content-type') || ''
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json(
        {
          code: 'INVALID_CONTENT_TYPE',
          error: 'Invalid content type',
          message: 'Kirim file melalui multipart/form-data.',
        },
        { status: 415 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file')
    const rawRole = formData.get('targetRole')
    const rawLevel = formData.get('experienceLevel')

    if (!(file instanceof File)) {
      return NextResponse.json(
        { code: 'NO_FILE', error: 'No file', message: 'Tidak ada file CV yang diunggah.' },
        { status: 400 }
      )
    }

    const roleParse = targetRoleSchema.safeParse(rawRole)
    if (!roleParse.success) {
      return NextResponse.json(
        { code: 'INVALID_ROLE', error: 'Invalid role', message: 'Role tujuan tidak valid.' },
        { status: 400 }
      )
    }
    const targetRole = roleParse.data as TargetRole

    // Experience level is optional; default to entry-level expectations.
    const levelParse = experienceLevelSchema.safeParse(rawLevel)
    const experienceLevel: ExperienceLevel = levelParse.success ? levelParse.data : 'entry'

    if (file.size > MAX_CV_BYTES) {
      return NextResponse.json(
        {
          code: 'FILE_TOO_LARGE',
          error: 'File too large',
          message: 'Ukuran file melebihi 5 MB. Kompres atau ekspor ulang CV Anda.',
        },
        { status: 413 }
      )
    }

    const buffer = Buffer.from(await file.arrayBuffer())

    let extracted
    try {
      extracted = await extractCvText(buffer, file.name, file.type)
    } catch (error) {
      if (error instanceof CvExtractionError) {
        const status = error.code === 'UNSUPPORTED_TYPE' ? 415 : error.code === 'FILE_TOO_LARGE' ? 413 : 422
        return NextResponse.json(
          { code: error.code, error: 'Extraction failed', message: error.message },
          { status }
        )
      }
      throw error
    }

    // Deterministic baseline first: always works, grounds the role match.
    const heuristic = analyzeCvHeuristic({
      text: extracted.text,
      wordCount: extracted.wordCount,
      targetRole,
      experienceLevel,
      links: extracted.links,
    })

    // Try the AI layer; fall back to the heuristic on any failure.
    const ai = await analyzeCvWithGemini({
      text: extracted.text,
      targetRole,
      experienceLevel,
      links: extracted.links,
    })
    const analysis = ai ? mergeCvAnalysis(heuristic, ai) : heuristic

    const payload: CvAnalysisResponse = {
      analysis,
      extracted: {
        text: extracted.text,
        links: extracted.links,
      },
      meta: {
        fileName: file.name,
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
    console.error('[CV] analyze error:', error instanceof Error ? error.message : error)
    return NextResponse.json(
      {
        code: 'INTERNAL_ERROR',
        error: 'Internal error',
        message: 'Terjadi kesalahan saat menganalisis CV. Silakan coba lagi.',
      },
      { status: 500 }
    )
  }
}

export async function GET(): Promise<NextResponse> {
  return NextResponse.json(
    {
      error: 'Method not allowed',
      message: 'Gunakan POST /api/cv/analyze dengan multipart/form-data berisi file, targetRole, experienceLevel.',
    },
    { status: 405 }
  )
}
