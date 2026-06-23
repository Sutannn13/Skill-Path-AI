import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { TargetRole } from '@/types'
import { ExperienceLevel } from '@/lib/constants/experience'
import {
  generateCoverLetterWithGemini,
  buildFallbackCoverLetter,
} from '@/lib/cv/gemini-cover-letter'
import { CoverLetterResponse } from '@/lib/cv/types'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 60

const MAX_TEXT_CHARS = 30000

const targetRoleSchema = z.enum([
  'frontend-developer',
  'backend-developer',
  'fullstack-developer',
  'ui-engineer',
  'mobile-developer',
  'data-analyst',
])
const experienceLevelSchema = z.enum(['internship', 'entry', 'junior', 'mid', 'senior'])

const bodySchema = z.object({
  text: z.string().min(100, 'Teks CV terlalu pendek.').max(MAX_TEXT_CHARS),
  targetRole: targetRoleSchema,
  experienceLevel: experienceLevelSchema.optional(),
  company: z.string().max(160).optional(),
  position: z.string().max(160).optional(),
})

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const json = await request.json().catch(() => null)
    const parsed = bodySchema.safeParse(json)
    if (!parsed.success) {
      return NextResponse.json(
        {
          code: 'INVALID_BODY',
          error: 'Invalid body',
          message: parsed.error.issues[0]?.message || 'Data tidak valid. Jalankan audit CV terlebih dahulu.',
        },
        { status: 400 }
      )
    }

    const { text } = parsed.data
    const targetRole = parsed.data.targetRole as TargetRole
    const experienceLevel: ExperienceLevel = parsed.data.experienceLevel ?? 'entry'
    const company = parsed.data.company?.trim() || undefined
    const position = parsed.data.position?.trim() || undefined

    const ai = await generateCoverLetterWithGemini({ text, targetRole, experienceLevel, company, position })
    const coverLetter = ai ?? buildFallbackCoverLetter({ text, targetRole, experienceLevel, company, position })

    const payload: CoverLetterResponse = {
      coverLetter,
      meta: {
        targetRole,
        experienceLevel,
        company: company ?? null,
        position: position ?? null,
        generatedAt: new Date().toISOString(),
        source: coverLetter.source,
      },
    }
    return NextResponse.json(payload)
  } catch (error) {
    console.error('[CV] cover-letter error:', error instanceof Error ? error.message : error)
    return NextResponse.json(
      {
        code: 'INTERNAL_ERROR',
        error: 'Internal error',
        message: 'Terjadi kesalahan saat membuat cover letter. Silakan coba lagi.',
      },
      { status: 500 }
    )
  }
}

export async function GET(): Promise<NextResponse> {
  return NextResponse.json(
    {
      error: 'Method not allowed',
      message: 'Gunakan POST /api/cv/cover-letter dengan JSON { text, targetRole, experienceLevel, company?, position? }.',
    },
    { status: 405 }
  )
}
