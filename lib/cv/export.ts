// Client-side export helpers for the improved CV and cover letter. The PDF
// engine (`jspdf`) is dynamically imported inside each download handler so it
// stays out of the initial bundle and only loads when the user actually
// exports. Plain-text builders are pure and dependency-free. Generated PDFs use
// real selectable text in a single column, which is ATS-parseable.

import type { CvDraft, CoverLetter } from './types'

// Bilingual section labels mirroring a standard Indonesian ATS CV, so the
// rendered preview, the .txt, and the PDF all read identically.
export const CV_SECTION_LABELS = {
  summary: 'Profil Singkat',
  education: 'Pendidikan',
  experience: 'Pengalaman Kerja (Experience)',
  projects: 'Proyek Unggulan (Featured Projects)',
  skills: 'Keahlian Teknis (Technical Skills)',
  certifications: 'Sertifikasi & Penghargaan (Certifications & Awards)',
  languages: 'Bahasa (Language)',
  publications: 'Publikasi Ilmiah (Publications)',
} as const

const ID_MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
]

function formatIdDate(date = new Date()): string {
  return `${date.getDate()} ${ID_MONTHS[date.getMonth()]} ${date.getFullYear()}`
}

// --- Plain text (ATS-friendly) --------------------------------------------

function rule(): string {
  return '------------------------------------------------------------'
}

export function draftToPlainText(draft: CvDraft): string {
  const lines: string[] = []
  lines.push(draft.fullName.toUpperCase())
  if (draft.headline) lines.push(draft.headline)

  const contactBits = [draft.contact.email, draft.contact.phone, draft.contact.location].filter(Boolean)
  if (contactBits.length) lines.push(contactBits.join(' | '))
  if (draft.links.length) {
    lines.push(draft.links.map((l) => `${l.label}: ${l.url}`).join(' | '))
  }

  if (draft.summary) {
    lines.push('', CV_SECTION_LABELS.summary.toUpperCase(), rule(), draft.summary)
  }

  if (draft.education.length) {
    lines.push('', CV_SECTION_LABELS.education.toUpperCase(), rule())
    for (const edu of draft.education) {
      const header = [edu.degree, edu.institution].filter(Boolean).join(' | ')
      lines.push(edu.period ? `${header} (${edu.period})` : header)
      if (edu.detail) lines.push(`- ${edu.detail}`)
    }
  }

  if (draft.experience.length) {
    lines.push('', CV_SECTION_LABELS.experience.toUpperCase(), rule())
    for (const exp of draft.experience) {
      const header = [exp.role, exp.company].filter(Boolean).join(' | ')
      const meta = [exp.location, exp.period].filter(Boolean).join(', ')
      lines.push(meta ? `${header} (${meta})` : header)
      for (const bullet of exp.bullets) lines.push(`- ${bullet}`)
      lines.push('')
    }
  }

  if (draft.projects.length) {
    lines.push(CV_SECTION_LABELS.projects.toUpperCase(), rule())
    for (const proj of draft.projects) {
      const title = proj.stack ? `${proj.name} (${proj.stack})` : proj.name
      lines.push(proj.link ? `${title} - ${proj.link}` : title)
      if (proj.description) lines.push(proj.description)
      for (const bullet of proj.bullets ?? []) lines.push(`- ${bullet}`)
      lines.push('')
    }
  }

  if (draft.skills.length) {
    lines.push(CV_SECTION_LABELS.skills.toUpperCase(), rule())
    for (const group of draft.skills) {
      lines.push(`${group.category}: ${group.items.join(', ')}`)
    }
  }

  if (draft.certifications.length) {
    lines.push('', CV_SECTION_LABELS.certifications.toUpperCase(), rule())
    for (const cert of draft.certifications) lines.push(`- ${cert}`)
  }

  if (draft.languages.length) {
    lines.push('', CV_SECTION_LABELS.languages.toUpperCase(), rule())
    for (const lang of draft.languages) lines.push(`- ${lang.name}: ${lang.level}`)
  }

  if (draft.publications.length) {
    lines.push('', CV_SECTION_LABELS.publications.toUpperCase(), rule())
    for (const pub of draft.publications) lines.push(`- ${pub}`)
  }

  return lines.join('\n').replace(/\n{3,}/g, '\n\n').trim() + '\n'
}

