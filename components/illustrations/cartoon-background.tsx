import { cn } from '@/lib/utils'
import {
  FloatingDoodles,
  type CartoonBackgroundIntensity,
  type CartoonBackgroundVariant,
} from './floating-doodles'

export interface CartoonBackgroundProps {
  variant?: CartoonBackgroundVariant
  intensity?: CartoonBackgroundIntensity
  showGrid?: boolean
  showDoodles?: boolean
  animated?: boolean
  className?: string
}

const accentByVariant: Record<CartoonBackgroundVariant, string> = {
  default: 'from-yellow/10 via-pink/5 to-blue/10',
  dashboard: 'from-yellow/14 via-green/6 to-blue/10',
  roadmap: 'from-pink/12 via-yellow/8 to-green/10',
  sprint: 'from-green/12 via-yellow/8 to-orange/10',
  jobs: 'from-blue/14 via-yellow/6 to-pink/10',
  quiz: 'from-purple/14 via-yellow/8 to-blue/10',
  project: 'from-blue/12 via-orange/8 to-green/10',
  settings: 'from-white via-purple/8 to-yellow/8',
  onboarding: 'from-yellow/12 via-green/8 to-pink/10',
  auth: 'from-yellow/12 via-pink/8 to-blue/12',
  skills: 'from-green/12 via-yellow/8 to-blue/10',
  github: 'from-blue/12 via-green/8 to-orange/10',
}

const intensityOpacity: Record<CartoonBackgroundIntensity, string> = {
  low: 'opacity-70',
  normal: 'opacity-85',
  high: 'opacity-100',
}

export function CartoonBackground({
  variant = 'default',
  intensity = 'normal',
  showGrid = true,
  showDoodles = true,
  animated = true,
  className,
}: CartoonBackgroundProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-background',
        intensityOpacity[intensity],
        className
      )}
    >
      <div className={cn('absolute inset-0 bg-gradient-to-br', accentByVariant[variant])} />
      {showGrid && <div className="cartoon-paper-grid absolute inset-0" />}
      <div className="cartoon-paper-noise absolute inset-0" />

      <div className="absolute left-[5%] top-[18%] hidden h-24 w-40 rotate-[-8deg] rounded-brutal border-3 border-black bg-yellow/15 shadow-brutal-sm sm:block" />
      <div className="absolute bottom-[16%] right-[4%] hidden h-28 w-36 rotate-[9deg] rounded-brutal border-3 border-black bg-blue/12 shadow-brutal-sm md:block" />
      <div className="absolute right-[22%] top-[58%] hidden h-16 w-28 rotate-[-3deg] rounded-brutal border-3 border-black bg-green/12 shadow-brutal-sm lg:block" />

      {showDoodles && (
        <FloatingDoodles variant={variant} intensity={intensity} animated={animated} />
      )}
    </div>
  )
}
