import { NextRequest, NextResponse } from 'next/server'
import { Job } from '@/types'
import { MOCK_JOBS } from '@/lib/data/mock-jobs'
import { fetchJobsFromAllSources, deduplicateJobs, getAdapterBySlug } from '@/lib/jobs/sources'
import { indonesiaSampleAdapter } from '@/lib/jobs/adapters/indonesia-sample'
import { getPublicJobById, getPublicJobPosts, upsertJobPosts } from '@/lib/jobs/store'
import { assessJobValidity } from '@/lib/jobs/validity'
import { JobFilters, JobPost, TECH_STACK_MAPPING } from '@/lib/jobs/types'
import { isSupabaseAdminConfigured } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

// Pagination constants
const DEFAULT_PAGE = 1
const DEFAULT_LIMIT = 10
const MAX_LIMIT = 50

// Valid filter values (experienceLevel includes 'freshgraduate' for AI classification)
const VALID_LEVELS = ['all', 'intern', 'freshgraduate', 'junior', 'mid', 'senior', 'beginner']
const VALID_EMPLOYMENT_TYPES = ['all', 'internship', 'full-time', 'part-time', 'contract', 'freelance']
const VALID_WORK_MODES = ['all', 'remote', 'hybrid', 'onsite']
const VALID_COUNTRY_SCOPES = ['all', 'indonesia', 'international']
const VALID_CATEGORIES = [
  'Software Development',
  'Frontend Development',
  'Backend Development',
  'Fullstack Development',
  'Mobile Development',
  'Data & AI',
  'DevOps & Cloud',
  'Cybersecurity',
  'QA & Testing',
  'UI/UX Design',
  'Product & Business',
  'IT Support & Infrastructure',
  'Internship & Fresh Graduate',
]

// Valid roles
const VALID_ROLES = [
  'Frontend Developer',
  'Backend Developer',
  'Fullstack Developer',
  'Software Engineer',
  'Web Developer',
  'React Developer',
  'Next.js Developer',
  'Node.js Developer',
  'Laravel Developer',
  'Java Developer',
  'Python Developer',
  'Golang Developer',
  'Mobile Developer',
  'Flutter Developer',
  'Android Developer',
  'iOS Developer',
  'QA Engineer',
  'Automation Tester',
  'Data Analyst',
  'Data Scientist',
  'Data Engineer',
  'Machine Learning Engineer',
  'AI Engineer',
  'DevOps Engineer',
  'Cloud Engineer',
  'Cybersecurity Analyst',
  'Security Engineer',
  'UI/UX Designer',
  'Product Manager',
  'Business Analyst',
  'IT Support',
  'System Administrator',
  'Network Engineer',
  'Junior Developer',
  'Fresh Graduate Program',
  'Frontend Intern',
  'Backend Intern',
  'Data Analyst Intern',
  'QA Intern',
  'UI/UX Intern',
  'IT Intern',
]

