'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { createSupabaseBrowserClient } from '@/lib/supabase/browser'
import { loadUserRoadmapSummary } from '@/lib/roadmap/user-progress'
import {
  Home,
  Compass,
  Map,
  ListTodo,
  User,
  Briefcase,
  GraduationCap,
  GitBranch,
  Target,
  Flame,
  ScanLine,
  ChevronRight,
} from 'lucide-react'

// ============================================
// SIDEBAR v2 - Command Center Design
// ============================================

interface SidebarProgressWidgetProps {
  roleLabel?: string
  levelLabel?: string
  progress?: number
  streak?: number
  completedTasks?: number
  totalTasks?: number
}

export interface SidebarUserProfile extends SidebarProgressWidgetProps {}

const EMPTY_SIDEBAR_PROFILE: SidebarUserProfile = {
  roleLabel: 'Developer',
  levelLabel: 'Getting Started',
  progress: 0,
  streak: 0,
  completedTasks: 0,
  totalTasks: 0,
}

function useResolvedSidebarProfile(userProfile?: SidebarUserProfile) {
  const supabase = useMemo(() => createSupabaseBrowserClient(), [])
  const [resolvedProfile, setResolvedProfile] = useState<SidebarUserProfile>(
    userProfile ?? EMPTY_SIDEBAR_PROFILE
  )

  useEffect(() => {
    if (userProfile) {
      setResolvedProfile(userProfile)
      return
    }
    if (!supabase) {
      setResolvedProfile({
        ...EMPTY_SIDEBAR_PROFILE,
        roleLabel: 'Demo Mode',
      })
      return
    }

    let isActive = true

    const loadProfile = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser()

      if (error || !user || !isActive) return

      try {
        const summary = await loadUserRoadmapSummary(supabase, user.id)
        if (isActive) {
          setResolvedProfile(summary)
        }
      } catch (loadError) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('[Sidebar] progress unavailable:', loadError instanceof Error ? loadError.message : loadError)
        }
      }
    }

    loadProfile()

    return () => {
      isActive = false
    }
  }, [supabase, userProfile])

  return resolvedProfile
}

function SidebarProgressWidget({
  roleLabel = 'Developer',
  levelLabel = 'Getting Started',
  progress = 0,
  streak = 0,
  completedTasks = 0,
  totalTasks = 0,
}: SidebarProgressWidgetProps) {
  const prefersReducedMotion = useReducedMotion()
  const safeProgress = Math.max(0, Math.min(100, Math.round(progress)))

  return (
    <div className="relative mb-4 overflow-hidden bg-gradient-to-br from-yellow/50 via-yellow/25 to-pink/20 p-3 brutal-border brutal-radius shadow-brutal-sm">
      {/* Level Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center bg-gradient-to-br from-yellow to-orange brutal-border brutal-radius shadow-[2px_2px_0_0_rgba(0,0,0,0.9)]">
          <GraduationCap className="h-6 w-6" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-sm font-bold">{levelLabel}</p>
          <p className="truncate text-xs text-secondary">{roleLabel}</p>
        </div>
        {streak > 0 && (
          <div className="flex shrink-0 items-center gap-1 bg-white px-2 py-1 brutal-border brutal-radius">
            <Flame className="h-3.5 w-3.5 text-orange" aria-hidden="true" />
            <span className="metric-mono text-xs font-bold">{streak}</span>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mt-3">
        <div className="mb-1 flex items-center justify-between text-xs">
          <span className="hud-label text-[10px] text-black/70">Roadmap Progress</span>
          <span className="metric-mono font-bold">{safeProgress}%</span>
        </div>
        <div className="h-2.5 overflow-hidden border-2 border-black brutal-radius bg-white">
          <motion.div
            className="h-full bg-gradient-to-r from-green via-blue to-purple"
            initial={prefersReducedMotion ? false : { width: 0 }}
            animate={{ width: `${safeProgress}%` }}
            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.8, ease: 'easeOut' }}
          />
        </div>
      </div>

      <p className="mt-2 text-xs font-medium text-secondary">
        {totalTasks > 0 ? `${completedTasks}/${totalTasks} tasks completed` : 'No active roadmap yet'}
      </p>
    </div>
  )
}

type NavAccent = 'yellow' | 'blue' | 'pink' | 'green' | 'orange' | 'purple'

// Each route owns a signature colour so the active item reads like that page's
// theme — colour-coded "arcade" navigation layered on the neobrutalist frame.
const accentStyles: Record<NavAccent, { activeRow: string; idleTile: string }> = {
  yellow: { activeRow: 'bg-yellow', idleTile: 'bg-yellow/20' },
  blue: { activeRow: 'bg-blue', idleTile: 'bg-blue/20' },
  pink: { activeRow: 'bg-pink', idleTile: 'bg-pink/20' },
  green: { activeRow: 'bg-green', idleTile: 'bg-green/20' },
  orange: { activeRow: 'bg-orange', idleTile: 'bg-orange/20' },
  purple: { activeRow: 'bg-purple', idleTile: 'bg-purple/20' },
}

interface NavItemProps {
  href: string
  icon: typeof Home
  label: string
  accent?: NavAccent
  badge?: React.ReactNode
  isCollapsed?: boolean
}

function NavItem({ href, icon: Icon, label, accent = 'yellow', badge, isCollapsed = false }: NavItemProps) {
  const pathname = usePathname()
  const isActive = pathname === href || pathname.startsWith(`${href}/`)
  const styles = accentStyles[accent]

  return (
    <Link
      href={href}
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        'group relative flex items-center gap-3 px-3 py-2.5 brutal-radius transition-all duration-150 focus-brutal-ring',
        isActive
          ? cn(styles.activeRow, 'brutal-border font-bold shadow-brutal-sm -translate-x-0.5 -translate-y-0.5')
          : 'border-2 border-transparent hover:-translate-x-0.5 hover:-translate-y-0.5 hover:border-black hover:bg-cream-light',
        isCollapsed && 'justify-center'
      )}
    >
      <span
        className={cn(
          'flex h-9 w-9 shrink-0 items-center justify-center brutal-radius transition-all',
          isActive
            ? 'bg-white brutal-border shadow-[2px_2px_0_0_rgba(0,0,0,0.9)]'
            : cn(styles.idleTile, 'border-2 border-black/15 group-hover:border-black')
        )}
      >
        <Icon className={cn('h-[18px] w-[18px]', isActive && 'stroke-[2.6]')} aria-hidden="true" />
      </span>
      {!isCollapsed && (
        <>
          <span className="flex-1 text-[15px]">{label}</span>
          {badge ? <div className="ml-auto">{badge}</div> : isActive && (
            <span className="h-2 w-2 shrink-0 rounded-full bg-black" aria-hidden="true" />
          )}
        </>
      )}

      {/* Hover tooltip for collapsed state */}
      {isCollapsed && (
        <div className="absolute left-full ml-2 px-2 py-1 bg-black text-white text-xs font-medium rounded opacity-0 pointer-events-none group-hover:opacity-100 whitespace-nowrap z-50">
          {label}
          {badge && <span className="ml-1">{badge}</span>}
        </div>
      )}
    </Link>
  )
}

