'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  BookOpen,
  Check,
  CheckCircle2,
  ChevronRight,
  Circle,
  Clipboard,
  FileText,
  Lock,
  PenTool,
  Play,
  Rocket,
  Save,
  Timer,
  Trophy,
  X,
} from 'lucide-react'
import { RoadmapTask, RoadmapWeek } from '@/types'
import { BrutalButton, BrutalCard } from '@/components/brutal'
import { cn } from '@/lib/utils'

// ===== Notes Panel =====
interface NotesPanelProps {
  taskId: string
  className?: string
}

const NOTES_STORAGE_KEY = 'skillpath_notes'

interface TaskNotes {
  [taskId: string]: string
}

function loadNotes(): TaskNotes {
  if (typeof window === 'undefined') return {}
  try {
    const stored = localStorage.getItem(NOTES_STORAGE_KEY)
    return stored ? JSON.parse(stored) : {}
  } catch {
    return {}
  }
}

function saveNotes(notes: TaskNotes) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes))
  } catch {
    // Ignore storage errors
  }
}

export function NotesPanel({ taskId, className }: NotesPanelProps) {
  const [notes, setNotes] = useState('')
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')

  // Load notes on mount
  useEffect(() => {
    const storedNotes = loadNotes()
    setNotes(storedNotes[taskId] || '')
  }, [taskId])

  // Auto-save with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (notes) {
        setSaveStatus('saving')
        const storedNotes = loadNotes()
        storedNotes[taskId] = notes
        saveNotes(storedNotes)
        setLastSaved(new Date())
        setSaveStatus('saved')
      }
    }, 1000)

    return () => clearTimeout(timer)
  }, [notes, taskId])

  const handleSave = () => {
    setSaveStatus('saving')
    const storedNotes = loadNotes()
    storedNotes[taskId] = notes
    saveNotes(storedNotes)
    setLastSaved(new Date())
    setSaveStatus('saved')
  }

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PenTool className="h-4 w-4" />
          <span className="text-sm font-bold">My Notes</span>
        </div>
        <div className="flex items-center gap-2">
          {saveStatus === 'saving' && (
            <span className="flex items-center gap-1 text-xs text-black/60">
              <Save className="h-3 w-3 animate-pulse" />
              Saving...
            </span>
          )}
          {saveStatus === 'saved' && lastSaved && (
            <span className="text-xs text-black/60">
              Saved {lastSaved.toLocaleTimeString()}
            </span>
          )}
          <BrutalButton
            variant="outline"
            color="black"
            size="sm"
            onClick={handleSave}
            disabled={!notes}
          >
            <Save className="h-4 w-4" />
            Save
          </BrutalButton>
        </div>
      </div>

      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Write your notes here... What did you learn? Any questions? Ideas for practice?"
        className="min-h-[200px] w-full resize-y rounded-md border-2 border-black bg-white p-3 text-sm placeholder:text-black/40 focus:border-green focus:outline-none"
      />

      {notes && (
        <p className="text-xs text-black/60">
          {notes.length} characters • {notes.split(/\s+/).filter(Boolean).length} words
        </p>
      )}
    </div>
  )
}

// ===== Checklist Panel =====
interface ChecklistItem {
  id: string
  label: string
  isRequired: boolean
}

interface ChecklistPanelProps {
  task: RoadmapTask
  week: RoadmapWeek
  checklistItems: ChecklistItem[]
  completedItems: string[]
  onToggleItem: (itemId: string) => void
  className?: string
}

const CHECKLIST_STORAGE_KEY = 'skillpath_checklist'

interface ChecklistState {
  [taskId: string]: string[]
}

function loadChecklistState(): ChecklistState {
  if (typeof window === 'undefined') return {}
  try {
    const stored = localStorage.getItem(CHECKLIST_STORAGE_KEY)
    return stored ? JSON.parse(stored) : {}
  } catch {
    return {}
  }
}

function saveChecklistState(state: ChecklistState) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(CHECKLIST_STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Ignore storage errors
  }
}

