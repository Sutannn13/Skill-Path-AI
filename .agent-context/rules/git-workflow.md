---
id_prefix: GIT
domain: git-workflow
priority: medium
scope: governance
applies_to:
  - backend
  - frontend
  - fullstack
keywords:
  - git-workflow
  - git
  - commit
  - branch
  - pull-request
  - gitignore
---

# Git Workflow - Clean History, Atomic Commits

Your git log is a changelog. If it reads like gibberish, your team is lost.

## GIT-001: Commit Message Format (Conventional Commits Enforced)

1. Use Conventional Commits for every commit: `<type>(<scope>): <description>`.
2. Use the optional body to explain WHY, not WHAT.
3. Use the optional footer for breaking changes and issue references.
4. Use only the strict types set: `feat` for new feature, `fix` for bug fix, `refactor` for code restructuring with no behavior change, `docs` for documentation only, `test` for adding or fixing tests, `chore` for build, CI, config, or dependencies, `perf` for performance improvement, `style` for formatting and semicolons with no logic change, and `ci` for CI/CD changes.
5. Type is mandatory. No commits without a type prefix.
6. Scope is required for module or feature changes. Use the module or feature name.
7. Description must use imperative mood: "add", not "added" or "adds".
8. Keep the subject line at max 72 characters.
9. Body explains WHY; the diff shows what.
10. Reject banned commit messages: `fix bug`, `updates`, `WIP`, `asdf`, `misc changes`, `working now`, `final fix`, and `fix fix fix`.

## GIT-002: Branching Model and Merge Strategy

1. Keep `main` production-ready; its purpose is production-ready code, and its merge strategy is merge commit or squash according to project policy.
2. Use `develop` as an integration branch only when the project uses GitFlow; its purpose is integration.
3. Name feature branches with the pattern `<type>/<ticket-id>-<short-description>`.
4. Example branch names include `feat/AUTH-123-jwt-refresh`, `fix/PAY-456-checkout-race-condition`, `refactor/USER-789-extract-validation`, and `chore/INFRA-101-upgrade-node-20`.
5. Branch from `main`, or from `develop` when using GitFlow.
6. Keep branches short-lived, max 2-3 days.
7. Rebase on `main` before creating a PR; do not merge main into your branch.
8. Delete the branch after merge.

## GIT-003: Pull Request Standards

1. Keep PR size reviewable: small is 1-100 lines changed and ideal because it is easy to review; medium is 100-300 and acceptable, split if possible; large is 300-500 and needs justification; massive is 500+ and must be split into smaller PRs. Treat these thresholds as the PR size verdict.
2. Split a PR when it touches more than 5 files across different modules; it is doing too much.
3. PR descriptions must follow the PR Description Template: What, Why, How, Testing, and Screenshots when the change affects UI.
4. What gives a brief description of what the PR does.
5. Why explains why the change is needed and links to the issue or ticket.
6. How gives the high-level approach and mentions non-obvious design decisions.
7. Testing lists unit tests, integration tests when applicable, and manual testing steps.
8. Every PR needs at least 1 approval, author resolves all comments before merge, CI must pass lint, test, and build, no `// TODO` appears without a linked issue, and production code contains no `console.log` debugging statements.

## GIT-004: Commit Atomicity

1. Each commit must be a complete, working unit.
2. Reject banned sequences where a feature commit is followed by fix imports, fix typos, or other fix-up commits needed to make the previous commit work.
3. Prefer one complete working commit for a cohesive module, such as model, service, controller, and tests for user registration.
4. Split into logical chunks only when each chunk compiles and passes tests independently.
5. Every commit on `main` should compile, pass lint, and pass tests.
6. Use interactive rebase (`git rebase -i`) to squash fix-up commits before merging.

## GIT-005: .gitignore Standards

1. Ignore dependency and cache directories: `node_modules/`, `vendor/`, `venv/`, `__pycache__/`, `.gradle/`, and `target/`.
2. Ignore environment files: `.env`, `.env.local`, and `.env.*.local`.
3. Ignore IDE and OS artifacts: `.idea/`, `.vscode/settings.json`, `*.swp`, `*.swo`, `.DS_Store`, and `Thumbs.db`.
4. Ignore build output: `dist/`, `build/`, `out/`, `*.min.js`, and `*.min.css`.
5. Ignore logs: `*.log` and `npm-debug.log*`.
6. Commit configuration templates and formatter or linter config: `.env.example`, `.editorconfig`, `.prettierrc`, `.eslintrc.*`, and `tsconfig.json`.
7. Commit standard development commands and environments when they are part of the project contract: `docker-compose.yml`, `Makefile`, or `Taskfile`.

## GIT-006: Git Health Check

1. Before pushing, verify all commits follow Conventional Commits format.
2. Before pushing, verify there are no fixup commits; squash them.
3. Before pushing, verify the branch is rebased on latest main.
4. Before pushing, verify CI passes locally: lint, test, and build.
5. Before pushing, verify there are no secrets in any commit; check with `git log -p | grep -i "password\|secret\|key"`.
6. Before pushing, verify there are no merge commits in the feature branch; rebase instead.
