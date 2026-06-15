import { NextRequest, NextResponse } from 'next/server'
import { generateFallbackRoadmap } from '@/lib/ai'
import { ROADMAP_CONTENT_VERSION } from '@/lib/roadmap/content-contract'
import {
  GEMINI_GENERATE_CONTENT_URL,
  getGeminiRequestHeaders,
} from '@/lib/ai/gemini-config'
import { z } from 'zod'
import { TargetRole } from '@/types'

export const dynamic = 'force-dynamic'

const targetRoleSchema = z.enum([
  'frontend-developer',
  'backend-developer',
  'fullstack-developer',
  'ui-engineer',
  'mobile-developer',
  'data-analyst',
])

const roadmapRequestSchema = z.object({
  targetRole: targetRoleSchema,
  currentLevel: z.string().trim().max(40).optional(),
  missingSkills: z.array(z.string().trim().min(1).max(40)).max(12).optional(),
  studyTime: z.string().trim().max(40).optional(),
  durationWeeks: z.number().int().min(1).max(24).optional(),
})

const roadmapResponseSchema = z.object({
  id: z.string(),
  contentVersion: z.number().int().positive().optional(),
  title: z.string(),
  summary: z.string(),
  durationWeeks: z.number(),
  weeks: z.array(z.object({
    week: z.number(),
    title: z.string(),
    goal: z.string(),
    focusSkills: z.array(z.string()),
    tasks: z.array(z.object({
      id: z.string(),
      title: z.string(),
      description: z.string(),
      estimatedTime: z.string(),
      difficulty: z.enum(['easy', 'medium', 'hard']),
      deliverable: z.string(),
      status: z.enum(['todo', 'in-progress', 'completed']),
    })),
    miniProject: z.object({
      title: z.string(),
      description: z.string(),
      skillsCovered: z.array(z.string()),
      acceptanceCriteria: z.array(z.string()),
    }).optional(),
  })),
  finalPortfolioProject: z.object({
    title: z.string(),
    description: z.string(),
    features: z.array(z.string()),
    skillsCovered: z.array(z.string()),
  }).optional(),
  source: z.enum(['ai', 'fallback']),
  createdAt: z.string(),
})

const ROLE_LABELS: Record<TargetRole, string> = {
  'frontend-developer': 'Frontend Developer',
  'backend-developer': 'Backend Developer',
  'fullstack-developer': 'Fullstack Developer',
  'ui-engineer': 'UI Engineer',
  'mobile-developer': 'Mobile Developer',
  'data-analyst': 'Data Analyst',
}

const ROLE_MISSING_SKILLS_FALLBACK: Record<TargetRole, string[]> = {
  'frontend-developer': ['React', 'TypeScript', 'Responsive UI', 'API Integration'],
  'backend-developer': ['Node.js', 'Express', 'PostgreSQL', 'REST API', 'Authentication', 'Testing'],
  'fullstack-developer': ['React', 'Node.js', 'PostgreSQL', 'API Integration'],
  'ui-engineer': ['Accessibility', 'Design Systems', 'Component State'],
  'mobile-developer': ['React Native', 'REST API', 'State Management'],
  'data-analyst': ['SQL', 'PostgreSQL', 'Data Visualization'],
}

const FRONTEND_HEAVY_KEYWORDS = [
  'react',
  'next.js',
  'nextjs',
  'css',
  'html',
  'tailwind',
  'state management',
  'ui component',
  'jsx',
  'frontend',
]

const BACKEND_CURRICULUM_CLUSTERS: string[][] = [
  ['javascript', 'typescript', 'http', 'json', 'git'],
  ['node.js', 'node', 'npm', 'environment variable', 'backend folder'],
  ['express', 'routing', 'controller', 'middleware', 'crud', 'rest api', 'error handling'],
  ['sql', 'postgresql', 'schema', 'prisma', 'migration'],
  ['bcrypt', 'jwt', 'session', 'authentication', 'authorization', 'validation'],
  ['postman', 'thunder client', 'jest', 'supertest', 'documentation', 'deployment'],
]

