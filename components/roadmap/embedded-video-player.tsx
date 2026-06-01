'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, ExternalLink, Maximize2, Minimize2, Play, X } from 'lucide-react'
import { RoadmapResource } from '@/types'
import { BrutalButton, BrutalCard } from '@/components/brutal'
import { cn } from '@/lib/utils'

interface EmbeddedVideoPlayerProps {
  resource: RoadmapResource
  isExpanded: boolean
  onToggleExpand: () => void
  onMarkWatched: () => void
  className?: string
}

type VideoStatus = 'not_started' | 'in_progress' | 'watched' | 'completed'

function getVideoStatus(resource: RoadmapResource): VideoStatus {
  if (resource.isCompleted && resource.completionPercentage >= 100) return 'completed'
  if (resource.watchedSeconds > 0 || resource.completionPercentage > 50) return 'watched'
  if (resource.isCompleted || resource.completionPercentage > 0) return 'in_progress'
  return 'not_started'
}

function getYouTubeVideoId(url: string): string | null {
  try {
    const parsed = new URL(url)

    if (parsed.hostname.includes('youtu.be')) {
      return parsed.pathname.replace('/', '')
    }
    if (parsed.pathname.startsWith('/watch')) {
      return parsed.searchParams.get('v')
    }
    if (parsed.pathname.startsWith('/shorts/')) {
      return parsed.pathname.split('/')[2] ?? null
    }
    if (parsed.pathname.startsWith('/embed/')) {
      return parsed.pathname.split('/')[2] ?? null
    }
    return null
  } catch {
    return null
  }
}

