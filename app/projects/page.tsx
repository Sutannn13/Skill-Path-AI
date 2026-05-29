'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { AppShell, Container, GradientBackground } from '@/components/layout'
import { DashboardHeader } from '@/components/layout/dashboard-header'
import { BrutalCard, BrutalButton, BrutalCardHover, SkillBadge, StickerBadge } from '@/components/brutal'
import { PageScene } from '@/components/illustrations/page-scene'
import { ProjectRecommendation } from '@/types'
import { cn } from '@/lib/utils'
import { Code, Clock, CheckCircle2, Search, Trophy } from 'lucide-react'

// Mock project recommendations based on skills
const mockProjects: ProjectRecommendation[] = [
  {
    id: 'proj-1',
    title: 'Type-Safe Task Manager',
    description: 'Build a task management app with full TypeScript typing, form validation, and proper error handling.',
    difficulty: 'intermediate',
    skillsCovered: ['TypeScript', 'React', 'Validation'],
    estimatedTime: '1 week',
    features: [
      'CRUD operations with typed API responses',
      'Form validation with Zod',
      'Error boundaries',
      'Type-safe state management',
    ],
    deploymentSteps: [
      'Initialize Next.js with TypeScript',
      'Set up type definitions',
      'Implement typed components',
      'Deploy to Vercel',
    ],
    readmeChecklist: [
      'Project overview',
      'Tech stack',
      'Features list',
      'Setup instructions',
      'Screenshots',
    ],
  },
  {
    id: 'proj-2',
    title: 'API Dashboard with Charts',
    description: 'Create a dashboard that fetches data from a public API and displays it in beautiful charts.',
    difficulty: 'beginner',
    skillsCovered: ['React', 'REST API', 'Recharts'],
    estimatedTime: '3 days',
    features: [
      'API data fetching with loading states',
      'Multiple chart types (line, bar, pie)',
      'Responsive design',
      'Dark/light mode toggle',
    ],
    deploymentSteps: [
      'Use create-next-app',
      'Install Recharts library',
      'Fetch and visualize data',
      'Deploy to Vercel',
    ],
    readmeChecklist: [
      'Demo link',
      'API source',
      'Chart explanations',
      'Local setup',
    ],
  },
  {
    id: 'proj-3',
    title: 'Portfolio with Blog',
    description: 'Build a developer portfolio with markdown blog support and SEO optimization.',
    difficulty: 'intermediate',
    skillsCovered: ['Next.js', 'Markdown', 'SEO', 'Deployment'],
    estimatedTime: '1 week',
    features: [
      'Markdown blog posts',
      'Dynamic routing',
      'SEO meta tags',
      'Responsive portfolio grid',
    ],
    deploymentSteps: [
      'Create Next.js app',
      'Set up MDX/markdown',
      'Implement SEO',
      'Deploy to Vercel',
    ],
    readmeChecklist: [
      'Live demo',
      'Blog feature explanation',
      'SEO notes',
      'Deployment guide',
    ],
  },
  {
    id: 'proj-4',
    title: 'E-commerce Product Page',
    description: 'Build a detailed product page with image gallery, cart functionality, and checkout flow.',
    difficulty: 'advanced',
    skillsCovered: ['React', 'State Management', 'Performance', 'Testing'],
    estimatedTime: '2 weeks',
    features: [
      'Image gallery with zoom',
      'Cart with localStorage persistence',
      'Performance optimization',
      'Integration tests',
    ],
    deploymentSteps: [
      'Set up React with TypeScript',
      'Implement cart state',
      'Add testing',
      'Optimize performance',
      'Deploy',
    ],
    readmeChecklist: [
      'Feature showcase',
      'Architecture explanation',
      'Performance metrics',
      'Test coverage',
    ],
  },
]

