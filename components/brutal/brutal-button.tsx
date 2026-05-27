'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost'
type ButtonColor = 'yellow' | 'blue' | 'pink' | 'green' | 'orange' | 'purple' | 'black' | 'white' | 'red' | 'gray'

interface BrutalButtonProps {
  children: React.ReactNode
  onClick?: () => void
  variant?: ButtonVariant
  color?: ButtonColor
  size?: 'sm' | 'md' | 'lg'
  className?: string
  disabled?: boolean
  loading?: boolean
  type?: 'button' | 'submit' | 'reset'
  fullWidth?: boolean
}

const variantClasses = {
  primary: 'bg-white text-black',
  secondary: 'bg-transparent text-black',
  outline: 'bg-white text-black border-3',
  ghost: 'bg-transparent text-black shadow-none border-transparent',
}

const colorClasses: Record<ButtonColor, string> = {
  yellow: 'bg-yellow',
  blue: 'bg-blue',
  pink: 'bg-pink',
  green: 'bg-green',
  orange: 'bg-orange',
  purple: 'bg-purple',
  black: 'bg-black text-white',
  white: 'bg-white text-black',
  red: 'bg-red text-white',
  gray: 'bg-gray-100 text-black',
}

const sizeClasses = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
}

export function BrutalButton({
  children,
  onClick,
  variant = 'primary',
  color = 'yellow',
  size = 'md',
  className,
  disabled = false,
  loading = false,
  type = 'button',
  fullWidth = false,
}: BrutalButtonProps) {
  const isPrimary = variant === 'primary'
  const bgClass = isPrimary ? colorClasses[color] : variantClasses[variant]

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={!disabled ? { x: -2, y: -2 } : undefined}
      whileTap={!disabled ? { x: 0, y: 0 } : undefined}
      className={cn(
        'brutal-border brutal-radius font-bold transition-all duration-150 flex items-center justify-center gap-2',
        bgClass,
        isPrimary ? 'shadow-brutal-sm hover:shadow-brutal-lg' : 'shadow-none',
        sizeClasses[size],
        disabled && 'opacity-50 cursor-not-allowed',
        fullWidth && 'w-full',
        className
      )}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </motion.button>
  )
}

export function BrutalIconButton({
  children,
  onClick,
  color = 'yellow',
  size = 'md',
  className,
  disabled = false,
  'aria-label': ariaLabel,
}: {
  children: React.ReactNode
  onClick?: () => void
  color?: ButtonColor
  size?: 'sm' | 'md' | 'lg'
  className?: string
  disabled?: boolean
  'aria-label': string
}) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  }

  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      whileHover={!disabled ? { x: -2, y: -2 } : undefined}
      whileTap={!disabled ? { x: 0, y: 0 } : undefined}
      aria-label={ariaLabel}
      className={cn(
        'brutal-border brutal-radius flex items-center justify-center transition-all duration-150',
        colorClasses[color],
        sizeClasses[size],
        'shadow-brutal-sm hover:shadow-brutal-lg',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      {children}
    </motion.button>
  )
}