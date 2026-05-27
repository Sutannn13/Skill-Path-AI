'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { GraduationCap, Bell, Settings } from 'lucide-react'
import { BrutalIconButton } from '@/components/brutal/brutal-button'
import { LogoutButton } from '@/components/auth/logout-button'

interface DashboardHeaderProps {
  title?: string
  subtitle?: string
  showLogo?: boolean
  showActions?: boolean
  showLogout?: boolean
}

export function DashboardHeader({
  title,
  subtitle,
  showLogo = true,
  showActions = true,
  showLogout = true,
}: DashboardHeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-30">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {showLogo && (
            <Link href="/" className="flex items-center gap-3">
              <motion.div
                whileHover={{ rotate: -5 }}
                className="w-10 h-10 bg-yellow brutal-border brutal-radius flex items-center justify-center"
              >
                <GraduationCap className="w-6 h-6" />
              </motion.div>
              <span className="font-display font-bold text-xl hidden sm:block">SkillPath</span>
            </Link>
          )}
          {(title || subtitle) && (
            <div className="min-w-0">
              {title && <h1 className="truncate font-display text-base font-bold sm:text-lg">{title}</h1>}
              {subtitle && <p className="hidden text-sm text-gray-600 sm:block">{subtitle}</p>}
            </div>
          )}
        </div>

        {showActions && (
          <div className="flex items-center gap-2">
            <BrutalIconButton aria-label="Notifications" color="white">
              <Bell className="w-5 h-5" />
            </BrutalIconButton>
            <Link href="/settings" className="hidden sm:block">
              <BrutalIconButton aria-label="Settings" color="white">
                <Settings className="w-5 h-5" />
              </BrutalIconButton>
            </Link>
            {showLogout && (
              <LogoutButton
                color="red"
                size="sm"
                className="hidden md:flex"
              />
            )}
          </div>
        )}
      </div>
    </header>
  )
}
