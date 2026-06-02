# Security Policy

SkillPath takes security seriously. This document explains how to report vulnerabilities, what is in scope, and what security practices contributors should follow.

## Project Status

SkillPath is **early-stage and pre-launch**. Security foundations are in place, but the project has not undergone a formal security audit. Reports and review contributions are highly valued.

## Supported Versions

| Version | Supported |
| --- | --- |
| `main` branch (latest public code) | Yes |
| Older commits / tags | No |

Only the latest code on the `main` branch is actively maintained. There are no versioned releases yet.

## Reporting a Vulnerability

### Preferred: GitHub Private Vulnerability Reporting

If GitHub Security Advisories and private vulnerability reporting are enabled on this repository, please use that channel. It allows you to report details privately without exposing them publicly.

### Alternative: Request a Private Contact

If private reporting is not available, open a public issue with the following format:

```
Title: [Security] Private contact requested for vulnerability report
Body: I have found a potential security issue and would like to report it privately.
      Please provide a secure contact method.
```

**Do not include exploit details, proof-of-concept code, tokens, private data, or vulnerability specifics in a public issue.** The maintainer will respond with a private contact method.

## Scope

The following areas are in scope for security reports:

- **Supabase Auth** — session handling, token refresh, authentication bypass.
- **Row Level Security** — RLS policy gaps, unauthorized data access.
- **Server-side authorization** — role checks, admin route protection, middleware bypasses.
- **API route validation** — input validation, injection, unexpected data handling.
- **Cron secret protection** — unauthorized access to cron sync endpoints.
- **Job ingestion validation** — malicious or malformed job data processing.
- **AI prompt/data handling** — prompt injection, unsafe data passed to/from AI services.
- **GitHub token handling** — token exposure, improper storage, scope escalation.
- **Dependency vulnerabilities** — known CVEs in project dependencies with a viable exploit path.
- **XSS/input validation** — cross-site scripting, unsafe HTML rendering, unescaped user input.

## Out of Scope

The following are **not** considered in-scope vulnerabilities:

- Social engineering attacks against maintainers or users.
- Spam or content abuse unrelated to application security.
- Denial of service (DoS) or load testing without prior written permission.
- Vulnerabilities in third-party dependencies that have no demonstrable exploit path within this project.
- Issues that require physical access to a user's device or authenticated session.
- Reports based on outdated code that has already been fixed on `main`.

## Security Best Practices for Contributors

When contributing to SkillPath, follow these rules:

1. **Never commit `.env` or `.env.local`.** These files contain secrets and are excluded by `.gitignore`.
2. **Never expose `SUPABASE_SERVICE_ROLE_KEY` to the client.** This key has full database access and must only be used in server-side code.
3. **Only `NEXT_PUBLIC_*` variables can be used in browser code.** All other environment variables must remain server-only.
4. **Enforce authorization server-side.** Do not rely on UI-only role checks or client-side guards for access control.
5. **Do not trust UI-only role checks.** A user can modify client-side code. All sensitive operations must verify permissions on the server.
6. **Validate external data.** Job data, GitHub API responses, and any external input must be validated and sanitized before use.
7. **Keep deterministic fallback safe.** When AI services are unavailable, fallback logic must not introduce security regressions or expose internal data.

## Response Expectations

- **Acknowledgment.** The maintainer will acknowledge a report as soon as practical.
- **Triage.** Reports will be assessed for severity and impact.
- **Private fix.** Critical issues may be fixed privately before public disclosure.
- **Credit.** Reporters will be credited in the fix (commit message, changelog, or advisory) if they wish.

## Contact

For security-related questions that do not involve a specific vulnerability, open a regular issue or discussion on the repository.
