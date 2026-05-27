-- SkillPath auth role foundation
-- Adds role-based access for admin/user dashboards without changing existing user data.

DO $$
BEGIN
    CREATE TYPE public.app_role AS ENUM ('admin', 'user');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS role public.app_role NOT NULL DEFAULT 'user';

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

CREATE SCHEMA IF NOT EXISTS private;

CREATE OR REPLACE FUNCTION private.is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE id = auth.uid()
          AND role = 'admin'
    );
$$;

REVOKE ALL ON FUNCTION private.is_admin() FROM PUBLIC;
GRANT USAGE ON SCHEMA private TO authenticated;
GRANT EXECUTE ON FUNCTION private.is_admin() TO authenticated;

REVOKE UPDATE ON public.profiles FROM anon, authenticated;
GRANT UPDATE (
    full_name,
    target_role,
    current_level,
    goal,
    study_time,
    github_username,
    onboarding_completed,
    updated_at
) ON public.profiles TO authenticated;

DO $$
BEGIN
    CREATE POLICY "Admins can view all profiles" ON public.profiles
        FOR SELECT
        USING (private.is_admin());
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    CREATE POLICY "Admins can view all user skills" ON public.user_skills
        FOR SELECT
        USING (private.is_admin());
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    CREATE POLICY "Admins can view all saved jobs" ON public.saved_jobs
        FOR SELECT
        USING (private.is_admin());
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    CREATE POLICY "Admins can view all roadmaps" ON public.roadmaps
        FOR SELECT
        USING (private.is_admin());
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    CREATE POLICY "Admins can view all roadmap tasks" ON public.roadmap_tasks
        FOR SELECT
        USING (private.is_admin());
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    CREATE POLICY "Admins can view all weekly sprints" ON public.weekly_sprints
        FOR SELECT
        USING (private.is_admin());
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    CREATE POLICY "Admins can view all sprint tasks" ON public.sprint_tasks
        FOR SELECT
        USING (private.is_admin());
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    CREATE POLICY "Admins can view all AI job analyses" ON public.ai_job_analyses
        FOR SELECT
        USING (private.is_admin());
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    CREATE POLICY "Admins can view all activity logs" ON public.activity_logs
        FOR SELECT
        USING (private.is_admin());
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

COMMENT ON COLUMN public.profiles.role IS
    'SkillPath authorization role. Defaults to user. Promote admins manually through trusted SQL or a server-side service-role operation.';
