'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils'
import {
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Lock,
  PartyPopper,
  Search,
  TrendingDown,
  TrendingUp,
  X,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

// ============================================
// BRUTAL UI v2 - Design System Components
// ============================================

// --- StickerBadge Component ---
export type StickerBadgeVariant =
  | 'completed' | 'locked' | 'in-progress' | 'quiz-passed'
  | 'needs-review' | 'great-match' | 'low-risk'
  | 'internship' | 'fresh-graduate' | 'boss-fight'
  | 'yellow' | 'blue' | 'pink' | 'green' | 'orange' | 'purple'

interface StickerBadgeProps {
  variant: StickerBadgeVariant
  label?: string
  icon?: LucideIcon
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const variantStyles: Record<StickerBadgeVariant, { bg: string; text: string; border: string }> = {
  completed: { bg: 'bg-green', text: 'text-black', border: 'border-black' },
  locked: { bg: 'bg-gray-200', text: 'text-gray-500', border: 'border-gray-400' },
  'in-progress': { bg: 'bg-blue', text: 'text-black', border: 'border-black' },
  'quiz-passed': { bg: 'bg-yellow', text: 'text-black', border: 'border-black' },
  'needs-review': { bg: 'bg-orange', text: 'text-black', border: 'border-black' },
  'great-match': { bg: 'bg-green', text: 'text-black', border: 'border-black' },
  'low-risk': { bg: 'bg-green/20', text: 'text-green', border: 'border-green' },
  internship: { bg: 'bg-pink', text: 'text-black', border: 'border-black' },
  'fresh-graduate': { bg: 'bg-blue', text: 'text-black', border: 'border-black' },
  'boss-fight': { bg: 'bg-red', text: 'text-white', border: 'border-black' },
  yellow: { bg: 'bg-yellow', text: 'text-black', border: 'border-black' },
  blue: { bg: 'bg-blue', text: 'text-black', border: 'border-black' },
  pink: { bg: 'bg-pink', text: 'text-black', border: 'border-black' },
  green: { bg: 'bg-green', text: 'text-black', border: 'border-black' },
  orange: { bg: 'bg-orange', text: 'text-black', border: 'border-black' },
  purple: { bg: 'bg-purple', text: 'text-black', border: 'border-black' },
}

const variantLabels: Record<StickerBadgeVariant, string> = {
  completed: 'Completed',
  locked: 'Locked',
  'in-progress': 'In Progress',
  'quiz-passed': 'Quiz Passed',
  'needs-review': 'Needs Review',
  'great-match': 'Great Match',
  'low-risk': 'Low Risk',
  internship: 'Internship',
  'fresh-graduate': 'Fresh Grad',
  'boss-fight': 'Boss Fight',
  yellow: '',
  blue: '',
  pink: '',
  green: '',
  orange: '',
  purple: '',
}

const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
  lg: 'px-4 py-1.5 text-base',
}

const iconSizes = {
  sm: 'w-3 h-3',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
}

const iconColorClasses = {
  yellow: 'bg-yellow',
  blue: 'bg-blue',
  pink: 'bg-pink',
  green: 'bg-green',
  orange: 'bg-orange',
  purple: 'bg-purple',
}

export function StickerBadge({ variant, label, icon: Icon, size = 'md', className }: StickerBadgeProps) {
  const style = variantStyles[variant]
  const displayLabel = label ?? variantLabels[variant]

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 brutal-border brutal-radius font-bold uppercase tracking-wide',
        style.bg, style.text, style.border,
        sizeClasses[size],
        className
      )}
    >
      {Icon && <Icon className={iconSizes[size]} aria-hidden="true" />}
      {displayLabel}
    </span>
  )
}

// --- QuestCard Component ---
interface QuestCardProps {
  title: string
  subtitle?: string
  icon?: LucideIcon
  iconColor?: 'yellow' | 'blue' | 'pink' | 'green' | 'orange' | 'purple'
  badge?: React.ReactNode
  progress?: number
  progressLabel?: string
  status?: 'available' | 'in-progress' | 'completed' | 'locked'
  onClick?: () => void
  className?: string
  children?: React.ReactNode
}

