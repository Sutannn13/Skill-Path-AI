export type JobRiskLevel = 'low' | 'medium' | 'high'

function hashString(value: string): number {
  let hash = 0

  for (let i = 0; i < value.length; i++) {
    hash = ((hash << 5) - hash) + value.charCodeAt(i)
    hash |= 0
  }

  return Math.abs(hash)
}

export function getDeterministicMatchScore(jobId: string, targetRole = 'frontend-developer'): number {
  return 70 + (hashString(`${jobId}:${targetRole}:match`) % 30)
}

export function getDeterministicValidityScore(jobId: string): number {
  return 72 + (hashString(`${jobId}:validity`) % 23)
}

export function getRiskLevel(validityScore: number): JobRiskLevel {
  if (validityScore >= 80) return 'low'
  if (validityScore >= 60) return 'medium'
  return 'high'
}

export function getRiskLabel(riskLevel: JobRiskLevel): string {
  if (riskLevel === 'low') return 'Low risk'
  if (riskLevel === 'medium') return 'Needs review'
  return 'High risk'
}