function getYouTubeEmbedUrl(url: string): string | null {
  const videoId = getYouTubeVideoId(url)
  if (!videoId) return null
  return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`
}

function getYouTubeThumbnailUrl(url: string): string | null {
  const videoId = getYouTubeVideoId(url)
  if (!videoId) return null
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
}

const statusConfig: Record<VideoStatus, { label: string; color: string; bgColor: string }> = {
  not_started: { label: 'Not Started', color: 'text-black/60', bgColor: 'bg-gray-200' },
  in_progress: { label: 'In Progress', color: 'text-yellow', bgColor: 'bg-yellow/20' },
  watched: { label: 'Watched', color: 'text-blue', bgColor: 'bg-blue/20' },
  completed: { label: 'Completed', color: 'text-green', bgColor: 'bg-green/20' },
}

export function EmbeddedVideoPlayer({
  resource,
  isExpanded,
  onToggleExpand,
  onMarkWatched,
  className,
}: EmbeddedVideoPlayerProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const videoStatus = getVideoStatus(resource)
  const status = statusConfig[videoStatus]
  const embedUrl = getYouTubeEmbedUrl(resource.url)
  const thumbnailUrl = getYouTubeThumbnailUrl(resource.url)

  // Reset fullscreen state when collapsed
  useEffect(() => {
    if (!isExpanded) {
      setIsFullscreen(false)
    }
  }, [isExpanded])

  return (
    <div className={cn('', className)}>
      {/* Video Header */}
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span className="flex items-center gap-1 rounded-md border-2 border-black bg-white px-2 py-0.5 text-[11px] font-bold">
          Video
        </span>
        <span
          className={cn(
            'rounded-md border-2 border-black px-2 py-0.5 text-[11px] font-bold',
            status.bgColor
          )}
        >
          {status.label}
        </span>
        <span className="text-xs text-black/60">
          {resource.provider} • {resource.estimatedMinutes} min
        </span>
      </div>

      {/* Video Title */}
      <h4 className="mb-2 font-bold">{resource.title}</h4>

      {/* Video Player Area */}
      <div
        className={cn(
          'relative overflow-hidden rounded-lg border-3 border-black bg-black',
          isFullscreen ? 'fixed inset-0 z-50' : 'aspect-video'
        )}
      >
        <AnimatePresence mode="wait">
          {!isExpanded ? (
            // Thumbnail View
            <motion.div
              key="thumbnail"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative h-full w-full cursor-pointer"
              onClick={onToggleExpand}
            >
              {thumbnailUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={thumbnailUrl}
                  alt={resource.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-gray-800">
                  <Play className="h-16 w-16 text-white/50" />
                </div>
              )}

              {/* Play Button Overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-lg"
                >
                  <Play className="ml-1 h-8 w-8 text-black" fill="black" />
                </motion.div>
              </div>

              {/* Duration Badge */}
              <div className="absolute bottom-2 right-2 rounded bg-black/80 px-2 py-1 text-xs font-bold text-white">
                {resource.estimatedMinutes}:00
              </div>

              {/* Status Indicator */}
              {videoStatus !== 'not_started' && (
                <div className="absolute bottom-2 left-2">
                  {videoStatus === 'completed' || videoStatus === 'watched' ? (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green">
                      <Check className="h-4 w-4 text-white" />
                    </div>
                  ) : (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-yellow">
                      <Play className="h-3 w-3 text-black" fill="black" />
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          ) : (
            // Embed View
            <motion.div
              key="embed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative h-full w-full"
            >
              {embedUrl ? (
                <iframe
                  src={embedUrl}
                  title={resource.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="h-full w-full"
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-gray-800 text-white">
                  <p>Video not available</p>
                </div>
              )}

              {/* Fullscreen Toggle */}
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded bg-black/50 text-white transition-colors hover:bg-black/70"
              >
                {isFullscreen ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
              </button>

              {/* Close Button */}
              <button
                onClick={onToggleExpand}
                className="absolute right-12 top-2 flex h-8 w-8 items-center justify-center rounded bg-black/50 text-white transition-colors hover:bg-black/70"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Video Actions */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <BrutalButton
            variant={isExpanded ? 'primary' : 'outline'}
            color="black"
            size="sm"
            onClick={onToggleExpand}
          >
            <Play className={cn('h-4 w-4', isExpanded && 'fill-current')} />
            {isExpanded ? 'Close Video' : 'Watch Now'}
          </BrutalButton>

          {(videoStatus === 'completed' || videoStatus === 'watched') && (
            <a
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex"
            >
              <BrutalButton variant="ghost" color="black" size="sm">
                <ExternalLink className="h-4 w-4" />
                Open on YouTube
              </BrutalButton>
            </a>
          )}
        </div>

        {videoStatus !== 'completed' && (
          <BrutalButton
            variant={resource.isCompleted ? 'primary' : 'outline'}
            color={resource.isCompleted ? 'green' : 'black'}
            size="sm"
            onClick={onMarkWatched}
          >
            <Check className="h-4 w-4" />
            {resource.isCompleted ? 'Watched' : 'Mark as Watched'}
          </BrutalButton>
        )}
      </div>
    </div>
  )
}

// Compact Video Card for list view
interface CompactVideoCardProps {
  resource: RoadmapResource
  onClick: () => void
  className?: string
}

export function CompactVideoCard({ resource, onClick, className }: CompactVideoCardProps) {
  const videoStatus = getVideoStatus(resource)
  const thumbnailUrl = getYouTubeThumbnailUrl(resource.url)

  return (
    <button
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-3 rounded-md border-2 border-black bg-white p-2 text-left transition-all hover:bg-gray-50',
        videoStatus === 'completed' && 'bg-green/10',
        videoStatus === 'watched' && 'bg-blue/10',
        className
      )}
    >
      {/* Thumbnail */}
      <div className="relative h-12 w-20 shrink-0 overflow-hidden rounded border border-black/20">
        {thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumbnailUrl}
            alt={resource.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gray-200">
            <Play className="h-4 w-4 text-gray-400" />
          </div>
        )}
        {/* Play Icon Overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/90">
            <Play className="h-3 w-3 text-black" fill="black" />
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold">{resource.title}</p>
        <p className="text-xs text-black/60">
          {resource.provider} • {resource.estimatedMinutes} min
        </p>
      </div>

      {/* Status */}
      <div className="shrink-0">
        {videoStatus === 'completed' || videoStatus === 'watched' ? (
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green">
            <Check className="h-4 w-4 text-white" />
          </div>
        ) : (
          <div className="h-6 w-6 rounded-full border-2 border-gray-300" />
        )}
      </div>
    </button>
  )
}