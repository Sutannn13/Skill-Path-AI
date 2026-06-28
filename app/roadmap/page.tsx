'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { AppShell, Container } from '@/components/layout'
import { GradientBackground } from '@/components/layout'
import { DashboardHeader } from '@/components/layout/dashboard-header'
import { BrutalCard, BrutalButton, ConfirmModal, SkillBadge, ScoreBar, StickerBadge, StatCard } from '@/components/brutal'
import { generateFallbackRoadmap } from '@/lib/ai'
import {
  ROADMAP_CONTENT_VERSION,
  taskRequiresModuleProject,
} from '@/lib/roadmap/content-contract'
import {
  getCuratedResourcesForTask,
  getRoadmapVideoLanguage,
  isResourceLikelyRelevant,
} from '@/lib/roadmap/resources'
import {
  calculateOverallProgress,
  calculateWeekProgress,
  deriveRequirementState,
  deriveTaskStatus,
  getCompletedTaskCount,
  getCurrentTaskLocation,
  getLearningResourceGate,
  getNextActionText,
  hasTaskProgress,
  isResourceUnavailable,
} from '@/lib/roadmap/progress'
import { calculateSkillGap } from '@/lib/scoring/skill-gap'
import { getRequiredSkillIds, getNiceToHaveSkillIds, getRoleById, getSkillById } from '@/lib/constants'
import { createSupabaseBrowserClient } from '@/lib/supabase/browser'
import { initializeUserProfile } from '@/lib/user/profile'
import { cn } from '@/lib/utils'
import {
  LearningWorkspace,
} from '@/components/roadmap'
import { Portal } from '@/components/ui/portal'
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Clock,
  Lock,
  Map as MapIcon,
  PlayCircle,
  RefreshCw,
  Save,
  Target,
  Zap,
  Rocket,
  X,
} from 'lucide-react'
import {
  CurrentLevel,
  Roadmap,
  RoadmapProjectReviewStatus,
  RoadmapResource,
  RoadmapTask,
  RoadmapTaskRequirementState,
  RoadmapWeek,
  SkillLevel,
  StudyTime,
  TargetRole,
  UserSkill,
} from '@/types'

type RoadmapMode = 'loading' | 'supabase' | 'demo' | 'error' | 'repair'
type SaveState = 'idle' | 'saving' | 'saved' | 'error'
type BrowserSupabaseClient = NonNullable<ReturnType<typeof createSupabaseBrowserClient>>
const IS_DEVELOPMENT = process.env.NODE_ENV === 'development'

const ROADMAP_SETUP_REQUIRED_MESSAGE = 'Roadmap persistence schema is not ready in Supabase. Apply migrations 005_roadmap_persistence.sql and 006_learning_assessment_system.sql, then reload this page.'
const RESOURCE_PROGRESS_SAVE_ERROR_MESSAGE = 'Progress could not be saved. Try again in a moment.'
const ROADMAP_TASK_FULL_SELECT = 'id, roadmap_id, week_number, title, description, skill_related, difficulty, estimated_time, deliverable, status, completed_at, task_key, task_order, week_title, week_goal, focus_skills, mini_project, mini_exercise_completed, deliverable_completed, quiz_required, quiz_passed, project_required, project_passed, requirement_state'
const ROADMAP_TASK_BASE_SELECT = 'id, roadmap_id, week_number, title, description, skill_related, difficulty, estimated_time, deliverable, status, completed_at, task_key, task_order, week_title, week_goal, focus_skills, mini_project, mini_exercise_completed, deliverable_completed'

interface RoadmapRow {
  id: string
  title: string
  summary: string | null
  duration_weeks: number | null
  source: 'ai' | 'fallback'
  final_project_status: RoadmapProjectReviewStatus | null
  context: {
    targetRole?: TargetRole | null
    currentLevel?: CurrentLevel | null
    studyTime?: string | null
    missingSkills?: string[] | null
    finalPortfolioProject?: Roadmap['finalPortfolioProject']
    contentVersion?: number | null
  } | null
  created_at: string
}

interface RoadmapTaskRow {
  id: string
  roadmap_id: string
  week_number: number
  title: string
  description: string | null
  skill_related: string[] | null
  difficulty: 'easy' | 'medium' | 'hard' | null
  estimated_time: string | null
  deliverable: string | null
  status: 'todo' | 'in-progress' | 'completed'
  completed_at: string | null
  task_key: string | null
  task_order: number | null
  week_title: string | null
  week_goal: string | null
  focus_skills: string[] | null
  mini_project: RoadmapWeek['miniProject'] | null
  mini_exercise_completed: boolean | null
  deliverable_completed: boolean | null
  quiz_required: boolean | null
  quiz_passed: boolean | null
  project_required: boolean | null
  project_passed: boolean | null
  requirement_state: RoadmapTaskRequirementState | null
}

interface RoadmapResourceRow {
  id: string
  roadmap_task_id: string
  title: string
  resource_type: RoadmapResource['resourceType']
  url: string
  provider: string
  estimated_minutes: number
  is_required: boolean
  completion_rule: string
  sort_order: number
}

interface RoadmapProgressRow {
  resource_id: string
  watched_seconds: number | null
  duration_seconds: number | null
  completion_percentage: number | null
  is_completed: boolean | null
  completed_at: string | null
}

interface RoadmapResourceInsertRow {
  id: string
  roadmap_task_id: string
  title: string
  resource_type: RoadmapResource['resourceType']
  url: string
  provider: string
  estimated_minutes: number
  is_required: boolean
  completion_rule: string
  sort_order: number
}

interface ProfileRow {
  target_role: TargetRole | null
  current_level: CurrentLevel | null
  study_time: StudyTime | null
}

interface UserSkillRow {
  skill_slug: string
  level: number
}

const DEFAULT_TARGET_ROLE: TargetRole = 'fullstack-developer'

const roleStarterSkills: Record<TargetRole, string[]> = {
  'frontend-developer': ['React', 'TypeScript', 'Responsive UI', 'API Integration'],
  'backend-developer': ['Node.js', 'Express', 'PostgreSQL', 'REST API'],
  'fullstack-developer': ['React', 'Node.js', 'PostgreSQL', 'Deployment'],
  'ui-engineer': ['Accessibility', 'Design Systems', 'React', 'Tailwind'],
  'mobile-developer': ['React Native', 'REST API', 'Mobile UI', 'Testing'],
  'data-analyst': ['SQL', 'Python', 'Data Visualization', 'Dashboarding'],
}

function clampSkillLevel(value: number): SkillLevel {
  return Math.max(0, Math.min(4, Number(value))) as SkillLevel
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
}

function withGeneratedResources(roadmap: Roadmap, targetRole?: TargetRole | null): Roadmap {
  const usedUrls = new Set<string>()

  return {
    ...roadmap,
    weeks: roadmap.weeks.map((week) => ({
      ...week,
      tasks: week.tasks.map((task) => ({
        ...task,
        completedAt: null,
        miniExerciseCompleted: task.miniExerciseCompleted ?? false,
        deliverableCompleted: task.deliverableCompleted ?? false,
        resources: getCuratedResourcesForTask(task, week, { targetRole, usedUrls }).map((resource, index) => ({
          id: `${task.id}-resource-${index + 1}`,
          title: resource.title,
          resourceType: resource.resourceType,
          url: resource.url,
          provider: resource.provider,
          estimatedMinutes: resource.estimatedMinutes,
          isRequired: resource.isRequired,
          completionRule: resource.completionRule,
          watchedSeconds: 0,
          durationSeconds: null,
          completionPercentage: 0,
          isCompleted: false,
          completedAt: null,
        })),
      })),
    })),
  }
}

function resolveRoadmapContext(profile?: ProfileRow | null) {
  const useLocalProfile = profile === undefined
  const localProfile = useLocalProfile && typeof window !== 'undefined' ? initializeUserProfile() : null
  const targetRole = profile?.target_role ?? localProfile?.targetRole ?? DEFAULT_TARGET_ROLE

  return {
    targetRole,
    currentLevel: profile?.current_level ?? localProfile?.currentLevel ?? 'beginner',
    studyTime: profile?.study_time ?? localProfile?.studyTime ?? '1hour',
  }
}

function createDemoRoadmap(profile?: ProfileRow | null) {
  const context = resolveRoadmapContext(profile)

  return withGeneratedResources(generateFallbackRoadmap({
    targetRole: context.targetRole,
    currentLevel: context.currentLevel,
    missingSkills: roleStarterSkills[context.targetRole],
    studyTime: context.studyTime,
    durationWeeks: 6,
  }), context.targetRole)
}

