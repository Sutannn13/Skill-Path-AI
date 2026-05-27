---
id_prefix: API
domain: api-docs
priority: high
scope: backend
last_validated: 2026-05-17
applies_to:
  - backend
  - fullstack
keywords:
  - api-docs
  - api
  - contract
  - documentation
  - readme
  - writing
---

# API and Public Contract Boundary

## API-001: Documentation as Hard Rule (Boundary-Aware)

1. If a change affects an API, CLI command, exported library behavior, schema, event, or integration contract, update the matching docs in the same change.

## API-002: Public README Boundary

1. Root `README.md` is required for every fresh or existing project, including private projects, because a future maintainer still needs a clear public and developer entrypoint.
2. README content must be safe for outside readers and useful for developers.
3. README content must explain what the project is, who it is for, how to set it up, how to run the main workflow, how to configure it, and where deeper docs live when those topics apply.
4. Keep README overview-level. Do not make it the canonical governance source. Do not put secrets, private agent notes, hidden reasoning, backlog chatter, raw architecture debate, or internal policy dumps in it.
5. Choose README sections from project evidence. Do not force a fixed template when a section does not apply.
6. For private/internal projects, keep the same clear style but omit private URLs, credentials, customer names, and internal-only operational details that do not belong in repo docs.

## API-003: Documentation Growth Model

1. Documentation must evolve with the project.
2. When behavior, setup, architecture, public contracts, data shape, deployment, or validation changes, update README and the matching docs in the same change.
3. When `docs/` exists, keep `docs/doc-index.md` as the compact routing map for humans and agents. It should list active docs, their purpose, read triggers, status, and last update.
4. `docs/doc-index.md` must not duplicate requirements, architecture, or API contracts.
5. Start compact, then split only when a topic earns its own file.
6. Good split signals are: the section is long, the workflow is owned separately, the content is referenced often, or the topic needs step-by-step care such as hardware setup, deployment, testing validation, operations, or troubleshooting.
7. Use PRD, SRS, technical design, and ERD as conditional docs, not default boilerplate. PRD covers product intent and roadmap ownership; SRS covers contractual or complex acceptance criteria; technical design covers architecture under pressure; ERD stays inside `docs/database-schema.md` unless the data model is large or relationship-heavy.

## API-004: Public Contract Rules

1. Document the public surface before or alongside implementation.
2. Machine-readable API contracts should use the current project standard. If unresolved, the LLM must recommend a current maintained option from official docs.
3. HTTP APIs should prefer OpenAPI 3.1 when no stronger project standard exists.
4. Choose transport (REST, GraphQL, tRPC, gRPC, SSE, WebSocket) and shape (resource-oriented vs action/command-oriented) from domain evidence, not by habit.
5. When the domain has verbs such as cancel, refund, dispatch, approve, or retry, prefer command endpoints over awkward `PATCH` shoehorns and record at least one alternative transport considered.
6. Treat HTTP as a behavioral contract, not just a shape.
7. Document `ETag` and conditional requests for cacheable reads, `Cache-Control` and `Vary` when shared caches apply, rate-limit headers (`RateLimit-*` or `X-RateLimit-*`) with `Retry-After` when rate limiting exists, and require an `Idempotency-Key` request header on unsafe non-idempotent mutations.
8. List endpoints must document pagination, limits, filtering, sorting, and empty-state behavior.

## API-005: Boundary Contract Details

1. Sensitive mutation endpoints must document idempotency behavior, retry safety, duplicate-submit handling, and any required idempotency key or request fingerprint.
2. Public error contracts must document stable machine-readable codes and any RFC 9457 Problem Details-style fields the project exposes, including safe trace or correlation identifiers when present.
3. Async, webhook, and event contracts must document idempotency, retry, ordering, dead-letter or recovery behavior, and duplicate-message handling.
4. Event APIs should define producer, consumer, payload, versioning, retry, and failure behavior.
5. CLI/library public behavior must update README, help text, changelog, or docs as appropriate.
6. Do not write "see code" as the contract.
7. Do not expose generic `object` or `any` contract shapes when the boundary can be typed.
8. Public error shapes must be safe, stable, and documented.
9. Versioning, deprecation, and support-window obligations for any public surface live in `api-versioning.md`; load it together with this rule when authoring or reviewing a versioned contract change [REF:VER-001].

## API-006: Human Writing Standard (Mandatory)

1. This applies to documentation, release notes, onboarding text, review summaries, and agent-facing explanations.
2. API docs and README updates are included in this scope.
3. Write formal project docs in English by default, even when the user prompt is in another language.
4. Use another documentation language only when the user explicitly asks for it or when existing project docs already establish that language.

## API-007: Style Baseline

