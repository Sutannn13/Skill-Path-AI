// Hyperlink extraction + classification for CVs. Many resumes hide their real
// portfolio/GitHub/LinkedIn URLs behind link text (PDF/DOCX annotations) rather
// than printing the bare URL, so a plain-text scan misses them. We pull the
// annotation targets out and classify them so the audit can reason about them.

export type CvLinkType = 'github' | 'linkedin' | 'portfolio' | 'social' | 'email' | 'other'

export interface CvLink {
  url: string
  // The visible anchor text when known (e.g. "My Portfolio"), else the URL.
  label: string
  type: CvLinkType
}

// Hosts we treat as "social" rather than a personal portfolio.
const SOCIAL_HOSTS = [
  'twitter.com', 'x.com', 'instagram.com', 'facebook.com', 'fb.com',
  'youtube.com', 'youtu.be', 'tiktok.com', 'medium.com', 'dev.to',
  'dribbble.com', 'behance.net', 'stackoverflow.com', 'gitlab.com',
  'bitbucket.org', 'kaggle.com', 'hashnode.com', 'threads.net',
]

// Academic / DOI hosts: these are publication references, NOT a portfolio.
const ACADEMIC_HOSTS = [
  'doi.org', 'dx.doi.org', 'researchgate.net', 'scholar.google.com',
  'sciencedirect.com', 'springer.com', 'ieee.org', 'orcid.org',
]

function normalizeUrl(raw: string): string {
  let url = raw.trim().replace(/[).,;]+$/, '')
  if (url.toLowerCase().startsWith('mailto:')) return url
  if (/^www\./i.test(url)) url = `https://${url}`
  return url
}

function hostOf(url: string): string {
  try {
    if (url.toLowerCase().startsWith('mailto:')) return ''
    return new URL(url).hostname.replace(/^www\./i, '').toLowerCase()
  } catch {
    return ''
  }
}

/**
 * Classify a single URL into a coarse bucket used by the audit and the rewrite.
 */
export function classifyLink(url: string): CvLinkType {
  const lower = url.toLowerCase()
  if (lower.startsWith('mailto:')) return 'email'
  const host = hostOf(url)
  if (!host) return 'other'
  if (host === 'github.com' || host.endsWith('.github.io')) return 'github'
  if (host === 'linkedin.com' || host.endsWith('.linkedin.com')) return 'linkedin'
  if (ACADEMIC_HOSTS.some((h) => host === h || host.endsWith(`.${h}`))) return 'other'
  if (SOCIAL_HOSTS.some((h) => host === h || host.endsWith(`.${h}`))) return 'social'
  // Anything else that is a real http(s) link is treated as a personal site /
  // portfolio (vercel.app, netlify.app, custom domains, etc.).
  return 'portfolio'
}

const BARE_URL_RE = /\b((?:https?:\/\/|www\.)[^\s)<>\]"']+)/gi
const MAILTO_RE = /\bmailto:([^\s)<>\]"']+)/gi
// Markdown inline links as emitted by pdf-parse parseHyperlinks: [label](url).
const MD_LINK_RE = /\[([^\]]*)\]\((https?:\/\/[^\s)]+|mailto:[^\s)]+)\)/gi
// DOCX/HTML anchors from mammoth.convertToHtml: <a href="url">label</a>.
const HTML_ANCHOR_RE = /<a[^>]+href=["']([^"']+)["'][^>]*>(.*?)<\/a>/gi

function pushLink(out: CvLink[], seen: Set<string>, urlRaw: string, labelRaw?: string): void {
  const url = normalizeUrl(urlRaw)
  if (!url) return
  // Require a usable scheme; skip in-document anchors and javascript: targets.
  const lower = url.toLowerCase()
  if (!/^(https?:\/\/|mailto:)/.test(lower)) return
  const key = lower.replace(/\/+$/, '')
  if (seen.has(key)) return
  seen.add(key)
  const label = (labelRaw || '').trim().replace(/\s+/g, ' ')
  out.push({ url, label: label || url, type: classifyLink(url) })
}

// Anchor text from PDF link annotations is often overlapping/garbled, so only
// keep it as a label when it looks like a clean, short caption.
function cleanLabel(label: string | undefined): string | undefined {
  if (!label) return undefined
  const trimmed = label.trim().replace(/\s+/g, ' ')
  if (!trimmed || trimmed.length > 40) return undefined
  return trimmed
}

/**
 * Extract links from already-collected source fragments. Pass any/all of:
 * - pairs (structured {url,label} from pdf-parse getInfo page links),
 * - markdown text (pdf-parse with parseHyperlinks),
 * - raw HTML (mammoth.convertToHtml for DOCX),
 * - plain text (TXT, or the normalized resume body for bare URLs).
 * Returns a deduped, classified list.
 */
export function extractLinks(sources: {
  pairs?: Array<{ url: string; label?: string }>
  markdown?: string
  html?: string
  text?: string
}): CvLink[] {
  const out: CvLink[] = []
  const seen = new Set<string>()

  if (sources.pairs) {
    for (const pair of sources.pairs) {
      pushLink(out, seen, pair.url, cleanLabel(pair.label))
    }
  }

  if (sources.markdown) {
    for (const m of sources.markdown.matchAll(MD_LINK_RE)) {
      pushLink(out, seen, m[2], m[1])
    }
  }

  if (sources.html) {
    for (const m of sources.html.matchAll(HTML_ANCHOR_RE)) {
      // Strip any nested tags from the anchor's inner text.
      const label = m[2].replace(/<[^>]+>/g, ' ')
      pushLink(out, seen, m[1], label)
    }
  }

  // Bare URLs / mailto from every textual source as a backstop.
  for (const source of [sources.markdown, sources.html, sources.text]) {
    if (!source) continue
    for (const m of source.matchAll(BARE_URL_RE)) pushLink(out, seen, m[1])
    for (const m of source.matchAll(MAILTO_RE)) pushLink(out, seen, `mailto:${m[1]}`)
  }

  return out
}

/**
 * Replace markdown link syntax [label](url) with "label (url)" so the analysis
 * body and keyword scan see human-readable text instead of markdown noise.
 */
export function flattenMarkdownLinks(markdown: string): string {
  return markdown.replace(MD_LINK_RE, (_full, label: string, url: string) => {
    const text = (label || '').trim()
    return text && text !== url ? `${text} (${url})` : url
  })
}

/** Convenience: does the link set contain a given type? */
export function hasLinkType(links: CvLink[], type: CvLinkType): boolean {
  return links.some((link) => link.type === type)
}
