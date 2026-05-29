/**
 * AI Job Classification System
 *
 * Provides two-layer classification:
 * 1. Gemini AI (primary) - for intelligent, contextual analysis
 * 2. Keyword-based fallback (secondary) - when Gemini fails or quota exceeded
 *
 * IMPORTANT: Gemini NEVER creates fake jobs. It only analyzes and classifies
 * real jobs from external sources. Every job must have a valid applyUrl or sourceUrl.
 */

import { JobPost } from './types'

// Gemini API configuration
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'
const GEMINI_API_KEY = process.env.GEMINI_API_KEY

export interface JobClassificationResult {
  normalizedTitle: string
  category: string
  role: string
  level: 'intern' | 'freshgraduate' | 'junior' | 'mid' | 'senior'
  workMode: 'remote' | 'hybrid' | 'onsite' | 'unknown'
  employmentType: 'internship' | 'fulltime' | 'parttime' | 'contract' | 'freelance'
  countryScope: 'indonesia' | 'international'
  techStacks: string[]
  requirements: string[]
  summary: string
  isBeginnerFriendly: boolean
  isFreshGraduateFriendly: boolean
  matchScore: number
  matchReason: string
  skillGaps: string[]
  redFlags: string[]
  confidence: number
}

// Required categories for job classification
export const JOB_CATEGORIES = [
  'Software Development',
  'Frontend Development',
  'Backend Development',
  'Fullstack Development',
  'Mobile Development',
  'Data & AI',
  'DevOps & Cloud',
  'Cybersecurity',
  'QA & Testing',
  'UI/UX Design',
  'Product & Business',
  'IT Support & Infrastructure',
  'Internship & Fresh Graduate',
] as const

// Required roles for job classification
export const JOB_ROLES = [
  'Frontend Developer',
  'Backend Developer',
  'Fullstack Developer',
  'Software Engineer',
  'Web Developer',
  'React Developer',
  'Next.js Developer',
  'Node.js Developer',
  'Laravel Developer',
  'Java Developer',
  'Python Developer',
  'Golang Developer',
  'Mobile Developer',
  'Flutter Developer',
  'Android Developer',
  'iOS Developer',
  'QA Engineer',
  'Automation Tester',
  'Data Analyst',
  'Data Scientist',
  'Data Engineer',
  'Machine Learning Engineer',
  'AI Engineer',
  'DevOps Engineer',
  'Cloud Engineer',
  'Cybersecurity Analyst',
  'Security Engineer',
  'UI/UX Designer',
  'Product Manager',
  'Business Analyst',
  'IT Support',
  'System Administrator',
  'Network Engineer',
  'Frontend Intern',
  'Backend Intern',
  'Data Analyst Intern',
  'QA Intern',
  'UI/UX Intern',
  'IT Intern',
  'Junior Developer',
  'Fresh Graduate Program',
] as const

