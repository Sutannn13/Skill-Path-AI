---
id_prefix: OBS
domain: observability
priority: high
scope: backend
last_validated: 2026-05-17
applies_to:
  - backend
  - fullstack
keywords:
  - observability
  - telemetry
  - logs
  - metrics
  - traces
  - slo
  - alerts
---

# Observability Boundary

Observability is the property of a system that lets an operator answer, after the fact, which user, which code path, and which dependency caused a given outcome, using signals captured at runtime. Treat metrics, logs, and traces as derived views over structured per-request events; the underlying obligation is that the captured events are enough to reconstruct what happened, regardless of which storage shape a vendor calls a "pillar".

## OBS-001: Hard rules (Mandatory)

1. Every request, job, and message-handler invocation must emit a structured event that carries: a stable request or correlation identifier, the operation name, the upstream caller identity, the downstream dependencies it touched, the outcome status, and the duration. The event payload must be machine-parseable, not a free-text log line.
2. Trace context must propagate across every in-process and cross-process boundary the system controls. The system must not drop or rewrite an inbound trace identifier; it must extend it.
3. Logs, metrics, and traces must share the same correlation identifier so an operator can pivot between them without manual joining.
4. Configuration of telemetry destinations, sampling rates, and log levels must come from runtime configuration; the system must not require a code change to redirect signals or to raise verbosity during an incident.
5. The system must redact or omit secrets, tokens, full request and response bodies, and personal data from logs, metric labels, span attributes, and error reports. Identifiers, counts, sizes, and shapes are acceptable.
6. The system must expose a documented health surface that distinguishes liveness, readiness, and startup where the runtime supports it. A `200 OK` that does not check critical dependencies is not a readiness signal.

## OBS-002: Reject these bad habits

1. Reject metric label cardinality that is unbounded by design. User identifiers, request identifiers, full URLs, raw query strings, and session identifiers must not be metric labels; they belong in event attributes that the storage tier can index without exploding cardinality.
2. Reject vendor-proprietary instrumentation when an open standard provides equivalent coverage. Where the platform supports it, prefer instrumentation that exports through W3C Trace Context and OpenTelemetry semantic conventions so the backend storage choice can change without re-instrumenting the application.
3. Reject substituting one signal for another. Do not parse free-text logs to derive metrics that should have been recorded as metrics. Do not search free-text logs to reconstruct call graphs that should have been recorded as traces. Each signal type carries different sampling, retention, and indexing trade-offs; collapsing them hides those trade-offs.
4. Reject logging of full request bodies, headers containing authorization material, raw uploads, decrypted secrets, plaintext tokens, and direct personal identifiers. A log line that would leak a credential if forwarded to a third-party storage provider is a defect.
5. Reject paging humans for symptoms that have no documented user impact. Do not page on raw resource utilization, on a single failed request, or on a single retry; page on a sustained breach of a documented service-level objective whose error budget has been spent.
6. Reject "happy-path-only" telemetry. Error paths, retries, fallbacks, throttles, circuit transitions, and degraded-mode fallbacks must emit events of equal or higher fidelity than the success path; a system that is loud only when healthy is observable only when it is fine.
7. Reject silent drops. The telemetry pipeline itself must report when it sheds events, drops spans, or rate-limits log output, so an operator can distinguish "no events" from "events lost".

## OBS-003: SLOs and alerts (Mandatory)

1. Every alert that pages a human must be backed by a documented service-level objective expressed in user-facing terms (availability of a journey, latency of a critical interaction, freshness of a derived dataset). Alerts without an SLO and an explicit error-budget intent are noise.
2. SLO definitions must record: the user journey or contract being measured, the success criterion (status, latency threshold, freshness threshold), the measurement window, the target attainment, and the agreed action when the error budget burns at an elevated rate.
3. Multi-window, multi-burn-rate alerting (or platform equivalent) is preferred so a fast burn pages quickly without amplifying flapping on slow burns. Single-threshold alerting on a raw counter is acceptable only when no error budget can be defined for the signal.
4. Alert routing must distinguish actionable alerts (paged human required to recover the user journey) from informational alerts (record-only, dashboard-only). Pager rotations must not receive informational alerts.
5. Telemetry retention windows must cover at least one full SLO measurement window plus the longest documented incident-investigation window the team commits to.
6. Reject alerts whose runbook is "investigate the dashboard". Every actionable alert needs a documented next step that a non-author on-call can execute.

## OBS-004: Audit and forensics (Mandatory)

1. Security-relevant events (authentication outcomes, authorization decisions, privilege changes, data exports, configuration changes, key rotations) must be emitted on a separate, append-only event stream with stricter retention and access controls than operational telemetry.
2. Audit events must record: who acted, what was acted upon, when, from which network identity, and the outcome. Source identity must come from the authenticated principal, not from a self-reported value in the request body.
3. Audit-event storage must remain readable when the application's primary database is unavailable, or the audit event must be considered untrustworthy.
4. Reject mixing audit events into the same low-retention, broadly readable channel as operational logs.

## OBS-005: Citations and freshness

Authority sources for the rules in this file:

- W3C Trace Context (W3C Recommendation): the canonical contract for propagating `traceparent` and `tracestate` across boundaries. Verify the current Recommendation when authoring instrumentation that crosses an organizational boundary.
- OpenTelemetry semantic conventions: the open-standard set of attribute names for traces, metrics, and logs across HTTP, RPC, messaging, and database operations. Use the version current at audit time; older fixed snapshots drift.
- RFC 5424 (The Syslog Protocol): authority for severity ordering when mapping log levels onto a transport that requires it.
- OWASP ASVS: requirements for security-relevant audit logging, including the events listed above as audit-stream candidates.

These citations are illustrative anchors, not vendor endorsements. Vendor names that may appear in commentary (for example, the names of trace backends, log aggregators, or APM products) are not authority for this rule.
<!-- DURABILITY CHECK: Rule relies exclusively on architectural invariants and relative operational thresholds. Valid beyond standard tooling lifecycles. -->
