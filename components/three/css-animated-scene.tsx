'use client'

import { useEffect, useState } from 'react'

export function CSSAnimatedScene({ className = 'h-64' }: { className?: string }) {
  return (
    <div className={className}>
      <div className="relative h-full w-full overflow-hidden">
        <div className="absolute left-10 top-10 h-32 w-32 animate-float rounded-full bg-yellow opacity-40" />
        <div
          className="absolute right-10 top-20 h-40 w-40 animate-float rounded-full bg-blue opacity-30"
          style={{ animationDelay: '1s' }}
        />
        <div
          className="absolute bottom-20 left-1/4 h-24 w-24 animate-float rounded-full bg-pink opacity-40"
          style={{ animationDelay: '2s' }}
        />

        <div className="absolute left-1/4 top-1/3 h-16 w-16 animate-wiggle brutal-border brutal-radius bg-yellow" />
        <div
          className="absolute right-1/3 top-1/4 h-12 w-12 animate-float brutal-border brutal-radius bg-blue"
          style={{ animationDelay: '0.5s' }}
        />
        <div
          className="absolute bottom-1/3 right-1/4 h-20 w-20 animate-wiggle brutal-border brutal-radius bg-green"
          style={{ animationDelay: '1.5s' }}
        />

        <div className="absolute left-8 top-1/2 animate-pulse font-mono text-4xl font-bold text-black/10">
          {'{ }'}
        </div>
        <div
          className="absolute bottom-1/4 right-8 animate-pulse font-mono text-4xl font-bold text-black/10"
          style={{ animationDelay: '0.5s' }}
        >
          {'< >'}
        </div>
      </div>
    </div>
  )
}

export function use3DSupport(): boolean {
  const [supports3D, setSupports3D] = useState(false)

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0
    const isSmallScreen = window.innerWidth < 768

    setSupports3D(!reducedMotion && !isTouchDevice && !isSmallScreen)
  }, [])

  return supports3D
}