// Tech stack keywords for classification
const TECH_STACK_KEYWORDS: Record<string, string[]> = {
  'JavaScript': ['javascript', 'js', 'ecmascript'],
  'TypeScript': ['typescript', 'ts'],
  'React': ['react', 'reactjs', 'react.js'],
  'Vue.js': ['vue', 'vuejs', 'vue.js', 'nuxt', 'nuxtjs'],
  'Angular': ['angular', 'angularjs', 'angular.js'],
  'Next.js': ['nextjs', 'next.js', 'next'],
  'Node.js': ['node', 'nodejs', 'node.js', 'express', 'expressjs'],
  'Python': ['python', 'django', 'flask', 'fastapi'],
  'Java': ['java', 'spring', 'springboot', 'spring boot'],
  'Go': ['golang', 'go lang', 'go programming'],
  'Rust': ['rust', 'rustlang'],
  'C++': ['c++', 'cpp'],
  'C#': ['c#', 'csharp', '.net', 'dotnet', 'asp.net'],
  'PHP': ['php', 'laravel', 'codeigniter', 'symfony'],
  'Ruby': ['ruby', 'ruby on rails', 'rails'],
  'Swift': ['swift', 'swiftui'],
  'Kotlin': ['kotlin'],
  'Flutter': ['flutter'],
  'React Native': ['react native'],
  'PostgreSQL': ['postgresql', 'postgres'],
  'MySQL': ['mysql', 'mariadb'],
  'MongoDB': ['mongodb', 'mongo'],
  'Redis': ['redis'],
  'Elasticsearch': ['elasticsearch', 'elastic'],
  'AWS': ['aws', 'amazon web services'],
  'Azure': ['azure', 'microsoft azure'],
  'GCP': ['gcp', 'google cloud', 'google cloud platform'],
  'Docker': ['docker', 'container', 'containerization'],
  'Kubernetes': ['kubernetes', 'k8s'],
  'CI/CD': ['ci/cd', 'jenkins', 'gitlab ci', 'github actions'],
  'GraphQL': ['graphql', 'apollo'],
  'REST API': ['rest', 'rest api', 'restful'],
  'TensorFlow': ['tensorflow', 'tf'],
  'PyTorch': ['pytorch'],
  'Machine Learning': ['machine learning', 'ml', 'mlops'],
  'Data Science': ['data science', 'data scientist'],
  'Figma': ['figma'],
  'UI/UX': ['ui/ux', 'ui design', 'ux design', 'user experience', 'user interface'],
}

// Level indicators
const LEVEL_KEYWORDS: Record<string, string[]> = {
  'intern': ['intern', 'internship', 'trainee', 'magang', 'pkl'],
  'freshgraduate': ['fresh graduate', 'new grad', 'new graduate', 'entry level', 'graduate'],
  'junior': ['junior', 'jr', 'entry level', 'entry-level', 'associate'],
  'mid': ['mid', 'middle', 'intermediate', '2+ years', '3+ years'],
  'senior': ['senior', 'sr', 'lead', 'principal', 'staff', '5+ years', '7+ years'],
}

// Work mode indicators
const WORK_MODE_KEYWORDS: Record<string, string[]> = {
  'remote': ['remote', 'work from home', 'wfh', 'anywhere', 'distributed', '100% remote'],
  'hybrid': ['hybrid', 'hybrid remote', 'partially remote', 'flexible'],
  'onsite': ['onsite', 'on-site', 'office', 'on site', 'location based'],
}

// Employment type indicators
const EMPLOYMENT_TYPE_KEYWORDS: Record<string, string[]> = {
  'internship': ['internship', 'intern', 'magang', 'trainee', 'student position'],
  'fulltime': ['full-time', 'full time', 'permanent', 'fulltime'],
  'parttime': ['part-time', 'part time', 'parttime'],
  'contract': ['contract', 'contractor', 'freelance', 'fixed-term'],
  'freelance': ['freelance', 'freelancer', 'independent contractor', 'gig'],
}

// Country scope indicators
const COUNTRY_SCOPE_KEYWORDS: Record<string, string[]> = {
  'indonesia': ['indonesia', 'jakarta', 'bandung', 'surabaya', 'yogyakarta', 'bali', 'tangerang', 'medan', 'makassar', 'indonesian'],
  'international': ['worldwide', 'global', 'anywhere', 'usa', 'uk', 'europe', 'singapore', 'malaysia', 'asia', 'us-based', 'uk-based'],
}

