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
  const options = {
    pagerender: function (pageData: any) {
      const render_options = {
        normalizeWhitespace: false,
        disableCombineTextItems: false,
      }

      return pageData.getTextContent(render_options).then(function (textContent: any) {
        let lastY,
          text = ''
        for (const item of textContent.items) {
          if (lastY == item.transform[5] || !lastY) {
            text += item.str
          } else {
            text += '\n' + item.str
          }
          lastY = item.transform[5]
        }

        return pageData.getAnnotations().then(function (annotations: any) {
          const links = []
          for (const a of annotations) {
            if (a.subtype === 'Link' && a.url) {
              links.push(a.url)
            }
          }
          if (links.length > 0) {
            text += '\n[HIDDEN_LINKS: ' + links.join(' , ') + ']\n'
          }
          return text
        })
      })
    },
  }

  const data = await pdfParse(buffer, options)
  
  // pdf-parse extracts pure text. It doesn't extract links reliably by default.
  // We injected HIDDEN_LINKS into the text stream above.
  // We return empty links array and rely on raw URL regex parsing later in heuristics.
  return { 
    text: data.text, 
    links: [] 
  }
}
