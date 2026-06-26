import { cn } from '@/lib/utils'
import Image from 'next/image'

interface AvatarProps {
  avatarUrl?: string | null
  initials?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export function Avatar({ avatarUrl, initials = 'U', size = 'md', className }: AvatarProps) {
  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-11 w-11 text-base',
    lg: 'h-16 w-16 text-xl',
    xl: 'h-20 w-20 text-3xl',
  }

  return (
    <div
      className={cn(
        'relative flex shrink-0 items-center justify-center bg-yellow brutal-border brutal-radius shadow-brutal-sm overflow-hidden',
        sizeClasses[size],
        className
      )}
    >
      {avatarUrl ? (
        <Image
          src={avatarUrl}
          alt="Avatar"
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
      ) : (
        <span className="font-black text-black">{initials}</span>
      )}
    </div>
  )
}
