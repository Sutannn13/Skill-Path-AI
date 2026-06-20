'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils'

export type CardColor = 'white' | 'yellow' | 'blue' | 'pink' | 'green' | 'orange' | 'purple' | 'black' | 'gray' | 'red'

interface BrutalCardProps {
  children: React.ReactNode
  className?: string
  color?: CardColor
  shadow?: 'sm' | 'md' | 'lg'
  animate?: boolean
}

const colorClasses: Record<CardColor, string> = {
  white: 'bg-white',
  yellow: 'bg-yellow',
  blue: 'bg-blue',
  pink: 'bg-pink',
  green: 'bg-green',
  orange: 'bg-orange',
  purple: 'bg-purple',
  black: 'bg-black text-white',
  gray: 'bg-gray-100',
  red: 'bg-red text-white',
}

const shadowClasses = {
  sm: 'shadow-brutal-sm',
  md: 'shadow-brutal',
  lg: 'shadow-brutal-lg',
}

export function BrutalCard({
  children,
  className,
  color = 'white',
  shadow = 'md',
  animate = false,
}: BrutalCardProps) {
  const prefersReducedMotion = useReducedMotion()
  const baseClasses = cn(
    'brutal-border brutal-radius border-3 p-6',
    colorClasses[color],
    shadowClasses[shadow],
    className
  )

  if (animate) {
    return (
      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
        animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
        transition={prefersReducedMotion ? undefined : { duration: 0.4, ease: 'easeOut' }}
        className={baseClasses}
      >
        {children}
      </motion.div>
    )
  }

  return <div className={baseClasses}>{children}</div>
}

export function BrutalCardHover({
  children,
  className,
  color = 'white',
  onClick,
  ariaLabel,
}: {
  children: React.ReactNode
  className?: string
  color?: CardColor
  onClick?: () => void
  ariaLabel?: string
}) {
  const prefersReducedMotion = useReducedMotion()
  const interactive = typeof onClick === 'function'
  return (
    <motion.div
      whileHover={prefersReducedMotion ? undefined : { x: -4, y: -4 }}
      whileTap={prefersReducedMotion ? undefined : { x: 0, y: 0 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      onClick={onClick}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      aria-label={interactive ? ariaLabel : undefined}
      onKeyDown={
        interactive
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onClick?.()
              }
            }
          : undefined
      }
      className={cn(
        'brutal-border brutal-radius border-3 p-6',
        interactive && 'cursor-pointer focus-brutal-ring',
        colorClasses[color],
        'shadow-brutal hover:shadow-brutal-lg',
        className
      )}
    >
      {children}
    </motion.div>
  )
}
