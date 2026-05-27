import { JobPost, JobValidityAssessment } from './types'

// Red flag patterns - job postings with these patterns are suspicious
const RED_FLAG_PATTERNS = {
  // Payment-related red flags
  paymentRequests: [
    'registration fee',
    'registration fee',
    'deposit required',
    'security deposit',
    'admin fee',
    'processing fee',
    'payment before interview',
    'pay to apply',
    'payment to start',
    'guaranteed income',
    'investment required',
    'buy this',
    'purchase required',
  ],

  // Contact-related red flags
  vagueContact: [
    'whatsapp only',
    'telegram only',
    'chat only',
    'no email provided',
    'contact through',
    'dm for details',
    'inbox for more',
    'pm for info',
  ],

  // Company-related red flags
  vagueCompany: [
    'startup company',
    'new company',
    'exciting startup',
    'fast growing company',
    'dynamic company',
    'reputable company',
    'our company',
    'company name upon request',
    'will disclose later',
    'ask me',
  ],

  // Salary-related red flags
  unrealisticSalary: [
    'guaranteed salary',
    'unlimited income',
    'make $10000',
    'earn $5000',
    'per day working',
    'no experience needed',
    'no skills needed',
    'high salary no experience',
  ],

  // URL-related red flags
  suspiciousUrls: [
    'bit.ly',
    'tinyurl.com',
    'goo.gl',
    't.co',
    'ow.ly',
    'is.gd',
    'buff.ly',
    'dlvr.it',
  ],

  // Description-related red flags
  vagueDescription: [
    'no description',
    'details to be shared',
    'will explain later',
    'more details in interview',
    'exciting opportunity',
    'great opportunity',
    'amazing opportunity',
    'fast money',
    'easy money',
  ],

  // Spam keywords
  spamKeywords: [
    'ACT NOW',
    'LIMITED TIME',
    'DON\'T MISS OUT',
    'HURRY UP',
    'ONLY TODAY',
    'OFFER EXPIRES',
    'URGENT HIRING',
    'IMMEDIATE HIRING',
    'CLICK HERE NOW',
    'FREE MONEY',
    'NO EXPERIENCE NEEDED',
  ],

  // Instant acceptance patterns
  instantAcceptance: [
    'instant hiring',
    'immediate start',
    'start today',
    'no interview',
    'hired immediately',
    'no questions asked',
    'just apply',
    'accept everyone',
  ],
}

// Positive signals - these increase trust
const POSITIVE_SIGNALS = {
  // Company verification
  companyVerified: [
    'www.',
    '.com',
    '.io',
    '.co',
    '.id', // Indonesian domain
    'linkedin.com/company',
    'github.com/',
  ],

  // Known trusted sources
  trustedSources: [
    'remotive',
    'arbeitnow',
    'linkedin',
    'glassdoor',
    'indeed',
  ],

  // Job completeness
  jobComplete: [
    'requirements',
    'qualifications',
    'responsibilities',
    'benefits',
    'skills required',
    'experience',
    'what you\'ll do',
    'about the role',
    'job description',
  ],

  // Professional language
  professionalLanguage: [
    'we are looking',
    'our team',
    'the role',
    'position',
    'apply',
    'submit',
    'resume',
    'portfolio',
    'years of experience',
  ],
}

// Known legitimate companies (for additional validation)
const KNOWN_TRUSTED_COMPANIES = [
  'google',
  'microsoft',
  'amazon',
  'meta',
  'apple',
  'netflix',
  'stripe',
  'shopify',
  'github',
  'atlassian',
  'slack',
  'zoom',
  'spotify',
  'uber',
  'airbnb',
]

