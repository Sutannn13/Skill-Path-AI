'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { AppShell, Container, GradientBackground } from '@/components/layout'
import { DashboardHeader } from '@/components/layout/dashboard-header'
import { BrutalCard, BrutalButton, SkillBadge, ScoreBar } from '@/components/brutal'
import { generateFallbackRoadmap } from '@/lib/ai'
import { getCuratedResourcesForTask } from '@/lib/roadmap/resources'
import { calculateSkillGap } from '@/lib/scoring/skill-gap'
import { getRequiredSkillIds, getNiceToHaveSkillIds, getRoleById, getSkillById } from '@/lib/constants'
import { createSupabaseBrowserClient } from '@/lib/supabase/browser'
import { cn } from '@/lib/utils'
import {
  AlertCircle,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Circle,
  Clock,
  ExternalLink,
  PlayCircle,
  RefreshCw,
  Save,
  Target,
  Zap,
} from 'lucide-react'
import { CurrentLevel, Roadmap, RoadmapResource, RoadmapTask, RoadmapWeek, SkillLevel, TargetRole, UserSkill } from '@/types'

type RoadmapMode = 'loading' | 'supabase' | 'demo' | 'error'
type SaveState = 'idle' | 'saving' | 'saved' | 'error'

interface RoadmapRow {
  id: string
  title: string
  summary: string | null
  duration_weeks: number | null
  source: 'ai' | 'fallback'
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
  study_time: string | null
}

interface UserSkillRow {
  skill_slug: string
  level: number
}

const demoRoadmap = withGeneratedResources(generateFallbackRoadmap({
  targetRole: 'frontend-developer',
  currentLevel: 'beginner',
  missingSkills: ['TypeScript', 'Testing', 'API Integration'],
  studyTime: '1hour',
  durationWeeks: 6,
}))

function clampSkillLevel(value: number): SkillLevel {
  return Math.max(0, Math.min(4, Number(value))) as SkillLevel
}

