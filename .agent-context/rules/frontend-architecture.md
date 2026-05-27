---
id_prefix: FE
domain: frontend-architecture
priority: high
scope: ui
last_validated: 2026-05-17
applies_to:
  - frontend
  - fullstack
keywords:
  - frontend-architecture
  - fe
  - ui
  - design
  - interaction
  - boundaries
---

# Frontend Design and Interaction Boundaries

Load this rule for UI-facing work. Keep the loaded surface small.

## FE-001: Activation

1. Use this rule for UI, UX, page, screen, component, layout, landing, dashboard, form, onboarding, animation, interaction, redesign, visual refresh, responsive fix, hierarchy fix, and frontend deliverables inside fullstack or backend work.

## FE-002: Authority

1. Use current repo evidence, the active brief, and current project docs as valid style context.
2. Treat `.agent-context/` as design governance authority.
3. Treat `README.md` as public and developer overview, setup, usage, and user-facing context only when design or architecture rules conflict.
4. Do not choose final style, framework, palette, typography, layout paradigm, or animation library offline.
5. Research current official docs before adding a new UI, animation, scroll, 3D, canvas, charting, icon, styling, or primitive library.
6. Use the current date as the freshness anchor for design research. Trend and category-default claims should come from the newest relevant evidence, preferably material published or updated within the last 24 months. Older sources are acceptable only as labeled durable principles, not proof that a direction is currently modern.
7. Treat user-provided concepts as first-class constraints. Adapt research to support, refine, or challenge the concept with evidence; do not override it with trend defaults unless a concrete product, accessibility, technical, or evidence conflict is recorded.
8. Keep research vocabulary internal. Evidence, dossier, anchor, category-code, morphology, rename-test, and freshness labels may guide decisions, but must not appear in UI copy, public-facing docs, or final user-facing rationale unless the user explicitly asks for the research trace.
9. Dynamic UI Foundation: do not hardcode shadcn/ui, Tailwind-only, native-only, or any component library as the universal answer, and do not avoid them out of guardrail fear when they fit. Tailwind-first is valid when the stack, token model, and team workflow support it; pure Tailwind, vanilla CSS, shadcn/ui, or any kit is not neutral by itself. Modern primitives, motion/canvas/WebGL helpers, charting libraries, and styling tools are valid when product evidence, accessibility, runtime constraints, and official docs support them.
10. For fresh projects, prefer official framework scaffolders or setup commands when official docs show they produce the current supported shape. Build files manually only when approved architecture, repo constraints, or learning/prototype scope makes that better.
11. Keep design continuity opt-in. Repo evidence outranks memory residue.

## FE-003: Required Design Contract

1. Before UI code, create or refine `docs/DESIGN.md` and `docs/design-intent.json`.
2. The contract must record `motionPaletteDecision`, `designFlexibilityPolicy`, `conceptualAnchor`, `derivedTokenLogic`, `aiSafeUiAudit`, `designExecutionPolicy`, `designExecutionHandoff`, `reviewRubric`, `contextHygiene`, `libraryResearchStatus`, and `libraryDecisions[]`.

## FE-004: Anti-Generic UI Gate

1. Do not ship interchangeable dashboard chrome, balanced card grids, centered marketing shells, generic component-kit surfaces, generic abstract logos, or nonfunctional background decoration unless the product earns them.
2. For new screens or broad redesigns, make at least three at-a-glance product-specific signals visible. Signals may be data treatment, iconography, state language, motion behavior, spatial structure, typography, material logic, or color behavior.
3. Use the rename test: if the UI can be renamed to another product category without changing composition, palette, iconography, and motion language, revise before implementation is considered complete.
4. Use the old-design regression test for broad redesigns: if the UI reads as the previous design with fewer details, removed animation, simplified sections, or a new palette on the same composition, revise before implementation is considered complete.

## FE-005: Dynamic Anchor Gate

