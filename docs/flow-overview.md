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
  participant Store as Supabase job_posts
  participant Runs as job_ingestion_runs

  Caller->>API: GET or POST with Bearer or x-cron-secret
  API->>API: Reject if production secret is missing or invalid
  API->>Sources: Fetch enabled sources
  Sources-->>API: Job payloads
  API->>API: Deduplicate and assess validity
  API->>Store: Upsert approved, pending-review, rejected, or expired audit rows
  API->>Runs: Insert source and summary run logs
  API-->>Caller: Sync summary
```

## Roadmap Persistence Flow

```mermaid
sequenceDiagram
  participant User
  participant Page as /roadmap
  participant API as /api/ai/roadmap
  participant DB as Supabase

  User->>Page: Open roadmap
  Page->>DB: Load latest active roadmap and tasks
  alt Roadmap exists
    DB-->>Page: Roadmap, tasks, resources, progress
  else No roadmap
    Page->>DB: Load profile and skills
    Page->>API: Request generated roadmap
    API-->>Page: Gemini roadmap or deterministic fallback
    Page->>DB: Insert roadmap, tasks, and resources
  end
  User->>Page: Complete resource, exercise, or deliverable
  Page->>DB: Persist resource progress and task status
  DB-->>Page: Saved state
```

## Saved Jobs Flow

```mermaid
sequenceDiagram
  participant User
  participant Page as /jobs
  participant API as /api/jobs
  participant DB as Supabase

  User->>Page: Open jobs
  Page->>API: Load fresh jobs
  API->>DB: Read visible job_posts
  DB-->>API: Approved and pending-review jobs
  API-->>Page: Job cards with source, date, validity, risk
  User->>Page: Save job
  Page->>DB: Insert or delete saved_jobs through RLS
  DB-->>Page: Saved state persists
```