export function ChecklistPanel({
  task,
  week,
  checklistItems,
  completedItems,
  onToggleItem,
  className,
}: ChecklistPanelProps) {
  const completedCount = completedItems.length
  const totalCount = checklistItems.length
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  return (
    <div className={cn('space-y-4', className)}>
      {/* Progress */}
      <div className="rounded-md border-2 border-black bg-white p-3">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-bold">Checklist Progress</span>
          <span className="text-sm font-bold">{completedCount}/{totalCount}</span>
        </div>
        <div className="h-2 overflow-hidden rounded border-2 border-black bg-gray-200">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            className="h-full bg-black"
          />
        </div>
      </div>

      {/* Items */}
      <div className="space-y-2">
        {checklistItems.map((item) => {
          const isCompleted = completedItems.includes(item.id)
          return (
            <button
              key={item.id}
              onClick={() => onToggleItem(item.id)}
              className={cn(
                'flex w-full items-center gap-3 rounded-md border-2 border-black bg-white p-3 text-left transition-all hover:bg-gray-50',
                isCompleted && 'bg-green/10'
              )}
            >
              <div
                className={cn(
                  'flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 border-black',
                  isCompleted ? 'bg-green text-white' : 'bg-white'
                )}
              >
                {isCompleted ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Circle className="h-4 w-4" />
                )}
              </div>
              <span className={cn('flex-1 text-sm', isCompleted && 'line-through text-black/50')}>
                {item.label}
              </span>
              {item.isRequired && (
                <span className="rounded bg-yellow/20 px-1.5 py-0.5 text-[10px] font-bold">
                  Required
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ===== Quiz Panel =====
interface QuizPanelProps {
  task: RoadmapTask
  lockReason: string | null
  isLocked: boolean
  className?: string
}

export function QuizPanel({ task, lockReason, isLocked, className }: QuizPanelProps) {
  const quizPassed = task.quizPassed === true
  const quizRequired = task.quizRequired !== false

  if (!quizRequired) {
    return (
      <div className={cn('rounded-md border-2 border-black bg-white p-4', className)}>
        <p className="text-sm text-black/60">Quiz not required for this task.</p>
      </div>
    )
  }

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center gap-2">
        <FileText className="h-4 w-4" />
        <span className="text-sm font-bold">Quiz Assessment</span>
      </div>

      <div
        className={cn(
          'rounded-md border-2 border-black bg-white p-4',
          quizPassed && 'bg-green/10',
          isLocked && 'bg-gray-50'
        )}
      >
        <div className="mb-3 flex items-center gap-2">
          {quizPassed ? (
            <>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green text-white">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <span className="font-bold text-green">Quiz Passed</span>
            </>
          ) : isLocked ? (
            <>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-300 text-white">
                <Lock className="h-5 w-5" />
              </div>
              <span className="font-bold text-black/60">Quiz Locked</span>
            </>
          ) : (
            <>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow text-black">
                <Timer className="h-5 w-5" />
              </div>
              <span className="font-bold">Quiz Available</span>
            </>
          )}
        </div>

        <p className="mb-3 text-sm text-black/70">
          {quizPassed
            ? 'You have passed this quiz. Great job!'
            : isLocked
            ? lockReason || 'Complete the learning resources first to unlock this quiz.'
            : 'Test your knowledge by taking this quiz. You need 80% to pass.'}
        </p>

        {isLocked ? (
          <BrutalButton variant="outline" color="black" size="sm" disabled>
            <Lock className="mr-2 h-4 w-4" />
            Complete resources first
          </BrutalButton>
        ) : (
          <Link href={`/roadmap/tasks/${task.id}/quiz`} className="inline-flex">
            <BrutalButton
              variant={quizPassed ? 'outline' : 'primary'}
              color={quizPassed ? 'green' : 'black'}
              size="sm"
            >
              <Rocket className="mr-2 h-4 w-4" />
              {quizPassed ? 'Retry Quiz' : 'Start Quiz'}
            </BrutalButton>
          </Link>
        )}
      </div>
    </div>
  )
}

// ===== Mini Project Panel =====
interface MiniProjectPanelProps {
  task: RoadmapTask
  week: RoadmapWeek
  lockReason: string | null
  isLocked: boolean
  className?: string
}

export function MiniProjectPanel({
  task,
  week,
  lockReason,
  isLocked,
  className,
}: MiniProjectPanelProps) {
  const projectPassed = task.projectPassed === true
  const hasMiniProject = task.projectRequired === true || Boolean(week.miniProject)
  const miniProject = week.miniProject

  if (!hasMiniProject) {
    return (
      <div className={cn('rounded-md border-2 border-black bg-white p-4', className)}>
        <p className="text-sm text-black/60">No mini project for this task.</p>
      </div>
    )
  }

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center gap-2">
        <Rocket className="h-4 w-4" />
        <span className="text-sm font-bold">Mini Project</span>
      </div>

      <div
        className={cn(
          'rounded-md border-2 border-black bg-white p-4',
          projectPassed && 'bg-green/10',
          isLocked && 'bg-gray-50'
        )}
      >
        <div className="mb-3 flex items-center gap-2">
          {projectPassed ? (
            <>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green text-white">
                <Trophy className="h-5 w-5" />
              </div>
              <span className="font-bold text-green">Project Approved</span>
            </>
          ) : isLocked ? (
            <>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-300 text-white">
                <Lock className="h-5 w-5" />
              </div>
              <span className="font-bold text-black/60">Project Locked</span>
            </>
          ) : (
            <>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow text-black">
                <Rocket className="h-5 w-5" />
              </div>
              <span className="font-bold">Project Available</span>
            </>
          )}
        </div>

        {miniProject && (
          <>
            <p className="mb-2 font-bold">{miniProject.title}</p>
            <p className="mb-3 text-sm text-black/70">{miniProject.description}</p>

            <div className="mb-3 flex flex-wrap gap-2">
              {miniProject.skillsCovered.map((skill) => (
                <span
                  key={skill}
                  className="rounded border-2 border-black bg-white px-2 py-0.5 text-[10px] font-bold"
                >
                  {skill}
                </span>
              ))}
            </div>
          </>
        )}

        <p className="mb-3 text-sm text-black/70">
          {projectPassed
            ? 'Your project has been approved. Great work!'
            : isLocked
            ? lockReason || 'Pass the quiz first to unlock the mini project.'
            : 'Submit your mini project to demonstrate what you have learned.'}
        </p>

        {isLocked ? (
          <BrutalButton variant="outline" color="black" size="sm" disabled>
            <Lock className="mr-2 h-4 w-4" />
            Pass quiz first
          </BrutalButton>
        ) : (
          <Link href={`/roadmap/tasks/${task.id}/project`} className="inline-flex">
            <BrutalButton
              variant={projectPassed ? 'outline' : 'primary'}
              color={projectPassed ? 'green' : 'black'}
              size="sm"
            >
              <Rocket className="mr-2 h-4 w-4" />
              {projectPassed ? 'View Project' : 'Submit Project'}
            </BrutalButton>
          </Link>
        )}
      </div>
    </div>
  )
}

// ===== Learning Tabs =====
export type LearningTab = 'overview' | 'resources' | 'notes' | 'checklist' | 'quiz' | 'project'

interface LearningTabsProps {
  activeTab: LearningTab
  onTabChange: (tab: LearningTab) => void
  task: RoadmapTask
  week: RoadmapWeek
  onToggleChecklistItem: (itemId: string) => void
  className?: string
}

interface TabButtonProps {
  tab: LearningTab
  label: string
  icon: React.ReactNode
  isActive: boolean
  onClick: () => void
  badge?: string | number
}

function TabButton({ tab, label, icon, isActive, onClick, badge }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 rounded-md border-2 border-black px-3 py-2 text-sm font-bold transition-all',
        isActive
          ? 'bg-black text-white'
          : 'bg-white text-black hover:bg-gray-100'
      )}
    >
      {icon}
      {label}
      {badge !== undefined && (
        <span
          className={cn(
            'rounded px-1.5 py-0.5 text-[10px]',
            isActive ? 'bg-white text-black' : 'bg-black text-white'
          )}
        >
          {badge}
        </span>
      )}
    </button>
  )
}

export function LearningTabs({
  activeTab,
  onTabChange,
  task,
  week,
  onToggleChecklistItem,
  className,
}: LearningTabsProps) {
  const completedVideos = (task.resources ?? []).filter(
    (r) => r.resourceType === 'youtube' && r.isCompleted
  ).length
  const totalVideos = (task.resources ?? []).filter(
    (r) => r.resourceType === 'youtube'
  ).length
  const completedDocs = (task.resources ?? []).filter(
    (r) => (r.resourceType === 'docs' || r.resourceType === 'article') && r.isCompleted
  ).length
  const totalDocs = (task.resources ?? []).filter(
    (r) => r.resourceType === 'docs' || r.resourceType === 'article'
  ).length
  const quizPassed = task.quizPassed === true
  const projectPassed = task.projectPassed === true

  const tabs: { tab: LearningTab; label: string; icon: React.ReactNode }[] = [
    { tab: 'overview', label: 'Overview', icon: <BookOpen className="h-4 w-4" /> },
    { tab: 'resources', label: 'Resources', icon: <Play className="h-4 w-4" /> },
    { tab: 'notes', label: 'Notes', icon: <PenTool className="h-4 w-4" /> },
    { tab: 'checklist', label: 'Checklist', icon: <Clipboard className="h-4 w-4" /> },
    { tab: 'quiz', label: 'Quiz', icon: <FileText className="h-4 w-4" /> },
    { tab: 'project', label: 'Project', icon: <Rocket className="h-4 w-4" /> },
  ]

  return (
    <div className={cn('space-y-4', className)}>
      {/* Tab Buttons */}
      <div className="flex flex-wrap gap-2">
        {tabs.map(({ tab, label, icon }) => (
          <TabButton
            key={tab}
            tab={tab}
            label={label}
            icon={icon}
            isActive={activeTab === tab}
            onClick={() => onTabChange(tab)}
            badge={
              tab === 'resources'
                ? `${completedVideos + completedDocs}/${totalVideos + totalDocs}`
                : tab === 'quiz' && quizPassed
                ? 1
                : tab === 'project' && projectPassed
                ? 1
                : undefined
            }
          />
        ))}
      </div>

      {/* Tab Content */}
      <div className="rounded-md border-2 border-black bg-white p-4">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            <div>
              <h4 className="mb-2 text-sm font-bold">Task Description</h4>
              <p className="text-sm text-black/70">{task.description}</p>
            </div>
            <div>
              <h4 className="mb-2 text-sm font-bold">Deliverable</h4>
              <p className="text-sm text-black/70">{task.deliverable}</p>
            </div>
            <div>
              <h4 className="mb-2 text-sm font-bold">Why This Matters</h4>
              <p className="text-sm text-black/70">{week.goal}</p>
            </div>
          </div>
        )}

        {/* Resources Tab */}
        {activeTab === 'resources' && (
          <div>
            <p className="mb-4 text-sm text-black/60">
              Watch videos and read documentation to complete this task.
            </p>
            {/* Resources will be rendered by parent component via ResourceAccordion */}
          </div>
        )}

        {/* Notes Tab */}
        {activeTab === 'notes' && (
          <NotesPanel taskId={task.id} />
        )}

        {/* Checklist Tab */}
        {activeTab === 'checklist' && (
          <ChecklistWithResourceGate
            task={task}
            week={week}
            onToggleItem={onToggleChecklistItem}
          />
        )}

        {/* Quiz Tab */}
        {activeTab === 'quiz' && (
          <QuizPanel
            task={task}
            lockReason={null}
            isLocked={false}
          />
        )}

        {/* Project Tab */}
        {activeTab === 'project' && (
          <MiniProjectPanel
            task={task}
            week={week}
            lockReason={null}
            isLocked={false}
          />
        )}
      </div>
    </div>
  )
}

