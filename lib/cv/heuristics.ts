import { TargetRole } from '@/types'
import { ExperienceLevel, getExperienceLevelLabel } from '@/lib/constants/experience'
import { getRoleById } from '@/lib/constants/roles'
import {
  ROLE_KEYWORDS,
  IMPACT_KEYWORDS,
  findKeywords,
} from './role-expectations'
import { CvLink, hasLinkType } from './links'
import {
  CvAnalysis,
  CvIssue,
  CvSectionFinding,
  CvVerdict,
} from './types'

const EMAIL_RE = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i
const PHONE_RE = /(\+?\d[\d\s().-]{7,}\d)/
const URL_RE = /(https?:\/\/|www\.)\S+/i
const GITHUB_RE = /github\.com\/[a-z0-9-]+/i
const LINKEDIN_RE = /linkedin\.com\/(in|pub)\//i
const NUMBER_METRIC_RE = /(\d+(\.\d+)?\s?%|\$\s?\d|\d{2,}\s?(users|customers|requests|ms|x|k\b)|\b\d+\s?(juta|ribu|million|thousand))/i

interface SectionDetector {
  name: string
  keywords: string[]
  required: boolean
}

// Section synonyms cover both English and Indonesian resumes.
const SECTION_DETECTORS: SectionDetector[] = [
  { name: 'Kontak', keywords: [], required: true }, // handled specially via email/phone
  { name: 'Ringkasan / Summary', keywords: ['summary', 'objective', 'profil', 'tentang saya', 'about me', 'profile'], required: false },
  { name: 'Pengalaman', keywords: ['experience', 'pengalaman', 'work history', 'employment', 'riwayat pekerjaan'], required: true },
  { name: 'Pendidikan', keywords: ['education', 'pendidikan', 'degree', 'university', 'universitas', 'sarjana', 's1', 'bachelor'], required: true },
  { name: 'Skill', keywords: ['skills', 'keahlian', 'kemampuan', 'tech stack', 'technologies', 'technical skills'], required: true },
  { name: 'Proyek / Portfolio', keywords: ['project', 'proyek', 'portfolio', 'portofolio'], required: false },
]

function clamp(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, Math.round(value)))
}

function verdictFromScore(score: number): { verdict: CvVerdict; label: string } {
  if (score >= 75) return { verdict: 'aman', label: 'Aman untuk melamar' }
  if (score >= 50) return { verdict: 'perlu-revisi', label: 'Perlu revisi dulu' }
  return { verdict: 'belum-siap', label: 'Belum siap dilamar' }
}

/**
 * Deterministic resume audit. Always returns a populated analysis so the CV
 * analyzer works even when the LLM is unavailable. It is also reused as the
 * grounded source of truth for the role-match keyword coverage.
 */
