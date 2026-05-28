import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import {
  QUIZ_PASSING_SCORE,
  getCuratedQuizQuestions,
} from '@/lib/roadmap/quiz-bank'

export const dynamic = 'force-dynamic'

const submitSchema = z.object({
  quizId: z.string().min(1),
  answers: z.record(z.string(), z.string()),
  resourcesComplete: z.boolean().optional().default(true),
  projectRequired: z.boolean().optional().default(false),
  projectPassed: z.boolean().optional().default(false),
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

function isUuid(value: string) {
  return z.string().uuid().safeParse(value).success
}

function getLocalSkillFromQuizId(quizId: string) {
  if (!quizId.startsWith('local:')) return null
  const encoded = quizId.split(':')[1]
  if (!encoded) return null

  try {
    return decodeURIComponent(encoded)
  } catch {
    return null
  }
}

function getLocalQuestionId(skill: string, position: number) {
  return `local:${encodeURIComponent(skill)}:${position}`
}

function gradeLocalQuiz(input: z.infer<typeof submitSchema>) {
  const skill = getLocalSkillFromQuizId(input.quizId)
  if (!skill) {
    return null
  }

  const questions = getCuratedQuizQuestions(skill)
  const grading = questions.map((question, index) => {
    const questionId = getLocalQuestionId(skill, index + 1)
    const selectedAnswer = input.answers[questionId] ?? ''
    const isCorrect = selectedAnswer.trim() !== '' && selectedAnswer === question.correctAnswer

    return {
      questionId,
      questionText: question.questionText,
      selectedAnswer,
      correctAnswer: question.correctAnswer,
      isCorrect,
      explanation: question.explanation,
    }
  })

  const correctCount = grading.filter((item) => item.isCorrect).length
  const totalQuestions = questions.length
  const score = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0
  const passed = score >= QUIZ_PASSING_SCORE
  const requirementState = deriveRequirementState({
    resourcesComplete: input.resourcesComplete,
    quizPassed: passed,
    projectRequired: input.projectRequired,
    projectPassed: input.projectPassed,
  })

  return {
    passed,
    score,
    passingScore: QUIZ_PASSING_SCORE,
    correctCount,
    totalQuestions,
    requirementState,
    feedback: grading,
    mode: 'local',
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  const parsed = submitSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request body', details: parsed.error.issues },
      { status: 400 }
    )
  }

  const localResult = gradeLocalQuiz(parsed.data)
  if (localResult) {
    return NextResponse.json(localResult)
  }

  if (!isUuid(parsed.data.quizId)) {
    return NextResponse.json({ error: 'Quiz not found.' }, { status: 404 })
  }

  const supabase = await createSupabaseServerClient()
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase is not configured.' }, { status: 503 })
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { quizId, answers } = parsed.data

  const { data: quizMeta, error: quizMetaError } = await supabase
    .from('roadmap_quizzes')
    .select('id, roadmap_task_id, passing_score')
    .eq('id', quizId)
    .maybeSingle()

  if (quizMetaError || !quizMeta) {
    return NextResponse.json({ error: 'Quiz not found.' }, { status: 404 })
  }

  const taskId = (quizMeta as { roadmap_task_id: string }).roadmap_task_id
  const { data: taskOwnership, error: taskOwnershipError } = await supabase
    .from('roadmap_tasks')
    .select('id, project_required, project_passed, roadmaps!inner(user_id)')
    .eq('id', taskId)
    .eq('roadmaps.user_id', user.id)
    .maybeSingle()

  if (taskOwnershipError || !taskOwnership) {
    return NextResponse.json({ error: 'Quiz task is not owned by current user.' }, { status: 403 })
  }

  const { data: questions, error: questionError } = await supabase
    .from('roadmap_quiz_questions')
    .select('id, question_text, correct_answer, explanation, position')
    .eq('quiz_id', quizId)
    .order('position', { ascending: true })

  if (questionError) {
    return NextResponse.json({ error: `Failed to load quiz questions: ${questionError.message}` }, { status: 500 })
  }

  if (!questions || questions.length === 0) {
    return NextResponse.json({ error: 'Quiz has no questions.' }, { status: 422 })
  }

  const grading = questions.map((question) => {
    const selectedAnswer = answers[question.id] ?? ''
    const isCorrect = selectedAnswer.trim() !== '' && selectedAnswer === question.correct_answer

    return {
      questionId: question.id,
      questionText: question.question_text,
      selectedAnswer,
      correctAnswer: question.correct_answer,
      isCorrect,
      explanation: question.explanation ?? '',
    }
  })

  const correctCount = grading.filter((item) => item.isCorrect).length
  const totalQuestions = questions.length
  const score = Math.round((correctCount / totalQuestions) * 100)
  const passingScore = (quizMeta as { passing_score: number }).passing_score
  const passed = score >= passingScore

  const { error: attemptError } = await supabase
    .from('roadmap_quiz_attempts')
    .insert({
      quiz_id: quizId,
      user_id: user.id,
      score,
      total_questions: totalQuestions,
      correct_count: correctCount,
      passed,
      answers,
      started_at: new Date().toISOString(),
      submitted_at: new Date().toISOString(),
    })

  if (attemptError) {
    return NextResponse.json({ error: `Failed to save quiz attempt: ${attemptError.message}` }, { status: 500 })
  }

  const roadmapTask = taskOwnership as {
    project_required: boolean | null
    project_passed: boolean | null
  }

  const { data: requiredResources, error: resourceError } = await supabase
    .from('roadmap_resources')
    .select('id')
    .eq('roadmap_task_id', taskId)
    .eq('is_required', true)

  if (resourceError) {
    return NextResponse.json({ error: `Failed to load required resources: ${resourceError.message}` }, { status: 500 })
  }

  let resourcesComplete = true
  if ((requiredResources ?? []).length > 0) {
    const requiredResourceIds = (requiredResources ?? []).map((resource) => resource.id as string)
    const { data: resourceProgress, error: progressError } = await supabase
      .from('roadmap_resource_progress')
      .select('resource_id, is_completed')
      .eq('user_id', user.id)
      .in('resource_id', requiredResourceIds)

    if (progressError) {
      return NextResponse.json({ error: `Failed to load resource progress: ${progressError.message}` }, { status: 500 })
    }

    const completedSet = new Set(
      (resourceProgress ?? [])
        .filter((row) => row.is_completed === true)
        .map((row) => row.resource_id as string)
    )
    resourcesComplete = requiredResourceIds.every((id) => completedSet.has(id))
  }

  const projectRequired = roadmapTask?.project_required === true
  const projectPassed = roadmapTask?.project_passed === true
  const requirementState = deriveRequirementState({
    resourcesComplete,
    quizPassed: passed,
    projectRequired,
    projectPassed,
  })

  const isTaskCompleted = requirementState === 'completed'
  const { error: taskUpdateError } = await supabase
    .from('roadmap_tasks')
    .update({
      quiz_passed: passed,
      requirement_state: requirementState,
      status: isTaskCompleted ? 'completed' : 'todo',
      completed_at: isTaskCompleted ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', taskId)

  if (taskUpdateError) {
    return NextResponse.json({ error: `Failed to update task quiz state: ${taskUpdateError.message}` }, { status: 500 })
  }

  return NextResponse.json({
    passed,
    score,
    passingScore,
    correctCount,
    totalQuestions,
    requirementState,
    feedback: grading,
  })
}
