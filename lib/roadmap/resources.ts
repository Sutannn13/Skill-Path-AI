import type { RoadmapTask, RoadmapWeek, TargetRole } from '@/types'

export type RoadmapResourceType = 'youtube' | 'article' | 'docs' | 'project' | 'quiz'

export interface RoadmapResourceSeed {
  title: string
  resourceType: RoadmapResourceType
  url: string
  provider: string
  estimatedMinutes: number
  isRequired: boolean
  completionRule: string
}

export interface GetCuratedResourcesOptions {
  targetRole?: TargetRole | null
  usedUrls?: Set<string>
}

function youtube(title: string, url: string, estimatedMinutes: number, provider = 'YouTube'): RoadmapResourceSeed {
  return {
    title,
    resourceType: 'youtube',
    url,
    provider,
    estimatedMinutes,
    isRequired: true,
    completionRule: 'manual_watch_confirmation',
  }
}

function docs(title: string, url: string, estimatedMinutes: number, provider: string): RoadmapResourceSeed {
  return {
    title,
    resourceType: 'docs',
    url,
    provider,
    estimatedMinutes,
    isRequired: true,
    completionRule: 'manual_mark_complete',
  }
}

const RESOURCE_LIBRARY: Record<string, RoadmapResourceSeed[]> = {
  'semantic html': [
    youtube('Semantic HTML fundamentals', 'https://www.youtube.com/watch?v=UB1O30fR-EE&t=380s', 18, 'Traversy Media'),
    docs('MDN HTML basics', 'https://developer.mozilla.org/en-US/docs/Learn/HTML/Introduction_to_HTML/Getting_started', 25, 'MDN Web Docs'),
  ],
  'html forms': [
    youtube('HTML forms and labels', 'https://www.youtube.com/watch?v=fNcJuPIZ2WE', 18, 'freeCodeCamp.org'),
    docs('MDN Web forms guide', 'https://developer.mozilla.org/en-US/docs/Learn/Forms', 35, 'MDN Web Docs'),
  ],
  html: [
    youtube('HTML foundations', 'https://www.youtube.com/watch?v=UB1O30fR-EE', 25, 'Traversy Media'),
    docs('MDN HTML reference', 'https://developer.mozilla.org/en-US/docs/Web/HTML', 30, 'MDN Web Docs'),
  ],
  'css selectors': [
    youtube('CSS selectors and box model segment', 'https://www.youtube.com/watch?v=yfoY53QXEnI&t=650s', 20, 'Traversy Media'),
    docs('MDN CSS first steps', 'https://developer.mozilla.org/en-US/docs/Learn/CSS/First_steps', 30, 'MDN Web Docs'),
  ],
  'box model': [
    youtube('CSS box model segment', 'https://www.youtube.com/watch?v=yfoY53QXEnI&t=1160s', 15, 'Traversy Media'),
    docs('MDN CSS box model', 'https://developer.mozilla.org/en-US/docs/Learn/CSS/Building_blocks/The_box_model', 25, 'MDN Web Docs'),
  ],
  flexbox: [
    youtube('Flexbox in focused steps', 'https://www.youtube.com/watch?v=JJSoEo8JSnc', 22, 'Traversy Media'),
    docs('MDN Flexbox guide', 'https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Flexbox', 30, 'MDN Web Docs'),
  ],
  'css grid': [
    youtube('CSS Grid in focused steps', 'https://www.youtube.com/watch?v=jV8B24rSN5o', 25, 'Traversy Media'),
    docs('MDN CSS Grid guide', 'https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Grids', 35, 'MDN Web Docs'),
  ],
  responsive: [
    youtube('Responsive layout fundamentals', 'https://www.youtube.com/watch?v=srvUrASNj0s', 25, 'Kevin Powell'),
    docs('MDN responsive design', 'https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Responsive_Design', 30, 'MDN Web Docs'),
  ],
  css: [
    youtube('CSS foundations segment', 'https://www.youtube.com/watch?v=yfoY53QXEnI', 25, 'Traversy Media'),
    docs('MDN CSS learning area', 'https://developer.mozilla.org/en-US/docs/Learn/CSS', 30, 'MDN Web Docs'),
  ],
  'javascript variables': [
    youtube('JavaScript variables segment', 'https://www.youtube.com/watch?v=hdI2bqOjy3c&t=520s', 18, 'Traversy Media'),
    docs('MDN JavaScript grammar and types', 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Grammar_and_types', 30, 'MDN Web Docs'),
  ],
  'control flow': [
    youtube('JavaScript conditionals and loops segment', 'https://www.youtube.com/watch?v=hdI2bqOjy3c&t=1540s', 20, 'Traversy Media'),
    docs('MDN control flow and error handling', 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Control_flow_and_error_handling', 30, 'MDN Web Docs'),
  ],
  'javascript functions': [
    youtube('JavaScript functions focused lesson', 'https://www.youtube.com/watch?v=N8ap4k_1QEQ', 12, 'Programming with Mosh'),
    docs('MDN JavaScript functions', 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Functions', 30, 'MDN Web Docs'),
  ],
  scope: [
    youtube('JavaScript scope segment', 'https://www.youtube.com/watch?v=hdI2bqOjy3c&t=2300s', 18, 'Traversy Media'),
    docs('MDN JavaScript functions and scope', 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Functions', 30, 'MDN Web Docs'),
  ],
  arrays: [
    youtube('JavaScript array methods segment', 'https://www.youtube.com/watch?v=hdI2bqOjy3c&t=3130s', 22, 'Traversy Media'),
    docs('MDN JavaScript Array reference', 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array', 35, 'MDN Web Docs'),
  ],
  'object methods': [
    youtube('JavaScript objects segment', 'https://www.youtube.com/watch?v=hdI2bqOjy3c&t=2700s', 18, 'Traversy Media'),
    docs('MDN working with objects', 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Working_with_objects', 35, 'MDN Web Docs'),
  ],
  'dom events': [
    youtube('DOM events segment', 'https://www.youtube.com/watch?v=0ik6X4DJKCc', 24, 'Traversy Media'),
    docs('MDN event introduction', 'https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Building_blocks/Events', 30, 'MDN Web Docs'),
  ],
  'form validation': [
    youtube('Form validation with JavaScript', 'https://www.youtube.com/watch?v=rsd4FNGTRBw', 24, 'Traversy Media'),
    docs('MDN client-side form validation', 'https://developer.mozilla.org/en-US/docs/Learn/Forms/Form_validation', 30, 'MDN Web Docs'),
  ],
  'async javascript': [
    youtube('Async JavaScript focused lesson', 'https://www.youtube.com/watch?v=PoRJizFvM7s', 18, 'Traversy Media'),
    docs('MDN asynchronous JavaScript', 'https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Asynchronous', 35, 'MDN Web Docs'),
  ],
  fetch: [
    youtube('Fetch API focused lesson', 'https://www.youtube.com/watch?v=cuEtnrL9-H0', 22, 'Traversy Media'),
    docs('MDN Fetch API guide', 'https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch', 30, 'MDN Web Docs'),
  ],
  javascript: [
    youtube('JavaScript topic segment', 'https://www.youtube.com/watch?v=hdI2bqOjy3c', 25, 'Traversy Media'),
    docs('MDN JavaScript guide', 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide', 40, 'MDN Web Docs'),
  ],
  'typescript primitives': [
    youtube('TypeScript in small steps', 'https://www.youtube.com/watch?v=BCg4U1FzODs', 25, 'Academind'),
    docs('TypeScript handbook', 'https://www.typescriptlang.org/docs/handbook/intro.html', 40, 'TypeScript'),
  ],
  'object types': [
    youtube('TypeScript object types segment', 'https://www.youtube.com/watch?v=BCg4U1FzODs&t=1020s', 18, 'Academind'),
    docs('TypeScript object types', 'https://www.typescriptlang.org/docs/handbook/2/objects.html', 35, 'TypeScript'),
  ],
  typescript: [
    youtube('TypeScript focused introduction', 'https://www.youtube.com/watch?v=BwuLxPH8IDs', 25, 'Traversy Media'),
    docs('TypeScript for JavaScript programmers', 'https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html', 25, 'TypeScript'),
  ],
  'react components': [
    youtube('React components and props segment', 'https://www.youtube.com/watch?v=w7ejDZ8SWv8&t=1240s', 24, 'Traversy Media'),
    docs('React describing the UI', 'https://react.dev/learn/describing-the-ui', 35, 'React'),
  ],
  props: [
    youtube('React props focused segment', 'https://www.youtube.com/watch?v=w7ejDZ8SWv8&t=1660s', 18, 'Traversy Media'),
    docs('React passing props', 'https://react.dev/learn/passing-props-to-a-component', 25, 'React'),
  ],
  'react state': [
    youtube('React useState focused lesson', 'https://www.youtube.com/watch?v=O6P86uwfdR0', 15, 'Web Dev Simplified'),
    docs('React adding interactivity', 'https://react.dev/learn/adding-interactivity', 30, 'React'),
  ],
  'react lists': [
    youtube('React lists and keys segment', 'https://www.youtube.com/watch?v=w7ejDZ8SWv8&t=2310s', 18, 'Traversy Media'),
    docs('React rendering lists', 'https://react.dev/learn/rendering-lists', 25, 'React'),
  ],
  'conditional ui': [
    youtube('React conditional rendering segment', 'https://www.youtube.com/watch?v=w7ejDZ8SWv8&t=2100s', 15, 'Traversy Media'),
    docs('React conditional rendering', 'https://react.dev/learn/conditional-rendering', 25, 'React'),
  ],
  effects: [
    youtube('React useEffect focused lesson', 'https://www.youtube.com/watch?v=0ZJgIjIuY7U', 20, 'Web Dev Simplified'),
    docs('React synchronizing with effects', 'https://react.dev/learn/synchronizing-with-effects', 35, 'React'),
  ],
  'api fetching': [
    youtube('React fetch API segment', 'https://www.youtube.com/watch?v=w7ejDZ8SWv8&t=3180s', 20, 'Traversy Media'),
    docs('MDN Fetch API guide', 'https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch', 30, 'MDN Web Docs'),
  ],
  'custom hooks': [
    youtube('React custom hooks focused lesson', 'https://www.youtube.com/watch?v=6ThXsUwLWvc', 20, 'Web Dev Simplified'),
    docs('React reusing logic with custom hooks', 'https://react.dev/learn/reusing-logic-with-custom-hooks', 35, 'React'),
  ],
  react: [
    youtube('React focused introduction', 'https://www.youtube.com/watch?v=w7ejDZ8SWv8', 30, 'Traversy Media'),
    docs('React Learn', 'https://react.dev/learn', 40, 'React'),
  ],
  accessibility: [
    youtube('Web accessibility basics', 'https://www.youtube.com/watch?v=20SHvU2PKsM', 20, 'Google Chrome Developers'),
    docs('MDN accessibility learning area', 'https://developer.mozilla.org/en-US/docs/Learn/Accessibility', 35, 'MDN Web Docs'),
  ],
  'next.js app router': [
    youtube('Next.js App Router segment', 'https://www.youtube.com/watch?v=mTz0GXj8NN0&t=980s', 24, 'Traversy Media'),
    docs('Next.js App Router docs', 'https://nextjs.org/docs/app', 40, 'Next.js'),
  ],
  'route handlers': [
    youtube('Next.js route handlers segment', 'https://www.youtube.com/watch?v=mTz0GXj8NN0&t=3320s', 20, 'Traversy Media'),
    docs('Next.js Route Handlers', 'https://nextjs.org/docs/app/building-your-application/routing/route-handlers', 35, 'Next.js'),
  ],
  'next.js': [
    youtube('Next.js focused introduction', 'https://www.youtube.com/watch?v=mTz0GXj8NN0', 30, 'Traversy Media'),
    docs('Next.js docs', 'https://nextjs.org/docs', 40, 'Next.js'),
  ],
  testing: [
    youtube('Testing fundamentals for JavaScript', 'https://www.youtube.com/watch?v=7r4xVDI2vho', 25, 'Web Dev Simplified'),
    docs('React testing overview', 'https://react.dev/learn', 30, 'React'),
  ],
  deployment: [
    youtube('Deploy a JavaScript app segment', 'https://www.youtube.com/watch?v=Kx_1NYYJS7Q', 20, 'Traversy Media'),
    docs('Next.js deploying guide', 'https://nextjs.org/docs/app/getting-started/deploying', 35, 'Next.js'),
  ],
  'node.js runtime': [
    youtube('Node.js runtime focused intro', 'https://www.youtube.com/watch?v=ENrzD9HAZK4', 18, 'Fireship'),
    docs('Node.js learn', 'https://nodejs.org/en/learn', 35, 'Node.js'),
  ],
  'npm scripts': [
    youtube('npm basics focused lesson', 'https://www.youtube.com/watch?v=jHDhaSSKmB0', 20, 'Traversy Media'),
    docs('npm scripts docs', 'https://docs.npmjs.com/cli/v10/using-npm/scripts', 25, 'npm Docs'),
  ],
  'environment variables': [
    youtube('Environment variables in Node.js', 'https://www.youtube.com/watch?v=17UVejOw3zA', 18, 'Fireship'),
    docs('Node.js environment variables', 'https://nodejs.org/en/learn/command-line/how-to-read-environment-variables-from-nodejs', 20, 'Node.js'),
  ],
  'node.js': [
    youtube('Node.js focused introduction', 'https://www.youtube.com/watch?v=ENrzD9HAZK4', 18, 'Fireship'),
    docs('Node.js learn', 'https://nodejs.org/en/learn', 35, 'Node.js'),
  ],
  nodejs: [
    youtube('Node.js focused introduction', 'https://www.youtube.com/watch?v=ENrzD9HAZK4', 18, 'Fireship'),
    docs('Node.js learn', 'https://nodejs.org/en/learn', 35, 'Node.js'),
  ],
  'express routing': [
    youtube('Express routes focused lesson', 'https://www.youtube.com/watch?v=L72fhGm1tfE&t=1520s', 20, 'Traversy Media'),
    docs('Express routing guide', 'https://expressjs.com/en/guide/routing.html', 30, 'Express'),
  ],
  middleware: [
    youtube('Express middleware segment', 'https://www.youtube.com/watch?v=L72fhGm1tfE&t=2210s', 18, 'Traversy Media'),
    docs('Express middleware guide', 'https://expressjs.com/en/guide/using-middleware.html', 30, 'Express'),
  ],
  express: [
    youtube('Express.js focused introduction', 'https://www.youtube.com/watch?v=L72fhGm1tfE', 30, 'Traversy Media'),
    docs('Express guide', 'https://expressjs.com/en/guide/routing.html', 30, 'Express'),
  ],
  'rest api': [
    youtube('REST API concepts and practice', 'https://www.youtube.com/watch?v=qbLc5a9jdXo', 25, 'Caleb Curry'),
    docs('MDN HTTP overview', 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Overview', 30, 'MDN Web Docs'),
  ],
  'http basics': [
    youtube('HTTP requests, methods, and status codes', 'https://www.youtube.com/watch?v=iYM2zFP3Zn0', 24, 'freeCodeCamp.org'),
    docs('MDN HTTP overview', 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Overview', 30, 'MDN Web Docs'),
  ],
  json: [
    youtube('JSON crash course for APIs', 'https://www.youtube.com/watch?v=iiADhChRriM', 16, 'Traversy Media'),
    docs('MDN JSON guide', 'https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/JSON', 28, 'MDN Web Docs'),
  ],
  'git basics': [
    youtube('Git and GitHub crash course', 'https://www.youtube.com/watch?v=RGOj5yH7evk', 30, 'freeCodeCamp.org'),
    docs('GitHub Hello World', 'https://docs.github.com/en/get-started/start-your-journey/hello-world', 25, 'GitHub Docs'),
  ],
  'backend folder structure': [
    youtube('How to structure Node.js projects', 'https://www.youtube.com/watch?v=5FJM5mWQ5iM', 18, 'JavaScript Mastery'),
    docs('Node.js architecture and structure patterns', 'https://nodejs.org/en/learn/getting-started/nodejs-the-difference-between-development-and-production', 25, 'Node.js'),
  ],
  controllers: [
    youtube('Express MVC controllers pattern', 'https://www.youtube.com/watch?v=0oXYLzuucwE', 22, 'Academind'),
    docs('Express routing guide', 'https://expressjs.com/en/guide/routing.html', 30, 'Express'),
  ],
  crud: [
    youtube('Build CRUD API with Express and PostgreSQL', 'https://www.youtube.com/watch?v=DihOP19LQdg', 28, 'Traversy Media'),
    docs('REST API design best practices', 'https://learn.microsoft.com/en-us/azure/architecture/best-practices/api-design', 30, 'Microsoft Learn'),
  ],
  'error handling': [
    youtube('Express error handling middleware', 'https://www.youtube.com/watch?v=3dSKnY8Ny4M', 20, 'Academind'),
    docs('Express error handling', 'https://expressjs.com/en/guide/error-handling.html', 25, 'Express'),
  ],
  'sql basics': [
    youtube('SQL for beginners in one hour', 'https://www.youtube.com/watch?v=HXV3zeQKqGY', 32, 'freeCodeCamp.org'),
    docs('PostgreSQL SQL tutorial', 'https://www.postgresql.org/docs/current/tutorial-sql.html', 35, 'PostgreSQL'),
  ],
  'database schema': [
    youtube('Database schema design basics', 'https://www.youtube.com/watch?v=ztHopE5Wnpc', 25, 'freeCodeCamp.org'),
    docs('PostgreSQL data definition', 'https://www.postgresql.org/docs/current/ddl.html', 30, 'PostgreSQL'),
  ],
  prisma: [
    youtube('Prisma ORM crash course', 'https://www.youtube.com/watch?v=RebA5J-rlwg', 24, 'Web Dev Simplified'),
    docs('Prisma getting started', 'https://www.prisma.io/docs/getting-started', 30, 'Prisma'),
  ],
  migrations: [
    youtube('Database migrations with Prisma', 'https://www.youtube.com/watch?v=b2xYQuzJMN8', 22, 'Prisma'),
    docs('Prisma migrate workflows', 'https://www.prisma.io/docs/orm/prisma-migrate/workflows/development-and-production', 30, 'Prisma'),
  ],
  bcrypt: [
    youtube('Hash passwords with bcrypt in Node.js', 'https://www.youtube.com/watch?v=2jqok-WgelI', 20, 'Web Dev Simplified'),
    docs('bcrypt npm package docs', 'https://www.npmjs.com/package/bcrypt', 20, 'npm Docs'),
  ],
  jwt: [
    youtube('JWT authentication tutorial', 'https://www.youtube.com/watch?v=7Q17ubqLfaM', 26, 'Web Dev Simplified'),
    docs('JWT introduction', 'https://jwt.io/introduction', 20, 'jwt.io'),
  ],
  session: [
    youtube('Sessions and cookies for auth', 'https://www.youtube.com/watch?v=sovAIX4doOE', 20, 'Traversy Media'),
    docs('express-session docs', 'https://www.npmjs.com/package/express-session', 25, 'npm Docs'),
  ],
  'protected routes': [
    youtube('Protect API routes with middleware', 'https://www.youtube.com/watch?v=mbsmsi7l3r4', 20, 'Traversy Media'),
    docs('Express middleware guide', 'https://expressjs.com/en/guide/using-middleware.html', 25, 'Express'),
  ],
  'role-based authorization': [
    youtube('Role based access control in Node.js', 'https://www.youtube.com/watch?v=R2hOvZ7bwXU', 22, 'freeCodeCamp.org'),
    docs('OWASP authorization cheat sheet', 'https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html', 30, 'OWASP'),
  ],
  postman: [
    youtube('Postman API testing for beginners', 'https://www.youtube.com/watch?v=VywxIQ2ZXw4', 25, 'freeCodeCamp.org'),
    docs('Postman learning center', 'https://learning.postman.com/docs/getting-started/introduction/', 25, 'Postman'),
  ],
  'thunder client': [
    youtube('Thunder Client in VS Code', 'https://www.youtube.com/watch?v=rQ7VlkN18hM', 12, 'Raphael Mendo'),
    docs('Thunder Client docs', 'https://www.thunderclient.com/docs', 20, 'Thunder Client'),
  ],
  'jest supertest': [
    youtube('API testing with Jest and Supertest', 'https://www.youtube.com/watch?v=FKnzS_icp20', 30, 'freeCodeCamp.org'),
    docs('Supertest docs', 'https://github.com/ladjs/supertest', 25, 'GitHub'),
  ],
  'backend deployment': [
    youtube('Deploy Node.js API to Render', 'https://www.youtube.com/watch?v=l134cBAJCuc', 24, 'Traversy Media'),
    docs('Render deploy Node.js service', 'https://render.com/docs/deploy-node-express-app', 25, 'Render'),
  ],
  'sql tables': [
    youtube('SQL tables and constraints segment', 'https://www.youtube.com/watch?v=Hl4NZB1XR9c&t=200s', 20, 'Programming with Mosh'),
    docs('PostgreSQL tutorial', 'https://www.postgresql.org/docs/current/tutorial.html', 40, 'PostgreSQL'),
  ],
  postgresql: [
    youtube('PostgreSQL focused beginner lesson', 'https://www.youtube.com/watch?v=9ZixI8Xy0T0', 30, 'YouTube'),
    docs('PostgreSQL current tutorial', 'https://www.postgresql.org/docs/current/tutorial.html', 40, 'PostgreSQL'),
  ],
  'database access': [
    youtube('Node.js database access segment', 'https://www.youtube.com/watch?v=f2EqECiTBL8', 25, 'Traversy Media'),
    docs('PostgreSQL SQL language tutorial', 'https://www.postgresql.org/docs/current/tutorial-sql.html', 35, 'PostgreSQL'),
  ],
  indexes: [
    youtube('Database indexes explained', 'https://www.youtube.com/watch?v=HubezKbFL7E', 18, 'ByteByteGo'),
    docs('PostgreSQL indexes', 'https://www.postgresql.org/docs/current/indexes.html', 35, 'PostgreSQL'),
  ],
  'database design': [
    youtube('Database design basics', 'https://www.youtube.com/watch?v=ztHopE5Wnpc', 25, 'freeCodeCamp.org'),
    docs('PostgreSQL tutorial', 'https://www.postgresql.org/docs/current/tutorial.html', 40, 'PostgreSQL'),
  ],
  authentication: [
    youtube('Authentication explained for backend apps', 'https://www.youtube.com/watch?v=F-sFp_AvHc8', 20, 'Fireship'),
    docs('OWASP authentication cheat sheet', 'https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html', 35, 'OWASP'),
  ],
  authorization: [
    youtube('Authentication versus authorization', 'https://www.youtube.com/watch?v=KNIpJi7d7K4', 16, 'OktaDev'),
    docs('OWASP authorization cheat sheet', 'https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html', 35, 'OWASP'),
  ],
  validation: [
    youtube('API input validation concepts', 'https://www.youtube.com/watch?v=CyDp_e2Z03k', 20, 'Web Dev Simplified'),
    docs('OWASP input validation cheat sheet', 'https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html', 35, 'OWASP'),
  ],
  security: [
    youtube('Web security basics', 'https://www.youtube.com/watch?v=4YOpILi9Oxs', 20, 'Fireship'),
    docs('OWASP API Security Top 10', 'https://owasp.org/API-Security/editions/2023/en/0x11-t10/', 35, 'OWASP'),
  ],
  'api documentation': [
    youtube('OpenAPI explained', 'https://www.youtube.com/watch?v=6kwmW_p_Tig', 18, 'IBM Technology'),
    docs('OpenAPI specification', 'https://spec.openapis.org/oas/latest.html', 35, 'OpenAPI Initiative'),
  ],
  logging: [
    youtube('Backend logging concepts', 'https://www.youtube.com/watch?v=2s5Bszp0LQ0', 18, 'Better Stack'),
    docs('Node.js diagnostics guide', 'https://nodejs.org/en/learn/diagnostics', 35, 'Node.js'),
  ],
  git: [
    youtube('Git and GitHub for beginners', 'https://www.youtube.com/watch?v=RGOj5yH7evk', 30, 'freeCodeCamp.org'),
    docs('GitHub Hello World', 'https://docs.github.com/en/get-started/start-your-journey/hello-world', 25, 'GitHub Docs'),
  ],
  documentation: [
    youtube('README writing for developers', 'https://www.youtube.com/watch?v=E6NO0rgFub4', 18, 'GitHub'),
    docs('GitHub README quickstart', 'https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-readmes', 25, 'GitHub Docs'),
  ],
  performance: [
    youtube('Web performance basics', 'https://www.youtube.com/watch?v=AQqFZ5t8uNc', 20, 'Google Chrome Developers'),
    docs('web.dev performance guide', 'https://web.dev/learn/performance', 35, 'web.dev'),
  ],
}

const FRONTEND_ONLY_HINTS = [
  'react',
  'next.js',
  'nextjs',
  'css',
  'html',
  'tailwind',
  'ui component',
  'state management',
  'jsx',
]

const BACKEND_HINTS = [
  'node',
  'express',
  'rest api',
  'postgres',
  'sql',
  'auth',
  'jwt',
  'bcrypt',
  'middleware',
  'controller',
  'migration',
  'prisma',
  'deployment',
]

type BackendTopicKey =
  | 'backend-js-typescript'
  | 'http-basics'
  | 'json-parsing'
  | 'git-terminal'
  | 'node-runtime-npm'
  | 'backend-folder-structure'
  | 'environment-variables'
  | 'node-basic-server'
  | 'express-routing'
  | 'express-controllers-services'
  | 'express-middleware'
  | 'rest-crud'
  | 'express-error-handling'
  | 'sql-basics'
  | 'postgres-tables'
  | 'database-relationships'
  | 'prisma-migrations'
  | 'database-crud'
  | 'auth-register-login'
  | 'bcrypt-password-hashing'
  | 'jwt-session-auth'
  | 'protected-routes'
  | 'input-validation'
  | 'postman-thunder-client'
  | 'jest-supertest'
  | 'api-documentation'
  | 'environment-config'
  | 'backend-deployment'

const BACKEND_TASK_TOPIC_MAP: Record<string, BackendTopicKey> = {
  'backend-1-1': 'backend-js-typescript',
  'backend-1-2': 'http-basics',
  'backend-1-3': 'json-parsing',
  'backend-1-4': 'git-terminal',
  'backend-2-1': 'node-runtime-npm',
  'backend-2-2': 'backend-folder-structure',
  'backend-2-3': 'environment-variables',
  'backend-2-4': 'node-basic-server',
  'backend-3-1': 'express-routing',
  'backend-3-2': 'express-controllers-services',
  'backend-3-3': 'express-middleware',
  'backend-3-4': 'rest-crud',
  'backend-3-5': 'express-error-handling',
  'backend-4-1': 'sql-basics',
  'backend-4-2': 'postgres-tables',
  'backend-4-3': 'database-relationships',
  'backend-4-4': 'prisma-migrations',
  'backend-4-5': 'database-crud',
  'backend-5-1': 'auth-register-login',
  'backend-5-2': 'bcrypt-password-hashing',
  'backend-5-3': 'jwt-session-auth',
  'backend-5-4': 'protected-routes',
  'backend-5-5': 'input-validation',
  'backend-6-1': 'postman-thunder-client',
  'backend-6-2': 'jest-supertest',
  'backend-6-3': 'api-documentation',
  'backend-6-4': 'environment-config',
  'backend-6-5': 'backend-deployment',
}

const BACKEND_TOPIC_KEYWORDS: Record<BackendTopicKey, string[]> = {
  'backend-js-typescript': ['javascript', 'typescript', 'backend'],
  'http-basics': ['http', 'request', 'response', 'status code', 'headers'],
  'json-parsing': ['json', 'parse', 'payload'],
  'git-terminal': ['git', 'terminal', 'github'],
  'node-runtime-npm': ['node.js', 'node', 'npm', 'runtime'],
  'backend-folder-structure': ['folder structure', 'project structure', 'architecture', 'backend structure'],
  'environment-variables': ['environment variable', '.env', 'dotenv', 'configuration'],
  'node-basic-server': ['node.js server', 'http server', 'create server'],
  'express-routing': ['express routing', 'express route', 'router'],
  'express-controllers-services': ['controller', 'service', 'express mvc'],
  'express-middleware': ['middleware', 'express middleware'],
  'rest-crud': ['crud', 'rest api', 'endpoint'],
  'express-error-handling': ['error handling', 'express error'],
  'sql-basics': ['sql', 'query', 'select', 'insert', 'update', 'delete'],
  'postgres-tables': ['postgresql', 'postgres', 'table', 'constraint'],
  'database-relationships': ['relationship', 'foreign key', 'one-to-many', 'schema'],
  'prisma-migrations': ['prisma', 'migration', 'orm'],
  'database-crud': ['database crud', 'postgresql crud', 'repository', 'data access'],
  'auth-register-login': ['register', 'login', 'authentication flow', 'auth api'],
  'bcrypt-password-hashing': ['bcrypt', 'password hashing'],
  'jwt-session-auth': ['jwt', 'session', 'token', 'authentication'],
  'protected-routes': ['protected route', 'authorization middleware', 'guard'],
  'input-validation': ['validation', 'input validation', 'zod', 'joi'],
  'postman-thunder-client': ['postman', 'thunder client', 'api testing'],
  'jest-supertest': ['jest', 'supertest', 'integration test'],
  'api-documentation': ['openapi', 'swagger', 'api documentation'],
  'environment-config': ['environment config', '.env', 'configuration'],
  'backend-deployment': ['render', 'railway', 'deploy node', 'deployment'],
}

const BACKEND_TOPIC_RESOURCE_MAP: Record<BackendTopicKey, RoadmapResourceSeed[]> = {
  'backend-js-typescript': [
    youtube('JavaScript & TypeScript basics for backend', 'https://www.youtube.com/watch?v=hdI2bqOjy3c', 32, 'Traversy Media'),
    docs('TypeScript for JavaScript programmers', 'https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html', 25, 'TypeScript'),
  ],
  'http-basics': [
    youtube('HTTP request, response, headers, and status codes', 'https://www.youtube.com/watch?v=iYM2zFP3Zn0', 24, 'freeCodeCamp.org'),
    docs('MDN HTTP overview', 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Overview', 30, 'MDN Web Docs'),
  ],
  'json-parsing': [
    youtube('JSON basics for API payloads', 'https://www.youtube.com/watch?v=iiADhChRriM', 16, 'Traversy Media'),
    docs('MDN JSON guide', 'https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/JSON', 28, 'MDN Web Docs'),
  ],
  'git-terminal': [
    youtube('Git and terminal basics for beginners', 'https://www.youtube.com/watch?v=RGOj5yH7evk', 30, 'freeCodeCamp.org'),
    docs('Git documentation: getting started', 'https://git-scm.com/doc', 20, 'Git'),
  ],
  'node-runtime-npm': [
    youtube('Node.js runtime and npm basics', 'https://www.youtube.com/watch?v=ENrzD9HAZK4', 20, 'Fireship'),
    docs('Node.js Learn: Introduction to Node.js', 'https://nodejs.org/en/learn/getting-started/introduction-to-nodejs', 25, 'Node.js'),
  ],
  'backend-folder-structure': [
    youtube('Node.js backend folder structure', 'https://www.youtube.com/watch?v=5FJM5mWQ5iM', 18, 'JavaScript Mastery'),
    docs('Node.js project structure best practices', 'https://nodejs.org/en/learn/getting-started/nodejs-the-difference-between-development-and-production', 20, 'Node.js'),
  ],
  'environment-variables': [
    youtube('Environment variables with dotenv in Node.js', 'https://www.youtube.com/watch?v=17UVejOw3zA', 18, 'Fireship'),
    docs('Node.js environment variables', 'https://nodejs.org/en/learn/command-line/how-to-read-environment-variables-from-nodejs', 20, 'Node.js'),
  ],
  'node-basic-server': [
    youtube('Build a basic Node.js server', 'https://www.youtube.com/watch?v=TlB_eWDSMt4', 20, 'Programming with Mosh'),
    docs('Node.js HTTP module', 'https://nodejs.org/api/http.html', 25, 'Node.js'),
  ],
  'express-routing': [
    youtube('Express routing tutorial', 'https://www.youtube.com/watch?v=L72fhGm1tfE&t=1520s', 20, 'Traversy Media'),
    docs('Express routing guide', 'https://expressjs.com/en/guide/routing.html', 30, 'Express'),
  ],
  'express-controllers-services': [
    youtube('Express controllers and services pattern', 'https://www.youtube.com/watch?v=0oXYLzuucwE', 22, 'Academind'),
    docs('Express writing middleware and handlers', 'https://expressjs.com/en/guide/writing-middleware.html', 20, 'Express'),
  ],
  'express-middleware': [
    youtube('Express middleware explained', 'https://www.youtube.com/watch?v=L72fhGm1tfE&t=2210s', 18, 'Traversy Media'),
    docs('Express middleware guide', 'https://expressjs.com/en/guide/using-middleware.html', 30, 'Express'),
  ],
  'rest-crud': [
    youtube('Build REST API CRUD with Express', 'https://www.youtube.com/watch?v=DihOP19LQdg', 28, 'Traversy Media'),
    docs('REST API design best practices', 'https://learn.microsoft.com/en-us/azure/architecture/best-practices/api-design', 30, 'Microsoft Learn'),
  ],
  'express-error-handling': [
    youtube('Express error handling middleware', 'https://www.youtube.com/watch?v=3dSKnY8Ny4M', 20, 'Academind'),
    docs('Express error handling docs', 'https://expressjs.com/en/guide/error-handling.html', 25, 'Express'),
  ],
  'sql-basics': [
    youtube('SQL basics for beginners', 'https://www.youtube.com/watch?v=HXV3zeQKqGY', 32, 'freeCodeCamp.org'),
    docs('PostgreSQL SQL tutorial', 'https://www.postgresql.org/docs/current/tutorial-sql.html', 35, 'PostgreSQL'),
  ],
  'postgres-tables': [
    youtube('PostgreSQL tables and constraints', 'https://www.youtube.com/watch?v=Hl4NZB1XR9c', 24, 'Programming with Mosh'),
    docs('PostgreSQL table definition', 'https://www.postgresql.org/docs/current/ddl.html', 30, 'PostgreSQL'),
  ],
  'database-relationships': [
    youtube('Database relationships and foreign keys', 'https://www.youtube.com/watch?v=ztHopE5Wnpc', 25, 'freeCodeCamp.org'),
    docs('PostgreSQL constraints and foreign keys', 'https://www.postgresql.org/docs/current/ddl-constraints.html', 30, 'PostgreSQL'),
  ],
  'prisma-migrations': [
    youtube('Prisma ORM and migration basics', 'https://www.youtube.com/watch?v=RebA5J-rlwg', 24, 'Web Dev Simplified'),
    docs('Prisma migrate workflows', 'https://www.prisma.io/docs/orm/prisma-migrate/workflows/development-and-production', 30, 'Prisma'),
  ],
  'database-crud': [
    youtube('Express + PostgreSQL CRUD integration', 'https://www.youtube.com/watch?v=DihOP19LQdg', 28, 'Traversy Media'),
    docs('Prisma CRUD operations', 'https://www.prisma.io/docs/orm/prisma-client/queries/crud', 30, 'Prisma'),
  ],
  'auth-register-login': [
    youtube('Build register and login flow in Node.js', 'https://www.youtube.com/watch?v=Ud5xKCYQTjM', 26, 'Web Dev Simplified'),
    docs('OWASP Authentication Cheat Sheet', 'https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html', 30, 'OWASP'),
  ],
  'bcrypt-password-hashing': [
    youtube('Password hashing with bcrypt in Node.js', 'https://www.youtube.com/watch?v=2jqok-WgelI', 20, 'Web Dev Simplified'),
    docs('bcrypt npm docs', 'https://www.npmjs.com/package/bcrypt', 20, 'npm Docs'),
  ],
  'jwt-session-auth': [
    youtube('JWT authentication tutorial', 'https://www.youtube.com/watch?v=7Q17ubqLfaM', 26, 'Web Dev Simplified'),
    docs('jwt.io introduction', 'https://jwt.io/introduction', 20, 'jwt.io'),
  ],
  'protected-routes': [
    youtube('Protect API routes with middleware', 'https://www.youtube.com/watch?v=mbsmsi7l3r4', 20, 'Traversy Media'),
    docs('Express middleware for route protection', 'https://expressjs.com/en/guide/using-middleware.html', 25, 'Express'),
  ],
  'input-validation': [
    youtube('Input validation for REST APIs', 'https://www.youtube.com/watch?v=CyDp_e2Z03k', 20, 'Web Dev Simplified'),
    docs('OWASP Input Validation Cheat Sheet', 'https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html', 30, 'OWASP'),
  ],
  'postman-thunder-client': [
    youtube('Postman API testing for beginners', 'https://www.youtube.com/watch?v=VywxIQ2ZXw4', 25, 'freeCodeCamp.org'),
    docs('Postman learning center', 'https://learning.postman.com/docs/getting-started/introduction/', 25, 'Postman'),
  ],
  'jest-supertest': [
    youtube('Jest and Supertest API testing basics', 'https://www.youtube.com/watch?v=FKnzS_icp20', 30, 'freeCodeCamp.org'),
    docs('Supertest documentation', 'https://github.com/ladjs/supertest', 25, 'GitHub'),
  ],
  'api-documentation': [
    youtube('Document APIs with OpenAPI', 'https://www.youtube.com/watch?v=6kwmW_p_Tig', 18, 'IBM Technology'),
    docs('OpenAPI specification', 'https://spec.openapis.org/oas/latest.html', 30, 'OpenAPI Initiative'),
  ],
  'environment-config': [
    youtube('Environment config for production Node.js apps', 'https://www.youtube.com/watch?v=17UVejOw3zA', 18, 'Fireship'),
    docs('Node.js configuration for environments', 'https://nodejs.org/en/learn/getting-started/nodejs-the-difference-between-development-and-production', 25, 'Node.js'),
  ],
  'backend-deployment': [
    youtube('Deploy backend API to Render or Railway', 'https://www.youtube.com/watch?v=l134cBAJCuc', 24, 'Traversy Media'),
    docs('Render docs: deploy Node.js services', 'https://render.com/docs/deploy-node-express-app', 25, 'Render'),
  ],
}

const KEY_ALIASES: Record<string, string[]> = {
  'javascript variables': ['javascript basics', 'javascript and typescript basics'],
  typescript: ['typescript basics', 'typescript'],
  'http basics': ['http basics', 'http methods', 'status codes'],
  json: ['json'],
  'git basics': ['git basics', 'git workflow', 'git'],
  'node.js runtime': ['node.js runtime', 'node runtime', 'event loop'],
  'npm scripts': ['npm scripts', 'npm packages', 'package.json'],
  'environment variables': ['environment variables', '.env', 'configuration'],
  'backend folder structure': ['backend folder structure', 'project structure', 'module boundaries'],
  'express routing': ['express setup', 'express routing', 'routes'],
  controllers: ['controllers', 'controller'],
  middleware: ['middleware'],
  crud: ['crud', 'restful crud', 'create update delete'],
  'error handling': ['error handling', 'safe errors'],
  'sql basics': ['sql basics', 'sql'],
  postgresql: ['postgresql', 'postgres'],
  'database schema': ['database schema', 'schema design', 'erd'],
  prisma: ['prisma', 'orm'],
  migrations: ['migration', 'migrations'],
  'database access': ['database crud', 'data access', 'repository'],
  bcrypt: ['bcrypt', 'password hashing'],
  jwt: ['jwt', 'token auth'],
  session: ['session auth', 'session'],
  'protected routes': ['protected routes', 'route guard'],
  'role-based authorization': ['role-based authorization', 'rbac', 'authorization'],
  validation: ['input validation', 'validation'],
  postman: ['postman'],
  'thunder client': ['thunder client'],
  'jest supertest': ['jest', 'supertest', 'api testing'],
  'api documentation': ['api documentation', 'openapi', 'swagger'],
  'backend deployment': ['backend deployment', 'render', 'railway', 'vercel deployment'],
  'react components': ['react components', 'component basics'],
  'react state': ['react state', 'state management'],
  'next.js app router': ['next.js', 'app router'],
}

function normalizeSkill(value: string) {
  return value.trim().toLowerCase()
}

function normalizeText(value: string) {
  return value.toLowerCase()
}

function buildUnavailableResource(resourceType: 'youtube' | 'docs', reason: string): RoadmapResourceSeed {
  return {
    title: resourceType === 'youtube'
      ? 'Resource unavailable: no matching video found'
      : 'Resource unavailable: no matching docs found',
    resourceType,
    url: '',
    provider: 'SkillPath Curation',
    estimatedMinutes: 0,
    isRequired: true,
    completionRule: `resource_unavailable:${reason}`,
  }
}

function inferRoleTrack(
  task: RoadmapTask,
  week: RoadmapWeek,
  targetRole?: TargetRole | null
): 'backend' | 'frontend' | 'mixed' {
  if (targetRole === 'backend-developer') return 'backend'
  if (targetRole === 'frontend-developer' || targetRole === 'ui-engineer') return 'frontend'
  if (targetRole === 'fullstack-developer') return 'mixed'

  const source = normalizeText(
    `${task.id} ${task.title} ${task.description} ${task.deliverable} ${week.title} ${week.goal} ${week.focusSkills.join(' ')}`
  )

  const backendHits = BACKEND_HINTS.filter((keyword) => source.includes(keyword)).length
  const frontendHits = FRONTEND_ONLY_HINTS.filter((keyword) => source.includes(keyword)).length

  if (backendHits > frontendHits) return 'backend'
  if (frontendHits > backendHits) return 'frontend'
  return 'mixed'
}

function deriveBackendTopicKey(task: RoadmapTask, week: RoadmapWeek): BackendTopicKey | null {
  const fromTaskId = BACKEND_TASK_TOPIC_MAP[task.id]
  if (fromTaskId) return fromTaskId

  const source = normalizeText(
    `${task.title} ${task.description} ${task.deliverable} ${week.title} ${week.goal} ${week.focusSkills.join(' ')}`
  )

  if (source.includes('javascript') && source.includes('typescript')) return 'backend-js-typescript'
  if (source.includes('http') && (source.includes('status') || source.includes('header'))) return 'http-basics'
  if (source.includes('json')) return 'json-parsing'
  if (source.includes('git') || source.includes('terminal')) return 'git-terminal'
  if (source.includes('node') && source.includes('npm')) return 'node-runtime-npm'
  if (source.includes('folder structure') || source.includes('module boundaries') || source.includes('backend structure')) return 'backend-folder-structure'
  if (source.includes('environment variable') || source.includes('.env') || source.includes('config safety')) return 'environment-variables'
  if (source.includes('basic node.js server') || source.includes('express setup and base server') || source.includes('http server')) return 'node-basic-server'
  if (source.includes('express routing') || source.includes('routing')) return 'express-routing'
  if (source.includes('controllers and services') || source.includes('routing and controllers') || source.includes('controller')) return 'express-controllers-services'
  if (source.includes('middleware')) return 'express-middleware'
  if (source.includes('crud') || source.includes('restful')) return 'rest-crud'
  if (source.includes('error handling')) return 'express-error-handling'
  if (source.includes('sql basics') || (source.includes('sql') && source.includes('crud'))) return 'sql-basics'
  if (source.includes('postgresql tables') || (source.includes('postgresql') && source.includes('table'))) return 'postgres-tables'
  if (source.includes('relationship')) return 'database-relationships'
  if (source.includes('prisma') || source.includes('migration')) return 'prisma-migrations'
  if (source.includes('database crud') || source.includes('crud with database') || source.includes('database integration')) return 'database-crud'
  if (source.includes('register and login') || source.includes('login flow')) return 'auth-register-login'
  if (source.includes('bcrypt') || source.includes('password hashing')) return 'bcrypt-password-hashing'
  if (source.includes('jwt') || source.includes('session authentication')) return 'jwt-session-auth'
  if (source.includes('protected routes') || source.includes('ownership authorization')) return 'protected-routes'
  if (source.includes('input validation') || source.includes('validation')) return 'input-validation'
  if (source.includes('postman') || source.includes('thunder client')) return 'postman-thunder-client'
  if (source.includes('jest') || source.includes('supertest')) return 'jest-supertest'
  if (source.includes('api documentation') || source.includes('openapi') || source.includes('swagger')) return 'api-documentation'
  if (source.includes('environment config') || source.includes('environment configuration')) return 'environment-config'
  if (source.includes('deploy backend') || source.includes('deployment') || source.includes('render') || source.includes('railway')) return 'backend-deployment'

  return null
}

function inferResourceKeys(task: RoadmapTask, week: RoadmapWeek): string[] {
  const source = normalizeText(
    `${task.title} ${task.description} ${task.deliverable} ${week.title} ${week.goal} ${week.focusSkills.join(' ')}`
  )

  const fromAliases = Object.entries(KEY_ALIASES)
    .filter(([, aliases]) => aliases.some((alias) => source.includes(alias)))
    .map(([key]) => key)

  const directMatches = Object.keys(RESOURCE_LIBRARY)
    .filter((key) => source.includes(key))

  const fallbackFocusSkills = week.focusSkills
    .map(normalizeSkill)
    .filter((skill) => RESOURCE_LIBRARY[skill])

  const keys = Array.from(new Set([...fromAliases, ...directMatches]))

  if (keys.length > 0) {
    return keys.sort((a, b) => b.length - a.length)
  }

  return fallbackFocusSkills
}

function isTrackCompatible(
  track: 'backend' | 'frontend' | 'mixed',
  key: string
) {
  const normalizedKey = normalizeSkill(key)
  const isFrontendKey = FRONTEND_ONLY_HINTS.some((keyword) => normalizedKey.includes(keyword))
  const isBackendKey = BACKEND_HINTS.some((keyword) => normalizedKey.includes(keyword))

  if (track === 'backend') return !isFrontendKey || isBackendKey
  if (track === 'frontend') return !isBackendKey || isFrontendKey
  return true
}

function hasSemanticOverlap(task: RoadmapTask, week: RoadmapWeek, key: string, title: string) {
  const source = normalizeText(
    `${task.title} ${task.description} ${task.deliverable} ${week.title} ${week.goal} ${week.focusSkills.join(' ')}`
  )
  const keyTokens = normalizeSkill(key).split(/\s+/).filter((token) => token.length > 2)
  const titleTokens = normalizeSkill(title).split(/\s+/).filter((token) => token.length > 2)
  const overlapFromKey = keyTokens.some((token) => source.includes(token))
  const overlapFromTitle = titleTokens.some((token) => source.includes(token))
  return overlapFromKey || overlapFromTitle
}

export function isResourceLikelyRelevant(
  task: RoadmapTask,
  week: RoadmapWeek,
  resource: Pick<RoadmapResourceSeed, 'title' | 'resourceType'> & { provider?: string },
  targetRole?: TargetRole | null
) {
  const track = inferRoleTrack(task, week, targetRole)
  const backendTopicKey = deriveBackendTopicKey(task, week)
  const source = normalizeText(
    `${task.title} ${task.description} ${task.deliverable} ${week.title} ${week.goal} ${week.focusSkills.join(' ')}`
  )
  const resourceTitle = normalizeText(resource.title)
  const resourceSource = normalizeText(`${resource.title} ${resource.provider ?? ''}`)

  const frontendHit = FRONTEND_ONLY_HINTS.some((keyword) => resourceTitle.includes(keyword))
  const backendHit = BACKEND_HINTS.some((keyword) => resourceTitle.includes(keyword))

  if (backendTopicKey && track !== 'frontend') {
    const keywords = BACKEND_TOPIC_KEYWORDS[backendTopicKey]
    return keywords.some((keyword) => resourceSource.includes(keyword))
  }

  if (track === 'backend' && frontendHit && !backendHit) {
    return false
  }
  if (track === 'frontend' && backendHit && !frontendHit) {
    return false
  }

  const keys = inferResourceKeys(task, week)
  if (keys.length === 0) return true

  return keys.some((key) => hasSemanticOverlap(task, week, key, resource.title) || source.includes(key))
}

function selectDeterministicBackendResource(
  resourceType: 'youtube' | 'docs',
  topicKey: BackendTopicKey,
  usedUrls: Set<string>
) {
  const entries = BACKEND_TOPIC_RESOURCE_MAP[topicKey] ?? []
  let reusedCandidate: RoadmapResourceSeed | null = null

  for (const entry of entries) {
    if (entry.resourceType !== resourceType) continue
    if (!entry.url) continue
    if (usedUrls.has(entry.url)) {
      if (!reusedCandidate) reusedCandidate = entry
      continue
    }
    usedUrls.add(entry.url)
    return entry
  }

  if (reusedCandidate?.url) {
    usedUrls.add(reusedCandidate.url)
    return reusedCandidate
  }

  return null
}

function selectResourceByType(
  resourceType: 'youtube' | 'docs',
  keys: string[],
  task: RoadmapTask,
  week: RoadmapWeek,
  track: 'backend' | 'frontend' | 'mixed',
  usedUrls: Set<string>
) {
  for (const key of keys) {
    if (!isTrackCompatible(track, key)) continue

    const entries = (RESOURCE_LIBRARY[key] ?? []).filter((entry) => entry.resourceType === resourceType)
    for (const entry of entries) {
      if (!entry.url || usedUrls.has(entry.url)) continue
      if (!hasSemanticOverlap(task, week, key, entry.title)) continue
      usedUrls.add(entry.url)
      return entry
    }
  }

  return null
}

export function getCuratedResourcesForTask(
  task: RoadmapTask,
  week: RoadmapWeek,
  options?: GetCuratedResourcesOptions
): RoadmapResourceSeed[] {
  const track = inferRoleTrack(task, week, options?.targetRole)
  const backendTopicKey = deriveBackendTopicKey(task, week)
  const keys = inferResourceKeys(task, week)
  const usedUrls = options?.usedUrls ?? new Set<string>()

  if (track === 'backend' || backendTopicKey) {
    if (!backendTopicKey) {
      return [
        buildUnavailableResource('youtube', 'missing_backend_topic_key'),
        buildUnavailableResource('docs', 'missing_backend_topic_key'),
      ]
    }

    return [
      selectDeterministicBackendResource('youtube', backendTopicKey, usedUrls) ?? buildUnavailableResource('youtube', 'missing_video_match'),
      selectDeterministicBackendResource('docs', backendTopicKey, usedUrls) ?? buildUnavailableResource('docs', 'missing_docs_match'),
    ]
  }

  const selectedVideo = selectResourceByType('youtube', keys, task, week, track, usedUrls)
  const selectedDocs = selectResourceByType('docs', keys, task, week, track, usedUrls)

  const resolved: RoadmapResourceSeed[] = [
    selectedVideo ?? buildUnavailableResource('youtube', 'missing_video_match'),
    selectedDocs ?? buildUnavailableResource('docs', 'missing_docs_match'),
  ]

  return resolved
}
