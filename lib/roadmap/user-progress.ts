import type { SupabaseClient } from '@supabase/supabase-js'
import { getRoleById } from '@/lib/constants'
import { calculateTaskProgress, deriveRequirementState } from '@/lib/roadmap/progress'
import type { CurrentLevel, RoadmapResource, RoadmapTask, TargetRole } from '@/types'

export interface UserRoadmapSummary {
  fullName: string | null
  avatarUrl: string | null
  roleLabel: string
  levelLabel: string
  progress: number
  completedTasks: number
  totalTasks: number
}

interface ProfileSummaryRow {
  full_name: string | null
  avatar_url: string | null
  target_role: TargetRole | null
  current_level: CurrentLevel | null
}

interface TaskSummaryRow {
  id: string
  title: string
  status: RoadmapTask['status']
  quiz_required: boolean | null
  quiz_passed: boolean | null
  project_required: boolean | null
  project_passed: boolean | null
  requirement_state: RoadmapTask['requirementState'] | null
}

interface ResourceSummaryRow {
  id: string
  roadmap_task_id: string
  resource_type: RoadmapResource['resourceType']
  url: string
  completion_rule: string
}

interface ProgressSummaryRow {
  resource_id: string
  is_completed: boolean | null
}

const LEVEL_LABELS: Record<string, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  'internship-ready': 'Internship Ready',
}

export async function loadUserRoadmapSummary(
  supabase: SupabaseClient,
  userId: string
): Promise<UserRoadmapSummary> {
  const [profileResult, roadmapResult] = await Promise.all([
    supabase
      .from('profiles')
      .select('full_name, avatar_url, target_role, current_level')
      .eq('id', userId)
      .maybeSingle(),
    supabase
      .from('roadmaps')
      .select('id')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ])

  if (profileResult.error) throw profileResult.error
  if (roadmapResult.error) throw roadmapResult.error

  const profile = profileResult.data as ProfileSummaryRow | null
  const targetRole = profile?.target_role ?? null
  const baseSummary: UserRoadmapSummary = {
    fullName: profile?.full_name ?? null,
    avatarUrl: profile?.avatar_url ?? null,
    roleLabel: targetRole ? (getRoleById(targetRole)?.label ?? 'Developer') : 'Developer',
    levelLabel: LEVEL_LABELS[profile?.current_level ?? ''] ?? 'Getting Started',
    progress: 0,
    completedTasks: 0,
    totalTasks: 0,
  }

  const roadmapId = (roadmapResult.data as { id: string } | null)?.id
  if (!roadmapId) return baseSummary

  const { data: taskRows, error: taskError } = await supabase
    .from('roadmap_tasks')
    .select('id, title, status, quiz_required, quiz_passed, project_required, project_passed, requirement_state')
    .eq('roadmap_id', roadmapId)
    .order('week_number', { ascending: true })
    .order('task_order', { ascending: true })

  if (taskError) throw taskError

  const tasks = (taskRows ?? []) as TaskSummaryRow[]
  if (tasks.length === 0) return baseSummary

  const taskIds = tasks.map((task) => task.id)
  const { data: resourceRows, error: resourceError } = await supabase
    .from('roadmap_resources')
    .select('id, roadmap_task_id, resource_type, url, completion_rule')
    .in('roadmap_task_id', taskIds)

  if (resourceError) throw resourceError

  const resources = (resourceRows ?? []) as ResourceSummaryRow[]
  const resourceIds = resources.map((resource) => resource.id)
  let progressRows: ProgressSummaryRow[] = []

  if (resourceIds.length > 0) {
    const { data, error } = await supabase
      .from('roadmap_resource_progress')
      .select('resource_id, is_completed')
      .eq('user_id', userId)
      .in('resource_id', resourceIds)

    if (error) throw error
    progressRows = (data ?? []) as ProgressSummaryRow[]
  }

  const completedResourceIds = new Set(
    progressRows.filter((row) => row.is_completed === true).map((row) => row.resource_id)
  )
  const resourcesByTask = new Map<string, RoadmapResource[]>()

  resources.forEach((resource) => {
    const taskResources = resourcesByTask.get(resource.roadmap_task_id) ?? []
    taskResources.push({
      id: resource.id,
      title: '',
      resourceType: resource.resource_type,
      url: resource.url,
      provider: '',
      estimatedMinutes: 0,
      isRequired: true,
      completionRule: resource.completion_rule,
      watchedSeconds: 0,
      durationSeconds: null,
      completionPercentage: completedResourceIds.has(resource.id) ? 100 : 0,
      isCompleted: completedResourceIds.has(resource.id),
      completedAt: null,
    })
    resourcesByTask.set(resource.roadmap_task_id, taskResources)
  })

  const roadmapTasks: RoadmapTask[] = tasks.map((task) => ({
    id: task.id,
    title: task.title,
    description: '',
    estimatedTime: '',
    difficulty: 'medium',
    deliverable: '',
    status: task.status,
    resources: resourcesByTask.get(task.id) ?? [],
    quizRequired: task.quiz_required !== false,
    quizPassed: task.quiz_passed === true,
    projectRequired: task.project_required === true,
    projectPassed: task.project_passed === true,
    requirementState: task.requirement_state ?? 'resources_pending',
  }))

  const progress = Math.round(
    roadmapTasks.reduce((sum, task) => sum + calculateTaskProgress(task), 0) / roadmapTasks.length
  )
  const completedTasks = roadmapTasks.filter((task) => deriveRequirementState(task) === 'completed').length

  return {
    ...baseSummary,
    progress,
    completedTasks,
    totalTasks: roadmapTasks.length,
  }
}