interface DesktopSidebarProps {
  className?: string
  userProfile?: SidebarUserProfile
}

export function DesktopSidebar({ className, userProfile }: DesktopSidebarProps) {
  const isCollapsed = false // Keep expanded by default for v2
  const resolvedProfile = useResolvedSidebarProfile(userProfile)

  const mainNavItems: { href: string; label: string; icon: typeof Home; accent: NavAccent }[] = [
    { href: '/dashboard', label: 'Dashboard', icon: Home, accent: 'yellow' },
    { href: '/onboarding', label: 'Onboarding', icon: GraduationCap, accent: 'green' },
    { href: '/skills', label: 'Skills', icon: Compass, accent: 'blue' },
    { href: '/jobs', label: 'Jobs', icon: Briefcase, accent: 'orange' },
    { href: '/roadmap', label: 'Roadmap', icon: Map, accent: 'pink' },
    { href: '/sprint', label: 'Sprint', icon: ListTodo, accent: 'green' },
    { href: '/github', label: 'GitHub', icon: GitBranch, accent: 'purple' },
    { href: '/cv-analyzer', label: 'CV Analyzer', icon: ScanLine, accent: 'pink' },
    { href: '/projects', label: 'Projects', icon: Target, accent: 'blue' },
  ]

  const bottomNavItems: { href: string; label: string; icon: typeof Home; accent: NavAccent }[] = [
    { href: '/settings', label: 'Settings', icon: User, accent: 'purple' },
  ]

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-40 hidden w-[280px] flex-col overflow-hidden border-r-3 border-black bg-white lg:flex',
        className
      )}
    >
      {/* Header with Logo */}
      <div className="border-b-3 border-black bg-gradient-to-r from-white to-yellow/15 p-5">
        <Link href="/dashboard" className="group flex items-center gap-3 rounded-brutal focus-brutal-ring">
          <div className="flex h-12 w-12 items-center justify-center bg-gradient-to-br from-yellow to-orange brutal-border brutal-radius shadow-[2px_2px_0_0_rgba(0,0,0,0.9)] transition-transform group-hover:-translate-y-0.5 group-hover:rotate-[-4deg]">
            <GraduationCap className="h-7 w-7" aria-hidden="true" />
          </div>
          <div>
            <span className="font-display text-xl font-bold">SkillPath</span>
            <p className="hud-label text-[10px] text-secondary">Career OS</p>
          </div>
        </Link>
      </div>

      {/* Progress Widget */}
      <div className="px-4 pt-4">
        <SidebarProgressWidget
          {...resolvedProfile}
        />
      </div>

      {/* Main Navigation */}
      <nav aria-label="Primary" className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
        <div className="mb-2">
          <p className="px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-tertiary">
            Main Menu
          </p>
        </div>
        {mainNavItems.map((item) => (
          <NavItem
            key={item.href}
            href={item.href}
            icon={item.icon}
            label={item.label}
            accent={item.accent}
            isCollapsed={isCollapsed}
          />
        ))}

        <div className="pt-4 mt-4 border-t-2 border-black/10">
          <p className="px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-tertiary">
            Account
          </p>
        </div>
        {bottomNavItems.map((item) => (
          <NavItem
            key={item.href}
            href={item.href}
            icon={item.icon}
            label={item.label}
            accent={item.accent}
            isCollapsed={isCollapsed}
          />
        ))}
      </nav>

      {/* Footer Zone */}
      <div className="border-t-3 border-black bg-gradient-to-b from-cream-light to-yellow/15 p-4">
        {/* User Profile Mini — links to Settings */}
        <Link
          href="/settings"
          className="group mb-3 flex items-center gap-3 bg-white p-2.5 brutal-border brutal-radius transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brutal-sm focus-brutal-ring"
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center bg-gradient-to-br from-blue to-purple brutal-border brutal-radius shadow-[2px_2px_0_0_rgba(0,0,0,0.9)]">
            <User className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold leading-tight">Career profile</p>
            <p className="truncate text-xs text-secondary">{resolvedProfile.roleLabel ?? 'Developer'}</p>
            {resolvedProfile.levelLabel && (
              <span className="mt-1 inline-block bg-yellow px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide brutal-border brutal-radius">
                {resolvedProfile.levelLabel}
              </span>
            )}
          </div>
          <ChevronRight className="h-4 w-4 shrink-0 text-black/40 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
        </Link>

        {/* Powered by */}
        <p className="text-center text-[10px] text-tertiary">SkillPath Career OS</p>
      </div>
    </aside>
  )
}

