'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock,
  FileText,
  Lock,
  Play,
  Rocket,
  Target,
  X,
} from 'lucide-react'
import { Roadmap, RoadmapTask, RoadmapWeek } from '@/types'
import { BrutalButton } from '@/components/brutal'
import { cn } from '@/lib/utils'
import { ResourceAccordion } from './resource-accordion'
import {
  LearningTabs,
  LearningTab,
  NotesPanel,
  ChecklistWithResourceGate,
  QuizPanel,
  MiniProjectPanel,
} from './learning-tabs'

interface LearningWorkspaceProps {
  task: RoadmapTask
  week: RoadmapWeek
  roadmap: Roadmap
  onBack: () => void
  onMarkResourceComplete: (taskId: string, resourceId: string, isCompleted: boolean) => void
  onOpenResource: (resourceId: string) => void
  onReopenTask: (taskId: string) => void
  className?: string
}

interface ResourceGate {
  hasVideoResource: boolean
  hasDocsResource: boolean
  completedVideos: number
  completedDocs: number
  resourcesComplete: boolean
}

function getLearningResourceGate(task: RoadmapTask): ResourceGate {
  const resources = task.resources ?? []
  const videoResources = resources.filter(
    (r) => r.resourceType === 'youtube' && r.url.trim().length > 0
  )
  const docResources = resources.filter(
    (r) => (r.resourceType === 'docs' || r.resourceType === 'article') && r.url.trim().length > 0
  )

  const completedVideos = videoResources.filter((r) => r.isCompleted).length
  const completedDocs = docResources.filter((r) => r.isCompleted).length

  return {
    hasVideoResource: videoResources.length > 0,
    hasDocsResource: docResources.length > 0,
    completedVideos,
    completedDocs,
    resourcesComplete: completedVideos >= 1 && completedDocs >= 1,
  }
}

function getQuizLockReason(gate: ResourceGate): string | null {
  if (!gate.hasVideoResource || !gate.hasDocsResource) {
    return 'Resources are being prepared for this task.'
  }
  if (!gate.resourcesComplete) {
    return `Complete 1 video and 1 documentation resource to unlock quiz. (Video ${gate.completedVideos}/1, Docs ${gate.completedDocs}/1)`
  }
  return null
}

function getProjectLockReason(task: RoadmapTask, gate: ResourceGate, hasMiniProject: boolean): string | null {
  if (!hasMiniProject) return null

  const quizLock = getQuizLockReason(gate)
  if (quizLock) return quizLock

  if (task.quizRequired !== false && !task.quizPassed) {
    return 'Pass the quiz to unlock mini project.'
  }

  return null
}

function deriveRequirementState(task: RoadmapTask): string {
  const gate = getLearningResourceGate(task)
  const quizRequired = task.quizRequired !== false
  const quizPassed = task.quizPassed === true
  const projectRequired = task.projectRequired === true
  const projectPassed = task.projectPassed === true

  if (!gate.resourcesComplete) return 'resources_pending'
  if (!quizRequired) return projectRequired ? (projectPassed ? 'completed' : 'project_pending') : 'completed'
  if (!quizPassed) return 'quiz_pending'
  if (projectRequired && !projectPassed) return 'project_pending'
  return 'completed'
}

