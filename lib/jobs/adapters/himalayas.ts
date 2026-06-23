import { JobSourceAdapter, JobPost } from '../types'
import { stripHtml, extractSkills, mapJobTypeFromText, mapRegionFromLocation } from './shared'

// Himalayas public jobs API: https://himalayas.app/jobs/api
interface HimalayasJob {
  title?: string
  excerpt?: string
  companyName?: string
  companyLogo?: string
  employmentType?: string
  minSalary?: number | null
  maxSalary?: number | null
  currency?: string | null
  seniority?: string[]
  locationRestrictions?: string[]
  categories?: string[]
  description?: string
  pubDate?: number | string
  expiryDate?: number | string
  applicationLink?: string
  guid?: string
}

interface HimalayasResponse {
  jobs?: HimalayasJob[]
}

function mapSeniority(seniority?: string[]): JobPost['experienceLevel'] {
  const text = (seniority || []).join(' ').toLowerCase()
  if (text.includes('intern')) return 'internship'
  if (text.includes('entry') || text.includes('junior')) return 'junior'
  if (text.includes('senior') || text.includes('lead') || text.includes('principal')) return 'senior'
  if (text.includes('mid')) return 'mid'
  return 'junior'
}

function toIso(value?: number | string): string {
  if (typeof value === 'number') return new Date(value * 1000).toISOString()
  if (typeof value === 'string' && value) {
    const parsed = new Date(value)
    if (!Number.isNaN(parsed.getTime())) return parsed.toISOString()
  }
  return new Date().toISOString()
}

export const himalayasAdapter: JobSourceAdapter = {
  name: 'Himalayas',
  slug: 'himalayas',
  type: 'api',
  region: 'global',
  baseUrl: 'https://himalayas.app',
  attributionLabel: 'Himalayas',
  attributionUrl: 'https://himalayas.app',

  isConfigured(): boolean {
    return true
  },

  async fetch(): Promise<Partial<JobPost>[]> {
    try {
      const response = await fetch('https://himalayas.app/jobs/api?limit=100', {
        headers: { Accept: 'application/json', 'User-Agent': 'SkillPath-App' },
        next: { revalidate: 3600 },
      })

      if (!response.ok) {
        console.error(`Himalayas API error: ${response.status}`)
        return []
      }

      const data: HimalayasResponse = await response.json()
      const jobs = data.jobs || []
      return jobs.map((job) => this.normalize(job)).filter(Boolean) as Partial<JobPost>[]
    } catch (error) {
      console.error('Failed to fetch from Himalayas:', error)
      return []
    }
  },

  normalize(raw: unknown): Partial<JobPost> | null {
    if (!raw || typeof raw !== 'object') return null
    const job = raw as HimalayasJob

    if (!job.title || !job.companyName) return null

    const externalId = job.guid || `${job.companyName}-${job.title}`.replace(/\s+/g, '-').toLowerCase()
    const location = (job.locationRestrictions || []).join(', ') || 'Remote'
    const text = `${job.title} ${job.description || job.excerpt || ''} ${(job.categories || []).join(' ')}`
    const applyUrl = job.applicationLink || job.guid || 'https://himalayas.app/jobs'

    return {
      id: `himalayas-${externalId}`,
      sourceSlug: 'himalayas',
      externalId,
      title: job.title,
      company: job.companyName,
      location,
      regionType: mapRegionFromLocation(location),
      workMode: 'remote',
      employmentType: mapJobTypeFromText(job.employmentType || job.title),
      experienceLevel: mapSeniority(job.seniority),
      description: stripHtml(job.description || job.excerpt || ''),
      applyUrl,
      sourceUrl: applyUrl,
      tags: (job.categories || []).slice(0, 8),
      requiredSkills: extractSkills(text),
      salaryMin: typeof job.minSalary === 'number' && job.minSalary > 0 ? job.minSalary : undefined,
      salaryMax: typeof job.maxSalary === 'number' && job.maxSalary > 0 ? job.maxSalary : undefined,
      currency: job.currency || (job.minSalary ? 'USD' : undefined),
      publishedAt: toIso(job.pubDate),
      fetchedAt: new Date().toISOString(),
      expiresAt: job.expiryDate ? toIso(job.expiryDate) : undefined,
      validityScore: 58,
      riskLevel: 'low',
      moderationStatus: 'pending_review',
      moderationReasons: [],
      rawPayload: job as unknown as Record<string, unknown>,
    }
  },
}
