import Link from 'next/link'
import { AlertTriangle, Lock } from 'lucide-react'
import { AppShell, Container, GradientBackground } from '@/components/layout'
import { DashboardHeader } from '@/components/layout/dashboard-header'
import { BrutalButton, BrutalCard } from '@/components/brutal'
import { canAccessAdmin, getCurrentUserWithProfile } from '@/lib/auth/roles'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

function DashboardAccessRequired({ message }: { message: string }) {
  return (
    <AppShell showBottomNav={false}>
      <GradientBackground />
      <DashboardHeader
        icon={Lock}
        iconColor="yellow"
        title="User Dashboard"
        subtitle="Sign in before opening your personal progress workspace"
      />
      <Container className="py-8">
        <BrutalCard color="yellow" shadow="lg" className="mx-auto max-w-2xl">
          <div className="flex flex-col gap-5 sm:flex-row">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center brutal-border brutal-radius bg-white">
              <Lock className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="font-display text-2xl font-bold">
                User access required
              </h1>
              <p className="mt-2 text-sm leading-6 text-black/75">
                {message}
              </p>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <Link href="/onboarding">
                  <BrutalButton color="black" size="sm">
                    Continue Onboarding
                  </BrutalButton>
                </Link>
                <Link href="/">
                  <BrutalButton variant="outline" color="black" size="sm">
                    Back Home
                  </BrutalButton>
                </Link>
              </div>
            </div>
          </div>
        </BrutalCard>

        <BrutalCard color="white" shadow="sm" className="mx-auto mt-4 max-w-2xl">
          <div className="flex gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
            <p className="text-sm leading-6 text-black/70">
              Phase 1 adds the server-side role boundary. A complete sign-in and
              sign-out screen should be added in the next auth phase.
            </p>
          </div>
        </BrutalCard>
      </Container>
    </AppShell>
  )
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const authState = await getCurrentUserWithProfile()

  if (!authState.isConfigured) {
    return children
  }

  if (!authState.user) {
    return (
      <DashboardAccessRequired message="Supabase is configured, but no verified session was found for this request." />
    )
  }

  if (!authState.profile) {
    return (
      <DashboardAccessRequired
        message={
          authState.error ??
          'Your auth account exists, but the matching profile row could not be loaded.'
        }
      />
    )
  }

  if (canAccessAdmin(authState.profile.role)) {
    redirect('/admin')
  }

  return children
}
