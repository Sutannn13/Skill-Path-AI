import { TargetRole, TargetRoleInfo, CurrentLevel, GoalType, StudyTime } from '@/types'

export const TARGET_ROLES: TargetRoleInfo[] = [
  {
    id: 'frontend-developer',
    label: 'Frontend Developer',
    description: 'Build user interfaces and interactive web applications using React, CSS, and modern JavaScript frameworks.',
    requiredSkills: [
      'skill-html', 'skill-css', 'skill-javascript', 'skill-react', 'skill-git',
      'skill-responsive', 'skill-rest-api', 'skill-testing',
    ],
    niceToHaveSkills: [
      'skill-typescript', 'skill-nextjs', 'skill-tailwind', 'skill-state-management',
      'skill-deployment', 'skill-ui-ux', 'skill-accessibility',
    ],
  },
  {
    id: 'backend-developer',
    label: 'Backend Developer',
    description: 'Create server-side logic, APIs, and database systems to power web applications.',
    requiredSkills: [
      'skill-javascript', 'skill-nodejs', 'skill-express', 'skill-git',
      'skill-database', 'skill-rest-api', 'skill-auth',
    ],
    niceToHaveSkills: [
      'skill-postgresql', 'skill-typescript', 'skill-laravel', 'skill-security',
      'skill-validation', 'skill-api-docs', 'skill-authorization',
    ],
  },
  {
    id: 'fullstack-developer',
    label: 'Fullstack Developer',
    description: 'Work on both frontend and backend, building complete web applications from scratch.',
    requiredSkills: [
      'skill-html', 'skill-css', 'skill-javascript', 'skill-react', 'skill-nodejs',
      'skill-express', 'skill-git', 'skill-rest-api', 'skill-database',
    ],
    niceToHaveSkills: [
      'skill-typescript', 'skill-nextjs', 'skill-tailwind', 'skill-auth',
      'skill-postgresql', 'skill-deployment', 'skill-testing',
    ],
  },
  {
    id: 'ui-engineer',
    label: 'UI Engineer',
    description: 'Specialize in creating beautiful, accessible, and performant user interfaces with attention to design details.',
    requiredSkills: [
      'skill-html', 'skill-css', 'skill-javascript', 'skill-react', 'skill-git',
      'skill-responsive', 'skill-ui-ux', 'skill-accessibility',
    ],
    niceToHaveSkills: [
      'skill-tailwind', 'skill-typescript', 'skill-performance', 'skill-figma',
      'skill-animation', 'skill-design-systems',
    ],
  },
  {
    id: 'mobile-developer',
    label: 'Mobile Developer',
    description: 'Build native or cross-platform mobile applications for iOS and Android.',
    requiredSkills: [
      'skill-javascript', 'skill-react', 'skill-git',
      'skill-rest-api', 'skill-state-management',
    ],
    niceToHaveSkills: [
      'skill-typescript', 'skill-nextjs', 'skill-deployment',
      'skill-testing', 'skill-performance',
    ],
  },
  {
    id: 'data-analyst',
    label: 'Data Analyst',
    description: 'Analyze data, create visualizations, and derive insights to support business decisions.',
    requiredSkills: [
      'skill-javascript', 'skill-database', 'skill-git',
    ],
    niceToHaveSkills: [
      'skill-postgresql', 'skill-python', 'skill-data-visualization',
      'skill-statistics',
    ],
  },
]

export const CURRENT_LEVELS: { id: CurrentLevel; label: string; description: string }[] = [
  { id: 'beginner', label: 'Beginner', description: 'Just started learning, very basic knowledge' },
  { id: 'basic', label: 'Basic', description: 'Understand fundamentals, can follow tutorials' },
  { id: 'intermediate', label: 'Intermediate', description: 'Can build projects with guidance' },
  { id: 'internship-ready', label: 'Internship Ready', description: 'Confident in core skills, ready for real projects' },
]

export const GOALS: { id: GoalType; label: string; description: string }[] = [
  { id: 'internship', label: 'Get an Internship', description: 'Land my first developer internship' },
  { id: 'freelance', label: 'Freelance Work', description: 'Start taking freelance projects' },
  { id: 'portfolio', label: 'Build Portfolio', description: 'Create impressive portfolio projects' },
  { id: 'remote-job', label: 'Remote Job', description: 'Get a remote developer position' },
  { id: 'career-switch', label: 'Career Switch', description: 'Transition from another field to development' },
]

export const STUDY_TIMES: { id: StudyTime; label: string; hoursPerDay: number }[] = [
  { id: '30min', label: '30 minutes', hoursPerDay: 0.5 },
  { id: '1hour', label: '1 hour', hoursPerDay: 1 },
  { id: '2hours', label: '2 hours', hoursPerDay: 2 },
  { id: '4hours', label: '4 hours', hoursPerDay: 4 },
]

export function getRoleById(id: TargetRole): TargetRoleInfo | undefined {
  return TARGET_ROLES.find((role) => role.id === id)
}

export function getRequiredSkillIds(role: TargetRole): string[] {
  const roleInfo = getRoleById(role)
  return roleInfo?.requiredSkills || []
}

export function getNiceToHaveSkillIds(role: TargetRole): string[] {
  const roleInfo = getRoleById(role)
  return roleInfo?.niceToHaveSkills || []
}