import { NextRequest, NextResponse } from 'next/server'
import { Job } from '@/types'
import { JobPost, JobFilters, TECH_STACK_MAPPING, mapRegionType } from '@/lib/jobs/types'
import { fetchJobsFromAllSources, deduplicateJobs, getSourceAttribution } from '@/lib/jobs/sources'
import { assessJobValidity, filterJobsByValidity } from '@/lib/jobs/validity'
import { MOCK_JOBS } from '@/lib/data/mock-jobs'

export const dynamic = 'force-dynamic'

// In-memory cache for fetched jobs
let jobCache: JobPost[] = []
let lastFetch: number = 0
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

// Convert JobPost (new type) to Job (existing type)
function toJob(job: JobPost): Job {
  return {
    id: job.id,
    title: job.title,
    company: job.company,
    location: job.location,
    type: job.employmentType,
    tags: job.tags,
    url: job.applyUrl,
    description: job.description,
    requiredSkills: job.requiredSkills,
    source: job.sourceSlug as 'remotive' | 'mock',
    publishedAt: job.publishedAt,
  }
}

// Filter jobs based on criteria
function filterJobs(jobs: JobPost[], filters: JobFilters): JobPost[] {
  let filtered = jobs

  // Filter by query
  if (filters.query) {
    const query = filters.query.toLowerCase()
    filtered = filtered.filter(job =>
      job.title.toLowerCase().includes(query) ||
      job.company.toLowerCase().includes(query) ||
      job.description.toLowerCase().includes(query)
    )
  }

  // Filter by region
  if (filters.region && filters.region !== 'all') {
    filtered = filtered.filter(job => job.regionType === filters.region)
  }

  // Filter by employment type
  if (filters.employmentType && filters.employmentType !== 'all') {
    filtered = filtered.filter(job => job.employmentType === filters.employmentType)
  }

  // Filter by experience level
  if (filters.experienceLevel && filters.experienceLevel !== 'all') {
    filtered = filtered.filter(job => job.experienceLevel === filters.experienceLevel)
  }

  // Filter by tech stack
  if (filters.techStack && filters.techStack !== 'all') {
    const stackSkills = TECH_STACK_MAPPING[filters.techStack] || []
    filtered = filtered.filter(job =>
      job.requiredSkills.some(skill =>
        stackSkills.some(stack => skill.toLowerCase().includes(stack.toLowerCase()))
      ) ||
      job.tags.some(tag =>
        stackSkills.some(stack => tag.toLowerCase().includes(stack.toLowerCase()))
      )
    )
  }

  // Filter by tags
  if (filters.tags && filters.tags.length > 0) {
    filtered = filtered.filter(job =>
      filters.tags!.some(tag => job.tags.includes(tag))
    )
  }

  return filtered
}

async function getLiveJobs(): Promise<JobPost[]> {
  const now = Date.now()

  // Return cached jobs if fresh
  if (jobCache.length > 0 && now - lastFetch < CACHE_TTL) {
    return jobCache
  }

  try {
    const result = await fetchJobsFromAllSources()

    if (result.jobs.length === 0) {
      return []
    }

    // Assess validity for each job
    const jobsWithValidity = result.jobs.map(job => {
      const validity = assessJobValidity(job)
      return {
        ...job,
        validityScore: validity.validityScore,
        riskLevel: validity.riskLevel,
        moderationStatus: validity.status,
        moderationReasons: validity.reasons,
      } as JobPost
    })

    // Only return approved jobs
    const approvedJobs = filterJobsByValidity(jobsWithValidity, 'approved')

    // Deduplicate and filter out jobs without id
    const uniqueJobs = deduplicateJobs(approvedJobs).filter((j): j is JobPost => Boolean(j.id))

    // Update cache
    jobCache = uniqueJobs
    lastFetch = now

    return uniqueJobs
  } catch (error) {
    console.error('Failed to fetch live jobs:', error)
    return []
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Parse filters
    const filters: JobFilters = {
      query: searchParams.get('query') || undefined,
      region: (searchParams.get('region') as JobFilters['region']) || 'all',
      employmentType: (searchParams.get('type') as JobFilters['employmentType']) || 'all',
      experienceLevel: (searchParams.get('experience') as JobFilters['experienceLevel']) || 'all',
      techStack: (searchParams.get('tech') as JobFilters['techStack']) || 'all',
      tags: searchParams.get('tags')?.split(',').filter(Boolean) || undefined,
    }

    // Get live jobs
    let liveJobs = await getLiveJobs()
    let jobs: Job[] = liveJobs.map(toJob)

    // If no live jobs, use mock data as fallback
    if (jobs.length === 0) {
      jobs = MOCK_JOBS
    }

    // Apply filters
    const filteredJobs = filterJobs(
      jobs.map(j => ({
        id: j.id,
        sourceSlug: j.source,
        externalId: j.id,
        title: j.title,
        company: j.company,
        location: j.location,
        regionType: mapRegionType(j.location),
        workMode: 'remote' as const,
        employmentType: j.type,
        experienceLevel: 'junior' as const,
        description: j.description,
        applyUrl: j.url,
        sourceUrl: j.url,
        tags: j.tags,
        requiredSkills: j.requiredSkills,
        publishedAt: j.publishedAt,
        fetchedAt: new Date().toISOString(),
        validityScore: 50,
        riskLevel: 'low' as const,
        moderationStatus: 'approved' as const,
        moderationReasons: [],
      })),
      filters
    )

    // Convert back to Job type
    const resultJobs = filteredJobs.map(fj => ({
      id: fj.id,
      title: fj.title,
      company: fj.company,
      location: fj.location,
      type: fj.employmentType,
      tags: fj.tags,
      url: fj.applyUrl,
      description: fj.description,
      requiredSkills: fj.requiredSkills,
      source: fj.sourceSlug as 'remotive' | 'mock',
      publishedAt: fj.publishedAt,
    }))

    // Get source attribution
    const attribution = getSourceAttribution()

    return NextResponse.json({
      jobs: resultJobs,
      meta: {
        total: resultJobs.length,
        filters: {
          query: filters.query || null,
          region: filters.region,
          type: filters.employmentType,
          experience: filters.experienceLevel,
          tech: filters.techStack,
        },
        source: jobs.length > 0 && jobs[0].source !== 'mock' ? 'live' : 'mock',
        attribution: attribution
          ? `Job data powered by ${attribution.label}`
          : 'Demo data',
      },
    })
  } catch (error) {
    console.error('Jobs API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch jobs', jobs: MOCK_JOBS },
      { status: 500 }
    )
  }
}
