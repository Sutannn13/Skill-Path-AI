'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface AnimatedBackgroundProps {
  className?: string
  intensity?: 'low' | 'medium' | 'high'
  showFloatingShapes?: boolean
}

export function AnimatedBackground({
  className,
  intensity = 'medium',
  showFloatingShapes = true,
}: AnimatedBackgroundProps) {
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mediaQuery.matches)

    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches)
    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [])

  if (reducedMotion) {
    return <div className={cn('bg-background', className)} />
  }

  const shapeCount = intensity === 'low' ? 3 : intensity === 'medium' ? 5 : 8

  return (
    <div className={cn('fixed inset-0 -z-10 overflow-hidden bg-background', className)}>
      {/* Gradient orbs */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-yellow/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute top-40 right-20 w-96 h-96 bg-blue/10 rounded-full blur-3xl animate-pulse delay-1000" />
      <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-pink/10 rounded-full blur-3xl animate-pulse delay-500" />
      <div className="absolute bottom-40 right-10 w-72 h-72 bg-green/10 rounded-full blur-3xl animate-pulse delay-1500" />

      {/* Floating shapes */}
      {showFloatingShapes && (
        <>
          <FloatingShape
            type="circle"
            color="yellow"
            position="top-20 left-[10%]"
            size="w-4 h-4"
            delay={0}
          />
          <FloatingShape
            type="square"
            color="blue"
            position="top-40 right-[15%]"
            size="w-6 h-6"
            delay={0.5}
          />
          <FloatingShape
            type="circle"
            color="pink"
            position="top-60 left-[30%]"
            size="w-3 h-3"
            delay={1}
          />
          <FloatingShape
            type="triangle"
            color="green"
            position="bottom-40 right-[20%]"
            size="w-5 h-5"
            delay={1.5}
          />
          {intensity !== 'low' && (
            <>
              <FloatingShape
                type="circle"
                color="orange"
                position="top-80 left-[60%]"
                size="w-4 h-4"
                delay={0.3}
              />
              <FloatingShape
                type="square"
                color="purple"
                position="bottom-60 left-[10%]"
                size="w-3 h-3"
                delay={0.8}
              />
              {intensity === 'high' && (
                <>
                  <FloatingShape
                    type="triangle"
                    color="yellow"
                    position="top-32 right-[40%]"
                    size="w-4 h-4"
                    delay={1.2}
                  />
                  <FloatingShape
                    type="circle"
                    color="blue"
                    position="bottom-32 right-[60%]"
                    size="w-3 h-3"
                    delay={2}
                  />
                </>
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}

interface FloatingShapeProps {
  type: 'circle' | 'square' | 'triangle'
  color: 'yellow' | 'blue' | 'pink' | 'green' | 'orange' | 'purple'
  position: string
  size: string
  delay: number
}

function FloatingShape({ type, color, position, size, delay }: FloatingShapeProps) {
  const colorClasses = {
    yellow: 'bg-yellow',
    blue: 'bg-blue',
    pink: 'bg-pink',
    green: 'bg-green',
    orange: 'bg-orange',
    purple: 'bg-purple',
  }

  return (
    <div
      className={cn(
        'absolute opacity-60 animate-float',
        position,
        size
      )}
      style={{
        animationDelay: `${delay}s`,
      }}
    >
      {type === 'circle' && (
        <div className={cn('w-full h-full rounded-full', colorClasses[color])} />
      )}
      {type === 'square' && (
        <div className={cn('w-full h-full brutal-radius', colorClasses[color])} />
      )}
      {type === 'triangle' && (
        <svg viewBox="0 0 24 24" className="w-full h-full">
          <polygon
            points="12,2 22,22 2,22"
            className={colorClasses[color]}
          />
        </svg>
      )}
    </div>
  )
}

export function GradientBackground({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'fixed inset-0 -z-10 bg-gradient-to-br from-background via-yellow/5 via-pink/5 via-blue/5 to-background',
        className
      )}
    />
  )
}