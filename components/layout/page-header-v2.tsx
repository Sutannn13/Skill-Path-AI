'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'
import { CartoonMascot } from '@/components/illustrations/cartoon-mascot'

// ============================================
// PAGE HEADER v2 - Comic Panel Style
// ============================================

interface PageHeaderV2Props {
  icon?: LucideIcon
  iconColor?: 'yellow' | 'blue' | 'pink' | 'green' | 'orange' | 'purple'
  title: string
  subtitle?: string
  description?: string
  mascotMood?: 'happy' | 'focused' | 'celebrating' | 'thinking' | 'sleepy'
  action?: React.ReactNode
  badge?: React.ReactNode
  className?: string
  variant?: 'default' | 'hero' | 'compact'
}

const iconColorClasses = {
  yellow: 'bg-yellow',
  blue: 'bg-blue',
  pink: 'bg-pink',
  green: 'bg-green',
  orange: 'bg-orange',
  purple: 'bg-purple',
}

const variantStyles = {
  default: 'py-6',
  hero: 'py-10 border-b-0',
  compact: 'py-3',
}

export function PageHeaderV2({
  icon: Icon,
  iconColor = 'yellow',
  title,
  subtitle,
  description,
  mascotMood = 'happy',
  action,
  badge,
  className,
  variant = 'default',
}: PageHeaderV2Props) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <motion.header
      initial={prefersReducedMotion ? false : { opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.3 }}
      className={cn(
        'relative bg-white border-b-3 border-black',
        variantStyles[variant],
        className
      )}
    >
      {/* Decorative corner elements */}
      <div className="absolute top-0 left-0 w-6 h-6 bg-yellow border-r-3 border-b-3 border-black" />
      <div className="absolute top-0 right-0 w-6 h-6 bg-pink border-l-3 border-b-3 border-black" />

      <div className="relative px-4 lg:px-6 max-w-7xl mx-auto">
        <div className="flex items-start gap-4">
          {/* Icon Badge */}
          {Icon && (
            <motion.div
              initial={prefersReducedMotion ? false : { scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={prefersReducedMotion ? { duration: 0 } : { delay: 0.1, type: 'spring', stiffness: 400 }}
              className={cn(
                'w-14 h-14 brutal-border brutal-radius flex items-center justify-center shrink-0',
                iconColorClasses[iconColor]
              )}
            >
              <Icon className="w-7 h-7" />
            </motion.div>
          )}

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="font-display font-bold text-2xl lg:text-3xl">
                {title}
              </h1>
              {badge}
            </div>
            {subtitle && (
              <p className="text-base text-black/70">{subtitle}</p>
            )}
            {description && (
              <p className="text-sm text-black/60 mt-1 max-w-2xl">{description}</p>
            )}
          </div>

          {/* Action Area */}
          {action && (
            <div className="shrink-0 ml-auto">{action}</div>
          )}
        </div>

        {/* Mascot Speech Bubble - Optional */}
        {variant === 'hero' && (
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={prefersReducedMotion ? { duration: 0 } : { delay: 0.3 }}
            className="mt-4 flex items-center gap-3"
          >
            <CartoonMascot mood={mascotMood} size="sm" animated={!prefersReducedMotion} />
            <div className="relative rounded-brutal border-3 border-black bg-white px-4 py-2 shadow-brutal-sm">
              <div className="absolute -left-2 top-4 h-3 w-3 rotate-45 border-b-3 border-l-3 border-black bg-white" />
              <p className="font-display text-sm font-bold">
                {mascotMood === 'happy' && "Let's build your career!"}
                {mascotMood === 'focused' && 'Stay focused and keep learning.'}
                {mascotMood === 'celebrating' && 'Amazing progress! Keep going!'}
                {mascotMood === 'thinking' && 'What skill should we learn next?'}
                {mascotMood === 'sleepy' && 'Take a break, you earned it!'}
              </p>
            </div>
          </motion.div>
        )}
      </div>

      {/* Bottom decorative line */}
      {variant === 'hero' && (
        <div className="mt-6 h-2 bg-gradient-to-r from-yellow via-pink to-blue" />
      )}
    </motion.header>
  )
}

// Skeleton loader for PageHeader
export function PageHeaderSkeleton() {
  return (
    <div className="bg-white border-b-3 border-black px-4 py-6">
      <div className="max-w-7xl mx-auto flex items-center gap-4">
        <div className="w-14 h-14 bg-gray-200 brutal-radius animate-pulse" />
        <div className="flex-1 space-y-2">
          <div className="h-8 bg-gray-200 rounded w-48 animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-72 animate-pulse" />
        </div>
      </div>
    </div>
  )
}

// Section title for comic panel style
interface SectionTitleProps {
  icon?: LucideIcon
  label: string
  count?: number
  action?: React.ReactNode
  variant?: 'default' | 'quest' | 'milestone'
}

export function SectionTitle({ icon: Icon, label, count, action, variant = 'default' }: SectionTitleProps) {
  const variantStyles = {
    default: 'bg-white',
    quest: 'bg-yellow',
    milestone: 'bg-green',
  }

  return (
    <div className={cn(
      'flex items-center justify-between px-4 py-3 brutal-border brutal-radius mb-4',
      variantStyles[variant]
    )}>
      <div className="flex items-center gap-3">
        {Icon && (
          <span className="w-8 h-8 bg-white brutal-border brutal-radius flex items-center justify-center">
            <Icon className="w-4 h-4" aria-hidden="true" />
          </span>
        )}
        <div>
          <h2 className="font-display font-bold text-lg">{label}</h2>
          {count !== undefined && (
            <p className="text-xs text-black/60">{count} items</p>
          )}
        </div>
      </div>
      {action}
    </div>
  )
}
