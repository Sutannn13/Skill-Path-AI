import { JobSourceAdapter, JobPost, mapExperienceLevel } from '../types'
import { stripHtml, extractSkills, mapJobTypeFromText } from './shared'

// RemoteOK public API: https://remoteok.com/api
// First array element is a legal/attribution notice, not a job.
interface RemoteOkJob {
  id?: string | number
  slug?: string
  epoch?: number
  date?: string
  company?: string
  position?: string
  tags?: string[]
  description?: string
  location?: string
  apply_url?: string
  url?: string
  salary_min?: number
  salary_max?: number
}

export const remoteokAdapter: JobSourceAdapter = {
  name: 'RemoteOK',
  slug: 'remoteok',
  type: 'api',
  region: 'global',
  baseUrl: 'https://remoteok.com',
  attributionLabel: 'RemoteOK',
  attributionUrl: 'https://remoteok.com',

  isConfigured(): boolean {
    return true // Public API, no credentials needed.
  },

  async fetch(): Promise<Partial<JobPost>[]> {
    try {
      const response = await fetch('https://remoteok.com/api', {
        headers: {
          Accept: 'application/json',
          // RemoteOK blocks requests without a UA.
          'User-Agent': 'SkillPath-App',
        },
        next: { revalidate: 3600 },
      })

      if (!response.ok) {
        console.error(`RemoteOK API error: ${response.status}`)
        return []
      }

      const data: unknown = await response.json()
      if (!Array.isArray(data)) return []

      // Drop the leading legal notice (object without a "position").
      const jobs = data.filter(
        (entry): entry is RemoteOkJob =>
          Boolean(entry) && typeof entry === 'object' && 'position' in entry
      )

      return jobs.map((job) => this.normalize(job)).filter(Boolean) as Partial<JobPost>[]
    } catch (error) {
      console.error('Failed to fetch from RemoteOK:', error)
      return []
    }
  },

  normalize(raw: unknown): Partial<JobPost> | null {
    if (!raw || typeof raw !== 'object') return null
    const job = raw as RemoteOkJob

    if (!job.id || !job.position || !job.company) return null

    const tags = (job.tags || []).filter(Boolean)
    const text = `${job.position} ${job.description || ''} ${tags.join(' ')}`
    const applyUrl = job.apply_url || job.url || `https://remoteok.com/l/${job.id}`

    return {
      id: `remoteok-${job.id}`,
      sourceSlug: 'remoteok',
      externalId: String(job.id),
      title: job.position,
      company: job.company,
      location: job.location || 'Remote',
      regionType: 'remote',
      workMode: 'remote',
      employmentType: mapJobTypeFromText(`${tags.join(' ')} ${job.position}`),
      experienceLevel: mapExperienceLevel(`${job.position} ${tags.join(' ')}`),
      description: stripHtml(job.description || ''),
      applyUrl,
      sourceUrl: job.url || applyUrl,
      tags: tags.slice(0, 8),
      requiredSkills: extractSkills(text),
      salaryMin: typeof job.salary_min === 'number' && job.salary_min > 0 ? job.salary_min : undefined,
      salaryMax: typeof job.salary_max === 'number' && job.salary_max > 0 ? job.salary_max : undefined,
      currency: job.salary_min ? 'USD' : undefined,
      publishedAt: job.date || (job.epoch ? new Date(job.epoch * 1000).toISOString() : new Date().toISOString()),
      fetchedAt: new Date().toISOString(),
      validityScore: 55,
      riskLevel: 'low',
      moderationStatus: 'pending_review',
      moderationReasons: [],
      rawPayload: job as unknown as Record<string, unknown>,
    }
  },
}
