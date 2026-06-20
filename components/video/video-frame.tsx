'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils'

export type BroadcastAccent = 'yellow' | 'pink' | 'blue' | 'green' | 'purple'
export type BroadcastVariant = 'hero' | 'auth'

const frameAccentClass: Record<BroadcastAccent, string> = {
  yellow: 'broadcast-frame-yellow',
  pink: 'broadcast-frame-pink',
  blue: 'broadcast-frame-blue',
  green: 'broadcast-frame-green',
  purple: 'broadcast-frame-purple',
}

// SMPTE-ish palette used both by the poster and the live canvas color bars.
const BARS = ['#FFD447', '#9BE564', '#7CC9FF', '#B39DDB', '#FF8FAB', '#FFB86B', '#FF6B6B'] as const

function prefersReducedData(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false
  try {
    return window.matchMedia('(prefers-reduced-data: reduce)').matches
  } catch {
    return false
  }
}

// Static "no live signal" monitor — the SSR frame and the fallback for
// reduced-motion / reduced-data / offscreen / load failure. Not a blank
// placeholder: it carries color bars + a signal label like a real monitor.
function BroadcastPoster({ accent, label }: { accent: BroadcastAccent; label?: string }) {
  return (
    <div className="absolute inset-0 grid place-items-center p-6" aria-hidden="true">
      <div
        className="w-full max-w-[300px] overflow-hidden rounded-[14px] brutal-border"
        style={{ backgroundColor: '#0E1A33', boxShadow: `0 0 32px -6px rgba(var(--neon), 0.45)` }}
      >
        <div className="signal-bars h-16 w-full" />
        <div className="flex items-center justify-between bg-cabinet px-3 py-2">
          <span className="hud-label text-[10px] text-on-dark-soft">CH 01 · {accent.toUpperCase()}</span>
          <span className="metric-mono text-[11px] font-bold text-on-dark">{label ?? 'SIGNAL LOCKED'}</span>
        </div>
      </div>
    </div>
  )
}

/**
 * VideoFrame — a neobrutalist "broadcast viewfinder" that runs a lightweight,
 * code-generated VHS loop (Canvas2D) behind CRT chrome, with a full fallback
 * stack. Renders a static poster on the server and on any device that should
 * not run motion (reduced-motion, reduced-data, offscreen, load failure), and
 * only animates on capable clients once the frame scrolls into view.
 *
 * Pass a real muted/looping clip via `src` to upgrade the loop to footage; it
 * stays paused off-screen and degrades to the poster under reduced-motion/data.
 * The moving content is decorative and aria-hidden — pass real information via
 * `children` (an accessible foreground OSD/HUD).
 */
