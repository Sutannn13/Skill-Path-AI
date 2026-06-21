'use client'

import { forwardRef } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { AlertCircle, Eye, EyeOff, Target } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { AccentColor } from '@/components/brutal'
import { AppWindow, type TrafficDotColor } from '@/components/public'
import { AnimatedCatMascot, type CatMascotMood } from '@/components/illustrations/animated-cat-mascot'
import { CartoonBackground } from '@/components/illustrations/cartoon-background'
import { cn } from '@/lib/utils'

// Accent-tinted stage gradient for the in-window cat companion strip (bright,
// not a dark "broken TV" — see DESIGN.md cat-stage law).
const accentStageGradient: Record<AccentColor, string> = {
  yellow: 'from-yellow/60 via-cream-light to-cream-light',
  blue: 'from-blue/55 via-cream-light to-cream-light',
  green: 'from-green/55 via-cream-light to-cream-light',
  pink: 'from-pink/55 via-cream-light to-cream-light',
  orange: 'from-orange/55 via-cream-light to-cream-light',
  purple: 'from-purple/55 via-cream-light to-cream-light',
}

/**
 * AuthFormLayout — Career Quest OS auth scaffold. The page is two snug
 * neobrutalist windows: a left "OS window" (route tab + traffic dots + the
 * reactive cat companion + a per-page status widget, lg+ only) and a right form
 * column constrained to a readable width (max-w-md) so the form never stretches
 * into acres of empty white. Routing, Supabase plumbing, and the
 * AuthInput/PasswordToggle/AuthError contracts are unchanged.
 */
export function AuthFormLayout({
  headerRight,
  welcome,
  children,
  footer,
  routeTab,
  urlPill,
  litDot,
  sceneAccent = 'yellow',
  sceneCaption,
  catMood,
  catMessage,
}: {
  headerRight?: React.ReactNode
  /** Per-page status widget shown inside the left OS window (lg+). */
  welcome: React.ReactNode
  children: React.ReactNode
  footer?: React.ReactNode
  /** Window chrome: mono route label, optional URL pill, optional lit dot. */
  routeTab: string
  urlPill?: string
  litDot?: TrafficDotColor
  // Accent tint for the in-window cat companion; the cat reacts via catMood.
  sceneAccent?: AccentColor
  sceneCaption?: string
  catMood?: CatMascotMood
  catMessage?: string
}) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <CartoonBackground variant="auth" intensity="normal" showDoodles animated />

      <header className="sticky top-0 z-50 border-b-3 border-black bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
          <Link href="/" className="flex items-center gap-3 rounded-brutal focus-brutal-ring">
            <div className="flex h-11 w-11 items-center justify-center bg-yellow brutal-border brutal-radius shadow-brutal-sm">
              <Target className="h-6 w-6" aria-hidden="true" />
            </div>
            <div>
              <span className="block font-display text-xl font-bold leading-none">SkillPath</span>
              <span className="hud-label text-[10px] text-secondary">Career OS</span>
            </div>
          </Link>
          {headerRight}
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="grid items-start gap-8 lg:grid-cols-2"
        >
          {/* LEFT — the OS window (cat companion + per-page status widget) */}
          <aside className="hidden lg:block">
            <AppWindow routeTab={routeTab} urlPill={urlPill} litDot={litDot} className="sticky top-24" bodyClassName="bg-white">
              <div
                className={cn(
                  'relative grid place-items-center overflow-hidden bg-gradient-to-b px-4 pb-4 pt-7',
                  accentStageGradient[sceneAccent]
                )}
              >
                <div
                  className="pointer-events-none absolute inset-0"
                  aria-hidden="true"
                  style={{ background: 'radial-gradient(60% 48% at 50% 24%, rgba(255,255,255,0.6), transparent 72%)' }}
                />
                <div className="pointer-events-none absolute inset-0" aria-hidden="true">
                  <span className="cartoon-float-slow absolute left-5 top-5 h-5 w-5 rotate-12 bg-pink brutal-border" />
                  <span className="cartoon-bob absolute right-6 top-9 h-4 w-4 rounded-full bg-blue brutal-border" />
                  <span className="cartoon-drift absolute bottom-6 left-9 h-4 w-4 rotate-6 bg-green brutal-border" />
                  <span className="cartoon-float-reverse absolute bottom-8 right-8 h-6 w-6 -rotate-6 bg-yellow brutal-border" />
                </div>

                <div className="relative">
                  <AnimatedCatMascot size="lg" mood={catMood} withMessage={catMessage} animated />
                </div>

                <div className="relative mt-3 flex w-full items-center justify-between gap-2 bg-white/90 px-3 py-2 backdrop-blur-sm brutal-border brutal-radius shadow-brutal-sm">
                  <span className="hud-label text-[10px] text-secondary">{sceneCaption ?? 'Your study buddy'}</span>
                  <span className="metric-mono text-xs font-bold">SKILLPATH</span>
                </div>
              </div>

              <div className="border-t-3 border-black bg-white p-5">{welcome}</div>
            </AppWindow>
          </aside>

          {/* RIGHT — the active form, width-constrained so it never stretches */}
          <section>
            <div className="mx-auto w-full max-w-md lg:mx-0">
              {children}
              {footer && <div className="mt-6 text-center">{footer}</div>}
            </div>
          </section>
        </motion.div>
      </main>
    </div>
  )
}

// Labelled input with leading icon, built on the shared `.brutal-input` primitive
// (black focus outline, >=44px height). Icon uses semantic `text-secondary`
// (AA on white) — not the old low-contrast gray — and the trailing slot reserves
// `pr-14` so a password toggle can never overlap the value/placeholder.
interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  icon: LucideIcon
  trailing?: React.ReactNode
  invalid?: boolean
}

export const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(function AuthInput(
  { label, icon: Icon, trailing, invalid, id, className, ...rest },
  ref
) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block font-medium">
        {label}
      </label>
      <div className="relative">
        <Icon
          className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-secondary"
          aria-hidden="true"
        />
        <input
          id={id}
          ref={ref}
          aria-invalid={invalid || undefined}
          className={cn(
            'brutal-input pl-12',
            trailing ? 'pr-14' : 'pr-4',
            invalid && 'outline outline-2 outline-red-dark',
            className
          )}
          {...rest}
        />
        {trailing}
      </div>
    </div>
  )
})

// Accessible show/hide toggle for password fields (44px target, focus ring, labelled).
export function PasswordToggle({
  shown,
  onToggle,
  label = 'password',
}: {
  shown: boolean
  onToggle: () => void
  label?: string
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={shown ? `Hide ${label}` : `Show ${label}`}
      aria-pressed={shown}
      className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded border-2 border-black bg-white focus-brutal-ring"
    >
      {shown ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
    </button>
  )
}

// Error banner with assertive live region and accessible red text.
export function AuthError({ message }: { message: string }) {
  return (
    <motion.div
      role="alert"
      aria-live="assertive"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-2 bg-red/10 p-4 brutal-border brutal-radius"
    >
      <AlertCircle className="h-5 w-5 shrink-0 text-red-dark" aria-hidden="true" />
      <p className="break-words text-sm font-medium text-red-dark">{message}</p>
    </motion.div>
  )
}
