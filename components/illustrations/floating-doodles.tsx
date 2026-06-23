import type { LucideIcon } from 'lucide-react'
import {
  BookOpen,
  Briefcase,
  CalendarDays,
  CheckCircle2,
  Cloud,
  Code2,
  Flag,
  Folder,
  HelpCircle,
  Laptop,
  Map,
  MapPin,
  Pencil,
  Rocket,
  Search,
  Settings,
  Sparkles,
  Star,
  Terminal,
  Trophy,
  Wrench,
  Zap,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export type CartoonBackgroundVariant =
  | 'default'
  | 'dashboard'
  | 'roadmap'
  | 'sprint'
  | 'jobs'
  | 'quiz'
  | 'project'
  | 'settings'
  | 'onboarding'
  | 'auth'
  | 'skills'
  | 'github'

export type CartoonBackgroundIntensity = 'low' | 'normal' | 'high'

type DoodleColor = 'yellow' | 'blue' | 'pink' | 'green' | 'orange' | 'purple' | 'white'
type DoodleMotion = 'float' | 'floatReverse' | 'bob' | 'drift' | 'wiggle'

interface DoodleItem {
  id: string
  icon?: LucideIcon
  label?: string
  color: DoodleColor
  className: string
  size?: 'sm' | 'md' | 'lg'
  motion?: DoodleMotion
  hideOnMobile?: boolean
}

interface FloatingDoodlesProps {
  variant?: CartoonBackgroundVariant
  intensity?: CartoonBackgroundIntensity
  animated?: boolean
  className?: string
}

const colorClasses: Record<DoodleColor, string> = {
  yellow: 'bg-yellow',
  blue: 'bg-blue',
  pink: 'bg-pink',
  green: 'bg-green',
  orange: 'bg-orange',
  purple: 'bg-purple',
  white: 'bg-white',
}

const sizeClasses = {
  sm: 'h-10 min-w-10 px-2 text-xs',
  md: 'h-14 min-w-14 px-3 text-sm',
  lg: 'h-20 min-w-20 px-4 text-base',
}

const iconSizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
}

const motionClasses: Record<DoodleMotion, string> = {
  float: 'cartoon-float-slow',
  floatReverse: 'cartoon-float-reverse',
  bob: 'cartoon-bob',
  drift: 'cartoon-drift',
  wiggle: 'cartoon-wiggle-soft',
}

const baseDoodles: DoodleItem[] = [
  {
    id: 'cloud-left',
    icon: Cloud,
    color: 'white',
    className: 'left-[4%] top-[10%] rotate-[-8deg]',
    size: 'md',
    motion: 'float',
  },
  {
    id: 'terminal-right',
    icon: Terminal,
    color: 'blue',
    className: 'right-[8%] top-[16%] rotate-[6deg]',
    size: 'md',
    motion: 'bob',
    hideOnMobile: true,
  },
  {
    id: 'code-brackets',
    icon: Code2,
    color: 'white',
    className: 'left-[14%] bottom-[14%] rotate-[8deg]',
    size: 'sm',
    motion: 'floatReverse',
  },
  {
    id: 'star-top',
    icon: Star,
    color: 'pink',
    className: 'right-[22%] top-[8%] rotate-[12deg]',
    size: 'sm',
    motion: 'wiggle',
    hideOnMobile: true,
  },
  {
    id: 'lightning-bottom',
    icon: Zap,
    color: 'yellow',
    className: 'right-[12%] bottom-[18%] rotate-[-10deg]',
    size: 'sm',
    motion: 'bob',
  },
  // Extra ambient doodles so every page reads as a lively cartoon-neobrutalist
  // field, not a near-empty gradient. Kept to the edges + low opacity so the
  // central reading column still clears AA contrast.
  {
    id: 'rocket-mid-left',
    icon: Rocket,
    color: 'orange',
    className: 'left-[3%] top-[40%] rotate-[10deg]',
    size: 'sm',
    motion: 'drift',
    hideOnMobile: true,
  },
  {
    id: 'sparkle-top-mid',
    icon: Sparkles,
    color: 'purple',
    className: 'left-[46%] top-[6%] rotate-[6deg]',
    size: 'sm',
    motion: 'wiggle',
    hideOnMobile: true,
  },
  {
    id: 'trophy-bottom-left',
    icon: Trophy,
    color: 'green',
    className: 'left-[10%] bottom-[8%] rotate-[-6deg]',
    size: 'sm',
    motion: 'float',
    hideOnMobile: true,
  },
  {
    id: 'star-bottom-right',
    icon: Star,
    color: 'blue',
    className: 'right-[5%] bottom-[8%] rotate-[12deg]',
    size: 'sm',
    motion: 'floatReverse',
    hideOnMobile: true,
  },
]

