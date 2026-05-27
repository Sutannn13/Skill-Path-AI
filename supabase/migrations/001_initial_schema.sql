-- SkillPath Database Schema
-- Migration: Initial schema for profiles, skills, jobs, roadmaps, sprints, and analytics

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PROFILES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    target_role TEXT,
    current_level TEXT,
    goal TEXT,
    study_time TEXT,
    github_username TEXT,
    onboarding_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- USER SKILLS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS user_skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    skill_slug TEXT NOT NULL,
    level INTEGER CHECK (level >= 0 AND level <= 4),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, skill_slug)
);

-- ============================================
-- JOB SOURCES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS job_sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    type TEXT,
    region TEXT,
    base_url TEXT,
    attribution_label TEXT,
    attribution_url TEXT,
    enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed default job sources
INSERT INTO job_sources (name, slug, type, region, base_url, attribution_label, attribution_url)
VALUES
    ('Remotive', 'remotive', 'api', 'global', 'https://remotive.com', 'Remotive', 'https://remotive.com'),
    ('Arbeitnow', 'arbeitnow', 'api', 'global', 'https://arbeitnow.com', 'Arbeitnow', 'https://arbeitnow.com'),
    ('Jobicy', 'jobicy', 'api', 'global', 'https://jobicy.com', 'Jobicy', 'https://jobicy.com'),
    ('Indonesia Sample', 'indonesia-sample', 'api', 'indonesia', '', 'Sample Data', '#')
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- JOB POSTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS job_posts (
    id TEXT PRIMARY KEY,
    source_slug TEXT REFERENCES job_sources(slug),
    external_id TEXT,
    title TEXT NOT NULL,
    company TEXT,
    company_domain TEXT,
    location TEXT,
    country TEXT,
    region_type TEXT DEFAULT 'international',
    work_mode TEXT DEFAULT 'remote',
    employment_type TEXT DEFAULT 'full-time',
    experience_level TEXT DEFAULT 'junior',
    description TEXT,
    apply_url TEXT,
    source_url TEXT,
    tags TEXT[],
    required_skills TEXT[],
    salary_min NUMERIC,
    salary_max NUMERIC,
    currency TEXT,
    published_at TIMESTAMPTZ,
    fetched_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    validity_score INTEGER DEFAULT 50,
    risk_level TEXT DEFAULT 'medium',
    moderation_status TEXT DEFAULT 'pending_review',
    moderation_reasons TEXT[],
    raw_payload JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for common queries
CREATE INDEX IF NOT EXISTS idx_job_posts_source ON job_posts(source_slug);
CREATE INDEX IF NOT EXISTS idx_job_posts_region ON job_posts(region_type);
CREATE INDEX IF NOT EXISTS idx_job_posts_moderation ON job_posts(moderation_status);
CREATE INDEX IF NOT EXISTS idx_job_posts_validity ON job_posts(validity_score);

-- ============================================
-- SAVED JOBS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS saved_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    job_id TEXT REFERENCES job_posts(id) ON DELETE CASCADE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, job_id)
);

-- ============================================
-- ROADMAPS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS roadmaps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    job_id TEXT,
    title TEXT NOT NULL,
    summary TEXT,
    duration_weeks INTEGER,
    source TEXT DEFAULT 'fallback',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER roadmaps_updated_at
    BEFORE UPDATE ON roadmaps
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROADMAP TASKS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS roadmap_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    roadmap_id UUID REFERENCES roadmaps(id) ON DELETE CASCADE,
    week_number INTEGER,
    title TEXT NOT NULL,
    description TEXT,
    skill_related TEXT[],
    difficulty TEXT DEFAULT 'medium',
    estimated_time TEXT,
    deliverable TEXT,
    status TEXT DEFAULT 'todo',
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- WEEKLY SPRINTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS weekly_sprints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    week_start DATE,
    goal TEXT,
    focus_skills TEXT[],
    reflection TEXT,
    progress NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER weekly_sprints_updated_at
    BEFORE UPDATE ON weekly_sprints
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SPRINT TASKS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS sprint_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sprint_id UUID REFERENCES weekly_sprints(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    day_label TEXT,
    status TEXT DEFAULT 'todo',
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- JOB INGESTION RUNS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS job_ingestion_runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_slug TEXT,
    status TEXT,
    fetched_count INTEGER DEFAULT 0,
    inserted_count INTEGER DEFAULT 0,
    updated_count INTEGER DEFAULT 0,
    rejected_count INTEGER DEFAULT 0,
    error_message TEXT,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    finished_at TIMESTAMPTZ
);