1. Write for native English speakers.
2. Target an 8th-grade reading level.
3. Use clear, direct, plain language.
4. Keep sentence rhythm natural with short and medium sentences.
5. Sound confident, practical, and conversational.
6. State the main point first, then supporting detail.

## API-008: Required Writing Behavior

1. Explain decisions the way a competent coworker would explain them out loud.
2. Cut unnecessary words and remove filler.
3. Use concrete verbs and everyday phrasing.
4. Rewrite and reorder content when flow is weak.
5. Keep explanations short by default; expand only when complexity requires it.

## API-009: Scope Severity and Merge Behavior

1. Scope style guidance controls readability and consistency.
2. Style baseline findings are advisory by default and must not block endpoint-change commits that already include accurate docs/spec updates.
3. Hard blockers remain contract failures: missing same-commit docs sync, incorrect schema, missing required responses, or factual inaccuracies.
4. If style polish is still needed, open a follow-up task instead of delaying the contract update.

## API-010: Non-Negotiables

1. No emoji in formal artifacts.
2. Avoid AI cliches and buzzwords: delve, leverage, robust, utilize, seamless.
3. Avoid inflated, academic, or performative language.
4. Avoid padding, hedging, and redundant phrasing.

## API-011: Critical Controls and Final Check

1. Any claim about quality, performance, or reliability must include a measurable source and timestamp.
2. Expand acronyms on first use, then use terms consistently.
3. Separate facts from assumptions explicitly.
4. End major explanations with a clear next action.
5. Read the text out loud before shipping. If it sounds robotic, rewrite it.

## API-012: Idempotency as Runtime Invariant

1. Side-effect-producing endpoints (a `POST` that creates a resource, a `PUT` or `PATCH` that mutates a resource, a request that issues a charge, a request that triggers a downstream notification) must accept an idempotency identifier on retry. The identifier is a caller-supplied key on each logical attempt; the producer commits the effect once and stores enough state to recognize the same key.
2. The server must return the original response on duplicate submissions of the same idempotency identifier within a documented retention window. The retention window must be long enough to cover the platform's worst-case retry interval (network retry plus client-side retry plus operator-driven replay) and is recorded in the API contract per endpoint, not picked at random per call site.
3. The idempotency identifier scope must be documented: per caller, per resource, per tenant, or globally. A scope mismatch (one tenant's key colliding with another's) is a data-leak bug, not a load-balancing edge case.
4. The contract must distinguish three duplicate outcomes: replay-of-same-success (return the original 2xx response unchanged), replay-after-permanent-failure (return the original 4xx response unchanged), and replay-with-different-payload-under-same-key (reject with a clear error so the caller does not silently overwrite the recorded result with a new request body).
5. Storage for idempotency state must be durable across process restarts; in-memory caches are not sufficient on multi-instance deployments. The store may be the same database, a separate key-value store, or a platform-equivalent dedup layer, provided durability and lookup latency are recorded.
6. Reject "the database's primary-key constraint will catch duplicates" as a substitute for an idempotency layer; primary-key collisions surface as 5xx-shaped errors that callers retry, which makes the problem worse.
7. Reject silent acceptance of duplicate side-effect-producing requests without a key. A caller that retried without a key gets a 400-class response that names the missing key, not a second charge.
8. Authority for the rules above includes IETF RFC 9110 for HTTP method idempotency semantics and successor specifications for the `Idempotency-Key` request header where the platform standardizes one. Verify the current standardization status at audit time, because the header has been a draft and an RFC at different points in its history.
<!-- DURABILITY CHECK: Rule relies exclusively on architectural invariants and relative operational thresholds. Valid beyond standard tooling lifecycles. -->

## API-013: Documentation Diagram Format (Mandatory)

1. Use Mermaid.js as the default diagram format for all project documentation diagrams: flowcharts, sequence diagrams, ER diagrams, architecture diagrams, C4 model diagrams, and state machine diagrams.
2. Embed Mermaid diagrams as fenced code blocks with the `mermaid` language tag inside Markdown files.
3. Do not use PlantUML, ASCII art diagrams, Graphviz DOT, or Structurizr DSL. These formats lack native rendering in GitHub, GitLab, and VS Code Markdown preview, or have lower LLM generation accuracy.
4. D2 is on the watch list. Do not adopt D2 until GitHub ships native rendering support.
5. Keep diagrams at macro-architecture and critical-flow level. Do not diagram micro-logic or individual function internals unless the complexity warrants it.
6. When updating project behavior, update the matching diagrams in the same change. Stale diagrams are worse than no diagrams.
7. When updating an existing doc that contains prose-only flow descriptions, architecture explanations, or data model descriptions without diagrams, convert the relevant sections to Mermaid diagrams in the same change.
