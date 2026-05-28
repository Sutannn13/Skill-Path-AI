'use client'

import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'

interface FloatingShape {
  id: number
  x: number
  y: number
  size: number
  color: string
  rotation: number
  type: 'circle' | 'square' | 'triangle' | 'star' | 'zigzag'
  duration: number
  delay: number
  opacity: number
}

// Brutalism color palette
const BRUTAL_COLORS = [
  '#FFD447', // yellow
  '#7CC9FF', // blue
  '#FF8FAB', // pink
  '#9BE564', // green
  '#FFB86B', // orange
  '#B39DDB', // purple
]

// Generate deterministic floating shapes
function generateShapes(count: number): FloatingShape[] {
  const shapes: FloatingShape[] = []
  for (let i = 0; i < count; i++) {
    const seed = i * 137.5 // Golden angle for nice distribution
    shapes.push({
      id: i,
      x: (Math.sin(seed) * 0.5 + 0.5) * 100,
      y: (Math.cos(seed * 0.7) * 0.5 + 0.5) * 100,
      size: 20 + ((seed * 10) % 80),
      color: BRUTAL_COLORS[i % BRUTAL_COLORS.length],
      rotation: (seed * 7) % 360,
      type: ['circle', 'square', 'triangle', 'star', 'zigzag'][i % 5] as FloatingShape['type'],
      duration: 15 + (seed % 20),
      delay: (seed * 0.1) % 10,
      opacity: 0.15 + (seed % 10) * 0.05,
    })
  }
  return shapes
}

// Doodle patterns for neobrutalism background
function DoodlePattern({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg
      viewBox="0 0 200 200"
      className={cn('absolute opacity-10', className)}
      style={style}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Squiggly lines */}
      <path
        d="M10 30 Q30 20 50 30 T90 30 T130 30"
        fill="none"
        stroke="#111"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M10 60 Q30 50 50 60 T90 60 T130 60"
        fill="none"
        stroke="#111"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Stars */}
      <path
        d="M50 100 L53 108 L62 108 L55 113 L58 122 L50 117 L42 122 L45 113 L38 108 L47 108 Z"
        fill="#111"
      />
      <path
        d="M150 50 L152 55 L158 55 L153 58 L155 64 L150 60 L145 64 L147 58 L142 55 L148 55 Z"
        fill="#111"
      />

      {/* Dots */}
      <circle cx="20" cy="100" r="3" fill="#111" />
      <circle cx="35" cy="110" r="2" fill="#111" />
      <circle cx="170" cy="80" r="3" fill="#111" />
      <circle cx="180" cy="95" r="2" fill="#111" />

      {/* Plus signs */}
      <path d="M100 20 L100 35 M92.5 27.5 L107.5 27.5" stroke="#111" strokeWidth="2" />
      <path d="M80 150 L80 160 M75 155 L85 155" stroke="#111" strokeWidth="2" />

      {/* X marks */}
      <path d="M160 120 L170 130 M170 120 L160 130" stroke="#111" strokeWidth="2" />
    </svg>
  )
}

// Floating geometric shape component
function FloatingShapeComponent({ shape }: { shape: FloatingShape }) {
  const getShape = () => {
    switch (shape.type) {
      case 'circle':
        return (
          <div
            className="brutal-border rounded-full"
            style={{
              width: shape.size,
              height: shape.size,
              backgroundColor: shape.color,
            }}
          />
        )
      case 'square':
        return (
          <div
            className="brutal-border brutal-radius"
            style={{
              width: shape.size,
              height: shape.size,
              backgroundColor: shape.color,
            }}
          />
        )
      case 'triangle':
        return (
          <svg
            width={shape.size}
            height={shape.size}
            viewBox="0 0 100 100"
            className="brutal-border"
          >
            <polygon
              points="50,5 95,95 5,95"
              fill={shape.color}
              stroke="#111"
              strokeWidth="3"
            />
          </svg>
        )
      case 'star':
        return (
          <svg
            width={shape.size}
            height={shape.size}
            viewBox="0 0 100 100"
            className="brutal-border"
          >
            <polygon
              points="50,5 61,40 98,40 68,62 79,97 50,75 21,97 32,62 2,40 39,40"
              fill={shape.color}
              stroke="#111"
              strokeWidth="3"
            />
          </svg>
        )
      case 'zigzag':
        return (
          <svg width={shape.size} height={shape.size} viewBox="0 0 50 50">
            <path
              d="M5 25 L15 10 L25 40 L35 10 L45 25"
              fill="none"
              stroke={shape.color}
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="brutal-border"
            />
          </svg>
        )
      default:
        return null
    }
  }

  return (
    <div
      className="absolute pointer-events-none transition-transform"
      style={{
        left: `${shape.x}%`,
        top: `${shape.y}%`,
        opacity: shape.opacity,
        animation: `float-${shape.id % 5} ${shape.duration}s ease-in-out infinite`,
        animationDelay: `${shape.delay}s`,
        transform: `rotate(${shape.rotation}deg)`,
      }}
    >
      {getShape()}
    </div>
  )
}

