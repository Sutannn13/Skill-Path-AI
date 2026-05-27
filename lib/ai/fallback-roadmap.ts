import { Roadmap, RoadmapWeek, TargetRole } from '@/types'

interface FallbackRoadmapOptions {
  targetRole: TargetRole
  currentLevel: string
  missingSkills: string[]
  studyTime: string
  durationWeeks?: number
}

const FRONTEND_FALLBACK: RoadmapWeek[] = [
  {
    week: 1,
    title: 'HTML, CSS & JavaScript Basics',
    goal: 'Master the fundamentals of web development',
    focusSkills: ['HTML', 'CSS', 'JavaScript'],
    tasks: [
      {
        id: 'task-1-1',
        title: 'Complete HTML fundamentals',
        description: 'Learn semantic HTML tags, forms, and accessibility basics',
        estimatedTime: '2 hours',
        difficulty: 'easy',
        deliverable: 'Semantic HTML page with forms',
        status: 'todo',
      },
      {
        id: 'task-1-2',
        title: 'CSS Layout Mastery',
        description: 'Learn Flexbox, Grid, and modern CSS properties',
        estimatedTime: '3 hours',
        difficulty: 'medium',
        deliverable: 'Responsive layout using Flexbox and Grid',
        status: 'todo',
      },
      {
        id: 'task-1-3',
        title: 'JavaScript Basics',
        description: 'Variables, functions, arrays, objects, and DOM manipulation',
        estimatedTime: '4 hours',
        difficulty: 'medium',
        deliverable: 'Interactive DOM project',
        status: 'todo',
      },
    ],
    miniProject: {
      title: 'Personal Portfolio Landing Page',
      description: 'Build a responsive portfolio page using only HTML, CSS, and vanilla JavaScript',
      skillsCovered: ['HTML', 'CSS', 'JavaScript'],
      acceptanceCriteria: [
        'Responsive on mobile and desktop',
        'Smooth scroll navigation',
        'Contact form with validation',
        'Animated elements',
      ],
    },
  },
  {
    week: 2,
    title: 'React Fundamentals',
    goal: 'Learn modern React development',
    focusSkills: ['React', 'JavaScript', 'Git'],
    tasks: [
      {
        id: 'task-2-1',
        title: 'React Setup & JSX',
        description: 'Set up a React project and understand JSX syntax',
        estimatedTime: '2 hours',
        difficulty: 'easy',
        deliverable: 'React app with multiple components',
        status: 'todo',
      },
      {
        id: 'task-2-2',
        title: 'Components & Props',
        description: 'Learn to create reusable React components with props',
        estimatedTime: '3 hours',
        difficulty: 'easy',
        deliverable: 'Component library with props',
        status: 'todo',
      },
      {
        id: 'task-2-3',
        title: 'State & Events',
        description: 'Manage component state and handle user events',
        estimatedTime: '3 hours',
        difficulty: 'medium',
        deliverable: 'Interactive React counter and form',
        status: 'todo',
      },
      {
        id: 'task-2-4',
        title: 'Git Workflow',
        description: 'Practice Git commands, branching, and commits',
        estimatedTime: '1 hour',
        difficulty: 'easy',
        deliverable: 'Git repo with proper commit history',
        status: 'todo',
      },
    ],
    miniProject: {
      title: 'Task Tracker App',
      description: 'Build a task management app with React state management',
      skillsCovered: ['React', 'JavaScript', 'Git'],
      acceptanceCriteria: [
        'Add, edit, delete tasks',
        'Filter tasks by status',
        'Persist data to localStorage',
        'Clean component structure',
      ],
    },
  },
  {
    week: 3,
    title: 'React Advanced & API Integration',
    goal: 'Master React patterns and connect to APIs',
    focusSkills: ['React', 'REST API', 'TypeScript'],
    tasks: [
      {
        id: 'task-3-1',
        title: 'React Hooks Deep Dive',
        description: 'useEffect, useContext, custom hooks',
        estimatedTime: '3 hours',
        difficulty: 'medium',
        deliverable: 'Custom hooks for data fetching',
        status: 'todo',
      },
      {
        id: 'task-3-2',
        title: 'API Integration',
        description: 'Fetch data from APIs and handle loading/error states',
        estimatedTime: '3 hours',
        difficulty: 'medium',
        deliverable: 'App that fetches and displays API data',
        status: 'todo',
      },
      {
        id: 'task-3-3',
        title: 'TypeScript Basics',
        description: 'Add TypeScript to your React project',
        estimatedTime: '2 hours',
        difficulty: 'medium',
        deliverable: 'TypeScript React app',
        status: 'todo',
      },
    ],
    miniProject: {
      title: 'Weather Dashboard',
      description: 'Build a weather app that fetches data from a public API',
      skillsCovered: ['React', 'REST API', 'TypeScript'],
      acceptanceCriteria: [
        'Search by city name',
        'Display current weather and forecast',
        'Handle loading and error states',
        'Type-safe components',
      ],
    },
  },
  {
    week: 4,
    title: 'Next.js & Deployment',
    goal: 'Build and deploy a full Next.js application',
    focusSkills: ['Next.js', 'Deployment', 'Testing'],
    tasks: [
      {
        id: 'task-4-1',
        title: 'Next.js App Router',
        description: 'Learn file-based routing and server components',
        estimatedTime: '3 hours',
        difficulty: 'medium',
        deliverable: 'Multi-page Next.js app',
        status: 'todo',
      },
      {
        id: 'task-4-2',
        title: 'API Routes',
        description: 'Create backend API routes in Next.js',
        estimatedTime: '2 hours',
        difficulty: 'medium',
        deliverable: 'Working API with GET/POST handlers',
        status: 'todo',
      },
      {
        id: 'task-4-3',
        title: 'Deployment',
        description: 'Deploy your app to Vercel',
        estimatedTime: '1 hour',
        difficulty: 'easy',
        deliverable: 'Live deployed app',
        status: 'todo',
      },
      {
        id: 'task-4-4',
        title: 'Testing Basics',
        description: 'Write basic tests with React Testing Library',
        estimatedTime: '2 hours',
        difficulty: 'hard',
        deliverable: 'Test suite for your components',
        status: 'todo',
      },
    ],
    miniProject: {
      title: 'Blog with CMS',
      description: 'Build a blog with markdown support and deployment',
      skillsCovered: ['Next.js', 'Deployment', 'Testing'],
      acceptanceCriteria: [
        'Dynamic routes for blog posts',
        'Markdown rendering',
        'SEO friendly',
        'Deployed to production',
      ],
    },
  },
  {
    week: 5,
    title: 'State Management & Advanced Patterns',
    goal: 'Master global state management and advanced React patterns',
    focusSkills: ['State Management', 'TypeScript', 'Testing'],
    tasks: [
      {
        id: 'task-5-1',
        title: 'Zustand or Context API',
        description: 'Learn global state management in React',
        estimatedTime: '3 hours',
        difficulty: 'medium',
        deliverable: 'App with global state',
        status: 'todo',
      },
      {
        id: 'task-5-2',
        title: 'Performance Optimization',
        description: 'Learn React.memo, useMemo, useCallback',
        estimatedTime: '2 hours',
        difficulty: 'hard',
        deliverable: 'Optimized React app',
        status: 'todo',
      },
      {
        id: 'task-5-3',
        title: 'Error Boundaries',
        description: 'Handle errors gracefully in React',
        estimatedTime: '1 hour',
        difficulty: 'medium',
        deliverable: 'App with error boundaries',
        status: 'todo',
      },
    ],
    miniProject: {
      title: 'E-commerce Product Page',
      description: 'Build a complex product page with cart functionality',
      skillsCovered: ['State Management', 'TypeScript', 'Performance'],
      acceptanceCriteria: [
        'Product gallery with zoom',
        'Add to cart functionality',
        'Cart persistence',
        'Optimized rendering',
      ],
    },
  },
  {
    week: 6,
    title: 'Portfolio Project & Interview Prep',
    goal: 'Build your portfolio project and prepare for interviews',
    focusSkills: ['Git', 'Deployment', 'Documentation'],
    tasks: [
      {
        id: 'task-6-1',
        title: 'Portfolio Project',
        description: 'Build your main portfolio project',
        estimatedTime: '8 hours',
        difficulty: 'hard',
        deliverable: 'Complete portfolio project',
        status: 'todo',
      },
      {
        id: 'task-6-2',
        title: 'Documentation & README',
        description: 'Write a comprehensive README for your project',
        estimatedTime: '2 hours',
        difficulty: 'easy',
        deliverable: 'Professional README',
        status: 'todo',
      },
      {
        id: 'task-6-3',
        title: 'Interview Questions',
        description: 'Practice common frontend interview questions',
        estimatedTime: '4 hours',
        difficulty: 'medium',
        deliverable: 'Answers to 20 common questions',
        status: 'todo',
      },
      {
        id: 'task-6-4',
        title: 'Code Review',
        description: 'Review your code and optimize',
        estimatedTime: '2 hours',
        difficulty: 'medium',
        deliverable: 'Clean, optimized codebase',
        status: 'todo',
      },
    ],
    miniProject: {
      title: 'Portfolio Showcase',
      description: 'Build and deploy your complete developer portfolio',
      skillsCovered: ['Git', 'Deployment', 'Documentation'],
      acceptanceCriteria: [
        'Responsive design',
        'Project showcase',
        'About and contact sections',
        'Live deployment',
      ],
    },
  },
]

