---
id_prefix: RES
domain: resilience
priority: critical
scope: backend
last_validated: 2026-05-17
applies_to:
  - backend
  - fullstack
keywords:
  - resilience
  - timeout
  - retry
  - deadline
  - degradation
  - backpressure
---

# Resilience Boundary

The system must remain useful when a dependency is slow, partial, or unavailable. Resilience is the property that the user-facing operation either completes within an agreed budget, fails fast with a clear outcome, or runs in a documented degraded mode; it is not the absence of failure. Vendor names and library names that may appear in commentary (timeout libraries, service meshes, adaptive-concurrency runtimes) are not authority for this rule.

## RES-001: Timeouts and deadlines (Mandatory)

1. Every outbound network or inter-process call must carry an explicit timeout derived from the user-facing operation's worst-acceptable latency. Library defaults and "no timeout" are not acceptable.
2. The timeout must be smaller than the upstream caller's remaining latency budget. A request handler that has 800 ms of remaining budget must not issue a downstream call configured to wait 5 seconds.
3. The system must propagate the caller's remaining deadline downstream so a downstream operation cannot continue past the upstream's expiration. If the platform exposes a deadline header or a context cancellation primitive, use it; otherwise, transmit the remaining budget as an explicit field on the call.
4. Connect, read, and idle timeouts must be set independently. A combined "request timeout" that hides which phase exceeded the budget makes failure analysis ambiguous.
5. Reject reliance on default timeouts. Reject "infinite" or platform-maximum timeouts on user-facing call paths. Reject configuring a downstream timeout larger than the upstream caller's remaining budget.

## RES-002: Retries (Mandatory)

1. Retries are allowed only on operations that are idempotent on the target, or on operations that carry an idempotency identifier the target honors within a documented retention window.
2. Retries must use exponential backoff with jitter and a documented attempt cap. Fixed-interval retries are forbidden because they synchronize callers during incidents.
3. Each retry must inherit the caller's remaining deadline; the sum of attempts plus backoff must not exceed the original budget.
4. Retries must distinguish retriable failures (transient network, explicit retry-after, documented `5xx` semantics) from non-retriable failures (validation, authorization, business-rule rejection); non-retriable failures must surface immediately without consuming retry budget.
5. Reject retries on non-idempotent writes that lack an idempotency identifier on the target. Reject retry storms: any pattern where many callers retry on the same schedule, without jitter, and without a global cap, is a defect even if each caller is locally well-behaved.

## RES-003: Failing fast on unhealthy dependencies (Mandatory)

1. When a dependency's failure rate, latency, or queue depth indicates it cannot serve traffic within the user-facing latency budget, the calling component must shed load on that dependency rather than continue to issue calls that will time out.
2. Load shedding is an outcome, not a named pattern. The system may achieve it through any mechanism appropriate to the platform: a service mesh fault-tolerance policy, an adaptive-concurrency limiter, an in-process state machine that rejects calls during a recovery window, or a rate limiter informed by health probes. Choose what the platform supports; do not write a custom mechanism when the platform provides one.
3. The shedding component must emit a telemetry event when it transitions between healthy, degraded, and shedding states, so an operator can correlate user impact with the decision to shed.
4. The shedding component must have a documented recovery path: how it re-admits traffic to the dependency, how it confirms the dependency is healthy, and how it bounds the rate of recovery to avoid a thundering herd.
5. Reject open-loop retry behavior against an upstream that has been unhealthy for longer than its documented recovery window. Reject "fail open" defaults on security-relevant calls (authorization, license enforcement); those must fail closed and the user-facing impact must be a documented degraded mode, not silent permission.

## RES-004: Dependency isolation (Mandatory)

1. Independent dependencies must use independent resource pools (connection pools, thread pools, semaphore quotas, or platform-equivalent admission control) so the saturation of one upstream cannot exhaust the pools used by another.
2. The size of each pool must be derived from the dependency's documented capacity and the caller's latency budget, not from a default.
3. The system must expose the in-flight count, the queue depth, and the rejection count for each pool as telemetry, so an operator can distinguish "dependency slow" from "caller's pool exhausted".
4. Reject sharing one global pool across unrelated downstream calls when the platform supports separation. Reject silent unbounded queueing in front of a saturated pool; bounded queues with explicit rejection are mandatory.

## RES-005: Graceful degradation (Mandatory)

1. For each dependency, the implementation must answer one question explicitly in code or in a runbook: "what does the caller still do for the user when this dependency is unavailable?" A generic catch-all error response is not an answer.
2. Acceptable degraded behaviors include: serving a cached or older version of the data with a freshness indicator, returning a partial result with the unavailable section labelled as such, queueing the request for later processing with a documented user-visible acknowledgement, or refusing the operation with a clear error that names the unavailable subsystem.
3. The user-facing error path must distinguish "we cannot do this right now, retry later" from "we will not do this, do not retry"; clients reading these responses act differently on the two.
4. Degraded behavior must be observable: a request served from a fallback path must emit telemetry that records which fallback fired, why, and how stale or partial the result was.
5. Reject silent degradation. A response that hides a fallback from the caller, or that omits a stale-data marker when the data is stale, is a defect.

## RES-006: Backpressure across producers and consumers (Mandatory)

1. Any boundary between an unbounded producer (user requests, upstream events, ingestion stream) and a bounded consumer must apply backpressure: shed load, throttle the producer, or expose lag back to the producer. Silent unbounded growth of an in-memory or on-disk queue is forbidden.
2. The boundary must expose its current lag, drop rate, and rejection reason as telemetry, so an operator can choose between scaling the consumer, slowing the producer, or shedding low-value traffic.
3. Reject "queue grows until OOM" as an acceptable failure mode. Reject "we will scale later" as a substitute for explicit backpressure on a path that already takes user traffic.

## RES-007: Citations and freshness

Authority and background reading for the rules in this file:

- AWS Well-Architected Framework, Reliability Pillar (REL05 and surrounding controls): authority on dependency isolation, timeouts, retries with backoff, and graceful degradation as deployment-architecture concerns. Verify against the Reliability Pillar version current at audit time.
- Google SRE Workbook chapters on overload and addressing cascading failures: background reading on load shedding, graceful degradation, and the difference between transient and persistent failure modes.
- IETF RFC 7231 and successor specifications for HTTP semantics: authority for which response statuses are safe to retry by default.
- IETF RFC 7234 and `Retry-After` semantics: authority for cooperating with explicit retry-control signals from upstreams.

Vendor-specific resilience libraries (circuit-breaker libraries, service-mesh fault-tolerance modules, language-runtime cancellation primitives) are illustrative implementations of the outcomes above; they are not authority. Choose the implementation appropriate to the platform.
<!-- DURABILITY CHECK: Rule relies exclusively on architectural invariants and relative operational thresholds. Valid beyond standard tooling lifecycles. -->
