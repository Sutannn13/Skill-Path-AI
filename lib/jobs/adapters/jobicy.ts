import { JobSourceAdapter } from '../types'

interface JobicyJob {
  id: string
  title: string
  company_name: string
  company_logo?: string
  job_type: string
  remote: boolean
  url: string
  publication_date: string
  description: string
  tags?: string[]
  salary?: string
  candidate_required_location?: string
}

interface JobicyResponse {
  jobs?: JobicyJob[]
  job?: JobicyJob // Sometimes API returns single job
}

export const jobicyAdapter: JobSourceAdapter = {
  name: 'Jobicy',
  slug: 'jobicy',
  type: 'api',
  region: 'global',
  baseUrl: 'https://jobicy.com',
  attributionLabel: 'Jobicy',
  attributionUrl: 'https://jobicy.com',

  isConfigured(): boolean {
    return true // Jobicy public API
  },

  async fetch(): Promise<Partial<import('../types').JobPost>[]> {
    try {
      // Jobicy has different endpoints - using the public jobs API
      const response = await fetch(
        'https://jobicy.com/api/v1/jobs?tag=react&count=50&category=dev',
        {
          headers: {
            'Accept': 'application/json',
          },
          next: { revalidate: 3600 },
        }
      )

      if (!response.ok) {
        console.error(`Jobicy API error: ${response.status}`)
        return []
      }

      const data: JobicyResponse = await response.json()
      const jobs = Array.isArray(data.jobs) ? data.jobs : []

      return jobs.map(job => this.normalize(job)).filter(Boolean) as Partial<import('../types').JobPost>[]
    } catch (error) {
      console.error('Failed to fetch from Jobicy:', error)
      return []
    }
  },

  normalize(raw: unknown): Partial<import('../types').JobPost> | null {
    if (!raw || typeof raw !== 'object') return null

    const job = raw as JobicyJob

    if (!job.id || !job.title || !job.company_name) return null

    return {
      id: `jobicy-${job.id}`,
      sourceSlug: 'jobicy',
      externalId: job.id,
      title: job.title,
      company: job.company_name,
      location: job.candidate_required_location || 'Remote',
      regionType: mapLocation(job.candidate_required_location, job.remote),
      workMode: job.remote ? 'remote' : 'onsite',
      employmentType: mapJobType(job.job_type),
      experienceLevel: 'junior',
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

function mapLocation(location: string | undefined, remote: boolean): 'indonesia' | 'international' | 'remote' {
  if (remote) return 'remote'
  if (!location) return 'international'

  const lower = location.toLowerCase()
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