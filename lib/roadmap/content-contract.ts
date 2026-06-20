import type { RoadmapTask } from '@/types'

export const ROADMAP_CONTENT_VERSION = 4

export type QuizSkillKey =
  | 'html'
  | 'css'
  | 'javascript'
  | 'typescript'
  | 'react'
  | 'rest api'
  | 'node.js'
  | 'git'
  | 'database'
  | 'security'
  | 'testing'
  | 'accessibility'
  | 'design systems'
  | 'react native'
  | 'python'
  | 'data analysis'
  | 'deployment'
  | 'documentation'

export interface TaskContentContract {
  resourceKeys: string[]
  quizSkill: QuizSkillKey
}

const TASK_CONTENT_CONTRACTS: Record<string, TaskContentContract> = {
  'frontend-1-1': { resourceKeys: ['internet and web basics'], quizSkill: 'rest api' },
  'frontend-1-2': { resourceKeys: ['semantic html and forms'], quizSkill: 'html' },
  'frontend-1-3': { resourceKeys: ['css selectors', 'box model'], quizSkill: 'css' },
  'frontend-1-4': { resourceKeys: ['flexbox', 'grid and responsive layout'], quizSkill: 'css' },
  'frontend-1-5': { resourceKeys: ['javascript variables', 'control flow'], quizSkill: 'javascript' },
  'frontend-2-1': { resourceKeys: ['javascript functions', 'scope'], quizSkill: 'javascript' },
  'frontend-2-2': { resourceKeys: ['arrays', 'object methods'], quizSkill: 'javascript' },
  'frontend-2-3': { resourceKeys: ['dom and form behavior'], quizSkill: 'javascript' },
  'frontend-2-4': { resourceKeys: ['async fetch workflow'], quizSkill: 'javascript' },
  'frontend-2-5': { resourceKeys: ['git and npm workflow'], quizSkill: 'git' },
  'frontend-3-1': { resourceKeys: ['typescript primitives', 'object types'], quizSkill: 'typescript' },
  'frontend-3-2': { resourceKeys: ['react components', 'props'], quizSkill: 'react' },
  'frontend-3-3': { resourceKeys: ['react state'], quizSkill: 'react' },
  'frontend-3-4': { resourceKeys: ['react lists forms and states'], quizSkill: 'react' },
  'frontend-3-5': { resourceKeys: ['tailwind css'], quizSkill: 'css' },
  'frontend-4-1': { resourceKeys: ['react effects and fetching'], quizSkill: 'react' },
  'frontend-4-2': { resourceKeys: ['custom hooks'], quizSkill: 'react' },
  'frontend-4-3': { resourceKeys: ['conditional ui'], quizSkill: 'react' },
  'frontend-4-4': { resourceKeys: ['accessibility'], quizSkill: 'accessibility' },
  'frontend-4-5': { resourceKeys: ['web security'], quizSkill: 'security' },
  'frontend-5-1': { resourceKeys: ['next.js app router'], quizSkill: 'react' },
  'frontend-5-2': { resourceKeys: ['route handlers'], quizSkill: 'rest api' },
  'frontend-5-3': { resourceKeys: ['testing'], quizSkill: 'testing' },
  'frontend-5-4': { resourceKeys: ['deployment'], quizSkill: 'deployment' },
  'frontend-6-1': { resourceKeys: ['frontend project architecture'], quizSkill: 'react' },
  'frontend-6-2': { resourceKeys: ['react'], quizSkill: 'react' },
  'frontend-6-3': { resourceKeys: ['web performance and accessibility'], quizSkill: 'accessibility' },
  'frontend-6-4': { resourceKeys: ['documentation', 'git'], quizSkill: 'documentation' },

  'backend-1-1': { resourceKeys: ['javascript variables', 'control flow'], quizSkill: 'javascript' },
  'backend-1-2': { resourceKeys: ['javascript functions and collections'], quizSkill: 'javascript' },
  'backend-1-3': { resourceKeys: ['async javascript'], quizSkill: 'javascript' },
  'backend-1-4': { resourceKeys: ['typescript primitives', 'object types'], quizSkill: 'typescript' },
  'backend-1-5': { resourceKeys: ['internet and web basics', 'http and json exchange'], quizSkill: 'rest api' },
  'backend-2-1': { resourceKeys: ['git basics'], quizSkill: 'git' },
  'backend-2-2': { resourceKeys: ['node.js runtime', 'npm scripts'], quizSkill: 'node.js' },
  'backend-2-3': { resourceKeys: ['environment variables'], quizSkill: 'node.js' },
  'backend-2-4': { resourceKeys: ['node.js'], quizSkill: 'node.js' },
  'backend-2-5': { resourceKeys: ['backend folder structure'], quizSkill: 'node.js' },
  'backend-3-1': { resourceKeys: ['express routing'], quizSkill: 'rest api' },
  'backend-3-2': { resourceKeys: ['controllers'], quizSkill: 'rest api' },
  'backend-3-3': { resourceKeys: ['middleware'], quizSkill: 'rest api' },
  'backend-3-4': { resourceKeys: ['crud'], quizSkill: 'rest api' },
  'backend-3-5': { resourceKeys: ['error handling'], quizSkill: 'rest api' },
  'backend-4-1': { resourceKeys: ['sql basics'], quizSkill: 'database' },
  'backend-4-2': { resourceKeys: ['sql tables'], quizSkill: 'database' },
  'backend-4-3': { resourceKeys: ['database schema'], quizSkill: 'database' },
  'backend-4-4': { resourceKeys: ['prisma', 'migrations'], quizSkill: 'database' },
  'backend-4-5': { resourceKeys: ['database access'], quizSkill: 'database' },
  'backend-5-1': { resourceKeys: ['authentication'], quizSkill: 'security' },
  'backend-5-2': { resourceKeys: ['bcrypt'], quizSkill: 'security' },
  'backend-5-3': { resourceKeys: ['jwt', 'session'], quizSkill: 'security' },
  'backend-5-4': { resourceKeys: ['protected routes', 'role-based authorization'], quizSkill: 'security' },
  'backend-5-5': { resourceKeys: ['validation'], quizSkill: 'security' },
  'backend-6-1': { resourceKeys: ['postman'], quizSkill: 'testing' },
  'backend-6-2': { resourceKeys: ['jest supertest'], quizSkill: 'testing' },
  'backend-6-3': { resourceKeys: ['api documentation'], quizSkill: 'documentation' },
  'backend-6-4': { resourceKeys: ['redis caching'], quizSkill: 'node.js' },
  'backend-6-5': { resourceKeys: ['backend deployment'], quizSkill: 'deployment' },

  'fullstack-2-1': { resourceKeys: ['javascript functions and collections'], quizSkill: 'javascript' },
  'fullstack-2-2': { resourceKeys: ['dom and form behavior'], quizSkill: 'javascript' },
  'fullstack-2-3': { resourceKeys: ['async fetch workflow'], quizSkill: 'javascript' },
  'fullstack-2-4': { resourceKeys: ['typescript primitives', 'object types'], quizSkill: 'typescript' },
  'fullstack-2-5': { resourceKeys: ['git and npm workflow'], quizSkill: 'git' },
  'fullstack-3-1': { resourceKeys: ['react components', 'props'], quizSkill: 'react' },
  'fullstack-3-2': { resourceKeys: ['react state and forms'], quizSkill: 'react' },
  'fullstack-3-3': { resourceKeys: ['react lists', 'conditional ui'], quizSkill: 'react' },
  'fullstack-3-4': { resourceKeys: ['api fetching', 'effects'], quizSkill: 'react' },
  'fullstack-3-5': { resourceKeys: ['tailwind css'], quizSkill: 'css' },
  'fullstack-4-1': { resourceKeys: ['node.js runtime', 'npm scripts'], quizSkill: 'node.js' },
  'fullstack-4-2': { resourceKeys: ['environment variables'], quizSkill: 'node.js' },
  'fullstack-4-3': { resourceKeys: ['node.js', 'http basics'], quizSkill: 'node.js' },
  'fullstack-4-4': { resourceKeys: ['express routing', 'middleware'], quizSkill: 'rest api' },
  'fullstack-4-5': { resourceKeys: ['rest crud and error handling'], quizSkill: 'rest api' },
  'fullstack-5-1': { resourceKeys: ['sql basics', 'sql tables', 'database schema'], quizSkill: 'database' },
  'fullstack-5-2': { resourceKeys: ['database access', 'migrations'], quizSkill: 'database' },
  'fullstack-5-3': { resourceKeys: ['registration and password security'], quizSkill: 'security' },
  'fullstack-5-4': { resourceKeys: ['protected authentication and ownership'], quizSkill: 'security' },
  'fullstack-5-5': { resourceKeys: ['redis caching'], quizSkill: 'node.js' },
  'fullstack-6-1': { resourceKeys: ['frontend authentication state'], quizSkill: 'security' },
  'fullstack-6-2': { resourceKeys: ['fullstack client server integration'], quizSkill: 'rest api' },
  'fullstack-6-3': { resourceKeys: ['fullstack critical testing'], quizSkill: 'testing' },
  'fullstack-6-4': { resourceKeys: ['linux deployment basics'], quizSkill: 'deployment' },
  'fullstack-6-5': { resourceKeys: ['deployment and documentation'], quizSkill: 'deployment' },

  'ui-2-1': { resourceKeys: ['javascript functions', 'scope'], quizSkill: 'javascript' },
  'ui-2-2': { resourceKeys: ['javascript functions and collections'], quizSkill: 'javascript' },
  'ui-2-3': { resourceKeys: ['dom and async behavior'], quizSkill: 'javascript' },
  'ui-2-4': { resourceKeys: ['typescript primitives', 'object types'], quizSkill: 'typescript' },
  'ui-2-5': { resourceKeys: ['react component state fundamentals'], quizSkill: 'react' },
  'ui-3-1': { resourceKeys: ['accessibility'], quizSkill: 'accessibility' },
  'ui-3-2': { resourceKeys: ['ui interaction states'], quizSkill: 'accessibility' },
  'ui-3-3': { resourceKeys: ['responsive'], quizSkill: 'css' },
  'ui-3-4': { resourceKeys: ['motion accessibility'], quizSkill: 'accessibility' },
  'ui-4-1': { resourceKeys: ['design systems'], quizSkill: 'design systems' },
  'ui-4-2': { resourceKeys: ['design tokens'], quizSkill: 'design systems' },
  'ui-4-3': { resourceKeys: ['component documentation'], quizSkill: 'design systems' },
  'ui-4-4': { resourceKeys: ['accessibility testing'], quizSkill: 'accessibility' },
  'ui-5-1': { resourceKeys: ['testing'], quizSkill: 'testing' },
  'ui-5-2': { resourceKeys: ['performance'], quizSkill: 'testing' },
  'ui-5-3': { resourceKeys: ['accessibility testing'], quizSkill: 'accessibility' },
  'ui-5-4': { resourceKeys: ['documentation'], quizSkill: 'documentation' },
  'ui-6-1': { resourceKeys: ['ui system planning'], quizSkill: 'design systems' },
  'ui-6-2': { resourceKeys: ['react'], quizSkill: 'react' },
  'ui-6-3': { resourceKeys: ['web performance and accessibility'], quizSkill: 'accessibility' },
  'ui-6-4': { resourceKeys: ['deployment'], quizSkill: 'deployment' },

  'mobile-1-1': { resourceKeys: ['javascript variables', 'control flow'], quizSkill: 'javascript' },
  'mobile-1-2': { resourceKeys: ['javascript functions and collections'], quizSkill: 'javascript' },
  'mobile-1-3': { resourceKeys: ['async javascript'], quizSkill: 'javascript' },
  'mobile-1-4': { resourceKeys: ['typescript primitives', 'object types'], quizSkill: 'typescript' },
  'mobile-1-5': { resourceKeys: ['react component state fundamentals'], quizSkill: 'react' },
  'mobile-2-1': { resourceKeys: ['expo setup'], quizSkill: 'react native' },
  'mobile-2-2': { resourceKeys: ['react native fundamentals'], quizSkill: 'react native' },
  'mobile-2-3': { resourceKeys: ['react native styling'], quizSkill: 'react native' },
  'mobile-2-4': { resourceKeys: ['mobile lists and forms'], quizSkill: 'react native' },
  'mobile-2-5': { resourceKeys: ['mobile accessibility'], quizSkill: 'accessibility' },
  'mobile-3-1': { resourceKeys: ['expo router'], quizSkill: 'react native' },
  'mobile-3-2': { resourceKeys: ['mobile navigation'], quizSkill: 'react native' },
  'mobile-3-3': { resourceKeys: ['mobile state management'], quizSkill: 'react native' },
  'mobile-3-4': { resourceKeys: ['mobile deep linking'], quizSkill: 'react native' },
  'mobile-4-1': { resourceKeys: ['mobile networking'], quizSkill: 'react native' },
  'mobile-4-2': { resourceKeys: ['mobile storage'], quizSkill: 'react native' },
  'mobile-4-3': { resourceKeys: ['mobile permissions'], quizSkill: 'security' },
  'mobile-4-4': { resourceKeys: ['mobile offline states'], quizSkill: 'react native' },
  'mobile-5-1': { resourceKeys: ['mobile testing'], quizSkill: 'testing' },
  'mobile-5-2': { resourceKeys: ['mobile performance'], quizSkill: 'testing' },
  'mobile-5-3': { resourceKeys: ['mobile error handling'], quizSkill: 'testing' },
  'mobile-5-4': { resourceKeys: ['mobile accessibility'], quizSkill: 'accessibility' },
  'mobile-6-1': { resourceKeys: ['mobile app architecture'], quizSkill: 'react native' },
  'mobile-6-2': { resourceKeys: ['react native fundamentals'], quizSkill: 'react native' },
  'mobile-6-3': { resourceKeys: ['expo deployment'], quizSkill: 'deployment' },
  'mobile-6-4': { resourceKeys: ['documentation'], quizSkill: 'documentation' },

  'data-1-1': { resourceKeys: ['data literacy'], quizSkill: 'data analysis' },
  'data-1-2': { resourceKeys: ['spreadsheet basics'], quizSkill: 'data analysis' },
  'data-1-3': { resourceKeys: ['analytical problem framing'], quizSkill: 'data analysis' },
  'data-1-4': { resourceKeys: ['spreadsheet data cleaning', 'data quality'], quizSkill: 'data analysis' },
  'data-1-5': { resourceKeys: ['documentation', 'git'], quizSkill: 'documentation' },
  'data-2-1': { resourceKeys: ['sql basics'], quizSkill: 'database' },
  'data-2-2': { resourceKeys: ['sql filtering'], quizSkill: 'database' },
  'data-2-3': { resourceKeys: ['sql aggregation'], quizSkill: 'database' },
  'data-2-4': { resourceKeys: ['sql joins'], quizSkill: 'database' },
  'data-3-1': { resourceKeys: ['database schema'], quizSkill: 'database' },
  'data-3-2': { resourceKeys: ['sql analysis'], quizSkill: 'database' },
  'data-3-3': { resourceKeys: ['sql window functions'], quizSkill: 'database' },
  'data-3-4': { resourceKeys: ['data insight writing'], quizSkill: 'data analysis' },
  'data-4-1': { resourceKeys: ['python basics'], quizSkill: 'python' },
  'data-4-2': { resourceKeys: ['pandas dataframes'], quizSkill: 'python' },
  'data-4-3': { resourceKeys: ['pandas cleaning'], quizSkill: 'python' },
  'data-4-4': { resourceKeys: ['exploratory data analysis'], quizSkill: 'data analysis' },
  'data-5-1': { resourceKeys: ['data visualization'], quizSkill: 'data analysis' },
  'data-5-2': { resourceKeys: ['chart selection'], quizSkill: 'data analysis' },
  'data-5-3': { resourceKeys: ['descriptive statistics'], quizSkill: 'data analysis' },
  'data-5-4': { resourceKeys: ['dashboard storytelling'], quizSkill: 'data analysis' },
  'data-6-1': { resourceKeys: ['data project architecture'], quizSkill: 'data analysis' },
  'data-6-2': { resourceKeys: ['exploratory data analysis'], quizSkill: 'data analysis' },
  'data-6-3': { resourceKeys: ['data insight writing'], quizSkill: 'data analysis' },
  'data-6-4': { resourceKeys: ['documentation'], quizSkill: 'documentation' },
}

function getTaskContractKey(task: Pick<RoadmapTask, 'id' | 'taskKey'>) {
  return task.taskKey ?? task.id
}

export function getTaskContentContract(
  task: Pick<RoadmapTask, 'id' | 'taskKey'>
): TaskContentContract | null {
  return TASK_CONTENT_CONTRACTS[getTaskContractKey(task)] ?? null
}

export function getTaskResourceKeys(
  task: Pick<RoadmapTask, 'id' | 'taskKey'>
): string[] | null {
  return getTaskContentContract(task)?.resourceKeys ?? null
}

export function getTaskQuizSkill(
  task: Pick<RoadmapTask, 'id' | 'taskKey'>
): QuizSkillKey | null {
  return getTaskContentContract(task)?.quizSkill ?? null
}

export function taskRequiresModuleProject(
  taskIndex: number,
  taskCount: number,
  hasMiniProject: boolean
) {
  return hasMiniProject && taskCount > 0 && taskIndex === taskCount - 1
}
