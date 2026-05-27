'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { AppShell, Container, Section, Grid, GradientBackground } from '@/components/layout'
import { DashboardHeader } from '@/components/layout/dashboard-header'
import { BrutalCard, BrutalCardHover, BrutalButton, ScoreMeter, ScoreBar, SkillBadge, FloatingSticker } from '@/components/brutal'
import {
  Briefcase,
  Zap,
  GitBranch,
  Calendar,
  Flame,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react'

// Mock data for demonstration
const mockStats = {
  careerReadiness: 72,
  jobMatchScore: 85,
  currentRole: 'Frontend Developer',
  weeklyProgress: 60,
  streak: 5,
  githubScore: 68,
  roadmapProgress: 40,
}

const mockActivities = [
  { id: 1, text: 'Completed React Hooks task', time: '2 hours ago', icon: CheckCircle2 },
  { id: 2, text: 'Updated TypeScript skill to Level 2', time: '5 hours ago', icon: Zap },
  { id: 3, text: 'Saved Frontend Developer Intern job', time: 'Yesterday', icon: Briefcase },
]

export default function DashboardPage() {
  return (
    <AppShell showBottomNav={true}>
      <GradientBackground />

      {/* Main Content */}
      <div className="flex-1">
        <DashboardHeader
          title="Dashboard"
          subtitle="Your career progress at a glance"
        />

        <Container className="py-6">
          <div className="space-y-8">
            {/* Welcome Section */}
            <motion.div
              initial={false}
              animate={{ opacity: 1, y: 0 }}
            >
              <BrutalCard color="yellow" shadow="lg" className="relative overflow-hidden">
                <div className="relative z-10">
                  <h2 className="font-display font-bold text-2xl mb-2">
                    Welcome back, Developer!
                  </h2>
                  <p className="text-black/70 mb-4">
                    You are making great progress. Keep up the momentum!
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-black/10 px-3 py-1 brutal-radius">
                      <Flame className="w-5 h-5" />
                      <span className="font-bold">{mockStats.streak} day streak</span>
                    </div>
                    <Link href="/sprint">
                      <BrutalButton variant="outline" color="black" size="sm">
                        View Sprint
                      </BrutalButton>
                    </Link>
                  </div>
                </div>

                {/* Decorative elements */}
                <FloatingSticker
                  icon="rocket"
                  color="orange"
                  size="md"
                  className="absolute top-4 right-8 opacity-50"
                  animate={false}
                />
              </BrutalCard>
            </motion.div>

            {/* Stats Cards */}
            <Section title="Your Progress">
              <Grid cols={2}>
                <motion.div
                  initial={false}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <BrutalCard color="blue" className="text-center h-full">
                    <ScoreMeter score={mockStats.careerReadiness} label="Career Readiness" size="lg" />
                    <p className="text-sm text-black/70 mt-4">
                      You are getting close to your goal!
                    </p>
                  </BrutalCard>
                </motion.div>

                <motion.div
                  initial={false}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <BrutalCard color="pink" className="text-center h-full">
                    <ScoreMeter score={mockStats.jobMatchScore} label="Job Match Score" size="lg" />
                    <p className="text-sm text-black/70 mt-4">
                      Best current fit for {mockStats.currentRole}
                    </p>
                  </BrutalCard>
                </motion.div>

                <motion.div
                  initial={false}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <BrutalCard color="green" className="h-full">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-display font-bold text-lg">Weekly Sprint</h3>
                      <Calendar className="w-6 h-6" />
                    </div>
                    <ScoreBar
                      score={mockStats.weeklyProgress}
                      label="Week Progress"
                      color="black"
                    />
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-sm text-black/70">3 of 5 tasks done</span>
                      <Link href="/sprint">
                        <span className="text-sm font-bold underline">Continue</span>
                      </Link>
                    </div>
                  </BrutalCard>
                </motion.div>

                <motion.div
                  initial={false}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <BrutalCard color="orange" className="h-full">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-display font-bold text-lg">Next Recommended Skill</h3>
                      <Zap className="w-6 h-6" />
                    </div>
                    <p className="text-2xl font-bold mb-2">TypeScript</p>
                    <p className="text-sm text-black/70 mb-4">
                      Highest leverage skill for stronger frontend job matches.
                    </p>
                    <div className="mt-4">
                      <Link href="/skills?focus=typescript">
                        <BrutalButton variant="outline" color="black" size="sm" className="w-full">
                          Update Skill Level
                        </BrutalButton>
                      </Link>
                    </div>
                  </BrutalCard>
                </motion.div>
              </Grid>
            </Section>

            {/* Skills Section */}
            <Section title="Recommended Skills to Learn">
              <div className="flex flex-wrap gap-3">
                {['TypeScript', 'Testing', 'API Integration'].map((skill, i) => (
                  <motion.div
                    key={skill}
                    initial={false}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                  >
                    <Link href={`/skills?focus=${skill.toLowerCase().replace(' ', '-')}`}>
                      <BrutalCardHover color={['yellow', 'blue', 'pink'][i % 3] as 'yellow' | 'blue' | 'pink'}>
                        <div className="flex items-center gap-3">
                          <span className="font-bold">{skill}</span>
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      </BrutalCardHover>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </Section>

            {/* Job Match Section */}
            <Section title="Best Match Jobs">
              <BrutalCard color="white" shadow="sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-pink brutal-border brutal-radius flex items-center justify-center">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold">Frontend Developer Intern</h3>
                      <p className="text-sm text-gray-600">TechStart Studio - Remote</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-green">{mockStats.jobMatchScore}%</span>
                    <p className="text-xs text-gray-500">match</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {['React', 'TypeScript', 'CSS'].map((tag) => (
                    <SkillBadge key={tag} name={tag} size="sm" />
                  ))}
                </div>
                <div className="flex gap-3">
                  <Link href="/jobs/1" className="flex-1">
                    <BrutalButton color="blue" className="w-full">
                      View Details
                    </BrutalButton>
                  </Link>
                  <Link href="/roadmap" className="flex-1">
                    <BrutalButton variant="outline" color="black" className="w-full">
                      Build Roadmap
                    </BrutalButton>
                  </Link>
                </div>
              </BrutalCard>
            </Section>

            {/* GitHub Score */}
            <Section title="GitHub Portfolio">
              <BrutalCard color="purple" className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <GitBranch className="w-8 h-8" />
                  <div>
                    <h3 className="font-bold text-lg">Portfolio Score</h3>
                    <p className="text-sm text-black/70">Based on your GitHub activity</p>
                  </div>
                </div>
                <div className="text-center">
                  <span className="text-4xl font-bold">{mockStats.githubScore}</span>
                  <span className="text-lg">/100</span>
                </div>
                <Link href="/github">
                  <BrutalButton variant="outline" color="black" size="sm">
                    Analyze
                  </BrutalButton>
                </Link>
              </BrutalCard>
            </Section>

            {/* Recent Activity */}
            <Section title="Recent Activity">
              <div className="space-y-3">
                {mockActivities.map((activity, i) => (
                  <motion.div
                    key={activity.id}
                    initial={false}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + i * 0.1 }}
                  >
                    <BrutalCard color="white" shadow="sm" className="flex items-center gap-4 py-4">
                      <div className="w-10 h-10 bg-green/20 brutal-radius flex items-center justify-center">
                        <activity.icon className="w-5 h-5 text-green" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{activity.text}</p>
                        <p className="text-sm text-gray-500">{activity.time}</p>
                      </div>
                    </BrutalCard>
                  </motion.div>
                ))}
              </div>
            </Section>
          </div>
        </Container>
      </div>
    </AppShell>
  )
}
