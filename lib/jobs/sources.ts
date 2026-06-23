import { JobSourceAdapter, JobPost } from './types'
import { remotiveAdapter } from './adapters/remotive'
import { jobicyAdapter } from './adapters/jobicy'
import { arbeitnowAdapter } from './adapters/arbeitnow'
import { adzunaAdapter } from './adapters/adzuna'
import { remoteokAdapter } from './adapters/remoteok'
import { himalayasAdapter } from './adapters/himalayas'
import { themuseAdapter } from './adapters/themuse'
import { weworkremotelyAdapter } from './adapters/weworkremotely'
import { indonesiaSampleAdapter } from './adapters/indonesia-sample'

const ADAPTER_FETCH_TIMEOUT_MS = 12000
const ADAPTER_FETCH_MAX_ATTEMPTS = 3
const ADAPTER_FETCH_BASE_BACKOFF_MS = 250

// Registry of all available job source adapters
export const jobSourceAdapters: JobSourceAdapter[] = [
  // Primary sources (public, no API key required)
  remotiveAdapter,
  arbeitnowAdapter,
  jobicyAdapter,
  remoteokAdapter,
  himalayasAdapter,
  themuseAdapter,
  weworkremotelyAdapter,

  // Optional sources (require API keys)
  adzunaAdapter,

  // Indonesia sample data
  indonesiaSampleAdapter,
]

// Get enabled adapters
export function getEnabledAdapters(): JobSourceAdapter[] {
  return jobSourceAdapters.filter(adapter => adapter.isConfigured())
}

// Get adapter by slug
export function getAdapterBySlug(slug: string): JobSourceAdapter | undefined {
  return jobSourceAdapters.find(adapter => adapter.slug === slug)
}

function createTimeoutError(timeoutMs: number) {
  return new Error(`Timed out after ${timeoutMs}ms`)
}

async function withTimeout<T>(operation: Promise<T>, timeoutMs: number): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  try {
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => reject(createTimeoutError(timeoutMs)), timeoutMs)
    })

    return await Promise.race([operation, timeoutPromise])
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
  }
}

function getBackoffDelayMs(attempt: number) {
  const exponential = ADAPTER_FETCH_BASE_BACKOFF_MS * (2 ** (attempt - 1))
  const jitter = Math.floor(Math.random() * 100)
  return exponential + jitter
}

async function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function fetchAdapterWithRetry(adapter: JobSourceAdapter) {
  let lastError: Error | null = null

  for (let attempt = 1; attempt <= ADAPTER_FETCH_MAX_ATTEMPTS; attempt++) {
    try {
      const jobs = await withTimeout(adapter.fetch(), ADAPTER_FETCH_TIMEOUT_MS)
      return jobs
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown adapter fetch failure')

      if (attempt < ADAPTER_FETCH_MAX_ATTEMPTS) {
        await wait(getBackoffDelayMs(attempt))
      }
    }
  }

  throw lastError ?? new Error('Adapter fetch failed')
}

// Fetch jobs from all enabled sources
export async function fetchJobsFromAllSources(): Promise<{
  jobs: Partial<JobPost>[]
  sources: string[]
  errors: string[]
}> {
  const enabledAdapters = getEnabledAdapters()
  const allJobs: Partial<JobPost>[] = []
  const sources: string[] = []
  const errors: string[] = []

  for (const adapter of enabledAdapters) {
    try {
      const jobs = await fetchAdapterWithRetry(adapter)
      if (jobs.length > 0) {
        allJobs.push(...jobs)
        sources.push(adapter.slug)
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      errors.push(`${adapter.slug}: ${message}`)
    }
  }

  return { jobs: allJobs, sources, errors }
}

// Deduplicate jobs by external ID within same source
export function deduplicateJobs(jobs: Partial<JobPost>[]): Partial<JobPost>[] {
  const seen = new Map<string, Partial<JobPost>>()

  for (const job of jobs) {
    const key = `${job.sourceSlug}-${job.externalId}`
    if (!seen.has(key)) {
      seen.set(key, job)
    }
  }

  return Array.from(seen.values())
}

// Get source attribution info
export function getSourceAttribution(): {
  label: string
  url: string
} | null {
  // Use the first available live source
  const liveSource = jobSourceAdapters.find(
    a => a.type === 'api' && a.slug !== 'indonesia-sample' && a.isConfigured()
  )

  if (liveSource) {
    return {
      label: liveSource.attributionLabel,
      url: liveSource.attributionUrl,
    }
  }

  return null
}

// Export individual adapters for direct use
export {
  remotiveAdapter,
  jobicyAdapter,
  arbeitnowAdapter,
  adzunaAdapter,
  remoteokAdapter,
  himalayasAdapter,
  themuseAdapter,
  weworkremotelyAdapter,
  indonesiaSampleAdapter,
}
