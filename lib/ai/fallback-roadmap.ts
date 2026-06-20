import { Roadmap, RoadmapTask, RoadmapWeek, TargetRole } from '@/types'
import { ROADMAP_CONTENT_VERSION } from '@/lib/roadmap/content-contract'

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
    'Understand how the web works, then build the base of a frontend app with semantic HTML, CSS layout, and small JavaScript interactions.',
    ['Internet', 'HTTP', 'HTML', 'CSS', 'JavaScript'],
    [
      task('frontend-1-1', 'Internet, DNS, HTTP, and browser basics', 'Understand what happens from entering a URL through DNS lookup, HTTP exchange, browser rendering, and hosting.', '60 minutes', 'easy', 'Web request lifecycle notes'),
      task('frontend-1-2', 'Semantic HTML landmarks and forms', 'Learn page structure, headings, landmarks, labels, inputs, and accessible form basics.', '60 minutes', 'easy', 'Semantic profile form page'),
      task('frontend-1-3', 'CSS selectors, box model, and spacing', 'Practice selectors, cascade, box model, spacing, color, and reusable class naming.', '70 minutes', 'easy', 'Styled profile card'),
      task('frontend-1-4', 'Flexbox, Grid, and responsive breakpoints', 'Use Flexbox and Grid intentionally, then recompose the layout for mobile, tablet, and desktop.', '85 minutes', 'medium', 'Responsive dashboard layout'),
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
    ['JavaScript', 'DOM', 'Async JavaScript', 'Git', 'npm'],
    [
      task('frontend-2-1', 'JavaScript functions and scope', 'Learn function declarations, parameters, return values, arrow functions, and scope.', '45 minutes', 'easy', 'Three reusable utility functions'),
      task('frontend-2-2', 'Arrays and object methods', 'Practice map, filter, find, reduce, object access, and immutable updates.', '60 minutes', 'medium', 'Task filter utility module'),
      task('frontend-2-3', 'DOM events and form validation', 'Wire click, input, submit, validation messages, and disabled button states.', '60 minutes', 'medium', 'Validated signup form'),
      task('frontend-2-4', 'Async JavaScript and fetch', 'Use promises, async/await, fetch, loading states, error states, and retry actions.', '70 minutes', 'medium', 'API-powered profile lookup'),
      task('frontend-2-5', 'Git, GitHub, npm, and package workflow', 'Version the project, work with branches, install packages, understand package.json, and run npm scripts.', '75 minutes', 'easy', 'Versioned npm project'),
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
    ['TypeScript', 'React', 'State Management', 'Tailwind CSS'],
    [
      task('frontend-3-1', 'TypeScript primitives and object types', 'Type props, arrays, object shapes, unions, optional fields, and event values.', '55 minutes', 'medium', 'Typed data model file'),
      task('frontend-3-2', 'React components and props', 'Build small components, pass props, compose children, and keep component boundaries clear.', '60 minutes', 'easy', 'Reusable card and badge components'),
      task('frontend-3-3', 'React state and events', 'Use useState for form fields, toggles, counters, and derived UI state.', '60 minutes', 'medium', 'Interactive settings panel'),
      task('frontend-3-4', 'React lists, forms, and conditional UI', 'Render lists with stable keys and show loading, empty, error, and success states.', '70 minutes', 'medium', 'Typed task list component'),
      task('frontend-3-5', 'Tailwind CSS utility workflow', 'Translate the CSS foundation into intentional utility classes without losing responsive structure or accessibility.', '65 minutes', 'medium', 'Responsive Tailwind component set'),
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
    ['React', 'REST API', 'Accessibility', 'Web Security'],
    [
      task('frontend-4-1', 'Effects and API fetching', 'Use useEffect or framework data fetching patterns to load remote data safely.', '60 minutes', 'medium', 'API data loading component'),
      task('frontend-4-2', 'Custom hooks for reusable data logic', 'Extract shared fetching and state transitions into a focused custom hook.', '60 minutes', 'medium', 'useResourceList hook'),
      task('frontend-4-3', 'Loading, empty, error, and success states', 'Design distinct UI states so users know what happened and what to do next.', '50 minutes', 'medium', 'Stateful resource panel'),
      task('frontend-4-4', 'Frontend accessibility basics', 'Check labels, focus-visible styles, keyboard paths, contrast, and status messages.', '55 minutes', 'medium', 'Accessibility fix checklist'),
      task('frontend-4-5', 'Browser security, CORS, and safe rendering', 'Understand same-origin rules, CORS, XSS risks, safe links, and why untrusted HTML must not be rendered directly.', '65 minutes', 'medium', 'Frontend security checklist'),
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
    'JavaScript and Web Foundations',
    'Learn JavaScript as the programming foundation before adding TypeScript, Node.js, or a backend framework.',
    ['JavaScript', 'TypeScript', 'HTTP', 'JSON'],
    [
      task('backend-1-1', 'JavaScript variables, data types, and control flow', 'Practice values, let and const, operators, conditionals, loops, and small programming decisions without framework code.', '60 minutes', 'easy', 'JavaScript decision-making exercises'),
      task('backend-1-2', 'JavaScript functions, arrays, and objects', 'Use parameters, return values, array operations, object properties, and small reusable functions.', '70 minutes', 'easy', 'JavaScript data-processing utilities'),
      task('backend-1-3', 'Asynchronous JavaScript and error handling', 'Learn promises, async/await, try/catch, and predictable error handling before server-side APIs.', '75 minutes', 'medium', 'Async JavaScript utility module'),
      task('backend-1-4', 'TypeScript fundamentals for JavaScript programmers', 'Add primitive types, object types, unions, function types, and narrowing to JavaScript code you already understand.', '70 minutes', 'medium', 'JavaScript utilities converted to TypeScript'),
      task('backend-1-5', 'Internet, DNS, HTTP, status codes, and JSON', 'Understand how clients find a server, exchange HTTP messages, use status codes and headers, and send JSON contracts before building a server.', '85 minutes', 'easy', 'Internet, HTTP, and JSON contract notes'),
    ],
    {
      title: 'Typed Request Data Simulator',
      description: 'Build JavaScript utilities, convert them to TypeScript, and simulate validated HTTP request and response objects.',
      skillsCovered: ['JavaScript', 'TypeScript', 'HTTP', 'JSON'],
      acceptanceCriteria: [
        'Uses functions, arrays, and objects clearly',
        'Handles one asynchronous failure with try/catch',
        'Adds TypeScript types after the JavaScript behavior works',
        'Explains request, response, status code, and JSON shape',
      ],
    }
  ),
  week(
    2,
    'Node.js Backend Fundamentals',
    'Run the JavaScript and TypeScript foundation on the server before introducing Express.',
    ['Git', 'Terminal', 'Node.js', 'npm', 'Environment Variables', 'Project Structure'],
    [
      task('backend-2-1', 'Terminal and Git workflow', 'Navigate files, initialize a repository, inspect changes, create focused commits, and work with branches safely.', '60 minutes', 'easy', 'Versioned starter repository'),
      task('backend-2-2', 'Node.js runtime, modules, npm, and file system', 'Run JavaScript outside the browser, install packages, use npm scripts, and practice modules, process arguments, and bounded file reads.', '75 minutes', 'easy', 'Node.js command-line utility'),
      task('backend-2-3', 'Environment variables and typed configuration', 'Load environment values safely, validate required config, and avoid exposing secrets.', '65 minutes', 'medium', 'Validated TypeScript config module'),
      task('backend-2-4', 'Basic Node.js HTTP server', 'Create a server with the built-in HTTP module and return structured JSON responses.', '75 minutes', 'medium', 'Working Node.js JSON server'),
      task('backend-2-5', 'Backend project structure', 'Separate configuration, HTTP handlers, services, and data access by responsibility.', '60 minutes', 'medium', 'Layered backend starter structure'),
    ],
    {
      title: 'Simple Node.js Server',
      description: 'Build a Node.js server with clean project structure, script commands, and environment-based configuration.',
      skillsCovered: ['Git', 'Node.js', 'npm', 'Environment Variables', 'Project Structure'],
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
    'Express.js REST API',
    'Build REST API endpoints with clear routing, controllers, middleware, CRUD behavior, and safe errors.',
    ['Express.js', 'REST API', 'Routing', 'Middleware', 'Error Handling'],
    [
      task('backend-3-1', 'Express routing', 'Initialize Express app, define route groups, and keep route files readable.', '55 minutes', 'easy', 'Express app bootstrap'),
      task('backend-3-2', 'Controllers and services', 'Create controller and service handlers with clear separation of concerns.', '75 minutes', 'medium', 'Task CRUD controller set'),
      task('backend-3-3', 'Middleware', 'Add request validation middleware and access checks before controller execution.', '75 minutes', 'medium', 'Reusable middleware module'),
      task('backend-3-4', 'RESTful CRUD endpoints', 'Implement create, read, update, delete endpoints with stable response shape.', '85 minutes', 'medium', 'Todo CRUD endpoints'),
      task('backend-3-5', 'Error handling', 'Return safe machine-readable error responses without leaking stack traces.', '60 minutes', 'medium', 'Global API error handler'),
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
      task('backend-4-1', 'SQL basics', 'Write SELECT, INSERT, UPDATE, DELETE queries and understand relational joins.', '80 minutes', 'medium', 'SQL CRUD exercise file'),
      task('backend-4-2', 'PostgreSQL tables', 'Design tables, constraints, and ownership columns for API data.', '75 minutes', 'medium', 'PostgreSQL schema draft'),
      task('backend-4-3', 'Database relationships', 'Build one-to-many relations and foreign keys for backend data models.', '75 minutes', 'medium', 'Database relationships notes'),
      task('backend-4-4', 'Prisma ORM and migrations', 'Create ORM models and apply migrations safely while keeping schema consistent.', '65 minutes', 'medium', 'Prisma model configuration'),
      task('backend-4-5', 'CRUD with database', 'Wire Express controllers to PostgreSQL through an explicit data access layer.', '90 minutes', 'hard', 'Database-backed Todo API endpoints'),
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
      task('backend-5-1', 'Register and login flow', 'Build registration and login endpoints with stable validation and response contracts.', '65 minutes', 'medium', 'Auth flow endpoints'),
      task('backend-5-2', 'Password hashing with bcrypt', 'Hash passwords securely and compare hashed credentials during login.', '85 minutes', 'hard', 'Credential hashing service'),
      task('backend-5-3', 'JWT or session authentication', 'Issue and verify auth tokens or sessions with expiration and logout strategy.', '75 minutes', 'hard', 'Login/auth middleware flow'),
      task('backend-5-4', 'Protected routes', 'Guard private endpoints and enforce resource ownership checks.', '60 minutes', 'medium', 'Protected CRUD routes'),
      task('backend-5-5', 'Input validation', 'Reject malformed payloads using schema validation before controller logic runs.', '65 minutes', 'medium', 'Validated auth request schemas'),
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
    'Testing, Documentation & Deployment',
    'Prepare backend projects for real-world usage and portfolio review.',
    ['Postman', 'Jest', 'Supertest', 'API Documentation', 'Redis', 'Deployment'],
    [
      task('backend-6-1', 'API testing with Postman or Thunder Client', 'Create request collections for auth, CRUD, validation, and error-path checks.', '70 minutes', 'medium', 'API testing collection'),
      task('backend-6-2', 'Jest and Supertest basics', 'Write integration tests for protected routes, validation failures, and success paths.', '95 minutes', 'hard', 'Jest/Supertest API test suite'),
      task('backend-6-3', 'API documentation', 'Document endpoints and request/response contracts for reproducible setup.', '75 minutes', 'medium', 'API docs + setup guide'),
      task('backend-6-4', 'Redis caching fundamentals', 'Cache suitable read responses, choose bounded expiration, invalidate stale data, and keep the database as source of truth.', '75 minutes', 'medium', 'Redis-backed read cache'),
      task('backend-6-5', 'Deploy backend to Render or Railway', 'Deploy API with environment variables, database connection, and health verification.', '90 minutes', 'hard', 'Deployed backend service URL'),
    ],
    {
      title: 'Deployed Backend API',
      description: 'Prepare backend verification evidence, test artifacts, API docs, and deployed API notes for portfolio review.',
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
  week(
    2,
    'JavaScript and TypeScript Foundations',
    'Learn JavaScript behavior completely enough before adding TypeScript and React.',
    ['JavaScript', 'DOM', 'Async JavaScript', 'TypeScript', 'Git', 'npm'],
    [
      task('fullstack-2-1', 'JavaScript functions, scope, arrays, and objects', 'Practice reusable functions, scope, array methods, and object updates with small data exercises.', '75 minutes', 'easy', 'JavaScript data utility module'),
      task('fullstack-2-2', 'DOM events and form behavior', 'Handle click, input, and submit events with validation and clear user feedback.', '65 minutes', 'medium', 'Validated interactive form'),
      task('fullstack-2-3', 'Asynchronous JavaScript and fetch', 'Use promises, async/await, fetch, loading states, and error handling.', '75 minutes', 'medium', 'API-powered vanilla JavaScript page'),
      task('fullstack-2-4', 'TypeScript fundamentals after JavaScript', 'Add primitive, object, union, and function types to working JavaScript code.', '70 minutes', 'medium', 'JavaScript module converted to TypeScript'),
      task('fullstack-2-5', 'Git, GitHub, npm, and package workflow', 'Version the project, use a branch workflow, install packages, understand package.json, and run npm scripts.', '75 minutes', 'easy', 'Versioned npm project'),
    ],
    {
      title: 'Typed JavaScript Data Explorer',
      description: 'Build a small browser app that validates a form, fetches public data, and then converts its data model to TypeScript.',
      skillsCovered: ['JavaScript', 'DOM', 'Async JavaScript', 'TypeScript'],
      acceptanceCriteria: [
        'Uses functions, arrays, and objects',
        'Handles loading and request errors',
        'Validates user input',
        'Adds TypeScript only after JavaScript behavior works',
      ],
    }
  ),
  week(
    3,
    'React Frontend Fundamentals',
    'Build typed component interfaces after the JavaScript and TypeScript foundation is established.',
    ['React', 'TypeScript', 'State Management', 'API Integration', 'Tailwind CSS'],
    [
      task('fullstack-3-1', 'React components and props', 'Build small typed components, pass props, and compose children.', '60 minutes', 'easy', 'Reusable typed component set'),
      task('fullstack-3-2', 'React state, events, and forms', 'Manage controlled inputs, local state, derived state, and validation messages.', '70 minutes', 'medium', 'Interactive React form flow'),
      task('fullstack-3-3', 'React lists and conditional UI', 'Render stable lists and explicit loading, empty, error, and success states.', '70 minutes', 'medium', 'State-complete React list'),
      task('fullstack-3-4', 'React API integration', 'Fetch API data, cancel stale work, and keep server data states visible.', '75 minutes', 'medium', 'API-backed React feature'),
      task('fullstack-3-5', 'Tailwind CSS for responsive product UI', 'Apply utility classes to the existing CSS foundation while preserving responsive layout and accessible states.', '65 minutes', 'medium', 'Responsive Tailwind dashboard shell'),
    ],
    {
      title: 'Frontend Task Dashboard',
      description: 'Build a typed React dashboard with forms, filters, API data, and complete user-facing states.',
      skillsCovered: ['React', 'TypeScript', 'State Management', 'API Integration'],
      acceptanceCriteria: [
        'Components and data models are typed',
        'Forms are controlled and validated',
        'Lists use stable keys',
        'Loading, empty, error, and success states are distinct',
      ],
    }
  ),
  week(
    4,
    'Node.js and Express API Fundamentals',
    'Move the same language foundation to Node.js, then add Express only after a basic server works.',
    ['Node.js', 'npm', 'Express.js', 'REST API', 'Error Handling'],
    [
      task('fullstack-4-1', 'Node.js runtime, modules, npm, and file system', 'Run JavaScript outside the browser, use npm scripts, and practice modules and bounded file access.', '75 minutes', 'easy', 'Node.js command-line utility'),
      task('fullstack-4-2', 'Environment variables and configuration', 'Load environment values safely, validate required configuration, and keep secrets outside source code.', '60 minutes', 'medium', 'Validated server configuration'),
      task('fullstack-4-3', 'Basic Node.js HTTP server', 'Create a server with the built-in HTTP module before using a framework.', '70 minutes', 'medium', 'Node.js JSON server'),
      task('fullstack-4-4', 'Express routing and middleware', 'Introduce Express routes, middleware, validation, and controller boundaries.', '80 minutes', 'medium', 'Express API foundation'),
      task('fullstack-4-5', 'REST CRUD and safe errors', 'Build CRUD endpoints with stable responses and centralized error handling.', '90 minutes', 'hard', 'In-memory CRUD API'),
    ],
    {
      title: 'Task REST API',
      description: 'Build a Node.js and Express API with validated CRUD operations and safe errors.',
      skillsCovered: ['Node.js', 'Express.js', 'REST API', 'Error Handling'],
      acceptanceCriteria: [
        'A basic Node.js server is built before Express',
        'Routes and business logic are separated',
        'Invalid input returns safe 4xx responses',
        'Unhandled errors use centralized middleware',
      ],
    }
  ),
  week(
    5,
    'PostgreSQL and Authentication',
    'Persist API data first, then add authentication and ownership checks on top of the database model.',
    ['SQL', 'PostgreSQL', 'Authentication', 'Authorization', 'Validation', 'Redis'],
    [
      task('fullstack-5-1', 'SQL and relational table basics', 'Practice SQL CRUD, primary keys, foreign keys, constraints, and simple joins.', '85 minutes', 'medium', 'SQL schema and query exercises'),
      task('fullstack-5-2', 'Connect PostgreSQL to the API', 'Create migrations and replace in-memory records with a data access layer.', '95 minutes', 'hard', 'Database-backed CRUD API'),
      task('fullstack-5-3', 'Registration and password security', 'Validate registration input and store securely hashed passwords.', '85 minutes', 'hard', 'Secure registration endpoint'),
      task('fullstack-5-4', 'Sessions or JWT and protected resources', 'Authenticate requests and enforce user ownership on private records.', '90 minutes', 'hard', 'Ownership-protected API flow'),
      task('fullstack-5-5', 'Redis caching and invalidation', 'Cache suitable read endpoints with expiration and invalidate cache entries after writes.', '75 minutes', 'hard', 'Cache-aware API endpoint'),
    ],
    {
      title: 'Authenticated Task API',
      description: 'Persist tasks in PostgreSQL and protect user-owned CRUD routes with validated authentication.',
      skillsCovered: ['SQL', 'PostgreSQL', 'Authentication', 'Authorization'],
      acceptanceCriteria: [
        'Schema and migrations are reproducible',
        'Passwords are hashed and never returned',
        'Private records enforce ownership',
        'Invalid payloads return stable errors',
      ],
    }
  ),
  week(
    6,
    'Fullstack Integration, Auth, and Deployment',
    'Ship one integrated frontend and backend product with clear auth, data, UI, and deployment boundaries.',
    ['React', 'Node.js', 'PostgreSQL', 'Authentication', 'Deployment'],
    [
      task('fullstack-6-1', 'Connect authentication to frontend state', 'Implement login, logout, protected UI, and ownership-aware session handling across frontend and backend.', '90 minutes', 'hard', 'Authenticated fullstack flow'),
      task('fullstack-6-2', 'Connect frontend, API, and database', 'Wire validated UI requests to API handlers and persistent user-owned database records.', '100 minutes', 'hard', 'End-to-end CRUD feature'),
      task('fullstack-6-3', 'Test the critical fullstack flow', 'Cover validation, authorization, API failures, loading states, and the primary user journey.', '90 minutes', 'hard', 'Critical-flow test evidence'),
      task('fullstack-6-4', 'Linux basics and deployment workflow', 'Use essential shell commands, process and log inspection, environment configuration, and a repeatable deployment checklist.', '80 minutes', 'medium', 'Linux deployment runbook'),
      task('fullstack-6-5', 'Deploy and document the integrated app', 'Configure environments, deploy both runtime boundaries, verify health, and document setup and recovery steps.', '100 minutes', 'hard', 'Live fullstack app and README'),
    ],
    {
      title: 'Fullstack Career Tracker',
      description: 'Build a complete app with auth, user-owned data, API routes, responsive UI, tests, and deployment notes.',
      skillsCovered: ['React', 'Node.js', 'PostgreSQL', 'Deployment'],
      acceptanceCriteria: [
        'Frontend uses loading, empty, error, and success states',
        'Backend validates input and checks ownership',
        'Database schema is documented',
        'Build and setup commands are documented',
      ],
    }
  ),
]

const UI_ENGINEER_FALLBACK: RoadmapWeek[] = [
  FRONTEND_FALLBACK[0],
  week(
    2,
    'JavaScript, TypeScript, and React Foundations',
    'Build the language and component foundation required before advanced UI engineering.',
    ['JavaScript', 'TypeScript', 'React', 'UI Behavior'],
    [
      task('ui-2-1', 'JavaScript functions and scope', 'Learn parameters, return values, arrow functions, closures, and reusable UI utilities.', '55 minutes', 'easy', 'Reusable JavaScript UI utilities'),
      task('ui-2-2', 'Arrays and objects for interface data', 'Transform lists and update object state without mutating source data.', '65 minutes', 'easy', 'Interface data transformation module'),
      task('ui-2-3', 'DOM events and asynchronous UI behavior', 'Handle user events, promises, async/await, loading feedback, and recoverable errors.', '70 minutes', 'medium', 'Asynchronous DOM interaction'),
      task('ui-2-4', 'TypeScript types for component data', 'Type props, variants, state values, events, and nullable interface data.', '65 minutes', 'medium', 'Typed component data models'),
      task('ui-2-5', 'React components, props, and state', 'Build typed components and manage local interaction state after the language foundation.', '75 minutes', 'medium', 'Typed interactive component set'),
    ],
    {
      title: 'Typed Interactive Profile Editor',
      description: 'Build a typed React profile editor from earlier JavaScript utilities and explicit UI states.',
      skillsCovered: ['JavaScript', 'TypeScript', 'React', 'UI Behavior'],
      acceptanceCriteria: [
        'JavaScript functions and data transformations are clear',
        'Async states include loading and failure feedback',
        'Props and state are typed',
        'Component boundaries remain small and reusable',
      ],
    }
  ),
  week(
    3,
    'Accessible Interaction Patterns',
    'Build interaction states that remain clear with keyboard, touch, assistive technology, and reduced motion.',
    ['Accessibility', 'Responsive Design', 'Interaction Design'],
    [
      task('ui-3-1', 'Semantic interaction and keyboard paths', 'Use correct interactive elements, visible focus, logical tab order, and keyboard activation.', '60 minutes', 'medium', 'Keyboard-accessible interaction set'),
      task('ui-3-2', 'Loading, empty, error, disabled, and success states', 'Design explicit states with clear status messages and recovery actions.', '65 minutes', 'medium', 'State-complete component flow'),
      task('ui-3-3', 'Responsive component composition', 'Recompose navigation, forms, cards, and dense data for narrow and wide viewports.', '70 minutes', 'medium', 'Responsive component variants'),
      task('ui-3-4', 'Motion with reduced-motion fallback', 'Use motion to explain state changes while respecting user motion preferences.', '55 minutes', 'medium', 'Accessible motion prototype'),
    ],
    {
      title: 'Accessible Account Settings Flow',
      description: 'Build a responsive settings flow with keyboard navigation, complete UI states, and reduced-motion behavior.',
      skillsCovered: ['Accessibility', 'Responsive Design', 'Interaction Design'],
      acceptanceCriteria: [
        'All controls work with keyboard only',
        'Loading, error, disabled, and success states are distinct',
        'Layout recomposes on narrow screens',
        'Reduced-motion mode keeps the flow understandable',
      ],
    }
  ),
  week(
    4,
    'Design Systems and Component Documentation',
    'Turn isolated components into a consistent, documented interface system.',
    ['Design Systems', 'Design Tokens', 'Storybook'],
    [
      task('ui-4-1', 'Define component anatomy and variants', 'Specify component parts, supported variants, states, and composition boundaries.', '60 minutes', 'medium', 'Component anatomy specification'),
      task('ui-4-2', 'Create semantic design tokens', 'Define color, typography, spacing, radius, shadow, and motion tokens by semantic role.', '70 minutes', 'medium', 'Typed design token set'),
      task('ui-4-3', 'Document components with stories', 'Create representative stories for default, edge, responsive, and failure states.', '80 minutes', 'hard', 'Component story catalog'),
      task('ui-4-4', 'Audit component accessibility', 'Check names, roles, states, contrast, focus, and keyboard behavior for each component.', '70 minutes', 'hard', 'Component accessibility report'),
    ],
    {
      title: 'Documented Component Library',
      description: 'Build a small component library with semantic tokens, documented variants, and accessibility evidence.',
      skillsCovered: ['Design Systems', 'Design Tokens', 'Storybook'],
      acceptanceCriteria: [
        'Tokens use semantic names',
        'Stories include edge and failure states',
        'Components expose accessible names and states',
        'Documentation explains composition boundaries',
      ],
    }
  ),
  week(
    5,
    'UI Testing, Performance, and Quality',
    'Verify user behavior and keep interface performance measurable.',
    ['Testing', 'Performance', 'Accessibility'],
    [
      task('ui-5-1', 'Test component behavior', 'Test rendering, keyboard input, validation, and state transitions from the user perspective.', '75 minutes', 'hard', 'Behavior-focused component tests'),
      task('ui-5-2', 'Measure and improve rendering performance', 'Inspect rerenders, list rendering, assets, and bundle impact before optimizing.', '70 minutes', 'hard', 'Measured performance fixes'),
      task('ui-5-3', 'Run an accessibility verification pass', 'Use keyboard checks, automated scans, and manual screen-reader-oriented inspection.', '70 minutes', 'hard', 'Accessibility verification evidence'),
      task('ui-5-4', 'Document UI quality decisions', 'Record tradeoffs, responsive behavior, accessibility decisions, and verification results.', '50 minutes', 'medium', 'UI quality notes'),
    ],
    {
      title: 'Production UI Quality Pass',
      description: 'Take an existing interface through behavior tests, accessibility checks, and measured performance improvements.',
      skillsCovered: ['Testing', 'Performance', 'Accessibility'],
      acceptanceCriteria: [
        'Tests cover keyboard and failure states',
        'Performance changes cite before and after evidence',
        'Accessibility issues have concrete fixes',
        'Quality notes match the implemented UI',
      ],
    }
  ),
  week(
    6,
    'UI Engineer Portfolio',
    'Ship a polished interaction-heavy portfolio surface with accessibility and performance evidence.',
    ['React', 'Accessibility', 'Performance', 'Documentation'],
    [
      task('ui-6-1', 'Plan the UI capstone system', 'Define flows, component boundaries, states, responsive behavior, and verification criteria.', '60 minutes', 'medium', 'UI capstone plan'),
      task('ui-6-2', 'Build the UI capstone', 'Implement the primary flow using the documented component system and realistic data states.', '6 hours', 'hard', 'Complete UI capstone'),
      task('ui-6-3', 'Polish accessibility and performance', 'Resolve keyboard, contrast, motion, overflow, rendering, and asset issues.', '100 minutes', 'hard', 'Verified UI quality fixes'),
      task('ui-6-4', 'Deploy and present the system', 'Publish the project and document decisions, tradeoffs, screenshots, and verification.', '90 minutes', 'medium', 'Live portfolio and case study'),
    ],
    {
      title: 'Accessible UI System Showcase',
      description: 'Ship a responsive product flow backed by a documented component system, tests, and accessibility evidence.',
      skillsCovered: ['React', 'Accessibility', 'Performance', 'Documentation'],
      acceptanceCriteria: [
        'Primary flow works with keyboard and touch',
        'Component states are documented',
        'Core behavior has tests',
        'Live project includes a technical case study',
      ],
    }
  ),
]

const MOBILE_FALLBACK: RoadmapWeek[] = [
  week(
    1,
    'JavaScript, TypeScript, and React Foundations',
    'Learn JavaScript first, then TypeScript and React, before starting an Expo or React Native project.',
    ['JavaScript', 'TypeScript', 'React'],
    [
      task('mobile-1-1', 'JavaScript variables, data types, and control flow', 'Practice values, operators, conditions, loops, and small application decisions.', '55 minutes', 'easy', 'JavaScript logic exercises'),
      task('mobile-1-2', 'JavaScript functions, arrays, and objects', 'Build reusable functions and transform array and object data for interface state.', '65 minutes', 'easy', 'JavaScript data utility module'),
      task('mobile-1-3', 'Asynchronous JavaScript and error handling', 'Use promises, async/await, and try/catch before fetching mobile data.', '70 minutes', 'medium', 'Async JavaScript utility module'),
      task('mobile-1-4', 'TypeScript fundamentals for app data', 'Type object models, function inputs, unions, nullable values, and API results.', '65 minutes', 'medium', 'Typed app data models'),
      task('mobile-1-5', 'React components, props, and state', 'Compose typed components and manage local and derived UI state before React Native.', '70 minutes', 'medium', 'Interactive typed React component set'),
    ],
    {
      title: 'Typed React Logic Prototype',
      description: 'Build a small typed React flow that proves language, async, component, and state fundamentals before mobile APIs.',
      skillsCovered: ['JavaScript', 'TypeScript', 'React'],
      acceptanceCriteria: [
        'Uses JavaScript functions, arrays, and objects',
        'Handles one asynchronous success and failure path',
        'Props and data models are typed',
        'Interactive state is explicit',
      ],
    }
  ),
  week(
    2,
    'Expo UI and Mobile Layout',
    'Build touch-friendly screens with platform-aware layout and accessibility.',
    ['Expo', 'React Native', 'Mobile Accessibility'],
    [
      task('mobile-2-1', 'Create and run an Expo project', 'Set up a supported Expo app, understand the project structure, and run it on device or simulator.', '60 minutes', 'easy', 'Working Expo starter app'),
      task('mobile-2-2', 'React Native core components', 'Use View, Text, Pressable, Image, ScrollView, and platform-safe component behavior inside Expo.', '70 minutes', 'easy', 'Core component practice screen'),
      task('mobile-2-3', 'Style mobile screens with Flexbox', 'Use StyleSheet, spacing, safe areas, and Flexbox for multiple device sizes.', '70 minutes', 'medium', 'Responsive mobile layout'),
      task('mobile-2-4', 'Build lists and forms for touch', 'Use FlatList, controlled inputs, validation feedback, keyboard avoidance, and comfortable targets.', '80 minutes', 'medium', 'Validated mobile list form'),
      task('mobile-2-5', 'Apply mobile accessibility basics', 'Add accessible labels, roles, hints, focus behavior, and screen-reader-friendly content.', '60 minutes', 'medium', 'Accessible mobile screen'),
    ],
    {
      title: 'Accessible Mobile Task List',
      description: 'Build a touch-friendly task list with a validated form, responsive layout, and accessibility labels.',
      skillsCovered: ['Expo', 'React Native', 'Mobile Accessibility'],
      acceptanceCriteria: [
        'FlatList uses stable keys',
        'Form handles keyboard and validation states',
        'Touch targets are comfortable',
        'Important controls have accessible labels',
      ],
    }
  ),
  week(
    3,
    'Navigation and Application State',
    'Create predictable multi-screen navigation and shared state.',
    ['Expo Router', 'Navigation', 'State Management'],
    [
      task('mobile-3-1', 'File-based navigation with Expo Router', 'Create stack and tab routes with clear screen ownership.', '75 minutes', 'medium', 'Multi-screen router structure'),
      task('mobile-3-2', 'Navigation params and guarded flows', 'Pass typed route params and redirect users based on explicit app state.', '75 minutes', 'medium', 'Typed detail and guarded routes'),
      task('mobile-3-3', 'Shared state with context and reducer', 'Model app actions and shared state without duplicating screen state.', '75 minutes', 'medium', 'Shared state module'),
      task('mobile-3-4', 'Deep links and not-found handling', 'Handle external links, unknown routes, and safe navigation fallbacks.', '60 minutes', 'hard', 'Deep-link verification flow'),
    ],
    {
      title: 'Multi-Screen Habit Tracker',
      description: 'Build a tab-based habit tracker with typed detail routes, shared state, and deep-link handling.',
      skillsCovered: ['Expo Router', 'Navigation', 'State Management'],
      acceptanceCriteria: [
        'Tabs and stack routes are separated clearly',
        'Route params are typed',
        'Shared state updates predictably',
        'Unknown links have a safe fallback',
      ],
    }
  ),
  week(
    4,
    'API Data, Storage, and Device Boundaries',
    'Load remote data safely and persist only appropriate local state.',
    ['Networking', 'Async Storage', 'Permissions', 'Offline UX'],
    [
      task('mobile-4-1', 'Fetch API data with complete states', 'Handle request cancellation, loading, empty, error, retry, and success states.', '80 minutes', 'medium', 'API-backed mobile screen'),
      task('mobile-4-2', 'Persist preferences with Async Storage', 'Store versioned non-sensitive preferences and handle read/write failures.', '65 minutes', 'medium', 'Persistent app preferences'),
      task('mobile-4-3', 'Request device permissions safely', 'Ask for permissions at the point of need and explain denied or restricted states.', '60 minutes', 'hard', 'Permission-aware feature'),
      task('mobile-4-4', 'Design offline-aware behavior', 'Detect connectivity changes and preserve clear stale, retry, and offline states.', '70 minutes', 'hard', 'Offline-aware data flow'),
    ],
    {
      title: 'Offline-Aware Content Browser',
      description: 'Build an API-backed mobile browser with persisted preferences, retry behavior, and an optional permission flow.',
      skillsCovered: ['Networking', 'Async Storage', 'Permissions', 'Offline UX'],
      acceptanceCriteria: [
        'All network states are visible',
        'Stored data is non-sensitive and versioned',
        'Denied permissions have a recovery path',
        'Offline content is labeled clearly',
      ],
    }
  ),
  week(
    5,
    'Mobile Testing and Production Quality',
    'Verify behavior, performance, errors, and accessibility on realistic devices.',
    ['Testing', 'Performance', 'Error Handling', 'Accessibility'],
    [
      task('mobile-5-1', 'Test screens and user interactions', 'Test rendering, input, navigation, loading, and failure states using React Native Testing Library.', '85 minutes', 'hard', 'Mobile behavior test suite'),
      task('mobile-5-2', 'Profile list and render performance', 'Measure slow renders, large lists, images, and unnecessary state updates.', '70 minutes', 'hard', 'Measured mobile performance fixes'),
      task('mobile-5-3', 'Handle runtime and network failures', 'Add safe error boundaries, recoverable request errors, and diagnostic logging boundaries.', '65 minutes', 'hard', 'Failure recovery flow'),
      task('mobile-5-4', 'Run device accessibility checks', 'Verify labels, reading order, font scaling, contrast, and touch targets on device.', '65 minutes', 'hard', 'Mobile accessibility report'),
    ],
    {
      title: 'Mobile Quality Audit',
      description: 'Test and improve a mobile flow using behavior tests, device checks, performance evidence, and failure recovery.',
      skillsCovered: ['Testing', 'Performance', 'Error Handling', 'Accessibility'],
      acceptanceCriteria: [
        'Tests cover success and failure paths',
        'Performance fixes cite measured symptoms',
        'Runtime failures have user-facing recovery',
        'Accessibility is checked on a device or emulator',
      ],
    }
  ),
  week(
    6,
    'Mobile Portfolio and Distribution',
    'Build, package, and present a complete mobile app.',
    ['React Native', 'Expo', 'EAS Build', 'Documentation'],
    [
      task('mobile-6-1', 'Plan mobile app architecture', 'Define routes, state ownership, data boundaries, offline behavior, and release checks.', '60 minutes', 'medium', 'Mobile architecture note'),
      task('mobile-6-2', 'Build the mobile capstone', 'Implement the complete app with realistic data, navigation, persistence, and device-safe states.', '7 hours', 'hard', 'Complete mobile capstone'),
      task('mobile-6-3', 'Create a release build with EAS', 'Configure app metadata, environment values, build profiles, and installable release output.', '100 minutes', 'hard', 'Installable release build'),
      task('mobile-6-4', 'Document setup and demonstration', 'Write setup, architecture, testing, screenshots, and known limitations for reviewers.', '90 minutes', 'medium', 'Portfolio README and demo evidence'),
    ],
    {
      title: 'Expo Mobile Portfolio App',
      description: 'Ship an installable Expo app with navigation, API data, persistence, tests, accessibility checks, and release documentation.',
      skillsCovered: ['React Native', 'Expo', 'Testing', 'EAS Build'],
      acceptanceCriteria: [
        'Primary flow works on a real device or emulator',
        'Release build is installable',
        'Critical behavior has tests',
        'README explains setup, architecture, and limitations',
      ],
    }
  ),
]

const DATA_ANALYST_FALLBACK: RoadmapWeek[] = [
  week(
    1,
    'Data Literacy and Spreadsheet Foundations',
    'Understand tabular data and spreadsheet operations before writing SQL or Python.',
    ['Data Literacy', 'Spreadsheets', 'Problem Framing', 'Data Quality', 'Documentation'],
    [
      task('data-1-1', 'Rows, columns, data types, and tidy tables', 'Recognize records, fields, identifiers, categorical and numerical values, missing values, and consistent table structure.', '50 minutes', 'easy', 'Annotated tabular dataset'),
      task('data-1-2', 'Spreadsheet formulas, sorting, and filtering', 'Use cell references, simple formulas, sorting, filtering, and bounded ranges to inspect data.', '60 minutes', 'easy', 'Spreadsheet exploration worksheet'),
      task('data-1-3', 'Analytical question framing', 'Turn a broad business question into metrics, dimensions, filters, and assumptions.', '50 minutes', 'easy', 'Analysis question brief'),
      task('data-1-4', 'CSV cleanup and data quality checks', 'Handle types, missing values, duplicates, validity, consistency, and raw-versus-cleaned files.', '70 minutes', 'medium', 'Cleaned dataset and quality checklist'),
      task('data-1-5', 'Reproducible analysis files and documentation', 'Organize source, processed, and output files and document assumptions and repeatable steps.', '50 minutes', 'easy', 'Documented analysis workspace'),
    ],
    {
      title: 'Data Cleaning Mini Report',
      description: 'Clean a small dataset and document the data quality decisions.',
      skillsCovered: ['Data Literacy', 'Problem Framing', 'Spreadsheets', 'Data Quality', 'Documentation'],
      acceptanceCriteria: [
        'Documents assumptions',
        'Handles missing or invalid rows',
        'Produces a short written summary',
        'Keeps raw and cleaned data separate',
      ],
    }
  ),
  week(
    2,
    'SQL Foundations for Analysis',
    'Query relational data with filters, ordering, aggregates, and joins.',
    ['SQL', 'PostgreSQL'],
    [
      task('data-2-1', 'SELECT and column expressions', 'Select only required columns and create readable calculated fields.', '55 minutes', 'easy', 'Basic SELECT query set'),
      task('data-2-2', 'WHERE, ORDER BY, and LIMIT', 'Filter and bound query results to answer focused questions.', '60 minutes', 'easy', 'Filtered analysis queries'),
      task('data-2-3', 'GROUP BY and aggregate functions', 'Summarize counts, totals, averages, and grouped metrics.', '70 minutes', 'medium', 'Aggregate query set'),
      task('data-2-4', 'JOIN relational tables', 'Combine related tables while checking row counts and join assumptions.', '75 minutes', 'medium', 'Validated join query set'),
    ],
    {
      title: 'SQL Sales Summary',
      description: 'Answer a focused sales question with filtered, aggregated, and joined SQL queries.',
      skillsCovered: ['SQL', 'PostgreSQL'],
      acceptanceCriteria: [
        'Queries are saved and named',
        'Result sets are bounded',
        'Join assumptions are documented',
        'Metrics are reproducible',
      ],
    }
  ),
  week(
    3,
    'Intermediate SQL Analysis',
    'Model reusable analysis queries and explain findings from relational data.',
    ['SQL', 'Data Modeling', 'Insight Writing'],
    [
      task('data-3-1', 'Read schemas and data relationships', 'Inspect keys, grain, relationships, and nullability before writing analysis queries.', '60 minutes', 'medium', 'Schema and grain notes'),
      task('data-3-2', 'Build multi-step analysis queries', 'Use common table expressions and subqueries to keep complex analysis traceable.', '75 minutes', 'medium', 'CTE-based analysis query'),
      task('data-3-3', 'Use window functions', 'Calculate rankings, running totals, lag, and partitioned metrics.', '80 minutes', 'hard', 'Window function query set'),
      task('data-3-4', 'Write evidence-based insights', 'Connect each finding to exact query output and state limitations.', '60 minutes', 'medium', 'SQL insight memo'),
    ],
    {
      title: 'Customer Behavior SQL Report',
      description: 'Analyze customer behavior using documented grain, CTEs, window functions, and evidence-backed findings.',
      skillsCovered: ['SQL', 'Data Modeling', 'Insight Writing'],
      acceptanceCriteria: [
        'Grain and joins are documented',
        'Queries use readable steps',
        'Findings cite exact outputs',
        'Limitations are explicit',
      ],
    }
  ),
  week(
    4,
    'Python and pandas for Analysis',
    'Clean, transform, and explore datasets in a reproducible Python workflow.',
    ['Python', 'pandas', 'Exploratory Data Analysis'],
    [
      task('data-4-1', 'Python basics for analysts', 'Use variables, collections, functions, loops, conditions, and modules for analysis scripts.', '75 minutes', 'easy', 'Python analysis utilities'),
      task('data-4-2', 'pandas DataFrame operations', 'Load, inspect, select, filter, sort, group, and merge tabular data.', '90 minutes', 'medium', 'DataFrame transformation notebook'),
      task('data-4-3', 'Clean missing and invalid data', 'Handle missing values, duplicates, types, categories, and outliers with documented decisions.', '85 minutes', 'medium', 'Cleaned pandas dataset'),
      task('data-4-4', 'Run exploratory data analysis', 'Summarize distributions, relationships, anomalies, and candidate explanations.', '90 minutes', 'hard', 'EDA notebook'),
    ],
    {
      title: 'Python Data Cleaning Notebook',
      description: 'Clean and explore a real dataset with reproducible pandas code and documented quality decisions.',
      skillsCovered: ['Python', 'pandas', 'Exploratory Data Analysis'],
      acceptanceCriteria: [
        'Notebook runs from top to bottom',
        'Cleaning decisions are documented',
        'Raw data is not overwritten',
        'EDA separates facts from hypotheses',
      ],
    }
  ),
  week(
    5,
    'Visualization, Statistics, and Dashboards',
    'Choose honest visual encodings and communicate patterns with appropriate statistics.',
    ['Data Visualization', 'Statistics', 'Dashboarding'],
    [
      task('data-5-1', 'Create clear data visualizations', 'Build readable charts with labels, units, accessible color, and honest scales.', '80 minutes', 'medium', 'Visualization set'),
      task('data-5-2', 'Choose the right chart', 'Match comparison, trend, distribution, relationship, and composition questions to suitable charts.', '60 minutes', 'medium', 'Chart selection rationale'),
      task('data-5-3', 'Apply descriptive statistics', 'Use central tendency, spread, percentiles, and distribution shape without overclaiming.', '75 minutes', 'medium', 'Statistical summary'),
      task('data-5-4', 'Build a focused dashboard story', 'Organize metrics and charts around one decision with filters and explanatory notes.', '95 minutes', 'hard', 'Decision-focused dashboard'),
    ],
    {
      title: 'Operational Metrics Dashboard',
      description: 'Build a dashboard that combines validated metrics, suitable charts, and concise decision support.',
      skillsCovered: ['Data Visualization', 'Statistics', 'Dashboarding'],
      acceptanceCriteria: [
        'Every chart answers a named question',
        'Scales and units are honest',
        'Statistics are interpreted cautiously',
        'Dashboard hierarchy supports one decision',
      ],
    }
  ),
  week(
    6,
    'Data Analyst Portfolio Report',
    'Ship an explainable analysis project with SQL, Python, charts, assumptions, and recommendations.',
    ['SQL', 'Python', 'Data Visualization', 'Documentation'],
    [
      task('data-6-1', 'Plan a reproducible analysis project', 'Define question, source data, grain, folder structure, metrics, and verification plan.', '60 minutes', 'medium', 'Analysis project plan'),
      task('data-6-2', 'Run the complete analysis', 'Clean data, query or transform it, validate outputs, and build visual evidence.', '6 hours', 'hard', 'Complete analysis workflow'),
      task('data-6-3', 'Write findings and recommendations', 'Separate findings, interpretation, limitations, and actionable recommendations.', '100 minutes', 'hard', 'Portfolio analysis report'),
      task('data-6-4', 'Document reproducible setup', 'Provide data source notes, environment setup, run steps, outputs, and screenshots.', '80 minutes', 'medium', 'Reproducible portfolio README'),
    ],
    {
      title: 'End-to-End Data Analysis Portfolio',
      description: 'Ship a reproducible analysis with cleaned data, SQL or pandas transformations, charts, findings, and limitations.',
      skillsCovered: ['SQL', 'Python', 'Data Visualization', 'Documentation'],
      acceptanceCriteria: [
        'Analysis can be reproduced from documented steps',
        'Metrics trace back to code or queries',
        'Charts support written findings',
        'Recommendations include limitations',
      ],
    }
  ),
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
      'Jest/Supertest API tests',
      'API documentation',
      'Deployment',
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
    contentVersion: ROADMAP_CONTENT_VERSION,
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
