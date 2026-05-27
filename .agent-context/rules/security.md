---
id_prefix: SEC
domain: security
priority: critical
scope: all-tasks
last_validated: 2026-05-17
applies_to:
  - backend
  - frontend
  - fullstack
keywords:
  - security
  - sec
  - boundary
  - hard
  - rules
  - zero-trust
---

# Security Boundary

Use the security model and libraries already present in the project. If security tooling is unresolved, the LLM must recommend current, maintained options from official docs and OWASP-aligned guidance before implementation.

## SEC-001: Hard rules

1. validate and normalize all data crossing a trust boundary
2. never interpolate untrusted input into queries, shell commands, file paths, templates, logs, or HTML
3. never commit secrets, tokens, credentials, private keys, or production identifiers
4. never invent custom crypto, session, token, or password handling when maintained standards exist
5. enforce authorization at the server or trusted boundary, not only in UI state
6. return safe client-facing errors and keep sensitive detail in protected logs
7. document auth, permission, data exposure, rate-limit, and abuse assumptions before changing sensitive flows
8. apply least privilege to service accounts, API tokens, database users, background jobs, and operator/admin actions
9. retrieve secrets through environment, runtime secret injection, or the project's secret manager; do not store static secrets in source or plaintext config
10. keep `.env` and local secret files covered by `.gitignore`; commit only safe examples such as `.env.example`
11. treat transport encryption, secure cookies, and trusted proxy boundaries as deployment assumptions that must be documented when sensitive traffic is involved
12. when a public surface exists, record explicit decisions for: CORS allow-list (not `*` for credentialed requests), security headers (CSP, HSTS, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`), JWT pitfalls (algorithm pinning, expiration, refresh rotation, storage location), webhook signature verification with timing-safe compare, SSRF defense (egress allow-list or URL validation) when the server fetches user-supplied URLs, and per-resource authorization (not role-only) when records have owners

## SEC-002: Zero-trust API input rules

1. Treat body, query, params, headers, cookies, uploaded files, webhook payloads, and background job payloads as untrusted until validated.
2. Validate and normalize input at the outer boundary before it reaches service, use-case, repository, or domain logic.
3. Services should receive typed, already-validated values and still enforce domain invariants for security-sensitive rules.
4. Sanitization must match the sink: SQL, shell, file path, log, HTML, template, and URL contexts need different protections.
5. Authorization must be resource-aware when data ownership matters. Prefer row, tenant, account, organization, or resource-level checks over role-only checks for sensitive records.
6. For high-risk changes, check current framework security docs and record the relevant source or assumption in the implementation notes.

## SEC-003: Authentication versus authorization

1. Authentication proves identity (this caller is who they claim to be); authorization grants capability (this identity may perform this action on this resource). The two are different concerns and must be implemented as distinct layers.
2. Request-handling code must not conflate them. A handler that checks "is this caller logged in?" and treats the answer as permission to mutate the resource is a defect, regardless of how strong the authentication check is.
3. The authorization decision layer must be independently testable from the request-handling layer. The system must support tests that pass an authenticated principal plus a target resource and a requested action and assert the decision, without standing up the full HTTP transport.
4. Authorization decisions must be recorded as audit events [REF:OBS-004]: who acted, what was acted upon, the requested action, and the decision. A "permitted" decision and a "denied" decision both belong on the audit stream.
5. Reject controllers that mix authentication checks, business policy, and persistence in one block. Reject role-only authorization on resources that have owners; ownership-, tenant-, or relationship-aware authorization is required when records have owners.

## SEC-004: Credential storage

1. Passwords and other reversible-equivalent credentials must be hashed with a memory-hard, computationally-tunable algorithm intended for password storage. Argon2id is the current widely accepted default; bcrypt remains acceptable on platforms where a memory-hard implementation is unavailable or on platforms where the operational surface has already standardized on it. The mechanism must be tunable: as hardware improves, the work factor must be raised without a code change.
2. General-purpose hash functions (MD5, SHA-1, SHA-256, SHA-3 by themselves) are forbidden for password storage. They are designed to be fast; password storage requires a function designed to be slow under attacker hardware.
3. Stored credentials must include a per-credential random salt at the size and shape the chosen algorithm specifies; global pepper, if used, must come from the secret manager [REF:CFG-002], not from source.
4. Verification must be constant-time for the comparison step where the platform supports it, to limit timing-side-channel inference about partial matches.
5. Credential rotation must be supported as a runtime operation: the system must be able to re-hash a credential at the next successful authentication when the work factor or algorithm changes, without forcing a coordinated reset.
6. Reject storing credentials with a general-purpose hash. Reject storing credentials in plaintext for any reason, including "for support recovery". Reject pinning a work factor that the platform's hardware has outpaced; the work factor is a tuning parameter, not a constant.

## SEC-005: Service-to-service authentication

1. Service-to-service identity must be cryptographically verifiable at the receiving end. Acceptable mechanisms include mutual TLS with verified peer certificates, OIDC client-credentials flow with short-lived tokens, signed bearer tokens with a documented issuer and verifiable signature, or platform-equivalent verifiable identity (workload identity, signed JWT-over-mTLS).
2. Tokens used between services must carry a short time-to-live (the value depends on the platform's revocation latency and the operation's blast radius; record the chosen TTL and the rationale, do not inherit a default).
3. The receiving service must validate the token's issuer, signature, audience, expiration, and not-before fields on every request. A cached "yes this is valid" decision that bypasses signature validation is a defect.
4. Reject shared static tokens (a single long-lived API key embedded in every caller) as the sole identity mechanism between services. Static tokens are acceptable only as one factor inside a stronger mechanism, or as a deliberate fallback for narrowly-scoped, audit-logged emergency access.
5. Reject IP-allow-list as a substitute for cryptographic identity on networks the producer does not exclusively control. Reject "trusted network" as a substitute for verifying the caller; zero-trust is the default at the service boundary.
6. Authority for the rules above includes OWASP ASVS sections on authentication and session management, IETF RFC 6749 (OAuth 2.0) and successors for token-based identity, and the platform's current workload-identity documentation. Verify the current versions at audit time.
<!-- DURABILITY CHECK: Rule relies exclusively on architectural invariants and relative operational thresholds. Valid beyond standard tooling lifecycles. -->