1. If the user gives no current-task visual research or reference, do not count old UI, existing design docs, or scaffold seeds as research.
2. Choose one high-variance non-software conceptual anchor before UI code.
3. Internally reject the safest dashboard, portal, card-grid, admin-shell, or minimalist-web-app mental model.
4. Do not let the fallback anchor become a generic place metaphor. Avoid room, darkroom, counting room, control room, war room, studio, lab, cockpit, and command center unless the product actually depends on that place model; prefer product-specific artifacts, workflows, custody chains, instruments, data behaviors, material systems, editorial systems, service rituals, or interaction mechanisms over "where the UI lives".
5. Record one real-world anchor reference, one signature motion behavior, and one typographic decision with role contrast.
6. Derive typography, spacing, morphology, motion, and responsive recomposition from that anchor.
7. Translate the anchor into workflow, hierarchy, density, typography, state behavior, and interaction before using literal artifacts. Do not turn anchor artifacts into required chrome, wallpaper, decorative props, or component-kit theme objects without a named product function.
8. Reject anchors described only by generic quality words such as modern, clean, premium, expressive, minimal, or bold.

## FE-006: Motion, Palette, and 3D

1. Product categories are heuristics, not style presets.
2. Choose motion density from task, content density, brand intent, device budget, performance, and accessibility.
3. Map states before coding: default, hover, focus-visible, active, disabled, loading, empty, error, success, transition.
4. Distinguish motion (visual continuity between states) from interaction design (state machines, focus transfer on route/modal/error transitions, optimistic updates where safe, skeleton shapes that match real content, `aria-live` for status, keyboard paths, scroll-driven progressive disclosure). Record at least one interaction-design decision per major flow alongside motion choices.
5. Prefer visually exploratory, product-derived palettes while preserving WCAG contrast and status clarity.
6. Do not default to dark slate, cream/beige/tan, purple-blue gradients, monochrome palettes, cyber-neon terminals, or uniform card surfaces without product evidence.
7. Treat motion, 3D, WebGL, canvas, scroll choreography, and animation libraries as first-class options.

## FE-007: Zero-Based Redesign

1. If the user asks for a redesign from zero, treat existing UI as behavioral/content evidence only.
2. Discard prior palette, typography, hero composition, navigation placement, component morphology, motion signature, and image framing unless the user requests continuity.
3. Rewrite or materially update both design docs before coding.
4. Change primary composition, content hierarchy, interaction model, and responsive information architecture.
5. Reject palette swaps, dark-mode flips, and restyled heroes.
6. Reject implementations that remove animation, media, depth, or interaction density merely to reduce complexity when the request calls for a more distinctive experience.

## FE-008: Responsive Mutation

1. Responsive quality is not scale-only.
2. Mobile must prioritize the first decisive action.
3. Tablet must regroup surfaces instead of shrinking desktop.
4. Desktop may expose more context but must not become interchangeable admin chrome (see [REF:FE-004]).
5. At least one major surface must change position, grouping, priority, or disclosure strategy between mobile and desktop.
6. Prefer container queries, dynamic viewport units, support-checked selectors, subgrid, popover, or disclosure primitives when they simplify recomposition and fallbacks are clear.

## FE-009: Accessibility

1. WCAG 2.2 AA is the hard floor.
2. APCA is advisory perceptual tuning only.
3. Hard checks include focus visibility, focus appearance, target size, keyboard access, accessible authentication, color-only meaning, and dynamic status/state access.
4. Fix accessibility issues without flattening the UI into generic safe chrome unless no expressive safe option remains (see [REF:FE-004]).

## FE-010: CSS Production Hardening

1. Plan overflow, wrapping, truncation, empty, loading, error, and extreme-content behavior before declaring a layout complete.
2. Prefer `min()`, `max()`, `clamp()`, stable aspect ratios, container-relative sizing, OKLCH, and tinted neutrals for new tokens when supported; preserve existing design-system tokens.
3. Prefer composition primitives that match content meaning: named `grid-template-areas` for editorial regions, subgrid for nested alignment across siblings, container queries for component-level responsiveness independent of viewport, and explicit stacking context (`isolation: isolate`) when overlap or z-depth carries meaning. Do not default to flex column when content has structure that grid expresses better.
4. Treat recursive card nesting, uniform radius everywhere, shadow on every surface, arbitrary spacing, gray text on saturated color, and library-default skins as drift signals requiring product rationale.

