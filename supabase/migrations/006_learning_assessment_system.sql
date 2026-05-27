-- SkillPath learning assessment and project review persistence
-- Additive + idempotent migration.

-- ============================================
-- ROADMAP TASK REQUIREMENT STATE MACHINE FIELDS
-- ============================================

ALTER TABLE public.roadmap_tasks
    ADD COLUMN IF NOT EXISTS quiz_required BOOLEAN NOT NULL DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS quiz_passed BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS project_required BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS project_passed BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS requirement_state TEXT NOT NULL DEFAULT 'resources_pending'
        CHECK (requirement_state IN (
            'resources_pending',
            'resources_completed',
            'quiz_pending',
            'quiz_passed',
            'project_pending',
            'project_passed',
            'completed'
        ));

CREATE INDEX IF NOT EXISTS idx_roadmap_tasks_requirement_state
    ON public.roadmap_tasks(roadmap_id, requirement_state, week_number, task_order);

ALTER TABLE public.roadmaps
    ADD COLUMN IF NOT EXISTS final_project_passed BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS final_project_status TEXT NOT NULL DEFAULT 'pending'
        CHECK (final_project_status IN ('pending', 'submitted', 'passed', 'needs_revision', 'needs_review'));

-- ============================================
-- QUIZ TABLES
-- ============================================

