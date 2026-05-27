'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { AppShell, Container, GradientBackground } from '@/components/layout'
import { DashboardHeader } from '@/components/layout/dashboard-header'
import { BrutalCard, BrutalButton, SkillBadge, MatchScorePill } from '@/components/brutal'
import { getDeterministicMatchScore, getDeterministicValidityScore, getRiskLabel, getRiskLevel } from '@/lib/jobs/display'
import { extractSkillsFromJob } from '@/lib/jobs/skill-extraction'
import { createSupabaseBrowserClient } from '@/lib/supabase/browser'
import { cn } from '@/lib/utils'
import {
  AlertCircle,
  Bookmark,
  Briefcase,
  CheckCircle2,
  Clock,
  ExternalLink,
  Filter,
  Globe,
  MapPin,
  Search,
  X,
} from 'lucide-react'
import { Job } from '@/types'

type RegionFilter = 'all' | 'indonesia' | 'international' | 'remote'
type JobTypeFilter = 'all' | 'internship' | 'full-time' | 'part-time' | 'contract' | 'freelance'
type ExperienceFilter = 'all' | 'beginner' | 'internship' | 'junior' | 'mid' | 'senior'
type TechStackFilter = 'all' | 'frontend' | 'backend' | 'fullstack' | 'mobile' | 'ui-ux' | 'data'
type FreshnessFilter = '7' | '30' | '90'

interface Filters {
  region: RegionFilter
  jobType: JobTypeFilter
  experience: ExperienceFilter
  techStack: TechStackFilter
  freshnessDays: FreshnessFilter
}

interface SaveStatus {
  type: 'success' | 'error'
  message: string
}

const regionOptions: { value: RegionFilter; label: string }[] = [
  { value: 'all', label: 'All Regions' },
  { value: 'indonesia', label: 'Indonesia' },
  { value: 'international', label: 'International' },
  { value: 'remote', label: 'Remote' },
]

const jobTypeOptions: { value: JobTypeFilter; label: string }[] = [
  { value: 'all', label: 'All Types' },
  { value: 'internship', label: 'Internship' },
  { value: 'full-time', label: 'Full-time' },
  { value: 'part-time', label: 'Part-time' },
  { value: 'contract', label: 'Contract' },
  { value: 'freelance', label: 'Freelance' },
]

const experienceOptions: { value: ExperienceFilter; label: string }[] = [
  { value: 'all', label: 'All Levels' },
  { value: 'beginner', label: 'Beginner' },
  { value: 'internship', label: 'Internship' },
  { value: 'junior', label: 'Junior' },
  { value: 'mid', label: 'Mid-Level' },
  { value: 'senior', label: 'Senior' },
]

const techStackOptions: { value: TechStackFilter; label: string }[] = [
  { value: 'all', label: 'All Stacks' },
  { value: 'frontend', label: 'Frontend' },
  { value: 'backend', label: 'Backend' },
  { value: 'fullstack', label: 'Fullstack' },
  { value: 'mobile', label: 'Mobile' },
  { value: 'ui-ux', label: 'UI/UX' },
  { value: 'data', label: 'Data' },
]

const freshnessOptions: { value: FreshnessFilter; label: string }[] = [
  { value: '7', label: 'Last 7 days' },
  { value: '30', label: 'Last 30 days' },
  { value: '90', label: 'Last 90 days' },
]

const techStackKeywords: Record<TechStackFilter, string[]> = {
  all: [],
  frontend: ['react', 'vue', 'angular', 'next', 'javascript', 'typescript', 'css', 'html', 'tailwind', 'sass'],
  backend: ['node', 'python', 'java', 'go', 'rust', 'postgresql', 'mongodb', 'express', 'django', 'sql'],
  fullstack: ['react', 'node', 'typescript', 'postgresql', 'express', 'next', 'mongodb', 'fullstack'],
  mobile: ['react native', 'flutter', 'swift', 'kotlin', 'ios', 'android', 'mobile'],
  'ui-ux': ['figma', 'ui', 'ux', 'css', 'tailwind', 'adobe', 'sketch', 'design'],
  data: ['python', 'sql', 'machine learning', 'tensorflow', 'pytorch', 'data science', 'pandas', 'analytics'],
}

