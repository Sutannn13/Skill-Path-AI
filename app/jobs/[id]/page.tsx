'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { AppShell, Container, GradientBackground } from '@/components/layout'
import { DashboardHeader } from '@/components/layout/dashboard-header'
import { BrutalCard, BrutalButton, BrutalCardHover, SkillBadge, MatchScorePill } from '@/components/brutal'
import { MOCK_JOBS, getMockJobById } from '@/lib/data/mock-jobs'
import { getDeterministicMatchScore, getDeterministicValidityScore, getRiskLabel, getRiskLevel } from '@/lib/jobs/display'
import { extractSkillsFromJob } from '@/lib/jobs/skill-extraction'
import { cn } from '@/lib/utils'
import {
  ArrowLeft,
  Bookmark,
  ExternalLink,
  MapPin,
  Briefcase,
  Clock,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Lightbulb,
} from 'lucide-react'

export default function JobDetailPage() {
  const params = useParams()
  const id = params?.id as string

  // Try to get job from mock data
  const job = id ? getMockJobById(id) : undefined

  const [savedJobs, setSavedJobs] = useState<string[]>([])
  const isSaved = id ? savedJobs.includes(id) : false

  const toggleSave = () => {
    if (!id) return
    setSavedJobs(prev =>
      prev.includes(id) ? prev.filter(j => j !== id) : [...prev, id]
    )
  }

  if (!job) {
    return (
      <AppShell showBottomNav={true}>
        <GradientBackground />

        <DashboardHeader title="Job Not Found" subtitle="This posting is not available" />
        <Container className="py-6">
          <motion.div
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl"
          >
            <BrutalCard color="white">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                <div className="w-16 h-16 bg-yellow/20 brutal-border brutal-radius flex items-center justify-center">
                  <AlertTriangle className="w-8 h-8 text-yellow" />
                </div>
                <div className="flex-1">
                  <h1 className="font-display font-bold text-2xl mb-2">Job Not Found</h1>
                  <p className="text-gray-600 mb-6">
                    The job posting you are looking for does not exist, may have expired, or is not in the local fallback data.
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
          </motion.div>
        </Container>
      </AppShell>
    )
  }

  const extractedSkills = extractSkillsFromJob(job)
  const matchScore = getDeterministicMatchScore(job.id)
  const validityScore = getDeterministicValidityScore(job.id)
  const riskLevel = getRiskLevel(validityScore)

  return (
    <AppShell showBottomNav={true}>
      <GradientBackground />

      <div className="min-h-screen">
        <DashboardHeader title="Job Details" />

        <Container className="py-6">
          <Link href="/jobs" className="mb-6 inline-flex">
            <BrutalButton variant="ghost" color="black" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Jobs
            </BrutalButton>
          </Link>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Job Header Card */}
              <motion.div
                initial={false}
                animate={{ opacity: 1, y: 0 }}
              >
                <BrutalCard color="white" className="relative">
                  {/* Source Badge */}
                  <div className="absolute right-4 top-4 flex flex-wrap justify-end gap-2">
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
                      {getRiskLabel(riskLevel)}
                    </span>
                  </div>

                  <div className="flex items-start gap-4 mb-4">
                    {/* Company Logo */}
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

                  {/* Match Score */}
                  <div className="mb-4 flex flex-wrap gap-3">
                    <MatchScorePill score={matchScore} size="md" />
                    <span className="brutal-border brutal-radius inline-flex items-center px-3 py-1 text-sm font-bold bg-green/10">
                      Validity {validityScore}%
                    </span>
                  </div>

                  {/* Quick Info */}
                  <div className="flex flex-wrap gap-4 mb-6">
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-5 h-5" />
                      {job.location}
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Briefcase className="w-5 h-5" />
                      {job.type}
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="w-5 h-5" />
                      Posted {job.publishedAt}
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {job.tags.map(tag => (
                      <SkillBadge key={tag} name={tag} size="sm" />
                    ))}
                  </div>

                  {/* Action Buttons */}
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

              {/* Job Description */}
              <motion.div
                initial={false}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <BrutalCard color="white">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-purple/20 brutal-radius flex items-center justify-center">
                      <FileText className="w-5 h-5 text-purple" />
                    </div>
                    <h2 className="font-display font-bold text-xl">Job Description</h2>
                  </div>
                  <div className="prose prose-gray max-w-none">
                    <p className="text-gray-700 whitespace-pre-wrap">{job.description}</p>
                  </div>
                </BrutalCard>
              </motion.div>

              {/* Required Skills */}
              <motion.div
                initial={false}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
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

            {/* Sidebar */}
            <div className="space-y-6">
              {/* AI Insights Card */}
              <motion.div
                initial={false}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                <BrutalCard color="yellow" className="sticky top-20">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-black/10 brutal-radius flex items-center justify-center">
                      <Lightbulb className="w-5 h-5" />
                    </div>
                    <h3 className="font-display font-bold">AI Insights</h3>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium mb-1">Skill Match</p>
                      <p className="text-sm text-gray-700">
                        This role requires {extractedSkills.length} key skills. Your match score of {matchScore}% indicates a good fit.
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-1">Recommendation</p>
                      <p className="text-sm text-gray-700">
                        Focus on strengthening your core skills before applying. Consider building a portfolio project that demonstrates these abilities.
                      </p>
                    </div>
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

              {/* Similar Jobs */}
              <motion.div
                initial={false}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
              >
                <BrutalCard color="white">
                  <h3 className="font-display font-bold mb-4">Similar Jobs</h3>
                  <div className="space-y-3">
                    {MOCK_JOBS.filter(j => j.id !== job.id && j.tags.some(t => job.tags.includes(t)))
                      .slice(0, 3)
                      .map(similarJob => (
                        <Link key={similarJob.id} href={`/jobs/${similarJob.id}`}>
                          <BrutalCardHover color="gray" className="p-3">
                            <h4 className="font-medium text-sm mb-1">{similarJob.title}</h4>
                            <p className="text-xs text-gray-500">{similarJob.company}</p>
                            <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                              <MapPin className="w-3 h-3" />
                              {similarJob.location}
                            </div>
                          </BrutalCardHover>
                        </Link>
                      ))}
                  </div>
                </BrutalCard>
              </motion.div>
            </div>
          </div>
        </Container>
      </div>
    </AppShell>
  )
}
