'use client'

import { cn } from '@/lib/utils'
import { ReadinessLabel } from '@/types'

interface MatchScorePillProps {
  score: number
  size?: 'sm' | 'md'
  showLabel?: boolean
}

export function MatchScorePill({ score, size = 'md', showLabel = true }: MatchScorePillProps) {
  const getScoreConfig = (score: number) => {
    if (score >= 85) {
      return {
        label: 'Great Match',
        bg: 'bg-green/20',
        border: 'border-green',
        text: 'text-green',
      }
    }
    if (score >= 70) {
      return {
        label: 'Good Match',
        bg: 'bg-blue/20',
        border: 'border-blue',
        text: 'text-blue',
      }
    }
    if (score >= 50) {
      return {
        label: 'Partial Match',
        bg: 'bg-yellow/20',
        border: 'border-yellow',
        text: 'text-yellow',
      }
    }
    return {
      label: 'Low Match',
      bg: 'bg-red/20',
      border: 'border-red',
      text: 'text-red',
    }
  }

  const config = getScoreConfig(score)
  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1'

  return (
    <div
      className={cn(
        'brutal-border brutal-radius font-bold inline-flex items-center gap-2',
        config.bg,
        config.border,
        sizeClasses
      )}
    >
      <span>{Math.round(score)}%</span>
      {showLabel && <span className={config.text}>{config.label}</span>}
    </div>
  )
}

interface ReadinessBadgeProps {
  label: ReadinessLabel
  size?: 'sm' | 'md' | 'lg'
}

const readinessConfig: Record<ReadinessLabel, { label: string; color: string }> = {
  'not-ready-yet': { label: 'Not Ready Yet', color: 'red' },
  'foundation-stage': { label: 'Foundation Stage', color: 'orange' },
  'getting-close': { label: 'Getting Close', color: 'yellow' },
  'internship-ready-soon': { label: 'Almost There', color: 'blue' },
  'strong-candidate': { label: 'Strong Candidate', color: 'green' },
}

const colorClasses = {
  red: 'bg-red/20 border-red text-red',
  orange: 'bg-orange/20 border-orange text-orange',
  yellow: 'bg-yellow/20 border-yellow text-yellow',
  blue: 'bg-blue/20 border-blue text-blue',
  green: 'bg-green/20 border-green text-green',
}

export function ReadinessBadge({ label, size = 'md' }: ReadinessBadgeProps) {
  const config = readinessConfig[label]
  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-0.5' : size === 'lg' ? 'text-base px-4 py-2' : 'text-sm px-3 py-1'
  const colorKey = config.color as keyof typeof colorClasses

  return (
    <span
      className={cn(
        'brutal-border brutal-radius font-bold inline-block',
        colorClasses[colorKey],
        sizeClasses
      )}
    >
      {config.label}
    </span>
  )
}