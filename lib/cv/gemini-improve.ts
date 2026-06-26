import { z } from 'zod'
import { TargetRole } from '@/types'
import { ExperienceLevel, getExperienceLevelLabel } from '@/lib/constants/experience'
import { getRoleById } from '@/lib/constants/roles'
import { ROLE_KEYWORDS, LEVEL_EXPECTATIONS, findKeywords } from './role-expectations'
import { CvLink } from './links'
import { CvDraft } from './types'
import { callGeminiJson, sanitizeForPrompt } from './gemini-client'
import { ATS_FORMAT_DIRECTIVE, ATS_REFERENCE_TEMPLATE } from './ats-prompt'

// Structured shape the model must return. Kept close to CvDraft but without the
// `source` field (set by the caller) so the schema is purely model-controlled.
const draftSchema = z.object({
  fullName: z.string().min(1).max(120),
  headline: z.string().min(1).max(160),
  contact: z.object({
    email: z.string().max(160).optional().default(''),
    phone: z.string().max(60).optional().default(''),
    location: z.string().max(120).optional().default(''),
  }),
  links: z
    .array(z.object({ label: z.string().min(1).max(80), url: z.string().min(1).max(300) }))
    .max(10)
    .default([]),
  summary: z.string().min(1).max(900),
  experience: z
    .array(
      z.object({
        role: z.string().min(1).max(120),
        company: z.string().min(1).max(120),
        period: z.string().max(80).optional().default(''),
        location: z.string().max(120).optional().default(''),
        bullets: z.array(z.string().min(1).max(400)).max(8).default([]),
      })
    )
    .max(12)
    .default([]),
  education: z
    .array(
      z.object({
        degree: z.string().min(1).max(160),
        institution: z.string().min(1).max(160),
        period: z.string().max(80).optional().default(''),
        detail: z.string().max(300).optional().default(''),
      })
    )
    .max(8)
    .default([]),
  skills: z
    .array(z.object({ category: z.string().min(1).max(80), items: z.array(z.string().min(1).max(60)).max(40) }))
    .max(12)
    .default([]),
  projects: z
    .array(
      z.object({
        name: z.string().min(1).max(120),
        stack: z.string().max(120).optional().default(''),
        description: z.string().min(1).max(500),
        link: z.string().max(300).optional().default(''),
        bullets: z.array(z.string().min(1).max(400)).max(6).optional().default([]),
      })
    )
    .max(10)
    .default([]),
  certifications: z.array(z.string().min(1).max(200)).max(15).default([]),
  languages: z
    .array(z.object({ name: z.string().min(1).max(60), level: z.string().min(1).max(80) }))
    .max(8)
    .default([]),
  publications: z.array(z.string().min(1).max(400)).max(8).default([]),
  improvementNotes: z.array(z.string().min(1).max(400)).max(12).default([]),
})

