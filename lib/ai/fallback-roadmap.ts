import { Roadmap, RoadmapTask, RoadmapWeek, TargetRole } from '@/types'

interface FallbackRoadmapOptions {
  targetRole: TargetRole
  currentLevel: string
  missingSkills: string[]
  studyTime: string
  durationWeeks?: number
}

const ROLE_LABELS: Record<TargetRole, string> = {
  'frontend-developer': 'Frontend Developer',
  'backend-developer': 'Backend Developer',
  'fullstack-developer': 'Fullstack Developer',
  'ui-engineer': 'UI Engineer',
  'mobile-developer': 'Mobile Developer',
  'data-analyst': 'Data Analyst',
}

function task(
  id: string,
  title: string,
  description: string,
  estimatedTime: string,
  difficulty: RoadmapTask['difficulty'],
  deliverable: string
): RoadmapTask {
  return {
    id,
    title,
    description,
    estimatedTime,
    difficulty,
    deliverable,
    status: 'todo',
  }
}

function week(
  weekNumber: number,
  title: string,
  goal: string,
  focusSkills: string[],
  tasks: RoadmapTask[],
  miniProject: RoadmapWeek['miniProject']
): RoadmapWeek {
  return {
    week: weekNumber,
    title,
    goal,
    focusSkills,
    tasks,
    miniProject,
  }
}

