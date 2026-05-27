import { JobSourceAdapter } from '../types'

const ADZUNA_APP_ID = process.env.ADZUNA_APP_ID
const ADZUNA_APP_KEY = process.env.ADZUNA_APP_KEY

interface AdzunaJob {
  id: string
  title: string
  company: {
    display_name: string
  }
  location: {
    display_name: string
  }
  description: string
  url: string
  created: string
  salary_min?: number
  salary_max?: number
  category: {
    tag: string
    label: string
  }
  contract_type?: string
  remote?: {
    type: string
  }
}

interface AdzunaResponse {
  results: AdzunaJob[]
  total: number
}

export const adzunaAdapter: JobSourceAdapter = {
  name: 'Adzuna',
  slug: 'adzuna',
  type: 'api',
  region: 'global',
  baseUrl: 'https://www.adzuna.com',
  attributionLabel: 'Adzuna',
  attributionUrl: 'https://www.adzuna.com',

  isConfigured(): boolean {
    return Boolean(ADZUNA_APP_ID && ADZUNA_APP_KEY)
  },

  async fetch(): Promise<Partial<import('../types').JobPost>[]> {
    if (!this.isConfigured()) {
      console.warn('Adzuna API not configured - skipping')
      return []
    }

    try {
      // Search for tech jobs in various countries
      const countries = ['us', 'gb', 'de', 'au', 'ca']
      const allJobs: Partial<import('../types').JobPost>[] = []

      for (const country of countries) {
        const response = await fetch(
          `https://api.adzuna.com/v1/api/jobs/${country}/search/1?app_id=${ADZUNA_APP_ID}&app_key=${ADZUNA_APP_KEY}&results_per_page=50&category=it-jobs`,
          {
            headers: {
              'Accept': 'application/json',
            },
            next: { revalidate: 3600 },
          }
        )

        if (!response.ok) {
          console.error(`Adzuna API error for ${country}: ${response.status}`)
          continue
        }

        const data: AdzunaResponse = await response.json()
        const jobs = data.results || []

        for (const job of jobs) {
          const normalized = this.normalize(job)
          if (normalized) {
            allJobs.push(normalized)
          }
        }
      }

      return allJobs
    } catch (error) {
      console.error('Failed to fetch from Adzuna:', error)
      return []
    }
  },

  normalize(raw: unknown): Partial<import('../types').JobPost> | null {
    if (!raw || typeof raw !== 'object') return null

    const job = raw as AdzunaJob

    if (!job.id || !job.title) return null

    return {
      id: `adzuna-${job.id}`,
      sourceSlug: 'adzuna',
      externalId: job.id,
      title: job.title,
      company: job.company?.display_name || 'Unknown',
      location: job.location?.display_name || 'Unknown',
      regionType: job.remote ? 'remote' : 'international',
      workMode: job.remote ? 'remote' : 'onsite',
      employmentType: mapJobType(job.contract_type),
      experienceLevel: 'junior',
      description: stripHtml(job.description),
      applyUrl: job.url,
      sourceUrl: job.url,
      tags: [job.category?.label || 'IT'].slice(0, 5),
      requiredSkills: extractSkills(job.title + ' ' + job.description),
      salaryMin: job.salary_min,
      salaryMax: job.salary_max,
      currency: 'USD',
      publishedAt: job.created,
      fetchedAt: new Date().toISOString(),
      validityScore: 50,
      riskLevel: 'low',
      moderationStatus: 'pending_review',
      moderationReasons: [],
      rawPayload: job as unknown as Record<string, unknown>,
    }
  },
}

function mapJobType(type?: string): 'full-time' | 'part-time' | 'contract' | 'freelance' | 'internship' {
  if (!type) return 'full-time'

  const lower = type.toLowerCase()

  if (lower.includes('full')) return 'full-time'
  if (lower.includes('part')) return 'part-time'
  if (lower.includes('contract')) return 'contract'
  if (lower.includes('freelance')) return 'freelance'
  if (lower.includes('intern')) return 'internship'

  return 'full-time'
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .slice(0, 1000)
}

function extractSkills(text: string): string[] {
  const skillKeywords = [
    'JavaScript', 'TypeScript', 'React', 'Vue', 'Angular', 'Node.js',
    'Python', 'Java', 'Go', 'Rust', 'C++', 'C#', '.NET',
    'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Elasticsearch',
    'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes',
    'Git', 'CI/CD', 'Agile', 'Scrum',
    'REST', 'GraphQL', 'gRPC',
    'HTML', 'CSS', 'Tailwind', 'Sass',
    'React Native', 'Flutter', 'Swift', 'Kotlin',
    'TensorFlow', 'PyTorch', 'Machine Learning',
    'Figma', 'UI/UX',
  ]

  const textLower = text.toLowerCase()
  const found: string[] = []

  for (const skill of skillKeywords) {
    if (textLower.includes(skill.toLowerCase())) {
      found.push(skill)
    }
  }

  return Array.from(new Set(found)).slice(0, 10)
}