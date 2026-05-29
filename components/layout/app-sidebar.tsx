'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { LogoutButton } from '@/components/auth/logout-button'
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
} from 'lucide-react'

// ============================================
// SIDEBAR v2 - Command Center Design
// ============================================

interface SidebarProgressWidgetProps {
  roleLabel?: string
  level?: number
  progress?: number
  streak?: number
}

function SidebarProgressWidget({ roleLabel = 'Developer', level = 1, progress = 0, streak = 0 }: SidebarProgressWidgetProps) {
  const prefersReducedMotion = useReducedMotion()
  const levelNames = ['Newbie', 'Apprentice', 'Developer', 'Expert', 'Master']
  const currentLevelName = levelNames[Math.min(level, levelNames.length - 1)]

  return (
    <div className="mb-4 p-3 bg-yellow/30 brutal-border brutal-radius">
      {/* Level Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-12 h-12 bg-yellow brutal-border brutal-radius flex items-center justify-center">
          <GraduationCap className="h-6 w-6" aria-hidden="true" />
        </div>
        <div className="flex-1">
          <p className="font-display font-bold text-sm">{currentLevelName}</p>
          <p className="text-xs text-black/60">{roleLabel}</p>
        </div>
        {streak > 0 && (
          <div className="flex items-center gap-1">
            <Flame className="w-4 h-4 text-orange" />
            <span className="text-xs font-bold">{streak}</span>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mt-3">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="font-medium">Roadmap Progress</span>
          <span className="font-bold">{progress}%</span>
        </div>
        <div className="h-2 bg-black/10 brutal-radius border border-black/20 overflow-hidden">
          <motion.div
            className="h-full bg-black"
            initial={prefersReducedMotion ? false : { width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.8, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* XP indicator */}
      <div className="mt-2 flex items-center gap-2 text-xs">
        <div className="flex-1 h-1.5 bg-black/10 brutal-radius overflow-hidden">
          <div className="h-full bg-green w-3/4" />
        </div>
        <span className="text-xs font-medium">750/1000 XP</span>
      </div>
    </div>
  )
}

interface NavBadgeProps {
  label: string
  variant?: 'new' | 'hot' | 'count'
}

function NavBadge({ label, variant = 'new' }: NavBadgeProps) {
  const variantStyles = {
    new: 'bg-yellow text-black',
    hot: 'bg-red text-white',
    count: 'bg-blue text-black',
  }

  return (
    <span className={cn(
      'px-1.5 py-0.5 text-[10px] font-bold uppercase brutal-radius',
      variantStyles[variant]
    )}>
      {label}
    </span>
  )
}

interface NavItemProps {
  href: string
  icon: typeof Home
  label: string
  badge?: React.ReactNode
  isCollapsed?: boolean
}

