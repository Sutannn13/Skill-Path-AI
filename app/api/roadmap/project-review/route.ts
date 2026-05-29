import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import {
  evaluateProjectWithRules,
  fetchGitHubRepoContext,
  generateGeminiProjectReview,
  parseGitHubRepositoryUrl,
} from '@/lib/roadmap/project-review'
import { RoadmapProjectReviewStatus } from '@/types'

export const dynamic = 'force-dynamic'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const GITHUB_TOKEN = process.env.GITHUB_TOKEN
const IS_DEVELOPMENT = process.env.NODE_ENV === 'development'
const AI_DAILY_LIMIT = 40
let aiDailyUsageCount = 0
let aiUsageDate = new Date().toDateString()

const submitSchema = z.object({
  roadmapId: z.string().uuid(),
  roadmapTaskId: z.string().uuid().nullable().optional(),
  projectType: z.enum(['mini_project', 'final_project']),
  repoUrl: z.string().url(),
  liveUrl: z.string().url().nullable().optional(),
  notes: z.string().nullable().optional(),
  taskContext: z.string().optional().default(''),
})

function deriveRequirementState(input: {
  resourcesComplete: boolean
  quizPassed: boolean
  projectRequired: boolean
  projectPassed: boolean
}): 'resources_pending' | 'resources_completed' | 'quiz_pending' | 'quiz_passed' | 'project_pending' | 'project_passed' | 'completed' {
  if (!input.resourcesComplete) {
    return 'resources_pending'
  }

  if (!input.quizPassed) {
    return 'quiz_pending'
  }

  if (!input.projectRequired) {
    return 'completed'
  }

  if (!input.projectPassed) {
    return 'project_pending'
  }

  return 'completed'
}

function canUseAiReview() {
  const today = new Date().toDateString()
  if (today !== aiUsageDate) {
    aiUsageDate = today
    aiDailyUsageCount = 0
  }

  return Boolean(GEMINI_API_KEY) && aiDailyUsageCount < AI_DAILY_LIMIT
}

function incrementAiUsage() {
  aiDailyUsageCount += 1
}

function safeStringArray(input: unknown): string[] {
  if (!Array.isArray(input)) return []
  return input.filter((item): item is string => typeof item === 'string')
}

