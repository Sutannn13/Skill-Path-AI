'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BookOpen,
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  ExternalLink,
  FileText,
  Folder,
  PlayCircle,
} from 'lucide-react'
import { RoadmapResource, RoadmapTask } from '@/types'
import { BrutalButton, BrutalCard } from '@/components/brutal'
import { cn } from '@/lib/utils'
import { EmbeddedVideoPlayer, CompactVideoCard } from './embedded-video-player'

interface ResourceAccordionProps {
  resources: RoadmapResource[]
  task: RoadmapTask
  onMarkResourceComplete: (resourceId: string, isCompleted: boolean) => void
  onOpenResource: (resourceId: string) => void
  className?: string
}

type ResourceType = 'youtube' | 'docs' | 'article'

function isResourceUnavailable(resource: Pick<RoadmapResource, 'completionRule' | 'url'>) {
  return resource.completionRule.startsWith('resource_unavailable') || resource.url.trim().length === 0
}

function getResourceStatus(resource: RoadmapResource): 'not_started' | 'in_progress' | 'completed' {
  if (resource.isCompleted || resource.completionPercentage >= 100) return 'completed'
  if (resource.watchedSeconds > 0 || resource.completionPercentage > 0) return 'in_progress'
  return 'not_started'
}

function getResourceTypeLabel(resourceType: ResourceType) {
  switch (resourceType) {
    case 'youtube':
      return 'Video'
    case 'docs':
      return 'Documentation'
    case 'article':
      return 'Article'
    default:
      return 'Resource'
  }
}

interface ResourceAccordionItemProps {
  resource: RoadmapResource
  onToggleExpand: () => void
  onMarkComplete: () => void
  onOpenInNewTab: () => void
  isExpanded: boolean
}

