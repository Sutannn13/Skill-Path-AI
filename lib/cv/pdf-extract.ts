import pdfParse from 'pdf-parse'

export interface PdfLinkPair {
  url: string
  label?: string
}

export interface PdfExtractResult {
  text: string
  // Structured link targets pulled from PDF link annotations. These are the
  // REAL URLs hidden behind visible anchor text (e.g. "My Portfolio"), which a
  // plain-text scan of the page body would miss entirely.
  linkPairs: PdfLinkPair[]
}

/**
 * Extract text + link annotations from a PDF buffer.
 * Safe for Vercel serverless (uses pure JS pdf-parse, well-tested on Lambda).
 *
 * We walk each page's text content to rebuild readable lines, then read the
 * page's link annotations and try to pair every link URL with the text that
 * sits inside the annotation's rectangle — so "portofolio saya -> https://..."
 * survives as a labelled pair, not just a bare URL.
 */
export async function extractPdfText(buffer: Buffer): Promise<PdfExtractResult> {
  const linkPairs: PdfLinkPair[] = []
  const seen = new Set<string>()

  const options = {
    pagerender: function (pageData: any) {
      const render_options = {
        normalizeWhitespace: false,
        disableCombineTextItems: false,
      }

      return pageData.getTextContent(render_options).then(function (textContent: any) {
        // Rebuild readable text, tracking each item's position so we can later
        // ask "what words fall inside this link's rectangle?".
        type Positioned = { str: string; x: number; y: number; w: number }
        const positioned: Positioned[] = []
        let lastY
        let text = ''
        for (const item of textContent.items) {
          if (lastY == item.transform[5] || !lastY) {
            text += item.str
          } else {
            text += '\n' + item.str
          }
          lastY = item.transform[5]
          positioned.push({
            str: item.str,
            x: item.transform[4],
            y: item.transform[5],
            w: item.width ?? 0,
          })
        }

        return pageData.getAnnotations().then(function (annotations: any) {
          for (const a of annotations) {
            if (a.subtype !== 'Link' || !a.url) continue
            const url: string = a.url
            const key = url.toLowerCase().replace(/\/+$/, '')
            if (seen.has(key)) continue
            seen.add(key)

            // a.rect is [x1, y1, x2, y2] in PDF user space. Collect the text
            // whose baseline sits inside that box as the anchor label.
            let label: string | undefined
            if (Array.isArray(a.rect) && a.rect.length === 4) {
              const [rx1, ry1, rx2, ry2] = a.rect
              const xMin = Math.min(rx1, rx2)
              const xMax = Math.max(rx1, rx2)
              const yMin = Math.min(ry1, ry2)
              const yMax = Math.max(ry1, ry2)
              const inside = positioned
                .filter(
                  (p) =>
                    p.y >= yMin - 2 &&
                    p.y <= yMax + 2 &&
                    p.x + p.w >= xMin - 2 &&
                    p.x <= xMax + 2
                )
                .map((p) => p.str)
                .join('')
                .trim()
              if (inside) label = inside
            }

            linkPairs.push({ url, label })
          }
          return text
        })
      })
    },
  }

  const data = await pdfParse(buffer, options)

  return {
    text: data.text,
    linkPairs,
  }
}