interface OrderedMilestone {
  label: string
  keywords: string[]
}

const ROLE_ORDERED_MILESTONES: Record<TargetRole, OrderedMilestone[]> = {
  'frontend-developer': [
    { label: 'HTML foundation', keywords: ['semantic html', 'html fundamentals'] },
    { label: 'CSS foundation', keywords: ['css selectors', 'box model', 'css fundamentals'] },
    { label: 'JavaScript foundation', keywords: ['javascript variables', 'javascript functions', 'control flow'] },
    { label: 'TypeScript foundation', keywords: ['typescript primitives', 'typescript fundamentals', 'object types'] },
    { label: 'React foundation', keywords: ['react components', 'components and props'] },
    { label: 'Next.js or deployment', keywords: ['next.js app router', 'deployment readiness', 'deploy frontend'] },
  ],
  'backend-developer': [
    { label: 'JavaScript foundation', keywords: ['javascript variables', 'javascript fundamentals', 'control flow'] },
    { label: 'TypeScript foundation', keywords: ['typescript fundamentals', 'typescript for javascript', 'object types'] },
    { label: 'Node.js runtime', keywords: ['node.js runtime', 'node runtime', 'basic node.js server'] },
    { label: 'Express API', keywords: ['express routing', 'express api', 'express.js'] },
    { label: 'SQL and PostgreSQL', keywords: ['sql basics', 'postgresql tables', 'database with postgresql'] },
    { label: 'Authentication', keywords: ['register and login', 'password hashing', 'authentication'] },
    { label: 'Testing and deployment', keywords: ['jest', 'supertest', 'deploy backend', 'backend deployment'] },
  ],
  'fullstack-developer': [
    { label: 'HTML and CSS foundation', keywords: ['semantic html', 'html fundamentals', 'css selectors'] },
    { label: 'JavaScript foundation', keywords: ['javascript functions', 'javascript fundamentals', 'control flow'] },
    { label: 'TypeScript foundation', keywords: ['typescript fundamentals', 'typescript primitives'] },
    { label: 'React foundation', keywords: ['react components', 'components and props'] },
    { label: 'Node.js runtime', keywords: ['node.js runtime', 'node runtime', 'basic node.js server'] },
    { label: 'Express API', keywords: ['express routing', 'express api', 'express.js'] },
    { label: 'SQL and PostgreSQL', keywords: ['sql basics', 'postgresql', 'relational table'] },
    { label: 'Authentication', keywords: ['registration and password', 'authentication', 'protected resources'] },
    { label: 'Testing and deployment', keywords: ['critical fullstack flow', 'fullstack testing', 'deploy and document'] },
  ],
  'ui-engineer': [
    { label: 'HTML and CSS foundation', keywords: ['semantic html', 'html fundamentals', 'css selectors'] },
    { label: 'JavaScript foundation', keywords: ['javascript functions', 'javascript fundamentals', 'control flow'] },
    { label: 'TypeScript foundation', keywords: ['typescript types', 'typescript fundamentals', 'typescript primitives'] },
    { label: 'React foundation', keywords: ['react components', 'components, props, and state'] },
    { label: 'Accessibility', keywords: ['keyboard paths', 'accessibility', 'semantic interaction'] },
    { label: 'Design systems', keywords: ['design systems', 'design tokens', 'component documentation'] },
    { label: 'Testing and performance', keywords: ['test component', 'rendering performance', 'ui testing'] },
  ],
  'mobile-developer': [
    { label: 'JavaScript foundation', keywords: ['javascript variables', 'javascript fundamentals', 'control flow'] },
    { label: 'TypeScript foundation', keywords: ['typescript fundamentals', 'typescript for app data'] },
    { label: 'React foundation', keywords: ['react components', 'components, props, and state'] },
    { label: 'Expo and React Native', keywords: ['create and run an expo', 'react native core components', 'expo project'] },
    { label: 'Navigation', keywords: ['expo router', 'file-based navigation', 'mobile navigation'] },
    { label: 'Networking and storage', keywords: ['fetch api data', 'mobile networking', 'async storage'] },
    { label: 'Testing and distribution', keywords: ['test screens', 'mobile testing', 'release build with eas'] },
  ],
  'data-analyst': [
    { label: 'Data literacy', keywords: ['rows, columns', 'data literacy', 'tidy tables'] },
    { label: 'Spreadsheet foundation', keywords: ['spreadsheet formulas', 'spreadsheet basics', 'sorting and filtering'] },
    { label: 'Analysis framing', keywords: ['analytical question', 'problem framing', 'data quality'] },
    { label: 'SQL foundation', keywords: ['select and column', 'sql basics', 'sql foundations'] },
    { label: 'Python foundation', keywords: ['python basics', 'python fundamentals'] },
    { label: 'pandas', keywords: ['pandas dataframe', 'pandas fundamentals'] },
    { label: 'Visualization and reporting', keywords: ['data visualizations', 'dashboard story', 'portfolio report'] },
  ],
}

