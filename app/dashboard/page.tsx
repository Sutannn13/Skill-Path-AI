'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { AppShell, Container, Section, Grid } from '@/components/layout'
import { GradientBackground } from '@/components/layout'
import { DashboardHeader } from '@/components/layout/dashboard-header'
import { BrutalCard, BrutalCardHover, BrutalButton, ScoreMeter, ScoreBar, SkillBadge, FloatingSticker, StickerBadge } from '@/components/brutal'
import { CatMascot } from '@/components/illustrations/cat-mascot'
import { EmptyStateDoodle } from '@/components/illustrations/empty-state-doodle'
import { PageScene } from '@/components/illustrations/page-scene'
import { CartoonBackground } from '@/components/illustrations/cartoon-background'
import {
  Briefcase,
  Zap,
  GitBranch,
  Calendar,
  Home,
  Flame,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Rocket,
  Target,
  Trophy,
  Star,
} from 'lucide-react'
import { createSupabaseBrowserClient } from '@/lib/supabase/browser'
import { initializeUserProfile } from '@/lib/user/profile'
import { calculateSkillGap } from '@/lib/scoring/skill-gap'
import { getRequiredSkillIds, getNiceToHaveSkillIds, getRoleById, getSkillById } from '@/lib/constants'
import type { SkillLevel, TargetRole, UserSkill } from '@/types'

interface ProfileRow {
  full_name: string | null
  target_role: TargetRole | null
  onboarding_completed: boolean | null
}

