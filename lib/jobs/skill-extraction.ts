import { Job } from '@/types'

// Keywords that indicate a skill requirement
const SKILL_KEYWORDS = [
  'html', 'css', 'javascript', 'typescript', 'react', 'nextjs', 'next.js',
  'vue', 'vuejs', 'angular', 'nodejs', 'node.js', 'node', 'express',
  'laravel', 'php', 'python', 'django', 'flask', 'ruby', 'rails',
  'java', 'spring', 'c#', 'csharp', '.net', 'go', 'golang', 'rust',
  'postgresql', 'postgres', 'mysql', 'mongodb', 'mongo', 'redis',
  'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'google cloud',
  'figma', 'tailwind', 'sass', 'scss', 'graphql', 'rest', 'rest api',
  'api', 'git', 'github', 'gitlab', 'ci/cd', 'jenkins', 'testing',
  'jest', 'cypress', 'selenium', 'agile', 'scrum', 'jira',
  'react native', 'flutter', 'swift', 'kotlin', 'android', 'ios',
  'machine learning', 'ml', 'ai', 'tensorflow', 'pytorch', 'data science',
  'sql', 'database', 'authentication', 'oauth', 'jwt', 'security',
  'responsive design', 'accessibility', 'wcag', 'performance',
  'webpack', 'vite', 'npm', 'yarn', 'pnpm', 'redux', 'zustand',
  'css', 'html', 'javascript', 'typescript', 'react', 'nextjs',
]

// Map variations to canonical skill names
const SKILL_NORMALIZATION: Record<string, string> = {
  'javascript': 'JavaScript',
  'js': 'JavaScript',
  'typescript': 'TypeScript',
  'ts': 'TypeScript',
  'react': 'React',
  'reactjs': 'React',
  'nextjs': 'Next.js',
  'next.js': 'Next.js',
  'vue': 'Vue.js',
  'vuejs': 'Vue.js',
  'angular': 'Angular',
  'nodejs': 'Node.js',
  'node.js': 'Node.js',
  'node': 'Node.js',
  'express': 'Express',
  'expressjs': 'Express',
  'php': 'PHP',
  'python': 'Python',
  'java': 'Java',
  'c#': 'C#',
  'csharp': 'C#',
  '.net': '.NET',
  'go': 'Go',
  'golang': 'Go',
  'rust': 'Rust',
  'postgresql': 'PostgreSQL',
  'postgres': 'PostgreSQL',
  'mysql': 'MySQL',
  'mongodb': 'MongoDB',
  'mongo': 'MongoDB',
  'redis': 'Redis',
  'docker': 'Docker',
  'kubernetes': 'Kubernetes',
  'k8s': 'Kubernetes',
  'aws': 'AWS',
  'azure': 'Azure',
  'gcp': 'GCP',
  'google cloud': 'GCP',
  'figma': 'Figma',
  'tailwind': 'Tailwind CSS',
  'tailwindcss': 'Tailwind CSS',
  'sass': 'Sass',
  'scss': 'Sass',
  'graphql': 'GraphQL',
  'rest': 'REST API',
  'rest api': 'REST API',
  'api': 'API',
  'git': 'Git',
  'github': 'GitHub',
  'ci/cd': 'CI/CD',
  'testing': 'Testing',
  'jest': 'Jest',
  'cypress': 'Cypress',
  'selenium': 'Selenium',
  'agile': 'Agile',
  'scrum': 'Scrum',
  'jira': 'Jira',
  'react native': 'React Native',
  'flutter': 'Flutter',
  'swift': 'Swift',
  'kotlin': 'Kotlin',
  'android': 'Android',
  'ios': 'iOS',
  'ml': 'Machine Learning',
  'ai': 'AI',
  'tensorflow': 'TensorFlow',
  'pytorch': 'PyTorch',
  'sql': 'SQL',
  'database': 'Database',
  'database design': 'Database Design',
  'authentication': 'Authentication',
  'oauth': 'OAuth',
  'jwt': 'JWT',
  'security': 'Security',
  'responsive design': 'Responsive Design',
  'responsive': 'Responsive Design',
  'accessibility': 'Accessibility',
  'wcag': 'WCAG',
  'performance': 'Performance Optimization',
  'webpack': 'Webpack',
  'vite': 'Vite',
  'npm': 'npm',
  'yarn': 'Yarn',
  'pnpm': 'pnpm',
  'redux': 'Redux',
  'zustand': 'Zustand',
  'html': 'HTML',
  'css': 'CSS',
  'html5': 'HTML',
  'css3': 'CSS',
}

export function extractSkillsFromJob(job: Job): string[] {
  const text = `${job.title} ${job.description} ${job.tags.join(' ')}`.toLowerCase()

  const foundSkills = new Set<string>()

  // Check for each keyword
  for (const keyword of SKILL_KEYWORDS) {
    const regex = new RegExp(`\\b${keyword}\\b`, 'gi')
    if (regex.test(text)) {
      const normalized = SKILL_NORMALIZATION[keyword] || keyword
      foundSkills.add(normalized)
    }
  }

  // Also check the tags directly (usually already normalized)
  for (const tag of job.tags) {
    const lowerTag = tag.toLowerCase()
    if (SKILL_NORMALIZATION[lowerTag]) {
      foundSkills.add(SKILL_NORMALIZATION[lowerTag])
    } else if (SKILL_KEYWORDS.includes(lowerTag)) {
      foundSkills.add(tag)
    }
  }

  return Array.from(foundSkills)
}

export function extractSkillsFromText(text: string): string[] {
  const lowerText = text.toLowerCase()
  const foundSkills = new Set<string>()

  for (const keyword of SKILL_KEYWORDS) {
    const regex = new RegExp(`\\b${keyword}\\b`, 'gi')
    if (regex.test(lowerText)) {
      const normalized = SKILL_NORMALIZATION[keyword] || keyword
      foundSkills.add(normalized)
    }
  }

  return Array.from(foundSkills)
}

export { SKILL_KEYWORDS, SKILL_NORMALIZATION }