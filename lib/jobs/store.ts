import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { JobIngestionResult, JobPost, JobSourceAdapter } from './types'

export const JOB_VISIBILITY_DAYS = 90
export const JOB_EXPIRATION_DAYS = 180

let jobStore: Map<string, JobPost> = new Map()
let lastSyncTime: string | null = null
let lastSyncResult: JobIngestionResult | null = null

interface JobPostRow {
  id: string
  source_slug: string
  external_id: string
  title: string
  company: string | null
  company_domain: string | null
  location: string | null
  country: string | null
  region_type: JobPost['regionType'] | null
  work_mode: JobPost['workMode'] | null
  employment_type: JobPost['employmentType'] | null
  experience_level: JobPost['experienceLevel'] | null
  description: string | null
  apply_url: string | null
  source_url: string | null
  tags: string[] | null
  required_skills: string[] | null
  salary_min: number | null
  salary_max: number | null
  currency: string | null
  published_at: string | null
  fetched_at: string | null
  expires_at: string | null
  last_seen_at: string | null
  validity_score: number | null
  risk_level: JobPost['riskLevel'] | null
  moderation_status: JobPost['moderationStatus'] | null
  moderation_reasons: string[] | null
  raw_payload: Record<string, unknown> | null
}

interface JobSourceRow {
  name: string
  slug: string
  type: string
  region: string
  base_url: string
  attribution_label: string
  attribution_url: string
  enabled: boolean
}

export interface JobPersistenceResult {
  usedSupabase: boolean
  insertedCount: number
  updatedCount: number
}

function isJobPost(value: Partial<JobPost>): value is JobPost {
  return Boolean(
    value.id &&
      value.sourceSlug &&
      value.externalId &&
      value.title &&
      value.company &&
      value.location &&
      value.description &&
      value.applyUrl &&
      value.sourceUrl &&
      value.publishedAt &&
      value.fetchedAt
  )
}

function toNullableIso(value?: string | null) {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date.toISOString()
}

function getFreshnessDate(job: Pick<JobPost, 'publishedAt' | 'fetchedAt'>) {
  const publishedAt = toNullableIso(job.publishedAt)
  if (publishedAt) return new Date(publishedAt)

  const fetchedAt = toNullableIso(job.fetchedAt)
  return fetchedAt ? new Date(fetchedAt) : null
}

export function isJobFresh(job: Pick<JobPost, 'publishedAt' | 'fetchedAt'>, days = JOB_VISIBILITY_DAYS) {
  const freshnessDate = getFreshnessDate(job)
  if (!freshnessDate) return false

  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - days)

  return freshnessDate >= cutoff
}

export function isJobExpired(job: Pick<JobPost, 'publishedAt' | 'fetchedAt'>) {
  return !isJobFresh(job, JOB_EXPIRATION_DAYS)
}

function toJobPostRow(job: JobPost): JobPostRow {
  const now = new Date().toISOString()

  return {
    id: job.id,
    source_slug: job.sourceSlug,
    external_id: job.externalId,
    title: job.title,
    company: job.company,
    company_domain: job.companyDomain ?? null,
    location: job.location,
    country: job.country ?? null,
    region_type: job.regionType,
    work_mode: job.workMode,
    employment_type: job.employmentType,
    experience_level: job.experienceLevel,
    description: job.description,
    apply_url: job.applyUrl,
    source_url: job.sourceUrl,
    tags: job.tags,
    required_skills: job.requiredSkills,
    salary_min: job.salaryMin ?? null,
    salary_max: job.salaryMax ?? null,
    currency: job.currency ?? null,
    published_at: toNullableIso(job.publishedAt),
    fetched_at: toNullableIso(job.fetchedAt) ?? now,
    expires_at: toNullableIso(job.expiresAt),
    last_seen_at: now,
    validity_score: job.validityScore,
    risk_level: job.riskLevel,
    moderation_status: job.moderationStatus,
    moderation_reasons: job.moderationReasons,
    raw_payload: job.rawPayload ?? null,
  }
}

function fromJobPostRow(row: JobPostRow): JobPost {
  return {
    id: row.id,
    sourceSlug: row.source_slug,
    externalId: row.external_id,
    title: row.title,
    company: row.company ?? 'Unknown company',
    companyDomain: row.company_domain ?? undefined,
    location: row.location ?? 'Unknown location',
    country: row.country ?? undefined,
    regionType: row.region_type ?? 'international',
    workMode: row.work_mode ?? 'remote',
    employmentType: row.employment_type ?? 'full-time',
    experienceLevel: row.experience_level ?? 'junior',
    description: row.description ?? '',
    applyUrl: row.apply_url ?? row.source_url ?? '#',
    sourceUrl: row.source_url ?? row.apply_url ?? '#',
    tags: row.tags ?? [],
    requiredSkills: row.required_skills ?? [],
    salaryMin: row.salary_min ?? undefined,
    salaryMax: row.salary_max ?? undefined,
    currency: row.currency ?? undefined,
    publishedAt: row.published_at ?? '',
    fetchedAt: row.fetched_at ?? new Date().toISOString(),
    expiresAt: row.expires_at ?? undefined,
    validityScore: row.validity_score ?? 50,
    riskLevel: row.risk_level ?? 'medium',
    moderationStatus: row.moderation_status ?? 'pending_review',
    moderationReasons: row.moderation_reasons ?? [],
    rawPayload: row.raw_payload ?? undefined,
  }
}

