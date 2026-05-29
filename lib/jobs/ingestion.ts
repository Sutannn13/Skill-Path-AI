/**
 * Job Ingestion Pipeline
 *
 * Stage 1: Fetch raw jobs from sources
 * Stage 2: Normalize and dedupe using raw_jobs table
 * Stage 3: AI analysis (Gemini with keyword fallback)
 */

import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { fetchJobsFromAllSources, deduplicateJobs, getEnabledAdapters } from './sources'
import { assessJobValidity } from './validity'
import { JobPost } from './types'

// Hash function for duplicate detection
export function hashJobContent(content: {
  title: string
  company: string
  location: string
  description: string
  applyUrl?: string
}): string {
  const text = `${content.title}|${content.company}|${content.location}|${content.description}|${content.applyUrl || ''}`.toLowerCase().trim()
  let hash = 0

  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }

  return Math.abs(hash).toString(36)
}

export interface IngestionResult {
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

/**
 * Stage 1: Fetch raw jobs from a single source
 */
async function fetchRawJobsFromSource(sourceSlug: string): Promise<{
  rawJobs: Array<{
    sourceSlug: string
    externalId: string
    title: string
    company: string
    location: string
    description: string
    applyUrl: string
    sourceUrl: string
    tags: string[]
    requiredSkills: string[]
    hash: string
    rawPayload: Record<string, unknown>
  }>
  error: string | null
}> {
  const supabase = createSupabaseAdminClient()

  if (!supabase) {
    return { rawJobs: [], error: 'Supabase not configured' }
  }

  const adapters = getEnabledAdapters()
  const adapter = adapters.find(a => a.slug === sourceSlug)

  if (!adapter) {
    return { rawJobs: [], error: `Source ${sourceSlug} not found or not configured` }
  }

  try {
    // Fetch jobs from the source adapter
    const fetchedJobs = await adapter.fetch()

    // Process and normalize
    const rawJobs = fetchedJobs
      .filter(job => job && job.title && job.applyUrl) // Reject jobs without URL
      .map(job => {
        const title = job.title || ''
        const company = job.company || 'Unknown'
        const location = job.location || 'Unknown'
        const description = job.description || ''
        const applyUrl = job.applyUrl || ''

        const hash = hashJobContent({
          title,
          company,
          location,
          description,
          applyUrl,
        })

        return {
          sourceSlug: job.sourceSlug || sourceSlug,
          externalId: job.externalId || job.id || '',
          title,
          company,
          location,
          description,
          applyUrl,
          sourceUrl: job.sourceUrl || applyUrl,
          tags: job.tags || [],
          requiredSkills: job.requiredSkills || [],
          hash,
          rawPayload: job.rawPayload || {},
        }
      })

    return { rawJobs, error: null }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return { rawJobs: [], error: message }
  }
}

/**
 * Stage 2: Insert raw jobs into raw_jobs table with deduplication
 */
async function insertRawJobs(rawJobs: Array<{
  sourceSlug: string
  externalId: string
  title: string
  company: string
  location: string
  description: string
  applyUrl: string
  sourceUrl: string
  tags: string[]
  requiredSkills: string[]
  hash: string
  rawPayload: Record<string, unknown>
}>): Promise<{
  insertedCount: number
  updatedCount: number
  rejectedCount: number
}> {
  const supabase = createSupabaseAdminClient()

  if (!supabase) {
    return { insertedCount: 0, updatedCount: 0, rejectedCount: rawJobs.length }
  }

  let insertedCount = 0
  let updatedCount = 0
  let rejectedCount = 0

  for (const rawJob of rawJobs) {
    // Reject jobs without valid apply URL
    if (!rawJob.applyUrl || rawJob.applyUrl === '#') {
      rejectedCount++
      continue
    }

    const { error } = await supabase
      .from('raw_jobs')
      .upsert({
        source_slug: rawJob.sourceSlug,
        external_id: rawJob.externalId,
        title: rawJob.title,
        company: rawJob.company,
        location: rawJob.location,
        description: rawJob.description,
        apply_url: rawJob.applyUrl,
        source_url: rawJob.sourceUrl,
        tags: rawJob.tags,
        required_skills: rawJob.requiredSkills,
        hash: rawJob.hash,
        raw_payload: rawJob.rawPayload,
        fetched_at: new Date().toISOString(),
      }, {
        onConflict: 'source_slug,external_id',
      })

    if (error) {
      rejectedCount++
    } else {
      insertedCount++
    }
  }

  return { insertedCount, updatedCount, rejectedCount }
}

/**
 * Stage 2b: Sync raw jobs to job_posts table
 * This runs periodically to create job_posts entries from raw_jobs
 */
export async function syncRawJobsToJobPosts(): Promise<{
  syncedCount: number
  newJobs: number
  existingJobs: number
}> {
  const supabase = createSupabaseAdminClient()

  if (!supabase) {
    return { syncedCount: 0, newJobs: 0, existingJobs: 0 }
  }

  // Get raw jobs that don't have corresponding job_posts entries
  const { data: rawJobs, error: rawError } = await supabase
    .from('raw_jobs')
    .select('*')
    .not('hash', 'in', `(
      SELECT hash FROM job_posts WHERE job_posts.hash IS NOT NULL
    )`)
    .order('fetched_at', { ascending: false })
    .limit(100)

  if (rawError || !rawJobs?.length) {
    return { syncedCount: 0, newJobs: 0, existingJobs: 0 }
  }

  let newJobs = 0
  let existingJobs = 0

  for (const raw of rawJobs) {
    // Check if job_posts already has this hash
    const { data: existing } = await supabase
      .from('job_posts')
      .select('id')
      .eq('hash', raw.hash)
      .maybeSingle()

    if (existing) {
      existingJobs++
      continue
    }

    // Assess validity
    const validity = assessJobValidity({
      id: `${raw.source_slug}-${raw.external_id}`,
      sourceSlug: raw.source_slug,
      externalId: raw.external_id,
      title: raw.title,
      company: raw.company,
      location: raw.location,
      description: raw.description,
      applyUrl: raw.apply_url,
      sourceUrl: raw.source_url,
      tags: raw.tags || [],
      requiredSkills: raw.required_skills || [],
      publishedAt: new Date().toISOString(),
      fetchedAt: new Date().toISOString(),
    })

    // Determine experience level from title/description
    const experienceLevel = determineExperienceLevel(raw.title, raw.description)
    const workMode = determineWorkMode(raw.description, raw.location || '')
    const regionType = determineRegionType(raw.location || '', '')

    // Check for duplicates using company + title + location
    const { data: dupCheck } = await supabase
      .from('job_posts')
      .select('id')
      .eq('company', raw.company)
      .eq('title', raw.title)
      .ilike('location', raw.location)
      .maybeSingle()

    if (dupCheck) {
      existingJobs++
      continue
    }

    // Insert into job_posts
    const { error: insertError } = await supabase
      .from('job_posts')
      .insert({
        id: `${raw.source_slug}-${raw.external_id}`,
        source_slug: raw.source_slug,
        external_id: raw.external_id,
        title: raw.title,
        company: raw.company,
        location: raw.location,
        description: raw.description,
        apply_url: raw.apply_url,
        source_url: raw.source_url,
        tags: raw.tags || [],
        required_skills: raw.required_skills || [],
        region_type: regionType,
        work_mode: workMode,
        employment_type: 'full-time',
        experience_level: experienceLevel,
        validity_score: validity.validityScore,
        risk_level: validity.riskLevel,
        moderation_status: validity.status,
        moderation_reasons: validity.reasons,
        raw_payload: raw.raw_payload,
        hash: raw.hash,
        ai_status: 'pending',
      })

    if (!insertError) {
      newJobs++
    }
  }

  return { syncedCount: newJobs + existingJobs, newJobs, existingJobs }
}

/**
 * Determine experience level from job title and description
 */
function determineExperienceLevel(title: string, description: string): 'internship' | 'freshgraduate' | 'junior' | 'mid' | 'senior' {
  const text = `${title} ${description}`.toLowerCase()

  const levelKeywords: Record<string, string[]> = {
    'internship': ['intern', 'internship', 'magang', 'trainee', 'student'],
    'freshgraduate': ['fresh grad', 'new grad', 'new graduate', 'entry level'],
    'junior': ['junior', 'jr', 'jr.', 'entry level', 'associate', '0-2 years'],
    'mid': ['mid', 'intermediate', '2-3 years', '3-5 years'],
    'senior': ['senior', 'sr', 'sr.', 'lead', 'principal', '5+ years', '7+ years', 'staff'],
  }

  for (const [level, keywords] of Object.entries(levelKeywords)) {
    if (keywords.some(kw => text.includes(kw))) {
      return level as 'internship' | 'freshgraduate' | 'junior' | 'mid' | 'senior'
    }
  }

  return 'junior' // Default to junior
}

/**
 * Determine work mode from description and location
 */
function determineWorkMode(description: string, location: string): 'remote' | 'hybrid' | 'onsite' {
  const text = `${description} ${location}`.toLowerCase()

  if (text.includes('100% remote') || text.includes('fully remote') ||
      text.includes('work from home') || text.includes('anywhere')) {
    return 'remote'
  }

  if (text.includes('hybrid') || text.includes('partially remote') ||
      text.includes('flexible schedule')) {
    return 'hybrid'
  }

  // Check if location is generic/empty (likely remote)
  if (!location || location === 'Remote' || location === 'Worldwide') {
    return 'remote'
  }

  return 'onsite'
}

/**
 * Determine region type from location
 */
function determineRegionType(location: string, country: string): 'indonesia' | 'international' | 'remote' {
  const text = `${location} ${country}`.toLowerCase()

  if (text.includes('remote') || text.includes('anywhere') || text.includes('worldwide')) {
    return 'remote'
  }

  const indonesiaKeywords = ['jakarta', 'bandung', 'surabaya', 'yogyakarta', 'bali', 'tangerang', 'indonesia']
  if (indonesiaKeywords.some(kw => text.includes(kw))) {
    return 'indonesia'
  }

  return 'international'
}

/**
 * Full ingestion pipeline from a single source
 */
export async function ingestJobsFromSource(sourceSlug: string): Promise<IngestionResult> {
  const startedAt = new Date().toISOString()
  const supabase = createSupabaseAdminClient()

  if (!supabase) {
    return {
      sourceSlug,
      status: 'failed',
      fetchedCount: 0,
      insertedCount: 0,
      updatedCount: 0,
      rejectedCount: 0,
      errorMessage: 'Supabase not configured',
      startedAt,
      finishedAt: new Date().toISOString(),
    }
  }

  try {
    // Stage 1: Fetch raw jobs
    const { rawJobs, error: fetchError } = await fetchRawJobsFromSource(sourceSlug)

    if (fetchError) {
      return {
        sourceSlug,
        status: 'failed',
        fetchedCount: 0,
        insertedCount: 0,
        updatedCount: 0,
        rejectedCount: 0,
        errorMessage: fetchError,
        startedAt,
        finishedAt: new Date().toISOString(),
      }
    }

    // Stage 2: Insert raw jobs
    const { insertedCount, updatedCount, rejectedCount } = await insertRawJobs(rawJobs)

    // Stage 2b: Sync to job_posts
    const syncResult = await syncRawJobsToJobPosts()

    return {
      sourceSlug,
      status: rejectedCount > rawJobs.length * 0.5 ? 'partial' : 'success',
      fetchedCount: rawJobs.length,
      insertedCount: insertedCount + syncResult.newJobs,
      updatedCount: updatedCount + syncResult.existingJobs,
      rejectedCount,
      startedAt,
      finishedAt: new Date().toISOString(),
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return {
      sourceSlug,
      status: 'failed',
      fetchedCount: 0,
      insertedCount: 0,
      updatedCount: 0,
      rejectedCount: 0,
      errorMessage: message,
      startedAt,
      finishedAt: new Date().toISOString(),
    }
  }
}

/**
 * Ingest jobs from all enabled sources
 */
export async function ingestAllSources(): Promise<{
  results: IngestionResult[]
  totalFetched: number
  totalInserted: number
  totalRejected: number
}> {
  const enabledAdapters = getEnabledAdapters()
  const results: IngestionResult[] = []
  let totalFetched = 0
  let totalInserted = 0
  let totalRejected = 0

  for (const adapter of enabledAdapters) {
    const result = await ingestJobsFromSource(adapter.slug)
    results.push(result)
    totalFetched += result.fetchedCount
    totalInserted += result.insertedCount
    totalRejected += result.rejectedCount
  }

  return { results, totalFetched, totalInserted, totalRejected }
}
