# Project Brief

## Product

SkillPath is a career operating system for students and beginner developers. It turns skills, target roles, job requirements, GitHub signals, and weekly study habits into a clear path toward internships, freelance work, remote jobs, or portfolio readiness.

## Audience

- Students learning software development.
- Beginner developers preparing for internships or junior roles.
- Portfolio builders who need practical project and roadmap guidance.

## Core Problems

- Users do not know which skills are missing for a target role.
- Job requirements are hard to translate into a learning plan.
- AI-generated roadmaps need deterministic fallback behavior.
- Users need progress tracking that is simple enough for repeated weekly use.
- Admins need a separate operational surface for users, jobs, roadmaps, and activity.

## Scope

Current scope:

- Skill gap scoring from local skill inventory.
- Job ingestion and validity scoring.
- AI roadmap and job analysis with fallback responses.
- GitHub portfolio analysis.
- User dashboard and admin dashboard separation.
- Supabase Auth and Row Level Security foundation.

Out of scope for the current phase:

- Complete sign-in and sign-out UI.
- Admin write actions for moderation or role management.
- Payment, subscription, or public multi-tenant organization features.

## Success Criteria

- Public demo surfaces continue to render without Supabase.
- Supabase-enabled deployments enforce server-side role checks.
- Users cannot elevate their own role from client code.
- Production cron sync rejects requests without the configured secret.
- Documentation matches the current behavior.
