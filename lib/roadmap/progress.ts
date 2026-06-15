import type {
  Roadmap,
  RoadmapResource,
  RoadmapTask,
  RoadmapTaskRequirementState,
  RoadmapWeek,
} from '@/types'

export interface LearningResourceGate {
  resourcesComplete: boolean
  hasVideoResource: boolean
  hasDocsResource: boolean
  completedVideos: number
  completedDocs: number
  unavailableCount: number
}

export interface CurrentTaskLocation {
  weekIndex: number
  weekNumber: number
  taskId: string
}

export function isResourceUnavailable(resource: Pick<RoadmapResource, 'completionRule' | 'url'>) {
  return resource.completionRule.startsWith('resource_unavailable') || resource.url.trim().length === 0
}

export function getLearningResourceGate(task: RoadmapTask): LearningResourceGate {
  const resources = task.resources ?? []
  const validVideoResources = resources.filter(
    (resource) => resource.resourceType === 'youtube' && !isResourceUnavailable(resource)
  )
  const validDocsResources = resources.filter(
    (resource) =>
      (resource.resourceType === 'docs' || resource.resourceType === 'article') &&
      !isResourceUnavailable(resource)
  )

  const completedVideos = validVideoResources.filter((resource) => resource.isCompleted).length
  const completedDocs = validDocsResources.filter((resource) => resource.isCompleted).length

  const hasVideoResource = validVideoResources.length > 0
  const hasDocsResource = validDocsResources.length > 0
  const resourcesComplete = hasVideoResource && completedVideos >= 1 && hasDocsResource && completedDocs >= 1

  return {
    resourcesComplete,
    hasVideoResource,
    hasDocsResource,
    completedVideos,
    completedDocs,
    unavailableCount: resources.filter(isResourceUnavailable).length,
  }
}

export function hasRequiredResourcesCompleted(task: RoadmapTask) {
  return getLearningResourceGate(task).resourcesComplete
}

export function deriveRequirementState(task: RoadmapTask): RoadmapTaskRequirementState {
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

export function taskCanBeCompleted(task: RoadmapTask) {
  return deriveRequirementState(task) === 'completed'
}

export function deriveTaskStatus(task: RoadmapTask): RoadmapTask['status'] {
  return taskCanBeCompleted(task) ? 'completed' : 'todo'
}

export function getRequirementHint(task: RoadmapTask) {
  const resourceGate = getLearningResourceGate(task)
  const quizRequired = task.quizRequired !== false
  const quizPassed = task.quizPassed === true
  const projectRequired = task.projectRequired === true
  const projectPassed = task.projectPassed === true

  if (!resourceGate.hasVideoResource || !resourceGate.hasDocsResource || resourceGate.unavailableCount > 0) {
    return 'Resources are being prepared for this task.'
  }
  if (!resourceGate.resourcesComplete) {
    return `Complete 1 video and 1 documentation resource to unlock quiz. (Video ${resourceGate.completedVideos}/1, Docs ${resourceGate.completedDocs}/1)`
  }
  if (quizRequired && !quizPassed) return 'Pass the quiz to unlock mini project.'
  if (projectRequired && !projectPassed) return 'Submit mini project to unlock the next task.'
  return 'All requirements completed.'
}

export function getQuizLockReason(task: RoadmapTask) {
  const gate = getLearningResourceGate(task)
  if (!gate.hasVideoResource || !gate.hasDocsResource || gate.unavailableCount > 0) {
    return 'Resources are being prepared for this task.'
  }
  if (!gate.resourcesComplete) {
    return `Complete 1 video and 1 documentation resource to unlock quiz. (Video ${gate.completedVideos}/1, Docs ${gate.completedDocs}/1)`
  }
  return null
}

export function getProjectLockReason(task: RoadmapTask, hasMiniProject: boolean) {
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

export function getNextActionText(task: RoadmapTask, gate = getLearningResourceGate(task)): string {
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

export function hasTaskProgress(task: RoadmapTask) {
  const resourceProgress = (task.resources ?? []).some(
    (resource) => resource.isCompleted || resource.watchedSeconds > 0 || resource.completionPercentage > 0
  )
  return resourceProgress || task.quizPassed === true || task.projectPassed === true || task.status === 'completed'
}

export function getDefaultCurrentTask(week: RoadmapWeek) {
  return week.tasks.find((task) => task.status !== 'completed') ?? week.tasks[0] ?? null
}

export function getCurrentTaskLocation(roadmap: Roadmap): CurrentTaskLocation | null {
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

export function calculateTaskProgress(task: RoadmapTask) {
  if (deriveRequirementState(task) === 'completed') return 100

  const gate = getLearningResourceGate(task)
  const quizRequired = task.quizRequired !== false
  const projectRequired = task.projectRequired === true
  const totalWeight = 50 + (quizRequired ? 30 : 0) + (projectRequired ? 20 : 0)

  let completedWeight = 0
  if (gate.completedVideos >= 1) completedWeight += 25
  if (gate.completedDocs >= 1) completedWeight += 25
  if (quizRequired && task.quizPassed === true) completedWeight += 30
  if (projectRequired && task.projectPassed === true) completedWeight += 20

  return Math.min(100, Math.max(0, Math.round((completedWeight / totalWeight) * 100)))
}

export function calculateWeekProgress(week: RoadmapWeek) {
  if (week.tasks.length === 0) return 0

  const total = week.tasks.reduce((sum, task) => sum + calculateTaskProgress(task), 0)
  return Math.round(total / week.tasks.length)
}

export function calculateOverallProgress(roadmap: Roadmap) {
  const tasks = roadmap.weeks.flatMap((week) => week.tasks)
  if (tasks.length === 0) return 0

  const total = tasks.reduce((sum, task) => sum + calculateTaskProgress(task), 0)
  return Math.round(total / tasks.length)
}

export function getCompletedTaskCount(roadmap: Roadmap) {
  return roadmap.weeks.reduce(
    (sum, week) => sum + week.tasks.filter((task) => deriveRequirementState(task) === 'completed').length,
    0
  )
}
