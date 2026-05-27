import { JobSourceAdapter, JobPost } from './types'
import { remotiveAdapter } from './adapters/remotive'
import { jobicyAdapter } from './adapters/jobicy'
import { arbeitnowAdapter } from './adapters/arbeitnow'
import { adzunaAdapter } from './adapters/adzuna'
import { indonesiaSampleAdapter } from './adapters/indonesia-sample'

// Registry of all available job source adapters
export const jobSourceAdapters: JobSourceAdapter[] = [
  // Primary sources
  remotiveAdapter,
  arbeitnowAdapter,
  jobicyAdapter,

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
      const jobs = await adapter.fetch()
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
  indonesiaSampleAdapter,
}