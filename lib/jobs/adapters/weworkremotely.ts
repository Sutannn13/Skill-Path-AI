import { JobSourceAdapter, JobPost, mapExperienceLevel } from '../types'
import { stripHtml, extractSkills, mapJobTypeFromText, mapRegionFromLocation } from './shared'

// WeWorkRemotely exposes per-category RSS feeds (no API key needed).
const WWR_FEEDS = [
  'https://weworkremotely.com/categories/remote-programming-jobs.rss',
  'https://weworkremotely.com/categories/remote-full-stack-programming-jobs.rss',
  'https://weworkremotely.com/categories/remote-front-end-programming-jobs.rss',
  'https://weworkremotely.com/categories/remote-back-end-programming-jobs.rss',
  'https://weworkremotely.com/categories/remote-design-jobs.rss',
]

interface ParsedRssItem {
  title: string
  region: string
  category: string
  description: string
  pubDate: string
  guid: string
  link: string
}

function getTag(block: string, tag: string): string {
  // Handle both <tag>...</tag> and CDATA-wrapped values.
  const match = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i'))
  if (!match) return ''
  return match[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').trim()
}

function parseItems(xml: string): ParsedRssItem[] {
  const items: ParsedRssItem[] = []
  const itemRegex = /<item>([\s\S]*?)<\/item>/g
  let match: RegExpExecArray | null

  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1]
    items.push({
      title: getTag(block, 'title'),
      region: getTag(block, 'region'),
      category: getTag(block, 'category'),
      description: getTag(block, 'description'),
      pubDate: getTag(block, 'pubDate'),
      guid: getTag(block, 'guid'),
      link: getTag(block, 'link'),
    })
  }

  return items
}

// WWR titles are usually "Company Name: Job Title".
function splitTitle(rawTitle: string): { company: string; title: string } {
  const idx = rawTitle.indexOf(':')
  if (idx > 0 && idx < rawTitle.length - 1) {
    return {
      company: rawTitle.slice(0, idx).trim(),
      title: rawTitle.slice(idx + 1).trim(),
    }
  }
  return { company: 'Unknown', title: rawTitle.trim() }
}

export const weworkremotelyAdapter: JobSourceAdapter = {
  name: 'We Work Remotely',
  slug: 'weworkremotely',
  type: 'rss',
  region: 'global',
  baseUrl: 'https://weworkremotely.com',
  attributionLabel: 'We Work Remotely',
  attributionUrl: 'https://weworkremotely.com',

  isConfigured(): boolean {
    return true
  },

  async fetch(): Promise<Partial<JobPost>[]> {
    const all: Partial<JobPost>[] = []

    for (const feed of WWR_FEEDS) {
      try {
        const response = await fetch(feed, {
          headers: { Accept: 'application/rss+xml, application/xml, text/xml', 'User-Agent': 'SkillPath-App' },
          next: { revalidate: 3600 },
        })

        if (!response.ok) {
          console.error(`WeWorkRemotely RSS error (${feed}): ${response.status}`)
          continue
        }

        const xml = await response.text()
        for (const item of parseItems(xml)) {
          const normalized = this.normalize(item)
          if (normalized) all.push(normalized)
        }
      } catch (error) {
        console.error(`Failed to fetch WeWorkRemotely feed ${feed}:`, error)
      }
    }

    return all
  },

  normalize(raw: unknown): Partial<JobPost> | null {
    if (!raw || typeof raw !== 'object') return null
    const item = raw as ParsedRssItem

    if (!item.title || !item.link) return null

    const { company, title } = splitTitle(item.title)
    const externalId = item.guid || item.link
    const location = item.region || 'Remote'
    const description = stripHtml(item.description || '')
    const text = `${title} ${description} ${item.category}`
    const publishedAt = item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString()

    return {
      id: `weworkremotely-${externalId.replace(/^https?:\/\//, '').replace(/[^a-z0-9]/gi, '-')}`,
      sourceSlug: 'weworkremotely',
      externalId,
      title,
      company,
      location,
      regionType: mapRegionFromLocation(location),
      workMode: 'remote',
      employmentType: mapJobTypeFromText(`${title} ${item.category}`),
      experienceLevel: mapExperienceLevel(`${title} ${description}`),
      description,
      applyUrl: item.link,
      sourceUrl: item.link,
      tags: item.category ? [item.category] : [],
      requiredSkills: extractSkills(text),
      publishedAt,
      fetchedAt: new Date().toISOString(),
      validityScore: 56,
      riskLevel: 'low',
      moderationStatus: 'pending_review',
      moderationReasons: [],
      rawPayload: item as unknown as Record<string, unknown>,
    }
  },
}
