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
      title: 'HTML Crash Course for Absolute Beginners',
      resourceType: 'youtube',
      url: 'https://www.youtube.com/watch?v=UB1O30fR-EE',
      provider: 'Traversy Media',
      estimatedMinutes: 70,
      isRequired: true,
      completionRule: 'manual_watch_confirmation',
    },
    {
      title: 'MDN HTML basics',
      resourceType: 'docs',
      url: 'https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content/Basic_HTML_syntax',
      provider: 'MDN Web Docs',
      estimatedMinutes: 35,
      isRequired: false,
      completionRule: 'manual_mark_complete',
    },
  ],
  css: [
    {
      title: 'CSS Crash Course for Absolute Beginners',
      resourceType: 'youtube',
      url: 'https://www.youtube.com/watch?v=yfoY53QXEnI',
      provider: 'Traversy Media',
      estimatedMinutes: 70,
      isRequired: true,
      completionRule: 'manual_watch_confirmation',
    },
    {
      title: 'MDN CSS first steps',
      resourceType: 'docs',
      url: 'https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics',
      provider: 'MDN Web Docs',
      estimatedMinutes: 45,
      isRequired: false,
      completionRule: 'manual_mark_complete',
    },
  ],
  javascript: [
    {
      title: 'JavaScript Crash Course for Beginners',
      resourceType: 'youtube',
      url: 'https://www.youtube.com/watch?v=hdI2bqOjy3c',
      provider: 'Traversy Media',
      estimatedMinutes: 100,
      isRequired: true,
      completionRule: 'manual_watch_confirmation',
    },
    {
      title: 'MDN JavaScript guide',
      resourceType: 'docs',
      url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide',
      provider: 'MDN Web Docs',
      estimatedMinutes: 60,
      isRequired: false,
      completionRule: 'manual_mark_complete',
    },
  ],
  typescript: [
    {
      title: 'TypeScript Crash Course',
      resourceType: 'youtube',
      url: 'https://www.youtube.com/watch?v=BwuLxPH8IDs',
      provider: 'Traversy Media',
      estimatedMinutes: 45,
      isRequired: true,
      completionRule: 'manual_watch_confirmation',
    },
    {
      title: 'TypeScript handbook',
      resourceType: 'docs',
      url: 'https://www.typescriptlang.org/docs/handbook/intro.html',
      provider: 'TypeScript',
      estimatedMinutes: 55,
      isRequired: false,
      completionRule: 'manual_mark_complete',
    },
  ],
  react: [
    {
      title: 'React JS Crash Course',
      resourceType: 'youtube',
      url: 'https://www.youtube.com/watch?v=w7ejDZ8SWv8',
      provider: 'Traversy Media',
      estimatedMinutes: 90,
      isRequired: true,
      completionRule: 'manual_watch_confirmation',
    },
    {
      title: 'React Learn: components and UI',
      resourceType: 'docs',
      url: 'https://react.dev/learn',
      provider: 'React',
      estimatedMinutes: 60,
      isRequired: false,
      completionRule: 'manual_mark_complete',
    },
  ],
  'next.js': [
    {
      title: 'Next.js 13 Crash Course',
      resourceType: 'youtube',
      url: 'https://www.youtube.com/watch?v=mTz0GXj8NN0',
      provider: 'Traversy Media',
      estimatedMinutes: 80,
      isRequired: true,
      completionRule: 'manual_watch_confirmation',
    },
    {
      title: 'Next.js App Router docs',
      resourceType: 'docs',
      url: 'https://nextjs.org/docs/app',
      provider: 'Next.js',
      estimatedMinutes: 60,
      isRequired: false,
      completionRule: 'manual_mark_complete',
    },
  ],
  nextjs: [
    {
      title: 'Next.js 13 Crash Course',
      resourceType: 'youtube',
      url: 'https://www.youtube.com/watch?v=mTz0GXj8NN0',
      provider: 'Traversy Media',
      estimatedMinutes: 80,
      isRequired: true,
      completionRule: 'manual_watch_confirmation',
    },
    {
      title: 'Next.js App Router docs',
      resourceType: 'docs',
      url: 'https://nextjs.org/docs/app',
      provider: 'Next.js',
      estimatedMinutes: 60,
      isRequired: false,
      completionRule: 'manual_mark_complete',
    },
  ],
  'rest api': [
    {
      title: 'REST API Crash Course (Concept + Build)',
      resourceType: 'youtube',
      url: 'https://www.youtube.com/watch?v=qbLc5a9jdXo',
      provider: 'Caleb Curry',
      estimatedMinutes: 50,
      isRequired: true,
      completionRule: 'manual_watch_confirmation',
    },
    {
      title: 'MDN HTTP overview',
      resourceType: 'docs',
      url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Overview',
      provider: 'MDN Web Docs',
      estimatedMinutes: 40,
      isRequired: false,
      completionRule: 'manual_mark_complete',
    },
  ],
  'node.js': [
    {
      title: 'Node.js and Express.js Full Course',
      resourceType: 'youtube',
      url: 'https://www.youtube.com/watch?v=Oe421EPjeBE',
      provider: 'freeCodeCamp.org',
      estimatedMinutes: 480,
      isRequired: true,
      completionRule: 'manual_watch_confirmation',
    },
    {
      title: 'Node.js learning path',
      resourceType: 'docs',
      url: 'https://nodejs.org/en/learn',
      provider: 'Node.js',
      estimatedMinutes: 55,
      isRequired: false,
      completionRule: 'manual_mark_complete',
    },
  ],
  nodejs: [
    {
      title: 'Node.js and Express.js Full Course',
      resourceType: 'youtube',
      url: 'https://www.youtube.com/watch?v=Oe421EPjeBE',
      provider: 'freeCodeCamp.org',
      estimatedMinutes: 480,
      isRequired: true,
      completionRule: 'manual_watch_confirmation',
    },
    {
      title: 'Node.js learning path',
      resourceType: 'docs',
      url: 'https://nodejs.org/en/learn',
      provider: 'Node.js',
      estimatedMinutes: 55,
      isRequired: false,
      completionRule: 'manual_mark_complete',
    },
  ],
  git: [
    {
      title: 'Git and GitHub for Beginners Crash Course',
      resourceType: 'youtube',
      url: 'https://www.youtube.com/watch?v=RGOj5yH7evk',
      provider: 'freeCodeCamp.org',
      estimatedMinutes: 70,
      isRequired: true,
      completionRule: 'manual_watch_confirmation',
    },
    {
      title: 'GitHub Hello World',
      resourceType: 'docs',
      url: 'https://docs.github.com/en/get-started/start-your-journey/hello-world',
      provider: 'GitHub Docs',
      estimatedMinutes: 30,
      isRequired: false,
      completionRule: 'manual_mark_complete',
    },
  ],
  github: [
    {
      title: 'Git and GitHub for Beginners Crash Course',
      resourceType: 'youtube',
      url: 'https://www.youtube.com/watch?v=RGOj5yH7evk',
      provider: 'freeCodeCamp.org',
      estimatedMinutes: 70,
      isRequired: true,
      completionRule: 'manual_watch_confirmation',
    },
    {
      title: 'GitHub Hello World',
      resourceType: 'docs',
      url: 'https://docs.github.com/en/get-started/start-your-journey/hello-world',
      provider: 'GitHub Docs',
      estimatedMinutes: 30,
      isRequired: false,
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
