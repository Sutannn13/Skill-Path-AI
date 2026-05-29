'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { cn } from '@/lib/utils'

// ============================================
// 3D EFFECTS & ANIMATIONS
// ============================================

interface ParallaxCardProps {
  children: React.ReactNode
  className?: string
  speed?: number
}

export function ParallaxCard({ children, className, speed = 0.5 }: ParallaxCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start']
  })

  const y = useTransform(scrollYProgress, [0, 1], [-50 * speed, 50 * speed])

  return (
    <motion.div ref={ref} style={{ y }} className={className}>
      {children}
    </motion.div>
  )
}

interface Hover3DCardProps {
  children: React.ReactNode
  className?: string
  perspective?: number
}

export function Hover3DCard({ children, className, perspective = 1000 }: Hover3DCardProps) {
  return (
    <motion.div
      className={cn('transition-transform duration-300 ease-out', className)}
      whileHover={{
        scale: 1.02,
        rotateY: 5,
        rotateX: -5,
        transition: { duration: 0.3 }
      }}
      whileTap={{ scale: 0.98 }}
      style={{ perspective }}
    >
      {children}
    </motion.div>
  )
}

// ============================================
// FLOATING ELEMENTS
// ============================================

interface FloatingElementProps {
  children: React.ReactNode
  className?: string
  delay?: number
  duration?: number
  distance?: number
}

export function FloatingElement({
  children,
  className,
  delay = 0,
  duration = 3,
  distance = 20
}: FloatingElementProps) {
  return (
    <motion.div
      className={className}
      animate={{
        y: [0, -distance, 0],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      {children}
    </motion.div>
  )
}

interface RotatingElementProps {
  children: React.ReactNode
  className?: string
  duration?: number
}

export function RotatingElement({ children, className, duration = 10 }: RotatingElementProps) {
  return (
    <motion.div
      className={className}
      animate={{ rotate: 360 }}
      transition={{
        duration,
        repeat: Infinity,
        ease: 'linear',
      }}
    >
      {children}
    </motion.div>
  )
}

// ============================================
// GLOW EFFECTS
// ============================================

interface GlowCardProps {
  children: React.ReactNode
  className?: string
  color?: 'yellow' | 'blue' | 'pink' | 'green' | 'orange' | 'purple'
  intensity?: 'low' | 'medium' | 'high'
}

const glowColors = {
  yellow: '0 0 20px rgba(255, 212, 71, 0.5)',
  blue: '0 0 20px rgba(124, 201, 255, 0.5)',
  pink: '0 0 20px rgba(255, 143, 171, 0.5)',
  green: '0 0 20px rgba(155, 229, 100, 0.5)',
  orange: '0 0 20px rgba(255, 184, 107, 0.5)',
  purple: '0 0 20px rgba(179, 157, 219, 0.5)',
}

export function GlowCard({ children, className, color = 'yellow', intensity = 'medium' }: GlowCardProps) {
  const intensityMultiplier = { low: 0.5, medium: 1, high: 1.5 }[intensity]
  const glow = glowColors[color]

  return (
    <motion.div
      className={cn('transition-shadow duration-300', className)}
      whileHover={{
        boxShadow: glow,
        scale: 1.02,
      }}
      whileTap={{ scale: 0.98 }}
    >
      {children}
    </motion.div>
  )
}

// ============================================
// PULSE ANIMATIONS
// ============================================

interface PulseDotProps {
  className?: string
  color?: string
}

export function PulseDot({ className, color = 'bg-red' }: PulseDotProps) {
  return (
    <span className={cn('relative inline-flex h-3 w-3', className)}>
      <span className={cn('animate-ping absolute inline-flex h-full w-full rounded-full opacity-75', color)} />
      <span className={cn('relative inline-flex rounded-full h-3 w-3', color)} />
    </span>
  )
}

// ============================================
// PARTICLE/STAR BURST
// ============================================

interface StarBurstProps {
  className?: string
  count?: number
  color?: string
}

export function StarBurst({ className, count = 8, color = 'bg-yellow' }: StarBurstProps) {
  return (
    <div className={cn('relative', className)}>
      {Array.from({ length: count }).map((_, i) => {
        const angle = (i / count) * 360
        const distance = 30 + Math.random() * 20
        const x = Math.cos((angle * Math.PI) / 180) * distance
        const y = Math.sin((angle * Math.PI) / 180) * distance

        return (
          <motion.div
            key={i}
            className={cn('absolute w-2 h-2 rounded-full', color)}
            initial={{ x: 0, y: 0, scale: 0, opacity: 0 }}
            animate={{
              x,
              y,
              scale: [0, 1, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 1,
              delay: i * 0.05,
              repeat: Infinity,
              repeatDelay: 2,
            }}
          />
        )
      })}
    </div>
  )
}

// ============================================
// CONFETTI BURST
// ============================================

interface ConfettiBurstProps {
  className?: string
  count?: number
}

const confettiColors = ['bg-yellow', 'bg-pink', 'bg-blue', 'bg-green', 'bg-orange', 'bg-purple']

export function ConfettiBurst({ className, count = 50 }: ConfettiBurstProps) {
  return (
    <div className={cn('relative overflow-hidden', className)}>
      {Array.from({ length: count }).map((_, i) => {
        const startX = Math.random() * 100
        const startY = -10
        const endX = startX + (Math.random() - 0.5) * 100
        const endY = 100 + Math.random() * 50
        const rotation = Math.random() * 720 - 360
        const color = confettiColors[Math.floor(Math.random() * confettiColors.length)]

        return (
          <motion.div
            key={i}
            className={cn('absolute w-2 h-2', color)}
            initial={{
              left: `${startX}%`,
              top: `${startY}%`,
              scale: 0,
              rotate: 0,
              opacity: 1,
            }}
            animate={{
              left: `${endX}%`,
              top: `${endY}%`,
              scale: [0, 1, 0.5],
              rotate: rotation,
              opacity: [1, 1, 0],
            }}
            transition={{
              duration: 2 + Math.random(),
              delay: Math.random() * 0.5,
              ease: 'easeOut',
            }}
          />
        )
      })}
    </div>
  )
}

// ============================================
// NUMBER COUNTER
// ============================================

interface AnimatedCounterProps {
  value: number
  className?: string
  duration?: number
}

export function AnimatedCounter({ value, className, duration = 2 }: AnimatedCounterProps) {
  return (
    <motion.span
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration }}
      className={className}
    >
      {value}
    </motion.span>
  )
}

// ============================================
// SKELETON LOADERS
// ============================================

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse bg-gray-200 brutal-radius',
        className
      )}
    />
  )
}

