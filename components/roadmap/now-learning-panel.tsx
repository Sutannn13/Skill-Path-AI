'use client'

import { motion } from 'framer-motion'
import { BookOpen, ChevronRight, Clock, PlayCircle, Target, Zap } from 'lucide-react'
import { Roadmap, RoadmapTask, RoadmapWeek } from '@/types'
import { BrutalButton, BrutalCard } from '@/components/brutal'
import { CatMascot } from '@/components/illustrations/cat-mascot'
import { cn } from '@/lib/utils'
import { calculateOverallProgress, calculateWeekProgress, getCompletedTaskCount } from '@/lib/roadmap/progress'

interface NowLearningPanelProps {
  roadmap: Roadmap
  currentWeek: RoadmapWeek
  currentTask: RoadmapTask
  nextAction: string
  onContinue: () => void
  className?: string
}

export function NowLearningPanel({
  roadmap,
  currentWeek,
  currentTask,
  nextAction,
  onContinue,
  className,
}: NowLearningPanelProps) {
  const weekProgress = calculateWeekProgress(currentWeek)
  const totalTasks = roadmap.weeks.reduce((sum, w) => sum + w.tasks.length, 0)
  const completedTasks = getCompletedTaskCount(roadmap)
  const overallProgress = calculateOverallProgress(roadmap)

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('', className)}
    >
      <BrutalCard color="green" className="overflow-hidden">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* Left Section: Now Learning */}
          <div className="flex items-start gap-4">
            <div className="hidden shrink-0 sm:block">
              <CatMascot className="h-16 w-16" mood="cheer" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <span className="flex items-center gap-1 rounded-md border-2 border-black bg-yellow px-2 py-0.5 text-xs font-bold">
                  <Zap className="h-3 w-3" />
                  Now Learning
                </span>
                <span className="text-xs font-medium text-black/60">
                  {roadmap.title}
                </span>
              </div>

              <div className="mb-2 flex items-center gap-2 text-sm text-black/70">
                <span className="rounded bg-white px-1.5 py-0.5 font-bold border-2 border-black">
                  Module {currentWeek.week}
                </span>
                <ChevronRight className="h-3 w-3" />
                <span className="truncate font-medium">{currentWeek.title}</span>
              </div>

              <h3 className="font-display text-lg font-bold leading-tight">
                {currentTask.title}
              </h3>

              <p className="mt-1 line-clamp-2 text-sm text-black/70">
                {currentTask.description}
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {currentTask.estimatedTime}
                </span>
                <span className="rounded border-2 border-black bg-white px-2 py-0.5 font-bold uppercase">
                  {currentTask.difficulty}
                </span>
              </div>
            </div>
          </div>

          {/* Right Section: Progress & Action */}
          <div className="flex flex-col gap-3 sm:items-end lg:w-72">
            {/* Next Action */}
            <div className="rounded-md border-2 border-black bg-white p-2">
              <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-black/50">
                Next Action
              </p>
              <p className="flex items-center gap-1.5 text-sm font-bold">
                {currentTask.status === 'completed' ? (
                  <span className="flex items-center gap-1 text-green">
                    <Target className="h-4 w-4" />
                    Task Completed!
                  </span>
                ) : (
                  <>
                    <PlayCircle className="h-4 w-4 text-green" />
                    {nextAction}
                  </>
                )}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="w-full rounded-md border-2 border-black bg-white p-2">
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="font-bold">Overall Progress</span>
                <span className="font-bold">{overallProgress}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded border-2 border-black bg-gray-200">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${overallProgress}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className="h-full bg-black"
                />
              </div>
              <p className="mt-1 text-center text-[10px] text-black/60">
                {completedTasks}/{totalTasks} tasks completed
              </p>
            </div>

            {/* Continue Button */}
            <BrutalButton
              color="black"
              size="lg"
              className="w-full"
              onClick={onContinue}
            >
              <PlayCircle className="mr-2 h-5 w-5" />
              Continue Learning
            </BrutalButton>

            {/* Module Progress */}
            <div className="w-full rounded-md border-2 border-black bg-white p-2">
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="flex items-center gap-1 font-bold">
                  <BookOpen className="h-3 w-3" />
                  Module {currentWeek.week}
                </span>
                <span className="font-bold">{weekProgress}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded border border-black bg-gray-200">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${weekProgress}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className="h-full bg-black"
                />
              </div>
            </div>
          </div>
        </div>
      </BrutalCard>
    </motion.div>
  )
}
