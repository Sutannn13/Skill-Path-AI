'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { AppShell, Container, GradientBackground } from '@/components/layout'
import { DashboardHeader } from '@/components/layout/dashboard-header'
import { BrutalCard, BrutalButton, ConfirmModal, SectionHeader, StickerBadge } from '@/components/brutal'
import { LogoutButton } from '@/components/auth/logout-button'
import { PageScene } from '@/components/illustrations/page-scene'
import { cn } from '@/lib/utils'
import { resetOnboarding as resetLocalOnboarding, initializeUserProfile, saveUserProfile } from '@/lib/user/profile'
import { createSupabaseBrowserClient } from '@/lib/supabase/browser'
import { CURRENT_LEVELS, STUDY_TIMES, TARGET_ROLES } from '@/lib/constants'
import { CurrentLevel, StudyTime, TargetRole } from '@/types'
import { useRef } from 'react'
import { User, Bell, Shield, Palette, Save, Github, ExternalLink, RefreshCw, AlertCircle, Settings, Upload, Trash2 } from 'lucide-react'
import { uploadAvatarAction, deleteAvatarAction } from '@/app/actions/profile'
import { Avatar } from '@/components/ui/avatar'
const settingsSections = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'security', label: 'Security', icon: Shield },
]

interface ProfileRow {
  full_name: string | null
  avatar_url: string | null
  target_role: TargetRole | null
  current_level: CurrentLevel | null
  study_time: StudyTime | null
  github_username: string | null
  onboarding_completed: boolean | null
}

