import { JobSourceAdapter } from '../types'

interface ArbeitnowJob {
  slug: string
  company_name: string
  title: string
  description: string
  url: string
  location: string
  tags: string[]
  job_types: string[]
  remote: boolean
  created_at: string
}

interface ArbeitnowResponse {
  data: ArbeitnowJob[]
  links?: {
    next: string | null
  }
  meta?: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}

export const arbeitnowAdapter: JobSourceAdapter = {
  name: 'Arbeitnow',
  slug: 'arbeitnow',
  type: 'api',
  region: 'global',
  baseUrl: 'https://arbeitnow.com',
  attributionLabel: 'Arbeitnow',
  attributionUrl: 'https://arbeitnow.com',

  isConfigured(): boolean {
    return true // Arbeitnow public API
  },

  async fetch(): Promise<Partial<import('../types').JobPost>[]> {
    try {
      const response = await fetch(
        'https://arbeitnow.com/api/job-board-api',
        {
          headers: {
            'Accept': 'application/json',
          },
          next: { revalidate: 3600 },
        }
      )

      if (!response.ok) {
        console.error(`Arbeitnow API error: ${response.status}`)
        return []
      }

      const data: ArbeitnowResponse = await response.json()
      const jobs = data.data || []

      return jobs.map(job => this.normalize(job)).filter(Boolean) as Partial<import('../types').JobPost>[]
    } catch (error) {
      console.error('Failed to fetch from Arbeitnow:', error)
      return []
    }
  },

  normalize(raw: unknown): Partial<import('../types').JobPost> | null {
    if (!raw || typeof raw !== 'object') return null

    const job = raw as ArbeitnowJob

    if (!job.slug || !job.title || !job.company_name) return null

    return {
      id: `arbeitnow-${job.slug}`,
      sourceSlug: 'arbeitnow',
      externalId: job.slug,
      title: job.title,
      company: job.company_name,
      location: job.location || 'Remote',
      regionType: job.remote || job.location?.toLowerCase().includes('remote')
        ? 'remote'
        : mapLocation(job.location),
      workMode: job.remote ? 'remote' : 'onsite',
      employmentType: mapJobType(job.job_types),
      experienceLevel: 'junior',
      description: stripHtml(job.description),
      applyUrl: job.url,
      sourceUrl: job.url,
      tags: (job.tags || []).slice(0, 8),
      requiredSkills: extractSkills(job.title + ' ' + job.description),
      publishedAt: job.created_at,
      fetchedAt: new Date().toISOString(),
      validityScore: 50,
      riskLevel: 'low',
      moderationStatus: 'pending_review',
      moderationReasons: [],
      rawPayload: job as unknown as Record<string, unknown>,
    }
  },
}

function mapLocation(location: string | undefined): 'indonesia' | 'international' | 'remote' {
  if (!location) return 'international'

  const lower = location.toLowerCase()
  if (lower.includes('remote') || lower.includes('worldwide')) {
    return 'remote'
  }
  if (lower.includes('indonesia') || lower.includes('jakarta')) {
    return 'indonesia'
  }

  return 'international'
}

function mapJobType(types: string[]): 'full-time' | 'part-time' | 'contract' | 'freelance' | 'internship' {
  if (!types || types.length === 0) return 'full-time'

  const lower = types.join(' ').toLowerCase()

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
    .replace(/\n+/g, ' ')
    .trim()
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