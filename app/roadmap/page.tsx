'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { AppShell, Container, GradientBackground } from '@/components/layout'
import { DashboardHeader } from '@/components/layout/dashboard-header'
import { BrutalCard, BrutalButton, BrutalCardHover, SkillBadge, ScoreBar } from '@/components/brutal'
import { generateFallbackRoadmap } from '@/lib/ai'
import { cn } from '@/lib/utils'
import {
  ArrowLeft,
  RefreshCw,
  Check,
  Circle,
  ChevronDown,
  ChevronUp,
  Clock,
  Zap,
  Target,
} from 'lucide-react'
import { Roadmap, RoadmapTask } from '@/types'

// Mock saved roadmap
const mockSavedRoadmap = generateFallbackRoadmap({
  targetRole: 'frontend-developer',
  currentLevel: 'beginner',
  missingSkills: ['TypeScript', 'Testing', 'API Integration'],
  studyTime: '1hour',
  durationWeeks: 6,
})

export default function RoadmapPage() {
  const [roadmap, setRoadmap] = useState<Roadmap>(mockSavedRoadmap)
  const [expandedWeek, setExpandedWeek] = useState<number | null>(0)
  const [isGenerating, setIsGenerating] = useState(false)

  const toggleTask = (weekIndex: number, taskId: string) => {
    setRoadmap((prev) => {
      const newWeeks = [...prev.weeks]
      const week = { ...newWeeks[weekIndex] }
      const taskIndex = week.tasks.findIndex((t) => t.id === taskId)

      if (taskIndex !== -1) {
        const newTasks = [...week.tasks]
        const task = { ...newTasks[taskIndex] }
        task.status = task.status === 'completed' ? 'todo' : 'completed'
        newTasks[taskIndex] = task
        week.tasks = newTasks
        newWeeks[weekIndex] = week
      }

      return { ...prev, weeks: newWeeks }
    })
  }

  const toggleWeek = (weekIndex: number) => {
    setExpandedWeek(expandedWeek === weekIndex ? null : weekIndex)
  }

  const calculateWeekProgress = (week: Roadmap['weeks'][0]) => {
    const completed = week.tasks.filter((t) => t.status === 'completed').length
    return Math.round((completed / week.tasks.length) * 100)
  }

  const calculateOverallProgress = () => {
    const totalTasks = roadmap.weeks.reduce((sum, w) => sum + w.tasks.length, 0)
    const completedTasks = roadmap.weeks.reduce(
      (sum, w) => sum + w.tasks.filter((t) => t.status === 'completed').length,
      0
    )
    return totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
  }

  const regenerateRoadmap = () => {
    setIsGenerating(true)
    // Simulate AI generation
    setTimeout(() => {
      setRoadmap(generateFallbackRoadmap({
        targetRole: 'frontend-developer',
        currentLevel: 'intermediate',
        missingSkills: ['TypeScript', 'Testing'],
        studyTime: '2hours',
        durationWeeks: 6,
      }))
      setIsGenerating(false)
    }, 2000)
  }

  return (
    <AppShell showBottomNav={true}>
      <GradientBackground />

      {/* Main Content */}
      <div className="flex-1">
        <DashboardHeader title="AI Roadmap" subtitle="Follow this fallback-safe path to your goal" />

        <Container className="py-6">
          {/* Roadmap Header */}
          <BrutalCard color="yellow" className="mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <h2 className="font-display font-bold text-2xl mb-1">{roadmap.title}</h2>
                <p className="text-black/70">{roadmap.summary}</p>
                {roadmap.source === 'fallback' && (
                  <p className="mt-2 text-sm font-bold text-black/70">
                    Fallback roadmap active. Add `GEMINI_API_KEY` later to enable AI generation.
                  </p>
                )}
              </div>
              <BrutalButton
                color="black"
                onClick={regenerateRoadmap}
                loading={isGenerating}
              >
                <RefreshCw className={cn('w-4 h-4 mr-2', isGenerating && 'animate-spin')} />
                Regenerate
              </BrutalButton>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                <span>{roadmap.durationWeeks} weeks</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                <span>{roadmap.weeks.reduce((sum, w) => sum + w.tasks.length, 0)} tasks</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                <span>{roadmap.source === 'ai' ? 'AI Generated' : 'Template'}</span>
              </div>
            </div>

            <div className="mt-4">
              <ScoreBar
                score={calculateOverallProgress()}
                label="Overall Progress"
                color="black"
              />
            </div>
          </BrutalCard>

          {/* Week Cards */}
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
                    {/* Week Header */}
                    <button
                      onClick={() => toggleWeek(weekIndex)}
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

                    {/* Week Progress Bar */}
                    <div className="h-2 bg-black/10">
                      <div
                        className="h-full bg-black transition-all duration-300"
                        style={{ width: `${weekProgress}%` }}
                      />
                    </div>

                    {/* Expandable Content */}
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
                            {/* Focus Skills */}
                            <div className="mb-4">
                              <h4 className="font-bold mb-2">Focus Skills</h4>
                              <div className="flex flex-wrap gap-2">
                                {week.focusSkills.map((skill) => (
                                  <SkillBadge key={skill} name={skill} color="yellow" />
                                ))}
                              </div>
                            </div>

                            {/* Tasks */}
                            <div className="space-y-2 mb-4">
                              <h4 className="font-bold">Tasks</h4>
                              {week.tasks.map((task) => (
                                <TaskItem
                                  key={task.id}
                                  task={task}
                                  onToggle={() => toggleTask(weekIndex, task.id)}
                                />
                              ))}
                            </div>

                            {/* Mini Project */}
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

          {/* Final Portfolio Project */}
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
        </Container>
      </div>
    </AppShell>
  )
}

function TaskItem({
  task,
  onToggle,
}: {
  task: RoadmapTask
  onToggle: () => void
}) {
  const difficultyColors = {
    easy: 'text-green',
    medium: 'text-yellow',
    hard: 'text-red',
  }

  return (
    <div
      onClick={onToggle}
      className={cn(
        'p-3 brutal-border brutal-radius cursor-pointer transition-all flex items-start gap-3',
        task.status === 'completed'
          ? 'bg-green/10 border-green'
          : 'bg-white hover:bg-gray-50'
      )}
    >
      <div className="mt-0.5">
        {task.status === 'completed' ? (
          <Check className="w-5 h-5 text-green" />
        ) : (
          <Circle className="w-5 h-5" />
        )}
      </div>
      <div className="flex-1">
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
        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {task.estimatedTime}
          </span>
          <span>{task.deliverable}</span>
        </div>
      </div>
    </div>
  )
}