function isPubliclyVisible(job: JobPost, freshnessDays = JOB_VISIBILITY_DAYS) {
  return (
    (job.moderationStatus === 'approved' || job.moderationStatus === 'pending_review') &&
    !isJobExpired(job) &&
    isJobFresh(job, freshnessDays)
  )
}

export function getStoredJobs(): JobPost[] {
  return Array.from(jobStore.values())
}

export function getStoredJobById(id: string): JobPost | undefined {
  return jobStore.get(id)
}

export function getStoredJobsBySource(sourceSlug: string): JobPost[] {
  return Array.from(jobStore.values()).filter((job) => job.sourceSlug === sourceSlug)
}

export function setStoredJob(job: JobPost): void {
  jobStore.set(job.id, job)
}

export function getStoredJobCount(): number {
  return jobStore.size
}

export function getLastSyncInfo(): { time: string | null; result: JobIngestionResult | null } {
  return { time: lastSyncTime, result: lastSyncResult }
}

export function setLastSyncInfo(time: string, result: JobIngestionResult): void {
  lastSyncTime = time
  lastSyncResult = result
}

export function getJobStore(): Map<string, JobPost> {
  return jobStore
}

export function setJobStore(jobs: JobPost[]): void {
  jobStore = new Map(jobs.map((job) => [job.id, job]))
}

export function clearJobStore(): void {
  jobStore.clear()
}

export async function upsertJobSources(adapters: JobSourceAdapter[]): Promise<boolean> {
  const supabase = createSupabaseAdminClient()

  if (!supabase) {
    return false
  }

  const rows: JobSourceRow[] = adapters.map((adapter) => ({
    name: adapter.name,
    slug: adapter.slug,
    type: adapter.type,
    region: adapter.region,
    base_url: adapter.baseUrl,
    attribution_label: adapter.attributionLabel,
    attribution_url: adapter.attributionUrl,
    enabled: adapter.isConfigured(),
  }))

  const { error } = await supabase
    .from('job_sources')
    .upsert(rows, { onConflict: 'slug' })

  if (error) {
    throw new Error(`Failed to upsert job sources: ${error.message}`)
  }

  return true
}

export async function upsertJobPosts(jobs: Partial<JobPost>[]): Promise<JobPersistenceResult> {
  const validJobs = jobs.filter(isJobPost)
  const supabase = createSupabaseAdminClient()

  if (!supabase) {
    validJobs.forEach(setStoredJob)
    return {
      usedSupabase: false,
      insertedCount: validJobs.length,
      updatedCount: 0,
    }
  }

  if (validJobs.length === 0) {
    return {
      usedSupabase: true,
      insertedCount: 0,
      updatedCount: 0,
    }
  }

  const ids = validJobs.map((job) => job.id)
  const { data: existingRows, error: existingError } = await supabase
    .from('job_posts')
    .select('id')
    .in('id', ids)

  if (existingError) {
    throw new Error(`Failed to check existing job posts: ${existingError.message}`)
  }

  const existingIds = new Set((existingRows ?? []).map((row: { id: string }) => row.id))
  const rows = validJobs.map(toJobPostRow)

  const { error } = await supabase
    .from('job_posts')
    .upsert(rows, { onConflict: 'id' })

  if (error) {
    throw new Error(`Failed to upsert job posts: ${error.message}`)
  }

  return {
    usedSupabase: true,
    insertedCount: validJobs.filter((job) => !existingIds.has(job.id)).length,
    updatedCount: validJobs.filter((job) => existingIds.has(job.id)).length,
  }
}

export async function recordJobIngestionRun(result: JobIngestionResult): Promise<boolean> {
  const supabase = createSupabaseAdminClient()

  if (!supabase) {
    setLastSyncInfo(result.finishedAt, result)
    return false
  }

  const { error } = await supabase
    .from('job_ingestion_runs')
    .insert({
      source_slug: result.sourceSlug,
      status: result.status,
      fetched_count: result.fetchedCount,
      inserted_count: result.insertedCount,
      updated_count: result.updatedCount,
      rejected_count: result.rejectedCount,
      error_message: result.errorMessage ?? null,
      started_at: result.startedAt,
      finished_at: result.finishedAt,
    })

  if (error) {
    throw new Error(`Failed to insert job ingestion run: ${error.message}`)
  }

  return true
}

