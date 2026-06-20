'use client'

import { forwardRef } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { AlertCircle, Eye, EyeOff, Target } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { BrutalCard } from '@/components/brutal'
import type { CardColor } from '@/components/brutal/brutal-card'
import type { AccentColor } from '@/components/brutal'
import { CatStage } from '@/components/illustrations/cat-stage'
import type { CatMascotMood } from '@/components/illustrations/animated-cat-mascot'
import { CartoonBackground } from '@/components/illustrations/cartoon-background'
import { cn } from '@/lib/utils'

// Shared auth scaffold — header + decorative background + welcome/form columns.
// Eliminates the ~80% structural duplication across login/register/forgot/reset.
export function AuthFormLayout({
  headerRight,
  welcomeColor = 'yellow',
  welcome,
  children,
  footer,
  sceneAccent,
  sceneCaption,
  catMood,
  catMessage,
}: {
  headerRight?: React.ReactNode
  welcomeColor?: CardColor
  welcome: React.ReactNode
  children: React.ReactNode
  footer?: React.ReactNode
  // Accent tint for the animated cat "stage" that tops the welcome column
  // (lg+ only, so mobile auth stays light). The cat reacts via catMood/catMessage.
  sceneAccent?: AccentColor
  sceneCaption?: string
  catMood?: CatMascotMood
  catMessage?: string
}) {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <CartoonBackground variant="auth" intensity="normal" showDoodles animated />

      <header className="border-b-3 border-black bg-white/90 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-3 rounded-brutal focus-brutal-ring">
            <div className="w-11 h-11 bg-yellow brutal-border brutal-radius flex items-center justify-center shadow-brutal-sm">
              <Target className="w-6 h-6" aria-hidden="true" />
            </div>
            <div>
              <span className="font-display font-bold text-xl block leading-none">SkillPath</span>
              <span className="hud-label text-[10px] text-secondary">Career OS</span>
            </div>
          </Link>
          {headerRight}
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="grid gap-6 lg:grid-cols-5 items-start"
        >
          <aside className="hidden lg:col-span-2 lg:block space-y-4">
            <CatStage
              variant="auth"
              accent={sceneAccent ?? 'yellow'}
              mood={catMood}
              message={catMessage}
              className="h-[300px]"
            >
              <div className="p-3">
                <div className="flex items-center justify-between gap-2 bg-white/90 backdrop-blur-sm brutal-border brutal-radius px-3 py-2 shadow-brutal-sm">
                  <span className="hud-label text-[10px] text-secondary">{sceneCaption ?? 'Your study buddy'}</span>
                  <span className="metric-mono text-xs font-bold">SKILLPATH</span>
                </div>
              </div>
            </CatStage>
            <BrutalCard color={welcomeColor} shadow="lg" className="relative p-8 overflow-hidden">
              <div className="relative z-10">{welcome}</div>
              <div
                className="absolute -top-3 -right-3 w-12 h-12 bg-white/30 brutal-border brutal-radius cartoon-float-slow"
                aria-hidden="true"
              />
              <div
                className="absolute -bottom-4 -left-4 w-16 h-16 bg-black/10 brutal-border brutal-radius cartoon-bob"
                aria-hidden="true"
              />
            </BrutalCard>
          </aside>

          <section className="lg:col-span-3">
            {children}
            {footer && <div className="mt-6 text-center">{footer}</div>}
          </section>
        </motion.div>
      </main>
    </div>
  )
}

// Labelled input with leading icon, built on the shared `.brutal-input` primitive
// (black focus outline, 44px min height) — fixes the low-contrast yellow ring.
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
      <label htmlFor={id} className="block mb-2 font-medium">
        {label}
      </label>
      <div className="relative">
        <Icon
          className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none"
          aria-hidden="true"
        />
        <input
          id={id}
          ref={ref}
          aria-invalid={invalid || undefined}
          className={cn('brutal-input pl-12', trailing ? 'pr-12' : 'pr-4', invalid && 'outline outline-2 outline-red-dark', className)}
          {...rest}
        />
        {trailing}
      </div>
    </div>
  )
})

// Accessible show/hide toggle for password fields (36px target, focus ring, labelled).
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
      className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center w-11 h-11 rounded border-2 border-black bg-white focus-brutal-ring"
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
      className="flex items-center gap-2 p-4 bg-red/10 brutal-border brutal-radius"
    >
      <AlertCircle className="w-5 h-5 text-red-dark shrink-0" aria-hidden="true" />
      <p className="text-sm font-medium text-red-dark break-words">{message}</p>
    </motion.div>
  )
}
