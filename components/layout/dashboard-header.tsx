'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import { GraduationCap, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DashboardHeaderProps {
  title?: string
  subtitle?: string
  icon?: LucideIcon
  iconColor?: 'yellow' | 'blue' | 'pink' | 'green' | 'orange' | 'purple' | 'white'
  showLogo?: boolean
  showActions?: boolean
}

export function DashboardHeader({
  title,
  subtitle,
  icon: Icon,
  iconColor = 'yellow',
  showLogo = false,
  showActions = false,
}: DashboardHeaderProps) {
  return (
    <header className="bg-white border-b-3 border-black px-4 py-3 sticky top-0 z-30">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {showLogo && (
            <Link href="/dashboard" className="flex items-center gap-3 rounded-brutal focus-brutal-ring">
              <motion.div
                whileHover={{ rotate: -5 }}
                className="w-10 h-10 bg-yellow brutal-border brutal-radius flex items-center justify-center"
              >
                <GraduationCap className="w-6 h-6" aria-hidden="true" />
              </motion.div>
              <span className="font-display font-bold text-xl hidden sm:block">SkillPath</span>
            </Link>
          )}
          {!showLogo && Icon && (
            <div
              className={cn(
                'flex h-10 w-10 shrink-0 items-center justify-center brutal-border brutal-radius',
                iconColor === 'yellow' && 'bg-yellow',
                iconColor === 'blue' && 'bg-blue',
                iconColor === 'pink' && 'bg-pink',
                iconColor === 'green' && 'bg-green',
                iconColor === 'orange' && 'bg-orange',
                iconColor === 'purple' && 'bg-purple',
                iconColor === 'white' && 'bg-white'
              )}
              aria-hidden="true"
            >
              <Icon className="h-5 w-5" />
            </div>
          )}
          {(title || subtitle) && (
            <div className="min-w-0">
              {title && <h1 className="truncate font-display text-base font-bold sm:text-lg">{title}</h1>}
              {subtitle && <p className="hidden text-sm text-secondary sm:block">{subtitle}</p>}
            </div>
          )}
        </div>

        {showActions && (
          <div className="flex items-center gap-2">
            <Link href="/settings" aria-label="Settings" className="rounded-brutal focus-brutal-ring">
              <div className="w-11 h-11 bg-white brutal-border brutal-radius flex items-center justify-center hover:bg-gray-100 transition-colors">
                <Settings className="w-5 h-5" aria-hidden="true" />
              </div>
            </Link>
          </div>
        )}
      </div>
    </header>
  )
}
