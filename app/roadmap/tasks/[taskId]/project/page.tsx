'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  FileCode2,
  Github,
  Globe,
  Lock,
  MessageSquareText,
} from 'lucide-react'
import { AppShell, Container, GradientBackground } from '@/components/layout'
import { DashboardHeader } from '@/components/layout/dashboard-header'
import { BrutalButton, BrutalCard, SkillBadge } from '@/components/brutal'
import { createSupabaseBrowserClient } from '@/lib/supabase/browser'
import { loadRoadmapTaskLearningContext, RoadmapTaskLearningContext } from '@/lib/roadmap/navigation-context'
import { RoadmapProjectReviewStatus } from '@/types'

type PageState = 'loading' | 'ready' | 'locked' | 'not_found' | 'error' | 'unauthorized' | 'no_project'

interface ProjectSubmission {
  id: string
  status: RoadmapProjectReviewStatus
  repoUrl: string
  liveUrl: string | null
  notes: string | null
}

interface ProjectReview {
  status: RoadmapProjectReviewStatus
  score: number | null
  summary: string | null
  strengths: string[]
  issues: string[]
  requiredFixes: string[]
  suggestions: string[]
}

export default function RoadmapTaskProjectPage() {
  const params = useParams<{ taskId: string }>()
  const taskId = typeof params?.taskId === 'string' ? params.taskId : ''
  const supabase = useMemo(() => createSupabaseBrowserClient(), [])
  const [context, setContext] = useState<RoadmapTaskLearningContext | null>(null)
  const [pageState, setPageState] = useState<PageState>('loading')
  const [pageMessage, setPageMessage] = useState('Loading mini project...')
  const [repoUrl, setRepoUrl] = useState('')
  const [liveUrl, setLiveUrl] = useState('')
  const [notes, setNotes] = useState('')
  const [submission, setSubmission] = useState<ProjectSubmission | null>(null)
  const [review, setReview] = useState<ProjectReview | null>(null)
  const [requestError, setRequestError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    let active = true

    const load = async () => {
      if (!supabase) {
        if (active) {
          setPageState('error')
          setPageMessage('Supabase is not configured.')
        }
        return
      }

      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()

        if (userError || !user) {
          if (active) {
            setPageState('unauthorized')
            setPageMessage('You need to sign in to access this page.')
          }
          return
        }

        const loadedContext = await loadRoadmapTaskLearningContext({
          supabase,
          userId: user.id,
          taskId,
        })

        if (!loadedContext) {
          if (active) {
            setPageState('not_found')
            setPageMessage('Task not found or does not belong to your active roadmap.')
          }
          return
        }

        if (active) {
          setContext(loadedContext)
        }

        if (loadedContext.task.quizRequired && !loadedContext.task.quizPassed) {
          if (active) {
            setPageState('locked')
            setPageMessage('Pass the quiz before submitting this mini project.')
          }
          return
        }

        const hasProject = loadedContext.task.projectRequired || Boolean(loadedContext.task.miniProject)
        if (!hasProject) {
          if (active) {
            setPageState('no_project')
            setPageMessage('This task has no mini project requirement.')
          }
          return
        }

        if (active) {
          setPageState('ready')
        }

        await loadLatestReview(loadedContext)
      } catch (error) {
        if (active) {
          setPageState('error')
          setPageMessage(error instanceof Error ? error.message : 'Failed to load mini project page.')
        }
      }
    }

    const loadLatestReview = async (loadedContext: RoadmapTaskLearningContext) => {
      const params = new URLSearchParams({
        roadmapId: loadedContext.roadmap.id,
        roadmapTaskId: loadedContext.task.id,
        projectType: 'mini_project',
      })

      const response = await fetch(`/api/roadmap/project-review?${params.toString()}`)
      const data = await response.json().catch(() => null)
      if (!response.ok) {
        throw new Error(data?.error || 'Failed to load mini project review.')
      }

      if (!active || !data?.submission) {
        return
      }

      setSubmission({
        id: data.submission.id,
        status: data.submission.status,
        repoUrl: data.submission.repoUrl ?? '',
        liveUrl: data.submission.liveUrl ?? null,
        notes: data.submission.notes ?? null,
      })
      setReview(data.review ? {
        status: data.review.status,
        score: data.review.score ?? null,
        summary: data.review.summary ?? null,
        strengths: data.review.strengths ?? [],
        issues: data.review.issues ?? [],
        requiredFixes: data.review.requiredFixes ?? [],
        suggestions: data.review.suggestions ?? [],
      } : null)
      setRepoUrl(data.submission.repoUrl ?? '')
      setLiveUrl(data.submission.liveUrl ?? '')
      setNotes(data.submission.notes ?? '')
    }

    void load()

    return () => {
      active = false
    }
  }, [supabase, taskId])

  const submit = async () => {
    if (!context) return

    if (!repoUrl.trim()) {
      setRequestError('GitHub repository URL is required.')
      return
    }

    setIsSubmitting(true)
    setRequestError(null)

    try {
      const response = await fetch('/api/roadmap/project-review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roadmapId: context.roadmap.id,
          roadmapTaskId: context.task.id,
          projectType: 'mini_project',
          repoUrl: repoUrl.trim(),
          liveUrl: liveUrl.trim() || null,
          notes: notes.trim() || null,
          taskContext: `${context.task.weekTitle} ${context.task.title} ${context.task.description} ${context.task.deliverable}`,
        }),
      })

      const data = await response.json().catch(() => null)
      if (!response.ok) {
        throw new Error(data?.error || 'Failed to submit mini project.')
      }

      setSubmission((previous) => ({
        id: previous?.id ?? data.submissionId ?? crypto.randomUUID(),
        status: data.status,
        repoUrl: repoUrl.trim(),
        liveUrl: liveUrl.trim() || null,
        notes: notes.trim() || null,
      }))
      setReview({
        status: data.status,
        score: data.score ?? null,
        summary: data.summary ?? null,
        strengths: data.strengths ?? [],
        issues: data.issues ?? [],
        requiredFixes: data.requiredFixes ?? [],
        suggestions: data.suggestions ?? [],
      })
      setContext((previous) => previous ? {
        ...previous,
        task: {
          ...previous.task,
          projectRequired: true,
          projectPassed: data.status === 'passed',
          requirementState: data.status === 'passed' ? 'completed' : 'project_pending',
        },
      } : previous)
    } catch (error) {
      setRequestError(error instanceof Error ? error.message : 'Failed to submit mini project.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AppShell showBottomNav={true}>
      <GradientBackground />
      <div className="flex-1">
        <DashboardHeader
          icon={FileCode2}
          iconColor="green"
          title="Mini Project"
          subtitle="Submit and review assignment for this roadmap task"
        />

        <Container className="py-6">
          <div className="mb-4">
            <Link href="/roadmap">
              <BrutalButton variant="outline" color="black" size="sm">
                <ArrowLeft className="h-4 w-4" />
                Back to Roadmap
              </BrutalButton>
            </Link>
          </div>

          {(pageState === 'loading') && (
            <BrutalCard color="white">
              <p className="font-medium">{pageMessage}</p>
            </BrutalCard>
          )}

          {(pageState === 'error' || pageState === 'unauthorized' || pageState === 'not_found' || pageState === 'no_project') && (
            <BrutalCard color="red" className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
              <p className="font-medium">{pageMessage}</p>
            </BrutalCard>
          )}

          {context && pageState === 'locked' && (
            <BrutalCard color="yellow" className="flex items-start gap-3">
              <Lock className="mt-0.5 h-5 w-5 shrink-0" />
              <div>
                <p className="font-bold">{pageMessage}</p>
                <p className="mt-1 text-sm text-black/70">
                  Go to task quiz page and pass it first.
                </p>
                <div className="mt-3">
                  <Link href={`/roadmap/tasks/${context.task.id}/quiz`}>
                    <BrutalButton color="black" size="sm">Open Quiz Page</BrutalButton>
                  </Link>
                </div>
              </div>
            </BrutalCard>
          )}

          {context && pageState === 'ready' && (
            <div className="space-y-4">
              <BrutalCard color="green">
                <p className="text-xs font-bold uppercase text-black/70">{context.task.weekTitle}</p>
                <h2 className="mt-1 font-display text-2xl font-bold">{context.task.title}</h2>
                <p className="mt-2 text-sm text-black/70">{context.task.description}</p>
                <div className="mt-3 rounded-md border-2 border-black bg-white p-3 text-sm">
                  <p className="font-bold">Deliverable</p>
                  <p>{context.task.deliverable}</p>
                </div>

                {context.task.miniProject && (
                  <div className="mt-3 space-y-3 rounded-md border-2 border-black bg-white p-3">
                    <div>
                      <p className="text-xs font-bold uppercase text-gray-600">Mini Project Brief</p>
                      <p className="font-bold">{context.task.miniProject.title}</p>
                      <p className="text-sm text-gray-700">{context.task.miniProject.description}</p>
                    </div>
                    <div>
                      <p className="mb-2 text-sm font-bold">Skills Covered</p>
                      <div className="flex flex-wrap gap-2">
                        {context.task.miniProject.skillsCovered.map((skill) => (
                          <SkillBadge key={skill} name={skill} size="sm" />
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="mb-2 text-sm font-bold">Acceptance Criteria</p>
                      <ul className="space-y-1 text-sm text-gray-700">
                        {context.task.miniProject.acceptanceCriteria.map((item) => (
                          <li key={item} className="flex items-start gap-2">
                            <CheckCircle2 className="mt-0.5 h-4 w-4" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </BrutalCard>

              <BrutalCard color="white" className="space-y-3">
                <h3 className="font-display text-lg font-bold">Submission</h3>
                <div className="grid gap-3 md:grid-cols-2">
                  <label className="space-y-1">
                    <span className="text-sm font-bold">GitHub Repo URL</span>
                    <div className="flex items-center gap-2 rounded-md border-2 border-black bg-white px-3 py-2">
                      <Github className="h-4 w-4" />
                      <input
                        value={repoUrl}
                        onChange={(event) => setRepoUrl(event.target.value)}
                        placeholder="https://github.com/owner/repo"
                        className="w-full bg-transparent text-sm outline-none"
                      />
                    </div>
                  </label>
                  <label className="space-y-1">
                    <span className="text-sm font-bold">Live Demo URL (Optional)</span>
                    <div className="flex items-center gap-2 rounded-md border-2 border-black bg-white px-3 py-2">
                      <Globe className="h-4 w-4" />
                      <input
                        value={liveUrl}
                        onChange={(event) => setLiveUrl(event.target.value)}
                        placeholder="https://your-demo.app"
                        className="w-full bg-transparent text-sm outline-none"
                      />
                    </div>
                  </label>
                </div>
                <label className="space-y-1">
                  <span className="text-sm font-bold">Reviewer Notes (Optional)</span>
                  <div className="flex items-start gap-2 rounded-md border-2 border-black bg-white px-3 py-2">
                    <MessageSquareText className="mt-0.5 h-4 w-4" />
                    <textarea
                      value={notes}
                      onChange={(event) => setNotes(event.target.value)}
                      rows={4}
                      placeholder="Explain what to focus during review..."
                      className="w-full resize-y bg-transparent text-sm outline-none"
                    />
                  </div>
                </label>
                {requestError && (
                  <p className="rounded-md border-2 border-black bg-red/10 px-3 py-2 text-sm font-medium text-red">{requestError}</p>
                )}
                <BrutalButton color="black" loading={isSubmitting} disabled={isSubmitting} onClick={submit}>
                  {review?.status === 'needs_revision' ? 'Resubmit Mini Project' : 'Submit Mini Project'}
                </BrutalButton>
              </BrutalCard>

              {(submission || review) && (
                <BrutalCard color="blue" className="space-y-3">
                  <h3 className="font-display text-lg font-bold">Latest Review</h3>
                  {submission && (
                    <div className="rounded-md border-2 border-black bg-white p-3 text-sm">
                      <p className="font-bold">Submission status: {submission.status}</p>
                      <p className="text-gray-700">{submission.repoUrl}</p>
                    </div>
                  )}

                  {review && (
                    <div className="space-y-3">
                      <div className="rounded-md border-2 border-black bg-white p-3 text-sm">
                        <p className="font-bold">Review status: {review.status}</p>
                        <p>Score: {review.score ?? 'n/a'}</p>
                        {review.summary && <p className="mt-1 text-gray-700">{review.summary}</p>}
                      </div>

                      {review.strengths.length > 0 && (
                        <div className="rounded-md border-2 border-black bg-white p-3 text-sm">
                          <p className="mb-1 font-bold">Strengths</p>
                          <ul className="space-y-1">
                            {review.strengths.map((item) => (
                              <li key={item}>- {item}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {review.issues.length > 0 && (
                        <div className="rounded-md border-2 border-black bg-white p-3 text-sm">
                          <p className="mb-1 font-bold">Issues</p>
                          <ul className="space-y-1">
                            {review.issues.map((item) => (
                              <li key={item}>- {item}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {review.requiredFixes.length > 0 && (
                        <div className="rounded-md border-2 border-black bg-white p-3 text-sm">
                          <p className="mb-1 font-bold">Required Fixes</p>
                          <ul className="space-y-1">
                            {review.requiredFixes.map((item) => (
                              <li key={item}>- {item}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {review.suggestions.length > 0 && (
                        <div className="rounded-md border-2 border-black bg-white p-3 text-sm">
                          <p className="mb-1 font-bold">Suggestions</p>
                          <ul className="space-y-1">
                            {review.suggestions.map((item) => (
                              <li key={item}>- {item}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </BrutalCard>
              )}
            </div>
          )}
        </Container>
      </div>
    </AppShell>
  )
}
