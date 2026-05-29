'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { ButtonHTMLAttributes } from 'react'
import { BrutalButton } from './brutal-button'

// ============================================
// ANIMATED EMPTY STATE
// ============================================

interface AnimatedEmptyStateProps {
  icon?: 'search' | 'inbox' | 'folder' | 'book' | 'rocket' | 'target' | 'checklist' | 'trophy'
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

const iconEmojis = {
  search: '🔍',
  inbox: '📭',
  folder: '📁',
  book: '📚',
  rocket: '🚀',
  target: '🎯',
  checklist: '✅',
  trophy: '🏆',
}

const iconColors = {
  search: 'bg-yellow',
  inbox: 'bg-blue',
  folder: 'bg-green',
  book: 'bg-pink',
  rocket: 'bg-orange',
  target: 'bg-purple',
  checklist: 'bg-green',
  trophy: 'bg-yellow',
}

export function AnimatedEmptyState({
  icon = 'inbox',
  title,
  description,
  action,
  className,
}: AnimatedEmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('text-center py-12 px-6', className)}
    >
      {/* Animated Icon */}
      <motion.div
        className={cn(
          'w-24 h-24 mx-auto mb-6 brutal-border brutal-radius flex items-center justify-center',
          iconColors[icon]
        )}
        animate={{
          y: [0, -10, 0],
          rotate: [0, 5, -5, 0],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <span className="text-5xl">{iconEmojis[icon]}</span>
      </motion.div>

      {/* Title */}
      <motion.h3
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="font-display font-bold text-xl mb-2"
      >
        {title}
      </motion.h3>

      {/* Description */}
      {description && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-gray-600 mb-6 max-w-md mx-auto"
        >
          {description}
        </motion.p>
      )}

      {/* Action */}
      {action && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <BrutalButton onClick={action.onClick} color="yellow">
            {action.label}
          </BrutalButton>
        </motion.div>
      )}

      {/* Decorative elements */}
      <motion.div
        className="absolute top-8 left-8 w-4 h-4 bg-yellow brutal-border brutal-radius opacity-20"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-12 right-12 w-3 h-3 bg-pink brutal-border brutal-radius-full opacity-20"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.2, 0.3, 0.2],
        }}
        transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
      />
    </motion.div>
  )
}

// ============================================
// ANIMATED LOADING STATE
// ============================================

interface AnimatedLoadingStateProps {
  text?: string
  className?: string
}

export function AnimatedLoadingState({
  text = 'Loading...',
  className,
}: AnimatedLoadingStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn('flex flex-col items-center justify-center py-12', className)}
    >
      {/* Animated Cat */}
      <motion.div
        className="w-20 h-20 mb-6"
        animate={{
          y: [0, -15, 0],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <div className="w-full h-full bg-yellow brutal-border brutal-radius flex items-center justify-center shadow-brutal-sm">
          <motion.span
            className="text-4xl"
            animate={{
              rotate: [-10, 10, -10],
            }}
            transition={{
              duration: 0.5,
              repeat: Infinity,
            }}
          >
            🐱
          </motion.span>
        </div>
      </motion.div>

      {/* Loading dots */}
      <div className="flex gap-2 mb-4">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-3 h-3 bg-black brutal-radius-full"
            animate={{
              y: [0, -10, 0],
              opacity: [0.3, 1, 0.3],
            }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: i * 0.1,
            }}
          />
        ))}
      </div>

      {/* Text */}
      <p className="text-sm font-medium">{text}</p>
    </motion.div>
  )
}

// ============================================
// SKELETON CARDS
// ============================================

interface SkeletonCardProps {
  lines?: number
  className?: string
}

export function SkeletonCard({ lines = 3, className }: SkeletonCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn('brutal-border brutal-radius p-6 bg-white', className)}
    >
      {/* Header skeleton */}
      <div className="flex items-center gap-4 mb-4">
        <motion.div
          className="w-12 h-12 bg-gray-200 brutal-radius"
          animate={{
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
        <div className="flex-1 space-y-2">
          <motion.div
            className="h-4 bg-gray-200 brutal-radius w-3/4"
            animate={{
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.1 }}
          />
          <motion.div
            className="h-3 bg-gray-200 brutal-radius w-1/2"
            animate={{
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
          />
        </div>
      </div>

      {/* Lines skeleton */}
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <motion.div
            key={i}
            className="h-3 bg-gray-200 brutal-radius"
            style={{ width: `${100 - i * 15}%` }}
            animate={{
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.1,
            }}
          />
        ))}
      </div>
    </motion.div>
  )
}

// ============================================
// SKELETON STAT CARD
// ============================================

interface SkeletonStatCardProps {
  className?: string
}