function cloneRoadmapWeeks(weeks: RoadmapWeek[]): RoadmapWeek[] {
  return weeks.map((week) => ({
    ...week,
    focusSkills: [...week.focusSkills],
    tasks: week.tasks.map((task) => ({ ...task })),
    miniProject: week.miniProject
      ? {
          ...week.miniProject,
          skillsCovered: [...week.miniProject.skillsCovered],
          acceptanceCriteria: [...week.miniProject.acceptanceCriteria],
        }
      : undefined,
  }))
}

function createStableRoadmapId(options: FallbackRoadmapOptions, adjustedWeeks: number): string {
  return [
    'roadmap',
    options.targetRole,
    options.currentLevel,
    options.studyTime,
    adjustedWeeks,
    options.missingSkills.join('-') || 'core',
  ].join('-')
}

export function generateFallbackRoadmap(options: FallbackRoadmapOptions): Roadmap {
  const {
    targetRole,
    currentLevel,
    missingSkills,
    studyTime,
    durationWeeks = 6,
  } = options

  const roleLabel = targetRole.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')

  // Adjust duration based on study time
  let adjustedWeeks = durationWeeks
  if (studyTime === '30min') adjustedWeeks = Math.ceil(durationWeeks * 2)
  else if (studyTime === '4hours') adjustedWeeks = Math.ceil(durationWeeks * 0.7)

  // Select weeks based on duration
  const selectedWeeks = cloneRoadmapWeeks(
    FRONTEND_FALLBACK.slice(0, Math.min(adjustedWeeks, FRONTEND_FALLBACK.length))
  )

  // Adjust difficulty based on current level
  if (currentLevel === 'intermediate' || currentLevel === 'internship-ready') {
    selectedWeeks.forEach(week => {
      week.tasks.forEach(task => {
        if (task.difficulty === 'easy') task.difficulty = 'medium'
        if (task.difficulty === 'medium') task.difficulty = 'hard'
      })
    })
  }

  // Customize based on missing skills
  if (missingSkills.length > 0) {
    // Add missing skills focus to first week
    const firstWeek = selectedWeeks[0]
    const combinedSkills = [...firstWeek.focusSkills, ...missingSkills.slice(0, 3)]
    firstWeek.focusSkills = Array.from(new Set(combinedSkills))
  }

  return {
    id: createStableRoadmapId(options, adjustedWeeks),
    title: `${roleLabel} Learning Path`,
    summary: `A ${adjustedWeeks}-week learning roadmap to become a ${roleLabel}. Focus on: ${missingSkills.slice(0, 3).join(', ') || 'core development skills'}.`,
    durationWeeks: adjustedWeeks,
    weeks: selectedWeeks,
    finalPortfolioProject: {
      title: `${roleLabel} Portfolio Project`,
      description: 'Build a complete, production-ready application that showcases your skills as a ' + roleLabel + '.',
      features: [
        'User authentication',
        'CRUD operations',
        'API integration',
        'Responsive design',
        'Testing',
        'Deployment',
      ],
      skillsCovered: missingSkills.length > 0 ? missingSkills : ['React', 'Node.js', 'Git'],
    },
    source: 'fallback',
    createdAt: '2024-01-01T00:00:00.000Z',
  }
}

export function getRoadmapByRole(targetRole: TargetRole): Roadmap | null {
  const options: FallbackRoadmapOptions = {
    targetRole,
    currentLevel: 'beginner',
    missingSkills: [],
    studyTime: '1hour',
    durationWeeks: 6,
  }

  return generateFallbackRoadmap(options)
}