const statusBorderColors = {
  available: 'border-black',
  'in-progress': 'border-blue border-dashed',
  completed: 'border-green',
  locked: 'border-gray-400',
}

const statusBgColors = {
  available: 'bg-white',
  'in-progress': 'bg-blue/10',
  completed: 'bg-green/10',
  locked: 'bg-gray-100',
}

export function QuestCard({
  title, subtitle, icon: Icon, iconColor = 'yellow',
  badge, progress, progressLabel, status = 'available',
  onClick, className, children
}: QuestCardProps) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <motion.div
      whileHover={!prefersReducedMotion && onClick ? { x: -4, y: -4 } : undefined}
      whileTap={!prefersReducedMotion && onClick ? { x: 0, y: 0 } : undefined}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      onClick={onClick}
      className={cn(
        'brutal-border brutal-radius p-4 transition-shadow',
        statusBorderColors[status],
        statusBgColors[status],
        onClick && 'cursor-pointer hover:shadow-brutal-lg',
        !onClick && 'cursor-default',
        className
      )}
    >
      <div className="flex items-start gap-3">
        {Icon && (
          <div className={cn(
            'w-10 h-10 brutal-border brutal-radius flex items-center justify-center shrink-0',
            iconColorClasses[iconColor]
          )}>
            <Icon className="w-5 h-5" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-display font-bold truncate">{title}</h3>
            {badge}
          </div>
          {subtitle && <p className="text-sm text-black/70">{subtitle}</p>}
          {progress !== undefined && (
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-medium">{progressLabel ?? 'Progress'}</span>
                <span className="font-bold">{progress}%</span>
              </div>
              <div className="h-2 bg-black/10 brutal-radius border border-black/20 overflow-hidden">
                <div
                  className="h-full bg-black transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
          {children}
        </div>
      </div>
    </motion.div>
  )
}

// --- StatusStamp Component ---
type TaskStatus =
  | 'resources_pending'
  | 'quiz_pending'
  | 'project_pending'
  | 'completed'
  | 'locked'
  | 'in_progress'

interface StatusStampProps {
  status: TaskStatus
  label?: string
  className?: string
}

const statusStampConfig: Record<TaskStatus, { variant: StickerBadgeVariant; label: string; icon: LucideIcon }> = {
  resources_pending: { variant: 'yellow', label: 'Resources Pending', icon: Search },
  quiz_pending: { variant: 'in-progress', label: 'Quiz Pending', icon: HelpCircle },
  project_pending: { variant: 'needs-review', label: 'Project Pending', icon: PartyPopper },
  completed: { variant: 'completed', label: 'Completed', icon: CheckCircle2 },
  locked: { variant: 'locked', label: 'Locked', icon: Lock },
  in_progress: { variant: 'in-progress', label: 'In Progress', icon: TrendingUp },
}

export function StatusStamp({ status, label, className }: StatusStampProps) {
  const config = statusStampConfig[status]

  return (
    <StickerBadge
      variant={config.variant}
      label={label ?? config.label}
      icon={config.icon}
      size="sm"
      className={className}
    />
  )
}

// --- ProgressStamp Component ---
interface ProgressStampProps {
  label: string
  value: string | number
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'success' | 'warning'
  className?: string
}

export function ProgressStamp({ label, value, size = 'md', variant = 'default', className }: ProgressStampProps) {
  const variantStyles = {
    default: 'bg-white text-black',
    success: 'bg-green text-black',
    warning: 'bg-yellow text-black',
  }

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  }

  return (
    <div className={cn(
      'brutal-border brutal-radius text-center',
      variantStyles[variant],
      sizeClasses[size],
      className
    )}>
      <p className="font-bold">{value}</p>
      <p className="text-xs opacity-70">{label}</p>
    </div>
  )
}

// --- SectionHeader Component ---
interface SectionHeaderProps {
  label: string
  icon?: LucideIcon
  helper?: string
  action?: React.ReactNode
  className?: string
}

export function SectionHeader({ label, icon: Icon, helper, action, className }: SectionHeaderProps) {
  return (
    <div className={cn('flex items-center justify-between mb-4', className)}>
      <div className="flex items-center gap-2">
        {Icon && (
          <span className="w-8 h-8 bg-yellow brutal-border brutal-radius flex items-center justify-center">
            <Icon className="w-4 h-4" aria-hidden="true" />
          </span>
        )}
        <h2 className="font-display font-bold text-lg">{label}</h2>
      </div>
      <div className="flex items-center gap-3">
        {helper && <span className="text-sm text-black/60 hidden sm:block">{helper}</span>}
        {action}
      </div>
    </div>
  )
}

// --- EmptyState Component ---
interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: React.ReactNode
  variant?: 'default' | 'locked' | 'search'
  className?: string
}

