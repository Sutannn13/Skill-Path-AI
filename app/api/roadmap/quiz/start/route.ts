import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { isUuid } from '@/lib/utils'
import {
  QUIZ_PASSING_SCORE,
  QUIZ_QUESTION_COUNT,
  getCuratedQuizQuestions,
  inferQuizSkillFromTask,
} from '@/lib/roadmap/quiz-bank'

export const dynamic = 'force-dynamic'

const startSchema = z.object({
  taskId: z.string().min(1),
  title: z.string().optional().default('Roadmap task'),
  description: z.string().optional().default(''),
  focusSkills: z.array(z.string()).optional().default([]),
})

interface TaskOwnershipRow {
  id: string
  task_key: string | null
  title: string
  description: string | null
  focus_skills: string[] | null
  roadmaps: {
    user_id: string
  } | null
}

function isQuizPersistenceUnavailableError(message: string) {
  const normalized = message.toLowerCase()
  return [
    'roadmap_quizzes',
    'roadmap_quiz_questions',
    'roadmap_quiz_attempts',
    'schema cache',
  ].some((fragment) => normalized.includes(fragment))
}

function getLocalQuizId(skill: string) {
  return `local:${encodeURIComponent(skill)}`
}

function getLocalQuestionId(skill: string, position: number) {
  return `${getLocalQuizId(skill)}:${position}`
}

function createLocalQuizPayload(input: {
  taskId: string
  title: string
  description: string
  focusSkills: string[]
}) {
  const skill = inferQuizSkillFromTask({
    id: input.taskId,
    title: input.title,
    description: input.description,
    focusSkills: input.focusSkills,
  })
  const quizId = getLocalQuizId(skill)
  const questions = getCuratedQuizQuestions(skill, QUIZ_QUESTION_COUNT)

  return {
    quiz: {
      id: quizId,
      roadmapTaskId: input.taskId,
      title: `${input.title} quiz`,
      passingScore: QUIZ_PASSING_SCORE,
      questionCount: questions.length,
      questions: questions.map((question, index) => ({
        id: getLocalQuestionId(skill, index + 1),
        quizId,
        questionText: question.questionText,
        questionType: 'multiple_choice',
        options: question.options,
        explanation: question.explanation,
        relatedSkill: question.relatedSkill,
        difficulty: question.difficulty,
        position: index + 1,
      })),
    },
    latestAttempt: null,
    mode: 'local',
  }
}

