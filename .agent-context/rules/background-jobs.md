---
id_prefix: JOB
domain: background-jobs
priority: high
scope: backend
last_validated: 2026-05-17
applies_to:
  - backend
  - fullstack
keywords:
  - background-jobs
  - workers
  - queues
  - schedules
  - poison-message
  - backpressure
---

# Background Jobs Boundary

A background job is any code path that runs outside a synchronous user request: scheduled tasks, queued asynchronous work, long-lived consumers of a recurring stream, and one-shot operational tasks. The rules below treat these shapes as different. Vendor names that may appear in commentary (queue platforms, scheduler services, stream-processing runtimes) are not authority for this rule.

## JOB-001: Pick the right job shape (Mandatory)

1. Before adding a job, classify it: scheduled (time-driven, fires at intervals or on a calendar), queued (request-driven asynchronous follow-up to user action), recurring stream (continuous consumer of an event stream), or one-shot operational task (manually triggered or run-to-completion). Use the simplest shape that fits.
2. Reject using one shape for everything. A scheduled task that polls a queue is not a queue worker. A queue worker is not a stream consumer. A one-shot operational task is not a permanent scheduled job.
3. Reject "fire-and-forget" jobs without observability into success rate, retry rate, and lag. A job that the system cannot detect failing is not a job; it is a hope.

## JOB-002: Job ownership and runbook (Mandatory)

Every job, regardless of shape, must record the following before it ships:

1. An owner (team or role) accountable for the job's success.
2. An expected runtime budget under normal load.
3. A documented failure outcome: what happens if the job fails partially, fails completely, runs late, or runs twice.
4. A runbook entry, or platform-equivalent operational note, that names the alert thresholds, the recovery steps, and the data the operator needs to investigate a failure.

A job that lacks any of the above is a defect waiting for an incident.

## JOB-003: Idempotency (Mandatory)

1. Every job must be idempotent at the job level: a job that ran partially and was retried, or that was scheduled twice for the same input, must converge to the same final state. The system must not double-charge, double-write, double-notify, or double-grant.
2. Idempotency must be enforced on the side of the job that holds the durable record (the database row, the external API's idempotency key acceptance, the event-store dedup key), not only on the side that emits the trigger.
3. The job must distinguish "I already did this" (success, no further work) from "the input changed" (treat as a new request) using a stable input identifier; a re-emission of the same logical work must collapse to a single committed effect.
4. Reject jobs whose only protection against double-execution is "the queue is configured exactly-once". Treat queue delivery guarantees as best-effort and enforce idempotency in the application.

## JOB-004: Long-running and durable execution (Mandatory)

1. A long-running job must extend its lease, visibility timeout, or platform-equivalent ownership token while it is still doing useful work, so its mid-flight progress does not get re-dispatched to a second worker.
2. A long-running job must checkpoint progress to durable storage at intervals that bound replay cost: a process crash must not require redoing more work than the platform's documented loss tolerance allows.
3. A long-running job must handle graceful shutdown: when the runtime signals termination (deploy, scaling event, host eviction), the job must stop at the next checkpoint, mark its lease as relinquishable, and exit within the platform's drain window.
4. Reject long-running jobs that hold an in-memory buffer with no checkpoint, that ignore graceful-shutdown signals, or that allow a duplicate worker to start when their lease expires without serializing on a durable lock.

## JOB-005: Poison messages and dead letters (Mandatory)

1. Every queue or stream consumer must define a maximum attempt count. After that count, the message must be moved to a dead-letter destination, not retried indefinitely.
2. The dead-letter destination must be observable: an alert threshold on its size, an inspectable record per entry, and a documented human recovery path that takes the operator from "alert" to "decided to replay, edit, or discard".
3. Replays out of the dead-letter destination must respect job-level idempotency: the original handler must not double-apply effects when a dead-letter message is replayed alongside an already-succeeded retry.
4. Reject infinite retries on a poison input. Reject silent message drops with no dead-letter or audit trail. Reject dead-letter destinations that no human is alerted on.

## JOB-006: Time, schedules, and fan-out (Mandatory)

1. Schedule definitions and time-of-event fields must be stored in a timezone-unambiguous form (UTC for storage, with the original timezone retained as metadata when the schedule is meaningful in a local calendar). Naive local-time storage of a moment that crosses a daylight-saving transition is forbidden.
2. Where a schedule applies to many entities (per-customer billing run, per-tenant report generation, per-device sync), the implementation must stagger fan-out with jitter so the entities do not all execute on the same instant; the platform's queue and downstream APIs see a smoothed load curve, not a thundering herd.
3. Schedules that depend on a calendar (month-end, billing-cycle) must specify the resolution rule for ambiguous calendar dates (the 31st of a 30-day month, the leap day) at design time, not at the first failure.
4. Reject schedules whose timezone is implicit. Reject coordinated fan-out that treats every entity as urgent at the same wall-clock instant.

## JOB-007: Backpressure (Mandatory)

1. A queue or stream consumer that cannot keep up must shed load, throttle producers, or expose its lag, not silently grow until memory or storage is exhausted.
2. The consumer must expose its current lag, its rejection or shed rate, and its in-flight count as telemetry; the operator must be able to answer "is the consumer slow, the producer fast, or is the queue full?" without reading the queue directly.
3. Where the producer is a user request, backpressure must be communicated synchronously to the user (a throttle, a delayed acknowledgement, a queued-for-later response with a tracking identifier), not silently absorbed and lost.
4. Reject implementations where the only response to overload is "scale the worker pool"; scaling is a remediation, not a substitute for explicit backpressure.

## JOB-008: Reject these bad habits

1. Reject scheduled jobs that polling-loop through a database table that should have been a queue.
2. Reject queue workers that bake business state into the queue payload because no durable record exists.
3. Reject stream consumers that hold long-lived in-memory aggregates without a checkpoint and replay strategy.
4. Reject "one-shot" operational tasks that have shipped to production three times; if a task is re-run regularly, it is a recurring job and needs the JOB-002 fields.
5. Reject "the queue handles retries for us" as the entire retry strategy; pair it with idempotency and a dead-letter destination.

## JOB-009: Citations and freshness

Authority and background reading for the rules in this file:

- IETF RFC 3339: authority for the wire shape of timezone-aware timestamps used in job payloads.
- Cron expression specifications and the platform scheduler's documentation: authority for the schedule grammar in use; verify behavior on daylight-saving transitions and leap days against the platform's current major version, because behavior on these edge cases varies between schedulers and between versions of the same scheduler.
- AWS Well-Architected Reliability Pillar (REL05) and Google SRE Workbook chapters on overload and addressing cascading failures: background reading on backpressure, dead-letter queues, and graceful degradation as deployment-architecture concerns.
- Job-platform documentation for the runtime in use: authority for visibility-timeout semantics, lease extension, retry-with-backoff defaults, and dead-letter-queue conventions.

Vendor-specific job platforms (queue services, stream processors, scheduler services) are illustrative implementations of the outcomes above; they are not authority. Use the platform-appropriate mechanism that exists in the deployed runtime.
<!-- DURABILITY CHECK: Rule relies exclusively on architectural invariants and relative operational thresholds. Valid beyond standard tooling lifecycles. -->