// Keep MobileBottomNav export
export { MobileBottomNav } from './mobile-bottom-nav'

// ============================================
// MOBILE SIDEBAR OVERLAY
// ============================================

interface MobileSidebarOverlayProps {
  isOpen: boolean
  onClose: () => void
  userProfile?: SidebarUserProfile
}

export function MobileSidebarOverlay({ isOpen, onClose, userProfile }: MobileSidebarOverlayProps) {
  const resolvedProfile = useResolvedSidebarProfile(userProfile)

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  const navItems: { href: string; label: string; icon: typeof Home; accent: NavAccent }[] = [
    { href: '/dashboard', label: 'Dashboard', icon: Home, accent: 'yellow' },
    { href: '/onboarding', label: 'Onboarding', icon: GraduationCap, accent: 'green' },
    { href: '/skills', label: 'Skills', icon: Compass, accent: 'blue' },
    { href: '/jobs', label: 'Jobs', icon: Briefcase, accent: 'orange' },
    { href: '/roadmap', label: 'Roadmap', icon: Map, accent: 'pink' },
    { href: '/sprint', label: 'Sprint', icon: ListTodo, accent: 'green' },
    { href: '/github', label: 'GitHub', icon: GitBranch, accent: 'purple' },
    { href: '/cv-analyzer', label: 'CV Analyzer', icon: ScanLine, accent: 'pink' },
    { href: '/projects', label: 'Projects', icon: Target, accent: 'blue' },
    { href: '/settings', label: 'Settings', icon: User, accent: 'purple' },
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={onClose}
          />

          {/* Sidebar Panel */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed inset-y-0 left-0 z-50 w-[280px] flex flex-col border-r-3 border-black bg-white lg:hidden"
          >
            <div className="p-5 border-b-3 border-black">
              <Link href="/dashboard" className="flex items-center gap-3 rounded-brutal focus-brutal-ring">
                <div className="w-10 h-10 bg-yellow brutal-border brutal-radius flex items-center justify-center">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <span className="font-display font-bold text-lg">SkillPath</span>
              </Link>
            </div>

            <div className="px-4 pt-4">
              <SidebarProgressWidget
                {...resolvedProfile}
              />
            </div>

            <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
              {navItems.map((item) => (
                <NavItem key={item.href} href={item.href} icon={item.icon} label={item.label} accent={item.accent} />
              ))}
            </nav>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
