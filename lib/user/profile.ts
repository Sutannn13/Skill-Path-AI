import { UserProfile, SkillLevel, TargetRole } from '@/types'

const PROFILE_KEY = 'skillpath_profile'
const SKILLS_KEY = 'skillpath_user_skills'
const ONBOARDING_COMPLETED_KEY = 'skillpath_onboarding_completed'
const LEGACY_PROFILE_KEY = 'skillpath_user_profile'

// Default empty profile
const defaultProfile: UserProfile = {
  targetRole: null,
  currentLevel: null,
  goal: null,
  studyTime: null,
  githubUsername: '',
  onboardingCompleted: false,
  skills: [],
}

function normalizeStoredSkills(value: unknown): UserProfile['skills'] {
  if (Array.isArray(value)) {
    return value as UserProfile['skills']
  }

  if (value && typeof value === 'object') {
    return Object.entries(value as Record<string, SkillLevel>).map(([skillId, level]) => ({
      skillId,
      level,
    }))
  }

  return defaultProfile.skills
}

// Load profile from localStorage
export function loadUserProfile(): UserProfile {
  if (typeof window === 'undefined') {
    return defaultProfile
  }

  try {
    const storedProfile = localStorage.getItem(PROFILE_KEY) || localStorage.getItem(LEGACY_PROFILE_KEY)
    const storedSkills = localStorage.getItem(SKILLS_KEY)
    const storedCompletion = localStorage.getItem(ONBOARDING_COMPLETED_KEY)

    const parsedProfile = storedProfile ? JSON.parse(storedProfile) : {}
    const parsedSkills = storedSkills ? JSON.parse(storedSkills) : parsedProfile.skills

    return {
      ...defaultProfile,
      ...parsedProfile,
      skills: normalizeStoredSkills(parsedSkills),
      onboardingCompleted: storedCompletion
        ? storedCompletion === 'true'
        : parsedProfile.onboardingCompleted === true,
    }
  } catch (error) {
    console.error('Failed to load user profile:', error)
  }

  return defaultProfile
}

// Save profile to localStorage
export function saveUserProfile(profile: Partial<UserProfile>): UserProfile {
  const current = loadUserProfile()
  const updated = { ...current, ...profile }

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(updated))
      localStorage.setItem(SKILLS_KEY, JSON.stringify(updated.skills))
      localStorage.setItem(ONBOARDING_COMPLETED_KEY, String(updated.onboardingCompleted))
    } catch (error) {
      console.error('Failed to save user profile:', error)
    }
  }

  return updated
}

// Check if onboarding is completed
export function isOnboardingCompleted(): boolean {
  const profile = loadUserProfile()
  return profile.onboardingCompleted === true
}

// Mark onboarding as completed
export function completeOnboarding(profile: Partial<UserProfile>): UserProfile {
  return saveUserProfile({
    ...profile,
    onboardingCompleted: true,
  })
}

// Reset onboarding (for "Edit Career Profile" feature)
export function resetOnboarding(): UserProfile {
  return saveUserProfile({
    ...defaultProfile,
    githubUsername: loadUserProfile().githubUsername, // Keep GitHub username
  })
}

// Update user skills
export function updateUserSkills(skills: Record<string, SkillLevel>): UserProfile {
  const userSkills = Object.entries(skills).map(([skillId, level]) => ({
    skillId,
    level,
  }))

  return saveUserProfile({ skills: userSkills })
}

// Get user skills as a map
export function getUserSkillsMap(): Record<string, SkillLevel> {
  const profile = loadUserProfile()
  const map: Record<string, SkillLevel> = {}

  for (const skill of profile.skills) {
    map[skill.skillId] = skill.level
  }

  return map
}

// Get target role
export function getTargetRole(): TargetRole | null {
  const profile = loadUserProfile()
  return profile.targetRole
}

// Check if user needs onboarding
export function needsOnboarding(): boolean {
  const profile = loadUserProfile()
  return !profile.onboardingCompleted || !profile.targetRole
}

// Clear all user data (for logout)
export function clearUserProfile(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(PROFILE_KEY)
    localStorage.removeItem(SKILLS_KEY)
    localStorage.removeItem(ONBOARDING_COMPLETED_KEY)
    localStorage.removeItem(LEGACY_PROFILE_KEY)
  }
}

// Migrate legacy localStorage data
export function migrateLegacyData(): void {
  if (typeof window === 'undefined') return

  // Check for legacy keys
  const legacyKeys = [
    LEGACY_PROFILE_KEY,
    'skillpath_target_role',
    'skillpath_current_level',
    'skillpath_skills',
    'skillpath_onboarding_done',
  ]

  const hasLegacyData = legacyKeys.some(key => localStorage.getItem(key))

  if (hasLegacyData) {
    try {
      const profile: Partial<UserProfile> = {}

      const legacyProfile = localStorage.getItem(LEGACY_PROFILE_KEY)
      if (legacyProfile) {
        Object.assign(profile, JSON.parse(legacyProfile))
      }

      const targetRole = localStorage.getItem('skillpath_target_role')
      if (targetRole) profile.targetRole = targetRole as TargetRole

      const currentLevel = localStorage.getItem('skillpath_current_level')
      if (currentLevel) profile.currentLevel = currentLevel as UserProfile['currentLevel']

      const skillsStr = localStorage.getItem('skillpath_skills')
      if (skillsStr) {
        const skills = JSON.parse(skillsStr)
        profile.skills = Object.entries(skills).map(([skillId, level]) => ({
          skillId,
          level: level as SkillLevel,
        }))
      }

      const onboardingDone = localStorage.getItem('skillpath_onboarding_done')
      if (onboardingDone === 'true') profile.onboardingCompleted = true

      saveUserProfile(profile)

      // Clean up legacy keys
      legacyKeys.forEach(key => localStorage.removeItem(key))
    } catch (error) {
      console.error('Failed to migrate legacy data:', error)
    }
  }
}

// Initialize profile (call on app start)
export function initializeUserProfile(): UserProfile {
  migrateLegacyData()
  return loadUserProfile()
}
