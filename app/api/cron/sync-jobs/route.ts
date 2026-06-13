import { NextRequest, NextResponse } from 'next/server'
import { timingSafeEqual } from 'crypto'
import { fetchJobsFromAllSources, deduplicateJobs, jobSourceAdapters } from '@/lib/jobs/sources'
import { assessJobValidity } from '@/lib/jobs/validity'
import { JobPost, JobIngestionResult } from '@/lib/jobs/types'
import {
  setLastSyncInfo,
  getPersistedJobCount,
  markExpiredJobPosts,
  recordJobIngestionRun,
  upsertJobPosts,
  upsertJobSources,
} from '@/lib/jobs/store'

export const dynamic = 'force-dynamic'

const CRON_SECRET = process.env.CRON_SECRET

function getProvidedCronSecret(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const bearerMatch = authHeader?.match(/^Bearer\s+(.+)$/i)

  return bearerMatch?.[1] ?? request.headers.get('x-cron-secret')
}

function secretsMatch(providedSecret: string, expectedSecret: string) {
  const providedBuffer = Buffer.from(providedSecret)
  const expectedBuffer = Buffer.from(expectedSecret)

  return (
    providedBuffer.length === expectedBuffer.length &&
    timingSafeEqual(providedBuffer, expectedBuffer)
  )
}

function authorizeCronRequest(request: NextRequest) {
  if (!CRON_SECRET) {
    console.error('[Cron] CRON_SECRET is required')

    return NextResponse.json(
      { error: 'Cron secret is not configured' },
      { status: 500 }
    )
  }

  const providedSecret = getProvidedCronSecret(request)

  if (!providedSecret || !secretsMatch(providedSecret, CRON_SECRET)) {
    return NextResponse.json(
      { error: 'Unauthorized - Invalid cron secret' },
      { status: 401 }
    )
  }

  return null
}

export async function GET(request: NextRequest) {
  const authorizationError = authorizeCronRequest(request)

  if (authorizationError) {
    return authorizationError
  }

  const startTime = new Date().toISOString()
  console.log('[Cron] Starting job sync at', startTime)

  const results: JobIngestionResult[] = []

  try {
    await upsertJobSources(jobSourceAdapters)

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
      const jobPosts: JobPost[] = []
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

        if (validity.status === 'rejected') {
          rejectedCount++
        }

        jobPosts.push(jobPost)
      }

      const persistence = await upsertJobPosts(jobPosts)
      const finishedAt = new Date().toISOString()
      const result: JobIngestionResult = {
        sourceSlug,
        status: 'success',
        fetchedCount: sourceJobs.length,
        insertedCount: persistence.insertedCount,
        updatedCount: persistence.updatedCount,
        rejectedCount,
        startedAt: startTime,
        finishedAt,
      }

      await recordJobIngestionRun(result)

      results.push(result)
    }

    for (const sourceError of fetchResult.errors) {
      const [sourceSlug, ...messageParts] = sourceError.split(':')
      const failedResult: JobIngestionResult = {
        sourceSlug: sourceSlug || 'unknown',
        status: 'failed',
        fetchedCount: 0,
        insertedCount: 0,
        updatedCount: 0,
        rejectedCount: 0,
        errorMessage: messageParts.join(':').trim() || sourceError,
        startedAt: startTime,
        finishedAt: new Date().toISOString(),
      }
      await recordJobIngestionRun(failedResult)
      results.push(failedResult)
    }

    // Store last sync info
    const finishTime = new Date().toISOString()
    const summaryResult: JobIngestionResult = {
      sourceSlug: 'all',
      status: fetchResult.errors.length > 0 ? 'partial' : 'success',
      fetchedCount: results.reduce((acc, r) => acc + r.fetchedCount, 0),
      insertedCount: results.reduce((acc, r) => acc + r.insertedCount, 0),
      updatedCount: results.reduce((acc, r) => acc + r.updatedCount, 0),
      rejectedCount: results.reduce((acc, r) => acc + r.rejectedCount, 0),
      startedAt: startTime,
      finishedAt: finishTime,
    }

    setLastSyncInfo(finishTime, summaryResult)
    await recordJobIngestionRun(summaryResult)

    const expiredCount = await markExpiredJobPosts()
    const persistedCount = await getPersistedJobCount()

    console.log(`[Cron] Sync complete. Total: ${persistedCount.count} jobs stored in ${persistedCount.source}`)

    return NextResponse.json({
      success: true,
      syncTime: finishTime,
      summary: {
        totalJobs: persistedCount.count,
        storage: persistedCount.source,
        expired: expiredCount,
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
