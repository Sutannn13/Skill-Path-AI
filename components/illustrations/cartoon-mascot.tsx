'use client'

import type { LucideIcon } from 'lucide-react'
import {
  Briefcase,
  ClipboardCheck,
  Laptop,
  Map,
  Pencil,
  Settings,
  Trophy,
} from 'lucide-react'
import { AnimatedCatMascot, type CatMascotMood } from './animated-cat-mascot'
import { cn } from '@/lib/utils'

export type CartoonMascotMood =
  | 'happy'
  | 'focused'
  | 'confused'
  | 'celebrating'
  | 'sleepy'
  | 'thinking'

export type CartoonMascotAccessory =
  | 'map'
  | 'laptop'
  | 'briefcase'
  | 'pencil'
  | 'gear'
  | 'trophy'
  | 'clipboard'
  | 'none'

interface CartoonMascotProps {
  mood?: CartoonMascotMood
  accessory?: CartoonMascotAccessory
  size?: 'sm' | 'md' | 'lg' | 'xl'
  animated?: boolean
  withMessage?: string
  className?: string
}

const moodMap: Record<CartoonMascotMood, CatMascotMood> = {
  happy: 'happy',
  focused: 'focus',
  confused: 'focus',
  celebrating: 'cheer',
  sleepy: 'sleepy',
  thinking: 'focus',
}

const accessoryIconMap: Record<Exclude<CartoonMascotAccessory, 'none'>, LucideIcon> = {
  map: Map,
  laptop: Laptop,
  briefcase: Briefcase,
  pencil: Pencil,
  gear: Settings,
  trophy: Trophy,
  clipboard: ClipboardCheck,
}

const accessoryColorMap: Record<Exclude<CartoonMascotAccessory, 'none'>, string> = {
  map: 'bg-pink',
  laptop: 'bg-blue',
  briefcase: 'bg-yellow',
  pencil: 'bg-orange',
  gear: 'bg-purple',
  trophy: 'bg-green',
  clipboard: 'bg-yellow',
}

export function CartoonMascot({
  mood = 'happy',
  accessory = 'none',
  size = 'md',
  animated = true,
  withMessage,
  className,
}: CartoonMascotProps) {
  const AccessoryIcon = accessory !== 'none' ? accessoryIconMap[accessory] : null
  const accessoryColor = accessory !== 'none' ? accessoryColorMap[accessory] : undefined

  return (
    <div className={cn('relative inline-flex', mood === 'confused' && 'cartoon-confused', className)}>
      <AnimatedCatMascot
        mood={moodMap[mood]}
        size={size}
        animated={animated}
        withMessage={withMessage}
      />
      {AccessoryIcon && (
        <span
          className={cn(
            'absolute -bottom-1 -right-1 flex h-10 w-10 items-center justify-center brutal-border brutal-radius shadow-brutal-sm',
            'cartoon-sticker-motion',
            accessoryColor
          )}
          aria-hidden="true"
        >
          <AccessoryIcon className="h-5 w-5" />
        </span>
      )}
    </div>
  )
}
