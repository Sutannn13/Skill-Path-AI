# Documentation Index

This file routes readers to the smallest useful document for the current task.

| Document | Purpose | Read when | Status |
| --- | --- | --- | --- |
| [project-brief.md](project-brief.md) | Product goal, audience, and scope | Planning features or explaining the app | Active |
| [architecture-decision-record.md](architecture-decision-record.md) | Runtime, auth, data, and UI decisions | Changing architecture, auth, API, or persistence | Active |
| [flow-overview.md](flow-overview.md) | Main user, admin, and cron flows | Touching route behavior or demos | Active |
| [database-schema.md](database-schema.md) | Tables, relationships, RLS, and migration notes | Changing Supabase data shape or policies | Active |
| [api-contract.md](api-contract.md) | Route handlers and public behavior | Changing API routes or integration contracts | Active |
| [DESIGN.md](DESIGN.md) | UI direction and accessibility rules | Changing screens, layout, dashboard, or components | Active |
| [design-intent.json](design-intent.json) | Machine-readable design governance scaffold | Broad UI redesign or design synthesis | Seed scaffold |
| [FEATURES.md](FEATURES.md) | Existing feature list | Feature explanation | Legacy |
| [SCORING_METHOD.md](SCORING_METHOD.md) | Skill gap scoring details | Changing readiness calculations | Legacy |
| [SETUP.md](SETUP.md) | Earlier setup notes | Local setup troubleshooting | Legacy |

## Current Implementation Focus

Phase 0 and Phase 1 add a secure cron boundary, upgrade vulnerable framework dependencies, and introduce Supabase-backed `admin` and `user` roles.
