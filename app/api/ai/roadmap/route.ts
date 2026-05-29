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
  currentLevel: z.string().optional(),
  missingSkills: z.array(z.string()).optional(),
  studyTime: z.string().optional(),
  durationWeeks: z.number().optional(),
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
  if (role !== 'backend-developer') {
    return `Role-specific constraints:
- Keep every week aligned to ${ROLE_LABELS[role]} outcomes.
- Keep tasks practical, implementation-focused, and portfolio-ready.
- Avoid unrelated topic jumps across weeks.
`
  }

  return `Backend-specific constraints (must follow):
- Use this 6-module sequence in order:
  1) Programming & Web Foundation
  2) Node.js Backend Fundamentals
  3) Express.js & REST API
  4) Database with PostgreSQL
  5) Authentication & Authorization
  6) Testing, Documentation, and Deployment
- Include mini project per module and make the final project an E-commerce Backend API.
- Do NOT use frontend-heavy modules as core topics (React fundamentals, CSS mastery, UI components, React state management, Next.js frontend deployment).
- Frontend can appear only as optional context, never as the main weekly objective.
`
}

// Gemini API configuration
const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent'

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
    const prompt = `Generate a personalized learning roadmap for someone who wants to become a ${roleLabel}.

Current Level: ${input.currentLevel || 'beginner'}
Missing Skills: ${input.missingSkills?.join(', ') || fallbackMissingSkills.join(', ')}
Available Study Time: ${input.studyTime || '1 hour'} per day
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

    const response = await fetch(
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
      }
    )

    if (!response.ok) {
      console.error('Gemini API error:', response.status)
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

    // Try AI generation first
    const aiRoadmap = await generateAIRoadmap({
      targetRole,
      currentLevel: currentLevel || 'beginner',
      missingSkills: missingSkills || [],
      studyTime: studyTime || '1hour',
      durationWeeks: durationWeeks || 6,
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
      currentLevel: currentLevel || 'beginner',
      missingSkills: missingSkills || [],
      studyTime: studyTime || '1hour',
      durationWeeks: durationWeeks || 6,
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
