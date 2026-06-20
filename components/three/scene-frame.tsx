'use client'

import { Component, useEffect, useRef, useState, type ReactNode } from 'react'
import dynamic from 'next/dynamic'
import { useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils'
import type { SceneAccent, SceneVariant } from './arcade-scene'

// three.js + the scene chunk load client-only and only when mounted.
const ArcadeScene = dynamic(() => import('./arcade-scene').then((m) => m.ArcadeScene), {
  ssr: false,
  loading: () => <SceneSkeleton />,
})

const frameAccentClass: Record<SceneAccent, string> = {
  yellow: 'scene-frame-yellow',
  pink: 'scene-frame-pink',
  blue: 'scene-frame-blue',
  green: 'scene-frame-green',
  purple: 'scene-frame-purple',
}

const posterDot: Record<SceneAccent, string> = {
  yellow: 'bg-yellow',
  pink: 'bg-pink',
  blue: 'bg-blue',
  green: 'bg-green',
  purple: 'bg-purple',
}

function webglSupported(): boolean {
  if (typeof window === 'undefined') return false
  try {
    const canvas = document.createElement('canvas')
    return Boolean(
      window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    )
  } catch {
    return false
  }
}

// Catches render-phase WebGL init errors and shows the static poster. Async
// post-mount context loss is a DOM event (not a React error) and is handled
// separately via ArcadeScene's onContextLost -> SceneFrame `failed` state.
class CanvasBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}

// Loading shimmer shown while three.js downloads (FE-012 explicit loading state).
function SceneSkeleton() {
  return (
    <div className="absolute inset-0 grid place-items-center" aria-hidden="true">
      <div className="scene-loading flex items-center gap-1.5">
        <span className="w-3 h-3 bg-yellow rounded-[3px] brutal-border" />
        <span className="w-3 h-3 bg-pink rounded-[3px] brutal-border" />
        <span className="w-3 h-3 bg-blue rounded-[3px] brutal-border" />
      </div>
    </div>
  )
}

// Static, intentional CRT "quest screen" — the fallback for reduced-motion,
// no-WebGL, and offscreen states. Not a placeholder: it carries the same
// lit/unlit progression metaphor as the live scene.
function DefaultScenePoster({ accent }: { accent: SceneAccent }) {
  return (
    <div className="absolute inset-0 grid place-items-center p-6" aria-hidden="true">
      <div
        className="w-full max-w-[280px] rounded-[14px] brutal-border p-5"
        style={{ backgroundColor: '#0E1A33', boxShadow: '0 0 32px -6px rgba(255,212,71,0.45)' }}
      >
        <div className="flex items-center justify-center mb-4">
          {[true, true, true, false].map((lit, i) => (
            <div key={i} className="flex items-center">
              <span
                className={cn('w-6 h-6 rounded-[4px] brutal-border', lit ? posterDot[accent] : '')}
                style={lit ? undefined : { backgroundColor: '#3A4560' }}
              />
              {i < 3 && (
                <span
                  className="w-5 h-[3px]"
                  style={{ backgroundColor: lit ? '#9BE564' : '#3A4560' }}
                />
              )}
            </div>
          ))}
        </div>
        <p className="hud-label text-[10px] text-center text-on-dark-soft">Quest Map</p>
      </div>
    </div>
  )
}

/**
 * SceneFrame — neon "cabinet" zone that hosts a WebGL arcade scene with a full
 * fallback stack. Renders the static poster on the server and on any device
 * that should not run WebGL (reduced-motion, no WebGL, offscreen), and swaps to
 * the live Canvas only on capable clients once the frame scrolls into view.
 *
 * The scene chrome is decorative; pass real information via `children` (an
 * accessible foreground HUD). Decorative layers are aria-hidden.
 */
export function SceneFrame({
  variant = 'hero',
  accent = 'yellow',
  className,
  poster,
  pulse = true,
  children,
}: {
  variant?: SceneVariant
  accent?: SceneAccent
  className?: string
  poster?: ReactNode
  pulse?: boolean
  children?: ReactNode
}) {
  const ref = useRef<HTMLDivElement>(null)
  const prefersReducedMotion = useReducedMotion()
  const [phase, setPhase] = useState<'poster' | 'skeleton' | 'live'>('poster')
  // Set once if the live context is lost; from then on we stay on the poster.
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    if (prefersReducedMotion || !webglSupported()) {
      setPhase('poster')
      return
    }
    const node = ref.current
    if (!node || typeof IntersectionObserver === 'undefined') {
      setPhase('live')
      return
    }
    setPhase('skeleton')
    const observer = new IntersectionObserver(
      ([entry]) => setPhase(entry.isIntersecting ? 'live' : 'skeleton'),
      { rootMargin: '200px 0px', threshold: 0.01 }
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [prefersReducedMotion])

  const posterNode = poster ?? <DefaultScenePoster accent={accent} />
  const showLive = phase === 'live' && !failed

  return (
    <div
      ref={ref}
      className={cn('scene-frame', frameAccentClass[accent], pulse && showLive && 'scene-frame-pulse', className)}
    >
      {/* Decorative depth + screen chrome (all aria-hidden) */}
      <div className="absolute inset-0 scene-floor pointer-events-none" aria-hidden="true" />

      {showLive && (
        <div className="absolute inset-0" aria-hidden="true">
          <CanvasBoundary fallback={posterNode}>
            <ArcadeScene variant={variant} accent={accent} onContextLost={() => setFailed(true)} />
          </CanvasBoundary>
        </div>
      )}
      {phase === 'skeleton' && !failed && <SceneSkeleton />}
      {(phase === 'poster' || failed) && posterNode}

      <div className="absolute inset-0 scene-scanlines pointer-events-none" aria-hidden="true" />
      <div className="absolute inset-0 scene-vignette pointer-events-none" aria-hidden="true" />
      <div className="absolute inset-0 scene-glow pointer-events-none" aria-hidden="true" />

      {/* Accessible foreground HUD slot (real text / info) */}
      {children && <div className="relative z-10 h-full">{children}</div>}
    </div>
  )
}

export default SceneFrame
