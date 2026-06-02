# API Contract

This document describes the public route-handler behavior currently exposed by SkillPath.

## Common Error Shape

Most route handlers return JSON with one of these shapes:

```json
{ "error": "Human-readable safe message" }
```

```json
{ "success": false, "error": "Human-readable safe message" }
```

Internal stack traces and secrets must not be returned to clients.

## `GET /api/jobs`

Returns available job posts from Supabase first, with demo fallback only when durable storage is unavailable.

Behavior:

- Public read endpoint.
- Reads `approved` and `pending_review` jobs by default.
- Hides `rejected` and `expired` jobs.
- Hides jobs older than the freshness window.
- Supports `freshnessDays=7|30|90|all` (`all` maps to active jobs within 180 days).
- Supports `id=<job_id>` for detail-page reads.
- Search filters match title, company, description, location, employment type, work mode, source, tags, and required skills.
- Returns source attribution, posted or fetched dates, work mode, validity score, risk level, and match score.
- Tops up short result sets with the explicit Indonesia curated sample provider so beginner, internship, magang, fresh graduate, junior, backend, frontend, and fullstack examples remain available before a live Indonesian API is connected.
- Uses in-memory/live fallback only when Supabase persistence is not configured.

Freshness rule:

- Use `published_at` when present.
- Use `fetched_at` only when `published_at` is missing.
- Default public listing window is 90 days.
- Jobs older than 180 days may be marked `expired`.

## `GET /api/cron/sync-jobs`

Runs job ingestion across configured sources.

Authentication:

- Development: allowed without `CRON_SECRET`.
- Production: requires `CRON_SECRET` to be configured.
- Caller must send one of:
  - `Authorization: Bearer <CRON_SECRET>`
  - `x-cron-secret: <CRON_SECRET>`

Failure behavior:

| Status | Meaning |
| --- | --- |
| `401` | Missing or invalid cron secret |
| `500` | `CRON_SECRET` is not configured outside development, or sync failed |

Success response:

```json
{
  "success": true,
  "syncTime": "2026-05-27T00:00:00.000Z",
  "summary": {
    "totalJobs": 10,
    "storage": "supabase",
    "expired": 0,
    "sources": []
  },
  "results": []
}
```

Idempotency note:

The job sync upserts by deterministic job ID and the database has a source/external ID dedupe index. Repeat sync calls should converge on the same stored job set. Each run inserts `job_ingestion_runs` rows for audit and debugging.

## `POST /api/cron/sync-jobs`

Manual trigger for the same sync behavior as `GET /api/cron/sync-jobs`.

Auth rules and response shapes are identical to `GET`.

## `POST /api/ai/roadmap`

Generates a structured learning roadmap from user goals and skill context.

Behavior:

- Uses Gemini when `GEMINI_API_KEY` is configured.
- Falls back to deterministic templates when AI is unavailable.
- Validates input on the server.

## `POST /api/ai/analyze-job`

Analyzes a job post for validity, risk, and skill fit.

Behavior:

- Uses server-side validation.
- Runs deterministic validity first.
- Uses Gemini only for user-requested analysis.
- Does not run Gemini during normal job listing or cron ingestion.
- Caches successful Gemini output in `ai_job_analyses`.
- Uses an in-process daily guard for simple AI throttling.
- Returns safe user-facing analysis.
- Uses fallback behavior when AI is unavailable.

## `POST /api/github/analyze`

Analyzes a public GitHub profile and repositories.

Behavior:

- Uses GitHub REST API.
- `GITHUB_TOKEN` is optional and increases rate limits.
- Returns real public repository data for the requested username.
- Does not fall back to mock data on failure.
- Returns safe `404`, `429`, or `502` errors for not found, rate limit, or upstream errors.

## `POST /api/roadmap/quiz/seed`

Seeds deterministic quiz metadata and 10 curated multiple-choice questions per roadmap task.

Behavior:

- Requires authenticated user and roadmap ownership.
- Uses server-side skill inference and curated question bank.
- Stores quiz metadata in `roadmap_quizzes` and answer keys in `roadmap_quiz_questions`.
- Updates task requirement flags (`quiz_required`, `project_required`, `requirement_state`).