const variantDoodles: Record<CartoonBackgroundVariant, DoodleItem[]> = {
  default: [
    {
      id: 'default-folder',
      icon: Folder,
      color: 'green',
      className: 'left-[70%] top-[44%] rotate-[-5deg]',
      size: 'md',
      motion: 'float',
      hideOnMobile: true,
    },
    {
      id: 'default-check',
      icon: CheckCircle2,
      color: 'yellow',
      className: 'left-[6%] top-[54%] rotate-[5deg]',
      size: 'sm',
      motion: 'drift',
    },
  ],
  dashboard: [
    {
      id: 'dashboard-check',
      icon: CheckCircle2,
      color: 'green',
      className: 'left-[8%] top-[34%] rotate-[7deg]',
      size: 'md',
      motion: 'bob',
    },
    {
      id: 'dashboard-trophy',
      icon: Trophy,
      color: 'yellow',
      className: 'right-[7%] top-[42%] rotate-[-7deg]',
      size: 'md',
      motion: 'floatReverse',
      hideOnMobile: true,
    },
    {
      id: 'dashboard-code',
      label: '{}',
      color: 'white',
      className: 'left-[78%] bottom-[12%] rotate-[9deg]',
      size: 'sm',
      motion: 'wiggle',
      hideOnMobile: true,
    },
  ],
  roadmap: [
    {
      id: 'roadmap-map',
      icon: Map,
      color: 'pink',
      className: 'left-[7%] top-[32%] rotate-[-9deg]',
      size: 'md',
      motion: 'float',
    },
    {
      id: 'roadmap-flag',
      icon: Flag,
      color: 'green',
      className: 'right-[8%] top-[48%] rotate-[8deg]',
      size: 'md',
      motion: 'bob',
      hideOnMobile: true,
    },
    {
      id: 'roadmap-book',
      icon: BookOpen,
      color: 'yellow',
      className: 'left-[82%] bottom-[13%] rotate-[-6deg]',
      size: 'sm',
      motion: 'floatReverse',
      hideOnMobile: true,
    },
  ],
  sprint: [
    {
      id: 'sprint-calendar',
      icon: CalendarDays,
      color: 'green',
      className: 'left-[9%] top-[36%] rotate-[5deg]',
      size: 'md',
      motion: 'bob',
    },
    {
      id: 'sprint-note',
      label: 'todo',
      color: 'yellow',
      className: 'right-[9%] top-[40%] rotate-[-8deg]',
      size: 'md',
      motion: 'wiggle',
      hideOnMobile: true,
    },
    {
      id: 'sprint-check',
      icon: CheckCircle2,
      color: 'blue',
      className: 'left-[76%] bottom-[16%] rotate-[10deg]',
      size: 'sm',
      motion: 'floatReverse',
      hideOnMobile: true,
    },
  ],
  jobs: [
    {
      id: 'jobs-briefcase',
      icon: Briefcase,
      color: 'blue',
      className: 'left-[8%] top-[36%] rotate-[-6deg]',
      size: 'md',
      motion: 'float',
    },
    {
      id: 'jobs-pin',
      icon: MapPin,
      color: 'pink',
      className: 'right-[10%] top-[42%] rotate-[8deg]',
      size: 'md',
      motion: 'bob',
      hideOnMobile: true,
    },
    {
      id: 'jobs-search',
      icon: Search,
      color: 'yellow',
      className: 'left-[78%] bottom-[14%] rotate-[-10deg]',
      size: 'sm',
      motion: 'floatReverse',
      hideOnMobile: true,
    },
  ],
  quiz: [
    {
      id: 'quiz-help',
      icon: HelpCircle,
      color: 'purple',
      className: 'left-[8%] top-[34%] rotate-[8deg]',
      size: 'md',
      motion: 'bob',
    },
    {
      id: 'quiz-pencil',
      icon: Pencil,
      color: 'yellow',
      className: 'right-[8%] top-[40%] rotate-[-10deg]',
      size: 'md',
      motion: 'floatReverse',
      hideOnMobile: true,
    },
    {
      id: 'quiz-brackets',
      label: '()',
      color: 'white',
      className: 'left-[80%] bottom-[16%] rotate-[8deg]',
      size: 'sm',
      motion: 'wiggle',
      hideOnMobile: true,
    },
  ],
  project: [
    {
      id: 'project-laptop',
      icon: Laptop,
      color: 'blue',
      className: 'left-[8%] top-[36%] rotate-[-8deg]',
      size: 'md',
      motion: 'float',
    },
    {
      id: 'project-rocket',
      icon: Rocket,
      color: 'orange',
      className: 'right-[8%] top-[42%] rotate-[10deg]',
      size: 'md',
      motion: 'bob',
      hideOnMobile: true,
    },
    {
      id: 'project-terminal',
      icon: Terminal,
      color: 'green',
      className: 'left-[78%] bottom-[14%] rotate-[-5deg]',
      size: 'sm',
      motion: 'floatReverse',
      hideOnMobile: true,
    },
  ],
  settings: [
    {
      id: 'settings-gear',
      icon: Settings,
      color: 'white',
      className: 'left-[8%] top-[34%] rotate-[8deg]',
      size: 'md',
      motion: 'wiggle',
    },
    {
      id: 'settings-wrench',
      icon: Wrench,
      color: 'purple',
      className: 'right-[9%] top-[42%] rotate-[-8deg]',
      size: 'md',
      motion: 'bob',
      hideOnMobile: true,
    },
  ],
  onboarding: [
    {
      id: 'onboarding-flag',
      icon: Flag,
      color: 'yellow',
      className: 'left-[8%] top-[34%] rotate-[-7deg]',
      size: 'md',
      motion: 'bob',
    },
    {
      id: 'onboarding-map',
      icon: Map,
      color: 'green',
      className: 'right-[8%] top-[44%] rotate-[8deg]',
      size: 'md',
      motion: 'floatReverse',
      hideOnMobile: true,
    },
  ],
  auth: [
    {
      id: 'auth-cloud',
      icon: Cloud,
      color: 'white',
      className: 'left-[10%] top-[30%] rotate-[5deg]',
      size: 'md',
      motion: 'float',
    },
    {
      id: 'auth-star',
      icon: Star,
      color: 'pink',
      className: 'right-[12%] top-[34%] rotate-[-8deg]',
      size: 'md',
      motion: 'wiggle',
      hideOnMobile: true,
    },
  ],
  skills: [
    {
      id: 'skills-book',
      icon: BookOpen,
      color: 'green',
      className: 'left-[8%] top-[34%] rotate-[6deg]',
      size: 'md',
      motion: 'float',
    },
    {
      id: 'skills-code',
      icon: Code2,
      color: 'yellow',
      className: 'right-[9%] top-[44%] rotate-[-9deg]',
      size: 'md',
      motion: 'bob',
      hideOnMobile: true,
    },
  ],
  github: [
    {
      id: 'github-terminal',
      icon: Terminal,
      color: 'blue',
      className: 'left-[8%] top-[34%] rotate-[-8deg]',
      size: 'md',
      motion: 'floatReverse',
    },
    {
      id: 'github-rocket',
      icon: Rocket,
      color: 'orange',
      className: 'right-[9%] top-[42%] rotate-[8deg]',
      size: 'md',
      motion: 'bob',
      hideOnMobile: true,
    },
  ],
}