const FRONTEND_FALLBACK: RoadmapWeek[] = [
  week(
    1,
    'Web Foundations',
    'Build the base of a frontend app with semantic HTML, CSS layout, and small JavaScript interactions.',
    ['HTML', 'CSS', 'JavaScript'],
    [
      task('frontend-1-1', 'Semantic HTML landmarks and forms', 'Learn page structure, headings, landmarks, labels, inputs, and accessible form basics.', '45 minutes', 'easy', 'Semantic profile form page'),
      task('frontend-1-2', 'CSS selectors, box model, and spacing', 'Practice selectors, cascade, box model, spacing, color, and reusable class naming.', '50 minutes', 'easy', 'Styled profile card'),
      task('frontend-1-3', 'Flexbox layout', 'Use flex containers, alignment, wrapping, gap, and responsive navigation patterns.', '45 minutes', 'easy', 'Responsive navbar and card row'),
      task('frontend-1-4', 'CSS Grid and responsive breakpoints', 'Build a two-dimensional layout and adjust it for mobile, tablet, and desktop.', '60 minutes', 'medium', 'Responsive dashboard grid'),
      task('frontend-1-5', 'JavaScript variables and control flow', 'Practice let, const, conditionals, loops, and small UI decisions.', '45 minutes', 'easy', 'Theme toggle logic'),
    ],
    {
      title: 'Responsive Personal Landing Page',
      description: 'Build a mobile-first landing page with semantic sections, responsive layout, and one JavaScript interaction.',
      skillsCovered: ['HTML', 'CSS', 'JavaScript'],
      acceptanceCriteria: [
        'Uses semantic landmarks and accessible labels',
        'Works on mobile and desktop',
        'Uses both Flexbox and Grid intentionally',
        'Includes one working JavaScript interaction',
      ],
    }
  ),
  week(
    2,
    'JavaScript for UI Behavior',
    'Split JavaScript into learnable parts instead of one long crash course.',
    ['JavaScript', 'DOM', 'Async JavaScript'],
    [
      task('frontend-2-1', 'JavaScript functions and scope', 'Learn function declarations, parameters, return values, arrow functions, and scope.', '45 minutes', 'easy', 'Three reusable utility functions'),
      task('frontend-2-2', 'Arrays and object methods', 'Practice map, filter, find, reduce, object access, and immutable updates.', '60 minutes', 'medium', 'Task filter utility module'),
      task('frontend-2-3', 'DOM events and form validation', 'Wire click, input, submit, validation messages, and disabled button states.', '60 minutes', 'medium', 'Validated signup form'),
      task('frontend-2-4', 'Async JavaScript and fetch', 'Use promises, async/await, fetch, loading states, error states, and retry actions.', '70 minutes', 'medium', 'API-powered profile lookup'),
    ],
    {
      title: 'Vanilla JavaScript Task Board',
      description: 'Build a small task board with add, filter, complete, delete, validation, and localStorage persistence.',
      skillsCovered: ['JavaScript', 'DOM', 'Async JavaScript'],
      acceptanceCriteria: [
        'Uses functions for repeated behavior',
        'Uses array methods for filtering and rendering',
        'Handles empty and error states',
        'Persists tasks locally',
      ],
    }
  ),
  week(
    3,
    'TypeScript and React Fundamentals',
    'Move from vanilla UI behavior into typed component-based UI.',
    ['TypeScript', 'React', 'State Management'],
    [
      task('frontend-3-1', 'TypeScript primitives and object types', 'Type props, arrays, object shapes, unions, optional fields, and event values.', '55 minutes', 'medium', 'Typed data model file'),
      task('frontend-3-2', 'React components and props', 'Build small components, pass props, compose children, and keep component boundaries clear.', '60 minutes', 'easy', 'Reusable card and badge components'),
      task('frontend-3-3', 'React state and events', 'Use useState for form fields, toggles, counters, and derived UI state.', '60 minutes', 'medium', 'Interactive settings panel'),
      task('frontend-3-4', 'React lists, forms, and conditional UI', 'Render lists with stable keys and show loading, empty, error, and success states.', '70 minutes', 'medium', 'Typed task list component'),
    ],
    {
      title: 'Typed React Task Tracker',
      description: 'Build a React task tracker with typed data, component composition, form validation, and status filters.',
      skillsCovered: ['TypeScript', 'React', 'State Management'],
      acceptanceCriteria: [
        'No untyped task objects',
        'Includes controlled forms',
        'Renders list and empty states',
        'Separates reusable components',
      ],
    }
  ),
  week(
    4,
    'React Data Flow and API Integration',
    'Connect React UI to API data while keeping user feedback clear.',
    ['React', 'REST API', 'Accessibility'],
    [
      task('frontend-4-1', 'Effects and API fetching', 'Use useEffect or framework data fetching patterns to load remote data safely.', '60 minutes', 'medium', 'API data loading component'),
      task('frontend-4-2', 'Custom hooks for reusable data logic', 'Extract shared fetching and state transitions into a focused custom hook.', '60 minutes', 'medium', 'useResourceList hook'),
      task('frontend-4-3', 'Loading, empty, error, and success states', 'Design distinct UI states so users know what happened and what to do next.', '50 minutes', 'medium', 'Stateful resource panel'),
      task('frontend-4-4', 'Frontend accessibility basics', 'Check labels, focus-visible styles, keyboard paths, contrast, and status messages.', '55 minutes', 'medium', 'Accessibility fix checklist'),
    ],
    {
      title: 'Public API Explorer',
      description: 'Build a search UI that fetches API data, displays typed results, and handles every data state.',
      skillsCovered: ['React', 'REST API', 'Accessibility'],
      acceptanceCriteria: [
        'Shows loading, empty, error, and success states',
        'Supports keyboard use',
        'Uses a custom hook',
        'Avoids broken layout with long content',
      ],
    }
  ),
  week(
    5,
    'Next.js, Testing, and Deployment',
    'Learn a production frontend workflow with routing, API integration, tests, and deployment.',
    ['Next.js', 'Testing', 'Deployment'],
    [
      task('frontend-5-1', 'Next.js App Router pages and layouts', 'Create route segments, layouts, loading UI, and not-found states.', '70 minutes', 'medium', 'Multi-page App Router shell'),
      task('frontend-5-2', 'Next.js Route Handlers and client integration', 'Create a route handler, validate input, return JSON, and call it from UI.', '75 minutes', 'medium', 'Validated JSON endpoint and form client'),
      task('frontend-5-3', 'Component and user-flow testing basics', 'Write tests around rendering, user input, validation, and state changes.', '70 minutes', 'hard', 'Test suite for core components'),
      task('frontend-5-4', 'Deployment readiness pass', 'Prepare environment variables, build checks, metadata, README, and deploy settings.', '50 minutes', 'medium', 'Deployment checklist and live build'),
    ],
    {
      title: 'Next.js Learning Dashboard',
      description: 'Build a small dashboard with routing, one API route, validated form submission, tests, and deployment notes.',
      skillsCovered: ['Next.js', 'Testing', 'Deployment'],
      acceptanceCriteria: [
        'Uses App Router route segments',
        'Includes a validated route handler',
        'Has at least one meaningful test',
        'Builds successfully before deployment',
      ],
    }
  ),
  week(
    6,
    'Frontend Portfolio and Interview Readiness',
    'Turn the learning path into a portfolio artifact and explainable interview story.',
    ['Documentation', 'Performance', 'Git'],
    [
      task('frontend-6-1', 'Frontend capstone architecture', 'Plan routes, components, data states, accessibility, and deployment boundaries before coding.', '60 minutes', 'medium', 'Capstone architecture note'),
      task('frontend-6-2', 'Build the frontend capstone', 'Implement the capstone with polished UI, responsive layout, and realistic data flow.', '6 hours', 'hard', 'Complete frontend capstone app'),
      task('frontend-6-3', 'Polish performance and accessibility', 'Check bundle habits, image sizing, keyboard access, headings, labels, and layout overflow.', '90 minutes', 'hard', 'Performance and accessibility fixes'),
      task('frontend-6-4', 'README and interview explanation', 'Document setup, feature decisions, tradeoffs, screenshots, and common frontend interview answers.', '2 hours', 'medium', 'Professional README and interview notes'),
    ],
    {
      title: 'Frontend Portfolio Showcase',
      description: 'Ship one polished frontend app that demonstrates UI state, API integration, accessibility, testing, and deployment readiness.',
      skillsCovered: ['Documentation', 'Performance', 'Git'],
      acceptanceCriteria: [
        'Readable README with setup and decisions',
        'Mobile and desktop layouts are intentional',
        'Core flow has tests or clear manual verification',
        'Live URL and GitHub repository are ready to share',
      ],
    }
  ),
]