async function ensureQuizForTask(input: {
  admin: ReturnType<typeof createSupabaseAdminClient>
  taskId: string
  taskKey?: string | null
  title: string
  description: string
  focusSkills: string[]
}) {
  const admin = input.admin
  if (!admin) {
    return { quizId: null, error: 'Supabase admin client is not configured.' }
  }

  const { data: existingQuiz, error: existingQuizError } = await admin
    .from('roadmap_quizzes')
    .select('id')
    .eq('roadmap_task_id', input.taskId)
    .maybeSingle()

  if (existingQuizError) {
    return { quizId: null, error: existingQuizError.message }
  }

  let quizId = (existingQuiz as { id: string } | null)?.id ?? null

  if (!quizId) {
    const { data: insertedQuiz, error: insertQuizError } = await admin
      .from('roadmap_quizzes')
      .insert({
        roadmap_task_id: input.taskId,
        title: `${input.title} quiz`,
        passing_score: QUIZ_PASSING_SCORE,
        question_count: QUIZ_QUESTION_COUNT,
      })
      .select('id')
      .single()

    if (insertQuizError || !insertedQuiz) {
      return { quizId: null, error: insertQuizError?.message ?? 'Failed to create quiz row.' }
    }

    quizId = (insertedQuiz as { id: string }).id
  }

  const { data: existingQuestions, error: existingQuestionsError } = await admin
    .from('roadmap_quiz_questions')
    .select('id, related_skill')
    .eq('quiz_id', quizId)

  if (existingQuestionsError) {
    return { quizId: null, error: existingQuestionsError.message }
  }

  const skill = inferQuizSkillFromTask({
    id: input.taskId,
    taskKey: input.taskKey ?? undefined,
    title: input.title,
    description: input.description,
    focusSkills: input.focusSkills,
  })
  const questions = getCuratedQuizQuestions(skill, QUIZ_QUESTION_COUNT)
  const expectedRelatedSkill = questions[0]?.relatedSkill.trim().toLowerCase() ?? ''
  const shouldReplaceQuestions =
    (existingQuestions ?? []).length !== questions.length ||
    (existingQuestions ?? []).some((question) =>
      String(question.related_skill ?? '').trim().toLowerCase() !== expectedRelatedSkill
    )

  if (shouldReplaceQuestions && (existingQuestions ?? []).length > 0) {
    const { error: questionDeleteError } = await admin
      .from('roadmap_quiz_questions')
      .delete()
      .eq('quiz_id', quizId)

    if (questionDeleteError) {
      return { quizId: null, error: questionDeleteError.message }
    }
  }

  if (shouldReplaceQuestions) {
    const questionRows = questions.map((question, index) => ({
      quiz_id: quizId,
      question_text: question.questionText,
      question_type: 'multiple_choice',
      options: question.options,
      correct_answer: question.correctAnswer,
      explanation: question.explanation,
      related_skill: question.relatedSkill,
      difficulty: question.difficulty,
      position: index + 1,
    }))

    const { error: questionInsertError } = await admin
      .from('roadmap_quiz_questions')
      .insert(questionRows)

    if (questionInsertError) {
      return { quizId: null, error: questionInsertError.message }
    }
  }

  return { quizId, error: null as string | null }
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  const parsed = startSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request body', details: parsed.error.issues },
      { status: 400 }
    )
  }

  const { taskId } = parsed.data

  if (!isUuid(taskId)) {
    return NextResponse.json(createLocalQuizPayload(parsed.data))
  }

  const supabase = await createSupabaseServerClient()
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase is not configured.' }, { status: 503 })
  }

  const admin = createSupabaseAdminClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: taskRow, error: taskError } = await supabase
    .from('roadmap_tasks')
    .select('id, task_key, title, description, focus_skills, roadmaps!inner(user_id)')
    .eq('id', taskId)
    .eq('roadmaps.user_id', user.id)
    .maybeSingle()

  if (taskError || !taskRow) {
    return NextResponse.json({ error: 'Roadmap task not found for this user.' }, { status: 404 })
  }

  const typedTask = taskRow as unknown as TaskOwnershipRow
  const quizResult = await ensureQuizForTask({
    admin,
    taskId: typedTask.id,
    taskKey: typedTask.task_key,
    title: typedTask.title,
    description: typedTask.description ?? '',
    focusSkills: typedTask.focus_skills ?? [],
  })

  if (!quizResult.quizId) {
    if (quizResult.error && isQuizPersistenceUnavailableError(quizResult.error)) {
      return NextResponse.json(createLocalQuizPayload({
        taskId: typedTask.id,
        title: typedTask.title,
        description: typedTask.description ?? '',
        focusSkills: typedTask.focus_skills ?? [],
      }))
    }

    return NextResponse.json({ error: quizResult.error ?? 'Failed to initialize quiz.' }, { status: 500 })
  }

  const { data: quizRow, error: quizError } = await supabase
    .from('roadmap_quizzes')
    .select('id, roadmap_task_id, title, passing_score, question_count')
    .eq('id', quizResult.quizId)
    .single()

  if (quizError || !quizRow) {
    return NextResponse.json({ error: `Failed to load quiz metadata: ${quizError?.message ?? 'missing row'}` }, { status: 500 })
  }

  const { data: questions, error: questionError } = await supabase
    .from('roadmap_quiz_questions')
    .select('id, quiz_id, question_text, question_type, options, explanation, related_skill, difficulty, position')
    .eq('quiz_id', quizResult.quizId)
    .order('position', { ascending: true })

  if (questionError) {
    return NextResponse.json({ error: `Failed to load quiz questions: ${questionError.message}` }, { status: 500 })
  }

  const { data: latestAttempt, error: latestAttemptError } = await supabase
    .from('roadmap_quiz_attempts')
    .select('id, score, total_questions, correct_count, passed, answers, started_at, submitted_at')
    .eq('quiz_id', quizResult.quizId)
    .eq('user_id', user.id)
    .order('submitted_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (latestAttemptError) {
    return NextResponse.json({ error: `Failed to load quiz attempts: ${latestAttemptError.message}` }, { status: 500 })
  }

  return NextResponse.json({
    quiz: {
      id: (quizRow as { id: string }).id,
      roadmapTaskId: (quizRow as { roadmap_task_id: string }).roadmap_task_id,
      title: (quizRow as { title: string }).title,
      passingScore: (quizRow as { passing_score: number }).passing_score,
      questionCount: (quizRow as { question_count: number }).question_count,
      questions: (questions ?? []).map((question) => ({
        id: question.id,
        quizId: question.quiz_id,
        questionText: question.question_text,
        questionType: question.question_type,
        options: question.options,
        explanation: question.explanation,
        relatedSkill: question.related_skill,
        difficulty: question.difficulty,
        position: question.position,
      })),
    },
    latestAttempt: latestAttempt
      ? {
        id: latestAttempt.id,
        score: latestAttempt.score,
        totalQuestions: latestAttempt.total_questions,
        correctCount: latestAttempt.correct_count,
        passed: latestAttempt.passed,
        answers: latestAttempt.answers,
        startedAt: latestAttempt.started_at,
        submittedAt: latestAttempt.submitted_at,
      }
      : null,
  })
}