export async function markExpiredJobPosts(): Promise<number> {
  const supabase = createSupabaseAdminClient()

  if (!supabase) {
    return 0
  }

  const { data, error } = await supabase
    .from('job_posts')
    .select('id, source_slug, external_id, title, company, company_domain, location, country, region_type, work_mode, employment_type, experience_level, description, apply_url, source_url, tags, required_skills, salary_min, salary_max, currency, published_at, fetched_at, expires_at, last_seen_at, validity_score, risk_level, moderation_status, moderation_reasons, raw_payload')
    .neq('moderation_status', 'expired')
    .limit(500)

  if (error) {
    throw new Error(`Failed to load expirable job posts: ${error.message}`)
  }

  const expiredIds = ((data ?? []) as JobPostRow[])
    .map(fromJobPostRow)
    .filter(isJobExpired)
    .map((job) => job.id)

  if (expiredIds.length === 0) {
    return 0
  }

  const { error: updateError } = await supabase
    .from('job_posts')
    .update({
      moderation_status: 'expired',
      expires_at: new Date().toISOString(),
      moderation_reasons: ['Expired because the job is older than 180 days'],
    })
    .in('id', expiredIds)

  if (updateError) {
    throw new Error(`Failed to mark expired job posts: ${updateError.message}`)
  }

  return expiredIds.length
}

export async function getPublicJobPosts(options?: {
  freshnessDays?: number
  limit?: number
  includePending?: boolean
}): Promise<{ jobs: JobPost[]; source: 'supabase' | 'memory' }> {
  const freshnessDays = options?.freshnessDays ?? JOB_VISIBILITY_DAYS
  const limit = Math.min(Math.max(options?.limit ?? 100, 1), 200)
  const includePending = options?.includePending ?? true
  const supabase = createSupabaseAdminClient()

  if (supabase) {
    const statuses = includePending ? ['approved', 'pending_review'] : ['approved']
    const { data, error } = await supabase
      .from('job_posts')
      .select('id, source_slug, external_id, title, company, company_domain, location, country, region_type, work_mode, employment_type, experience_level, description, apply_url, source_url, tags, required_skills, salary_min, salary_max, currency, published_at, fetched_at, expires_at, last_seen_at, validity_score, risk_level, moderation_status, moderation_reasons, raw_payload')
      .in('moderation_status', statuses)
      .limit(500)

    if (error) {
      throw new Error(`Failed to load job posts: ${error.message}`)
    }

    const jobs = ((data ?? []) as JobPostRow[])
      .map(fromJobPostRow)
      .filter((job) => isPubliclyVisible(job, freshnessDays))
      .sort((a, b) => {
        const bDate = getFreshnessDate(b)?.getTime() ?? 0
        const aDate = getFreshnessDate(a)?.getTime() ?? 0
        return bDate - aDate
      })
      .slice(0, limit)

    return { jobs, source: 'supabase' }
  }

  const jobs = getStoredJobs()
    .filter((job) => isPubliclyVisible(job, freshnessDays))
    .slice(0, limit)

  return { jobs, source: 'memory' }
}

export async function getPublicJobById(id: string): Promise<JobPost | null> {
  const supabase = createSupabaseAdminClient()

  if (supabase) {
    const { data, error } = await supabase
      .from('job_posts')
      .select('id, source_slug, external_id, title, company, company_domain, location, country, region_type, work_mode, employment_type, experience_level, description, apply_url, source_url, tags, required_skills, salary_min, salary_max, currency, published_at, fetched_at, expires_at, last_seen_at, validity_score, risk_level, moderation_status, moderation_reasons, raw_payload')
      .eq('id', id)
      .maybeSingle()

    if (error) {
      throw new Error(`Failed to load job post: ${error.message}`)
    }

    if (!data) {
      return null
    }

    const job = fromJobPostRow(data as JobPostRow)
    return isPubliclyVisible(job, JOB_VISIBILITY_DAYS) ? job : null
  }

  const job = getStoredJobById(id)
  return job && isPubliclyVisible(job, JOB_VISIBILITY_DAYS) ? job : null
}

export async function getPersistedJobCount(): Promise<{ count: number; source: 'supabase' | 'memory' }> {
  const supabase = createSupabaseAdminClient()

  if (supabase) {
    const { count, error } = await supabase
      .from('job_posts')
      .select('id', { count: 'exact', head: true })

    if (error) {
      throw new Error(`Failed to count job posts: ${error.message}`)
    }

    return { count: count ?? 0, source: 'supabase' }
  }

  return { count: getStoredJobCount(), source: 'memory' }
}

export function cleanupRejectedJobs(daysOld: number): void {
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - daysOld)

  const entries = Array.from(jobStore.entries())
  for (const [id, job] of entries) {
    if (
      job.moderationStatus === 'rejected' &&
      new Date(job.fetchedAt) < cutoffDate
    ) {
      jobStore.delete(id)
    }
  }
}