const BACKEND_FALLBACK: RoadmapWeek[] = [
  week(
    1,
    'Backend JavaScript and Node.js Foundations',
    'Prepare JavaScript knowledge for server-side work.',
    ['JavaScript', 'Node.js', 'Git'],
    [
      task('backend-1-1', 'JavaScript functions, modules, and async basics', 'Review functions, module exports/imports, promises, async/await, and error handling for server code.', '70 minutes', 'easy', 'Utility module with async function'),
      task('backend-1-2', 'Node.js runtime and npm scripts', 'Understand the runtime, package.json scripts, environment variables, and basic file structure.', '60 minutes', 'easy', 'Node.js hello server project'),
      task('backend-1-3', 'Git workflow for backend tasks', 'Practice branches, commits, pull requests, and clear README change notes.', '45 minutes', 'easy', 'Repository with clean commit history'),
    ],
    {
      title: 'Node.js CLI API Client',
      description: 'Build a small Node.js script that reads input, calls a public API, handles failures, and prints structured output.',
      skillsCovered: ['JavaScript', 'Node.js', 'Git'],
      acceptanceCriteria: [
        'Uses async/await with try/catch',
        'Reads configuration from environment variables',
        'Has a README with run steps',
        'Handles invalid input safely',
      ],
    }
  ),
  week(
    2,
    'HTTP, Express, and REST API Structure',
    'Build readable server routes with predictable API contracts.',
    ['Express', 'REST API', 'Error Handling'],
    [
      task('backend-2-1', 'HTTP methods and status codes', 'Learn request methods, status classes, headers, JSON payloads, and safe API error responses.', '50 minutes', 'easy', 'HTTP status code notes'),
      task('backend-2-2', 'Express routing and controllers', 'Create route files, controller functions, request parsing, and route params.', '75 minutes', 'medium', 'Express users API routes'),
      task('backend-2-3', 'Middleware and centralized errors', 'Add validation middleware, not-found handling, and centralized safe error responses.', '75 minutes', 'medium', 'Express error middleware'),
      task('backend-2-4', 'REST API design practice', 'Design resources, query filters, pagination, and stable JSON response shapes.', '60 minutes', 'medium', 'API contract draft'),
    ],
    {
      title: 'Express Notes API',
      description: 'Build a REST API with list, detail, create, update, delete, validation, and safe error responses.',
      skillsCovered: ['Express', 'REST API', 'Error Handling'],
      acceptanceCriteria: [
        'Routes are grouped by resource',
        'Invalid input returns 400 with safe JSON',
        'Unknown records return 404',
        'List endpoint is bounded with limit or pagination',
      ],
    }
  ),
  week(
    3,
    'Database Design and PostgreSQL',
    'Move from temporary data to relational persistence.',
    ['Database Design', 'PostgreSQL', 'SQL'],
    [
      task('backend-3-1', 'SQL tables and relationships', 'Learn tables, primary keys, foreign keys, one-to-many relationships, and constraints.', '70 minutes', 'medium', 'ERD for notes API'),
      task('backend-3-2', 'PostgreSQL CRUD queries', 'Practice select, insert, update, delete, joins, ordering, limits, and transactions.', '90 minutes', 'medium', 'SQL query file'),
      task('backend-3-3', 'Database access layer', 'Separate request handlers from persistence mechanics and keep query shapes predictable.', '75 minutes', 'medium', 'Repository/data-access module'),
      task('backend-3-4', 'Indexes and pagination basics', 'Add indexes based on filter/order patterns and avoid unbounded list reads.', '60 minutes', 'hard', 'Indexed paginated list endpoint'),
    ],
    {
      title: 'Persistent Notes API',
      description: 'Connect the Express API to PostgreSQL with schema, CRUD queries, validation, pagination, and ownership-ready columns.',
      skillsCovered: ['Database Design', 'PostgreSQL', 'SQL'],
      acceptanceCriteria: [
        'Schema has primary and foreign keys',
        'List endpoint is bounded',
        'Database logic is not mixed into UI code',
        'README documents migration/setup steps',
      ],
    }
  ),
  week(
    4,
    'Authentication, Authorization, and Security',
    'Protect backend operations at the server boundary.',
    ['Authentication', 'Authorization', 'Security Basic', 'Validation'],
    [
      task('backend-4-1', 'Authentication flow fundamentals', 'Learn sign up, login, password hashing concepts, sessions or JWT, and logout boundaries.', '70 minutes', 'medium', 'Auth flow diagram'),
      task('backend-4-2', 'Authorization and ownership checks', 'Require resource-level checks before reading or mutating user-owned data.', '75 minutes', 'hard', 'Ownership-protected API route'),
      task('backend-4-3', 'Input validation and sanitization', 'Validate body, params, query, and URL values before they reach business logic.', '65 minutes', 'medium', 'Validation schema and rejected payload tests'),
      task('backend-4-4', 'Backend security checklist', 'Review secret handling, CORS, rate limiting assumptions, SQL injection, and safe logging.', '60 minutes', 'hard', 'Security review notes'),
    ],
    {
      title: 'Protected User Notes API',
      description: 'Add authentication, ownership-aware authorization, validation, and safe client-facing errors to the notes API.',
      skillsCovered: ['Authentication', 'Authorization', 'Security Basic', 'Validation'],
      acceptanceCriteria: [
        'Unauthenticated requests are rejected',
        'Users cannot access another user resource',
        'Invalid payloads return stable safe errors',
        'No secrets are committed or exposed to the client',
      ],
    }
  ),
  week(
    5,
    'Testing, API Documentation, and Reliability',
    'Make backend behavior provable and explainable.',
    ['Testing', 'API Documentation', 'Observability'],
    [
      task('backend-5-1', 'Unit tests for services', 'Test pure validation, scoring, and business rules without starting the HTTP server.', '70 minutes', 'medium', 'Service unit tests'),
      task('backend-5-2', 'Integration tests for API routes', 'Test success, validation failure, auth failure, not found, and ownership failure cases.', '90 minutes', 'hard', 'API integration test suite'),
      task('backend-5-3', 'OpenAPI or Postman documentation', 'Document endpoints, auth requirements, request bodies, response shapes, and error codes.', '70 minutes', 'medium', 'API docs collection'),
      task('backend-5-4', 'Logging and operational signals', 'Add safe logs for important operations without leaking payload secrets or stack traces.', '50 minutes', 'medium', 'Logging checklist'),
    ],
    {
      title: 'Backend Quality Gate',
      description: 'Add tests and API documentation so the backend can be explained, reviewed, and safely changed.',
      skillsCovered: ['Testing', 'API Documentation', 'Observability'],
      acceptanceCriteria: [
        'Critical auth and validation cases are tested',
        'API contract is documented',
        'Errors use stable safe shapes',
        'Manual test steps are recorded',
      ],
    }
  ),
  week(
    6,
    'Backend Deployment and Capstone',
    'Ship a backend portfolio project with production-oriented setup.',
    ['Deployment', 'Documentation', 'Security Basic'],
    [
      task('backend-6-1', 'Environment and deployment configuration', 'Prepare env variables, production-safe defaults, database URL handling, and build/start commands.', '70 minutes', 'medium', 'Deployment configuration checklist'),
      task('backend-6-2', 'Backend capstone build', 'Build the final API with auth, database, validation, docs, tests, and deployment notes.', '6 hours', 'hard', 'Complete backend capstone API'),
      task('backend-6-3', 'Production readiness review', 'Check auth boundaries, schema migrations, rate-limit assumptions, logs, and rollback notes.', '90 minutes', 'hard', 'Production readiness report'),
      task('backend-6-4', 'Backend interview explanation', 'Prepare explanations for API design, database choices, auth, tests, and failure handling.', '2 hours', 'medium', 'Backend interview notes'),
    ],
    {
      title: 'Production-Ready Backend API',
      description: 'Ship a portfolio backend API with authentication, ownership checks, PostgreSQL persistence, tests, docs, and deployment instructions.',
      skillsCovered: ['Deployment', 'Documentation', 'Security Basic'],
      acceptanceCriteria: [
        'Runs locally from documented commands',
        'Uses environment variables safely',
        'Has auth and ownership checks',
        'Includes API docs and verification steps',
      ],
    }
  ),
]

