import { RoadmapProjectReviewStatus } from '@/types'

const GITHUB_API_URL = 'https://api.github.com'

export interface RuleBasedProjectReview {
  status: RoadmapProjectReviewStatus
  score: number
  strengths: string[]
  issues: string[]
  requiredFixes: string[]
  suggestions: string[]
  summary: string
  ruleSignals: string[]
}

export interface GitHubRepoContext {
  owner: string
  repo: string
  defaultBranch: string
  stars: number
  forks: number
  openIssues: number
  pushedAt: string | null
  description: string | null
  hasReadme: boolean
  fileCountHint: number
}

export function parseGitHubRepositoryUrl(repoUrl: string) {
  try {
    const parsed = new URL(repoUrl.trim())
    if (parsed.hostname !== 'github.com' && parsed.hostname !== 'www.github.com') {
      return null
    }

    const segments = parsed.pathname.split('/').filter(Boolean)
    if (segments.length < 2) {
      return null
    }

    return {
      owner: segments[0],
      repo: segments[1].replace(/\.git$/, ''),
      normalizedUrl: `https://github.com/${segments[0]}/${segments[1].replace(/\.git$/, '')}`,
    }
  } catch {
    return null
  }
}

function createGitHubHeaders(token?: string): HeadersInit {
  const headers: HeadersInit = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'SkillPath-Project-Reviewer',
    'X-GitHub-Api-Version': '2022-11-28',
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  return headers
}

export async function fetchGitHubRepoContext(
  owner: string,
  repo: string,
  token?: string
): Promise<{ context: GitHubRepoContext | null; issues: string[] }> {
  const issues: string[] = []
  const basePath = `${GITHUB_API_URL}/repos/${owner}/${repo}`

  try {
    const repoResponse = await fetch(basePath, {
      headers: createGitHubHeaders(token),
      cache: 'no-store',
    })

    if (repoResponse.status === 404) {
      return { context: null, issues: ['Repository not found or not publicly accessible.'] }
    }

    if (!repoResponse.ok) {
      return { context: null, issues: [`GitHub repository API returned ${repoResponse.status}.`] }
    }

    const repoData = await repoResponse.json() as {
      default_branch: string
      stargazers_count: number
      forks_count: number
      open_issues_count: number
      pushed_at: string | null
      description: string | null
    }

    const [readmeResponse, treeResponse] = await Promise.all([
      fetch(`${basePath}/readme`, {
        headers: createGitHubHeaders(token),
        cache: 'no-store',
      }),
      fetch(`${basePath}/git/trees/${repoData.default_branch}?recursive=1`, {
        headers: createGitHubHeaders(token),
        cache: 'no-store',
      }),
    ])

    const treeData = treeResponse.ok
      ? await treeResponse.json() as { tree?: Array<{ path: string }> }
      : null

    const fileCountHint = treeData?.tree?.length ?? 0

    return {
      context: {
        owner,
        repo,
        defaultBranch: repoData.default_branch,
        stars: repoData.stargazers_count ?? 0,
        forks: repoData.forks_count ?? 0,
        openIssues: repoData.open_issues_count ?? 0,
        pushedAt: repoData.pushed_at,
        description: repoData.description,
        hasReadme: readmeResponse.ok,
        fileCountHint,
      },
      issues,
    }
  } catch (error) {
    return {
      context: null,
      issues: [error instanceof Error ? error.message : 'Unknown GitHub API error'],
    }
  }
}

function inferExpectedKeywords(taskContext: string, projectType: 'mini_project' | 'final_project') {
  const context = taskContext.toLowerCase()
  const keywords = new Set<string>()

  const mappings: Array<{ trigger: string; keywords: string[] }> = [
    { trigger: 'html', keywords: ['html'] },
    { trigger: 'css', keywords: ['css', 'style'] },
    { trigger: 'javascript', keywords: ['javascript', 'js'] },
    { trigger: 'typescript', keywords: ['typescript', 'ts'] },
    { trigger: 'react', keywords: ['react', 'component'] },
    { trigger: 'next', keywords: ['next', 'app router'] },
    { trigger: 'node', keywords: ['node', 'express'] },
    { trigger: 'api', keywords: ['api', 'endpoint', 'rest'] },
    { trigger: 'git', keywords: ['git', 'github'] },
  ]

  for (const mapping of mappings) {
    if (context.includes(mapping.trigger)) {
      for (const keyword of mapping.keywords) {
        keywords.add(keyword)
      }
    }
  }

  if (projectType === 'final_project') {
    keywords.add('deployment')
    keywords.add('architecture')
  }

  return Array.from(keywords)
}

