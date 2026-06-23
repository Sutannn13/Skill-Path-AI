// Deterministic improved-CV draft used when the AI layer is unavailable. It
// re-organizes the candidate's own text into the CvDraft structure so the
// "Perbaiki CV" feature always returns something downloadable and reasonably
// structured. It never invents facts: it only reshapes and lightly cleans.
//
// IMPORTANT: PDF text extraction frequently REORDERS a CV's section headings
// (often hoisting every heading to the top), which makes heading-order bucketing
// useless. So this parser classifies each line by its own SHAPE instead:
//   - "Role | Company (2024 - 2025)"            -> experience entry
//   - "Project Name (Laravel 12)"               -> project entry
//   - "S1 ... | Universitas ... (2023)"         -> education entry
//   - "Hak Kekayaan Intelektual (HKI): ..."     -> certification
//   - "Bahasa Inggris: Intermediate (...)"      -> language
//   - "Irnawati, O., ... (2026). ... DOI: ..."  -> publication
// Prose/bullet lines attach to the most recent experience/project entry, or to
// the summary when no entry has started yet.

import { TargetRole } from '@/types'
import { ExperienceLevel } from '@/lib/constants/experience'
import { getRoleById } from '@/lib/constants/roles'
import { ROLE_KEYWORDS, findKeywords } from './role-expectations'
import { CvLink } from './links'
import {
  CvDraft,
  CvDraftEducation,
  CvDraftExperience,
  CvDraftLink,
  CvDraftProject,
  CvDraftSkillGroup,
} from './types'

const EMAIL_RE = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i
const PHONE_RE = /(\+?\d[\d\s().-]{7,}\d)/

// --- Shape detectors -------------------------------------------------------

// Trailing "(...)" whose content holds a 4-digit year => a date range.
const TRAILING_DATE_PAREN_RE = /\([^)]*\b(?:19|20)\d{2}\b[^)]*\)\s*[.,]?\s*$/
const DEGREE_RE = /\b(s1|s2|s3|d3|d4|sma|smk|bachelor|master|sarjana|diploma|magister|ph\.?d)\b/i
const INSTITUTION_RE = /\b(universitas|university|institut|institute|politeknik|polytechnic|sekolah\s+tinggi|college|akademi)\b/i
const JOB_TITLE_RE = /\b(developer|engineer|intern|magang|manager|assistant|analyst|designer|lead|staff|officer|consultant|director|specialist|programmer|administrator|architect|scientist|freelance|founder)\b/i
const TECH_RE = /\b(laravel|react|vue|angular|next\.?js|nuxt|node|express|nest|django|flask|spring|kotlin|swift|flutter|dart|php|python|golang|\bgo\b|rust|typescript|javascript|tailwind|alpine|bootstrap|mysql|postgre|mongodb|firebase|supabase|redis|docker|\.js|html|css|wordpress|codeigniter)\b/i
// Cert/award lines are START-anchored to avoid swallowing sentences that merely
// mention an award (e.g. an experience bullet ending "...meraih Juara 2").
const CERT_START_RE = /^(hak kekayaan intelektual|hki\b|juara\b|mtcna\b|mtcre\b|cisco\b|ccna\b|ccnp\b|certified\b|certificate\b|certification\b|sertifikat\b|sertifikasi\b|aws certified|google\b|microsoft certified|oracle certified|finalist\b|winner\b|penghargaan\b|award\b)/i
const LANG_START_RE = /^(bahasa\s+\w+|english|indonesian|mandarin|arabic|japanese|korean|german|french|spanish|chinese)\s*:/i
const AUTHOR_LIST_RE = /^[A-Z][a-z]+,\s+[A-Z][.,]/ // "Irnawati, O.,"
const PUB_HINT_RE = /\([12]\d{3}\)|doi|\bjitk\b|\bvol\.|\bissn\b/i
const SKILL_LABEL_RE = /(tech\s*stack|tools?\s*(?:&|and)\s*services?|keterampilan\s+teknis|keahlian\s+teknis|technical\s+skills?)\s*:/i

// Heading-only lines (possibly with an English gloss) to discard outright.
const HEADING_WORDS = [
  'profil singkat', 'profil', 'ringkasan', 'summary', 'about me', 'objective',
  'pendidikan', 'education',
  'pengalaman kerja', 'pengalaman', 'experience', 'work experience',
  'proyek unggulan', 'proyek', 'projects', 'featured projects', 'portfolio', 'portofolio',
  'keahlian teknis', 'keahlian', 'keterampilan teknis', 'technical skills', 'skills',
  'sertifikasi & penghargaan', 'sertifikasi', 'certifications & awards', 'certifications', 'penghargaan',
  'bahasa', 'language', 'languages',
  'publikasi ilmiah', 'publikasi', 'publications',
  'kontak', 'contact',
]

