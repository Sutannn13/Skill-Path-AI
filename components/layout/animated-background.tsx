'use client'

import { usePathname } from 'next/navigation'
import {
  CartoonBackground,
  type CartoonBackgroundProps,
} from '@/components/illustrations/cartoon-background'
import type {
  CartoonBackgroundIntensity,
  CartoonBackgroundVariant,
} from '@/components/illustrations/floating-doodles'

interface AnimatedBackgroundProps {
  className?: string
  intensity?: 'low' | 'medium' | 'high'
  showFloatingShapes?: boolean
  variant?: CartoonBackgroundVariant
  animated?: boolean
}

export function AnimatedBackground({
  className,
  intensity = 'medium',
  showFloatingShapes = true,
  variant,
  animated = true,
}: AnimatedBackgroundProps) {
  const mappedIntensity: CartoonBackgroundIntensity =
    intensity === 'medium' ? 'normal' : intensity
  return (
    <CartoonBackground
      variant={variant}
      intensity={mappedIntensity}
      showDoodles={showFloatingShapes}
      animated={animated}
      className={className}
    />
  )
}

function inferVariantFromPath(pathname: string | null): CartoonBackgroundVariant {
  if (!pathname) return 'default'
  if (pathname.startsWith('/dashboard')) return 'dashboard'
  if (pathname.startsWith('/roadmap/tasks') && pathname.endsWith('/quiz')) return 'quiz'
  if (pathname.startsWith('/roadmap/tasks') && pathname.endsWith('/project')) return 'project'
  if (pathname.startsWith('/roadmap/final-project')) return 'project'
  if (pathname.startsWith('/roadmap')) return 'roadmap'
  if (pathname.startsWith('/sprint')) return 'sprint'
  if (pathname.startsWith('/jobs')) return 'jobs'
  if (pathname.startsWith('/settings')) return 'settings'
  if (pathname.startsWith('/onboarding')) return 'onboarding'
  if (pathname.startsWith('/skills')) return 'skills'
  if (pathname.startsWith('/github') || pathname.startsWith('/projects')) return 'github'
  if (pathname.startsWith('/cv-analyzer')) return 'github'
  if (
    pathname.startsWith('/login') ||
    pathname.startsWith('/register') ||
    pathname.startsWith('/forgot-password') ||
    pathname.startsWith('/reset-password')
  ) {
    return 'auth'
  }

  return 'default'
}

export function GradientBackground({
  className,
  variant,
  intensity = 'normal',
  showGrid = true,
  showDoodles = true,
  animated = true,
}: CartoonBackgroundProps) {
  const pathname = usePathname()
  const resolvedVariant = variant ?? inferVariantFromPath(pathname)

  return (
    <CartoonBackground
      variant={resolvedVariant}
      intensity={intensity}
      showGrid={showGrid}
      showDoodles={showDoodles}
      animated={animated}
      className={className}
    />
  )
}