// Category keywords
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  'Frontend Development': ['frontend', 'front-end', 'front end', 'ui developer', 'web ui', 'css', 'html', 'react', 'vue', 'angular'],
  'Backend Development': ['backend', 'back-end', 'back end', 'api', 'server', 'database', 'node', 'python', 'java', 'golang'],
  'Fullstack Development': ['fullstack', 'full-stack', 'full stack', 'mern', 'mean', 'full stack developer'],
  'Mobile Development': ['mobile', 'ios', 'android', 'react native', 'flutter', 'swift', 'kotlin', 'app developer'],
  'Data & AI': ['data', 'machine learning', 'ai', 'artificial intelligence', 'data science', 'data analyst', 'data engineer', 'ml', 'deep learning', 'nlp'],
  'DevOps & Cloud': ['devops', 'dev ops', 'cloud', 'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'infrastructure', 'sre'],
  'Cybersecurity': ['security', 'cybersecurity', 'cyber security', 'penetration', 'ethical hacking', 'infosec'],
  'QA & Testing': ['qa', 'quality assurance', 'testing', 'test automation', 'automation testing', 'selenium', 'manual testing'],
  'UI/UX Design': ['ui/ux', 'ui design', 'ux design', 'user experience', 'user interface', 'figma', 'sketch', 'product designer'],
  'Product & Business': ['product manager', 'product owner', 'business analyst', 'product manager', 'scrum master'],
  'IT Support & Infrastructure': ['it support', 'helpdesk', 'system administrator', 'sysadmin', 'network engineer', 'it infrastructure'],
  'Software Development': ['software developer', 'software engineer', 'programmer', 'developer'],
  'Internship & Fresh Graduate': ['intern', 'internship', 'fresh graduate', 'new grad', 'trainee', 'magang'],
}

// Role keywords mapping to normalized roles
const ROLE_KEYWORDS: Record<string, string[]> = {
  'Frontend Developer': ['frontend developer', 'front end developer', 'front-end developer', 'ui developer', 'web ui developer'],
  'Backend Developer': ['backend developer', 'back end developer', 'back-end developer', 'api developer'],
  'Fullstack Developer': ['fullstack developer', 'full stack developer', 'full-stack developer', 'mern developer', 'mean developer'],
  'Software Engineer': ['software engineer', 'software developer', 'software programmer'],
  'Web Developer': ['web developer', 'web programmer', 'website developer'],
  'React Developer': ['react developer', 'reactjs developer', 'react.js developer'],
  'Next.js Developer': ['nextjs developer', 'next.js developer', 'next developer'],
  'Node.js Developer': ['nodejs developer', 'node.js developer', 'node developer'],
  'Laravel Developer': ['laravel developer', 'php developer', 'codeigniter developer'],
  'Java Developer': ['java developer', 'java engineer', 'jvm developer'],
  'Python Developer': ['python developer', 'python engineer', 'django developer', 'flask developer'],
  'Golang Developer': ['golang developer', 'go developer', 'go lang developer'],
  'Mobile Developer': ['mobile developer', 'mobile engineer', 'mobile app developer'],
  'Flutter Developer': ['flutter developer', 'flutter engineer'],
  'Android Developer': ['android developer', 'android engineer', 'android sdk'],
  'iOS Developer': ['ios developer', 'ios engineer', 'swift developer', 'swiftui developer'],
  'QA Engineer': ['qa engineer', 'quality assurance engineer', 'qa analyst'],
  'Automation Tester': ['automation tester', 'test automation', 'automation engineer', 'selenium'],
  'Data Analyst': ['data analyst', 'data analytics', 'analytics', 'bi analyst'],
  'Data Scientist': ['data scientist', 'data science', 'data science engineer'],
  'Data Engineer': ['data engineer', 'etl developer', 'data pipeline'],
  'Machine Learning Engineer': ['ml engineer', 'machine learning engineer', 'ml developer'],
  'AI Engineer': ['ai engineer', 'ai developer', 'artificial intelligence engineer', 'nlp engineer'],
  'DevOps Engineer': ['devops engineer', 'dev ops engineer', 'sre', 'site reliability engineer'],
  'Cloud Engineer': ['cloud engineer', 'cloud architect', 'aws engineer', 'azure engineer'],
  'Cybersecurity Analyst': ['cybersecurity analyst', 'security analyst', 'infoSec analyst'],
  'Security Engineer': ['security engineer', 'security specialist', 'appsec'],
  'UI/UX Designer': ['ui/ux designer', 'ui designer', 'ux designer', 'product designer', 'visual designer'],
  'Product Manager': ['product manager', 'pm', 'product owner'],
  'Business Analyst': ['business analyst', 'ba', 'business system analyst'],
  'IT Support': ['it support', 'it helpdesk', 'helpdesk', 'tech support'],
  'System Administrator': ['system administrator', 'sysadmin', 'systems administrator'],
  'Network Engineer': ['network engineer', 'network administrator', 'ccna'],
  'Frontend Intern': ['frontend intern', 'front end intern', 'ui intern'],
  'Backend Intern': ['backend intern', 'back end intern', 'server intern'],
  'Data Analyst Intern': ['data analyst intern', 'analytics intern'],
  'QA Intern': ['qa intern', 'testing intern', 'qc intern'],
  'UI/UX Intern': ['ui/ux intern', 'design intern', 'ux intern'],
  'IT Intern': ['it intern', 'tech intern', 'support intern'],
  'Junior Developer': ['junior developer', 'jr developer', 'jr. developer', 'entry level developer'],
  'Fresh Graduate Program': ['fresh graduate program', 'new grad program', 'graduate program', 'graduate trainee'],
}