const FULLSTACK_FALLBACK: RoadmapWeek[] = [
  FRONTEND_FALLBACK[0],
  FRONTEND_FALLBACK[1],
  BACKEND_FALLBACK[2],
  BACKEND_FALLBACK[4],
  FRONTEND_FALLBACK[5],
  {
    ...BACKEND_FALLBACK[5],
    title: 'Fullstack Capstone and Deployment',
    goal: 'Ship one integrated frontend and backend product with clear auth, data, UI, and deployment boundaries.',
    focusSkills: ['React', 'Node.js', 'PostgreSQL', 'Deployment'],
    miniProject: {
      title: 'Fullstack Career Tracker',
      description: 'Build a complete app with auth, user-owned data, API routes, responsive UI, tests, and deployment notes.',
      skillsCovered: ['React', 'Node.js', 'PostgreSQL', 'Deployment'],
      acceptanceCriteria: [
        'Frontend uses loading, empty, error, and success states',
        'Backend validates input and checks ownership',
        'Database schema is documented',
        'Build and setup commands are documented',
      ],
    },
  },
]

const UI_ENGINEER_FALLBACK: RoadmapWeek[] = [
  FRONTEND_FALLBACK[0],
  {
    ...FRONTEND_FALLBACK[2],
    title: 'Component Systems and State',
    goal: 'Build UI components that stay accessible, reusable, and state-aware.',
    focusSkills: ['React', 'TypeScript', 'Accessibility'],
  },
  FRONTEND_FALLBACK[3],
  {
    ...FRONTEND_FALLBACK[4],
    title: 'Design Systems, Testing, and Performance',
    goal: 'Turn components into a tested, documented, performant interface system.',
    focusSkills: ['Design Systems', 'Testing', 'Performance'],
  },
  FRONTEND_FALLBACK[5],
  {
    ...FRONTEND_FALLBACK[5],
    title: 'UI Engineer Portfolio',
    goal: 'Ship a polished interaction-heavy portfolio surface with accessibility and performance notes.',
    focusSkills: ['UI/UX Basic', 'Accessibility', 'Performance'],
  },
]