function normalizeText(input: string | null | undefined) {
  return (input ?? '').toLowerCase()
}

function collectRoadmapText(roadmap: z.infer<typeof roadmapResponseSchema>) {
  const weekText = roadmap.weeks
    .map((week) => {
      const taskText = week.tasks
        .map((task) => `${task.title} ${task.description} ${task.deliverable}`)
        .join(' ')
      return `${week.title} ${week.goal} ${week.focusSkills.join(' ')} ${taskText}`
    })
    .join(' ')

  const finalProjectText = roadmap.finalPortfolioProject
    ? `${roadmap.finalPortfolioProject.title} ${roadmap.finalPortfolioProject.description} ${roadmap.finalPortfolioProject.features.join(' ')} ${roadmap.finalPortfolioProject.skillsCovered.join(' ')}`
    : ''

  return normalizeText(`${roadmap.title} ${roadmap.summary} ${weekText} ${finalProjectText}`)
}

function hasOrderedBeginnerMilestones(
  roadmap: z.infer<typeof roadmapResponseSchema>,
  role: TargetRole
) {
  const taskSegments = roadmap.weeks.flatMap((week) =>
    week.tasks.map((task) =>
      normalizeText(`${task.title} ${task.description} ${task.deliverable}`)
    )
  )
  let previousIndex = -1

  return ROLE_ORDERED_MILESTONES[role].every((milestone) => {
    const milestoneIndex = taskSegments.findIndex((segment, index) =>
      index > previousIndex &&
      milestone.keywords.some((keyword) => segment.includes(keyword))
    )

    if (milestoneIndex === -1) return false
    previousIndex = milestoneIndex
    return true
  })
}

function isBackendRoadmapAligned(roadmap: z.infer<typeof roadmapResponseSchema>) {
  const fullText = collectRoadmapText(roadmap)
  const frontendHits = FRONTEND_HEAVY_KEYWORDS.filter((keyword) => fullText.includes(keyword)).length
  const clusterHits = BACKEND_CURRICULUM_CLUSTERS.filter((cluster) =>
    cluster.some((keyword) => fullText.includes(keyword))
  ).length
  const hasEnoughWeeks = roadmap.weeks.length >= 6

  const finalProjectText = normalizeText(
    roadmap.finalPortfolioProject
      ? `${roadmap.finalPortfolioProject.title} ${roadmap.finalPortfolioProject.description}`
      : ''
  )
  const finalProjectAligned =
    finalProjectText.includes('backend') &&
    (finalProjectText.includes('auth') || finalProjectText.includes('authorization')) &&
    finalProjectText.includes('postgres')

  return (
    hasEnoughWeeks &&
    clusterHits >= BACKEND_CURRICULUM_CLUSTERS.length &&
    frontendHits <= 3 &&
    finalProjectAligned &&
    hasOrderedBeginnerMilestones(roadmap, 'backend-developer')
  )
}

