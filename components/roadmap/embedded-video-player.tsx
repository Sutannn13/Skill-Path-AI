'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Check, ExternalLink, Maximize2, Minimize2, Play, VideoOff, X } from 'lucide-react'
import { RoadmapResource } from '@/types'
import { BrutalButton } from '@/components/brutal'
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

/**
 * Robust YouTube URL parser that handles all YouTube URL formats:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 * - https://www.youtube.com/shorts/VIDEO_ID
 * Returns null if URL is invalid or not a YouTube URL.
 */
function getYouTubeVideoId(url: string): string | null {
  if (!url || typeof url !== 'string') return null

  try {
    const parsed = new URL(url)
    const hostname = parsed.hostname.toLowerCase()

    // Handle youtu.be short links
    if (hostname === 'youtu.be') {
      const id = parsed.pathname.replace(/^\//, '').split('?')[0]
      return id || null
    }

    // Handle youtube.com URLs
    if (hostname.includes('youtube.com') || hostname.includes('youtube')) {
      const pathname = parsed.pathname

      // /watch?v=VIDEO_ID
      if (pathname === '/watch') {
        return parsed.searchParams.get('v')
      }

      // /embed/VIDEO_ID or /v/VIDEO_ID
      if (pathname.startsWith('/embed/')) {
        return pathname.split('/embed/')[1]?.split('?')[0] || null
      }
      if (pathname.startsWith('/v/')) {
        return pathname.split('/v/')[1]?.split('?')[0] || null
      }

      // /shorts/VIDEO_ID
      if (pathname.startsWith('/shorts/')) {
        return pathname.split('/shorts/')[1]?.split('?')[0] || null
      }

      // Direct embed URL was passed
      if (pathname.startsWith('/embed/')) {
        return pathname.split('/embed/')[1]?.split('?')[0] || null
      }
    }

    return null
  } catch {
    return null
  }
}

/**
 * Converts YouTube URL to embed URL format.
 * Returns null if URL is not a valid YouTube URL.
 */
function getYouTubeEmbedUrl(url: string): string | null {
  const videoId = getYouTubeVideoId(url)
  if (!videoId) return null
  return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&enablejsapi=1`
}

/**
 * Gets YouTube thumbnail URL for video preview.
 * Returns null if URL is not a valid YouTube URL.
 */
function getYouTubeThumbnailUrl(url: string): string | null {
  const videoId = getYouTubeVideoId(url)
  if (!videoId) return null
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
}

const statusConfig: Record<VideoStatus, { label: string; color: string; bgColor: string }> = {
  not_started: { label: 'Belum Dimulai', color: 'text-black/60', bgColor: 'bg-gray-200' },
  in_progress: { label: 'Sedang Belajar', color: 'text-yellow', bgColor: 'bg-yellow/20' },
  watched: { label: 'Sudah Ditonton', color: 'text-blue', bgColor: 'bg-blue/20' },
  completed: { label: 'Selesai', color: 'text-green', bgColor: 'bg-green/20' },
}

export function EmbeddedVideoPlayer({
  resource,
  isExpanded,
  onToggleExpand,
  onMarkWatched,
  className,
}: EmbeddedVideoPlayerProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [embedError, setEmbedError] = useState(false)
  const videoStatus = getVideoStatus(resource)
  const status = statusConfig[videoStatus]
  const embedUrl = getYouTubeEmbedUrl(resource.url)
  const thumbnailUrl = getYouTubeThumbnailUrl(resource.url)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  // Reset fullscreen state when collapsed
  useEffect(() => {
    if (!isExpanded) {
      setIsFullscreen(false)
      setEmbedError(false)
    }
  }, [isExpanded])

  // Reset embed error when URL changes
  useEffect(() => {
    setEmbedError(false)
  }, [resource.url])

  const handleIframeError = () => {
    console.warn('[VideoPlayer] Embed failed for:', resource.url)
    setEmbedError(true)
  }

  const canEmbed = embedUrl !== null && !embedError

  // Handle thumbnail click - just toggle, don't auto-play
  const handleThumbnailClick = () => {
    if (!embedUrl) {
      // If can't embed, open in new tab
      window.open(resource.url, '_blank', 'noopener,noreferrer')
      return
    }
    onToggleExpand()
  }

  return (
    <div className={cn('w-full', className)}>
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
      <h4 className="mb-3 font-bold leading-snug">{resource.title}</h4>

      {/* Video Player Area */}
      <div
        className={cn(
          'relative w-full overflow-hidden rounded-lg border-3 border-black bg-black',
          isFullscreen ? 'fixed inset-0 z-[9999]' : 'aspect-video'
        )}
      >
        {/* Thumbnail View (when collapsed) */}
        {!isExpanded && (
          <button
            onClick={handleThumbnailClick}
            className="absolute inset-0 z-10 flex items-center justify-center cursor-pointer group"
            aria-label={canEmbed ? 'Click to watch video' : 'Video cannot be embedded, click to open'}
          >
            {thumbnailUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={thumbnailUrl}
                alt={resource.title}
                className="absolute inset-0 w-full h-full object-cover"
                onError={(e) => {
                  // Hide broken thumbnail
                  e.currentTarget.style.display = 'none'
                }}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                {canEmbed ? (
                  <Play className="h-16 w-16 text-white-static/50" />
                ) : (
                  <VideoOff className="h-16 w-16 text-white-static/50" />
                )}
              </div>
            )}

            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors" />

            {/* Play Button */}
            <div className="relative z-20 flex flex-col items-center gap-2">
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-lg"
              >
                {canEmbed ? (
                  <Play className="ml-1 h-8 w-8 text-black" fill="black" />
                ) : (
                  <ExternalLink className="h-8 w-8 text-black" />
                )}
              </motion.div>
              {canEmbed ? (
                <span className="rounded bg-black/70 px-2 py-1 text-xs font-bold text-white-static">
                  Tonton Video
                </span>
              ) : (
                <span className="rounded bg-red-600 px-2 py-1 text-xs font-bold text-white-static">
                  Buka di YouTube
                </span>
              )}
            </div>

            {/* Duration Badge */}
            <div className="absolute bottom-2 right-2 rounded bg-black/80 px-2 py-1 text-xs font-bold text-white-static">
              {resource.estimatedMinutes}:00
            </div>

            {/* Status Indicator */}
            {videoStatus !== 'not_started' && (
              <div className="absolute bottom-2 left-2">
                {videoStatus === 'completed' || videoStatus === 'watched' ? (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green">
                    <Check className="h-4 w-4 text-white-static" />
                  </div>
                ) : (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-yellow">
                    <Play className="h-3 w-3 text-black" fill="black" />
                  </div>
                )}
              </div>
            )}
          </button>
        )}

        {/* Embed View (when expanded) */}
        {isExpanded && canEmbed && (
          <div className="absolute inset-0">
            <iframe
              ref={iframeRef}
              src={embedUrl}
              title={resource.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="absolute inset-0 w-full h-full border-0"
              onError={handleIframeError}
            />
          </div>
        )}

        {/* Embed Error Fallback */}
        {isExpanded && (!canEmbed || embedError) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-gray-800 text-white-static p-6">
            <VideoOff className="h-16 w-16 text-white-static/50" />
            <p className="text-center font-medium">
              Video ini tidak bisa ditampilkan di sini.
            </p>
            <p className="text-center text-sm text-white-static/60">
              {embedError
                ? 'Server video memblokir tampilan embed.'
                : 'URL video bukan link YouTube yang valid.'}
            </p>
            <div className="flex gap-2">
              <a
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <BrutalButton variant="primary" color="white" size="sm">
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Buka di YouTube
                </BrutalButton>
              </a>
              <BrutalButton
                variant="outline"
                color="white"
                size="sm"
                onClick={onToggleExpand}
              >
                Tutup
              </BrutalButton>
            </div>
          </div>
        )}

        {/* Fullscreen Toggle Button (only when expanded and can embed) */}
        {isExpanded && canEmbed && (
          <>
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="absolute right-2 top-2 z-30 flex h-8 w-8 items-center justify-center rounded bg-black/50 text-white-static transition-colors hover:bg-black/70"
              aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
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
              className="absolute right-12 top-2 z-30 flex h-8 w-8 items-center justify-center rounded bg-black/50 text-white-static transition-colors hover:bg-black/70"
              aria-label="Close video player"
            >
              <X className="h-4 w-4" />
            </button>
          </>
        )}
      </div>

      {/* Video Actions */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <BrutalButton
            variant={isExpanded ? 'primary' : 'outline'}
            color="black"
            size="sm"
            onClick={() => {
              if (embedUrl) {
                onToggleExpand()
              } else {
                window.open(resource.url, '_blank', 'noopener,noreferrer')
              }
            }}
          >
            {isExpanded ? (
              <>
                <X className="h-4 w-4 mr-1" />
                Tutup Video
              </>
            ) : embedUrl ? (
              <>
                <Play className="h-4 w-4 mr-1" />
                Tonton Sekarang
              </>
            ) : (
              <>
                <ExternalLink className="h-4 w-4 mr-1" />
                Buka di YouTube
              </>
            )}
          </BrutalButton>

          {!isExpanded && (
            <a
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex"
            >
              <BrutalButton variant="ghost" color="black" size="sm">
                <ExternalLink className="h-4 w-4" />
                YouTube
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
            {resource.isCompleted ? 'Selesai' : 'Tandai Selesai'}
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
        'flex w-full items-center gap-3 rounded-md border-2 border-black bg-white p-2 text-left transition-all hover:bg-gray-50 active:scale-[0.98]',
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
            onError={(e) => {
              e.currentTarget.style.display = 'none'
            }}
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

// Export helper functions for testing
export { getYouTubeVideoId, getYouTubeEmbedUrl, getYouTubeThumbnailUrl }