'use client'

import { useEffect } from 'react'
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
} from 'framer-motion'
import {
  Rocket,
  Code2,
  Target,
  Trophy,
  Zap,
  Compass,
  Gamepad2,
  MapPin,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Landing3DBackground — a per-section "doodle field" in the product's native
 * Cartoon-Neobrutalism language: themed doodles (rocket, code, target, trophy,
 * lightning, compass, controller, map pin) as bold bordered colored chips, plus
 * hand-drawn marks (sparkle, 5-point star, squiggle) with thick black outlines.
 *
 * It is placed INSIDE each section as an `absolute inset-0` layer (so it scrolls
 * naturally and is never hidden behind an opaque section background, the way a
 * single fixed page backdrop would be). Each doodle loops on its own (float, or
 * twinkle-spin); with `parallax` the whole layer tilts toward the pointer
 * (CSS perspective + preserve-3d) for the hero. No WebGL — stays off the three.js
 * critical path (DESIGN.md). Decorative only: aria-hidden + pointer-events-none;
 * sits behind content (host content must be `relative z-10`). Under
 * prefers-reduced-motion it is a still composition; pointer parallax is skipped
 * on touch. Doodles are biased to the edges so centered copy keeps AA contrast.
 */

type DoodleKind = 'chip-square' | 'chip-circle' | 'sparkle' | 'star' | 'squiggle'
type ColorKey = 'yellow' | 'blue' | 'pink' | 'green' | 'orange' | 'purple'
export type DoodlePreset = 'hero' | 'boss' | 'quest' | 'power' | 'demo' | 'cta'

const COLORS: Record<ColorKey, { bg: string; hex: string }> = {
  yellow: { bg: 'bg-yellow', hex: '#FFD447' },
  blue: { bg: 'bg-blue', hex: '#7CC9FF' },
  pink: { bg: 'bg-pink', hex: '#FF8FAB' },
  green: { bg: 'bg-green', hex: '#9BE564' },
  orange: { bg: 'bg-orange', hex: '#FFB86B' },
  purple: { bg: 'bg-purple', hex: '#B39DDB' },
}

interface Doodle {
  kind: DoodleKind
  icon?: LucideIcon
  color: ColorKey
  left: string
  top: string
  size: number
  depth: number
  rotate: number
  float: number
  duration: number
  delay: number
  opacity: number
  spin?: boolean
}

// Each preset spreads a handful of doodles to the section edges so the centered
// reading column stays clear. Themes loosely match the section's message.
const PRESETS: Record<DoodlePreset, Doodle[]> = {
  hero: [
    { kind: 'chip-square', icon: Rocket, color: 'yellow', left: '2%', top: '16%', size: 64, depth: 120, rotate: -10, float: 24, duration: 13, delay: 0, opacity: 0.9 },
    { kind: 'sparkle', color: 'pink', left: '6%', top: '52%', size: 40, depth: 170, rotate: 0, float: 26, duration: 11, delay: 0.6, opacity: 0.8, spin: true },
    { kind: 'chip-circle', icon: Code2, color: 'blue', left: '7%', top: '82%', size: 52, depth: 60, rotate: 0, float: 20, duration: 15, delay: 1.2, opacity: 0.85 },
    { kind: 'chip-square', icon: Trophy, color: 'orange', left: '90%', top: '13%', size: 58, depth: 90, rotate: 10, float: 22, duration: 14, delay: 0.9, opacity: 0.9 },
    { kind: 'chip-circle', icon: Zap, color: 'purple', left: '92%', top: '56%', size: 46, depth: 40, rotate: -6, float: 18, duration: 16, delay: 0.3, opacity: 0.85 },
    { kind: 'star', color: 'green', left: '88%', top: '85%', size: 34, depth: -60, rotate: 0, float: 14, duration: 18, delay: 1.5, opacity: 0.7, spin: true },
  ],
  boss: [
    { kind: 'chip-square', icon: Target, color: 'pink', left: '4%', top: '22%', size: 46, depth: 0, rotate: -8, float: 18, duration: 14, delay: 0, opacity: 0.85 },
    { kind: 'chip-circle', icon: Code2, color: 'blue', left: '93%', top: '16%', size: 44, depth: 0, rotate: 8, float: 20, duration: 16, delay: 0.6, opacity: 0.85 },
    { kind: 'sparkle', color: 'yellow', left: '8%', top: '76%', size: 34, depth: 0, rotate: 0, float: 22, duration: 12, delay: 1.1, opacity: 0.8, spin: true },
    { kind: 'star', color: 'orange', left: '90%', top: '78%', size: 34, depth: 0, rotate: 0, float: 16, duration: 18, delay: 0.4, opacity: 0.75, spin: true },
    { kind: 'chip-circle', icon: Zap, color: 'green', left: '49%', top: '8%', size: 38, depth: 0, rotate: -6, float: 14, duration: 15, delay: 1.4, opacity: 0.7 },
  ],
  quest: [
    { kind: 'chip-square', icon: Compass, color: 'blue', left: '3%', top: '16%', size: 48, depth: 0, rotate: -8, float: 18, duration: 15, delay: 0, opacity: 0.8 },
    { kind: 'chip-circle', icon: Target, color: 'green', left: '92%', top: '22%', size: 44, depth: 0, rotate: 8, float: 20, duration: 17, delay: 0.7, opacity: 0.8 },
    { kind: 'sparkle', color: 'yellow', left: '6%', top: '72%', size: 34, depth: 0, rotate: 0, float: 22, duration: 12, delay: 1.1, opacity: 0.75, spin: true },
    { kind: 'chip-circle', icon: MapPin, color: 'pink', left: '90%', top: '76%', size: 40, depth: 0, rotate: 6, float: 16, duration: 18, delay: 0.3, opacity: 0.75 },
    { kind: 'squiggle', color: 'purple', left: '47%', top: '5%', size: 42, depth: 0, rotate: 0, float: 14, duration: 16, delay: 0.5, opacity: 0.7 },
  ],
  power: [
    { kind: 'chip-square', icon: Zap, color: 'yellow', left: '2%', top: '10%', size: 50, depth: 0, rotate: -10, float: 20, duration: 14, delay: 0, opacity: 0.85 },
    { kind: 'chip-circle', icon: Gamepad2, color: 'purple', left: '93%', top: '12%', size: 46, depth: 0, rotate: 8, float: 18, duration: 16, delay: 0.6, opacity: 0.8 },
    { kind: 'chip-square', icon: Code2, color: 'blue', left: '4%', top: '46%', size: 44, depth: 0, rotate: 6, float: 22, duration: 15, delay: 1.2, opacity: 0.8 },
    { kind: 'star', color: 'pink', left: '95%', top: '48%', size: 34, depth: 0, rotate: 0, float: 16, duration: 18, delay: 0.4, opacity: 0.75, spin: true },
    { kind: 'sparkle', color: 'green', left: '3%', top: '82%', size: 38, depth: 0, rotate: 0, float: 24, duration: 13, delay: 0.9, opacity: 0.8, spin: true },
    { kind: 'chip-circle', icon: Rocket, color: 'orange', left: '92%', top: '84%', size: 48, depth: 0, rotate: -6, float: 20, duration: 17, delay: 1.6, opacity: 0.8 },
  ],
  demo: [
    { kind: 'chip-square', icon: Trophy, color: 'orange', left: '3%', top: '16%', size: 48, depth: 0, rotate: -8, float: 18, duration: 15, delay: 0, opacity: 0.8 },
    { kind: 'chip-circle', icon: Target, color: 'blue', left: '93%', top: '20%', size: 44, depth: 0, rotate: 8, float: 20, duration: 16, delay: 0.7, opacity: 0.8 },
    { kind: 'sparkle', color: 'pink', left: '7%', top: '78%', size: 34, depth: 0, rotate: 0, float: 22, duration: 12, delay: 1.1, opacity: 0.75, spin: true },
    { kind: 'squiggle', color: 'green', left: '90%', top: '80%', size: 40, depth: 0, rotate: 0, float: 16, duration: 18, delay: 0.3, opacity: 0.7 },
  ],
  cta: [
    { kind: 'chip-square', icon: Rocket, color: 'blue', left: '4%', top: '18%', size: 52, depth: 0, rotate: -10, float: 20, duration: 14, delay: 0, opacity: 0.85 },
    { kind: 'star', color: 'pink', left: '92%', top: '16%', size: 36, depth: 0, rotate: 0, float: 16, duration: 17, delay: 0.6, opacity: 0.8, spin: true },
    { kind: 'sparkle', color: 'purple', left: '8%', top: '76%', size: 38, depth: 0, rotate: 0, float: 22, duration: 12, delay: 1.1, opacity: 0.8, spin: true },
    { kind: 'chip-circle', icon: Zap, color: 'green', left: '90%', top: '78%', size: 46, depth: 0, rotate: 6, float: 18, duration: 16, delay: 0.3, opacity: 0.8 },
  ],
}

function DoodleGlyph({ doodle }: { doodle: Doodle }) {
  const c = COLORS[doodle.color]
  const transform = `rotate(${doodle.rotate}deg)`

  if (doodle.kind === 'chip-square' || doodle.kind === 'chip-circle') {
    const Icon = doodle.icon ?? Rocket
    const round = doodle.kind === 'chip-circle' ? 'rounded-full' : 'brutal-radius'
    return (
      <div
        className={cn('flex h-full w-full items-center justify-center brutal-border shadow-brutal', round, c.bg)}
        style={{ transform }}
      >
        <Icon size={Math.round(doodle.size * 0.5)} strokeWidth={2.5} className="text-black" aria-hidden="true" />
      </div>
    )
  }

  if (doodle.kind === 'squiggle') {
    return (
      <svg viewBox="0 0 48 48" className="h-full w-full" style={{ transform }} aria-hidden="true">
        <path d="M4 26 Q14 10 24 26 T44 26" fill="none" stroke="#111111" strokeWidth="3.5" strokeLinecap="round" />
      </svg>
    )
  }

  const path =
    doodle.kind === 'star'
      ? 'M24 3 L30 18 L46 19 L34 30 L38 45 L24 36 L10 45 L14 30 L2 19 L18 18 Z'
      : 'M24 2 C25 17 31 23 46 24 C31 25 25 31 24 46 C23 31 17 25 2 24 C17 23 23 17 24 2 Z'

  return (
    <svg
      viewBox="0 0 48 48"
      className="h-full w-full drop-shadow-[3px_3px_0_rgba(17,17,17,1)]"
      style={{ transform }}
      aria-hidden="true"
    >
      <path d={path} fill={c.hex} stroke="#111111" strokeWidth="2.5" strokeLinejoin="round" />
    </svg>
  )
}

export function Landing3DBackground({
  preset = 'hero',
  parallax = false,
  className,
}: {
  preset?: DoodlePreset
  parallax?: boolean
  className?: string
}) {
  const reduce = useReducedMotion()
  const tilt = parallax && !reduce

  const pointerX = useMotionValue(0)
  const pointerY = useMotionValue(0)
  const rotateX = useSpring(useTransform(pointerY, [-0.5, 0.5], [7, -7]), { stiffness: 60, damping: 18 })
  const rotateY = useSpring(useTransform(pointerX, [-0.5, 0.5], [-7, 7]), { stiffness: 60, damping: 18 })

  useEffect(() => {
    if (!tilt) return
    if (typeof window === 'undefined') return
    if (window.matchMedia('(hover: none)').matches) return

    const handlePointer = (event: MouseEvent) => {
      pointerX.set(event.clientX / window.innerWidth - 0.5)
      pointerY.set(event.clientY / window.innerHeight - 0.5)
    }

    window.addEventListener('mousemove', handlePointer)
    return () => window.removeEventListener('mousemove', handlePointer)
  }, [tilt, pointerX, pointerY])

  const doodles = PRESETS[preset]

  return (
    <div
      aria-hidden="true"
      className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}
      style={parallax ? { perspective: '1100px' } : undefined}
    >
      <motion.div
        className="absolute inset-0"
        style={tilt ? { rotateX, rotateY, transformStyle: 'preserve-3d' } : undefined}
      >
        {doodles.map((doodle, index) => (
          <motion.div
            key={index}
            className="absolute"
            style={{
              left: doodle.left,
              top: doodle.top,
              width: doodle.size,
              height: doodle.size,
              opacity: doodle.opacity,
              z: tilt ? doodle.depth : 0,
            }}
            animate={
              reduce
                ? undefined
                : doodle.spin
                  ? { rotate: [0, 360], y: [0, -doodle.float, 0] }
                  : { y: [0, -doodle.float, 0] }
            }
            transition={
              reduce
                ? undefined
                : doodle.spin
                  ? {
                      rotate: { duration: doodle.duration * 1.6, repeat: Infinity, ease: 'linear' },
                      y: { duration: doodle.duration, delay: doodle.delay, repeat: Infinity, ease: 'easeInOut' },
                    }
                  : { duration: doodle.duration, delay: doodle.delay, repeat: Infinity, ease: 'easeInOut' }
            }
          >
            <DoodleGlyph doodle={doodle} />
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}
