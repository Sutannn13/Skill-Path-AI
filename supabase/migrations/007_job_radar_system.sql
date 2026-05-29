-- SkillPath Job Radar System
-- Migration: Raw jobs table, enhanced AI analysis, and job ingestion pipeline
-- This enables real AI-assisted job discovery with proper source tracking

-- ============================================
-- RAW JOBS TABLE (Stage 1 of pipeline)
-- Stores pre-normalization raw job data from sources
-- ============================================
CREATE TABLE IF NOT EXISTS raw_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_slug TEXT NOT NULL,
    external_id TEXT NOT NULL,
    title TEXT NOT NULL,
    company TEXT,
    location TEXT,
    country TEXT,
    description TEXT,
    apply_url TEXT,
    source_url TEXT,
    tags TEXT[],
    required_skills TEXT[],
    salary_text TEXT,
    job_type TEXT,
    work_mode TEXT,
    experience_level TEXT,
    region_type TEXT,
    published_at TIMESTAMPTZ,
    fetched_at TIMESTAMPTZ DEFAULT NOW(),
    raw_payload JSONB,
    hash TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(source_slug, external_id)
);

CREATE INDEX IF NOT EXISTS idx_raw_jobs_source ON raw_jobs(source_slug);
CREATE INDEX IF NOT EXISTS idx_raw_jobs_hash ON raw_jobs(hash);
CREATE INDEX IF NOT EXISTS idx_raw_jobs_fetched ON raw_jobs(fetched_at DESC);
CREATE INDEX IF NOT EXISTS idx_raw_jobs_external ON raw_jobs(source_slug, external_id);

COMMENT ON TABLE raw_jobs IS 'Raw job data from external sources before normalization and AI analysis.';

-- ============================================
-- ENHANCED AI JOB ANALYSES TABLE (Stage 3 of pipeline)
-- Stores Gemini classification output
-- ============================================
ALTER TABLE ai_job_analyses
    DROP COLUMN IF EXISTS validity_explanation,
    DROP COLUMN IF EXISTS skill_gap_explanation,
    DROP COLUMN IF EXISTS risk_assessment;

ALTER TABLE ai_job_analyses
    ADD COLUMN IF NOT EXISTS normalized_title TEXT,
    ADD COLUMN IF NOT EXISTS category TEXT,
    ADD COLUMN IF NOT EXISTS role TEXT,
    ADD COLUMN IF NOT EXISTS level TEXT CHECK (level IN ('intern', 'freshgraduate', 'junior', 'mid', 'senior')),
    ADD COLUMN IF NOT EXISTS work_mode TEXT,
    ADD COLUMN IF NOT EXISTS employment_type TEXT,
    ADD COLUMN IF NOT EXISTS country_scope TEXT,
    ADD COLUMN IF NOT EXISTS tech_stacks TEXT[],
    ADD COLUMN IF NOT EXISTS requirements TEXT[],
    ADD COLUMN IF NOT EXISTS summary TEXT,
    ADD COLUMN IF NOT EXISTS is_beginner_friendly BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS is_fresh_graduate_friendly BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS match_score INTEGER,
    ADD COLUMN IF NOT EXISTS match_reason TEXT,
    ADD COLUMN IF NOT EXISTS skill_gaps TEXT[],
    ADD COLUMN IF NOT EXISTS red_flags TEXT[],
    ADD COLUMN IF NOT EXISTS confidence INTEGER CHECK (confidence >= 0 AND confidence <= 100),
    ADD COLUMN IF NOT EXISTS ai_status TEXT DEFAULT 'pending' CHECK (ai_status IN ('pending', 'analyzed', 'failed', 'fallback')),
    ADD COLUMN IF NOT EXISTS fallback_category TEXT,
    ADD COLUMN IF NOT EXISTS fallback_role TEXT,
    ADD COLUMN IF NOT EXISTS fallback_level TEXT,
    ADD COLUMN IF NOT EXISTS fallback_country_scope TEXT,
    ADD COLUMN IF NOT EXISTS fallback_work_mode TEXT,
    ADD COLUMN IF NOT EXISTS fallback_employment_type TEXT,
    ADD COLUMN IF NOT EXISTS fallback_tech_stacks TEXT[],
    ADD COLUMN IF NOT EXISTS fallback_match_score INTEGER,
    ADD COLUMN IF NOT EXISTS fallback_match_reason TEXT,
    ADD COLUMN IF NOT EXISTS fallback_confidence INTEGER,
    ADD COLUMN IF NOT EXISTS analyzed_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS raw_analysis JSONB,
    ADD COLUMN IF NOT EXISTS api_error TEXT,
    ADD COLUMN IF NOT EXISTS quota_exceeded BOOLEAN DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_ai_job_analyses_job ON ai_job_analyses(job_id);
