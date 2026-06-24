'use client'

import { useEffect, useMemo, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { AppShell, Container, GradientBackground } from '@/components/layout'
import { DashboardHeader } from '@/components/layout/dashboard-header'
import { BrutalCard, BrutalButton, BrutalCardHover, ScoreBar, SkillBadge, StickerBadge } from '@/components/brutal'
import { PageScene } from '@/components/illustrations/page-scene'
import { cn } from '@/lib/utils'
import { createSupabaseBrowserClient } from '@/lib/supabase/browser'
import {
  Calendar,
  Plus,
  Check,
  Circle,
  Flame,
  Edit3,
  Trash2,
  Save,
  ChevronLeft,
  ChevronRight,
  ListTodo,
  AlertCircle,
  RefreshCw,
  CheckCircle2,
  Trash,
} from 'lucide-react'

interface SprintRow {
  id: string
  week_start: string
  goal: string | null
  focus_skills: string[] | null
  progress: number | null
  created_at: string
  updated_at: string
}

interface SprintTaskRow {
  id: string
  sprint_id: string
  title: string
  description: string | null
  day_label: string | null
  status: 'todo' | 'in_progress' | 'completed'
  completed_at: string | null
  created_at: string
}

interface SprintData {
  id: string
  weekStart: string
  goal: string
  focusSkills: string[]
  progress: number
  tasks: SprintTask[]
  createdAt: string
}

interface SprintTask {
  id: string
  title: string
  description?: string
  dayLabel: string
  status: 'todo' | 'in_progress' | 'completed'
  completedAt?: string
}

type SprintMode = 'loading' | 'supabase' | 'demo' | 'error'
type SaveState = 'idle' | 'saving' | 'saved' | 'error'

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

function getCurrentWeekStart(): string {
  const now = new Date()
  const day = now.getDay()
  const diff = now.getDate() - day + (day === 0 ? -6 : 1) // Adjust for Monday start
  const monday = new Date(now.setDate(diff))
  return monday.toISOString().split('T')[0]
}

function getTodayLabel(): string {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' })
  return DAYS_OF_WEEK.includes(today) ? today : 'Monday'
}

export default function SprintPage() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), [])

  const [sprint, setSprint] = useState<SprintData | null>(null)
  const [mode, setMode] = useState<SprintMode>('loading')
  const [isDemoMode, setIsDemoMode] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saveState, setSaveState] = useState<SaveState>('idle')
  const [saveMessage, setSaveMessage] = useState<string | null>(null)

  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [selectedDay, setSelectedDay] = useState<string>(() => getTodayLabel())
  const [isEditingGoal, setIsEditingGoal] = useState(false)
  const [editedGoal, setEditedGoal] = useState('')
  const [reflection, setReflection] = useState('')

  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  // Load sprint from Supabase
  useEffect(() => {
    let isActive = true

    const loadSprint = async () => {
      if (!supabase) {
        if (isActive) {
          setIsDemoMode(true)
          setMode('demo')
        }
        return
      }

      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()

        if (userError) {
          if (isActive) {
            setError(`Failed to validate session: ${userError.message}`)
            setMode('error')
          }
          return
        }

        if (!user) {
          if (isActive) {
            setIsDemoMode(true)
            setMode('demo')
          }
          return
        }

        setCurrentUserId(user.id)

        // Get current week's sprint. Older data may contain duplicate rows for
        // the same (user, week_start); take the most recent one instead of
        // letting .single() throw "multiple rows returned".
        const weekStart = getCurrentWeekStart()
        const { data: sprintRow, error: sprintError } = await supabase
          .from('weekly_sprints')
          .select('id, week_start, goal, focus_skills, progress, created_at, updated_at')
          .eq('user_id', user.id)
          .eq('week_start', weekStart)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()

        if (sprintError) {
          if (isActive) {
            setError(`Failed to load sprint: ${sprintError.message}`)
            setMode('error')
          }
          return
        }

        if (sprintRow) {
          // Load tasks for this sprint
          const { data: taskRows, error: taskError } = await supabase
            .from('sprint_tasks')
            .select('id, sprint_id, title, description, day_label, status, completed_at, created_at')
            .eq('sprint_id', (sprintRow as SprintRow).id)
            .order('created_at', { ascending: true })

          if (taskError) {
            if (isActive) {
              setError(`Failed to load sprint tasks: ${taskError.message}`)
              setMode('error')
            }
            return
          }

          const typedRow = sprintRow as SprintRow
          const typedTasks = (taskRows ?? []) as SprintTaskRow[]

          if (isActive) {
            setSprint({
              id: typedRow.id,
              weekStart: typedRow.week_start,
              goal: typedRow.goal ?? 'Complete weekly goals',
              focusSkills: typedRow.focus_skills ?? [],
              progress: typedRow.progress ?? 0,
              tasks: typedTasks.map((t) => ({
                id: t.id,
                title: t.title,
                description: t.description ?? undefined,
                dayLabel: t.day_label ?? 'Monday',
                status: t.status,
                completedAt: t.completed_at ?? undefined,
              })),
              createdAt: typedRow.created_at,
            })
            setEditedGoal(typedRow.goal ?? 'Complete weekly goals')
            setMode('supabase')
            setIsDemoMode(false)
          }
        } else {
          // No sprint for this week - create a new one
          const { data: newSprint, error: insertError } = await supabase
            .from('weekly_sprints')
            .insert({
              user_id: user.id,
              week_start: weekStart,
              goal: 'Complete weekly goals',
              focus_skills: [],
              progress: 0,
            })
            .select('id, week_start, goal, focus_skills, progress, created_at, updated_at')
            .single()

          if (insertError) {
            if (isActive) {
              setError(`Failed to create sprint: ${insertError.message}`)
              setMode('error')
            }
            return
          }

          if (isActive && newSprint) {
            const typedRow = newSprint as SprintRow
            setSprint({
              id: typedRow.id,
              weekStart: typedRow.week_start,
              goal: typedRow.goal ?? 'Complete weekly goals',
              focusSkills: typedRow.focus_skills ?? [],
              progress: typedRow.progress ?? 0,
              tasks: [],
              createdAt: typedRow.created_at,
            })
            setEditedGoal(typedRow.goal ?? 'Complete weekly goals')
            setMode('supabase')
            setIsDemoMode(false)
          }
        }
      } catch (err) {
        if (isActive) {
          setError(err instanceof Error ? err.message : 'Failed to load sprint')
          setMode('error')
        }
      }
    }

    loadSprint()

    return () => {
      isActive = false
    }
  }, [supabase])

  const toggleTask = useCallback(async (taskId: string) => {
    if (!sprint || isDemoMode || !currentUserId) return

    const task = sprint.tasks.find((t) => t.id === taskId)
    if (!task) return

    const nextStatus: 'todo' | 'completed' = task.status === 'completed' ? 'todo' : 'completed'
    const completedAt = nextStatus === 'completed' ? new Date().toISOString() : null

    // Optimistic update
    setSprint((prev) => {
      if (!prev) return prev
      const tasks = prev.tasks.map((t) =>
        t.id === taskId ? { ...t, status: nextStatus, completedAt: completedAt ?? undefined } : t
      )
      const completedCount = tasks.filter((t) => t.status === 'completed').length
      const progress = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0
      return { ...prev, tasks, progress }
    })

    // Persist to Supabase
    try {
      if (!supabase) return

      const { error } = await supabase
        .from('sprint_tasks')
        .update({
          status: nextStatus,
          completed_at: completedAt,
        })
        .eq('id', taskId)

      if (error) throw error

      // Update sprint progress
      const updatedSprint = sprint.tasks.map((t) =>
        t.id === taskId ? { ...t, status: nextStatus, completedAt: completedAt ?? undefined } : t
      )
      const completedCount = updatedSprint.filter((t) => t.status === 'completed').length
      const progress = updatedSprint.length > 0 ? Math.round((completedCount / updatedSprint.length) * 100) : 0

      await supabase
        .from('weekly_sprints')
        .update({ progress })
        .eq('id', sprint.id)

      setSaveState('saved')
      setSaveMessage('Task updated!')
      setTimeout(() => setSaveState('idle'), 2000)
    } catch (err) {
      // Revert optimistic update
      setSprint((prev) => {
        if (!prev) return prev
        const tasks = prev.tasks.map((t) =>
          t.id === taskId ? { ...t, status: task.status, completedAt: task.completedAt } : t
        )
        return { ...prev, tasks }
      })
      setSaveState('error')
      setSaveMessage(err instanceof Error ? err.message : 'Failed to update task')
      setTimeout(() => setSaveState('idle'), 3000)
    }
  }, [sprint, isDemoMode, currentUserId, supabase])

  const addTask = useCallback(async () => {
    if (!newTaskTitle.trim() || !sprint || isDemoMode || !currentUserId) return

    const newTask: SprintTask = {
      id: crypto.randomUUID(),
      title: newTaskTitle.trim(),
      dayLabel: selectedDay,
      status: 'todo',
    }

    // Optimistic update
    setSprint((prev) => {
      if (!prev) return prev
      return { ...prev, tasks: [...prev.tasks, newTask] }
    })
    setNewTaskTitle('')

    try {
      if (!supabase) return
      const { data, error } = await supabase
        .from('sprint_tasks')
        .insert({
          sprint_id: sprint.id,
          user_id: currentUserId,
          title: newTask.title,
          day_label: newTask.dayLabel,
          status: 'todo',
        })
        .select('id, sprint_id, title, description, day_label, status, completed_at, created_at')
        .single()

      if (error) throw error

      const typedData = data as SprintTaskRow

      // Update with real ID
      setSprint((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          tasks: prev.tasks.map((t) =>
            t.id === newTask.id ? { ...t, id: typedData.id } : t
          ),
        }
      })

      setSaveState('saved')
      setSaveMessage('Task added!')
      setTimeout(() => setSaveState('idle'), 2000)
    } catch (err) {
      // Revert optimistic update
      setSprint((prev) => {
        if (!prev) return prev
        return { ...prev, tasks: prev.tasks.filter((t) => t.id !== newTask.id) }
      })
      setSaveState('error')
      setSaveMessage(err instanceof Error ? err.message : 'Failed to add task')
      setTimeout(() => setSaveState('idle'), 3000)
    }
  }, [newTaskTitle, selectedDay, sprint, isDemoMode, currentUserId, supabase])

  const deleteTask = useCallback(async (taskId: string) => {
    if (!sprint || isDemoMode || !currentUserId) return

    const task = sprint.tasks.find((t) => t.id === taskId)
    if (!task) return

    // Optimistic update
    setSprint((prev) => {
      if (!prev) return prev
      const tasks = prev.tasks.filter((t) => t.id !== taskId)
      const completedCount = tasks.filter((t) => t.status === 'completed').length
      const progress = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0
      return { ...prev, tasks, progress }
    })

    try {
      if (!supabase) return
      const { error } = await supabase
        .from('sprint_tasks')
        .delete()
        .eq('id', taskId)

      if (error) throw error

      // Update sprint progress
      const tasks = sprint.tasks.filter((t) => t.id !== taskId)
      const completedCount = tasks.filter((t) => t.status === 'completed').length
      const progress = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0

      await supabase
        .from('weekly_sprints')
        .update({ progress })
        .eq('id', sprint.id)

      setSaveState('saved')
      setSaveMessage('Task deleted!')
      setTimeout(() => setSaveState('idle'), 2000)
    } catch (err) {
      // Revert optimistic update
      setSprint((prev) => {
        if (!prev) return prev
        return { ...prev, tasks: [...prev.tasks, task] }
      })
      setSaveState('error')
      setSaveMessage(err instanceof Error ? err.message : 'Failed to delete task')
      setTimeout(() => setSaveState('idle'), 3000)
    }
  }, [sprint, isDemoMode, currentUserId, supabase])

  const saveGoal = useCallback(async () => {
    if (!sprint || isDemoMode || !currentUserId) {
      // Demo mode - just update local state
      setSprint((prev) => prev ? { ...prev, goal: editedGoal } : prev)
      setIsEditingGoal(false)
      return
    }

    setSaveState('saving')
    setSaveMessage('Saving goal...')

    try {
      if (!supabase) return
      const { error } = await supabase
        .from('weekly_sprints')
        .update({ goal: editedGoal })
        .eq('id', sprint.id)

      if (error) throw error

      setSprint((prev) => prev ? { ...prev, goal: editedGoal } : prev)
      setIsEditingGoal(false)
      setSaveState('saved')
      setSaveMessage('Goal saved!')
      setTimeout(() => setSaveState('idle'), 2000)
    } catch (err) {
      setSaveState('error')
      setSaveMessage(err instanceof Error ? err.message : 'Failed to save goal')
      setTimeout(() => setSaveState('idle'), 3000)
    }
  }, [editedGoal, sprint, isDemoMode, currentUserId, supabase])

  const completedTasks = sprint?.tasks.filter((t) => t.status === 'completed').length ?? 0
  const totalTasks = sprint?.tasks.length ?? 0
  const todayLabel = getTodayLabel()

  // Group tasks by day
  const tasksByDay = DAYS_OF_WEEK.reduce((acc, day) => {
    acc[day] = sprint?.tasks.filter((t) => t.dayLabel === day) ?? []
    return acc
  }, {} as Record<string, SprintTask[]>)

  if (mode === 'loading') {
    return (
      <AppShell showBottomNav={true}>
        <GradientBackground />
        <DashboardHeader
          icon={ListTodo}
          iconColor="green"
          title="Weekly Quest Board"
          subtitle="Complete your missions"
        />
        <Container className="py-6">
          <BrutalCard color="white" className="text-center py-12">
            <div className="flex items-center justify-center gap-4">
              <RefreshCw className="w-6 h-6 animate-spin" />
              <p className="font-bold">Loading your sprint...</p>
            </div>
          </BrutalCard>
        </Container>
      </AppShell>
    )
  }

  if (mode === 'error') {
    return (
      <AppShell showBottomNav={true}>
        <GradientBackground />
        <DashboardHeader
          icon={ListTodo}
          iconColor="green"
          title="Weekly Quest Board"
          subtitle="Complete your missions"
        />
        <Container className="py-6">
          <BrutalCard color="red" className="mb-6 flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <p className="font-bold">Failed to load sprint</p>
              <p className="text-sm">{error}</p>
            </div>
          </BrutalCard>
          <BrutalButton color="yellow" onClick={() => window.location.reload()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </BrutalButton>
        </Container>
      </AppShell>
    )
  }

  return (
    <AppShell showBottomNav={true}>
      <GradientBackground />

      <div className="flex-1">
        <DashboardHeader
          icon={ListTodo}
          iconColor="green"
          title="Weekly Quest Board"
          subtitle="Complete your missions"
        />

        <Container className="py-6">
          <PageScene variant="sprint" className="mb-6" />

          {/* Demo Mode Banner */}
          {isDemoMode && (
            <BrutalCard color="yellow" className="mb-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-yellow/30 brutal-border brutal-radius flex items-center justify-center shrink-0">
                  <span className="text-2xl">🐱</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-display font-bold text-lg mb-1">Demo Mode</h3>
                  <p className="text-sm text-black/70">
                    Sprint tasks are not being saved. Sign in to persist your weekly goals.
                  </p>
                </div>
              </div>
            </BrutalCard>
          )}

          {/* Save Status */}
          {saveMessage && (
            <BrutalCard
              color={saveState === 'error' ? 'red' : saveState === 'saved' ? 'green' : 'white'}
              className="mb-6 flex items-center gap-3"
            >
              {saveState === 'saving' && <RefreshCw className="w-5 h-5 animate-spin shrink-0" />}
              {saveState === 'saved' && <CheckCircle2 className="w-5 h-5 shrink-0" />}
              {saveState === 'error' && <AlertCircle className="w-5 h-5 shrink-0" />}
              <p className="font-medium">{saveMessage}</p>
            </BrutalCard>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <BrutalCard color="orange" className="text-center">
              <Flame className="w-8 h-8 mx-auto mb-2" />
              <p className="text-2xl font-bold">5</p>
              <p className="text-xs text-black/70">Day Streak</p>
            </BrutalCard>
            <BrutalCard color="blue" className="text-center">
              <Calendar className="w-8 h-8 mx-auto mb-2" />
              <p className="text-2xl font-bold">Week 3</p>
              <p className="text-xs text-black/70">This Sprint</p>
            </BrutalCard>
            <BrutalCard color="green" className="text-center">
              <Check className="w-8 h-8 mx-auto mb-2" />
              <p className="text-2xl font-bold">{completedTasks}/{totalTasks}</p>
              <p className="text-xs text-black/70">Tasks Done</p>
            </BrutalCard>
            <BrutalCard color="pink" className="text-center">
              <p className="text-2xl font-bold">{sprint?.progress ?? 0}%</p>
              <p className="text-xs text-black/70">Progress</p>
            </BrutalCard>
          </div>

          {/* Current Goal */}
          <BrutalCard color="yellow" className="mb-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex-1">
                <h3 className="font-display font-bold text-lg mb-1">This Week&apos;s Goal</h3>
                {isEditingGoal ? (
                  <div className="flex gap-2 flex-col sm:flex-row">
                    <input
                      type="text"
                      value={editedGoal}
                      onChange={(e) => setEditedGoal(e.target.value)}
                      className="flex-1 px-3 py-2 brutal-border brutal-radius bg-white"
                      autoFocus
                    />
                    <BrutalButton color="green" size="sm" onClick={saveGoal} loading={saveState === 'saving'}>
                      <Save className="w-4 h-4" />
                    </BrutalButton>
                    <BrutalButton variant="ghost" color="black" size="sm" onClick={() => setIsEditingGoal(false)}>
                      Cancel
                    </BrutalButton>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <p className="text-xl">{sprint?.goal}</p>
                    <button
                      onClick={() => {
                        setEditedGoal(sprint?.goal ?? '')
                        setIsEditingGoal(true)
                      }}
                      className="p-1 hover:bg-black/10 brutal-radius"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="mb-3">
              <ScoreBar score={sprint?.progress ?? 0} color="black" showPercentage />
            </div>

            <div className="flex flex-wrap gap-2">
              {sprint?.focusSkills.map((skill) => (
                <SkillBadge key={skill} name={skill} color="orange" />
              ))}
            </div>
          </BrutalCard>

          {/* Add Task */}
          <BrutalCard color="white" className="mb-6">
            <h3 className="font-bold mb-3">Add New Task</h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="What do you want to accomplish?"
                className="flex-1 px-4 py-3 brutal-border brutal-radius"
                onKeyDown={(e) => e.key === 'Enter' && addTask()}
              />
              <select
                value={selectedDay}
                onChange={(e) => setSelectedDay(e.target.value)}
                className="px-4 py-3 brutal-border brutal-radius bg-white"
              >
                {DAYS_OF_WEEK.map((day) => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
              <BrutalButton color="green" onClick={addTask} disabled={!newTaskTitle.trim() || isDemoMode}>
                <Plus className="w-4 h-4 mr-2" />
                Add
              </BrutalButton>
            </div>
          </BrutalCard>

          {/* Daily Board */}
          <div className="mb-6 -mx-4 overflow-x-auto px-4 pb-3">
            <div className="flex min-w-max gap-4 lg:min-w-0">
              {DAYS_OF_WEEK.map((day) => {
                const isSelected = day === selectedDay
                const isToday = day === todayLabel
                const dayTasks = tasksByDay[day]

                return (
                  <section
                    key={day}
                    className={cn(
                      'flex w-[232px] shrink-0 flex-col brutal-border brutal-radius bg-white/90 p-3 shadow-brutal-sm',
                      isToday && 'bg-yellow/30',
                      isSelected && 'ring-2 ring-black'
                    )}
                  >
                    <button
                      onClick={() => setSelectedDay(day)}
                      className={cn(
                        'mb-3 flex min-h-12 items-center justify-between gap-2 rounded-md border-2 border-black px-3 py-2 text-left font-bold transition-all',
                        isSelected ? 'bg-blue text-white' : 'bg-gray-100 hover:bg-yellow/40'
                      )}
                    >
                      <span>{day}</span>
                      {isToday && (
                        <span className={cn(
                          'rounded-sm border-2 border-black px-2 py-0.5 text-[10px] font-bold uppercase',
                          isSelected ? 'bg-white text-black' : 'bg-green text-black'
                        )}>
                          Today
                        </span>
                      )}
                    </button>

                    <div className="flex flex-1 flex-col gap-3">
                      {dayTasks.length > 0 ? (
                        dayTasks.map((task) => (
                          <SprintTaskCard
                            key={task.id}
                            task={task}
                            onToggle={() => toggleTask(task.id)}
                            onDelete={() => deleteTask(task.id)}
                          />
                        ))
                      ) : (
                        <div className="flex min-h-[96px] items-center justify-center rounded-md border-2 border-dashed border-black/30 bg-gray-50 p-3 text-center text-sm font-medium text-black/50">
                          No tasks yet
                        </div>
                      )}
                    </div>
                  </section>
                )
              })}
            </div>
          </div>

          {/* Reflection */}
          <BrutalCard color="purple" className="mb-6">
            <h3 className="font-display font-bold text-lg mb-3">Weekly Reflection</h3>
            <textarea
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              placeholder="What did you learn this week? What were the challenges? What will you do differently next week?"
              className="w-full h-32 px-4 py-3 brutal-border brutal-radius bg-white resize-none"
            />
            <p className="text-sm text-black/50 mt-2">
              Reflections help you track your learning journey
            </p>
          </BrutalCard>
        </Container>
      </div>
    </AppShell>
  )
}

function SprintTaskCard({
  task,
  onToggle,
  onDelete,
}: {
  task: SprintTask
  onToggle: () => void
  onDelete: () => void
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.18 }}
      className={cn(
        'min-h-[88px] p-3 brutal-border brutal-radius text-sm',
        task.status === 'completed'
          ? 'bg-green/20 border-green'
          : 'bg-white hover:bg-yellow/10'
      )}
    >
      <div className="flex items-start gap-2">
        <button
          onClick={onToggle}
          className="mt-0.5 shrink-0 rounded-sm focus:outline-none focus:ring-2 focus:ring-black"
          aria-label={task.status === 'completed' ? 'Mark task as todo' : 'Mark task as complete'}
        >
          {task.status === 'completed' ? (
            <Check className="w-5 h-5 text-green" />
          ) : (
            <Circle className="w-5 h-5" />
          )}
        </button>
        <p className={cn(
          'flex-1 whitespace-normal break-words leading-5',
          task.status === 'completed' && 'text-black/65 line-through decoration-2'
        )}>
          {task.title}
        </p>
        <button
          onClick={onDelete}
          className="p-1 hover:bg-red/10 brutal-radius text-red opacity-60 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-black"
          aria-label="Delete task"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  )
}