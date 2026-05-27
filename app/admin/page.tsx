import Link from 'next/link'
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Briefcase,
  Database,
  Lock,
  ShieldCheck,
  Users,
} from 'lucide-react'
import { AppShell, Container, GradientBackground, Grid, Section } from '@/components/layout'
import { DashboardHeader } from '@/components/layout/dashboard-header'
import { BrutalButton, BrutalCard } from '@/components/brutal'
import { canAccessAdmin, getCurrentUserWithProfile } from '@/lib/auth/roles'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

interface AdminMetric {
  label: string
  value: string
  helper: string
  icon: typeof Users
  color: 'yellow' | 'blue' | 'green' | 'pink'
}

async function countRows(tableName: string) {
  const supabase = await createSupabaseServerClient()

  if (!supabase) {
    return null
  }

  const { count, error } = await supabase
    .from(tableName)
    .select('id', { count: 'exact', head: true })

  if (error) {
    console.error(`[Admin] Failed to count ${tableName}:`, error.message)
    return null
  }

  return count ?? 0
}

async function getAdminMetrics(): Promise<AdminMetric[]> {
  const [userCount, jobCount, roadmapCount, activityCount] = await Promise.all([
    countRows('profiles'),
    countRows('job_posts'),
    countRows('roadmaps'),
    countRows('activity_logs'),
  ])

  return [
    {
      label: 'Users',
      value: userCount === null ? 'N/A' : userCount.toString(),
      helper: 'Profiles visible through admin RLS',
      icon: Users,
      color: 'yellow',
    },
    {
      label: 'Jobs',
      value: jobCount === null ? 'N/A' : jobCount.toString(),
      helper: 'Indexed job posts and moderation pool',
      icon: Briefcase,
      color: 'blue',
    },
    {
      label: 'Roadmaps',
      value: roadmapCount === null ? 'N/A' : roadmapCount.toString(),
      helper: 'Generated learning plans',
      icon: Database,
      color: 'green',
    },
    {
      label: 'Activity',
      value: activityCount === null ? 'N/A' : activityCount.toString(),
      helper: 'User activity events',
      icon: Activity,
      color: 'pink',
    },
  ]
}

function AdminShell({
  title,
  description,
  icon,
  action,
}: {
  title: string
  description: string
  icon: React.ReactNode
  action?: React.ReactNode
}) {
  return (
    <AppShell showBottomNav={false}>
      <GradientBackground />
      <DashboardHeader
        title="Admin Dashboard"
        subtitle="Operational view for SkillPath maintainers"
      />
      <Container className="py-8">
        <BrutalCard color="yellow" shadow="lg" className="mx-auto max-w-2xl">
          <div className="flex flex-col gap-5 sm:flex-row">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center brutal-border brutal-radius bg-white">
              {icon}
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="font-display text-2xl font-bold">{title}</h1>
              <p className="mt-2 text-sm leading-6 text-black/75">
                {description}
              </p>
              {action && <div className="mt-5">{action}</div>}
            </div>
          </div>
        </BrutalCard>
      </Container>
    </AppShell>
  )
}

export default async function AdminPage() {
  const authState = await getCurrentUserWithProfile()

  if (!authState.isConfigured) {
    return (
      <AdminShell
        title="Supabase is not configured"
        description="Admin role checks require NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY. The app can still run in demo mode, but the admin dashboard stays locked until Supabase auth is connected."
        icon={<AlertTriangle className="h-6 w-6" />}
        action={
          <Link href="/dashboard">
            <BrutalButton color="black" size="sm">
              Open Demo Dashboard
            </BrutalButton>
          </Link>
        }
      />
    )
  }

  if (!authState.user) {
    return (
      <AdminShell
        title="Admin sign-in required"
        description="No verified Supabase session was found. Phase 1 adds the server-side role boundary; the sign-in screen should be wired in the next auth phase."
        icon={<Lock className="h-6 w-6" />}
        action={
          <Link href="/dashboard">
            <BrutalButton variant="outline" color="black" size="sm">
              Open User Dashboard
            </BrutalButton>
          </Link>
        }
      />
    )
  }

  if (!authState.profile || !canAccessAdmin(authState.profile.role)) {
    return (
      <AdminShell
        title="Admin only"
        description="Your current account is authenticated, but it does not have the admin role required for this operational dashboard."
        icon={<ShieldCheck className="h-6 w-6" />}
        action={
          <Link href="/dashboard">
            <BrutalButton color="blue" size="sm">
              Open User Dashboard
            </BrutalButton>
          </Link>
        }
      />
    )
  }

  const metrics = await getAdminMetrics()

  return (
    <AppShell showBottomNav={false}>
      <GradientBackground />
      <DashboardHeader
        title="Admin Dashboard"
        subtitle="User access, jobs, roadmaps, and sync health"
      />

      <Container className="py-6">
        <div className="space-y-8">
          <BrutalCard color="black" shadow="lg" className="overflow-hidden">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl">
                <div className="mb-3 inline-flex items-center gap-2 brutal-border brutal-radius bg-yellow px-3 py-1 text-sm font-bold text-black">
                  <ShieldCheck className="h-4 w-4" />
                  Admin role active
                </div>
                <h1 className="font-display text-3xl font-bold">
                  SkillPath operations board
                </h1>
                <p className="mt-3 text-sm leading-6 text-white/75">
                  Review user growth, job ingestion, roadmap generation, and
                  activity flow from a separate admin surface. User learning
                  work stays on the standard dashboard.
                </p>
              </div>

              <Link href="/jobs">
                <BrutalButton color="yellow" className="text-black">
                  <Briefcase className="h-4 w-4" />
                  View Jobs
                </BrutalButton>
              </Link>
            </div>
          </BrutalCard>

          <Section title="Operational Snapshot">
            <Grid cols={4}>
              {metrics.map((metric) => {
                const Icon = metric.icon

                return (
                  <BrutalCard key={metric.label} color={metric.color} className="h-full">
                    <div className="mb-4 flex items-center justify-between">
                      <h2 className="font-display text-lg font-bold">
                        {metric.label}
                      </h2>
                      <Icon className="h-6 w-6" />
                    </div>
                    <p className="text-4xl font-bold">{metric.value}</p>
                    <p className="mt-3 text-sm leading-5 text-black/70">
                      {metric.helper}
                    </p>
                  </BrutalCard>
                )
              })}
            </Grid>
          </Section>

          <Section title="Admin Workflows">
            <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
              <BrutalCard color="white" shadow="sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h2 className="font-display text-xl font-bold">
                      Job moderation queue
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-black/70">
                      Phase 1 prepares the admin role and read boundary. The
                      next phase should add moderation actions with server-side
                      validation and audit logs.
                    </p>
                  </div>
                  <Link href="/jobs">
                    <BrutalButton variant="outline" color="black" size="sm">
                      Review Jobs
                      <ArrowRight className="h-4 w-4" />
                    </BrutalButton>
                  </Link>
                </div>
              </BrutalCard>

              <BrutalCard color="orange" shadow="sm">
                <h2 className="font-display text-xl font-bold">
                  Role assignment
                </h2>
                <p className="mt-2 text-sm leading-6 text-black/70">
                  Promote admins only through trusted SQL or a server-side
                  service-role operation. Client updates cannot change
                  `profiles.role`.
                </p>
              </BrutalCard>
            </div>
          </Section>
        </div>
      </Container>
    </AppShell>
  )
}
