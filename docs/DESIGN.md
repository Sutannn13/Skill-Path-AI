# Design Contract

## Current Direction

SkillPath keeps its existing neobrutalism direction for Phase 0 and Phase 1. The interface uses bold borders, hard shadows, saturated cards, readable iconography, and direct dashboard language.

This phase does not redesign the product. It adds role-specific surfaces while preserving the shipped visual system.

## Motion and Palette Decision

Real-world anchor: a student career planner marked with bright sticky tabs and progress stamps.

Signature motion: small pressed-card movement on hover and tap, already implemented through Framer Motion.

Typographic contrast: display headings use `Space Grotesk`; body and operational copy use `Inter`.

## Role-Specific Surfaces

User dashboard:

- Focuses on personal readiness, weekly sprint, recommended skills, jobs, GitHub score, and recent activity.
- Uses bottom navigation on mobile because it is a repeated learner workflow.

Admin dashboard:

- Focuses on users, job ingestion, roadmaps, activity, and role boundary status.
- Uses desktop-first operational density and removes mobile bottom navigation for reduced accidental admin navigation.
- Keeps the same neobrutalism tokens so the admin surface feels part of the product.

## Accessibility Rules

- Maintain WCAG 2.2 AA contrast as the floor.
- Do not rely on color alone for admin/user state.
- Keep icon buttons labeled with accessible names.
- Keep touch targets at least 44px where practical.
- Prevent long headings or helper text from overflowing cards on mobile.

## Component Rules

- Reuse `AppShell`, `DashboardHeader`, `BrutalCard`, and `BrutalButton`.
- Use Lucide icons for dashboard actions and status signals.
- Do not introduce a new UI library for Phase 0 or Phase 1.
- Keep client components limited to interactive surfaces and animation-heavy UI.

## Future Design Work

`docs/design-intent.json` is still a generated design-governance scaffold. Before a broad redesign, run the full design synthesis workflow and update that file from seed status to an active, project-specific contract.
