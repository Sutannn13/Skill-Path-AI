// Server-only resume text extraction. Supports PDF, DOCX, and plain text.
// Never import this from a client component.

import { CvLink, extractLinks } from './links'

export type CvFileType = 'pdf' | 'docx' | 'txt'

export class CvExtractionError extends Error {
  constructor(
    public code:
      | 'UNSUPPORTED_TYPE'
      | 'FILE_TOO_LARGE'
      | 'EMPTY_FILE'
      | 'PARSE_FAILED'
      | 'TEXT_TOO_SHORT',
    message: string
  ) {
    super(message)
    this.name = 'CvExtractionError'
  }
}

export const MAX_CV_BYTES = 5 * 1024 * 1024 // 5 MB
// Below this many characters we assume the file is a scanned image, an empty
// template, or otherwise not machine-readable enough to audit responsibly.
const MIN_USEFUL_CHARS = 200

const PDF_MIME = 'application/pdf'
const DOCX_MIME = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
const TXT_MIMES = ['text/plain', 'text/markdown', 'application/octet-stream']

export function resolveFileType(fileName: string, mimeType: string): CvFileType {
  const lowerName = fileName.toLowerCase()
  const lowerMime = (mimeType || '').toLowerCase()

  if (lowerMime === PDF_MIME || lowerName.endsWith('.pdf')) return 'pdf'
  if (lowerMime === DOCX_MIME || lowerName.endsWith('.docx')) return 'docx'
  if (TXT_MIMES.includes(lowerMime) || lowerName.endsWith('.txt') || lowerName.endsWith('.md')) {
    return 'txt'
  }

  if (lowerName.endsWith('.doc')) {
    throw new CvExtractionError(
      'UNSUPPORTED_TYPE',
      'Format .doc lama tidak didukung. Simpan ulang sebagai PDF atau .docx lalu unggah lagi.'
    )
  }

  throw new CvExtractionError(
    'UNSUPPORTED_TYPE',
    'Format file tidak didukung. Gunakan PDF, DOCX, atau TXT.'
  )
}

// Each extractor returns the analysis text plus any links it could recover. PDF
// and DOCX expose link *annotations* (the real target behind the visible text),
// which a plain-text scan would miss entirely.
interface RawExtract {
  text: string
  links: CvLink[]
}

async function extractPdf(buffer: Buffer): Promise<RawExtract> {
  // pdf-parse v2 exposes a PDFParse class backed by pdfjs-dist.
  const { PDFParse } = await import('pdf-parse')
  const parser = new PDFParse({ data: new Uint8Array(buffer) })
  try {
    // pageJoiner '' drops the "-- N of M --" page markers cleanly at the source.
    const result = await parser.getText({ pageJoiner: '' })
    const text = result.text || ''

    // getInfo({ parsePageInfo }) returns the real link annotations (the target
    // behind the visible text) which a plain-text scan cannot recover. Best
    // effort: a malformed PDF must not fail the whole audit.
    let pairs: Array<{ url: string; label?: string }> = []
    try {
      const info = await parser.getInfo({ parsePageInfo: true })
      pairs = (info.pages || []).flatMap((page) =>
        (page.links || []).map((link) => ({ url: link.url, label: link.text }))
      )
    } catch (linkError) {
      console.error('[CV] pdf link extraction failed:', linkError instanceof Error ? linkError.message : 'unknown')
    }

    const links = extractLinks({ pairs, text })
    return { text, links }
  } finally {
    await parser.destroy().catch(() => {})
  }
}

async function extractDocx(buffer: Buffer): Promise<RawExtract> {
  const mammoth = await import('mammoth')
  // Raw text is the analysis body; the HTML pass preserves <a href> targets.
  const [textResult, htmlResult] = await Promise.all([
    mammoth.extractRawText({ buffer }),
    mammoth.convertToHtml({ buffer }).catch(() => ({ value: '' })),
  ])
  const text = textResult.value || ''
  const links = extractLinks({ html: htmlResult.value || '', text })
  return { text, links }
}

/**
 * Normalize whitespace: collapse runs of spaces/tabs, trim each line, and cap
 * consecutive blank lines so the LLM prompt and heuristics see clean text.
 */
export function normalizeCvText(raw: string): string {
  return raw
    .replace(/\r\n?/g, '\n')
    .replace(/[ \t ]+/g, ' ')
    .split('\n')
    .map((line) => line.trim())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

export interface ExtractedCv {
  text: string
  fileType: CvFileType
  charCount: number
  wordCount: number
  links: CvLink[]
}

export async function extractCvText(
  buffer: Buffer,
  fileName: string,
  mimeType: string
): Promise<ExtractedCv> {
  if (buffer.byteLength === 0) {
    throw new CvExtractionError('EMPTY_FILE', 'File kosong. Unggah CV yang valid.')
  }
  if (buffer.byteLength > MAX_CV_BYTES) {
    throw new CvExtractionError('FILE_TOO_LARGE', 'Ukuran file melebihi 5 MB. Kompres atau ekspor ulang CV Anda.')
  }

  const fileType = resolveFileType(fileName, mimeType)

  let rawText: string
  let links: CvLink[]
  try {
    if (fileType === 'pdf') {
      const out = await extractPdf(buffer)
      rawText = out.text
      links = out.links
    } else if (fileType === 'docx') {
      const out = await extractDocx(buffer)
      rawText = out.text
      links = out.links
    } else {
      rawText = buffer.toString('utf8')
      links = extractLinks({ text: rawText })
    }
  } catch (error) {
    if (error instanceof CvExtractionError) throw error
    console.error('[CV] extraction failed:', error instanceof Error ? error.message : 'unknown error')
    throw new CvExtractionError(
      'PARSE_FAILED',
      'Tidak bisa membaca isi file. Pastikan file tidak terkunci/terenkripsi lalu coba lagi.'
    )
  }

  const text = normalizeCvText(rawText)
  const charCount = text.length

  if (charCount < MIN_USEFUL_CHARS) {
    throw new CvExtractionError(
      'TEXT_TOO_SHORT',
      'Teks yang terbaca terlalu sedikit. Kemungkinan CV berupa hasil scan/gambar. Unggah versi PDF berbasis teks (bukan foto).'
    )
  }

  const wordCount = text.split(/\s+/).filter(Boolean).length

  return { text, fileType, charCount, wordCount, links }
}
