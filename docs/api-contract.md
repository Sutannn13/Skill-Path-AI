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

Returns available job posts from the local job store and configured adapters.

Behavior:

- Public read endpoint.
- Uses fallback job data when external sources fail.
- Filters and scoring are handled in application code.

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
    "sources": []
  },
  "results": []
}
```

Idempotency note:

The job store deduplicates job IDs, so repeat sync calls should converge on the same stored job set. A durable idempotency table is not present yet.

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
- Returns safe user-facing analysis.
- Uses fallback behavior when AI is unavailable.

## `POST /api/github/analyze`

Analyzes a public GitHub profile and repositories.

Behavior:

- Uses GitHub REST API.
- `GITHUB_TOKEN` is optional and increases rate limits.
- Falls back safely when the external API fails.

## Web Application Flows

| Route | Role | Behavior |
| --- | --- | --- |
| `/dashboard` | `user` | User learning dashboard. Admin sessions redirect to `/admin`. |
| `/admin` | `admin` | Admin operations dashboard. Non-admin users see an admin-only state. |
| `/onboarding` | Public/demo | Career setup flow. Complete auth UI is still a later phase. |

Authorization must be enforced on the server. UI-only role checks are not security boundaries.
