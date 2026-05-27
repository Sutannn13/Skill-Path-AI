import { JobSourceAdapter } from '../types'

interface RemotiveJob {
  id: number
  url: string
  title: string
  company_name: string
  candidate_required_location: string
  job_type: string
  publication_date: string
  description: string
  tags: string[]
  salary?: string
  company_logo?: string
}

interface RemotiveResponse {
  job_registry?: {
    jobs: RemotiveJob[]
  }
  jobs?: RemotiveJob[]
}

export const remotiveAdapter: JobSourceAdapter = {
  name: 'Remotive',
  slug: 'remotive',
  type: 'api',
  region: 'global',
  baseUrl: 'https://remotive.com',
  attributionLabel: 'Remotive',
  attributionUrl: 'https://remotive.com',

  isConfigured(): boolean {
    return true // Remotive is a public API, no credentials needed
  },

  async fetch(): Promise<Partial<import('../types').JobPost>[]> {
    try {
      const params = new URLSearchParams()
      params.append('category', 'software-dev')

      const response = await fetch(
        `https://remotive.com/api/remote-jobs?${params.toString()}`,
        {
          headers: {
            'Accept': 'application/json',
          },
          next: { revalidate: 3600 }, // Cache for 1 hour
        }
      )

      if (!response.ok) {
        console.error(`Remotive API error: ${response.status}`)
        return []
      }

      const data: RemotiveResponse = await response.json()
      const jobs = data.job_registry?.jobs || data.jobs || []

      return jobs.map(job => this.normalize(job)).filter(Boolean) as Partial<import('../types').JobPost>[]
    } catch (error) {
      console.error('Failed to fetch from Remotive:', error)
      return []
    }
  },

  normalize(raw: unknown): Partial<import('../types').JobPost> | null {
    if (!raw || typeof raw !== 'object') return null

    const job = raw as RemotiveJob

    if (!job.id || !job.title || !job.company_name) return null

    return {
      id: `remotive-${job.id}`,
      sourceSlug: 'remotive',
      externalId: String(job.id),
      title: job.title,
      company: job.company_name,
      location: job.candidate_required_location || 'Remote',
      regionType: mapLocation(job.candidate_required_location),
      workMode: 'remote',
      employmentType: mapJobType(job.job_type),
      experienceLevel: 'junior', // Remotive doesn't specify, default to junior
      description: stripHtml(job.description),
      applyUrl: job.url,
      sourceUrl: job.url,
      tags: (job.tags || []).slice(0, 8),
      requiredSkills: extractSkills(job.title + ' ' + job.description),
      salaryMin: parseSalary(job.salary)?.min,
      salaryMax: parseSalary(job.salary)?.max,
      currency: parseSalary(job.salary)?.currency,
      publishedAt: job.publication_date,
      fetchedAt: new Date().toISOString(),
      validityScore: 50,
      riskLevel: 'low',
      moderationStatus: 'pending_review',
      moderationReasons: [],
      rawPayload: job as unknown as Record<string, unknown>,
    }
  },
}

function mapLocation(location: string): 'indonesia' | 'international' | 'remote' {
  if (!location) return 'remote'

  const lower = location.toLowerCase()
  if (lower.includes('remote') || lower.includes('anywhere') || lower.includes('worldwide')) {
    return 'remote'
  }

  if (lower.includes('indonesia') || lower.includes('jakarta') || lower.includes('bandung')) {
    return 'indonesia'
  }

  return 'international'
}

function mapJobType(type: string): 'full-time' | 'part-time' | 'contract' | 'freelance' | 'internship' {
  const lower = (type || '').toLowerCase()

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

function parseSalary(salary?: string): { min?: number; max?: number; currency?: string } | undefined {
  if (!salary) return undefined

  // Try to parse salary range like "$80,000 - $120,000"
  const match = salary.match(/[\$\€\£]?\s*([\d,]+)\s*(?:-|\/)\s*[\$\€\£]?\s*([\d,]+)?/)
  if (match) {
    return {
      min: parseInt(match[1].replace(/,/g, '')),
      max: match[2] ? parseInt(match[2].replace(/,/g, '')) : undefined,
      currency: salary.includes('$') ? 'USD' : salary.includes('€') ? 'EUR' : salary.includes('£') ? 'GBP' : 'USD',
    }
  }

  return undefined
}