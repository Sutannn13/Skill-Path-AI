'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { AppShell, Container, Section, Grid } from '@/components/layout'
import { GradientBackground } from '@/components/layout'
import { DashboardHeader } from '@/components/layout/dashboard-header'
import {
  BrutalCard,
  BrutalCardHover,
  BrutalButton,
  SkillBadge,
  StickerBadge,
  CabinetCard,
  LevelChip,
  XPBar,
  StatTile,
} from '@/components/brutal'
import { SkeletonStatCard } from '@/components/brutal/brutal-states'
import { EmptyStateDoodle } from '@/components/illustrations/empty-state-doodle'
import { PageScene } from '@/components/illustrations/page-scene'
import {
  Briefcase,
  Zap,
  GitBranch,
  Calendar,
  Home,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Rocket,
  Target,
  Trophy,
  Star,
  Flame,
  ScanLine,
} from 'lucide-react'
import { createSupabaseBrowserClient } from '@/lib/supabase/browser'
import { initializeUserProfile } from '@/lib/user/profile'
import { calculateSkillGap } from '@/lib/scoring/skill-gap'
import { getRequiredSkillIds, getNiceToHaveSkillIds, getRoleById, getSkillById } from '@/lib/constants'
import {
  calculateOverallProgress,
  getCompletedTaskCount,
  getCurrentTaskLocation,
} from '@/lib/roadmap/progress'
import type { Roadmap, RoadmapResource, RoadmapTask, RoadmapTaskRequirementState, RoadmapWeek, SkillLevel, TargetRole, UserSkill } from '@/types'

/** Role-based starter skill recommendations. Used as fallback when user has
 *  a target role selected but no skills saved yet (pre-onboarding or
 *  incomplete onboarding). Ensures "Recommended Skills to Learn" always shows
 *  actionable content instead of a locked empty state. */
const roleStarterRecommendations: Record<TargetRole, string[]> = {
  'frontend-developer': ['React', 'TypeScript', 'Responsive UI'],
  'backend-developer': ['Node.js', 'PostgreSQL', 'REST API'],
  'fullstack-developer': ['React', 'Node.js', 'PostgreSQL'],
  'ui-engineer': ['Design Systems', 'Accessibility', 'React'],
  'mobile-developer': ['React Native', 'Mobile UI', 'REST API'],
  'data-analyst': ['SQL', 'Python', 'Data Visualization'],
}
const defaultStarterRecommendations = ['TypeScript', 'React', 'Git']

interface ProfileRow {
  full_name: string | null
  target_role: TargetRole | null
  onboarding_completed: boolean | null
}

interface UserSkillRow {
  skill_slug: string
  level: number
}

interface ActiveRoadmapRow {
  id: string
  title: string
}

interface DashboardRoadmapTaskRow {
  id: string
  week_number: number
  week_title: string | null
  week_goal: string | null
  focus_skills: string[] | null
  title: string
  description: string | null
  difficulty: 'easy' | 'medium' | 'hard' | null
  estimated_time: string | null
  deliverable: string | null
  status: 'todo' | 'in-progress' | 'completed'
  completed_at: string | null
  quiz_required: boolean | null
  quiz_passed: boolean | null
  project_required: boolean | null
  project_passed: boolean | null
  requirement_state: RoadmapTaskRequirementState | null
}

interface DashboardRoadmapResourceRow {
  id: string
  roadmap_task_id: string
  title: string
  resource_type: RoadmapResource['resourceType']
  url: string
  provider: string
  estimated_minutes: number
  is_required: boolean
  completion_rule: string
}

interface DashboardResourceProgressRow {
  resource_id: string
  watched_seconds: number | null
  duration_seconds: number | null
  completion_percentage: number | null
  is_completed: boolean | null
  completed_at: string | null
}

interface DashboardRoadmapStats {
  hasActiveRoadmap: boolean
  roadmapTitle: string | null
  progress: number
  completedTasks: number
  totalTasks: number
  currentTaskTitle: string | null
}

type BrowserSupabaseClient = NonNullable<ReturnType<typeof createSupabaseBrowserClient>>

interface DashboardState {
  isDemoMode: boolean
  isLoading: boolean
  hasSupabaseSession: boolean
  needsOnboarding: boolean
  fullName: string | null
  targetRole: TargetRole | null
  targetRoleLabel: string
  onboardingCompleted: boolean
  careerReadiness: number
  jobMatchScore: number | null
  weeklyProgress: number
  hasActiveRoadmap: boolean
  roadmapProgress: number | null
  completedRoadmapTasks: number
  totalRoadmapTasks: number
  currentRoadmapTask: string | null
  streak: number
  githubScore: number | null
  nextRecommendedSkill: string | null
  recommendedSkills: string[]
  skillsCount: number
  scoreNotice: string | null
  error: string | null
}