export function assessJobValidity(job: Partial<JobPost>): JobValidityAssessment {
  const reasons: string[] = []
  const signals: string[] = []
  let score = 50 // Start with neutral score

  const title = (job.title || '').toLowerCase()
  const rawTitle = job.title || ''
  const description = (job.description || '').toLowerCase()
  const company = (job.company || '').toLowerCase()
  const location = (job.location || '').toLowerCase()
  const applyUrl = (job.applyUrl || '').toLowerCase()
  const combinedText = `${title} ${description} ${company} ${location}`

  // Check for red flags
  const redFlags = checkRedFlags(combinedText, title, rawTitle, description, applyUrl, job)
  score -= redFlags.length * 10
  reasons.push(...redFlags)

  // Check for positive signals
  const positiveSignals = checkPositiveSignals(combinedText, job)
  score += positiveSignals.length * 5
  signals.push(...positiveSignals)

  // Source-based scoring
  const sourceBonus = getSourceBonus(job.sourceSlug)
  score += sourceBonus
  if (sourceBonus > 0) {
    signals.push(`Source: ${job.sourceSlug} (trusted source)`)
  }

  // Company domain validation
  if (job.companyDomain) {
    const domainSignals = validateCompanyDomain(job.companyDomain)
    score += domainSignals.bonus
    signals.push(...domainSignals.signals)
  }

  // Known trusted company bonus
  for (const trustedCompany of KNOWN_TRUSTED_COMPANIES) {
    if (company.includes(trustedCompany)) {
      score += 15
      signals.push(`Known company: ${trustedCompany}`)
      break
    }
  }

  // Clamp score to 0-100
  score = Math.max(0, Math.min(100, score))

  // Determine risk level
  let riskLevel: 'low' | 'medium' | 'high'
  if (score >= 70) {
    riskLevel = 'low'
  } else if (score >= 40) {
    riskLevel = 'medium'
  } else {
    riskLevel = 'high'
  }

  // Determine status
  let status: 'approved' | 'pending_review' | 'rejected'
  if (score >= 60) {
    status = 'approved'
  } else if (score >= 30) {
    status = 'pending_review'
  } else {
    status = 'rejected'
  }

  return {
    validityScore: score,
    riskLevel,
    status,
    reasons: Array.from(new Set(reasons)), // Remove duplicates
    signals: Array.from(new Set(signals)),
    analyzedAt: new Date().toISOString(),
  }
}

function checkRedFlags(
  combinedText: string,
  title: string,
  rawTitle: string,
  description: string,
  applyUrl: string,
  job: Partial<JobPost>
): string[] {
  const flags: string[] = []

  // Check payment request patterns
  for (const pattern of RED_FLAG_PATTERNS.paymentRequests) {
    if (combinedText.includes(pattern)) {
      flags.push(`Payment request detected: "${pattern}"`)
    }
  }

  // Check for vague contact info
  const hasContact = job.applyUrl && (job.applyUrl.includes('@') || job.applyUrl.includes('apply/'))
  const hasWhatsAppOnly = combinedText.includes('whatsapp') && !hasContact
  if (hasWhatsAppOnly) {
    flags.push('Contact method limited to WhatsApp only')
  }

  // Check for vague company
  for (const pattern of RED_FLAG_PATTERNS.vagueCompany) {
    if (title.includes(pattern) || (description.length < 100 && description.includes(pattern))) {
      flags.push(`Vague company description: "${pattern}"`)
    }
  }

  // Check for unrealistic salary
  for (const pattern of RED_FLAG_PATTERNS.unrealisticSalary) {
    if (combinedText.includes(pattern)) {
      flags.push(`Unrealistic salary claim: "${pattern}"`)
    }
  }

  // Check for suspicious URLs
  for (const url of RED_FLAG_PATTERNS.suspiciousUrls) {
    if (applyUrl.includes(url)) {
      flags.push(`Suspicious shortened URL detected: ${url}`)
    }
  }

  // Check for very short descriptions
  if (description.length < 50) {
    flags.push('Job description is very short or missing')
  }

  // Check for spam keywords (excessive uppercase)
  const uppercaseCount = (rawTitle.match(/[A-Z]/g) || []).length
  if (rawTitle.length > 0 && uppercaseCount > rawTitle.length * 0.3) {
    flags.push('Title contains excessive uppercase (spam indicator)')
  }

  // Check for spam patterns
  for (const pattern of RED_FLAG_PATTERNS.spamKeywords) {
    const normalizedPattern = pattern.toLowerCase()
    if (title.includes(normalizedPattern) || description.includes(normalizedPattern)) {
      flags.push(`Spam keyword detected: "${pattern}"`)
    }
  }

  // Check for instant acceptance patterns
  for (const pattern of RED_FLAG_PATTERNS.instantAcceptance) {
    if (combinedText.includes(pattern)) {
      flags.push(`Instant acceptance claim: "${pattern}"`)
    }
  }

  // Check for no application URL
  if (!job.applyUrl || job.applyUrl === '#' || job.applyUrl.length < 5) {
    flags.push('No valid application URL provided')
  }

  return flags
}

