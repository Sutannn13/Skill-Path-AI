'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  FileCode2,
  Github,
  Globe,
  MessageSquareText,
} from 'lucide-react'
import { AppShell, Container, GradientBackground } from '@/components/layout'
import { DashboardHeader } from '@/components/layout/dashboard-header'
import { BrutalButton, BrutalCard, SkillBadge } from '@/components/brutal'
import { createSupabaseBrowserClient } from '@/lib/supabase/browser'
import {
  loadActiveRoadmapContext,
  resolveFinalPortfolioProject,
} from '@/lib/roadmap/navigation-context'
import { RoadmapProjectReviewStatus } from '@/types'

type PageState = 'loading' | 'ready' | 'no_roadmap' | 'error' | 'unauthorized' | 'no_final_project'

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

export default function FinalProjectPage() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), [])
  const [roadmapId, setRoadmapId] = useState<string | null>(null)
  const [pageState, setPageState] = useState<PageState>('loading')
  const [pageMessage, setPageMessage] = useState('Loading final project...')
  const [projectTitle, setProjectTitle] = useState('Final Portfolio Project')
  const [projectDescription, setProjectDescription] = useState('')
  const [projectFeatures, setProjectFeatures] = useState<string[]>([])
  const [projectSkills, setProjectSkills] = useState<string[]>([])
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

        const activeRoadmap = await loadActiveRoadmapContext({
          supabase,
          userId: user.id,
        })

        if (!activeRoadmap) {
          if (active) {
            setPageState('no_roadmap')
            setPageMessage('No active roadmap found.')
          }
          return
        }

        const finalProject = resolveFinalPortfolioProject(activeRoadmap.context)
        if (!finalProject) {
          if (active) {
            setPageState('no_final_project')
            setPageMessage('Final project definition is not available for this roadmap.')
          }
          return
        }

        if (active) {
          setRoadmapId(activeRoadmap.id)
          setProjectTitle(finalProject.title)
          setProjectDescription(finalProject.description)
          setProjectFeatures(finalProject.features)
          setProjectSkills(finalProject.skillsCovered)
          setPageState('ready')
        }

        await loadLatestReview(activeRoadmap.id)
      } catch (error) {
        if (active) {
          setPageState('error')
          setPageMessage(error instanceof Error ? error.message : 'Failed to load final project page.')
        }
      }
    }

    const loadLatestReview = async (resolvedRoadmapId: string) => {
      const params = new URLSearchParams({
        roadmapId: resolvedRoadmapId,
        projectType: 'final_project',
      })

      const response = await fetch(`/api/roadmap/project-review?${params.toString()}`)
      const data = await response.json().catch(() => null)
      if (!response.ok) {
        throw new Error(data?.error || 'Failed to load final project review.')
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
  }, [supabase])

  const submit = async () => {
    if (!roadmapId) return

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
          roadmapId,
          roadmapTaskId: null,
          projectType: 'final_project',
          repoUrl: repoUrl.trim(),
          liveUrl: liveUrl.trim() || null,
          notes: notes.trim() || null,
          taskContext: `${projectTitle} ${projectDescription}`,
        }),
      })

      const data = await response.json().catch(() => null)
      if (!response.ok) {
        throw new Error(data?.error || 'Failed to submit final project.')
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
    } catch (error) {
      setRequestError(error instanceof Error ? error.message : 'Failed to submit final project.')
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
          title="Final Project"
          subtitle="Submit your portfolio capstone for roadmap completion"
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

          {(pageState === 'error' || pageState === 'unauthorized' || pageState === 'no_roadmap' || pageState === 'no_final_project') && (
            <BrutalCard color="red" className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
              <p className="font-medium">{pageMessage}</p>
            </BrutalCard>
          )}

          {pageState === 'ready' && (
            <div className="space-y-4">
              <BrutalCard color="green">
                <h2 className="font-display text-2xl font-bold">{projectTitle}</h2>
                <p className="mt-2 text-sm text-black/70">{projectDescription}</p>

                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <div className="rounded-md border-2 border-black bg-white p-3 text-sm">
                    <p className="mb-2 font-bold">Core Requirements</p>
                    <ul className="space-y-1">
                      {projectFeatures.map((feature) => (
                        <li key={feature} className="flex items-start gap-2">
                          <CheckCircle2 className="mt-0.5 h-4 w-4" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-md border-2 border-black bg-white p-3 text-sm">
                    <p className="mb-2 font-bold">Skills to Demonstrate</p>
                    <div className="flex flex-wrap gap-2">
                      {projectSkills.map((skill) => (
                        <SkillBadge key={skill} name={skill} size="sm" />
                      ))}
                    </div>
                  </div>
                </div>
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
                      placeholder="Mention key flows, deployment notes, and known tradeoffs..."
                      className="w-full resize-y bg-transparent text-sm outline-none"
                    />
                  </div>
                </label>
                {requestError && (
                  <p className="rounded-md border-2 border-black bg-red/10 px-3 py-2 text-sm font-medium text-red">{requestError}</p>
                )}
                <BrutalButton color="black" loading={isSubmitting} disabled={isSubmitting} onClick={submit}>
                  {review?.status === 'needs_revision' ? 'Resubmit Final Project' : 'Submit Final Project'}
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