const MOBILE_FALLBACK: RoadmapWeek[] = [
  week(
    1,
    'JavaScript and Mobile UI Foundations',
    'Prepare JavaScript, component thinking, and responsive interface basics.',
    ['JavaScript', 'React', 'Responsive Design'],
    [
      task('mobile-1-1', 'JavaScript functions and async basics', 'Practice functions, promises, async/await, and error states for mobile data flows.', '70 minutes', 'easy', 'Async utility module'),
      task('mobile-1-2', 'React component basics', 'Build small components, pass props, and keep UI state local when possible.', '60 minutes', 'easy', 'Reusable mobile card component'),
      task('mobile-1-3', 'Mobile-first layout and touch targets', 'Design narrow screens, tap targets, spacing, and readable content density.', '60 minutes', 'medium', 'Mobile-first layout prototype'),
    ],
    {
      title: 'Mobile UI Prototype',
      description: 'Build a mobile-first React prototype with touch-friendly controls and async data loading.',
      skillsCovered: ['JavaScript', 'React', 'Responsive Design'],
      acceptanceCriteria: [
        'Touch targets are comfortable',
        'Layout works on narrow screens',
        'Shows loading and error states',
        'Components are reusable',
      ],
    }
  ),
  FRONTEND_FALLBACK[2],
  FRONTEND_FALLBACK[3],
  FRONTEND_FALLBACK[4],
  BACKEND_FALLBACK[1],
  {
    ...FRONTEND_FALLBACK[5],
    title: 'Mobile Portfolio Capstone',
    goal: 'Ship a mobile-focused app with API data, persistence plan, and deployment notes.',
    focusSkills: ['React', 'REST API', 'Testing', 'Deployment'],
  },
]

