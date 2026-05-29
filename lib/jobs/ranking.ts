import type { CurrentLevel, Job, TargetRole } from '@/types'

interface CareerProfileForRanking {
  targetRole: TargetRole | null
  currentLevel: CurrentLevel | null
}

const roleKeywords: Record<TargetRole, string[]> = {
  'frontend-developer': [
    'frontend',
    'front-end',
    'react',
    'next.js',
    'nextjs',
    'typescript',
    'javascript',
    'tailwind',
    'css',
    'html',
    'ui',
  ],
  'backend-developer': [
    'backend',
    'back-end',
    'node.js',
    'nodejs',
    'express',
    'api',
    'rest',
    'postgresql',
    'postgres',
    'supabase',
    'database',
    'laravel',
  ],
  'fullstack-developer': [
    'fullstack',
    'full-stack',
    'react',
    'next.js',
    'node.js',
    'express',
    'postgresql',
    'api',
    'typescript',
  ],
  'ui-engineer': [
    'ui engineer',
    'design system',
    'accessibility',
    'frontend',
    'react',
    'figma',
    'css',
    'tailwind',
  ],
  'mobile-developer': [
    'mobile',
    'android',
    'ios',
    'react native',
    'flutter',
    'kotlin',
    'swift',
  ],
  'data-analyst': [
    'data analyst',
    'analytics',
    'sql',
    'python',
    'dashboard',
    'business intelligence',
    'pandas',
  ],
}

const beginnerFriendlyKeywords = [
  'intern',
  'internship',
  'magang',
  'fresh graduate',
  'freshgrad',
  'graduate',
  'entry level',
  'entry-level',
  'junior',
  'trainee',
]

const seniorKeywords = ['senior', 'lead', 'principal', 'staff', 'manager']

function clampScore(score: number) {
  return Math.max(1, Math.min(99, Math.round(score)))
}

export function getJobSearchText(job: Job) {
  return [
    job.title,
    job.company,
    job.location,
    job.workMode,
    job.type,
    job.source,
    job.sourceLabel,
    job.description,
    ...job.tags,
    ...job.requiredSkills,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
}

export function inferJobExperience(job: Job) {
  const text = getJobSearchText(job)

  if (text.includes('intern') || text.includes('magang')) return 'internship'
  if (text.includes('fresh graduate') || text.includes('freshgrad') || text.includes('graduate development')) return 'fresh-graduate'
  if (text.includes('junior') || text.includes('entry level') || text.includes('entry-level')) return 'junior'
  if (text.includes('senior') || text.includes('lead') || text.includes('principal') || text.includes('staff')) return 'senior'
  if (text.includes('mid') || text.includes('intermediate')) return 'mid'

  return 'beginner'
}

export function scoreJobForCareerProfile(job: Job, profile: CareerProfileForRanking) {
  const text = getJobSearchText(job)
  let score = job.matchScore ?? 60

  if (profile.targetRole) {
    const matchedRoleKeywords = roleKeywords[profile.targetRole].filter((keyword) => text.includes(keyword))
    score += Math.min(28, matchedRoleKeywords.length * 5)

    if (profile.targetRole === 'backend-developer' && /\bfront-?end\b|ui\/ux|figma/.test(text) && !/\bback-?end\b|api|node|express|postgres|database/.test(text)) {
      score -= 16
    }

    if (profile.targetRole === 'frontend-developer' && /\bback-?end\b|database|devops|infra/.test(text) && !/\bfront-?end\b|react|next|ui|css/.test(text)) {
      score -= 14
    }
  }

  if (profile.currentLevel === 'beginner' || profile.currentLevel === 'basic') {
    const isBeginnerFriendly = beginnerFriendlyKeywords.some((keyword) => text.includes(keyword))
    const isSenior = seniorKeywords.some((keyword) => text.includes(keyword))

    if (isBeginnerFriendly) score += 22
    if (isSenior) score -= 28
  }

  if (text.includes('indonesia') || text.includes('jakarta') || text.includes('bandung') || text.includes('surabaya') || text.includes('yogyakarta')) {
    score += 8
  }

  if (job.workMode === 'remote' || text.includes('remote indonesia') || text.includes('work from home')) {
    score += 5
  }

  return clampScore(score)
}

export function rankJobsForCareerProfile(jobs: Job[], profile: CareerProfileForRanking) {
  return jobs
    .map((job) => ({
      ...job,
      matchScore: scoreJobForCareerProfile(job, profile),
    }))
    .sort((a, b) => {
      const scoreDiff = (b.matchScore ?? 0) - (a.matchScore ?? 0)
      if (scoreDiff !== 0) return scoreDiff

      const dateA = new Date(a.publishedAt || a.fetchedAt || 0).getTime()
      const dateB = new Date(b.publishedAt || b.fetchedAt || 0).getTime()
      return dateB - dateA
    })
}