interface PaginationParams {
  page: number
  limit: number
  totalJobs: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

interface ExtendedFilters extends JobFilters {
  role?: string
  category?: string
  countryScope?: string
  workMode?: string
  salaryMin?: number
  salaryMax?: string
  sortBy?: 'newest' | 'best_match' | 'highest_salary' | 'beginner_friendly'
  beginnerFriendly?: boolean
  minMatchScore?: number
}

function toJob(job: JobPost): Job {
  const adapter = getAdapterBySlug(job.sourceSlug)

  // Calculate match score: use AI score if available, otherwise deterministic
  let matchScore = 75
  if (typeof job.ai_match_score === 'number' && job.ai_match_score > 0) {
    matchScore = job.ai_match_score
  } else {
    // Fallback to deterministic score based on job ID hash
    const hash = job.id.split('').reduce((acc, c) => ((acc << 5) - acc) + c.charCodeAt(0), 0)
    matchScore = 70 + (Math.abs(hash) % 30)
  }

  return {
    id: job.id,
    title: job.title,
    company: job.company,
    location: job.location,
    workMode: job.workMode as Job['workMode'] || 'remote',
    type: job.employmentType as Job['type'],
    tags: job.tags,
    url: job.applyUrl,
    sourceUrl: job.sourceUrl,
    description: job.description,
    requiredSkills: job.requiredSkills,
    source: job.sourceSlug,
    sourceLabel: adapter?.attributionLabel ?? job.sourceSlug,
    publishedAt: job.publishedAt,
    fetchedAt: job.fetchedAt,
    validityScore: job.validityScore,
    riskLevel: job.riskLevel,
    moderationStatus: job.moderationStatus,
    moderationReasons: job.moderationReasons,
    matchScore: matchScore,
  }
}

function filterJobs(jobs: JobPost[], filters: ExtendedFilters): JobPost[] {
  let filtered = jobs

  // Keyword search
  if (filters.query) {
    const query = filters.query.toLowerCase()
    filtered = filtered.filter(job =>
      [
        job.title,
        job.company,
        job.location,
        job.country,
        job.regionType,
        job.workMode,
        job.employmentType,
        job.experienceLevel,
        job.description,
        job.sourceSlug,
        job.category,
        job.role,
        ...(job.tags || []),
        ...(job.requiredSkills || []),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(query)
    )
  }

  // Role filter
  if (filters.role && filters.role !== 'all') {
    const roleLower = filters.role.toLowerCase()
    filtered = filtered.filter(job => {
      const jobRole = (job.role || '').toLowerCase()
      return jobRole.includes(roleLower) || roleLower.includes(jobRole)
    })
  }

  // Category filter
  if (filters.category && filters.category !== 'all' && VALID_CATEGORIES.includes(filters.category)) {
    filtered = filtered.filter(job => job.category === filters.category)
  }

  // Country scope filter
  if (filters.countryScope && filters.countryScope !== 'all' && VALID_COUNTRY_SCOPES.includes(filters.countryScope)) {
    filtered = filtered.filter(job => {
      if (filters.countryScope === 'indonesia') {
        return job.regionType === 'indonesia' || job.regionType === 'remote'
      }
      return job.regionType === 'international'
    })
  } else if (filters.region && filters.region !== 'all') {
    // Legacy region filter
    filtered = filtered.filter(job => job.regionType === filters.region)
  }

  // Work mode filter
  if (filters.workMode && filters.workMode !== 'all' && VALID_WORK_MODES.includes(filters.workMode)) {
    filtered = filtered.filter(job => job.workMode === filters.workMode)
  }

  // Employment type filter (supports both 'type' and 'employmentType' params)
  if (filters.employmentType && filters.employmentType !== 'all' && VALID_EMPLOYMENT_TYPES.includes(filters.employmentType)) {
    const normalizedType = filters.employmentType === 'full-time' ? 'full-time' : filters.employmentType
    filtered = filtered.filter(job => job.employmentType === normalizedType)
  }

  // Level filter. The UI sends aliases ('intern', 'freshgraduate') that do not
  // map 1:1 to JobPost.experienceLevel, so expand each requested level to the
  // set of stored values (and text signals) it should match.
  if (filters.experienceLevel && filters.experienceLevel !== 'all' && VALID_LEVELS.includes(filters.experienceLevel)) {
    const requested = filters.experienceLevel.toLowerCase()
    const levelAliases: Record<string, string[]> = {
      intern: ['internship'],
      internship: ['internship'],
      freshgraduate: ['internship', 'junior', 'beginner'],
      beginner: ['beginner', 'junior', 'internship'],
      junior: ['junior', 'beginner'],
      mid: ['mid'],
      senior: ['senior'],
    }
    const accepted = levelAliases[requested] ?? [requested]
    filtered = filtered.filter(job => {
      const level = (job.experienceLevel || 'junior').toLowerCase()
      if (accepted.includes(level)) return true
      // Fresh-graduate friendly fallback via AI flags / text signals.
      if (requested === 'freshgraduate') {
        return job.ai_fresh_graduate_friendly === true || job.ai_beginner_friendly === true
      }
      return false
    })
  }

  // Tech stack filter
  if (filters.techStack && filters.techStack !== 'all') {
    const stackSkills = TECH_STACK_MAPPING[filters.techStack] || []
    filtered = filtered.filter(job =>
      (job.requiredSkills || []).some(skill =>
        stackSkills.some(stack => skill.toLowerCase().includes(stack.toLowerCase()))
      ) ||
      (job.tags || []).some(tag =>
        stackSkills.some(stack => tag.toLowerCase().includes(stack.toLowerCase()))
      )
    )
  }

  // Salary range filter
  if (filters.salaryMin !== undefined && filters.salaryMin > 0) {
    filtered = filtered.filter(job =>
      (job.salaryMin === null || job.salaryMin === undefined) ||
      job.salaryMin >= filters.salaryMin!
    )
  }
  if (filters.salaryMax) {
    const max = parseInt(filters.salaryMax)
    if (!isNaN(max)) {
      filtered = filtered.filter(job =>
        (job.salaryMax === null || job.salaryMax === undefined) ||
        job.salaryMax <= max
      )
    }
  }

  // Beginner friendly filter
  if (filters.beginnerFriendly === true) {
    filtered = filtered.filter(job => {
      const level = job.experienceLevel || 'junior'
      return (
        job.ai_beginner_friendly === true ||
        job.ai_fresh_graduate_friendly === true ||
        level === 'internship' ||
        level === 'beginner' ||
        level === 'junior'
      )
    })
  }

  // Minimum AI match score filter
  if (filters.minMatchScore !== undefined && filters.minMatchScore > 0) {
    filtered = filtered.filter(job => {
      const score = job.ai_match_score ?? 0
      return score >= filters.minMatchScore!
    })
  }

  // Source filter
  const sourceParam = filters.query?.match(/source:(\w+)/gi)
  if (sourceParam) {
    const sourceSlug = sourceParam[0].replace('source:', '')
    filtered = filtered.filter(job => job.sourceSlug === sourceSlug)
  }

  return filtered
}

function sortJobs(jobs: JobPost[], sortBy: string): JobPost[] {
  const sorted = [...jobs]

  switch (sortBy) {
    case 'newest':
      return sorted.sort((a, b) => {
        const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0
        const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0
        return dateB - dateA // Newest first
      })

    case 'best_match':
      return sorted.sort((a, b) => {
        const scoreA = a.ai_match_score ?? 50
        const scoreB = b.ai_match_score ?? 50
        return scoreB - scoreA
      })

    case 'highest_salary':
      return sorted.sort((a, b) => {
        const salaryA = a.salaryMin ?? 0
        const salaryB = b.salaryMin ?? 0
        return salaryB - salaryA
      })

    case 'beginner_friendly':
      return sorted.sort((a, b) => {
        const aBeginner = (a.ai_beginner_friendly || a.experienceLevel === 'internship') ? 1 : 0
        const bBeginner = (b.ai_beginner_friendly || b.experienceLevel === 'internship') ? 1 : 0
        return bBeginner - aBeginner
      })

    default:
      return sorted
  }
}

function paginateJobs(jobs: JobPost[], page: number, limit: number): {
  jobs: JobPost[]
  pagination: PaginationParams
} {
  const totalJobs = jobs.length
  const totalPages = Math.ceil(totalJobs / limit)
  const startIndex = (page - 1) * limit
  const endIndex = startIndex + limit

  return {
    jobs: jobs.slice(startIndex, endIndex),
    pagination: {
      page,
      limit,
      totalJobs,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  }
}

function parseFreshnessDays(value: string | null) {
  if (value === 'all' || value === '180') {
    return 180
  }

  const parsed = Number(value)
  if (parsed === 7 || parsed === 30 || parsed === 90) {
    return parsed
  }

  return 90
}

function isJobsSchemaMismatchError(message: string) {
  const normalized = message.toLowerCase()
  return [
    'column job_posts.last_seen_at does not exist',
    'relation "job_posts" does not exist',
    'relation "job_ingestion_runs" does not exist',
    'relation "job_sources" does not exist',
    'column ai_job_analyses.suggested_skills does not exist',
    'column ai_job_analyses.comparison_notes does not exist',
  ].some((fragment) => normalized.includes(fragment))
}

async function loadDemoJobsIntoMemory() {
  const result = await fetchJobsFromAllSources()
  const jobsWithValidity = deduplicateJobs(result.jobs).map((job) => {
    const validity = assessJobValidity(job)
    return {
      ...job,
      validityScore: validity.validityScore,
      riskLevel: validity.riskLevel,
      moderationStatus: validity.status,
      moderationReasons: validity.reasons,
    } as JobPost
  })

  await upsertJobPosts(jobsWithValidity)
}

async function getCuratedIndonesiaJobs() {
  const jobs = await indonesiaSampleAdapter.fetch()

  return deduplicateJobs(jobs).map((job) => {
    const validity = assessJobValidity(job)
    return {
      ...job,
      validityScore: validity.validityScore,
      riskLevel: validity.riskLevel,
      moderationStatus: validity.status,
      moderationReasons: validity.reasons,
    } as JobPost
  })
}

async function addCuratedIndonesiaTopUp(jobs: JobPost[]) {
  const MIN_CURATED_JOB_COUNT = 24
  if (jobs.length >= MIN_CURATED_JOB_COUNT) {
    return jobs
  }

  const existingIds = new Set(jobs.map((job) => job.id))
  const curatedJobs = await getCuratedIndonesiaJobs()
  const missingCuratedJobs = curatedJobs.filter((job) => !existingIds.has(job.id))

  return [...jobs, ...missingCuratedJobs]
}

function toMockJob(job: Job): Job {
  return {
    ...job,
    source: 'mock',
    sourceLabel: 'Demo Data',
    fetchedAt: new Date().toISOString(),
    validityScore: 72,
    riskLevel: 'low',
    moderationStatus: 'approved',
    matchScore: job.matchScore ?? 75,
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabaseAdminConfigured = isSupabaseAdminConfigured()
    const { searchParams } = new URL(request.url)

    // Pagination params
    const page = Math.max(1, parseInt(searchParams.get('page') || String(DEFAULT_PAGE)))
    const limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(searchParams.get('limit') || String(DEFAULT_LIMIT))))

    // Get job by ID (single job fetch)
    const id = searchParams.get('id')

    if (id) {
      const job = await getPublicJobById(id)
      const fallbackJob = job ??
        (await getCuratedIndonesiaJobs()).find((candidate) => candidate.id === id) ??
        null

      if (!fallbackJob) {
        return NextResponse.json(
          { error: 'Job not found', job: null },
          { status: 404 }
        )
      }

      return NextResponse.json({
        job: toJob(fallbackJob),
        meta: {
          source: job ? 'supabase' : 'curated',
        },
      })
    }

    // Freshness filter
    const freshnessDays = parseFreshnessDays(searchParams.get('freshnessDays'))
    const includePending = searchParams.get('includePending') !== 'false'

    // Parse filters
    const filters: ExtendedFilters = {
      query: searchParams.get('keyword') || searchParams.get('query') || undefined,
      region: (searchParams.get('region') as JobFilters['region']) || 'all',
      role: searchParams.get('role') || 'all',
      category: searchParams.get('category') || 'all',
      countryScope: searchParams.get('countryScope') || 'all',
      workMode: (searchParams.get('workMode') as ExtendedFilters['workMode']) || (searchParams.get('countryScope') === 'remote' ? 'remote' : 'all'),
      employmentType: (searchParams.get('type') || searchParams.get('employmentType') || 'all') as ExtendedFilters['employmentType'],
      experienceLevel: (searchParams.get('experience') || searchParams.get('level') || 'all') as ExtendedFilters['experienceLevel'],
      techStack: (searchParams.get('tech') as ExtendedFilters['techStack']) || 'all',
      salaryMin: searchParams.get('salaryMin') ? parseInt(searchParams.get('salaryMin')!) : undefined,
      salaryMax: searchParams.get('salaryMax') || undefined,
      tags: searchParams.get('tags')?.split(',').filter(Boolean) || undefined,
      beginnerFriendly: searchParams.get('beginnerFriendly') === 'true' ? true : undefined,
      minMatchScore: searchParams.get('minMatchScore') ? parseInt(searchParams.get('minMatchScore')!) : undefined,
    }

    // Sort parameter
    const sortBy = searchParams.get('sort') || 'newest'

    // Fetch jobs
    let { jobs: liveJobs, source } = await getPublicJobPosts({
      freshnessDays,
      includePending,
      limit: 200,
    })

    if (!supabaseAdminConfigured && source === 'memory' && liveJobs.length === 0) {
      await loadDemoJobsIntoMemory()
      const reloaded = await getPublicJobPosts({
        freshnessDays,
        includePending,
        limit: 200,
      })
      liveJobs = reloaded.jobs
      source = reloaded.source
    }

    const jobsWithTopUp = await addCuratedIndonesiaTopUp(liveJobs)
    const filteredJobs = filterJobs(jobsWithTopUp, filters)
    const sortedJobs = sortJobs(filteredJobs, sortBy)
    const paginatedResult = paginateJobs(sortedJobs, page, limit)

    let resultJobs = paginatedResult.jobs.map(j => toJob(j))
    let responseSource: 'supabase' | 'memory' | 'mock' | 'mixed' = jobsWithTopUp.length > liveJobs.length ? 'mixed' : source

    if (!supabaseAdminConfigured && resultJobs.length === 0 && source === 'memory') {
      resultJobs = MOCK_JOBS.slice(0, limit).map(toMockJob)
      responseSource = 'mock'
    }

    return NextResponse.json({
      jobs: resultJobs,
      page: paginatedResult.pagination.page,
      limit: paginatedResult.pagination.limit,
      totalJobs: paginatedResult.pagination.totalJobs,
      totalPages: paginatedResult.pagination.totalPages,
      hasNextPage: paginatedResult.pagination.hasNextPage,
      hasPrevPage: paginatedResult.pagination.hasPrevPage,
      meta: {
        source: responseSource,
        freshnessDays,
        includePending,
        sort: sortBy,
        filters: {
          query: filters.query || null,
          region: filters.region,
          role: filters.role,
          category: filters.category,
          countryScope: filters.countryScope,
          workMode: filters.workMode,
          employmentType: filters.employmentType,
          experienceLevel: filters.experienceLevel,
          tech: filters.techStack,
        },
      },
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const schemaMismatch = isJobsSchemaMismatchError(errorMessage)

    if (process.env.NODE_ENV === 'development') {
      console.error('[Jobs API] request failed:', errorMessage)
    }

    return NextResponse.json(
      {
        error: schemaMismatch
          ? 'Jobs persistence schema is not ready in Supabase. Apply migrations 005_roadmap_persistence.sql and 006_learning_assessment_system.sql and 007_job_radar_system.sql, then retry.'
          : 'Failed to fetch jobs',
      },
      { status: schemaMismatch ? 503 : 500 }
    )
  }
}
