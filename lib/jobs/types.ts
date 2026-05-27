// Unified Job Post type for internal use
export interface JobPost {
  id: string
  sourceSlug: string
  externalId: string
  title: string
  company: string
  companyDomain?: string
  location: string
  country?: string
  regionType: 'indonesia' | 'international' | 'remote'
  workMode: 'remote' | 'hybrid' | 'onsite'
  employmentType: 'full-time' | 'part-time' | 'contract' | 'freelance' | 'internship'
  experienceLevel: 'beginner' | 'internship' | 'junior' | 'mid' | 'senior'
  description: string
  applyUrl: string
  sourceUrl: string
  tags: string[]
  requiredSkills: string[]
  salaryMin?: number
  salaryMax?: number
  currency?: string
  publishedAt: string
  fetchedAt: string
  expiresAt?: string
  validityScore: number
  riskLevel: 'low' | 'medium' | 'high'
  moderationStatus: 'approved' | 'pending_review' | 'rejected' | 'expired'
  moderationReasons: string[]
  rawPayload?: Record<string, unknown>
}

// Source adapter interface
export interface JobSourceAdapter {
  name: string
  slug: string
  type: 'api' | 'rss' | 'scrape'
  region: 'indonesia' | 'international' | 'global'
  baseUrl: string
  attributionLabel: string
  attributionUrl: string

  // Fetch jobs from source
  fetch(): Promise<Partial<JobPost>[]>

  // Normalize raw job to internal format
  normalize(raw: unknown): Partial<JobPost> | null

  // Check if source is configured/available
  isConfigured(): boolean
}

// Job filter options
export interface JobFilters {
  query?: string
  region?: 'all' | 'indonesia' | 'international' | 'remote'
  employmentType?: 'all' | 'internship' | 'full-time' | 'part-time' | 'contract' | 'freelance'
  experienceLevel?: 'all' | 'beginner' | 'internship' | 'junior' | 'mid' | 'senior'
  techStack?: 'all' | 'frontend' | 'backend' | 'fullstack' | 'mobile' | 'ui-ux' | 'data'
  tags?: string[]
}

// Job ingestion run result
export interface JobIngestionResult {
  sourceSlug: string
  status: 'success' | 'partial' | 'failed'
  fetchedCount: number
  insertedCount: number
  updatedCount: number
  rejectedCount: number
  errorMessage?: string
  startedAt: string
  finishedAt: string
}

// Job validity assessment
export interface JobValidityAssessment {
  validityScore: number // 0-100
  riskLevel: 'low' | 'medium' | 'high'
  status: 'approved' | 'pending_review' | 'rejected'
  reasons: string[]
  signals: string[]
  analyzedAt: string
}

// Tech stack mapping to job tags/skills
export const TECH_STACK_MAPPING: Record<string, string[]> = {
  'frontend': ['React', 'Vue.js', 'Angular', 'Next.js', 'TypeScript', 'JavaScript', 'CSS', 'HTML', 'Tailwind'],
  'backend': ['Node.js', 'Python', 'Java', 'Go', 'Rust', 'PostgreSQL', 'MongoDB', 'Express', 'Django'],
  'fullstack': ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'Express', 'Next.js', 'MongoDB'],
  'mobile': ['React Native', 'Flutter', 'Swift', 'Kotlin', 'iOS', 'Android'],
  'ui-ux': ['Figma', 'UI/UX', 'CSS', 'Tailwind', 'Adobe XD', 'Sketch'],
  'data': ['Python', 'SQL', 'Machine Learning', 'TensorFlow', 'PyTorch', 'Data Science', 'Pandas'],
}

// Map region type from raw data
export function mapRegionType(location: string, country?: string): 'indonesia' | 'international' | 'remote' {
  const locationLower = location.toLowerCase()
  const countryLower = (country || '').toLowerCase()

  if (locationLower.includes('remote') || locationLower.includes('work from home')) {
    return 'remote'
  }

  if (countryLower === 'indonesia' || countryLower === 'id') {
    return 'indonesia'
  }

  return 'international'
}

// Map experience level
export function mapExperienceLevel(level?: string): JobPost['experienceLevel'] {
  const levelLower = (level || '').toLowerCase()

  if (levelLower.includes('intern')) return 'internship'
  if (levelLower.includes('junior') || levelLower.includes('entry')) return 'junior'
  if (levelLower.includes('mid') || levelLower.includes('intermediate')) return 'mid'
  if (levelLower.includes('senior')) return 'senior'

  return 'beginner'
}

// Map employment type
export function mapEmploymentType(type?: string): JobPost['employmentType'] {
  const typeLower = (type || '').toLowerCase()

  if (typeLower.includes('full')) return 'full-time'
  if (typeLower.includes('part')) return 'part-time'
  if (typeLower.includes('contract')) return 'contract'
  if (typeLower.includes('freelance')) return 'freelance'
  if (typeLower.includes('intern')) return 'internship'

  return 'full-time'
}

// Map work mode
export function mapWorkMode(mode?: string): JobPost['workMode'] {
  const modeLower = (mode || '').toLowerCase()

  if (modeLower.includes('remote') || modeLower.includes('work from home')) return 'remote'
  if (modeLower.includes('hybrid')) return 'hybrid'

  return 'onsite'
}
