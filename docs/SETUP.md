# Setup Guide

## Prerequisites

- Node.js 18.17 or later
- npm, pnpm, or yarn (this guide uses npm)
- Git

## Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd skillpath
npm install
```

### 2. Environment Setup

```bash
cp .env.example .env.local
```

Edit `.env.local` with your API keys:

```env
# Supabase (optional for local demo)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Gemini AI (optional - fallback roadmap used if missing)
GEMINI_API_KEY=your-gemini-api-key

# GitHub (optional - mock analysis used if missing)
GITHUB_TOKEN=your-github-token

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript type checking |

## API Keys Setup

### Supabase (Optional)

1. Create a project at [supabase.com](https://supabase.com)
2. Get your project URL and keys from Settings → API
3. Add to `.env.local`
4. (Optional) Run migrations in `supabase/migrations/`

### Gemini API (Optional)

1. Get API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Add to `.env.local`
3. Roadmap will use AI generation instead of templates

### GitHub Token (Optional)

1. Create personal access token at GitHub → Settings → Developer settings → Personal access tokens
2. Select scopes: `read:user`, `public_repo`
3. Add to `.env.local`
4. GitHub analyzer will use authenticated API (higher rate limits)

## Folder Structure

```
skillpath/
├── app/                    # Next.js pages and API routes
│   ├── api/               # Server-side API routes
│   ├── dashboard/         # Dashboard page
│   ├── onboarding/        # Onboarding flow
│   ├── skills/            # Skills page
│   └── ...                # Other pages
├── components/            # React components
│   ├── brutal/           # Design system
│   ├── layout/            # Layout components
│   └── three/             # 3D components
├── lib/                   # Business logic
│   ├── constants/         # Skills, roles
│   ├── scoring/           # Scoring algorithm
│   └── ...                # Other utilities
├── types/                 # TypeScript types
└── docs/                  # Documentation
```

## Adding New Pages

1. Create a new folder under `app/`
2. Add `page.tsx` with the page component
3. Add navigation links in `components/layout/mobile-bottom-nav.tsx`

## Adding New Skills

1. Edit `lib/constants/skills.ts`
2. Add skill object with:
   - `id`, `name`, `slug`
   - `category` (frontend/backend/general)
   - `roleTags` (which roles need this skill)
   - `priorityWeight`
   - `description`

## Adding New API Routes

1. Create folder under `app/api/`
2. Add `route.ts` with handler functions
3. Use Zod for validation

## Testing

The app works without any API keys using mock data:
- Mock jobs display on `/jobs`
- Template roadmaps work on `/roadmap`
- Demo analysis shows on `/github`

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Connect repo to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Other Platforms

Build first:
```bash
npm run build
```

Then start:
```bash
npm run start
```

## Troubleshooting

### Build Errors

Run type check first:
```bash
npm run typecheck
```

### Missing Styles

Ensure Tailwind is configured:
```bash
npx tailwindcss init
```

### API Route Errors

Check environment variables are set correctly in `.env.local`