const DATA_ANALYST_FALLBACK: RoadmapWeek[] = [
  week(
    1,
    'Data Foundations and Problem Framing',
    'Learn how to turn questions into measurable data tasks.',
    ['Problem Solving', 'Documentation', 'Git'],
    [
      task('data-1-1', 'Analytical question framing', 'Turn a broad business question into metrics, dimensions, filters, and assumptions.', '45 minutes', 'easy', 'Analysis question brief'),
      task('data-1-2', 'Spreadsheet and CSV cleanup basics', 'Practice data types, missing values, duplicates, and simple validation rules.', '60 minutes', 'easy', 'Cleaned sample dataset'),
      task('data-1-3', 'Git and documentation for analysis', 'Track analysis files and explain assumptions in a concise README.', '45 minutes', 'easy', 'Analysis repository'),
    ],
    {
      title: 'Data Cleaning Mini Report',
      description: 'Clean a small dataset and document the data quality decisions.',
      skillsCovered: ['Problem Solving', 'Documentation', 'Git'],
      acceptanceCriteria: [
        'Documents assumptions',
        'Handles missing or invalid rows',
        'Produces a short written summary',
        'Keeps raw and cleaned data separate',
      ],
    }
  ),
  BACKEND_FALLBACK[2],
  week(
    3,
    'SQL Analysis Queries',
    'Use SQL to answer questions with filters, joins, groups, and aggregates.',
    ['SQL', 'PostgreSQL', 'Data Visualization'],
    [
      task('data-3-1', 'SELECT, WHERE, ORDER BY, and LIMIT', 'Write bounded queries that answer specific questions.', '60 minutes', 'easy', 'Query file with 8 basic queries'),
      task('data-3-2', 'JOIN and GROUP BY analysis', 'Combine tables and summarize grouped data.', '75 minutes', 'medium', 'Join and aggregate query set'),
      task('data-3-3', 'Charts and insight summaries', 'Convert query outputs into readable charts and written findings.', '75 minutes', 'medium', 'Chart-backed insight memo'),
    ],
    {
      title: 'SQL Insights Report',
      description: 'Answer a business question using SQL queries, grouped results, charts, and written recommendations.',
      skillsCovered: ['SQL', 'PostgreSQL', 'Data Visualization'],
      acceptanceCriteria: [
        'Queries are saved and named',
        'Findings cite the exact query output',
        'Charts are readable',
        'Recommendations are tied to data',
      ],
    }
  ),
  FRONTEND_FALLBACK[3],
  FRONTEND_FALLBACK[4],
  {
    ...FRONTEND_FALLBACK[5],
    title: 'Data Analyst Portfolio Report',
    goal: 'Ship an explainable analysis project with SQL, charts, assumptions, and recommendations.',
    focusSkills: ['SQL', 'Data Visualization', 'Documentation'],
  },
]

