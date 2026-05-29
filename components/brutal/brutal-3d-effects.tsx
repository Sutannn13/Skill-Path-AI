'use client'

import { useRef, useState } from 'react'
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

// ============================================
// HELPER CONSTANTS
// ============================================

const depthColors: Record<string, string> = {
  yellow: 'bg-yellow',
  blue: 'bg-blue',
  pink: 'bg-pink',
  green: 'bg-green',
  orange: 'bg-orange',
  purple: 'bg-purple',
  white: 'bg-white',
}

const borderColors: Record<string, string> = {
  yellow: '#FFD447',
  blue: '#7CC9FF',
  pink: '#FF8FAB',
  green: '#9BE564',
  orange: '#FFB86B',
  purple: '#B39DDB',
}

// ============================================
// 3D TILT CARD
// ============================================

interface TiltCardProps {
  children: React.ReactNode
  className?: string
  maxTilt?: number
  perspective?: number
  glowOnHover?: boolean
  glowColor?: 'yellow' | 'blue' | 'pink' | 'green' | 'orange' | 'purple'
}

const glowColors = {
  yellow: 'rgba(255, 212, 71, 0.4)',
  blue: 'rgba(124, 201, 255, 0.4)',
  pink: 'rgba(255, 143, 171, 0.4)',
  green: 'rgba(155, 229, 100, 0.4)',
  orange: 'rgba(255, 184, 107, 0.4)',
  purple: 'rgba(179, 157, 219, 0.4)',
}

export function TiltCard({
  children,
  className,
  maxTilt = 8,
  perspective = 1000,
  glowOnHover = false,
  glowColor = 'yellow',
}: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)

  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const mouseXSpring = useSpring(x, { stiffness: 200, damping: 20 })
  const mouseYSpring = useSpring(y, { stiffness: 200, damping: 20 })

  // Use CSS string interpolation for smooth 3D rotation
  const rotateXValue = useTransform(mouseYSpring, [-0.5, 0.5], [-maxTilt, maxTilt])
  const rotateYValue = useTransform(mouseXSpring, [-0.5, 0.5], [maxTilt, -maxTilt])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return

    const width = rect.width
    const height = rect.height
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top

    const xPct = mouseX / width - 0.5
    const yPct = mouseY / height - 0.5

    x.set(xPct)
    y.set(yPct)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
    setIsHovered(false)
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        perspective,
        transformStyle: 'preserve-3d',
        rotateX: rotateXValue,
        rotateY: rotateYValue,
        scale: isHovered ? 1.02 : 1,
      }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className={cn('relative', className)}
    >
      {/* Glow effect */}
      {glowOnHover && isHovered && (
        <div
          className="absolute inset-0 rounded-brutal pointer-events-none"
          style={{
            boxShadow: `0 0 30px ${glowColors[glowColor]}, 0 0 60px ${glowColors[glowColor]}`,
            transform: 'translateZ(0)',
          }}
        />
      )}

      {/* Content */}
      <div style={{ transformStyle: 'preserve-3d' }}>
        {children}
      </div>
    </motion.div>
  )
}

// ============================================
// HOVER 3D BUTTON
// ============================================

interface Hover3DButtonProps {
  children: React.ReactNode
  onClick?: () => void
  className?: string
  color?: 'yellow' | 'blue' | 'pink' | 'green' | 'orange' | 'purple'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
}

const buttonColors = {
  yellow: 'bg-yellow',
  blue: 'bg-blue',
  pink: 'bg-pink',
  green: 'bg-green',
  orange: 'bg-orange',
  purple: 'bg-purple',
}

