import { cn } from '@/lib/utils'

type CatMascotMood = 'happy' | 'focus' | 'cheer'

interface CatMascotProps {
  className?: string
  mood?: CatMascotMood
  withMessage?: string
}

export function CatMascot({ className, mood = 'happy', withMessage }: CatMascotProps) {
  const mouthPath = mood === 'focus'
    ? 'M60 96 Q72 90 84 96'
    : mood === 'cheer'
      ? 'M58 95 Q72 108 86 95'
      : 'M58 95 Q72 103 86 95'

  return (
    <div className={cn('relative inline-flex', className)}>
      <svg viewBox="0 0 160 160" className="h-full w-full">
        <g stroke="#000" strokeWidth="4" strokeLinejoin="round" strokeLinecap="round">
          <path d="M40 54 L58 24 L72 50 Z" fill="#FFE4A3" />
          <path d="M120 54 L102 24 L88 50 Z" fill="#FFE4A3" />
          <ellipse cx="80" cy="84" rx="52" ry="48" fill="#FFE4A3" />
          <circle cx="60" cy="80" r="5" fill="#000" />
          <circle cx="100" cy="80" r="5" fill="#000" />
          <path d="M80 86 L74 92 L80 97 L86 92 Z" fill="#FFB6C4" />
          <path d={mouthPath} fill="none" />
          <path d="M44 92 L20 88" />
          <path d="M46 100 L18 102" />
          <path d="M116 92 L140 88" />
          <path d="M114 100 L142 102" />
          <rect x="62" y="114" width="36" height="18" rx="6" fill="#7AD3FF" />
          <path d="M58 114 H102" />
        </g>
      </svg>

      {withMessage && (
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md border-2 border-black bg-white px-3 py-1 text-xs font-bold">
          {withMessage}
        </div>
      )}
    </div>
  )
}