function buildPrompt(input: {
  text: string
  targetRole: TargetRole
  experienceLevel: ExperienceLevel
  links?: CvLink[]
  issues?: string[]
}): string {
  const roleLabel = getRoleById(input.targetRole)?.label ?? input.targetRole
  const levelLabel = getExperienceLevelLabel(input.experienceLevel)
  const lower = input.text.toLowerCase()
  const keywordSet = ROLE_KEYWORDS[input.targetRole]
  const core = findKeywords(lower, keywordSet.core)
  const supporting = findKeywords(lower, keywordSet.supporting)
  const linkList = (input.links ?? [])
    .slice(0, 12)
    .map((l) => `- ${l.type}: ${l.url}`)
    .join('\n')
  const issueList = (input.issues ?? []).slice(0, 12).map((i) => `- ${i}`).join('\n')

  return `You are an expert technical resume writer. Rewrite the candidate's CV into a clean, single-column, ATS-parseable resume tailored to the target role, following the EXACT section structure below. Keep it truthful.

${ATS_FORMAT_DIRECTIVE}

${ATS_REFERENCE_TEMPLATE}

TARGET ROLE: ${roleLabel}
EXPERIENCE LEVEL: ${levelLabel}
LEVEL EXPECTATION: ${LEVEL_EXPECTATIONS[input.experienceLevel]}

GROUNDED KEYWORD SCAN (from the actual CV text):
- Core skills FOUND: ${core.matched.join(', ') || '(none)'}
- Core skills MISSING (only add if the candidate truly has them): ${core.missing.join(', ') || '(none)'}
- Supporting skills FOUND: ${supporting.matched.join(', ') || '(none)'}

DETECTED LINKS (reuse the real URLs, do not invent new ones):
${linkList || '(none)'}

KNOWN ISSUES TO FIX:
${issueList || '(none provided)'}

REQUIRED ATS STRUCTURE (produce these sections, in this order, when the source has the content):
1. Header: full name + a short professional headline (the target role).
2. Contact: email, phone, location. "links" = the candidate's portfolio/GitHub/LinkedIn URLs (reuse detected links).
3. summary (Profil Singkat): 2-4 sentence professional summary.
4. education (Pendidikan): degree, institution, period; put GPA/IPK in "detail" (e.g. "IPK: 3.5").
5. experience (Pengalaman Kerja): each entry has role, company, period, and action-verb bullets.
6. projects (Proyek Unggulan): each project has a name, optional "stack" (e.g. "Laravel 12"), a one-line description, and bullets for key features/impact.
7. skills (Keahlian Teknis): GROUP them, e.g. category "Tech Stack" and category "Tools & Services" (match how the CV groups them).
8. certifications (Sertifikasi & Penghargaan): list awards + certifications.
9. languages (Bahasa): each with a level (e.g. { "name": "Bahasa Inggris", "level": "Intermediate (TOEFL ITP 515)" }).
10. publications (Publikasi Ilmiah): full citation strings, if any.

RULES:
- DO NOT fabricate experience, employers, dates, degrees, metrics, certifications, or publications. Only use facts present in the original CV. If a metric is missing, keep the bullet qualitative rather than inventing numbers.
- Keep EVERY section that exists in the source (education, experience, projects, skills, certifications, languages, publications). Do not drop content.
- Rewrite every experience/project bullet to start with a strong action verb and surface real impact. Keep bullets concise (one line each).
- The candidate's GitHub may live inside the portfolio link — if only a portfolio link exists, that is acceptable; do not invent a separate GitHub URL.
- Reuse only the detected links for "links". Do not invent emails/phones; copy contact info from the CV, else leave the field empty.
- Optimize wording for the target role and ATS keyword coverage, but never claim a skill the candidate does not demonstrate.
- Write ALL content in the SAME language as the original CV (Bahasa Indonesia stays Indonesian).
- "improvementNotes" (Bahasa Indonesia): short list of what you changed and what the user must verify/fill in.

ORIGINAL CV TEXT:
"""
${sanitizeForPrompt(input.text)}
"""

Return ONLY valid JSON in EXACTLY this shape (no markdown, no commentary):
{
  "fullName": "string",
  "headline": "e.g. Fullstack Developer",
  "contact": { "email": "", "phone": "", "location": "" },
  "links": [ { "label": "Portofolio", "url": "https://..." } ],
  "summary": "...",
  "experience": [ { "role": "", "company": "", "period": "", "location": "", "bullets": ["..."] } ],
  "education": [ { "degree": "", "institution": "", "period": "", "detail": "IPK: 3.5" } ],
  "skills": [ { "category": "Tech Stack", "items": ["..."] }, { "category": "Tools & Services", "items": ["..."] } ],
  "projects": [ { "name": "", "stack": "", "description": "", "link": "", "bullets": ["..."] } ],
  "certifications": ["..."],
  "languages": [ { "name": "", "level": "" } ],
  "publications": ["..."],
  "improvementNotes": ["..."]
}`
}

/**
 * Generate an improved CV draft via Gemini. Returns null on any failure so the
 * caller can fall back to the deterministic section-split draft.
 */
export async function improveCvWithGemini(input: {
  text: string
  targetRole: TargetRole
  experienceLevel: ExperienceLevel
  links?: CvLink[]
  issues?: string[]
}): Promise<CvDraft | null> {
  const raw = await callGeminiJson(buildPrompt(input), {
    temperature: 0.5,
    maxOutputTokens: 6144,
    label: 'CV improve',
  })
  if (!raw) return null

  try {
    const parsed = draftSchema.parse(JSON.parse(raw))
    return normalizeDraft(parsed, 'ai')
  } catch (error) {
    console.error('[CV improve] validation failed:', error instanceof Error ? error.message : 'unknown')
    return null
  }
}

function normalizeDraft(parsed: z.infer<typeof draftSchema>, source: 'ai' | 'fallback'): CvDraft {
  return {
    fullName: parsed.fullName,
    headline: parsed.headline,
    contact: {
      email: parsed.contact.email || undefined,
      phone: parsed.contact.phone || undefined,
      location: parsed.contact.location || undefined,
    },
    links: parsed.links.map((l) => ({ label: l.label, url: l.url })),
    summary: parsed.summary,
    experience: parsed.experience.map((e) => ({
      role: e.role,
      company: e.company,
      period: e.period || undefined,
      location: e.location || undefined,
      bullets: e.bullets,
    })),
    education: parsed.education.map((e) => ({
      degree: e.degree,
      institution: e.institution,
      period: e.period || undefined,
      detail: e.detail || undefined,
    })),
    skills: parsed.skills,
    projects: parsed.projects.map((p) => ({
      name: p.name,
      stack: p.stack || undefined,
      description: p.description,
      link: p.link || undefined,
      bullets: p.bullets && p.bullets.length > 0 ? p.bullets : undefined,
    })),
    certifications: parsed.certifications,
    languages: parsed.languages,
    publications: parsed.publications,
    improvementNotes: parsed.improvementNotes,
    source,
  }
}
