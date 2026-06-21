'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { Target, MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'
import { StickerBadge } from '@/components/brutal'
import { AppWindow } from './app-window'

export interface JobMatch {
  title: string
  match: number
  location: string
}

const DEFAULT_JOBS: JobMatch[] = [
  { title: 'Junior Frontend Intern', match: 85, location: 'Jakarta / Remote' },
  { title: 'Frontend Developer (Fresh Grad)', match: 78, location: 'Bandung / Hybrid' },
  { title: 'React Developer Intern', match: 72, location: 'Remote' },
]

/**
 * JobRadarCard — an AppWindow-framed preview of matching junior/internship
 * roles. The concentric radar + the single ping ring are decorative
 * (aria-hidden, ping skipped under reduced motion); every job, its match %, and
 * its location are real DOM text with an icon+text match badge (no color-only).
 */
export function JobRadarCard({ jobs = DEFAULT_JOBS, className }: { jobs?: JobMatch[]; className?: string }) {
  const reduce = useReducedMotion()

  return (
    <AppWindow routeTab="SKILLPATH://JOBS" urlPill="job-radar" litDot="green" className={cn('h-full', className)}>
      <div className="relative h-full p-5 sm:p-6">
        {/* Decorative radar dial */}
        <div className="pointer-events-none absolute right-3 top-3 h-24 w-24 opacity-40 sm:h-28 sm:w-28" aria-hidden="true">
          <span className="absolute inset-0 rounded-full border-3 border-black/30" />
          <span className="absolute inset-[18%] rounded-full border-2 border-black/25" />
          <span className="absolute inset-[40%] rounded-full border-2 border-black/20" />
          <span className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-black bg-green" />
          {!reduce && (
            <motion.span
              className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-green"
              initial={{ scale: 1, opacity: 0.85 }}
              whileInView={{ scale: 7, opacity: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
            />
          )}
        </div>

        <div className="relative mb-4 flex items-center gap-2">
          <span className="grid h-10 w-10 place-items-center bg-blue brutal-border brutal-radius">
            <Target className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <h3 className="font-display text-heading-sm font-bold leading-tight">Job Radar</h3>
            <p className="text-xs text-secondary">Live junior &amp; internship matches</p>
          </div>
        </div>

        <ul className="relative space-y-2">
          {jobs.map((job) => (
            <li
              key={job.title}
              className="flex items-center justify-between gap-3 bg-cream-light px-3 py-2 brutal-border brutal-radius"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-bold">{job.title}</p>
                <p className="flex items-center gap-1 text-xs text-secondary">
                  <MapPin className="h-3 w-3 shrink-0" aria-hidden="true" />
                  <span className="truncate">{job.location}</span>
                </p>
              </div>
              <StickerBadge variant="great-match" label={`${job.match}%`} size="sm" />
            </li>
          ))}
        </ul>
      </div>
    </AppWindow>
  )
}

export default JobRadarCard
