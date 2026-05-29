import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export type CartoonStickerColor = 'yellow' | 'blue' | 'pink' | 'green' | 'orange' | 'purple' | 'white'
export type CartoonStickerSize = 'sm' | 'md' | 'lg'

interface CartoonStickerProps {
  icon?: LucideIcon
  label?: string
  color?: CartoonStickerColor
  size?: CartoonStickerSize
  className?: string
  animated?: boolean
}

const colorClasses: Record<CartoonStickerColor, string> = {
  yellow: 'bg-yellow',
  blue: 'bg-blue',
  pink: 'bg-pink',
  green: 'bg-green',
  orange: 'bg-orange',
  purple: 'bg-purple',
  white: 'bg-white',
}

const sizeClasses: Record<CartoonStickerSize, string> = {
  sm: 'min-h-9 min-w-9 px-2 text-xs',
  md: 'min-h-12 min-w-12 px-3 text-sm',
  lg: 'min-h-16 min-w-16 px-4 text-base',
}

const iconSizes: Record<CartoonStickerSize, string> = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-7 w-7',
}

export function CartoonSticker({
  icon: Icon,
  label,
  color = 'yellow',
  size = 'md',
  className,
  animated = true,
}: CartoonStickerProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center gap-1.5 brutal-border brutal-radius shadow-brutal-sm',
        'font-display font-bold leading-none text-black transition-transform duration-200',
        animated && 'cartoon-sticker-motion hover:-rotate-2 hover:-translate-y-0.5',
        colorClasses[color],
        sizeClasses[size],
        className
      )}
    >
      {Icon && <Icon className={iconSizes[size]} aria-hidden="true" />}
      {label && <span>{label}</span>}
    </span>
  )
}