// Red flag keywords that indicate suspicious or low-quality job postings
const RED_FLAG_KEYWORDS = [
  'no experience required high salary',
  'easy money',
  'work from home make money',
  'earn money fast',
  'investment required',
  'registration fee',
  'processing fee',
  'pyramid scheme',
  'mlm',
  'enrollment fee',
  'startup kit purchase',
  'unclear job description',
  'celebrity endorsement',
  'work whenever you want',
]

/**
 * Build the Gemini prompt for job classification
 */
function buildGeminiPrompt(job: JobPost): string {
  const categoriesList = JOB_CATEGORIES.join(', ')
  const rolesList = JOB_ROLES.join(', ')

  return `You are an AI job classification system. Analyze the following job posting and classify it according to the strict schema below.

IMPORTANT RULES:
1. NEVER create or invent job listings. Only classify jobs that exist from real sources.
2. Every job MUST have a valid applyUrl or sourceUrl - if missing, reject the job.
3. Use the exact JSON schema provided below.
4. If you cannot determine a value with confidence, use the most reasonable default.

## Job Information
- Title: ${job.title}
- Company: ${job.company}
- Location: ${job.location}
- Description: ${job.description.substring(0, 2000)}
- Required Skills: ${(job.requiredSkills || []).join(', ')}
- Tags: ${(job.tags || []).join(', ')}
- Apply URL: ${job.applyUrl || job.sourceUrl || 'MISSING - REJECT THIS JOB'}
- Source: ${job.sourceSlug}

## Classification Categories (use EXACT names)
${categoriesList}

## Role Options (use EXACT names from list)
${rolesList}

## Required JSON Output Schema
{
  "normalizedTitle": "string - Clean, standardized job title",
  "category": "string - ONE of the classification categories",
  "role": "string - ONE of the role options that best matches",
  "level": "intern | freshgraduate | junior | mid | senior",
  "workMode": "remote | hybrid | onsite | unknown",
  "employmentType": "internship | fulltime | parttime | contract | freelance",
  "countryScope": "indonesia | international",
  "techStacks": ["string - array of tech stacks found in the job"],
  "requirements": ["string - array of key requirements"],
  "summary": "string - Brief 2-3 sentence summary of the role",
  "isBeginnerFriendly": boolean,
  "isFreshGraduateFriendly": boolean,
  "matchScore": 0-100 - How beginner-friendly this role is (higher = more accessible)",
  "matchReason": "string - Why this match score was assigned",
  "skillGaps": ["string - skills likely missing from typical applicants"],
  "redFlags": ["string - any concerns about the posting"],
  "confidence": 0-100 - Your confidence in this analysis
}

Respond ONLY with valid JSON. No markdown, no explanation, no additional text.`
}

