/**
 * Vercel-safe PDF text and link extraction using pdfjs-dist legacy build.
 *
 * Why not pdf-parse?
 * pdf-parse v2 bundles pdfjs-dist 5.x with @napi-rs/canvas and web worker
 * support. Both break in Vercel's serverless environment:
 * - @napi-rs/canvas is a native binary that may not be deployed.
 * - Web Workers are unavailable in Node.js serverless functions.
 * - The bundled pdfjs-dist is ESM-heavy and trips up Next.js bundling.
 *
 * This module imports pdfjs-dist/legacy/build/pdf.mjs directly, disables the
 * worker thread, and skips canvas entirely. It works reliably on both localhost
 * and Vercel.
 */

import type { CvLink } from './links'
import { extractLinks } from './links'

// ── Lazy singleton ─────────────────────────────────────────────────────────
// We lazy-import pdfjs-dist to keep the module boundary clean and avoid
// top-level side effects that could interfere with Next.js tree-shaking.

let pdfjsLib: typeof import('pdfjs-dist/legacy/build/pdf.mjs') | null = null

async function getPdfjs() {
  if (pdfjsLib) return pdfjsLib
  // Use the legacy build which is compatible with older Node.js environments
  // and does not require modern browser APIs.
  pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs')

  // Disable the worker thread — serverless functions cannot spawn workers.
  // Setting workerSrc to empty string forces pdfjs to run synchronously in
  // the main thread.
  pdfjsLib.GlobalWorkerOptions.workerSrc = ''

  return pdfjsLib
}

// ── Public API ─────────────────────────────────────────────────────────────

export interface PdfExtractResult {
  text: string
  links: CvLink[]
}

/**
 * Extract text and link annotations from a PDF buffer.
 * Safe for Vercel serverless (no workers, no canvas, no native binaries).
 */
export async function extractPdfText(buffer: Buffer): Promise<PdfExtractResult> {
  const pdfjs = await getPdfjs()

  // getDocument accepts a TypedArray; converting Buffer -> Uint8Array is free.
  const loadingTask = pdfjs.getDocument({
    data: new Uint8Array(buffer),
    // Disable workers explicitly at the document level too.
    useWorkerFetch: false,
    isEvalSupported: false,
    useSystemFonts: true,
    // Do not attempt to render — we only need text.
    disableFontFace: true,
  })

  const pdf = await loadingTask.promise

  const pageTexts: string[] = []
  const linkPairs: Array<{ url: string; label?: string }> = []

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum)

    // ── Text extraction ──────────────────────────────────────────────────
    const textContent = await page.getTextContent()
    const lines: string[] = []
    let lastY: number | null = null

    for (const item of textContent.items) {
      // pdfjs TextItem has a transform array; [5] is the Y coordinate.
      if ('str' in item && typeof item.str === 'string') {
        const y = (item as { transform?: number[] }).transform?.[5] ?? null
        // When the Y coordinate changes significantly, start a new line.
        if (lastY !== null && y !== null && Math.abs(y - lastY) > 2) {
          lines.push('\n')
        }
        lines.push(item.str)
        if (y !== null) lastY = y
      }
    }

    pageTexts.push(lines.join(''))

    // ── Link annotation extraction ───────────────────────────────────────
    try {
      const annotations = await page.getAnnotations()
      for (const annot of annotations) {
        if (annot.subtype === 'Link' && annot.url) {
          linkPairs.push({
            url: annot.url,
            label: typeof annot.title === 'string' ? annot.title : undefined,
          })
        }
      }
    } catch (annotError) {
      // Link extraction is best-effort; a corrupt annotation must not fail
      // the entire extraction.
      console.warn(
        '[CV/pdf] annotation extraction failed for page',
        pageNum,
        annotError instanceof Error ? annotError.message : 'unknown'
      )
    }

    // Release page resources eagerly to keep memory low.
    page.cleanup()
  }

  // Release the document.
  await pdf.destroy()

  const text = pageTexts.join('\n\n')
  const links = extractLinks({ pairs: linkPairs, text })

  return { text, links }
}
