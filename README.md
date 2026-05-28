# SkillPath

SkillPath is a career operating system for students and beginner developers. It helps users check their skill readiness, compare skills against real jobs, generate learning roadmaps, audit GitHub portfolios, and track weekly progress.

## Stack

| Area | Technology |
| --- | --- |
| App | Next.js 15 App Router, React 18, TypeScript |
| UI | Tailwind CSS, custom neobrutalism components, Framer Motion |
| Data and Auth | Supabase Auth, Postgres, Row Level Security |
| Jobs | Remotive, Arbeitnow, Jobicy, Indonesia sample source, optional Adzuna |
| AI | Gemini API with deterministic fallbacks |
| Charts and 3D | Recharts, React Three Fiber, Drei |

## Current Phase

Phase 0 and Phase 1 establish the security and auth foundation:

- Production cron sync fails closed when `CRON_SECRET` is missing or invalid.
- Next.js is on the patched 15.5 line.
- Supabase SSR clients are available for server, browser, and middleware session refresh.
- `profiles.role` supports `admin` and `user`.
- `/dashboard` is the user dashboard surface.
- `/admin` is a separate admin dashboard surface with server-side role checks.
- `/github` calls the real GitHub analysis route and keeps mock data behind an explicit demo action.
- `/roadmap` persists active roadmaps, task gates, learning resources, and resource progress in Supabase.
- `/jobs` reads durable `job_posts`, logs cron runs, applies freshness rules, and persists `saved_jobs`.

## Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

## Environment

| Variable | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Auth and persistence | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Auth and persistence | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server admin work | Trusted server-side admin operations only |
| `GEMINI_API_KEY` | Optional | AI roadmap and job analysis |
| `GITHUB_TOKEN` | Optional | Higher GitHub REST API rate limits |
| `ADZUNA_APP_ID` | Optional | Adzuna job source |
| `ADZUNA_APP_KEY` | Optional | Adzuna job source |
| `CRON_SECRET` | Production cron | Protects `GET/POST /api/cron/sync-jobs` |
| `NEXT_PUBLIC_APP_URL` | Recommended | Metadata, redirects, and callbacks |

## Database

Apply migrations in order:

```bash
supabase db push
```

The latest additive migration is `supabase/migrations/006_learning_assessment_system.sql`. It adds roadmap quizzes, quiz attempts, mini/final project submissions, project reviews, and assessment state fields. Run migrations in order so `005_roadmap_persistence.sql` is applied before `006_learning_assessment_system.sql`.

To promote an admin, run a trusted SQL update after the user's profile exists:

```sql
update public.profiles
set role = 'admin'
where id = '<auth-user-uuid>';
```

Do not allow users to update `profiles.role` from client code.

## Scripts

```bash
npm run dev
npm run lint
npm run typecheck
npm run build
```

## Documentation

- [Project Brief](docs/project-brief.md)
- [Architecture Decisions](docs/architecture-decision-record.md)
- [Flow Overview](docs/flow-overview.md)
- [Database Schema](docs/database-schema.md)
- [API Contract](docs/api-contract.md)
- [Design Contract](docs/DESIGN.md)
- [Documentation Index](docs/doc-index.md)

Legacy docs remain available while the project documentation is consolidated:

- [Features](docs/FEATURES.md)
- [Scoring Method](docs/SCORING_METHOD.md)
- [Setup Notes](docs/SETUP.md)

## Security Notes

- Never commit `.env` or `.env.local`.
- Only `NEXT_PUBLIC_*` variables can be used in browser code.
- `SUPABASE_SERVICE_ROLE_KEY` must stay server-only.
- Middleware refreshes Supabase sessions, but route/page authorization still happens server-side.
- Cron sync accepts `Authorization: Bearer <CRON_SECRET>` or `x-cron-secret: <CRON_SECRET>` outside development.

## License

Educational and portfolio project.
