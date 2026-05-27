---
id_prefix: MIG
domain: migrations
priority: critical
scope: data
last_validated: 2026-05-17
applies_to:
  - backend
  - fullstack
keywords:
  - migrations
  - schema
  - ddl
  - expand-contract
  - backfill
  - rollback
---

# Migrations Boundary

A schema or data-shape change that touches live traffic is a deployment with two moving parts: the schema and the code that depends on it. Migrations safety is the property that the user-facing operation continues to succeed during, and after, the change, regardless of which side ships first or which side rolls back. Vendor-specific online-migration tools that may appear in commentary are illustrative; the authority is the safety invariants below.

## MIG-001: Hard rules (Mandatory)

1. Every schema change that touches live data must be decomposed into expansion steps (additive, non-breaking, independently deployable) and contraction steps (removal of old structures), with at least one production deployment between phases. Single-step schema changes that simultaneously add and remove are forbidden on hot data.
2. The deploy ordering invariant must hold across the entire migration: code that requires the new schema must not deploy before the migration that introduces it, and code that requires the old schema must not deploy after the migration that removes it. The ordering must be documented in the migration ticket and verified by the deploy procedure.
3. A migration must be reversible, or it must carry a documented forward-only recovery plan. "We will figure it out" is not a recovery plan.
4. Reject migrations that lack a rollback or recovery plan. Reject deploy procedures that allow a code revert to land while the schema is still in the new shape, or vice versa, without an explicit compensating step.

## MIG-002: Lock posture (Mandatory)

1. Any DDL operation expected to hold an exclusive or share lock for longer than the service's acceptable request-latency threshold must use the platform's online or non-blocking migration mechanism. The threshold is the service's own latency budget, not a fixed number of rows or a fixed wall-clock duration.
2. Where the platform supports a two-phase mechanism for constraints (for example, validate-without-lock followed by an asynchronous validate, or platform-equivalent concurrent index creation), use it instead of a single locking statement. The implementation must record which phase is run in which deploy.
3. Long-running statements must run with an explicit statement timeout or lock-wait timeout, so a stuck DDL cannot hold a global lock indefinitely.
4. Reject DDL inside long-running transactions that also contain unrelated work. Reject foreign-key or check-constraint additions on hot tables in a single locking statement when the platform offers a non-blocking variant.

## MIG-003: Backfills (Mandatory)

1. Backfills are separate from DDL. The DDL adds the column, table, or index in its safe shape (nullable, no-default, or non-unique, as appropriate); the backfill populates or repairs data in idempotent, resumable batches.
2. A backfill job must be idempotent: rerunning the job, including from an arbitrary mid-progress checkpoint, must converge to the same final state without double-writing or double-charging.
3. A backfill job must be resumable. The job must record progress on a durable cursor so a process restart, deploy, or worker rotation does not require restarting from the beginning.
4. A backfill job must be observable. It must emit progress, throughput, and error-rate telemetry; an operator must be able to answer "how far has the backfill progressed?" without reading the data store directly.
5. A backfill job must be throttleable. It must respect the platform's load on the source data store, and an operator must be able to slow or pause it during incidents without losing progress.
6. Reject "backfill in the migration script". Reject backfill jobs that do not record progress, that cannot be paused, or that have no completion criterion.

## MIG-004: Risk documentation (Mandatory)

Every migration ticket or change record must capture, at change time, the following:

1. Estimated runtime on production-equivalent data volume.
2. Lock posture: which locks the operation acquires, on which objects, for how long, and which queries it will block.
3. Data volume estimate: rows or bytes touched.
4. Rollback plan or, if forward-only, the recovery plan with explicit data-loss exposure.
5. Deploy-ordering note: which application version range is safe with the old schema, which with the new, and which with both. Both-compatible windows are required for any change that touches a request path.
6. Backfill plan, if any: what data is rewritten, in what batch shape, with what idempotency key.
7. Verification step: the post-migration check the operator runs to confirm the schema, the data, and the application all match the intended end state.

A change that ships without these fields is not a migration; it is a defect waiting to happen.

## MIG-005: Boundary safety (Mandatory)

1. Cross-service migrations must coordinate the schema change with the downstream consumers. A producer that drops a field before downstream consumers stop reading it is a breaking change disguised as a migration.
2. Event payload schemas, message contracts, and shared cache shapes are subject to the same expand-contract discipline as relational schemas. Producers add the new shape first, consumers learn to read both, then producers retire the old shape.
3. Reject "we control all consumers" as a substitute for the expand-contract discipline; consumers include retried events from before the deploy, mobile clients with stale code, and parallel-running canaries.

## MIG-006: Reject these bad habits

1. Reject one-shot DDL that adds and removes structures in the same deploy on hot data.
2. Reject migrations that take an exclusive lock on a hot table without a non-blocking alternative tested first.
3. Reject backfills baked into the migration transaction so the transaction cannot complete in time.
4. Reject "feature-flag the schema" patterns where two code paths read or write incompatible shapes against the same column without an explicit migration plan.
5. Reject migration tickets that omit the risk-documentation fields above.
6. Reject claims of reversibility that are not actually exercised on a non-production environment before production deploy.

## MIG-007: Citations and freshness

Authority sources for the rules in this file:

- The expand-contract or parallel-change pattern in mainstream continuous-delivery and database-refactoring literature: authority for the multi-phase deploy discipline.
- Database engine documentation for the platform in use: authority for which DDL operations are non-blocking, which require a rewrite, which acquire what locks, and which support a two-phase validate. Verify the platform's current major-version documentation at audit time, because lock posture changes between major versions of the same engine.
- IETF RFC 7807 and successor problem-detail specifications: authority for how a write that hits a deploy-ordering window should communicate its rejection to the caller.

Vendor-specific online-migration tools (in any database ecosystem) are illustrative implementations of the lock-posture and backfill rules above; they are not authority. Use the platform-appropriate mechanism that exists in the deployed engine version.
<!-- DURABILITY CHECK: Rule relies exclusively on architectural invariants and relative operational thresholds. Valid beyond standard tooling lifecycles. -->