const initialDashboardState: DashboardState = {
  isDemoMode: true,
  isLoading: true,
  hasSupabaseSession: false,
  needsOnboarding: false,
  fullName: null,
  targetRole: null,
  targetRoleLabel: 'Developer',
  onboardingCompleted: false,
  careerReadiness: 72,
  jobMatchScore: 85,
  weeklyProgress: 60,
  hasActiveRoadmap: false,
  roadmapProgress: null,
  completedRoadmapTasks: 0,
  totalRoadmapTasks: 0,
  currentRoadmapTask: null,
  streak: 5,
  githubScore: 68,
  nextRecommendedSkill: 'TypeScript',
  recommendedSkills: ['TypeScript', 'Testing', 'API Integration'],
  skillsCount: 0,
  scoreNotice: null,
  error: null,
}

const mockActivities = [
  { id: 1, text: 'Completed React Hooks task', time: '2 hours ago', icon: CheckCircle2 },
  { id: 2, text: 'Updated TypeScript skill to Level 2', time: '5 hours ago', icon: Zap },
  { id: 3, text: 'Saved Frontend Developer Intern job', time: 'Yesterday', icon: Briefcase },
]

function clampSkillLevel(value: number): SkillLevel {
  return Math.max(0, Math.min(4, Number(value))) as SkillLevel
}

function mapDashboardResource(
  resource: DashboardRoadmapResourceRow,
  progress?: DashboardResourceProgressRow
): RoadmapResource {
  return {
    id: resource.id,
    title: resource.title,
    resourceType: resource.resource_type,
    url: resource.url,
    provider: resource.provider,
    estimatedMinutes: resource.estimated_minutes,
    isRequired: resource.is_required,
    completionRule: resource.completion_rule,
    watchedSeconds: progress?.watched_seconds ?? 0,
    durationSeconds: progress?.duration_seconds ?? null,
    completionPercentage: Number(progress?.completion_percentage ?? 0),
    isCompleted: progress?.is_completed === true,
    completedAt: progress?.completed_at ?? null,
  }
}

function buildDashboardRoadmap(
  roadmapRow: ActiveRoadmapRow,
  taskRows: DashboardRoadmapTaskRow[],
  resourceRows: DashboardRoadmapResourceRow[],
  progressRows: DashboardResourceProgressRow[]
): Roadmap {
  const progressByResourceId = new Map(progressRows.map((progress) => [progress.resource_id, progress]))
  const resourcesByTaskId = new Map<string, RoadmapResource[]>()

  resourceRows.forEach((resource) => {
    const taskResources = resourcesByTaskId.get(resource.roadmap_task_id) ?? []
    taskResources.push(mapDashboardResource(resource, progressByResourceId.get(resource.id)))
    resourcesByTaskId.set(resource.roadmap_task_id, taskResources)
  })

  const weeks = new Map<number, RoadmapWeek>()

  taskRows.forEach((taskRow) => {
    const task: RoadmapTask = {
      id: taskRow.id,
      title: taskRow.title,
      description: taskRow.description ?? '',
      estimatedTime: taskRow.estimated_time ?? '1 hour',
      difficulty: taskRow.difficulty ?? 'medium',
      deliverable: taskRow.deliverable ?? 'Complete the required deliverable.',
      status: taskRow.status,
      completedAt: taskRow.completed_at,
      resources: resourcesByTaskId.get(taskRow.id) ?? [],
      quizRequired: taskRow.quiz_required !== false,
      quizPassed: taskRow.quiz_passed === true,
      projectRequired: taskRow.project_required === true,
      projectPassed: taskRow.project_passed === true,
      requirementState: taskRow.requirement_state ?? 'resources_pending',
    }
    const week = weeks.get(taskRow.week_number)

    if (week) {
      week.tasks.push(task)
      return
    }

    weeks.set(taskRow.week_number, {
      week: taskRow.week_number,
      title: taskRow.week_title ?? `Module ${taskRow.week_number}`,
      goal: taskRow.week_goal ?? 'Complete this roadmap module.',
      focusSkills: taskRow.focus_skills ?? [],
      tasks: [task],
    })
  })

  return {
    id: roadmapRow.id,
    title: roadmapRow.title,
    summary: '',
    durationWeeks: weeks.size,
    weeks: Array.from(weeks.values()).sort((a, b) => a.week - b.week),
    source: 'fallback',
    createdAt: '',
  }
}