/**
 * Call Gemini API for job classification
 */
export async function analyzeJobWithGemini(job: JobPost): Promise<{
  result: JobClassificationResult | null
  error: string | null
  quotaExceeded: boolean
}> {
  if (!GEMINI_API_KEY) {
    return {
      result: null,
      error: 'Gemini API key not configured',
      quotaExceeded: false,
    }
  }

  // Reject jobs without valid source URLs
  if (!job.applyUrl && !job.sourceUrl) {
    return {
      result: null,
      error: 'Job rejected: No valid applyUrl or sourceUrl',
      quotaExceeded: false,
    }
  }

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: buildGeminiPrompt(job),
          }],
        }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 2048,
          topP: 0.8,
          topK: 40,
        },
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))

      // Check for quota exceeded error
      if (response.status === 429 || errorData?.error?.message?.includes('quota')) {
        return {
          result: null,
          error: 'Gemini quota exceeded',
          quotaExceeded: true,
        }
      }

      return {
        result: null,
        error: `Gemini API error: ${response.status}`,
        quotaExceeded: false,
      }
    }

    const data = await response.json()
    const generatedText = data?.candidates?.[0]?.content?.parts?.[0]?.text

    if (!generatedText) {
      return {
        result: null,
        error: 'No response from Gemini',
        quotaExceeded: false,
      }
    }

    // Parse the JSON response
    let parsedResult: JobClassificationResult
    try {
      // Remove any markdown formatting if present
      const cleanJson = generatedText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim()

      parsedResult = JSON.parse(cleanJson)
    } catch (parseError) {
      return {
        result: null,
        error: 'Failed to parse Gemini response',
        quotaExceeded: false,
      }
    }

    // Validate the result has required fields
    if (!parsedResult.normalizedTitle || !parsedResult.category || !parsedResult.role) {
      return {
        result: null,
        error: 'Invalid Gemini response structure',
        quotaExceeded: false,
      }
    }

    // Ensure confidence is set
    parsedResult.confidence = Math.max(0, Math.min(100, parsedResult.confidence || 50))

    return {
      result: parsedResult,
      error: null,
      quotaExceeded: false,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return {
      result: null,
      error: `Gemini request failed: ${message}`,
      quotaExceeded: false,
    }
  }
}

/**
 * Keyword-based classification fallback
 * Used when Gemini fails or quota is exceeded
 */