## FE-011: Implementation Boundaries

1. Follow the shipped project stack and current repo patterns.
2. Do not hardcode Zustand, React Query, smart/dumb component doctrine, or framework-specific architecture as universal design law.
3. Keep structure feature-oriented when it improves maintainability.
4. Keep component states recognizable across hover, focus, loading, success, empty, and error.
5. Do not let repeated surfaces share one visual treatment by habit; repetition needs a product reason.

## FE-012: Data State Surface

1. Every data-displaying surface must explicitly handle, with distinct UI, the period before any data has arrived for the first time, the case where the result set is empty by query or by absence, the case where prior data is visible while new data fetches in the background, recoverable error, and limited-connectivity or cached-fallback when the product operates outside continuous network coverage.
2. The surface must not collapse multiple data states into a single generic spinner, a single generic empty illustration, or a single generic error message; each state carries different operator and user information and must be distinguishable at a glance.
3. Do not treat a stale-while-revalidate refresh as a loading state; show the prior data with a visible freshness indicator and update in place when the new result arrives.
4. Status changes between these states must be announced to assistive technology through the platform's accessible-status mechanism, per WCAG 2.2 status-message guidance, so non-visual users learn that the surface moved from loading to populated, populated to empty, or populated to error.
5. Reject "spinner everywhere" as the default UI for any non-trivial data surface. Reject empty states that look identical to error states. Reject error states that do not name a recovery path.

## FE-013: Background and Wallpaper Discipline

1. Background lines, grids, scanlines, noise, glows, blobs, abstract logos, calibration marks, and decorative geometry are invalid as wallpaper.
2. Do not use grid or line backgrounds as first-output filler.
3. Use them only for a named product function such as alignment, crop guidance, map/route orientation, timeline reading, measurement, status, or motion continuity.
4. Measurement, calibration, crop, map, route, and inspection marks are task-bound overlays or control affordances.
5. They must not become the page background, hero backdrop, or default visual texture.
6. When a conceptual anchor (see [REF:FE-005]) and a forbidden visual motif conflict, the forbidden motif wins; translate the anchor into layout, hierarchy, density, typography, state behavior, materials, and interaction instead of literal decorative texture.

## FE-014: Production Content Policy

1. Production UI must read as ship-ready: no visible testing, demo, sample, placeholder, lorem, TODO, coming soon, or scaffold labels unless they are intentional product states.
2. User-facing workflows need an operable UI path; terminal-only core flows are valid only for CLI, developer-tool, or runbook products.

## FE-015: Motion Implementation Budget

1. Omit rich motion or spatial UI only after naming the product-fit reason and the replacement interaction quality.
2. For new screens or broad redesigns, research the expressive implementation path instead of defaulting to static native CSS. Use native or already-installed tools only when they can still deliver the chosen ambition, or when a concrete blocker is documented. Do not downshift because adding a package feels inconvenient; downshift only for a concrete product-fit, accessibility, security, compatibility, device, maintenance, or measured performance reason.
3. Prefer micro-interactions in 150-300ms, layout transitions in 300-500ms, transform/opacity for high-frequency motion, explicit easing, bounded stagger, and reduced-motion alternatives unless evidence changes the budget.
4. Keep reduced-motion, keyboard, loading, performance, mobile, and non-3D fallbacks explicit.

## FE-016: Library and Design-Intent Discipline

1. Use component kits or headless primitives for behavior and accessibility when they fit. Replace library-default visual language with project-specific composition, tokens, motion, state treatment, and morphology.
2. Keep design-intent flexible: lock user goals, accessibility, production readiness, forbidden patterns, and approved continuity; keep exact palette primitives, font families, radius/shadow values, component skins, candidate signature moves, and external website inspiration flexible until evidence or approval locks them. Convert references into product-fit rules; do not copy layout, palette, component skin, brand posture, or visual metaphor.

