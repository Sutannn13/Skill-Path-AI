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

## ADR-005: Versioned Deterministic Roadmap Content

Status: Accepted

Roadmap content uses a versioned task contract. Fallback task keys map to explicit resource topics and quiz skills. AI roadmaps are accepted only after role-alignment validation and otherwise fall back to the deterministic curriculum.

Curriculum version 3 adds ordered beginner milestones. JavaScript precedes TypeScript, Node.js precedes Express, Python precedes pandas, and Expo project setup precedes React Native platform work. Existing active roadmaps with older content versions enter the repair flow instead of silently mixing old and new task contracts.

Consequences:

- Existing active roadmaps without the current content version enter an explicit repair flow.
- Repair archives the old roadmap instead of deleting progress history.
- Persisted stale resources are filtered and missing relevant video/documentation pairs are inserted.
- One task per module, the final task, owns the module mini-project requirement.