const ROLE_ALIGNMENT_RULES: Record<Exclude<TargetRole, 'backend-developer'>, {
  requiredClusters: string[][]
  forbiddenKeywords: string[]
  maxForbiddenHits: number
}> = {
  'frontend-developer': {
    requiredClusters: [
      ['html', 'css', 'semantic'],
      ['javascript', 'typescript'],
      ['react', 'component', 'state'],
      ['next.js', 'app router', 'deployment'],
    ],
    forbiddenKeywords: ['bcrypt', 'prisma migration', 'express controller', 'postgresql schema'],
    maxForbiddenHits: 1,
  },
  'fullstack-developer': {
    requiredClusters: [
      ['html', 'css', 'javascript', 'typescript'],
      ['react', 'frontend'],
      ['node', 'express', 'rest api'],
      ['postgres', 'sql', 'database'],
      ['auth', 'authorization', 'session'],
      ['test', 'deployment'],
    ],
    forbiddenKeywords: [],
    maxForbiddenHits: 0,
  },
  'ui-engineer': {
    requiredClusters: [
      ['react', 'component'],
      ['accessibility', 'keyboard', 'focus'],
      ['design system', 'design token', 'storybook'],
      ['testing', 'performance'],
    ],
    forbiddenKeywords: ['bcrypt', 'prisma', 'express routing', 'postgresql crud'],
    maxForbiddenHits: 0,
  },
  'mobile-developer': {
    requiredClusters: [
      ['react native', 'expo'],
      ['navigation', 'expo router'],
      ['api', 'network', 'storage', 'offline'],
      ['testing', 'eas', 'build'],
    ],
    forbiddenKeywords: ['next.js', 'express server', 'postgresql schema', 'css grid'],
    maxForbiddenHits: 0,
  },
  'data-analyst': {
    requiredClusters: [
      ['sql', 'postgres'],
      ['python', 'pandas'],
      ['data cleaning', 'data quality'],
      ['visualization', 'dashboard', 'chart'],
    ],
    forbiddenKeywords: ['react component', 'next.js', 'express routing', 'node.js server', 'html form'],
    maxForbiddenHits: 0,
  },
}

function isRoadmapAlignedForRole(
  roadmap: z.infer<typeof roadmapResponseSchema>,
  role: TargetRole
) {
  if (role === 'backend-developer') {
    return isBackendRoadmapAligned(roadmap)
  }

  const rules = ROLE_ALIGNMENT_RULES[role]
  const fullText = collectRoadmapText(roadmap)
  const requiredHits = rules.requiredClusters.filter((cluster) =>
    cluster.some((keyword) => fullText.includes(keyword))
  ).length
  const forbiddenHits = rules.forbiddenKeywords.filter((keyword) => fullText.includes(keyword)).length

  return (
    roadmap.weeks.length >= 6 &&
    requiredHits === rules.requiredClusters.length &&
    forbiddenHits <= rules.maxForbiddenHits &&
    hasOrderedBeginnerMilestones(roadmap, role)
  )
}