## FE-017: Interactivity Priority

1. Components that require client-side state, event handling, or interactive behavior must be the smallest unit that genuinely needs them. Wrapping, layout, narrative, and content-presentation components must remain server-rendered or static unless they themselves manage state or handle events.
2. The interactive boundary must be drawn deliberately. Promoting a wrapper to client-side just to host a deeper child's interactivity is a defect.
3. Use the platform's primitive for interactivity-priority hints (component-level interactivity boundaries, partial hydration, islands, or the framework equivalent) rather than a global default that hydrates everything.
4. Operationally, measure responsiveness through Interaction to Next Paint (INP) or the platform's current Core Web Vitals threshold; a regression in INP that originates from over-eager interactivity is a defect, not a runtime cost to accept.
5. Reject "make the whole page interactive so this one button works". Reject promoting a layout component to interactive without a recorded reason. Reject defaulting to a heavyweight client-side runtime when the surface is read-only.

## FE-018: Internationalization as Layout

1. Direction-sensitive spacing, alignment, and positioning must use direction-agnostic properties: CSS logical properties (`margin-inline-start`, `padding-block-end`, `inset-inline`, `border-inline-end`) or the framework or design-token equivalent. Physical-direction properties (`margin-left`, `padding-right`, `left`, `border-right`) are forbidden in shared layout code that may render in any locale.
2. Icons must be classified at design time as direction-conveying (arrows, send/forward, undo/redo, slider handles, chevrons that imply navigation) or object-representing (a magnifying glass, a clock face, a brand mark). Direction-conveying icons must mirror with layout direction; object-representing icons must not. Decisions must be recorded in the icon system, not improvised per use.
3. Plan a documented text-expansion budget for the project's target locales: short labels in some languages expand by 30 to 100 percent versus English, and the layout must absorb that growth without truncation, overflow, or breaking visual hierarchy. Record the assumed budget per surface and verify representative long-string fixtures during review.
4. Bidirectional content (mixed left-to-right and right-to-left runs in a single string) must use the platform's bidi isolation primitive so a single embedded token cannot reorder surrounding content.
5. Reject hardcoded physical-direction properties in shared codebases. Reject icon mirroring decisions left to per-component improvisation. Reject "we will fix it when we localize" as a substitute for a documented expansion budget.

## FE-019: Theme as Context

1. A theme switch is a change in lighting and surface model, not a color inversion. The same brand color does not produce the same perceptual result against a high-luminance surface as against a low-luminance surface; tokens must be re-derived per theme, not algebraically inverted.
2. Elevation and depth must be expressible without depending on drop-shadows alone. Drop-shadows lose contrast at low surface luminance; depth tokens must combine surface-color shifts, border treatments, or platform-equivalent material cues so the elevation hierarchy remains legible across themes.
3. Brand colors carried across themes must be individually verified against the active theme's contrast floor. Two colors with identical chroma can pass contrast on one theme and fail on another; per-theme verification is mandatory and cannot be substituted with a single light-mode test.
4. Theme tokens must include explicit mappings for status (success, warning, error, info), focus-visible, and disabled states per theme. A token that exists only on one theme is incomplete.
5. Reject color inversion as a substitute for a re-derived theme. Reject reliance on drop-shadows as the sole elevation cue. Reject deferring per-theme contrast verification to runtime.
6. Authority for the perceptually-uniform color reasoning above is illustrative across modern color-science work; the OKLCH color space is one example of a perceptually-uniform space and may be used to express tokens, but it is not required. The universal fallback for delivery is sRGB; on platforms or surfaces where wide-gamut delivery is supported and verified, wider color spaces may be used. Verify the platform's current color-management capabilities at audit time.
<!-- DURABILITY CHECK: Rule relies exclusively on architectural invariants and relative operational thresholds. Valid beyond standard tooling lifecycles. -->