function NavItem({ href, icon: Icon, label, badge, isCollapsed = false }: NavItemProps) {
  const pathname = usePathname()
  const isActive = pathname === href || pathname.startsWith(`${href}/`)

  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-3 px-4 py-3 brutal-radius transition-all duration-150 group relative',
        isActive
          ? 'bg-yellow font-bold shadow-brutal-sm'
          : 'hover:bg-gray-100',
        isCollapsed && 'justify-center'
      )}
    >
      {/* Active indicator */}
      <div
        className={cn(
          'absolute left-0 top-1/2 -translate-y-1/2 w-1 bg-black rounded-r-full transition-all',
          isActive ? 'h-6' : 'h-0 opacity-0'
        )}
      />

      <Icon className={cn('w-5 h-5 shrink-0', isActive && 'stroke-[3]')} />
      {!isCollapsed && (
        <>
          <span className="flex-1">{label}</span>
          {badge && <div className="ml-auto">{badge}</div>}
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
  userProfile?: {
    roleLabel?: string
    level?: number
    progress?: number
    streak?: number
  }
}

export function DesktopSidebar({ className, userProfile }: DesktopSidebarProps) {
  const isCollapsed = false // Keep expanded by default for v2

  const mainNavItems = [
    { href: '/dashboard', label: 'Dashboard', icon: Home, badge: null },
    { href: '/onboarding', label: 'Onboarding', icon: GraduationCap, badge: null },
    { href: '/skills', label: 'Skills', icon: Compass, badge: null },
    { href: '/jobs', label: 'Jobs', icon: Briefcase, badge: <NavBadge label="New" variant="new" /> },
    { href: '/roadmap', label: 'Roadmap', icon: Map, badge: <NavBadge label="3" variant="count" /> },
    { href: '/sprint', label: 'Sprint', icon: ListTodo, badge: <NavBadge label="Today" variant="hot" /> },
    { href: '/github', label: 'GitHub', icon: GitBranch, badge: null },
    { href: '/projects', label: 'Projects', icon: Target, badge: null },
  ]

  const bottomNavItems = [
    { href: '/settings', label: 'Settings', icon: User, badge: null },
  ]

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-40 hidden w-[280px] flex-col overflow-hidden border-r-3 border-black bg-white lg:flex',
        className
      )}
    >
      {/* Header with Logo */}
      <div className="p-5 border-b-3 border-black">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="w-12 h-12 bg-yellow brutal-border brutal-radius flex items-center justify-center group-hover:scale-105 transition-transform">
            <GraduationCap className="w-7 h-7" />
          </div>
          <div>
            <span className="font-display font-bold text-xl">SkillPath</span>
            <p className="text-xs text-black/60">Career OS</p>
          </div>
        </Link>
      </div>

      {/* Progress Widget */}
      <div className="px-4 pt-4">
        <SidebarProgressWidget
          roleLabel={userProfile?.roleLabel}
          level={userProfile?.level}
          progress={userProfile?.progress}
          streak={userProfile?.streak}
        />
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
        <div className="mb-2">
          <p className="px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-black/40">
            Main Menu
          </p>
        </div>
        {mainNavItems.map((item) => (
          <NavItem
            key={item.href}
            href={item.href}
            icon={item.icon}
            label={item.label}
            badge={item.badge}
            isCollapsed={isCollapsed}
          />
        ))}

        <div className="pt-4 mt-4 border-t-2 border-black/10">
          <p className="px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-black/40">
            Account
          </p>
        </div>
        {bottomNavItems.map((item) => (
          <NavItem
            key={item.href}
            href={item.href}
            icon={item.icon}
            label={item.label}
            badge={item.badge}
            isCollapsed={isCollapsed}
          />
        ))}
      </nav>

      {/* Footer Zone */}
      <div className="p-4 border-t-3 border-black bg-cream-light">
        {/* User Profile Mini */}
        <div className="flex items-center gap-3 mb-3 p-2 bg-white brutal-border brutal-radius">
          <div className="w-10 h-10 bg-blue brutal-border brutal-radius flex items-center justify-center">
            <User className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">Career profile</p>
            <p className="text-xs text-black/60 truncate">{userProfile?.roleLabel ?? 'Developer'}</p>
          </div>
        </div>

        {/* Logout Button */}
        <LogoutButton color="red" size="sm" className="w-full" />

        {/* Powered by */}
        <p className="mt-3 text-[10px] text-center text-black/40">
          SkillPath Career OS
        </p>
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
  userProfile?: {
    roleLabel?: string
    level?: number
    progress?: number
    streak?: number
  }
}

export function MobileSidebarOverlay({ isOpen, onClose, userProfile }: MobileSidebarOverlayProps) {
  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/onboarding', label: 'Onboarding', icon: GraduationCap },
    { href: '/skills', label: 'Skills', icon: Compass },
    { href: '/jobs', label: 'Jobs', icon: Briefcase },
    { href: '/roadmap', label: 'Roadmap', icon: Map },
    { href: '/sprint', label: 'Sprint', icon: ListTodo },
    { href: '/github', label: 'GitHub', icon: GitBranch },
    { href: '/projects', label: 'Projects', icon: Target },
    { href: '/settings', label: 'Settings', icon: User },
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
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed inset-y-0 left-0 z-50 w-[280px] flex flex-col border-r-3 border-black bg-white lg:hidden"
          >
            <div className="p-5 border-b-3 border-black">
              <Link href="/dashboard" className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow brutal-border brutal-radius flex items-center justify-center">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <span className="font-display font-bold text-lg">SkillPath</span>
              </Link>
            </div>

            <div className="px-4 pt-4">
              <SidebarProgressWidget
                roleLabel={userProfile?.roleLabel}
                level={userProfile?.level}
                progress={userProfile?.progress}
                streak={userProfile?.streak}
              />
            </div>

            <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
              {navItems.map((item) => (
                <NavItem key={item.href} href={item.href} icon={item.icon} label={item.label} />
              ))}
            </nav>

            <div className="p-4 border-t-3 border-black">
              <LogoutButton color="red" size="sm" className="w-full" />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
