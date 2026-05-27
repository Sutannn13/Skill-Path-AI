---
id_prefix: ARCH
domain: architecture
priority: critical
scope: all-tasks
applies_to:
  - backend
  - frontend
  - fullstack
keywords:
  - architecture
  - arch
  - separation
  - concerns
  - structure
  - universal
---

# Architecture - Separation of Concerns and Structure

> If a service imports transport concerns or raw persistence concerns directly, the architecture is already drifting.

## ARCH-001: Universal Backend Principles (Mandatory)

1. These principles are mandatory for backend and shared core modules.
2. No clever hacks.
3. No premature abstraction.
4. Readability over brevity.
5. Keep transport, application, domain, and infrastructure concerns separated.
6. Favor explicit module boundaries over hidden cross-layer shortcuts.
7. Health endpoints distinguish liveness (the process is alive), readiness (the process can serve traffic), and startup (initialization complete) where the runtime supports it. A `200 OK` that does not check critical dependencies is not a readiness signal.

## ARCH-002: Complexity Budget (Mandatory)

1. Prefer the smallest clear implementation that fully preserves behavior, safety, and maintainability.
2. If two implementations are equivalent in behavior and quality, choose the one with fewer moving parts.
3. Remove code that does not carry behavior, safety, clarity, maintainability, or test value.
4. Prefer direct logic over extra wrappers, layers, classes, config, or state when the abstraction does not reduce real complexity.
5. Keep validation, error handling, fallback paths, accessibility, tests, security boundaries, and observability when they protect real behavior.
6. Run a final simplification pass before completion.
7. Run a domain-fit pass on public contracts before completion: if endpoint names, payload fields, error codes, table names, or event types could be renamed to another domain without changing shape, the contract is too generic; revise to express the actual domain verbs and invariants. This is the backend equivalent of the design rename test (see [REF:FE-004]).
8. Do not optimize for line count alone.
9. Do not replace clear code with clever, dense, or surprising code.
10. Do not remove safeguards just because the happy path works.

## ARCH-003: Universal SOP Baseline (Mandatory)

1. The `.agent-context/rules/` directory is the default guidance source for implementation and review.
2. Backend and frontend mindset checks are both required when a task spans API and UI boundaries.
3. Security and testing are non-negotiable baseline requirements.
4. Hard block before coding:
  - Root `README.md` must exist for every fresh or existing project and read as a public and developer entrypoint, not an internal agent note.
  - `docs/doc-index.md` must exist whenever `docs/` exists. It is a compact read-routing map, not a replacement for project docs.
  - `docs/project-brief.md` must exist.
  - `docs/architecture-decision-record.md` (alias: `docs/Architecture-Decision-Record.md`) must exist.
  - `docs/flow-overview.md` must exist.
  - If the project uses persistent data, `docs/database-schema.md` must exist.
  - If the project exposes API or web application flows, `docs/api-contract.md` must exist.
  - For UI scope, `docs/DESIGN.md` and `docs/design-intent.json` must exist.
5. Required docs coverage must include a public and developer README entrypoint, feature plan, architecture rationale, public contracts, data model when relevant, UI/design when relevant, security assumptions, testing strategy, delivery flow, and next validation actions.
6. If required project context docs are missing, stop implementation and bootstrap docs before writing application code.
7. Bootstrap flow: analyze the real repo plus the latest user prompt before authoring those docs.
8. Bootstrap docs must be adaptive and project-specific. Do not create generic placeholder templates.
9. When context is incomplete, separate confirmed facts from assumptions, add an `Assumptions to Validate` section, and end with the next validation action.
10. Keep docs current with project changes. Update README and the matching docs whenever setup, runtime, architecture, public contracts, data shape, UI scope, deployment, or validation flow changes.
11. Control docs file count. Keep the baseline compact, then add topic files only when a subject is stable, too long for README/core docs, or belongs to a distinct workflow such as hardware setup, deployment, testing validation, operations, or troubleshooting.

## ARCH-004: Documentation Read Routing and Conditional Specs

1. Use `README.md` for human orientation, then use `docs/doc-index.md` to choose the smallest relevant read set.
2. Do not broad-read every Markdown file in `docs/` by default.
3. Read `docs/project-brief.md`, `docs/architecture-decision-record.md`, and `docs/flow-overview.md` for broad planning, new features, or architecture changes.
4. Read `docs/api-contract.md` only when API, CLI, firmware endpoint, web flow, event, or library contract behavior is in scope.
5. Read `docs/database-schema.md` only when persistence, migrations, data shape, or query behavior is in scope.
6. Read `docs/DESIGN.md` and `docs/design-intent.json` only for UI, UX, frontend, layout, component, or visual work.
7. Add `docs/prd.md` only when there is product-roadmap, user-story, metrics, product-owner, or feature-flag ownership that would otherwise bloat the project brief.
8. Add `docs/srs.md` only for contractual, regulated, multi-stakeholder, or acceptance-criteria-heavy projects. Do not create both PRD and SRS unless those owners and purposes are distinct.
9. Add `docs/technical-design.md` only for non-trivial architecture decisions, major refactors, cross-cutting behavior, or system interactions that outgrow the ADR and flow overview.
10. Keep ERD inside `docs/database-schema.md` for small and medium schemas. Add a separate ERD file only when relationship complexity makes the schema doc hard to scan.

