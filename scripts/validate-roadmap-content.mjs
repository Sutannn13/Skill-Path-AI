import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const moduleCache = new Map()

function resolveLocalModule(request, parentDirectory = repositoryRoot) {
  const relativePath = request.startsWith('@/')
    ? request.slice(2)
    : request.startsWith('.')
      ? path.resolve(parentDirectory, request)
      : null
  if (!relativePath) return null
  const basePath = path.isAbsolute(relativePath)
    ? relativePath
    : path.join(repositoryRoot, relativePath)
  const candidates = [
    `${basePath}.ts`,
    `${basePath}.tsx`,
    path.join(basePath, 'index.ts'),
  ]
  return candidates.find((candidate) => fs.existsSync(candidate)) ?? null
}

function loadTypeScriptModule(filePath) {
  const absolutePath = path.resolve(filePath)
  if (moduleCache.has(absolutePath)) return moduleCache.get(absolutePath).exports

  const source = fs.readFileSync(absolutePath, 'utf8')
  const output = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
    },
    fileName: absolutePath,
  }).outputText

  const module = { exports: {} }
  moduleCache.set(absolutePath, module)

  const localRequire = (request) => {
    const localPath = resolveLocalModule(request, path.dirname(absolutePath))
    if (localPath) return loadTypeScriptModule(localPath)
    throw new Error(`Unsupported validation import: ${request}`)
  }

  const execute = new Function('require', 'module', 'exports', '__filename', '__dirname', output)
  execute(localRequire, module, module.exports, absolutePath, path.dirname(absolutePath))
  return module.exports
}

const { generateFallbackRoadmap } = loadTypeScriptModule(
  path.join(repositoryRoot, 'lib/ai/fallback-roadmap.ts')
)
const {
  getCuratedResourcesForTask,
  getLongFormVideoTrackForTask,
  getRoadmapVideoLanguage,
  isResourceLikelyRelevant,
  resolveRoadmapVideoSlides,
} = loadTypeScriptModule(path.join(repositoryRoot, 'lib/roadmap/resources.ts'))
const {
  ROADMAP_CONTENT_VERSION,
  getTaskContentContract,
  taskRequiresModuleProject,
} = loadTypeScriptModule(path.join(repositoryRoot, 'lib/roadmap/content-contract.ts'))
const {
  getCuratedQuizQuestions,
  inferQuizSkillFromTask,
  QUIZ_QUESTION_COUNT,
} = loadTypeScriptModule(path.join(repositoryRoot, 'lib/roadmap/quiz-bank.ts'))
const {
  calculateTaskProgress,
  getLearningResourceGateFromResources,
} = loadTypeScriptModule(path.join(repositoryRoot, 'lib/roadmap/progress.ts'))
const {
  loadUserRoadmapSummary,
} = loadTypeScriptModule(path.join(repositoryRoot, 'lib/roadmap/user-progress.ts'))

const roles = [
  'frontend-developer',
  'backend-developer',
  'fullstack-developer',
  'ui-engineer',
  'mobile-developer',
  'data-analyst',
]

const bilingualTargetRoles = new Set([
  'frontend-developer',
  'backend-developer',
  'fullstack-developer',
])

const roleTextRules = {
  'frontend-developer': {
    required: ['internet', 'html', 'git', 'npm', 'react', 'tailwind', 'next.js', 'testing'],
    forbidden: ['bcrypt password', 'postgresql tables', 'express routing'],
  },
  'backend-developer': {
    required: ['internet', 'javascript', 'typescript', 'node.js', 'express', 'postgresql', 'authentication', 'redis'],
    forbidden: ['react state', 'css grid', 'next.js app router'],
  },
  'fullstack-developer': {
    required: ['internet', 'git', 'npm', 'react', 'tailwind', 'node.js', 'express', 'postgresql', 'authentication', 'redis', 'linux', 'deployment'],
    forbidden: [],
  },
  'ui-engineer': {
    required: ['accessibility', 'design systems', 'component', 'performance'],
    forbidden: ['bcrypt password', 'postgresql crud', 'express routing'],
  },
  'mobile-developer': {
    required: ['react native', 'expo router', 'offline', 'eas'],
    forbidden: ['next.js app router', 'express routing', 'postgresql tables', 'css grid'],
  },
  'data-analyst': {
    required: ['sql', 'python', 'pandas', 'data visualization'],
    forbidden: ['react component', 'next.js', 'express routing', 'node.js server'],
  },
}