export function VideoFrame({
  variant = 'hero',
  accent = 'yellow',
  src,
  poster,
  posterLabel,
  className,
  pulse = true,
  children,
}: {
  variant?: BroadcastVariant
  accent?: BroadcastAccent
  /** Optional real clip. When absent, a procedural Canvas2D loop is used. */
  src?: string
  /** Custom poster node, or a poster image URL forwarded to <video>. */
  poster?: ReactNode | string
  posterLabel?: string
  className?: string
  pulse?: boolean
  children?: ReactNode
}) {
  const ref = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const prefersReducedMotion = useReducedMotion()
  const [phase, setPhase] = useState<'poster' | 'live'>('poster')
  const [reducedData, setReducedData] = useState(false)

  // Detect reduced-data once on the client (defaults to false on SSR).
  useEffect(() => {
    setReducedData(prefersReducedData())
  }, [])

  // Viewport gating: live only while in view and motion/data are allowed.
  useEffect(() => {
    if (prefersReducedMotion || reducedData) {
      setPhase('poster')
      return
    }
    const node = ref.current
    if (!node || typeof IntersectionObserver === 'undefined') {
      setPhase('live')
      return
    }
    const observer = new IntersectionObserver(
      ([entry]) => setPhase(entry.isIntersecting ? 'live' : 'poster'),
      { rootMargin: '200px 0px', threshold: 0.01 }
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [prefersReducedMotion, reducedData])

  const live = phase === 'live'
  const useVideo = Boolean(src) && live

  // Procedural broadcast loop (only when live and not driving a <video>).
  useEffect(() => {
    if (!live || useVideo) return
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    const W = canvas.width
    const H = canvas.height
    const noise = ctx.createImageData(W, H)
    const data = noise.data
    const speed = variant === 'hero' ? 1.7 : 1.2
    let raf = 0
    let frame = 0

    const render = () => {
      frame += 1
      // Static noise — generated on the first frame (frame === 1) and then every
      // other frame to ease CPU, so the canvas paints static immediately.
      if (frame % 2 === 1) {
        for (let i = 0; i < data.length; i += 4) {
          const v = 16 + ((Math.random() * 54) | 0)
          data[i] = v
          data[i + 1] = v
          data[i + 2] = Math.min(255, v + 10)
          data[i + 3] = 255
        }
      }
      ctx.putImageData(noise, 0, 0)

      // Soft horizontal "sync" band sweeping down the screen.
      const bandY = ((frame * speed) % (H + 24)) - 12
      const grad = ctx.createLinearGradient(0, bandY - 10, 0, bandY + 10)
      grad.addColorStop(0, 'rgba(255,255,255,0)')
      grad.addColorStop(0.5, 'rgba(255,255,255,0.20)')
      grad.addColorStop(1, 'rgba(255,255,255,0)')
      ctx.fillStyle = grad
      ctx.fillRect(0, bandY - 10, W, 20)

      // Faint color bars along the bottom edge.
      const bw = W / BARS.length
      ctx.globalAlpha = 0.16
      BARS.forEach((c, i) => {
        ctx.fillStyle = c
        ctx.fillRect(i * bw, H - 10, Math.ceil(bw), 10)
      })
      ctx.globalAlpha = 1

      raf = requestAnimationFrame(render)
    }

    raf = requestAnimationFrame(render)
    return () => cancelAnimationFrame(raf)
  }, [live, useVideo, variant])

  // Play/pause the optional real clip in lockstep with the live phase.
  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    if (useVideo) {
      const playback = v.play()
      if (playback && typeof playback.catch === 'function') playback.catch(() => {})
    } else {
      v.pause()
    }
  }, [useVideo])

  const posterUrl = typeof poster === 'string' ? poster : undefined
  const posterNode =
    poster && typeof poster !== 'string' ? poster : <BroadcastPoster accent={accent} label={posterLabel} />

  return (
    <div
      ref={ref}
      className={cn(
        'broadcast-frame',
        frameAccentClass[accent],
        pulse && live && 'broadcast-frame-pulse',
        className
      )}
    >
      {/* Base poster — always present on SSR and whenever the loop is idle. */}
      {!live && posterNode}

      {/* Code-generated VHS loop (default content). */}
      {live && !useVideo && (
        <canvas
          ref={canvasRef}
          width={180}
          height={112}
          aria-hidden="true"
          className="vhs-flicker absolute inset-0 h-full w-full"
          style={{ imageRendering: 'pixelated', objectFit: 'cover' }}
        />
      )}

      {/* Optional real footage — paused off-screen, poster fallback. */}
      {src && (
        <video
          ref={videoRef}
          aria-hidden="true"
          muted
          loop
          playsInline
          preload="none"
          poster={posterUrl}
          className={cn(
            'absolute inset-0 h-full w-full object-cover transition-opacity duration-300',
            useVideo ? 'opacity-100' : 'opacity-0'
          )}
        >
          <source src={src} />
        </video>
      )}

      {/* Decorative CRT chrome (all aria-hidden). */}
      <div className="vhs-tracking pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="vhs-scanlines pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="vhs-vignette pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="vhs-glow pointer-events-none absolute inset-0" aria-hidden="true" />

      {/* Accessible foreground OSD slot (real text / info). */}
      {children && <div className="relative z-10 h-full">{children}</div>}
    </div>
  )
}

export default VideoFrame
