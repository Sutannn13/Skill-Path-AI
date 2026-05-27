import { Skill, UserSkill, SkillGapResult, SkillLevel, ReadinessLabel } from '@/types'
import { getSkillById, getSkillsByRole } from '@/lib/constants'
import { normalizeSkillLevel, getReadinessLabel } from '@/lib/utils'

interface SkillGapInput {
  userSkills: UserSkill[]
  targetRole: string
  requiredSkillIds: string[]
  niceToHaveSkillIds?: string[]
  jobRequiredSkills?: string[]
}

export function calculateSkillGap(input: SkillGapInput): SkillGapResult {
  const {
    userSkills,
    targetRole,
    requiredSkillIds,
    niceToHaveSkillIds = [],
    jobRequiredSkills = [],
  } = input

  // Create a map of user skill levels
  const userSkillMap = new Map<string, number>()
  for (const userSkill of userSkills) {
    userSkillMap.set(userSkill.skillId, userSkill.level)
  }

  // Calculate basic match score
  let matchedRequired = 0
  let totalRequired = requiredSkillIds.length

  for (const skillId of requiredSkillIds) {
    const level = userSkillMap.get(skillId) ?? 0
    if (level > 0) {
      matchedRequired++
    }
  }

  // If job-specific skills are provided, use those instead
  if (jobRequiredSkills.length > 0) {
    totalRequired = jobRequiredSkills.length
    matchedRequired = 0

    for (const skillName of jobRequiredSkills) {
      // Find matching skill from our database
      const matchingSkill = findSkillByName(skillName)
      if (matchingSkill) {
        const level = userSkillMap.get(matchingSkill.id) ?? userSkillMap.get(matchingSkill.slug) ?? 0
        if (level > 0) matchedRequired++
      }
    }
  }

  const matchScore = totalRequired > 0 ? (matchedRequired / totalRequired) * 100 : 0

  // Calculate weighted score
  let weightedSum = 0
  let totalWeight = 0

  const skillIdsToCheck = jobRequiredSkills.length > 0
    ? jobRequiredSkills.map(name => findSkillByName(name)?.id).filter(Boolean) as string[]
    : requiredSkillIds

  for (const skillId of skillIdsToCheck) {
    const skill = getSkillById(skillId)
    if (!skill) continue

    const level = userSkillMap.get(skillId) ?? 0
    const normalizedLevel = normalizeSkillLevel(level)

    weightedSum += normalizedLevel * skill.priorityWeight
    totalWeight += skill.priorityWeight
  }

  const weightedMatchScore = totalWeight > 0 ? (weightedSum / totalWeight) * 100 : 0

  // Determine missing and weak skills
  const missingSkills: string[] = []
  const weakSkills: { name: string; level: SkillLevel; priority: number }[] = []
  const strongSkills: string[] = []

  for (const skillId of skillIdsToCheck) {
    const skill = getSkillById(skillId)
    if (!skill) continue

    const level = (userSkillMap.get(skillId) ?? 0) as SkillLevel

    if (level === 0) {
      missingSkills.push(skill.name)
    } else if (level < 3) {
      weakSkills.push({ name: skill.name, level, priority: skill.priorityWeight })
    } else {
      strongSkills.push(skill.name)
    }
  }

  // Sort weak skills by priority (highest first)
  weakSkills.sort((a, b) => b.priority - a.priority)

  // Get recommended next skills (prioritize missing high-weight skills)
  const recommendedNextSkills = [
    ...missingSkills.slice(0, 3),
    ...weakSkills.slice(0, 2).map(w => w.name),
  ].slice(0, 5)

  // Determine readiness label
  let readinessLabel: ReadinessLabel
  if (weightedMatchScore >= 85) readinessLabel = 'strong-candidate'
  else if (weightedMatchScore >= 70) readinessLabel = 'internship-ready-soon'
  else if (weightedMatchScore >= 50) readinessLabel = 'getting-close'
  else if (weightedMatchScore >= 25) readinessLabel = 'foundation-stage'
  else readinessLabel = 'not-ready-yet'

  // Generate explanation
  const explanation = generateExplanation({
    matchScore,
    weightedMatchScore,
    missingSkills,
    weakSkills,
    strongSkills,
    readinessLabel,
  })

  return {
    matchScore,
    weightedMatchScore,
    missingSkills,
    weakSkills,
    strongSkills,
    recommendedNextSkills,
    readinessLabel,
    explanation,
  }
}

function findSkillByName(name: string): Skill | undefined {
  const lowerName = name.toLowerCase()

  // Try exact match first
  const exactMatch = getSkillById(lowerName)
  if (exactMatch) return exactMatch

  // Try partial match in name or slug
  return getSkillById(name) ||
    getSkillById(name.replace(/[^a-z0-9]/gi, '-'))
}

function generateExplanation(data: {
  matchScore: number
  weightedMatchScore: number
  missingSkills: string[]
  weakSkills: { name: string; level: SkillLevel; priority: number }[]
  strongSkills: string[]
  readinessLabel: ReadinessLabel
}): string {
  const { missingSkills, weakSkills, strongSkills, readinessLabel } = data

  if (readinessLabel === 'strong-candidate') {
    return `You have strong foundations in ${strongSkills.length > 0 ? strongSkills.slice(0, 3).join(', ') : 'key skills'}. Focus on maintaining and expanding your knowledge while preparing for interviews.`
  }

  if (readinessLabel === 'internship-ready-soon') {
    const needsWork = [...missingSkills.slice(0, 2), ...weakSkills.slice(0, 2).map(w => w.name)]
    return `You're close to being internship-ready! Keep working on: ${needsWork.join(', ')}. These are the most impactful skills for your target role.`
  }

  if (readinessLabel === 'getting-close') {
    return `Your foundation is growing! To improve, focus on learning: ${missingSkills.slice(0, 3).join(', ')}. Building projects with these skills will accelerate your progress.`
  }

  if (readinessLabel === 'foundation-stage') {
    return `You're building your foundation. Start by mastering the basics of: ${missingSkills.slice(0, 4).join(', ')}. Consistent practice and small projects will help you progress faster.`
  }

  return `Your developer journey is just beginning! Focus on core skills first: ${missingSkills.slice(0, 5).join(', ')}. Start with one skill, build something, then move to the next.`
}

export function calculateReadinessScore(userSkills: UserSkill[], targetRole: string): number {
  const requiredSkillIds = getSkillsByRole(targetRole as any).map(s => s.id)

  const result = calculateSkillGap({
    userSkills,
    targetRole,
    requiredSkillIds,
  })

  return result.weightedMatchScore
}

export function getMissingSkillsForJob(
  userSkills: UserSkill[],
  jobRequiredSkills: string[]
): string[] {
  const userSkillNames = new Set(
    userSkills.map(s => s.skillId.toLowerCase())
  )

  const missing: string[] = []
  for (const skillName of jobRequiredSkills) {
    const matchedSkill = findSkillByName(skillName)
    if (matchedSkill) {
      const userLevel = userSkills.find(
        s => s.skillId === matchedSkill.id
      )?.level ?? 0
      if (userLevel === 0) {
        missing.push(skillName)
      }
    } else {
      // If we can't find the skill, assume it's missing
      missing.push(skillName)
    }
  }

  return missing
}