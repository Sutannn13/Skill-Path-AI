// Skill Types
export type SkillLevel = 0 | 1 | 2 | 3 | 4

export interface Skill {
  id: string
  name: string
  slug: string
  category: SkillCategory
  roleTags: TargetRole[]
  priorityWeight: number
  description: string
}

export type SkillCategory = 'frontend' | 'backend' | 'general'

export interface UserSkill {
  skillId: string
  level: SkillLevel
  status?: 'learning' | 'mastered' | 'needs-review'
}

// Target Role Types
export type TargetRole =
  | 'frontend-developer'
  | 'backend-developer'
  | 'fullstack-developer'
  | 'ui-engineer'
  | 'mobile-developer'
  | 'data-analyst'

export interface TargetRoleInfo {
  id: TargetRole
  label: string
  description: string
  requiredSkills: string[]
  niceToHaveSkills: string[]
}

// User Profile Types
export type CurrentLevel = 'beginner' | 'basic' | 'intermediate' | 'internship-ready'
export type GoalType = 'internship' | 'freelance' | 'portfolio' | 'remote-job' | 'career-switch'
export type StudyTime = '30min' | '1hour' | '2hours' | '4hours'

export interface UserProfile {
  id?: string
  targetRole: TargetRole | null
  currentLevel: CurrentLevel | null
  goal: GoalType | null
  studyTime: StudyTime | null
  githubUsername?: string
  onboardingCompleted: boolean
  skills: UserSkill[]
}

// Scoring Types
export interface SkillGapResult {
  matchScore: number
  weightedMatchScore: number
  missingSkills: string[]
  weakSkills: { name: string; level: SkillLevel; priority: number }[]
  strongSkills: string[]
  recommendedNextSkills: string[]
  readinessLabel: ReadinessLabel
  explanation: string
}

export type ReadinessLabel =
  | 'not-ready-yet'
  | 'foundation-stage'
  | 'getting-close'
  | 'internship-ready-soon'
  | 'strong-candidate'

// Job Types
export interface Job {
  id: string
  title: string
  company: string
  location: string
  type: 'full-time' | 'part-time' | 'contract' | 'freelance' | 'internship'
  tags: string[]
  url: string
  description: string
  requiredSkills: string[]
  source: 'remotive' | 'mock'
  publishedAt: string
}

export interface SavedJob extends Job {
  matchScore?: number
  missingSkills?: string[]
  savedAt: string
}

// Roadmap Types
export interface RoadmapWeek {
  week: number
  title: string
  goal: string
  focusSkills: string[]
  tasks: RoadmapTask[]
  miniProject?: MiniProject
}

export interface RoadmapTask {
  id: string
  title: string
  description: string
  estimatedTime: string
  difficulty: 'easy' | 'medium' | 'hard'
  deliverable: string
  status: 'todo' | 'in-progress' | 'completed'
}

export interface MiniProject {
  title: string
  description: string
  skillsCovered: string[]
  acceptanceCriteria: string[]
}

export interface Roadmap {
  id: string
  title: string
  summary: string
  durationWeeks: number
  weeks: RoadmapWeek[]
  finalPortfolioProject?: {
    title: string
    description: string
    features: string[]
    skillsCovered: string[]
  }
  source: 'ai' | 'fallback'
  createdAt: string
}

// Sprint Types
export interface SprintTask {
  id: string
  title: string
  description?: string
  dayLabel: string
  status: 'todo' | 'in-progress' | 'completed'
  completedAt?: string
}

export interface WeeklySprint {
  id: string
  weekStart: string
  goal: string
  focusSkills: string[]
  tasks: SprintTask[]
  reflection?: string
  progress: number
  createdAt: string
}

// GitHub Types
export interface GitHubRepo {
  name: string
  description: string | null
  language: string | null
  stars: number
  forks: number
  hasReadme: boolean
  hasHomepage: boolean
  isPrivate: boolean
  updatedAt: string
  url: string
}

export interface GitHubAnalysis {
  username: string
  totalRepos: number
  languages: { name: string; count: number }[]
  repos: GitHubRepo[]
  score: number
  summary: string
  suggestions: string[]
}

// Dashboard Types
export interface DashboardStats {
  careerReadiness: number
  jobMatchScore: number | null
  currentRole: TargetRole | null
  weeklyProgress: number
  nextRecommendedSkill: string | null
  savedJob: SavedJob | null
  roadmapProgress: number
  githubScore: number | null
  streak: number
}

// Project Recommendation Types
export interface ProjectRecommendation {
  id: string
  title: string
  description: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  skillsCovered: string[]
  estimatedTime: string
  features: string[]
  deploymentSteps: string[]
  readmeChecklist: string[]
}