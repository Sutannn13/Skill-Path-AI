---
id_prefix: DEP
domain: efficiency-vs-hype
priority: medium
scope: all-tasks
applies_to:
  - backend
  - frontend
  - fullstack
keywords:
  - efficiency-vs-hype
  - dep
  - dependency
  - latest-compatible-first
---

# Dependency and Tooling Boundary

## DEP-001: Latest-Compatible-First Rule

1. The LLM may choose modern libraries and tooling when they fit the project.
2. This rule does not prefer "no library", "always add a library", or any fixed dependency set.
3. New dependencies are allowed when they create a better practical tradeoff than custom implementation.
4. The decision should be based on whether the dependency meaningfully improves efficiency, shortens delivery time, improves correctness, reduces maintenance burden, unlocks a stronger user experience, or avoids unnecessary in-house code.
5. Do not treat dependency avoidance as an engineering virtue by itself.
6. A small, maintained, well-scoped library can be the simpler and safer choice than custom code, especially for accessibility primitives, animation, gestures, data visualization, parsing, protocol handling, security-sensitive helpers, or browser/runtime capabilities with tricky edge cases.

## DEP-002: Before adding or recommending a dependency

1. check current official docs, release notes, and setup guidance when the ecosystem decision matters
2. choose the latest stable compatible dependency version unless a project constraint blocks it
3. use the official scaffolder or setup command when it creates the current supported project shape
4. do not hand-assemble fresh framework projects by habit when the official setup flow gives safer current defaults; document the reason when manual assembly is better
5. Only step down to an older dependency version after documenting the exact compatibility, runtime, platform, or ecosystem reason.
6. explain why the dependency is a better tradeoff than local implementation for the current task
7. avoid packages that are stale, thinly maintained, too heavy for the job, or added only because they are popular
8. keep dependency boundaries replaceable when the library would spread through many files
9. do not reject a dependency only because it adds a package; reject it only when the project-fit, security, maintenance, compatibility, bundle/runtime, or ownership tradeoff is worse than the alternative

## DEP-003: Framework and offline decision boundaries

1. Reject offline dependency decisions, outdated tutorial versions, trend choices, dependency avoidance choices, and performance-fear choices that are not grounded in the current repo, brief, and delivery tradeoffs.
2. Reject framework autopilot, not frameworks.
3. Next.js, Vite, Astro, React Router, SvelteKit, Laravel, plain HTML, and other runtimes are candidates, not defaults or forbidden choices.
4. If the user did not constrain the stack, compare at least the strongest fit and one plausible alternative before implementation, then choose the technology that removes bottlenecks for this project.
