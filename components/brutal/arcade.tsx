'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

// ============================================
// Arcade Quest primitives — HUD surfaces, XP, levels, stat tiles
// ============================================

export type AccentColor = 'yellow' | 'blue' | 'green' | 'pink' | 'orange' | 'purple'

const accentBg: Record<AccentColor, string> = {
  yellow: 'bg-yellow',
  blue: 'bg-blue',
  green: 'bg-green',
  pink: 'bg-pink',
  orange: 'bg-orange',
  purple: 'bg-purple',
}

const tileGlow: Record<AccentColor, string> = {
  yellow: 'tile-glow-yellow',
  blue: 'tile-glow-blue',
  green: 'tile-glow-green',
  pink: 'tile-glow-pink',
  orange: 'tile-glow-yellow',
  purple: 'tile-glow-pink',
}

// --- CabinetCard: dark HUD hero surface ---
export function CabinetCard({
  children,
  className,
  grid = true,
}: {
  children: React.ReactNode
  className?: string
  grid?: boolean
}) {
  return (
    <div
      className={cn(
        'cabinet-surface brutal-border brutal-radius shadow-brutal-lg relative overflow-hidden',
        className
      )}
    >
      {grid && (
        <div className="absolute inset-0 cabinet-grid pointer-events-none" aria-hidden="true" />
      )}
      <div className="relative z-10">{children}</div>
    </div>
  )
}

// --- LevelChip: HUD level indicator (LV.5) ---
export function LevelChip({
  level,
  label = 'LV',
  onDark = false,
  className,
}: {
  level: number | string
  label?: string
  onDark?: boolean
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 brutal-border brutal-radius px-3 py-1 shadow-brutal-sm',
        onDark ? 'bg-cabinet-soft text-on-dark' : 'bg-yellow text-black',
        className
      )}
    >
      <span className="hud-label text-[11px] leading-none">{label}</span>
      <span className="metric-mono font-bold text-sm leading-none">{level}</span>
    </span>
  )
}

// --- XPBar: ticked progress bar (discrete arcade segments) ---
export function XPBar({
  value,
  max = 100,
  label,
  accent = 'yellow',
  showValue = true,
  onDark = false,
  className,
}: {
  value: number
  max?: number
  label?: string
  accent?: AccentColor
  showValue?: boolean
  onDark?: boolean
  className?: string
}) {
  const prefersReducedMotion = useReducedMotion()
  const safeMax = max <= 0 ? 100 : max
  const pct = Math.min(100, Math.max(0, (value / safeMax) * 100))

  return (
    <div className={cn('w-full', className)}>
      {(label || showValue) && (
        <div className="flex items-center justify-between mb-1.5">
          {label && (
            <span className={cn('hud-label text-[11px]', onDark ? 'text-on-dark-soft' : 'text-secondary')}>
              {label}
            </span>
          )}
          {showValue && (
            <span className={cn('metric-mono text-xs font-bold', onDark ? 'text-on-dark' : 'text-black')}>
              {Math.round(value)}/{safeMax}
            </span>
          )}
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={Math.round(pct)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ?? 'Progress'}
        className={cn(
          'h-4 brutal-border brutal-radius overflow-hidden relative',
          onDark ? 'bg-cabinet-soft' : 'bg-white'
        )}
      >
        <motion.div
          className={cn('h-full', accentBg[accent])}
          initial={prefersReducedMotion ? false : { width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={prefersReducedMotion ? undefined : { duration: 0.8, ease: [0.2, 0, 0, 1] }}
        />
        <div className="absolute inset-0 xp-ticks pointer-events-none" aria-hidden="true" />
      </div>
    </div>
  )
}

// --- StatTile: bento stat with mono numerals + optional glow ---
export function StatTile({
  label,
  value,
  unit,
  icon: Icon,
  accent = 'yellow',
  onDark = false,
  glow = false,
  hint,
  className,
}: {
  label: string
  value: string | number
  unit?: string
  icon?: LucideIcon
  accent?: AccentColor
  onDark?: boolean
  glow?: boolean
  hint?: string
  className?: string
}) {
  return (
    <div
      className={cn(
        'brutal-border brutal-radius p-5 relative overflow-hidden transition-all duration-150',
        'hover:-translate-x-[2px] hover:-translate-y-[2px]',
        onDark ? 'bg-cabinet-soft text-on-dark hover:shadow-[4px_4px_0_0_rgba(255,255,255,0.25)]' : 'bg-white hover:shadow-brutal-sm',
        glow && tileGlow[accent],
        className
      )}
    >
      <div className="flex items-center justify-between mb-2 gap-2">
        <span className={cn('hud-label text-[11px]', onDark ? 'text-on-dark-soft' : 'text-secondary')}>
          {label}
        </span>
        {Icon && (
          <span
            className={cn(
              'w-8 h-8 brutal-border brutal-radius flex items-center justify-center shrink-0',
              accentBg[accent]
            )}
          >
            <Icon className="w-4 h-4 text-black" aria-hidden="true" />
          </span>
        )}
      </div>
      <div className="flex items-baseline gap-1">
        <span className="metric-mono font-bold text-3xl leading-none">{value}</span>
        {unit && (
          <span className={cn('metric-mono text-sm', onDark ? 'text-on-dark-soft' : 'text-secondary')}>
            {unit}
          </span>
        )}
      </div>
      {hint && (
        <p className={cn('text-xs mt-2', onDark ? 'text-on-dark-soft' : 'text-secondary')}>{hint}</p>
      )}
    </div>
  )
}