## `POST /api/roadmap/quiz/start`

Loads a task quiz without exposing correct answers.

Behavior:

- Requires authenticated user and task ownership.
- Auto-seeds quiz/questions when missing.
- Returns ordered 10-question payload and latest user attempt summary.
- For local/demo fallback roadmap tasks with non-UUID IDs, returns a transient server-generated quiz without Supabase persistence.

## `POST /api/roadmap/quiz/submit`

Grades quiz attempts server-side and persists attempt history.

Behavior:

- Requires authenticated user.
- Stores attempt rows in `roadmap_quiz_attempts`.
- Returns score, pass/fail, per-question explanation feedback.
- Updates roadmap task `quiz_passed`, `requirement_state`, and completion status.
- For transient local/demo quizzes, grades server-side and returns feedback without writing database rows.

## `POST /api/roadmap/project-review`

Submits mini/final project URLs and runs rule-first review with optional Gemini assist.

Behavior:

- Requires authenticated user and roadmap ownership.
- For `mini_project`, requires `roadmapTaskId`, task ownership in the same roadmap, passed quiz (when required), and an actual project requirement (`project_required` or `mini_project` context).
- Performs deterministic checks first (URL validity, repo accessibility, README/activity signals).
- Uses Gemini only after rule checks and within a daily guard.
- Falls back to rule-only review if AI is unavailable.
- Persists submission/review in `roadmap_project_submissions` and `roadmap_project_reviews`.
- Updates task completion flags (`project_passed`) when the task assessment columns exist. Final project status is read from the latest project submission/review; optional legacy roadmap final-status columns are not required for the UI to load.

## `GET /api/roadmap/project-review`

Loads the latest mini or final project submission + review summary for the current user.

## Web Application Flows

| Route | Role | Behavior |
| --- | --- | --- |
| `/dashboard` | `user` | User learning dashboard. Admin sessions redirect to `/admin`. Signed-in users with an active roadmap see roadmap-derived progress, completed task counts, and the next task instead of demo-derived progress numbers. |
| `/admin` | `admin` | Admin operations dashboard. Non-admin users see an admin-only state. |
| `/onboarding` | `user` or demo | Career setup flow. Middleware redirects logged-out users to `/login` when Supabase is configured. |
| `/roadmap` | `user` or demo | Loads latest active Supabase roadmap, creates one when missing, persists task/resource progress, and asks before regeneration. When an existing roadmap has no usable resource rows for a task, the page inserts curated `roadmap_resources` rows with real UUIDs before saving `roadmap_resource_progress`. Task cards show learning map states, resource/checklist gates, and navigation actions only (no inline quiz or inline project submission form). The final project CTA is locked on the roadmap screen until all learning tasks are complete, while existing submissions remain viewable. |
| `/roadmap/tasks/[taskId]/quiz` | `user` | Focused quiz workflow per task. Reads ownership/resource gates, starts quiz from `/api/roadmap/quiz/start`, submits answers to `/api/roadmap/quiz/submit`, and surfaces feedback. |
| `/roadmap/tasks/[taskId]/project` | `user` | Focused mini project submission/review workflow. Reads latest review with `/api/roadmap/project-review` `GET` and submits with `POST`. |
| `/roadmap/final-project` | `user` | Focused final portfolio submission/review workflow backed by `/api/roadmap/project-review` with `projectType=final_project`. |
| `/jobs` | `user` or demo | Lists fresh jobs from Supabase plus curated Indonesia top-up data, ranks jobs with the saved career profile, and lets users persist `saved_jobs`. |
| `/github` | `user` or demo | Calls `/api/github/analyze` and renders only the requested username's result unless demo is explicitly chosen. |
| `/skills`, `/sprint`, `/settings`, `/projects` | `user` or demo | Protected app surfaces when Supabase is configured; demo mode remains available when Supabase env vars are missing. |
| `/login`, `/register`, `/forgot-password`, `/reset-password` | Public auth | Logged-in users visiting `/login` or `/register` are redirected to `/dashboard`. |

Authorization must be enforced on the server. UI-only role checks are not security boundaries.
