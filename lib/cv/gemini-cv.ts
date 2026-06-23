import { z } from 'zod'
import { TargetRole } from '@/types'
import { ExperienceLevel, getExperienceLevelLabel } from '@/lib/constants/experience'
import { getRoleById } from '@/lib/constants/roles'
import {
  GEMINI_GENERATE_CONTENT_URL,
  getGeminiRequestHeaders,
} from '@/lib/ai/gemini-config'
import { ROLE_KEYWORDS, LEVEL_EXPECTATIONS, findKeywords } from './role-expectations'
import { CvLink } from './links'
import { CvAnalysis } from './types'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const GEMINI_TIMEOUT_MS = 20000
const GEMINI_MAX_ATTEMPTS = 3
const GEMINI_BASE_BACKOFF_MS = 400
// Cap the resume text we send so a huge multi-page PDF can't blow the prompt
// budget. ~14k chars is roughly 3-4 dense resume pages.
const MAX_CV_PROMPT_CHARS = 14000

// Control chars (0x00-0x1F except TAB/LF/CR, plus 0x7F DEL) stripped before
// prompting. Built via new RegExp from \u escapes so the source stays ASCII.
function buildControlCharsRegex(): RegExp {
  // 0x00-0x1F except TAB(09)/LF(0A)/CR(0D), plus 0x7F. Source stays ASCII.
  const codes: number[] = []
  for (let c = 0; c <= 0x1f; c++) {
    if (c === 9 || c === 10 || c === 13) continue
    codes.push(c)
  }
  codes.push(0x7f)
  const cls = codes.map((c) => String.fromCharCode(c)).join("")
  return new RegExp("[" + cls + "]", "g")
}

const CONTROL_CHARS_RE = buildControlCharsRegex()

// The qualitative slice the LLM is responsible for. roleMatch is intentionally
// excluded: keyword coverage is computed deterministically and merged in by the
// caller so the riskiest number can never be hallucinated.
const aiAnalysisSchema = z.object({
  overallScore: z.number().min(0).max(100),
  summary: z.string().min(1).max(1200),
  ats: z.object({
    score: z.number().min(0).max(100),
    issues: z.array(z.string().min(1).max(300)).max(10),
  }),
  sections: z
    .array(
      z.object({
        name: z.string().min(1).max(60),
        present: z.boolean(),
        status: z.enum(['good', 'warning', 'missing']),
        feedback: z.string().min(1).max(400),
      })
    )
    .min(1)
    .max(10),
  strengths: z.array(z.string().min(1).max(300)).max(10),
  issues: z
    .array(
      z.object({
        severity: z.enum(['high', 'medium', 'low']),
        title: z.string().min(1).max(120),
        detail: z.string().min(1).max(500),
        fix: z.string().min(1).max(500),
      })
    )
    .max(15),
  revisions: z.array(z.string().min(1).max(400)).max(15),
})

export type AiCvAnalysis = z.infer<typeof aiAnalysisSchema>