function stripGloss(line: string): string {
  return line.trim().toLowerCase().replace(/\s*\(.*?\)\s*$/, '').replace(/[:\-—_]+$/, '').trim()
}

function isHeadingOnly(line: string): boolean {
  const bare = stripGloss(line)
  if (bare.length === 0 || bare.length > 40) return false
  // A "key: value" line is content, not a heading.
  if (/:\s*\S/.test(line)) return false
  return HEADING_WORDS.includes(bare)
}

function isContactLine(line: string): boolean {
  if (EMAIL_RE.test(line)) return true
  if (PHONE_RE.test(line) && line.includes(',')) return true
  return false
}

// Pull a location ("Depok, Jawa Barat") out of the contact line by dropping the
// phone/email/portfolio parts and keeping the geographic remainder.
function extractLocation(text: string): string | undefined {
  const contactLine = text.split('\n').map((l) => l.trim()).find(isContactLine)
  if (!contactLine) return undefined
  const parts = contactLine
    .split(',')
    .map((p) => p.trim())
    .filter((p) => p && !EMAIL_RE.test(p) && !PHONE_RE.test(p) && !/link|porto?folio|portfolio|github|linkedin|https?:/i.test(p))
  const location = parts.join(', ').trim()
  return location && location.length <= 60 ? location : undefined
}

function cleanBullet(line: string): string {
  return line.replace(/^[\s•\-*·▪◦‣>]+/, '').replace(/\s*:\s*-\s*$/, '').trim()
}

// Pull a trailing "(...)" off a header: "Role | Co (Jan 2024 - Now)" =>
// { head: "Role | Co", paren: "Jan 2024 - Now" }.
function splitTrailingParen(s: string): { head: string; paren: string } {
  const m = s.match(/^(.*?)\s*\(([^()]*)\)\s*[.,]?\s*$/)
  if (m && m[1].trim()) return { head: m[1].trim(), paren: m[2].trim() }
  return { head: s.replace(/[.,]\s*$/, '').trim(), paren: '' }
}

function isExperienceHeader(line: string): boolean {
  if (!TRAILING_DATE_PAREN_RE.test(line)) return false
  return /\s[|–-]\s/.test(line) || JOB_TITLE_RE.test(line)
}

function isProjectHeader(line: string): boolean {
  const m = line.match(/\(([^)]*)\)\s*[.,:-]*\s*$/)
  if (!m) return false
  const paren = m[1]
  if (/\b(?:19|20)\d{2}\b/.test(paren)) return false // a date => not a project title
  if (!TECH_RE.test(paren)) return false
  const head = line.slice(0, m.index).trim()
  if (head.length < 2 || head.length > 80) return false
  if (/\.\s/.test(head)) return false // contains a sentence break => prose
  return true
}

// Reflow soft-wrapped lines: join a line into the previous one when the previous
// does not end in terminal punctuation and the current is a lowercase
// continuation that is not itself a structural header.
function reflow(rawLines: string[]): string[] {
  const out: string[] = []
  for (const raw of rawLines) {
    const line = raw.trim()
    if (!line) continue
    const prev = out[out.length - 1]
    const prevOpen = prev && prev.length < 220 && !/[.):;!?]$/.test(prev)
    // A very short fragment (e.g. a trailing "HKI." that wrapped) is a
    // continuation regardless of case; otherwise require a lowercase start and a
    // non-structural shape so we never fold a real header into a bullet.
    const tinyFragment = line.length <= 6 && !/^\d/.test(line)
    const isContinuation = tinyFragment
      || (/^[a-z(]/.test(line) && !isExperienceHeader(line) && !isProjectHeader(line) && !LANG_START_RE.test(line) && !CERT_START_RE.test(line))
    if (prev && prevOpen && isContinuation) {
      out[out.length - 1] = `${prev} ${line}`
    } else {
      out.push(line)
    }
  }
  return out
}

// --- Skills (parsed from the full text so line breaks don't matter) --------

function splitSkillItems(raw: string): string[] {
  return raw
    .split(',')
    .map((s) => s.replace(/[.;]+\s*$/, '').trim())
    .filter((s) => s.length > 0 && s.length < 60)
}

