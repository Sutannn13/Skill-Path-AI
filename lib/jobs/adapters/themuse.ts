import { JobSourceAdapter, JobPost } from '../types'
import { stripHtml, extractSkills, mapRegionFromLocation } from './shared'

// The Muse public API: https://www.themuse.com/api/public/jobs
// No key required for basic use; an optional key raises rate limits.
interface MuseJob {
  id?: number
  name?: string
  contents?: string
  publication_date?: string
  type?: string
  locations?: { name: string }[]
  categories?: { name: string }[]
  levels?: { name: string; short_name: string }[]
  tags?: { name: string }[]
  company?: { name: string }
  refs?: { landing_page?: string }
}

interface MuseResponse {
  results?: MuseJob[]
}

// Software-relevant Muse categories we care about for this app.
const MUSE_CATEGORIES = [
  'Software Engineering',
  'Data Science',
  'Design and UX',
  'IT',
]

function mapMuseLevel(levels?: { name: string; short_name: string }[]): JobPost['experienceLevel'] {
  const text = (levels || []).map((l) => `${l.name} ${l.short_name}`).join(' ').toLowerCase()
  if (text.includes('intern')) return 'internship'
  if (text.includes('entry') || text.includes('junior')) return 'junior'
  if (text.includes('senior') || text.includes('management') || text.includes('director')) return 'senior'
  if (text.includes('mid')) return 'mid'
  return 'junior'
}

function mapMuseRegion(locationName: string): 'indonesia' | 'international' | 'remote' {
  if (/flexible|remote/i.test(locationName)) return 'remote'
  return mapRegionFromLocation(locationName)
}

export const themuseAdapter: JobSourceAdapter = {
  name: 'The Muse',
  slug: 'themuse',
  type: 'api',
  region: 'global',
  baseUrl: 'https://www.themuse.com',
  attributionLabel: 'The Muse',
  attributionUrl: 'https://www.themuse.com',

  isConfigured(): boolean {
    return true
  },

  async fetch(): Promise<Partial<JobPost>[]> {
    const apiKey = process.env.THEMUSE_API_KEY?.trim()
    const all: Partial<JobPost>[] = []

    try {
      // Pull the first two pages of each relevant category.
      for (const category of MUSE_CATEGORIES) {
        for (let page = 1; page <= 2; page++) {
          const params = new URLSearchParams()
          params.set('category', category)
          params.set('page', String(page))
          if (apiKey) params.set('api_key', apiKey)

          const response = await fetch(`https://www.themuse.com/api/public/jobs?${params.toString()}`, {
            headers: { Accept: 'application/json', 'User-Agent': 'SkillPath-App' },
            next: { revalidate: 3600 },
          })

          if (!response.ok) {
            // 429 means rate-limited; stop pulling further pages but keep what we have.
            if (response.status === 429) return all
            console.error(`The Muse API error (${category} p${page}): ${response.status}`)
            continue
          }

          const data: MuseResponse = await response.json()
          for (const job of data.results || []) {
            const normalized = this.normalize(job)
            if (normalized) all.push(normalized)
          }
        }
      }

      return all
    } catch (error) {
      console.error('Failed to fetch from The Muse:', error)
      return all
    }
  },

  normalize(raw: unknown): Partial<JobPost> | null {
    if (!raw || typeof raw !== 'object') return null
    const job = raw as MuseJob

    if (!job.id || !job.name || !job.company?.name) return null

    const locationName = job.locations?.[0]?.name || 'Flexible / Remote'
    const text = `${job.name} ${job.contents || ''} ${(job.categories || []).map((c) => c.name).join(' ')}`
    const applyUrl = job.refs?.landing_page || `https://www.themuse.com/jobs/${job.id}`
    const regionType = mapMuseRegion(locationName)

    return {
      id: `themuse-${job.id}`,
      sourceSlug: 'themuse',
      externalId: String(job.id),
      title: job.name,
      company: job.company.name,
      location: locationName,
      regionType,
      workMode: regionType === 'remote' ? 'remote' : 'onsite',
      employmentType: /intern/i.test(`${job.name} ${(job.levels || []).map((l) => l.name).join(' ')}`)
        ? 'internship'
        : 'full-time',
      experienceLevel: mapMuseLevel(job.levels),
      description: stripHtml(job.contents || ''),
      applyUrl,
      sourceUrl: applyUrl,
      tags: [
        ...(job.categories || []).map((c) => c.name),
        ...(job.levels || []).map((l) => l.name),
      ].slice(0, 8),
      requiredSkills: extractSkills(text),
      publishedAt: job.publication_date || new Date().toISOString(),
      fetchedAt: new Date().toISOString(),
      validityScore: 60,
      riskLevel: 'low',
      moderationStatus: 'pending_review',
      moderationReasons: [],
      rawPayload: job as unknown as Record<string, unknown>,
    }
  },
}
