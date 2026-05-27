-- SkillPath roadmap resources and durable job persistence hardening
-- Additive migration. Rollback for local development can drop the new
-- roadmap resource tables, added columns, policies, and indexes after app code
-- no longer depends on them.

-- ============================================
-- JOB SOURCE AND JOB POST HARDENING
-- ============================================

INSERT INTO public.job_sources (name, slug, type, region, base_url, attribution_label, attribution_url)
VALUES
    ('Adzuna', 'adzuna', 'api', 'global', 'https://www.adzuna.com', 'Adzuna', 'https://www.adzuna.com')
ON CONFLICT (slug) DO NOTHING;

ALTER TABLE public.job_posts
    ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMPTZ DEFAULT NOW();

CREATE UNIQUE INDEX IF NOT EXISTS idx_job_posts_source_external
    ON public.job_posts(source_slug, external_id)
    WHERE external_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_job_posts_freshness
    ON public.job_posts(moderation_status, published_at DESC, fetched_at DESC);

CREATE INDEX IF NOT EXISTS idx_job_posts_last_seen
    ON public.job_posts(last_seen_at DESC);

ALTER TABLE public.job_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_ingestion_runs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view enabled job sources" ON public.job_sources;
CREATE POLICY "Public can view enabled job sources" ON public.job_sources
    FOR SELECT
    TO anon, authenticated
    USING (enabled = TRUE);

DROP POLICY IF EXISTS "Public can view fresh visible job posts" ON public.job_posts;
CREATE POLICY "Public can view fresh visible job posts" ON public.job_posts
    FOR SELECT
    TO anon, authenticated
    USING (
        moderation_status IN ('approved', 'pending_review')
        AND (expires_at IS NULL OR expires_at > NOW())
        AND (
            (published_at IS NOT NULL AND published_at >= NOW() - INTERVAL '90 days')
            OR (published_at IS NULL AND fetched_at >= NOW() - INTERVAL '90 days')
        )
    );

DROP POLICY IF EXISTS "Admins can view job ingestion runs" ON public.job_ingestion_runs;
CREATE POLICY "Admins can view job ingestion runs" ON public.job_ingestion_runs
    FOR SELECT
    TO authenticated
    USING (private.is_admin());

GRANT SELECT ON public.job_sources TO anon, authenticated;
GRANT SELECT ON public.job_posts TO anon, authenticated;

-- ============================================
-- ROADMAP PERSISTENCE AND LEARNING RESOURCES
-- ============================================

ALTER TABLE public.roadmaps
    ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS context JSONB DEFAULT '{}'::JSONB;

CREATE INDEX IF NOT EXISTS idx_roadmaps_user_active_created
    ON public.roadmaps(user_id, is_active, created_at DESC);

ALTER TABLE public.roadmap_tasks
    ADD COLUMN IF NOT EXISTS task_key TEXT,
    ADD COLUMN IF NOT EXISTS task_order INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS week_title TEXT,
    ADD COLUMN IF NOT EXISTS week_goal TEXT,
    ADD COLUMN IF NOT EXISTS focus_skills TEXT[] DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS mini_project JSONB,
    ADD COLUMN IF NOT EXISTS mini_exercise_completed BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS deliverable_completed BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_roadmap_tasks_order
    ON public.roadmap_tasks(roadmap_id, week_number, task_order);

DROP TRIGGER IF EXISTS roadmap_tasks_updated_at ON public.roadmap_tasks;
CREATE TRIGGER roadmap_tasks_updated_at
    BEFORE UPDATE ON public.roadmap_tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.roadmap_resources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    roadmap_task_id UUID NOT NULL REFERENCES public.roadmap_tasks(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    resource_type TEXT NOT NULL CHECK (resource_type IN ('youtube', 'article', 'docs', 'project', 'quiz')),
    url TEXT NOT NULL,
    provider TEXT NOT NULL,
    estimated_minutes INTEGER NOT NULL DEFAULT 30 CHECK (estimated_minutes > 0),
    is_required BOOLEAN NOT NULL DEFAULT TRUE,
    completion_rule TEXT NOT NULL DEFAULT 'manual_mark_complete',
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_roadmap_resources_task_order
    ON public.roadmap_resources(roadmap_task_id, sort_order);

CREATE TABLE IF NOT EXISTS public.roadmap_resource_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    resource_id UUID NOT NULL REFERENCES public.roadmap_resources(id) ON DELETE CASCADE,
    watched_seconds INTEGER NOT NULL DEFAULT 0 CHECK (watched_seconds >= 0),
    duration_seconds INTEGER CHECK (duration_seconds IS NULL OR duration_seconds >= 0),
    completion_percentage NUMERIC(5,2) NOT NULL DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    completed_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, resource_id)
);

