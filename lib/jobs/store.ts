import { JobPost, JobIngestionResult } from './types'

// In-memory job store (in production, this would be a database)
let jobStore: Map<string, JobPost> = new Map()
let lastSyncTime: string | null = null
let lastSyncResult: JobIngestionResult | null = null

export function getStoredJobs(): JobPost[] {
  return Array.from(jobStore.values())
}

export function getStoredJobById(id: string): JobPost | undefined {
  return jobStore.get(id)
}

export function getStoredJobsBySource(sourceSlug: string): JobPost[] {
  return Array.from(jobStore.values()).filter(j => j.sourceSlug === sourceSlug)
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
  jobStore = new Map(jobs.map(j => [j.id, j]))
}

export function clearJobStore(): void {
  jobStore.clear()
}

// Cleanup old rejected jobs
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