# Architecture Decision Record

## ADR-001: Next.js App Router as the Application Runtime

Status: Accepted

SkillPath uses Next.js App Router with TypeScript. Route handlers provide the API boundary, pages provide UI surfaces, and server components are used for trusted auth checks where possible.

Consequences:

- Server-only secrets stay out of client components.
- Auth checks for role-protected pages run on the server.
- Client components stay focused on interaction, animation, and local UI state.

## ADR-002: Supabase Auth and Row Level Security for Roles

Status: Accepted

Supabase provides authentication, profile storage, and Row Level Security. The `profiles.role` column stores the application role as `admin` or `user`.

Consequences:

- `user` is the default role for new profiles.
- Admin promotion is a trusted operation, not a client-side profile update.
- RLS remains the database enforcement layer for user-owned data.
- UI role checks are not treated as security boundaries.

## ADR-003: Demo Mode Without Supabase

Status: Accepted

The app can render demo surfaces when Supabase environment variables are not configured. This preserves coursework and portfolio demos while production auth is being completed.

Consequences:

- `/dashboard` remains usable in local demo mode.
- `/admin` shows a setup-required state when Supabase is missing.
- Supabase-backed deployments enforce sessions and roles.

## ADR-004: Existing Neobrutalism UI Continuity

Status: Accepted

The project keeps the current neobrutalism component language: bold borders, hard shadows, vivid cards, clear iconography, and concise dashboard copy.

Consequences:

- Admin UI reuses `AppShell`, `DashboardHeader`, `BrutalCard`, and `BrutalButton`.
- No broad redesign is included in Phase 0 or Phase 1.
- Future UI work should update `docs/design-intent.json` before a major redesign.
