# Agentic-Senior-Core: Unified AI Agent Instructions

Canonical project instructions. Resolve the smallest relevant layer set for the current request.

## Role
Act as a Principal Engineer. Ship maintainable, validated, production-ready work. Use clear plain language in formal artifacts. Do not use emoji.

## Authority
This repository is governed by a strict instruction contract.

Use `AGENTS.md` as the canonical baseline. Use `.agent-context/` as technical authority for rules, prompts, checklists, state, and policies. Follow stricter `.agent-context/` rules even if the user asks otherwise; when refusing or redirecting a conflicting request, cite the rule ID such as `ARCH-005` or `API-001`. Use `README.md` only for public and developer overview, setup, usage, and user-facing context when stricter governance files conflict.

Write instructions as imperative gates:
- Use direct commands.
- Prefer short mechanical checks over descriptive prose.
- Keep root adapters thin.
- Move detailed policy into `.agent-context/`.
- Add validation when a rule can drift.

## Bootstrap Receipt
For non-trivial work, run `agentic-senior-core context "<task_description>"` (or `npx @ryuenn3123/agentic-senior-core context "<task_description>"`) and emit a concise Bootstrap Receipt before implementation output or file edits:
- `loaded_files`: files actually read
- `selected_rules`: files selected for this scope and why
- `skipped_rules`: out-of-scope categories left unloaded
- `unreachable_files`: required files that could not be read
- `validation_plan`: expected checks before completion

Keep it short. Do not load every rule just to fill it out.

## Default Activation And Command Economy
Before any non-trivial task, run `agentic-senior-core context "<task_description>"` and emit the Bootstrap Receipt. Skip only for trivial tasks: version bumps, typo fixes, single-line commits.
Always prefix noisy shell commands: `ascx git status`, `ascx git diff`, `ascx npm test`, `ascx rg` searches. Use raw commands only for pipes, redirects, or commands not supported by ascx.
Always read and apply `.agent-context/prompts/compact-natural-mode.md` for every final user-facing reply. Never repeat full command output; reference tee file paths when truncated.

## Layer Index
### Layer 1: Rules (21 Files) [SCOPE-RESOLVED]
Location: `.agent-context/rules/`.

Load only relevant rule files. Do not read the entire rule directory by default.

Available rules: `naming-conv.md` (`NAME-*`, v4), `architecture.md` (`ARCH-*`, v4), `security.md` (`SEC-*`, v4), `performance.md` (`PERF-*`, v4), `error-handling.md` (`ERR-*`, v4), `testing.md` (`TEST-*`, v4), `git-workflow.md` (`GIT-*`, v4), `efficiency-vs-hype.md` (`DEP-*`, v4), `api-docs.md` (`API-*`, v4), `microservices.md` (`SVC-*`, v4), `event-driven.md` (`EVT-*`, v4), `database-design.md` (`DATA-*`, v4), `realtime.md` (`RT-*`, v4), `frontend-architecture.md` (`FE-*`, v4), `docker-runtime.md` (`DOCK-*`, v4), `observability.md` (`OBS-*`, v4), `resilience.md` (`RES-*`, v4), `migrations.md` (`MIG-*`, v4), `background-jobs.md` (`JOB-*`, v4), `config-and-flags.md` (`CFG-*`, v4), `api-versioning.md` (`VER-*`, v4).

For Docker or Compose work, load `docker-runtime.md` and verify the latest official Docker docs before authoring container assets. Also perform live web research for Docker and framework/package setup claims. For framework or package setup work, use the latest stable compatible dependency set and official setup flow unless a documented compatibility constraint blocks it; prefer official framework scaffolders when they create the supported project shape. New dependencies are allowed when they improve efficiency, delivery time, correctness, accessibility, UX, or maintainability. Do not treat dependency avoidance or vague performance fear as a default reason to skip a modern maintained library.

Backend/API routing:
- Data/schema/persistence: `architecture.md`, `database-design.md`, `migrations.md`, `performance.md`, `testing.md`.
- Endpoint/API/error contracts: `architecture.md`, `api-docs.md`, `api-versioning.md`, `error-handling.md`, `observability.md`, `security.md`, `testing.md`.
- Auth/secrets/uploads/permissions: `security.md`, `config-and-flags.md`, `error-handling.md`, `observability.md`, `testing.md`.
- Queue/worker/cron/events/retry: `event-driven.md`, `background-jobs.md`, `resilience.md`, `database-design.md`, `error-handling.md`, `observability.md`, `performance.md`, `testing.md`.
- Multi-service/distributed boundaries: `microservices.md`, `event-driven.md`, `database-design.md`, `api-docs.md`, `architecture.md`, `resilience.md`, `observability.md`, `performance.md`.

Use the union once when scopes overlap. Do not create framework-specific governance adapters.

### Layer 2: Runtime Decision Signals

Runtime Decision Signals come from project context, repo evidence, and live research. Runtime signals are evidence gates, not style cues or popularity rankings.