function ResourceAccordionItem({
  resource,
  onToggleExpand,
  onMarkComplete,
  onOpenInNewTab,
  isExpanded,
}: ResourceAccordionItemProps) {
  const unavailable = isResourceUnavailable(resource)
  const status = getResourceStatus(resource)

  if (resource.resourceType === 'youtube') {
    return (
      <div className="rounded-md border-2 border-black bg-white">
        <button
          onClick={onToggleExpand}
          className="flex w-full items-center justify-between p-3 text-left transition-colors hover:bg-gray-50"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-black text-white">
              <PlayCircle className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded border-2 border-black bg-yellow px-1.5 py-0.5 text-[10px] font-bold">
                  Video
                </span>
                <span
                  className={cn(
                    'rounded border-2 border-black px-1.5 py-0.5 text-[10px] font-bold',
                    status === 'completed' && 'bg-green/20 text-green',
                    status === 'in_progress' && 'bg-yellow/20 text-yellow',
                    status === 'not_started' && 'bg-gray-200 text-black/60'
                  )}
                >
                  {status === 'completed' ? 'Watched' : status === 'in_progress' ? 'In Progress' : 'Not Started'}
                </span>
              </div>
              <p className="mt-1 truncate font-bold">{resource.title}</p>
              <p className="text-xs text-black/60">
                {resource.provider} • {resource.estimatedMinutes} min
              </p>
            </div>
          </div>
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 shrink-0" />
          ) : (
            <ChevronDown className="h-5 w-5 shrink-0" />
          )}
        </button>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="border-t-2 border-black/10 p-3">
                {unavailable ? (
                  <div className="rounded-md border-2 border-dashed border-black/20 bg-gray-50 p-4 text-center">
                    <p className="text-sm text-black/60">
                      Resources are being prepared for this task.
                    </p>
                  </div>
                ) : (
                  <EmbeddedVideoPlayer
                    resource={resource}
                    isExpanded={false}
                    onToggleExpand={onToggleExpand}
                    onMarkWatched={onMarkComplete}
                  />
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  // Docs/Article resource
  return (
    <div className="rounded-md border-2 border-black bg-white">
      <button
        onClick={onToggleExpand}
        className="flex w-full items-center justify-between p-3 text-left transition-colors hover:bg-gray-50"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-blue text-white">
            <FileText className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded border-2 border-black bg-white px-1.5 py-0.5 text-[10px] font-bold">
                {getResourceTypeLabel(resource.resourceType as ResourceType)}
              </span>
              <span
                className={cn(
                  'rounded border-2 border-black px-1.5 py-0.5 text-[10px] font-bold',
                  status === 'completed' && 'bg-green/20 text-green',
                  status === 'in_progress' && 'bg-yellow/20 text-yellow',
                  status === 'not_started' && 'bg-gray-200 text-black/60'
                )}
              >
                {status === 'completed' ? 'Completed' : status === 'in_progress' ? 'In Progress' : 'Not Started'}
              </span>
            </div>
            <p className="mt-1 truncate font-bold">{resource.title}</p>
            <p className="text-xs text-black/60">
              {resource.provider} • {resource.estimatedMinutes} min
            </p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-5 w-5 shrink-0" />
        ) : (
          <ChevronDown className="h-5 w-5 shrink-0" />
        )}
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="border-t-2 border-black/10 p-3">
              {unavailable ? (
                <div className="rounded-md border-2 border-dashed border-black/20 bg-gray-50 p-4 text-center">
                  <p className="text-sm text-black/60">
                    Resources are being prepared for this task.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Resource Description */}
                  <div className="rounded-md border-2 border-black/10 bg-gray-50 p-3">
                    <p className="text-xs font-medium text-black/70">
                      Learn about {resource.title} from {resource.provider}. This resource will help you understand the key concepts needed for this task.
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2">
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex"
                      onClick={onOpenInNewTab}
                    >
                      <BrutalButton variant="outline" color="black" size="sm">
                        <ExternalLink className="h-4 w-4" />
                        Read Documentation
                      </BrutalButton>
                    </a>
                    <BrutalButton
                      variant={resource.isCompleted ? 'primary' : 'outline'}
                      color={resource.isCompleted ? 'green' : 'black'}
                      size="sm"
                      onClick={onMarkComplete}
                    >
                      <Check className="h-4 w-4" />
                      {resource.isCompleted ? 'Completed' : 'Mark Complete'}
                    </BrutalButton>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function ResourceAccordion({
  resources,
  task,
  onMarkResourceComplete,
  onOpenResource,
  className,
}: ResourceAccordionProps) {
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({})

  const toggleExpand = (resourceId: string) => {
    setExpandedIds((prev) => ({
      ...prev,
      [resourceId]: !prev[resourceId],
    }))
    onOpenResource(resourceId)
  }

  const videoResources = resources.filter((r) => r.resourceType === 'youtube')
  const docResources = resources.filter((r) => r.resourceType === 'docs' || r.resourceType === 'article')

  const completedVideos = videoResources.filter((r) => r.isCompleted).length
  const completedDocs = docResources.filter((r) => r.isCompleted).length

  return (
    <div className={cn('space-y-4', className)}>
      {/* Video Section */}
      {videoResources.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PlayCircle className="h-4 w-4" />
              <span className="text-sm font-bold">Videos</span>
            </div>
            <span className="text-xs font-medium text-black/60">
              {completedVideos}/{videoResources.length} completed
            </span>
          </div>
          <div className="space-y-2">
            {videoResources.map((resource) => (
              <ResourceAccordionItem
                key={resource.id}
                resource={resource}
                onToggleExpand={() => toggleExpand(resource.id)}
                onMarkComplete={() => onMarkResourceComplete(resource.id, !resource.isCompleted)}
                onOpenInNewTab={() => onOpenResource(resource.id)}
                isExpanded={expandedIds[resource.id] ?? false}
              />
            ))}
          </div>
        </div>
      )}

      {/* Docs Section */}
      {docResources.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              <span className="text-sm font-bold">Documentation</span>
            </div>
            <span className="text-xs font-medium text-black/60">
              {completedDocs}/{docResources.length} completed
            </span>
          </div>
          <div className="space-y-2">
            {docResources.map((resource) => (
              <ResourceAccordionItem
                key={resource.id}
                resource={resource}
                onToggleExpand={() => toggleExpand(resource.id)}
                onMarkComplete={() => onMarkResourceComplete(resource.id, !resource.isCompleted)}
                onOpenInNewTab={() => onOpenResource(resource.id)}
                isExpanded={expandedIds[resource.id] ?? false}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {resources.length === 0 && (
        <div className="rounded-md border-2 border-dashed border-black/20 bg-gray-50 p-6 text-center">
          <Folder className="mx-auto mb-2 h-8 w-8 text-black/40" />
          <p className="text-sm font-medium text-black/60">
            Resources are being prepared for this task.
          </p>
        </div>
      )}
    </div>
  )
}

// Compact Resource List for sidebar
interface CompactResourceListProps {
  resources: RoadmapResource[]
  onResourceClick: (resourceId: string) => void
  className?: string
}

export function CompactResourceList({ resources, onResourceClick, className }: CompactResourceListProps) {
  const videoResources = resources.filter((r) => r.resourceType === 'youtube')
  const docResources = resources.filter((r) => r.resourceType === 'docs' || r.resourceType === 'article')

  return (
    <div className={cn('space-y-3', className)}>
      {videoResources.length > 0 && (
        <div className="space-y-1">
          <p className="flex items-center gap-1.5 text-xs font-bold text-black/60">
            <PlayCircle className="h-3 w-3" />
            Videos
          </p>
          {videoResources.map((resource) => (
            <CompactVideoCard
              key={resource.id}
              resource={resource}
              onClick={() => onResourceClick(resource.id)}
            />
          ))}
        </div>
      )}

      {docResources.length > 0 && (
        <div className="space-y-1">
          <p className="flex items-center gap-1.5 text-xs font-bold text-black/60">
            <BookOpen className="h-3 w-3" />
            Documentation
          </p>
          {docResources.map((resource) => {
            const status = getResourceStatus(resource)
            return (
              <button
                key={resource.id}
                onClick={() => onResourceClick(resource.id)}
                className={cn(
                  'flex w-full items-center gap-2 rounded-md border-2 border-black bg-white p-2 text-left transition-all hover:bg-gray-50',
                  status === 'completed' && 'bg-green/10'
                )}
              >
                <FileText className="h-4 w-4 shrink-0 text-blue" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold">{resource.title}</p>
                  <p className="text-[10px] text-black/60">{resource.provider}</p>
                </div>
                {status === 'completed' && (
                  <Check className="h-4 w-4 shrink-0 text-green" />
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}