export function evaluateProjectWithRules(input: {
  repoUrl: string
  liveUrl?: string | null
  projectType: 'mini_project' | 'final_project'
  taskContext: string
  repoContext: GitHubRepoContext | null
  repoIssues: string[]
}): RuleBasedProjectReview {
  const strengths: string[] = []
  const issues: string[] = []
  const requiredFixes: string[] = []
  const suggestions: string[] = []
  const ruleSignals: string[] = []
  let score = 100

  if (!parseGitHubRepositoryUrl(input.repoUrl)) {
    issues.push('Repository URL is not a valid GitHub repository URL.')
    requiredFixes.push('Provide a valid GitHub repository URL, for example https://github.com/owner/repo.')
    score -= 40
  } else {
    strengths.push('Valid GitHub repository URL provided.')
  }

  if (input.projectType === 'final_project') {
    if (!input.liveUrl || input.liveUrl.trim().length === 0) {
      issues.push('Final project should include a live demo URL.')
      requiredFixes.push('Provide a live demo URL for the final project submission.')
      score -= 15
    } else {
      strengths.push('Live demo URL provided.')
    }
  }

  if (input.repoIssues.length > 0) {
    for (const issue of input.repoIssues) {
      issues.push(issue)
      requiredFixes.push(issue)
    }
    score -= 35
  }

  if (input.repoContext) {
    ruleSignals.push(`default_branch=${input.repoContext.defaultBranch}`)

    if (input.repoContext.hasReadme) {
      strengths.push('README file exists.')
    } else {
      issues.push('README file is missing.')
      requiredFixes.push('Add a clear README with setup, run steps, and feature summary.')
      score -= 20
    }

    if (input.repoContext.fileCountHint > 3) {
      strengths.push('Repository appears to contain actual project files.')
    } else {
      issues.push('Repository looks very small or empty.')
      requiredFixes.push('Push meaningful source code and project structure.')
      score -= 20
    }

    if (input.repoContext.pushedAt) {
      const daysSincePush = Math.floor((Date.now() - new Date(input.repoContext.pushedAt).getTime()) / (1000 * 60 * 60 * 24))
      if (daysSincePush <= 30) {
        strengths.push('Recent commit activity detected.')
      } else {
        suggestions.push('Update the repository with a recent commit that reflects your latest revision.')
        score -= 8
      }
    } else {
      issues.push('Recent commit timestamp could not be verified.')
      score -= 8
    }
  }

  const expectedKeywords = inferExpectedKeywords(input.taskContext, input.projectType)
  if (expectedKeywords.length > 0 && input.repoContext?.description) {
    const description = input.repoContext.description.toLowerCase()
    const matched = expectedKeywords.filter((keyword) => description.includes(keyword))
    if (matched.length > 0) {
      strengths.push(`Repository description references relevant topics: ${matched.slice(0, 4).join(', ')}.`)
    } else {
      suggestions.push('Improve repository description so it reflects the roadmap skill focus.')
      score -= 6
    }
  }

  score = Math.max(0, Math.min(100, score))

  let status: RoadmapProjectReviewStatus = 'needs_revision'
  if (score >= 80 && requiredFixes.length === 0) {
    status = 'passed'
  } else if (score >= 60 && requiredFixes.length === 0) {
    status = 'needs_review'
  } else {
    status = 'needs_revision'
  }

  const summary = status === 'passed'
    ? 'Rule-based checks passed. Project is ready.'
    : status === 'needs_review'
      ? 'Rule-based checks are mostly good but need manual review on quality depth.'
      : 'Rule-based checks found issues that need revision before passing.'

  if (suggestions.length === 0) {
    suggestions.push('Document architecture and key decisions in README to improve reviewer confidence.')
  }

  return {
    status,
    score,
    strengths,
    issues,
    requiredFixes,
    suggestions,
    summary,
    ruleSignals,
  }
}

export async function generateGeminiProjectReview(input: {
  geminiApiKey: string
  projectType: 'mini_project' | 'final_project'
  taskContext: string
  repoUrl: string
  liveUrl?: string | null
  ruleReview: RuleBasedProjectReview
}) {
  const prompt = `You are reviewing a software project submission.

Project Type: ${input.projectType}
Roadmap Task Context:
${input.taskContext}

Repository URL: ${input.repoUrl}
Live URL: ${input.liveUrl || 'N/A'}

Rule-based review:
Score: ${input.ruleReview.score}
Status: ${input.ruleReview.status}
Strengths: ${input.ruleReview.strengths.join('; ') || 'None'}
Issues: ${input.ruleReview.issues.join('; ') || 'None'}
Required Fixes: ${input.ruleReview.requiredFixes.join('; ') || 'None'}

Return strict JSON only with:
{
  "status": "passed" | "needs_revision",
  "score": number (0-100),
  "summary": string,
  "strengths": string[],
  "issues": string[],
  "required_fixes": string[],
  "suggestions": string[]
}

Do not include markdown.`

  const response = await fetch('https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=' + input.geminiApiKey, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: prompt }],
      }],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 2048,
      },
    }),
    cache: 'no-store',
  })

  if (!response.ok) {
    return null
  }

  const data = await response.json() as {
    candidates?: Array<{
      content?: {
        parts?: Array<{ text?: string }>
      }
    }>
  }

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) {
    return null
  }

  try {
    const parsed = JSON.parse(text.replace(/```json\n?|```\n?/g, '').trim()) as {
      status: 'passed' | 'needs_revision'
      score: number
      summary: string
      strengths: string[]
      issues: string[]
      required_fixes: string[]
      suggestions: string[]
    }

    return {
      status: parsed.status,
      score: Math.max(0, Math.min(100, Number(parsed.score || 0))),
      summary: parsed.summary,
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
      issues: Array.isArray(parsed.issues) ? parsed.issues : [],
      requiredFixes: Array.isArray(parsed.required_fixes) ? parsed.required_fixes : [],
      suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
    }
  } catch {
    return null
  }
}