export function coverLetterToPlainText(letter: CoverLetter): string {
  const lines: string[] = []
  lines.push(letter.senderName)
  if (letter.senderContact) lines.push(letter.senderContact)
  lines.push('', formatIdDate(), '')
  for (const r of letter.recipientLines) lines.push(r)
  lines.push('', letter.greeting, '')
  for (const para of letter.paragraphs) lines.push(para, '')
  lines.push(letter.closing, '', '', letter.signature)
  return lines.join('\n').replace(/\n{3,}/g, '\n\n').trim() + '\n'
}

// --- Download helpers ------------------------------------------------------

function triggerDownload(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = fileName
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function downloadText(content: string, fileName: string): void {
  triggerDownload(new Blob([content], { type: 'text/plain;charset=utf-8' }), fileName)
}

function safeFileBase(name: string): string {
  return (name || 'cv').trim().replace(/[^\w\-]+/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '') || 'cv'
}

// --- PDF (lazy jsPDF) ------------------------------------------------------

// A small single-column layout engine over jsPDF. Real text, A4, generous
// margins, section headers with rules — the structure ATS parsers expect.
function createLayout(doc: import('jspdf').jsPDF) {
  const pageW = doc.internal.pageSize.getWidth()
  const pageH = doc.internal.pageSize.getHeight()
  // ponytail: density-tuned for one page, not a hard fit — long CVs still flow.
  const margin = 40
  const contentW = pageW - margin * 2
  let y = margin

  const setFont = (size: number, style: 'normal' | 'bold' | 'italic' = 'normal') => {
    doc.setFont('helvetica', style)
    doc.setFontSize(size)
  }
  const ensure = (space: number) => {
    if (y + space > pageH - margin) {
      doc.addPage()
      y = margin
    }
  }
  const lineGap = (size: number) => size * 1.24

  const centered = (str: string, size: number, style: 'normal' | 'bold' | 'italic' = 'normal') => {
    setFont(size, style)
    for (const ln of doc.splitTextToSize(str, contentW)) {
      ensure(lineGap(size))
      doc.text(ln, pageW / 2, y, { align: 'center' })
      y += lineGap(size)
    }
  }

  const para = (str: string, size: number, style: 'normal' | 'bold' | 'italic' = 'normal', indent = 0) => {
    setFont(size, style)
    for (const ln of doc.splitTextToSize(str, contentW - indent)) {
      ensure(lineGap(size))
      doc.text(ln, margin + indent, y)
      y += lineGap(size)
    }
  }

  // Bold title on the left, italic meta (date/location) right-aligned on the
  // same baseline — the reference CV's "Posisi | Perusahaan ........ (waktu)" row.
  const titleWithMeta = (title: string, meta: string, size = 10) => {
    setFont(size, 'italic')
    const metaW = meta ? doc.getTextWidth(meta) : 0
    const titleLines = doc.splitTextToSize(title, contentW - metaW - 12)
    ensure(lineGap(size))
    setFont(size, 'bold')
    doc.text(titleLines[0], margin, y)
    if (meta) {
      setFont(size, 'italic')
      doc.text(meta, pageW - margin, y, { align: 'right' })
    }
    y += lineGap(size)
    setFont(size, 'bold')
    for (let i = 1; i < titleLines.length; i++) {
      ensure(lineGap(size))
      doc.text(titleLines[i], margin, y)
      y += lineGap(size)
    }
  }

  const bullet = (str: string, size = 9.5) => {
    setFont(size, 'normal')
    const wrapped = doc.splitTextToSize(str, contentW - 16)
    ensure(lineGap(size))
    doc.text('•', margin + 2, y)
    doc.text(wrapped[0], margin + 14, y)
    y += lineGap(size)
    for (let i = 1; i < wrapped.length; i++) {
      ensure(lineGap(size))
      doc.text(wrapped[i], margin + 14, y)
      y += lineGap(size)
    }
  }

  const sectionHeader = (title: string) => {
    y += 6
    ensure(20)
    setFont(10.5, 'bold')
    doc.text(title.toUpperCase(), margin, y)
    y += 3
    doc.setLineWidth(1)
    doc.line(margin, y, pageW - margin, y)
    y += 9
  }

  const gap = (amount: number) => {
    y += amount
  }

  return { centered, para, bullet, titleWithMeta, sectionHeader, gap, margin, pageW }
}

export async function downloadDraftAsPdf(draft: CvDraft): Promise<void> {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const L = createLayout(doc)

  // Header
  L.centered(draft.fullName, 20, 'bold')
  if (draft.headline) L.centered(draft.headline, 11)
  const contactBits = [draft.contact.email, draft.contact.phone, draft.contact.location].filter(Boolean)
  if (contactBits.length) L.centered(contactBits.join('  |  '), 9.5)
  if (draft.links.length) L.centered(draft.links.map((l) => `${l.label}: ${l.url}`).join('  |  '), 9)

  if (draft.summary) {
    L.sectionHeader(CV_SECTION_LABELS.summary)
    L.para(draft.summary, 9.5)
  }

  if (draft.education.length) {
    L.sectionHeader(CV_SECTION_LABELS.education)
    for (const edu of draft.education) {
      const header = [edu.degree, edu.institution].filter(Boolean).join(' | ')
      L.titleWithMeta(header, edu.period ?? '')
      if (edu.detail) L.bullet(edu.detail)
    }
  }

  if (draft.experience.length) {
    L.sectionHeader(CV_SECTION_LABELS.experience)
    for (const exp of draft.experience) {
      const header = [exp.role, exp.company].filter(Boolean).join(' | ')
      const meta = [exp.location, exp.period].filter(Boolean).join(', ')
      L.titleWithMeta(header, meta)
      for (const b of exp.bullets) L.bullet(b)
      L.gap(3)
    }
  }

  if (draft.projects.length) {
    L.sectionHeader(CV_SECTION_LABELS.projects)
    for (const proj of draft.projects) {
      const title = proj.stack ? `${proj.name} (${proj.stack})` : proj.name
      L.para(title, 9.5, 'bold')
      if (proj.link) L.para(proj.link, 9, 'italic')
      if (proj.description) L.para(proj.description, 9.5)
      for (const b of proj.bullets ?? []) L.bullet(b)
      L.gap(3)
    }
  }

  if (draft.skills.length) {
    L.sectionHeader(CV_SECTION_LABELS.skills)
    for (const group of draft.skills) {
      L.para(`${group.category}: ${group.items.join(', ')}`, 9.5)
    }
  }

  if (draft.certifications.length) {
    L.sectionHeader(CV_SECTION_LABELS.certifications)
    for (const cert of draft.certifications) L.bullet(cert)
  }

  if (draft.languages.length) {
    L.sectionHeader(CV_SECTION_LABELS.languages)
    for (const lang of draft.languages) L.bullet(`${lang.name}: ${lang.level}`)
  }

  if (draft.publications.length) {
    L.sectionHeader(CV_SECTION_LABELS.publications)
    for (const pub of draft.publications) L.bullet(pub)
  }

  doc.save(`${safeFileBase(draft.fullName)}_CV.pdf`)
}

export async function downloadCoverLetterAsPdf(letter: CoverLetter, fileBase = 'cover_letter'): Promise<void> {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const L = createLayout(doc)

  // Sender block
  L.para(letter.senderName, 12, 'bold')
  if (letter.senderContact) L.para(letter.senderContact, 9.5)
  L.gap(10)

  // Date
  L.para(formatIdDate(), 10)
  L.gap(10)

  // Recipient block
  for (const r of letter.recipientLines) L.para(r, 10, 'bold')
  L.gap(10)

  // Greeting
  L.para(letter.greeting, 10)
  L.gap(6)

  // Body
  for (const p of letter.paragraphs) {
    L.para(p, 10)
    L.gap(6)
  }

  // Closing + signature
  L.gap(6)
  L.para(letter.closing, 10)
  L.gap(34) // room for a handwritten signature
  L.para(letter.signature, 11, 'bold')

  doc.save(`${safeFileBase(fileBase)}.pdf`)
}

export { safeFileBase, formatIdDate }