CREATE TABLE IF NOT EXISTS public.roadmap_quizzes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    roadmap_task_id UUID NOT NULL REFERENCES public.roadmap_tasks(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    passing_score INTEGER NOT NULL DEFAULT 80 CHECK (passing_score >= 0 AND passing_score <= 100),
    question_count INTEGER NOT NULL DEFAULT 10 CHECK (question_count > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (roadmap_task_id)
);

CREATE TABLE IF NOT EXISTS public.roadmap_quiz_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quiz_id UUID NOT NULL REFERENCES public.roadmap_quizzes(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type TEXT NOT NULL DEFAULT 'multiple_choice' CHECK (question_type IN ('multiple_choice')),
    options JSONB NOT NULL,
    correct_answer TEXT NOT NULL,
    explanation TEXT,
    related_skill TEXT,
    difficulty TEXT NOT NULL DEFAULT 'easy' CHECK (difficulty IN ('easy', 'medium', 'hard')),
    position INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (quiz_id, position)
);

CREATE TABLE IF NOT EXISTS public.roadmap_quiz_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quiz_id UUID NOT NULL REFERENCES public.roadmap_quizzes(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
    total_questions INTEGER NOT NULL CHECK (total_questions > 0),
    correct_count INTEGER NOT NULL CHECK (correct_count >= 0),
    passed BOOLEAN NOT NULL,
    answers JSONB NOT NULL,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_roadmap_quizzes_task
    ON public.roadmap_quizzes(roadmap_task_id);

CREATE INDEX IF NOT EXISTS idx_roadmap_quiz_questions_quiz
    ON public.roadmap_quiz_questions(quiz_id, position);

CREATE INDEX IF NOT EXISTS idx_roadmap_quiz_attempts_user_quiz
    ON public.roadmap_quiz_attempts(user_id, quiz_id, submitted_at DESC);

-- ============================================
-- MINI/FINAL PROJECT SUBMISSION TABLES
-- ============================================

CREATE TABLE IF NOT EXISTS public.roadmap_project_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    roadmap_id UUID NOT NULL REFERENCES public.roadmaps(id) ON DELETE CASCADE,
    roadmap_task_id UUID REFERENCES public.roadmap_tasks(id) ON DELETE CASCADE,
    project_type TEXT NOT NULL CHECK (project_type IN ('mini_project', 'final_project')),
    repo_url TEXT NOT NULL,
    live_url TEXT,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'passed', 'needs_revision', 'needs_review')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.roadmap_project_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    submission_id UUID NOT NULL REFERENCES public.roadmap_project_submissions(id) ON DELETE CASCADE,
    reviewer TEXT NOT NULL DEFAULT 'gemini',
    score INTEGER CHECK (score >= 0 AND score <= 100),
    status TEXT NOT NULL CHECK (status IN ('submitted', 'passed', 'needs_revision', 'needs_review')),
    summary TEXT,
    strengths JSONB NOT NULL DEFAULT '[]'::JSONB,
    issues JSONB NOT NULL DEFAULT '[]'::JSONB,
    required_fixes JSONB NOT NULL DEFAULT '[]'::JSONB,
    suggestions JSONB NOT NULL DEFAULT '[]'::JSONB,
    raw_response JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_roadmap_project_submissions_user
    ON public.roadmap_project_submissions(user_id, roadmap_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_roadmap_project_submissions_task
    ON public.roadmap_project_submissions(roadmap_task_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_roadmap_project_reviews_submission
    ON public.roadmap_project_reviews(submission_id, created_at DESC);

DROP TRIGGER IF EXISTS roadmap_project_submissions_updated_at ON public.roadmap_project_submissions;
CREATE TRIGGER roadmap_project_submissions_updated_at
    BEFORE UPDATE ON public.roadmap_project_submissions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- RLS
-- ============================================

ALTER TABLE public.roadmap_quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roadmap_quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roadmap_quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roadmap_project_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roadmap_project_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own roadmap quizzes" ON public.roadmap_quizzes;
CREATE POLICY "Users can view own roadmap quizzes" ON public.roadmap_quizzes
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1
            FROM public.roadmap_tasks
            JOIN public.roadmaps ON roadmaps.id = roadmap_tasks.roadmap_id
            WHERE roadmap_tasks.id = roadmap_quizzes.roadmap_task_id
              AND roadmaps.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can view own roadmap quiz questions" ON public.roadmap_quiz_questions;
CREATE POLICY "Users can view own roadmap quiz questions" ON public.roadmap_quiz_questions
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1
            FROM public.roadmap_quizzes
            JOIN public.roadmap_tasks ON roadmap_tasks.id = roadmap_quizzes.roadmap_task_id
            JOIN public.roadmaps ON roadmaps.id = roadmap_tasks.roadmap_id
            WHERE roadmap_quizzes.id = roadmap_quiz_questions.quiz_id
              AND roadmaps.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can view own roadmap quiz attempts" ON public.roadmap_quiz_attempts;
CREATE POLICY "Users can view own roadmap quiz attempts" ON public.roadmap_quiz_attempts
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own roadmap quiz attempts" ON public.roadmap_quiz_attempts;
CREATE POLICY "Users can insert own roadmap quiz attempts" ON public.roadmap_quiz_attempts
    FOR INSERT
    TO authenticated
    WITH CHECK (
        user_id = auth.uid()
        AND EXISTS (
            SELECT 1
            FROM public.roadmap_quizzes
            JOIN public.roadmap_tasks ON roadmap_tasks.id = roadmap_quizzes.roadmap_task_id
            JOIN public.roadmaps ON roadmaps.id = roadmap_tasks.roadmap_id
            WHERE roadmap_quizzes.id = roadmap_quiz_attempts.quiz_id
              AND roadmaps.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can view own project submissions" ON public.roadmap_project_submissions;
CREATE POLICY "Users can view own project submissions" ON public.roadmap_project_submissions
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own project submissions" ON public.roadmap_project_submissions;
CREATE POLICY "Users can insert own project submissions" ON public.roadmap_project_submissions
    FOR INSERT
    TO authenticated
    WITH CHECK (
        user_id = auth.uid()
        AND EXISTS (
            SELECT 1
            FROM public.roadmaps
            WHERE roadmaps.id = roadmap_project_submissions.roadmap_id
              AND roadmaps.user_id = auth.uid()
        )
        AND (
            roadmap_task_id IS NULL
            OR EXISTS (
                SELECT 1
                FROM public.roadmap_tasks
                JOIN public.roadmaps ON roadmaps.id = roadmap_tasks.roadmap_id
                WHERE roadmap_tasks.id = roadmap_project_submissions.roadmap_task_id
                  AND roadmaps.user_id = auth.uid()
            )
        )
    );

DROP POLICY IF EXISTS "Users can update own project submissions" ON public.roadmap_project_submissions;
CREATE POLICY "Users can update own project submissions" ON public.roadmap_project_submissions
    FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can view own project reviews" ON public.roadmap_project_reviews;
CREATE POLICY "Users can view own project reviews" ON public.roadmap_project_reviews
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1
            FROM public.roadmap_project_submissions
            WHERE roadmap_project_submissions.id = roadmap_project_reviews.submission_id
              AND roadmap_project_submissions.user_id = auth.uid()
        )
    );

GRANT SELECT ON public.roadmap_quizzes TO authenticated;
GRANT SELECT ON public.roadmap_quiz_questions TO authenticated;
GRANT SELECT, INSERT ON public.roadmap_quiz_attempts TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.roadmap_project_submissions TO authenticated;
GRANT SELECT ON public.roadmap_project_reviews TO authenticated;

COMMENT ON TABLE public.roadmap_quizzes IS
    'Generated quiz metadata per roadmap task.';

COMMENT ON TABLE public.roadmap_quiz_questions IS
    'Curated deterministic multiple-choice questions. Correct answers are evaluated server-side.';

COMMENT ON TABLE public.roadmap_quiz_attempts IS
    'Immutable attempt history per user and quiz.';

COMMENT ON TABLE public.roadmap_project_submissions IS
    'Mini and final project submissions by learners.';

COMMENT ON TABLE public.roadmap_project_reviews IS
    'Rule-based and optional AI review outputs for roadmap project submissions.';
