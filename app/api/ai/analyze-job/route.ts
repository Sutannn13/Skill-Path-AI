import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { JobPost } from '@/lib/jobs/types'
import { assessJobValidity } from '@/lib/jobs/validity'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

// Gemini API configuration
const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent'
const GEMINI_MODEL = 'gemini-1.5-flash'

// In-memory cache for AI analysis
const analysisCache = new Map<string, {
  analysis: JobAnalysisResult
  timestamp: number
}>()
const CACHE_TTL = 24 * 60 * 60 * 1000 // 24 hours

// Daily usage tracking
let dailyUsageCount = 0
let dailyUsageReset = new Date()
dailyUsageReset.setHours(24, 0, 0, 0) // Reset at midnight

const MAX_DAILY_REQUESTS = 50

// Request/Response schemas
const analyzeJobRequestSchema = z.object({
  job: z.object({
    id: z.string(),
    title: z.string(),
    company: z.string(),
    location: z.string(),
    description: z.string(),
    requiredSkills: z.array(z.string()),
    tags: z.array(z.string()),
  }),
  userSkills: z.record(z.string(), z.number()).optional(), // skillId -> level
})

export interface JobAnalysisResult {
  summary: string
  validityExplanation?: string
  skillGapExplanation?: string
  riskAssessment?: {
    score: number
    level: 'low' | 'medium' | 'high'
    concerns: string[]
  }
  suggestedSkills: string[]
  comparisonNotes: string
  source: 'ai' | 'fallback'
  cached: boolean
}

interface CachedAnalysisRow {
  summary: string | null
  validity_explanation: string | null
  skill_gap_explanation: string | null
  risk_assessment: JobAnalysisResult['riskAssessment'] | null
  suggested_skills: string[] | null
  comparison_notes: string | null
  source: 'ai' | 'fallback' | null
}

// Rate limiter
function checkRateLimit(): boolean {
  const now = new Date()

  // Reset counter if new day
  if (now >= dailyUsageReset) {
    dailyUsageCount = 0
    dailyUsageReset.setDate(now.getDate() + 1)
  }

  return dailyUsageCount < MAX_DAILY_REQUESTS
}

function incrementUsage(): void {
  dailyUsageCount++
}

// Deterministic fallback response
function generateFallbackAnalysis(job: z.infer<typeof analyzeJobRequestSchema>['job']): JobAnalysisResult {
  const requiredSkills = job.requiredSkills || []
  const description = (job.description || '').toLowerCase()
  const title = (job.title || '').toLowerCase()

  // Basic skill matching
  const basicSkills = ['javascript', 'typescript', 'react', 'html', 'css', 'python', 'java']
  const matchedSkills = requiredSkills.filter(skill =>
    basicSkills.some(bs => skill.toLowerCase().includes(bs))
  )

  // Generate summary based on job content
  let summary = `This is a ${job.title} position at ${job.company}. `

  if (title.includes('intern') || title.includes('junior') || title.includes('trainee')) {
    summary += 'Based on the job title, this appears to be an entry-level position suitable for those starting their career. '
  } else if (title.includes('senior')) {
    summary += 'This appears to be a senior-level position requiring significant experience. '
  }

  if (requiredSkills.length > 0) {
    summary += `The role requires ${requiredSkills.length} skills including: ${requiredSkills.slice(0, 5).join(', ')}.`
  }

  // Skill gap explanation
  let skillGapExplanation = `Required skills include: ${requiredSkills.slice(0, 5).join(', ')}. `

  if (requiredSkills.length <= 3) {
    skillGapExplanation += 'This is a relatively focused skill set that can be acquired in 1-2 months of dedicated learning.'
  } else if (requiredSkills.length <= 6) {
    skillGapExplanation += 'This role requires a moderate set of skills. A focused 3-4 month learning plan should prepare you well.'
  } else {
    skillGapExplanation += 'This is a comprehensive role requiring many skills. Consider a structured 6+ month learning roadmap.'
  }

  // Suggested skills to learn
  const suggestedSkills = requiredSkills.slice(0, 3)

  return {
    summary,
    skillGapExplanation,
    suggestedSkills,
    comparisonNotes: `Your profile matches ${matchedSkills.length} of ${requiredSkills.length} required skills. Focus on the core technologies first.`,
    source: 'fallback',
    cached: false,
  }
}

async function getCachedDbAnalysis(jobId: string): Promise<JobAnalysisResult | null> {
  const supabase = createSupabaseAdminClient()
  if (!supabase) return null

  const { data, error } = await supabase
    .from('ai_job_analyses')
    .select('summary, validity_explanation, skill_gap_explanation, risk_assessment, suggested_skills, comparison_notes, source')
    .eq('job_id', jobId)
    .eq('model', GEMINI_MODEL)
    .maybeSingle()

  if (error) {
    console.warn('[AI Job Analysis] Cache read failed:', error.message)
    return null
  }

  if (!data) return null

  const cached = data as CachedAnalysisRow
  return {
    summary: cached.summary ?? 'Cached job analysis',
    validityExplanation: cached.validity_explanation ?? undefined,
    skillGapExplanation: cached.skill_gap_explanation ?? undefined,
    riskAssessment: cached.risk_assessment ?? undefined,
    suggestedSkills: cached.suggested_skills ?? [],
    comparisonNotes: cached.comparison_notes ?? '',
    source: cached.source ?? 'ai',
    cached: true,
  }
}

