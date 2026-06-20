# Flow Overview

## Main Application Flow

```mermaid
flowchart TD
  A[Visitor opens SkillPath] --> B{Supabase configured?}
  B -- No --> C[Demo mode surfaces render]
  B -- Yes --> D{Verified session?}
  D -- No --> E[Public home and auth pages only]
  D -- Yes --> F[Load profiles row]
  F --> G{profiles.role}
  G -- user --> H[/dashboard user progress view]
  G -- admin --> I[/admin operations view]
```

## Protected Route Flow

```mermaid
flowchart TD
  A[Request app route] --> B{Supabase configured?}
  B -- No --> C[Allow demo route]
  B -- Yes --> D{Route is protected app surface?}
  D -- No --> E{Route is login or register?}
  E -- Yes --> F{Verified session?}
  F -- Yes --> G[Redirect to /dashboard]
  F -- No --> H[Render auth page]
  E -- No --> I[Allow public route]
  D -- Yes --> J{Verified session?}
  J -- No --> K[Redirect to /login with next path]
  J -- Yes --> L[Allow protected page]
```

## User Dashboard Flow

```mermaid
flowchart TD
  A[Authenticated user] --> B[Open /dashboard]
  B --> C[Server layout checks Supabase session]
  C --> D[Load profile]
  D --> E{Role is admin?}
  E -- Yes --> F[Redirect to /admin]
  E -- No --> G[Load active roadmap, tasks, resources, and resource progress]
  G --> H[Render learning dashboard with roadmap progress and next task]
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
      Page->>Page: Validate curriculum version, role alignment, beginner prerequisite order, and bilingual resource contract
      alt Current content version
        Page->>DB: Insert missing English, Indonesian, or documentation rows
        Page->>Page: Filter stale unrelated resources
    else Legacy content version
      Page-->>User: Show explicit repair action
      User->>Page: Confirm repair
      Page->>DB: Archive legacy roadmap and create current version
    end
  else No roadmap
    Page->>DB: Load profile and skills
    Page->>API: Request generated roadmap
    API-->>Page: Gemini roadmap or deterministic fallback
    Page->>Page: Resolve long-form English video, Indonesian video or English fallback, and topic documentation
    Page->>DB: Insert roadmap, tasks, and resources
  end
  User->>Page: Switch video language with Previous or Next
  Page-->>User: Show English by default or Indonesian/fallback slide
  User->>Page: Complete resource, exercise, or deliverable
  Page->>DB: Persist resource progress and task status
  DB-->>Page: Saved state
```

## Roadmap Assessment Flow

```mermaid
sequenceDiagram
  participant User
  participant Map as /roadmap
  participant QuizPage as /roadmap/tasks/[taskId]/quiz
  participant ProjectPage as /roadmap/tasks/[taskId]/project
  participant FinalPage as /roadmap/final-project
  participant QuizStart as /api/roadmap/quiz/start
  participant QuizSubmit as /api/roadmap/quiz/submit
  participant ProjectAPI as /api/roadmap/project-review
  participant DB as Supabase

  User->>Map: Open roadmap and expand week
  Map-->>User: Show task state, gated actions, and locked final project state
  User->>QuizPage: Start/continue quiz
  QuizPage->>QuizStart: POST task context
  QuizStart->>DB: Validate ownership and reconcile quiz topic metadata
  DB-->>QuizPage: Questions + latest attempt summary
  User->>QuizPage: Submit answers
  QuizPage->>QuizSubmit: POST answers
  QuizSubmit->>DB: Store attempt, update task quiz state
  QuizSubmit-->>QuizPage: Score, pass/fail, feedback
  User->>ProjectPage: Submit mini project after passing quiz
  ProjectPage->>ProjectAPI: GET latest mini project review
  ProjectPage->>ProjectAPI: POST mini project submission
  ProjectAPI->>DB: Validate gating, save submission and review, update task project state
  User->>FinalPage: Submit final portfolio project
  FinalPage->>ProjectAPI: GET/POST final project submission and review
```

## Saved Jobs Flow

```mermaid
sequenceDiagram
  participant User
  participant Page as /jobs
  participant API as /api/jobs
  participant DB as Supabase

  User->>Page: Open /jobs after middleware session check
  Page->>API: Load fresh jobs
  API->>DB: Read visible job_posts
  DB-->>API: Approved and pending-review jobs
  API->>API: Add curated Indonesia top-up when result set is short
  API-->>Page: Job cards with source, date, validity, risk
  Page->>Page: Rank jobs by saved career profile and level
  User->>Page: Save job
  Page->>DB: Insert or delete saved_jobs through RLS
  DB-->>Page: Saved state persists
```
