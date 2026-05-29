'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { AppShell, Container, GradientBackground } from '@/components/layout'
import { DashboardHeader } from '@/components/layout/dashboard-header'
import { BrutalCard, BrutalButton, SkillBadge, SkillLevelIndicator, SkillLevelSelector } from '@/components/brutal'
import { SKILLS, SKILL_CATEGORIES, SKILL_LEVEL_LABELS } from '@/lib/constants'
import { SkillCategory, SkillLevel } from '@/types'
import { cn } from '@/lib/utils'
import { Search, Filter, Save, Compass } from 'lucide-react'

// Mock user skills for demonstration
const initialUserSkills: Record<string, SkillLevel> = {
  'skill-html': 3,
  'skill-css': 3,
  'skill-javascript': 2,
  'skill-react': 1,
  'skill-git': 2,
  'skill-github': 2,
}

export default function SkillsPage() {
  const [activeCategory, setActiveCategory] = useState<SkillCategory | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [userSkills, setUserSkills] = useState<Record<string, SkillLevel>>(initialUserSkills)
  const [hasChanges, setHasChanges] = useState(false)

  const updateSkillLevel = (skillId: string, level: SkillLevel) => {
    setUserSkills((prev) => ({ ...prev, [skillId]: level }))
    setHasChanges(true)
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

  return (
    <AppShell showBottomNav={true}>
      <GradientBackground />

      {/* Main Content */}
      <div className="flex-1">
        <DashboardHeader
          icon={Compass}
          iconColor="pink"
          title="Skill Inventory"
          subtitle="Track your developer skill levels"
        />

        <Container className="py-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <motion.div
              initial={false}
              animate={{ opacity: 1, y: 0 }}
            >
              <BrutalCard color="yellow" className="text-center py-4">
                <p className="text-3xl font-bold">{skillCounts.total}</p>
                <p className="text-sm text-black/70">Total Skills</p>
              </BrutalCard>
            </motion.div>
            <motion.div
              initial={false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <BrutalCard color="green" className="text-center py-4">
                <p className="text-3xl font-bold">{skillCounts.learned}</p>
                <p className="text-sm text-black/70">Learned</p>
              </BrutalCard>
            </motion.div>
            <motion.div
              initial={false}
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
                  activeCategory === 'all' ? 'bg-black text-white' : 'bg-white'
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
                    activeCategory === cat.id ? 'bg-black text-white' : 'bg-white'
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
              const categoryColor = skill.category === 'frontend' ? 'blue'
                : skill.category === 'backend' ? 'green'
                : 'purple'

              return (
                <motion.div
                  key={skill.id}
                  initial={false}
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
                          color={categoryColor as any}
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

          {/* Save Button */}
          {hasChanges && (
            <motion.div
              initial={false}
              animate={{ opacity: 1, y: 0 }}
              className="fixed bottom-24 right-4"
            >
              <BrutalButton color="yellow" onClick={() => setHasChanges(false)}>
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