function parseSkillGroups(text: string): CvDraftSkillGroup[] {
  const groups: CvDraftSkillGroup[] = []
  const tech = text.match(/tech\s*stack\s*:\s*([\s\S]*?)(?=tools?\s*(?:&|and)\s*services?\s*:|keahlian|bahasa|publikasi|sertifikasi|pengalaman|pendidikan|$)/i)
  const tools = text.match(/tools?\s*(?:&|and)\s*services?\s*:\s*([\s\S]*?)(?=bahasa|publikasi|sertifikasi|keahlian|pengalaman|pendidikan|tech\s*stack|$)/i)
  if (tech && tech[1]) {
    const items = splitSkillItems(tech[1])
    if (items.length) groups.push({ category: 'Tech Stack', items })
  }
  if (tools && tools[1]) {
    const items = splitSkillItems(tools[1])
    if (items.length) groups.push({ category: 'Tools & Services', items })
  }
  if (groups.length === 0) {
    // Generic "Keahlian/Keterampilan Teknis: a, b, c" capture.
    const generic = text.match(/(?:keahlian|keterampilan)\s+teknis\s*:\s*([\s\S]*?)(?=bahasa|publikasi|sertifikasi|pengalaman|pendidikan|$)/i)
    if (generic && generic[1]) {
      const items = splitSkillItems(generic[1])
      if (items.length) groups.push({ category: 'Keahlian Teknis', items })
    }
  }
  return groups
}

