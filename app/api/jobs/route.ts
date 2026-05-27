import { NextRequest, NextResponse } from 'next/server'
import { Job } from '@/types'
import { MOCK_JOBS } from '@/lib/data/mock-jobs'
import { getDeterministicMatchScore } from '@/lib/jobs/display'
import { fetchJobsFromAllSources, deduplicateJobs, getAdapterBySlug } from '@/lib/jobs/sources'
import { getPublicJobById, getPublicJobPosts, upsertJobPosts } from '@/lib/jobs/store'
import { assessJobValidity } from '@/lib/jobs/validity'
import { JobFilters, JobPost, TECH_STACK_MAPPING } from '@/lib/jobs/types'

export const dynamic = 'force-dynamic'

function toJob(job: JobPost): Job {
  const adapter = getAdapterBySlug(job.sourceSlug)

  return {
    id: job.id,
    title: job.title,
    company: job.company,
    location: job.location,
    type: job.employmentType,
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
    matchScore: getDeterministicMatchScore(job.id),
  }
}

function filterJobs(jobs: JobPost[], filters: JobFilters): JobPost[] {
  let filtered = jobs

  if (filters.query) {
    const query = filters.query.toLowerCase()
    filtered = filtered.filter(job =>
      job.title.toLowerCase().includes(query) ||
      job.company.toLowerCase().includes(query) ||
      job.description.toLowerCase().includes(query)
    )
  }

  if (filters.region && filters.region !== 'all') {
    filtered = filtered.filter(job => job.regionType === filters.region)
  }

  if (filters.employmentType && filters.employmentType !== 'all') {
    filtered = filtered.filter(job => job.employmentType === filters.employmentType)
  }

  if (filters.experienceLevel && filters.experienceLevel !== 'all') {
    filtered = filtered.filter(job => job.experienceLevel === filters.experienceLevel)
  }

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

  if (filters.tags && filters.tags.length > 0) {
    filtered = filtered.filter(job =>
      filters.tags!.some(tag => job.tags.includes(tag))
    )
  }

  return filtered
}

function parseFreshnessDays(value: string | null) {
  const parsed = Number(value)
  if (parsed === 7 || parsed === 30 || parsed === 90) {
    return parsed
  }

  return 90
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

function toMockJob(job: Job): Job {
  return {
    ...job,
    source: 'mock',
    sourceLabel: 'Demo Data',
    fetchedAt: new Date().toISOString(),
    validityScore: 72,
    riskLevel: 'low',
    moderationStatus: 'approved',
    matchScore: getDeterministicMatchScore(job.id),
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (id) {
      const job = await getPublicJobById(id)

      if (!job) {
        return NextResponse.json(
          { error: 'Job not found', job: null },
          { status: 404 }
        )
      }

      return NextResponse.json({
        job: toJob(job),
        meta: {
          source: 'supabase',
        },
      })
    }

    const freshnessDays = parseFreshnessDays(searchParams.get('freshnessDays'))
    const includePending = searchParams.get('includePending') !== 'false'
    const filters: JobFilters = {
      query: searchParams.get('query') || undefined,
      region: (searchParams.get('region') as JobFilters['region']) || 'all',
      employmentType: (searchParams.get('type') as JobFilters['employmentType']) || 'all',
      experienceLevel: (searchParams.get('experience') as JobFilters['experienceLevel']) || 'all',
      techStack: (searchParams.get('tech') as JobFilters['techStack']) || 'all',
      tags: searchParams.get('tags')?.split(',').filter(Boolean) || undefined,
    }

    let { jobs: liveJobs, source } = await getPublicJobPosts({
      freshnessDays,
      includePending,
      limit: 200,
    })

    if (source === 'memory' && liveJobs.length === 0) {
      await loadDemoJobsIntoMemory()
      const reloaded = await getPublicJobPosts({
        freshnessDays,
        includePending,
        limit: 200,
      })
      liveJobs = reloaded.jobs
      source = reloaded.source
    }

    const filteredJobs = filterJobs(liveJobs, filters)
    let resultJobs = filteredJobs.map(toJob)
    let responseSource: 'supabase' | 'memory' | 'mock' = source

    if (resultJobs.length === 0 && source === 'memory') {
      resultJobs = MOCK_JOBS.map(toMockJob)
      responseSource = 'mock'
    }

    return NextResponse.json({
      jobs: resultJobs,
      meta: {
        total: resultJobs.length,
        source: responseSource,
        freshnessDays,
        includePending,
        filters: {
          query: filters.query || null,
          region: filters.region,
          type: filters.employmentType,
          experience: filters.experienceLevel,
          tech: filters.techStack,
        },
      },
    })
  } catch (error) {
    console.error('Jobs API error:', error instanceof Error ? error.message : 'Unknown error')
    return NextResponse.json(
      {
        error: 'Failed to fetch jobs',
        jobs: MOCK_JOBS.map(toMockJob),
        meta: {
          source: 'mock',
          fallbackReason: 'jobs_api_error',
        },
      },
      { status: 500 }
    )
  }
}
