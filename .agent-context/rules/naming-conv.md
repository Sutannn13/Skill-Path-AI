---
id_prefix: NAME
domain: naming-conv
priority: medium
scope: all-tasks
applies_to:
  - backend
  - frontend
  - fullstack
keywords:
  - naming-conv
  - name
  - naming
  - comments
  - intent
  - conventions
---

# Naming Boundary

Use the target language and framework conventions. Do not invent a naming style from this repo.

## NAME-001: Naming and Comment Rules

1. Prefer names that explain domain intent, user action, state, and boundary responsibility.
2. Reject these common LLM bad habits: vague names that hide meaning, such as `data`, `result`, `item`, `thing`, `temp`, `handle`, or `process` when a precise domain name exists.
3. Reject names that require reading the implementation to understand the value.
4. Keep file and directory naming styles consistent inside the same feature unless a framework reason requires mixed styles.
5. Reject booleans, units, and side-effect functions whose names hide what they represent or change.
6. Name collections as collections when the language convention supports it.
7. Name side-effect functions with an action plus the domain outcome they change.
8. Avoid broad function names that describe activity without domain intent.
9. Inline comments must explain why, not what.
10. Put a one-line rationale near non-obvious choices that deserve explanation, such as retry strategy, index column order, denormalized field, intentional swallow with named recovery, or magic constant tied to an external system.
11. Treat comments that paraphrase the code as noise.
