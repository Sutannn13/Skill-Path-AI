---
id_prefix: PERF
domain: performance
priority: medium
scope: all-tasks
applies_to:
  - backend
  - frontend
  - fullstack
keywords:
  - performance
  - perf
  - caching
  - bottleneck
  - runtime
  - payload
---

# Performance Boundary

Performance is a decision input, not a blanket veto against modern libraries, motion, richer UI, or maintained tooling.

## PERF-001: Hard Performance Rejections and Caching

1. Do not over-optimize by habit.
2. Reject obvious scale and runtime failures.
3. Compare the real cost of the dependency or implementation against the cost of custom code, lost accessibility, weaker UX, duplicated maintenance, and slower delivery.
4. Reject repeated network, database, filesystem, or model calls inside loops without batching, limits, or caching rationale.
5. Reject unbounded reads, renders, exports, or searches when the data can grow.
6. Reject shipping large client/runtime payloads without a reason, split point, or loading strategy.
7. Reject synchronous blocking work in request, UI, worker, or async paths where it can stall the product.
8. Reject caches without invalidation, expiry, ownership, and staleness trade-offs.
9. When performance matters, measure the real bottleneck, change the smallest useful thing, and verify the result.
10. Do not downshift product quality, UI ambition, or library fit from performance fear alone; name the concrete budget, bottleneck, device limit, or runtime evidence.
11. Treat caching as a tier decision before a technology decision: prefer browser, CDN, or HTTP cache layers when data is shared and public; prefer in-process caches for hot per-instance data; reach for distributed caches such as Redis or Memcached only when shared mutable state across instances is the actual requirement.
12. Record cache-aside, write-through, or write-behind shape, invalidation strategy, and stampede prevention such as request coalescing or stale-while-revalidate when the cache fronts an expensive backend.
