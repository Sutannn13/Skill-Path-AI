# Contributing to SkillPath

Thank you for your interest in contributing to SkillPath. This project is an open-source career operating system built for students and beginner developers. Every contribution helps make career tools more accessible.

## Project Status

SkillPath is **early-stage and pre-launch**. The foundation is being built, and many features are still in active development. This means the codebase is evolving, APIs may change, and your feedback on developer experience is especially valuable right now.

## Who Is This For?

SkillPath targets students and beginner developers who want to:

- Assess their current skills against real job requirements.
- Generate structured learning roadmaps.
- Analyze their GitHub portfolio for improvement opportunities.
- Track weekly learning progress.
- Discover and save relevant job postings.

## Types of Contributions Welcome

We appreciate contributions across many areas:

- **Bug reports** — found something broken? Open an issue.
- **Documentation improvements** — typos, clarity, missing steps, better examples.
- **UI/UX improvements** — layout, responsiveness, visual polish, interaction quality.
- **Accessibility improvements** — screen reader support, keyboard navigation, color contrast.
- **Tests** — unit tests, integration tests, edge case coverage.
- **Security hardening** — auth flow review, input validation, RLS policy review.
- **Supabase/RLS review** — verify that Row Level Security policies are correct and complete.
- **AI fallback improvements** — improve deterministic fallback quality when AI is unavailable.
- **Job source integration** — new job data sources, data quality improvements.
- **Roadmap and assessment improvements** — quiz quality, scoring accuracy, project review flow.

## Local Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

### Environment Variables

Supabase, Gemini, and GitHub tokens are **optional** depending on which features you are testing:

- **Supabase** (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) — required for auth and data persistence.
- **Gemini** (`GEMINI_API_KEY`) — optional. AI features fall back to deterministic logic when unavailable.
- **GitHub** (`GITHUB_TOKEN`) — optional. Increases GitHub REST API rate limits for portfolio analysis.
- **Adzuna** (`ADZUNA_APP_ID`, `ADZUNA_APP_KEY`) — optional. Enables the Adzuna job source.
- **Cron** (`CRON_SECRET`) — required only for production cron job sync.

> **Never commit `.env` or `.env.local`.** These files are in `.gitignore` and must stay there. Do not add secrets, API keys, or credentials to any tracked file.

## Branch Naming

Use a descriptive prefix for your branch:

| Prefix | Purpose |
| --- | --- |
| `fix/` | Bug fixes |
| `feat/` | New features |
| `docs/` | Documentation changes |
| `security/` | Security improvements |
| `chore/` | Maintenance, refactoring, tooling |

Examples: `fix/quiz-score-calculation`, `feat/saved-jobs-filter`, `docs/setup-clarification`.

## Commit Style

Use short, conventional commit messages:

```
feat: add skill gap summary to dashboard
fix: correct RLS policy for saved_jobs
docs: update local setup instructions
refactor: extract quiz scoring logic
test: add roadmap persistence edge cases
chore: update eslint config
```

## Pull Request Checklist

Before submitting a pull request, verify the following:

- [ ] `npm run lint` passes.
- [ ] `npm run typecheck` passes.
- [ ] `npm run build` succeeds.
- [ ] No secrets, `.env` files, or credentials are committed.
- [ ] Documentation is updated if behavior changes.
- [ ] Screenshots are included for UI changes.
- [ ] RLS policies and server-side authorization are checked if the change touches protected data.

## Code Review Expectations

- **Small PRs preferred.** Focused changes are easier to review and less likely to introduce regressions.
- **Explain tradeoffs.** If you chose one approach over another, briefly say why.
- **Keep fallback behavior working.** SkillPath uses deterministic fallbacks when AI services are unavailable. Do not break this contract.
- **Avoid mock data unless explicitly marked as demo.** Real data paths and demo paths must stay clearly separated.

## Security Issues

If you discover a security vulnerability, **do not open a public issue with exploit details**. See [SECURITY.md](SECURITY.md) for responsible disclosure instructions.

## License

By contributing to SkillPath, you agree that your contributions will be licensed under the [MIT License](LICENSE).
