'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { AppShell, Container } from '@/components/layout'
import { GradientBackground } from '@/components/layout'
import { DashboardHeader } from '@/components/layout/dashboard-header'
import { BrutalCard, BrutalButton, SkillBadge, ScoreBar } from '@/components/brutal'
import { CatMascot } from '@/components/illustrations/cat-mascot'
import { PageScene } from '@/components/illustrations/page-scene'
import { generateFallbackRoadmap } from '@/lib/ai'
import { getCuratedResourcesForTask, isResourceLikelyRelevant } from '@/lib/roadmap/resources'
import { calculateSkillGap } from '@/lib/scoring/skill-gap'
import { getRequiredSkillIds, getNiceToHaveSkillIds, getRoleById, getSkillById } from '@/lib/constants'
import { createSupabaseBrowserClient } from '@/lib/supabase/browser'
import { initializeUserProfile } from '@/lib/user/profile'
import { cn } from '@/lib/utils'
import {
  NowLearningPanel,
  LearningWorkspace,
  ResourceAccordion,
} from '@/components/roadmap'
import { Portal } from '@/components/ui/portal'
import {
  AlertCircle,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Circle,
  Clock,
  ExternalLink,
  FileText,
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
const IS_DEVELOPMENT = process.env.NODE_ENV === 'development'

const ROADMAP_SETUP_REQUIRED_MESSAGE = 'Roadmap persistence schema is not ready in Supabase. Apply migrations 005_roadmap_persistence.sql and 006_learning_assessment_system.sql, then reload this page.'
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

function isResourceUnavailable(resource: Pick<RoadmapResource, 'completionRule' | 'url'>) {
  return resource.completionRule.startsWith('resource_unavailable') || resource.url.trim().length === 0
}

function getLearningResourceGate(task: RoadmapTask) {
  const resources = task.resources ?? []
  const validVideoResources = resources.filter(
    (resource) => resource.resourceType === 'youtube' && !isResourceUnavailable(resource)
  )
  const validDocsResources = resources.filter(
    (resource) => (resource.resourceType === 'docs' || resource.resourceType === 'article') && !isResourceUnavailable(resource)
  )

  const completedVideos = validVideoResources.filter((resource) => resource.isCompleted).length
  const completedDocs = validDocsResources.filter((resource) => resource.isCompleted).length

  const hasVideoResource = validVideoResources.length > 0
  const hasDocsResource = validDocsResources.length > 0
  const videoUnlocked = hasVideoResource && completedVideos >= 1
  const docsUnlocked = hasDocsResource && completedDocs >= 1
  const resourcesComplete = videoUnlocked && docsUnlocked

  return {
    resourcesComplete,
    hasVideoResource,
    hasDocsResource,
    completedVideos,
    completedDocs,
    unavailableCount: resources.filter(isResourceUnavailable).length,
  }
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
  const localProfile = typeof window !== 'undefined' ? initializeUserProfile() : null
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

function hasRequiredResourcesCompleted(task: RoadmapTask) {
  return getLearningResourceGate(task).resourcesComplete
}

function deriveRequirementState(task: RoadmapTask): RoadmapTaskRequirementState {
  const requiredResourcesComplete = hasRequiredResourcesCompleted(task)
  const quizRequired = task.quizRequired !== false
  const quizPassed = task.quizPassed === true
  const projectRequired = task.projectRequired === true
  const projectPassed = task.projectPassed === true

  if (!requiredResourcesComplete) {
    return 'resources_pending'
  }

  if (!quizRequired) {
    return projectRequired
      ? (projectPassed ? 'completed' : 'project_pending')
      : 'completed'
  }

  if (!quizPassed) {
    return 'quiz_pending'
  }

  if (projectRequired && !projectPassed) {
    return 'project_pending'
  }

  return 'completed'
}

function taskCanBeCompleted(task: RoadmapTask) {
  return deriveRequirementState(task) === 'completed'
}

function deriveTaskStatus(task: RoadmapTask): RoadmapTask['status'] {
  return taskCanBeCompleted(task) ? 'completed' : 'todo'
}

function getRequirementHint(task: RoadmapTask) {
  const resourceGate = getLearningResourceGate(task)
  const requiredResourcesComplete = resourceGate.resourcesComplete
  const quizRequired = task.quizRequired !== false
  const quizPassed = task.quizPassed === true
  const projectRequired = task.projectRequired === true
  const projectPassed = task.projectPassed === true

  if (!resourceGate.hasVideoResource || !resourceGate.hasDocsResource || resourceGate.unavailableCount > 0) {
    return 'Resources are being prepared for this task.'
  }
  if (!requiredResourcesComplete) {
    return `Complete 1 video and 1 documentation resource to unlock quiz. (Video ${resourceGate.completedVideos}/1, Docs ${resourceGate.completedDocs}/1)`
  }
  if (quizRequired && !quizPassed) return 'Pass the quiz to unlock mini project.'
  if (projectRequired && !projectPassed) return 'Submit mini project to unlock the next task.'
  return 'All requirements completed.'
}

function getQuizLockReason(task: RoadmapTask) {
  const gate = getLearningResourceGate(task)
  if (!gate.hasVideoResource || !gate.hasDocsResource || gate.unavailableCount > 0) {
    return 'Resources are being prepared for this task.'
  }
  if (!gate.resourcesComplete) {
    return `Complete 1 video and 1 documentation resource to unlock quiz. (Video ${gate.completedVideos}/1, Docs ${gate.completedDocs}/1)`
  }
  return null
}

function getProjectLockReason(task: RoadmapTask, hasMiniProject: boolean) {
  if (!hasMiniProject && task.projectRequired !== true) {
    return 'This task has no mini project requirement.'
  }

  const quizLock = getQuizLockReason(task)
  if (quizLock) {
    return quizLock
  }

  if (task.quizRequired !== false && !task.quizPassed) {
    return 'Pass the quiz to unlock mini project.'
  }

  return null
}

function formatRoadmapSource(source: Roadmap['source'], title: string) {
  if (source === 'ai') return 'AI Generated'
  if (title.toLowerCase().includes('backend')) return 'Backend Roadmap Template'
  return 'Roadmap Template'
}

function formatRequirementState(state: RoadmapTaskRequirementState | null | undefined) {
  const normalized = state ?? 'resources_pending'
  const labels: Record<RoadmapTaskRequirementState, string> = {
    resources_pending: 'Resources not completed',
    resources_completed: 'Resources completed',
    quiz_pending: 'Quiz not completed',
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

function getDefaultCurrentTask(week: RoadmapWeek) {
  return week.tasks.find((task) => task.status !== 'completed') ?? week.tasks[0] ?? null
}

function hasTaskProgress(task: RoadmapTask) {
  const resourceProgress = (task.resources ?? []).some((resource) => resource.isCompleted || resource.watchedSeconds > 0)
  return resourceProgress || task.quizPassed === true || task.projectPassed === true || task.status === 'completed'
}

function getNextActionLabel(roadmap: Roadmap, weekIndex: number, taskId: string): string {
  const week = roadmap.weeks[weekIndex]
  const task = week?.tasks.find((t) => t.id === taskId)
  if (!task) return 'Select a task'

  const gate = getLearningResourceGate(task)
  return getNextActionText(task, gate)
}

function getNextActionText(task: RoadmapTask, gate: ReturnType<typeof getLearningResourceGate>): string {
  const requirementState = deriveRequirementState(task)

  if (requirementState === 'completed') return 'Task completed!'
  if (!gate.resourcesComplete) {
    if (gate.completedVideos < 1) return 'Watch a video lesson'
    if (gate.completedDocs < 1) return 'Read documentation'
    return 'Complete learning resources'
  }
  if (!task.quizPassed && task.quizRequired !== false) return 'Take the quiz'
  if (!task.projectPassed && task.projectRequired === true) return 'Submit mini project'
  return 'Continue learning'
}

function getCurrentTaskLocation(roadmap: Roadmap) {
  for (let weekIndex = 0; weekIndex < roadmap.weeks.length; weekIndex += 1) {
    const week = roadmap.weeks[weekIndex]
    const currentTask = getDefaultCurrentTask(week)
    if (currentTask && currentTask.status !== 'completed') {
      return {
        weekIndex,
        weekNumber: week.week,
        taskId: currentTask.id,
      }
    }
  }

  const lastWeek = roadmap.weeks[roadmap.weeks.length - 1]
  const lastTask = lastWeek?.tasks[lastWeek.tasks.length - 1]
  if (!lastWeek || !lastTask) return null

  return {
    weekIndex: roadmap.weeks.length - 1,
    weekNumber: lastWeek.week,
    taskId: lastTask.id,
  }
}

function isBackendRoadmapMismatch(roadmap: Roadmap) {
  const title = roadmap.title.toLowerCase()
  if (!title.includes('backend')) {
    return false
  }

  const source = roadmap.weeks
    .flatMap((week) => [
      week.title,
      week.goal,
      ...week.focusSkills,
      ...week.tasks.map((task) => `${task.title} ${task.description} ${task.deliverable}`),
    ])
    .join(' ')
    .toLowerCase()

  const frontendHints = ['react', 'next.js', 'nextjs', 'css', 'html', 'tailwind', 'state management', 'ui component']
  const backendHints = ['node', 'express', 'rest api', 'postgres', 'sql', 'auth', 'jwt', 'bcrypt', 'middleware', 'prisma']

  const frontendHits = frontendHints.filter((hint) => source.includes(hint)).length
  const backendHits = backendHints.filter((hint) => source.includes(hint)).length

  return frontendHits >= 3 && frontendHits >= backendHits
}

function calculateWeekProgress(week: Roadmap['weeks'][0]) {
  const completed = week.tasks.filter((task) => task.status === 'completed').length
  return week.tasks.length > 0 ? Math.round((completed / week.tasks.length) * 100) : 0
}

function calculateOverallProgress(roadmap: Roadmap) {
  const totalTasks = roadmap.weeks.reduce((sum, week) => sum + week.tasks.length, 0)
  const completedTasks = roadmap.weeks.reduce(
    (sum, week) => sum + week.tasks.filter((task) => task.status === 'completed').length,
    0
  )

  return totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
}

function findTask(roadmap: Roadmap, taskId: string) {
  return roadmap.weeks.flatMap((week) => week.tasks).find((task) => task.id === taskId) ?? null
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
  const usedGeneratedResourceUrls = new Set<string>()
  const roadmapTargetRole = roadmapRow.context?.targetRole ?? null

  for (const resource of resourceRows) {
    const progress = progressByResourceId.get(resource.id)
    const mapped: RoadmapResource = {
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

    const taskResources = resourcesByTaskId.get(resource.roadmap_task_id) ?? []
    taskResources.push(mapped)
    resourcesByTaskId.set(resource.roadmap_task_id, taskResources)
  }

  const weeks = new Map<number, RoadmapWeek>()

  for (const row of taskRows) {
    const weekNumber = row.week_number
    const existingWeek = weeks.get(weekNumber)
    const weekTitle = row.week_title ?? `Week ${weekNumber}`
    const weekGoal = row.week_goal ?? 'Complete this week of the roadmap'
    const focusSkills = row.focus_skills ?? row.skill_related ?? []
    const baseTask: RoadmapTask = {
      id: row.id,
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

    const fallbackWeekContext: RoadmapWeek = {
      week: weekNumber,
      title: weekTitle,
      goal: weekGoal,
      focusSkills,
      tasks: [],
      miniProject: row.mini_project ?? undefined,
    }

    const loadedResources = resourcesByTaskId.get(row.id) ?? []
    const uniqueLoadedResources = loadedResources.filter((resource, index, all) =>
      all.findIndex((item) => item.url === resource.url && item.title === resource.title) === index
    )
    const relevantResources = uniqueLoadedResources.filter((resource) =>
      isResourceLikelyRelevant(baseTask, fallbackWeekContext, resource, roadmapTargetRole)
    )

    const generatedFallbackResources = getCuratedResourcesForTask(baseTask, fallbackWeekContext, {
      targetRole: roadmapTargetRole,
      usedUrls: usedGeneratedResourceUrls,
    }).map((resource, index) => ({
      id: `${row.id}-generated-resource-${index + 1}`,
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
    }))

    const task: RoadmapTask = {
      ...baseTask,
      resources: relevantResources.length > 0 ? relevantResources : generatedFallbackResources,
    }

    if (existingWeek) {
      existingWeek.tasks.push(task)
      continue
    }

    weeks.set(weekNumber, {
      week: weekNumber,
      title: weekTitle,
      goal: weekGoal,
      focusSkills,
      tasks: [task],
      miniProject: row.mini_project ?? undefined,
    })
  }

  return {
    id: roadmapRow.id,
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

  return error.message || fallback
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
  const [mode, setMode] = useState<RoadmapMode>('loading')
  const [statusMessage, setStatusMessage] = useState('Preparing your learning path...')
  const [saveState, setSaveState] = useState<SaveState>('idle')
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [assessmentPersistenceAvailable, setAssessmentPersistenceAvailable] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [finalProjectStatus, setFinalProjectStatus] = useState<RoadmapProjectReviewStatus | null>(null)
  const [focusedTaskByWeek, setFocusedTaskByWeek] = useState<Record<number, string>>({})
  const [openedResources, setOpenedResources] = useState<Record<string, boolean>>({})
  const [learningWorkspace, setLearningWorkspace] = useState<{
    task: RoadmapTask
    week: RoadmapWeek
  } | null>(null)
  const weekSectionRefs = useRef<Record<number, HTMLDivElement | null>>({})

  // Repair callback for empty-task roadmaps
  const repairEmptyRoadmap = async () => {
    if (!supabase || !currentUserId) return
    await regenerateRoadmap()
  }

  const seedRoadmapAssessments = async (roadmapId: string, taskRows: Array<{
    id: string
    title: string
    description: string
    focus_skills: string[] | null
    mini_project: RoadmapWeek['miniProject'] | null
    deliverable: string
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
          title: task.title,
          description: task.description,
          focusSkills: task.focus_skills ?? [],
          requiresProject: Boolean(task.mini_project) || /project|deploy|portfolio/i.test(`${task.title} ${task.deliverable}`),
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

    const loadLatestRoadmap = async (userId: string) => {
      if (!supabase) return null

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
        return null
      }

      const typedRoadmap = roadmapRow as RoadmapRow
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

        typedResources = (resourceRows ?? []) as RoadmapResourceRow[]
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
          project_required: false,
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
            estimated_minutes: resource.estimatedMinutes,
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
          title: task.title,
          description: task.description ?? '',
          focus_skills: task.focus_skills ?? [],
          mini_project: task.mini_project ?? null,
          deliverable: task.deliverable ?? '',
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
        const savedRoadmap = await loadLatestRoadmap(user.id)

        // Handle empty roadmap (0 tasks) - trigger repair
        if (savedRoadmap === null && isActive) {
          setRoadmap(null)
          setMode('repair')
          setStatusMessage('This roadmap was created without tasks. Regenerate it to repair your learning path.')
          return
        }

        if (savedRoadmap) {
          if (isBackendRoadmapMismatch(savedRoadmap)) {
            if (isActive) {
              setRoadmap(null)
              setMode('repair')
              setStatusMessage('Detected roadmap-role mismatch for Backend Developer. Click repair to regenerate backend-aligned modules and resources.')
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
          const safeMessage = getRoadmapSafeErrorMessage(error)
          const isSchemaError = safeMessage === ROADMAP_SETUP_REQUIRED_MESSAGE
          setRoadmap(isSchemaError ? null : createDemoRoadmap())
          setFinalProjectStatus(null)
          setMode('error')
          setStatusMessage(isSchemaError
            ? safeMessage
            : (error instanceof Error ? error.message : 'Roadmap could not be loaded. Try again.'))
        }
      }
    }

    loadRoadmap()

    return () => {
      isActive = false
    }
  }, [supabase])

  useEffect(() => {
    if (!roadmap) return

    setFocusedTaskByWeek((previous) => {
      const next = { ...previous }
      let changed = false

      roadmap.weeks.forEach((week) => {
        const defaultTask = getDefaultCurrentTask(week)
        if (!defaultTask) return

        const focusedTaskId = previous[week.week]
        const stillExists = focusedTaskId
          ? week.tasks.some((task) => task.id === focusedTaskId)
          : false

        if (!stillExists) {
          next[week.week] = defaultTask.id
          changed = true
        }
      })

      return changed ? next : previous
    })
  }, [roadmap])

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
    setFocusedTaskByWeek((previous) => ({
      ...previous,
      [location.weekNumber]: location.taskId,
    }))

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

    if (!updatedTask) return

    setSaveState('saving')
    setSaveMessage(resourceId ? 'Saving resource progress...' : 'Saving task progress...')

    try {
      if (updatedResource) {
        await persistResourceProgress(updatedResource)
      }
      await persistTaskState(updatedTask)
      setSaveState('saved')
      setSaveMessage('Saved')
    } catch (error) {
      setSaveState('error')
      setSaveMessage(error instanceof Error ? error.message : 'Error saving task')
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

    setRoadmap(nextRoadmap)
    await saveUpdatedTask(nextRoadmap, taskId, resourceId)
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

    setRoadmap(nextRoadmap)
    await saveUpdatedTask(nextRoadmap, taskId)
  }

  const regenerateRoadmap = async () => {
    if (!supabase || !currentUserId) {
      setRoadmap(createDemoRoadmap())
      setMode('demo')
      setStatusMessage('Demo roadmap regenerated locally. Sign in to persist progress.')
      return
    }

    const confirmed = window.confirm('Replace your current roadmap? This archives the current roadmap and creates a new one with fresh tasks and progress.')
    if (!confirmed) return

    setIsGenerating(true)
    setSaveState('saving')
    setSaveMessage('Generating new roadmap...')

    // Archive current active roadmap before regenerating
    try {
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
        // Non-fatal - continue with generation
        console.warn('[Roadmap] Failed to archive old roadmap:', archiveError.message)
      }
    } catch (archiveWarning) {
      console.warn('[Roadmap] Archive warning:', archiveWarning instanceof Error ? archiveWarning.message : archiveWarning)
    }

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
              project_required: false,
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
                estimated_minutes: resource.estimatedMinutes,
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
              title: task.title,
              description: task.description ?? '',
              focus_skills: task.focus_skills ?? [],
              mini_project: task.mini_project ?? null,
              deliverable: task.deliverable ?? '',
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
      setSaveState('error')
      setSaveMessage(getRoadmapSafeErrorMessage(error))
    } finally {
      setIsGenerating(false)
    }
  }

  const progress = roadmap ? calculateOverallProgress(roadmap) : 0

  return (
    <AppShell showBottomNav={true}>
      <GradientBackground variant="roadmap" />

      <div className="flex-1 pb-32 lg:pb-8">
        <DashboardHeader
          icon={MapIcon}
          iconColor="pink"
          title="AI Roadmap"
          subtitle="Follow your personalized learning path"
        />

        <Container className="py-6">
          <PageScene variant="roadmap" className="mb-6" />

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
              <p className="font-medium">{saveMessage}</p>
            </BrutalCard>
          )}

          {roadmap && (
            <>
              {/* Now Learning Panel */}
              {currentTaskLocation && !learningWorkspace && (
                <NowLearningPanel
                  roadmap={roadmap}
                  currentWeek={roadmap.weeks[currentTaskLocation.weekIndex]}
                  currentTask={
                    roadmap.weeks[currentTaskLocation.weekIndex].tasks.find(
                      (t) => t.id === currentTaskLocation.taskId
                    )!
                  }
                  nextAction={getNextActionLabel(roadmap, currentTaskLocation.weekIndex, currentTaskLocation.taskId)}
                  onContinue={continueCurrentTask}
                  className="mb-6"
                />
              )}

              <BrutalCard color="yellow" className="mb-6">
                <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <h2 className="mb-1 font-display text-2xl font-bold">{roadmap.title}</h2>
                    <p className="text-black/70">
                      Build backend skills one level at a time. Focus on the current task, then unlock quiz and mini project steps.
                    </p>
                    <p className="mt-2 text-sm font-bold text-black/70">
                      {mode === 'supabase'
                        ? 'Progress is saved to Supabase.'
                        : 'Roadmap template active. Sign in to preserve progress across devices.'}
                    </p>
                    <div className="mt-3 inline-flex items-center gap-2 rounded-md border-2 border-black bg-white px-2 py-1">
                      <CatMascot className="h-10 w-10" mood="cheer" />
                      <span className="text-xs font-bold">Follow the current task to keep momentum.</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <BrutalButton
                      color="green"
                      onClick={continueCurrentTask}
                      disabled={!currentTaskLocation}
                    >
                      <Target className="mr-2 h-4 w-4" />
                      Continue current task
                    </BrutalButton>
                    <BrutalButton
                      color="black"
                      onClick={regenerateRoadmap}
                      loading={isGenerating}
                      disabled={isGenerating}
                    >
                      <RefreshCw className={cn('mr-2 h-4 w-4', isGenerating && 'animate-spin')} />
                      Regenerate
                    </BrutalButton>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    <span>{roadmap.weeks.length}-module learning roadmap</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    <span>{roadmap.weeks.reduce((sum, week) => sum + week.tasks.length, 0)} tasks</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    <span>{formatRoadmapSource(roadmap.source, roadmap.title)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5" />
                    <span>
                      {roadmap.weeks.reduce((sum, week) => sum + week.tasks.filter((task) => task.status === 'completed').length, 0)}
                      /{roadmap.weeks.reduce((sum, week) => sum + week.tasks.length, 0)} completed
                    </span>
                  </div>
                </div>

                <div className="mt-4">
                  <ScoreBar
                    score={progress}
                    label="Overall Progress"
                    color="black"
                  />
                </div>
              </BrutalCard>

              {/* Learning Workspace Modal - Portal to body, centered on viewport */}
              <AnimatePresence>
                {learningWorkspace && roadmap && (
                  <Portal>
                    {/* Backdrop + Modal together as one unit */}
                    <div
                      className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
                      onClick={() => closeLearningWorkspace()}
                    >
                      {/* Modal - centered, scrollable */}
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.2 }}
                        className="relative w-full max-w-4xl max-h-[88vh] bg-white rounded-2xl border-4 border-black shadow-2xl overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <LearningWorkspace
                          task={learningWorkspace.task}
                          week={learningWorkspace.week}
                          roadmap={roadmap}
                          onBack={closeLearningWorkspace}
                          onMarkResourceComplete={toggleResource}
                          onOpenResource={(resourceId) => {
                            setOpenedResources((prev) => ({
                              ...prev,
                              [resourceId]: true,
                            }))
                          }}
                          onReopenTask={reopenTask}
                        />
                      </motion.div>
                    </div>
                  </Portal>
                )}
              </AnimatePresence>

              <div className="space-y-4">
                {roadmap.weeks.map((week, weekIndex) => {
                  const weekProgress = calculateWeekProgress(week)
                  const isExpanded = expandedWeek === weekIndex
                  const completedTasks = week.tasks.filter((task) => task.status === 'completed').length
                  const defaultCurrentTask = getDefaultCurrentTask(week)
                  const focusedTaskId = focusedTaskByWeek[week.week] ?? defaultCurrentTask?.id ?? null
                  const focusedTask = week.tasks.find((task) => task.id === focusedTaskId) ?? defaultCurrentTask
                  const firstIncompleteTaskIndex = week.tasks.findIndex((task) => task.status !== 'completed')
                  const weekStarted = week.tasks.some(hasTaskProgress)
                  const moduleLocked = weekIndex > currentModuleIndex && !weekStarted
                  const focusedTaskIndex = focusedTask ? week.tasks.findIndex((task) => task.id === focusedTask.id) : -1
                  const focusedTaskLocked = focusedTaskIndex >= 0
                    && firstIncompleteTaskIndex >= 0
                    && focusedTaskIndex > firstIncompleteTaskIndex
                    && !hasTaskProgress(focusedTask)

                  return (
                    <motion.div
                      key={week.week}
                      ref={(node) => {
                        weekSectionRefs.current[week.week] = node
                      }}
                      initial={false}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: weekIndex * 0.05 }}
                    >
                      <BrutalCard color={weekIndex % 2 === 0 ? 'blue' : 'pink'} className="p-0 overflow-hidden">
                        <button
                          onClick={() => {
                            if (moduleLocked) return
                            setExpandedWeek(isExpanded ? null : weekIndex)
                          }}
                          className={cn(
                            'w-full p-4 flex items-center justify-between text-left transition-opacity',
                            moduleLocked && 'cursor-not-allowed opacity-70'
                          )}
                          disabled={moduleLocked}
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white brutal-border brutal-radius flex items-center justify-center font-bold text-xl">
                              {week.week}
                            </div>
                            <div>
                              <h3 className="font-display font-bold text-lg">{week.title}</h3>
                              <p className="text-sm text-black/70">{week.goal}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="font-bold">{completedTasks}/{week.tasks.length}</p>
                              <p className="text-xs text-black/70">{weekProgress}% complete</p>
                              {moduleLocked && (
                                <p className="mt-1 text-[11px] font-bold text-black/60">
                                  Complete the current module to unlock the next one.
                                </p>
                              )}
                            </div>
                            {isExpanded ? (
                              <ChevronUp className="w-5 h-5" />
                            ) : (
                              <ChevronDown className="w-5 h-5" />
                            )}
                          </div>
                        </button>

                        <div className="h-2 bg-black/10">
                          <div
                            className="h-full bg-black transition-all duration-300"
                            style={{ width: `${weekProgress}%` }}
                          />
                        </div>

                        <AnimatePresence>
                          {isExpanded && focusedTask && (
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

                                <div className="mb-4 space-y-3">
                                  <h4 className="font-bold">Task List</h4>
                                  {week.tasks.map((task, taskIndex) => {
                                    const isCurrentTask = focusedTask.id === task.id
                                    const taskLocked = firstIncompleteTaskIndex >= 0
                                      && taskIndex > firstIncompleteTaskIndex
                                      && !hasTaskProgress(task)

                                    return (
                                      <CompactTaskRow
                                        key={task.id}
                                        task={task}
                                        taskNumber={taskIndex + 1}
                                        isFocused={isCurrentTask}
                                        isLocked={taskLocked}
                                        hasMiniProject={Boolean(week.miniProject)}
                                        onFocus={() => {
                                          setFocusedTaskByWeek((previous) => ({
                                            ...previous,
                                            [week.week]: task.id,
                                          }))
                                        }}
                                        onOpenWorkspace={() => openLearningWorkspace(task, week)}
                                      />
                                    )
                                  })}
                                </div>

                                <TaskDetailPanel
                                  task={focusedTask}
                                  week={week}
                                  isCurrentTask
                                  isTaskLocked={focusedTaskLocked}
                                  lockedReason={focusedTaskLocked ? 'Complete the previous task to unlock this.' : null}
                                  openedResources={openedResources}
                                  onOpenResource={(resourceId) => {
                                    setOpenedResources((previous) => ({
                                      ...previous,
                                      [resourceId]: true,
                                    }))
                                  }}
                                  onToggleResource={toggleResource}
                                  onReopen={reopenTask}
                                />

                                {week.miniProject && (
                                  <div className="mt-4 rounded-md border-2 border-black bg-gray-50 p-4">
                                    <h4 className="font-bold mb-2">Mini Project</h4>
                                    <p className="font-medium mb-2">{week.miniProject.title}</p>
                                    <p className="text-sm text-gray-600 mb-3">
                                      {week.miniProject.description}
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                      {week.miniProject.skillsCovered.map((skill) => (
                                        <SkillBadge key={skill} name={skill} size="sm" />
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </BrutalCard>
                    </motion.div>
                  )
                })}
              </div>

              {roadmap.finalPortfolioProject && (
                <motion.div
                  initial={false}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="mt-8"
                >
                  <BrutalCard color="green" shadow="lg">
                    <h3 className="font-display font-bold text-xl mb-2">
                      Final Portfolio Project
                    </h3>
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
                        Roadmap completion is only fully validated when the final project review passes.
                      </p>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-3">
                      <Link href="/roadmap/final-project">
                        <BrutalButton color="black">
                          {finalProjectStatus && finalProjectStatus !== 'pending'
                            ? 'View Final Project Review'
                            : 'Submit Final Project'}
                        </BrutalButton>
                      </Link>
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

function getYouTubeVideoId(url: string) {
  try {
    const parsed = new URL(url)
    let videoId: string | null = null

    if (parsed.hostname.includes('youtu.be')) {
      videoId = parsed.pathname.replace('/', '')
    } else if (parsed.pathname.startsWith('/watch')) {
      videoId = parsed.searchParams.get('v')
    } else if (parsed.pathname.startsWith('/shorts/')) {
      videoId = parsed.pathname.split('/')[2] ?? null
    } else if (parsed.pathname.startsWith('/embed/')) {
      videoId = parsed.pathname.split('/')[2] ?? null
    }

    if (!videoId) return null
    return videoId
  } catch {
    return null
  }
}

function getYouTubeThumbnailUrl(url: string) {
  const videoId = getYouTubeVideoId(url)
  if (!videoId) return null
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
}

function getResourceTypeLabel(resourceType: RoadmapResource['resourceType']) {
  if (resourceType === 'youtube') return 'Video'
  if (resourceType === 'docs' || resourceType === 'article') return 'Docs'
  return 'Practice'
}

function getResourceStatusLabel(resource: RoadmapResource, openedResources: Record<string, boolean>) {
  if (resource.isCompleted) {
    return resource.resourceType === 'youtube' ? 'Watched' : 'Completed'
  }

  if (openedResources[resource.id] || resource.watchedSeconds > 0 || resource.completionPercentage > 0) {
    return 'Opened'
  }

  return 'Not started'
}

function getRequirementBadgeStyles(state: RoadmapTaskRequirementState) {
  const styles: Record<RoadmapTaskRequirementState, string> = {
    resources_pending: 'bg-yellow/20 text-black',
    resources_completed: 'bg-blue/20 text-black',
    quiz_pending: 'bg-orange/20 text-black',
    quiz_passed: 'bg-green/20 text-black',
    project_pending: 'bg-pink/20 text-black',
    project_passed: 'bg-green/20 text-black',
    completed: 'bg-green text-black',
  }

  return styles[state]
}

function getTaskProgressSnapshot(task: RoadmapTask, hasMiniProject: boolean) {
  const resourceGate = getLearningResourceGate(task)
  const quizRequired = task.quizRequired !== false
  const projectRequired = task.projectRequired === true || hasMiniProject
  const checklistTotal = projectRequired ? 3 : 2
  const checklistDone = [
    resourceGate.resourcesComplete,
    !quizRequired || task.quizPassed === true,
    !projectRequired || task.projectPassed === true,
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
  isFocused,
  isLocked,
  hasMiniProject,
  onFocus,
  onOpenWorkspace,
}: {
  task: RoadmapTask
  taskNumber: number
  isFocused: boolean
  isLocked: boolean
  hasMiniProject: boolean
  onFocus: () => void
  onOpenWorkspace?: () => void
}) {
  const requirementState = task.requirementState ?? deriveRequirementState(task)
  const { progressPercent, checklistDone, checklistTotal } = getTaskProgressSnapshot(task, hasMiniProject)
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
        'rounded-md border-2 border-black bg-white p-3 transition-all',
        isFocused && 'ring-2 ring-black',
        isLocked && 'bg-gray-100'
      )}
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <span className="rounded-md border-2 border-black bg-yellow px-2 py-0.5 text-xs font-bold">
              Task {taskNumber}
            </span>
            {isFocused && (
              <span className="rounded-md border-2 border-black bg-green px-2 py-0.5 text-xs font-bold">
                Current Task
              </span>
            )}
            {isLocked && (
              <span className="rounded-md border-2 border-black bg-gray-200 px-2 py-0.5 text-xs font-bold">
                Locked
              </span>
            )}
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
        <div className="w-full md:w-44">
          <div className="mb-2 h-2 overflow-hidden rounded border-2 border-black bg-gray-200">
            <div className="h-full bg-black transition-all duration-200" style={{ width: `${progressPercent}%` }} />
          </div>
          <p className="mb-2 text-xs font-medium text-gray-700">
            Checklist: {checklistDone}/{checklistTotal}
          </p>
          <div className="flex flex-col gap-1">
            <BrutalButton size="sm" color="black" variant={isFocused ? 'primary' : 'outline'} className="w-full" onClick={onFocus}>
              <ChevronRight className="h-4 w-4" />
              {isFocused ? 'Focused' : 'Focus'}
            </BrutalButton>
            {onOpenWorkspace && (
              <BrutalButton size="sm" color="green" className="w-full" onClick={onOpenWorkspace}>
                <PlayCircle className="h-4 w-4" />
                Learn
              </BrutalButton>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function TaskDetailPanel({
  task,
  week,
  isCurrentTask,
  isTaskLocked,
  lockedReason,
  openedResources,
  onOpenResource,
  onToggleResource,
  onReopen,
}: {
  task: RoadmapTask
  week: RoadmapWeek
  isCurrentTask: boolean
  isTaskLocked: boolean
  lockedReason: string | null
  openedResources: Record<string, boolean>
  onOpenResource: (resourceId: string) => void
  onToggleResource: (taskId: string, resourceId: string) => void
  onReopen: (taskId: string) => void
}) {
  const difficultyColors: Record<RoadmapTask['difficulty'], string> = {
    easy: 'text-green',
    medium: 'text-yellow',
    hard: 'text-red',
  }
  const canComplete = taskCanBeCompleted(task)
  const resources = task.resources ?? []
  const resourceGate = getLearningResourceGate(task)
  const requirementHint = getRequirementHint(task)
  const requirementState = task.requirementState ?? deriveRequirementState(task)
  const hasMiniProject = task.projectRequired === true || Boolean(week.miniProject)
  const quizLockReason = task.quizPassed ? null : getQuizLockReason(task)
  const projectLockReason = task.projectPassed ? null : getProjectLockReason(task, hasMiniProject)
  const canOpenQuiz = !isTaskLocked && (task.quizPassed || quizLockReason === null)
  const canOpenProject = !isTaskLocked && hasMiniProject && (task.projectPassed || projectLockReason === null)
  const whyThisMatters = week.goal || 'This task builds a core backend skill for your next module.'

  return (
    <div className={cn('rounded-md border-3 border-black bg-white p-4', task.status === 'completed' && 'bg-green/10')}>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {isCurrentTask && (
          <span className="rounded-md border-2 border-black bg-green px-2 py-0.5 text-xs font-bold">
            Current Task
          </span>
        )}
        <span
          className={cn(
            'rounded-md border-2 border-black px-2 py-0.5 text-xs font-bold',
            getRequirementBadgeStyles(requirementState)
          )}
        >
          {formatRequirementState(requirementState)}
        </span>
        <span className={cn('text-xs font-bold uppercase', difficultyColors[task.difficulty])}>
          {task.difficulty}
        </span>
      </div>

      <h5 className={cn('mb-1 font-display text-xl font-bold', task.status === 'completed' && 'line-through text-gray-500')}>
        {task.title}
      </h5>
      <p className="text-sm text-gray-700">{task.description}</p>
      <div className="mt-2 flex flex-wrap items-center gap-3 text-xs font-medium text-gray-700">
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {task.estimatedTime}
        </span>
        <span>Deliverable: {task.deliverable}</span>
      </div>

      <div className="mt-4 rounded-md border-2 border-black bg-blue/10 p-3">
        <p className="mb-1 text-sm font-bold">Why this matters</p>
        <p className="text-sm text-gray-800">{whyThisMatters}</p>
      </div>

      <div className="mt-4 rounded-md border-2 border-black bg-yellow/10 p-3">
        <p className="mb-2 text-sm font-bold">Learning Steps</p>
        <ol className="list-decimal space-y-1 pl-5 text-sm text-gray-800">
          <li>Watch one focused video.</li>
          <li>Read one documentation resource.</li>
          <li>Complete the checklist.</li>
          <li>Pass the quiz.</li>
          <li>Submit the mini project if required.</li>
        </ol>
      </div>

      <div className="mt-4 space-y-3">
        <p className="flex items-center gap-2 text-sm font-bold">
          <BookOpen className="h-4 w-4" />
          Learning Resources
        </p>
        {resources.length === 0 && (
          <div className="rounded-md border-2 border-dashed border-black bg-gray-50 p-3 text-sm font-medium text-gray-700">
            Resources are being prepared for this task.
          </div>
        )}
        <div className="space-y-3">
          {resources.map((resource) => {
            const unavailable = isResourceUnavailable(resource)
            const thumbnailUrl = resource.resourceType === 'youtube' ? getYouTubeThumbnailUrl(resource.url) : null
            const resourceStatus = getResourceStatusLabel(resource, openedResources)

            return (
              <div key={resource.id} className="rounded-md border-2 border-black bg-gray-50 p-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className="rounded-md border-2 border-black bg-white px-2 py-0.5 text-[11px] font-bold">
                        {getResourceTypeLabel(resource.resourceType)}
                      </span>
                      <span className="rounded-md border-2 border-black bg-white px-2 py-0.5 text-[11px] font-bold">
                        {resourceStatus}
                      </span>
                    </div>
                    <p className="font-bold">{resource.title}</p>
                    <p className="text-xs text-gray-600">
                      {resource.provider}
                      {!unavailable ? ` • ${resource.estimatedMinutes} min` : ''}
                    </p>
                    {unavailable && (
                      <p className="mt-2 text-xs font-medium text-gray-700">
                        Resources are being prepared for this task.
                      </p>
                    )}
                  </div>

                  {resource.resourceType === 'youtube' && (
                    <div className="w-full sm:w-40">
                      {thumbnailUrl && !unavailable ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={thumbnailUrl}
                          alt={resource.title}
                          loading="lazy"
                          className="h-24 w-full rounded-md border-2 border-black object-cover"
                          onError={(event) => {
                            event.currentTarget.style.display = 'none'
                          }}
                        />
                      ) : (
                        <div className="flex h-24 items-center justify-center rounded-md border-2 border-black bg-white px-2 text-center">
                          <div>
                            <PlayCircle className="mx-auto h-5 w-5" />
                            <p className="mt-1 text-xs font-bold">Video resource</p>
                            <p className="text-[11px] text-gray-600">{resource.provider}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  {(resource.resourceType === 'docs' || resource.resourceType === 'article') && (
                    <div className="flex h-24 w-full items-center justify-center rounded-md border-2 border-black bg-white px-2 text-center sm:w-40">
                      <div>
                        <FileText className="mx-auto h-5 w-5" />
                        <p className="mt-1 text-xs font-bold">Documentation</p>
                        <p className="text-[11px] text-gray-600">{resource.provider}</p>
                      </div>
                    </div>
                  )}
                </div>

                {!unavailable && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <a href={resource.url} target="_blank" rel="noopener noreferrer" onClick={() => onOpenResource(resource.id)}>
                      <BrutalButton variant="ghost" color="black" size="sm">
                        <ExternalLink className="h-4 w-4" />
                        Open
                      </BrutalButton>
                    </a>
                    <BrutalButton
                      variant={resource.isCompleted ? 'primary' : 'outline'}
                      color={resource.isCompleted ? 'green' : 'black'}
                      size="sm"
                      onClick={() => onToggleResource(task.id, resource.id)}
                    >
                      {resource.resourceType === 'youtube' ? (
                        <PlayCircle className="h-4 w-4" />
                      ) : (
                        <Check className="h-4 w-4" />
                      )}
                      {resource.resourceType === 'youtube'
                        ? (resource.isCompleted ? 'Watched' : 'Mark watched')
                        : (resource.isCompleted ? 'Completed' : 'Mark complete')}
                    </BrutalButton>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div className="mt-4 rounded-md border-2 border-black bg-white p-3">
        <p className="mb-2 text-sm font-bold">Requirement Checklist</p>
        <ul className="space-y-2 text-sm">
          <li className="flex items-start gap-2">
            {resourceGate.resourcesComplete ? <Check className="mt-0.5 h-4 w-4 text-green" /> : <Circle className="mt-0.5 h-4 w-4" />}
            <span>Complete 1 video and 1 documentation resource ({resourceGate.completedVideos}/1 video, {resourceGate.completedDocs}/1 docs)</span>
          </li>
          <li className="flex items-start gap-2">
            {task.quizPassed ? <Check className="mt-0.5 h-4 w-4 text-green" /> : <Circle className="mt-0.5 h-4 w-4" />}
            <span>Pass quiz with score 80 or above</span>
          </li>
          <li className="flex items-start gap-2">
            {(task.projectRequired !== true || task.projectPassed) ? <Check className="mt-0.5 h-4 w-4 text-green" /> : <Circle className="mt-0.5 h-4 w-4" />}
            <span>Submit mini project if required</span>
          </li>
        </ul>
        <p className="mt-2 text-xs font-medium text-gray-600">{requirementHint}</p>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {isTaskLocked ? (
          <>
            <BrutalButton variant="outline" color="black" size="sm" className="w-full" disabled>
              <Lock className="h-4 w-4" />
              Start Quiz
            </BrutalButton>
            {hasMiniProject && (
              <BrutalButton variant="outline" color="black" size="sm" className="w-full" disabled>
                <Lock className="h-4 w-4" />
                Submit Mini Project
              </BrutalButton>
            )}
          </>
        ) : (
          <>
          {canOpenQuiz ? (
            <Link href={`/roadmap/tasks/${task.id}/quiz`} className="inline-flex">
              <BrutalButton
                variant={task.quizPassed ? 'primary' : 'outline'}
                color={task.quizPassed ? 'green' : 'black'}
                size="sm"
                className="w-full"
              >
                {task.quizPassed
                  ? 'Retry Quiz'
                  : requirementState === 'quiz_pending'
                    ? 'Continue Quiz'
                    : 'Start Quiz'}
              </BrutalButton>
            </Link>
          ) : (
            <BrutalButton variant="outline" color="black" size="sm" className="w-full" disabled>
              Start Quiz
            </BrutalButton>
          )}

          {hasMiniProject && (
            canOpenProject ? (
              <Link href={`/roadmap/tasks/${task.id}/project`} className="inline-flex">
                <BrutalButton
                  variant={task.projectPassed ? 'primary' : 'outline'}
                  color={task.projectPassed ? 'green' : 'black'}
                  size="sm"
                  className="w-full"
                >
                  {task.projectPassed ? 'View Mini Project Review' : 'Submit Mini Project'}
                </BrutalButton>
              </Link>
            ) : (
              <BrutalButton variant="outline" color="black" size="sm" className="w-full" disabled>
                Submit Mini Project
              </BrutalButton>
            )
          )}
          </>
        )}
      </div>
      {isTaskLocked && lockedReason && (
        <p className="mt-2 text-xs font-medium text-orange-700">{lockedReason}</p>
      )}
      {!isTaskLocked && quizLockReason && !task.quizPassed && (
        <p className="mt-2 text-xs font-medium text-orange-700">{quizLockReason}</p>
      )}
      {!isTaskLocked && hasMiniProject && projectLockReason && projectLockReason !== quizLockReason && !task.projectPassed && (
        <p className="mt-1 text-xs font-medium text-pink-700">{projectLockReason}</p>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t-2 border-black/10 pt-3">
        <p className="text-xs font-medium text-gray-600">
          Status: {formatRequirementState(requirementState)}
        </p>
        {task.status === 'completed' ? (
          <BrutalButton variant="outline" color="black" size="sm" onClick={() => onReopen(task.id)}>
            Reopen task
          </BrutalButton>
        ) : (
          <span
            className={cn(
              'rounded-md border-2 border-black px-3 py-1 text-xs font-bold',
              canComplete ? 'bg-green/10 text-green' : 'bg-gray-100 text-gray-600'
            )}
          >
            {canComplete ? 'Ready to complete' : 'Finish learning resources first'}
          </span>
        )}
      </div>
    </div>
  )
}
