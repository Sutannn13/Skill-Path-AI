import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const analyzeRequestSchema = z.object({
  username: z
    .string()
    .trim()
    .min(1, 'Username is required')
    .max(39, 'GitHub username is too long')
    .regex(/^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/, 'Invalid GitHub username'),
})

const GITHUB_API_URL = 'https://api.github.com'

interface GitHubRepo {
  id: number
  name: string
  full_name: string
  description: string | null
  language: string | null
  stargazers_count: number
  forks_count: number
  private: boolean
  updated_at: string
  html_url: string
  homepage: string | null
  has_pages: boolean
}

interface GitHubUser {
  login: string
  name: string | null
  bio: string | null
  public_repos: number
  followers: number
  following: number
  created_at: string
}

class GitHubApiError extends Error {
  constructor(
    public code: 'GITHUB_NOT_FOUND' | 'GITHUB_RATE_LIMIT' | 'GITHUB_API_ERROR',
    public status: number
  ) {
    super(code)
  }
}

function createGitHubHeaders(token?: string): HeadersInit {
  const headers: HeadersInit = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'SkillPath-App',
    'X-GitHub-Api-Version': '2022-11-28',
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  return headers
}

async function fetchGitHubJson<T>(path: string, token?: string): Promise<T> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10000)

  try {
    const response = await fetch(`${GITHUB_API_URL}${path}`, {
      headers: createGitHubHeaders(token),
      cache: 'no-store',
      signal: controller.signal,
    })

    if (!response.ok) {
      if (response.status === 404) {
        throw new GitHubApiError('GITHUB_NOT_FOUND', response.status)
      }

      const rateLimitRemaining = response.headers.get('x-ratelimit-remaining')
      if (response.status === 403 && rateLimitRemaining === '0') {
        throw new GitHubApiError('GITHUB_RATE_LIMIT', response.status)
      }

      throw new GitHubApiError('GITHUB_API_ERROR', response.status)
    }

    return response.json() as Promise<T>
  } catch (error) {
    if (error instanceof GitHubApiError) {
      throw error
    }

    console.error('[GitHub] Request failed:', error instanceof Error ? error.message : 'Unknown error')
    throw new GitHubApiError('GITHUB_API_ERROR', 502)
  } finally {
    clearTimeout(timeout)
  }
}

async function fetchGitHubUser(username: string, token?: string): Promise<GitHubUser> {
  return fetchGitHubJson<GitHubUser>(`/users/${username}`, token)
}

async function fetchGitHubRepos(username: string, token?: string): Promise<GitHubRepo[]> {
  return fetchGitHubJson<GitHubRepo[]>(`/users/${username}/repos?sort=updated&per_page=100`, token)
}

async function checkReadmeExists(username: string, repo: string, token?: string): Promise<boolean> {
  try {
    const response = await fetch(`${GITHUB_API_URL}/repos/${username}/${repo}/contents/README.md`, {
      headers: createGitHubHeaders(token),
      cache: 'no-store',
    })

    return response.ok
  } catch (error) {
    console.warn('[GitHub] README check failed:', error instanceof Error ? error.message : 'Unknown error')
    return false
  }
}

function calculateRepoScore(repo: GitHubRepo, hasReadme: boolean): number {
  let score = 0

  // README presence (30 points)
  if (hasReadme) score += 30

  // Description (20 points)
  if (repo.description) score += 20

  // Homepage/live demo (20 points)
  if (repo.homepage || repo.has_pages) score += 20

  // Recently updated (20 points)
  const updatedDate = new Date(repo.updated_at)
  const daysSinceUpdate = Math.floor((Date.now() - updatedDate.getTime()) / (1000 * 60 * 60 * 24))
  if (daysSinceUpdate < 30) score += 20
  else if (daysSinceUpdate < 90) score += 10

  // Has stars (10 points)
  if (repo.stargazers_count > 0) score += 10

  return Math.min(score, 100)
}