function getRoleSpecificPrompt(role: TargetRole) {
  switch (role) {
    case 'backend-developer':
      return `Backend-specific constraints (must follow):
- Use this 6-module sequence in order:
  1) JavaScript and Web Foundations
     - JavaScript variables, data types, control flow
     - functions, arrays, and objects
     - async JavaScript, modules, and errors
     - TypeScript fundamentals only after those JavaScript tasks
     - HTTP request/response, status codes, and JSON
  2) Node.js Backend Fundamentals (terminal, Git, npm, Node runtime, environment, basic server, project structure)
  3) Express.js & REST API
  4) Database with PostgreSQL (Prisma)
  5) Authentication & Authorization (JWT, Bcrypt)
  6) Testing, Documentation, and Deployment
- Never combine JavaScript and TypeScript into the first task.
- Teach the programming language before Node.js, and teach a basic Node.js server before Express.
- Include mini project per module and make the final project an E-commerce Backend API.
- Do NOT use frontend-heavy modules as core topics (React fundamentals, CSS mastery, UI components, React state management, Next.js frontend deployment).
- Frontend can appear only as optional context, never as the main weekly objective.`

    case 'frontend-developer':
      return `Frontend-specific constraints (must follow):
- Use this 6-module sequence in order:
  1) HTML and CSS Foundations
  2) JavaScript functions, data, DOM, and async JavaScript
  3) TypeScript first, then React components, props, and state
  4) React data flow and API integration
  5) Next.js, testing, and deployment
  6) Portfolio capstone
- Keep JavaScript tasks before TypeScript and React tasks.
- Do NOT include backend-heavy modules (Node.js servers, PostgreSQL, Database schema, Express routing, Bcrypt password hashing).
- Backend concepts should only be mentioned in the context of "fetching from an API".`

    case 'ui-engineer':
      return `UI Engineer-specific constraints (must follow):
- Use this 6-module sequence in order:
  1) Semantic HTML and CSS layout foundations
  2) JavaScript functions/data/async behavior, then TypeScript, then React
  3) Accessible interaction and responsive component patterns
  4) Design systems, tokens, and component documentation
  5) UI behavior testing, accessibility verification, and measured performance
  6) Accessible UI system portfolio
- Do not introduce React before JavaScript and TypeScript foundation tasks.
- Do not include backend implementation topics such as Express, PostgreSQL, Prisma, Bcrypt, or JWT.`

    case 'fullstack-developer':
      return `Fullstack-specific constraints (must follow):
- Use this beginner sequence:
  1) HTML, CSS, and basic JavaScript
  2) JavaScript functions/data/DOM/async, then TypeScript
  3) React components, state, forms, and API data
  4) Node.js runtime and basic server, then Express REST API
  5) SQL/PostgreSQL persistence, then authentication and ownership
  6) Fullstack integration, tests, documentation, and deployment
- Never jump from one JavaScript basics task directly into TypeScript/React.
- Build a basic Node.js server before introducing Express.
- Keep a balance. Do not skew too heavily into one side.`

    case 'mobile-developer':
      return `Mobile-specific constraints (must follow):
- Use React Native with Expo for this curriculum.
- Use this beginner sequence:
  1) JavaScript fundamentals, async JavaScript, TypeScript, then React components/state
  2) Create the Expo project, then learn React Native core components, styling, forms, and accessibility
  3) Navigation and application state
  4) Networking, storage, permissions, and offline behavior
  5) Testing, errors, performance, and accessibility
  6) EAS build and mobile portfolio
- Never introduce React Native components before the Expo project exists.
- Do NOT include deep backend development (Express, PostgreSQL) or deep web frontend (Next.js, complex CSS grids).
- API integration is fine, but building the API is out of scope.`

    case 'data-analyst':
      return `Data Analyst-specific constraints (must follow):
- Use this beginner sequence:
  1) Rows, columns, data types, tidy tables, spreadsheet formulas, sorting, filtering, problem framing, and data quality
  2) SQL SELECT, filtering, aggregation, and JOIN
  3) Intermediate SQL and evidence-based insight writing
  4) Python fundamentals before pandas, then data cleaning and EDA
  5) Visualization, descriptive statistics, and dashboard storytelling
  6) Reproducible portfolio analysis
- Do not introduce SQL before basic tabular data and spreadsheet operations.
- Do not introduce pandas before a Python fundamentals task.
- Do NOT include Web Development (React, Express, Node.js, HTML/CSS).`

    default:
      return `Role-specific constraints:
- Keep every week aligned to ${ROLE_LABELS[role]} outcomes.
- Keep tasks practical, implementation-focused, and portfolio-ready.
- Avoid unrelated topic jumps across weeks.`
  }
}

