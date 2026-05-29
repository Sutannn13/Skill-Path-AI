# Design Contract

## Current Direction

SkillPath keeps its existing neobrutalism direction and now adds a consistent cartoon companion layer. The interface uses bold borders, hard shadows, saturated cards, readable iconography, and direct dashboard language, with lightweight doodles and mascot scenes that make the app feel like a "Cartoon Career OS for Developers."

This phase does not redesign the product from scratch. It upgrades the global background, mascot usage, and page personality while preserving existing routing, Supabase data flow, and neobrutalist layout structure.

## Motion and Palette Decision

Real-world anchor: a developer career planner marked with bright sticky tabs, project stickers, roadmap checkpoints, and progress stamps.

Signature motion: slow floating doodles in the page background, small pressed-card movement on hover and tap, and mascot idle movement that disables for reduced-motion users.

Typographic contrast: display headings use `Space Grotesk`; body and operational copy use `Inter`.

## Cartoon Neobrutalism Layer

The visual system follows a 70/20/10 split:

- 70 percent neobrutalist structure: thick black borders, hard shadows, solid cards, readable forms, and bold page hierarchy.
- 20 percent cartoon personality: cat mentor scenes, sticker badges, outlined code/workflow doodles, and page-specific illustrations.
- 10 percent motion: slow transform-only background movement, hover/tap feedback, and subtle mascot animation.

The background is not decorative filler. It represents a developer planner workspace: route maps for roadmaps, sticky notes for sprint planning, radar and briefcases for jobs, question marks for quizzes, laptops and rockets for project submission, and gear stickers for settings.

## Shared Components

- `CartoonBackground` provides the fixed cream paper layer, subtle grid/dot pattern, page-specific doodles, and low-opacity sticker cards.
- `FloatingDoodles` owns deterministic doodle placement per route variant so the UI does not reflow or randomize between renders.
- `CartoonMascot` extends the existing cat mascot instead of replacing it, adding reusable mood/accessory combinations.
- `PageScene` adds compact route-specific mascot scenes for high-value authenticated pages.
- `CartoonSticker` standardizes small brutal sticker badges used in scenes and future empty/success states.

## Reduced Motion and Performance

Animations use CSS transform and opacity only. Decorative layers are `pointer-events-none`, fixed behind content, and clipped by the app shell to avoid horizontal overflow. `prefers-reduced-motion` disables floating doodles, mascot idle loops, and sticker wiggles while keeping the static visual system visible.

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
