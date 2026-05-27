# Flow Overview

## Main Application Flow

```mermaid
flowchart TD
  A[Visitor opens SkillPath] --> B{Supabase configured?}
  B -- No --> C[Demo mode surfaces render]
  B -- Yes --> D{Verified session?}
  D -- No --> E[Protected dashboard state]
  D -- Yes --> F[Load profiles row]
  F --> G{profiles.role}
  G -- user --> H[/dashboard user progress view]
  G -- admin --> I[/admin operations view]
```

## User Dashboard Flow

```mermaid
flowchart TD
  A[Authenticated user] --> B[Open /dashboard]
  B --> C[Server layout checks Supabase session]
  C --> D[Load profile]
  D --> E{Role is admin?}
  E -- Yes --> F[Redirect to /admin]
  E -- No --> G[Render learning dashboard]
```

## Admin Dashboard Flow

```mermaid
flowchart TD
  A[Authenticated admin] --> B[Open /admin]
  B --> C[Server checks profile role]
  C --> D{Role is admin?}
  D -- No --> E[Render admin-only message]
  D -- Yes --> F[Count users, jobs, roadmaps, activity]
  F --> G[Render admin operations snapshot]
```

## Cron Sync Flow

```mermaid
sequenceDiagram
  participant Caller
  participant API as /api/cron/sync-jobs
  participant Sources as Job Sources
  participant Store as Job Store

  Caller->>API: GET or POST with Bearer or x-cron-secret
  API->>API: Reject if production secret is missing or invalid
  API->>Sources: Fetch enabled sources
  Sources-->>API: Job payloads
  API->>API: Deduplicate and assess validity
  API->>Store: Save approved or pending-review jobs
  API-->>Caller: Sync summary
```