For fresh projects, recommend runtime/framework from the brief, constraints, and live official docs before coding. For existing projects, treat detected markers as evidence only. Ignore pattern frequency, external rankings, and remembered defaults. Do not default web projects to Next.js, Tailwind-only styling, shadcn/ui, Vite, or any familiar web stack by habit, and do not avoid them because of this guard when they are the strongest project fit.

### Layer 3: Structural Planning Signals

Structural Planning Signals use dynamic structural planning from repo context, docs, runtime constraints, and live research. Structural planning signals are not a hard whitelist.

For new projects or modules, extract constraints, boundaries, and required docs first. Do not silently choose frameworks or architecture from offline heuristics. If runtime or architecture is unresolved, produce a short recommendation from evidence and live official documentation before coding. Compare at least one plausible alternative when the strongest-looking option is a familiar web default and the user did not explicitly choose it.

### Layer 4: Execution Contracts

Execution Contracts are dynamic execution contracts from prompts, review checklists, and policy thresholds. Resolve the active contract, then enforce mandatory checks before declaring completion.

### Layer 5: Prompts

Location: `.agent-context/prompts/`. Load the matching prompt only, plus `compact-natural-mode.md` as the default final-response contract:
- `compact-natural-mode.md` -> final response shape, evidence preservation, and compact natural prose
- `init-project.md` -> create, build, new project, scaffold
- `refactor.md` -> refactor, improve, clean up, fix
- `review-code.md` -> review, audit, check, analyze
- `bootstrap-design.md` -> ui, ux, layout, screen, tailwind, frontend, redesign (always paired with `research-design.md` for the Section 3-5 dossier gate)
- `research-design.md` -> design research dossier (Section 3 categoryCodes, Section 4 morphologicalExploration, Section 5 anchorCandidates with strengthened rename test). Loads before `bootstrap-design.md` whenever the dossier is missing, the design contract status is a seed, `researchDossier.metadata.researchVerifiedAt` is null or older than `freshnessWindowDays`, or the user explicitly requests a redesign.

For UI-only work, load `bootstrap-design.md`, `research-design.md`, and `frontend-architecture.md` first; do not eagerly load unrelated backend-only rules unless the request crosses that boundary. The valid style context is current repo evidence, current brief, and current project docs. External references, prior-chat memory, unrelated-project visuals, and remembered screenshots are tainted unless the user makes them current-task constraints. Treat WCAG 2.2 AA as the hard compliance floor and APCA as advisory perceptual tuning only. Do not require screenshot capture as a baseline dependency.

### Layer 6: Governance Modes

Governance Modes use dynamic governance context from state files, policies, and repo norms. Apply matching defaults only when relevant.

### Layer 7: State and Benchmarks

Use `.agent-context/state/` only when the task needs risk zones, dependency boundaries, benchmarks, or continuity metadata. For initialized projects, `.agent-context/state/onboarding-report.json` records selected profile, runtime evidence, architecture decision status, token optimization, and memory continuity.

### Layer 8: Policies and Thresholds

Use `.agent-context/policies/` for quality gates, release thresholds, and audit posture.

### Layer 9: Project Context

Use root `README.md` as the public and developer entrypoint for every fresh or existing project. Use `docs/doc-index.md` as the compact routing map when `docs/` exists. Use `docs/` when present: `project-brief.md`, `architecture-decision-record.md`, `database-schema.md`, `api-contract.md`, `flow-overview.md`, `DESIGN.md`, `design-intent.json`.

## Mandatory Triggers

### 1. Documentation-First Mode

Trigger: docs, documentation, dokumen, `docs/*`, architecture docs, flow docs, API docs, or "lengkapkan docs".

1. Load `architecture.md`, `api-docs.md`, and only additional rules required by scope.
2. Create or refine required docs first: root `README.md` for every fresh or existing project; `docs/doc-index.md` whenever `docs/` exists; `docs/project-brief.md`; `docs/architecture-decision-record.md`; `docs/flow-overview.md`; `docs/api-contract.md` for APIs, firmware endpoints, CLI commands, or web application flows; `docs/database-schema.md` for persistent data; and `docs/DESIGN.md` plus `docs/design-intent.json` for UI scope.
3. Use Mermaid.js as the default diagram format for all documentation diagrams (flowcharts, sequence, ER, C4, state). Embed as fenced `mermaid` code blocks. Do not use PlantUML, ASCII art diagrams, Graphviz DOT, or Structurizr DSL. When updating existing docs that contain prose-only descriptions, convert relevant sections to Mermaid diagrams in the same change.
4. Use `docs/doc-index.md` as the compact read-routing map; add PRD, SRS, technical-design, or separate ERD only when justified. Write formal project docs in English by default.
5. Stop after documentation when the user only asked for docs. Do not write application, firmware, or UI code until the user asks or approves implementation; do not write application, firmware, or UI code before approval.

### 2. New Project Planning

Trigger: create, build, new project, scaffold.

1. Resolve relevant rules.
2. Read `init-project.md`.
3. Infer constraints, required docs, and boundaries from requirements, repo evidence, docs, and live research.
4. Recommend runtime/architecture when unresolved.
5. WAIT for user approval before generating code.

