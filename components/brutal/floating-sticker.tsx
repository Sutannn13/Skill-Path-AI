'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { GraduationCap, Laptop, BookOpen, Code, Award } from 'lucide-react'

interface FloatingStickerProps {
  icon?: 'laptop' | 'badge' | 'rocket' | 'book' | 'checklist' | 'code' | 'graduation'
  color?: 'yellow' | 'blue' | 'pink' | 'green' | 'orange' | 'purple'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  animate?: boolean
}

const iconMap = {
  laptop: Laptop,
  badge: Award,
  rocket: GraduationCap,
  book: BookOpen,
  checklist: Award,
  code: Code,
  graduation: GraduationCap,
}

const colorClasses = {
  yellow: 'bg-yellow',
  blue: 'bg-blue',
  pink: 'bg-pink',
  green: 'bg-green',
  orange: 'bg-orange',
  purple: 'bg-purple',
}

const sizeClasses = {
  sm: 'w-10 h-10',
  md: 'w-16 h-16',
  lg: 'w-24 h-24',
}

const iconSizes = {
  sm: 'w-5 h-5',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
}

export function FloatingSticker({
  icon = 'graduation',
  color = 'yellow',
  size = 'md',
  className,
  animate = true,
}: FloatingStickerProps) {
  const prefersReducedMotion = useReducedMotion()
  const IconComponent = iconMap[icon]

  const sticker = (
    <div
      className={cn(
        'brutal-border brutal-radius flex items-center justify-center',
        colorClasses[color],
        sizeClasses[size],
        className
      )}
    >
      <IconComponent className={iconSizes[size]} />
    </div>
  )

  if (animate && !prefersReducedMotion) {
    const getAnimation = () => {
      switch (icon) {
        case 'laptop':
          return { y: [0, -15, 0], rotate: [-2, 2, -2] }
        case 'badge':
          return { y: [0, -10, 0], rotate: [0, 5, 0] }
        case 'rocket':
          return { y: [0, -20, 0], rotate: [-5, 5, -5] }
        case 'book':
          return { y: [0, -12, 0], rotate: [2, -2, 2] }
        case 'checklist':
          return { y: [0, -8, 0], rotate: [-1, 1, -1] }
        case 'code':
          return { y: [0, -14, 0], rotate: [1, -1, 1] }
        case 'graduation':
          return { y: [0, -18, 0], rotate: [-3, 3, -3] }
        default:
          return { y: [0, -10, 0] }
      }
    }

    return (
      <motion.div
        animate={getAnimation()}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        {sticker}
      </motion.div>
    )
  }

  return sticker
}

interface StickerGroupProps {
  stickers: FloatingStickerProps[]
  className?: string
}

export function StickerGroup({ stickers, className }: StickerGroupProps) {
  const prefersReducedMotion = useReducedMotion()
  return (
    <div className={cn('flex gap-4 flex-wrap', className)}>
      {stickers.map((sticker, i) => (
        <motion.div
          key={i}
          initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.8 }}
          animate={prefersReducedMotion ? undefined : { opacity: 1, scale: 1 }}
          transition={prefersReducedMotion ? undefined : { delay: i * 0.1 }}
        >
          <FloatingSticker {...sticker} />
        </motion.div>
      ))}
    </div>
  )
}
