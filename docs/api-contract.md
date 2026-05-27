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
- Supports `freshnessDays=7|30|90`.
- Supports `id=<job_id>` for detail-page reads.
- Returns source attribution, posted or fetched dates, validity score, risk level, and match score.
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

## Web Application Flows

| Route | Role | Behavior |
| --- | --- | --- |
| `/dashboard` | `user` | User learning dashboard. Admin sessions redirect to `/admin`. |
| `/admin` | `admin` | Admin operations dashboard. Non-admin users see an admin-only state. |
| `/onboarding` | Public/demo | Career setup flow. Complete auth UI is still a later phase. |
| `/roadmap` | `user` or demo | Loads latest active Supabase roadmap, creates one when missing, persists task/resource progress, and asks before regeneration. |
| `/jobs` | Public with optional session | Lists fresh jobs from Supabase and lets authenticated users persist `saved_jobs`. |
| `/github` | Public | Calls `/api/github/analyze` and renders only the requested username's result unless demo is explicitly chosen. |

Authorization must be enforced on the server. UI-only role checks are not security boundaries.
