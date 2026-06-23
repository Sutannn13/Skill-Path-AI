import { TargetRole } from '@/types'
import { ExperienceLevel } from '@/lib/constants/experience'
import { CvLink } from './links'

export type { CvLink, CvLinkType } from './links'

// Result verdict. Mirrors the user-facing buckets: safe to apply, needs
// revision first, or not ready yet.
export type CvVerdict = 'aman' | 'perlu-revisi' | 'belum-siap'

export type CvIssueSeverity = 'high' | 'medium' | 'low'
export type CvSectionStatus = 'good' | 'warning' | 'missing'

export interface CvSectionFinding {
  // Canonical section name (e.g. "Kontak", "Pengalaman", "Skill").
  name: string
  present: boolean
  status: CvSectionStatus
  feedback: string
}

export interface CvIssue {
  severity: CvIssueSeverity
  title: string
  detail: string
  // A concrete, actionable fix the candidate can apply.
  fix: string
}

export interface CvRoleMatch {
  role: TargetRole
  roleLabel: string
  experienceLevel: ExperienceLevel
  experienceLevelLabel: string
  // 0-100: how well the CV's keyword coverage matches the target role.
  score: number
  matchedKeywords: string[]
  missingKeywords: string[]
}

export interface CvAtsCheck {
  // 0-100: machine-readability for applicant tracking systems.
  score: number
  issues: string[]
}

export interface CvAnalysis {
  overallScore: number
  verdict: CvVerdict
  verdictLabel: string
  summary: string
  roleMatch: CvRoleMatch
  ats: CvAtsCheck
  sections: CvSectionFinding[]
  strengths: string[]
  issues: CvIssue[]
  // Ordered list of concrete revision instructions ("ganti X jadi Y").
  revisions: string[]
  // Hyperlinks recovered from the CV (annotations + bare URLs), classified.
  links: CvLink[]
  source: 'ai' | 'fallback'
}

export interface CvAnalysisResponse {
  analysis: CvAnalysis
  // Returned so the client can call /improve and /cover-letter without forcing
  // the user to re-upload the file.
  extracted: {
    text: string
    links: CvLink[]
  }
  meta: {
    fileName: string
    fileType: string
    targetRole: TargetRole
    experienceLevel: ExperienceLevel
    wordCount: number
    analyzedAt: string
    source: 'ai' | 'fallback'
  }
}

// --- Improved CV draft -----------------------------------------------------

export interface CvDraftContact {
  email?: string
  phone?: string
  location?: string
}

export interface CvDraftLink {
  label: string
  url: string
}

export interface CvDraftExperience {
  role: string
  company: string
  period?: string
  location?: string
  bullets: string[]
}

export interface CvDraftEducation {
  degree: string
  institution: string
  period?: string
  detail?: string
}

export interface CvDraftSkillGroup {
  category: string
  items: string[]
}

export interface CvDraftProject {
  name: string
  // Optional tech stack line, e.g. "(Laravel 12)".
  stack?: string
  description: string
  link?: string
  bullets?: string[]
}

export interface CvDraftLanguage {
  name: string
  level: string
}

export interface CvDraft {
  fullName: string
  headline: string
  contact: CvDraftContact
  links: CvDraftLink[]
  summary: string
  experience: CvDraftExperience[]
  education: CvDraftEducation[]
  // Grouped skills, e.g. "Tech Stack" and "Tools & Services" — mirrors the
  // ATS layout where skills are split into named groups.
  skills: CvDraftSkillGroup[]
  projects: CvDraftProject[]
  certifications: string[]
  languages: CvDraftLanguage[]
  publications: string[]
  // Notes shown to the user about what was improved / what they must verify.
  improvementNotes: string[]
  source: 'ai' | 'fallback'
}

export interface CvImproveResponse {
  draft: CvDraft
  meta: {
    targetRole: TargetRole
    experienceLevel: ExperienceLevel
    generatedAt: string
    source: 'ai' | 'fallback'
  }
}

// --- Cover letter ----------------------------------------------------------

export interface CoverLetter {
  // Sender block (the applicant), grounded in the CV.
  senderName: string
  senderContact: string
  // Recipient block lines (e.g. ["Tim Rekrutmen Gojek", "Gojek"]).
  recipientLines: string[]
  greeting: string
  paragraphs: string[]
  closing: string
  signature: string
  source: 'ai' | 'fallback'
}

export interface CoverLetterResponse {
  coverLetter: CoverLetter
  meta: {
    targetRole: TargetRole
    experienceLevel: ExperienceLevel
    company: string | null
    position: string | null
    generatedAt: string
    source: 'ai' | 'fallback'
  }
}