function withGeneratedResources(roadmap: Roadmap): Roadmap {
  return {
    ...roadmap,
    weeks: roadmap.weeks.map((week) => ({
      ...week,
      tasks: week.tasks.map((task) => ({
        ...task,
        completedAt: null,
        miniExerciseCompleted: task.miniExerciseCompleted ?? false,
        deliverableCompleted: task.deliverableCompleted ?? false,
        resources: getCuratedResourcesForTask(task, week).map((resource, index) => ({
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

function taskCanBeCompleted(task: RoadmapTask) {
  const resources = task.resources ?? []
  const requiredResourcesComplete = resources
    .filter((resource) => resource.isRequired)
    .every((resource) => resource.isCompleted)

  return requiredResourcesComplete &&
    task.miniExerciseCompleted === true &&
    task.deliverableCompleted === true
}

function deriveTaskStatus(task: RoadmapTask): RoadmapTask['status'] {
  return taskCanBeCompleted(task) ? 'completed' : 'todo'
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

function buildRoadmapFromRows(
  roadmapRow: RoadmapRow,
  taskRows: RoadmapTaskRow[],
  resourceRows: RoadmapResourceRow[],
  progressRows: RoadmapProgressRow[]
): Roadmap {
  const progressByResourceId = new Map(progressRows.map((progress) => [progress.resource_id, progress]))
  const resourcesByTaskId = new Map<string, RoadmapResource[]>()

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
    const task: RoadmapTask = {
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
      resources: resourcesByTaskId.get(row.id) ?? [],
    }

    if (existingWeek) {
      existingWeek.tasks.push(task)
      continue
    }

    weeks.set(weekNumber, {
      week: weekNumber,
      title: row.week_title ?? `Week ${weekNumber}`,
      goal: row.week_goal ?? 'Complete this week of the roadmap',
      focusSkills: row.focus_skills ?? row.skill_related ?? [],
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
    source: roadmapRow.source,
    createdAt: roadmapRow.created_at,
  }
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
  const [statusMessage, setStatusMessage] = useState('Loading roadmap...')
  const [saveState, setSaveState] = useState<SaveState>('idle')
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => {
    let isActive = true

    const loadLatestRoadmap = async (userId: string) => {
      if (!supabase) return null

      const { data: roadmapRow, error: roadmapError } = await supabase
        .from('roadmaps')
        .select('id, title, summary, duration_weeks, source, created_at')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (roadmapError) {
        throw new Error(`Failed to load roadmap: ${roadmapError.message}`)
      }

      if (!roadmapRow) {
        return null
      }

      const typedRoadmap = roadmapRow as RoadmapRow
      const { data: taskRows, error: taskError } = await supabase
        .from('roadmap_tasks')
        .select('id, roadmap_id, week_number, title, description, skill_related, difficulty, estimated_time, deliverable, status, completed_at, task_key, task_order, week_title, week_goal, focus_skills, mini_project, mini_exercise_completed, deliverable_completed')
        .eq('roadmap_id', typedRoadmap.id)
        .order('week_number', { ascending: true })
        .order('task_order', { ascending: true })

      if (taskError) {
        throw new Error(`Failed to load roadmap tasks: ${taskError.message}`)
      }

      const typedTasks = (taskRows ?? []) as RoadmapTaskRow[]
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
      if (!supabase) return demoRoadmap

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('target_role, current_level, study_time')
        .eq('id', userId)
        .maybeSingle()

      if (profileError) {
        throw new Error(`Failed to load profile for roadmap generation: ${profileError.message}`)
      }

      const typedProfile = profile as ProfileRow | null
      const targetRole = typedProfile?.target_role ?? 'frontend-developer'
      const currentLevel = typedProfile?.current_level ?? 'beginner'
      const studyTime = typedProfile?.study_time ?? '1hour'

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

      const roadmapWithResources = withGeneratedResources(generated)

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
          },
        })
        .select('id, title, summary, duration_weeks, source, created_at')
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

          return getCuratedResourcesForTask(task, week).map((resource, index) => ({
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

      const saved = await loadLatestRoadmap(userId)
      return saved ?? roadmapWithResources
    }

    const loadRoadmap = async () => {
      setMode('loading')
      setStatusMessage('Loading roadmap...')

      if (!supabase) {
        if (isActive) {
          setRoadmap(demoRoadmap)
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
            setRoadmap(demoRoadmap)
            setMode('demo')
            setStatusMessage('No Supabase session. Progress is not persisted in demo mode.')
          }
          return
        }

        setCurrentUserId(user.id)
        const savedRoadmap = await loadLatestRoadmap(user.id)

        if (savedRoadmap) {
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
          setRoadmap(demoRoadmap)
          setMode('error')
          setStatusMessage(error instanceof Error ? error.message : 'Failed to load roadmap.')
        }
      }
    }

    loadRoadmap()

    return () => {
      isActive = false
    }
  }, [supabase])

  const persistTaskState = async (task: RoadmapTask) => {
    if (!supabase || !currentUserId || mode !== 'supabase') return

    const { error } = await supabase
      .from('roadmap_tasks')
      .update({
        status: task.status,
        completed_at: task.status === 'completed' ? (task.completedAt ?? new Date().toISOString()) : null,
        mini_exercise_completed: task.miniExerciseCompleted === true,
        deliverable_completed: task.deliverableCompleted === true,
      })
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

        const isCompleted = !resource.isCompleted
        return {
          ...resource,
          isCompleted,
          completionPercentage: isCompleted ? 100 : 0,
          completedAt: isCompleted ? now : null,
        }
      })
      const nextTask = { ...task, resources: nextResources }
      const status = deriveTaskStatus(nextTask)
      return {
        ...nextTask,
        status,
        completedAt: status === 'completed' ? now : null,
      }
    })

    setRoadmap(nextRoadmap)
    await saveUpdatedTask(nextRoadmap, taskId, resourceId)
  }

  const toggleTaskGate = async (taskId: string, gate: 'miniExerciseCompleted' | 'deliverableCompleted') => {
    if (!roadmap) return

    const now = new Date().toISOString()
    const nextRoadmap = updateRoadmapTask(roadmap, taskId, (task) => {
      const nextTask = {
        ...task,
        [gate]: !task[gate],
      }
      const status = deriveTaskStatus(nextTask)
      return {
        ...nextTask,
        status,
        completedAt: status === 'completed' ? now : null,
      }
    })

    setRoadmap(nextRoadmap)
    await saveUpdatedTask(nextRoadmap, taskId)
  }

  const reopenTask = async (taskId: string) => {
    if (!roadmap) return

    const nextRoadmap = updateRoadmapTask(roadmap, taskId, (task) => ({
      ...task,
      status: 'todo',
      completedAt: null,
      deliverableCompleted: false,
    }))

    setRoadmap(nextRoadmap)
    await saveUpdatedTask(nextRoadmap, taskId)
  }

  const regenerateRoadmap = async () => {
    if (!supabase || !currentUserId) {
      setRoadmap(demoRoadmap)
      setMode('demo')
      setStatusMessage('Demo roadmap regenerated locally. Sign in to persist progress.')
      return
    }

    const confirmed = window.confirm('Replace your current roadmap? This archives the current roadmap and creates a new one with fresh tasks and progress.')
    if (!confirmed) return

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
          const targetRole = typedProfile?.target_role ?? 'frontend-developer'
          const currentLevel = typedProfile?.current_level ?? 'beginner'
          const studyTime = typedProfile?.study_time ?? '1hour'

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

          const roadmapWithResources = withGeneratedResources(generatedRoadmap)
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
              context: { targetRole, currentLevel, studyTime },
            })
            .select('id, title, summary, duration_weeks, source, created_at')
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

              return getCuratedResourcesForTask(task, week).map((resource, index) => ({
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

          const { data: tasks } = await supabase
            .from('roadmap_tasks')
            .select('id, roadmap_id, week_number, title, description, skill_related, difficulty, estimated_time, deliverable, status, completed_at, task_key, task_order, week_title, week_goal, focus_skills, mini_project, mini_exercise_completed, deliverable_completed')
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
      setExpandedWeek(0)
      setMode('supabase')
      setSaveState('saved')
      setSaveMessage('New roadmap saved')
    } catch (error) {
      setSaveState('error')
      setSaveMessage(error instanceof Error ? error.message : 'Failed to regenerate roadmap')
    } finally {
      setIsGenerating(false)
    }
  }

  const progress = roadmap ? calculateOverallProgress(roadmap) : 0

  return (
    <AppShell showBottomNav={true}>
      <GradientBackground />

      <div className="flex-1">
        <DashboardHeader title="AI Roadmap" subtitle="Follow a saved learning module, not a throwaway checklist" />

        <Container className="py-6">
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
              <BrutalCard color="yellow" className="mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div>
                    <h2 className="font-display font-bold text-2xl mb-1">{roadmap.title}</h2>
                    <p className="text-black/70">{roadmap.summary}</p>
                    <p className="mt-2 text-sm font-bold text-black/70">
                      {mode === 'supabase'
                        ? 'Progress is saved to Supabase.'
                        : 'Fallback roadmap active. Sign in to preserve progress across devices.'}
                    </p>
                  </div>
                  <BrutalButton
                    color="black"
                    onClick={regenerateRoadmap}
                    loading={isGenerating}
                    disabled={isGenerating}
                  >
                    <RefreshCw className={cn('w-4 h-4 mr-2', isGenerating && 'animate-spin')} />
                    Regenerate
                  </BrutalButton>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    <span>{roadmap.durationWeeks} weeks</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    <span>{roadmap.weeks.reduce((sum, week) => sum + week.tasks.length, 0)} tasks</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    <span>{roadmap.source === 'ai' ? 'AI Generated' : 'Template Fallback'}</span>
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

              <div className="space-y-4">
                {roadmap.weeks.map((week, weekIndex) => {
                  const weekProgress = calculateWeekProgress(week)
                  const isExpanded = expandedWeek === weekIndex

                  return (
                    <motion.div
                      key={week.week}
                      initial={false}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: weekIndex * 0.05 }}
                    >
                      <BrutalCard color={weekIndex % 2 === 0 ? 'blue' : 'pink'} className="p-0 overflow-hidden">
                        <button
                          onClick={() => setExpandedWeek(isExpanded ? null : weekIndex)}
                          className="w-full p-4 flex items-center justify-between text-left"
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
                              <p className="font-bold">{weekProgress}%</p>
                              <p className="text-xs text-black/70">complete</p>
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

                                <div className="space-y-3 mb-4">
                                  <h4 className="font-bold">Tasks and Learning Resources</h4>
                                  {week.tasks.map((task) => (
                                    <TaskItem
                                      key={task.id}
                                      task={task}
                                      onToggleResource={toggleResource}
                                      onToggleGate={toggleTaskGate}
                                      onReopen={reopenTask}
                                    />
                                  ))}
                                </div>

                                {week.miniProject && (
                                  <div className="bg-gray-50 p-4 brutal-radius border-2 border-black">
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
                    <Link href="/projects">
                      <BrutalButton color="black">
                        View Project Ideas
                      </BrutalButton>
                    </Link>
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

function getYouTubeEmbedUrl(url: string) {
  try {
    const parsed = new URL(url)
    const videoId = parsed.hostname.includes('youtu.be')
      ? parsed.pathname.replace('/', '')
      : parsed.searchParams.get('v')

    if (!videoId) return null
    return `https://www.youtube.com/embed/${videoId}`
  } catch {
    return null
  }
}

function TaskItem({
  task,
  onToggleResource,
  onToggleGate,
  onReopen,
}: {
  task: RoadmapTask
  onToggleResource: (taskId: string, resourceId: string) => void
  onToggleGate: (taskId: string, gate: 'miniExerciseCompleted' | 'deliverableCompleted') => void
  onReopen: (taskId: string) => void
}) {
  const difficultyColors = {
    easy: 'text-green',
    medium: 'text-yellow',
    hard: 'text-red',
  }
  const canComplete = taskCanBeCompleted(task)
  const resources = task.resources ?? []

  return (
    <div
      className={cn(
        'p-4 brutal-border brutal-radius transition-all',
        task.status === 'completed'
          ? 'bg-green/10 border-green'
          : 'bg-white'
      )}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5">
          {task.status === 'completed' ? (
            <Check className="w-5 h-5 text-green" />
          ) : (
            <Circle className="w-5 h-5" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h5 className={cn(
              'font-medium',
              task.status === 'completed' && 'line-through text-gray-500'
            )}>
              {task.title}
            </h5>
            <span className={cn(
              'text-xs font-bold uppercase',
              difficultyColors[task.difficulty]
            )}>
              {task.difficulty}
            </span>
          </div>
          <p className="text-sm text-gray-600 mt-1">{task.description}</p>
          <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {task.estimatedTime}
            </span>
            <span>{task.deliverable}</span>
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <div>
          <p className="mb-2 flex items-center gap-2 text-sm font-bold">
            <BookOpen className="h-4 w-4" />
            Learning resources
          </p>
          <div className="grid gap-3 md:grid-cols-2">
            {resources.map((resource) => {
              const youtubeEmbed = resource.resourceType === 'youtube' ? getYouTubeEmbedUrl(resource.url) : null

              return (
                <div key={resource.id} className="rounded-md border-2 border-black bg-gray-50 p-3">
                  {youtubeEmbed && (
                    <div className="mb-3 aspect-video overflow-hidden rounded-md border-2 border-black bg-black">
                      <iframe
                        src={youtubeEmbed}
                        title={resource.title}
                        className="h-full w-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  )}
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold">{resource.title}</p>
                      <p className="text-xs text-gray-500">
                        {resource.provider} - {resource.resourceType} - {resource.estimatedMinutes} min
                      </p>
                    </div>
                    {resource.isCompleted && <CheckCircle2 className="h-5 w-5 shrink-0 text-green" />}
                  </div>
                  <p className="mb-3 text-xs text-gray-600">
                    Completion is manual for this MVP. Do not mark YouTube resources complete unless you actually watched them.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <a href={resource.url} target="_blank" rel="noopener noreferrer">
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
                      {resource.isCompleted ? 'Completed' : 'Mark complete'}
                    </BrutalButton>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <button
            type="button"
            onClick={() => onToggleGate(task.id, 'miniExerciseCompleted')}
            className={cn(
              'flex items-start gap-3 rounded-md border-2 border-black p-3 text-left font-medium',
              task.miniExerciseCompleted ? 'bg-green/10' : 'bg-white hover:bg-gray-50'
            )}
          >
            {task.miniExerciseCompleted ? <Check className="mt-0.5 h-5 w-5 text-green" /> : <Circle className="mt-0.5 h-5 w-5" />}
            <span>
              <span className="block font-bold">Mini exercise complete</span>
              <span className="block text-xs text-gray-600">Practice the core concept before closing the task.</span>
            </span>
          </button>

          <button
            type="button"
            onClick={() => onToggleGate(task.id, 'deliverableCompleted')}
            className={cn(
              'flex items-start gap-3 rounded-md border-2 border-black p-3 text-left font-medium',
              task.deliverableCompleted ? 'bg-green/10' : 'bg-white hover:bg-gray-50'
            )}
          >
            {task.deliverableCompleted ? <Check className="mt-0.5 h-5 w-5 text-green" /> : <Circle className="mt-0.5 h-5 w-5" />}
            <span>
              <span className="block font-bold">Project deliverable done</span>
              <span className="block text-xs text-gray-600">{task.deliverable}</span>
            </span>
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t-2 border-black/10 pt-3">
          <p className="text-xs font-medium text-gray-600">
            Task completes only after required resources, mini exercise, and deliverable are complete.
          </p>
          {task.status === 'completed' ? (
            <BrutalButton variant="outline" color="black" size="sm" onClick={() => onReopen(task.id)}>
              Reopen task
            </BrutalButton>
          ) : (
            <span
              className={cn(
                'brutal-border brutal-radius px-3 py-1 text-xs font-bold',
                canComplete ? 'bg-green/10 text-green' : 'bg-gray-100 text-gray-500'
              )}
            >
              {canComplete ? 'Ready to complete' : 'Requirements pending'}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
