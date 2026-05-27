'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { AppShell, Container, GradientBackground } from '@/components/layout'
import { DashboardHeader } from '@/components/layout/dashboard-header'
import { BrutalCard, BrutalButton, BrutalCardHover, ScoreMeter } from '@/components/brutal'
import { Github, Search, ExternalLink, AlertCircle, CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { GitHubAnalysis } from '@/types'

// Mock analysis data
const mockAnalysis: GitHubAnalysis = {
  username: 'octocat',
  totalRepos: 12,
  languages: [
    { name: 'JavaScript', count: 5 },
    { name: 'TypeScript', count: 3 },
    { name: 'Python', count: 2 },
    { name: 'CSS', count: 2 },
  ],
  repos: [
    {
      name: 'my-app',
      description: 'A sample React application',
      language: 'JavaScript',
      stars: 15,
      forks: 123,
      hasReadme: true,
      hasHomepage: true,
      isPrivate: false,
      updatedAt: '2024-01-15',
      url: 'https://github.com/octocat/my-app',
    },
    {
      name: 'api-project',
      description: 'REST API built with Node.js',
      language: 'JavaScript',
      stars: 8,
      forks: 45,
      hasReadme: true,
      hasHomepage: false,
      isPrivate: false,
      updatedAt: '2024-01-10',
      url: 'https://github.com/octocat/api-project',
    },
    {
      name: 'old-project',
      description: 'An old school project',
      language: 'Python',
      stars: 0,
      forks: 2,
      hasReadme: false,
      hasHomepage: false,
      isPrivate: false,
      updatedAt: '2022-06-01',
      url: 'https://github.com/octocat/old-project',
    },
  ],
  score: 72,
  summary: 'Your GitHub profile shows good activity with well-maintained JavaScript projects. Focus on improving documentation and adding more substantial READMEs.',
  suggestions: [
    'Add README files to all public repositories',
    'Include live demo links in your projects',
    'Update outdated repositories or archive them',
    'Consider merging similar projects',
    'Add more TypeScript projects for better typing skills',
  ],
}

export default function GitHubPage() {
  const [username, setUsername] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<GitHubAnalysis | null>(null)
  const [analyzedUsername, setAnalyzedUsername] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const analyzeGitHub = async () => {
    const trimmedUsername = username.trim()

    if (!trimmedUsername) {
      setAnalysis(null)
      setAnalyzedUsername(null)
      setError('Enter a GitHub username before analyzing.')
      return
    }

    setIsAnalyzing(true)
    setError(null)
    setAnalysis(null)
    setAnalyzedUsername(trimmedUsername)

    try {
      if (process.env.NODE_ENV === 'development') {
        console.log('[GitHub] calling analyze endpoint', { username: trimmedUsername })
      }

      const response = await fetch('/api/github/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: trimmedUsername }),
      })

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(data?.message || data?.error || 'Failed to analyze GitHub profile.')
      }

      if (!data?.analysis) {
        throw new Error('GitHub analysis response was empty.')
      }

      setAnalysis(data.analysis)
      setAnalyzedUsername(data.analysis.username || trimmedUsername)
    } catch (requestError) {
      const message = requestError instanceof Error
        ? requestError.message
        : 'Failed to analyze GitHub profile. Please check the username and try again.'
      setAnalyzedUsername(null)
      setError(message)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const loadDemoAnalysis = () => {
    setUsername(mockAnalysis.username)
    setAnalyzedUsername(mockAnalysis.username)
    setAnalysis(mockAnalysis)
    setError(null)
  }

  return (
    <AppShell showBottomNav={true}>
      <GradientBackground />

      {/* Main Content */}
      <div className="flex-1">
        <DashboardHeader title="GitHub Portfolio Analyzer" subtitle="Audit your developer profile" />

        <Container className="py-6">
          {/* Search Section */}
          <BrutalCard color="black" className="mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="block mb-2 font-bold text-white">GitHub Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g., octocat"
                  disabled={isAnalyzing}
                  className="w-full px-4 py-3 brutal-border brutal-radius bg-white text-lg text-black placeholder-gray-500 caret-black disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500"
                  onKeyDown={(e) => e.key === 'Enter' && analyzeGitHub()}
                />
              </div>
              <div className="flex items-end">
                <BrutalButton
                  color="yellow"
                  onClick={analyzeGitHub}
                  loading={isAnalyzing}
                  disabled={isAnalyzing}
                  className="w-full sm:w-auto"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4 mr-2" />
                      Analyze
                    </>
                  )}
                </BrutalButton>
              </div>
              <div className="flex items-end">
                <BrutalButton
                  variant="outline"
                  color="white"
                  onClick={loadDemoAnalysis}
                  disabled={isAnalyzing}
                  className="w-full sm:w-auto"
                >
                  Try Demo
                </BrutalButton>
              </div>
            </div>
          </BrutalCard>

          {/* Error Message */}
          {error && (
            <BrutalCard color="red" className="mb-6 flex items-start gap-3">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <p>{error}</p>
            </BrutalCard>
          )}

          {/* Analysis Results */}
          {analysis && (
            <div className="space-y-6">
              <BrutalCard color="black" className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-bold text-white/70">Analyzed GitHub profile</p>
                  <h2 className="font-display text-2xl font-bold">@{analysis.username}</h2>
                </div>
                {analyzedUsername && analyzedUsername !== analysis.username && (
                  <p className="text-sm text-white/70">
                    GitHub resolved this search from @{analyzedUsername}.
                  </p>
                )}
              </BrutalCard>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <motion.div
                  initial={false}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <BrutalCard color="blue" className="text-center">
                    <Github className="w-10 h-10 mx-auto mb-2" />
                    <p className="text-3xl font-bold">{analysis.totalRepos}</p>
                    <p className="text-sm text-black/70">Total Repos</p>
                  </BrutalCard>
                </motion.div>

                <motion.div
                  initial={false}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <BrutalCard color="green" className="text-center">
                    <p className="text-3xl font-bold">{analysis.languages.length}</p>
                    <p className="text-sm text-black/70">Languages</p>
                  </BrutalCard>
                </motion.div>

                <motion.div
                  initial={false}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <BrutalCard color="orange" className="text-center">
                    <p className="text-3xl font-bold">{analysis.repos.filter(r => r.hasReadme).length}</p>
                    <p className="text-sm text-black/70">With README</p>
                  </BrutalCard>
                </motion.div>

                <motion.div
                  initial={false}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="row-span-2"
                >
                  <BrutalCard color="purple" className="text-center h-full">
                    <ScoreMeter score={analysis.score} label="Portfolio Score" size="lg" />
                  </BrutalCard>
                </motion.div>
              </div>

              {/* Summary Card */}
              <BrutalCard color="yellow">
                <h3 className="font-display font-bold text-lg mb-2">Portfolio Summary</h3>
                <p className="text-black/80">{analysis.summary}</p>
              </BrutalCard>

              {/* Languages */}
              <BrutalCard color="white">
                <h3 className="font-bold mb-4">Languages Used</h3>
                <div className="space-y-3">
                  {analysis.languages.map((lang, i) => (
                    <div key={lang.name} className="flex items-center gap-4">
                      <div className="w-24 font-medium">{lang.name}</div>
                      <div className="flex-1 h-4 bg-gray-100 brutal-border brutal-radius overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(lang.count / analysis.languages[0].count) * 100}%` }}
                          transition={{ delay: 0.3 + i * 0.1 }}
                          className="h-full bg-blue"
                        />
                      </div>
                      <div className="w-12 text-right text-sm text-gray-500">{lang.count}</div>
                    </div>
                  ))}
                </div>
              </BrutalCard>

              {/* Repository Audit */}
              <div>
                <h3 className="font-display font-bold text-xl mb-4">Repository Audit</h3>
                {analysis.repos.length === 0 ? (
                  <BrutalCard color="white">
                    <p className="font-bold">No public repositories found for @{analysis.username}.</p>
                    <p className="mt-1 text-sm text-gray-600">
                      Private repositories cannot be analyzed from this public profile audit.
                    </p>
                  </BrutalCard>
                ) : (
                  <div className="space-y-4">
                    {analysis.repos.map((repo, i) => (
                      <motion.div
                        key={`${analysis.username}-${repo.name}`}
                        initial={false}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + i * 0.1 }}
                      >
                        <BrutalCardHover color="white" className="relative">
                          <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-bold text-lg">{repo.name}</h4>
                                {repo.isPrivate && (
                                  <span className="text-xs px-2 py-0.5 bg-gray-200 brutal-radius">Private</span>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 mb-2">
                                {repo.description || 'No description'}
                              </p>
                              <div className="flex items-center gap-4 text-sm text-gray-500">
                                <span>{repo.language || 'No primary language'}</span>
                                <span>{repo.stars} stars</span>
                                <span>{repo.forks} forks</span>
                              </div>
                            </div>

                            <div className="flex flex-col gap-2 min-w-[140px]">
                              <div className="flex items-center gap-2">
                                {repo.hasReadme ? (
                                  <CheckCircle2 className="w-5 h-5 text-green" />
                                ) : (
                                  <XCircle className="w-5 h-5 text-red" />
                                )}
                                <span className="text-sm">README</span>
                              </div>
                              <div className="flex items-center gap-2">
                                {repo.hasHomepage ? (
                                  <CheckCircle2 className="w-5 h-5 text-green" />
                                ) : (
                                  <XCircle className="w-5 h-5 text-orange" />
                                )}
                                <span className="text-sm">Demo Link</span>
                              </div>
                              <a
                                href={repo.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-blue hover:underline flex items-center gap-1"
                              >
                                View on GitHub
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          </div>

                          {/* Issues */}
                          {!repo.hasReadme && (
                            <div className="absolute top-2 right-2">
                              <span className="text-xs px-2 py-1 bg-red/20 text-red brutal-radius">
                                Missing README
                              </span>
                            </div>
                          )}
                        </BrutalCardHover>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Suggestions */}
              <BrutalCard color="pink">
                <h3 className="font-display font-bold text-lg mb-4">Improvement Suggestions</h3>
                <ul className="space-y-2">
                  {analysis.suggestions.map((suggestion, i) => (
                    <motion.li
                      key={i}
                      initial={false}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + i * 0.1 }}
                      className="flex items-start gap-2"
                    >
                      <span className="w-6 h-6 bg-black text-white brutal-radius text-center text-sm font-bold shrink-0">
                        {i + 1}
                      </span>
                      <span>{suggestion}</span>
                    </motion.li>
                  ))}
                </ul>
              </BrutalCard>
            </div>
          )}

          {/* Empty State */}
          {!analysis && !error && (
            <BrutalCard color="gray" className="text-center py-16">
              <Github className="w-20 h-20 mx-auto mb-4 text-gray-300" />
              <h3 className="font-display font-bold text-2xl mb-2">
                {isAnalyzing && analyzedUsername ? `Analyzing @${analyzedUsername}` : 'Analyze Your GitHub'}
              </h3>
              <p className="text-gray-600 max-w-md mx-auto mb-6">
                {isAnalyzing
                  ? 'Fetching public repositories and checking portfolio signals.'
                  : 'Enter your GitHub username above to get a detailed analysis of your portfolio, including repository quality, language usage, and personalized suggestions.'}
              </p>
              <Link
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <BrutalButton color="black">
                  Create GitHub Account
                  <ExternalLink className="w-4 h-4 ml-2" />
                </BrutalButton>
              </Link>
            </BrutalCard>
          )}
        </Container>
      </div>
    </AppShell>
  )
}