function checkPositiveSignals(combinedText: string, job: Partial<JobPost>): string[] {
  const signals: string[] = []

  // Check for company verification
  for (const pattern of POSITIVE_SIGNALS.companyVerified) {
    if (combinedText.includes(pattern)) {
      signals.push('Company has verifiable web presence')
      break
    }
  }

  // Check for trusted source
  if (job.sourceSlug) {
    for (const source of POSITIVE_SIGNALS.trustedSources) {
      if (job.sourceSlug.includes(source)) {
        signals.push(`From trusted job board: ${job.sourceSlug}`)
        break
      }
    }
  }

  // Check for complete job description
  let completenessCount = 0
  for (const pattern of POSITIVE_SIGNALS.jobComplete) {
    if (combinedText.includes(pattern)) {
      completenessCount++
    }
  }
  if (completenessCount >= 3) {
    signals.push('Job description is detailed and complete')
  }

  // Check for professional language
  let professionalCount = 0
  for (const pattern of POSITIVE_SIGNALS.professionalLanguage) {
    if (combinedText.includes(pattern)) {
      professionalCount++
    }
  }
  if (professionalCount >= 3) {
    signals.push('Job posting uses professional language')
  }

  // Check for skills listed
  if (job.requiredSkills && job.requiredSkills.length >= 3) {
    signals.push(`Lists ${job.requiredSkills.length} required skills`)
  }

  // Check for salary range
  if (job.salaryMin && job.salaryMax) {
    signals.push('Provides salary range')
  }

  // Check for specific location
  if (job.location && job.location !== 'Remote' && job.location.length > 2) {
    signals.push('Specifies job location')
  }

  return signals
}

function getSourceBonus(sourceSlug?: string): number {
  if (!sourceSlug) return 0

  const trustedSources: Record<string, number> = {
    remotive: 10,
    arbeitnow: 10,
    jobicy: 5,
    adzuna: 5,
    linkedin: 15,
    glassdoor: 10,
    indeed: 5,
    'indonesia-sample': 0, // Sample data, neutral
  }

  return trustedSources[sourceSlug] || 0
}

function validateCompanyDomain(domain: string): { bonus: number; signals: string[] } {
  const signals: string[] = []
  let bonus = 0

  const lowerDomain = domain.toLowerCase()

  // Check for legitimate TLDs
  const legitimateTlds = ['.com', '.io', '.co', '.org', '.net', '.id', '.tech', '.dev']
  for (const tld of legitimateTlds) {
    if (lowerDomain.includes(tld)) {
      bonus += 5
      signals.push(`Company uses legitimate domain: ${tld}`)
      break
    }
  }

  // Check for suspicious TLDs
  const suspiciousTlds = ['.xyz', '.top', '.work', '.click', '.loan', '.download']
  for (const tld of suspiciousTlds) {
    if (lowerDomain.includes(tld)) {
      bonus -= 10
      signals.push(`Suspicious domain TLD: ${tld}`)
      break
    }
  }

  // Check for free email domains (less professional)
  const freeEmailDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com']
  for (const emailDomain of freeEmailDomains) {
    if (lowerDomain.includes(emailDomain)) {
      bonus -= 5
      signals.push('Company uses free email domain (less professional)')
      break
    }
  }

  return { bonus, signals }
}

// Batch process multiple jobs
export function assessMultipleJobs(jobs: Partial<JobPost>[]): Map<string, JobValidityAssessment> {
  const results = new Map<string, JobValidityAssessment>()

  for (const job of jobs) {
    if (job.id) {
      results.set(job.id, assessJobValidity(job))
    }
  }

  return results
}

// Filter jobs by validity status
export function filterJobsByValidity(
  jobs: Partial<JobPost>[],
  status: 'approved' | 'pending_review' | 'all'
): Partial<JobPost>[] {
  const assessments = assessMultipleJobs(jobs)

  return jobs.filter(job => {
    if (!job.id) return false

    const assessment = assessments.get(job.id)
    if (!assessment) return false

    if (status === 'all') return true
    return assessment.status === status
  })
}

// Get jobs that need review
export function getJobsNeedingReview(jobs: Partial<JobPost>[]): Partial<JobPost>[] {
  return filterJobsByValidity(jobs, 'pending_review')
}

// Get high-risk jobs
export function getHighRiskJobs(jobs: Partial<JobPost>[]): Array<{ job: Partial<JobPost>; assessment: JobValidityAssessment }> {
  const results: Array<{ job: Partial<JobPost>; assessment: JobValidityAssessment }> = []

  for (const job of jobs) {
    if (!job.id) continue

    const assessment = assessJobValidity(job)
    if (assessment.riskLevel === 'high') {
      results.push({ job, assessment })
    }
  }

  return results
}
