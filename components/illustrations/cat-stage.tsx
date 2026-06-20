'use client'

import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { AnimatedCatMascot, type CatMascotMood } from './animated-cat-mascot'
import type { AccentColor } from '@/components/brutal'

export type CatStageVariant = 'hero' | 'auth'

// Bright accent-tinted stage backdrop (cute, not a dark "broken TV").
const stageGradient: Record<AccentColor, string> = {
  yellow: 'from-yellow/60 via-cream-light to-cream-light',
  blue: 'from-blue/55 via-cream-light to-cream-light',
  green: 'from-green/55 via-cream-light to-cream-light',
  pink: 'from-pink/55 via-cream-light to-cream-light',
  orange: 'from-orange/55 via-cream-light to-cream-light',
  purple: 'from-purple/55 via-cream-light to-cream-light',
}

// Decorative floating confetti. The cartoon-* keyframes are already disabled
// under prefers-reduced-motion (see globals.css), so motion is handled for free.
const confetti = [
  'left-5 top-7 h-6 w-6 rotate-12 bg-pink rounded-[6px] cartoon-float-slow',
  'right-7 top-10 h-5 w-5 -rotate-6 bg-blue rounded-full cartoon-bob',
  'left-9 bottom-24 h-4 w-4 rotate-3 bg-green rounded-[5px] cartoon-drift',
  'right-10 bottom-28 h-7 w-7 -rotate-6 bg-yellow rounded-[7px] cartoon-float-reverse',
  'left-1/2 top-4 h-4 w-4 rotate-12 bg-purple rounded-full cartoon-bob',
]

/**
 * CatStage — a playful neobrutalist "stage" with the SkillPath cat as the star.
 * Reuses the animated SVG cat (blink / mood cycle / tail wag / wave) and adds a
 * soft spotlight, floating confetti, and a floor shadow. Pass real info through
 * `children` (an accessible HUD/caption); all decoration is aria-hidden.
 */
export function CatStage({
  variant = 'hero',
  accent = 'yellow',
  mood,
  message,
  className,
  children,
}: {
  variant?: CatStageVariant
  accent?: AccentColor
  mood?: CatMascotMood
  message?: string
  className?: string
  children?: ReactNode
}) {
  const catSize = variant === 'hero' ? 'xl' : 'lg'
  return (
    <div
      className={cn(
        'relative grid place-items-center overflow-hidden bg-gradient-to-b brutal-border brutal-radius shadow-brutal-lg',
        stageGradient[accent],
        className
      )}
    >
      {/* Soft top spotlight for a little stage depth */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{ background: 'radial-gradient(60% 48% at 50% 20%, rgba(255,255,255,0.65), transparent 72%)' }}
      />

      {/* Playful floating confetti (decorative) */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        {confetti.map((c, i) => (
          <span key={i} className={cn('absolute border-3 border-black shadow-brutal-sm', c)} />
        ))}
        <span className="cartoon-float-slow absolute right-1/4 top-8 text-2xl">✦</span>
        <span className="cartoon-bob absolute bottom-1/3 left-[18%] text-xl">★</span>
      </div>

      {/* The star of the show */}
      <div
        className={cn(
          'absolute inset-0 flex items-center justify-center',
          variant === 'hero' ? 'pb-28' : 'pb-10'
        )}
      >
        <AnimatedCatMascot size={catSize} mood={mood} withMessage={message} animated />
      </div>

      {/* Floor shadow gradient */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/10 to-transparent"
        aria-hidden="true"
      />

      {/* Accessible foreground slot (HUD / caption) */}
      {children && <div className="absolute inset-x-0 bottom-0 z-10">{children}</div>}
    </div>
  )
}

export default CatStage