CREATE INDEX IF NOT EXISTS idx_ai_job_analyses_status ON ai_job_analyses(ai_status);
CREATE INDEX IF NOT EXISTS idx_ai_job_analyses_level ON ai_job_analyses(level);
CREATE INDEX IF NOT EXISTS idx_ai_job_analyses_category ON ai_job_analyses(category);
CREATE INDEX IF NOT EXISTS idx_ai_job_analyses_confidence ON ai_job_analyses(confidence);

-- ============================================
-- UPDATED JOB POSTS TABLE
-- Add AI-analyzed fields with fallback support
-- ============================================
ALTER TABLE job_posts
    ADD COLUMN IF NOT EXISTS category TEXT,
    ADD COLUMN IF NOT EXISTS role TEXT,
    ADD COLUMN IF NOT EXISTS ai_status TEXT DEFAULT 'pending' CHECK (ai_status IN ('pending', 'analyzed', 'failed', 'fallback')),
    ADD COLUMN IF NOT EXISTS ai_confidence INTEGER,
    ADD COLUMN IF NOT EXISTS ai_match_score INTEGER,
    ADD COLUMN IF NOT EXISTS ai_match_reason TEXT,
    ADD COLUMN IF NOT EXISTS ai_summary TEXT,
    ADD COLUMN IF NOT EXISTS ai_skill_gaps TEXT[],
    ADD COLUMN IF NOT EXISTS ai_red_flags TEXT[],
    ADD COLUMN IF NOT EXISTS ai_beginner_friendly BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS ai_fresh_graduate_friendly BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS ai_tech_stacks TEXT[],
    ADD COLUMN IF NOT EXISTS ai_analyzed_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_job_posts_ai_status ON job_posts(ai_status);
CREATE INDEX IF NOT EXISTS idx_job_posts_category ON job_posts(category);
CREATE INDEX IF NOT EXISTS idx_job_posts_role ON job_posts(role);
CREATE INDEX IF NOT EXISTS idx_job_posts_ai_match ON job_posts(ai_match_score);
CREATE INDEX IF NOT EXISTS idx_job_posts_beginner ON job_posts(ai_beginner_friendly);

-- ============================================
-- JOB INGESTION QUEUE TABLE
-- Track jobs pending AI analysis
-- ============================================
CREATE TABLE IF NOT EXISTS job_analysis_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id TEXT NOT NULL REFERENCES job_posts(id) ON DELETE CASCADE,
    priority INTEGER DEFAULT 0,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    processed_at TIMESTAMPTZ,
    UNIQUE(job_id)
);

CREATE INDEX IF NOT EXISTS idx_job_analysis_queue_status ON job_analysis_queue(status, priority DESC);

-- ============================================
-- DEDUP INDEX for cross-source job deduplication
-- ============================================
CREATE INDEX IF NOT EXISTS idx_job_posts_dedup
    ON job_posts(lower(company), lower(title), lower(location))
    WHERE apply_url IS NOT NULL;

-- ============================================
-- TRIGGER FOR AUTO-UPDATING job_analysis_queue updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_job_analysis_queue_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS job_analysis_queue_updated_at ON job_analysis_queue;
CREATE TRIGGER job_analysis_queue_updated_at
    BEFORE UPDATE ON job_analysis_queue
    FOR EACH ROW
    EXECUTE FUNCTION update_job_analysis_queue_timestamp();