export default function ProjectsPage() {
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showChecklist, setShowChecklist] = useState<string | null>(null)

  const filteredProjects = mockProjects.filter((project) => {
    const matchesDifficulty = !selectedDifficulty || project.difficulty === selectedDifficulty
    const matchesSearch = !searchQuery ||
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesDifficulty && matchesSearch
  })

  return (
    <AppShell showBottomNav={true}>
      <GradientBackground />

      {/* Main Content */}
      <div className="flex-1">
        <DashboardHeader
          icon={Code}
          iconColor="orange"
          title="Portfolio Workshop"
          subtitle="Pick project ideas and move toward your final challenge"
        />

        <Container className="py-6">
          <PageScene variant="project" className="mb-6" />

          <BrutalCard color="orange" className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <StickerBadge variant="boss-fight" label="Portfolio Challenge" size="sm" />
                <StickerBadge variant="green" label="Review Ready" size="sm" />
              </div>
              <h2 className="font-display text-xl font-bold">Final project submission lives in Roadmap.</h2>
              <p className="mt-1 text-sm text-black/70">
                Use these ideas for practice, then submit your final portfolio challenge when your roadmap unlocks it.
              </p>
            </div>
            <Link href="/roadmap/final-project">
              <BrutalButton color="black" className="w-full sm:w-auto">
                <Trophy className="h-4 w-4 mr-2" />
                Open Final Project
              </BrutalButton>
            </Link>
          </BrutalCard>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search project ideas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 brutal-border brutal-radius bg-white focus:outline-none focus:ring-2 focus:ring-yellow"
              />
            </div>
            <div className="flex gap-2">
              {['beginner', 'intermediate', 'advanced'].map((diff) => (
                <button
                  key={diff}
                  onClick={() => setSelectedDifficulty(selectedDifficulty === diff ? null : diff)}
                  className={cn(
                    'px-4 py-2 brutal-border brutal-radius font-medium capitalize transition-all',
                    selectedDifficulty === diff
                      ? diff === 'beginner' ? 'bg-green text-white'
                        : diff === 'intermediate' ? 'bg-yellow text-black'
                        : 'bg-red text-white'
                      : 'bg-white'
                  )}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          {/* Projects Grid */}
          <div className="grid sm:grid-cols-2 gap-6">
            {filteredProjects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <BrutalCard
                  color={project.difficulty === 'beginner' ? 'green' : project.difficulty === 'intermediate' ? 'yellow' : 'pink'}
                  className="h-full"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-display font-bold text-xl mb-1">{project.title}</h3>
                      <p className="text-sm text-black/70">{project.description}</p>
                    </div>
                    <span className={cn(
                      'px-3 py-1 brutal-radius text-sm font-bold uppercase',
                      project.difficulty === 'beginner' ? 'bg-green/20 text-green'
                        : project.difficulty === 'intermediate' ? 'bg-yellow/30 text-yellow'
                        : 'bg-red/20 text-red'
                    )}>
                      {project.difficulty}
                    </span>
                  </div>

                  {/* Meta */}
                  <div className="flex items-center gap-4 mb-4 text-sm text-black/70">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {project.estimatedTime}
                    </span>
                    <span className="flex items-center gap-1">
                      <Code className="w-4 h-4" />
                      {project.skillsCovered.length} skills
                    </span>
                  </div>

                  {/* Skills */}
                  <div className="mb-4">
                    <p className="text-sm font-medium mb-2">Skills Covered:</p>
                    <div className="flex flex-wrap gap-2">
                      {project.skillsCovered.map((skill) => (
                        <SkillBadge key={skill} name={skill} size="sm" />
                      ))}
                    </div>
                  </div>

                  {/* Features */}
                  <div className="mb-4">
                    <p className="text-sm font-medium mb-2">Key Features:</p>
                    <ul className="space-y-1">
                      {project.features.slice(0, 3).map((feature) => (
                        <li key={feature} className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="w-4 h-4 text-green" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <BrutalButton
                      variant="outline"
                      color="black"
                      size="sm"
                      className="flex-1"
                      onClick={() => setShowChecklist(showChecklist === project.id ? null : project.id)}
                    >
                      {showChecklist === project.id ? 'Hide Checklist' : 'View Checklist'}
                    </BrutalButton>
                  </div>

                  {/* Expanded Checklist */}
                  {showChecklist === project.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="mt-4 pt-4 border-t-2 border-black"
                    >
                      <h4 className="font-bold mb-2">Deployment Checklist</h4>
                      <ul className="space-y-1 mb-4">
                        {project.deploymentSteps.map((step, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm">
                            <span className="w-5 h-5 brutal-radius bg-black text-white text-xs flex items-center justify-center">
                              {i + 1}
                            </span>
                            {step}
                          </li>
                        ))}
                      </ul>

                      <h4 className="font-bold mb-2">README Checklist</h4>
                      <ul className="space-y-1">
                        {project.readmeChecklist.map((item, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm">
                            <CheckCircle2 className="w-4 h-4 text-green" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  )}
                </BrutalCard>
              </motion.div>
            ))}
          </div>

          {filteredProjects.length === 0 && (
            <BrutalCard color="gray" className="text-center py-12">
              <Code className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="font-bold text-xl mb-2">No projects found</h3>
              <p className="text-gray-600">Try adjusting your filters</p>
            </BrutalCard>
          )}
        </Container>
      </div>
    </AppShell>
  )
}