// Gemini API configuration
const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const GEMINI_TIMEOUT_MS = 12000
const GEMINI_MAX_ATTEMPTS = 3
const GEMINI_BASE_BACKOFF_MS = 300

function sanitizePromptInput(value: string | null | undefined, maxLength = 300) {
  return (value ?? '')
    .replace(/[\u0000-\u001F\u007F]/g, ' ')
    .replace(/[`<>]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength)
}

function sanitizeSkillList(skills: string[] | undefined) {
  if (!skills) return []

  return Array.from(
    new Set(
      skills
        .map((skill) => sanitizePromptInput(skill, 40))
        .filter((skill) => skill.length > 0)
    )
  ).slice(0, 12)
}

function createTimeoutError(timeoutMs: number) {
  return new Error(`Gemini request timed out after ${timeoutMs}ms`)
}

function getBackoffDelayMs(attempt: number) {
  const exponential = GEMINI_BASE_BACKOFF_MS * (2 ** (attempt - 1))
  const jitter = Math.floor(Math.random() * 100)
  return exponential + jitter
}

async function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function generateAIRoadmap(input: {
  targetRole: TargetRole
  currentLevel: string
  missingSkills: string[]
  studyTime: string
  durationWeeks: number
}): Promise<z.infer<typeof roadmapResponseSchema> | null> {
  if (!GEMINI_API_KEY) {
    return null
  }

  try {
    const roleLabel = ROLE_LABELS[input.targetRole]
    const fallbackMissingSkills = ROLE_MISSING_SKILLS_FALLBACK[input.targetRole]
    const safeCurrentLevel = sanitizePromptInput(input.currentLevel, 40)
    const safeStudyTime = sanitizePromptInput(input.studyTime, 40)
    const safeMissingSkills = sanitizeSkillList(input.missingSkills)
    const safeFallbackMissingSkills = sanitizeSkillList(fallbackMissingSkills)

    const prompt = `Generate a personalized learning roadmap for someone who wants to become a ${roleLabel}.

Current Level: ${safeCurrentLevel || 'beginner'}
Missing Skills: ${safeMissingSkills.join(', ') || safeFallbackMissingSkills.join(', ')}
Available Study Time: ${safeStudyTime || '1 hour'} per day
Roadmap Duration: ${input.durationWeeks || 6} weeks

${getRoleSpecificPrompt(input.targetRole)}

Generate a structured JSON roadmap with the following exact format (no other text, only JSON):
{
  "id": "roadmap-timestamp",
  "title": "Role Learning Path",
  "summary": "Brief summary of the roadmap",
  "durationWeeks": number,
  "weeks": [
    {
      "week": number,
      "title": "Week title",
      "goal": "What to accomplish",
      "focusSkills": ["skill1", "skill2"],
      "tasks": [
        {
          "id": "task-id",
          "title": "Task title",
          "description": "Task description",
          "estimatedTime": "e.g., 2 hours",
          "difficulty": "easy|medium|hard",
          "deliverable": "What to deliver",
          "status": "todo"
        }
      ],
      "miniProject": {
        "title": "Project name",
        "description": "Project description",
        "skillsCovered": ["skill1", "skill2"],
        "acceptanceCriteria": ["criteria1", "criteria2"]
      }
    }
  ],
  "finalPortfolioProject": {
    "title": "Portfolio project name",
    "description": "Portfolio project description",
    "features": ["feature1", "feature2"],
    "skillsCovered": ["skill1", "skill2"]
  },
  "source": "ai",
  "createdAt": "ISO date string"
}

Requirements:
- Each week should have 3-5 tasks
- Tasks should be realistic and actionable
- Include specific deliverables for each task
- Mini projects should be portfolio-worthy
- Final project should be comprehensive and showcase all learned skills
- Return ONLY JSON, no markdown or other text`

    let response: Response | null = null

    for (let attempt = 1; attempt <= GEMINI_MAX_ATTEMPTS; attempt++) {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(createTimeoutError(GEMINI_TIMEOUT_MS)), GEMINI_TIMEOUT_MS)

      try {
        response = await fetch(
          GEMINI_GENERATE_CONTENT_URL,
          {
            method: 'POST',
            headers: getGeminiRequestHeaders(GEMINI_API_KEY),
            body: JSON.stringify({
              contents: [{
                parts: [{
                  text: prompt,
                }]
              }],
              generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 8192,
              },
            }),
            signal: controller.signal,
          }
        )

        if (response.ok) {
          break
        }

        const shouldRetry = response.status === 429 || response.status >= 500
        if (!shouldRetry || attempt === GEMINI_MAX_ATTEMPTS) {
          console.error('Gemini API error:', response.status)
          return null
        }

        await wait(getBackoffDelayMs(attempt))
      } catch (error) {
        if (attempt === GEMINI_MAX_ATTEMPTS) {
          console.error('Gemini generation error:', error)
          return null
        }

        await wait(getBackoffDelayMs(attempt))
      } finally {
        clearTimeout(timeoutId)
      }
    }

    if (!response || !response.ok) {
      return null
    }

    const data = await response.json()
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text

    if (!generatedText) {
      return null
    }

    // Parse and validate the response
    const cleanedText = generatedText.replace(/```json\n?|```\n?/g, '').trim()
    const parsed = JSON.parse(cleanedText)
    const validated = roadmapResponseSchema.parse(parsed)

    if (!isRoadmapAlignedForRole(validated, input.targetRole)) {
      return null
    }

    return {
      ...validated,
      contentVersion: ROADMAP_CONTENT_VERSION,
    }
  } catch (error) {
    console.error('Gemini generation error:', error)
    return null
  }
}

export async function POST(request: NextRequest) {
  let requestedRole: TargetRole = 'fullstack-developer'

  try {
    const body = await request.json()

    // Validate request
    const parseResult = roadmapRequestSchema.safeParse(body)
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: parseResult.error.issues },
        { status: 400 }
      )
    }

    const { targetRole, currentLevel, missingSkills, studyTime, durationWeeks } = parseResult.data
    requestedRole = targetRole

    const normalizedCurrentLevel = sanitizePromptInput(currentLevel, 40) || 'beginner'
    const normalizedStudyTime = sanitizePromptInput(studyTime, 40) || '1hour'
    const normalizedMissingSkills = sanitizeSkillList(missingSkills)
    const normalizedDurationWeeks = durationWeeks || 6

    // Try AI generation first
    const aiRoadmap = await generateAIRoadmap({
      targetRole,
      currentLevel: normalizedCurrentLevel,
      missingSkills: normalizedMissingSkills,
      studyTime: normalizedStudyTime,
      durationWeeks: normalizedDurationWeeks,
    })

    // If AI succeeded, return it
    if (aiRoadmap) {
      return NextResponse.json({
        roadmap: aiRoadmap,
        source: 'ai',
      })
    }

    // Fall back to template-based roadmap
    const fallbackRoadmap = generateFallbackRoadmap({
      targetRole: targetRole as TargetRole,
      currentLevel: normalizedCurrentLevel,
      missingSkills: normalizedMissingSkills,
      studyTime: normalizedStudyTime,
      durationWeeks: normalizedDurationWeeks,
    })

    return NextResponse.json({
      roadmap: fallbackRoadmap,
      source: 'fallback',
      message: 'AI generation unavailable. Using template-based roadmap.',
    })
  } catch (error) {
    console.error('Roadmap generation error:', error)

    // Return a basic fallback in case of error
    const basicFallback = generateFallbackRoadmap({
      targetRole: requestedRole,
      currentLevel: 'beginner',
      missingSkills: [],
      studyTime: '1hour',
      durationWeeks: 6,
    })

    return NextResponse.json({
      roadmap: basicFallback,
      source: 'fallback',
      message: 'An error occurred. Using default roadmap.',
    }, { status: 500 })
  }
}
