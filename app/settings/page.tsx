'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { AppShell, Container, GradientBackground } from '@/components/layout'
import { DashboardHeader } from '@/components/layout/dashboard-header'
import { BrutalCard, BrutalButton } from '@/components/brutal'
import { LogoutButton } from '@/components/auth/logout-button'
import { PageScene } from '@/components/illustrations/page-scene'
import { cn } from '@/lib/utils'
import { resetOnboarding as resetLocalOnboarding, initializeUserProfile, saveUserProfile } from '@/lib/user/profile'
import { createSupabaseBrowserClient } from '@/lib/supabase/browser'
import { CURRENT_LEVELS, STUDY_TIMES, TARGET_ROLES } from '@/lib/constants'
import { CurrentLevel, StudyTime, TargetRole } from '@/types'
import { User, Bell, Shield, Palette, Save, Github, ExternalLink, RefreshCw, AlertCircle, Settings } from 'lucide-react'

const settingsSections = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'security', label: 'Security', icon: Shield },
]

interface ProfileRow {
  full_name: string | null
  target_role: TargetRole | null
  current_level: CurrentLevel | null
  study_time: StudyTime | null
  github_username: string | null
  onboarding_completed: boolean | null
}

interface ProfileFormState {
  fullName: string
  email: string
  githubUsername: string
  targetRole: TargetRole | ''
  currentLevel: CurrentLevel | ''
  studyTime: StudyTime | ''
}

interface SettingsStatus {
  type: 'success' | 'error'
  message: string
}

const initialProfileForm: ProfileFormState = {
  fullName: '',
  email: '',
  githubUsername: '',
  targetRole: '',
  currentLevel: '',
  studyTime: '',
}

