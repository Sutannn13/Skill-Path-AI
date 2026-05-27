# SkillPath - Career Operating System for Developers

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14.0-black?style=flat-square&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/TypeScript-5.3-blue?style=flat-square&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=flat-square&logo=tailwind-css" alt="Tailwind" />
  <img src="https://img.shields.io/badge/Framer%20Motion-10.18-FF6B6B?style=flat-square" alt="Framer Motion" />
  <img src="https://img.shields.io/badge/Supabase-Ready-3ECF8E?style=flat-square&logo=supabase" alt="Supabase" />
</p>

## What is SkillPath?

SkillPath is a modern web application that helps students and beginner developers understand:

- Their current skill level
- Their target role readiness
- Which skills they are missing
- Which internship/remote jobs match them
- What learning roadmap they should follow
- What portfolio projects they should build next
- How their weekly learning progress improves over time

**Analogy**: SkillPath is like Google Maps for a developer career journey. The user knows where they are, where they want to go, what route to take, what gaps exist, and what progress they have made.

## Features

### Core Features

- **Skill Gap Analyzer**: Compare your skills with real job requirements and see exactly what you're missing
- **Job Match Score**: Find remote jobs that match your skill level
- **AI Roadmap Generator**: Get a personalized learning roadmap based on your goals
- **GitHub Portfolio Audit**: Analyze your GitHub profile and get suggestions
- **Weekly Sprint Tracker**: Set goals, track progress, maintain streaks
- **Project Recommendations**: Get project ideas that fill skill gaps

### Design

- **Neobrutalism UI**: Modern, playful, cartoon-like design
- **Mobile-first**: Optimized for Android and iPhone
- **3D Animated Background**: Floating objects powered by React Three Fiber
- **Framer Motion Animations**: Smooth transitions and interactions

## Tech Stack

| Category | Technology |
|----------|------------|
| Frontend | Next.js 14 (App Router), React 18, TypeScript |
| Styling | Tailwind CSS, Custom Neobrutalism Design System |
| Animation | Framer Motion, React Three Fiber, Drei |
| Charts | Recharts |
| State | Zustand, TanStack Query |
| Validation | Zod |
| Backend | Next.js Route Handlers, Supabase Ready |
| APIs | Remotive (Jobs), GitHub REST, Gemini AI |

## Getting Started

### Prerequisites

- Node.js 18.17 or later
- npm or pnpm

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Copy the environment file:

```bash
cp .env.example .env.local
```

4. Fill in your API keys in `.env.local` (optional for demo mode):

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
GEMINI_API_KEY=your_gemini_api_key
GITHUB_TOKEN=your_github_token
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

5. Start the development server:

```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
npm run typecheck # Run TypeScript type checking
```

## Project Structure

```
skillpath/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── jobs/          # Jobs API (Remotive)
│   │   ├── ai/            # AI roadmap generation (Gemini)
│   │   └── github/         # GitHub analysis
│   ├── dashboard/          # Main dashboard
│   ├── onboarding/         # Career onboarding flow
│   ├── skills/             # Skill inventory
│   ├── jobs/               # Job radar
│   ├── roadmap/            # Learning roadmap
│   ├── sprint/             # Weekly sprint tracker
│   ├── github/             # GitHub portfolio analyzer
│   ├── projects/           # Project recommendations
│   └── settings/           # User settings
├── components/
│   ├── brutal/             # Neobrutalism design system
│   ├── layout/             # Layout components
│   └── three/              # 3D animated elements
├── lib/
│   ├── constants/          # Skills, roles, data
│   ├── scoring/            # Skill gap algorithm
│   ├── ai/                 # AI helpers and fallbacks
│   └── jobs/               # Job API helpers
├── types/                  # TypeScript types
└── docs/                   # Documentation
```

## Scoring Method

SkillPath uses a deterministic scoring algorithm:

### Skill Level Normalization

| Level | Value |
|-------|-------|
| 0 | 0.00 |
| 1 | 0.25 |
| 2 | 0.50 |
| 3 | 0.75 |
| 4 | 1.00 |

### Weighted Score Calculation

```
weightedScore = sum(userSkillLevelNormalized * priorityWeight) / sum(priorityWeight) * 100
```

### Readiness Labels

| Score | Label |
|-------|-------|
| 0-24 | Not ready yet |
| 25-49 | Foundation stage |
| 50-69 | Getting close |
| 70-84 | Internship-ready soon |
| 85-100 | Strong candidate |

## API Integrations

### Remotive (Jobs)

- Endpoint: `GET /api/jobs`
- Fallback: Mock jobs if API fails
- Data: Real remote job listings from Remotive API

### Gemini AI (Roadmap)

- Endpoint: `POST /api/ai/roadmap`
- Fallback: Template-based roadmap if API fails
- Output: Structured JSON roadmap

### GitHub REST API

- Endpoint: `POST /api/github/analyze`
- Features: Repository analysis, README detection, portfolio scoring
- Fallback: Mock data if API fails

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | For database |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | For database |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | For admin operations |
| `GEMINI_API_KEY` | Google Gemini API key | For AI features |
| `GITHUB_TOKEN` | GitHub personal access token | For GitHub analysis |
| `NEXT_PUBLIC_APP_URL` | Application URL | For OAuth callbacks |

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Connect to Vercel
3. Add environment variables
4. Deploy

### Docker

```bash
docker build -t skillpath .
docker run -p 3000:3000 skillpath
```

## Documentation

- [Project Brief](docs/PROJECT_BRIEF.md)
- [Features Overview](docs/FEATURES.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Database Schema](docs/DATABASE.md)
- [API Contract](docs/API_CONTRACT.md)
- [Design System](docs/DESIGN_SYSTEM.md)
- [Scoring Method](docs/SCORING_METHOD.md)
- [Setup Guide](docs/SETUP.md)

## Credits

- Job data powered by [Remotive](https://remotive.com)
- Icons from [Lucide](https://lucide.dev)
- Animations powered by [Framer Motion](https://framer.com/motion)

## License

This project is for educational and portfolio purposes.

---

Built with care for aspiring developers.