export function analyzeCvHeuristic(input: {
  text: string
  wordCount: number
  targetRole: TargetRole
  experienceLevel: ExperienceLevel
  links?: CvLink[]
}): CvAnalysis {
  const { text, wordCount, targetRole, experienceLevel } = input
  const links = input.links ?? []
  const lower = text.toLowerCase()
  const roleInfo = getRoleById(targetRole)
  const roleLabel = roleInfo?.label ?? targetRole
  const levelLabel = getExperienceLevelLabel(experienceLevel)

  // --- Contact + link signals -------------------------------------------
  // Prefer real link annotations (the target behind the visible text) and fall
  // back to scanning the plain text, so links printed as labels still count.
  const hasEmail = EMAIL_RE.test(text) || hasLinkType(links, 'email')
  const hasPhone = PHONE_RE.test(text)
  const hasGithub = GITHUB_RE.test(text) || hasLinkType(links, 'github')
  const hasLinkedin = LINKEDIN_RE.test(text) || hasLinkType(links, 'linkedin')
  const hasPortfolio = hasLinkType(links, 'portfolio')
  const hasUrl = URL_RE.test(text) || links.some((l) => l.type !== 'email')

  // --- Section detection -------------------------------------------------
  const sections: CvSectionFinding[] = SECTION_DETECTORS.map((detector) => {
    if (detector.name === 'Kontak') {
      const present = hasEmail || hasPhone
      const status = hasEmail && hasPhone ? 'good' : present ? 'warning' : 'missing'
      const feedback = hasEmail && hasPhone
        ? 'Email dan nomor telepon terdeteksi.'
        : hasEmail
          ? 'Email ada, tapi nomor telepon tidak terdeteksi.'
          : hasPhone
            ? 'Nomor telepon ada, tapi email tidak terdeteksi.'
            : 'Tidak ditemukan email maupun nomor telepon yang bisa dihubungi.'
      return { name: detector.name, present, status, feedback }
    }

    const present = detector.keywords.some((keyword) => lower.includes(keyword))
    const status: CvSectionFinding['status'] = present ? 'good' : detector.required ? 'missing' : 'warning'
    const feedback = present
      ? `Bagian ${detector.name.toLowerCase()} terdeteksi.`
      : detector.required
        ? `Bagian ${detector.name.toLowerCase()} tidak ditemukan. Rekruter mengharapkan bagian ini ada.`
        : `Bagian ${detector.name.toLowerCase()} tidak terdeteksi (opsional tapi memperkuat CV).`
    return { name: detector.name, present, status, feedback }
  })

  // --- Tautan (real hyperlink annotations) ------------------------------
  const clickableLinks = links.filter((l) => l.type !== 'email')
  const linkStatus: CvSectionFinding['status'] = hasGithub || hasPortfolio
    ? 'good'
    : clickableLinks.length > 0
      ? 'warning'
      : 'missing'
  sections.push({
    name: 'Tautan',
    present: clickableLinks.length > 0,
    status: linkStatus,
    feedback: clickableLinks.length > 0
      ? `Terdeteksi ${clickableLinks.length} tautan: ${[
          hasGithub ? 'GitHub' : null,
          hasLinkedin ? 'LinkedIn' : null,
          hasPortfolio ? 'portfolio' : null,
        ].filter(Boolean).join(', ') || 'lainnya'}.`
      : 'Tidak ada tautan yang bisa diklik (GitHub/portfolio/LinkedIn) terdeteksi.',
  })

  // --- Role keyword coverage --------------------------------------------
  const keywordSet = ROLE_KEYWORDS[targetRole]
  const coreResult = findKeywords(lower, keywordSet.core)
  const supportingResult = findKeywords(lower, keywordSet.supporting)
  // Core keywords weigh 70%, supporting 30%.
  const coreRatio = keywordSet.core.length > 0 ? coreResult.matched.length / keywordSet.core.length : 1
  const supportingRatio = keywordSet.supporting.length > 0
    ? supportingResult.matched.length / keywordSet.supporting.length
    : 0
  const roleScore = clamp(coreRatio * 70 + supportingRatio * 30)
  const matchedKeywords = [...coreResult.matched, ...supportingResult.matched]
  // Surface the most important gaps first: unmatched core, then supporting.
  const missingKeywords = [...coreResult.missing, ...supportingResult.missing].slice(0, 10)

  // --- Impact / quantified achievement signal ---------------------------
  const impactHits = findKeywords(lower, IMPACT_KEYWORDS).matched.length
  const hasMetrics = NUMBER_METRIC_RE.test(text)

  // --- Length signal -----------------------------------------------------
  // Healthy single-page resume ~ 350-800 words; allow more for senior.
  const idealMax = experienceLevel === 'senior' || experienceLevel === 'mid' ? 1100 : 800
  const tooShort = wordCount < 200
  const tooLong = wordCount > idealMax + 400

  // --- Build issues ------------------------------------------------------
  const issues: CvIssue[] = []

  if (!hasEmail) {
    issues.push({
      severity: 'high',
      title: 'Email tidak terdeteksi',
      detail: 'CV tanpa email membuat rekruter tidak bisa menghubungi Anda dan sering ditolak sistem ATS.',
      fix: 'Tambahkan email profesional di bagian header, contoh: namaanda@gmail.com.',
    })
  }
  if (!hasPhone) {
    issues.push({
      severity: 'medium',
      title: 'Nomor telepon tidak terdeteksi',
      detail: 'Banyak rekruter menghubungi kandidat lewat telepon/WhatsApp untuk tahap awal.',
      fix: 'Tambahkan nomor telepon aktif di bagian kontak.',
    })
  }
  // Only flag a missing GitHub when there is also no portfolio link — a personal
  // portfolio commonly links out to GitHub, so it counts as code-portfolio proof.
  if (!hasGithub && !hasPortfolio && targetRole !== 'data-analyst') {
    issues.push({
      severity: 'medium',
      title: 'Link GitHub/portfolio tidak ada',
      detail: 'Untuk role teknis, portofolio kode (GitHub atau website portfolio) adalah bukti kemampuan paling kuat.',
      fix: 'Tambahkan link github.com/username atau website portfolio Anda yang memuat proyek terbaik.',
    })
  }
  if (!hasLinkedin) {
    issues.push({
      severity: 'low',
      title: 'Link LinkedIn tidak ada',
      detail: 'LinkedIn memperkuat kredibilitas dan sering dicek rekruter.',
      fix: 'Tambahkan URL profil LinkedIn Anda.',
    })
  }
  if (coreResult.missing.length > 0) {
    issues.push({
      severity: coreResult.missing.length > keywordSet.core.length / 2 ? 'high' : 'medium',
      title: `Kurang keyword inti untuk ${roleLabel}`,
      detail: `CV belum menyebut skill inti: ${coreResult.missing.join(', ')}. Sistem ATS dan rekruter mencari kata kunci ini.`,
      fix: `Jika Anda menguasainya, tambahkan ${coreResult.missing.slice(0, 4).join(', ')} di bagian Skill dan tunjukkan pemakaiannya di Pengalaman/Proyek.`,
    })
  }
  if (!hasMetrics) {
    issues.push({
      severity: 'medium',
      title: 'Belum ada pencapaian terukur',
      detail: 'Pencapaian tanpa angka kurang meyakinkan. Rekruter ingin melihat dampak nyata.',
      fix: 'Ubah deskripsi tugas menjadi pencapaian terukur, contoh: "mengurangi waktu load 40%" atau "melayani 5.000+ pengguna".',
    })
  }
  if (impactHits < 3) {
    issues.push({
      severity: 'low',
      title: 'Kurang kata kerja aksi',
      detail: 'Kalimat pasif terdengar lemah. Awali poin dengan kata kerja aksi.',
      fix: 'Mulai setiap bullet dengan kata seperti Built, Designed, Led, Improved, Membangun, Merancang.',
    })
  }
  if (tooShort) {
    issues.push({
      severity: 'high',
      title: 'CV terlalu pendek',
      detail: `Hanya terbaca ${wordCount} kata. CV terlalu tipis terlihat kurang pengalaman/usaha.`,
      fix: 'Tambah detail proyek, tanggung jawab, dan skill hingga CV terasa berisi (idealnya 1 halaman penuh).',
    })
  }
  if (tooLong) {
    issues.push({
      severity: 'low',
      title: 'CV mungkin terlalu panjang',
      detail: `Terbaca ${wordCount} kata. CV yang terlalu panjang membuat poin penting tenggelam.`,
      fix: 'Rapikan jadi 1-2 halaman, fokus pada pengalaman paling relevan dengan role tujuan.',
    })
  }

  // --- Strengths ---------------------------------------------------------
  const strengths: string[] = []
  if (hasEmail && hasPhone) strengths.push('Informasi kontak lengkap dan mudah dihubungi.')
  if (hasGithub) strengths.push('Mencantumkan GitHub sebagai bukti portofolio kode.')
  if (hasPortfolio) strengths.push('Memiliki tautan portfolio/website pribadi yang bisa diklik.')
  if (hasMetrics) strengths.push('Memuat pencapaian terukur dengan angka.')
  if (coreRatio >= 0.7) strengths.push(`Keyword inti untuk ${roleLabel} sudah cukup terwakili.`)
  if (sections.find((s) => s.name === 'Proyek / Portfolio')?.present) {
    strengths.push('Memiliki bagian proyek/portfolio yang relevan.')
  }
  if (impactHits >= 4) strengths.push('Banyak kata kerja aksi yang kuat.')
  if (strengths.length === 0) {
    strengths.push('CV terbaca dengan baik secara teknis dan siap untuk diperbaiki lebih lanjut.')
  }

  // --- ATS check ---------------------------------------------------------
  const atsIssues: string[] = []
  if (!hasEmail) atsIssues.push('Email tidak terbaca oleh parser ATS.')
  if (!sections.find((s) => s.name === 'Skill')?.present) atsIssues.push('Tidak ada bagian Skill yang jelas untuk dipindai ATS.')
  if (!sections.find((s) => s.name === 'Pengalaman')?.present) atsIssues.push('Bagian Pengalaman tidak terdeteksi.')
  if (!hasUrl) atsIssues.push('Tidak ada tautan (portfolio/GitHub/LinkedIn) yang bisa diklik.')
  const atsScore = clamp(100 - atsIssues.length * 18)

  // --- Revisions (ordered, concrete) ------------------------------------
  const revisions: string[] = []
  for (const issue of issues) {
    if (issue.severity === 'high') revisions.push(issue.fix)
  }
  for (const issue of issues) {
    if (issue.severity === 'medium') revisions.push(issue.fix)
  }
  if (revisions.length === 0) {
    revisions.push('CV sudah solid. Lakukan proofreading akhir dan sesuaikan kata kunci dengan tiap lowongan.')
  }

  // --- Overall score -----------------------------------------------------
  const sectionScore = (sections.filter((s) => s.status === 'good').length / sections.length) * 100
  const contactScore = (hasEmail ? 50 : 0) + (hasPhone ? 25 : 0) + (hasUrl ? 25 : 0)
  const impactScore = (hasMetrics ? 60 : 0) + Math.min(impactHits, 4) * 10
  const lengthPenalty = tooShort ? 25 : tooLong ? 10 : 0

  const overallScore = clamp(
    roleScore * 0.35 +
      sectionScore * 0.2 +
      contactScore * 0.15 +
      atsScore * 0.15 +
      impactScore * 0.15 -
      lengthPenalty
  )

  const { verdict, label } = verdictFromScore(overallScore)

  const summary = `CV ini cocok sekitar ${roleScore}% dengan kebutuhan ${roleLabel} (${levelLabel}). ` +
    (verdict === 'aman'
      ? 'Secara umum sudah layak dilamar, tinggal poles bagian kecil.'
      : verdict === 'perlu-revisi'
        ? `Masih ada ${issues.filter((i) => i.severity !== 'low').length} hal penting yang sebaiknya diperbaiki sebelum melamar.`
        : 'Sebaiknya perbaiki dulu beberapa hal mendasar sebelum mengirim lamaran.')

  return {
    overallScore,
    verdict,
    verdictLabel: label,
    summary,
    roleMatch: {
      role: targetRole,
      roleLabel,
      experienceLevel,
      experienceLevelLabel: levelLabel,
      score: roleScore,
      matchedKeywords,
      missingKeywords,
    },
    ats: { score: atsScore, issues: atsIssues },
    sections,
    strengths,
    issues,
    revisions,
    links,
    source: 'fallback',
  }
}
