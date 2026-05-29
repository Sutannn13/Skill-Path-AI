'use client'

import { CartoonBackground } from './cartoon-background'
import type { CartoonBackgroundIntensity } from './floating-doodles'
import { cn } from '@/lib/utils'

interface AnimatedBrutalBackgroundProps {
  variant?: 'login' | 'register' | 'default'
  intensity?: 'low' | 'medium' | 'high'
  className?: string
  showDoodles?: boolean
}

export function AnimatedBrutalBackground({
  variant = 'default',
  intensity = 'medium',
  className,
  showDoodles = true,
}: AnimatedBrutalBackgroundProps) {
  const mappedIntensity: CartoonBackgroundIntensity =
    intensity === 'medium' ? 'normal' : intensity
  const backgroundVariant = variant === 'login' || variant === 'register' ? 'auth' : 'default'

  return (
    <CartoonBackground
      variant={backgroundVariant}
      intensity={mappedIntensity}
      showDoodles={showDoodles}
      className={className}
    />
  )
}

export function BrutalBackgroundStyles() {
  return null
}

export function BouncingDots({ className }: { className?: string }) {
  return (
    <div className={cn('relative h-full w-full', className)}>
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="cartoon-bob absolute bottom-[10%] h-3 w-3 brutal-border brutal-radius bg-yellow"
          style={{
            left: `${15 + i * 15}%`,
            animationDuration: `${2 + i * 0.3}s`,
            animationDelay: `${i * 0.2}s`,
          }}
        />
      ))}
    </div>
  )
}