CREATE INDEX IF NOT EXISTS idx_roadmap_resource_progress_user
    ON public.roadmap_resource_progress(user_id, updated_at DESC);

DROP TRIGGER IF EXISTS roadmap_resource_progress_updated_at ON public.roadmap_resource_progress;
CREATE TRIGGER roadmap_resource_progress_updated_at
    BEFORE UPDATE ON public.roadmap_resource_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE public.roadmap_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roadmap_resource_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own roadmap resources" ON public.roadmap_resources;
CREATE POLICY "Users can view own roadmap resources" ON public.roadmap_resources
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1
            FROM public.roadmap_tasks
            JOIN public.roadmaps ON roadmaps.id = roadmap_tasks.roadmap_id
            WHERE roadmap_tasks.id = roadmap_resources.roadmap_task_id
              AND roadmaps.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can insert own roadmap resources" ON public.roadmap_resources;
CREATE POLICY "Users can insert own roadmap resources" ON public.roadmap_resources
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM public.roadmap_tasks
            JOIN public.roadmaps ON roadmaps.id = roadmap_tasks.roadmap_id
            WHERE roadmap_tasks.id = roadmap_resources.roadmap_task_id
              AND roadmaps.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can update own roadmap resources" ON public.roadmap_resources;
CREATE POLICY "Users can update own roadmap resources" ON public.roadmap_resources
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1
            FROM public.roadmap_tasks
            JOIN public.roadmaps ON roadmaps.id = roadmap_tasks.roadmap_id
            WHERE roadmap_tasks.id = roadmap_resources.roadmap_task_id
              AND roadmaps.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM public.roadmap_tasks
            JOIN public.roadmaps ON roadmaps.id = roadmap_tasks.roadmap_id
            WHERE roadmap_tasks.id = roadmap_resources.roadmap_task_id
              AND roadmaps.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can delete own roadmap resources" ON public.roadmap_resources;
CREATE POLICY "Users can delete own roadmap resources" ON public.roadmap_resources
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1
            FROM public.roadmap_tasks
            JOIN public.roadmaps ON roadmaps.id = roadmap_tasks.roadmap_id
            WHERE roadmap_tasks.id = roadmap_resources.roadmap_task_id
              AND roadmaps.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can view own resource progress" ON public.roadmap_resource_progress;
CREATE POLICY "Users can view own resource progress" ON public.roadmap_resource_progress
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own resource progress" ON public.roadmap_resource_progress;
CREATE POLICY "Users can insert own resource progress" ON public.roadmap_resource_progress
    FOR INSERT
    TO authenticated
    WITH CHECK (
        user_id = auth.uid()
        AND EXISTS (
            SELECT 1
            FROM public.roadmap_resources
            JOIN public.roadmap_tasks ON roadmap_tasks.id = roadmap_resources.roadmap_task_id
            JOIN public.roadmaps ON roadmaps.id = roadmap_tasks.roadmap_id
            WHERE roadmap_resources.id = roadmap_resource_progress.resource_id
              AND roadmaps.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can update own resource progress" ON public.roadmap_resource_progress;
CREATE POLICY "Users can update own resource progress" ON public.roadmap_resource_progress
    FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (
        user_id = auth.uid()
        AND EXISTS (
            SELECT 1
            FROM public.roadmap_resources
            JOIN public.roadmap_tasks ON roadmap_tasks.id = roadmap_resources.roadmap_task_id
            JOIN public.roadmaps ON roadmaps.id = roadmap_tasks.roadmap_id
            WHERE roadmap_resources.id = roadmap_resource_progress.resource_id
              AND roadmaps.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can delete own resource progress" ON public.roadmap_resource_progress;
CREATE POLICY "Users can delete own resource progress" ON public.roadmap_resource_progress
    FOR DELETE
    TO authenticated
    USING (user_id = auth.uid());

GRANT SELECT, INSERT, UPDATE, DELETE ON public.roadmap_resources TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.roadmap_resource_progress TO authenticated;

-- ============================================
-- AI JOB ANALYSIS CACHE FIELDS
-- ============================================

ALTER TABLE public.ai_job_analyses
    ADD COLUMN IF NOT EXISTS suggested_skills TEXT[] DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS comparison_notes TEXT,
    ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'ai',
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

DROP TRIGGER IF EXISTS ai_job_analyses_updated_at ON public.ai_job_analyses;
CREATE TRIGGER ai_job_analyses_updated_at
    BEFORE UPDATE ON public.ai_job_analyses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE public.roadmap_resources IS
    'Curated learning resources attached to roadmap tasks. Completion may be manual unless a provider-specific tracker is implemented.';

COMMENT ON TABLE public.roadmap_resource_progress IS
    'Per-user learning resource progress. YouTube watch fields are only authoritative when player tracking is implemented.';
