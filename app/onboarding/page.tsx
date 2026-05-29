'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { AppShell, Container, GradientBackground } from '@/components/layout'
import { BrutalCard, BrutalButton, BrutalCardHover } from '@/components/brutal'
import { PageScene } from '@/components/illustrations/page-scene'
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Target,
  TrendingUp,
  Calendar,
  Trophy,
  Code,
  Users,
  RefreshCw,
  Edit3,
  User,
} from 'lucide-react'
import { TARGET_ROLES, CURRENT_LEVELS, GOALS, STUDY_TIMES, SKILLS, getSkillById } from '@/lib/constants'
import { SkillLevel, TargetRole, CurrentLevel, GoalType, StudyTime } from '@/types'
import { cn } from '@/lib/utils'
import { initializeUserProfile, completeOnboarding as completeLocalOnboarding, resetOnboarding as resetLocalOnboarding } from '@/lib/user/profile'
import { createSupabaseBrowserClient } from '@/lib/supabase/browser'

const TOTAL_STEPS = 6

interface FormData {
  targetRole: TargetRole | ''
  currentLevel: CurrentLevel | ''
  goal: GoalType | ''
  studyTime: StudyTime | ''
  skills: Record<string, SkillLevel>
  githubUsername: string
}

interface ProfileRow {
  id: string
  full_name: string | null
  target_role: TargetRole | null
  current_level: CurrentLevel | null
  goal: GoalType | null
  study_time: StudyTime | null
  github_username: string | null
  onboarding_completed: boolean | null
}

interface UserSkillRow {
  user_id: string
  skill_slug: string
  level: SkillLevel
}

interface StatusMessage {
  type: 'success' | 'error'
  text: string
}