export function SkeletonStatCard({ className }: SkeletonStatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn('brutal-border brutal-radius p-4 bg-white', className)}
    >
      <div className="flex items-center gap-3">
        <motion.div
          className="w-10 h-10 bg-gray-200 brutal-radius"
          animate={{
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
        <div className="space-y-2">
          <motion.div
            className="h-4 bg-gray-200 brutal-radius w-16"
            animate={{
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.1 }}
          />
          <motion.div
            className="h-6 bg-gray-200 brutal-radius w-12"
            animate={{
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
          />
        </div>
      </div>
    </motion.div>
  )
}

// ============================================
// SKELETON LIST
// ============================================

interface SkeletonListProps {
  items?: number
  className?: string
}

export function SkeletonList({ items = 5, className }: SkeletonListProps) {
  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: items }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}
          className="brutal-border brutal-radius p-4 bg-white flex items-center gap-4"
        >
          <motion.div
            className="w-10 h-10 bg-gray-200 brutal-radius shrink-0"
            animate={{
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.05 }}
          />
          <div className="flex-1 space-y-2">
            <motion.div
              className="h-4 bg-gray-200 brutal-radius w-3/4"
              animate={{
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.05 + 0.1 }}
            />
            <motion.div
              className="h-3 bg-gray-200 brutal-radius w-1/2"
              animate={{
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.05 + 0.2 }}
            />
          </div>
        </motion.div>
      ))}
    </div>
  )
}

// ============================================
// PROGRESS BAR
// ============================================

interface ProgressBarProps {
  progress: number
  color?: 'yellow' | 'blue' | 'pink' | 'green' | 'orange' | 'purple' | 'black'
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
  animated?: boolean
  className?: string
}

const progressColors = {
  yellow: 'bg-yellow',
  blue: 'bg-blue',
  pink: 'bg-pink',
  green: 'bg-green',
  orange: 'bg-orange',
  purple: 'bg-purple',
  black: 'bg-black',
}

const progressSizes = {
  sm: 'h-2',
  md: 'h-3',
  lg: 'h-4',
}

export function ProgressBar({
  progress,
  color = 'yellow',
  showLabel = false,
  size = 'md',
  animated = true,
  className,
}: ProgressBarProps) {
  return (
    <div className={className}>
      {showLabel && (
        <div className="flex justify-between mb-1 text-sm">
          <span className="font-medium">Progress</span>
          <span className="font-bold">{Math.round(progress)}%</span>
        </div>
      )}
      <div className={cn(
        'w-full bg-black/10 brutal-radius border-2 border-black/20 overflow-hidden',
        progressSizes[size]
      )}>
        <motion.div
          className={cn('h-full', progressColors[color])}
          initial={animated ? { width: 0 } : false}
          animate={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}

// ============================================
// CIRCULAR PROGRESS
// ============================================

interface CircularProgressProps {
  progress: number
  size?: number
  strokeWidth?: number
  color?: 'yellow' | 'blue' | 'pink' | 'green' | 'orange' | 'purple'
  showLabel?: boolean
  label?: string
  className?: string
}

const circularColors = {
  yellow: '#FFD447',
  blue: '#7CC9FF',
  pink: '#FF8FAB',
  green: '#9BE564',
  orange: '#FFB86B',
  purple: '#B39DDB',
}

export function CircularProgress({
  progress,
  size = 80,
  strokeWidth = 8,
  color = 'yellow',
  showLabel = true,
  label,
  className,
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const strokeDashoffset = circumference - (progress / 100) * circumference

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e5e5e5"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={circularColors[color]}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </svg>
      {showLabel && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="font-bold text-lg"
          >
            {Math.round(progress)}%
          </motion.span>
          {label && <span className="text-[10px] text-gray-500">{label}</span>}
        </div>
      )}
    </div>
  )
}

// ============================================
// STEP PROGRESS
// ============================================

interface StepProgressProps {
  steps: string[]
  currentStep: number
  className?: string
}

export function StepProgress({ steps, currentStep, className }: StepProgressProps) {
  return (
    <div className={cn('flex items-center justify-between', className)}>
      {steps.map((step, index) => {
        const isCompleted = index < currentStep
        const isCurrent = index === currentStep
        const isPending = index > currentStep

        return (
          <div key={index} className="flex items-center">
            {/* Step circle */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: index * 0.1 }}
              className={cn(
                'w-10 h-10 brutal-border brutal-radius flex items-center justify-center font-bold text-sm',
                isCompleted && 'bg-green text-black',
                isCurrent && 'bg-yellow text-black',
                isPending && 'bg-gray-200 text-gray-500'
              )}
            >
              {isCompleted ? '✓' : index + 1}
            </motion.div>

            {/* Label */}
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.1 + 0.2 }}
              className={cn(
                'ml-2 text-sm font-medium',
                isCurrent && 'font-bold',
                isPending && 'text-gray-500'
              )}
            >
              {step}
            </motion.span>

            {/* Connector line */}
            {index < steps.length - 1 && (
              <div className="flex-1 mx-4 h-1 bg-black/10 brutal-radius overflow-hidden">
                <motion.div
                  className="h-full bg-green"
                  initial={{ width: 0 }}
                  animate={{ width: isCompleted ? '100%' : '0%' }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