async function saveDbAnalysis(jobId: string, analysis: JobAnalysisResult) {
  const supabase = createSupabaseAdminClient()
  if (!supabase || analysis.source !== 'ai') return

  const { error } = await supabase
    .from('ai_job_analyses')
    .upsert({
      job_id: jobId,
      model: GEMINI_MODEL,
      summary: analysis.summary,
      validity_explanation: analysis.validityExplanation ?? null,
      skill_gap_explanation: analysis.skillGapExplanation ?? null,
      risk_assessment: analysis.riskAssessment ?? null,
      suggested_skills: analysis.suggestedSkills,
      comparison_notes: analysis.comparisonNotes,
      source: analysis.source,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'job_id,model' })

  if (error) {
    console.warn('[AI Job Analysis] Cache write failed:', error.message)
  }
}

async function generateAIAnalysis(
  job: z.infer<typeof analyzeJobRequestSchema>['job'],
  userSkills?: Record<string, number>
): Promise<JobAnalysisResult | null> {
  if (!GEMINI_API_KEY) {
    return null
  }

  try {
    const prompt = `You are an AI assistant helping developers analyze job postings. Analyze this job posting:

Job Title: ${job.title}
Company: ${job.company}
Location: ${job.location}
Description: ${job.description.substring(0, 500)}
Required Skills: ${job.requiredSkills.join(', ')}
Tags: ${job.tags.join(', ')}

${userSkills && Object.keys(userSkills).length > 0
  ? `User's Current Skills: ${Object.entries(userSkills).map(([skill, level]) => `${skill} (level ${level})`).join(', ')}`
  : ''}

Provide a concise analysis in JSON format with these fields:
- summary: Brief overview of the job and role
- skillGapExplanation: What skills the user should focus on
- suggestedSkills: Top 3 skills to learn for this role
- comparisonNotes: How the user's skills match the requirements

Return ONLY JSON, no markdown or explanation.`

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
            temperature: 0.5,
            maxOutputTokens: 2048,
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

    // Parse the response
    const cleanedText = generatedText.replace(/```json\n?|```\n?/g, '').trim()
    const parsed = JSON.parse(cleanedText)

    return {
      ...parsed,
      source: 'ai',
      cached: false,
    }
  } catch (error) {
    console.error('AI analysis error:', error)
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate request
    const parseResult = analyzeJobRequestSchema.safeParse(body)
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: parseResult.error.issues },
        { status: 400 }
      )
    }

    const { job, userSkills } = parseResult.data

    // Deterministic validity remains the primary assessment.
    const jobForValidity: Partial<JobPost> = {
      id: job.id,
      title: job.title,
      company: job.company,
      description: job.description,
      applyUrl: '',
      sourceSlug: 'api',
    }
    const validity = assessJobValidity(jobForValidity)

    // Check cache
    const cacheKey = job.id
    const cached = analysisCache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return NextResponse.json({
        analysis: {
          ...cached.analysis,
          cached: true,
        },
        validity,
      })
    }

    const cachedDbAnalysis = await getCachedDbAnalysis(cacheKey)
    if (cachedDbAnalysis) {
      analysisCache.set(cacheKey, {
        analysis: cachedDbAnalysis,
        timestamp: Date.now(),
      })

      return NextResponse.json({
        analysis: cachedDbAnalysis,
        validity,
        usage: {
          remaining: MAX_DAILY_REQUESTS - dailyUsageCount,
          resetsAt: dailyUsageReset.toISOString(),
        },
      })
    }

    if (!checkRateLimit()) {
      const fallback = generateFallbackAnalysis(job)
      if (validity.riskLevel !== 'low') {
        fallback.riskAssessment = {
          score: validity.validityScore,
          level: validity.riskLevel,
          concerns: validity.reasons.slice(0, 3),
        }
      }

      return NextResponse.json({
        analysis: fallback,
        validity,
        usage: {
          remaining: 0,
          resetsAt: dailyUsageReset.toISOString(),
        },
        message: 'Daily AI limit reached. Returned deterministic fallback analysis.',
      })
    }

    // Try AI analysis
    let analysis = await generateAIAnalysis(job, userSkills)
    if (analysis) {
      incrementUsage()
      await saveDbAnalysis(cacheKey, analysis)
    }

    // If AI failed, use fallback
    if (!analysis) {
      analysis = generateFallbackAnalysis(job)

      // Add validity info to fallback
      if (validity.riskLevel !== 'low') {
        analysis.riskAssessment = {
          score: validity.validityScore,
          level: validity.riskLevel,
          concerns: validity.reasons.slice(0, 3),
        }
      }
    }

    // Cache the result
    analysisCache.set(cacheKey, {
      analysis,
      timestamp: Date.now(),
    })

    return NextResponse.json({
      analysis,
      validity,
      usage: {
        remaining: MAX_DAILY_REQUESTS - dailyUsageCount,
        resetsAt: dailyUsageReset.toISOString(),
      },
    })
  } catch (error) {
    console.error('Job analysis error:', error)

    return NextResponse.json(
      {
        error: 'Analysis failed',
        message: 'Unable to analyze this job posting.',
      },
      { status: 500 }
    )
  }
}

// GET endpoint to check cache status
export async function GET() {
  return NextResponse.json({
    cacheSize: analysisCache.size,
    dailyUsage: {
      count: dailyUsageCount,
      limit: MAX_DAILY_REQUESTS,
      resetsAt: dailyUsageReset.toISOString(),
    },
  })
}