interface ProfileFormState {
  fullName: string
  avatarUrl: string | null
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

type ResetConfirmationStep = 'onboarding' | 'skills' | null

const initialProfileForm: ProfileFormState = {
  fullName: '',
  avatarUrl: null,
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
  const [resetConfirmationStep, setResetConfirmationStep] = useState<ResetConfirmationStep>(null)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
            .select('full_name, avatar_url, target_role, current_level, study_time, github_username, onboarding_completed')
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
              avatarUrl: typedProfile?.avatar_url ?? null,
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
          avatarUrl: null,
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

  const handleResetOnboarding = async (shouldDeleteSkills: boolean) => {
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

  const closeResetConfirmation = () => setResetConfirmationStep(null)

  const continueResetConfirmation = () => {
    setResetConfirmationStep('skills')
  }

  const confirmResetWithSkills = () => {
    setResetConfirmationStep(null)
    void handleResetOnboarding(true)
  }

  const confirmResetKeepingSkills = () => {
    setResetConfirmationStep(null)
    void handleResetOnboarding(false)
  }

  const initials =
    profileForm.fullName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || 'U'

  const roleLabel = TARGET_ROLES.find((r) => r.id === profileForm.targetRole)?.label ?? ''
  const levelLabel = CURRENT_LEVELS.find((l) => l.id === profileForm.currentLevel)?.label ?? ''

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setStatus({ type: 'error', message: 'Format file tidak didukung. Gunakan JPG, PNG, atau WEBP.' })
      return
    }

    setIsUploadingAvatar(true)
    setStatus(null)

    try {
      // Client-side compression using Canvas
      const compressedFile = await compressImage(file, 512, 512, 0.8)
      
      if (compressedFile.size > 500 * 1024) {
        setStatus({ type: 'error', message: `Ukuran gambar maksimal 500 KB. Punyamu ${Math.round(compressedFile.size / 1024)} KB.` })
        setIsUploadingAvatar(false)
        return
      }

      const formData = new FormData()
      formData.append('avatar', compressedFile)

      const result = await uploadAvatarAction(formData)

      if (result.success && result.avatarUrl) {
        setProfileForm((prev) => ({ ...prev, avatarUrl: result.avatarUrl }))
        setStatus({ type: 'success', message: 'Foto profil berhasil diperbarui.' })
      } else {
        setStatus({ type: 'error', message: result.error || 'Gagal mengunggah foto.' })
      }
    } catch (err: any) {
      setStatus({ type: 'error', message: err.message || 'Terjadi kesalahan saat mengompresi gambar.' })
    } finally {
      setIsUploadingAvatar(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleDeleteAvatar = async () => {
    setIsUploadingAvatar(true)
    setStatus(null)
    try {
      const result = await deleteAvatarAction()
      if (result.success) {
        setProfileForm((prev) => ({ ...prev, avatarUrl: null }))
        setStatus({ type: 'success', message: 'Foto profil berhasil dihapus.' })
      } else {
        setStatus({ type: 'error', message: result.error || 'Gagal menghapus foto.' })
      }
    } catch (err: any) {
      setStatus({ type: 'error', message: err.message || 'Terjadi kesalahan saat menghapus gambar.' })
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  // Simple image compression helper
  const compressImage = (file: File, maxWidth: number, maxHeight: number, quality: number): Promise<File> => {
    return new Promise((resolve, reject) => {
      const img = new window.Image()
      img.src = URL.createObjectURL(file)
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let width = img.width
        let height = img.height

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height *= maxWidth / width))
            width = maxWidth
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width *= maxHeight / height))
            height = maxHeight
          }
        }

        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Canvas not supported'))
          return
        }
        ctx.drawImage(img, 0, 0, width, height)

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              })
              resolve(compressedFile)
            } else {
              reject(new Error('Canvas to Blob failed'))
            }
          },
          file.type,
          quality
        )
      }
      img.onerror = (error) => reject(error)
    })
  }

  return (
    <AppShell showBottomNav={true}>
      <GradientBackground />
      <ConfirmModal
        isOpen={resetConfirmationStep === 'onboarding'}
        onClose={closeResetConfirmation}
        onConfirm={continueResetConfirmation}
        title="Reset onboarding?"
        eyebrow="Pengaturan akun"
        message="Profil karier dan pilihan onboarding akan dikosongkan, lalu kamu diarahkan untuk mengisi onboarding lagi."
        details={[
          'Role dan preferensi belajar perlu dipilih ulang.',
          'Roadmap yang sudah ada tidak langsung dihapus.',
          'Pada langkah berikutnya kamu dapat memilih nasib data skill.',
        ]}
        confirmText="Lanjutkan"
        cancelText="Batal"
        variant="warning"
      />
      <ConfirmModal
        isOpen={resetConfirmationStep === 'skills'}
        onClose={closeResetConfirmation}
        onCancel={confirmResetKeepingSkills}
        onConfirm={confirmResetWithSkills}
        title="Hapus level skill juga?"
        eyebrow="Pilihan data skill"
        message="Pilih apakah level skill yang tersimpan ikut dihapus saat onboarding direset."
        details={[
          'Pertahankan skill: hanya profil onboarding yang direset.',
          'Hapus skill: seluruh level skill perlu diisi ulang.',
        ]}
        confirmText="Hapus skill & reset"
        cancelText="Pertahankan skill"
        variant="danger"
        isLoading={isResetting}
      />

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
                <p className="hud-label mb-3 text-[10px] text-secondary">Settings menu</p>
                <nav className="space-y-2">
                  {settingsSections.map((section) => {
                    const isActive = activeSection === section.id
                    return (
                      <button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        className={cn(
                          'flex w-full items-center gap-3 px-4 py-3 brutal-border brutal-radius text-left font-bold transition-all',
                          isActive
                            ? 'bg-yellow shadow-brutal-sm -translate-x-0.5 -translate-y-0.5'
                            : 'border-transparent hover:border-black hover:bg-gray-100'
                        )}
                      >
                        <span
                          className={cn(
                            'flex h-8 w-8 items-center justify-center brutal-border brutal-radius',
                            isActive ? 'bg-white' : 'bg-cream-light'
                          )}
                        >
                          <section.icon className="h-4 w-4" aria-hidden="true" />
                        </span>
                        {section.label}
                      </button>
                    )
                  })}
                </nav>
              </BrutalCard>
            </div>

            <div className="lg:col-span-3">
              {activeSection === 'profile' && (
                <motion.div initial={false} animate={{ opacity: 1, y: 0 }}>
                  <BrutalCard color="white">
                    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                      <SectionHeader label="Profile Settings" icon={User} className="mb-0" />
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
                      <div className="flex flex-col gap-4 brutal-border brutal-radius bg-cream-light p-4 sm:flex-row sm:items-center">
                        <div className="flex shrink-0 items-center gap-4 flex-col sm:flex-row">
                          <Avatar avatarUrl={profileForm.avatarUrl} initials={initials} size="xl" />
                          <div className="flex flex-col gap-2">
                            <input
                              type="file"
                              accept="image/png, image/jpeg, image/webp"
                              className="hidden"
                              ref={fileInputRef}
                              onChange={handleAvatarChange}
                              disabled={isUploadingAvatar}
                            />
                            <BrutalButton
                              variant="outline"
                              color="blue"
                              size="sm"
                              className="w-full text-xs"
                              disabled={isUploadingAvatar || isDemoMode}
                              onClick={() => fileInputRef.current?.click()}
                            >
                              <Upload className="w-3 h-3 mr-1.5" />
                              {isUploadingAvatar ? 'Mengunggah...' : 'Ubah Foto'}
                            </BrutalButton>
                            {profileForm.avatarUrl && (
                              <button
                                type="button"
                                disabled={isUploadingAvatar}
                                onClick={handleDeleteAvatar}
                                className="flex items-center justify-center text-xs text-red hover:underline font-medium"
                              >
                                <Trash2 className="w-3 h-3 mr-1" />
                                Hapus foto
                              </button>
                            )}
                          </div>
                        </div>
                        <div className="min-w-0 flex-1 sm:ml-4 border-t-2 sm:border-t-0 sm:border-l-2 border-black/10 pt-4 sm:pt-0 sm:pl-6 mt-2 sm:mt-0">
                          <p className="hud-label text-[10px] text-secondary">Akun</p>
                          <p className="truncate font-display text-lg font-bold">
                            {profileForm.fullName || 'Lengkapi nama Anda'}
                          </p>
                          <p className="truncate text-sm text-secondary">{profileForm.email || 'Email belum diatur'}</p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {profileForm.targetRole && (
                              <StickerBadge variant="blue" label={roleLabel} size="sm" />
                            )}
                            {profileForm.currentLevel && (
                              <StickerBadge variant="green" label={levelLabel} size="sm" />
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block mb-2 font-medium">Full Name</label>
                          <input
                            type="text"
                            value={profileForm.fullName}
                            onChange={(e) => updateProfileField('fullName', e.target.value)}
                            className="w-full px-4 py-3 brutal-border brutal-radius bg-gray-50 transition-all focus:bg-white focus:-translate-x-0.5 focus:-translate-y-0.5 focus:shadow-brutal-sm focus:outline-none"
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
                                className="w-full pl-12 pr-4 py-3 brutal-border brutal-radius bg-gray-50 transition-all focus:bg-white focus:-translate-x-0.5 focus:-translate-y-0.5 focus:shadow-brutal-sm focus:outline-none"
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
                            className="w-full px-4 py-3 brutal-border brutal-radius bg-gray-50 transition-all focus:bg-white focus:-translate-x-0.5 focus:-translate-y-0.5 focus:shadow-brutal-sm focus:outline-none"
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
                            className="w-full px-4 py-3 brutal-border brutal-radius bg-gray-50 transition-all focus:bg-white focus:-translate-x-0.5 focus:-translate-y-0.5 focus:shadow-brutal-sm focus:outline-none"
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
                            className="w-full px-4 py-3 brutal-border brutal-radius bg-gray-50 transition-all focus:bg-white focus:-translate-x-0.5 focus:-translate-y-0.5 focus:shadow-brutal-sm focus:outline-none"
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
                          onClick={() => setResetConfirmationStep('onboarding')}
                          loading={isResetting}
                          disabled={isResetting}
                        >
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Reset Onboarding
                        </BrutalButton>
                      </div>

                      <div className="border-t-2 border-gray-200 pt-6">
                        <div className="flex flex-col gap-3 rounded-md border-2 border-black bg-gray-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="font-medium">Sign out of your account</p>
                            <p className="text-sm text-gray-500">You will be redirected to the login page.</p>
                          </div>
                          <LogoutButton color="red" size="sm" />
                        </div>
                      </div>
                    </div>
                  </BrutalCard>
                </motion.div>
              )}

              {activeSection === 'notifications' && (
                <motion.div initial={false} animate={{ opacity: 1, y: 0 }}>
                  <BrutalCard color="white">
                    <SectionHeader label="Notification Preferences" icon={Bell} className="mb-6" />

                    <div className="space-y-4">
                      {[
                        { label: 'Weekly progress reminders', description: 'Get reminded about your weekly sprint goals', enabled: true },
                        { label: 'Job matches', description: 'Receive notifications when new jobs match your profile', enabled: true },
                        { label: 'Roadmap updates', description: 'Updates about changes to your learning roadmap', enabled: false },
                        { label: 'Marketing emails', description: 'Tips, tricks, and updates from SkillPath', enabled: false },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between gap-4 p-4 bg-cream-light brutal-border brutal-radius">
                          <div>
                            <p className="font-bold">{item.label}</p>
                            <p className="text-sm text-secondary">{item.description}</p>
                          </div>
                          <button
                            type="button"
                            aria-pressed={item.enabled}
                            onClick={() => {}}
                            className={cn(
                              'relative h-7 w-12 shrink-0 rounded-full brutal-border transition-colors',
                              item.enabled ? 'bg-green' : 'bg-gray-300'
                            )}
                          >
                            <span className={cn(
                              'absolute top-0.5 h-5 w-5 rounded-full border-2 border-black bg-white transition-all',
                              item.enabled ? 'left-[22px]' : 'left-0.5'
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
                    <SectionHeader label="Appearance Settings" icon={Palette} className="mb-6" />

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
                        <div className="flex items-center justify-between gap-4 p-4 bg-cream-light brutal-border brutal-radius">
                          <div>
                            <p className="font-bold">Reduced motion</p>
                            <p className="text-sm text-secondary">Minimize animations for accessibility</p>
                          </div>
                          <button
                            type="button"
                            aria-pressed={false}
                            onClick={() => {}}
                            className="relative h-7 w-12 shrink-0 rounded-full brutal-border bg-gray-300"
                          >
                            <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full border-2 border-black bg-white" />
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
                    <SectionHeader label="Security Settings" icon={Shield} className="mb-6" />

                    <div className="space-y-6">
                      <div>
                        <h3 className="font-medium mb-2">Change Password</h3>
                        <div className="space-y-3">
                          <input
                            type="password"
                            placeholder="Current password"
                            className="w-full px-4 py-3 brutal-border brutal-radius bg-gray-50 transition-all focus:bg-white focus:-translate-x-0.5 focus:-translate-y-0.5 focus:shadow-brutal-sm focus:outline-none"
                          />
                          <input
                            type="password"
                            placeholder="New password"
                            className="w-full px-4 py-3 brutal-border brutal-radius bg-gray-50 transition-all focus:bg-white focus:-translate-x-0.5 focus:-translate-y-0.5 focus:shadow-brutal-sm focus:outline-none"
                          />
                          <input
                            type="password"
                            placeholder="Confirm new password"
                            className="w-full px-4 py-3 brutal-border brutal-radius bg-gray-50 transition-all focus:bg-white focus:-translate-x-0.5 focus:-translate-y-0.5 focus:shadow-brutal-sm focus:outline-none"
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