const beginnerSequenceRules = {
  'frontend-developer': {
    orderedTaskIds: [
      'frontend-1-1',
      'frontend-1-2',
      'frontend-1-5',
      'frontend-2-1',
      'frontend-2-4',
      'frontend-2-5',
      'frontend-3-1',
      'frontend-3-2',
      'frontend-3-5',
    ],
    firstModuleForbidden: ['react', 'next.js', 'node.js', 'express'],
  },
  'backend-developer': {
    orderedTaskIds: [
      'backend-1-1',
      'backend-1-2',
      'backend-1-3',
      'backend-1-4',
      'backend-1-5',
      'backend-2-2',
      'backend-2-4',
      'backend-3-1',
      'backend-4-1',
      'backend-5-1',
      'backend-6-2',
      'backend-6-4',
      'backend-6-5',
    ],
    firstModuleForbidden: ['node.js runtime', 'express', 'prisma', 'react'],
  },
  'fullstack-developer': {
    orderedTaskIds: [
      'frontend-1-1',
      'frontend-1-5',
      'fullstack-2-1',
      'fullstack-2-3',
      'fullstack-2-4',
      'fullstack-2-5',
      'fullstack-3-1',
      'fullstack-3-5',
      'fullstack-4-1',
      'fullstack-4-3',
      'fullstack-4-4',
      'fullstack-5-1',
      'fullstack-5-3',
      'fullstack-5-5',
      'fullstack-6-3',
      'fullstack-6-4',
      'fullstack-6-5',
    ],
    firstModuleForbidden: ['react components', 'node.js', 'express', 'postgresql'],
  },
  'ui-engineer': {
    orderedTaskIds: [
      'frontend-1-1',
      'frontend-1-5',
      'ui-2-1',
      'ui-2-3',
      'ui-2-4',
      'ui-2-5',
      'ui-3-1',
      'ui-4-1',
      'ui-5-1',
    ],
    firstModuleForbidden: ['react components', 'storybook', 'design tokens', 'express'],
  },
  'mobile-developer': {
    orderedTaskIds: [
      'mobile-1-1',
      'mobile-1-2',
      'mobile-1-3',
      'mobile-1-4',
      'mobile-1-5',
      'mobile-2-1',
      'mobile-2-2',
      'mobile-3-1',
      'mobile-4-1',
      'mobile-5-1',
      'mobile-6-3',
    ],
    firstModuleForbidden: ['react native', 'expo router', 'async storage', 'eas build'],
  },
  'data-analyst': {
    orderedTaskIds: [
      'data-1-1',
      'data-1-2',
      'data-1-3',
      'data-1-4',
      'data-2-1',
      'data-3-1',
      'data-4-1',
      'data-4-2',
      'data-5-1',
      'data-6-1',
    ],
    firstModuleForbidden: ['sql select', 'python basics', 'pandas dataframe', 'react'],
  },
}

let validatedTaskCount = 0
const generatedResourceUrls = new Set()
const roadmapAuditRows = []