function getJobDate(job: Job): { label: string; isUnknown: boolean } {
  const published = job.publishedAt ? new Date(job.publishedAt) : null
  if (published && !Number.isNaN(published.getTime())) {
    return {
      label: `Posted ${published.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`,
      isUnknown: false,
    }
  }

  const fetched = job.fetchedAt ? new Date(job.fetchedAt) : null
  if (fetched && !Number.isNaN(fetched.getTime())) {
    return {
      label: `Fetched ${fetched.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`,
      isUnknown: false,
    }
  }

  return { label: 'Date unknown', isUnknown: true }
}

function inferExperience(job: Job): ExperienceFilter {
  const text = `${job.title} ${job.description} ${job.tags.join(' ')}`.toLowerCase()
  if (text.includes('intern')) return 'internship'
  if (text.includes('junior') || text.includes('entry')) return 'junior'
  if (text.includes('senior')) return 'senior'
  if (text.includes('mid')) return 'mid'
  return 'beginner'
}

export default function JobsPage() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), [])
  const [jobs, setJobs] = useState<Job[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [savedJobs, setSavedJobs] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [loadingError, setLoadingError] = useState<string | null>(null)
  const [saveStatus, setSaveStatus] = useState<SaveStatus | null>(null)
  const [savingJobId, setSavingJobId] = useState<string | null>(null)
  const [dataSource, setDataSource] = useState<'supabase' | 'memory' | 'mock'>('mock')
  const [filters, setFilters] = useState<Filters>({
    region: 'all',
    jobType: 'all',
    experience: 'all',
    techStack: 'all',
    freshnessDays: '90',
  })

  useEffect(() => {
    let isActive = true

    const loadJobs = async () => {
      setIsLoading(true)
      setLoadingError(null)

      try {
        const response = await fetch(`/api/jobs?freshnessDays=${filters.freshnessDays}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data?.error || 'Failed to load jobs.')
        }

        if (!isActive) return

        setJobs((data.jobs ?? []) as Job[])
        setDataSource(data.meta?.source ?? 'mock')
      } catch (error) {
        if (!isActive) return
        setLoadingError(error instanceof Error ? error.message : 'Failed to load jobs.')
        setJobs([])
      } finally {
        if (isActive) {
          setIsLoading(false)
        }
      }
    }

    loadJobs()

    return () => {
      isActive = false
    }
  }, [filters.freshnessDays])

  useEffect(() => {
    let isActive = true

    const loadSavedJobs = async () => {
      if (!supabase) return

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const { data, error } = await supabase
        .from('saved_jobs')
        .select('job_id')
        .eq('user_id', user.id)

      if (!isActive) return

      if (error) {
        setSaveStatus({ type: 'error', message: `Failed to load saved jobs: ${error.message}` })
        return
      }

      setSavedJobs((data ?? []).map((item: { job_id: string }) => item.job_id))
    }

    loadSavedJobs()

    return () => {
      isActive = false
    }
  }, [supabase])

  const allTags = useMemo(
    () => Array.from(new Set(jobs.flatMap((job) => job.tags))).sort(),
    [jobs]
  )

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchesSearch =
        searchQuery === '' ||
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.company.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesTags =
        selectedTags.length === 0 ||
        selectedTags.some((tag) => job.tags.includes(tag))

      let matchesRegion = true
      if (filters.region !== 'all') {
        const locationLower = job.location.toLowerCase()
        if (filters.region === 'remote') {
          matchesRegion = locationLower.includes('remote') || locationLower.includes('work from home')
        } else if (filters.region === 'indonesia') {
          matchesRegion = locationLower.includes('jakarta') || locationLower.includes('bandung') ||
            locationLower.includes('surabaya') || locationLower.includes('indonesia')
        } else {
          matchesRegion = !locationLower.includes('jakarta') && !locationLower.includes('bandung') &&
            !locationLower.includes('surabaya') && !locationLower.includes('indonesia')
        }
      }

      const matchesJobType = filters.jobType === 'all' || job.type === filters.jobType
      const matchesExperience = filters.experience === 'all' || inferExperience(job) === filters.experience

      let matchesTechStack = true
      if (filters.techStack !== 'all') {
        const keywords = techStackKeywords[filters.techStack] || []
        const jobText = `${job.title} ${job.description} ${job.tags.join(' ')}`.toLowerCase()
        matchesTechStack = keywords.some(kw => jobText.includes(kw))
      }

      return matchesSearch && matchesTags && matchesRegion && matchesJobType && matchesExperience && matchesTechStack
    })
  }, [filters, jobs, searchQuery, selectedTags])

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag]
    )
  }

  const toggleSaveJob = async (jobId: string) => {
    setSaveStatus(null)

    if (!supabase) {
      setSaveStatus({ type: 'error', message: 'Sign in with Supabase before saving jobs.' })
      return
    }

    setSavingJobId(jobId)

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      setSaveStatus({ type: 'error', message: 'Sign in before saving jobs.' })
      setSavingJobId(null)
      return
    }

    const wasSaved = savedJobs.includes(jobId)
    setSavedJobs((prev) => wasSaved ? prev.filter((id) => id !== jobId) : [...prev, jobId])

    const { error } = wasSaved
      ? await supabase
        .from('saved_jobs')
        .delete()
        .eq('user_id', user.id)
        .eq('job_id', jobId)
      : await supabase
        .from('saved_jobs')
        .insert({ user_id: user.id, job_id: jobId })

    if (error) {
      setSavedJobs((prev) => wasSaved ? [...prev, jobId] : prev.filter((id) => id !== jobId))
      setSaveStatus({ type: 'error', message: `Failed to update saved job: ${error.message}` })
      setSavingJobId(null)
      return
    }

    setSaveStatus({
      type: 'success',
      message: wasSaved ? 'Job removed from saved jobs.' : 'Job saved to your account.',
    })
    setSavingJobId(null)
  }

  const resetFilters = () => {
    setFilters({
      region: 'all',
      jobType: 'all',
      experience: 'all',
      techStack: 'all',
      freshnessDays: '90',
    })
    setSelectedTags([])
  }

  const activeFilterCount = [
    filters.region !== 'all',
    filters.jobType !== 'all',
    filters.experience !== 'all',
    filters.techStack !== 'all',
    filters.freshnessDays !== '90',
    selectedTags.length > 0,
  ].filter(Boolean).length

  return (
    <AppShell showBottomNav={true}>
      <GradientBackground />

      <div className="flex-1">
        <DashboardHeader title="Job Radar" subtitle="Find jobs that match your skills" />

        <Container className="py-6">
          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search jobs by title or company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 brutal-border brutal-radius bg-white text-lg text-black placeholder-gray-500 caret-black focus:outline-none focus:ring-2 focus:ring-yellow"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 mb-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 brutal-border brutal-radius font-medium transition-all',
                showFilters || activeFilterCount > 0
                  ? 'bg-black text-white'
                  : 'bg-white hover:bg-gray-100'
              )}
            >
              <Filter className="w-4 h-4" />
              Filters
              {activeFilterCount > 0 && (
                <span className="bg-yellow text-black text-xs px-1.5 py-0.5 brutal-radius font-bold">
                  {activeFilterCount}
                </span>
              )}
            </button>

            <div className="flex flex-wrap gap-1">
              {regionOptions.slice(1).map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setFilters(f => ({ ...f, region: filters.region === opt.value ? 'all' : opt.value }))}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 text-sm brutal-radius transition-all',
                    filters.region === opt.value
                      ? 'bg-blue/20 border-2 border-blue text-blue font-medium'
                      : 'bg-white border-2 border-transparent hover:bg-gray-50'
                  )}
                >
                  <Globe className="w-3.5 h-3.5" />
                  {opt.label}
                </button>
              ))}
            </div>

            {activeFilterCount > 0 && (
              <button
                onClick={resetFilters}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-500 hover:text-black transition-colors"
              >
                <X className="w-4 h-4" />
                Reset
              </button>
            )}
          </div>

          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 p-4 bg-white brutal-border brutal-radius"
            >
              <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <FilterSelect
                  label="Freshness"
                  value={filters.freshnessDays}
                  options={freshnessOptions}
                  onChange={(value) => setFilters(f => ({ ...f, freshnessDays: value as FreshnessFilter }))}
                />
                <FilterSelect
                  label="Job Type"
                  value={filters.jobType}
                  options={jobTypeOptions}
                  onChange={(value) => setFilters(f => ({ ...f, jobType: value as JobTypeFilter }))}
                />
                <FilterSelect
                  label="Experience"
                  value={filters.experience}
                  options={experienceOptions}
                  onChange={(value) => setFilters(f => ({ ...f, experience: value as ExperienceFilter }))}
                />
                <FilterSelect
                  label="Tech Stack"
                  value={filters.techStack}
                  options={techStackOptions}
                  onChange={(value) => setFilters(f => ({ ...f, techStack: value as TechStackFilter }))}
                />
                <FilterSelect
                  label="Region"
                  value={filters.region}
                  options={regionOptions}
                  onChange={(value) => setFilters(f => ({ ...f, region: value as RegionFilter }))}
                />
              </div>

              <div className="mt-4 pt-4 border-t-2 border-gray-200">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm font-medium">Skills:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {allTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={cn(
                        'px-3 py-1 brutal-border brutal-radius text-sm font-medium transition-all',
                        selectedTags.includes(tag)
                          ? 'bg-black text-white'
                          : 'bg-white hover:bg-gray-100'
                      )}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {loadingError && (
            <BrutalCard color="red" className="mb-4 flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
              <p className="font-medium">{loadingError}</p>
            </BrutalCard>
          )}

          {saveStatus && (
            <BrutalCard
              color={saveStatus.type === 'success' ? 'green' : 'red'}
              className="mb-4 flex items-start gap-3"
            >
              {saveStatus.type === 'success' ? (
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
              ) : (
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
              )}
              <p className="font-medium">{saveStatus.message}</p>
            </BrutalCard>
          )}

          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-gray-600">
              Showing {filteredJobs.length} of {jobs.length} jobs
              {filters.region !== 'all' && ` in ${filters.region}`}
              {filters.jobType !== 'all' && ` (${filters.jobType})`}
            </p>
            <span className="brutal-border brutal-radius bg-white px-3 py-1 text-xs font-bold">
              Source: {dataSource === 'supabase' ? 'Supabase' : dataSource === 'memory' ? 'Demo memory fallback' : 'Demo data'}
            </span>
          </div>

          {isLoading && (
            <BrutalCard color="white" className="mb-4">
              <p className="font-bold">Loading jobs from persistent store...</p>
            </BrutalCard>
          )}

          <div className="space-y-4">
            {filteredJobs.map((job, index) => (
              <motion.div
                key={job.id}
                initial={false}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <JobCard
                  job={job}
                  isSaved={savedJobs.includes(job.id)}
                  isSaving={savingJobId === job.id}
                  onToggleSave={() => toggleSaveJob(job.id)}
                />
              </motion.div>
            ))}
          </div>

          {!isLoading && filteredJobs.length === 0 && (
            <BrutalCard color="white" className="text-center py-12">
              <Briefcase className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="font-bold text-xl mb-2">No jobs found</h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your search, freshness window, or filters.
              </p>
              <BrutalButton variant="outline" color="black" onClick={resetFilters}>
                Reset Filters
              </BrutalButton>
            </BrutalCard>
          )}
        </Container>
      </div>
    </AppShell>
  )
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: { value: string; label: string }[]
  onChange: (value: string) => void
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-2">{label}</label>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full px-3 py-2 brutal-border brutal-radius bg-white text-black"
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  )
}

function JobCard({
  job,
  isSaved,
  isSaving,
  onToggleSave,
}: {
  job: Job
  isSaved: boolean
  isSaving: boolean
  onToggleSave: () => void
}) {
  const extractedSkills = extractSkillsFromJob(job)
  const matchScore = job.matchScore ?? getDeterministicMatchScore(job.id)
  const validityScore = job.validityScore ?? getDeterministicValidityScore(job.id)
  const riskLevel = job.riskLevel ?? getRiskLevel(validityScore)
  const dateInfo = getJobDate(job)
  const isPendingReview = job.moderationStatus === 'pending_review'

  return (
    <BrutalCard color="white">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="w-16 h-16 bg-blue/20 brutal-border brutal-radius flex items-center justify-center shrink-0">
          <span className="text-2xl font-bold text-blue">
            {job.company.charAt(0)}
          </span>
        </div>

        <div className="flex-1">
          <div className="flex flex-col gap-3 mb-2 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h3 className="font-display font-bold text-lg">{job.title}</h3>
              <p className="text-gray-600">{job.company}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2 lg:justify-end">
              <span className="text-xs px-2 py-1 bg-gray-100 brutal-radius text-gray-600">
                {job.sourceLabel ?? job.source}
              </span>
              <span
                className={cn(
                  'text-xs px-2 py-1 brutal-radius font-bold',
                  dateInfo.isUnknown ? 'bg-yellow/30 text-yellow' : 'bg-blue/10 text-blue'
                )}
              >
                {dateInfo.label}
              </span>
              {isPendingReview && (
                <span className="text-xs px-2 py-1 bg-yellow/30 text-yellow brutal-radius font-bold">
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
                {getRiskLabel(riskLevel)} - {validityScore}%
              </span>
              <MatchScorePill score={matchScore} size="sm" />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {job.location}
            </span>
            <span className="flex items-center gap-1">
              <Briefcase className="w-4 h-4" />
              {job.type}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {dateInfo.label}
            </span>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {job.tags.slice(0, 5).map((tag) => (
              <SkillBadge key={tag} name={tag} size="sm" />
            ))}
          </div>

          <div className="mb-4">
            <p className="text-sm font-medium mb-2">Required Skills:</p>
            <div className="flex flex-wrap gap-2">
              {extractedSkills.slice(0, 6).map((skill) => (
                <span
                  key={skill}
                  className="text-xs px-2 py-1 bg-gray-100 brutal-radius"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div className="grid gap-3 sm:flex sm:flex-wrap">
            <Link href={`/jobs/${job.id}`} className="w-full sm:w-auto">
              <BrutalButton color="blue" className="w-full">
                View Details
              </BrutalButton>
            </Link>
            <BrutalButton
              variant="outline"
              color={isSaved ? 'green' : 'black'}
              onClick={onToggleSave}
              className="w-full sm:w-auto"
              loading={isSaving}
              disabled={isSaving}
            >
              <Bookmark className={cn('w-4 h-4', isSaved && 'fill-current')} />
              {isSaved ? 'Saved' : 'Save'}
            </BrutalButton>
            <a
              href={job.url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto"
            >
              <BrutalButton variant="ghost" color="black" className="w-full">
                <ExternalLink className="w-4 h-4 mr-2" />
                Apply
              </BrutalButton>
            </a>
          </div>
        </div>
      </div>
    </BrutalCard>
  )
}
