import { cn } from '@/lib/utils'

interface DoodleBackgroundProps {
  className?: string
}

export function DoodleBackground({ className }: DoodleBackgroundProps) {
  return (
    <svg
      viewBox="0 0 1200 600"
      className={cn('pointer-events-none absolute inset-0 h-full w-full opacity-30', className)}
      aria-hidden="true"
    >
      <g stroke="#000" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M80 80 C130 30 210 30 260 80" />
        <path d="M260 80 C310 130 390 130 440 80" />
        <path d="M760 120 C800 70 870 70 910 120" />
        <path d="M980 420 C1040 380 1100 380 1160 420" />
        <circle cx="180" cy="250" r="22" fill="#FFD84D" />
        <rect x="470" y="320" width="54" height="54" rx="8" fill="#F9B4D0" />
        <path d="M620 460 L680 400 L740 460 L680 520 Z" fill="#B9E5FF" />
        <path d="M980 170 h70" />
        <path d="M1015 135 v70" />
      </g>
    </svg>
  )
}