for (const role of roles) {
  const roadmap = generateFallbackRoadmap({
    targetRole: role,
    currentLevel: 'beginner',
    missingSkills: [],
    studyTime: '1hour',
    durationWeeks: 6,
  })

  assert.equal(roadmap.contentVersion, ROADMAP_CONTENT_VERSION, `${role}: stale content version`)
  assert.equal(roadmap.weeks.length, 6, `${role}: expected six modules`)

  const taskIds = roadmap.weeks.flatMap((week) => week.tasks.map((task) => task.id))
  assert.equal(new Set(taskIds).size, taskIds.length, `${role}: duplicate task IDs`)
  assert.equal(
    roadmap.weeks[0]?.tasks[0]?.difficulty,
    'easy',
    `${role}: first task must be beginner-friendly`
  )

  const roadmapText = JSON.stringify(roadmap).toLowerCase()
  for (const keyword of roleTextRules[role].required) {
    assert.ok(roadmapText.includes(keyword), `${role}: missing required topic "${keyword}"`)
  }
  for (const keyword of roleTextRules[role].forbidden) {
    assert.ok(!roadmapText.includes(keyword), `${role}: contains unrelated topic "${keyword}"`)
  }

  let previousTaskIndex = -1
  for (const taskId of beginnerSequenceRules[role].orderedTaskIds) {
    const taskIndex = taskIds.indexOf(taskId)
    assert.ok(taskIndex >= 0, `${role}: missing beginner prerequisite task "${taskId}"`)
    assert.ok(
      taskIndex > previousTaskIndex,
      `${role}: task "${taskId}" is out of beginner prerequisite order`
    )
    previousTaskIndex = taskIndex
  }

  const firstModuleText = roadmap.weeks[0].tasks
    .map((task) => task.title.toLowerCase())
    .join(' ')
  for (const keyword of beginnerSequenceRules[role].firstModuleForbidden) {
    assert.ok(
      !firstModuleText.includes(keyword),
      `${role}: first module introduces "${keyword}" before its prerequisite`
    )
  }

  for (const week of roadmap.weeks) {
    assert.ok(week.miniProject, `${role} module ${week.week}: missing mini project`)
    assert.ok(
      week.tasks.length >= 3 && week.tasks.length <= 5,
      `${role} module ${week.week}: expected 3-5 focused tasks`
    )
    const projectTaskIndexes = week.tasks
      .map((_, index) => taskRequiresModuleProject(index, week.tasks.length, Boolean(week.miniProject)))
      .filter(Boolean)
    assert.equal(projectTaskIndexes.length, 1, `${role} module ${week.week}: project gate must exist once`)

    for (const task of week.tasks) {
      assert.ok(
        getTaskContentContract({ id: task.id, taskKey: task.taskKey }),
        `${role}/${task.id}: missing explicit resource and quiz contract`
      )
      const resources = getCuratedResourcesForTask(task, week, { targetRole: role })
      const videos = resources.filter((resource) => resource.resourceType === 'youtube')
      const videoSlides = resolveRoadmapVideoSlides(resources)
      const video = videos.find((resource) => getRoadmapVideoLanguage(resource) === 'en')
      const documentation = resources.find((resource) => resource.resourceType === 'docs')

      assert.ok(video?.url, `${role}/${task.id}: missing video`)
      assert.ok(documentation?.url, `${role}/${task.id}: missing documentation`)
      videos.forEach((resource) => generatedResourceUrls.add(resource.url))
      generatedResourceUrls.add(documentation.url)
      for (const videoResource of videos) {
        assert.ok(
          isResourceLikelyRelevant(task, week, videoResource, role),
          `${role}/${task.id}: video is not relevant (${videoResource.title})`
        )
      }
      assert.ok(
        isResourceLikelyRelevant(task, week, documentation, role),
        `${role}/${task.id}: documentation is not relevant (${documentation?.title})`
      )

      if (bilingualTargetRoles.has(role)) {
        assert.ok(
          getLongFormVideoTrackForTask(task),
          `${role}/${task.id}: missing long-form video track`
        )
        assert.equal(videoSlides.length, 2, `${role}/${task.id}: expected English and Indonesian slides`)
        assert.equal(videoSlides[0].language, 'en', `${role}/${task.id}: English must be the default slide`)
        assert.equal(videoSlides[0].isFallback, false, `${role}/${task.id}: English slide cannot be a fallback`)
        assert.equal(videoSlides[1].language, 'id', `${role}/${task.id}: second slide must be Indonesian`)
        assert.ok(
          videoSlides[0].resource.estimatedMinutes >= 60,
          `${role}/${task.id}: English video must be long-form`
        )
        if (!videoSlides[1].isFallback) {
          assert.equal(
            getRoadmapVideoLanguage(videoSlides[1].resource),
            'id',
            `${role}/${task.id}: Indonesian slide has the wrong language metadata`
          )
          assert.ok(
            videoSlides[1].resource.estimatedMinutes >= 60,
            `${role}/${task.id}: Indonesian video must be long-form when available`
          )
        } else {
          assert.equal(
            videoSlides[1].resource.url,
            videoSlides[0].resource.url,
            `${role}/${task.id}: Indonesian fallback must reuse the English video`
          )
        }
      }

      const quizSkill = inferQuizSkillFromTask({
        id: task.id,
        taskKey: task.id,
        title: task.title,
        description: task.description,
        focusSkills: week.focusSkills,
      })
      const questions = getCuratedQuizQuestions(quizSkill)
      assert.equal(
        questions.length,
        QUIZ_QUESTION_COUNT,
        `${role}/${task.id}: expected ${QUIZ_QUESTION_COUNT} quiz questions for ${quizSkill}`
      )
      assert.ok(
        questions.every((question) => question.relatedSkill.trim().length > 0),
        `${role}/${task.id}: quiz has empty skill metadata`
      )

      roadmapAuditRows.push({
        role,
        module: week.week,
        taskId: task.id,
        task: task.title,
        englishVideo: video.title,
        indonesianVideo: videoSlides[1]?.isFallback
          ? 'English fallback'
          : videoSlides[1]?.resource.title ?? 'Not applicable',
        documentation: documentation.title,
        quizSkill,
      })
      validatedTaskCount += 1
    }
  }
}

