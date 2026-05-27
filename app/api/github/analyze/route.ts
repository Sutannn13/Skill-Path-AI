import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const analyzeRequestSchema = z.object({
  username: z.string().min(1, 'Username is required'),
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

interface GitHubRepoContent {
  name: string
  sha: string
}

async function fetchGitHubUser(username: string, token?: string): Promise<GitHubUser | null> {
  try {
    const headers: HeadersInit = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'SkillPath-App',
    }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const response = await fetch(`${GITHUB_API_URL}/users/${username}`, {
      headers,
      next: { revalidate: 3600 },
    })

    if (!response.ok) {
      if (response.status === 404) {
        return null
      }
      throw new Error(`GitHub API error: ${response.status}`)
    }

    return response.json()
  } catch (error) {
    console.error('Failed to fetch GitHub user:', error)
    return null
  }
}

async function fetchGitHubRepos(username: string, token?: string): Promise<GitHubRepo[]> {
  try {
    const headers: HeadersInit = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'SkillPath-App',
    }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const response = await fetch(
      `${GITHUB_API_URL}/users/${username}/repos?sort=updated&per_page=100`,
      {
        headers,
        next: { revalidate: 3600 },
      }
    )

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`)
    }

    return response.json()
  } catch (error) {
    console.error('Failed to fetch GitHub repos:', error)
    return []
  }
}

async function checkReadmeExists(username: string, repo: string, token?: string): Promise<boolean> {
  try {
    const headers: HeadersInit = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'SkillPath-App',
    }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const response = await fetch(
      `${GITHUB_API_URL}/repos/${username}/${repo}/contents/README.md`,
      { headers }
    )

    return response.ok
  } catch {
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

    // Fetch user and repos
    const [user, repos] = await Promise.all([
      fetchGitHubUser(username, token),
      fetchGitHubRepos(username, token),
    ])

    // Handle user not found
    if (!user) {
      return NextResponse.json(
        {
          error: 'GitHub user not found',
          message: `Could not find GitHub user "${username}". Please check the username and try again.`,
        },
        { status: 404 }
      )
    }

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
        username,
        analyzedAt: new Date().toISOString(),
        reposAnalyzed: repos.length,
        readmeChecksPerformed: reposToCheck.length,
      },
    })
  } catch (error) {
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