export function buildFallbackDraft(input: {
  text: string
  targetRole: TargetRole
  experienceLevel: ExperienceLevel
  links?: CvLink[]
}): CvDraft {
  const { text, targetRole } = input
  const links = input.links ?? []
  const roleLabel = getRoleById(targetRole)?.label ?? targetRole

  const allLines = text.split('\n').map((l) => l.trim()).filter(Boolean)

  // Name: first line that is not a contact/heading line; drop any " - Title".
  const nameSourceLine = allLines.find((l) => !isContactLine(l) && !isHeadingOnly(l)) || 'Nama Kandidat'
  const fullName = nameSourceLine.split(/\s[-–—|•]\s/)[0].trim().slice(0, 80)

  const email = (text.match(EMAIL_RE) || [])[0]
  const phone = (text.match(PHONE_RE) || [])[0]
  const location = extractLocation(text)

  // Skills come from the whole text so soft-wraps and reordering don't matter.
  const skillGroupsFromText = parseSkillGroups(text)
  const skillBlockText = skillGroupsFromText
    .flatMap((g) => g.items)
    .join(' ')
    .toLowerCase()

  const lines = reflow(allLines)

  const education: CvDraftEducation[] = []
  const experience: CvDraftExperience[] = []
  const projects: CvDraftProject[] = []
  const certifications: string[] = []
  const languages: { name: string; level: string }[] = []
  const publications: string[] = []
  const summaryParts: string[] = []

  // The most recent experience/project entry that bullets should attach to.
  let lastEntry: { kind: 'exp'; ref: CvDraftExperience } | { kind: 'proj'; ref: CvDraftProject } | null = null
  let sawStructured = false

  for (const rawLine of lines) {
    const line = rawLine.trim()
    if (!line) continue
    if (line === nameSourceLine) continue
    if (isHeadingOnly(line)) continue
    if (isContactLine(line)) continue
    // Skip lines that belong to the skills block (parsed separately).
    if (SKILL_LABEL_RE.test(line)) {
      sawStructured = true
      continue
    }
    const lowerLine = line.toLowerCase()
    const cleaned = cleanBullet(line)
    if (skillBlockText && cleaned.length > 4 && skillBlockText.includes(lowerLine.replace(/[.;,]+$/, '').slice(0, 40))) {
      // A leftover skills CSV line (e.g. "Git/GitHub, Postman API, ...").
      if (skillGroupsFromText.length > 0) continue
    }

    // 1. Education (checked before experience: "S1 ... | Universitas (2023)").
    if (/^(ipk|gpa)\b/i.test(cleaned)) {
      if (education.length > 0) education[education.length - 1].detail = cleaned
      else education.push({ degree: cleaned, institution: '' })
      sawStructured = true
      continue
    }
    if (DEGREE_RE.test(line) && INSTITUTION_RE.test(line)) {
      const { head, paren } = splitTrailingParen(line)
      const [degree, institution] = head.split(/\s\|\s/)
      education.push({
        degree: (degree || head).trim(),
        institution: (institution || '').trim(),
        period: paren || undefined,
      })
      lastEntry = null
      sawStructured = true
      continue
    }

    // 2. Experience header.
    if (isExperienceHeader(line)) {
      const { head, paren } = splitTrailingParen(line)
      const [role, company] = head.split(/\s\|\s/)
      const ref: CvDraftExperience = {
        role: (role || head).trim(),
        company: (company || '').trim(),
        period: paren || undefined,
        bullets: [],
      }
      experience.push(ref)
      lastEntry = { kind: 'exp', ref }
      sawStructured = true
      continue
    }

    // 3. Certification / award (start-anchored, short).
    if (CERT_START_RE.test(line) && line.length <= 140) {
      certifications.push(cleaned)
      sawStructured = true
      continue
    }

    // 4. Language.
    if (LANG_START_RE.test(line)) {
      const [name, ...rest] = cleaned.split(':')
      languages.push({ name: name.trim(), level: rest.join(':').replace(/\.\s*$/, '').trim() || '-' })
      sawStructured = true
      continue
    }

    // 5. Publication (author list + year/DOI, or a bare DOI url continuation).
    if ((AUTHOR_LIST_RE.test(line) && PUB_HINT_RE.test(line)) || /doi\.org|^https?:\/\/\S+$/i.test(line)) {
      if (/^https?:\/\/\S+$/i.test(line) && publications.length > 0) {
        publications[publications.length - 1] = `${publications[publications.length - 1]} ${cleaned}`.trim()
      } else {
        publications.push(cleaned)
      }
      sawStructured = true
      continue
    }

    // 6. Project header.
    if (isProjectHeader(line)) {
      const { head, paren } = splitTrailingParen(line)
      const ref: CvDraftProject = {
        name: head,
        stack: paren || undefined,
        description: '',
        bullets: [],
      }
      projects.push(ref)
      lastEntry = { kind: 'proj', ref }
      sawStructured = true
      continue
    }

    // 7. Prose / bullet.
    if (lastEntry) {
      if (lastEntry.kind === 'proj' && !lastEntry.ref.description) {
        lastEntry.ref.description = cleaned
      } else {
        const ref = lastEntry.ref
        ;(ref.bullets ??= []).push(cleaned)
      }
    } else if (!sawStructured) {
      summaryParts.push(cleaned)
    }
    // Orphan prose after structured content with no active entry is dropped.
  }

  // Skills: prefer the candidate's own grouped skills; else role keyword scan.
  let skills: CvDraftSkillGroup[] = skillGroupsFromText
  if (skills.length === 0) {
    const lower = text.toLowerCase()
    const keywordSet = ROLE_KEYWORDS[targetRole]
    const detected = [
      ...new Set([
        ...findKeywords(lower, keywordSet.core).matched,
        ...findKeywords(lower, keywordSet.supporting).matched,
      ]),
    ]
    if (detected.length > 0) skills = [{ category: 'Keahlian Teknis', items: detected }]
  }

  // Links shown in the header: portfolio / github / linkedin only (a DOI is a
  // publication, not a portfolio link, so 'other' is excluded here).
  const draftLinks: CvDraftLink[] = links
    .filter((l) => l.type === 'github' || l.type === 'linkedin' || l.type === 'portfolio')
    .map((l) => ({ label: l.label && l.label !== l.url ? l.label : labelForType(l.type), url: l.url }))

  const summary = summaryParts.join(' ').replace(/\s+/g, ' ').trim().slice(0, 700)
    || `Profesional dengan fokus pada ${roleLabel}. Lengkapi ringkasan ini dengan pengalaman dan pencapaian utama Anda.`

  const improvementNotes = [
    'Draf ini disusun ulang otomatis dari teks CV Anda (mode tanpa AI). Periksa kembali pemetaan jabatan, perusahaan, periode, dan poin pengalaman karena ekstraksi PDF kadang mengacak urutan.',
    'Tambahkan angka pencapaian (mis. "menaikkan performa 30%") pada poin pengalaman agar lebih kuat.',
    skills.length === 0 ? 'Bagian skill belum terdeteksi otomatis; isi daftar skill yang relevan dengan role.' : 'Periksa daftar skill dan tambahkan yang masih kurang.',
  ]

  return {
    fullName,
    headline: roleLabel,
    contact: { email, phone, location },
    links: draftLinks,
    summary,
    experience,
    education,
    skills,
    projects,
    certifications,
    languages,
    publications,
    improvementNotes,
    source: 'fallback',
  }
}

function labelForType(type: CvLink['type']): string {
  switch (type) {
    case 'github': return 'GitHub'
    case 'linkedin': return 'LinkedIn'
    case 'portfolio': return 'Portfolio'
    default: return 'Tautan'
  }
}