const syntheticAiWeek = {
  week: 1,
  title: 'AI Generated Backend Foundations',
  goal: 'Learn backend foundations in prerequisite order.',
  focusSkills: ['JavaScript', 'Internet', 'HTTP'],
  tasks: [],
}
const syntheticAiJavaScriptTask = {
  id: 'ai-generated-javascript-task',
  title: 'JavaScript variables, data types, and control flow',
  description: 'Practice JavaScript fundamentals before Node.js.',
  estimatedTime: '60 minutes',
  difficulty: 'easy',
  deliverable: 'JavaScript exercises',
  status: 'todo',
}
const syntheticAiJavaScriptResources = getCuratedResourcesForTask(
  syntheticAiJavaScriptTask,
  syntheticAiWeek,
  { targetRole: 'backend-developer' }
)
const syntheticAiJavaScriptSlides = resolveRoadmapVideoSlides(syntheticAiJavaScriptResources)
assert.equal(
  getLongFormVideoTrackForTask(syntheticAiJavaScriptTask),
  'javascript',
  'AI-generated JavaScript task must resolve to the JavaScript long-form track'
)
assert.equal(
  syntheticAiJavaScriptSlides.length,
  2,
  'AI-generated JavaScript task must receive bilingual video slides'
)
assert.equal(
  syntheticAiJavaScriptSlides[1].isFallback,
  false,
  'JavaScript track should have a real Indonesian video'
)

const syntheticAiInternetTask = {
  ...syntheticAiJavaScriptTask,
  id: 'ai-generated-internet-task',
  title: 'How the internet, DNS, and HTTP requests work',
  description: 'Trace a request from browser to backend server.',
  deliverable: 'Internet request lifecycle notes',
}
const syntheticAiInternetSlides = resolveRoadmapVideoSlides(
  getCuratedResourcesForTask(syntheticAiInternetTask, syntheticAiWeek, {
    targetRole: 'backend-developer',
  })
)
assert.equal(
  syntheticAiInternetSlides[1].isFallback,
  true,
  'Internet track without a curated Indonesian course must reuse the English video'
)
assert.equal(
  syntheticAiInternetSlides[1].resource.url,
  syntheticAiInternetSlides[0].resource.url,
  'Indonesian fallback must reuse the English video URL'
)