const ROLE_FALLBACKS: Record<TargetRole, RoadmapWeek[]> = {
  'frontend-developer': FRONTEND_FALLBACK,
  'backend-developer': BACKEND_FALLBACK,
  'fullstack-developer': FULLSTACK_FALLBACK,
  'ui-engineer': UI_ENGINEER_FALLBACK,
  'mobile-developer': MOBILE_FALLBACK,
  'data-analyst': DATA_ANALYST_FALLBACK,
}

const FINAL_PROJECTS: Record<TargetRole, NonNullable<Roadmap['finalPortfolioProject']>> = {
  'frontend-developer': {
    title: 'Frontend Portfolio Application',
    description: 'Build a polished frontend app with responsive UI, API data, accessibility checks, tests, and deployment notes.',
    features: ['Responsive interface', 'API integration', 'Loading/error/empty states', 'Accessibility pass', 'Component tests', 'Deployment'],
    skillsCovered: ['React', 'TypeScript', 'REST API', 'Testing', 'Deployment'],
  },
  'backend-developer': {
    title: 'Production-Ready Backend API',
    description: 'Build an authenticated API with PostgreSQL persistence, validation, ownership checks, tests, docs, and deployment instructions.',
    features: ['Authentication', 'Authorization', 'PostgreSQL CRUD', 'Input validation', 'API tests', 'API documentation'],
    skillsCovered: ['Node.js', 'Express', 'PostgreSQL', 'Authentication', 'Testing'],
  },
  'fullstack-developer': {
    title: 'Fullstack Career Tracker',
    description: 'Build a complete product with frontend UI, backend API, auth, database persistence, tests, and deployment notes.',
    features: ['Frontend dashboard', 'Backend API', 'Auth', 'Database schema', 'Tests', 'Deployment'],
    skillsCovered: ['React', 'Node.js', 'PostgreSQL', 'Authentication', 'Deployment'],
  },
  'ui-engineer': {
    title: 'Accessible UI System Showcase',
    description: 'Build a polished UI system with reusable components, state variants, accessibility proof, and performance notes.',
    features: ['Component states', 'Responsive patterns', 'Accessibility checks', 'Motion rules', 'Performance notes', 'Documentation'],
    skillsCovered: ['React', 'TypeScript', 'Accessibility', 'Performance'],
  },
  'mobile-developer': {
    title: 'Mobile-First App Prototype',
    description: 'Build a mobile-focused app with touch-friendly UI, API data, offline-aware states, testing notes, and deployment plan.',
    features: ['Mobile-first layout', 'API integration', 'Touch targets', 'State handling', 'Testing notes', 'Deployment plan'],
    skillsCovered: ['React', 'JavaScript', 'REST API', 'State Management'],
  },
  'data-analyst': {
    title: 'SQL Data Analysis Portfolio Report',
    description: 'Build an analysis project with cleaned data, SQL queries, charts, written findings, and reproducible documentation.',
    features: ['Data cleaning', 'SQL queries', 'Charts', 'Insight summary', 'Assumption log', 'Reproducible README'],
    skillsCovered: ['SQL', 'PostgreSQL', 'Data Visualization', 'Documentation'],
  },
}