function analyzeGitHubData(
  user: GitHubUser,
  repos: GitHubRepo[],
  readmeStatus: Map<string, boolean>
) {
  // Filter public repos
  const publicRepos = repos.filter(r => !r.private)

  // Calculate scores and gather info
  let totalScore = 0
  const scoredRepos = publicRepos.map(repo => {
    const hasReadme = readmeStatus.get(`${user.login}/${repo.name}`) || false
    const score = calculateRepoScore(repo, hasReadme)
    totalScore += score
    return {
      name: repo.name,
      description: repo.description,
      language: repo.language,
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      hasReadme,
      hasHomepage: !!repo.homepage || repo.has_pages,
      isPrivate: repo.private,
      updatedAt: repo.updated_at,
      url: repo.html_url,
    }
  })

  const averageScore = publicRepos.length > 0 ? Math.round(totalScore / publicRepos.length) : 0

  // Calculate language distribution
  const languageCounts = new Map<string, number>()
  for (const repo of publicRepos) {
    if (repo.language) {
      languageCounts.set(repo.language, (languageCounts.get(repo.language) || 0) + 1)
    }
  }
  const languages = Array.from(languageCounts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)

  // Generate suggestions
  const suggestions: string[] = []
  const reposWithoutReadme = scoredRepos.filter(r => !r.hasReadme)
  const reposWithoutHomepage = scoredRepos.filter(r => !r.hasHomepage)
  const outdatedRepos = scoredRepos.filter(r => {
    const daysSinceUpdate = Math.floor((Date.now() - new Date(r.updatedAt).getTime()) / (1000 * 60 * 60 * 24))
    return daysSinceUpdate > 180
  })

  if (reposWithoutReadme.length > 0) {
    suggestions.push(`Add README files to ${reposWithoutReadme.length} repositories without documentation`)
  }
  if (reposWithoutHomepage.length > 0) {
    suggestions.push(`Add live demo links or GitHub Pages to ${reposWithoutHomepage.length} projects`)
  }
  if (outdatedRepos.length > 0) {
    suggestions.push(`Update or archive ${outdatedRepos.length} repositories that have not been updated in 6+ months`)
  }
  if (publicRepos.length < 3) {
    suggestions.push('Create more public repositories to showcase your skills')
  }
  if (languages.length < 2) {
    suggestions.push('Diversify your projects across different technologies')
  }

  // Generate summary
  let summary = `Your GitHub profile shows ${publicRepos.length} public repositories. `
  if (averageScore >= 70) {
    summary += 'Your repositories are well-maintained with good documentation. '
  } else if (averageScore >= 40) {
    summary += 'Your repositories show potential but could benefit from better documentation and live demos. '
  } else {
    summary += 'Focus on adding README files, descriptions, and live demos to improve your portfolio quality. '
  }
  summary += `You primarily use ${languages.slice(0, 3).map(l => l.name).join(', ') || 'various technologies'}.`

  return {
    username: user.login,
    totalRepos: publicRepos.length,
    languages,
    repos: scoredRepos.slice(0, 20), // Limit to top 20
    score: averageScore,
    summary,
    suggestions,
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate request
    const parseResult = analyzeRequestSchema.safeParse(body)
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: parseResult.error.issues },
        { status: 400 }
      )
    }

    const { username } = parseResult.data
    const token = process.env.GITHUB_TOKEN

    const user = await fetchGitHubUser(username, token)
    const repos = await fetchGitHubRepos(user.login, token)

    // Check README status for repos (in parallel, but limit to prevent rate limiting)
    const readmeStatus = new Map<string, boolean>()
    const reposToCheck = repos.slice(0, 10) // Limit checks to prevent rate limiting

    await Promise.all(
      reposToCheck.map(async (repo) => {
        const hasReadme = await checkReadmeExists(user.login, repo.name, token)
        readmeStatus.set(`${user.login}/${repo.name}`, hasReadme)
      })
    )

    // Analyze and return results
    const analysis = analyzeGitHubData(user, repos, readmeStatus)

    return NextResponse.json({
      analysis,
      meta: {
        username: user.login,
        analyzedAt: new Date().toISOString(),
        reposAnalyzed: repos.length,
        readmeChecksPerformed: reposToCheck.length,
      },
    })
  } catch (error) {
    if (error instanceof GitHubApiError) {
      if (error.code === 'GITHUB_NOT_FOUND') {
        return NextResponse.json(
          {
            code: 'GITHUB_NOT_FOUND',
            error: 'GitHub user not found',
            message: 'Could not find that GitHub user. Check the username and try again.',
          },
          { status: 404 }
        )
      }

      if (error.code === 'GITHUB_RATE_LIMIT') {
        return NextResponse.json(
          {
            code: 'GITHUB_RATE_LIMIT',
            error: 'GitHub rate limit reached',
            message: 'GitHub rate limit was reached. Try again later or configure GITHUB_TOKEN on the server.',
          },
          { status: 429 }
        )
      }

      return NextResponse.json(
        {
          code: 'GITHUB_API_ERROR',
          error: 'GitHub API error',
          message: 'GitHub could not complete this analysis right now. Please try again later.',
        },
        { status: 502 }
      )
    }

    console.error('GitHub analysis error:', error)

    return NextResponse.json(
      {
        error: 'Failed to analyze GitHub profile',
        message: 'An error occurred while analyzing the GitHub profile. Please try again later.',
      },
      { status: 500 }
    )
  }
}