async function loadDashboardRoadmapStats(
  supabase: BrowserSupabaseClient,
  userId: string
): Promise<DashboardRoadmapStats | null> {
  try {
    const { data: roadmapRow, error: roadmapError } = await supabase
      .from('roadmaps')
      .select('id, title')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (roadmapError) throw roadmapError
    if (!roadmapRow) {
      return {
        hasActiveRoadmap: false,
        roadmapTitle: null,
        progress: 0,
        completedTasks: 0,
        totalTasks: 0,
        currentTaskTitle: null,
      }
    }

    const typedRoadmap = roadmapRow as ActiveRoadmapRow
    const { data: taskRows, error: taskError } = await supabase
      .from('roadmap_tasks')
      .select('id, week_number, week_title, week_goal, focus_skills, title, description, difficulty, estimated_time, deliverable, status, completed_at, quiz_required, quiz_passed, project_required, project_passed, requirement_state')
      .eq('roadmap_id', typedRoadmap.id)
      .order('week_number', { ascending: true })
      .order('task_order', { ascending: true })

    if (taskError) throw taskError

    const typedTasks = (taskRows ?? []) as DashboardRoadmapTaskRow[]
    const taskIds = typedTasks.map((task) => task.id)
    let typedResources: DashboardRoadmapResourceRow[] = []
    let typedProgress: DashboardResourceProgressRow[] = []

    if (taskIds.length > 0) {
      const { data: resourceRows, error: resourceError } = await supabase
        .from('roadmap_resources')
        .select('id, roadmap_task_id, title, resource_type, url, provider, estimated_minutes, is_required, completion_rule')
        .in('roadmap_task_id', taskIds)

      if (resourceError) throw resourceError

      typedResources = (resourceRows ?? []) as DashboardRoadmapResourceRow[]
      const resourceIds = typedResources.map((resource) => resource.id)

      if (resourceIds.length > 0) {
        const { data: progressRows, error: progressError } = await supabase
          .from('roadmap_resource_progress')
          .select('resource_id, watched_seconds, duration_seconds, completion_percentage, is_completed, completed_at')
          .eq('user_id', userId)
          .in('resource_id', resourceIds)

        if (progressError) throw progressError
        typedProgress = (progressRows ?? []) as DashboardResourceProgressRow[]
      }
    }

    const roadmap = buildDashboardRoadmap(typedRoadmap, typedTasks, typedResources, typedProgress)
    const currentTaskLocation = getCurrentTaskLocation(roadmap)
    const currentTask = currentTaskLocation
      ? roadmap.weeks[currentTaskLocation.weekIndex]?.tasks.find((task) => task.id === currentTaskLocation.taskId)
      : null

    return {
      hasActiveRoadmap: true,
      roadmapTitle: typedRoadmap.title,
      progress: calculateOverallProgress(roadmap),
      completedTasks: getCompletedTaskCount(roadmap),
      totalTasks: typedTasks.length,
      currentTaskTitle: currentTask?.title ?? null,
    }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[Dashboard] roadmap stats unavailable:', error instanceof Error ? error.message : error)
    }
    return null
  }
}