export function SkeletonCard() {
  return (
    <div className="brutal-border brutal-radius p-6 bg-white">
      <div className="flex items-center gap-4 mb-4">
        <Skeleton className="w-12 h-12" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <Skeleton className="h-3 w-full mb-2" />
      <Skeleton className="h-3 w-2/3" />
    </div>
  )
}

// ============================================
// PROGRESS RING
// ============================================

interface ProgressRingProps {
  progress: number
  size?: number
  strokeWidth?: number
  color?: string
  className?: string
}

export function ProgressRing({
  progress,
  size = 60,
  strokeWidth = 6,
  color = '#FFD447',
  className,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (progress / 100) * circumference

  return (
    <svg className={className} width={size} height={size}>
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
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1, ease: 'easeOut' }}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      {/* Center text */}
      <text
        x="50%"
        y="50%"
        dominantBaseline="middle"
        textAnchor="middle"
        className="font-bold text-sm"
      >
        {Math.round(progress)}%
      </text>
    </svg>
  )
}

// ============================================
// MARQUEE SCROLL
// ============================================

interface MarqueeProps {
  children: React.ReactNode
  className?: string
  speed?: number
  direction?: 'left' | 'right'
}

export function Marquee({ children, className, speed = 20, direction = 'left' }: MarqueeProps) {
  return (
    <div className={cn('overflow-hidden', className)}>
      <motion.div
        className="flex gap-8 whitespace-nowrap"
        animate={{ x: direction === 'left' ? ['0%', '-50%'] : ['-50%', '0%'] }}
        transition={{
          x: {
            duration: speed,
            repeat: Infinity,
            repeatType: 'loop',
            ease: 'linear',
          },
        }}
      >
        {/* Render content twice for seamless loop */}
        <div className="flex gap-8 whitespace-nowrap">
          {children}
        </div>
        <div className="flex gap-8 whitespace-nowrap">
          {children}
        </div>
      </motion.div>
    </div>
  )
}

// ============================================
// TYPEWRITER EFFECT
// ============================================

interface TypewriterTextProps {
  text: string
  className?: string
  speed?: number
}

export function TypewriterText({ text, className, speed = 50 }: TypewriterTextProps) {
  return (
    <motion.span
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {text.split('').map((char, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * (speed / 1000) }}
        >
          {char}
        </motion.span>
      ))}
    </motion.span>
  )
}