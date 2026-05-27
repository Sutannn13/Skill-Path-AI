'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { AppShell, Container, GradientBackground } from '@/components/layout'
import { DashboardHeader } from '@/components/layout/dashboard-header'
import { BrutalCard, BrutalButton, BrutalCardHover, SkillBadge, MatchScorePill } from '@/components/brutal'
import { MOCK_JOBS } from '@/lib/data/mock-jobs'
import { getDeterministicMatchScore, getDeterministicValidityScore, getRiskLabel, getRiskLevel } from '@/lib/jobs/display'
import { extractSkillsFromJob } from '@/lib/jobs/skill-extraction'
import { cn } from '@/lib/utils'
import { Search, Filter, Bookmark, ExternalLink, MapPin, Briefcase, ChevronDown, X, Globe, Clock } from 'lucide-react'
import { Job } from '@/types'

// Filter types
type RegionFilter = 'all' | 'indonesia' | 'international' | 'remote'
type JobTypeFilter = 'all' | 'internship' | 'full-time' | 'part-time' | 'contract' | 'freelance'
type ExperienceFilter = 'all' | 'beginner' | 'internship' | 'junior' | 'mid' | 'senior'
type TechStackFilter = 'all' | 'frontend' | 'backend' | 'fullstack' | 'mobile' | 'ui-ux' | 'data'

interface Filters {
  region: RegionFilter
  jobType: JobTypeFilter
  experience: ExperienceFilter
  techStack: TechStackFilter
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

// Tech stack keywords mapping
const techStackKeywords: Record<string, string[]> = {
  frontend: ['react', 'vue', 'angular', 'next', 'javascript', 'typescript', 'css', 'html', 'tailwind', 'sass'],
  backend: ['node', 'python', 'java', 'go', 'rust', 'postgresql', 'mongodb', 'express', 'django', 'sql'],
  fullstack: ['react', 'node', 'typescript', 'postgresql', 'express', 'next', 'mongodb', 'fullstack'],
  mobile: ['react native', 'flutter', 'swift', 'kotlin', 'ios', 'android', 'mobile'],
  'ui-ux': ['figma', 'ui', 'ux', 'css', 'tailwind', 'adobe', 'sketch', 'design'],
  data: ['python', 'sql', 'machine learning', 'tensorflow', 'pytorch', 'data science', 'pandas', 'analytics'],
}

export default function JobsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [savedJobs, setSavedJobs] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<Filters>({
    region: 'all',
    jobType: 'all',
    experience: 'all',
    techStack: 'all',
  })

  // Get all unique tags
  const allTags = Array.from(new Set(MOCK_JOBS.flatMap((job) => job.tags))).sort()

