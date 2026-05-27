---
id_prefix: CFG
domain: config-and-flags
priority: high
scope: backend
last_validated: 2026-05-17
applies_to:
  - backend
  - frontend
  - fullstack
keywords:
  - configuration
  - feature-flags
  - kill-switch
  - environment
  - secrets
  - rollout
---

# Configuration and Feature Flags Boundary

Configuration is data that the application reads to decide how to run. Feature flags are configuration whose value is a decision about behavior, evaluated per request, per user, or per tenant. The two rules sets below treat them as different, because their lifetimes, audiences, and failure modes are different. Vendor names that may appear in commentary (configuration providers, feature-flag platforms, secret managers) are not authority for this rule.

## CFG-001: Configuration sources (Mandatory)

1. The application must read all configuration values from one of: process environment, runtime configuration injected by the deploy platform, a documented configuration file outside the source tree, or a secret manager. Constants embedded in source code are forbidden when the value is environment-specific (URLs, hostnames, credentials, region identifiers, tenant identifiers, model identifiers).
2. The application must validate every configuration value at startup. A missing required value, a malformed value, or a value outside the documented range must abort startup with a readable error that names the field and the source. Lazy validation that surfaces in a request handler an hour later is forbidden.
3. The application must distinguish "no configuration" from "configuration loaded with empty value"; the two cannot be the same code path. A missing key must abort startup; an explicit empty value is a configured choice.
4. Configuration that influences security or correctness (allowed origins, signing keys, allow-lists, billing thresholds) must come from a controlled source the operator can audit. The application must record at startup which configuration source supplied the value, without printing the value itself when it is sensitive.
5. Reject environment-specific constants in code (`if env === "prod"`, hard-coded production hostnames, production-only API endpoints behind a comment). Branch on capability flags or configuration values instead. Reject treating a build-time constant as a substitute for runtime configuration when the same artifact is shipped to multiple environments.

## CFG-002: Secret handling (Mandatory)

1. Secrets must be retrieved through the platform's secret manager, runtime injection, or environment variables sourced from a controlled secret store. Static secrets in source, in repository configuration, in container images, or in plaintext configuration files are forbidden.
2. Secrets must not be logged, included in error responses, included in telemetry payloads, or embedded in any structured event. Identifiers that name the secret (key id, version, source) are acceptable; the secret value is not.
3. Secret rotation must be a runtime event the application handles without redeploy on platforms that support it; on platforms that do not, the redeploy procedure must explicitly re-read secrets, not cache them across deploys.
4. Reject treating a secret as a feature flag and a feature flag as a secret. Secrets and behavioral flags have different audit, rotation, and exposure rules; collapsing them violates both.

## CFG-003: Feature flag taxonomy (Mandatory)

1. Every feature flag must declare its type before it is used:
   - Release flags: short-lived, gate the rollout of new code; removed after the rollout completes.
   - Operational kill switches: long-lived, allow an operator to disable a code path during an incident; removed only when the gated code path is removed.
   - Experiment flags: assign users into variants and feed the assignment into analytics; removed when the experiment concludes.
   - Entitlement flags: gate a capability behind a permission, plan, license, or tenant attribute; live for the lifetime of the capability.
2. The mechanism that evaluates each flag type may differ. Reject one mechanism that mixes release flags, kill switches, experiment flags, and entitlement flags without distinguishing them, because the right rollout, audit, and removal disciplines differ.
3. Every flag must record: the flag's type, its owner, its removal criterion (concrete, measurable), and an expiry date. A flag past its expiry without a documented extension is technical debt, not a feature; the audit must surface it.

## CFG-004: Flag evaluation safety (Mandatory)

1. Every flag evaluation must define a safe default that the system uses when the flag service is unreachable, the value cannot be parsed, or the evaluation context is missing. The safe default must not enable destructive, billable, or irrecoverable behavior.
2. Flag evaluation must not block a request on a remote call by default; the application must read from a locally cached value with bounded staleness, or the flag platform must run a sidecar with a documented refresh interval, so a flag-service outage cannot turn into a request-handler outage.
3. The application must record the flag value used for a given request decision (in a structured event, not a free-text log) so the operator can answer, after the fact, "which variant did this user see?". The recorded value must not include any secret payload that the flag carries.
4. Reject flag evaluations that have no safe default, that block synchronously on a remote call from a hot request path, or that cannot be reproduced in telemetry.

## CFG-005: Environment branching (Mandatory)

1. The application must not branch business logic on the name of the environment. `if env === "prod"` and its variants are forbidden; the correct branch is on a configuration value or a capability flag whose name describes the capability, not the environment that happens to enable it.
2. Configuration profiles per environment are acceptable when they are explicit data (a `production.yaml` file the deploy platform selects, a parameter store path scoped per environment) rather than embedded conditionals in code.
3. Reject conditionals that quietly disable safety checks in non-production environments and re-enable them in production. The check belongs in code; configuration controls thresholds, allow-lists, or capability flags, not whether the check exists.

## CFG-006: Reject these bad habits

1. Reject configuration values that exist only as comments in source ("set this to your production URL").
2. Reject feature flags older than their declared expiry that nobody owns.
3. Reject "stub the flag for tests" patterns that bypass the flag mechanism in non-test code paths.
4. Reject configuration validators that only run in development.
5. Reject deploy procedures that ship a new mandatory configuration field without a deploy-ordering note that pairs the new field with the code that requires it.

## CFG-007: Citations and freshness

Authority sources for the rules in this file:

- The Twelve-Factor App, Section III "Config": authority for the principle that environment-specific configuration is data, not source.
- OWASP ASVS sections on secret management and credential storage: authority for what counts as a secret, how it must be stored, and how it must not be logged or transmitted.
- Continuous-delivery and feature-flag literature on flag taxonomy and lifecycle (release flags vs operational kill switches vs experiment flags vs entitlement flags): authority for the multi-type discipline above.

Vendor-specific configuration providers, secret managers, and feature-flag platforms are illustrative implementations of the outcomes above; they are not authority. Use the platform-appropriate mechanism that exists in the deployed runtime.
<!-- DURABILITY CHECK: Rule relies exclusively on architectural invariants and relative operational thresholds. Valid beyond standard tooling lifecycles. -->
