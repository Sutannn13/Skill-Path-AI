import { NextRequest, NextResponse } from 'next/server'
import { fetchJobsFromAllSources, deduplicateJobs } from '@/lib/jobs/sources'
import { assessJobValidity } from '@/lib/jobs/validity'
import { JobPost, JobIngestionResult } from '@/lib/jobs/types'
import {
  setStoredJob,
  getStoredJobCount,
  setLastSyncInfo,
  cleanupRejectedJobs,
} from '@/lib/jobs/store'

export const dynamic = 'force-dynamic'

const CRON_SECRET = process.env.CRON_SECRET
const IS_DEVELOPMENT = process.env.NODE_ENV === 'development'

export async function GET(request: NextRequest) {
  // Verify cron secret for production
  if (!IS_DEVELOPMENT) {
    const authHeader = request.headers.get('authorization')
    const cronSecret = request.headers.get('x-cron-secret') || CRON_SECRET

    // Check for Bearer token or x-cron-secret header
    const bearerMatch = authHeader?.match(/Bearer\s+(.+)/)
    const providedSecret = bearerMatch?.[1] || cronSecret

    if (!CRON_SECRET) {
      console.warn('[Cron] CRON_SECRET not configured - allowing in development only')
    } else if (providedSecret !== CRON_SECRET) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid cron secret' },
        { status: 401 }
      )
    }
  }

  const startTime = new Date().toISOString()
  console.log('[Cron] Starting job sync at', startTime)

  const results: JobIngestionResult[] = []

  try {
    // Fetch from all enabled sources
    const fetchResult = await fetchJobsFromAllSources()
    console.log(`[Cron] Fetched ${fetchResult.jobs.length} jobs from ${fetchResult.sources.length} sources`)

    if (fetchResult.errors.length > 0) {
      console.warn('[Cron] Source errors:', fetchResult.errors)
    }

    // Deduplicate
    const uniqueJobs = deduplicateJobs(fetchResult.jobs)
    console.log(`[Cron] Deduplicated to ${uniqueJobs.length} unique jobs`)

    // Process each source
    for (const sourceSlug of fetchResult.sources) {
      const sourceJobs = uniqueJobs.filter(j => j.sourceSlug === sourceSlug)
      let insertedCount = 0
      let updatedCount = 0
      let rejectedCount = 0

      for (const jobData of sourceJobs) {
        // Assess validity
        const validity = assessJobValidity(jobData)

        // Create full job post with validity data
        const jobPost: JobPost = {
          ...jobData,
          validityScore: validity.validityScore,
          riskLevel: validity.riskLevel,
          moderationStatus: validity.status,
          moderationReasons: validity.reasons,
        } as JobPost

        // Only insert/update approved or pending_review jobs
        if (validity.status !== 'rejected') {
          setStoredJob(jobPost)
          updatedCount++
        } else {
          rejectedCount++
        }
      }

      results.push({
        sourceSlug,
        status: 'success',
        fetchedCount: sourceJobs.length,
        insertedCount,
        updatedCount,
        rejectedCount,
        startedAt: startTime,
        finishedAt: new Date().toISOString(),
      })
    }

    // Store last sync info
    const finishTime = new Date().toISOString()
    const summaryResult: JobIngestionResult = {
      sourceSlug: 'all',
      status: 'success',
      fetchedCount: results.reduce((acc, r) => acc + r.fetchedCount, 0),
      insertedCount: results.reduce((acc, r) => acc + r.insertedCount, 0),
      updatedCount: results.reduce((acc, r) => acc + r.updatedCount, 0),
      rejectedCount: results.reduce((acc, r) => acc + r.rejectedCount, 0),
      startedAt: startTime,
      finishedAt: finishTime,
    }

    setLastSyncInfo(finishTime, summaryResult)

    // Clean up old rejected jobs (keep for 30 days)
    cleanupRejectedJobs(30)

    console.log(`[Cron] Sync complete. Total: ${getStoredJobCount()} jobs stored`)

    return NextResponse.json({
      success: true,
      syncTime: finishTime,
      summary: {
        totalJobs: getStoredJobCount(),
        sources: results.map(r => ({
          slug: r.sourceSlug,
          status: r.status,
          fetched: r.fetchedCount,
          inserted: r.insertedCount,
          updated: r.updatedCount,
          rejected: r.rejectedCount,
        })),
      },
      results,
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('[Cron] Sync failed:', errorMessage)

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        partialResults: results,
      },
      { status: 500 }
    )
  }
}

// Manual trigger endpoint (for testing)
export async function POST(request: NextRequest) {
  // Same auth check as GET
  return GET(request)
}