function isOptionalFinalProjectColumnError(error: { message?: string } | null) {
  const message = error?.message?.toLowerCase() ?? ''
  return message.includes('final_project_passed') || message.includes('final_project_status')
}

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient()
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase is not configured.' }, { status: 503 })
  }

  const admin = createSupabaseAdminClient()
  if (!admin) {
    return NextResponse.json({ error: 'Supabase admin client is not configured.' }, { status: 503 })
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  const parsed = submitSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request body', details: parsed.error.issues },
      { status: 400 }
    )
  }

  const input = parsed.data
  const normalizedRepo = parseGitHubRepositoryUrl(input.repoUrl)

  const { data: roadmapOwned, error: roadmapError } = await supabase
    .from('roadmaps')
    .select('id')
    .eq('id', input.roadmapId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (roadmapError || !roadmapOwned) {
    return NextResponse.json({ error: 'Roadmap not found for current user.' }, { status: 404 })
  }

  if (input.projectType === 'mini_project' && !input.roadmapTaskId) {
    return NextResponse.json({ error: 'roadmapTaskId is required for mini project submissions.' }, { status: 400 })
  }

  let taskGuard: {
    id: string
    roadmap_id: string
    quiz_required: boolean | null
    quiz_passed: boolean | null
    project_required: boolean | null
    mini_project: Record<string, unknown> | null
  } | null = null

  if (input.roadmapTaskId) {
    const { data: taskOwned, error: taskError } = await supabase
      .from('roadmap_tasks')
      .select('id, roadmap_id, quiz_required, quiz_passed, project_required, mini_project')
      .eq('id', input.roadmapTaskId)
      .eq('roadmap_id', input.roadmapId)
      .maybeSingle()

    if (taskError || !taskOwned) {
      return NextResponse.json({ error: 'Roadmap task not found for this roadmap.' }, { status: 404 })
    }

    taskGuard = taskOwned as {
      id: string
      roadmap_id: string
      quiz_required: boolean | null
      quiz_passed: boolean | null
      project_required: boolean | null
      mini_project: Record<string, unknown> | null
    }
  }

  if (input.projectType === 'mini_project' && taskGuard) {
    if (taskGuard.quiz_required !== false && taskGuard.quiz_passed !== true) {
      return NextResponse.json(
        { error: 'Pass the quiz before submitting this mini project.' },
        { status: 403 }
      )
    }

    const hasProjectRequirement = taskGuard.project_required === true || Boolean(taskGuard.mini_project)
    if (!hasProjectRequirement) {
      return NextResponse.json(
        { error: 'This task does not require a mini project submission.' },
        { status: 422 }
      )
    }
  }

  const { data: submissionRow, error: submissionError } = await supabase
    .from('roadmap_project_submissions')
    .insert({
      user_id: user.id,
      roadmap_id: input.roadmapId,
      roadmap_task_id: input.roadmapTaskId ?? null,
      project_type: input.projectType,
      repo_url: normalizedRepo?.normalizedUrl ?? input.repoUrl,
      live_url: input.liveUrl ?? null,
      notes: input.notes ?? null,
      status: 'submitted',
    })
    .select('id')
    .single()

  if (submissionError || !submissionRow) {
    return NextResponse.json({ error: `Failed to create project submission: ${submissionError?.message ?? 'missing row'}` }, { status: 500 })
  }

  const submissionId = (submissionRow as { id: string }).id
  const repoContextResult = normalizedRepo
    ? await fetchGitHubRepoContext(normalizedRepo.owner, normalizedRepo.repo, GITHUB_TOKEN)
    : { context: null, issues: ['Repository URL must point to github.com/owner/repo.'] }

  const ruleReview = evaluateProjectWithRules({
    repoUrl: normalizedRepo?.normalizedUrl ?? input.repoUrl,
    liveUrl: input.liveUrl ?? null,
    projectType: input.projectType,
    taskContext: input.taskContext,
    repoContext: repoContextResult.context,
    repoIssues: repoContextResult.issues,
  })

  let finalStatus: RoadmapProjectReviewStatus = ruleReview.status
  let finalScore = ruleReview.score
  let finalSummary = ruleReview.summary
  let finalStrengths = [...ruleReview.strengths]
  let finalIssues = [...ruleReview.issues]
  let finalRequiredFixes = [...ruleReview.requiredFixes]
  let finalSuggestions = [...ruleReview.suggestions]
  let reviewer = 'rule_engine'
  let rawResponse: Record<string, unknown> | null = {
    ruleSignals: ruleReview.ruleSignals,
  }
  let usedAi = false

  const aiAllowed = canUseAiReview()
  if (aiAllowed && ruleReview.status !== 'needs_revision' && GEMINI_API_KEY) {
    const aiReview = await generateGeminiProjectReview({
      geminiApiKey: GEMINI_API_KEY,
      projectType: input.projectType,
      taskContext: input.taskContext,
      repoUrl: normalizedRepo?.normalizedUrl ?? input.repoUrl,
      liveUrl: input.liveUrl ?? null,
      ruleReview,
    })

    if (aiReview) {
      incrementAiUsage()
      usedAi = true
      reviewer = 'gemini'
      finalStatus = aiReview.status
      finalScore = Math.round((ruleReview.score + aiReview.score) / 2)
      finalSummary = aiReview.summary
      finalStrengths = Array.from(new Set([...ruleReview.strengths, ...aiReview.strengths]))
      finalIssues = Array.from(new Set([...ruleReview.issues, ...aiReview.issues]))
      finalRequiredFixes = Array.from(new Set([...ruleReview.requiredFixes, ...aiReview.requiredFixes]))
      finalSuggestions = Array.from(new Set([...ruleReview.suggestions, ...aiReview.suggestions]))
      rawResponse = {
        ruleSignals: ruleReview.ruleSignals,
        ai: aiReview,
      }
    }
  }

  if (!usedAi && finalStatus === 'passed') {
    finalStatus = 'needs_review'
    finalSummary = 'Rule-based checks passed. Waiting for AI/manual review confirmation.'
  }

  const { error: reviewInsertError } = await admin
    .from('roadmap_project_reviews')
    .insert({
      submission_id: submissionId,
      reviewer,
      score: finalScore,
      status: finalStatus,
      summary: finalSummary,
      strengths: finalStrengths,
      issues: finalIssues,
      required_fixes: finalRequiredFixes,
      suggestions: finalSuggestions,
      raw_response: rawResponse,
    })

  if (reviewInsertError) {
    return NextResponse.json({ error: `Failed to save project review: ${reviewInsertError.message}` }, { status: 500 })
  }

  const { error: submissionUpdateError } = await supabase
    .from('roadmap_project_submissions')
    .update({
      status: finalStatus,
      updated_at: new Date().toISOString(),
    })
    .eq('id', submissionId)

  if (submissionUpdateError) {
    return NextResponse.json({ error: `Failed to update submission status: ${submissionUpdateError.message}` }, { status: 500 })
  }

  if (input.roadmapTaskId) {
    const { data: taskRow, error: taskRowError } = await supabase
      .from('roadmap_tasks')
      .select('id, quiz_passed, project_required')
      .eq('id', input.roadmapTaskId)
      .single()

    if (taskRowError) {
      return NextResponse.json({ error: `Failed to load task state: ${taskRowError.message}` }, { status: 500 })
    }

    const { data: requiredResources, error: requiredResourcesError } = await supabase
      .from('roadmap_resources')
      .select('id')
      .eq('roadmap_task_id', input.roadmapTaskId)
      .eq('is_required', true)

    if (requiredResourcesError) {
      return NextResponse.json({ error: `Failed to load required resources: ${requiredResourcesError.message}` }, { status: 500 })
    }

    let resourcesComplete = true
    if ((requiredResources ?? []).length > 0) {
      const requiredIds = (requiredResources ?? []).map((resource) => resource.id as string)
      const { data: progressRows, error: progressError } = await supabase
        .from('roadmap_resource_progress')
        .select('resource_id, is_completed')
        .eq('user_id', user.id)
        .in('resource_id', requiredIds)

      if (progressError) {
        return NextResponse.json({ error: `Failed to load resource progress: ${progressError.message}` }, { status: 500 })
      }

      const completedIds = new Set(
        (progressRows ?? [])
          .filter((row) => row.is_completed === true)
          .map((row) => row.resource_id as string)
      )

      resourcesComplete = requiredIds.every((resourceId) => completedIds.has(resourceId))
    }

    const requirementState = deriveRequirementState({
      resourcesComplete,
      quizPassed: (taskRow as { quiz_passed: boolean | null }).quiz_passed === true,
      projectRequired: (taskRow as { project_required: boolean | null }).project_required !== false,
      projectPassed: finalStatus === 'passed',
    })
    const isCompleted = requirementState === 'completed'

    const { error: taskUpdateError } = await supabase
      .from('roadmap_tasks')
      .update({
        project_required: true,
        project_passed: finalStatus === 'passed',
        requirement_state: requirementState,
        status: isCompleted ? 'completed' : 'todo',
        completed_at: isCompleted ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', input.roadmapTaskId)

    if (taskUpdateError) {
      return NextResponse.json({ error: `Failed to update task project state: ${taskUpdateError.message}` }, { status: 500 })
    }
  }

  if (input.projectType === 'final_project') {
    const { error: roadmapUpdateError } = await supabase
      .from('roadmaps')
      .update({
        final_project_passed: finalStatus === 'passed',
        final_project_status: finalStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', input.roadmapId)
      .eq('user_id', user.id)

    if (roadmapUpdateError && !isOptionalFinalProjectColumnError(roadmapUpdateError)) {
      return NextResponse.json({ error: `Failed to update final project status: ${roadmapUpdateError.message}` }, { status: 500 })
    }
  }

  if (IS_DEVELOPMENT) {
    console.log('[Roadmap Project Review] completed', {
      submissionId,
      status: finalStatus,
      usedAi,
    })
  }

  return NextResponse.json({
    submissionId,
    status: finalStatus,
    score: finalScore,
    summary: finalSummary,
    strengths: finalStrengths,
    issues: finalIssues,
    requiredFixes: finalRequiredFixes,
    suggestions: finalSuggestions,
    reviewer,
    aiUsed: usedAi,
    aiRemaining: Math.max(0, AI_DAILY_LIMIT - aiDailyUsageCount),
  })
}

export async function GET(request: NextRequest) {
  const supabase = await createSupabaseServerClient()
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase is not configured.' }, { status: 503 })
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const roadmapId = searchParams.get('roadmapId')
  const taskId = searchParams.get('roadmapTaskId')
  const projectType = searchParams.get('projectType')

  if (!roadmapId) {
    return NextResponse.json({ error: 'roadmapId query parameter is required.' }, { status: 400 })
  }

  let query = supabase
    .from('roadmap_project_submissions')
    .select(`
      id,
      project_type,
      roadmap_id,
      roadmap_task_id,
      repo_url,
      live_url,
      notes,
      status,
      created_at,
      updated_at,
      roadmap_project_reviews (
        id,
        reviewer,
        score,
        status,
        summary,
        strengths,
        issues,
        required_fixes,
        suggestions,
        created_at
      )
    `)
    .eq('user_id', user.id)
    .eq('roadmap_id', roadmapId)
    .order('created_at', { ascending: false })
    .limit(1)

  if (taskId) {
    query = query.eq('roadmap_task_id', taskId)
  } else {
    query = query.is('roadmap_task_id', null)
  }

  if (projectType === 'mini_project' || projectType === 'final_project') {
    query = query.eq('project_type', projectType)
  }

  const { data, error } = await query.maybeSingle()

  if (error) {
    return NextResponse.json({ error: `Failed to load project review: ${error.message}` }, { status: 500 })
  }

  if (!data) {
    return NextResponse.json({ submission: null, review: null })
  }

  const reviewRow = Array.isArray((data as { roadmap_project_reviews?: unknown[] }).roadmap_project_reviews)
    ? (data as { roadmap_project_reviews?: Array<Record<string, unknown>> }).roadmap_project_reviews?.[0]
    : null

  return NextResponse.json({
    submission: {
      id: data.id,
      projectType: data.project_type,
      roadmapId: data.roadmap_id,
      roadmapTaskId: data.roadmap_task_id,
      repoUrl: data.repo_url,
      liveUrl: data.live_url,
      notes: data.notes,
      status: data.status,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    },
    review: reviewRow
      ? {
        id: reviewRow.id,
        reviewer: reviewRow.reviewer,
        score: reviewRow.score,
        status: reviewRow.status,
        summary: reviewRow.summary,
        strengths: safeStringArray(reviewRow.strengths),
        issues: safeStringArray(reviewRow.issues),
        requiredFixes: safeStringArray(reviewRow.required_fixes),
        suggestions: safeStringArray(reviewRow.suggestions),
        createdAt: reviewRow.created_at,
      }
      : null,
  })
}