export function EmptyState({ icon: Icon, title, description, action, variant = 'default', className }: EmptyStateProps) {
  const defaultIconMap: Record<NonNullable<EmptyStateProps['variant']>, LucideIcon> = {
    default: Search,
    locked: Lock,
    search: HelpCircle,
  }
  const DisplayIcon = Icon ?? defaultIconMap[variant]

  return (
    <div className={cn(
      'brutal-border brutal-radius p-8 text-center bg-white/50',
      className
    )}>
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center brutal-border brutal-radius bg-yellow">
        <DisplayIcon className="h-7 w-7" aria-hidden="true" />
      </div>
      <h3 className="font-display font-bold text-lg mb-2">{title}</h3>
      {description && <p className="text-sm text-black/60 mb-4">{description}</p>}
      {action}
    </div>
  )
}

// --- ErrorState Component ---
interface ErrorStateProps {
  title?: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export function ErrorState({
  title = 'Something went wrong',
  description = 'Please try again or contact support if the problem persists.',
  action,
  className
}: ErrorStateProps) {
  return (
    <div className={cn(
      'brutal-border brutal-radius p-6 text-center bg-red/10 border-red',
      className
    )}>
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center brutal-border brutal-radius bg-red/10">
        <AlertTriangle className="h-7 w-7 text-red" aria-hidden="true" />
      </div>
      <h3 className="font-display font-bold text-lg mb-2">{title}</h3>
      <p className="text-sm text-black/70 mb-4">{description}</p>
      {action}
    </div>
  )
}

// --- SuccessState Component ---
interface SuccessStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export function SuccessState({
  icon: Icon,
  title,
  description,
  action,
  className
}: SuccessStateProps) {
  return (
    <div className={cn(
      'brutal-border brutal-radius p-6 text-center bg-green/10 border-green',
      className
    )}>
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center brutal-border brutal-radius bg-green/20">
        {Icon ? (
          <Icon className="h-7 w-7" aria-hidden="true" />
        ) : (
          <PartyPopper className="h-7 w-7" aria-hidden="true" />
        )}
      </div>
      <h3 className="font-display font-bold text-lg mb-2">{title}</h3>
      {description && <p className="text-sm text-black/70 mb-4">{description}</p>}
      {action}
    </div>
  )
}

// --- MascotBubble Component (Enhanced) ---
interface MascotBubbleProps {
  mood?: 'happy' | 'focused' | 'confused' | 'celebrating' | 'sleepy' | 'thinking'
  accessory?: 'map' | 'laptop' | 'briefcase' | 'pencil' | 'gear' | 'trophy' | 'clipboard' | 'none'
  title: string
  message?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function MascotBubble({
  mood = 'happy',
  accessory = 'none',
  title,
  message,
  size = 'md',
  className
}: MascotBubbleProps) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      {/* Simple cat face */}
      <div className={cn(
        'w-12 h-12 bg-yellow brutal-border brutal-radius flex items-center justify-center',
        size === 'sm' && 'w-10 h-10',
        size === 'lg' && 'w-16 h-16',
      )}>
        <span className="text-2xl">🐱</span>
      </div>
      <div className="relative rounded-brutal border-3 border-black bg-white px-4 py-3 shadow-brutal-sm">
        <div className="absolute -left-2 top-6 h-4 w-4 rotate-45 border-b-3 border-l-3 border-black bg-white" />
        <p className="font-display text-sm font-bold">{title}</p>
        {message && <p className="text-xs text-black/70">{message}</p>}
      </div>
    </div>
  )
}

