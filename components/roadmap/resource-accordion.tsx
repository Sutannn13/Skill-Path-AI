'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  BookOpen,
  Check,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  FileText,
  Folder,
  PlayCircle,
} from 'lucide-react'
import { RoadmapResource, RoadmapTask } from '@/types'
import { BrutalButton } from '@/components/brutal'
import { cn } from '@/lib/utils'
import { isResourceUnavailable } from '@/lib/roadmap/progress'
import { EmbeddedVideoPlayer } from './embedded-video-player'

interface ResourceAccordionProps {
  resources: RoadmapResource[]
  task: RoadmapTask
  onMarkResourceComplete: (resourceId: string, isCompleted: boolean) => void
  onOpenResource: (resourceId: string) => void
  className?: string
}

type ResourceType = 'youtube' | 'docs' | 'article'

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
  onAccordionToggle: () => void
  onMarkComplete: () => void
  onOpenInNewTab: () => void
  isAccordionExpanded: boolean
  isPlayerExpanded: boolean
  onPlayerToggle: () => void
}

function ResourceAccordionItem({
  resource,
  onAccordionToggle,
  onMarkComplete,
  onOpenInNewTab,
  isAccordionExpanded,
  isPlayerExpanded,
  onPlayerToggle,
}: ResourceAccordionItemProps) {
  const unavailable = isResourceUnavailable(resource)
  const status = getResourceStatus(resource)

  if (resource.resourceType === 'youtube') {
    return (
      <div className="rounded-md border-2 border-black bg-white">
        {/* Accordion Header */}
        <button
          onClick={onAccordionToggle}
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
          {isAccordionExpanded ? (
            <ChevronUp className="h-5 w-5 shrink-0" />
          ) : (
            <ChevronDown className="h-5 w-5 shrink-0" />
          )}
        </button>

        {/* Accordion Content */}
        {isAccordionExpanded && (
          <div className="border-t-2 border-black/10">
            {unavailable ? (
              <div className="border-t-2 border-dashed border-black/20 bg-gray-50 p-4 text-center">
                <p className="text-sm text-black/60">
                  Resources are being prepared for this task.
                </p>
              </div>
            ) : (
              <div className="border-t-2 border-black/10 p-3">
                <EmbeddedVideoPlayer
                  resource={resource}
                  isExpanded={isPlayerExpanded}
                  onToggleExpand={onPlayerToggle}
                  onMarkWatched={onMarkComplete}
                />
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  // Docs/Article resource
  return (
    <div className="rounded-md border-2 border-black bg-white">
      <button
        onClick={onAccordionToggle}
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
        {isAccordionExpanded ? (
          <ChevronUp className="h-5 w-5 shrink-0" />
        ) : (
          <ChevronDown className="h-5 w-5 shrink-0" />
        )}
      </button>

      {/* Accordion Content */}
      {isAccordionExpanded && (
        <div className="border-t-2 border-black/10">
          {unavailable ? (
            <div className="border-t-2 border-dashed border-black/20 bg-gray-50 p-4 text-center">
              <p className="text-sm text-black/60">
                Resources are being prepared for this task.
              </p>
            </div>
          ) : (
            <div className="border-t-2 border-black/10 p-3">
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
            </div>
          )}
        </div>
      )}
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
  // Accordion expanded state: controls whether accordion content is visible
  const [accordionExpandedIds, setAccordionExpandedIds] = useState<Record<string, boolean>>({})

  // Player expanded state: controls whether video iframe is shown (separate from accordion)
  const [playerExpandedIds, setPlayerExpandedIds] = useState<Record<string, boolean>>({})

  const toggleAccordion = (resourceId: string) => {
    setAccordionExpandedIds((prev) => ({
      ...prev,
      [resourceId]: !prev[resourceId],
    }))
    onOpenResource(resourceId)
  }

  const togglePlayer = (resourceId: string) => {
    setPlayerExpandedIds((prev) => ({
      ...prev,
      [resourceId]: !prev[resourceId],
    }))
    // Note: NOT calling onOpenResource here — opening the player shouldn't mark as opened
  }

  const validResources = resources.filter((resource) => !isResourceUnavailable(resource))
  const videoResources = validResources.filter((r) => r.resourceType === 'youtube')
  const docResources = validResources.filter((r) => r.resourceType === 'docs' || r.resourceType === 'article')

  const completedVideos = videoResources.filter((r) => r.isCompleted).length
  const completedDocs = docResources.filter((r) => r.isCompleted).length

  return (
    <div className={cn('space-y-4', className)}>
      {/* Videos Section */}
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
                onAccordionToggle={() => toggleAccordion(resource.id)}
                onMarkComplete={() => onMarkResourceComplete(resource.id, !resource.isCompleted)}
                onOpenInNewTab={() => onOpenResource(resource.id)}
                isAccordionExpanded={accordionExpandedIds[resource.id] ?? false}
                isPlayerExpanded={playerExpandedIds[resource.id] ?? false}
                onPlayerToggle={() => togglePlayer(resource.id)}
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
                onAccordionToggle={() => toggleAccordion(resource.id)}
                onMarkComplete={() => onMarkResourceComplete(resource.id, !resource.isCompleted)}
                onOpenInNewTab={() => onOpenResource(resource.id)}
                isAccordionExpanded={accordionExpandedIds[resource.id] ?? false}
                isPlayerExpanded={false}
                onPlayerToggle={() => {}}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {validResources.length === 0 && (
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