const bilingualGateResources = [
  {
    resourceType: 'youtube',
    url: 'https://www.youtube.com/watch?v=english',
    completionRule: 'manual_watch_confirmation;video_language:en',
    isCompleted: false,
  },
  {
    resourceType: 'youtube',
    url: 'https://www.youtube.com/watch?v=indonesian',
    completionRule: 'manual_watch_confirmation;video_language:id',
    isCompleted: true,
  },
  {
    resourceType: 'docs',
    url: 'https://developer.mozilla.org/',
    completionRule: 'manual_mark_complete',
    isCompleted: true,
  },
]
assert.equal(
  getLearningResourceGateFromResources(bilingualGateResources).resourcesComplete,
  true,
  'Completing either language video plus documentation must unlock the resource gate'
)
assert.equal(
  getLearningResourceGateFromResources(
    bilingualGateResources.map((resource) => (
      resource.resourceType === 'youtube'
        ? { ...resource, isCompleted: false }
        : resource
    ))
  ).resourcesComplete,
  false,
  'Documentation without a completed video must not unlock the resource gate'
)
assert.equal(
  getLearningResourceGateFromResources([]).resourcesComplete,
  false,
  'Tasks without learning resources must not unlock the resource gate'
)

const semanticRoadmap = generateFallbackRoadmap({
  targetRole: 'fullstack-developer',
  currentLevel: 'beginner',
  missingSkills: [],
  studyTime: '1hour',
  durationWeeks: 6,
})
const semanticWeek = semanticRoadmap.weeks[0]
const semanticTask = semanticWeek.tasks.find((task) => task.id === 'frontend-1-2')
assert.ok(semanticTask, 'Fullstack roadmap must include the semantic HTML foundation task')
const semanticResources = getCuratedResourcesForTask(semanticTask, semanticWeek, {
  targetRole: 'fullstack-developer',
})
assert.ok(
  semanticResources.every((resource) => !/git|github/i.test(resource.title)),
  'Semantic HTML task must not receive Git/GitHub resources'
)

const backendRoadmap = generateFallbackRoadmap({
  targetRole: 'backend-developer',
  currentLevel: 'beginner',
  missingSkills: [],
  studyTime: '1hour',
  durationWeeks: 6,
})
const backendFoundationWeek = backendRoadmap.weeks[0]
const backendFoundationResources = new Map(
  backendFoundationWeek.tasks.map((task) => [
    task.id,
    getCuratedResourcesForTask(task, backendFoundationWeek, {
      targetRole: 'backend-developer',
    }),
  ])
)
const backendJavaScriptTitles = backendFoundationResources
  .get('backend-1-1')
  .map((resource) => resource.title)
  .join(' ')
const backendTypeScriptTitles = backendFoundationResources
  .get('backend-1-4')
  .map((resource) => resource.title)
  .join(' ')
const backendHttpTitles = backendFoundationResources
  .get('backend-1-5')
  .map((resource) => resource.title)
  .join(' ')

assert.match(
  backendJavaScriptTitles,
  /javascript/i,
  'Backend JavaScript foundation must use JavaScript resources'
)
assert.doesNotMatch(
  backendJavaScriptTitles,
  /typescript/i,
  'Backend JavaScript foundation must not introduce TypeScript resources'
)
assert.match(
  backendTypeScriptTitles,
  /typescript/i,
  'Backend TypeScript task must use TypeScript resources'
)
assert.match(
  backendHttpTitles,
  /http|json/i,
  'Backend HTTP and JSON task must use protocol or JSON resources'
)
assert.doesNotMatch(
  backendHttpTitles,
  /typescript/i,
  'Backend HTTP and JSON task must not reuse TypeScript resources'
)

assert.equal(
  calculateTaskProgress({
    ...semanticTask,
    resources: semanticResources.map((resource) => ({
      ...resource,
      isCompleted: false,
      watchedSeconds: 0,
      completionPercentage: 0,
      completedAt: null,
    })),
    quizRequired: true,
    quizPassed: false,
    projectRequired: false,
    projectPassed: false,
    requirementState: 'resources_pending',
  }),
  0,
  'A new task without a project requirement must start at 0% progress'
)

