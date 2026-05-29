'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { AppShell, Container, GradientBackground } from '@/components/layout'
import { DashboardHeader } from '@/components/layout/dashboard-header'
import { BrutalCard, BrutalButton, SkillBadge, MatchScorePill } from '@/components/brutal'
import { getDeterministicMatchScore, getDeterministicValidityScore, getRiskLabel, getRiskLevel } from '@/lib/jobs/display'
import { extractSkillsFromJob } from '@/lib/jobs/skill-extraction'
import { createSupabaseBrowserClient } from '@/lib/supabase/browser'
import { cn } from '@/lib/utils'
import {
  AlertTriangle,
  ArrowLeft,
  Bookmark,
  Briefcase,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileText,
  Globe,
  Lightbulb,
  MapPin,
} from 'lucide-react'
import { Job } from '@/types'

function getJobDate(job: Job): string {
  const published = job.publishedAt ? new Date(job.publishedAt) : null
  if (published && !Number.isNaN(published.getTime())) {
    return `Posted ${published.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
  }

  const fetched = job.fetchedAt ? new Date(job.fetchedAt) : null
  if (fetched && !Number.isNaN(fetched.getTime())) {
    return `Fetched ${fetched.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
  }

  return 'Date unknown'
}

export default function JobDetailPage() {
  const params = useParams()
  const id = params?.id as string
  const supabase = useMemo(() => createSupabaseBrowserClient(), [])
  const [job, setJob] = useState<Job | null>(null)
  const [similarJobs, setSimilarJobs] = useState<Job[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSaved, setIsSaved] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  useEffect(() => {
    let isActive = true

    const loadJob = async () => {
      if (!id) return

      setIsLoading(true)
      setError(null)

      try {
        const [jobResponse, jobsResponse] = await Promise.all([
          fetch(`/api/jobs?id=${encodeURIComponent(id)}`),
          fetch('/api/jobs?freshnessDays=90'),
        ])
        const jobData = await jobResponse.json()

        if (!jobResponse.ok) {
          throw new Error(jobData?.error || 'Job not found.')
        }

        const allJobsData = await jobsResponse.json().catch(() => ({ jobs: [] }))

        if (!isActive) return
        const loadedJob = jobData.job as Job
        setJob(loadedJob)
        setSimilarJobs(
          ((allJobsData.jobs ?? []) as Job[])
            .filter((candidate) => candidate.id !== loadedJob.id && candidate.tags.some((tag) => loadedJob.tags.includes(tag)))
            .slice(0, 3)
        )
      } catch (loadError) {
        if (!isActive) return
        setError(loadError instanceof Error ? loadError.message : 'Job not found.')
      } finally {
        if (isActive) {
          setIsLoading(false)
        }
      }
    }

    loadJob()

    return () => {
      isActive = false
    }
  }, [id])

  useEffect(() => {
    let isActive = true

    const loadSavedState = async () => {
      if (!supabase || !id) return

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const { data, error: savedError } = await supabase
        .from('saved_jobs')
        .select('id')
        .eq('user_id', user.id)
        .eq('job_id', id)
        .maybeSingle()

      if (!isActive) return

      if (savedError) {
        setSaveError(`Failed to load saved job state: ${savedError.message}`)
        return
      }

      setIsSaved(Boolean(data))
    }

    loadSavedState()

    return () => {
      isActive = false
    }
  }, [id, supabase])

  const toggleSave = async () => {
    if (!supabase || !job) {
      setSaveError('Sign in with Supabase before saving jobs.')
      return
    }

    setIsSaving(true)
    setSaveError(null)

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      setSaveError('Sign in before saving jobs.')
      setIsSaving(false)
      return
    }

    const { error: mutationError } = isSaved
      ? await supabase
        .from('saved_jobs')
        .delete()
        .eq('user_id', user.id)
        .eq('job_id', job.id)
      : await supabase
        .from('saved_jobs')
        .insert({ user_id: user.id, job_id: job.id })

    if (mutationError) {
      setSaveError(`Failed to update saved job: ${mutationError.message}`)
      setIsSaving(false)
      return
    }

    setIsSaved((current) => !current)
    setIsSaving(false)
  }

  if (isLoading) {
    return (
      <AppShell showBottomNav={true}>
        <GradientBackground />
        <DashboardHeader
          icon={Briefcase}
          iconColor="blue"
          title="Job Details"
          subtitle="Loading job post"
        />
        <Container className="py-6">
          <BrutalCard color="white">
            <p className="font-bold">Loading job details...</p>
          </BrutalCard>
        </Container>
      </AppShell>
    )
  }

  if (!job || error) {
    return (
      <AppShell showBottomNav={true}>
        <GradientBackground />
        <DashboardHeader
          icon={Briefcase}
          iconColor="blue"
          title="Job Not Found"
          subtitle="This posting is not available"
        />
        <Container className="py-6">
          <BrutalCard color="white" className="max-w-2xl">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
              <div className="w-16 h-16 bg-yellow/20 brutal-border brutal-radius flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-yellow" />
              </div>
              <div className="flex-1">
                <h1 className="font-display font-bold text-2xl mb-2">Job Not Found</h1>
                <p className="text-gray-600 mb-6">
                  {error ?? 'The job posting may be expired, rejected, or outside the current freshness window.'}
                </p>
                <Link href="/jobs">
                  <BrutalButton color="yellow">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Jobs
                  </BrutalButton>
                </Link>
              </div>
            </div>
          </BrutalCard>
        </Container>
      </AppShell>
    )
  }

  const extractedSkills = extractSkillsFromJob(job)
  const matchScore = job.matchScore ?? getDeterministicMatchScore(job.id)
  const validityScore = job.validityScore ?? getDeterministicValidityScore(job.id)
  const riskLevel = job.riskLevel ?? getRiskLevel(validityScore)

  return (
    <AppShell showBottomNav={true}>
      <GradientBackground />

      <div className="min-h-screen">
        <DashboardHeader
          icon={Briefcase}
          iconColor="blue"
          title="Job Details"
        />

        <Container className="py-6">
          <Link href="/jobs" className="mb-6 inline-flex">
            <BrutalButton variant="ghost" color="black" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Jobs
            </BrutalButton>
          </Link>

          {saveError && (
            <BrutalCard color="red" className="mb-6 flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
              <p className="font-medium">{saveError}</p>
            </BrutalCard>
          )}

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <motion.div initial={false} animate={{ opacity: 1, y: 0 }}>
                <BrutalCard color="white" className="relative">
                  <div className="absolute right-4 top-4 flex flex-wrap justify-end gap-2">
                    <span className="text-xs px-2 py-1 bg-gray-100 brutal-radius text-gray-600">
                      {job.sourceLabel ?? job.source}
                    </span>
                    {job.moderationStatus === 'pending_review' && (
                      <span className="text-xs px-2 py-1 bg-yellow/30 brutal-radius font-bold text-yellow">
                        Pending review
                      </span>
                    )}
                    <span
                      className={cn(
                        'text-xs px-2 py-1 brutal-radius font-bold',
                        riskLevel === 'low' && 'bg-green/20 text-green',
                        riskLevel === 'medium' && 'bg-yellow/30 text-yellow',
                        riskLevel === 'high' && 'bg-red/20 text-red'
                      )}
                    >
                      {getRiskLabel(riskLevel)}
                    </span>
                  </div>

                  <div className="flex items-start gap-4 mb-4 pr-28">
                    <div className="w-16 h-16 bg-blue/20 brutal-border brutal-radius flex items-center justify-center shrink-0">
                      <span className="text-2xl font-bold text-blue">
                        {job.company.charAt(0)}
                      </span>
                    </div>

                    <div className="flex-1">
                      <h1 className="font-display font-bold text-2xl mb-1">{job.title}</h1>
                      <p className="text-lg text-gray-600">{job.company}</p>
                    </div>
                  </div>

                  <div className="mb-4 flex flex-wrap gap-3">
                    <MatchScorePill score={matchScore} size="md" />
                    <span className="brutal-border brutal-radius inline-flex items-center px-3 py-1 text-sm font-bold bg-green/10">
                      Validity {validityScore}%
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-4 mb-6">
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-5 h-5" />
                      {job.location}
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Briefcase className="w-5 h-5" />
                      {job.type}
                    </div>
                    {job.workMode && (
                      <div className="flex items-center gap-2 text-gray-600 capitalize">
                        <Globe className="w-5 h-5" />
                        {job.workMode}
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="w-5 h-5" />
                      {getJobDate(job)}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-6">
                    {job.tags.map(tag => (
                      <SkillBadge key={tag} name={tag} size="sm" />
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <a
                      href={job.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 sm:flex-none"
                    >
                      <BrutalButton color="blue" className="w-full">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Apply Now
                      </BrutalButton>
                    </a>
                    <BrutalButton
                      variant="outline"
                      color={isSaved ? 'green' : 'black'}
                      onClick={toggleSave}
                      loading={isSaving}
                      disabled={isSaving}
                    >
                      <Bookmark className={cn('w-4 h-4', isSaved && 'fill-current')} />
                      {isSaved ? 'Saved' : 'Save Job'}
                    </BrutalButton>
                    <Link href={`/roadmap?job=${job.id}`} className="flex-1 sm:flex-none">
                      <BrutalButton color="yellow" className="w-full">
                        Generate Roadmap
                      </BrutalButton>
                    </Link>
                  </div>
                </BrutalCard>
              </motion.div>

              <motion.div initial={false} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <BrutalCard color="white">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-purple/20 brutal-radius flex items-center justify-center">
                      <FileText className="w-5 h-5 text-purple" />
                    </div>
                    <h2 className="font-display font-bold text-xl">Job Description</h2>
                  </div>
                  <p className="text-gray-700 whitespace-pre-wrap">{job.description}</p>
                </BrutalCard>
              </motion.div>

              <motion.div initial={false} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <BrutalCard color="white">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-green/20 brutal-radius flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-green" />
                    </div>
                    <h2 className="font-display font-bold text-xl">Required Skills</h2>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {extractedSkills.map(skill => (
                      <span
                        key={skill}
                        className="text-sm px-3 py-1.5 bg-gray-100 brutal-radius font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </BrutalCard>
              </motion.div>
            </div>

            <div className="space-y-6">
              <motion.div initial={false} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                <BrutalCard color="yellow" className="sticky top-20">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-black/10 brutal-radius flex items-center justify-center">
                      <Lightbulb className="w-5 h-5" />
                    </div>
                    <h3 className="font-display font-bold">Job Signals</h3>
                  </div>
                  <div className="space-y-3 text-sm text-gray-700">
                    <p>
                      Deterministic validity is {validityScore}% and risk is {getRiskLabel(riskLevel).toLowerCase()}.
                    </p>
                    <p>
                      Match score is {matchScore}%. AI analysis is only run when requested, not during normal listing.
                    </p>
                  </div>
                  <div className="mt-4 pt-4 border-t-2 border-black/10">
                    <Link href={`/roadmap?job=${job.id}`}>
                      <BrutalButton variant="outline" color="black" className="w-full" size="sm">
                        Generate Roadmap
                      </BrutalButton>
                    </Link>
                  </div>
                </BrutalCard>
              </motion.div>

              {similarJobs.length > 0 && (
                <motion.div initial={false} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                  <BrutalCard color="white">
                    <h3 className="font-display font-bold mb-4">Similar Jobs</h3>
                    <div className="space-y-3">
                      {similarJobs.map(similarJob => (
                        <Link key={similarJob.id} href={`/jobs/${similarJob.id}`} className="block rounded-md border-2 border-black bg-gray-50 p-3 hover:bg-gray-100">
                          <h4 className="font-medium text-sm mb-1">{similarJob.title}</h4>
                          <p className="text-xs text-gray-500">{similarJob.company}</p>
                          <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                            <MapPin className="w-3 h-3" />
                            {similarJob.location}
                          </div>
                        </Link>
                      ))}
                    </div>
                  </BrutalCard>
                </motion.div>
              )}
            </div>
          </div>
        </Container>
      </div>
    </AppShell>
  )
}
