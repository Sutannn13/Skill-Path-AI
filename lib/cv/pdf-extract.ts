import pdfParse from 'pdf-parse'
import type { CvLink } from './links'

export interface PdfExtractResult {
  text: string
  links: CvLink[]
}

/**
 * Extract text from a PDF buffer.
 * Safe for Vercel serverless (uses pure JS pdf-parse which is well-tested on Lambda).
 */
export async function extractPdfText(buffer: Buffer): Promise<PdfExtractResult> {
  const data = await pdfParse(buffer)
  
  // pdf-parse extracts pure text. It doesn't extract links reliably.
  // We return empty links array and rely on raw URL regex parsing later in heuristics,
  // which is usually enough for LinkedIn / GitHub links.
  return { 
    text: data.text, 
    links: [] 
  }
}
