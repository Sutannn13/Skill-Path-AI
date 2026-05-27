import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import {
  QUIZ_PASSING_SCORE,
  QUIZ_QUESTION_COUNT,
  getCuratedQuizQuestions,
  inferQuizSkillFromTask,
} from '@/lib/roadmap/quiz-bank'

export const dynamic = 'force-dynamic'

const seedSchema = z.object({
  roadmapId: z.string().uuid(),
  tasks: z.array(z.object({
    id: z.string().uuid(),
    title: z.string(),
    description: z.string().optional().default(''),
    focusSkills: z.array(z.string()).optional().default([]),
    requiresProject: z.boolean().optional().default(false),
  })).min(1),
})

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
  const parsed = seedSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request body', details: parsed.error.issues },
      { status: 400 }
    )
  }

  const { roadmapId, tasks } = parsed.data

  const { data: roadmapOwned, error: roadmapError } = await supabase
    .from('roadmaps')
    .select('id')
    .eq('id', roadmapId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (roadmapError || !roadmapOwned) {
    return NextResponse.json({ error: 'Roadmap not found or not owned by current user.' }, { status: 404 })
  }

  const taskIds = tasks.map((task) => task.id)
  const { data: ownedTasks, error: taskOwnershipError } = await supabase
    .from('roadmap_tasks')
    .select('id')
    .eq('roadmap_id', roadmapId)
    .in('id', taskIds)

  if (taskOwnershipError) {
    return NextResponse.json({ error: `Failed to validate roadmap tasks: ${taskOwnershipError.message}` }, { status: 500 })
  }

  const ownedTaskSet = new Set((ownedTasks ?? []).map((task: { id: string }) => task.id))

  let seededCount = 0
  let updatedStateCount = 0

  for (const task of tasks) {
    if (!ownedTaskSet.has(task.id)) {
      continue
    }

    const skill = inferQuizSkillFromTask({
      title: task.title,
      description: task.description,
      focusSkills: task.focusSkills,
    })
    const questions = getCuratedQuizQuestions(skill, QUIZ_QUESTION_COUNT)

    const { data: quizRow, error: quizUpsertError } = await admin
      .from('roadmap_quizzes')
      .upsert({
        roadmap_task_id: task.id,
        title: `${task.title} quiz`,
        passing_score: QUIZ_PASSING_SCORE,
        question_count: QUIZ_QUESTION_COUNT,
      }, { onConflict: 'roadmap_task_id' })
      .select('id')
      .single()

    if (quizUpsertError || !quizRow) {
      return NextResponse.json(
        { error: `Failed to seed quiz for task ${task.id}: ${quizUpsertError?.message ?? 'missing row'}` },
        { status: 500 }
      )
    }

    const quizId = (quizRow as { id: string }).id
    const { data: existingQuestions, error: existingQuestionsError } = await admin
      .from('roadmap_quiz_questions')
      .select('id')
      .eq('quiz_id', quizId)
      .limit(1)

    if (existingQuestionsError) {
      return NextResponse.json(
        { error: `Failed to inspect existing questions: ${existingQuestionsError.message}` },
        { status: 500 }
      )
    }

    if ((existingQuestions ?? []).length === 0) {
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
        return NextResponse.json(
          { error: `Failed to insert quiz questions: ${questionInsertError.message}` },
          { status: 500 }
        )
      }
      seededCount += 1
    }

    const { error: taskUpdateError } = await admin
      .from('roadmap_tasks')
      .update({
        quiz_required: true,
        project_required: task.requiresProject,
        requirement_state: 'resources_pending',
        updated_at: new Date().toISOString(),
      })
      .eq('id', task.id)

    if (taskUpdateError) {
      return NextResponse.json(
        { error: `Failed to update task requirement state: ${taskUpdateError.message}` },
        { status: 500 }
      )
    }
    updatedStateCount += 1
  }

  return NextResponse.json({
    success: true,
    seededCount,
    updatedStateCount,
  })
}
