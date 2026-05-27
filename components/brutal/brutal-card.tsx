'use client'

import { motion } from 'framer-motion'
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
  const baseClasses = cn(
    'brutal-border brutal-radius border-3 p-6',
    colorClasses[color],
    shadowClasses[shadow],
    className
  )

  if (animate) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
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
}: {
  children: React.ReactNode
  className?: string
  color?: CardColor
  onClick?: () => void
}) {
  return (
    <motion.div
      whileHover={{ x: -4, y: -4 }}
      whileTap={{ x: 0, y: 0 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      onClick={onClick}
      className={cn(
        'brutal-border brutal-radius border-3 p-6 cursor-pointer',
        colorClasses[color],
        'shadow-brutal hover:shadow-brutal-lg',
        className
      )}
    >
      {children}
    </motion.div>
  )
}