const intensityLimits: Record<CartoonBackgroundIntensity, number> = {
  low: 6,
  normal: 10,
  high: 14,
}

export function FloatingDoodles({
  variant = 'default',
  intensity = 'normal',
  animated = true,
  className,
}: FloatingDoodlesProps) {
  const doodles = [...baseDoodles, ...(variantDoodles[variant] ?? variantDoodles.default)].slice(
    0,
    intensityLimits[intensity]
  )

  return (
    <div aria-hidden="true" className={cn('absolute inset-0 overflow-hidden', className)}>
      {doodles.map((doodle) => {
        const Icon = doodle.icon
        const size = doodle.size ?? 'md'
        return (
          <div
            key={doodle.id}
            className={cn(
              'pointer-events-none absolute inline-flex items-center justify-center gap-1.5',
              'brutal-border brutal-radius shadow-brutal-sm text-black font-display font-bold',
              'opacity-25 sm:opacity-35 will-change-transform',
              colorClasses[doodle.color],
              sizeClasses[size],
              doodle.className,
              doodle.hideOnMobile && 'hidden sm:inline-flex',
              animated && motionClasses[doodle.motion ?? 'float']
            )}
          >
            {Icon && <Icon className={iconSizeClasses[size]} aria-hidden="true" />}
            {doodle.label && <span>{doodle.label}</span>}
          </div>
        )
      })}
    </div>
  )
}