function cloneRoadmapWeeks(weeks: RoadmapWeek[]): RoadmapWeek[] {
  return weeks.map((sourceWeek) => ({
    ...sourceWeek,
    focusSkills: [...sourceWeek.focusSkills],
    tasks: sourceWeek.tasks.map((sourceTask) => ({ ...sourceTask })),
    miniProject: sourceWeek.miniProject
      ? {
          ...sourceWeek.miniProject,
          skillsCovered: [...sourceWeek.miniProject.skillsCovered],
          acceptanceCriteria: [...sourceWeek.miniProject.acceptanceCriteria],
        }
      : undefined,
  }))
}

function createStableRoadmapId(options: FallbackRoadmapOptions, plannedWeeks: number): string {
  return [
    'roadmap',
    options.targetRole,
    options.currentLevel,
    options.studyTime,
    plannedWeeks,
    options.missingSkills.join('-') || 'core',
  ].join('-').toLowerCase().replace(/[^a-z0-9-]+/g, '-')
}

function adjustDifficultyForLevel(weeks: RoadmapWeek[], currentLevel: string) {
  if (currentLevel !== 'intermediate' && currentLevel !== 'internship-ready') {
    return
  }

  weeks.forEach((sourceWeek) => {
    sourceWeek.tasks.forEach((sourceTask) => {
      if (sourceTask.difficulty === 'easy') {
        sourceTask.difficulty = 'medium'
      } else if (sourceTask.difficulty === 'medium') {
        sourceTask.difficulty = 'hard'
      }
    })
  })
}

function normalizeWeekNumbers(weeks: RoadmapWeek[]) {
  weeks.forEach((sourceWeek, index) => {
    sourceWeek.week = index + 1
  })
}

export function generateFallbackRoadmap(options: FallbackRoadmapOptions): Roadmap {
  const {
    targetRole,
    currentLevel,
    missingSkills,
    studyTime,
    durationWeeks = 6,
  } = options

  const template = ROLE_FALLBACKS[targetRole] ?? FRONTEND_FALLBACK
  const roleLabel = ROLE_LABELS[targetRole] ?? 'Developer'

  let adjustedWeeks = durationWeeks
  if (studyTime === '30min') adjustedWeeks = Math.ceil(durationWeeks * 1.5)
  else if (studyTime === '4hours') adjustedWeeks = Math.max(4, Math.ceil(durationWeeks * 0.75))

  const plannedWeeks = Math.min(adjustedWeeks, template.length)
  const selectedWeeks = cloneRoadmapWeeks(template.slice(0, plannedWeeks))

  normalizeWeekNumbers(selectedWeeks)
  adjustDifficultyForLevel(selectedWeeks, currentLevel)

  if (missingSkills.length > 0 && selectedWeeks[0]) {
    const combinedSkills = [...selectedWeeks[0].focusSkills, ...missingSkills.slice(0, 3)]
    selectedWeeks[0].focusSkills = Array.from(new Set(combinedSkills))
  }

  const focusSummary = missingSkills.length > 0
    ? missingSkills.slice(0, 3).join(', ')
    : selectedWeeks.flatMap((sourceWeek) => sourceWeek.focusSkills).slice(0, 3).join(', ')

  return {
    id: createStableRoadmapId(options, plannedWeeks),
    title: `${roleLabel} Learning Path`,
    summary: `A ${plannedWeeks}-module learning roadmap to become a ${roleLabel}. Focus on: ${focusSummary || 'core development skills'}.`,
    durationWeeks: plannedWeeks,
    weeks: selectedWeeks,
    finalPortfolioProject: FINAL_PROJECTS[targetRole],
    source: 'fallback',
    createdAt: new Date().toISOString(),
  }
}

export function getRoadmapByRole(targetRole: TargetRole): Roadmap | null {
  return generateFallbackRoadmap({
    targetRole,
    currentLevel: 'beginner',
    missingSkills: [],
    studyTime: '1hour',
    durationWeeks: 6,
  })
}