// Grid pattern for brutalism effect
function GridPattern({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'absolute inset-0 opacity-[0.03] pointer-events-none',
        className
      )}
      style={{
        backgroundImage: `
          linear-gradient(#111 1px, transparent 1px),
          linear-gradient(90deg, #111 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px',
      }}
    />
  )
}

// Floating dots pattern
function DotPattern({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'absolute inset-0 opacity-[0.05] pointer-events-none',
        className
      )}
      style={{
        backgroundImage: 'radial-gradient(#111 2px, transparent 2px)',
        backgroundSize: '30px 30px',
      }}
    />
  )
}

interface AnimatedBrutalBackgroundProps {
  variant?: 'login' | 'register' | 'default'
  intensity?: 'low' | 'medium' | 'high'
  className?: string
  showDoodles?: boolean
}

export function AnimatedBrutalBackground({
  variant = 'default',
  intensity = 'medium',
  className,
  showDoodles = true,
}: AnimatedBrutalBackgroundProps) {
  const [shapes, setShapes] = useState<FloatingShape[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const shapeCount = intensity === 'low' ? 8 : intensity === 'medium' ? 15 : 25
    setShapes(generateShapes(shapeCount))
  }, [intensity])

  // Don't render on server
  if (!mounted) {
    return (
      <div className={cn('fixed inset-0 -z-10 bg-background', className)}>
        <div className="absolute inset-0 bg-gradient-to-br from-yellow/20 via-pink/10 to-blue/20" />
      </div>
    )
  }

  const gradientColors = {
    login: 'from-yellow/30 via-pink/15 to-blue/25',
    register: 'from-pink/30 via-yellow/15 to-green/25',
    default: 'from-yellow/20 via-pink/10 to-blue/20',
  }

  return (
    <div className={cn('fixed inset-0 -z-10 bg-background overflow-hidden', className)}>
      {/* Base gradient */}
      <div
        className={cn(
          'absolute inset-0 bg-gradient-to-br transition-opacity duration-1000',
          gradientColors[variant]
        )}
      />

      {/* Animated gradient overlay */}
      <div
        className={cn(
          'absolute inset-0 opacity-50',
          'bg-gradient-to-tr from-transparent via-white/20 to-transparent',
          'animate-gradient-shift'
        )}
        style={{
          animation: 'gradientShift 8s ease-in-out infinite',
        }}
      />

      {/* Grid pattern */}
      <GridPattern />

      {/* Dot pattern */}
      <DotPattern />

      {/* Floating shapes */}
      <div className="relative w-full h-full">
        {shapes.map((shape) => (
          <FloatingShapeComponent key={shape.id} shape={shape} />
        ))}
      </div>

      {/* Doodle patterns */}
      {showDoodles && (
        <>
          <DoodlePattern
            className="top-10 left-10 w-40 h-40 animate-float"
            style={{ animationDuration: '12s' }}
          />
          <DoodlePattern
            className="top-1/4 right-10 w-32 h-32 animate-wiggle"
            style={{ animationDuration: '8s' }}
          />
          <DoodlePattern
            className="bottom-20 left-1/4 w-36 h-36 animate-float"
            style={{ animationDuration: '15s', animationDelay: '-5s' }}
          />
          <DoodlePattern
            className="bottom-10 right-1/4 w-40 h-40 animate-wiggle"
            style={{ animationDuration: '10s', animationDelay: '-3s' }}
          />
        </>
      )}

      {/* Noise texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  )
}

// CSS keyframes injected via style tag
export function BrutalBackgroundStyles() {
  return (
    <style jsx global>{`
      @keyframes float-0 {
        0%, 100% { transform: translateY(0) rotate(0deg); }
        50% { transform: translateY(-30px) rotate(10deg); }
      }
      @keyframes float-1 {
        0%, 100% { transform: translateY(0) rotate(0deg); }
        50% { transform: translateY(-25px) rotate(-15deg); }
      }
      @keyframes float-2 {
        0%, 100% { transform: translateY(0) rotate(0deg); }
        50% { transform: translateY(-35px) rotate(20deg); }
      }
      @keyframes float-3 {
        0%, 100% { transform: translateY(0) rotate(0deg); }
        50% { transform: translateY(-20px) rotate(-10deg); }
      }
      @keyframes float-4 {
        0%, 100% { transform: translateY(0) rotate(0deg); }
        50% { transform: translateY(-40px) rotate(15deg); }
      }
      @keyframes gradientShift {
        0%, 100% {
          background-position: 0% 50%;
        }
        50% {
          background-position: 100% 50%;
        }
      }
      @keyframes wiggle {
        0%, 100% { transform: rotate(-3deg); }
        50% { transform: rotate(3deg); }
      }
      .animate-gradient-shift {
        background-size: 200% 200%;
      }
    `}</style>
  )
}

// Simple bouncing dots for variety
export function BouncingDots({ className }: { className?: string }) {
  return (
    <div className={cn('relative w-full h-full', className)}>
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="absolute w-3 h-3 brutal-border brutal-radius bg-yellow"
          style={{
            left: `${15 + i * 15}%`,
            bottom: '10%',
            animation: `bounce ${2 + i * 0.3}s ease-in-out infinite`,
            animationDelay: `${i * 0.2}s`,
          }}
        />
      ))}
      <style jsx>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-30px); }
        }
      `}</style>
    </div>
  )
}
