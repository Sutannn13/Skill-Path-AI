# Features Overview

## Core Features

### 1. Landing Page
A polished, portfolio-ready landing page that explains the product value proposition.

**Sections:**
- Hero with animated 3D background
- Problem statement (student pain points)
- How it works (5-step process)
- Feature cards (6 key features)
- Demo dashboard preview
- CTA buttons

**Design:**
- Neobrutalism style
- Pastel color palette (#FFF7E6 background)
- Bold typography (Space Grotesk)
- 3D floating objects (React Three Fiber)
- Mobile-responsive

### 2. Onboarding Flow
A 6-step wizard to create a career profile.

**Steps:**
1. **Target Role Selection** - Frontend, Backend, Fullstack, UI Engineer, Mobile, Data Analyst
2. **Current Level** - Beginner, Basic, Intermediate, Internship-ready
3. **Goal Selection** - Internship, Freelance, Portfolio, Remote job, Career switch
4. **Study Time** - 30min, 1hr, 2hr, 4hr per day
5. **Skill Assessment** - Rate skills from 0-4
6. **GitHub Connection** - Optional username for portfolio analysis

**Output:**
- Saved user profile
- Initial readiness score
- Redirect to dashboard

### 3. Skill Inventory
A comprehensive skill management interface.

**Features:**
- Searchable skill list
- Category filtering (Frontend, Backend, General)
- Skill level selector (0-4)
- Progress summary
- Save changes

**Skill Categories:**
- Frontend: HTML, CSS, JavaScript, TypeScript, React, Next.js, etc.
- Backend: Node.js, Express, PostgreSQL, Authentication, etc.
- General: Git, GitHub, Problem Solving, Debugging, etc.

**Skill Levels:**
- 0: Not learned
- 1: Learning
- 2: Basic
- 3: Project-level
- 4: Professional

### 4. Job Radar
Browse and filter remote job opportunities.

**Features:**
- Search by title/company
- Filter by tags
- Job cards with match score
- Save jobs
- Apply link (external)
- Source attribution (Remotive or Mock)

**Job Card Shows:**
- Company logo placeholder
- Job title and company
- Location and type
- Tags
- Required skills
- Match percentage
- Save/View/Apply buttons

### 5. Skill Gap Analyzer
Core feature that calculates readiness.

**Input:**
- User skills with levels
- Target role requirements
- Job required skills (optional)

**Output:**
- Match score (basic)
- Weighted score (priority-weighted)
- Missing skills list
- Weak skills (with priority)
- Strong skills
- Recommended next skills
- Readiness label
- Explanation text

### 6. AI Roadmap Generator
Personalized learning path creation.

**Features:**
- Generate from target role
- Generate from saved job
- 4-8 week roadmaps
- Weekly task breakdown
- Mini-projects per week
- Final portfolio project
- Regenerate option

**Fallback:**
If Gemini API fails, uses template-based roadmaps.

### 7. Weekly Sprint Tracker
Goal tracking with streak system.

**Features:**
- Set weekly goal
- Add tasks with day labels
- Track completion
- Progress bar
- Streak counter
- Reflection notes
- Daily board view

### 8. Dashboard
Central hub showing all progress.

**Cards:**
- Career Readiness Score (animated ring)
- Job Match Score
- Current Target Role
- Weekly Progress
- Next Recommended Skill
- Saved Target Job
- Roadmap Progress
- GitHub Portfolio Score
- Recent Activity
- Streak

### 9. GitHub Portfolio Analyzer
Audit GitHub profile and get suggestions.

**Features:**
- GitHub username input
- Analyze button
- Summary cards (repos, languages, README count)
- Portfolio score
- Repository audit table
- Improvement suggestions

**Analysis Includes:**
- README presence
- Live demo links
- Recent updates
- Language diversity
- Repository quality score

### 10. Project Recommendations
Strategic project ideas based on skill gaps.

**Features:**
- Filter by difficulty
- Search projects
- Skills covered
- Estimated time
- Feature checklist
- Deployment steps
- README checklist

## UI Components

### Design System (Neobrutalism)
- BrutalCard (color variants, shadows)
- BrutalButton (variants, sizes)
- SkillBadge (levels, sizes)
- ScoreMeter (animated ring)
- ScoreBar (progress bar)
- MatchScorePill (job match)
- FloatingSticker (animated icons)
- AppShell, MobileBottomNav, DashboardHeader

### 3D Elements
- ThreeFloatingScene (React Three Fiber)
- CSSAnimatedScene (CSS fallback for mobile)
- Floating objects: laptop, badge, rocket, book, code

### Layout
- Responsive grid system
- Mobile bottom navigation
- Desktop sidebar
- Sticky headers
- Container with max-width