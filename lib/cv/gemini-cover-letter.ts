import { z } from 'zod'
import { TargetRole } from '@/types'
import { ExperienceLevel, getExperienceLevelLabel } from '@/lib/constants/experience'
import { getRoleById } from '@/lib/constants/roles'
import { ROLE_KEYWORDS, findKeywords } from './role-expectations'
import { CoverLetter } from './types'
import { callGeminiJson, sanitizeForPrompt } from './gemini-client'

const coverLetterSchema = z.object({
  recipientLines: z.array(z.string().min(1).max(160)).max(4).default([]),
  greeting: z.string().min(1).max(160),
  paragraphs: z.array(z.string().min(1).max(900)).min(3).max(5),
  closing: z.string().min(1).max(200),
  signature: z.string().min(1).max(120),
})

function buildPrompt(input: {
  text: string
  targetRole: TargetRole
  experienceLevel: ExperienceLevel
  company?: string
  position?: string
}): string {
  const roleLabel = getRoleById(input.targetRole)?.label ?? input.targetRole
  const levelLabel = getExperienceLevelLabel(input.experienceLevel)
  const lower = input.text.toLowerCase()
  const keywordSet = ROLE_KEYWORDS[input.targetRole]
  const matched = findKeywords(lower, keywordSet.core).matched.concat(
    findKeywords(lower, keywordSet.supporting).matched
  )
  const position = input.position?.trim() || roleLabel
  const company = input.company?.trim()

  return `You are an expert career coach writing a complete, professional, well-structured cover letter for a candidate, grounded ONLY in their actual CV. Follow standard formal cover-letter conventions.

TARGET POSITION: ${position}
${company ? `TARGET COMPANY: ${company}` : 'TARGET COMPANY: (not specified — keep it role-focused, do not invent a company name)'}
EXPERIENCE LEVEL: ${levelLabel}
SKILLS EVIDENCED IN CV: ${matched.join(', ') || '(infer from the CV text)'}

STRUCTURE (a good cover letter):
- recipientLines: the addressee block. If a company is given, use ["Yth. Tim Rekrutmen ${company || '[Perusahaan]'}", "${company || ''}"] (drop empty lines); otherwise ["Yth. Hiring Manager"].
- greeting: salutation line, e.g. "Dengan hormat,".
- paragraphs: EXACTLY 3-4 paragraphs — (1) opening: state the position applied for and a one-line hook; (2) body: most relevant experience, projects, and skills with concrete evidence from the CV; (3) fit: why this company/role and what value you bring; (4) closing: thank them and a call to action (interview).
- closing: sign-off line, e.g. "Hormat saya,".
- signature: the candidate's full name exactly as written in the CV.

RULES:
- Ground every claim in the CV. Do NOT invent experience, employers, metrics, or company facts.
- Professional, confident, not arrogant. Avoid generic clichés.
- Write in the SAME language as the CV (Bahasa Indonesia if the CV is Indonesian).

CV TEXT:
"""
${sanitizeForPrompt(input.text, 10000)}
"""

Return ONLY valid JSON in EXACTLY this shape (no markdown):
{
  "recipientLines": ["Yth. Tim Rekrutmen ..."],
  "greeting": "Dengan hormat,",
  "paragraphs": ["...", "...", "..."],
  "closing": "Hormat saya,",
  "signature": "Candidate Name"
}`
}

export async function generateCoverLetterWithGemini(input: {
  text: string
  targetRole: TargetRole
  experienceLevel: ExperienceLevel
  company?: string
  position?: string
}): Promise<CoverLetter | null> {
  const raw = await callGeminiJson(buildPrompt(input), {
    temperature: 0.6,
    maxOutputTokens: 2048,
    label: 'CV cover-letter',
  })
  if (!raw) return null

  try {
    const parsed = coverLetterSchema.parse(JSON.parse(raw))
    const sender = extractSender(input.text)
    return {
      senderName: sender.name || parsed.signature,
      senderContact: sender.contact,
      recipientLines: parsed.recipientLines.length > 0
        ? parsed.recipientLines
        : [input.company?.trim() ? `Yth. Tim Rekrutmen ${input.company.trim()}` : 'Yth. Hiring Manager'],
      greeting: parsed.greeting,
      paragraphs: parsed.paragraphs,
      closing: parsed.closing,
      signature: parsed.signature || sender.name,
      source: 'ai',
    }
  } catch (error) {
    console.error('[CV cover-letter] validation failed:', error instanceof Error ? error.message : 'unknown')
    return null
  }
}

const EMAIL_RE = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i
const PHONE_RE = /(\+?\d[\d\s().-]{7,}\d)/

// Pull the applicant's name + a contact line from the CV for the letter header.
function extractSender(text: string): { name: string; contact: string } {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean)
  const firstLine = lines[0] || 'Kandidat'
  const name = EMAIL_RE.test(firstLine) || PHONE_RE.test(firstLine)
    ? 'Kandidat'
    : firstLine.split(/\s[-–—|•]\s/)[0].trim().slice(0, 80)
  const email = (text.match(EMAIL_RE) || [])[0]
  const phone = (text.match(PHONE_RE) || [])[0]
  const contact = [email, phone].filter(Boolean).join(' | ')
  return { name, contact }
}

/**
 * Deterministic template cover letter. Always returns a usable letter grounded
 * in the role, level, company, and the skills actually found in the CV.
 */
export function buildFallbackCoverLetter(input: {
  text: string
  targetRole: TargetRole
  experienceLevel: ExperienceLevel
  company?: string
  position?: string
}): CoverLetter {
  const roleLabel = getRoleById(input.targetRole)?.label ?? input.targetRole
  const position = input.position?.trim() || roleLabel
  const company = input.company?.trim()
  const lower = input.text.toLowerCase()
  const keywordSet = ROLE_KEYWORDS[input.targetRole]
  const matched = [
    ...findKeywords(lower, keywordSet.core).matched,
    ...findKeywords(lower, keywordSet.supporting).matched,
  ].slice(0, 6)

  const sender = extractSender(input.text)

  const skillSentence = matched.length > 0
    ? `Saya memiliki pengalaman langsung dengan ${matched.join(', ')}, yang relevan dengan kebutuhan posisi ini.`
    : 'Saya memiliki keterampilan teknis yang relevan dengan kebutuhan posisi ini, sebagaimana tercantum dalam CV saya.'

  const recipientLines = company
    ? [`Yth. Tim Rekrutmen ${company}`, company]
    : ['Yth. Hiring Manager']

  return {
    senderName: sender.name,
    senderContact: sender.contact,
    recipientLines,
    greeting: 'Dengan hormat,',
    paragraphs: [
      `Melalui surat ini, saya bermaksud melamar posisi ${position}${company ? ` di ${company}` : ''}. Sebagai kandidat dengan fokus pada bidang ${roleLabel}, saya yakin dapat memberikan kontribusi nyata bagi tim Anda.`,
      skillSentence,
      `Saya antusias mempelajari hal baru dan terbiasa bekerja secara kolaboratif untuk menghasilkan solusi berkualitas. Saya percaya pengalaman dan semangat belajar saya cocok dengan ${company ? `budaya kerja di ${company}` : 'kebutuhan posisi ini'}.`,
      'Terima kasih atas waktu dan pertimbangan Anda. Saya berharap memperoleh kesempatan untuk menjelaskan kontribusi saya lebih lanjut dalam sesi wawancara.',
    ],
    closing: 'Hormat saya,',
    signature: sender.name,
    source: 'fallback',
  }
}
