---
id_prefix: DATA
domain: database-design
priority: high
scope: data
last_validated: 2026-05-17
applies_to:
  - backend
  - fullstack
keywords:
  - database-design
  - data
  - design
  - boundary
  - reject
  - these
---

# Data Design Boundary

Use the data store, ORM, migration tool, and query style already chosen by the project. If unresolved, the LLM must recommend a current fit from requirements, repo evidence, and official docs before implementation.

## DATA-001: Reject these bad habits

1. schema changes without a migration, rollback or recovery note, and data-safety plan
2. duplicated facts or derived values without a sync strategy and rationale
3. unbounded reads or missing pagination on growable datasets
4. missing indexes or access-path planning for frequent filters, joins, lookups, search, or ordering
5. raw query construction that bypasses safe parameterization
6. destructive data changes without backup, migration, or deployment sequencing notes

## DATA-002: Backend data access rules

1. Relational reads must avoid N+1 query patterns. Use eager loading, joins, batching, or explicit query-shape rationale based on the project's ORM or database driver.
2. List endpoints and exports must paginate, limit, stream, or otherwise bound growable datasets by default.
3. Use cursor pagination for large or frequently changing datasets when the project contract allows it; offset pagination is acceptable for small, stable, explicitly bounded collections.
4. Define maximum page size, payload size, and export limits so list responses cannot exhaust memory or connection pools.
5. Mutations that write more than one table, aggregate, queue, or external consistency boundary must run inside a transaction or document the compensating recovery path.
6. Repository and data-access layers own persistence mechanics. They must not hide business policy that belongs in application or domain logic.
7. Index design follows read patterns, not column lists. Prefer composite indexes with selectivity-correct column order (equality before range), partial indexes for soft-delete or status-filtered tables, and covering indexes when a hot read can be satisfied without a heap fetch. Record the read pattern that justifies each non-trivial index.
8. Record explicit decisions for delete semantics (hard delete, soft delete, append-only audit), tenant isolation (none, row-level with `tenant_id` plus row-level security, schema-per-tenant), and normalize-vs-denormalize trade-off for read-heavy or sparse data. Default to the simplest fit, but make the choice explicit in data docs rather than letting it become a side effect of the first migration.
9. Cross-domain persistence must respect ownership boundaries. Independent services must not share database tables as an integration contract; modular monoliths may share one database only when module ownership and access paths stay explicit.
10. Docs must record entity ownership, relationships, constraints, data lifecycle, migration risk, and assumptions to validate.

## DATA-003: Money and time

1. Monetary amounts must be stored as a fixed-precision integer in the smallest unit of the currency (for example, the smallest indivisible unit defined by the currency's standard subdivision), or as a decimal type with explicit precision and scale matched to the currency's accounting requirements. The chosen representation must be recorded in the data model docs alongside the column it applies to.
2. Floating-point types (`float`, `double`, `real`, or platform equivalent) are forbidden for monetary columns. Floating-point arithmetic introduces rounding artifacts that compound across aggregation, settlement, and reconciliation; the cost of correcting them after the fact is higher than the cost of using the right type up front.
3. Currency-bearing columns must record the currency code on the same row, not implicitly through the column or the table; an amount without a stored currency is not a quantity, it is a defect waiting for a multi-currency feature.
4. Timestamps that represent a real-world moment must be stored in UTC. Timezone information that the user or the source system supplied may be retained as separate metadata when the local calendar is meaningful, but the canonical instant is UTC.
5. Naive timestamp storage (a timestamp type with no timezone offset, or a string without an explicit timezone designator) is forbidden for any field that represents a real-world moment. Timestamps that record a wall-clock value (a recurring event in a local calendar, a scheduled time-of-day) are not real-world moments and may use a date or local-time type, but the choice must be explicit, not the default that fell out of the migration tool.
6. Conversion to local time must occur only at presentation boundaries (formatted output, user-facing UI, exported reports). Application logic, queries, and inter-service messages must operate on the UTC value.
7. Reject floating-point types for monetary columns. Reject naive timestamps for fields that represent a real-world moment. Reject ambiguous "string of digits" amount columns when the database offers a precise numeric type.

## DATA-004: Concurrency and write conflicts

1. Resources that can be edited by independent owners (the same row reachable by multiple users, the same aggregate reachable by multiple sessions, the same record reachable by overlapping batch jobs) must carry an optimistic-concurrency token: a monotonic version column, an `ETag`-style content hash, an updated-at timestamp combined with a precondition, or platform-equivalent compare-and-set primitive.
2. The token must travel with the read response so the next write can submit it as a precondition. A write that lacks the token must be rejected, not silently treated as the latest version.
3. The conflict response must be explicit and machine-actionable. For HTTP surfaces, an HTTP 409 response is the canonical signal; the response body must include the current state of the resource (or a stable reference the caller can fetch to retrieve it) and a conflict reason the caller can render to the user. The response shape must be documented in the API contract.
4. The conflict-resolution strategy must be recorded per resource: prompt the user to merge, retry on a fresh read, drop the change, or escalate to a server-side merge function. "Retry forever" is not a strategy; it must have a bounded attempt count and a documented fallback.
5. For workflows where overlapping edits are expected (collaborative documents, multi-step forms with parallel reviewers), use a change-tracking model that captures intent (operations, deltas, change requests) rather than only final-state writes; final-state writes against shared resources without a token are the failure mode this rule prevents.
6. Reject implicit last-write-wins on shared mutable resources. Reject "we will solve it when conflicts happen" as a substitute for an explicit token. Reject conflict responses that do not include the current state and a reason the caller can act on.

## DATA-005: Citations and freshness

Authority sources for the additions in [REF:DATA-003] and [REF:DATA-004]:

- ISO 4217: authority for currency codes and the standardized minor-unit count per currency. Verify the current edition for currency additions and minor-unit changes; the standard is updated periodically.
- ISO 8601 (and IETF RFC 3339 as the wire-shape profile): authority for timezone-aware timestamp representations.
- IETF RFC 9110 sections on conditional requests and the `412 Precondition Failed` and `409 Conflict` semantics: authority for the HTTP-side conflict-response shape referenced in [REF:DATA-004].
- IETF RFC 7232: authority for `ETag` and `If-Match` precondition mechanics on HTTP surfaces.

Vendor-specific decimal types, time-handling libraries, and conflict-detection frameworks are illustrative implementations of the rules above; they are not authority. Use the platform-appropriate mechanism that exists in the deployed runtime.
<!-- DURABILITY CHECK: Rule relies exclusively on architectural invariants and relative operational thresholds. Valid beyond standard tooling lifecycles. -->