function sanitizeCvText(text: string): string {
  return text
    // Strip control chars (keep newlines/tabs) and code fences to blunt injection.
    .replace(CONTROL_CHARS_RE, ' ')
    .replace(/`{3,}/g, ' ')
    .slice(0, MAX_CV_PROMPT_CHARS)
}

function getBackoffDelayMs(attempt: number): number {
  const exponential = GEMINI_BASE_BACKOFF_MS * 2 ** (attempt - 1)
  const jitter = Math.floor(Math.random() * 120)
  return exponential + jitter
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function describeLinks(links: CvLink[]): string {
  if (!links || links.length === 0) {
    return '(no clickable links detected in the CV)'
  }
  return links
    .slice(0, 12)
    .map((l) => `- ${l.type}: ${l.url}${l.label && l.label !== l.url ? ` (text: "${l.label}")` : ''}`)
    .join('\n')
}

function buildPrompt(input: {
  text: string
  targetRole: TargetRole
  experienceLevel: ExperienceLevel
  links?: CvLink[]
}): string {
  const roleLabel = getRoleById(input.targetRole)?.label ?? input.targetRole
  const levelLabel = getExperienceLevelLabel(input.experienceLevel)
  const lower = input.text.toLowerCase()
  const keywordSet = ROLE_KEYWORDS[input.targetRole]
  const core = findKeywords(lower, keywordSet.core)
  const supporting = findKeywords(lower, keywordSet.supporting)

  return `You are a strict but supportive technical recruiter and ATS expert reviewing a candidate's CV/resume.

TARGET ROLE: ${roleLabel}
EXPERIENCE LEVEL: ${levelLabel}
LEVEL EXPECTATION: ${LEVEL_EXPECTATIONS[input.experienceLevel]}

GROUNDED KEYWORD SCAN (computed from the actual CV text, trust these facts):
- Core skills FOUND: ${core.matched.join(', ') || '(none)'}
- Core skills MISSING: ${core.missing.join(', ') || '(none)'}
- Supporting skills FOUND: ${supporting.matched.join(', ') || '(none)'}

DETECTED HYPERLINKS (extracted from the CV's real link annotations, trust these):
${describeLinks(input.links ?? [])}

INSTRUCTIONS:
- Audit the CV ONLY for fitness to apply as a ${roleLabel} at ${levelLabel} level.
- Be specific and reference what is actually in the CV. Do NOT invent experience the candidate does not have.
- Judge honestly: an underqualified or generic CV must score low.
- Write ALL human-readable text (summary, feedback, titles, fixes, revisions) in Bahasa Indonesia, natural and clear.
- "issues" must be concrete problems with an actionable "fix" each. "revisions" are short, ordered, copy-paste-ready instructions (e.g. "Ganti 'mengerjakan tugas' jadi 'membangun fitur X yang menaikkan retensi 20%'").
- "sections" should cover: Kontak, Ringkasan, Pengalaman, Pendidikan, Skill, Proyek, Tautan (mark present/absent honestly).
- Comment on the detected hyperlinks: for technical roles, note if GitHub/portfolio is missing; if a portfolio link exists, treat it as a strength.
- "ats" score reflects machine-readability (clear sections, no tables/images-as-text, contact info parseable).
- "overallScore" 0-100 reflects readiness to apply for this specific role and level.

CV TEXT:
"""
${sanitizeCvText(input.text)}
"""

Return ONLY valid JSON (no markdown, no commentary) in EXACTLY this shape:
{
  "overallScore": number,
  "summary": "ringkasan penilaian dalam Bahasa Indonesia",
  "ats": { "score": number, "issues": ["..."] },
  "sections": [ { "name": "Kontak", "present": true, "status": "good|warning|missing", "feedback": "..." } ],
  "strengths": ["..."],
  "issues": [ { "severity": "high|medium|low", "title": "...", "detail": "...", "fix": "..." } ],
  "revisions": ["..."]
}`
}

/**
 * Calls Gemini to produce the qualitative slice of the CV audit. Returns null
 * on any failure (no key, timeout, bad JSON, schema mismatch) so the caller can
 * fall back to the deterministic heuristic.
 */
export async function analyzeCvWithGemini(input: {
  text: string
  targetRole: TargetRole
  experienceLevel: ExperienceLevel
  links?: CvLink[]
}): Promise<AiCvAnalysis | null> {
  if (!GEMINI_API_KEY) return null

  const prompt = buildPrompt(input)
  let response: Response | null = null

  for (let attempt = 1; attempt <= GEMINI_MAX_ATTEMPTS; attempt++) {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), GEMINI_TIMEOUT_MS)

    try {
      response = await fetch(GEMINI_GENERATE_CONTENT_URL, {
        method: 'POST',
        headers: getGeminiRequestHeaders(GEMINI_API_KEY),
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 4096,
            responseMimeType: 'application/json',
          },
        }),
        signal: controller.signal,
      })

      if (response.ok) break

      const shouldRetry = response.status === 429 || response.status >= 500
      if (!shouldRetry || attempt === GEMINI_MAX_ATTEMPTS) {
        console.error('[CV] Gemini API error:', response.status)
        return null
      }
      await wait(getBackoffDelayMs(attempt))
    } catch (error) {
      if (attempt === GEMINI_MAX_ATTEMPTS) {
        console.error('[CV] Gemini request failed:', error instanceof Error ? error.message : 'unknown')
        return null
      }
      await wait(getBackoffDelayMs(attempt))
    } finally {
      clearTimeout(timeoutId)
    }
  }

  if (!response || !response.ok) return null

  try {
    const data = await response.json()
    const generatedText: string | undefined = data.candidates?.[0]?.content?.parts?.[0]?.text
    if (!generatedText) return null

    const cleaned = generatedText.replace(/```json\n?|```\n?/g, '').trim()
    const parsed = JSON.parse(cleaned)
    return aiAnalysisSchema.parse(parsed)
  } catch (error) {
    console.error('[CV] Gemini parse/validation failed:', error instanceof Error ? error.message : 'unknown')
    return null
  }
}

/**
 * Merge the AI's qualitative audit onto the deterministic heuristic baseline.
 * roleMatch always comes from the grounded heuristic; the overall score is a
 * blend so the LLM cannot drift too far from observable evidence.
 */
export function mergeCvAnalysis(heuristic: CvAnalysis, ai: AiCvAnalysis): CvAnalysis {
  const blendedScore = Math.round(ai.overallScore * 0.6 + heuristic.overallScore * 0.4)
  const verdict = blendedScore >= 75 ? 'aman' : blendedScore >= 50 ? 'perlu-revisi' : 'belum-siap'
  const verdictLabel =
    verdict === 'aman' ? 'Aman untuk melamar' : verdict === 'perlu-revisi' ? 'Perlu revisi dulu' : 'Belum siap dilamar'

  return {
    overallScore: blendedScore,
    verdict,
    verdictLabel,
    summary: ai.summary,
    roleMatch: heuristic.roleMatch, // grounded, never hallucinated
    ats: ai.ats,
    sections: ai.sections.length > 0 ? ai.sections : heuristic.sections,
    strengths: ai.strengths.length > 0 ? ai.strengths : heuristic.strengths,
    issues: ai.issues.length > 0 ? ai.issues : heuristic.issues,
    revisions: ai.revisions.length > 0 ? ai.revisions : heuristic.revisions,
    links: heuristic.links, // grounded from extraction, never hallucinated
    source: 'ai',
  }
}
