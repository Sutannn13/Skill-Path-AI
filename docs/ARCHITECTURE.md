# Architecture

## System Overview

SkillPath is a Next.js 14 application using the App Router architecture. It follows a client-server pattern with server-side API routes for secure external API calls.

```
┌─────────────────────────────────────────────────────────┐
│                      Client (Browser)                    │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │
│  │   Pages     │  │ Components │  │  State (Zustand)│  │
│  │  (Next.js)  │  │   (React)   │  │  TanStack Query │  │
│  └──────┬──────┘  └──────┬──────┘  └────────┬────────┘  │
└─────────┼────────────────┼─────────────────┼────────────┘
          │                │                 │
          ▼                ▼                 ▼
┌─────────────────────────────────────────────────────────┐
│                   Next.js API Routes                     │
│  ┌─────────┐  ┌─────────┐  ┌─────────────────────┐   │
│  │ /jobs   │  │ /ai/    │  │ /github/             │   │
│  │         │  │ roadmap │  │ analyze             │   │
│  └────┬────┘  └────┬────┘  └──────────┬──────────┘   │
└───────┼────────────┼─────────────────┼───────────────┘
        │            │                 │
        ▼            ▼                 ▼
┌─────────────────────────────────────────────────────────┐
│                    External APIs                         │
│  ┌──────────┐  ┌───────────┐  ┌─────────────┐           │
│  │ Remotive │  │  Gemini   │  │   GitHub    │           │
│  │   API    │  │    AI    │  │    REST     │           │
│  └──────────┘  └───────────┘  └─────────────┘           │
└─────────────────────────────────────────────────────────┘
```

## Directory Structure

```
skillpath/
├── app/                      # Next.js App Router
│   ├── layout.tsx           # Root layout with providers
│   ├── page.tsx             # Landing page
│   ├── globals.css          # Global styles
│   ├── providers.tsx        # React Query provider
│   │
│   ├── dashboard/           # Dashboard page
│   ├── onboarding/          # Onboarding flow
│   ├── skills/              # Skill inventory
│   ├── jobs/                # Job radar
│   ├── roadmap/             # Learning roadmap
│   ├── sprint/              # Weekly sprint
│   ├── github/              # GitHub analyzer
│   ├── projects/            # Project recommendations
│   └── settings/            # User settings
│   │
│   └── api/                 # API Routes
│       ├── jobs/            # GET /api/jobs
│       ├── ai/              # POST /api/ai/roadmap
│       └── github/          # POST /api/github/analyze
│
├── components/              # React components
│   ├── brutal/             # Neobrutalism design system
│   │   ├── brutal-card.tsx
│   │   ├── brutal-button.tsx
│   │   ├── skill-badge.tsx
│   │   ├── score-meter.tsx
│   │   ├── match-score-pill.tsx
│   │   └── floating-sticker.tsx
│   │
│   ├── layout/             # Layout components
│   │   ├── app-shell.tsx
│   │   ├── mobile-bottom-nav.tsx
│   │   ├── dashboard-header.tsx
│   │   └── animated-background.tsx
│   │
│   └── three/              # 3D components (Arcade Quest 3D Cabinet)
│       ├── arcade-scene.tsx       # R3F cel-shaded low-poly scene
│       ├── scene-frame.tsx        # SSR-safe lazy mount + poster fallback
│       └── css-animated-scene.tsx # CSS-only fallback
│
├── lib/                    # Business logic
│   ├── constants/          # Skills, roles, data
│   │   ├── skills.ts
│   │   └── roles.ts
│   │
│   ├── data/               # Mock data
│   │   └── mock-jobs.ts
│   │
│   ├── jobs/               # Job utilities
│   │   └── skill-extraction.ts
│   │
│   ├── scoring/            # Scoring algorithms
│   │   └── skill-gap.ts
│   │
│   ├── ai/                 # AI helpers
│   │   └── fallback-roadmap.ts
│   │
│   └── utils/              # Utilities
│       └── index.ts
│
├── types/                  # TypeScript types
│   └── index.ts
│
└── docs/                   # Documentation
    ├── PROJECT_BRIEF.md
    ├── FEATURES.md
    ├── ARCHITECTURE.md
    └── ...
```

## Data Flow

### User Flow (Onboarding → Dashboard)

1. User completes onboarding form
2. Form data saved to local state (Zustand) or Supabase
3. Skills scored against target role requirements
4. Dashboard displays:
   - Career readiness score
   - Recommended skills
   - Job matches
   - Roadmap progress

### Job Matching Flow

1. User browses jobs at `/jobs`
2. API route fetches from Remotive (or mock fallback)
3. Jobs displayed with match scores
4. User can save jobs
5. Saved job shows on dashboard with gap analysis

### Roadmap Generation Flow

1. User clicks "Generate Roadmap"
2. POST to `/api/ai/roadmap` with:
   - Target role
   - Current skills
   - Missing skills
   - Study time
3. API tries Gemini first
4. If fails, returns template-based roadmap
5. User sees structured weeks with tasks
6. Can toggle task completion
7. Progress updates on dashboard

## State Management

### Client State (Zustand)
- User profile
- Selected skills
- Saved jobs
- Current sprint

### Server State (TanStack Query)
- Job listings (cached 1 hour)
- GitHub analysis (cached 1 hour)
- Roadmap data

### Local Storage
- Draft sprint tasks
- Onboarding progress
- Theme preferences

## API Design

### GET /api/jobs

**Query Parameters:**
- `query` (string, optional): Search term
- `tags` (string, optional): Comma-separated tags
- `category` (string, optional): Job category

**Response:**
```json
{
  "jobs": [...],
  "meta": {
    "total": 20,
    "source": "remotive" | "mock",
    "attribution": "Job data powered by Remotive"
  }
}
```

### POST /api/ai/roadmap

**Request:**
```json
{
  "targetRole": "frontend-developer",
  "currentLevel": "intermediate",
  "missingSkills": ["TypeScript", "Testing"],
  "studyTime": "1hour",
  "durationWeeks": 6
}
```

**Response:**
```json
{
  "roadmap": {...},
  "source": "ai" | "fallback"
}
```

### POST /api/github/analyze

**Request:**
```json
{
  "username": "octocat"
}
```

**Response:**
```json
{
  "analysis": {
    "username": "octocat",
    "totalRepos": 12,
    "languages": [...],
    "repos": [...],
    "score": 72,
    "summary": "...",
    "suggestions": [...]
  }
}
```

## Security

- API keys stored in `.env.local` (never exposed to client)
- Server-side API routes for all external calls
- Supabase Row Level Security (when enabled)
- GitHub token kept server-side
- Gemini API key kept server-side

## Performance

- ISR for job listings (1 hour revalidation)
- Client-side caching with TanStack Query
- 3D scenes lazy-loaded
- Mobile detection for reduced 3D complexity
- prefers-reduced-motion respected