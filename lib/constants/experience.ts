// Canonical experience-level vocabulary shared by the CV analyzer and the job
// radar. Keeping one source of truth prevents the "intern vs internship vs
// entry-level" drift between the resume audit and the job matching pipeline.

export type ExperienceLevel = 'internship' | 'entry' | 'junior' | 'mid' | 'senior'

export interface ExperienceLevelInfo {
  id: ExperienceLevel
  label: string
  shortLabel: string
  description: string
  // Lowercased phrases that indicate this level when scanning a job title or
  // description. Ordered roughly from most to least specific.
  keywords: string[]
}

export const EXPERIENCE_LEVELS: ExperienceLevelInfo[] = [
  {
    id: 'internship',
    label: 'Internship / Magang',
    shortLabel: 'Intern',
    description: 'Student or trainee roles, no professional experience required.',
    keywords: ['internship', 'intern', 'magang', 'trainee', 'apprentice', 'co-op', 'praktik kerja'],
  },
  {
    id: 'entry',
    label: 'Entry Level / Fresh Graduate',
    shortLabel: 'Entry',
    description: 'First job after graduation, 0-1 years of experience.',
    keywords: ['entry level', 'entry-level', 'fresh graduate', 'fresh grad', 'graduate program', 'no experience'],
  },
  {
    id: 'junior',
    label: 'Junior',
    shortLabel: 'Junior',
    description: 'Around 1-3 years of hands-on experience.',
    keywords: ['junior', 'jr.', 'jr ', 'associate', 'level 1', 'l1'],
  },
  {
    id: 'mid',
    label: 'Mid Level',
    shortLabel: 'Mid',
    description: 'Around 3-5 years, works independently.',
    keywords: ['mid level', 'mid-level', 'intermediate', 'mid-senior', 'level 2', 'l2', 'regular'],
  },
  {
    id: 'senior',
    label: 'Senior / Lead',
    shortLabel: 'Senior',
    description: '5+ years, leads features and mentors others.',
    keywords: ['senior', 'sr.', 'sr ', 'lead', 'principal', 'staff', 'architect', 'head of', 'manager', 'expert'],
  },
]

const EXPERIENCE_LEVEL_BY_ID = new Map<ExperienceLevel, ExperienceLevelInfo>(
  EXPERIENCE_LEVELS.map((level) => [level.id, level])
)

export function getExperienceLevel(id: ExperienceLevel): ExperienceLevelInfo | undefined {
  return EXPERIENCE_LEVEL_BY_ID.get(id)
}

export function getExperienceLevelLabel(id: ExperienceLevel | null | undefined): string {
  if (!id) return 'Any level'
  return EXPERIENCE_LEVEL_BY_ID.get(id)?.label ?? 'Any level'
}

/**
 * Best-effort detection of an experience level from free text (a job title,
 * preferably, falling back to the description). Returns null when nothing
 * matches so callers can decide how to treat "unspecified" postings.
 */
export function detectExperienceLevel(...parts: (string | null | undefined)[]): ExperienceLevel | null {
  const haystack = parts
    .filter((part): part is string => Boolean(part))
    .join(' ')
    .toLowerCase()

  if (!haystack.trim()) return null

  // Senior signals win over junior signals when both appear (e.g. "senior
  // engineer to mentor junior devs"), so check from most to least senior.
  const priority: ExperienceLevel[] = ['senior', 'mid', 'junior', 'entry', 'internship']

  for (const id of priority) {
    const info = EXPERIENCE_LEVEL_BY_ID.get(id)
    if (info && info.keywords.some((keyword) => haystack.includes(keyword))) {
      return id
    }
  }

  return null
}
