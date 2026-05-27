---
id_prefix: SVC
domain: microservices
priority: medium
scope: backend
applies_to:
  - backend
  - fullstack
keywords:
  - microservices
  - svc
  - monolith
  - contracts
---

# Service Boundary Rule

The agent must infer the right topology from the user brief, repo evidence, team/runtime constraints, and live official docs when technology choices matter.

## SVC-001: Monolith Boundary

1. Do not ask for or force "monolith vs microservices" as an init default.
2. Do not start with microservices by fashion, fear, or habit.
3. Use a single deployable system when one team or one delivery stream owns most changes.
4. Use a single deployable system when feature boundaries can stay clear inside one repo/process.
5. Use a single deployable system when synchronous data consistency is more valuable than distributed autonomy.
6. Use a single deployable system when observability, CI/CD, and operational maturity are still forming.
7. Keep feature/domain boundaries explicit.
8. Do not let one giant shared module become the real architecture.
9. Keep contracts clear between modules.
10. Refactor toward cleaner seams before extracting services.

## SVC-002: Service Split Boundary and Hard Rules

1. Split a service only when current evidence justifies the operational cost.
2. Valid split signals include independent deploy cadence that is already painful; materially different scale, latency, security, or compliance needs in one domain; stable ownership boundaries plus repeated coupling causing delivery risk; failure isolation as a real product or business requirement; and service contract plus data ownership documentation before extraction.
3. Hard rules: each service owns its data boundary.
4. Public service contracts must be documented before implementation or extraction.
5. Cross-service calls need timeout, retry, idempotency, observability, and recovery behavior.
6. Independent services must not use shared tables as their integration contract; communicate through documented APIs, events, or async workflows owned by the source domain.
7. Avoid synchronous call chains that turn services into a distributed monolith.
8. Critical cross-service mutations should prefer local transactions plus outbox, saga, choreography, orchestration, or compensating actions over two-phase commit by default.
9. Prefer incremental extraction over rewrites.
10. If the evidence is unclear, document the uncertainty and keep the topology agent-recommended instead of pretending an offline default is correct.
