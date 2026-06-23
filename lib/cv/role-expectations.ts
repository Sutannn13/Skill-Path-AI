import { TargetRole } from '@/types'
import { ExperienceLevel } from '@/lib/constants/experience'

// Curated, role-specific keyword sets used to ground the role-match score in
// the actual CV text instead of trusting an LLM's self-reported number. Each
// keyword is matched case-insensitively as a whole word/phrase against the
// extracted resume text.
//
// `core` keywords carry the most weight (a frontend CV really should mention
// these), `supporting` are valuable but optional.
interface RoleKeywordSet {
  core: string[]
  supporting: string[]
}

export const ROLE_KEYWORDS: Record<TargetRole, RoleKeywordSet> = {
  'frontend-developer': {
    core: ['html', 'css', 'javascript', 'react', 'responsive', 'git'],
    supporting: [
      'typescript', 'next.js', 'nextjs', 'tailwind', 'redux', 'zustand', 'vue',
      'accessibility', 'rest api', 'figma', 'vite', 'jest', 'testing library',
      'web vitals', 'sass', 'styled-components',
    ],
  },
  'backend-developer': {
    core: ['node', 'express', 'rest api', 'database', 'sql', 'git'],
    supporting: [
      'postgresql', 'mysql', 'mongodb', 'typescript', 'prisma', 'redis', 'docker',
      'authentication', 'jwt', 'oauth', 'microservices', 'graphql', 'laravel',
      'nestjs', 'jest', 'ci/cd', 'aws', 'message queue',
    ],
  },
  'fullstack-developer': {
    core: ['html', 'css', 'javascript', 'react', 'node', 'database', 'rest api', 'git'],
    supporting: [
      'typescript', 'next.js', 'nextjs', 'express', 'postgresql', 'mongodb',
      'tailwind', 'docker', 'authentication', 'jwt', 'redis', 'prisma', 'aws',
      'ci/cd', 'graphql', 'testing',
    ],
  },
  'ui-engineer': {
    core: ['html', 'css', 'javascript', 'react', 'responsive', 'accessibility'],
    supporting: [
      'figma', 'design system', 'design tokens', 'storybook', 'tailwind',
      'typescript', 'animation', 'framer motion', 'wcag', 'ux', 'prototyping',
      'component library', 'web vitals',
    ],
  },
  'mobile-developer': {
    core: ['react native', 'javascript', 'rest api', 'git', 'state management'],
    supporting: [
      'expo', 'typescript', 'flutter', 'kotlin', 'swift', 'android', 'ios',
      'redux', 'async storage', 'push notification', 'app store', 'play store',
      'eas build', 'navigation',
    ],
  },
  'data-analyst': {
    core: ['sql', 'excel', 'data', 'visualization', 'python'],
    supporting: [
      'pandas', 'numpy', 'tableau', 'power bi', 'looker', 'statistics',
      'postgresql', 'dashboard', 'etl', 'jupyter', 'matplotlib', 'spreadsheet',
      'a/b testing', 'reporting', 'google analytics',
    ],
  },
}

// Generic, role-agnostic resume keywords that signal impact and seniority.
// Used to nudge the heuristic feedback regardless of target role.
export const IMPACT_KEYWORDS = [
  'led', 'built', 'designed', 'shipped', 'launched', 'improved', 'reduced',
  'increased', 'optimized', 'automated', 'migrated', 'scaled', 'mentored',
  'owned', 'delivered',
]

// Per-level expectations that tune the heuristic thresholds and the LLM prompt.
export const LEVEL_EXPECTATIONS: Record<ExperienceLevel, string> = {
  internship: 'Highlight coursework, personal/academic projects, and willingness to learn. Professional experience is optional.',
  entry: 'Show 1-3 solid portfolio or graduation projects with live links and clear personal contribution.',
  junior: 'Show 1-3 years of hands-on work, real responsibilities, and a few quantified outcomes.',
  mid: 'Demonstrate end-to-end ownership of features, measurable impact, and some technical leadership.',
  senior: 'Demonstrate leadership, architectural decisions, mentoring, and strong quantified business impact.',
}

/**
 * Count how many of a list of keywords appear in the (already lowercased) CV
 * text. Matches are whole-token where possible to avoid "java" matching inside
 * "javascript".
 */
export function findKeywords(lowerText: string, keywords: string[]): { matched: string[]; missing: string[] } {
  const matched: string[] = []
  const missing: string[] = []

  for (const keyword of keywords) {
    const needle = keyword.toLowerCase()
    // Phrases (containing spaces or punctuation) are matched as substrings;
    // single tokens use a word boundary so "go" / "java" don't false-positive.
    const isPhrase = /[^a-z0-9.+#]/.test(needle) || needle.includes('.')
    const found = isPhrase
      ? lowerText.includes(needle)
      : new RegExp(`\\b${escapeRegExp(needle)}\\b`).test(lowerText)

    if (found) matched.push(keyword)
    else missing.push(keyword)
  }

  return { matched, missing }
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
