'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
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
} from 'lucide-react'

const bottomNavItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/jobs', label: 'Jobs', icon: Briefcase },
  { href: '/skills', label: 'Skills', icon: Compass },
  { href: '/roadmap', label: 'Roadmap', icon: Map },
  { href: '/sprint', label: 'Sprint', icon: ListTodo },
]

interface MobileBottomNavProps {
  className?: string
}

export function MobileBottomNav({ className }: MobileBottomNavProps) {
  const pathname = usePathname()

  return (
    <nav
      aria-label="Primary"
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50 bg-white border-t-3 border-black lg:hidden',
        className
      )}
    >
      <div className="flex items-center justify-around px-2 py-2">
        {bottomNavItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'flex flex-col items-center justify-center px-3 py-2 rounded-xl transition-all duration-150 min-w-[60px] min-h-[44px] focus-brutal-ring',
                isActive ? 'bg-yellow text-black font-bold' : 'text-secondary hover:bg-gray-100'
              )}
            >
              <Icon className={cn('w-5 h-5', isActive ? 'stroke-[3]' : '')} aria-hidden="true" />
              <span className="text-xs mt-1 font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

interface DesktopSidebarProps {
  className?: string
}

export function DesktopSidebar({ className }: DesktopSidebarProps) {
  const pathname = usePathname()

  const allItems = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/onboarding', label: 'Onboarding', icon: GraduationCap },
    { href: '/skills', label: 'Skills', icon: Compass },
    { href: '/jobs', label: 'Jobs', icon: Briefcase },
    { href: '/roadmap', label: 'Roadmap', icon: Map },
    { href: '/sprint', label: 'Sprint', icon: ListTodo },
    { href: '/github', label: 'GitHub', icon: GitBranch },
    { href: '/settings', label: 'Settings', icon: User },
  ]

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-40 hidden w-[280px] flex-col overflow-y-auto border-r-3 border-black bg-white lg:flex',
        className
      )}
    >
      {/* Logo */}
      <div className="p-6 border-b-3 border-black">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-yellow brutal-border brutal-radius flex items-center justify-center">
            <GraduationCap className="w-6 h-6" />
          </div>
          <span className="font-display font-bold text-xl">SkillPath</span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-2">
        {allItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 brutal-radius transition-all duration-150',
                isActive
                  ? 'bg-yellow font-bold'
                  : 'hover:bg-gray-100'
              )}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="space-y-3 p-4 border-t-3 border-black">
        <LogoutButton color="red" size="sm" className="w-full" />
        <p className="text-xs text-gray-500 text-center">
          Career OS for Developers
        </p>
      </div>
    </aside>
  )
}