-- ============================================
-- AI JOB ANALYSES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS ai_job_analyses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id TEXT REFERENCES job_posts(id) ON DELETE CASCADE,
    model TEXT,
    summary TEXT,
    validity_explanation TEXT,
    skill_gap_explanation TEXT,
    risk_assessment JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(job_id, model)
);

-- ============================================
-- ACTIVITY LOGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    entity_type TEXT,
    entity_id TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for user activity queries
CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON activity_logs(created_at DESC);

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE roadmaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE roadmap_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_sprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE sprint_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_job_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can only see/edit their own profile
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- User skills: Users can only see/edit their own skills
CREATE POLICY "Users can view own skills" ON user_skills
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own skills" ON user_skills
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own skills" ON user_skills
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own skills" ON user_skills
    FOR DELETE USING (auth.uid() = user_id);

-- Saved jobs: Users can only see/edit their own saved jobs
CREATE POLICY "Users can view own saved jobs" ON saved_jobs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own saved jobs" ON saved_jobs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved jobs" ON saved_jobs
    FOR DELETE USING (auth.uid() = user_id);

-- Roadmaps: Users can only see/edit their own roadmaps
CREATE POLICY "Users can view own roadmaps" ON roadmaps
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own roadmaps" ON roadmaps
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own roadmaps" ON roadmaps
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own roadmaps" ON roadmaps
    FOR DELETE USING (auth.uid() = user_id);

-- Roadmap tasks
CREATE POLICY "Users can view own roadmap tasks" ON roadmap_tasks
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM roadmaps WHERE roadmaps.id = roadmap_tasks.roadmap_id AND roadmaps.user_id = auth.uid())
    );

CREATE POLICY "Users can insert own roadmap tasks" ON roadmap_tasks
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM roadmaps WHERE roadmaps.id = roadmap_tasks.roadmap_id AND roadmaps.user_id = auth.uid())
    );

CREATE POLICY "Users can update own roadmap tasks" ON roadmap_tasks
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM roadmaps WHERE roadmaps.id = roadmap_tasks.roadmap_id AND roadmaps.user_id = auth.uid())
    );

CREATE POLICY "Users can delete own roadmap tasks" ON roadmap_tasks
    FOR DELETE USING (
        EXISTS (SELECT 1 FROM roadmaps WHERE roadmaps.id = roadmap_tasks.roadmap_id AND roadmaps.user_id = auth.uid())
    );

-- Weekly sprints
CREATE POLICY "Users can view own sprints" ON weekly_sprints
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sprints" ON weekly_sprints
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sprints" ON weekly_sprints
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sprints" ON weekly_sprints
    FOR DELETE USING (auth.uid() = user_id);

-- Sprint tasks
CREATE POLICY "Users can view own sprint tasks" ON sprint_tasks
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM weekly_sprints WHERE weekly_sprints.id = sprint_tasks.sprint_id AND weekly_sprints.user_id = auth.uid())
    );

CREATE POLICY "Users can insert own sprint tasks" ON sprint_tasks
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM weekly_sprints WHERE weekly_sprints.id = sprint_tasks.sprint_id AND weekly_sprints.user_id = auth.uid())
    );

CREATE POLICY "Users can update own sprint tasks" ON sprint_tasks
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM weekly_sprints WHERE weekly_sprints.id = sprint_tasks.sprint_id AND weekly_sprints.user_id = auth.uid())
    );

CREATE POLICY "Users can delete own sprint tasks" ON sprint_tasks
    FOR DELETE USING (
        EXISTS (SELECT 1 FROM weekly_sprints WHERE weekly_sprints.id = sprint_tasks.sprint_id AND weekly_sprints.user_id = auth.uid())
    );

-- Activity logs
CREATE POLICY "Users can view own activity" ON activity_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own activity" ON activity_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Public read for job posts (with moderation filter applied in queries)
-- No RLS needed for job_posts as they're public data

-- ============================================
-- TRIGGER FOR AUTO-CREATING PROFILE
-- ============================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id)
    VALUES (NEW.id)
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();