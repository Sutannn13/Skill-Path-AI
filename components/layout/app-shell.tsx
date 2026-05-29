'use client'

import { cn } from '@/lib/utils'
import { DesktopSidebar, MobileBottomNav } from './mobile-bottom-nav'

interface AppShellProps {
  children: React.ReactNode
  className?: string
  showBottomNav?: boolean
  showSidebar?: boolean
}

export function AppShell({
  children,
  className,
  showBottomNav = true,
  showSidebar = true,
}: AppShellProps) {
  return (
    <div className="relative isolate min-h-screen overflow-x-hidden bg-background">
      {showSidebar && <DesktopSidebar />}

      <main
        className={cn(
          'relative z-10 min-h-screen w-full',
          showSidebar && 'lg:ml-[280px] lg:w-[calc(100%-280px)]',
          showBottomNav ? 'pb-24 lg:pb-10' : 'pb-8',
          className
        )}
      >
        {children}
      </main>

      {showBottomNav && <MobileBottomNav />}
    </div>
  )
}

interface PageHeaderProps {
  title: string
  subtitle?: string
  action?: React.ReactNode
}

export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b-3 border-black px-4 py-4">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <div>
          <h1 className="text-xl font-display font-bold">{title}</h1>
          {subtitle && (
            <p className="text-sm text-gray-600 mt-0.5">{subtitle}</p>
          )}
        </div>
        {action && <div>{action}</div>}
      </div>
    </header>
  )
}

interface ContainerProps {
  children: React.ReactNode
  className?: string
}

export function Container({ children, className }: ContainerProps) {
  return (
    <div className={cn('max-w-4xl mx-auto px-4 py-6', className)}>
      {children}
    </div>
  )
}

interface SectionProps {
  children: React.ReactNode
  className?: string
  title?: string
  subtitle?: string
}

export function Section({ children, className, title, subtitle }: SectionProps) {
  return (
    <section className={cn('mb-8', className)}>
      {title && (
        <div className="mb-4">
          <h2 className="text-lg font-display font-bold">{title}</h2>
          {subtitle && (
            <p className="text-sm text-gray-600">{subtitle}</p>
          )}
        </div>
      )}
      {children}
    </section>
  )
}

interface GridProps {
  children: React.ReactNode
  cols?: 1 | 2 | 3 | 4
  className?: string
}

export function Grid({ children, cols = 2, className }: GridProps) {
  const colClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  }

  return (
    <div className={cn('grid gap-4', colClasses[cols], className)}>
      {children}
    </div>
  )
}