## ARCH-005: Rules as Guardian (Cross-Session Consistency)

1. Session handoff must include active architecture contract summary.
2. Contract summary must include explicit user constraints, runtime/architecture decision status, active project docs, and the core patterns currently evidenced by the repo.
3. Detect drift before changing runtime choices, topology, public contracts, or core patterns.
4. Direction changes require explicit user confirmation before applying changes.
5. When confirmation is provided, record the rationale in session notes or PR context.

## ARCH-006: Invisible State Management with Explain-on-Demand

1. Default responses must avoid unnecessary state-file internals.
2. State internals are exposed only on explicit user request.
3. Diagnostic mode explains relevant state decisions when needed.
4. Keep default explanations concise and outcome-first.

## ARCH-007: Single Source of Truth and Lazy Rule Loading

1. Canonical rule source is AGENTS.md.
2. Native adapter entry files stay thin and must import the canonical source.
3. Load global domain rules lazily based on touched scope.
4. Do not create or load stack-specific governance adapters as the baseline.
5. Runtime or framework evidence can clarify implementation details, but it must not replace the global architecture, security, data, API, error, event, and testing boundaries.
6. Keep rule-loading output deterministic for init and release validation.

## ARCH-008: Architecture Decision Boundary

1. Do not force a default architecture label before the repo, delivery model, and boundary evidence are clear.
2. Do not split into distributed services without evidence.
3. Do not keep everything in one process by habit either.
4. Service separation only makes sense when multiple signals are true, such as:
5. frequent deploy conflicts across domains
6. clear scale mismatch between domains
7. separate team ownership causing repeated coupling pain
8. hard fault-isolation requirements
9. already-stable contracts and data boundaries

## ARCH-009: Layer Boundaries (Mandatory)

1. Transport or controller layer: parse input, validate shape, enforce auth at the edge, return protocol responses. No business policy, no raw SQL, no external workflow orchestration.
2. Application or service layer: business rules, orchestration, transactions, and use-case flow. No request or response objects, no UI formatting, no raw transport dependencies.
3. Domain layer: pure business invariants, calculations, value objects, and policies. No framework, network, database, or file-system coupling.
4. Infrastructure or repository layer: database, queue, cache, file system, and external API adapters. No business policy hidden in queries or adapters.

## ARCH-010: Dependency Direction

1. Dependencies flow inward: transport to application to domain.
2. Infrastructure depends inward through interfaces or well-defined ports.
3. Domain must not depend on infrastructure.
4. Application must not depend on transport details.

## ARCH-011: Project Structure and File Size Discipline

1. Group code by feature or domain, not by one giant technical folder per type.
2. Backend feature modules use `src/modules/<feature>/...` when the repo has no stronger existing convention.
3. Frontend feature modules use `src/features/<feature>/...` when the repo has no stronger existing convention.
4. Cross-cutting utilities belong in explicit shared locations, not scattered feature internals.
5. Files above roughly 1000 lines are a refactor trigger, not a success signal.
6. Preserve one clear public entrypoint per module when helpful, but move implementation into smaller focused files.
7. Keep code compact because the design is understood, not because safeguards were removed.

## ARCH-012: Module Communication

1. Import through a module's public API instead of reaching into internal files.
2. Keep contracts explicit at boundaries between modules.
3. If a new developer cannot find the full flow of a feature in one clear area, the structure is too diffuse.

## ARCH-013: Natural Implementation Pass

1. Treat "human-readable" code as code that a maintainer can trace, test, and change safely. Do not optimize for looking hand-written at the expense of behavior.
2. Write new code and refactors as a clear sequence of intent: validate the input, name the domain state, perform the operation, then return or report the outcome.
3. Prefer early returns for invalid, empty, or unauthorized paths when they reduce nesting and make the happy path easier to follow.
4. Keep functions focused on one responsibility, but do not create tiny helper chains unless the helper names a real domain condition, removes repeated logic, or makes the main flow easier to read.
5. Avoid dense one-liners, nested ternaries, speculative classes, factories, interfaces, design patterns, and extra layers when direct code preserves the same guarantees.
6. Match the local project style before introducing a new pattern. Do not make code generic enough to fit any product.
7. Run a final naturalness pass before completion: domain names are specific, booleans expose state or permission, comments explain why only, edge cases are explicit, and simplification did not remove validation, error handling, fallbacks, accessibility, tests, security boundaries, or observability.
