# Job Radar API Documentation

## Overview
Job Radar is an AI-assisted job discovery system that scrapes real jobs from external sources, analyzes them with Gemini AI, and presents them with intelligent classification and match scoring.

**Key principle: Gemini NEVER creates fake jobs. Every job must have a valid applyUrl/sourceUrl from a real source.**

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│ Job Sources │────▶│ raw_jobs    │────▶│ job_posts  │
│ (APIs)     │     │ (Stage 1)   │     │ (Stage 2)  │
└─────────────┘     └──────────────┘     └─────────────┘
                                            │
                                            ▼
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│ UI / User   │◀────│ API Gateway │◀────│ AI Analysis│
│             │     │             │     │ (Stage 3)  │
└─────────────┘     └──────────────┘     └─────────────┘
```

## API Endpoints

### GET /api/jobs
List jobs with filtering, sorting, and pagination.

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number (1-indexed) |
| `limit` | number | 10 | Items per page (max 50) |
| `sort` | string | newest | Sort order: `newest`, `best_match`, `highest_salary`, `beginner_friendly` |
| `keyword` | string | - | Search in title, company, description, skills |
| `role` | string | all | Filter by job role (e.g., "Backend Developer") |
| `category` | string | all | Filter by category (e.g., "Backend Development") |
| `countryScope` | string | all | `indonesia`, `international` |
| `workMode` | string | all | `remote`, `hybrid`, `onsite` |
| `employmentType` | string | all | `internship`, `full-time`, `part-time`, `contract`, `freelance` |
| `level` | string | all | `internship`, `freshgraduate`, `junior`, `mid`, `senior` |
| `techStack` | string | all | `frontend`, `backend`, `fullstack`, `mobile`, `ui-ux`, `data` |
| `beginnerFriendly` | boolean | - | Filter beginner-friendly jobs only |
| `minMatchScore` | number | - | Minimum AI match score (0-100) |
| `type` | string | all | Alias for `employmentType` (backward compatible) |

**Example Response:**
```json
{
  "jobs": [...],
  "page": 1,
  "limit": 10,
  "totalJobs": 39,
  "totalPages": 4,
  "hasNextPage": true,
  "hasPrevPage": false,
  "meta": {
    "source": "mixed",
    "sort": "newest",
    "filters": {...}
  }
}
```

### GET /api/jobs?id={jobId}
Get a single job by ID.

### GET /api/jobs/ingest
Check available job sources.

### POST /api/jobs/ingest
Trigger job ingestion from all sources with optional AI analysis.

**Query Parameters:**
- `source` - Optional: specific source slug to ingest
- `analyze` - Default `true`: run AI analysis on new jobs

## Running the Migration

Run the following SQL in Supabase SQL Editor:

```sql
-- File: supabase/migrations/007_job_radar_system.sql
-- Or copy-paste the contents directly

-- This migration:
-- 1. Creates raw_jobs table
-- 2. Adds AI columns to job_posts and ai_job_analyses
-- 3. Creates job_analysis_queue table
-- 4. Creates necessary indexes
-- 5. Is idempotent (safe to run multiple times)
```

## Testing the API

```bash
# Start the development server
npm run dev

# Or production build
npm run build && npm start

# Test endpoints
curl "http://localhost:3000/api/jobs?page=1&limit=10"
curl "http://localhost:3000/api/jobs?employmentType=internship&workMode=remote"
curl "http://localhost:3000/api/jobs?sort=beginner_friendly&minMatchScore=70"
```

## How Gemini Analysis Works

1. **When a job is ingested**, it goes through the pipeline:
   - Raw data is saved to `raw_jobs` table
   - Normalized and deduplicated
   - Saved to `job_posts` table

2. **AI Analysis is triggered** via `/api/jobs/ingest?analyze=true`:
   - Jobs are queued in `job_analysis_queue`
   - Each job is analyzed by Gemini
   - Results are saved to `ai_job_analyses` and `job_posts`

3. **Gemini only analyzes, never creates:**
   - Every job MUST have a valid `apply_url` or `source_url`
   - Jobs without valid URLs are rejected
   - Gemini classifies the job based on existing data

4. **Fallback system:**
   - If Gemini fails or quota is exceeded
   - Keyword-based classifier is used
   - Job remains visible with `ai_status = 'fallback'`

## AI Classification Output

```json
{
  "normalizedTitle": "Backend Developer",
  "category": "Backend Development",
  "role": "Backend Developer",
  "level": "junior",
  "workMode": "remote",
  "employmentType": "full-time",
  "countryScope": "indonesia",
  "techStacks": ["Node.js", "Express", "PostgreSQL"],
  "isBeginnerFriendly": true,
  "isFreshGraduateFriendly": true,
  "matchScore": 85,
  "matchReason": "Good fit for junior developers",
  "skillGaps": ["Docker", "Redis"],
  "redFlags": [],
  "confidence": 92
}
```

## Supported Job Sources

| Source | Region | Type |
|--------|--------|------|
| Remotive | Global | API |
| Arbeitnow | Global | API |
| Jobicy | Global | API |
| Adzuna | Global | API (requires key) |
| Indonesia Sample | Indonesia | Curated |

## Database Schema

### Tables

- `raw_jobs` - Pre-normalization raw job data
- `job_posts` - Normalized job postings
- `ai_job_analyses` - Gemini AI classification results
- `job_analysis_queue` - Pending AI analysis jobs

### Key Columns in job_posts

| Column | Type | Description |
|--------|------|-------------|
| `apply_url` | TEXT | Required! Valid apply URL |
| `source_url` | TEXT | Original job posting URL |
| `ai_status` | TEXT | `pending`, `analyzed`, `failed`, `fallback` |
| `ai_match_score` | INTEGER | AI-calculated match score (0-100) |
| `ai_beginner_friendly` | BOOLEAN | Is job suitable for beginners? |
| `category` | TEXT | Job category classification |
| `role` | TEXT | Job role classification |

## Filter Examples

```bash
# All Indonesia remote internships
/api/jobs?countryScope=indonesia&workMode=remote&employmentType=internship

# Beginner-friendly React jobs
/api/jobs?techStack=frontend&beginnerFriendly=true

# High-match-score international jobs
/api/jobs?countryScope=international&minMatchScore=80&sort=best_match

# Fresh graduate friendly jobs
/api/jobs?level=freshgraduate&sort=beginner_friendly
```

## Error Handling

The API gracefully handles:
- Missing database columns (fallback to base columns)
- Supabase connection failures (use in-memory store)
- Invalid filter values (ignored with defaults)
- Empty results (returns empty array with pagination info)

## Security

- Jobs without valid `apply_url` are rejected
- No fake jobs can be generated by AI
- Source URLs are validated before acceptance
- Deduplication prevents duplicate entries