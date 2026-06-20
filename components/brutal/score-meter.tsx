'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface ScoreMeterProps {
  score: number
  label?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showLabel?: boolean
  animated?: boolean
}

const sizeClasses = {
  sm: { container: 'w-20 h-20', text: 'text-lg', label: 'text-xs' },
  md: { container: 'w-28 h-28', text: 'text-2xl', label: 'text-sm' },
  lg: { container: 'w-36 h-36', text: 'text-3xl', label: 'text-base' },
  xl: { container: 'w-48 h-48', text: 'text-4xl', label: 'text-lg' },
}

export function ScoreMeter({
  score,
  label,
  size = 'md',
  showLabel = true,
  animated = true,
}: ScoreMeterProps) {
  const sizes = sizeClasses[size]
  const radius = 80
  const circumference = 2 * Math.PI * radius
  const progress = Math.min(Math.max(score, 0), 100)

  return (
    <div
      className="flex flex-col items-center gap-2"
      role="img"
      aria-label={`${label ? label + ': ' : ''}${Math.round(progress)} out of 100`}
    >
      <div className={cn('relative', sizes.container)}>
        <svg
          className="w-full h-full transform -rotate-90"
          viewBox="0 0 160 160"
          aria-hidden="true"
        >
          {/* Background circle */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            stroke="#E5E5E5"
            strokeWidth="8"
          />
          {/* Progress circle */}
          {animated ? (
            <motion.circle
              cx="80"
              cy="80"
              r={radius}
              fill="none"
              stroke="#111111"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={false}
              animate={{ strokeDashoffset: circumference - (progress / 100) * circumference }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="stroke-black"
            />
          ) : (
            <circle
              cx="80"
              cy="80"
              r={radius}
              fill="none"
              stroke="#111111"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference - (progress / 100) * circumference}
              className="stroke-black"
            />
          )}
        </svg>
        {/* Score text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={cn('metric-mono font-bold text-black', sizes.text)}>
            {animated ? (
              <motion.span
                initial={false}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                {Math.round(progress)}
              </motion.span>
            ) : (
              Math.round(progress)
            )}
          </span>
        </div>
      </div>
      {showLabel && label && (
        <span className={cn('font-medium text-center', sizes.label)}>
          {label}
        </span>
      )}
    </div>
  )
}

interface ScoreBarProps {
  score: number
  label?: string
  showPercentage?: boolean
  color?: 'yellow' | 'blue' | 'pink' | 'green' | 'orange' | 'purple' | 'black' | 'white'
  animated?: boolean
}

const colorClasses: Record<string, string> = {
  yellow: 'bg-yellow',
  blue: 'bg-blue',
  pink: 'bg-pink',
  green: 'bg-green',
  orange: 'bg-orange',
  purple: 'bg-purple',
  black: 'bg-black',
  white: 'bg-white',
}

export function ScoreBar({
  score,
  label,
  showPercentage = true,
  color = 'yellow',
  animated = true,
}: ScoreBarProps) {
  const progress = Math.min(Math.max(score, 0), 100)

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        {label && <span className="font-medium text-sm">{label}</span>}
        {showPercentage && (
          <span className="font-bold text-sm">{Math.round(progress)}%</span>
        )}
      </div>
      <div className="h-4 bg-gray-200 brutal-border brutal-radius overflow-hidden">
        {animated ? (
          <motion.div
            className={cn('h-full', colorClasses[color])}
            initial={false}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        ) : (
          <div
            className={cn('h-full', colorClasses[color])}
            style={{ width: `${progress}%` }}
          />
        )}
      </div>
    </div>
  )
}