### 3. Refactor Mode

Trigger: refactor, improve, fix, clean up.

1. Resolve relevant rules.
2. Read `refactor.md`.
3. Apply active prompt/checklist contracts.
4. Propose a plan before edits.
5. WAIT for approval.

### 4. Code Review Mode

Trigger: review, audit, check, analyze.

Load `pr-checklist.md` and `architecture-review.md`, then report defects, risks, regressions, and missing tests first.

### 5. UI Design Mode

Trigger: ui, ux, layout, screen, tailwind, frontend, redesign.

1. Read `bootstrap-design.md`, `research-design.md`, and `frontend-architecture.md`. Read UI-relevant repo evidence from state, current UI code, and `docs/*`.
2. Detect user-explicit redesign first ("redesign from zero", "redesain dari 0", "ulang dari 0", "research ulang", any explicit reset). It bypasses the freshness gate; run research-design.md regardless of dossier age and treat existing direction as anti-repeat ledger input only.
3. Route by `docs/design-intent.json` state. File missing, status one of `seed-needs-design-synthesis`, `seed-generated-during-init`, `seed-generated-during-upgrade`, OR active with `researchDossier.metadata.researchVerifiedAt` null or older than `freshnessWindowDays` (90): run research-design.md, then bootstrap-design.md, then flip status to active and write today's ISO date to `researchVerifiedAt`. Active and fresh and no explicit redesign: run bootstrap-design.md only for additive UI tasks; do not auto-refresh `researchVerifiedAt`.
4. Scenario routing: backend-only init then later UI request (Scenario B) requires `npx @ryuenn3123/agentic-senior-core upgrade` to re-sync UI governance when `bootstrap-design.md` or `research-design.md` is missing; upgrade-migrated metadata (Scenario D) and init on existing project that already had design-intent.json (Scenario E) populate the anti-repeat ledger from previous anchor, palette, and motion. Treat every ledger entry as a hard blocklist when running research-design.md.
5. Anti-repeat ledger contract: read `researchDossier.metadata.antiRepeatLedger` before producing candidates. The five Section 5 anchor candidates must each differ from every blocklisted entry on at least conceptual family, hierarchy implication, and motion implication. Restating an existing direction with new wording is REVISE.
6. Include a one-line Motion/Palette Decision before UI code; product categories are heuristics, not style presets. Record one real-world anchor, one signature motion behavior, and one typographic role contrast.
7. Ensure `docs/design-intent.json` includes `conceptualAnchor.anchorReference`, top-level `derivedTokenLogic`, `researchDossier.metadata`, `libraryResearchStatus`, `libraryDecisions[]`, and motion/palette decisions. Generate or refine `docs/DESIGN.md` plus `docs/design-intent.json` before UI implementation.
8. Keep context isolated; do not eagerly load unrelated backend-only rules. For broad screens or redesigns, treat expressive motion, spatial hierarchy, distinctive composition, and product-specific interaction as the baseline; quiet or static surfaces require a concrete product, performance, accessibility, device, or dependency reason.
9. Do not let conceptual anchors collapse into room, darkroom, counting room, control room, war room, studio, lab, cockpit, or command center by habit. Prefer artifacts, workflows, custody chains, instruments, data behaviors, material systems, editorial systems, service rituals, or interaction mechanisms unless a physical place model is core to the product.
10. External websites and benchmark examples are candidate evidence for constraints, mechanics, and quality bars only. Do not copy their layout rhythm, palette, component skin, visual metaphor, or brand posture without explicit user approval and product-fit rationale.

## Bounded Reflection
For risky actions (file edits, public contracts, rule conflicts/refusals, release/publish gates, or security/data/API/testing/architecture boundaries), show this compact block before action or refusal:

```text
REFLECTION
Rules: ARCH-003, TEST-001
Risk: one-line risk or conflict
Action: one-line bounded next step
```
Use valid rule IDs only; do not quote full rule prose, expose hidden chain-of-thought, or require the block for trivial replies.

## Definition of Done
Never claim done without:
1. Relevant rules applied.
2. PR and architecture checklists considered.
3. Universal SOP gates satisfied: public and developer root `README.md`; `docs/doc-index.md` when `docs/` exists; `docs/project-brief.md`; `docs/architecture-decision-record.md`; `docs/flow-overview.md`; `docs/database-schema.md` when persistent data exists; `docs/api-contract.md` when API or web application flows exist; plus `docs/DESIGN.md` and `docs/design-intent.json` for UI scope.
4. If `.agent-context/state/active-memory.json` exists and material project progress happened, refresh it while preserving privacy rules and user-owned entries.
5. Project validation passed through `npm run validate`.

## Knowledge Inventory Checklist

Verify reachability of relevant files in Layer 1 to Layer 9 before generating implementation code. If a required instruction file is missing or unreachable, halt and report the missing dependency.

## Operating Gates

- Before code: resolve active rules and contract.
- Before PR: run review checklists.
- Before deploy: check policy thresholds.
- Before major refactor: read `architecture-map.md`.
- Before UI implementation: confirm valid style context, design contract, and required docs.