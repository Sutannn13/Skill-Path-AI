/**
 * Job Ingestion API
 *
 * POST /api/jobs/ingest - Trigger job ingestion from all sources
 * POST /api/jobs/ingest/[source] - Trigger job ingestion from specific source
 *
 * This is typically called by a cron job or manually to fetch and process jobs.
 */

import { NextRequest, NextResponse } from 'next/server'
import { ingestAllSources, ingestJobsFromSource } from '@/lib/jobs/ingestion'
import { processAnalysisQueue } from '@/lib/jobs/gemini-analyzer'
import { getEnabledAdapters } from '@/lib/jobs/sources'

const CRON_SECRET = process.env.CRON_SECRET

function verifyCronAuth(request: NextRequest): boolean {
  if (!CRON_SECRET) {
    // If no secret is configured, allow in development
    return process.env.NODE_ENV === 'development'
  }

  const authHeader = request.headers.get('authorization')
  return authHeader === `Bearer ${CRON_SECRET}`
}

export async function POST(request: NextRequest) {
  try {
    // Verify authorization for cron jobs
    const isCronRequest = request.headers.get('x-cron-job') === 'true'
    if (isCronRequest && !verifyCronAuth(request)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const source = searchParams.get('source')
    const runAnalysis = searchParams.get('analyze') !== 'false' // Default to run analysis

    const enabledAdapters = getEnabledAdapters()

    // Log available sources
    console.log(`[Job Ingestion] Available sources: ${enabledAdapters.map(a => a.slug).join(', ')}`)

    let ingestionResult
    if (source) {
      // Ingest from specific source
      console.log(`[Job Ingestion] Fetching from source: ${source}`)
      ingestionResult = await ingestJobsFromSource(source)
    } else {
      // Ingest from all sources
      console.log('[Job Ingestion] Fetching from all sources')
      ingestionResult = await ingestAllSources()
    }

    // Run AI analysis on new jobs if requested
    let analysisResult = null
    if (runAnalysis && ingestionResult) {
      console.log('[Job Ingestion] Running AI analysis on new jobs...')
      analysisResult = await processAnalysisQueue(20, 5) // Process up to 20 jobs, 5 at a time
    }

    // Handle array result (from ingestAllSources) vs object result (from ingestJobsFromSource)
    const response: Record<string, unknown> = {}
    type IngestionResultType = { fetchedCount: number; insertedCount: number; rejectedCount: number; status: string; sourceSlug: string }

    if (Array.isArray(ingestionResult)) {
      const results = ingestionResult as IngestionResultType[]
      response.results = ingestionResult
      response.totalFetched = results.reduce((acc, r) => acc + (r.fetchedCount ?? 0), 0)
      response.totalInserted = results.reduce((acc, r) => acc + (r.insertedCount ?? 0), 0)
      response.totalRejected = results.reduce((acc, r) => acc + (r.rejectedCount ?? 0), 0)
    } else {
      const singleResult = ingestionResult as IngestionResultType
      response.ingestion = ingestionResult
      response.fetchedCount = singleResult.fetchedCount
      response.insertedCount = singleResult.insertedCount
      response.rejectedCount = singleResult.rejectedCount
    }

    if (analysisResult) {
      response.analysis = analysisResult
    }

    response.success = true
    response.timestamp = new Date().toISOString()

    return NextResponse.json(response)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('[Job Ingestion] Error:', errorMessage)

    return NextResponse.json(
      {
        error: 'Job ingestion failed',
        message: errorMessage,
        success: false,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}

// GET endpoint to check ingestion status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const source = searchParams.get('source')

    const enabledAdapters = getEnabledAdapters()

    return NextResponse.json({
      enabledSources: enabledAdapters.map(a => ({
        slug: a.slug,
        name: a.name,
        region: a.region,
        type: a.type,
      })),
      requestedSource: source,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}