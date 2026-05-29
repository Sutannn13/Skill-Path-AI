'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { AlertCircle, ArrowLeft, CheckCircle2, ClipboardCheck, Lock } from 'lucide-react'
import { AppShell, Container, GradientBackground } from '@/components/layout'
import { DashboardHeader } from '@/components/layout/dashboard-header'
import { BrutalButton, BrutalCard, SkillBadge } from '@/components/brutal'
import { createSupabaseBrowserClient } from '@/lib/supabase/browser'
import { loadRoadmapTaskLearningContext, RoadmapTaskLearningContext } from '@/lib/roadmap/navigation-context'
import { cn } from '@/lib/utils'
import { RoadmapQuiz, RoadmapTaskRequirementState } from '@/types'

type PageState = 'loading' | 'ready' | 'locked' | 'not_found' | 'error' | 'unauthorized' | 'no_quiz'

interface QuizFeedbackItem {
  questionId: string
  questionText: string
  selectedAnswer: string
  correctAnswer: string
  isCorrect: boolean
  explanation: string
}

interface QuizResult {
  passed: boolean
  score: number
  passingScore: number
  correctCount: number
  totalQuestions: number
  requirementState: RoadmapTaskRequirementState
  feedback: QuizFeedbackItem[]
}

export default function RoadmapTaskQuizPage() {
  const params = useParams<{ taskId: string }>()
  const taskId = typeof params?.taskId === 'string' ? params.taskId : ''
  const supabase = useMemo(() => createSupabaseBrowserClient(), [])
  const [context, setContext] = useState<RoadmapTaskLearningContext | null>(null)
  const [pageState, setPageState] = useState<PageState>('loading')
  const [pageMessage, setPageMessage] = useState('Loading quiz...')
  const [quiz, setQuiz] = useState<RoadmapQuiz | null>(null)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [result, setResult] = useState<QuizResult | null>(null)
  const [quizError, setQuizError] = useState<string | null>(null)
  const [isStarting, setIsStarting] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    let active = true

    const load = async () => {
      if (!supabase) {
        if (active) {
          setPageState('error')
          setPageMessage('Supabase is not configured.')
        }
        return
      }

      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()

        if (userError || !user) {
          if (active) {
            setPageState('unauthorized')
            setPageMessage('You need to sign in to access this quiz.')
          }
          return
        }

        const loadedContext = await loadRoadmapTaskLearningContext({
          supabase,
          userId: user.id,
          taskId,
        })

        if (!loadedContext) {
          if (active) {
            setPageState('not_found')
            setPageMessage('Task not found or does not belong to your active roadmap.')
          }
          return
        }

        if (active) {
          setContext(loadedContext)
        }

        if (!loadedContext.task.quizRequired) {
          if (active) {
            setPageState('no_quiz')
            setPageMessage('This task does not require a quiz.')
          }
          return
        }

        if (!loadedContext.requiredResourcesComplete && !loadedContext.task.quizPassed) {
          if (active) {
            setPageState('locked')
            setPageMessage('Complete required learning resources before starting this quiz.')
          }
          return
        }

        if (active) {
          setPageState('ready')
        }

        await startQuiz(loadedContext)
      } catch (error) {
        if (active) {
          setPageState('error')
          setPageMessage(error instanceof Error ? error.message : 'Failed to load quiz page.')
        }
      }
    }

    const startQuiz = async (loadedContext: RoadmapTaskLearningContext) => {
      setIsStarting(true)
      setQuizError(null)
      setQuiz(null)

      try {
        const response = await fetch('/api/roadmap/quiz/start', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            taskId: loadedContext.task.id,
            title: loadedContext.task.title,
            description: loadedContext.task.description,
            focusSkills: loadedContext.task.focusSkills,
          }),
        })

        const data = await response.json().catch(() => null)
        if (!response.ok) {
          throw new Error(data?.error || 'Failed to start quiz.')
        }

        if (!active) return

        setQuiz({
          id: data.quiz.id,
          roadmapTaskId: data.quiz.roadmapTaskId,
          title: data.quiz.title,
          passingScore: data.quiz.passingScore,
          questionCount: data.quiz.questionCount,
          questions: data.quiz.questions ?? [],
        })

        setAnswers((data.latestAttempt?.answers as Record<string, string> | undefined) ?? {})
      } catch (error) {
        if (active) {
          setQuizError(error instanceof Error ? error.message : 'Failed to start quiz.')
        }
      } finally {
        if (active) {
          setIsStarting(false)
        }
      }
    }

    void load()

    return () => {
      active = false
    }
  }, [supabase, taskId])

  const answeredCount = quiz
    ? quiz.questions.filter((question) => Boolean(answers[question.id]?.trim())).length
    : 0

  const submitQuiz = async () => {
    if (!quiz || !context) return

    setIsSubmitting(true)
    setQuizError(null)

    try {
      const response = await fetch('/api/roadmap/quiz/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quizId: quiz.id,
          answers,
          resourcesComplete: context.requiredResourcesComplete,
          projectRequired: context.task.projectRequired || Boolean(context.task.miniProject),
          projectPassed: context.task.projectPassed,
        }),
      })

      const data = await response.json().catch(() => null)
      if (!response.ok) {
        throw new Error(data?.error || 'Failed to submit quiz.')
      }

      const resolvedResult = data as QuizResult
      setResult(resolvedResult)
      setContext((previous) => previous ? {
        ...previous,
        task: {
          ...previous.task,
          quizPassed: resolvedResult.passed,
          requirementState: resolvedResult.requirementState,
        },
      } : previous)
    } catch (error) {
      setQuizError(error instanceof Error ? error.message : 'Failed to submit quiz.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AppShell showBottomNav={true}>
      <GradientBackground />
      <div className="flex-1">
        <DashboardHeader
          icon={ClipboardCheck}
          iconColor="blue"
          title="Task Quiz"
          subtitle="Evaluate your understanding before moving to project work"
        />

        <Container className="py-6">
          <div className="mb-4">
            <Link href="/roadmap">
              <BrutalButton variant="outline" color="black" size="sm">
                <ArrowLeft className="h-4 w-4" />
                Back to Roadmap
              </BrutalButton>
            </Link>
          </div>

          {(pageState === 'loading' || isStarting) && (
            <BrutalCard color="white">
              <p className="font-medium">{pageMessage}</p>
            </BrutalCard>
          )}

          {(pageState === 'error' || pageState === 'unauthorized' || pageState === 'not_found' || pageState === 'no_quiz') && (
            <BrutalCard color="red" className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
              <p className="font-medium">{pageMessage}</p>
            </BrutalCard>
          )}

          {context && pageState === 'locked' && (
            <BrutalCard color="yellow" className="space-y-4">
              <div className="flex items-start gap-3">
                <Lock className="mt-0.5 h-5 w-5 shrink-0" />
                <div>
                  <p className="font-bold">{pageMessage}</p>
                  <p className="mt-1 text-sm text-black/70">
                    Finish required resources in roadmap task card, then return here.
                  </p>
                </div>
              </div>
              <div className="text-sm">
                <p className="font-bold">{context.task.weekTitle}</p>
                <p>{context.task.title}</p>
              </div>
            </BrutalCard>
          )}

          {context && pageState === 'ready' && (
            <div className="space-y-4">
              <BrutalCard color="blue">
                <p className="text-xs font-bold uppercase text-black/70">{context.task.weekTitle}</p>
                <h2 className="mt-1 font-display text-2xl font-bold">{context.task.title}</h2>
                <p className="mt-2 text-sm text-black/70">{context.task.description}</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-md border-2 border-black bg-white p-3 text-sm">
                    <p className="font-bold">Passing Score</p>
                    <p>{quiz?.passingScore ?? 80}%</p>
                  </div>
                  <div className="rounded-md border-2 border-black bg-white p-3 text-sm">
                    <p className="font-bold">Question Count</p>
                    <p>{quiz?.questions.length ?? 0}</p>
                  </div>
                  <div className="rounded-md border-2 border-black bg-white p-3 text-sm">
                    <p className="font-bold">Progress</p>
                    <p>{answeredCount}/{quiz?.questions.length ?? 0} answered</p>
                  </div>
                </div>
                {context.task.focusSkills.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {context.task.focusSkills.map((skill) => (
                      <SkillBadge key={skill} name={skill} size="sm" color="yellow" />
                    ))}
                  </div>
                )}
              </BrutalCard>

              {quizError && (
                <BrutalCard color="red" className="flex items-start gap-3">
                  <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                  <p className="font-medium">{quizError}</p>
                </BrutalCard>
              )}

              {quiz && (
                <BrutalCard color="white" className="space-y-4">
                  {quiz.questions.map((question, index) => (
                    <div key={question.id} className="rounded-md border-2 border-black bg-gray-50 p-3">
                      <p className="mb-1 text-xs font-bold uppercase text-gray-600">
                        Question {index + 1} of {quiz.questions.length}
                      </p>
                      <p className="mb-3 font-medium">{question.questionText}</p>
                      <div className="space-y-2">
                        {question.options.map((option) => (
                          <label key={option} className="flex cursor-pointer items-start gap-2 text-sm">
                            <input
                              type="radio"
                              name={`quiz-${question.id}`}
                              value={option}
                              checked={answers[question.id] === option}
                              onChange={(event) => {
                                const value = event.target.value
                                setAnswers((previous) => ({
                                  ...previous,
                                  [question.id]: value,
                                }))
                              }}
                            />
                            <span>{option}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}

                  <BrutalButton
                    color="black"
                    loading={isSubmitting}
                    disabled={isSubmitting || answeredCount === 0}
                    onClick={submitQuiz}
                  >
                    Submit Quiz
                  </BrutalButton>
                </BrutalCard>
              )}

              {result && (
                <BrutalCard color="green">
                  <p className="font-display text-2xl font-bold">
                    Score {result.score}% ({result.correctCount}/{result.totalQuestions})
                  </p>
                  <p className={cn('mt-1 font-bold', result.passed ? 'text-green-900' : 'text-red')}>
                    {result.passed ? 'Quiz passed' : 'Quiz failed. Retry is allowed.'}
                  </p>

                  {result.feedback.filter((item) => !item.isCorrect).length > 0 && (
                    <div className="mt-4 space-y-2">
                      {result.feedback
                        .filter((item) => !item.isCorrect)
                        .map((item) => (
                          <div key={item.questionId} className="rounded-md border-2 border-black bg-white p-3 text-sm">
                            <p className="font-bold">{item.questionText}</p>
                            <p>Selected: {item.selectedAnswer || 'No answer'}</p>
                            <p>Correct: {item.correctAnswer}</p>
                            <p className="text-gray-700">{item.explanation}</p>
                          </div>
                        ))}
                    </div>
                  )}

                  <div className="mt-4 flex flex-wrap gap-3">
                    <Link href="/roadmap">
                      <BrutalButton variant="outline" color="black">
                        Back to Roadmap
                      </BrutalButton>
                    </Link>
                    {result.passed && (context.task.projectRequired || Boolean(context.task.miniProject)) && (
                      <Link href={`/roadmap/tasks/${context.task.id}/project`}>
                        <BrutalButton color="black">
                          <CheckCircle2 className="h-4 w-4" />
                          Continue to Mini Project
                        </BrutalButton>
                      </Link>
                    )}
                  </div>
                </BrutalCard>
              )}
            </div>
          )}
        </Container>
      </div>
    </AppShell>
  )
}