function getNextAction(task: RoadmapTask): string {
  const gate = getLearningResourceGate(task)
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

const statusColors: Record<string, { bg: string; text: string }> = {
  resources_pending: { bg: 'bg-yellow/20', text: 'text-yellow' },
  resources_completed: { bg: 'bg-blue/20', text: 'text-blue' },
  quiz_pending: { bg: 'bg-orange/20', text: 'text-orange' },
  quiz_passed: { bg: 'bg-green/20', text: 'text-green' },
  project_pending: { bg: 'bg-pink/20', text: 'text-pink' },
  project_passed: { bg: 'bg-green/20', text: 'text-green' },
  completed: { bg: 'bg-green', text: 'text-black' },
}

const statusLabels: Record<string, string> = {
  resources_pending: 'Resources not completed',
  resources_completed: 'Resources completed',
  quiz_pending: 'Quiz not completed',
  quiz_passed: 'Quiz passed',
  project_pending: 'Waiting for project',
  project_passed: 'Project passed',
  completed: 'Completed',
}

export function LearningWorkspace({
  task,
  week,
  roadmap,
  onBack,
  onMarkResourceComplete,
  onOpenResource,
  onReopenTask,
  className,
}: LearningWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<LearningTab>('overview')

  const gate = getLearningResourceGate(task)
  const requirementState = deriveRequirementState(task)
  const hasMiniProject = task.projectRequired === true || Boolean(week.miniProject)
  const quizLockReason = task.quizPassed ? null : getQuizLockReason(gate)
  const projectLockReason = task.projectPassed ? null : getProjectLockReason(task, gate, hasMiniProject)
  const canOpenQuiz = !quizLockReason
  const canOpenProject = !projectLockReason
  const nextAction = getNextAction(task)

  const progress = useMemo(() => {
    const resources = task.resources ?? []
    const totalResources = resources.length
    const completedResources = resources.filter((r) => r.isCompleted).length
    const resourceProgress = totalResources > 0 ? (completedResources / totalResources) * 25 : 0

    const quizProgress = task.quizPassed ? 25 : task.quizRequired === false ? 25 : 0
    const projectProgress = task.projectPassed ? 15 : task.projectRequired === false ? 15 : 0

    let checklistProgress = 0
    if (gate.completedVideos >= 1) checklistProgress += 8
    if (gate.completedDocs >= 1) checklistProgress += 8
    if (task.quizPassed) checklistProgress += 9

    return Math.min(100, Math.round(resourceProgress + checklistProgress + quizProgress + projectProgress))
  }, [task, gate])

  const handleMarkResourceComplete = (resourceId: string) => {
    const resource = task.resources?.find((r) => r.id === resourceId)
    if (resource) {
      onMarkResourceComplete(task.id, resourceId, !resource.isCompleted)
    }
  }

  return (
    <div className={cn('flex flex-col h-full max-h-[90dvh] overflow-hidden', className)}>
      {/* Header - Fixed height, won't shrink */}
      <div className="shrink-0 border-b-2 border-black/10 bg-white">
        {/* Breadcrumb & Title */}
        <div className="p-4 md:p-5 lg:p-6">
          {/* Breadcrumb */}
          <div className="mb-3 flex items-center gap-1 text-xs text-black/60 overflow-x-auto hide-scrollbar">
            <Link href="/roadmap" className="whitespace-nowrap hover:text-black">
              Roadmap
            </Link>
            <ChevronRight className="h-3 w-3 shrink-0" />
            <span className="whitespace-nowrap font-medium text-black">Module {week.week}</span>
            <ChevronRight className="h-3 w-3 shrink-0" />
            <span className="truncate font-medium text-black">{task.title}</span>
          </div>

          {/* Title & Status */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className="flex items-center gap-1 rounded-md border-2 border-black bg-yellow px-2 py-0.5 text-xs font-bold whitespace-nowrap">
                  Module {week.week}
                </span>
                <span
                  className={cn(
                    'rounded-md border-2 border-black px-2 py-0.5 text-xs font-bold whitespace-nowrap',
                    statusColors[requirementState]?.bg
                  )}
                >
                  {statusLabels[requirementState]}
                </span>
                <span className="rounded-md border-2 border-black bg-white px-2 py-0.5 text-xs font-bold uppercase whitespace-nowrap">
                  {task.difficulty}
                </span>
              </div>
              <h2 className="font-display text-lg md:text-xl font-bold leading-tight">{task.title}</h2>
              <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-black/60">
                <span className="flex items-center gap-1 whitespace-nowrap">
                  <Clock className="h-3 w-3" />
                  {task.estimatedTime}
                </span>
                <span className="flex items-center gap-1 whitespace-nowrap">
                  <Target className="h-3 w-3" />
                  {nextAction}
                </span>
              </p>
            </div>
            <button
              onClick={onBack}
              className="shrink-0 self-start rounded-md border-2 border-black bg-white p-2 transition-colors hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="px-4 md:px-5 lg:px-6 pb-4">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-bold">Task Progress</span>
            <span className="font-bold">{progress}%</span>
          </div>
          <div className="w-full h-2 overflow-hidden rounded border-2 border-black bg-gray-200">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full bg-black"
            />
          </div>
        </div>
      </div>

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="flex flex-col lg:flex-row min-h-full">
          {/* Left Column: Resources List - Fixed width sidebar */}
          <div className="lg:w-72 xl:w-80 lg:shrink-0 border-b-2 border-black/10 lg:border-b-0 lg:border-r-2 bg-gray-50/50">
            <div className="p-4 md:p-5">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-bold">
                <BookOpen className="h-4 w-4" />
                Learning Resources
              </h3>

              {/* Quick Resource List */}
              <div className="space-y-3">
                {/* Videos */}
                {task.resources?.filter((r) => r.resourceType === 'youtube').length ? (
                  <div>
                    <p className="text-xs font-bold text-black/60 mb-2">Videos</p>
                    <div className="space-y-1">
                      {task.resources
                        .filter((r) => r.resourceType === 'youtube')
                        .map((resource) => (
                          <button
                            key={resource.id}
                            onClick={() => setActiveTab('resources')}
                            className={cn(
                              'flex w-full items-center gap-2 rounded-md border-2 border-black bg-white p-2 text-left text-xs transition-all hover:bg-gray-50',
                              resource.isCompleted && 'bg-green/10'
                            )}
                          >
                            <div className="h-8 w-12 shrink-0 overflow-hidden rounded border border-black/20 bg-gray-200 flex items-center justify-center">
                              <Play className="h-3 w-3 text-gray-500" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate font-bold text-xs">{resource.title}</p>
                              <p className="text-[10px] text-black/60">{resource.estimatedMinutes} min</p>
                            </div>
                            {resource.isCompleted && (
                              <CheckCircle2 className="h-4 w-4 shrink-0 text-green" />
                            )}
                          </button>
                        ))}
                    </div>
                  </div>
                ) : null}

                {/* Documentation */}
                {task.resources?.filter((r) => r.resourceType === 'docs' || r.resourceType === 'article').length ? (
                  <div>
                    <p className="text-xs font-bold text-black/60 mb-2 mt-3">Documentation</p>
                    <div className="space-y-1">
                      {task.resources
                        .filter((r) => r.resourceType === 'docs' || r.resourceType === 'article')
                        .map((resource) => (
                          <button
                            key={resource.id}
                            onClick={() => setActiveTab('resources')}
                            className={cn(
                              'flex w-full items-center gap-2 rounded-md border-2 border-black bg-white p-2 text-left text-xs transition-all hover:bg-gray-50',
                              resource.isCompleted && 'bg-green/10'
                            )}
                          >
                            <div className="h-8 w-8 shrink-0 flex items-center justify-center rounded bg-blue text-white">
                              <FileText className="h-4 w-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate font-bold text-xs">{resource.title}</p>
                              <p className="text-[10px] text-black/60">{resource.provider}</p>
                            </div>
                            {resource.isCompleted && (
                              <CheckCircle2 className="h-4 w-4 shrink-0 text-green" />
                            )}
                          </button>
                        ))}
                    </div>
                  </div>
                ) : null}
              </div>

              {/* Quick Actions */}
              <div className="mt-5 pt-4 border-t-2 border-black/10 space-y-3">
                <h3 className="text-xs font-bold text-black/60">Quick Actions</h3>

                {/* Quiz Button */}
                {task.quizRequired !== false && (
                  <div>
                    {canOpenQuiz ? (
                      <Link href={`/roadmap/tasks/${task.id}/quiz`} className="block">
                        <BrutalButton
                          variant={task.quizPassed ? 'primary' : 'outline'}
                          color={task.quizPassed ? 'green' : 'black'}
                          size="sm"
                          className="w-full justify-center"
                        >
                          <FileText className="mr-2 h-4 w-4" />
                          {task.quizPassed ? 'Retry Quiz' : 'Take Quiz'}
                        </BrutalButton>
                      </Link>
                    ) : (
                      <BrutalButton
                        variant="outline"
                        color="black"
                        size="sm"
                        className="w-full justify-center"
                        disabled
                      >
                        <Lock className="mr-2 h-4 w-4" />
                        Quiz Locked
                      </BrutalButton>
                    )}
                    {quizLockReason && !task.quizPassed && (
                      <p className="mt-1 text-[10px] text-black/60 leading-tight">{quizLockReason}</p>
                    )}
                  </div>
                )}

                {/* Mini Project Button */}
                {hasMiniProject && (
                  <div>
                    {canOpenProject ? (
                      <Link href={`/roadmap/tasks/${task.id}/project`} className="block">
                        <BrutalButton
                          variant={task.projectPassed ? 'primary' : 'outline'}
                          color={task.projectPassed ? 'green' : 'black'}
                          size="sm"
                          className="w-full justify-center"
                        >
                          <Rocket className="mr-2 h-4 w-4" />
                          {task.projectPassed ? 'View Project' : 'Submit Project'}
                        </BrutalButton>
                      </Link>
                    ) : (
                      <BrutalButton
                        variant="outline"
                        color="black"
                        size="sm"
                        className="w-full justify-center"
                        disabled
                      >
                        <Lock className="mr-2 h-4 w-4" />
                        Project Locked
                      </BrutalButton>
                    )}
                    {projectLockReason && !task.projectPassed && (
                      <p className="mt-1 text-[10px] text-black/60 leading-tight">{projectLockReason}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Tabs Content - Flexible */}
          <div className="flex-1 min-w-0 overflow-x-hidden">
            <div className="p-4 md:p-5 lg:p-6">
              <LearningTabs
                activeTab={activeTab}
                onTabChange={setActiveTab}
                task={task}
                week={week}
                onToggleChecklistItem={() => {}}
              />

              {/* Tab-specific content */}
              <div className="mt-4">
                {activeTab === 'resources' && (
                  <div className="w-full">
                    <ResourceAccordion
                      resources={task.resources ?? []}
                      task={task}
                      onMarkResourceComplete={handleMarkResourceComplete}
                      onOpenResource={onOpenResource}
                    />
                  </div>
                )}

                {activeTab === 'notes' && (
                  <NotesPanel taskId={task.id} />
                )}

                {activeTab === 'checklist' && (
                  <ChecklistWithResourceGate
                    task={task}
                    week={week}
                    onToggleItem={() => {}}
                  />
                )}

                {activeTab === 'quiz' && (
                  <QuizPanel
                    task={task}
                    lockReason={quizLockReason}
                    isLocked={!canOpenQuiz}
                  />
                )}

                {activeTab === 'project' && (
                  <MiniProjectPanel
                    task={task}
                    week={week}
                    lockReason={projectLockReason}
                    isLocked={!canOpenProject}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Actions - Fixed height, won't grow */}
      {requirementState === 'completed' && (
        <div className="shrink-0 border-t-2 border-black/10 bg-green/10 p-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green" />
              <span className="font-bold text-sm">Task Completed!</span>
            </div>
            <div className="flex gap-2">
              <BrutalButton variant="outline" color="black" size="sm" onClick={onBack}>
                Back to Roadmap
              </BrutalButton>
              <BrutalButton variant="primary" color="green" size="sm" onClick={onBack}>
                Next Task
              </BrutalButton>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}