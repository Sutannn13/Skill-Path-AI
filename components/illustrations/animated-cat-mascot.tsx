'use client'

import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'

export type CatMascotMood = 'happy' | 'focus' | 'cheer' | 'sleepy' | 'excited'

interface CatMascotProps {
  className?: string
  mood?: CatMascotMood
  withMessage?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  animated?: boolean
}

// Generate random seed for consistent per-mascot animation offsets
function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

export function AnimatedCatMascot({
  className,
  mood = 'happy',
  withMessage,
  size = 'md',
  animated = true,
}: CatMascotProps) {
  const [currentMood, setCurrentMood] = useState(mood)
  const [isBlinking, setIsBlinking] = useState(false)
  const [isWaving, setIsWaving] = useState(false)

  // Random animation offsets for variety
  const seed = 42
  const floatDuration = 3 + seededRandom(seed) * 2
  const wiggleDuration = 1.5 + seededRandom(seed + 1) * 1
  const bounceDelay = seededRandom(seed + 2) * 2

  // Cycle moods if animated
  useEffect(() => {
    if (!animated) return

    const moods: CatMascotMood[] = ['happy', 'focus', 'cheer', 'sleepy']
    let index = moods.indexOf(currentMood)

    const moodInterval = setInterval(() => {
      index = (index + 1) % moods.length
      setCurrentMood(moods[index])
    }, 5000 + seededRandom(seed) * 3000)

    // Blinking animation
    const blinkInterval = setInterval(() => {
      setIsBlinking(true)
      setTimeout(() => setIsBlinking(false), 150)
    }, 2500 + seededRandom(seed + 3) * 1500)

    // Occasional wave
    const waveInterval = setInterval(() => {
      if (Math.random() > 0.6) {
        setIsWaving(true)
        setTimeout(() => setIsWaving(false), 800)
      }
    }, 7000)

    return () => {
      clearInterval(moodInterval)
      clearInterval(blinkInterval)
      clearInterval(waveInterval)
    }
  }, [animated, currentMood])

  const sizeMap = {
    sm: 60,
    md: 120,
    lg: 160,
    xl: 200,
  }

  const svgSize = sizeMap[size]

  // Dynamic expressions based on mood
  const getEyeStyle = () => {
    if (isBlinking) {
      return { r: 3, ry: 1 }
    }
    if (currentMood === 'sleepy') {
      return { r: 4, ry: 2 }
    }
    if (currentMood === 'excited' || currentMood === 'cheer') {
      return { r: 6, ry: 6 }
    }
    return { r: 5, ry: 5 }
  }

  const getMouthPath = () => {
    switch (currentMood) {
      case 'focus':
        return 'M58 96 Q72 88 86 96'
      case 'cheer':
      case 'excited':
        return 'M56 94 Q72 112 88 94'
      case 'sleepy':
        return 'M58 98 Q72 102 86 98'
      default:
        return 'M56 96 Q72 106 88 96'
    }
  }

  const getEarRotation = () => {
    if (currentMood === 'cheer' || currentMood === 'excited') {
      return -5
    }
    return 0
  }

  const getTailPath = () => {
    if (currentMood === 'sleepy') {
      return 'M130 100 Q145 95 140 80'
    }
    if (currentMood === 'excited' || currentMood === 'cheer') {
      return 'M130 100 Q160 70 145 50'
    }
    return 'M130 100 Q150 80 145 60'
  }

  const eyeStyle = getEyeStyle()
  const earRotation = getEarRotation()

  return (
    <div className={cn('relative inline-flex', className)}>
      <div
        className={cn(
          'relative',
          animated && 'animate-float'
        )}
        style={{
          animationDuration: `${floatDuration}s`,
          animationDelay: `${bounceDelay}s`,
        }}
      >
        <svg
          viewBox="0 0 160 160"
          width={svgSize}
          height={svgSize}
          className={cn(
            'drop-shadow-lg',
            animated && currentMood === 'cheer' && 'animate-wiggle'
          )}
          style={{
            animationDuration: animated && currentMood === 'cheer' ? `${wiggleDuration}s` : undefined,
          }}
        >
          {/* Background blur circle */}
          <ellipse
            cx="80"
            cy="150"
            rx="40"
            ry="8"
            fill="rgba(0,0,0,0.1)"
          />

          {/* Tail */}
          <path
            d={getTailPath()}
            fill="none"
            stroke="#FFE4A3"
            strokeWidth="8"
            strokeLinecap="round"
            className="transition-all duration-500"
          />

          {/* Left Ear */}
          <g transform={`rotate(${earRotation}, 56, 24)`}>
            <path d="M40 54 L58 24 L72 50 Z" fill="#FFE4A3" stroke="#000" strokeWidth="4" />
            <path d="M48 50 L56 32 L64 48 Z" fill="#FFB6C4" />
          </g>

          {/* Right Ear */}
          <g transform={`rotate(${-earRotation}, 104, 24)`}>
            <path d="M120 54 L102 24 L88 50 Z" fill="#FFE4A3" stroke="#000" strokeWidth="4" />
            <path d="M112 50 L104 32 L96 48 Z" fill="#FFB6C4" />
          </g>

          {/* Body */}
          <ellipse
            cx="80"
            cy="84"
            rx="52"
            ry="48"
            fill="#FFE4A3"
            stroke="#000"
            strokeWidth="4"
          />

          {/* Belly */}
          <ellipse
            cx="80"
            cy="95"
            rx="30"
            ry="25"
            fill="#FFF5E0"
          />

          {/* Left Eye */}
          <g transform={isBlinking ? 'translate(0 56) scale(1 0.3)' : undefined}>
            <ellipse
              cx="60"
              cy="80"
              rx={eyeStyle.r}
              ry={eyeStyle.ry}
              fill="#000"
            />
            {!isBlinking && (
              <ellipse
                cx="62"
                cy="78"
                rx="2"
                ry="2"
                fill="#FFF"
              />
            )}
          </g>

          {/* Right Eye */}
          <g transform={isBlinking ? 'translate(0 56) scale(1 0.3)' : undefined}>
            <ellipse
              cx="100"
              cy="80"
              rx={eyeStyle.r}
              ry={eyeStyle.ry}
              fill="#000"
            />
            {!isBlinking && (
              <ellipse
                cx="102"
                cy="78"
                rx="2"
                ry="2"
                fill="#FFF"
              />
            )}
          </g>

          {/* Nose */}
          <path
            d="M80 86 L74 92 L80 97 L86 92 Z"
            fill="#FFB6C4"
            stroke="#000"
            strokeWidth="2"
          />

          {/* Mouth */}
          <path
            d={getMouthPath()}
            fill="none"
            stroke="#000"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Whiskers - Left */}
          <g stroke="#000" strokeWidth="2" strokeLinecap="round">
            <line x1="44" y1="88" x2="20" y2="84" className="transition-all duration-300" />
            <line x1="46" y1="96" x2="18" y2="98" className="transition-all duration-300" />
            <line x1="44" y1="104" x2="22" y2="112" className="transition-all duration-300" />
          </g>

          {/* Whiskers - Right */}
          <g stroke="#000" strokeWidth="2" strokeLinecap="round">
            <line x1="116" y1="88" x2="140" y2="84" className="transition-all duration-300" />
            <line x1="114" y1="96" x2="142" y2="98" className="transition-all duration-300" />
            <line x1="116" y1="104" x2="138" y2="112" className="transition-all duration-300" />
          </g>

          {/* Cheeks (blush) */}
          {currentMood === 'cheer' || currentMood === 'excited' ? (
            <>
              <ellipse cx="45" cy="95" rx="8" ry="5" fill="#FFB6C4" opacity="0.6" />
              <ellipse cx="115" cy="95" rx="8" ry="5" fill="#FFB6C4" opacity="0.6" />
            </>
          ) : null}

          {/* Collar/Bow */}
          <rect x="62" y="114" width="36" height="18" rx="6" fill="#7AD3FF" stroke="#000" strokeWidth="3" />
          <path d="M80 114 H80" stroke="#000" strokeWidth="2" />
          {/* Bow tie */}
          <g transform="translate(80, 123)">
            <path d="M-6 -4 L0 0 L-6 4 Z" fill="#FF6B6B" stroke="#000" strokeWidth="1" />
            <path d="M6 -4 L0 0 L6 4 Z" fill="#FF6B6B" stroke="#000" strokeWidth="1" />
            <circle cx="0" cy="0" r="2" fill="#FF6B6B" stroke="#000" strokeWidth="1" />
          </g>

          {/* Paws */}
          <ellipse cx="50" cy="125" rx="12" ry="8" fill="#FFE4A3" stroke="#000" strokeWidth="3" />
          <ellipse cx="110" cy="125" rx="12" ry="8" fill="#FFE4A3" stroke="#000" strokeWidth="3" />

          {/* Waving paw animation */}
          {isWaving && (
            <g className="animate-wiggle" style={{ transformOrigin: '110px 125px' }}>
              <ellipse cx="125" cy="115" rx="10" ry="8" fill="#FFE4A3" stroke="#000" strokeWidth="3" />
            </g>
          )}
        </svg>

        {/* Mood indicator dots */}
        {animated && (
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {['happy', 'focus', 'cheer', 'sleepy'].map((m, i) => (
              <div
                key={m}
                className={cn(
                  'w-2 h-2 rounded-full transition-all duration-300',
                  currentMood === m ? 'bg-black scale-125' : 'bg-gray-300'
                )}
              />
            ))}
          </div>
        )}
      </div>

      {withMessage && (
        <motion.div
          className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md border-2 border-black bg-white px-3 py-1 text-xs font-bold shadow-brutal-sm"
          animate={{
            y: [0, -4, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          {withMessage}
          {/* Speech bubble tail */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[8px] border-l-transparent border-r-transparent border-t-black" />
        </motion.div>
      )}
    </div>
  )
}

// Separate animation CSS import
import { motion } from 'framer-motion'