// ===== Checklist with Resource Gate =====
interface ChecklistWithResourceGateProps {
  task: RoadmapTask
  week: RoadmapWeek
  onToggleItem: (itemId: string) => void
}

export function ChecklistWithResourceGate({ task, week, onToggleItem }: ChecklistWithResourceGateProps) {
  const resources = task.resources ?? []
  const videoResources = resources.filter((r) => r.resourceType === 'youtube')
  const docResources = resources.filter((r) => r.resourceType === 'docs' || r.resourceType === 'article')

  const completedVideos = videoResources.filter((r) => r.isCompleted).length
  const completedDocs = docResources.filter((r) => r.isCompleted).length
  const hasVideoResource = videoResources.length > 0
  const hasDocsResource = docResources.length > 0

  const items: ChecklistItem[] = [
    {
      id: 'video',
      label: 'Watch 1 video lesson',
      isRequired: true,
    },
    {
      id: 'docs',
      label: 'Read 1 documentation resource',
      isRequired: true,
    },
    {
      id: 'quiz',
      label: 'Pass the quiz (80% or higher)',
      isRequired: true,
    },
  ]

  const completedItems: string[] = []
  if (hasVideoResource && completedVideos >= 1) completedItems.push('video')
  if (hasDocsResource && completedDocs >= 1) completedItems.push('docs')
  if (task.quizPassed) completedItems.push('quiz')

  return (
    <ChecklistPanel
      task={task}
      week={week}
      checklistItems={items}
      completedItems={completedItems}
      onToggleItem={onToggleItem}
    />
  )
}