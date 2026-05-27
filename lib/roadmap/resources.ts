import type { RoadmapTask, RoadmapWeek } from '@/types'

export type RoadmapResourceType = 'youtube' | 'article' | 'docs' | 'project' | 'quiz'

export interface RoadmapResourceSeed {
  title: string
  resourceType: RoadmapResourceType
  url: string
  provider: string
  estimatedMinutes: number
  isRequired: boolean
  completionRule: string
}

const RESOURCE_LIBRARY: Record<string, RoadmapResourceSeed[]> = {
  html: [
    {
      title: 'MDN HTML basics',
      resourceType: 'docs',
      url: 'https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content/Basic_HTML_syntax',
      provider: 'MDN Web Docs',
      estimatedMinutes: 35,
      isRequired: true,
      completionRule: 'manual_mark_complete',
    },
  ],
  css: [
    {
      title: 'MDN CSS first steps',
      resourceType: 'docs',
      url: 'https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics',
      provider: 'MDN Web Docs',
      estimatedMinutes: 45,
      isRequired: true,
      completionRule: 'manual_mark_complete',
    },
  ],
  javascript: [
    {
      title: 'MDN JavaScript guide',
      resourceType: 'docs',
      url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide',
      provider: 'MDN Web Docs',
      estimatedMinutes: 60,
      isRequired: true,
      completionRule: 'manual_mark_complete',
    },
  ],
  typescript: [
    {
      title: 'TypeScript handbook',
      resourceType: 'docs',
      url: 'https://www.typescriptlang.org/docs/handbook/intro.html',
      provider: 'TypeScript',
      estimatedMinutes: 55,
      isRequired: true,
      completionRule: 'manual_mark_complete',
    },
  ],
  react: [
    {
      title: 'React Learn: components and UI',
      resourceType: 'docs',
      url: 'https://react.dev/learn',
      provider: 'React',
      estimatedMinutes: 60,
      isRequired: true,
      completionRule: 'manual_mark_complete',
    },
  ],
  'next.js': [
    {
      title: 'Next.js App Router docs',
      resourceType: 'docs',
      url: 'https://nextjs.org/docs/app',
      provider: 'Next.js',
      estimatedMinutes: 60,
      isRequired: true,
      completionRule: 'manual_mark_complete',
    },
  ],
  nextjs: [
    {
      title: 'Next.js App Router docs',
      resourceType: 'docs',
      url: 'https://nextjs.org/docs/app',
      provider: 'Next.js',
      estimatedMinutes: 60,
      isRequired: true,
      completionRule: 'manual_mark_complete',
    },
  ],
  'rest api': [
    {
      title: 'MDN HTTP overview',
      resourceType: 'docs',
      url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Overview',
      provider: 'MDN Web Docs',
      estimatedMinutes: 40,
      isRequired: true,
      completionRule: 'manual_mark_complete',
    },
  ],
  'node.js': [
    {
      title: 'Node.js learning path',
      resourceType: 'docs',
      url: 'https://nodejs.org/en/learn',
      provider: 'Node.js',
      estimatedMinutes: 55,
      isRequired: true,
      completionRule: 'manual_mark_complete',
    },
  ],
  nodejs: [
    {
      title: 'Node.js learning path',
      resourceType: 'docs',
      url: 'https://nodejs.org/en/learn',
      provider: 'Node.js',
      estimatedMinutes: 55,
      isRequired: true,
      completionRule: 'manual_mark_complete',
    },
  ],
  git: [
    {
      title: 'GitHub Hello World',
      resourceType: 'docs',
      url: 'https://docs.github.com/en/get-started/start-your-journey/hello-world',
      provider: 'GitHub Docs',
      estimatedMinutes: 30,
      isRequired: true,
      completionRule: 'manual_mark_complete',
    },
  ],
  github: [
    {
      title: 'GitHub Hello World',
      resourceType: 'docs',
      url: 'https://docs.github.com/en/get-started/start-your-journey/hello-world',
      provider: 'GitHub Docs',
      estimatedMinutes: 30,
      isRequired: true,
      completionRule: 'manual_mark_complete',
    },
  ],
}

const DEFAULT_RESOURCE: RoadmapResourceSeed = {
  title: 'Build the task deliverable',
  resourceType: 'project',
  url: '/projects',
  provider: 'SkillPath Practice',
  estimatedMinutes: 45,
  isRequired: true,
  completionRule: 'manual_mark_complete',
}

function normalizeSkill(value: string) {
  return value.trim().toLowerCase()
}

function inferSkills(task: RoadmapTask, week: RoadmapWeek): string[] {
  const source = [
    ...week.focusSkills,
    task.title,
    task.description,
    task.deliverable,
  ].join(' ')

  return Object.keys(RESOURCE_LIBRARY).filter((skill) => source.toLowerCase().includes(skill))
}

export function getCuratedResourcesForTask(task: RoadmapTask, week: RoadmapWeek): RoadmapResourceSeed[] {
  const directSkills = week.focusSkills.map(normalizeSkill)
  const inferredSkills = inferSkills(task, week)
  const skills = Array.from(new Set([...directSkills, ...inferredSkills]))

  const resources = skills
    .flatMap((skill) => RESOURCE_LIBRARY[skill] ?? [])
    .filter((resource, index, all) => all.findIndex((item) => item.url === resource.url) === index)
    .slice(0, 2)

  return resources.length > 0 ? resources : [DEFAULT_RESOURCE]
}
