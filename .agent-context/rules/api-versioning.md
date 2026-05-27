---
id_prefix: VER
domain: api-versioning
priority: high
scope: api
last_validated: 2026-05-17
applies_to:
  - backend
  - fullstack
keywords:
  - api-versioning
  - deprecation
  - breaking-changes
  - support-window
  - sunset
  - migration
---

# API Versioning Boundary

A public API surface is a contract with callers the producer does not control. Versioning safety is the property that the producer can evolve the contract without silently breaking those callers, and that callers can recognize and respond to evolution before it forces an outage. Vendor names that may appear in commentary (API gateways, contract registries, deprecation-tracking platforms) are not authority for this rule.

## VER-001: Single versioning strategy per surface (Mandatory)

1. Each public API surface (a service's HTTP endpoints, a service's RPC methods, a published event schema, a CLI's command shape, a published SDK) must adopt one versioning strategy and apply it consistently. Acceptable strategies include URL-path versioning, header-based versioning, content-negotiation, schema-driven versioning where the schema carries the version, and date-based versioning. The choice belongs to the surface, not to the developer of the moment.
2. Reject mixed strategies on the same surface (path-versioned for some endpoints and header-versioned for others; date-versioned for queries and unversioned for mutations). The mix forces every caller to learn two rules where one is sufficient.
3. The strategy and its current supported version range must be documented in the surface's contract documentation, not inferred from example URLs or sample headers.

## VER-002: Define breaking and non-breaking changes (Mandatory)

1. The following are breaking changes regardless of strategy:
   - Removing or renaming a request field, a response field, an endpoint, an RPC method, an event type, or a CLI command.
   - Tightening request validation (a value previously accepted is now rejected; a previously optional field is now required).
   - Changing the default value or default behavior of an existing field, parameter, or operation.
   - Changing the type, units, encoding, or semantic meaning of an existing field.
   - Changing the documented error semantics (status code, error code, or error shape) of an existing endpoint.
2. The following are non-breaking changes:
   - Adding a new optional request field with a documented default behavior when the field is absent.
   - Adding a new response field that older clients can ignore, on a surface whose contract permits unknown fields (most modern HTTP and event surfaces do; verify per surface).
   - Adding a new endpoint, RPC method, event type, or CLI command.
   - Adding a new optional header with a documented absent-default.
3. Any change that is breaking by the definition above must use the surface's versioning strategy or wait for the next major version. Reject silent breaking changes (a field type narrowed without a version bump; a status code changed without a version bump).

## VER-003: Deprecation discipline (Mandatory)

1. A deprecation announces, while the deprecated path is still functional, that callers must migrate. Deprecation must include all of the following before the deprecated path can be removed:
   - A documented sunset date or replacement-criterion that callers can plan against.
   - In-band signaling on the deprecated path, using the platform's standardized mechanism where one exists. For HTTP surfaces, RFC 9745 (the `Deprecation` header) and RFC 8594 (the `Sunset` header) are the current standardized mechanisms; signal with both where the platform and clients support them, and document the in-band signal in the contract documentation. Adoption of these specifications is uneven, so out-of-band communication is acceptable when the in-band channel is unavailable, provided the out-of-band path is documented and reaches affected callers.
   - A migration guide published in the same release that begins deprecation, that names the replacement and shows at least one example transformation per use case the deprecated path supported.
   - Telemetry that tracks remaining traffic on the deprecated path, broken down by caller identity where the surface supports identifying callers, so the producer knows when removal is safe.
2. Reject silent removal of an endpoint, field, or method that has not gone through deprecation. "We checked our analytics and nobody used it" is not deprecation; it is an unannounced breaking change with extra steps.
3. The sunset date must respect the surface's documented support window (VER-004); a sunset announced today and effective tomorrow is not a sunset, it is a removal.

## VER-004: Support windows (Mandatory)

1. Each public API surface must publish an explicit support window: how long after a new major version ships will the previous major version continue to receive bug fixes, security fixes, and uptime guarantees. The window must be expressed in calendar time (months or years), not in subjective terms.
2. The producer must continue to operate prior versions within the support window even when the producer prefers callers had migrated. Removing a still-supported version is a breach of the published contract.
3. End-of-life must be announced before the support window expires, with sufficient lead time for callers to migrate. The lead time required depends on the caller population (an internal service may migrate in a sprint; a public SDK with mobile-app callers may need a year because of app-store update cycles); the producer must document the assumption.
4. Reject "we will remove it when we feel like it" as a support policy. Reject removing an endpoint, field, or method while it is still inside its published support window.

## VER-005: Additive evolution as default (Mandatory)

1. The default response to a feature request that touches an existing surface is to evolve additively: add a new optional field, a new endpoint, a new optional behavior triggered by an explicit opt-in. Reach for a new major version only when additive evolution costs more than client migration would cost (a fundamental shape change, a security correction that cannot coexist with the old shape, a deprecated dependency removal that callers must follow).
2. A new major version is itself a contract that incurs all of VER-001, VER-002, VER-003, and VER-004; it is not a license to ship unannounced breaking changes under a new path.
3. Reject `/v2/` (or platform-equivalent) path forks that duplicate the previous version's codebase without a deprecation telemetry plan, a sunset date for the prior version, and a migration guide. A new path without these is two codebases the producer must maintain in parallel forever.
4. The producer must not run a `/v1/` and a `/v2/` indefinitely on the same surface in the absence of a sunset plan; that pattern doubles operational cost and dilutes the contract.

## VER-006: Compatibility testing (Mandatory)

1. Every release that touches a public surface must run a compatibility check against the surface's previous supported versions: previously valid requests still validate, previously valid responses still parse against published schemas, previously documented error shapes still surface for the same error conditions.
2. The compatibility check must run in CI, not as a manual pre-release step. Reject "we test compatibility manually before release"; manual compatibility checks miss regressions in less-trafficked endpoints.
3. The compatibility check's failure must block the release, not file a follow-up ticket.

## VER-007: Reject these bad habits

1. Reject changes that are breaking by VER-002 but ship without a version bump or a deprecation cycle.
2. Reject deprecation banners in release notes that have no in-band signal on the deprecated path.
3. Reject sunset dates that are not enforced; a producer who keeps the deprecated path alive past sunset trains callers to ignore future sunsets.
4. Reject `/v2/` forks of an existing surface that the producer cannot show a migration plan for.
5. Reject contract documentation that lists endpoints without naming the version they belong to.

## VER-008: Citations and freshness

Authority sources for the rules in this file:

- IETF RFC 9745: standardized HTTP `Deprecation` response header for in-band deprecation signaling. Adoption is uneven across clients and intermediaries, so pair with out-of-band documentation.
- IETF RFC 8594: standardized HTTP `Sunset` response header for in-band sunset-date signaling. Same adoption caveat as RFC 9745.
- IETF RFC 9457: problem-detail responses for HTTP errors; authority for keeping error semantics stable across versions.
- OpenAPI Specification (current major version): authority for declaring HTTP surface versioning in machine-readable form when the surface uses HTTP.
- AsyncAPI Specification (current major version): authority for declaring event-driven surface versioning when the surface publishes events.

Vendor-specific API gateways, contract registries, and deprecation-tracking platforms are illustrative implementations of the rules above; they are not authority. The mechanism is platform-specific; the contract obligations above are not.
<!-- DURABILITY CHECK: Rule relies exclusively on architectural invariants and relative operational thresholds. Valid beyond standard tooling lifecycles. -->