function mapResourceRowToRoadmapResource(resource: RoadmapResourceRow, progress?: RoadmapProgressRow): RoadmapResource {
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

function buildTaskFromRow(row: RoadmapTaskRow): RoadmapTask {
  return {
    id: row.id,
    taskKey: row.task_key ?? undefined,
    title: row.title,
    description: row.description ?? '',
    estimatedTime: row.estimated_time ?? '1 hour',
    difficulty: row.difficulty ?? 'medium',
    deliverable: row.deliverable ?? 'Marked deliverable',
    status: row.status,
    completedAt: row.completed_at,
    miniExerciseCompleted: row.mini_exercise_completed === true,
    deliverableCompleted: row.deliverable_completed === true,
    quizRequired: row.quiz_required !== false,
    quizPassed: row.quiz_passed === true,
    projectRequired: row.project_required === true,
    projectPassed: row.project_passed === true,
    requirementState: row.requirement_state ?? 'resources_pending',
    resources: [],
  }
}

function buildWeekContextFromTaskRow(row: RoadmapTaskRow): RoadmapWeek {
  const weekNumber = row.week_number
  return {
    week: weekNumber,
    title: row.week_title ?? `Week ${weekNumber}`,
    goal: row.week_goal ?? 'Complete this week of the roadmap',
    focusSkills: row.focus_skills ?? row.skill_related ?? [],
    tasks: [],
    miniProject: row.mini_project ?? undefined,
  }
}

function isResourceRelevantForTask(
  task: RoadmapTask,
  week: RoadmapWeek,
  resource: RoadmapResource,
  targetRole?: TargetRole | null
) {
  return isResourceUnavailable(resource) || isResourceLikelyRelevant(task, week, resource, targetRole)
}

async function ensurePersistedResourcesForTasks(input: {
  supabase: BrowserSupabaseClient
  taskRows: RoadmapTaskRow[]
  resourceRows: RoadmapResourceRow[]
  targetRole?: TargetRole | null
}) {
  const { supabase, taskRows, resourceRows, targetRole } = input
  const resourcesByTaskId = new Map<string, RoadmapResourceRow[]>()
  const usedUrls = new Set(resourceRows.map((resource) => resource.url.trim()).filter(Boolean))
  const rowsToInsert: RoadmapResourceInsertRow[] = []

  for (const resource of resourceRows) {
    const taskResources = resourcesByTaskId.get(resource.roadmap_task_id) ?? []
    taskResources.push(resource)
    resourcesByTaskId.set(resource.roadmap_task_id, taskResources)
  }

  for (const row of taskRows) {
    const task = buildTaskFromRow(row)
    const week = buildWeekContextFromTaskRow(row)
    const loadedRows = resourcesByTaskId.get(row.id) ?? []
    const loadedResources = loadedRows.map((resource) => mapResourceRowToRoadmapResource(resource))
    const uniqueLoadedResources = loadedResources.filter((resource, index, all) =>
      all.findIndex((item) => item.url === resource.url && item.title === resource.title) === index
    )
    const relevantResources = uniqueLoadedResources.filter((resource) =>
      isResourceRelevantForTask(task, week, resource, targetRole)
    )
    const hasRelevantDocs = relevantResources.some((resource) =>
      resource.resourceType === 'docs' || resource.resourceType === 'article'
    )
    const generatedResources = getCuratedResourcesForTask(task, week, { targetRole, usedUrls })
    const hasAllGeneratedVideos = generatedResources
      .filter((resource) => resource.resourceType === 'youtube')
      .every((generatedVideo) =>
        relevantResources.some((loadedResource) =>
          loadedResource.resourceType === 'youtube' &&
          loadedResource.url === generatedVideo.url &&
          getRoadmapVideoLanguage(loadedResource) === getRoadmapVideoLanguage(generatedVideo)
        )
      )

    if (hasAllGeneratedVideos && hasRelevantDocs) continue

    const existingTaskResourceKeys = new Set(
      loadedRows.map((resource) => `${resource.resource_type}:${resource.url.trim() || resource.title.trim().toLowerCase()}`)
    )

    generatedResources.forEach((resource, index) => {
      if (
        resource.resourceType === 'youtube' &&
        relevantResources.some((loadedResource) =>
          loadedResource.resourceType === 'youtube' &&
          loadedResource.url === resource.url &&
          getRoadmapVideoLanguage(loadedResource) === getRoadmapVideoLanguage(resource)
        )
      ) return
      if ((resource.resourceType === 'docs' || resource.resourceType === 'article') && hasRelevantDocs) return

      const resourceKey = `${resource.resourceType}:${resource.url.trim() || resource.title.trim().toLowerCase()}`
      if (existingTaskResourceKeys.has(resourceKey)) return
      existingTaskResourceKeys.add(resourceKey)

      rowsToInsert.push({
        id: crypto.randomUUID(),
        roadmap_task_id: row.id,
        title: resource.title,
        resource_type: resource.resourceType,
        url: resource.url,
        provider: resource.provider,
        estimated_minutes: Math.max(1, resource.estimatedMinutes),
        is_required: resource.isRequired,
        completion_rule: resource.completionRule,
        sort_order: loadedRows.length + index,
      })
    })
  }

  if (rowsToInsert.length === 0) {
    return resourceRows
  }

  const { data: insertedResources, error } = await supabase
    .from('roadmap_resources')
    .insert(rowsToInsert)
    .select('id, roadmap_task_id, title, resource_type, url, provider, estimated_minutes, is_required, completion_rule, sort_order')

  if (error) {
    throw new Error(`Failed to save generated roadmap resources: ${error.message}`)
  }

  return [
    ...resourceRows,
    ...((insertedResources ?? []) as RoadmapResourceRow[]),
  ]
}

function formatRoadmapSource(source: Roadmap['source'], title: string) {
  if (source === 'ai') return 'AI Generated'
  if (title.toLowerCase().includes('backend')) return 'Backend Roadmap Template'
  return 'Roadmap Template'
}

function formatRequirementState(state: RoadmapTaskRequirementState | null | undefined) {
  const normalized = state ?? 'resources_pending'
  const labels: Record<RoadmapTaskRequirementState, string> = {
    resources_pending: 'Finish resources',
    resources_completed: 'Resources completed',
    quiz_pending: 'Quiz next',
    quiz_passed: 'Quiz passed',
    project_pending: 'Waiting for project',
    project_passed: 'Project passed',
    completed: 'Completed',
  }

  return labels[normalized] ?? 'Needs attention'
}

function formatProjectStatus(status: string | null | undefined) {
  if (status === 'pending_review' || status === 'submitted' || status === 'needs_review') return 'Waiting for review'
  if (status === 'needs_revision') return 'Needs revision'
  if (status === 'passed') return 'Passed'
  if (status === 'failed') return 'Needs improvement'
  if (!status || status === 'pending') return 'Not submitted'
  return 'Needs attention'
}

function getNextActionLabel(roadmap: Roadmap, weekIndex: number, taskId: string): string {
  const week = roadmap.weeks[weekIndex]
  const task = week?.tasks.find((t) => t.id === taskId)
  if (!task) return 'Select a task'

  const gate = getLearningResourceGate(task)
  return getNextActionText(task, gate)
}

function getRoadmapRepairReason(roadmap: Roadmap) {
  if (roadmap.contentVersion !== ROADMAP_CONTENT_VERSION) {
    return 'This roadmap uses an older curriculum version that can contain mismatched modules, resources, or quizzes.'
  }

  const hasIncompleteResourceSet = roadmap.weeks.some((week) =>
    week.tasks.some((task) => {
      const resources = task.resources ?? []
      const hasVideo = resources.some((resource) => resource.resourceType === 'youtube' && !isResourceUnavailable(resource))
      const hasDocs = resources.some((resource) =>
        (resource.resourceType === 'docs' || resource.resourceType === 'article') &&
        !isResourceUnavailable(resource)
      )
      return !hasVideo || !hasDocs
    })
  )

  return hasIncompleteResourceSet
    ? 'One or more tasks do not have a validated video and documentation pair.'
    : null
}

function findTask(roadmap: Roadmap, taskId: string) {
  return roadmap.weeks.flatMap((week) => week.tasks).find((task) => task.id === taskId) ?? null
}

function findTaskWithWeek(roadmap: Roadmap, taskId: string) {
  for (const week of roadmap.weeks) {
    const task = week.tasks.find((item) => item.id === taskId)
    if (task) {
      return { task, week }
    }
  }

  return null
}

function updateRoadmapTask(
  roadmap: Roadmap,
  taskId: string,
  updater: (task: RoadmapTask) => RoadmapTask
): Roadmap {
  return {
    ...roadmap,
    weeks: roadmap.weeks.map((week) => ({
      ...week,
      tasks: week.tasks.map((task) => task.id === taskId ? updater(task) : task),
    })),
  }
}

function getContextFinalPortfolioProject(context: RoadmapRow['context']) {
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

function buildRoadmapFromRows(
  roadmapRow: RoadmapRow,
  taskRows: RoadmapTaskRow[],
  resourceRows: RoadmapResourceRow[],
  progressRows: RoadmapProgressRow[]
): Roadmap | null {
  // Return null if no tasks (empty roadmap)
  if (taskRows.length === 0) {
    return null
  }

  const progressByResourceId = new Map(progressRows.map((progress) => [progress.resource_id, progress]))
  const resourcesByTaskId = new Map<string, RoadmapResource[]>()
  const roadmapTargetRole = roadmapRow.context?.targetRole ?? null

  for (const resource of resourceRows) {
    const progress = progressByResourceId.get(resource.id)
    const mapped = mapResourceRowToRoadmapResource(resource, progress)

    const taskResources = resourcesByTaskId.get(resource.roadmap_task_id) ?? []
    taskResources.push(mapped)
    resourcesByTaskId.set(resource.roadmap_task_id, taskResources)
  }

  const weeks = new Map<number, RoadmapWeek>()

  for (const row of taskRows) {
    const weekNumber = row.week_number
    const existingWeek = weeks.get(weekNumber)
    const baseTask = buildTaskFromRow(row)
    const fallbackWeekContext = buildWeekContextFromTaskRow(row)

    const loadedResources = resourcesByTaskId.get(row.id) ?? []
    const uniqueLoadedResources = loadedResources.filter((resource, index, all) =>
      all.findIndex((item) => item.url === resource.url && item.title === resource.title) === index
    )
    const relevantResources = uniqueLoadedResources.filter((resource) =>
      isResourceRelevantForTask(baseTask, fallbackWeekContext, resource, roadmapTargetRole)
    )

    const task: RoadmapTask = {
      ...baseTask,
      resources: relevantResources,
    }

    if (existingWeek) {
      existingWeek.tasks.push(task)
      continue
    }

    weeks.set(weekNumber, {
      week: weekNumber,
      title: fallbackWeekContext.title,
      goal: fallbackWeekContext.goal,
      focusSkills: fallbackWeekContext.focusSkills,
      tasks: [task],
      miniProject: row.mini_project ?? undefined,
    })
  }

  return {
    id: roadmapRow.id,
    contentVersion: roadmapRow.context?.contentVersion ?? undefined,
    title: roadmapRow.title,
    summary: roadmapRow.summary ?? '',
    durationWeeks: roadmapRow.duration_weeks ?? weeks.size,
    weeks: Array.from(weeks.values()).sort((a, b) => a.week - b.week),
    finalPortfolioProject: getContextFinalPortfolioProject(roadmapRow.context),
    source: roadmapRow.source,
    createdAt: roadmapRow.created_at,
  }
}

function isRoadmapSchemaMismatchError(message: string) {
  const normalized = message.toLowerCase()
  return [
    'column roadmaps.is_active does not exist',
    'column roadmaps.archived_at does not exist',
    'column roadmaps.context does not exist',
    'column roadmaps.final_project_passed does not exist',
    'column roadmaps.final_project_status does not exist',
    "could not find the 'final_project_passed' column",
    "could not find the 'final_project_status' column",
    'column roadmap_tasks.task_order does not exist',
    'column roadmap_tasks.week_title does not exist',
    'column roadmap_tasks.mini_exercise_completed does not exist',
    'column roadmap_tasks.quiz_required does not exist',
    'column roadmap_tasks.quiz_passed does not exist',
    'column roadmap_tasks.project_required does not exist',
    'column roadmap_tasks.project_passed does not exist',
    'column roadmap_tasks.requirement_state does not exist',
    'relation "roadmap_resources" does not exist',
    'relation "roadmap_resource_progress" does not exist',
    'relation "roadmap_quizzes" does not exist',
    'relation "roadmap_quiz_questions" does not exist',
    'relation "roadmap_quiz_attempts" does not exist',
    'relation "roadmap_project_submissions" does not exist',
    'relation "roadmap_project_reviews" does not exist',
  ].some((fragment) => normalized.includes(fragment))
}

function isTaskAssessmentSchemaMismatchError(message: string) {
  const normalized = message.toLowerCase()
  return [
    'column roadmap_tasks.quiz_required does not exist',
    'column roadmap_tasks.quiz_passed does not exist',
    'column roadmap_tasks.project_required does not exist',
    'column roadmap_tasks.project_passed does not exist',
    'column roadmap_tasks.requirement_state does not exist',
  ].some((fragment) => normalized.includes(fragment))
}

function getRoadmapSafeErrorMessage(error: unknown) {
  const fallback = 'Roadmap could not be loaded. Try again.'
  if (!(error instanceof Error)) return fallback
  if (isRoadmapSchemaMismatchError(error.message)) {
    return ROADMAP_SETUP_REQUIRED_MESSAGE
  }

  return fallback
}

function getProgressSafeErrorMessage(error: unknown) {
  if (error instanceof Error && isRoadmapSchemaMismatchError(error.message)) {
    return ROADMAP_SETUP_REQUIRED_MESSAGE
  }

  return RESOURCE_PROGRESS_SAVE_ERROR_MESSAGE
}

function logRoadmapError(label: string, error: unknown) {
  if (!IS_DEVELOPMENT) return
  console.error(label, error instanceof Error ? error.message : error)
}

async function fetchGeneratedRoadmap(input: {
  targetRole: TargetRole
  currentLevel: string
  missingSkills: string[]
  studyTime: string
}) {
  const response = await fetch('/api/ai/roadmap', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      targetRole: input.targetRole,
      currentLevel: input.currentLevel,
      missingSkills: input.missingSkills,
      studyTime: input.studyTime,
      durationWeeks: 6,
    }),
  })

  const data = await response.json().catch(() => null)

  if (data?.roadmap) {
    return data.roadmap as Roadmap
  }

  if (!response.ok) {
    throw new Error(data?.message || data?.error || 'Failed to generate roadmap.')
  }

  throw new Error('Roadmap API returned an empty response.')
}

