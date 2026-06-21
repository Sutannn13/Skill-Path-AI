'use client'

import { Lock } from 'lucide-react'
import { LevelChip, XPBar, StickerBadge } from '@/components/brutal'
import { MiniTerminal } from '@/components/public'

/**
 * Per-page status widgets for the auth left "OS window". Each gives a screen its
 * own identity (resume a save / start a new game / recovery console) while
 * sharing the Career Quest OS system. All values are illustrative product chrome
 * (the marketing preview), never the authenticated user's real data.
 */

// LOGIN — "load your save".
export function ResumeSessionCard() {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="hud-label text-[10px] text-secondary">Save file</p>
          <p className="truncate font-display font-bold leading-tight">Future Dev</p>
        </div>
        <LevelChip level={5} />
      </div>
      <XPBar value={1240} max={2000} label="XP to Level 6" accent="yellow" />
      <div className="flex items-center justify-between gap-2 bg-cream-light px-3 py-2 brutal-border brutal-radius">
        <div className="min-w-0">
          <p className="hud-label text-[10px] text-secondary">Continue quest</p>
          <p className="truncate text-sm font-bold">React API Patterns</p>
        </div>
        <StickerBadge variant="in-progress" label="Active" size="sm" />
      </div>
    </div>
  )
}

// REGISTER — "new save slot / Level 1 start".
export function CharacterCreationCard() {
  const slots = ['Roadmap', 'Quizzes', 'Jobs']
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="hud-label text-[10px] text-secondary">New save slot</p>
          <p className="truncate font-display font-bold leading-tight">Level 1 · Rookie</p>
        </div>
        <span className="hud-label whitespace-nowrap bg-yellow px-2 py-1 text-[11px] brutal-border brutal-radius">
          Press Start
        </span>
      </div>
      <XPBar value={0} max={100} label="0 / 100 XP" accent="green" />
      <div>
        <p className="hud-label mb-2 text-[10px] text-secondary">Unlocks the moment you sign up</p>
        <div className="flex flex-wrap gap-2">
          {slots.map((slot) => (
            <StickerBadge key={slot} variant="locked" icon={Lock} label={slot} size="sm" />
          ))}
        </div>
      </div>
    </div>
  )
}

// FORGOT PASSWORD — calm "recovery console".
export function RecoveryConsole({ state }: { state: 'idle' | 'loading' | 'success' }) {
  const result =
    state === 'success'
      ? '✓ reset link sent — check your inbox'
      : state === 'loading'
        ? '… locating your account'
        : undefined
  const tone: 'green' | 'yellow' = state === 'success' ? 'green' : 'yellow'

  return (
    <div className="space-y-3">
      <MiniTerminal
        command="skillpath recover --email"
        result={result}
        resultTone={tone}
        caret={state !== 'success'}
        label="RECOVER"
      />
      <p className="text-sm text-secondary">
        We email a secure reset link that expires in 1 hour. If it does not arrive, check your spam folder.
      </p>
    </div>
  )
}
