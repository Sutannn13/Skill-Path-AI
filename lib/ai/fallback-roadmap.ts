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
    'Programming & Web Foundation',
    'Build the programming foundation required before building production backend services.',
    ['JavaScript', 'TypeScript', 'HTTP', 'JSON', 'Git'],
    [
      task('backend-1-1', 'JavaScript and TypeScript basics for backend', 'Practice variables, functions, modules, async/await, and basic TypeScript types for API code.', '75 minutes', 'easy', 'Typed utility module for request handling'),
      task('backend-1-2', 'HTTP basics and status codes', 'Understand request methods, headers, status code classes, and safe response patterns.', '55 minutes', 'easy', 'HTTP response behavior notes'),
      task('backend-1-3', 'JSON payload structure and parsing', 'Work with JSON request/response bodies and validate input/output shape consistency.', '50 minutes', 'easy', 'JSON contract examples'),
      task('backend-1-4', 'Git basics for backend workflow', 'Use branch, commit, push, and pull request flow for backend feature delivery.', '45 minutes', 'easy', 'Backend starter repository history'),
    ],
    {
      title: 'Simple HTTP Request Demo',
      description: 'Build a small script that sends HTTP requests, parses JSON responses, and handles error status codes.',
      skillsCovered: ['JavaScript', 'TypeScript', 'HTTP', 'JSON', 'Git'],
      acceptanceCriteria: [
        'Reads endpoint URL from configuration',
        'Shows success and error response output clearly',
        'Parses JSON safely',
        'Repository has clear run instructions',
      ],
    }
  ),
  week(
    2,
    'Node.js Backend Fundamentals',
    'Set up backend runtime, project scripts, environment configuration, and clean server folder structure.',
    ['Node.js', 'npm', 'Environment Variables', 'Project Structure'],
    [
      task('backend-2-1', 'Node.js runtime fundamentals', 'Understand event loop basics, module system, file IO boundaries, and server runtime behavior.', '65 minutes', 'easy', 'Runtime behavior notes'),
      task('backend-2-2', 'npm packages and scripts', 'Set scripts for development, build, lint, and test flows using package.json.', '55 minutes', 'easy', 'Backend npm script setup'),
      task('backend-2-3', 'Environment variables and config safety', 'Load .env values safely, separate public/private config, and avoid secret leaks.', '60 minutes', 'medium', 'Typed config module'),
      task('backend-2-4', 'Backend folder structure and module boundaries', 'Split routes, controllers, services, and data access into readable backend layers.', '70 minutes', 'medium', 'Backend starter architecture'),
    ],
    {
      title: 'Simple Node.js Server',
      description: 'Build a Node.js server with clean project structure, script commands, and environment-based configuration.',
      skillsCovered: ['Node.js', 'npm', 'Environment Variables', 'Project Structure'],
      acceptanceCriteria: [
        'Server starts from npm script',
        'Configuration uses environment variables',
        'Project follows layered folder structure',
        'README explains setup and run commands',
      ],
    }
  ),
  week(
    3,
    'Express.js & REST API',
    'Build REST API endpoints with clear routing, controllers, middleware, CRUD behavior, and safe errors.',
    ['Express.js', 'REST API', 'Routing', 'Middleware', 'Error Handling'],
    [
      task('backend-3-1', 'Express setup and base server', 'Initialize Express app with typed request handling and safe JSON response defaults.', '55 minutes', 'easy', 'Express app bootstrap'),
      task('backend-3-2', 'Routing and controllers', 'Create resource routes and controller handlers with clear separation of concerns.', '75 minutes', 'medium', 'Task CRUD controller set'),
      task('backend-3-3', 'Middleware for validation and auth checks', 'Add request validation middleware and access checks before controller execution.', '75 minutes', 'medium', 'Reusable middleware module'),
      task('backend-3-4', 'RESTful CRUD endpoint implementation', 'Implement create, read, update, delete endpoints with stable response shape.', '85 minutes', 'medium', 'Todo CRUD endpoints'),
      task('backend-3-5', 'Centralized error handling', 'Return safe machine-readable error responses without leaking stack traces.', '60 minutes', 'medium', 'Global API error handler'),
    ],
    {
      title: 'Todo REST API',
      description: 'Build a REST API for todo data with routing, controllers, middleware, CRUD operations, and centralized error handling.',
      skillsCovered: ['Express.js', 'REST API', 'Routing', 'Middleware', 'Error Handling'],
      acceptanceCriteria: [
        'CRUD endpoints return stable JSON',
        'Validation errors return safe 4xx responses',
        'Routes and controllers are separated',
        'Unhandled errors are caught by centralized middleware',
      ],
    }
  ),
  week(
    4,
    'Database with PostgreSQL',
    'Store API data in PostgreSQL with clean schema design, ORM usage, migrations, and CRUD persistence.',
    ['SQL', 'PostgreSQL', 'Database Schema', 'Prisma', 'Migrations'],
    [
      task('backend-4-1', 'SQL basics for backend CRUD', 'Write SELECT, INSERT, UPDATE, DELETE queries and understand relational joins.', '80 minutes', 'medium', 'SQL CRUD exercise file'),
      task('backend-4-2', 'PostgreSQL schema design', 'Design tables, relations, constraints, and ownership columns for API data.', '75 minutes', 'medium', 'PostgreSQL schema draft'),
      task('backend-4-3', 'Prisma ORM setup and models', 'Create ORM models and keep database entities aligned with API domain structures.', '75 minutes', 'medium', 'Prisma model configuration'),
      task('backend-4-4', 'Migrations and schema evolution', 'Generate and apply migrations safely while keeping setup documentation accurate.', '65 minutes', 'medium', 'Migration history and notes'),
      task('backend-4-5', 'CRUD with database integration', 'Wire Express controllers to PostgreSQL through an explicit data access layer.', '90 minutes', 'hard', 'Database-backed Todo API endpoints'),
    ],
    {
      title: 'Todo API with PostgreSQL',
      description: 'Integrate Todo REST API with PostgreSQL and ORM migrations for persistent CRUD data.',
      skillsCovered: ['SQL', 'PostgreSQL', 'Database Schema', 'Prisma', 'Migrations'],
      acceptanceCriteria: [
        'Schema includes primary and foreign key relations',
        'CRUD routes persist data to PostgreSQL',
        'Migration files are versioned and reproducible',
        'Repository layer isolates persistence logic',
      ],
    }
  ),
  week(
    5,
    'Authentication & Authorization',
    'Protect API routes with password hashing, JWT/session auth, role checks, and strict input validation.',
    ['Authentication', 'Authorization', 'bcrypt', 'JWT', 'Validation'],
    [
      task('backend-5-1', 'Password hashing with bcrypt', 'Hash passwords securely and compare hashed credentials during login.', '65 minutes', 'medium', 'Credential hashing service'),
      task('backend-5-2', 'JWT or session authentication flow', 'Issue and verify auth tokens or sessions with expiration and logout strategy.', '85 minutes', 'hard', 'Login/auth middleware flow'),
      task('backend-5-3', 'Protected routes and ownership authorization', 'Guard private endpoints and enforce resource ownership checks.', '75 minutes', 'hard', 'Protected CRUD routes'),
      task('backend-5-4', 'Role-based authorization policy', 'Implement role-based access rules for selected admin/user endpoints.', '60 minutes', 'medium', 'Role guard module'),
      task('backend-5-5', 'Input validation and sanitization', 'Reject malformed payloads using schema validation before controller logic runs.', '65 minutes', 'medium', 'Validated auth request schemas'),
    ],
    {
      title: 'Auth API',
      description: 'Build an authenticated API module with secure password handling, route protection, role checks, and validated input.',
      skillsCovered: ['Authentication', 'Authorization', 'bcrypt', 'JWT', 'Validation'],
      acceptanceCriteria: [
        'Passwords are hashed and never returned in API response',
        'Protected endpoints reject unauthorized users',
        'Role checks enforce admin-only actions',
        'Invalid payloads return stable safe validation errors',
      ],
    }
  ),
  week(
    6,
    'Testing, Documentation, and Deployment',
    'Verify API correctness, document contracts, and deploy backend service with environment-safe production settings.',
    ['Postman', 'Jest', 'Supertest', 'API Documentation', 'Deployment'],
    [
      task('backend-6-1', 'API testing with Postman or Thunder Client', 'Create request collections for auth, CRUD, validation, and error-path checks.', '70 minutes', 'medium', 'API testing collection'),
      task('backend-6-2', 'Automated API tests with Jest and Supertest', 'Write integration tests for protected routes, validation failures, and success paths.', '95 minutes', 'hard', 'Jest/Supertest API test suite'),
      task('backend-6-3', 'API documentation and environment configuration', 'Document endpoints and environment variables for reproducible setup.', '75 minutes', 'medium', 'API docs + setup guide'),
      task('backend-6-4', 'Deploy backend service to Render, Railway, or Vercel', 'Deploy API with environment variables, database connection, and health verification.', '90 minutes', 'hard', 'Deployed backend service URL'),
      task('backend-6-5', 'Final backend quality and readiness review', 'Review tests, docs, security checks, and deployment stability before final submission.', '70 minutes', 'hard', 'Backend release readiness report'),
    ],
    {
      title: 'Backend Deployment Readiness Pack',
      description: 'Prepare backend verification evidence, test artifacts, API docs, and deployment notes for final portfolio review.',
      skillsCovered: ['Postman', 'Jest', 'Supertest', 'API Documentation', 'Deployment'],
      acceptanceCriteria: [
        'Collection tests cover auth and CRUD flows',
        'Automated tests run successfully',
        'API documentation reflects real request/response contracts',
        'Deployment instructions are reproducible from README',
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
    title: 'E-commerce Backend API Portfolio Challenge',
    description: 'Build an end-to-end backend API for e-commerce with authentication, product/order/cart CRUD, PostgreSQL persistence, validation, tests, documentation, and deployment.',
    features: [
      'Authentication and authorization',
      'Product CRUD endpoints',
      'Cart and order workflow endpoints',
      'PostgreSQL schema and migrations',
      'Validation and safe error handling',
      'Jest/Supertest tests plus deployment',
    ],
    skillsCovered: ['Node.js', 'Express', 'PostgreSQL', 'Authentication', 'Testing', 'Deployment'],
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
