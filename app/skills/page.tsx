'use client'

import { useEffect, useMemo, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { AppShell, Container, GradientBackground } from '@/components/layout'
import { DashboardHeader } from '@/components/layout/dashboard-header'
import { BrutalCard, BrutalButton, SkillBadge, SkillLevelIndicator, SkillLevelSelector, StickerBadge } from '@/components/brutal'
import { PageScene } from '@/components/illustrations/page-scene'
import { SKILLS, SKILL_CATEGORIES, SKILL_LEVEL_LABELS } from '@/lib/constants'
import { SkillCategory, SkillLevel } from '@/types'
import { cn } from '@/lib/utils'
import { createSupabaseBrowserClient } from '@/lib/supabase/browser'
import { Search, Save, Compass, Check, AlertCircle, RefreshCw } from 'lucide-react'

interface UserSkillRow {
  skill_slug: string
  level: number
}

type SaveState = 'idle' | 'saving' | 'saved' | 'error'

export default function SkillsPage() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), [])

  const [activeCategory, setActiveCategory] = useState<SkillCategory | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [userSkills, setUserSkills] = useState<Record<string, SkillLevel>>({})
  const [hasChanges, setHasChanges] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [saveState, setSaveState] = useState<SaveState>('idle')
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [isDemoMode, setIsDemoMode] = useState(false)

  // Load skills from Supabase
  useEffect(() => {
    let isActive = true

    const loadSkills = async () => {
      if (!supabase) {
        if (isActive) {
          setIsLoading(false)
          setIsDemoMode(true)
        }
        return
      }

      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()

        if (userError) {
          if (isActive) {
            setLoadError(`Failed to validate session: ${userError.message}`)
            setIsLoading(false)
          }
          return
        }

        if (!user) {
          if (isActive) {
            setIsDemoMode(true)
            setIsLoading(false)
          }
          return
        }

        setCurrentUserId(user.id)

        const { data: skillRows, error: skillsError } = await supabase
          .from('user_skills')
          .select('skill_slug, level')
          .eq('user_id', user.id)

        if (skillsError) {
          if (isActive) {
            setLoadError(`Failed to load skills: ${skillsError.message}`)
            setIsLoading(false)
          }
          return
        }

        if (isActive) {
          const loadedSkills: Record<string, SkillLevel> = {}
          for (const row of (skillRows ?? []) as UserSkillRow[]) {
            loadedSkills[row.skill_slug] = Math.max(0, Math.min(4, row.level)) as SkillLevel
          }
          setUserSkills(loadedSkills)
          setIsLoading(false)
          setIsDemoMode(false)
        }
      } catch (error) {
        if (isActive) {
          setLoadError(error instanceof Error ? error.message : 'Failed to load skills')
          setIsLoading(false)
        }
      }
    }

    loadSkills()

    return () => {
      isActive = false
    }
  }, [supabase])

  const updateSkillLevel = useCallback((skillId: string, level: SkillLevel) => {
    setUserSkills((prev) => ({ ...prev, [skillId]: level }))
    setHasChanges(true)
  }, [])

  const saveSkills = async () => {
    if (isDemoMode || !supabase || !currentUserId) {
      setSaveState('error')
      setSaveMessage('Cannot save in demo mode. Please sign in.')
      setTimeout(() => setSaveState('idle'), 3000)
      return
    }

    setSaveState('saving')
    setSaveMessage('Saving skills...')

    try {
      // Delete existing skills and insert new ones
      const { error: deleteError } = await supabase
        .from('user_skills')
        .delete()
        .eq('user_id', currentUserId)

      if (deleteError) {
        throw new Error(`Failed to clear old skills: ${deleteError.message}`)
      }

      const skillRows = Object.entries(userSkills)
        .filter(([_, level]) => level > 0)
        .map(([skillSlug, level]) => ({
          user_id: currentUserId,
          skill_slug: skillSlug,
          level: Number(level),
          updated_at: new Date().toISOString(),
        }))

      if (skillRows.length > 0) {
        const { error: insertError } = await supabase
          .from('user_skills')
          .insert(skillRows)

        if (insertError) {
          throw new Error(`Failed to save skills: ${insertError.message}`)
        }
      }

      setSaveState('saved')
      setSaveMessage('Skills saved successfully!')
      setHasChanges(false)
      setTimeout(() => {
        setSaveState('idle')
        setSaveMessage(null)
      }, 3000)
    } catch (error) {
      setSaveState('error')
      setSaveMessage(error instanceof Error ? error.message : 'Failed to save skills')
      setTimeout(() => setSaveState('idle'), 5000)
    }
  }

  const filteredSkills = SKILLS.filter((skill) => {
    const matchesCategory = activeCategory === 'all' || skill.category === activeCategory
    const matchesSearch = skill.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const skillCounts = {
    total: SKILLS.length,
    learned: Object.values(userSkills).filter((l) => l > 0).length,
    mastered: Object.values(userSkills).filter((l) => l >= 3).length,
  }

  if (isLoading) {
    return (
      <AppShell showBottomNav={true}>
        <GradientBackground variant="skills" />
        <DashboardHeader
          icon={Compass}
          iconColor="pink"
          title="Skill Inventory"
          subtitle="Track your developer skill levels"
        />
        <Container className="py-6">
          <BrutalCard color="white" className="text-center py-12">
            <div className="flex items-center justify-center gap-4">
              <RefreshCw className="w-6 h-6 animate-spin" />
              <p className="font-bold">Loading your skills...</p>
            </div>
          </BrutalCard>
        </Container>
      </AppShell>
    )
  }

  if (loadError) {
    return (
      <AppShell showBottomNav={true}>
        <GradientBackground variant="skills" />
        <DashboardHeader
          icon={Compass}
          iconColor="pink"
          title="Skill Inventory"
          subtitle="Track your developer skill levels"
        />
        <Container className="py-6">
          <BrutalCard color="red" className="mb-6 flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <p className="font-bold">Failed to load skills</p>
              <p className="text-sm">{loadError}</p>
            </div>
          </BrutalCard>
          <BrutalButton color="yellow" onClick={() => window.location.reload()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </BrutalButton>
        </Container>
      </AppShell>
    )
  }

  return (
    <AppShell showBottomNav={true}>
      <GradientBackground variant="skills" />
      <div className="flex-1">
        <DashboardHeader
          icon={Compass}
          iconColor="pink"
          title="Skill Inventory"
          subtitle="Track your developer skill levels"
        />

        <Container className="py-6">
          <PageScene variant="skills" className="mb-6" />

          {/* Demo Mode Banner */}
          {isDemoMode && (
            <BrutalCard color="yellow" className="mb-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-yellow/30 brutal-border brutal-radius flex items-center justify-center shrink-0">
                  <span className="text-2xl">🐱</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-display font-bold text-lg mb-1">Demo Mode</h3>
                  <p className="text-sm text-black/70">
                    Skills are not being saved. Sign in to persist your skill inventory.
                  </p>
                </div>
                <Link href="/login">
                  <BrutalButton color="black" size="sm">
                    Sign In
                  </BrutalButton>
                </Link>
              </div>
            </BrutalCard>
          )}

          {/* Save Status Messages */}
          {saveMessage && (
            <BrutalCard
              color={saveState === 'error' ? 'red' : saveState === 'saved' ? 'green' : 'white'}
              className="mb-6 flex items-center gap-3"
            >
              {saveState === 'saving' && <RefreshCw className="w-5 h-5 animate-spin shrink-0" />}
              {saveState === 'saved' && <Check className="w-5 h-5 shrink-0" />}
              {saveState === 'error' && <AlertCircle className="w-5 h-5 shrink-0" />}
              <p className="font-medium">{saveMessage}</p>
            </BrutalCard>
          )}

          {/* Stats Overview */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <BrutalCard color="yellow" className="text-center py-4">
                <p className="text-3xl font-bold">{skillCounts.total}</p>
                <p className="text-sm text-black/70">Total Skills</p>
              </BrutalCard>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <BrutalCard color="green" className="text-center py-4">
                <p className="text-3xl font-bold">{skillCounts.learned}</p>
                <p className="text-sm text-black/70">Learned</p>
              </BrutalCard>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <BrutalCard color="blue" className="text-center py-4">
                <p className="text-3xl font-bold">{skillCounts.mastered}</p>
                <p className="text-sm text-black/70">Mastered</p>
              </BrutalCard>
            </motion.div>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 brutal-border brutal-radius bg-white focus:outline-none focus:ring-2 focus:ring-yellow"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto hide-scrollbar">
              <button
                onClick={() => setActiveCategory('all')}
                className={cn(
                  'px-4 py-2 brutal-border brutal-radius font-medium whitespace-nowrap transition-all',
                  activeCategory === 'all' ? 'bg-black text-white' : 'bg-white hover:bg-gray-100'
                )}
              >
                All
              </button>
              {SKILL_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={cn(
                    'px-4 py-2 brutal-border brutal-radius font-medium whitespace-nowrap transition-all',
                    activeCategory === cat.id ? 'bg-black text-white' : 'bg-white hover:bg-gray-100'
                  )}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Level Legend */}
          <BrutalCard color="gray" className="mb-6 p-4">
            <h3 className="font-bold mb-3">Skill Level Guide</h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-sm">
              {SKILL_LEVEL_LABELS && Object.entries(SKILL_LEVEL_LABELS).map(([level, label]) => (
                <div key={level} className="flex items-center gap-2">
                  <span className={cn(
                    'w-8 h-8 brutal-radius flex items-center justify-center font-bold text-sm',
                    Number(level) > 0 ? 'bg-black text-white' : 'bg-gray-200'
                  )}>
                    {level}
                  </span>
                  <span className="text-gray-600">{label}</span>
                </div>
              ))}
            </div>
          </BrutalCard>

          {/* Skills List */}
          <div className="space-y-4">
            {filteredSkills.map((skill, index) => {
              const level = userSkills[skill.id] || 0
              const categoryColor: 'blue' | 'green' | 'purple' = skill.category === 'frontend' ? 'blue'
                : skill.category === 'backend' ? 'green'
                : 'purple'

              return (
                <motion.div
                  key={skill.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.02 }}
                >
                  <BrutalCard color="white" className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-bold">{skill.name}</h3>
                        <SkillBadge
                          name={skill.category}
                          size="sm"
                          color={categoryColor}
                        />
                      </div>
                      <p className="text-sm text-gray-600">{skill.description}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <SkillLevelIndicator level={level} showLabel size="md" />
                      <SkillLevelSelector
                        value={level}
                        onChange={(lvl) => updateSkillLevel(skill.id, lvl)}
                        size="sm"
                      />
                    </div>
                  </BrutalCard>
                </motion.div>
              )
            })}
          </div>

          {/* Empty State - No skills set */}
          {Object.keys(userSkills).length === 0 && !isDemoMode && (
            <BrutalCard color="yellow" className="mt-6 text-center">
              <div className="py-6">
                <div className="w-16 h-16 bg-yellow/30 brutal-border brutal-radius flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🎯</span>
                </div>
                <h3 className="font-display font-bold text-lg mb-2">No skills assessed yet</h3>
                <p className="text-sm text-black/70 mb-4">
                  Use the sliders above to rate your current skill levels (0-4).
                  Your responses help us recommend the right learning path.
                </p>
              </div>
            </BrutalCard>
          )}

          {/* Save Button */}
          {hasChanges && !isDemoMode && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="fixed bottom-24 right-4 z-40"
            >
              <BrutalButton color="yellow" onClick={saveSkills} loading={saveState === 'saving'}>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </BrutalButton>
            </motion.div>
          )}
        </Container>
      </div>
    </AppShell>
  )
}
