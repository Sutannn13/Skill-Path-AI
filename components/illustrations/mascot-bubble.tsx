import { cn } from '@/lib/utils'
import { CartoonMascot, type CartoonMascotAccessory, type CartoonMascotMood } from './cartoon-mascot'

interface MascotBubbleProps {
  title: string
  message: string
  mood?: CartoonMascotMood
  accessory?: CartoonMascotAccessory
  className?: string
}

export function MascotBubble({
  title,
  message,
  mood = 'happy',
  accessory = 'none',
  className,
}: MascotBubbleProps) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <CartoonMascot mood={mood} accessory={accessory} size="sm" />
      <div className="relative rounded-brutal border-3 border-black bg-white px-4 py-3 shadow-brutal-sm">
        <div className="absolute -left-2 top-6 h-4 w-4 rotate-45 border-b-3 border-l-3 border-black bg-white" />
        <p className="font-display text-sm font-bold">{title}</p>
        <p className="text-xs text-black/70">{message}</p>
      </div>
    </div>
  )
}
