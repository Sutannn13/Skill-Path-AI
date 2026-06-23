import { JobPost } from '../types'

// Shared normalization helpers for the no-key job adapters. Keeping these in one
// place avoids the copy-pasted stripHtml/extractSkills drift that older adapters
// suffer from.

export function stripHtml(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 1200)
}

const SKILL_KEYWORDS = [
  'JavaScript', 'TypeScript', 'React', 'Vue', 'Angular', 'Next.js', 'Node.js',
  'Python', 'Java', 'Go', 'Rust', 'C++', 'C#', '.NET', 'PHP', 'Laravel', 'Ruby',
  'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Elasticsearch', 'GraphQL', 'REST',
  'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Terraform', 'CI/CD',
  'Git', 'Agile', 'Scrum', 'HTML', 'CSS', 'Tailwind', 'Sass',
  'React Native', 'Flutter', 'Swift', 'Kotlin', 'Android', 'iOS',
  'TensorFlow', 'PyTorch', 'Machine Learning', 'Pandas', 'SQL', 'Tableau',
  'Power BI', 'Figma', 'UI/UX', 'Express', 'Django', 'Spring',
]

export function extractSkills(text: string): string[] {
  const lower = text.toLowerCase()
  const found: string[] = []
  for (const skill of SKILL_KEYWORDS) {
    if (lower.includes(skill.toLowerCase())) found.push(skill)
  }
  return Array.from(new Set(found)).slice(0, 10)
}

export function mapJobTypeFromText(text: string): JobPost['employmentType'] {
  const lower = text.toLowerCase()
  if (lower.includes('intern') || lower.includes('magang')) return 'internship'
  if (lower.includes('part-time') || lower.includes('part time')) return 'part-time'
  if (lower.includes('freelance')) return 'freelance'
  if (lower.includes('contract')) return 'contract'
  return 'full-time'
}

export function mapRegionFromLocation(
  location: string
): 'indonesia' | 'international' | 'remote' {
  const lower = (location || '').toLowerCase()
  if (!lower || lower.includes('remote') || lower.includes('anywhere') || lower.includes('worldwide')) {
    return 'remote'
  }
  if (lower.includes('indonesia') || lower.includes('jakarta') || lower.includes('bandung') || lower.includes('surabaya')) {
    return 'indonesia'
  }
  return 'international'
}
