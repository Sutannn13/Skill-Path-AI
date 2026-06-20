import { generateFallbackRoadmap } from '@/lib/ai'
import { getRoleById } from '@/lib/constants'
import { getLearningResourceGateFromResources } from '@/lib/roadmap/progress'
import { createSupabaseBrowserClient } from '@/lib/supabase/browser'
import {
  CurrentLevel,
  Roadmap,
  RoadmapProjectReviewStatus,
  RoadmapResourceType,
  RoadmapTaskRequirementState,
  StudyTime,
  TargetRole,
} from '@/types'

type BrowserSupabaseClient = NonNullable<ReturnType<typeof createSupabaseBrowserClient>>

interface RoadmapContextPayload {
  targetRole?: TargetRole | null
  currentLevel?: CurrentLevel | null
  studyTime?: StudyTime | string | null
  missingSkills?: string[] | null
  finalPortfolioProject?: Roadmap['finalPortfolioProject']
}

interface RoadmapJoinRow {
  id: string
  user_id: string
  title: string
  summary: string | null
  context: RoadmapContextPayload | null
  final_project_status: RoadmapProjectReviewStatus | null
}

interface TaskOwnershipRow {
  id: string
  roadmap_id: string
  week_number: number
  week_title: string | null
  week_goal: string | null
  title: string
  description: string | null
  estimated_time: string | null
  difficulty: 'easy' | 'medium' | 'hard' | null
  deliverable: string | null
  quiz_required: boolean | null
  quiz_passed: boolean | null
  project_required: boolean | null
  project_passed: boolean | null
  requirement_state: RoadmapTaskRequirementState | null
  focus_skills: string[] | null
  mini_project: Roadmap['weeks'][0]['miniProject'] | null
  roadmaps: RoadmapJoinRow | RoadmapJoinRow[] | null
}

interface LearningResourceRow {
  id: string
  resource_type: RoadmapResourceType
  url: string | null
  completion_rule: string | null
}

interface ResourceProgressRow {
  resource_id: string
  is_completed: boolean | null
}

export interface RoadmapTaskLearningContext {
  roadmap: {
    id: string
    title: string
    summary: string
    context: RoadmapContextPayload | null
    finalProjectStatus: RoadmapProjectReviewStatus | null
  }
  task: {
    id: string
    roadmapId: string
    weekNumber: number
    weekTitle: string
    weekGoal: string
    title: string
    description: string
    estimatedTime: string
    difficulty: 'easy' | 'medium' | 'hard'
    deliverable: string
    quizRequired: boolean
    quizPassed: boolean
    projectRequired: boolean
    projectPassed: boolean
    requirementState: RoadmapTaskRequirementState
    focusSkills: string[]
    miniProject: Roadmap['weeks'][0]['miniProject'] | null
  }
  requiredResourcesComplete: boolean
}

export interface ActiveRoadmapContext {
  id: string
  title: string
  summary: string
  context: RoadmapContextPayload | null
  finalProjectStatus: RoadmapProjectReviewStatus | null
}

function normalizeRoadmapJoin(joined: RoadmapJoinRow | RoadmapJoinRow[] | null): RoadmapJoinRow | null {
  if (!joined) return null
  if (Array.isArray(joined)) {
    return joined[0] ?? null
  }

  return joined
}

function getContextFinalPortfolioProject(context: RoadmapContextPayload | null) {
  if (context?.finalPortfolioProject) {
    return context.finalPortfolioProject
  }

  if (context?.targetRole && getRoleById(context.targetRole)) {
    return generateFallbackRoadmap({
      targetRole: context.targetRole,
      currentLevel: context.currentLevel ?? 'beginner',
      missingSkills: context.missingSkills ?? [],
      studyTime: context.studyTime ?? '1hour',
      durationWeeks: 6,
    }).finalPortfolioProject
  }

  return undefined
}

export function resolveFinalPortfolioProject(context: RoadmapContextPayload | null) {
  return getContextFinalPortfolioProject(context)
}

