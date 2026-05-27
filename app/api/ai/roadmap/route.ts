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

// Gemini API configuration
const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent'

async function generateAIRoadmap(input: {
  targetRole: string
  currentLevel: string
  missingSkills: string[]
  studyTime: string
  durationWeeks: number
}): Promise<z.infer<typeof roadmapResponseSchema> | null> {
  if (!GEMINI_API_KEY) {
    return null
  }

  try {
    const prompt = `Generate a personalized learning roadmap for someone who wants to become a ${input.targetRole}.

Current Level: ${input.currentLevel || 'beginner'}
Missing Skills: ${input.missingSkills?.join(', ') || 'various frontend and backend skills'}
Available Study Time: ${input.studyTime || '1 hour'} per day
Roadmap Duration: ${input.durationWeeks || 6} weeks

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
    return roadmapResponseSchema.parse(parsed)
  } catch (error) {
    console.error('Gemini generation error:', error)
    return null
  }
}

export async function POST(request: NextRequest) {
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
      targetRole: 'frontend-developer',
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