export function Hover3DButton({
  children,
  onClick,
  className,
  color = 'yellow',
  size = 'md',
  disabled = false,
}: Hover3DButtonProps) {
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  }

  return (
    <motion.button
      onClick={onClick}
      whileHover={disabled ? {} : { scale: 1.05, y: -4 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={cn(
        'brutal-border brutal-radius font-bold shadow-brutal transition-shadow',
        buttonColors[color],
        sizeClasses[size],
        disabled && 'opacity-50 cursor-not-allowed',
        !disabled && 'hover:shadow-brutal-lg cursor-pointer',
        className
      )}
    >
      <span className="relative z-10">{children}</span>
    </motion.button>
  )
}

// ============================================
// FLOATING 3D ICON
// ============================================

interface Floating3DIconProps {
  icon: LucideIcon
  className?: string
  color?: 'yellow' | 'blue' | 'pink' | 'green' | 'orange' | 'purple'
  size?: 'sm' | 'md' | 'lg'
  animated?: boolean
}

const iconColors = {
  yellow: 'bg-yellow',
  blue: 'bg-blue',
  pink: 'bg-pink',
  green: 'bg-green',
  orange: 'bg-orange',
  purple: 'bg-purple',
}

const iconSizes = {
  sm: 'w-10 h-10',
  md: 'w-14 h-14',
  lg: 'w-20 h-20',
}

const iconClasses = {
  sm: 'w-5 h-5',
  md: 'w-7 h-7',
  lg: 'w-10 h-10',
}

export function Floating3DIcon({
  icon: Icon,
  className,
  color = 'yellow',
  size = 'md',
  animated = true,
}: Floating3DIconProps) {
  const Component = animated ? motion.div : 'div'

  return (
    <Component
      className={cn(
        'brutal-border brutal-radius flex items-center justify-center shadow-brutal-sm',
        iconColors[color],
        iconSizes[size],
        className
      )}
      animate={animated ? {
        y: [0, -10, 0],
        rotate: [-3, 3, -3],
      } : undefined}
      transition={animated ? {
        duration: 3,
        repeat: Infinity,
        ease: 'easeInOut',
      } : undefined}
    >
      <Icon className={iconClasses[size]} />
    </Component>
  )
}

// ============================================
// DEPTH CARD
// ============================================

interface DepthCardProps {
  children: React.ReactNode
  className?: string
  depth?: number
  color?: 'yellow' | 'blue' | 'pink' | 'green' | 'orange' | 'purple' | 'white'
}

export function DepthCard({
  children,
  className,
  depth = 4,
  color = 'white',
}: DepthCardProps) {
  const shadows = {
    2: 'shadow-brutal-sm',
    4: 'shadow-brutal',
    6: 'shadow-brutal-lg',
    8: 'shadow-brutal-xl',
  }

  return (
    <div
      className={cn(
        'brutal-border brutal-radius p-6',
        depthColors[color],
        shadows[depth as keyof typeof shadows] || 'shadow-brutal',
        className
      )}
    >
      {children}
    </div>
  )
}

// ============================================
// GLASS CARD
// ============================================

interface GlassCardProps {
  children: React.ReactNode
  className?: string
  blur?: 'sm' | 'md' | 'lg'
}

const blurClasses = {
  sm: 'backdrop-blur-sm',
  md: 'backdrop-blur-md',
  lg: 'backdrop-blur-lg',
}

export function GlassCard({
  children,
  className,
  blur = 'md',
}: GlassCardProps) {
  return (
    <div
      className={cn(
        'bg-white/80 border-2 border-black/10 rounded-brutal p-6',
        blurClasses[blur],
        className
      )}
    >
      {children}
    </div>
  )
}

// ============================================
// HOVER LIFT CARD
// ============================================

interface HoverLiftCardProps {
  children: React.ReactNode
  className?: string
  liftAmount?: number
  color?: 'yellow' | 'blue' | 'pink' | 'green' | 'orange' | 'purple' | 'white'
}

export function HoverLiftCard({
  children,
  className,
  liftAmount = 8,
  color = 'white',
}: HoverLiftCardProps) {
  return (
    <motion.div
      whileHover={{
        y: -liftAmount,
        boxShadow: '8px 8px 0px 0px #111111',
      }}
      whileTap={{ y: -2 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={cn(
        'brutal-border brutal-radius p-6 cursor-pointer transition-shadow',
        depthColors[color] || 'bg-white',
        className
      )}
    >
      {children}
    </motion.div>
  )
}

// ============================================
// ANIMATED BORDER CARD
// ============================================

interface AnimatedBorderCardProps {
  children: React.ReactNode
  className?: string
  borderColor?: 'yellow' | 'blue' | 'pink' | 'green' | 'orange' | 'purple'
  animate?: boolean
}

export function AnimatedBorderCard({
  children,
  className,
  borderColor = 'yellow',
  animate = true,
}: AnimatedBorderCardProps) {
  return (
    <motion.div
      className={cn('brutal-radius p-6 bg-white relative overflow-hidden', className)}
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      {/* Animated border gradient */}
      {animate && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `linear-gradient(90deg, ${borderColors[borderColor]}, transparent, ${borderColors[borderColor]})`,
            backgroundSize: '200% 100%',
          }}
          animate={{
            backgroundPosition: ['0% 50%', '200% 50%', '0% 50%'],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      )}

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>

      {/* Border */}
      <div className="absolute inset-0 brutal-border rounded-brutal pointer-events-none" />
    </motion.div>
  )
}

// ============================================
// PULSE BORDER CARD
// ============================================

interface PulseBorderCardProps {
  children: React.ReactNode
  className?: string
  color?: 'yellow' | 'blue' | 'pink' | 'green' | 'orange' | 'purple'
  pulseColor?: string
}

export function PulseBorderCard({
  children,
  className,
  color = 'yellow',
  pulseColor,
}: PulseBorderCardProps) {
  return (
    <motion.div
      className={cn('brutal-radius p-6 bg-white relative', className)}
      whileHover={{ scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      {/* Pulse effect */}
      <motion.div
        className="absolute inset-0 brutal-radius"
        style={{ backgroundColor: pulseColor || borderColors[color] }}
        initial={{ opacity: 0, scale: 1 }}
        whileHover={{
          opacity: [0, 0.3, 0],
          scale: [1, 1.05],
        }}
        transition={{ duration: 0.8 }}
      />

      {/* Border */}
      <div className="brutal-border brutal-radius relative z-10">
        {children}
      </div>
    </motion.div>
  )
}