const userScopeQueries = []
const tableResults = {
  profiles: {
    data: { target_role: 'frontend-developer', current_level: 'beginner' },
    error: null,
  },
  roadmaps: {
    data: { id: 'roadmap-current-user' },
    error: null,
  },
  roadmap_tasks: {
    data: [{
      id: 'task-current-user',
      title: 'Scoped task',
      status: 'todo',
      quiz_required: true,
      quiz_passed: false,
      project_required: false,
      project_passed: false,
      requirement_state: 'resources_pending',
    }],
    error: null,
  },
  roadmap_resources: {
    data: [
      {
        id: 'video-current-user',
        roadmap_task_id: 'task-current-user',
        resource_type: 'youtube',
        url: 'https://example.com/video',
        completion_rule: 'manual',
      },
      {
        id: 'docs-current-user',
        roadmap_task_id: 'task-current-user',
        resource_type: 'docs',
        url: 'https://example.com/docs',
        completion_rule: 'manual',
      },
    ],
    error: null,
  },
  roadmap_resource_progress: {
    data: [],
    error: null,
  },
}

class MockSupabaseQuery {
  constructor(table) {
    this.table = table
  }

  select() {
    return this
  }

  eq(column, value) {
    userScopeQueries.push({ table: this.table, column, value })
    return this
  }

  in() {
    return this
  }

  order() {
    return this
  }

  limit() {
    return this
  }

  maybeSingle() {
    return Promise.resolve(tableResults[this.table])
  }

  then(resolve, reject) {
    return Promise.resolve(tableResults[this.table]).then(resolve, reject)
  }
}

const mockSupabase = {
  from(table) {
    return new MockSupabaseQuery(table)
  },
}

for (const userId of ['account-a', 'account-b']) {
  const summary = await loadUserRoadmapSummary(mockSupabase, userId)
  assert.equal(summary.progress, 0, `${userId}: empty progress must remain 0%`)
  assert.ok(
    userScopeQueries.some(
      (query) => query.table === 'roadmaps' && query.column === 'user_id' && query.value === userId
    ),
    `${userId}: active roadmap query is not user-scoped`
  )
  assert.ok(
    userScopeQueries.some(
      (query) =>
        query.table === 'roadmap_resource_progress' &&
        query.column === 'user_id' &&
        query.value === userId
    ),
    `${userId}: resource progress query is not user-scoped`
  )
}

console.log(`Roadmap content validation passed for ${roles.length} roles and ${validatedTaskCount} tasks.`)

if (process.argv.includes('--print-matrix')) {
  console.table(roadmapAuditRows)
}

if (process.argv.includes('--check-links')) {
  const urls = [...generatedResourceUrls]
  const failures = []
  let reachableCount = 0
  let restrictedCount = 0

  for (let index = 0; index < urls.length; index += 8) {
    const batch = urls.slice(index, index + 8)
    const results = await Promise.all(batch.map(async (url) => {
      try {
        let response = await fetch(url, {
          method: 'HEAD',
          redirect: 'follow',
          signal: AbortSignal.timeout(15000),
          headers: {
            'User-Agent': 'SkillPath-Resource-Audit/1.0',
          },
        })

        if ([404, 405].includes(response.status)) {
          response = await fetch(url, {
            method: 'GET',
            redirect: 'follow',
            signal: AbortSignal.timeout(15000),
            headers: {
              Range: 'bytes=0-0',
              'User-Agent': 'SkillPath-Resource-Audit/1.0',
            },
          })
          await response.body?.cancel()
        }

        return { url, status: response.status }
      } catch (error) {
        return {
          url,
          status: 0,
          error: error instanceof Error ? error.message : String(error),
        }
      }
    }))

    for (const result of results) {
      if (result.status >= 200 && result.status < 400) {
        reachableCount += 1
      } else if ([401, 403, 405, 429].includes(result.status)) {
        restrictedCount += 1
      } else {
        failures.push(result)
      }
    }
  }

  assert.deepEqual(
    failures,
    [],
    `Broken or unreachable roadmap resource links:\n${failures
      .map((failure) => `${failure.status || 'network'} ${failure.url}${failure.error ? ` (${failure.error})` : ''}`)
      .join('\n')}`
  )

  console.log(
    `Resource link audit passed for ${urls.length} unique URLs (${reachableCount} reachable, ${restrictedCount} access-restricted).`
  )
}