export default function RoadmapPage() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), [])
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null)
  const [expandedWeek, setExpandedWeek] = useState<number | null>(0)
  const [viewMode, setViewMode] = useState<'level' | 'map'>('level')
  const [mode, setMode] = useState<RoadmapMode>('loading')
  const [statusMessage, setStatusMessage] = useState('Preparing your learning path...')
  const [saveState, setSaveState] = useState<SaveState>('idle')
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [assessmentPersistenceAvailable, setAssessmentPersistenceAvailable] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isRegenerateConfirmOpen, setIsRegenerateConfirmOpen] = useState(false)
  const [finalProjectStatus, setFinalProjectStatus] = useState<RoadmapProjectReviewStatus | null>(null)
  const [learningWorkspace, setLearningWorkspace] = useState<{
    task: RoadmapTask
    week: RoadmapWeek
  } | null>(null)
  const weekSectionRefs = useRef<Record<number, HTMLElement | null>>({})

  // Repair callback for empty-task roadmaps
  const repairEmptyRoadmap = () => {
    if (!supabase || !currentUserId) return
    setIsRegenerateConfirmOpen(true)
  }

  const seedRoadmapAssessments = async (roadmapId: string, taskRows: Array<{
    id: string
    task_key: string | null
    title: string
    description: string
    focus_skills: string[] | null
    project_required: boolean | null
  }>) => {
    const response = await fetch('/api/roadmap/quiz/seed', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        roadmapId,
        tasks: taskRows.map((task) => ({
          id: task.id,
          taskKey: task.task_key ?? undefined,
          title: task.title,
          description: task.description,
          focusSkills: task.focus_skills ?? [],
          requiresProject: task.project_required === true,
        })),
      }),
    })

    if (!response.ok) {
      const data = await response.json().catch(() => null)
      throw new Error(data?.error || 'Failed to seed roadmap quiz assessments.')
    }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    let isActive = true
    // Role of the currently-loaded active roadmap (from its saved context). Used to
    // detect role drift when the user changes target_role after a roadmap exists.
    let latestRoadmapStoredRole: TargetRole | null = null

    const loadLatestRoadmap = async (userId: string) => {
      if (!supabase) return undefined

      const { data: roadmapRow, error: roadmapError } = await supabase
        .from('roadmaps')
        .select('id, title, summary, duration_weeks, source, context, final_project_status, created_at')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (roadmapError) {
        throw new Error(`Failed to load roadmap: ${roadmapError.message}`)
      }

      if (!roadmapRow) {
        if (isActive) {
          setFinalProjectStatus(null)
        }
        return undefined
      }

      const typedRoadmap = roadmapRow as RoadmapRow
      latestRoadmapStoredRole = typedRoadmap.context?.targetRole ?? null
      if (isActive) {
        setFinalProjectStatus(typedRoadmap.final_project_status ?? 'pending')
      }
      const { data: taskRows, error: taskError } = await supabase
        .from('roadmap_tasks')
        .select(ROADMAP_TASK_FULL_SELECT)
        .eq('roadmap_id', typedRoadmap.id)
        .order('week_number', { ascending: true })
        .order('task_order', { ascending: true })

      let resolvedTaskRows = taskRows as unknown[] | null
      if (taskError && isTaskAssessmentSchemaMismatchError(taskError.message)) {
        if (isActive) {
          setAssessmentPersistenceAvailable(false)
        }

        const { data: fallbackTaskRows, error: fallbackTaskError } = await supabase
          .from('roadmap_tasks')
          .select(ROADMAP_TASK_BASE_SELECT)
          .eq('roadmap_id', typedRoadmap.id)
          .order('week_number', { ascending: true })
          .order('task_order', { ascending: true })

        if (fallbackTaskError) {
          throw new Error(`Failed to load roadmap tasks: ${fallbackTaskError.message}`)
        }

        resolvedTaskRows = fallbackTaskRows
      } else if (taskError) {
        throw new Error(`Failed to load roadmap tasks: ${taskError.message}`)
      } else if (isActive) {
        setAssessmentPersistenceAvailable(true)
      }

      const typedTasks = (resolvedTaskRows ?? []) as RoadmapTaskRow[]
      const taskIds = typedTasks.map((task) => task.id)
      let typedResources: RoadmapResourceRow[] = []
      let typedProgress: RoadmapProgressRow[] = []

      if (taskIds.length > 0) {
        const { data: resourceRows, error: resourceError } = await supabase
          .from('roadmap_resources')
          .select('id, roadmap_task_id, title, resource_type, url, provider, estimated_minutes, is_required, completion_rule, sort_order')
          .in('roadmap_task_id', taskIds)
          .order('sort_order', { ascending: true })

        if (resourceError) {
          throw new Error(`Failed to load roadmap resources: ${resourceError.message}`)
        }

        typedResources = await ensurePersistedResourcesForTasks({
          supabase,
          taskRows: typedTasks,
          resourceRows: (resourceRows ?? []) as RoadmapResourceRow[],
          targetRole: typedRoadmap.context?.targetRole ?? null,
        })
        const resourceIds = typedResources.map((resource) => resource.id)

        if (resourceIds.length > 0) {
          const { data: progressRows, error: progressError } = await supabase
            .from('roadmap_resource_progress')
            .select('resource_id, watched_seconds, duration_seconds, completion_percentage, is_completed, completed_at')
            .eq('user_id', userId)
            .in('resource_id', resourceIds)

          if (progressError) {
            throw new Error(`Failed to load resource progress: ${progressError.message}`)
          }

          typedProgress = (progressRows ?? []) as RoadmapProgressRow[]
        }
      }

      return buildRoadmapFromRows(typedRoadmap, typedTasks, typedResources, typedProgress)
    }

    const generateAndSaveRoadmap = async (userId: string, replaceExisting: boolean) => {
      if (!supabase) return createDemoRoadmap()

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('target_role, current_level, study_time')
        .eq('id', userId)
        .maybeSingle()

      if (profileError) {
        throw new Error(`Failed to load profile for roadmap generation: ${profileError.message}`)
      }

      const typedProfile = profile as ProfileRow | null
      const { targetRole, currentLevel, studyTime } = resolveRoadmapContext(typedProfile)

      const { data: skillRows, error: skillsError } = await supabase
        .from('user_skills')
        .select('skill_slug, level')
        .eq('user_id', userId)

      if (skillsError) {
        throw new Error(`Failed to load user skills: ${skillsError.message}`)
      }

      const userSkills: UserSkill[] = ((skillRows ?? []) as UserSkillRow[]).map((skill) => {
        const mappedSkill = getSkillById(skill.skill_slug)
        return {
          skillId: mappedSkill?.id ?? skill.skill_slug,
          level: clampSkillLevel(skill.level),
        }
      })

      const skillGap = calculateSkillGap({
        userSkills,
        targetRole,
        requiredSkillIds: getRequiredSkillIds(targetRole),
        niceToHaveSkillIds: getNiceToHaveSkillIds(targetRole),
      })

      let generated: Roadmap
      try {
        generated = await fetchGeneratedRoadmap({
          targetRole,
          currentLevel,
          missingSkills: skillGap.recommendedNextSkills.length > 0
            ? skillGap.recommendedNextSkills
            : skillGap.missingSkills.slice(0, 4),
          studyTime,
        })
      } catch {
        generated = generateFallbackRoadmap({
          targetRole,
          currentLevel,
          missingSkills: skillGap.recommendedNextSkills.length > 0
            ? skillGap.recommendedNextSkills
            : skillGap.missingSkills.slice(0, 4),
          studyTime,
          durationWeeks: 6,
        })
      }

      const roadmapWithResources = withGeneratedResources(generated, targetRole)

      if (replaceExisting) {
        const { error: archiveError } = await supabase
          .from('roadmaps')
          .update({
            is_active: false,
            archived_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId)
          .eq('is_active', true)

        if (archiveError) {
          throw new Error(`Failed to archive old roadmap: ${archiveError.message}`)
        }
      }

      const { data: insertedRoadmap, error: insertRoadmapError } = await supabase
        .from('roadmaps')
        .insert({
          user_id: userId,
          title: roadmapWithResources.title,
          summary: roadmapWithResources.summary,
          duration_weeks: roadmapWithResources.durationWeeks,
          source: roadmapWithResources.source,
          is_active: true,
          context: {
            targetRole,
            currentLevel,
            studyTime,
            targetRoleLabel: getRoleById(targetRole)?.label ?? targetRole,
            finalPortfolioProject: roadmapWithResources.finalPortfolioProject ?? null,
            contentVersion: ROADMAP_CONTENT_VERSION,
          },
        })
        .select('id, title, summary, duration_weeks, source, context, final_project_status, created_at')
        .single()

      if (insertRoadmapError || !insertedRoadmap) {
        throw new Error(`Failed to save roadmap: ${insertRoadmapError?.message ?? 'missing inserted row'}`)
      }

      const inserted = insertedRoadmap as RoadmapRow
      const taskRows = roadmapWithResources.weeks.flatMap((week) =>
        week.tasks.map((task, taskIndex) => ({
          id: crypto.randomUUID(),
          roadmap_id: inserted.id,
          week_number: week.week,
          title: task.title,
          description: task.description,
          skill_related: week.focusSkills,
          difficulty: task.difficulty,
          estimated_time: task.estimatedTime,
          deliverable: task.deliverable,
          status: 'todo',
          task_key: task.id,
          task_order: taskIndex,
          week_title: week.title,
          week_goal: week.goal,
          focus_skills: week.focusSkills,
          mini_project: week.miniProject ?? null,
          quiz_required: true,
          quiz_passed: false,
          project_required: taskRequiresModuleProject(taskIndex, week.tasks.length, Boolean(week.miniProject)),
          project_passed: false,
          requirement_state: 'resources_pending',
        }))
      )

      const { error: taskInsertError } = await supabase
        .from('roadmap_tasks')
        .insert(taskRows)

      if (taskInsertError) {
        throw new Error(`Failed to save roadmap tasks: ${taskInsertError.message}`)
      }

      const taskIdByKey = new Map(taskRows.map((task) => [task.task_key, task.id]))
      const resourceRows = roadmapWithResources.weeks.flatMap((week) =>
        week.tasks.flatMap((task) => {
          const roadmapTaskId = taskIdByKey.get(task.id)
          if (!roadmapTaskId) return []

          return (task.resources ?? []).map((resource, index) => ({
            id: crypto.randomUUID(),
            roadmap_task_id: roadmapTaskId,
            title: resource.title,
            resource_type: resource.resourceType,
            url: resource.url,
            provider: resource.provider,
            estimated_minutes: Math.max(1, resource.estimatedMinutes),
            is_required: resource.isRequired,
            completion_rule: resource.completionRule,
            sort_order: index,
          }))
        })
      )

      if (resourceRows.length > 0) {
        const { error: resourceInsertError } = await supabase
          .from('roadmap_resources')
          .insert(resourceRows)

        if (resourceInsertError) {
          throw new Error(`Failed to save roadmap resources: ${resourceInsertError.message}`)
        }
      }

      try {
        await seedRoadmapAssessments(inserted.id, taskRows.map((task) => ({
          id: task.id,
          task_key: task.task_key,
          title: task.title,
          description: task.description ?? '',
          focus_skills: task.focus_skills ?? [],
          project_required: task.project_required,
        })))
      } catch (seedError) {
        if (IS_DEVELOPMENT) {
          console.warn('[Roadmap] quiz seed failed:', seedError instanceof Error ? seedError.message : seedError)
        }
      }

      const saved = await loadLatestRoadmap(userId)
      return saved ?? roadmapWithResources
    }

    const loadRoadmap = async () => {
      setMode('loading')
      setStatusMessage('Preparing your learning path...')
      setAssessmentPersistenceAvailable(true)

      if (!supabase) {
        if (isActive) {
          setRoadmap(createDemoRoadmap())
          setFinalProjectStatus(null)
          setMode('demo')
          setStatusMessage('Demo mode. Sign in to persist roadmap progress.')
        }
        return
      }

      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()

        if (userError) {
          throw new Error(`Failed to validate session: ${userError.message}`)
        }

        if (!user) {
          if (isActive) {
            setRoadmap(createDemoRoadmap())
            setFinalProjectStatus(null)
            setMode('demo')
            setStatusMessage('No Supabase session. Progress is not persisted in demo mode.')
          }
          return
        }

        setCurrentUserId(user.id)

        // The profile's target role is the source of truth. Read it before loading
        // the saved roadmap so we can detect a stale roadmap built for a prior role.
        const { data: currentProfileRow } = await supabase
          .from('profiles')
          .select('target_role')
          .eq('id', user.id)
          .maybeSingle()
        const currentTargetRole =
          (currentProfileRow as { target_role: TargetRole | null } | null)?.target_role ?? null

        const savedRoadmap = await loadLatestRoadmap(user.id)

        // Handle empty roadmap (0 tasks) - trigger repair
        if (savedRoadmap === null && isActive) {
          setRoadmap(null)
          setMode('repair')
          setStatusMessage('This roadmap was created without tasks. Regenerate it to repair your learning path.')
          return
        }

        // Role drift: the active roadmap was generated for a different target role
        // than the user's current profile. Rebuild it so the modules AND the curated
        // videos/docs match the role the user actually chose.
        if (
          savedRoadmap &&
          currentTargetRole &&
          latestRoadmapStoredRole &&
          currentTargetRole !== latestRoadmapStoredRole
        ) {
          if (isActive) {
            setStatusMessage('Your target role changed. Rebuilding your roadmap to match...')
          }
          const rebuiltRoadmap = await generateAndSaveRoadmap(user.id, true)
          if (isActive) {
            setRoadmap(rebuiltRoadmap)
            setMode('supabase')
            setStatusMessage('Roadmap rebuilt to match your current target role.')
          }
          return
        }

        if (savedRoadmap) {
          const repairReason = getRoadmapRepairReason(savedRoadmap)
          if (repairReason) {
            if (isActive) {
              setRoadmap(null)
              setMode('repair')
              setStatusMessage(`${repairReason} Repair it to generate role-aligned modules, resources, quizzes, and project gates.`)
            }
            return
          }

          if (isActive) {
            setRoadmap(savedRoadmap)
            setMode('supabase')
            setStatusMessage('Loaded saved roadmap from Supabase.')
          }
          return
        }

        if (isActive) {
          setStatusMessage('No saved roadmap found. Generating your first roadmap...')
        }

        const generatedRoadmap = await generateAndSaveRoadmap(user.id, false)

        if (isActive) {
          setRoadmap(generatedRoadmap)
          setMode('supabase')
          setStatusMessage('Generated and saved your first roadmap.')
        }
      } catch (error) {
        if (isActive) {
          logRoadmapError('[Roadmap] load failed:', error)
          const safeMessage = getRoadmapSafeErrorMessage(error)
          const isSchemaError = safeMessage === ROADMAP_SETUP_REQUIRED_MESSAGE
          setRoadmap(isSchemaError ? null : createDemoRoadmap())
          setFinalProjectStatus(null)
          setMode('error')
          setStatusMessage(safeMessage)
        }
      }
    }

    loadRoadmap()

    return () => {
      isActive = false
    }
  }, [supabase])

  const currentTaskLocation = useMemo(() => (
    roadmap ? getCurrentTaskLocation(roadmap) : null
  ), [roadmap])

  const currentModuleIndex = useMemo(() => {
    if (!roadmap || roadmap.weeks.length === 0) return 0
    return currentTaskLocation?.weekIndex ?? roadmap.weeks.length - 1
  }, [currentTaskLocation, roadmap])

  const continueCurrentTask = () => {
    if (!roadmap) return

    const location = currentTaskLocation
    if (!location) return

    setExpandedWeek(location.weekIndex)

    // Open learning workspace
    const week = roadmap.weeks[location.weekIndex]
    const task = week?.tasks.find((t) => t.id === location.taskId)
    if (task && week) {
      setLearningWorkspace({ task, week })
    }

    requestAnimationFrame(() => {
      const weekNode = weekSectionRefs.current[location.weekNumber]
      weekNode?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  const openLearningWorkspace = (task: RoadmapTask, week: RoadmapWeek) => {
    setLearningWorkspace({ task, week })
  }

  const closeLearningWorkspace = () => {
    setLearningWorkspace(null)
  }

  const syncLearningWorkspace = (nextRoadmap: Roadmap, taskId: string) => {
    setLearningWorkspace((previous) => {
      if (!previous || previous.task.id !== taskId) return previous

      const nextSelection = findTaskWithWeek(nextRoadmap, taskId)
      return nextSelection ?? previous
    })
  }

  const persistTaskState = async (task: RoadmapTask) => {
    if (!supabase || !currentUserId || mode !== 'supabase') return

    const requirementState = deriveRequirementState(task)
    const nextStatus = requirementState === 'completed' ? 'completed' : 'todo'

    const updatePayload: {
      status: RoadmapTask['status']
      completed_at: string | null
      mini_exercise_completed: boolean
      deliverable_completed: boolean
      quiz_required?: boolean
      quiz_passed?: boolean
      project_required?: boolean
      project_passed?: boolean
      requirement_state?: RoadmapTaskRequirementState
    } = {
      status: nextStatus,
      completed_at: nextStatus === 'completed' ? (task.completedAt ?? new Date().toISOString()) : null,
      mini_exercise_completed: task.miniExerciseCompleted === true,
      deliverable_completed: task.deliverableCompleted === true,
    }

    if (assessmentPersistenceAvailable) {
      updatePayload.quiz_required = task.quizRequired !== false
      updatePayload.quiz_passed = task.quizPassed === true
      updatePayload.project_required = task.projectRequired === true
      updatePayload.project_passed = task.projectPassed === true
      updatePayload.requirement_state = requirementState
    }

    const { error } = await supabase
      .from('roadmap_tasks')
      .update(updatePayload)
      .eq('id', task.id)

    if (error) {
      throw new Error(`Error saving task: ${error.message}`)
    }
  }

  const persistResourceProgress = async (resource: RoadmapResource) => {
    if (!supabase || !currentUserId || mode !== 'supabase') return
    if (!isUuid(resource.id)) {
      throw new Error('Resource progress cannot be saved before the resource is persisted.')
    }

    const { error } = await supabase
      .from('roadmap_resource_progress')
      .upsert({
        user_id: currentUserId,
        resource_id: resource.id,
        watched_seconds: resource.watchedSeconds,
        duration_seconds: resource.durationSeconds,
        completion_percentage: resource.completionPercentage,
        is_completed: resource.isCompleted,
        completed_at: resource.completedAt,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id,resource_id' })

    if (error) {
      throw new Error(`Error saving resource progress: ${error.message}`)
    }
  }

  const saveUpdatedTask = async (nextRoadmap: Roadmap, taskId: string, resourceId?: string) => {
    const updatedTask = findTask(nextRoadmap, taskId)
    const updatedResource = updatedTask?.resources?.find((resource) => resource.id === resourceId)

    if (!updatedTask) return false

    setSaveState('saving')
    setSaveMessage(resourceId ? 'Saving resource progress...' : 'Saving task progress...')

    try {
      if (updatedResource) {
        await persistResourceProgress(updatedResource)
      }
      await persistTaskState(updatedTask)
      setSaveState('saved')
      setSaveMessage('Saved')
      return true
    } catch (error) {
      logRoadmapError('[Roadmap] progress save failed:', error)
      setSaveState('error')
      setSaveMessage(resourceId ? getProgressSafeErrorMessage(error) : getRoadmapSafeErrorMessage(error))
      return false
    }
  }

  const toggleResource = async (taskId: string, resourceId: string) => {
    if (!roadmap) return

    const now = new Date().toISOString()
    const nextRoadmap = updateRoadmapTask(roadmap, taskId, (task) => {
      const nextResources = (task.resources ?? []).map((resource) => {
        if (resource.id !== resourceId) return resource
        if (isResourceUnavailable(resource)) return resource

        const isCompleted = !resource.isCompleted
        return {
          ...resource,
          isCompleted,
          completionPercentage: isCompleted ? 100 : 0,
          completedAt: isCompleted ? now : null,
        }
      })
      const nextTask = { ...task, resources: nextResources }
      const requirementState = deriveRequirementState(nextTask)
      const status = deriveTaskStatus(nextTask)
      return {
        ...nextTask,
        requirementState,
        status,
        completedAt: status === 'completed' ? now : null,
      }
    })

    const didSave = await saveUpdatedTask(nextRoadmap, taskId, resourceId)
    if (didSave) {
      setRoadmap(nextRoadmap)
      syncLearningWorkspace(nextRoadmap, taskId)
    }
  }

  const reopenTask = async (taskId: string) => {
    if (!roadmap) return

    const nextRoadmap = updateRoadmapTask(roadmap, taskId, (task) => ({
      ...task,
      status: 'todo',
      completedAt: null,
      deliverableCompleted: false,
      quizPassed: false,
      projectPassed: false,
      requirementState: 'resources_pending',
    }))

    const didSave = await saveUpdatedTask(nextRoadmap, taskId)
    if (didSave) {
      setRoadmap(nextRoadmap)
      syncLearningWorkspace(nextRoadmap, taskId)
    }
  }

  const regenerateRoadmap = async () => {
    if (!supabase || !currentUserId) {
      setRoadmap(createDemoRoadmap())
      setMode('demo')
      setStatusMessage('Demo roadmap regenerated locally. Sign in to persist progress.')
      return
    }

    setIsGenerating(true)
    setSaveState('saving')
    setSaveMessage('Generating new roadmap...')

    try {
      const generated = await (async () => {
        const generateAndSave = async () => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('target_role, current_level, study_time')
            .eq('id', currentUserId)
            .maybeSingle()

          const typedProfile = profile as ProfileRow | null
          const { targetRole, currentLevel, studyTime } = resolveRoadmapContext(typedProfile)

          const { data: skillRows } = await supabase
            .from('user_skills')
            .select('skill_slug, level')
            .eq('user_id', currentUserId)

          const userSkills: UserSkill[] = ((skillRows ?? []) as UserSkillRow[]).map((skill) => ({
            skillId: getSkillById(skill.skill_slug)?.id ?? skill.skill_slug,
            level: clampSkillLevel(skill.level),
          }))
          const skillGap = calculateSkillGap({
            userSkills,
            targetRole,
            requiredSkillIds: getRequiredSkillIds(targetRole),
            niceToHaveSkillIds: getNiceToHaveSkillIds(targetRole),
          })
          const missingSkills = skillGap.recommendedNextSkills.length > 0
            ? skillGap.recommendedNextSkills
            : skillGap.missingSkills.slice(0, 4)

          let generatedRoadmap: Roadmap
          try {
            generatedRoadmap = await fetchGeneratedRoadmap({
              targetRole,
              currentLevel,
              missingSkills,
              studyTime,
            })
          } catch {
            generatedRoadmap = generateFallbackRoadmap({
              targetRole,
              currentLevel,
              missingSkills,
              studyTime,
              durationWeeks: 6,
            })
          }

          const roadmapWithResources = withGeneratedResources(generatedRoadmap, targetRole)
          const { error: archiveError } = await supabase
            .from('roadmaps')
            .update({
              is_active: false,
              archived_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('user_id', currentUserId)
            .eq('is_active', true)

          if (archiveError) {
            throw new Error(`Failed to archive old roadmap: ${archiveError.message}`)
          }

          const { data: insertedRoadmap, error: insertRoadmapError } = await supabase
            .from('roadmaps')
            .insert({
              user_id: currentUserId,
              title: roadmapWithResources.title,
              summary: roadmapWithResources.summary,
              duration_weeks: roadmapWithResources.durationWeeks,
              source: roadmapWithResources.source,
              is_active: true,
              context: {
                targetRole,
                currentLevel,
                studyTime,
                targetRoleLabel: getRoleById(targetRole)?.label ?? targetRole,
                finalPortfolioProject: roadmapWithResources.finalPortfolioProject ?? null,
                contentVersion: ROADMAP_CONTENT_VERSION,
              },
            })
            .select('id, title, summary, duration_weeks, source, context, final_project_status, created_at')
            .single()

          if (insertRoadmapError || !insertedRoadmap) {
            throw new Error(`Failed to save regenerated roadmap: ${insertRoadmapError?.message ?? 'missing inserted row'}`)
          }

          const inserted = insertedRoadmap as RoadmapRow
          const taskRows = roadmapWithResources.weeks.flatMap((week) =>
            week.tasks.map((task, taskIndex) => ({
              id: crypto.randomUUID(),
              roadmap_id: inserted.id,
              week_number: week.week,
              title: task.title,
              description: task.description,
              skill_related: week.focusSkills,
              difficulty: task.difficulty,
              estimated_time: task.estimatedTime,
              deliverable: task.deliverable,
              status: 'todo',
              task_key: task.id,
              task_order: taskIndex,
              week_title: week.title,
              week_goal: week.goal,
              focus_skills: week.focusSkills,
              mini_project: week.miniProject ?? null,
              quiz_required: true,
              quiz_passed: false,
              project_required: taskRequiresModuleProject(taskIndex, week.tasks.length, Boolean(week.miniProject)),
              project_passed: false,
              requirement_state: 'resources_pending',
            }))
          )

          const { error: taskInsertError } = await supabase
            .from('roadmap_tasks')
            .insert(taskRows)

          if (taskInsertError) {
            throw new Error(`Failed to save regenerated tasks: ${taskInsertError.message}`)
          }

          const taskIdByKey = new Map(taskRows.map((task) => [task.task_key, task.id]))
          const resourceRows = roadmapWithResources.weeks.flatMap((week) =>
            week.tasks.flatMap((task) => {
              const roadmapTaskId = taskIdByKey.get(task.id)
              if (!roadmapTaskId) return []

              return (task.resources ?? []).map((resource, index) => ({
                id: crypto.randomUUID(),
                roadmap_task_id: roadmapTaskId,
                title: resource.title,
                resource_type: resource.resourceType,
                url: resource.url,
                provider: resource.provider,
                estimated_minutes: Math.max(1, resource.estimatedMinutes),
                is_required: resource.isRequired,
                completion_rule: resource.completionRule,
                sort_order: index,
              }))
            })
          )

          if (resourceRows.length > 0) {
            const { error: resourceInsertError } = await supabase
              .from('roadmap_resources')
              .insert(resourceRows)

            if (resourceInsertError) {
              throw new Error(`Failed to save regenerated resources: ${resourceInsertError.message}`)
            }
          }

          try {
            await seedRoadmapAssessments(inserted.id, taskRows.map((task) => ({
              id: task.id,
              task_key: task.task_key,
              title: task.title,
              description: task.description ?? '',
              focus_skills: task.focus_skills ?? [],
              project_required: task.project_required,
            })))
          } catch (seedError) {
            if (IS_DEVELOPMENT) {
              console.warn('[Roadmap] regenerated quiz seed failed:', seedError instanceof Error ? seedError.message : seedError)
            }
          }

          const { data: tasks } = await supabase
            .from('roadmap_tasks')
            .select('id, roadmap_id, week_number, title, description, skill_related, difficulty, estimated_time, deliverable, status, completed_at, task_key, task_order, week_title, week_goal, focus_skills, mini_project, mini_exercise_completed, deliverable_completed, quiz_required, quiz_passed, project_required, project_passed, requirement_state')
            .eq('roadmap_id', inserted.id)
            .order('week_number', { ascending: true })
            .order('task_order', { ascending: true })

          const typedTasks = (tasks ?? []) as RoadmapTaskRow[]
          const { data: resources } = await supabase
            .from('roadmap_resources')
            .select('id, roadmap_task_id, title, resource_type, url, provider, estimated_minutes, is_required, completion_rule, sort_order')
            .in('roadmap_task_id', typedTasks.map((task) => task.id))
            .order('sort_order', { ascending: true })

          return buildRoadmapFromRows(inserted, typedTasks, (resources ?? []) as RoadmapResourceRow[], [])
        }

        return generateAndSave()
      })()

      setRoadmap(generated)
      setFinalProjectStatus('pending')
      setExpandedWeek(0)
      setMode('supabase')
      setSaveState('saved')
      setSaveMessage('New roadmap saved')
    } catch (error) {
      logRoadmapError('[Roadmap] regenerate failed:', error)
      setSaveState('error')
      setSaveMessage(getRoadmapSafeErrorMessage(error))
    } finally {
      setIsGenerating(false)
    }
  }

  const requestRoadmapRegeneration = () => {
    if (!supabase || !currentUserId) {
      void regenerateRoadmap()
      return
    }

    setIsRegenerateConfirmOpen(true)
  }

  const confirmRoadmapRegeneration = () => {
    setIsRegenerateConfirmOpen(false)
    void regenerateRoadmap()
  }

  const progress = roadmap ? calculateOverallProgress(roadmap) : 0
  const hasFinalProjectSubmission = Boolean(finalProjectStatus && finalProjectStatus !== 'pending')
  const finalProjectUnlocked = progress >= 100
  const canOpenFinalProject = finalProjectUnlocked || hasFinalProjectSubmission

  return (
    <AppShell showBottomNav={true}>
      <GradientBackground variant="roadmap" />
      <ConfirmModal
        isOpen={isRegenerateConfirmOpen}
        onClose={() => setIsRegenerateConfirmOpen(false)}
        onConfirm={confirmRoadmapRegeneration}
        title="Buat roadmap baru?"
        eyebrow="Perubahan roadmap"
        message="Roadmap aktif akan diarsipkan dan diganti dengan roadmap baru yang menyesuaikan profil belajar terbaru."
        details={[
          'Task dan progress pada roadmap baru dimulai dari awal.',
          'Roadmap lama tetap tersimpan sebagai arsip.',
          'Materi baru menyesuaikan role, level, dan skill terbaru.',
        ]}
        confirmText="Ya, buat roadmap baru"
        cancelText="Pertahankan roadmap ini"
        variant="warning"
        isLoading={isGenerating}
      />

      <div className="flex-1 pb-32 lg:pb-8">
        <DashboardHeader
          icon={MapIcon}
          iconColor="pink"
          title="AI Roadmap"
          subtitle="Follow your personalized learning path"
        />

        <Container className="py-6 lg:px-8">
          {mode === 'loading' && (
            <BrutalCard color="white" className="mb-6">
              <p className="font-bold">{statusMessage}</p>
            </BrutalCard>
          )}

          {(mode === 'demo' || mode === 'error') && (
            <BrutalCard color={mode === 'error' ? 'red' : 'yellow'} className="mb-6 flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
              <p className="font-medium">{statusMessage}</p>
            </BrutalCard>
          )}

          {mode === 'repair' && (
            <BrutalCard color="orange" className="mb-6">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-yellow/20 brutal-border brutal-radius flex items-center justify-center shrink-0">
                  <span className="text-3xl">🔧</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-display font-bold text-xl mb-2">Roadmap Repair Needed</h3>
                  <p className="text-black/70 mb-4">
                    {statusMessage}
                  </p>
                  <p className="text-sm text-black/60 mb-4">
                    Repair will archive the current roadmap and regenerate a role-aligned roadmap with validated tasks and resources.
                  </p>
                  <BrutalButton
                    color="black"
                    onClick={repairEmptyRoadmap}
                    loading={isGenerating}
                    disabled={isGenerating}
                  >
                    <Rocket className="w-4 h-4 mr-2" />
                    {isGenerating ? 'Generating new roadmap...' : 'Repair Roadmap'}
                  </BrutalButton>
                </div>
              </div>
            </BrutalCard>
          )}

          {saveMessage && (
            <BrutalCard
              color={saveState === 'error' ? 'red' : saveState === 'saved' ? 'green' : 'white'}
              className="mb-6 flex items-start gap-3"
            >
              {saveState === 'saving' ? (
                <Save className="mt-0.5 h-5 w-5 shrink-0" />
              ) : saveState === 'saved' ? (
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
              ) : (
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
              )}
              <p className="min-w-0 flex-1 font-medium">{saveMessage}</p>
              <button
                type="button"
                onClick={() => {
                  setSaveMessage(null)
                  setSaveState('idle')
                }}
                className="rounded-md border-2 border-black bg-white p-1 transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-black"
                aria-label="Dismiss progress status"
              >
                <X className="h-4 w-4" />
              </button>
            </BrutalCard>
          )}

          {roadmap && (
            <>
              {/* Roadmap header — slim bar with Level/Map view toggle */}
              <BrutalCard color="yellow" className="mb-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0">
                    <h2 className="mb-1 font-display text-2xl font-bold">{roadmap.title}</h2>
                    <p className="text-sm text-black/70">
                      {roadmap.summary?.trim()
                        ? roadmap.summary
                        : 'Work through each module one task at a time, then unlock the quiz and mini project steps.'}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="inline-flex overflow-hidden rounded-md border-2 border-black">
                      <button
                        type="button"
                        onClick={() => setViewMode('level')}
                        className={cn(
                          'px-3 py-1.5 text-xs font-bold transition-colors',
                          viewMode === 'level' ? 'bg-black text-white' : 'bg-white hover:bg-gray-100'
                        )}
                      >
                        Level
                      </button>
                      <button
                        type="button"
                        onClick={() => setViewMode('map')}
                        className={cn(
                          'px-3 py-1.5 text-xs font-bold transition-colors',
                          viewMode === 'map' ? 'bg-black text-white' : 'bg-white hover:bg-gray-100'
                        )}
                      >
                        Map
                      </button>
                    </div>
                    <BrutalButton color="green" onClick={continueCurrentTask} disabled={!currentTaskLocation}>
                      <Target className="mr-2 h-4 w-4" />
                      Continue current task
                    </BrutalButton>
                    <BrutalButton
                      color="black"
                      onClick={requestRoadmapRegeneration}
                      loading={isGenerating}
                      disabled={isGenerating}
                    >
                      <RefreshCw className={cn('mr-2 h-4 w-4', isGenerating && 'animate-spin')} />
                      Regenerate
                    </BrutalButton>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                  <span className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {roadmap.weeks.length}-module roadmap
                  </span>
                  <span className="flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    {roadmap.weeks.reduce((sum, week) => sum + week.tasks.length, 0)} tasks
                  </span>
                  <span className="flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    {formatRoadmapSource(roadmap.source, roadmap.title)}
                  </span>
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    {getCompletedTaskCount(roadmap)}/{roadmap.weeks.reduce((sum, week) => sum + week.tasks.length, 0)} completed
                  </span>
                </div>

                <div className="mt-4">
                  <ScoreBar score={progress} label="Overall Progress" color="black" />
                </div>
              </BrutalCard>

              {/* Quick stats — single-column page convention, matches the rest of the app */}
              <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                <StatCard
                  label="Completed"
                  value={`${getCompletedTaskCount(roadmap)}/${roadmap.weeks.reduce((sum, week) => sum + week.tasks.length, 0)}`}
                  icon={CheckCircle2}
                  iconColor="green"
                />
                <StatCard
                  label="Module"
                  value={`${Math.min(currentModuleIndex + 1, roadmap.weeks.length)}/${roadmap.weeks.length}`}
                  icon={MapIcon}
                  iconColor="blue"
                />
                <StatCard
                  label="Tasks left"
                  value={roadmap.weeks.reduce((sum, week) => sum + week.tasks.length, 0) - getCompletedTaskCount(roadmap)}
                  icon={Target}
                  iconColor="orange"
                />
                <StatCard
                  label="Progress"
                  value={`${progress}%`}
                  icon={Zap}
                  iconColor="yellow"
                />
              </div>

              {/* Learning Workspace Modal - Portal to body, centered on viewport */}
              <AnimatePresence>
                {learningWorkspace && roadmap && (
                  <Portal>
                    {/* Backdrop + Modal together as one unit */}
                    <div
                      className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 lg:p-8"
                      onClick={() => closeLearningWorkspace()}
                    >
                      {/* Modal - centered, scrollable */}
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.2 }}
                        className="relative w-full max-w-5xl max-h-[88vh] bg-white rounded-2xl border-4 border-black shadow-2xl overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <LearningWorkspace
                          task={learningWorkspace.task}
                          week={learningWorkspace.week}
                          roadmap={roadmap}
                          onBack={closeLearningWorkspace}
                          onMarkResourceComplete={toggleResource}
                          onOpenResource={() => {}}
                          onReopenTask={reopenTask}
                        />
                      </motion.div>
                    </div>
                  </Portal>
                )}
              </AnimatePresence>

              {viewMode === 'map' ? (
                <div className="space-y-3">
                  {roadmap.weeks.map((week, weekIndex) => {
                    const weekProgress = calculateWeekProgress(week)
                    const completed = week.tasks.filter((task) => deriveRequirementState(task) === 'completed').length
                    const weekStarted = week.tasks.some(hasTaskProgress)
                    const moduleLocked = weekIndex > currentModuleIndex && !weekStarted
                    return (
                      <button
                        key={week.week}
                        type="button"
                        disabled={moduleLocked}
                        onClick={() => {
                          setExpandedWeek(weekIndex)
                          setViewMode('level')
                        }}
                        className={cn('block w-full text-left', moduleLocked && 'cursor-not-allowed opacity-70')}
                      >
                        <BrutalCard
                          color={weekProgress >= 100 ? 'green' : weekIndex % 2 === 0 ? 'blue' : 'pink'}
                          className="p-4 transition-transform hover:-translate-y-0.5"
                        >
                          <div className="flex items-center gap-4">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center brutal-border brutal-radius bg-white font-bold shadow-brutal-sm">
                              {weekProgress >= 100 ? <CheckCircle2 className="h-5 w-5" /> : week.week}
                            </div>
                            <div className="min-w-0 flex-1">
                              <h3 className="truncate font-display font-bold">{week.title}</h3>
                              <p className="truncate text-sm text-black/70">{week.goal}</p>
                            </div>
                            {moduleLocked && <Lock className="h-4 w-4 shrink-0" />}
                          </div>
                          <div className="mt-3 flex flex-wrap gap-1">
                            {week.tasks.map((task) => (
                              <span
                                key={task.id}
                                title={task.title}
                                className={cn(
                                  'h-3 w-3 rounded-full border-2 border-black',
                                  deriveRequirementState(task) === 'completed' ? 'bg-black' : 'bg-white'
                                )}
                              />
                            ))}
                          </div>
                          <p className="mt-2 text-xs font-bold">
                            {completed}/{week.tasks.length} · {weekProgress}%
                          </p>
                        </BrutalCard>
                      </button>
                    )
                  })}
                </div>
              ) : (
                <ol className="relative space-y-4">
                {roadmap.weeks.map((week, weekIndex) => {
                  const weekProgress = calculateWeekProgress(week)
                  const isExpanded = expandedWeek === weekIndex
                  const completedTasks = week.tasks.filter((task) => deriveRequirementState(task) === 'completed').length
                  const firstIncompleteTaskIndex = week.tasks.findIndex((task) => task.status !== 'completed')
                  const weekStarted = week.tasks.some(hasTaskProgress)
                  const moduleLocked = weekIndex > currentModuleIndex && !weekStarted
                  const moduleComplete = weekProgress >= 100
                  const isCurrentModule = weekIndex === currentModuleIndex && !moduleLocked && !moduleComplete
                  const isLastModule = weekIndex === roadmap.weeks.length - 1

                  return (
                    <motion.li
                      key={week.week}
                      ref={(node) => {
                        weekSectionRefs.current[week.week] = node
                      }}
                      initial={false}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: weekIndex * 0.05 }}
                      className="flex gap-3 sm:gap-4"
                    >
                      {/* Quest spine: numbered station node + connector to the next module */}
                      <div className="flex flex-col items-center" aria-hidden="true">
                        <div
                          className={cn(
                            'flex h-12 w-12 shrink-0 items-center justify-center brutal-border brutal-radius font-display text-xl font-bold',
                            moduleComplete
                              ? 'bg-green shadow-brutal-sm'
                              : moduleLocked
                                ? 'bg-gray-200 text-gray-500'
                                : isCurrentModule
                                  ? 'bg-yellow shadow-brutal-sm'
                                  : 'bg-white'
                          )}
                        >
                          {moduleComplete ? (
                            <CheckCircle2 className="h-6 w-6" />
                          ) : moduleLocked ? (
                            <Lock className="h-5 w-5" />
                          ) : (
                            week.week
                          )}
                        </div>
                        {!isLastModule && (
                          <div
                            className={cn(
                              'mt-2 w-1.5 flex-1 rounded-full',
                              moduleComplete ? 'bg-green' : 'bg-black/20'
                            )}
                          />
                        )}
                      </div>

                      {/* Module card */}
                      <div className="min-w-0 flex-1 pb-2">
                        <BrutalCard
                          color={moduleComplete ? 'green' : isCurrentModule ? 'blue' : 'white'}
                          shadow={isExpanded || isCurrentModule ? 'lg' : 'md'}
                          className="p-0 overflow-hidden"
                        >
                          <button
                            onClick={() => {
                              if (moduleLocked) return
                              setExpandedWeek(isExpanded ? null : weekIndex)
                            }}
                            className={cn(
                              'w-full p-4 flex items-center justify-between gap-3 text-left transition-opacity',
                              moduleLocked && 'cursor-not-allowed opacity-70'
                            )}
                            disabled={moduleLocked}
                          >
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className="font-display text-lg font-bold">{week.title}</h3>
                                {moduleComplete ? (
                                  <StickerBadge variant="completed" size="sm" />
                                ) : moduleLocked ? (
                                  <StickerBadge variant="locked" size="sm" />
                                ) : isCurrentModule ? (
                                  <StickerBadge variant="in-progress" label="Current" size="sm" />
                                ) : null}
                              </div>
                              <p className="truncate text-sm text-black/70">{week.goal}</p>
                            </div>
                            <div className="flex shrink-0 items-center gap-3">
                              <div className="hidden text-right sm:block">
                                <div className="flex items-center justify-end gap-2">
                                  <span className="font-bold">{completedTasks}/{week.tasks.length}</span>
                                  <span className="text-xs text-black/70">{weekProgress}%</span>
                                </div>
                                {moduleLocked && (
                                  <p className="mt-0.5 text-[11px] font-bold text-black/60">
                                    Selesaikan modul sebelumnya dulu.
                                  </p>
                                )}
                              </div>
                              <span className="flex h-9 w-9 items-center justify-center brutal-border brutal-radius bg-white">
                                {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                              </span>
                            </div>
                          </button>

                          <div className="h-2 bg-black/10">
                            <div
                              className="h-full bg-black transition-all duration-300"
                              style={{ width: `${weekProgress}%` }}
                            />
                          </div>

                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                              >
                                <div className="p-4 bg-white border-t-3 border-black">
                                  <div className="mb-4">
                                    <h4 className="font-bold mb-2">Focus Skills</h4>
                                    <div className="flex flex-wrap gap-2">
                                      {week.focusSkills.map((skill) => (
                                        <SkillBadge key={skill} name={skill} color="yellow" />
                                      ))}
                                    </div>
                                  </div>

                                  <div className="space-y-3">
                                    <h4 className="font-bold">Task List</h4>
                                    {week.tasks.map((task, taskIndex) => {
                                      const isCurrentTask = task.id === currentTaskLocation?.taskId
                                      const taskLocked = firstIncompleteTaskIndex >= 0
                                        && taskIndex > firstIncompleteTaskIndex
                                        && !hasTaskProgress(task)

                                      return (
                                        <CompactTaskRow
                                          key={task.id}
                                          task={task}
                                          taskNumber={taskIndex + 1}
                                          isCurrent={isCurrentTask}
                                          isLocked={taskLocked}
                                          onOpenWorkspace={() => openLearningWorkspace(task, week)}
                                        />
                                      )
                                    })}
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </BrutalCard>
                      </div>
                    </motion.li>
                  )
                })}
                </ol>
              )}

              {roadmap.finalPortfolioProject && (
                <motion.div
                  initial={false}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="mt-8"
                >
                  <BrutalCard color={canOpenFinalProject ? 'green' : 'white'} shadow="lg">
                    <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                      <h3 className="font-display font-bold text-xl">
                        Final Portfolio Project
                      </h3>
                      <span
                        className={cn(
                          'rounded-md border-2 border-black px-2 py-1 text-xs font-bold',
                          canOpenFinalProject ? 'bg-green text-black' : 'bg-gray-100 text-gray-700'
                        )}
                      >
                        {canOpenFinalProject ? 'Unlocked' : 'Locked'}
                      </span>
                    </div>
                    <p className="text-black/70 mb-4">
                      {roadmap.finalPortfolioProject.description}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {roadmap.finalPortfolioProject.skillsCovered.map((skill) => (
                        <SkillBadge key={skill} name={skill} color="green" />
                      ))}
                    </div>
                    <div className="mb-3 rounded-md border-2 border-black bg-white p-3 text-sm">
                      <p className="font-bold">Final project review status: {formatProjectStatus(finalProjectStatus)}</p>
                      <p className="text-gray-700">
                        {canOpenFinalProject
                          ? 'Roadmap completion is only fully validated when the final project review passes.'
                          : 'Finish every roadmap task before submitting the final project.'}
                      </p>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-3">
                      {canOpenFinalProject ? (
                        <Link href="/roadmap/final-project">
                          <BrutalButton color="black">
                            {hasFinalProjectSubmission
                              ? 'View Final Project Review'
                              : 'Submit Final Project'}
                          </BrutalButton>
                        </Link>
                      ) : (
                        <BrutalButton color="black" disabled>
                          <Lock className="h-4 w-4" />
                          Finish learning path first
                        </BrutalButton>
                      )}
                      <Link href="/projects">
                        <BrutalButton variant="outline" color="black">
                          View Project Ideas
                        </BrutalButton>
                      </Link>
                    </div>
                  </BrutalCard>
                </motion.div>
              )}
            </>
          )}
        </Container>
      </div>
    </AppShell>
  )
}

function getTaskProgressSnapshot(task: RoadmapTask) {
  const resourceGate = getLearningResourceGate(task)
  const quizRequired = task.quizRequired !== false
  const projectRequired = task.projectRequired === true
  const checklistTotal = 1 + (quizRequired ? 1 : 0) + (projectRequired ? 1 : 0)
  const checklistDone = [
    resourceGate.resourcesComplete,
    quizRequired && task.quizPassed === true,
    projectRequired && task.projectPassed === true,
  ].filter(Boolean).length

  return {
    progressPercent: Math.round((checklistDone / checklistTotal) * 100),
    checklistDone,
    checklistTotal,
  }
}

function CompactTaskRow({
  task,
  taskNumber,
  isCurrent,
  isLocked,
  onOpenWorkspace,
}: {
  task: RoadmapTask
  taskNumber: number
  isCurrent: boolean
  isLocked: boolean
  onOpenWorkspace?: () => void
}) {
  const requirementState = task.requirementState ?? deriveRequirementState(task)
  const { progressPercent, checklistDone, checklistTotal } = getTaskProgressSnapshot(task)
  const difficultyStyles: Record<RoadmapTask['difficulty'], string> = {
    easy: 'text-green',
    medium: 'text-yellow',
    hard: 'text-red',
  }
  const gate = getLearningResourceGate(task)
  const nextAction = getNextActionText(task, gate)

  return (
    <div
      className={cn(
        'rounded-md border-2 border-black bg-white p-3 transition-all sm:p-4',
        isCurrent && 'ring-2 ring-black',
        isLocked && 'bg-gray-100'
      )}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <span className="rounded-md border-2 border-black bg-yellow px-2 py-0.5 text-xs font-bold">
              Task {taskNumber}
            </span>
            {isCurrent && <StickerBadge variant="in-progress" label="Current Task" size="sm" />}
            {isLocked && <StickerBadge variant="locked" size="sm" />}
          </div>
          <p className="font-bold">{task.title}</p>
          <p className="mt-1 line-clamp-2 text-sm text-gray-700">{task.description}</p>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs font-medium text-gray-700">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {task.estimatedTime}
            </span>
            <span className={cn('uppercase', difficultyStyles[task.difficulty])}>{task.difficulty}</span>
            <span className="rounded-md border-2 border-black bg-white px-2 py-0.5 text-[11px] font-bold">
              {formatRequirementState(requirementState)}
            </span>
          </div>
          <p className="mt-1 text-xs text-black/60">
            Next: {nextAction}
          </p>
        </div>
        <div className="w-full sm:w-48 sm:shrink-0">
          <div className="mb-2 h-2 overflow-hidden rounded border-2 border-black bg-gray-200">
            <div className="h-full bg-black transition-all duration-200" style={{ width: `${progressPercent}%` }} />
          </div>
          <p className="mb-2 text-xs font-medium text-gray-700">
            Checklist: {checklistDone}/{checklistTotal}
          </p>
          {onOpenWorkspace && (
            <BrutalButton size="sm" color="green" className="w-full" onClick={onOpenWorkspace}>
              <PlayCircle className="h-4 w-4" />
              Learn
            </BrutalButton>
          )}
        </div>
      </div>
    </div>
  )
}