  const filteredJobs = MOCK_JOBS.filter((job) => {
    // Search filter
    const matchesSearch =
      searchQuery === '' ||
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase())

    // Tag filter
    const matchesTags =
      selectedTags.length === 0 ||
      selectedTags.some((tag) => job.tags.includes(tag))

    // Region filter
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
                       !locationLower.includes('surabaya') && !locationLower.includes('indonesia') &&
                       !locationLower.includes('remote')
      }
    }

    // Job type filter
    const matchesJobType = filters.jobType === 'all' || job.type === filters.jobType

    // Tech stack filter
    let matchesTechStack = true
    if (filters.techStack !== 'all') {
      const keywords = techStackKeywords[filters.techStack] || []
      const jobText = `${job.title} ${job.description} ${job.tags.join(' ')}`.toLowerCase()
      matchesTechStack = keywords.some(kw => jobText.includes(kw))
    }

    return matchesSearch && matchesTags && matchesRegion && matchesJobType && matchesTechStack
  })

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
  }

  const toggleSaveJob = (jobId: string) => {
    setSavedJobs((prev) =>
      prev.includes(jobId) ? prev.filter((id) => id !== jobId) : [...prev, jobId]
    )
  }

  const resetFilters = () => {
    setFilters({
      region: 'all',
      jobType: 'all',
      experience: 'all',
      techStack: 'all',
    })
    setSelectedTags([])
  }

  const activeFilterCount = [
    filters.region !== 'all',
    filters.jobType !== 'all',
    filters.experience !== 'all',
    filters.techStack !== 'all',
    selectedTags.length > 0,
  ].filter(Boolean).length

  return (
    <AppShell showBottomNav={true}>
      <GradientBackground />

      {/* Main Content */}
      <div className="flex-1">
        <DashboardHeader title="Job Radar" subtitle="Find remote jobs that match your skills" />

        <Container className="py-6">
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search jobs by title or company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 brutal-border brutal-radius bg-white text-lg focus:outline-none focus:ring-2 focus:ring-yellow"
            />
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            {/* Filter Toggle Button */}
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

            {/* Quick Region Tabs */}
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

            {/* Reset Filters */}
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

          {/* Expanded Filters Panel */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 p-4 bg-white brutal-border brutal-radius"
            >
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Job Type */}
                <div>
                  <label className="block text-sm font-medium mb-2">Job Type</label>
                  <select
                    value={filters.jobType}
                    onChange={(e) => setFilters(f => ({ ...f, jobType: e.target.value as JobTypeFilter }))}
                    className="w-full px-3 py-2 brutal-border brutal-radius bg-white"
                  >
                    {jobTypeOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                {/* Experience Level */}
                <div>
                  <label className="block text-sm font-medium mb-2">Experience</label>
                  <select
                    value={filters.experience}
                    onChange={(e) => setFilters(f => ({ ...f, experience: e.target.value as ExperienceFilter }))}
                    className="w-full px-3 py-2 brutal-border brutal-radius bg-white"
                  >
                    {experienceOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                {/* Tech Stack */}
                <div>
                  <label className="block text-sm font-medium mb-2">Tech Stack</label>
                  <select
                    value={filters.techStack}
                    onChange={(e) => setFilters(f => ({ ...f, techStack: e.target.value as TechStackFilter }))}
                    className="w-full px-3 py-2 brutal-border brutal-radius bg-white"
                  >
                    {techStackOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                {/* Region */}
                <div>
                  <label className="block text-sm font-medium mb-2">Region</label>
                  <select
                    value={filters.region}
                    onChange={(e) => setFilters(f => ({ ...f, region: e.target.value as RegionFilter }))}
                    className="w-full px-3 py-2 brutal-border brutal-radius bg-white"
                  >
                    {regionOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Tag Filters */}
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

          {/* Results Count */}
          <p className="text-gray-600 mb-4">
            Showing {filteredJobs.length} of {MOCK_JOBS.length} jobs
            {filters.region !== 'all' && ` in ${filters.region}`}
            {filters.jobType !== 'all' && ` (${filters.jobType})`}
          </p>

          {/* Job Cards */}
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
                  onToggleSave={() => toggleSaveJob(job.id)}
                />
              </motion.div>
            ))}
          </div>

          {filteredJobs.length === 0 && (
            <BrutalCard color="white" className="text-center py-12">
              <Briefcase className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="font-bold text-xl mb-2">No jobs found</h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your search or filters
              </p>
              <BrutalButton variant="outline" color="black" onClick={resetFilters}>
                Reset Filters
              </BrutalButton>
            </BrutalCard>
          )}

          {/* Indonesia Source Notice */}
          {filters.region === 'indonesia' && filteredJobs.length === 0 && (
            <div className="mt-6 p-4 bg-blue/10 border-2 border-blue brutal-radius">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-blue shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-blue mb-1">Indonesia source not configured yet</h4>
                  <p className="text-sm text-gray-700">
                    We are working on adding Indonesian job sources. For now, sample Indonesian internship opportunities are available.
                    Try selecting &quot;All Regions&quot; to see available jobs.
                  </p>
                </div>
              </div>
            </div>
          )}
        </Container>
      </div>
    </AppShell>
  )
}

function JobCard({
  job,
  isSaved,
  onToggleSave,
}: {
  job: Job
  isSaved: boolean
  onToggleSave: () => void
}) {
  const extractedSkills = extractSkillsFromJob(job)
  const matchScore = getDeterministicMatchScore(job.id)
  const validityScore = getDeterministicValidityScore(job.id)
  const riskLevel = getRiskLevel(validityScore)

  return (
    <BrutalCard color="white">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Company Logo Placeholder */}
        <div className="w-16 h-16 bg-blue/20 brutal-border brutal-radius flex items-center justify-center shrink-0">
          <span className="text-2xl font-bold text-blue">
            {job.company.charAt(0)}
          </span>
        </div>

        {/* Job Info */}
        <div className="flex-1">
          <div className="flex flex-col gap-3 mb-2 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h3 className="font-display font-bold text-lg">{job.title}</h3>
              <p className="text-gray-600">{job.company}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2 lg:justify-end">
              <span className="text-xs px-2 py-1 bg-gray-100 brutal-radius text-gray-500">
                {job.source === 'mock' ? 'Demo' : 'Live'}
              </span>
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

          <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {job.location}
            </span>
            <span className="flex items-center gap-1">
              <Briefcase className="w-4 h-4" />
              {job.type}
            </span>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {job.tags.slice(0, 5).map((tag) => (
              <SkillBadge key={tag} name={tag} size="sm" />
            ))}
          </div>

          {/* Required Skills */}
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

          {/* Actions */}
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
