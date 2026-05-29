/**
 * Gemini Job Analyzer Service
 *
 * Handles the AI analysis pipeline:
 * 1. Fetch jobs that need analysis (status = 'pending')
 * 2. Call Gemini for classification
 * 3. Use keyword fallback if Gemini fails
 * 4. Save results to job_posts and ai_job_analyses tables
 */

import { classifyJob, JobClassificationResult } from './ai-classification'
import { JobPost } from './types'

// Import Supabase client
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

export interface AnalysisResult {
  jobId: string
  status: 'analyzed' | 'fallback' | 'failed'
  classification: JobClassificationResult | null
  error: string | null
  quotaExceeded: boolean
}

/**
 * Analyze a single job with Gemini or keyword fallback
 */
export async function analyzeJob(job: JobPost): Promise<AnalysisResult> {
  const supabase = createSupabaseAdminClient()

  if (!supabase) {
    // No database - return mock result for testing
    return {
      jobId: job.id,
      status: 'failed',
      classification: null,
      error: 'Supabase not configured',
      quotaExceeded: false,
    }
  }

  try {
    // Classify the job (Gemini first, then fallback)
    const { primary: classification, isFallback, error } = await classifyJob(job)

    // Determine the status based on classification method
    const status = isFallback ? 'fallback' : 'analyzed'

    // Update the job_posts table with AI analysis results
    const { error: updateError } = await supabase
      .from('job_posts')
      .update({
        category: classification.category,
        role: classification.role,
        ai_status: status,
        ai_confidence: classification.confidence,
        ai_match_score: classification.matchScore,
        ai_match_reason: classification.matchReason,
        ai_summary: classification.summary,
        ai_skill_gaps: classification.skillGaps,
        ai_red_flags: classification.redFlags,
        ai_beginner_friendly: classification.isBeginnerFriendly,
        ai_fresh_graduate_friendly: classification.isFreshGraduateFriendly,
        ai_tech_stacks: classification.techStacks,
        ai_analyzed_at: new Date().toISOString(),
      })
      .eq('id', job.id)

    if (updateError) {
      console.error(`Failed to update job ${job.id}:`, updateError)
    }

    // Save detailed analysis to ai_job_analyses table
    const { error: analysisError } = await supabase
      .from('ai_job_analyses')
      .upsert({
        job_id: job.id,
        model: 'gemini-2.0-flash',
        normalized_title: classification.normalizedTitle,
        category: classification.category,
        role: classification.role,
        level: classification.level,
        work_mode: classification.workMode,
        employment_type: classification.employmentType,
        country_scope: classification.countryScope,
        tech_stacks: classification.techStacks,
        requirements: classification.requirements,
        summary: classification.summary,
        is_beginner_friendly: classification.isBeginnerFriendly,
        is_fresh_graduate_friendly: classification.isFreshGraduateFriendly,
        match_score: classification.matchScore,
        match_reason: classification.matchReason,
        skill_gaps: classification.skillGaps,
        red_flags: classification.redFlags,
        confidence: classification.confidence,
        ai_status: status,
        fallback_category: isFallback ? classification.category : null,
        fallback_role: isFallback ? classification.role : null,
        fallback_level: isFallback ? classification.level : null,
        fallback_country_scope: isFallback ? classification.countryScope : null,
        fallback_work_mode: isFallback ? classification.workMode : null,
        fallback_employment_type: isFallback ? classification.employmentType : null,
        fallback_tech_stacks: isFallback ? classification.techStacks : null,
        fallback_match_score: isFallback ? classification.matchScore : null,
        fallback_match_reason: isFallback ? classification.matchReason : null,
        fallback_confidence: isFallback ? classification.confidence : null,
        analyzed_at: new Date().toISOString(),
        api_error: error,
        quota_exceeded: error === 'Gemini quota exceeded',
      }, {
        onConflict: 'job_id,model',
      })

    if (analysisError) {
      console.error(`Failed to save analysis for job ${job.id}:`, analysisError)
    }

    // Remove from queue if it was there
    await supabase
      .from('job_analysis_queue')
      .update({
        status: 'completed',
        processed_at: new Date().toISOString(),
      })
      .eq('job_id', job.id)

    return {
      jobId: job.id,
      status,
      classification,
      error,
      quotaExceeded: error === 'Gemini quota exceeded',
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error(`Error analyzing job ${job.id}:`, message)

    // Mark as failed in queue
    await supabase
      .from('job_analysis_queue')
      .update({
        status: 'failed',
        error_message: message,
        retry_count: 1,
      })
      .eq('job_id', job.id)

    return {
      jobId: job.id,
      status: 'failed',
      classification: null,
      error: message,
      quotaExceeded: false,
    }
  }
}

/**
 * Analyze multiple jobs in batch
 * Processes up to maxBatchSize jobs at a time
 */
export async function analyzeJobBatch(
  jobs: JobPost[],
  maxBatchSize = 5,
  onProgress?: (completed: number, total: number, result: AnalysisResult) => void
): Promise<{
  results: AnalysisResult[]
  successCount: number
  fallbackCount: number
  failedCount: number
  quotaExceeded: boolean
}> {
  const results: AnalysisResult[] = []
  let successCount = 0
  let fallbackCount = 0
  let failedCount = 0
  let quotaExceeded = false

  // Process in small batches to avoid overwhelming the API
  for (let i = 0; i < jobs.length; i += maxBatchSize) {
    const batch = jobs.slice(i, i + maxBatchSize)

    // Process batch concurrently with controlled parallelism
    const batchResults = await Promise.all(
      batch.map(job => analyzeJob(job))
    )

    for (let j = 0; j < batchResults.length; j++) {
      const result = batchResults[j]
      results.push(result)

      if (result.status === 'analyzed') {
        successCount++
      } else if (result.status === 'fallback') {
        fallbackCount++
      } else {
        failedCount++
      }

      if (result.quotaExceeded) {
        quotaExceeded = true
      }

      onProgress?.(results.length, jobs.length, result)
    }

    // Small delay between batches to avoid rate limiting
    if (i + maxBatchSize < jobs.length) {
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }

  return {
    results,
    successCount,
    fallbackCount,
    failedCount,
    quotaExceeded,
  }
}

/**
 * Get jobs that need AI analysis
 * Returns jobs with ai_status = 'pending' or null
 */
export async function getJobsPendingAnalysis(limit = 20): Promise<JobPost[]> {
  const supabase = createSupabaseAdminClient()

  if (!supabase) {
    console.warn('Supabase not configured - cannot fetch pending jobs')
    return []
  }

  const { data, error } = await supabase
    .from('job_posts')
    .select('*')
    .or(`ai_status.is.null,ai_status.eq.pending`)
    .eq('moderation_status', 'approved')
    .not('apply_url', 'is', null)
    .not('source_url', 'is', null)
    .order('fetched_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Failed to fetch pending jobs:', error)
    return []
  }

  // Convert to JobPost format
  return (data || []).map(row => ({
    id: row.id,
    sourceSlug: row.source_slug,
    externalId: row.external_id,
    title: row.title,
    company: row.company,
    companyDomain: row.company_domain,
    location: row.location,
    country: row.country,
    regionType: row.region_type,
    workMode: row.work_mode,
    employmentType: row.employment_type,
    experienceLevel: row.experience_level,
    description: row.description,
    applyUrl: row.apply_url,
    sourceUrl: row.source_url,
    tags: row.tags || [],
    requiredSkills: row.required_skills || [],
    salaryMin: row.salary_min,
    salaryMax: row.salary_max,
    currency: row.currency,
    publishedAt: row.published_at,
    fetchedAt: row.fetched_at,
    expiresAt: row.expires_at,
    validityScore: row.validity_score,
    riskLevel: row.risk_level,
    moderationStatus: row.moderation_status,
    moderationReasons: row.moderation_reasons || [],
    rawPayload: row.raw_payload,
  }))
}

/**
 * Queue a job for AI analysis
 */
export async function queueJobForAnalysis(jobId: string, priority = 0): Promise<boolean> {
  const supabase = createSupabaseAdminClient()

  if (!supabase) {
    return false
  }

  const { error } = await supabase
    .from('job_analysis_queue')
    .upsert({
      job_id: jobId,
      priority,
      status: 'pending',
    }, {
      onConflict: 'job_id',
    })
    .eq('status', 'pending')

  return !error
}

/**
 * Process the analysis queue
 * Fetches jobs from queue and processes them
 */
export async function processAnalysisQueue(
  maxJobs = 20,
  maxBatchSize = 5
): Promise<{
  processed: number
  success: number
  fallback: number
  failed: number
  quotaExceeded: boolean
}> {
  const supabase = createSupabaseAdminClient()

  if (!supabase) {
    return { processed: 0, success: 0, fallback: 0, failed: 0, quotaExceeded: false }
  }

  // Get pending jobs from queue
  const { data: queueItems, error: queueError } = await supabase
    .from('job_analysis_queue')
    .select('job_id')
    .eq('status', 'pending')
    .order('priority', { ascending: false })
    .limit(maxJobs)

  if (queueError || !queueItems?.length) {
    // Fallback to fetching jobs that need analysis directly
    const pendingJobs = await getJobsPendingAnalysis(maxJobs)
    if (pendingJobs.length === 0) {
      return { processed: 0, success: 0, fallback: 0, failed: 0, quotaExceeded: false }
    }

    const result = await analyzeJobBatch(pendingJobs, maxBatchSize)
    return {
      processed: result.results.length,
      success: result.successCount,
      fallback: result.fallbackCount,
      failed: result.failedCount,
      quotaExceeded: result.quotaExceeded,
    }
  }

  // Fetch full job data for queued items
  const jobIds = queueItems.map(item => item.job_id)
  const { data: jobs, error: jobsError } = await supabase
    .from('job_posts')
    .select('*')
    .in('id', jobIds)

  if (jobsError || !jobs?.length) {
    return { processed: 0, success: 0, fallback: 0, failed: 0, quotaExceeded: false }
  }

  const jobPosts: JobPost[] = jobs.map(row => ({
    id: row.id,
    sourceSlug: row.source_slug,
    externalId: row.external_id,
    title: row.title,
    company: row.company,
    companyDomain: row.company_domain,
    location: row.location,
    country: row.country,
    regionType: row.region_type,
    workMode: row.work_mode,
    employmentType: row.employment_type,
    experienceLevel: row.experience_level,
    description: row.description,
    applyUrl: row.apply_url,
    sourceUrl: row.source_url,
    tags: row.tags || [],
    requiredSkills: row.required_skills || [],
    salaryMin: row.salary_min,
    salaryMax: row.salary_max,
    currency: row.currency,
    publishedAt: row.published_at,
    fetchedAt: row.fetched_at,
    expiresAt: row.expires_at,
    validityScore: row.validity_score,
    riskLevel: row.risk_level,
    moderationStatus: row.moderation_status,
    moderationReasons: row.moderation_reasons || [],
    rawPayload: row.raw_payload,
  }))

  // Mark as processing
  await supabase
    .from('job_analysis_queue')
    .update({ status: 'processing' })
    .in('job_id', jobIds)

  // Analyze the jobs
  const result = await analyzeJobBatch(jobPosts, maxBatchSize)

  return {
    processed: result.results.length,
    success: result.successCount,
    fallback: result.fallbackCount,
    failed: result.failedCount,
    quotaExceeded: result.quotaExceeded,
  }
}
