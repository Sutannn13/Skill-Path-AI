---
id_prefix: TEST
domain: testing
priority: high
scope: all-tasks
applies_to:
  - backend
  - frontend
  - fullstack
keywords:
  - testing
  - test
  - behavior
  - contract
  - failure
  - boundaries
---

# Testing Boundary

Use the test runner and style already present in the repo.

## TEST-001: Test Scope

1. If no test setup exists, recommend a current, lightweight, project-fit setup from official docs before adding one.
2. Test what can break: business rules, validation, authorization, state transitions, and error paths.
3. Test public APIs, UI flows, integration boundaries, and data contracts touched by the change.
4. Test regressions around bugs being fixed.
5. Test critical accessibility or responsive behavior when UI is in scope.
6. Do not test framework internals, third-party library behavior, private implementation trivia, or snapshots that only freeze noise.
7. Tests should describe behavior, keep setup readable, and mock only at real boundaries such as network, filesystem, clock, database, or external services.

## TEST-002: Backend and API Test Rules

1. API tests must cover request validation, authorization boundaries, success responses, documented error shapes, pagination defaults, and empty states for touched endpoints.
2. Sensitive mutations such as payments, orders, status changes, inventory adjustments, and account/security changes must include duplicate-submit or retry tests when idempotency is required.
3. Data-access changes must include evidence for query shape, transaction behavior, rollback or recovery paths, and N+1 prevention when relational reads are touched.
4. Event or worker changes must test retry, duplicate-message handling, dead-letter or recovery behavior, and outbox relay semantics when those paths exist.
5. Distributed consistency changes must test the local transaction, publish/retry behavior, and compensating action or recovery path rather than only the happy path.
6. Tests should make the API contract obvious from the fixture names, inputs, and expected response shape.
7. Tests must exercise the failure paths the code claims to handle, not only the happy path.
8. Prefer property-based or generated-input tests for invariants such as validation, ordering, and idempotency; prefer explicit failure-injection tests for retry and recovery code; prefer contract tests at service boundaries when consumer and producer ownership is split.
