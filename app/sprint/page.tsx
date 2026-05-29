'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { AppShell, Container } from '@/components/layout'
import { GradientBackground } from '@/components/layout'
import { DashboardHeader } from '@/components/layout/dashboard-header'
import { BrutalCard, BrutalButton, BrutalCardHover, ScoreBar, SkillBadge, StickerBadge } from '@/components/brutal'
import { PageScene } from '@/components/illustrations/page-scene'
import { CartoonBackground } from '@/components/illustrations/cartoon-background'
import { cn } from '@/lib/utils'
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
} from 'lucide-react'
import { WeeklySprint, SprintTask } from '@/types'

// Mock sprint data
const mockSprint: WeeklySprint = {
  id: 'sprint-1',
  weekStart: '2024-01-15',
  goal: 'Build a React API Dashboard',
  focusSkills: ['React', 'REST API', 'TypeScript'],
  progress: 60,
  createdAt: '2024-01-15',
  tasks: [
    { id: 'task-1', title: 'Learn React hooks basics', dayLabel: 'Monday', status: 'completed', completedAt: '2024-01-15' },
    { id: 'task-2', title: 'Setup React project with TypeScript', dayLabel: 'Monday', status: 'completed', completedAt: '2024-01-15' },
    { id: 'task-3', title: 'Build API fetching with useEffect', dayLabel: 'Tuesday', status: 'completed', completedAt: '2024-01-16' },
    { id: 'task-4', title: 'Create reusable dashboard components', dayLabel: 'Wednesday', status: 'todo' },
    { id: 'task-5', title: 'Build data visualization charts', dayLabel: 'Thursday', status: 'todo' },
    { id: 'task-6', title: 'Deploy to Vercel', dayLabel: 'Friday', status: 'todo' },
  ],
}

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

function getTodayLabel() {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' })
  return daysOfWeek.includes(today) ? today : 'Monday'
}

export default function SprintPage() {
  const [sprint, setSprint] = useState<WeeklySprint>(mockSprint)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [selectedDay, setSelectedDay] = useState<string>(() => getTodayLabel())
  const [isEditingGoal, setIsEditingGoal] = useState(false)
  const [editedGoal, setEditedGoal] = useState(sprint.goal)
  const [reflection, setReflection] = useState('')

  const toggleTask = (taskId: string) => {
    setSprint((prev) => {
      const newTasks = prev.tasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              status: (task.status === 'completed' ? 'todo' : 'completed') as 'todo' | 'completed',
              completedAt: task.status === 'completed' ? undefined : new Date().toISOString(),
            }
          : task
      )
      const completedTasks = newTasks.filter((t) => t.status === 'completed').length
      const progress = Math.round((completedTasks / newTasks.length) * 100)
      return { ...prev, tasks: newTasks, progress }
    })
  }

  const addTask = () => {
    if (!newTaskTitle.trim()) return

    const newTask: SprintTask = {
      id: `task-${Date.now()}`,
      title: newTaskTitle,
      dayLabel: selectedDay,
      status: 'todo',
    }

    setSprint((prev) => ({
      ...prev,
      tasks: [...prev.tasks, newTask],
    }))

    setNewTaskTitle('')
  }

  const deleteTask = (taskId: string) => {
    setSprint((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((t) => t.id !== taskId),
    }))
  }

  const saveGoal = () => {
    setSprint((prev) => ({ ...prev, goal: editedGoal }))
    setIsEditingGoal(false)
  }

  const completedTasks = sprint.tasks.filter((t) => t.status === 'completed').length
  const totalTasks = sprint.tasks.length
  const todayLabel = getTodayLabel()

  // Group tasks by day
  const tasksByDay = daysOfWeek.reduce((acc, day) => {
    acc[day] = sprint.tasks.filter((t) => t.dayLabel === day)
    return acc
  }, {} as Record<string, SprintTask[]>)

  return (
    <AppShell showBottomNav={true}>
      <CartoonBackground variant="sprint" intensity="normal" showDoodles animated />
      <GradientBackground />

      {/* Main Content */}
      <div className="flex-1">
        <DashboardHeader
          icon={ListTodo}
          iconColor="green"
          title="Weekly Quest Board"
          subtitle="Complete your missions"
        />

        <Container className="py-6">
          <PageScene variant="sprint" className="mb-6" />

          {/* Streak and Week Info */}
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
              <p className="text-2xl font-bold">{sprint.progress}%</p>
              <p className="text-xs text-black/70">Progress</p>
            </BrutalCard>
          </div>

          {/* Current Goal */}
          <BrutalCard color="yellow" className="mb-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex-1">
                <h3 className="font-display font-bold text-lg mb-1">This Week&apos;s Goal</h3>
                {isEditingGoal ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={editedGoal}
                      onChange={(e) => setEditedGoal(e.target.value)}
                      className="flex-1 px-3 py-2 brutal-border brutal-radius bg-white"
                      autoFocus
                    />
                    <BrutalButton color="green" size="sm" onClick={saveGoal}>
                      <Save className="w-4 h-4" />
                    </BrutalButton>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <p className="text-xl">{sprint.goal}</p>
                    <button
                      onClick={() => {
                        setEditedGoal(sprint.goal)
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
              <ScoreBar score={sprint.progress} color="black" showPercentage />
            </div>

            <div className="flex flex-wrap gap-2">
              {sprint.focusSkills.map((skill) => (
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
                {daysOfWeek.map((day) => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
              <BrutalButton color="green" onClick={addTask}>
                <Plus className="w-4 h-4 mr-2" />
                Add
              </BrutalButton>
            </div>
          </BrutalCard>

          {/* Daily Board */}
          <div className="mb-6 -mx-4 overflow-x-auto px-4 pb-3">
            <div className="flex min-w-max gap-4 lg:min-w-0">
              {daysOfWeek.map((day) => {
                const isSelected = day === selectedDay
                const isToday = day === todayLabel
                const dayTasks = tasksByDay[day]

                return (
                  <section
                    key={day}
                    className={cn(
                      'flex w-[232px] shrink-0 flex-col brutal-border brutal-radius bg-white/90 p-3 shadow-brutal-sm transition-colors lg:flex-1',
                      isToday && 'bg-yellow/30',
                      isSelected && 'ring-2 ring-black'
                    )}
                    aria-label={`${day} sprint tasks`}
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

          {/* Navigation */}
          <div className="flex justify-between">
            <BrutalButton variant="ghost" color="black">
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous Week
            </BrutalButton>
            <BrutalButton color="blue">
              Next Week
              <ChevronRight className="w-4 h-4 ml-2" />
            </BrutalButton>
          </div>
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
        'min-h-[88px] p-3 brutal-border brutal-radius text-sm transition-colors',
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