export default function SettingsPage() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), [])
  const [activeSection, setActiveSection] = useState('profile')
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isResetting, setIsResetting] = useState(false)
  const [isDemoMode, setIsDemoMode] = useState(!supabase)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [profileForm, setProfileForm] = useState<ProfileFormState>(initialProfileForm)
  const [status, setStatus] = useState<SettingsStatus | null>(null)

  useEffect(() => {
    let isActive = true

    const loadSettings = async () => {
      setIsLoading(true)
      setStatus(null)

      if (supabase) {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()

        if (userError) {
          if (isActive) {
            setStatus({ type: 'error', message: `Failed to validate session: ${userError.message}` })
          }
        } else if (user) {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('full_name, target_role, current_level, study_time, github_username, onboarding_completed')
            .eq('id', user.id)
            .maybeSingle()

          if (profileError) {
            if (isActive) {
              setStatus({ type: 'error', message: `Failed to load profile: ${profileError.message}` })
              setIsLoading(false)
            }
            return
          }

          const typedProfile = profile as ProfileRow | null

          if (isActive) {
            setCurrentUserId(user.id)
            setIsDemoMode(false)
            setProfileForm({
              fullName: typedProfile?.full_name ?? '',
              email: user.email ?? '',
              githubUsername: typedProfile?.github_username ?? '',
              targetRole: typedProfile?.target_role ?? '',
              currentLevel: typedProfile?.current_level ?? '',
              studyTime: typedProfile?.study_time ?? '',
            })
            setIsLoading(false)
          }
          return
        }
      }

      const localProfile = initializeUserProfile()

      if (isActive) {
        setIsDemoMode(true)
        setProfileForm({
          fullName: '',
          email: '',
          githubUsername: localProfile.githubUsername ?? '',
          targetRole: localProfile.targetRole ?? '',
          currentLevel: localProfile.currentLevel ?? '',
          studyTime: localProfile.studyTime ?? '',
        })
        setIsLoading(false)
      }
    }

    loadSettings()

    return () => {
      isActive = false
    }
  }, [supabase])

  const updateProfileField = <K extends keyof ProfileFormState>(field: K, value: ProfileFormState[K]) => {
    setProfileForm((prev) => ({ ...prev, [field]: value }))
    setHasUnsavedChanges(true)
    setStatus(null)
  }

  const handleSaveProfile = async () => {
    setStatus(null)
    setIsSaving(true)

    if (supabase && currentUserId) {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profileForm.fullName.trim() || null,
          target_role: profileForm.targetRole || null,
          current_level: profileForm.currentLevel || null,
          study_time: profileForm.studyTime || null,
          github_username: profileForm.githubUsername.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', currentUserId)

      if (error) {
        setStatus({ type: 'error', message: `Failed to save profile: ${error.message}` })
        setIsSaving(false)
        return
      }

      setHasUnsavedChanges(false)
      setStatus({ type: 'success', message: 'Profile changes saved to Supabase.' })
      setIsSaving(false)
      return
    }

    saveUserProfile({
      targetRole: profileForm.targetRole || null,
      currentLevel: profileForm.currentLevel || null,
      studyTime: profileForm.studyTime || null,
      githubUsername: profileForm.githubUsername.trim(),
    })

    setHasUnsavedChanges(false)
    setStatus({ type: 'success', message: 'Demo profile changes saved locally.' })
    setIsSaving(false)
  }

  const handleResetOnboarding = async () => {
    const shouldReset = window.confirm('Reset onboarding status and clear your saved career profile fields?')
    if (!shouldReset) return

    const shouldDeleteSkills = window.confirm('Also delete all saved skill levels from your account?')

    setStatus(null)
    setIsResetting(true)

    if (supabase && currentUserId) {
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
        .eq('id', currentUserId)

      if (profileError) {
        setStatus({ type: 'error', message: `Failed to reset onboarding: ${profileError.message}` })
        setIsResetting(false)
        return
      }

      if (shouldDeleteSkills) {
        const { error: skillsError } = await supabase
          .from('user_skills')
          .delete()
          .eq('user_id', currentUserId)

        if (skillsError) {
          setStatus({ type: 'error', message: `Failed to delete user skills: ${skillsError.message}` })
          setIsResetting(false)
          return
        }
      }
    } else {
      resetLocalOnboarding()
    }

    setProfileForm((prev) => ({
      ...prev,
      targetRole: '',
      currentLevel: '',
      studyTime: '',
      githubUsername: '',
    }))
    setHasUnsavedChanges(false)
    setStatus({
      type: 'success',
      message: shouldDeleteSkills
        ? 'Onboarding has been reset and skill data cleared.'
        : 'Onboarding has been reset.',
    })
    setIsResetting(false)
  }

  const initials =
    profileForm.fullName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || 'U'

  return (
    <AppShell showBottomNav={true}>
      <GradientBackground />

      <div className="flex-1">
        <DashboardHeader
          icon={Settings}
          iconColor="white"
          title="Settings"
          subtitle="Manage your account and preferences"
        />

        <Container className="py-6">
          <PageScene variant="settings" className="mb-6" />

          <div className="grid lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1">
              <BrutalCard color="white" className="sticky top-24">
                <nav className="space-y-2">
                  {settingsSections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={cn(
                        'w-full flex items-center gap-3 px-4 py-3 brutal-radius font-medium transition-all text-left',
                        activeSection === section.id
                          ? 'bg-yellow font-bold'
                          : 'hover:bg-gray-100'
                      )}
                    >
                      <section.icon className="w-5 h-5" />
                      {section.label}
                    </button>
                  ))}
                </nav>
              </BrutalCard>
            </div>

            <div className="lg:col-span-3">
              {activeSection === 'profile' && (
                <motion.div initial={false} animate={{ opacity: 1, y: 0 }}>
                  <BrutalCard color="white">
                    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                      <h2 className="font-display font-bold text-xl">Profile Settings</h2>
                      {isDemoMode && (
                        <span className="rounded-md border-2 border-black bg-yellow px-3 py-1 text-xs font-bold">
                          Demo Mode
                        </span>
                      )}
                    </div>

                    {status && (
                      <div
                        className={cn(
                          'mb-6 flex items-start gap-2 rounded-md border-2 px-4 py-3',
                          status.type === 'success' ? 'border-green bg-green/10' : 'border-red bg-red/10'
                        )}
                      >
                        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                        <p className="text-sm font-medium">{status.message}</p>
                      </div>
                    )}

                    <div className="space-y-6">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-6">
                          <div className="w-20 h-20 bg-yellow brutal-border brutal-radius flex items-center justify-center">
                            <span className="text-3xl font-bold">{initials}</span>
                          </div>
                          <div>
                            <p className="font-medium">Account Session</p>
                            <p className="text-sm text-gray-500">Logout is available here and in Security tab.</p>
                          </div>
                        </div>
                        <LogoutButton color="red" size="sm" />
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block mb-2 font-medium">Full Name</label>
                          <input
                            type="text"
                            value={profileForm.fullName}
                            onChange={(e) => updateProfileField('fullName', e.target.value)}
                            className="w-full px-4 py-3 brutal-border brutal-radius bg-gray-50 focus:bg-white"
                            disabled={isLoading}
                          />
                        </div>

                        <div>
                          <label className="block mb-2 font-medium">Email</label>
                          <input
                            type="email"
                            value={profileForm.email}
                            readOnly
                            className="w-full px-4 py-3 brutal-border brutal-radius bg-gray-100 text-gray-600"
                          />
                          <p className="mt-1 text-xs text-gray-500">Email is managed by your auth provider.</p>
                        </div>

                        <div>
                          <label className="block mb-2 font-medium">GitHub Username</label>
                          <div className="flex gap-2">
                            <div className="relative flex-1">
                              <Github className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                              <input
                                type="text"
                                value={profileForm.githubUsername}
                                onChange={(e) => updateProfileField('githubUsername', e.target.value)}
                                className="w-full pl-12 pr-4 py-3 brutal-border brutal-radius bg-gray-50 focus:bg-white"
                              />
                            </div>
                            <a
                              href={profileForm.githubUsername ? `https://github.com/${profileForm.githubUsername}` : '#'}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(event) => {
                                if (!profileForm.githubUsername) {
                                  event.preventDefault()
                                }
                              }}
                            >
                              <BrutalButton variant="ghost" color="black">
                                <ExternalLink className="w-4 h-4" />
                              </BrutalButton>
                            </a>
                          </div>
                        </div>

                        <div>
                          <label className="block mb-2 font-medium">Target Role</label>
                          <select
                            value={profileForm.targetRole}
                            onChange={(e) => updateProfileField('targetRole', e.target.value as TargetRole | '')}
                            className="w-full px-4 py-3 brutal-border brutal-radius bg-gray-50 focus:bg-white"
                          >
                            <option value="">Select target role</option>
                            {TARGET_ROLES.map((role) => (
                              <option key={role.id} value={role.id}>
                                {role.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="pt-2">
                          <label className="block mb-2 font-medium">Current Level</label>
                          <select
                            value={profileForm.currentLevel}
                            onChange={(e) => updateProfileField('currentLevel', e.target.value as CurrentLevel | '')}
                            className="w-full px-4 py-3 brutal-border brutal-radius bg-gray-50 focus:bg-white"
                          >
                            <option value="">Select current level</option>
                            {CURRENT_LEVELS.map((level) => (
                              <option key={level.id} value={level.id}>
                                {level.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block mb-2 font-medium">Study Time</label>
                          <select
                            value={profileForm.studyTime}
                            onChange={(e) => updateProfileField('studyTime', e.target.value as StudyTime | '')}
                            className="w-full px-4 py-3 brutal-border brutal-radius bg-gray-50 focus:bg-white"
                          >
                            <option value="">Select study time</option>
                            {STUDY_TIMES.map((time) => (
                              <option key={time.id} value={time.id}>
                                {time.label} per day
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        {hasUnsavedChanges && (
                          <BrutalButton color="green" onClick={handleSaveProfile} loading={isSaving} disabled={isSaving}>
                            <Save className="w-4 h-4 mr-2" />
                            Save Changes
                          </BrutalButton>
                        )}
                        <BrutalButton
                          variant="outline"
                          color="red"
                          onClick={handleResetOnboarding}
                          loading={isResetting}
                          disabled={isResetting}
                        >
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Reset Onboarding
                        </BrutalButton>
                      </div>
                    </div>
                  </BrutalCard>
                </motion.div>
              )}

              {activeSection === 'notifications' && (
                <motion.div initial={false} animate={{ opacity: 1, y: 0 }}>
                  <BrutalCard color="white">
                    <h2 className="font-display font-bold text-xl mb-6">Notification Preferences</h2>

                    <div className="space-y-4">
                      {[
                        { label: 'Weekly progress reminders', description: 'Get reminded about your weekly sprint goals', enabled: true },
                        { label: 'Job matches', description: 'Receive notifications when new jobs match your profile', enabled: true },
                        { label: 'Roadmap updates', description: 'Updates about changes to your learning roadmap', enabled: false },
                        { label: 'Marketing emails', description: 'Tips, tricks, and updates from SkillPath', enabled: false },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-gray-50 brutal-border brutal-radius">
                          <div>
                            <p className="font-medium">{item.label}</p>
                            <p className="text-sm text-gray-500">{item.description}</p>
                          </div>
                          <button
                            onClick={() => {}}
                            className={cn(
                              'w-12 h-6 brutal-radius relative transition-all',
                              item.enabled ? 'bg-green' : 'bg-gray-300'
                            )}
                          >
                            <div className={cn(
                              'w-5 h-5 bg-white brutal-border absolute top-0.5 transition-all',
                              item.enabled ? 'left-6' : 'left-0.5'
                            )} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </BrutalCard>
                </motion.div>
              )}

              {activeSection === 'appearance' && (
                <motion.div initial={false} animate={{ opacity: 1, y: 0 }}>
                  <BrutalCard color="white">
                    <h2 className="font-display font-bold text-xl mb-6">Appearance Settings</h2>

                    <div className="space-y-6">
                      <div>
                        <p className="font-medium mb-3">Theme</p>
                        <div className="grid grid-cols-3 gap-4">
                          {['Light', 'Dark', 'System'].map((theme) => (
                            <button
                              key={theme}
                              className={cn(
                                'p-4 brutal-border brutal-radius font-medium transition-all',
                                theme === 'Light' ? 'bg-yellow font-bold' : 'bg-gray-50 hover:bg-gray-100'
                              )}
                            >
                              {theme}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="font-medium mb-3">Animations</p>
                        <div className="flex items-center justify-between p-4 bg-gray-50 brutal-border brutal-radius">
                          <div>
                            <p className="font-medium">Reduced motion</p>
                            <p className="text-sm text-gray-500">Minimize animations for accessibility</p>
                          </div>
                          <button
                            onClick={() => {}}
                            className="w-12 h-6 brutal-radius relative bg-gray-300"
                          >
                            <div className="w-5 h-5 bg-white brutal-border absolute left-0.5 top-0.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </BrutalCard>
                </motion.div>
              )}

              {activeSection === 'security' && (
                <motion.div initial={false} animate={{ opacity: 1, y: 0 }}>
                  <BrutalCard color="white">
                    <h2 className="font-display font-bold text-xl mb-6">Security Settings</h2>

                    <div className="space-y-6">
                      <div>
                        <h3 className="font-medium mb-2">Change Password</h3>
                        <div className="space-y-3">
                          <input
                            type="password"
                            placeholder="Current password"
                            className="w-full px-4 py-3 brutal-border brutal-radius bg-gray-50"
                          />
                          <input
                            type="password"
                            placeholder="New password"
                            className="w-full px-4 py-3 brutal-border brutal-radius bg-gray-50"
                          />
                          <input
                            type="password"
                            placeholder="Confirm new password"
                            className="w-full px-4 py-3 brutal-border brutal-radius bg-gray-50"
                          />
                          <BrutalButton color="blue">Update Password</BrutalButton>
                        </div>
                      </div>

                      <div className="pt-6 border-t-2 border-gray-200">
                        <h3 className="font-medium mb-2">Connected Accounts</h3>
                        <div className="flex items-center justify-between p-4 bg-gray-50 brutal-border brutal-radius">
                          <div className="flex items-center gap-3">
                            <Github className="w-6 h-6" />
                            <div>
                              <p className="font-medium">GitHub</p>
                              <p className="text-sm text-gray-500">
                                {profileForm.githubUsername
                                  ? `Connected as @${profileForm.githubUsername}`
                                  : 'No GitHub username set yet'}
                              </p>
                            </div>
                          </div>
                          <BrutalButton variant="outline" color="black" size="sm">
                            Disconnect
                          </BrutalButton>
                        </div>
                      </div>

                      <div className="pt-6 border-t-2 border-gray-200">
                        <h3 className="font-medium mb-2">Session</h3>
                        <div className="flex items-center justify-between p-4 bg-gray-50 brutal-border brutal-radius">
                          <div>
                            <p className="font-medium">Sign out of your account</p>
                            <p className="text-sm text-gray-500">You will be redirected to the login page</p>
                          </div>
                          <LogoutButton color="red" size="sm" />
                        </div>
                      </div>
                    </div>
                  </BrutalCard>
                </motion.div>
              )}
            </div>
          </div>
        </Container>
      </div>
    </AppShell>
  )
}
