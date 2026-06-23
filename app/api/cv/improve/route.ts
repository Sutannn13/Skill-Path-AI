import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { TargetRole } from '@/types'
import { ExperienceLevel } from '@/lib/constants/experience'
import { improveCvWithGemini } from '@/lib/cv/gemini-improve'
import { buildFallbackDraft } from '@/lib/cv/improve-fallback'
import { classifyLink, CvLink } from '@/lib/cv/links'
import { CvImproveResponse } from '@/lib/cv/types'

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
  links: z
    .array(z.object({ url: z.string(), label: z.string().optional(), type: z.string().optional() }))
    .max(30)
    .optional(),
  issues: z.array(z.string().max(500)).max(20).optional(),
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

    const { text, issues } = parsed.data
    const targetRole = parsed.data.targetRole as TargetRole
    const experienceLevel: ExperienceLevel = parsed.data.experienceLevel ?? 'entry'

    // Re-classify links defensively so a malformed client payload cannot smuggle
    // an unexpected type into the generator.
    const links: CvLink[] = (parsed.data.links ?? []).map((l) => ({
      url: l.url,
      label: l.label || l.url,
      type: classifyLink(l.url),
    }))

    const ai = await improveCvWithGemini({ text, targetRole, experienceLevel, links, issues })
    const draft = ai ?? buildFallbackDraft({ text, targetRole, experienceLevel, links })

    const payload: CvImproveResponse = {
      draft,
      meta: {
        targetRole,
        experienceLevel,
        generatedAt: new Date().toISOString(),
        source: draft.source,
      },
    }
    return NextResponse.json(payload)
  } catch (error) {
    console.error('[CV] improve error:', error instanceof Error ? error.message : error)
    return NextResponse.json(
      {
        code: 'INTERNAL_ERROR',
        error: 'Internal error',
        message: 'Terjadi kesalahan saat menyusun ulang CV. Silakan coba lagi.',
      },
      { status: 500 }
    )
  }
}

export async function GET(): Promise<NextResponse> {
  return NextResponse.json(
    {
      error: 'Method not allowed',
      message: 'Gunakan POST /api/cv/improve dengan JSON { text, targetRole, experienceLevel, links, issues }.',
    },
    { status: 405 }
  )
}
