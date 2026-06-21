'use client'

import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export type TrafficDotColor = 'red' | 'yellow' | 'green'

const dotBg: Record<TrafficDotColor, string> = {
  red: 'bg-red',
  yellow: 'bg-yellow',
  green: 'bg-green',
}

const order: TrafficDotColor[] = ['red', 'yellow', 'green']

/**
 * Decorative window "traffic light" dots (aria-hidden chrome). Pass `lit` to
 * ring one dot so it signals window state without relying on color alone — the
 * route tab text carries the real meaning.
 */
export function TrafficDots({ lit, className }: { lit?: TrafficDotColor; className?: string }) {
  return (
    <span className={cn('flex items-center gap-1.5', className)} aria-hidden="true">
      {order.map((c) => (
        <span
          key={c}
          className={cn(
            'h-3 w-3 rounded-full border-2 border-black',
            dotBg[c],
            lit === c ? 'ring-2 ring-black/40 ring-offset-1 ring-offset-cream-light' : 'opacity-90'
          )}
        />
      ))}
    </span>
  )
}

const shadowClass = {
  sm: 'shadow-brutal-sm',
  md: 'shadow-brutal',
  lg: 'shadow-brutal-lg',
} as const

/**
 * AppWindow — the signature Career Quest OS motif: a hard-bordered neobrutalist
 * "app window" with a title bar carrying traffic dots, a mono route tab, and an
 * optional URL pill. The route/URL are real readable DOM text; only the dots are
 * decorative. Body content is rendered verbatim via children.
 */
export function AppWindow({
  routeTab,
  urlPill,
  litDot,
  titleRight,
  barClassName,
  bodyClassName,
  shadow = 'lg',
  className,
  children,
}: {
  routeTab: string
  urlPill?: string
  litDot?: TrafficDotColor
  titleRight?: ReactNode
  barClassName?: string
  bodyClassName?: string
  shadow?: 'sm' | 'md' | 'lg'
  className?: string
  children: ReactNode
}) {
  return (
    <div className={cn('overflow-hidden bg-white brutal-border brutal-radius', shadowClass[shadow], className)}>
      <div className={cn('flex items-center gap-3 border-b-3 border-black bg-cream-light px-3 py-2', barClassName)}>
        <TrafficDots lit={litDot} />
        <span className="metric-mono truncate text-[11px] font-bold uppercase tracking-tight text-secondary">
          {routeTab}
        </span>
        {(urlPill || titleRight) && (
          <span className="ml-auto flex items-center gap-2">
            {urlPill && (
              <span className="hidden items-center rounded-md border-2 border-black bg-white px-2 py-0.5 metric-mono text-[11px] text-tertiary sm:inline-flex">
                {urlPill}
              </span>
            )}
            {titleRight}
          </span>
        )}
      </div>
      <div className={cn('relative', bodyClassName)}>{children}</div>
    </div>
  )
}

export default AppWindow
