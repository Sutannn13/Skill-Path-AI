---
id_prefix: RT
domain: realtime
priority: medium
scope: backend
applies_to:
  - backend
  - fullstack
keywords:
  - realtime
  - rt
  - transport
  - streaming
  - connection
  - delivery
---

# Realtime Boundary

Use realtime only when the user experience needs live state, collaboration, streaming progress, notifications, or low-latency feedback. Do not add sockets by habit.

## RT-001: Hard Realtime Transport and Delivery Rules

1. Choose the transport from product needs and current official docs: polling, server-sent events, WebSockets, WebRTC, managed realtime, or queue-backed push.
2. Authenticate every connection or subscription at a trusted boundary.
3. Validate every inbound message and keep message contracts typed.
4. Keep business logic out of transport callbacks.
5. Define reconnect, heartbeat, backpressure, rate-limit, and abuse behavior.
6. Plan horizontal scaling before relying on in-memory connection state.
7. Document ordering, delivery guarantees, offline behavior, and failure recovery.
8. If realtime infrastructure is unresolved, recommend the smallest current project-fit option instead of assuming WebSockets.
