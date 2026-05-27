import type { User } from '@supabase/supabase-js'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import type {
  AuthProfile,
  CurrentLevel,
  GoalType,
  StudyTime,
  TargetRole,
  UserRole,
} from '@/types'

const PROFILE_COLUMNS = [
  'id',
  'full_name',
  'role',
  'target_role',
  'current_level',
  'goal',
  'study_time',
  'github_username',
  'onboarding_completed',
  'created_at',
  'updated_at',
].join(', ')

interface ProfileRow {
  id: string
  full_name: string | null
  role: string | null
  target_role: TargetRole | null
  current_level: CurrentLevel | null
  goal: GoalType | null
  study_time: StudyTime | null
  github_username: string | null
  onboarding_completed: boolean | null
  created_at: string | null
  updated_at: string | null
}

export interface CurrentAuthState {
  isConfigured: boolean
  user: User | null
  profile: AuthProfile | null
  error: string | null
}

export function isUserRole(value: unknown): value is UserRole {
  return value === 'admin' || value === 'user'
}

export function canAccessAdmin(role: UserRole | null | undefined) {
  return role === 'admin'
}

function mapProfile(row: ProfileRow): AuthProfile {
  return {
    id: row.id,
    fullName: row.full_name,
    role: isUserRole(row.role) ? row.role : 'user',
    targetRole: row.target_role,
    currentLevel: row.current_level,
    goal: row.goal,
    studyTime: row.study_time,
    githubUsername: row.github_username,
    onboardingCompleted: row.onboarding_completed ?? false,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function getCurrentUserWithProfile(): Promise<CurrentAuthState> {
  const supabase = await createSupabaseServerClient()

  if (!supabase) {
    return {
      isConfigured: false,
      user: null,
      profile: null,
      error: null,
    }
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return {
      isConfigured: true,
      user: null,
      profile: null,
      error: userError?.message ?? null,
    }
  }

  const { data, error } = await supabase
    .from('profiles')
    .select(PROFILE_COLUMNS)
    .eq('id', user.id)
    .maybeSingle()

  if (error) {
    console.error('[Auth] Failed to load profile:', error.message)

    return {
      isConfigured: true,
      user,
      profile: null,
      error: 'Unable to load user profile',
    }
  }

  return {
    isConfigured: true,
    user,
    profile: data ? mapProfile(data as unknown as ProfileRow) : null,
    error: null,
  }
}
