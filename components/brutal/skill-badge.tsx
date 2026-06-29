'use client'

import { cn } from '@/lib/utils'
import { SkillLevel } from '@/types'

interface SkillBadgeProps {
  name: string
  level?: SkillLevel
  showLevel?: boolean
  size?: 'sm' | 'md' | 'lg'
  color?: 'yellow' | 'blue' | 'pink' | 'green' | 'orange' | 'purple'
  className?: string
}

const levelColors: Record<SkillLevel, string> = {
  0: 'bg-gray-200 text-gray-600',
  1: 'bg-blue/30 text-blue',
  2: 'bg-green/30 text-green',
  3: 'bg-yellow/50 text-yellow',
  4: 'bg-green text-white-static',
}

const levelLabels: Record<SkillLevel, string> = {
  0: 'Not learned',
  1: 'Learning',
  2: 'Basic',
  3: 'Project',
  4: 'Pro',
}

const sizeClasses = {
  sm: 'text-xs px-2 py-1',
  md: 'text-sm px-3 py-1.5',
  lg: 'text-base px-4 py-2',
}

export function SkillBadge({
  name,
  level,
  showLevel = false,
  size = 'md',
  color = 'yellow',
  className,
}: SkillBadgeProps) {
  return (
    <div
      className={cn(
        'brutal-border brutal-radius font-medium inline-flex items-center gap-2',
        level ? levelColors[level] : 'bg-yellow',
        sizeClasses[size],
        className
      )}
    >
      <span>{name}</span>
      {showLevel && level !== undefined && (
        <span className="text-xs opacity-70">L{level}</span>
      )}
    </div>
  )
}

interface SkillLevelIndicatorProps {
  level: SkillLevel
  maxLevel?: number
  showLabel?: boolean
  size?: 'sm' | 'md'
}

export function SkillLevelIndicator({
  level,
  maxLevel = 4,
  showLabel = false,
  size = 'md',
}: SkillLevelIndicatorProps) {
  const dots = Array.from({ length: maxLevel }, (_, i) => i < level)
  const dotSize = size === 'sm' ? 'w-2 h-2' : 'w-3 h-3'

  return (
    <div className="flex items-center gap-1">
      <div className="flex gap-0.5">
        {dots.map((filled, i) => (
          <div
            key={i}
            className={cn(
              dotSize,
              'brutal-radius',
              filled ? 'bg-black' : 'bg-gray-200 border border-gray-300'
            )}
          />
        ))}
      </div>
      {showLabel && (
        <span className="text-xs ml-1 text-gray-600">{levelLabels[level]}</span>
      )}
    </div>
  )
}

interface SkillLevelSelectorProps {
  value: SkillLevel
  onChange: (level: SkillLevel) => void
  size?: 'sm' | 'md'
}

export function SkillLevelSelector({
  value,
  onChange,
  size = 'md',
}: SkillLevelSelectorProps) {
  const levels: SkillLevel[] = [0, 1, 2, 3, 4]
  const dotSize = size === 'sm' ? 'w-6 h-6 text-xs' : 'w-8 h-8 text-sm'

  return (
    <div className="flex gap-2">
      {levels.map((level) => (
        <button
          key={level}
          type="button"
          onClick={() => onChange(level)}
          className={cn(
            'brutal-border brutal-radius font-bold transition-all duration-150',
            dotSize,
            value === level
              ? 'bg-black text-white shadow-brutal-sm'
              : 'bg-white text-black hover:bg-gray-100'
          )}
        >
          {level}
        </button>
      ))}
    </div>
  )
}