export default function DashboardPage() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), [])
  const [state, setState] = useState<DashboardState>(initialDashboardState)

  useEffect(() => {
    let isActive = true

    const loadDashboard = async () => {
      if (supabase) {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()

        if (userError) {
          if (isActive) {
            setState((prev) => ({
              ...prev,
              isLoading: false,
              error: `Failed to validate session: ${userError.message}`,
            }))
          }
          return
        }

        if (user) {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('full_name, target_role, onboarding_completed')
            .eq('id', user.id)
            .maybeSingle()

          if (profileError) {
            if (isActive) {
              setState((prev) => ({
                ...prev,
                isLoading: false,
                hasSupabaseSession: true,
                isDemoMode: false,
                error: `Failed to load profile: ${profileError.message}`,
              }))
            }
            return
          }

          const typedProfile = profile as ProfileRow | null
          const onboardingCompleted = typedProfile?.onboarding_completed === true
          const targetRole = typedProfile?.target_role ?? null
          const targetRoleLabel = targetRole ? (getRoleById(targetRole)?.label ?? 'Developer') : 'Developer'

          const { data: userSkills, error: skillsError } = await supabase
            .from('user_skills')
            .select('skill_slug, level')
            .eq('user_id', user.id)

          if (skillsError) {
            if (isActive) {
              setState((prev) => ({
                ...prev,
                isLoading: false,
                hasSupabaseSession: true,
                isDemoMode: false,
                fullName: typedProfile?.full_name ?? null,
                targetRole,
                targetRoleLabel,
                onboardingCompleted,
                needsOnboarding: !onboardingCompleted,
                error: `Failed to load skills: ${skillsError.message}`,
              }))
            }
            return
          }

          const typedSkills = (userSkills ?? []) as UserSkillRow[]
          const mappedUserSkills: UserSkill[] = typedSkills.map((item) => {
            const mappedSkill = getSkillById(item.skill_slug)

            return {
              skillId: mappedSkill?.id ?? item.skill_slug,
              level: clampSkillLevel(item.level),
            }
          })

          if (!targetRole || mappedUserSkills.length === 0) {
            const fallbackRecs = targetRole
              ? roleStarterRecommendations[targetRole] ?? defaultStarterRecommendations
              : defaultStarterRecommendations
            if (isActive) {
              setState({
                ...initialDashboardState,
                isDemoMode: false,
                isLoading: false,
                hasSupabaseSession: true,
                needsOnboarding: !onboardingCompleted,
                fullName: typedProfile?.full_name ?? null,
                targetRole,
                targetRoleLabel,
                onboardingCompleted,
                careerReadiness: 0,
                jobMatchScore: null,
                weeklyProgress: 0,
                nextRecommendedSkill: fallbackRecs[0] ?? null,
                recommendedSkills: fallbackRecs,
                skillsCount: mappedUserSkills.length,
                scoreNotice: 'Complete onboarding to calculate your score',
              })
            }
            return
          }

          const skillGap = calculateSkillGap({
            userSkills: mappedUserSkills,
            targetRole,
            requiredSkillIds: getRequiredSkillIds(targetRole),
            niceToHaveSkillIds: getNiceToHaveSkillIds(targetRole),
          })
          const roadmapStats = await loadDashboardRoadmapStats(supabase, user.id)

          if (isActive) {
            setState({
              ...initialDashboardState,
              isDemoMode: false,
              isLoading: false,
              hasSupabaseSession: true,
              needsOnboarding: !onboardingCompleted,
              fullName: typedProfile?.full_name ?? null,
              targetRole,
              targetRoleLabel,
              onboardingCompleted,
              careerReadiness: Math.round(skillGap.weightedMatchScore),
              jobMatchScore: Math.round(skillGap.matchScore),
              weeklyProgress: roadmapStats?.progress ?? 0,
              hasActiveRoadmap: roadmapStats?.hasActiveRoadmap ?? false,
              roadmapProgress: roadmapStats?.progress ?? null,
              completedRoadmapTasks: roadmapStats?.completedTasks ?? 0,
              totalRoadmapTasks: roadmapStats?.totalTasks ?? 0,
              currentRoadmapTask: roadmapStats?.currentTaskTitle ?? null,
              streak: 0,
              githubScore: null,
              nextRecommendedSkill: skillGap.recommendedNextSkills[0] ?? null,
              recommendedSkills:
                skillGap.recommendedNextSkills.length > 0
                  ? skillGap.recommendedNextSkills.slice(0, 3)
                  : ['TypeScript', 'Testing', 'API Integration'],
              skillsCount: mappedUserSkills.length,
              scoreNotice: null,
            })
          }
          return
        }
      }

      const localProfile = initializeUserProfile()
      const fallbackRole = localProfile.targetRole
      const fallbackRoleLabel = fallbackRole ? (getRoleById(fallbackRole)?.label ?? 'Developer') : 'Developer'

      if (isActive) {
        setState({
          ...initialDashboardState,
          isLoading: false,
          isDemoMode: true,
          fullName: null,
          targetRole: fallbackRole,
          targetRoleLabel: fallbackRoleLabel,
          onboardingCompleted: localProfile.onboardingCompleted,
          needsOnboarding: !localProfile.onboardingCompleted,
          scoreNotice: localProfile.skills.length === 0 ? 'Complete onboarding to calculate your score' : null,
          skillsCount: localProfile.skills.length,
        })
      }
    }

    loadDashboard()

    return () => {
      isActive = false
    }
  }, [supabase])

  const welcomeName = state.fullName || state.targetRoleLabel || 'Developer'
  const playerLevel = Math.max(1, Math.floor(state.careerReadiness / 20) + 1)
  const nextBestAction = state.needsOnboarding
    ? { label: 'Complete onboarding', href: '/onboarding', icon: ArrowRight, hint: 'Unlock roadmap and scoring.' }
    : !state.hasActiveRoadmap
      ? { label: 'Build roadmap', href: '/roadmap', icon: Rocket, hint: 'Generate your learning path from saved profile data.' }
    : (state.roadmapProgress ?? 0) < 100
      ? { label: 'Continue roadmap', href: '/roadmap', icon: ArrowRight, hint: state.currentRoadmapTask ? `Next: ${state.currentRoadmapTask}` : 'Finish pending roadmap tasks.' }
      : state.githubScore !== null && state.githubScore < 75
        ? { label: 'Analyze GitHub', href: '/github', icon: GitBranch, hint: 'Improve portfolio quality signals.' }
        : { label: 'Save a job', href: '/jobs', icon: Briefcase, hint: 'Track a role that fits your current skills.' }

  const savedJobsCount = state.isDemoMode && state.jobMatchScore ? Math.max(0, Math.round(state.jobMatchScore / 20)) : 0
  const recentActivities = state.isDemoMode ? mockActivities : []

  if (state.isLoading) {
    return (
      <AppShell showBottomNav={true}>
        <GradientBackground />
        <div className="flex-1">
          <DashboardHeader
            icon={Home}
            iconColor="yellow"
            title="Dashboard"
            subtitle="Your career progress at a glance"
          />
          <Container className="py-6">
            <div className="space-y-6">
              <div className="h-40 brutal-border brutal-radius bg-gray-100 animate-pulse" aria-hidden="true" />
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[0, 1, 2, 3].map((i) => (
                  <SkeletonStatCard key={i} />
                ))}
              </div>
              <span className="sr-only" role="status">Loading your dashboard data</span>
            </div>
          </Container>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell showBottomNav={true}>
      <GradientBackground variant="dashboard" />

      <div className="flex-1">
        <DashboardHeader
          icon={Home}
          iconColor="yellow"
          title="Career Basecamp"
          subtitle="Your quest hub awaits"
        />

        <Container className="py-6">
          <div className="space-y-8">
            <PageScene variant="dashboard" />

            {state.error && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                <BrutalCard color="white" className="flex items-start gap-3 bg-red/10" animate={false}>
                  <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-dark" aria-hidden="true" />
                  <div role="alert" aria-live="assertive">
                    <p className="font-bold text-red-dark">Failed to load dashboard data</p>
                    <p className="text-sm text-secondary break-words">{state.error}</p>
                  </div>
                </BrutalCard>
              </motion.div>
            )}

            {state.needsOnboarding && (
              <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
                <BrutalCard color="yellow" shadow="lg" className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between relative overflow-hidden">
                  {/* Decorative corner accent */}
                  <div className="absolute -top-6 -right-6 w-24 h-24 bg-orange/30 rounded-full blur-xl pointer-events-none" aria-hidden="true" />
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Rocket className="w-5 h-5" aria-hidden="true" />
                      <h2 className="font-display text-xl font-bold">Start Your Quest!</h2>
                    </div>
                    <p className="text-sm text-black/80">
                      Complete your onboarding to unlock real score calculation and personalized recommendations.
                    </p>
                  </div>
                  <Link href="/onboarding">
                    <BrutalButton color="black">
                      <Star className="h-4 w-4" aria-hidden="true" />
                      Begin Onboarding
                    </BrutalButton>
                  </Link>
                </BrutalCard>
              </motion.div>
            )}

            {/* ──── Hero HUD — cabinet bento ──── */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.5 }}>
              <CabinetCard className="p-6">
                <div className="grid lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-5">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-4">
                        {/* Animated avatar ring */}
                        <div className="relative">
                          <div
                            className="w-16 h-16 bg-yellow brutal-border brutal-radius flex items-center justify-center text-3xl shrink-0 relative z-10"
                            role="img"
                            aria-label="Player avatar"
                          >
                            🐱
                          </div>
                          <div className="absolute -inset-1 bg-gradient-to-br from-yellow via-orange to-pink rounded-2xl opacity-50 blur-sm -z-0 animate-pulse" aria-hidden="true" />
                        </div>
                        <div className="min-w-0">
                          <p className="hud-label text-[11px] text-on-dark-soft">Welcome back</p>
                          <h2 className="font-display font-black text-2xl lg:text-3xl text-on-dark truncate">
                            {welcomeName}
                          </h2>
                        </div>
                      </div>
                      <LevelChip level={playerLevel} onDark />
                    </div>

                    <XPBar
                      value={state.careerReadiness}
                      max={100}
                      label="Career Power"
                      accent="yellow"
                      onDark
                    />

                    <div className="flex flex-wrap items-center gap-2">
                      {state.streak > 0 && <StickerBadge variant="orange" label={`${state.streak} Day Streak`} size="sm" />}
                      <StickerBadge
                        variant={state.onboardingCompleted ? 'completed' : 'in-progress'}
                        label={state.onboardingCompleted ? 'Onboarding Complete' : 'Onboarding Pending'}
                        size="sm"
                      />
                      <StickerBadge variant="blue" label={state.targetRoleLabel} size="sm" />
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-1">
                      <Link href={nextBestAction.href}>
                        <BrutalButton color="yellow" size="lg" className="focus-brutal-ring-invert w-full sm:w-auto">
                          <nextBestAction.icon className="h-5 w-5" aria-hidden="true" />
                          {nextBestAction.label}
                        </BrutalButton>
                      </Link>
                      <p className="text-sm text-on-dark-soft">{nextBestAction.hint}</p>
                    </div>
                  </div>

                  {/* Right stat panel with enhanced glow */}
                  <div className="space-y-3">
                    <motion.div whileHover={{ scale: 1.02 }} transition={{ type: 'spring', stiffness: 300 }}>
                      <StatTile
                        label="Career Power"
                        value={state.careerReadiness}
                        unit="%"
                        icon={Flame}
                        accent="pink"
                        onDark
                        glow
                        hint={state.scoreNotice ?? undefined}
                      />
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.02 }} transition={{ type: 'spring', stiffness: 300 }}>
                      <StatTile
                        label="Job Match"
                        value={state.jobMatchScore ?? '--'}
                        unit={state.jobMatchScore === null ? '' : '%'}
                        icon={Target}
                        accent="green"
                        onDark
                        glow
                      />
                    </motion.div>
                  </div>
                </div>
              </CabinetCard>
            </motion.div>

            {/* ──── Learning Health — enhanced bento stats ──── */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.4 }}>
              <Section title="Learning Health" helper="At a glance">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'Skills', value: state.skillsCount, icon: Zap, accent: 'blue' as const, unit: undefined },
                    { label: 'GitHub', value: state.githubScore === null ? 'N/A' : state.githubScore, icon: GitBranch, accent: 'purple' as const, unit: state.githubScore === null ? '' : '/100' },
                    { label: 'Jobs Saved', value: state.isDemoMode ? savedJobsCount : 'Open', icon: Briefcase, accent: 'orange' as const, unit: undefined },
                    { label: 'Streak', value: state.streak, icon: Flame, accent: 'yellow' as const, unit: state.streak === 1 ? 'day' : 'days' },
                  ].map((stat, i) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + i * 0.08, duration: 0.35 }}
                    >
                      <StatTile
                        label={stat.label}
                        value={stat.value}
                        unit={stat.unit}
                        icon={stat.icon}
                        accent={stat.accent}
                      />
                    </motion.div>
                  ))}
                </div>
              </Section>
            </motion.div>

            {/* ──── Your Progress — enhanced cards ──── */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.4 }}>
              <Section title="Your Progress" helper="Track your journey">
                <Grid cols={2}>
                  <BrutalCard color="green" className="h-full relative overflow-hidden">
                    {/* Gradient accent */}
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-green via-blue to-green" aria-hidden="true" />
                    <div className="flex items-center justify-between mb-4 gap-2 pt-1">
                      <h3 className="font-display font-bold text-heading-sm flex items-center gap-2">
                        <Calendar className="w-5 h-5" aria-hidden="true" />
                        Learning Path
                      </h3>
                      <StickerBadge
                        variant={state.hasActiveRoadmap ? 'in-progress' : 'blue'}
                        label={state.hasActiveRoadmap ? 'Active' : 'Not Started'}
                        size="sm"
                      />
                    </div>
                    <XPBar value={state.roadmapProgress ?? 0} max={100} label="Roadmap Progress" accent="blue" />
                    <div className="mt-4 flex items-center justify-between gap-2">
                      <span className="text-sm text-black/80">
                        {state.hasActiveRoadmap
                          ? `${state.completedRoadmapTasks}/${state.totalRoadmapTasks} tasks completed`
                          : 'No active roadmap yet'}
                      </span>
                      <Link href="/roadmap" className="rounded focus-brutal-ring">
                        <span className="text-sm font-bold underline flex items-center gap-1">
                          {state.hasActiveRoadmap ? 'Continue' : 'Build'} <ArrowRight className="w-4 h-4" aria-hidden="true" />
                        </span>
                      </Link>
                    </div>
                    {state.currentRoadmapTask && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-3 rounded-md border-2 border-black bg-white p-2 text-xs font-medium text-secondary"
                      >
                        Next task: <span className="font-bold text-black">{state.currentRoadmapTask}</span>
                      </motion.p>
                    )}
                  </BrutalCard>

                  <BrutalCard color="orange" className="h-full relative overflow-hidden">
                    {/* Gradient accent */}
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-orange via-pink to-orange" aria-hidden="true" />
                    <div className="flex items-center justify-between mb-4 pt-1">
                      <h3 className="font-display font-bold text-heading-sm flex items-center gap-2">
                        <Zap className="w-5 h-5" aria-hidden="true" />
                        Next Power-Up
                      </h3>
                      {state.nextRecommendedSkill && (
                        <StickerBadge variant="yellow" label="Suggested" size="sm" />
                      )}
                    </div>
                    <p className="text-2xl font-display font-bold mb-2">{state.nextRecommendedSkill ?? 'Complete onboarding first'}</p>
                    <p className="text-sm text-black/80 mb-4">
                      {state.nextRecommendedSkill
                        ? 'Highest leverage skill based on your current profile.'
                        : 'Skill recommendations appear after your onboarding and skill assessment are saved.'}
                    </p>
                    <Link href={state.nextRecommendedSkill ? `/skills?focus=${state.nextRecommendedSkill.toLowerCase().replace(/\s+/g, '-')}` : '/onboarding'}>
                      <BrutalButton variant="outline" color="black" size="sm" className="w-full">
                        {state.nextRecommendedSkill ? 'Update Skill Level' : 'Go to Onboarding'}
                      </BrutalButton>
                    </Link>
                  </BrutalCard>
                </Grid>
              </Section>
            </motion.div>

            {/* ──── Recommended Skills — interactive skill cards ──── */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.4 }}>
              <Section title="Recommended Skills to Learn">
                {state.recommendedSkills.length === 0 ? (
                  <BrutalCard color="white">
                    <EmptyStateDoodle label="Add skills to unlock recommendations" />
                  </BrutalCard>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {state.recommendedSkills.map((skill, i) => {
                      const colors = ['yellow', 'blue', 'pink'] as const
                      const cardColor = colors[i % 3]
                      const gradients = [
                        'from-yellow/30 via-orange/10 to-transparent',
                        'from-blue/30 via-purple/10 to-transparent',
                        'from-pink/30 via-red/10 to-transparent',
                      ]
                      return (
                        <motion.div
                          key={skill}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.45 + i * 0.1, duration: 0.3 }}
                          whileHover={{ y: -4 }}
                        >
                          <Link href={`/skills?focus=${skill.toLowerCase().replace(/\s+/g, '-')}`}>
                            <BrutalCard color={cardColor} className="relative overflow-hidden group cursor-pointer h-full">
                              {/* Background gradient */}
                              <div className={`absolute inset-0 bg-gradient-to-br ${gradients[i % 3]} opacity-60`} aria-hidden="true" />
                              <div className="relative z-10">
                                <div className="flex items-center justify-between mb-3">
                                  <div className="w-10 h-10 brutal-border brutal-radius bg-white/70 flex items-center justify-center">
                                    <Target className="w-5 h-5" aria-hidden="true" />
                                  </div>
                                  <ArrowRight className="w-5 h-5 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" aria-hidden="true" />
                                </div>
                                <p className="font-display font-bold text-lg mb-1">{skill}</p>
                                <p className="text-xs text-black/60">
                                  {state.onboardingCompleted ? 'Based on your skill gap' : 'Starter recommendation'}
                                </p>
                              </div>
                            </BrutalCard>
                          </Link>
                        </motion.div>
                      )
                    })}
                  </div>
                )}
              </Section>
            </motion.div>

            {/* ──── Best Match Jobs — enhanced visual ──── */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.4 }}>
              <Section title="Best Match Jobs">
                <BrutalCard color="white" shadow="lg" className="relative overflow-hidden">
                  {/* Top gradient bar */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue via-pink to-yellow" aria-hidden="true" />
                  <div className="flex flex-col sm:flex-row gap-4 mb-4 pt-1">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-pink brutal-border brutal-radius flex items-center justify-center shrink-0 relative">
                        <Briefcase className="w-6 h-6" aria-hidden="true" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold">Open Job Radar for {state.targetRoleLabel}</h3>
                          <StickerBadge variant="blue" label="Active" size="sm" />
                        </div>
                        <p className="text-sm text-secondary">Jobs are ranked from your saved role and current level.</p>
                      </div>
                    </div>
                    <div className="sm:ml-auto text-center">
                      <span className="metric-mono text-3xl font-bold text-black">
                        {state.jobMatchScore === null ? '--' : `${state.jobMatchScore}%`}
                      </span>
                      <p className="text-xs text-secondary">readiness</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {(state.recommendedSkills.length > 0
                      ? state.recommendedSkills
                      : [state.targetRoleLabel, 'Junior', 'Internship']
                    ).map((tag) => (
                      <SkillBadge key={tag} name={tag} size="sm" />
                    ))}
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Link href="/jobs" className="flex-1">
                      <BrutalButton color="blue" className="w-full">
                        <Target className="w-4 h-4" aria-hidden="true" />
                        Browse Jobs
                      </BrutalButton>
                    </Link>
                    <Link href="/roadmap" className="flex-1">
                      <BrutalButton variant="outline" color="black" className="w-full">
                        <Rocket className="w-4 h-4" aria-hidden="true" />
                        Build Roadmap
                      </BrutalButton>
                    </Link>
                  </div>
                </BrutalCard>
              </Section>
            </motion.div>

            {/* ──── GitHub + CV Analyzer — side by side on large screens ──── */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55, duration: 0.4 }}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* GitHub Portfolio */}
                <BrutalCard color="purple" className="relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple via-blue to-purple" aria-hidden="true" />
                  <div className="flex items-start gap-4 mb-4 pt-1">
                    <div className="w-12 h-12 brutal-border brutal-radius bg-white/30 flex items-center justify-center shrink-0">
                      <GitBranch className="w-6 h-6" aria-hidden="true" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-lg">Portfolio Score</h3>
                        <StickerBadge variant="in-progress" label="Analyzing" size="sm" />
                      </div>
                      <p className="text-sm text-black/80">Based on your GitHub activity</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <span className="metric-mono text-4xl font-bold">{state.githubScore ?? 0}</span>
                      <span className="text-lg">/100</span>
                    </div>
                    <Link href="/github">
                      <BrutalButton variant="outline" color="black" size="sm">
                        Analyze <ArrowRight className="ml-1 h-3 w-3" aria-hidden="true" />
                      </BrutalButton>
                    </Link>
                  </div>
                  {/* Progress bar visual */}
                  <div className="h-2 brutal-border brutal-radius overflow-hidden bg-white/30">
                    <motion.div
                      className="h-full bg-white/70"
                      initial={{ width: 0 }}
                      animate={{ width: `${state.githubScore ?? 0}%` }}
                      transition={{ duration: 0.8, ease: [0.2, 0, 0, 1] }}
                    />
                  </div>
                </BrutalCard>

                {/* CV Analyzer */}
                <BrutalCard color="pink" className="relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-pink via-orange to-pink" aria-hidden="true" />
                  <div className="flex items-start gap-4 mb-4 pt-1">
                    <div className="w-12 h-12 brutal-border brutal-radius bg-white/30 flex items-center justify-center shrink-0">
                      <ScanLine className="w-6 h-6" aria-hidden="true" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-lg">Audit CV Sebelum Melamar</h3>
                        <StickerBadge variant="great-match" label="AI" size="sm" />
                      </div>
                      <p className="text-sm text-black/80">
                        Unggah CV, lalu AI cek kecocokan role, ATS, dan kasih daftar revisi.
                      </p>
                    </div>
                  </div>
                  <Link href="/cv-analyzer" className="block">
                    <BrutalButton color="black" size="sm" className="w-full">
                      Scan CV
                      <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                    </BrutalButton>
                  </Link>
                </BrutalCard>
              </div>
            </motion.div>

            {/* ──── Recent Activity — timeline style ──── */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.4 }}>
              <Section title="Recent Activity">
                <div className="space-y-3">
                  {recentActivities.map((activity, i) => (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.65 + i * 0.08, duration: 0.3 }}
                    >
                      <BrutalCard color="white" shadow="sm" className="flex items-center gap-4 py-4 relative">
                        {/* Timeline dot */}
                        {i < recentActivities.length - 1 && (
                          <div className="absolute left-[29px] top-[52px] w-0.5 h-6 bg-black/15" aria-hidden="true" />
                        )}
                        <div className="w-10 h-10 bg-green brutal-border brutal-radius flex items-center justify-center shrink-0 relative z-10">
                          <activity.icon className="w-5 h-5 text-black" aria-hidden="true" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium">{activity.text}</p>
                          <p className="text-sm text-secondary">{activity.time}</p>
                        </div>
                        <StickerBadge variant="completed" label="Done" size="sm" />
                      </BrutalCard>
                    </motion.div>
                  ))}
                  {recentActivities.length === 0 && (
                    <BrutalCard color="white" shadow="sm" className="relative overflow-hidden">
                      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-black/10 to-transparent" aria-hidden="true" />
                      <p className="font-bold">No activity recorded yet</p>
                      <p className="mt-1 text-sm text-secondary">
                        Complete a roadmap task or save a job to build your activity history.
                      </p>
                    </BrutalCard>
                  )}
                </div>
              </Section>
            </motion.div>
          </div>
        </Container>
      </div>
    </AppShell>
  )
}
