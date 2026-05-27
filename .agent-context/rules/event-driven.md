---
id_prefix: EVT
domain: event-driven
priority: medium
scope: backend
applies_to:
  - backend
  - fullstack
keywords:
  - event-driven
  - evt
  - events
  - consumers
  - outbox
  - consistency
---

# Event Boundary

Do not add event-driven architecture because it sounds modern. Use it only when the product or repo shows a real async boundary.

## EVT-001: Event Boundary and Hard Delivery Rules

1. Use events when multiple independent consumers must react to the same fact.
2. Use events when synchronous coupling would harm reliability, latency, or ownership.
3. Use events when audit history, fan-out, or eventual consistency is a real requirement.
4. Use events only when the team can operate retries, monitoring, and failure recovery.
5. Reject events when a direct call, database transaction, or simple module boundary is enough.
6. Events describe facts that already happened.
7. Payloads are versioned, typed, and documented.
8. Producers do not know consumer internals.
9. Consumers are idempotent.
10. Retries are bounded and dead-letter or recovery behavior is defined.
11. Transactional publishing uses an outbox or equivalent safety pattern when data consistency matters.
12. Dual-write flows that update local state and publish a message must use a transactional outbox or document an equivalent atomicity and replay strategy.

## EVT-002: Event Recovery and Catalogs

1. Distributed transactions and two-phase commit are not the default recovery model; prefer local transactions plus saga, choreography, orchestration, or explicit compensating actions when consistency crosses service boundaries.
2. Message handlers must record processed message identifiers or use another duplicate-detection strategy when the delivery model can retry or redeliver.
3. Event catalogs or docs identify producer, consumers, ownership, and schema evolution rules.
4. If event tooling is unresolved, recommend a current project-fit broker or managed service from official docs before implementation.
