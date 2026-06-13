import { NextRequest, NextResponse } from 'next/server'
import { generateFallbackRoadmap } from '@/lib/ai'
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

  return hasEnoughWeeks && clusterHits >= BACKEND_CURRICULUM_CLUSTERS.length && frontendHits <= 3 && finalProjectAligned
}

function getRoleSpecificPrompt(role: TargetRole) {
  switch (role) {
    case 'backend-developer':
      return `Backend-specific constraints (must follow):
- Use this 6-module sequence in order:
  1) Programming & Web Foundation (JS/TS basics, HTTP, JSON, Git)
  2) Node.js Backend Fundamentals
  3) Express.js & REST API
  4) Database with PostgreSQL (Prisma)
  5) Authentication & Authorization (JWT, Bcrypt)
  6) Testing, Documentation, and Deployment
- Include mini project per module and make the final project an E-commerce Backend API.
- Do NOT use frontend-heavy modules as core topics (React fundamentals, CSS mastery, UI components, React state management, Next.js frontend deployment).
- Frontend can appear only as optional context, never as the main weekly objective.`

    case 'frontend-developer':
    case 'ui-engineer':
      return `Frontend-specific constraints (must follow):
- Use this 6-module sequence in order:
  1) Web Fundamentals (HTML, CSS, DOM)
  2) JavaScript & Async JS
  3) React Fundamentals (Components, Props, State)
  4) Advanced React (Hooks, Context, Routing)
  5) Next.js App Router Basics
  6) API Integration & Deployment
- Do NOT include backend-heavy modules (Node.js servers, PostgreSQL, Database schema, Express routing, Bcrypt password hashing).
- Backend concepts should only be mentioned in the context of "fetching from an API".`

    case 'fullstack-developer':
      return `Fullstack-specific constraints (must follow):
- Blend frontend and backend logically across weeks:
  1) Web & JS/TS Fundamentals
  2) Frontend with React
  3) Node.js & Express Basics
  4) Database Integration (PostgreSQL)
  5) Fullstack Auth (JWT & React Context)
  6) Next.js Fullstack & Deployment
- Keep a balance. Do not skew too heavily into one side.`

    case 'mobile-developer':
      return `Mobile-specific constraints (must follow):
- Focus entirely on mobile app development (React Native or Flutter).
- Do NOT include deep backend development (Express, PostgreSQL) or deep web frontend (Next.js, complex CSS grids).
- API integration is fine, but building the API is out of scope.`

    case 'data-analyst':
      return `Data Analyst-specific constraints (must follow):
- Focus entirely on data skills (SQL, Python/Pandas, Data Visualization).
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
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent'
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
          `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
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

    if (input.targetRole === 'backend-developer' && !isBackendRoadmapAligned(validated)) {
      return null
    }

    return validated
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
