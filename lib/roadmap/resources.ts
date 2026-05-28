import type { RoadmapTask, RoadmapWeek } from '@/types'

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
    isRequired: false,
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

const DEFAULT_RESOURCE: RoadmapResourceSeed = {
  title: 'Build the task deliverable',
  resourceType: 'project',
  url: '/projects',
  provider: 'SkillPath Practice',
  estimatedMinutes: 45,
  isRequired: true,
  completionRule: 'manual_mark_complete',
}

function normalizeSkill(value: string) {
  return value.trim().toLowerCase()
}

function inferResourceKeys(task: RoadmapTask, week: RoadmapWeek): string[] {
  const source = [
    task.title,
    task.description,
    task.deliverable,
    ...week.focusSkills,
  ].join(' ').toLowerCase()

  return Object.keys(RESOURCE_LIBRARY)
    .filter((key) => source.includes(key))
    .sort((a, b) => b.length - a.length)
}

export function getCuratedResourcesForTask(task: RoadmapTask, week: RoadmapWeek): RoadmapResourceSeed[] {
  const inferredSkills = inferResourceKeys(task, week)
  const broadSkills = week.focusSkills.map(normalizeSkill)
  const skills = Array.from(new Set([...inferredSkills, ...broadSkills]))

  const resources = skills
    .flatMap((skill) => RESOURCE_LIBRARY[skill] ?? [])
    .filter((resource, index, all) => all.findIndex((item) => item.url === resource.url) === index)
    .slice(0, 2)

  return resources.length > 0 ? resources : [DEFAULT_RESOURCE]
}