interface UserSkillRow {
  skill_slug: string
  level: number
}

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
                nextRecommendedSkill: null,
                recommendedSkills: [],
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
              weeklyProgress: Math.min(100, Math.round(skillGap.weightedMatchScore * 0.7)),
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
  const nextBestAction = state.needsOnboarding
    ? { label: 'Complete onboarding', href: '/onboarding', icon: ArrowRight, hint: 'Unlock roadmap and scoring.' }
    : state.weeklyProgress < 80
      ? { label: 'Continue roadmap', href: '/roadmap', icon: ArrowRight, hint: 'Finish pending roadmap tasks.' }
      : state.githubScore !== null && state.githubScore < 75
        ? { label: 'Analyze GitHub', href: '/github', icon: GitBranch, hint: 'Improve portfolio quality signals.' }
        : { label: 'Save a job', href: '/jobs', icon: Briefcase, hint: 'Track a role that fits your current skills.' }

  const savedJobsCount = state.isDemoMode && state.jobMatchScore ? Math.max(0, Math.round(state.jobMatchScore / 20)) : 0

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
            <BrutalCard color="white" shadow="sm">
              <p className="font-medium">Loading your dashboard data...</p>
            </BrutalCard>
          </Container>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell showBottomNav={true}>
      <CartoonBackground variant="dashboard" intensity="normal" showDoodles animated />
      <GradientBackground />

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
              <BrutalCard color="red" className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                <div>
                  <p className="font-bold">Failed to load dashboard data</p>
                  <p className="text-sm text-black/70">{state.error}</p>
                </div>
              </BrutalCard>
            )}

            {state.needsOnboarding && (
              <BrutalCard color="yellow" shadow="lg" className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Rocket className="w-5 h-5" />
                    <h2 className="font-display text-xl font-bold">Start Your Quest!</h2>
                  </div>
                  <p className="text-sm text-black/70">
                    Complete your onboarding to unlock real score calculation and personalized recommendations.
                  </p>
                </div>
                <Link href="/onboarding">
                  <BrutalButton color="black">
                    <Star className="h-4 w-4 mr-2" />
                    Begin Onboarding
                  </BrutalButton>
                </Link>
              </BrutalCard>
            )}

            <motion.div
              initial={false}
              animate={{ opacity: 1, y: 0 }}
            >
              {/* Welcome Hero Card */}
              <BrutalCard color="yellow" shadow="lg" className="relative overflow-hidden">
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-pink/20" style={{ borderBottomLeftRadius: '100%' }} />
                <div className="absolute bottom-0 left-0 w-16 h-16 bg-blue/20" style={{ borderTopRightRadius: '100%' }} />

                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center gap-6">
                  {/* Mascot and greeting */}
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 bg-white brutal-border brutal-radius flex items-center justify-center shadow-brutal">
                      <span className="text-4xl">🐱</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Trophy className="w-5 h-5 text-yellow" />
                        <h2 className="font-display font-black text-2xl lg:text-3xl">
                          Welcome Back, {welcomeName}!
                        </h2>
                      </div>
                      <p className="text-black/70">
                        {state.isDemoMode
                          ? 'You are in demo mode. Connect Supabase to load your real progress.'
                          : state.onboardingCompleted
                          ? 'Your progress cards avoid demo numbers unless real data exists.'
                          : 'Finish onboarding so we can generate your personalized roadmap and scores.'}
                      </p>
                    </div>
                  </div>

                  {/* Stats badges */}
                  <div className="flex flex-wrap items-center gap-3 lg:ml-auto">
                    {state.streak > 0 && (
                      <StickerBadge variant="orange" label={`${state.streak} Day Streak`} size="sm" />
                    )}
                    <StickerBadge
                      variant={state.onboardingCompleted ? 'completed' : 'in-progress'}
                      label={state.onboardingCompleted ? 'Onboarding Complete' : 'Onboarding Pending'}
                      size="sm"
                    />
                    <StickerBadge variant="blue" label={state.targetRoleLabel} size="sm" />
                  </div>
                </div>

                <FloatingSticker
                  icon="rocket"
                  color="orange"
                  size="md"
                  className="absolute top-4 right-8 opacity-60"
                  animate={false}
                />
              </BrutalCard>
            </motion.div>

            <Section title="Next Best Action" helper="What to do next">
              <Grid cols={2}>
                <BrutalCard color="white" className="h-full relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-yellow/10" style={{ borderBottomLeftRadius: '100%' }} />
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <StickerBadge variant="green" label="Recommended" size="sm" className="mb-2" />
                      <h3 className="font-display text-xl font-bold mb-1">{nextBestAction.label}</h3>
                      <p className="mt-1 text-sm text-black/70">{nextBestAction.hint}</p>
                      <Link href={nextBestAction.href} className="mt-4 inline-flex">
                        <BrutalButton color="black" size="sm">
                          <nextBestAction.icon className="h-4 w-4 mr-2" />
                          Go to Quest
                        </BrutalButton>
                      </Link>
                    </div>
                    <div className="w-16 h-16 bg-yellow brutal-border brutal-radius flex items-center justify-center shrink-0">
                      <span className="text-2xl">🐱</span>
                    </div>
                  </div>
                </BrutalCard>

                <BrutalCard color="blue" className="h-full">
                  <h3 className="mb-3 font-display text-lg font-bold flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Learning Health
                  </h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-md border-2 border-black bg-white p-2 text-center">
                      <p className="text-black/60">Career Power</p>
                      <p className="text-lg font-bold">{state.careerReadiness}%</p>
                    </div>
                    <div className="rounded-md border-2 border-black bg-white p-2 text-center">
                      <p className="text-black/60">Skills</p>
                      <p className="text-lg font-bold">{state.skillsCount}</p>
                    </div>
                    <div className="rounded-md border-2 border-black bg-white p-2 text-center">
                      <p className="text-black/60">GitHub</p>
                      <p className="text-lg font-bold">{state.githubScore === null ? 'N/A' : `${state.githubScore}/100`}</p>
                    </div>
                    <div className="rounded-md border-2 border-black bg-white p-2 text-center">
                      <p className="text-black/60">Jobs Saved</p>
                      <p className="text-lg font-bold">{state.isDemoMode ? savedJobsCount : 'Open'}</p>
                    </div>
                  </div>
                </BrutalCard>
              </Grid>
            </Section>

            <Section title="Your Progress" helper="Track your journey">
              <Grid cols={2}>
                <motion.div
                  initial={false}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <BrutalCard color="pink" className="text-center h-full relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-12 h-12 bg-yellow/20" style={{ borderBottomLeftRadius: '100%' }} />
                    <ScoreMeter score={state.careerReadiness} label="Career Power" size="lg" />
                    <div className="mt-4">
                      <StickerBadge variant="completed" label="Strong!" size="sm" className="inline-block" />
                    </div>
                    <p className="text-sm text-black/70 mt-2">
                      {state.scoreNotice ?? 'Calculated from your saved profile and skill levels.'}
                    </p>
                  </BrutalCard>
                </motion.div>

                <motion.div
                  initial={false}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <BrutalCard color="blue" className="text-center h-full relative overflow-hidden">
                    <div className="absolute bottom-0 left-0 w-12 h-12 bg-pink/20" style={{ borderTopRightRadius: '100%' }} />
                    <ScoreMeter score={state.jobMatchScore ?? 0} label="Job Match" size="lg" />
                    <div className="mt-4">
                      <StickerBadge variant="great-match" label="Great!" size="sm" className="inline-block" />
                    </div>
                    <p className="text-sm text-black/70 mt-2">
                      {state.jobMatchScore === null
                        ? 'Complete onboarding to calculate your score'
                        : `Best current fit for ${state.targetRoleLabel}`}
                    </p>
                  </BrutalCard>
                </motion.div>

                <motion.div
                  initial={false}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <BrutalCard color="green" className="h-full">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-display font-bold text-lg flex items-center gap-2">
                        <Calendar className="w-5 h-5" />
                        Weekly Sprint
                      </h3>
                      <StickerBadge variant="in-progress" label="Active" size="sm" />
                    </div>
                    <ScoreBar
                      score={state.weeklyProgress}
                      label="Week Progress"
                      color="black"
                    />
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-sm text-black/70">
                        {state.skillsCount > 0 ? `${state.skillsCount} skills tracked` : 'No skill data yet'}
                      </span>
                      <Link href="/sprint">
                        <span className="text-sm font-bold underline flex items-center gap-1">
                          Continue <ArrowRight className="w-4 h-4" />
                        </span>
                      </Link>
                    </div>
                  </BrutalCard>
                </motion.div>

                <motion.div
                  initial={false}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <BrutalCard color="orange" className="h-full">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-display font-bold text-lg flex items-center gap-2">
                        <Zap className="w-5 h-5" />
                        Next Power-Up
                      </h3>
                    </div>
                    <p className="text-2xl font-bold mb-2">{state.nextRecommendedSkill ?? 'Complete onboarding first'}</p>
                    <p className="text-sm text-black/70 mb-4">
                      {state.nextRecommendedSkill
                        ? 'Highest leverage skill based on your current profile.'
                        : 'Skill recommendations appear after your onboarding and skill assessment are saved.'}
                    </p>
                    <div className="mt-4">
                      <Link href={state.nextRecommendedSkill ? `/skills?focus=${state.nextRecommendedSkill.toLowerCase().replace(/\s+/g, '-')}` : '/onboarding'}>
                        <BrutalButton variant="outline" color="black" size="sm" className="w-full">
                          {state.nextRecommendedSkill ? 'Update Skill Level' : 'Go to Onboarding'}
                        </BrutalButton>
                      </Link>
                    </div>
                  </BrutalCard>
                </motion.div>
              </Grid>
            </Section>

            <Section title="Recommended Skills to Learn">
              {state.recommendedSkills.length === 0 ? (
                <BrutalCard color="white">
                  <EmptyStateDoodle label="Add skills to unlock recommendations" />
                </BrutalCard>
              ) : (
                <div className="flex flex-wrap gap-3">
                  {state.recommendedSkills.map((skill, i) => (
                    <motion.div
                      key={skill}
                      initial={false}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5 + i * 0.1 }}
                    >
                      <Link href={`/skills?focus=${skill.toLowerCase().replace(/\s+/g, '-')}`}>
                        <BrutalCardHover color={['yellow', 'blue', 'pink'][i % 3] as 'yellow' | 'blue' | 'pink'}>
                          <div className="flex items-center gap-2">
                            <Target className="w-4 h-4" />
                            <span className="font-bold">{skill}</span>
                            <ArrowRight className="w-4 h-4" />
                          </div>
                        </BrutalCardHover>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              )}
            </Section>

            <Section title="Best Match Jobs">
              <BrutalCard color="white" shadow="lg">
                <div className="flex flex-col sm:flex-row gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-pink brutal-border brutal-radius flex items-center justify-center">
                      <Briefcase className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold">Open Job Radar for {state.targetRoleLabel}</h3>
                        <StickerBadge variant="blue" label="Active" size="sm" />
                      </div>
                      <p className="text-sm text-gray-600">
                        Jobs are ranked from your saved role and current level.
                      </p>
                    </div>
                  </div>
                  <div className="sm:ml-auto text-center">
                    <span className="text-3xl font-bold text-green">
                      {state.jobMatchScore === null ? '--' : `${state.jobMatchScore}%`}
                    </span>
                    <p className="text-xs text-gray-500">readiness</p>
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
                <div className="flex gap-3">
                  <Link href="/jobs" className="flex-1">
                    <BrutalButton color="blue" className="w-full">
                      <Target className="w-4 h-4 mr-2" />
                      Browse Jobs
                    </BrutalButton>
                  </Link>
                  <Link href="/roadmap" className="flex-1">
                    <BrutalButton variant="outline" color="black" className="w-full">
                      <Rocket className="w-4 h-4 mr-2" />
                      Build Roadmap
                    </BrutalButton>
                  </Link>
                </div>
              </BrutalCard>
            </Section>

            <Section title="GitHub Portfolio">
              <BrutalCard color="purple" className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <GitBranch className="w-8 h-8" />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-lg">Portfolio Score</h3>
                      <StickerBadge variant="in-progress" label="Analyzing" size="sm" />
                    </div>
                    <p className="text-sm text-black/70">Based on your GitHub activity</p>
                  </div>
                </div>
                <div className="text-center">
                  <span className="text-4xl font-bold">{state.githubScore ?? 0}</span>
                  <span className="text-lg">/100</span>
                </div>
                <Link href="/github">
                  <BrutalButton variant="outline" color="black" size="sm">
                    Analyze
                  </BrutalButton>
                </Link>
              </BrutalCard>
            </Section>

            <Section title="Recent Activity">
              <div className="space-y-3">
                {mockActivities.map((activity, i) => (
                  <motion.div
                    key={activity.id}
                    initial={false}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + i * 0.1 }}
                  >
                    <BrutalCard color="white" shadow="sm" className="flex items-center gap-4 py-4">
                      <div className="w-10 h-10 bg-green/20 brutal-radius flex items-center justify-center">
                        <activity.icon className="w-5 h-5 text-green" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{activity.text}</p>
                        <p className="text-sm text-gray-500">{activity.time}</p>
                      </div>
                      <StickerBadge variant="completed" label="Done" size="sm" />
                    </BrutalCard>
                  </motion.div>
                ))}
              </div>
            </Section>
          </div>
        </Container>
      </div>
    </AppShell>
  )
}