export async function loadRoadmapTaskLearningContext(input: {
  supabase: BrowserSupabaseClient
  userId: string
  taskId: string
}): Promise<RoadmapTaskLearningContext | null> {
  const { supabase, userId, taskId } = input
  const { data: taskRow, error: taskError } = await supabase
    .from('roadmap_tasks')
    .select(`
      id,
      roadmap_id,
      week_number,
      week_title,
      week_goal,
      title,
      description,
      estimated_time,
      difficulty,
      deliverable,
      quiz_required,
      quiz_passed,
      project_required,
      project_passed,
      requirement_state,
      focus_skills,
      mini_project,
      roadmaps!inner (
        id,
        user_id,
        title,
        summary,
        context,
        final_project_status,
        is_active
      )
    `)
    .eq('id', taskId)
    .eq('roadmaps.user_id', userId)
    .eq('roadmaps.is_active', true)
    .maybeSingle()

  if (taskError) {
    throw new Error(`Failed to load roadmap task: ${taskError.message}`)
  }

  if (!taskRow) {
    return null
  }

  const typedTask = taskRow as unknown as TaskOwnershipRow
  const joinedRoadmap = normalizeRoadmapJoin(typedTask.roadmaps)
  if (!joinedRoadmap) {
    return null
  }

  const { data: learningResources, error: resourcesError } = await supabase
    .from('roadmap_resources')
    .select('id, resource_type, url, completion_rule')
    .eq('roadmap_task_id', typedTask.id)

  if (resourcesError) {
    throw new Error(`Failed to load learning resources: ${resourcesError.message}`)
  }

  const resourceRows = (learningResources ?? []) as LearningResourceRow[]
  const resourceIds = resourceRows.map((resource) => resource.id)
  let completedIds = new Set<string>()

  if (resourceIds.length > 0) {
    const { data: progressRows, error: progressError } = await supabase
      .from('roadmap_resource_progress')
      .select('resource_id, is_completed')
      .eq('user_id', userId)
      .in('resource_id', resourceIds)

    if (progressError) {
      throw new Error(`Failed to load resource progress: ${progressError.message}`)
    }

    completedIds = new Set(
      (progressRows ?? [])
        .filter((row) => (row as ResourceProgressRow).is_completed === true)
        .map((row) => (row as ResourceProgressRow).resource_id)
    )
  }

  const requiredResourcesComplete = getLearningResourceGateFromResources(
    resourceRows.map((resource) => ({
      resourceType: resource.resource_type,
      url: resource.url ?? '',
      completionRule: resource.completion_rule ?? '',
      isCompleted: completedIds.has(resource.id),
    }))
  ).resourcesComplete

  return {
    roadmap: {
      id: joinedRoadmap.id,
      title: joinedRoadmap.title,
      summary: joinedRoadmap.summary ?? '',
      context: joinedRoadmap.context,
      finalProjectStatus: joinedRoadmap.final_project_status ?? 'pending',
    },
    task: {
      id: typedTask.id,
      roadmapId: typedTask.roadmap_id,
      weekNumber: typedTask.week_number,
      weekTitle: typedTask.week_title ?? `Week ${typedTask.week_number}`,
      weekGoal: typedTask.week_goal ?? 'Complete this week roadmap outcomes.',
      title: typedTask.title,
      description: typedTask.description ?? '',
      estimatedTime: typedTask.estimated_time ?? '1 hour',
      difficulty: typedTask.difficulty ?? 'medium',
      deliverable: typedTask.deliverable ?? 'Complete the required deliverable.',
      quizRequired: typedTask.quiz_required !== false,
      quizPassed: typedTask.quiz_passed === true,
      projectRequired: typedTask.project_required === true,
      projectPassed: typedTask.project_passed === true,
      requirementState: typedTask.requirement_state ?? 'resources_pending',
      focusSkills: typedTask.focus_skills ?? [],
      miniProject: typedTask.mini_project ?? null,
    },
    requiredResourcesComplete,
  }
}

export async function loadActiveRoadmapContext(input: {
  supabase: BrowserSupabaseClient
  userId: string
}): Promise<ActiveRoadmapContext | null> {
  const { supabase, userId } = input
  const { data: roadmapRow, error: roadmapError } = await supabase
    .from('roadmaps')
    .select('id, title, summary, context, final_project_status')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (roadmapError) {
    throw new Error(`Failed to load active roadmap: ${roadmapError.message}`)
  }

  if (!roadmapRow) {
    return null
  }

  const typedRoadmap = roadmapRow as {
    id: string
    title: string
    summary: string | null
    context: RoadmapContextPayload | null
    final_project_status: RoadmapProjectReviewStatus | null
  }

  return {
    id: typedRoadmap.id,
    title: typedRoadmap.title,
    summary: typedRoadmap.summary ?? '',
    context: typedRoadmap.context,
    finalProjectStatus: typedRoadmap.final_project_status ?? 'pending',
  }
}