export default function OnboardingPage() {
  const router = useRouter()
  const supabase = useMemo(() => createSupabaseBrowserClient(), [])
  const [currentStep, setCurrentStep] = useState(0)
  const [isEditMode, setIsEditMode] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [statusMessage, setStatusMessage] = useState<StatusMessage | null>(null)
  const [formData, setFormData] = useState<FormData>({
    targetRole: '',
    currentLevel: '',
    goal: '',
    studyTime: '',
    skills: {},
    githubUsername: '',
  })

  const mapSkillsToFormData = (skills: { skill_slug: string; level: number }[]) => {
    return skills.reduce<Record<string, SkillLevel>>((acc, skill) => {
      const mapped = getSkillById(skill.skill_slug)
      const level = Math.max(0, Math.min(4, Number(skill.level))) as SkillLevel
      const key = mapped?.id ?? skill.skill_slug
      acc[key] = level
      return acc
    }, {})
  }

  const syncLocalProfile = (values: FormData) => {
    completeLocalOnboarding({
      targetRole: values.targetRole as TargetRole,
      currentLevel: values.currentLevel as CurrentLevel,
      goal: values.goal as GoalType,
      studyTime: values.studyTime as StudyTime,
      githubUsername: values.githubUsername,
      skills: Object.entries(values.skills).map(([skillId, level]) => ({
        skillId,
        level,
      })),
    })
  }

  // Load saved profile on mount
  useEffect(() => {
    let isActive = true

    const loadProfile = async () => {
      setIsLoading(true)
      setStatusMessage(null)

      if (supabase) {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()

        if (userError) {
          if (isActive) {
            setStatusMessage({ type: 'error', text: 'Failed to validate your session. Using demo mode.' })
          }
        } else if (user) {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('id, full_name, target_role, current_level, goal, study_time, github_username, onboarding_completed')
            .eq('id', user.id)
            .maybeSingle<ProfileRow>()

          if (profileError) {
            if (isActive) {
              setStatusMessage({ type: 'error', text: `Failed to load profile: ${profileError.message}` })
              setIsLoading(false)
            }
            return
          }

          const { data: skills, error: skillsError } = await supabase
            .from('user_skills')
            .select('skill_slug, level')
            .eq('user_id', user.id)
            .returns<{ skill_slug: string; level: number }[]>()

          if (skillsError) {
            if (isActive) {
              setStatusMessage({ type: 'error', text: `Failed to load skills: ${skillsError.message}` })
              setIsLoading(false)
            }
            return
          }

          const nextFormData: FormData = {
            targetRole: profile?.target_role ?? '',
            currentLevel: profile?.current_level ?? '',
            goal: profile?.goal ?? '',
            studyTime: profile?.study_time ?? '',
            skills: mapSkillsToFormData(skills ?? []),
            githubUsername: profile?.github_username ?? '',
          }

          if (isActive) {
            setFormData(nextFormData)
            setIsCompleted(profile?.onboarding_completed === true)
            setIsLoading(false)
          }
          return
        }
      }

      const profile = initializeUserProfile()

      if (!isActive) {
        return
      }

      if (profile.onboardingCompleted && profile.targetRole) {
        setIsCompleted(true)
        setFormData({
          targetRole: profile.targetRole || '',
          currentLevel: profile.currentLevel || '',
          goal: profile.goal || '',
          studyTime: profile.studyTime || '',
          skills: profile.skills.reduce((acc, s) => ({ ...acc, [s.skillId]: s.level }), {}),
          githubUsername: profile.githubUsername || '',
        })
      }

      setIsLoading(false)
    }

    loadProfile()

    return () => {
      isActive = false
    }
  }, [supabase])

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const completeOnboardingFlow = async () => {
    setStatusMessage(null)

    if (!formData.targetRole || !formData.currentLevel || !formData.goal || !formData.studyTime) {
      setStatusMessage({ type: 'error', text: 'Please complete all required fields before continuing.' })
      return
    }

    setIsSubmitting(true)

    if (supabase) {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError) {
        setStatusMessage({ type: 'error', text: `Failed to validate session: ${userError.message}` })
        setIsSubmitting(false)
        return
      }

      if (user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            target_role: formData.targetRole,
            current_level: formData.currentLevel,
            goal: formData.goal,
            study_time: formData.studyTime,
            github_username: formData.githubUsername.trim() || null,
            onboarding_completed: true,
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id)

        if (profileError) {
          setStatusMessage({ type: 'error', text: `Failed to save profile: ${profileError.message}` })
          setIsSubmitting(false)
          return
        }

        const skillRows: UserSkillRow[] = Object.entries(formData.skills).map(([skillId, level]) => {
          const mappedSkill = getSkillById(skillId)

          return {
            user_id: user.id,
            skill_slug: mappedSkill?.slug ?? skillId,
            level,
          }
        })

        if (skillRows.length > 0) {
          const { error: skillsError } = await supabase
            .from('user_skills')
            .upsert(skillRows, { onConflict: 'user_id,skill_slug' })

          if (skillsError) {
            setStatusMessage({ type: 'error', text: `Failed to save skills: ${skillsError.message}` })
            setIsSubmitting(false)
            return
          }
        }

        syncLocalProfile(formData)
        setStatusMessage({ type: 'success', text: 'Career profile saved successfully. Redirecting to dashboard...' })
        setTimeout(() => {
          router.push('/dashboard')
          router.refresh()
        }, 600)
        return
      }
    }

    syncLocalProfile(formData)
    setStatusMessage({ type: 'success', text: 'Demo profile saved. Redirecting to dashboard...' })
    setTimeout(() => {
      router.push('/dashboard')
      router.refresh()
    }, 600)
  }

  const nextStep = async () => {
    if (currentStep < TOTAL_STEPS - 1) {
      setCurrentStep((prev) => prev + 1)
    } else {
      await completeOnboardingFlow()
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return !!formData.targetRole
      case 1:
        return !!formData.currentLevel
      case 2:
        return !!formData.goal
      case 3:
        return !!formData.studyTime
      case 4:
        return Object.keys(formData.skills).length > 0
      case 5:
        return true
      default:
        return false
    }
  }

  const handleEditProfile = () => {
    setIsEditMode(true)
    setIsCompleted(false)
    setCurrentStep(0)
  }

  const handleResetOnboarding = async () => {
    setStatusMessage(null)
    setIsSubmitting(true)

    if (supabase) {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError) {
        setStatusMessage({ type: 'error', text: `Failed to validate session: ${userError.message}` })
        setIsSubmitting(false)
        return
      }

      if (user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            target_role: null,
            current_level: null,
            goal: null,
            study_time: null,
            github_username: null,
            onboarding_completed: false,
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id)

        if (profileError) {
          setStatusMessage({ type: 'error', text: `Failed to reset profile: ${profileError.message}` })
          setIsSubmitting(false)
          return
        }

        const { error: deleteSkillsError } = await supabase
          .from('user_skills')
          .delete()
          .eq('user_id', user.id)

        if (deleteSkillsError) {
          setStatusMessage({ type: 'error', text: `Failed to reset skills: ${deleteSkillsError.message}` })
          setIsSubmitting(false)
          return
        }
      }
    }

    resetLocalOnboarding()
    setFormData({
      targetRole: '',
      currentLevel: '',
      goal: '',
      studyTime: '',
      skills: {},
      githubUsername: '',
    })
    setIsEditMode(false)
    setIsCompleted(false)
    setCurrentStep(0)
    setStatusMessage({ type: 'success', text: 'Onboarding was reset. You can set your career profile again.' })
    setIsSubmitting(false)
  }

  const handleBackToDashboard = () => {
    router.push('/dashboard')
  }

  const progress = ((currentStep + 1) / TOTAL_STEPS) * 100

  // Loading state
  if (isLoading) {
    return (
      <AppShell showBottomNav={false}>
        <GradientBackground />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-yellow brutal-border brutal-radius flex items-center justify-center mx-auto mb-4 animate-pulse">
              <Target className="w-8 h-8" />
            </div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </AppShell>
    )
  }

  // Completed state - show profile summary with edit option
  if (isCompleted && !isEditMode) {
    const selectedRole = TARGET_ROLES.find(r => r.id === formData.targetRole)
    const selectedLevel = CURRENT_LEVELS.find(l => l.id === formData.currentLevel)
    const selectedGoal = GOALS.find(g => g.id === formData.goal)
    const selectedTime = STUDY_TIMES.find(t => t.id === formData.studyTime)

    return (
      <AppShell showBottomNav={false}>
        <GradientBackground />

        {/* Header */}
        <header className="bg-white border-b-3 border-black">
          <Container className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green brutal-border brutal-radius flex items-center justify-center">
                  <Check className="w-6 h-6 text-white" />
                </div>
                <div>
                  <span className="font-display font-bold text-xl">Career Profile Already Set</span>
                  <p className="text-sm text-gray-600">Your profile is ready</p>
                </div>
              </div>
              <button
                onClick={handleBackToDashboard}
                className="text-sm font-medium text-gray-600 hover:text-black"
              >
                Back to Dashboard
              </button>
            </div>
          </Container>
        </header>

        <Container className="py-8">
          <motion.div
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto"
          >
            {statusMessage && (
              <BrutalCard
                color={statusMessage.type === 'success' ? 'green' : 'red'}
                className="mb-6"
              >
                <p className="font-medium">{statusMessage.text}</p>
              </BrutalCard>
            )}

            {/* Success Message */}
            <BrutalCard color="green" className="text-center mb-8">
              <div className="w-16 h-16 bg-green/20 brutal-border brutal-radius flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green" />
              </div>
              <h1 className="font-display font-bold text-2xl mb-2">Career Profile Already Set</h1>
              <p className="text-gray-600">
                Your career profile has been saved. You can always update it later.
              </p>
            </BrutalCard>

            {/* Profile Summary */}
            <div className="space-y-4 mb-8">
              <h2 className="font-display font-bold text-xl">Your Profile</h2>

              <BrutalCard color="yellow" className="flex items-center gap-4">
                <div className="w-12 h-12 bg-yellow/20 brutal-border brutal-radius flex items-center justify-center">
                  <Target className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Target Role</p>
                  <p className="font-bold">{selectedRole?.label || 'Not set'}</p>
                </div>
              </BrutalCard>

              <BrutalCard color="pink" className="flex items-center gap-4">
                <div className="w-12 h-12 bg-pink/20 brutal-border brutal-radius flex items-center justify-center">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Current Level</p>
                  <p className="font-bold">{selectedLevel?.label || 'Not set'}</p>
                </div>
              </BrutalCard>

              <BrutalCard color="blue" className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue/20 brutal-border brutal-radius flex items-center justify-center">
                  <Trophy className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Goal</p>
                  <p className="font-bold">{selectedGoal?.label || 'Not set'}</p>
                </div>
              </BrutalCard>

              <BrutalCard color="orange" className="flex items-center gap-4">
                <div className="w-12 h-12 bg-orange/20 brutal-border brutal-radius flex items-center justify-center">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Study Time</p>
                  <p className="font-bold">{selectedTime?.label || 'Not set'} per day</p>
                </div>
              </BrutalCard>

              <BrutalCard color="purple" className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple/20 brutal-border brutal-radius flex items-center justify-center">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Skills Assessed</p>
                  <p className="font-bold">{Object.keys(formData.skills).length} skills rated</p>
                </div>
              </BrutalCard>

              {formData.githubUsername && (
                <BrutalCard color="gray" className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-200 brutal-border brutal-radius flex items-center justify-center">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">GitHub</p>
                    <p className="font-bold">@{formData.githubUsername}</p>
                  </div>
                </BrutalCard>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <BrutalButton color="yellow" onClick={handleBackToDashboard} disabled={isSubmitting}>
                Go to Dashboard
              </BrutalButton>
              <BrutalButton variant="outline" color="black" onClick={handleEditProfile} disabled={isSubmitting}>
                <Edit3 className="w-4 h-4 mr-2" />
                Edit Career Profile
              </BrutalButton>
              <BrutalButton
                variant="ghost"
                color="red"
                onClick={handleResetOnboarding}
                loading={isSubmitting}
                disabled={isSubmitting}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reset Onboarding
              </BrutalButton>
            </div>
          </motion.div>
        </Container>
      </AppShell>
    )
  }

  // Onboarding flow (first time or edit mode)
  return (
    <AppShell showBottomNav={false}>
      <GradientBackground />

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b-3 border-black">
        <Container className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow brutal-border brutal-radius flex items-center justify-center">
                <Target className="w-6 h-6" />
              </div>
              <div>
                <span className="font-display font-bold text-xl">
                  {isEditMode ? 'Edit Profile' : 'Welcome to SkillPath'}
                </span>
                {isEditMode && (
                  <p className="text-sm text-gray-600">Update your career profile</p>
                )}
              </div>
            </div>

            <div className="text-sm text-gray-500">
              Step {currentStep + 1} of {TOTAL_STEPS}
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-4 h-3 bg-gray-200 brutal-border brutal-radius overflow-hidden">
            <motion.div
              className="h-full bg-yellow"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </Container>
      </header>

      <Container className="py-8">
        <div className="mx-auto mb-6 max-w-2xl">
          <PageScene variant="onboarding" compact />
        </div>

        {statusMessage && (
          <div className="mx-auto mb-6 max-w-2xl">
            <BrutalCard color={statusMessage.type === 'success' ? 'green' : 'red'}>
              <p className="font-medium">{statusMessage.text}</p>
            </BrutalCard>
          </div>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={false}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {/* Step 0: Target Role */}
            {currentStep === 0 && (
              <div className="max-w-2xl mx-auto">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-blue brutal-border brutal-radius flex items-center justify-center mx-auto mb-4">
                    <Code className="w-8 h-8" />
                  </div>
                  <h1 className="font-display font-bold text-3xl mb-2">
                    What developer role do you want?
                  </h1>
                  <p className="text-gray-600">
                    Choose the career path that excites you the most.
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  {TARGET_ROLES.map((role) => (
                    <BrutalCardHover
                      key={role.id}
                      color={formData.targetRole === role.id ? 'yellow' : 'white'}
                      className={cn(
                        'cursor-pointer transition-all',
                        formData.targetRole === role.id && 'ring-4 ring-yellow ring-offset-2'
                      )}
                      onClick={() => updateFormData('targetRole', role.id)}
                    >
                      <h3 className="font-display font-bold text-lg mb-2">{role.label}</h3>
                      <p className="text-sm text-gray-600">{role.description}</p>
                    </BrutalCardHover>
                  ))}
                </div>
              </div>
            )}

            {/* Step 1: Current Level */}
            {currentStep === 1 && (
              <div className="max-w-2xl mx-auto">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-pink brutal-border brutal-radius flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="w-8 h-8" />
                  </div>
                  <h1 className="font-display font-bold text-3xl mb-2">
                    Where are you right now?
                  </h1>
                  <p className="text-gray-600">
                    Be honest - this helps us create the right plan for you.
                  </p>
                </div>

                <div className="space-y-4">
                  {CURRENT_LEVELS.map((level) => (
                    <BrutalCardHover
                      key={level.id}
                      color={formData.currentLevel === level.id ? 'pink' : 'white'}
                      onClick={() => updateFormData('currentLevel', level.id)}
                    >
                      <div className="flex items-start gap-4">
                        <div className={cn(
                          'w-8 h-8 brutal-radius flex items-center justify-center font-bold',
                          formData.currentLevel === level.id ? 'bg-black text-white' : 'bg-gray-200'
                        )}>
                          {formData.currentLevel === level.id && <Check className="w-5 h-5" />}
                        </div>
                        <div>
                          <h3 className="font-display font-bold text-lg">{level.label}</h3>
                          <p className="text-sm text-gray-600">{level.description}</p>
                        </div>
                      </div>
                    </BrutalCardHover>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Goal */}
            {currentStep === 2 && (
              <div className="max-w-2xl mx-auto">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-green brutal-border brutal-radius flex items-center justify-center mx-auto mb-4">
                    <Trophy className="w-8 h-8" />
                  </div>
                  <h1 className="font-display font-bold text-3xl mb-2">
                    What is your main goal?
                  </h1>
                  <p className="text-gray-600">
                    This shapes your learning priorities and job recommendations.
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  {GOALS.map((goal) => (
                    <BrutalCardHover
                      key={goal.id}
                      color={formData.goal === goal.id ? 'green' : 'white'}
                      onClick={() => updateFormData('goal', goal.id)}
                    >
                      <h3 className="font-display font-bold text-lg mb-2">{goal.label}</h3>
                      <p className="text-sm text-gray-600">{goal.description}</p>
                    </BrutalCardHover>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Study Time */}
            {currentStep === 3 && (
              <div className="max-w-2xl mx-auto">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-orange brutal-border brutal-radius flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-8 h-8" />
                  </div>
                  <h1 className="font-display font-bold text-3xl mb-2">
                    How much time can you study daily?
                  </h1>
                  <p className="text-gray-600">
                    We will create a realistic roadmap based on your availability.
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  {STUDY_TIMES.map((time) => (
                    <BrutalCardHover
                      key={time.id}
                      color={formData.studyTime === time.id ? 'orange' : 'white'}
                      onClick={() => updateFormData('studyTime', time.id)}
                    >
                      <div className="text-center">
                        <h3 className="font-display font-bold text-2xl mb-2">{time.label}</h3>
                        <p className="text-sm text-gray-600">per day</p>
                      </div>
                    </BrutalCardHover>
                  ))}
                </div>
              </div>
            )}

            {/* Step 4: Skills */}
            {currentStep === 4 && (
              <div className="max-w-3xl mx-auto">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-purple brutal-border brutal-radius flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8" />
                  </div>
                  <h1 className="font-display font-bold text-3xl mb-2">
                    Rate your current skills
                  </h1>
                  <p className="text-gray-600">
                    Select your skill levels. You can always update these later.
                  </p>
                </div>

                <div className="space-y-6">
                  {/* Frontend Skills */}
                  <BrutalCard color="blue" className="p-4">
                    <h3 className="font-display font-bold text-lg mb-4">Frontend</h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {SKILLS.filter(s => s.category === 'frontend').slice(0, 8).map((skill) => (
                        <SkillLevelSelector
                          key={skill.id}
                          skill={skill}
                          value={formData.skills[skill.id] || 0}
                          onChange={(level) => updateFormData('skills', { ...formData.skills, [skill.id]: level })}
                        />
                      ))}
                    </div>
                  </BrutalCard>

                  {/* Backend Skills */}
                  <BrutalCard color="green" className="p-4">
                    <h3 className="font-display font-bold text-lg mb-4">Backend</h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {SKILLS.filter(s => s.category === 'backend').slice(0, 6).map((skill) => (
                        <SkillLevelSelector
                          key={skill.id}
                          skill={skill}
                          value={formData.skills[skill.id] || 0}
                          onChange={(level) => updateFormData('skills', { ...formData.skills, [skill.id]: level })}
                        />
                      ))}
                    </div>
                  </BrutalCard>

                  {/* General Skills */}
                  <BrutalCard color="purple" className="p-4">
                    <h3 className="font-display font-bold text-lg mb-4">General</h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {SKILLS.filter(s => s.category === 'general').slice(0, 4).map((skill) => (
                        <SkillLevelSelector
                          key={skill.id}
                          skill={skill}
                          value={formData.skills[skill.id] || 0}
                          onChange={(level) => updateFormData('skills', { ...formData.skills, [skill.id]: level })}
                        />
                      ))}
                    </div>
                  </BrutalCard>
                </div>
              </div>
            )}

            {/* Step 5: GitHub (Optional) */}
            {currentStep === 5 && (
              <div className="max-w-2xl mx-auto">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-black brutal-border brutal-radius flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-yellow" />
                  </div>
                  <h1 className="font-display font-bold text-3xl mb-2">
                    Connect your GitHub (optional)
                  </h1>
                  <p className="text-gray-600">
                    We will analyze your portfolio and give personalized suggestions.
                  </p>
                </div>

                <BrutalCard color="white">
                  <label className="block mb-4">
                    <span className="font-medium mb-2 block">GitHub Username</span>
                    <input
                      type="text"
                      value={formData.githubUsername}
                      onChange={(e) => updateFormData('githubUsername', e.target.value)}
                      placeholder="e.g., johndoe"
                      className="w-full px-4 py-3 brutal-border brutal-radius bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-yellow"
                    />
                  </label>
                  <p className="text-sm text-gray-500">
                    Leave blank to skip this step. You can add it later in Settings.
                  </p>
                </BrutalCard>

                <div className="mt-8 text-center">
                  <BrutalCard color="yellow" className="inline-block">
                    <h3 className="font-bold mb-2">You are all set!</h3>
                    <p className="text-sm text-black/70">
                      Click Continue to see your personalized dashboard and roadmap.
                    </p>
                  </BrutalCard>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center mt-8 max-w-2xl mx-auto">
          <BrutalButton
            variant="ghost"
            color="black"
            onClick={prevStep}
            disabled={currentStep === 0 || isSubmitting}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </BrutalButton>

          <BrutalButton
            color="yellow"
            onClick={() => void nextStep()}
            disabled={!canProceed() || isSubmitting}
            loading={isSubmitting}
          >
            {currentStep === TOTAL_STEPS - 1 ? (isSubmitting ? 'Saving...' : 'Complete Setup') : 'Continue'}
            <ArrowRight className="w-4 h-4 ml-2" />
          </BrutalButton>
        </div>
      </Container>
    </AppShell>
  )
}

// Skill Level Selector component for onboarding
function SkillLevelSelector({
  skill,
  value,
  onChange,
}: {
  skill: typeof SKILLS[0]
  value: SkillLevel
  onChange: (level: SkillLevel) => void
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="font-medium text-sm">{skill.name}</span>
      <div className="flex gap-1">
        {([0, 1, 2, 3, 4] as SkillLevel[]).map((level) => (
          <button
            key={level}
            type="button"
            onClick={() => onChange(level)}
            className={cn(
              'w-8 h-8 brutal-border brutal-radius text-sm font-bold transition-all',
              value === level
                ? 'bg-black text-white shadow-brutal-sm'
                : 'bg-white text-black hover:bg-gray-100'
            )}
          >
            {level}
          </button>
        ))}
      </div>
    </div>
  )
}