export function classifyJobWithKeywords(job: JobPost): {
  result: Partial<JobClassificationResult>
  confidence: number
} {
  const text = `${job.title} ${job.company} ${job.location} ${job.description} ${(job.tags || []).join(' ')} ${(job.requiredSkills || []).join(' ')}`.toLowerCase()

  // Classify level
  let level: JobClassificationResult['level'] = 'junior'
  let levelConfidence = 50

  for (const [lvl, keywords] of Object.entries(LEVEL_KEYWORDS)) {
    const matches = keywords.filter(kw => text.includes(kw)).length
    if (matches > levelConfidence / 20) {
      level = lvl as JobClassificationResult['level']
      levelConfidence = Math.min(80, 50 + matches * 10)
    }
  }

  // Classify work mode
  let workMode: JobClassificationResult['workMode'] = 'unknown'
  for (const [mode, keywords] of Object.entries(WORK_MODE_KEYWORDS)) {
    if (keywords.some(kw => text.includes(kw))) {
      workMode = mode as JobClassificationResult['workMode']
      break
    }
  }
  if (workMode === 'unknown' && job.workMode) {
    workMode = job.workMode === 'remote' ? 'remote' :
                job.workMode === 'hybrid' ? 'hybrid' :
                job.workMode === 'onsite' ? 'onsite' : 'unknown'
  }

  // Classify employment type
  let employmentType: JobClassificationResult['employmentType'] = 'fulltime'
  for (const [type, keywords] of Object.entries(EMPLOYMENT_TYPE_KEYWORDS)) {
    if (keywords.some(kw => text.includes(kw))) {
      employmentType = type as JobClassificationResult['employmentType']
      break
    }
  }

  // Classify country scope
  let countryScope: JobClassificationResult['countryScope'] = 'international'
  for (const [scope, keywords] of Object.entries(COUNTRY_SCOPE_KEYWORDS)) {
    if (keywords.some(kw => text.includes(kw))) {
      countryScope = scope as JobClassificationResult['countryScope']
      break
    }
  }

  // Classify category
  let category = 'Software Development'
  let categoryScore = 0
  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    const matches = keywords.filter(kw => text.includes(kw)).length
    if (matches > categoryScore) {
      category = cat
      categoryScore = matches
    }
  }

  // Classify role
  let role = 'Software Engineer'
  let roleScore = 0
  for (const [r, keywords] of Object.entries(ROLE_KEYWORDS)) {
    const matches = keywords.filter(kw => text.includes(kw)).length
    if (matches > roleScore) {
      role = r
      roleScore = matches
    }
  }

  // Extract tech stacks
  const techStacks: string[] = []
  for (const [tech, keywords] of Object.entries(TECH_STACK_KEYWORDS)) {
    if (keywords.some(kw => text.includes(kw))) {
      techStacks.push(tech)
    }
  }

  // Check for beginner friendly indicators
  const beginnerFriendly = level === 'intern' || level === 'freshgraduate' || level === 'junior' ||
    text.includes('no experience') || text.includes('fresh graduate') || text.includes('beginner')

  const freshGraduateFriendly = level === 'freshgraduate' || level === 'junior' ||
    text.includes('fresh graduate') || text.includes('new grad') || text.includes('entry level')

  // Calculate match score (lower confidence because no AI analysis)
  let matchScore = 50
  if (beginnerFriendly) matchScore += 20
  if (freshGraduateFriendly) matchScore += 15
  if (techStacks.length <= 3) matchScore += 10
  if (!techStacks.includes('Kubernetes') && !techStacks.includes('Docker')) matchScore += 5
  matchScore = Math.min(100, matchScore)

  // Check for red flags
  const redFlags: string[] = []
  for (const flag of RED_FLAG_KEYWORDS) {
    if (text.includes(flag)) {
      redFlags.push(flag)
    }
  }

  // Calculate overall confidence (keyword-based is less confident)
  const confidence = Math.min(60, 30 + categoryScore * 5 + roleScore * 5)

  return {
    result: {
      normalizedTitle: job.title,
      category,
      role,
      level,
      workMode,
      employmentType,
      countryScope,
      techStacks,
      requirements: job.requiredSkills || [],
      summary: job.description.substring(0, 300),
      isBeginnerFriendly: beginnerFriendly,
      isFreshGraduateFriendly: freshGraduateFriendly,
      matchScore,
      matchReason: `Keyword analysis: This role is classified as ${level} level ${role} in ${category}. ${beginnerFriendly ? 'Suitable for beginners.' : 'May require some experience.'}`,
      skillGaps: [],
      redFlags,
      confidence,
    },
    confidence,
  }
}

/**
 * Full classification pipeline: Try Gemini first, fallback to keywords
 */
export async function classifyJob(job: JobPost): Promise<{
  primary: JobClassificationResult
  isFallback: boolean
  error: string | null
}> {
  // Try Gemini first
  const geminiResult = await analyzeJobWithGemini(job)

  if (geminiResult.result && geminiResult.result.confidence >= 70) {
    return {
      primary: geminiResult.result,
      isFallback: false,
      error: null,
    }
  }

  // Fallback to keyword-based classification
  const fallbackResult = classifyJobWithKeywords(job)

  return {
    primary: fallbackResult.result as JobClassificationResult,
    isFallback: true,
    error: geminiResult.error,
  }
}
