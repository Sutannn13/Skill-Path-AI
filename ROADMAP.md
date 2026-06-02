# Roadmap

## Project Status

SkillPath is an **early-stage, pre-launch** project building the foundation for an open-source career operating system for students and beginner developers. The focus right now is on getting core features stable, security foundations solid, and the contributor experience clear.

This roadmap reflects what has been started, what is planned, and what is explicitly out of scope. Items may shift as the project evolves.

---

## Phase 0 — Foundation and Safety

**Status:** In progress / partially complete.

- [x] Next.js 15 App Router foundation.
- [x] Supabase SSR clients for server, browser, and middleware.
- [x] Auth and session handling via Supabase Auth.
- [x] Profile roles: `user` and `admin`.
- [x] Server-side route protection for dashboard and admin surfaces.
- [x] Environment and secret safety (`.gitignore`, server-only keys).
- [x] Cron secret protection for `/api/cron/sync-jobs`.
- [ ] Documentation consolidation (legacy docs and structured docs coexist).

---

## Phase 1 — Core Learning Flow

**Status:** In progress.

- [x] Onboarding flow.
- [x] Skill inventory collection.
- [ ] Skill gap scoring against job requirements.
- [x] AI roadmap generation via Gemini API.
- [x] Deterministic fallback roadmap when AI is unavailable.
- [x] Roadmap persistence in Supabase.
- [x] Resource progress tracking within roadmap tasks.
- [ ] Weekly learning flow and progress summary.

---

## Phase 2 — Assessment System

**Status:** In progress / planned.

- [x] Roadmap quizzes per task.
- [x] Quiz attempt tracking.
- [x] Mini project submission flow.
- [ ] Project review workflow.
- [ ] Final portfolio project review.
- [ ] Rule-first assessment checks before optional AI assist.
- [ ] Clearer progress states across roadmap tasks.

---

## Phase 3 — Jobs and Career Matching

**Status:** In progress / planned.

- [x] Job ingestion from multiple sources (Remotive, Arbeitnow, Jobicy).
- [x] Source attribution on job listings.
- [x] Job freshness rules.
- [ ] Validity and risk scoring for job listings.
- [x] Indonesia curated top-up data when result sets are short.
- [x] Saved jobs functionality.
- [ ] Career profile matching and ranking.
- [ ] Optional Adzuna and live source integration.

---

## Phase 4 — GitHub Portfolio Intelligence

**Status:** In progress / planned.

- [x] Public GitHub profile analysis.
- [x] Repository signal scoring.
- [ ] README and project quality feedback.
- [ ] Beginner-friendly improvement suggestions.
- [x] No fake or mock results unless the user explicitly selects the demo action.

---

## Phase 5 — Admin and Operations

**Status:** Planned.

- [ ] Admin dashboard improvements.
- [ ] Job moderation tools.
- [ ] User and activity visibility.
- [ ] Ingestion run logs and history.
- [ ] Safer operational actions with confirmation flows.
- [ ] Audit-friendly views for admin actions.

---

## Phase 6 — Open Source Readiness

**Status:** In progress.

- [x] LICENSE (MIT).
- [x] CONTRIBUTING.md.
- [x] SECURITY.md.
- [x] ROADMAP.md.
- [ ] GitHub issue templates.
- [ ] Pull request template.
- [ ] Code of Conduct.
- [ ] Improved setup documentation.
- [ ] Contributor-friendly architecture notes.

---

## Phase 7 — Public Launch Preparation

**Status:** Planned.

- [ ] Accessibility review (keyboard navigation, screen readers, contrast).
- [ ] Performance review (bundle size, load times, caching).
- [ ] Security review (RLS audit, auth flow audit, dependency scan).
- [ ] Production deployment checklist.
- [ ] Test coverage improvements.
- [ ] Documentation cleanup and final review.
- [ ] Demo data separation (clearly isolated from real data paths).
- [ ] Release notes.

---

## Non-Goals for Now

The following are explicitly out of scope for the current project phase:

- **Payment or subscription features.** SkillPath is free and open source.
- **Public multi-tenant organization features.** The current model is individual users.
- **Unsupported scraping.** Job data comes from documented APIs and curated sources only.
- **Storing sensitive user secrets.** SkillPath does not store user passwords, tokens, or credentials beyond Supabase Auth.
- **Replacing human career judgment entirely.** AI and scoring are assistive tools, not final authorities.

---

## How Contributors Can Help

If you want to contribute, these areas are especially valuable right now:

- **Documentation** — improve setup guides, architecture notes, and inline comments.
- **Frontend polish** — responsive design, component consistency, visual quality.
- **Auth and security review** — verify auth flows, middleware behavior, and role enforcement.
- **Supabase RLS review** — audit Row Level Security policies for correctness and completeness.
- **Tests** — add unit and integration tests for existing features.
- **Job source improvements** — data quality, new sources, ingestion reliability.
- **AI fallback quality** — improve deterministic roadmap and assessment logic.
- **Accessibility** — WCAG compliance, keyboard navigation, screen reader support.
- **Beginner-friendly UX** — make the experience intuitive for students and early-career developers.

See [CONTRIBUTING.md](CONTRIBUTING.md) for setup instructions and contribution guidelines.
