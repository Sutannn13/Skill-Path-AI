-- Migration 008: Quiz Answer Security (Column-Level Privileges)
-- Prevents authenticated users from directly querying correct_answer
-- from roadmap_quiz_questions via the Supabase client.

-- Step 1: Revoke broad SELECT access on the table from anon and authenticated roles
REVOKE SELECT ON public.roadmap_quiz_questions FROM anon, authenticated;

-- Step 2: Grant SELECT ONLY on the safe columns to authenticated users
GRANT SELECT (
    id,
    quiz_id,
    question_text,
    question_type,
    options,
    explanation,
    related_skill,
    difficulty,
    position,
    created_at
) ON public.roadmap_quiz_questions TO authenticated;

-- Step 3: Ensure the service_role (admin client) retains full access
-- service_role needs access to correct_answer for grading purposes.
GRANT ALL ON public.roadmap_quiz_questions TO service_role;

-- Note: The existing RLS policy "Users can view own roadmap quiz questions"
-- remains active. It will now apply row-level filtering, while the above
-- GRANT applies column-level restriction (excluding correct_answer).
-- If we previously dropped the policy in a view-based approach, re-create it:
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'roadmap_quiz_questions' 
        AND policyname = 'Users can view own roadmap quiz questions'
    ) THEN
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
    END IF;
END
$$;