// --- LevelBadge Component ---
interface LevelBadgeProps {
  level: number
  label?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function LevelBadge({ level, label, size = 'md', className }: LevelBadgeProps) {
  const colors = ['bg-gray-200', 'bg-blue', 'bg-green', 'bg-yellow', 'bg-green']
  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-14 h-14 text-xl',
  }

  return (
    <div className={cn(
      'brutal-border brutal-radius flex flex-col items-center justify-center',
      colors[level] ?? colors[0],
      sizeClasses[size],
      className
    )}>
      <span className="font-bold">{level}</span>
      {label && <span className="text-[10px]">{label}</span>}
    </div>
  )
}

// --- StatCard Component ---
interface StatCardProps {
  label: string
  value: string | number
  icon?: LucideIcon
  iconColor?: 'yellow' | 'blue' | 'pink' | 'green' | 'orange' | 'purple'
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string
  className?: string
}

export function StatCard({
  label, value, icon: Icon, iconColor = 'yellow',
  trend, trendValue, className
}: StatCardProps) {
  const iconBg = iconColorClasses[iconColor]

  return (
    <div className={cn(
      'brutal-border brutal-radius p-4 bg-white',
      className
    )}>
      <div className="flex items-center gap-3 mb-2">
        {Icon && (
          <div className={cn(
            'w-10 h-10 brutal-border brutal-radius flex items-center justify-center',
            iconBg
          )}>
            <Icon className="w-5 h-5" />
          </div>
        )}
        <div>
          <p className="text-xs text-black/60 uppercase tracking-wide">{label}</p>
          <p className="font-display font-bold text-2xl">{value}</p>
        </div>
      </div>
      {trend && trendValue && (
        <div className={cn(
          'flex items-center gap-1 text-xs font-medium',
          trend === 'up' && 'text-green',
          trend === 'down' && 'text-red',
          trend === 'neutral' && 'text-black/60'
        )}>
          {trend === 'up' && <TrendingUp className="h-3 w-3" aria-hidden="true" />}
          {trend === 'down' && <TrendingDown className="h-3 w-3" aria-hidden="true" />}
          {trendValue}
        </div>
      )}
    </div>
  )
}

// --- TagBadge Component ---
interface TagBadgeProps {
  label: string
  color?: 'yellow' | 'blue' | 'pink' | 'green' | 'orange' | 'purple' | 'gray'
  size?: 'sm' | 'md'
  removable?: boolean
  onRemove?: () => void
  className?: string
}

const tagColors = {
  yellow: 'bg-yellow/20 border-yellow text-yellow',
  blue: 'bg-blue/20 border-blue text-blue',
  pink: 'bg-pink/20 border-pink text-pink',
  green: 'bg-green/20 border-green text-green',
  orange: 'bg-orange/20 border-orange text-orange',
  purple: 'bg-purple/20 border-purple text-purple',
  gray: 'bg-gray-200 border-gray-400 text-gray-600',
}

export function TagBadge({
  label, color = 'gray', size = 'md',
  removable, onRemove, className
}: TagBadgeProps) {
  return (
    <span className={cn(
      'brutal-radius border-2 font-medium inline-flex items-center gap-1',
      tagColors[color],
      size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm',
      className
    )}>
      {label}
      {removable && (
        <button
          onClick={onRemove}
          className="ml-1 hover:bg-black/10 rounded-full p-0.5"
          aria-label={`Remove ${label}`}
        >
          <X className="h-3 w-3" aria-hidden="true" />
        </button>
      )}
    </span>
  )
}
