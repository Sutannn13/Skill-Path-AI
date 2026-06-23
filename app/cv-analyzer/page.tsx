'use client'

import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { AppShell, Container, GradientBackground } from '@/components/layout'
import { DashboardHeader } from '@/components/layout/dashboard-header'
import { BrutalCard, BrutalButton, ScoreMeter, StickerBadge } from '@/components/brutal'
import { PageScene } from '@/components/illustrations/page-scene'
import { TARGET_ROLES } from '@/lib/constants/roles'
import { EXPERIENCE_LEVELS } from '@/lib/constants/experience'
import { TargetRole } from '@/types'
import { ExperienceLevel } from '@/lib/constants/experience'
import { CvAnalysis, CvAnalysisResponse, CvDraft, CvImproveResponse, CvLink } from '@/lib/cv/types'
import { ImprovedCvView } from '@/components/cv/improved-cv-view'
import { CoverLetterView } from '@/components/cv/cover-letter-view'
import {
  ScanLine,
  UploadCloud,
  FileText,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Loader2,
  Sparkles,
  ClipboardList,
  ShieldCheck,
  Link2,
  Github,
  Linkedin,
  Globe,
  Wand2,
} from 'lucide-react'

const MAX_BYTES = 5 * 1024 * 1024

const VERDICT_STYLES: Record<
  CvAnalysis['verdict'],
  { card: 'green' | 'yellow' | 'red'; icon: typeof CheckCircle2 }
> = {
  aman: { card: 'green', icon: CheckCircle2 },
  'perlu-revisi': { card: 'yellow', icon: AlertTriangle },
  'belum-siap': { card: 'red', icon: XCircle },
}

const SEVERITY_STYLES: Record<
  'high' | 'medium' | 'low',
  { label: string; badge: string }
> = {
  high: { label: 'Penting', badge: 'bg-red text-white' },
  medium: { label: 'Sedang', badge: 'bg-orange text-black' },
  low: { label: 'Ringan', badge: 'bg-yellow text-black' },
}

const SECTION_ICON = {
  good: CheckCircle2,
  warning: AlertTriangle,
  missing: XCircle,
} as const

const SECTION_COLOR = {
  good: 'text-green',
  warning: 'text-orange',
  missing: 'text-red',
} as const

const LINK_ICON: Record<CvLink['type'], typeof Github> = {
  github: Github,
  linkedin: Linkedin,
  portfolio: Globe,
  social: Link2,
  email: FileText,
  other: Link2,
}

const LINK_LABEL: Record<CvLink['type'], string> = {
  github: 'GitHub',
  linkedin: 'LinkedIn',
  portfolio: 'Portfolio',
  social: 'Sosial',
  email: 'Email',
  other: 'Tautan',
}

export default function CvAnalyzerPage() {
  const [file, setFile] = useState<File | null>(null)
  const [targetRole, setTargetRole] = useState<TargetRole>('frontend-developer')
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>('entry')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<CvAnalysis | null>(null)
  const [source, setSource] = useState<'ai' | 'fallback' | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Extracted CV body + links, reused by improve + cover letter without re-upload.
  const [cvText, setCvText] = useState<string>('')
  const [cvLinks, setCvLinks] = useState<CvLink[]>([])
  const [analyzedRole, setAnalyzedRole] = useState<TargetRole>('frontend-developer')
  const [analyzedLevel, setAnalyzedLevel] = useState<ExperienceLevel>('entry')

  // Improved CV state.
  const [draft, setDraft] = useState<CvDraft | null>(null)
  const [isImproving, setIsImproving] = useState(false)
  const [improveError, setImproveError] = useState<string | null>(null)
  const [showCoverLetter, setShowCoverLetter] = useState(false)

  const pickFile = (selected: File | null) => {
    setError(null)
    if (!selected) return
    if (selected.size > MAX_BYTES) {
      setError('Ukuran file melebihi 5 MB. Kompres atau ekspor ulang CV Anda.')
      return
    }
    setFile(selected)
  }

  const analyze = async () => {
    if (!file) {
      setError('Pilih file CV terlebih dahulu (PDF, DOCX, atau TXT).')
      return
    }

    setIsAnalyzing(true)
    setError(null)
    setAnalysis(null)
    setSource(null)
    // Reset downstream artifacts tied to the previous CV.
    setDraft(null)
    setImproveError(null)
    setShowCoverLetter(false)
    setCvText('')
    setCvLinks([])

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('targetRole', targetRole)
      formData.append('experienceLevel', experienceLevel)

      const response = await fetch('/api/cv/analyze', { method: 'POST', body: formData })
      const data = (await response.json().catch(() => null)) as CvAnalysisResponse | { message?: string; error?: string } | null

      if (!response.ok || !data || !('analysis' in data)) {
        const message =
          (data && 'message' in data && data.message) ||
          (data && 'error' in data && data.error) ||
          'Gagal menganalisis CV. Silakan coba lagi.'
        throw new Error(message)
      }

      setAnalysis(data.analysis)
      setSource(data.meta.source)
      setCvText(data.extracted.text)
      setCvLinks(data.extracted.links)
      setAnalyzedRole(data.meta.targetRole)
      setAnalyzedLevel(data.meta.experienceLevel)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Gagal menganalisis CV. Silakan coba lagi.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const improveCv = async () => {
    if (!cvText) return
    setIsImproving(true)
    setImproveError(null)
    setDraft(null)
    try {
      const response = await fetch('/api/cv/improve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: cvText,
          targetRole: analyzedRole,
          experienceLevel: analyzedLevel,
          links: cvLinks,
          issues: analysis?.issues.map((i) => i.title) ?? [],
        }),
      })
      const data = (await response.json().catch(() => null)) as CvImproveResponse | { message?: string } | null
      if (!response.ok || !data || !('draft' in data)) {
        throw new Error((data && 'message' in data && data.message) || 'Gagal menyusun ulang CV.')
      }
      setDraft(data.draft)
    } catch (e) {
      setImproveError(e instanceof Error ? e.message : 'Gagal menyusun ulang CV.')
    } finally {
      setIsImproving(false)
    }
  }

  const verdictStyle = analysis ? VERDICT_STYLES[analysis.verdict] : null
  const VerdictIcon = verdictStyle?.icon ?? CheckCircle2

  return (
    <AppShell showBottomNav={true}>
      <GradientBackground />

      <div className="flex-1">
        <DashboardHeader
          icon={ScanLine}
          iconColor="pink"
          title="CV Analyzer"
          subtitle="Audit CV-mu dengan AI sebelum melamar"
        />

        <Container className="py-6">
          <PageScene variant="github" className="mb-6" />

          {/* Upload + config */}
          <BrutalCard color="black" className="mb-6">
            <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
              {/* Dropzone */}
              <div>
                <label className="mb-2 block font-bold text-white">Unggah CV</label>
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => fileInputRef.current?.click()}
                  onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && fileInputRef.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault()
                    setIsDragging(true)
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault()
                    setIsDragging(false)
                    pickFile(e.dataTransfer.files?.[0] ?? null)
                  }}
                  className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-[var(--brutal-radius,12px)] border-3 border-dashed bg-white px-6 py-10 text-center transition-colors ${
                    isDragging ? 'border-pink bg-pink/10' : 'border-black'
                  }`}
                >
                  {file ? (
                    <>
                      <FileText className="h-10 w-10 text-pink" />
                      <p className="font-bold text-black">{file.name}</p>
                      <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(0)} KB - klik untuk ganti</p>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="h-10 w-10 text-gray-400" />
                      <p className="font-bold text-black">Tarik &amp; letakkan file di sini</p>
                      <p className="text-sm text-gray-500">atau klik untuk memilih - PDF, DOCX, TXT (maks 5 MB)</p>
                    </>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.docx,.txt,.md,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                    className="hidden"
                    onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
                  />
                </div>
              </div>

              {/* Role + level */}
              <div className="flex flex-col gap-4">
                <div>
                  <label htmlFor="cv-role" className="mb-2 block font-bold text-white">
                    Role tujuan
                  </label>
                  <select
                    id="cv-role"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value as TargetRole)}
                    className="w-full brutal-border brutal-radius bg-white px-4 py-3 font-medium text-black"
                  >
                    {TARGET_ROLES.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="cv-level" className="mb-2 block font-bold text-white">
                    Level pengalaman
                  </label>
                  <select
                    id="cv-level"
                    value={experienceLevel}
                    onChange={(e) => setExperienceLevel(e.target.value as ExperienceLevel)}
                    className="w-full brutal-border brutal-radius bg-white px-4 py-3 font-medium text-black"
                  >
                    {EXPERIENCE_LEVELS.map((level) => (
                      <option key={level.id} value={level.id}>
                        {level.label}
                      </option>
                    ))}
                  </select>
                </div>
                <BrutalButton
                  color="pink"
                  onClick={analyze}
                  loading={isAnalyzing}
                  disabled={isAnalyzing}
                  className="mt-auto w-full"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Menganalisis...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Audit CV Sekarang
                    </>
                  )}
                </BrutalButton>
              </div>
            </div>
          </BrutalCard>

          {/* Error */}
          {error && (
            <BrutalCard color="red" className="mb-6 flex items-start gap-3">
              <AlertCircle className="h-6 w-6 shrink-0" />
              <p className="font-medium">{error}</p>
            </BrutalCard>
          )}

          {/* Results */}
          {analysis && verdictStyle && (
            <div className="space-y-6">
              {/* Verdict banner */}
              <BrutalCard color={verdictStyle.card}>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-4">
                    <VerdictIcon className="h-12 w-12 shrink-0" />
                    <div>
                      <div className="mb-1 flex flex-wrap items-center gap-2">
                        <h2 className="font-display text-2xl font-bold">{analysis.verdictLabel}</h2>
                        <StickerBadge
                          variant={source === 'ai' ? 'green' : 'yellow'}
                          label={source === 'ai' ? 'AI Audit' : 'Heuristic Audit'}
                          size="sm"
                        />
                      </div>
                      <p className="max-w-2xl text-sm font-medium text-black/80">{analysis.summary}</p>
                    </div>
                  </div>
                  <div className="shrink-0">
                    <ScoreMeter score={analysis.overallScore} label="Skor CV" size="lg" />
                  </div>
                </div>
              </BrutalCard>

              {/* Score tiles */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <BrutalCard color="blue" className="text-center">
                  <p className="text-4xl font-bold">{analysis.roleMatch.score}%</p>
                  <p className="mt-1 text-sm text-black/70">Cocok untuk {analysis.roleMatch.roleLabel}</p>
                  <p className="text-xs text-black/60">{analysis.roleMatch.experienceLevelLabel}</p>
                </BrutalCard>
                <BrutalCard color="purple" className="text-center">
                  <p className="text-4xl font-bold">{analysis.ats.score}%</p>
                  <p className="mt-1 text-sm text-black/70">Skor ATS</p>
                  <p className="text-xs text-black/60">Keterbacaan oleh sistem</p>
                </BrutalCard>
                <BrutalCard color="orange" className="text-center">
                  <p className="text-4xl font-bold">{analysis.issues.length}</p>
                  <p className="mt-1 text-sm text-black/70">Hal yang ditemukan</p>
                  <p className="text-xs text-black/60">
                    {analysis.issues.filter((i) => i.severity === 'high').length} penting
                  </p>
                </BrutalCard>
              </div>

              {/* Role keyword coverage */}
              <BrutalCard color="white">
                <h3 className="mb-3 flex items-center gap-2 font-display text-lg font-bold">
                  <ShieldCheck className="h-5 w-5 text-green" />
                  Kecocokan Skill dengan Role
                </h3>
                {analysis.roleMatch.matchedKeywords.length > 0 && (
                  <div className="mb-3">
                    <p className="mb-2 text-sm font-bold text-green">Terdeteksi di CV</p>
                    <div className="flex flex-wrap gap-2">
                      {analysis.roleMatch.matchedKeywords.map((kw) => (
                        <span key={kw} className="brutal-radius border-2 border-black bg-green/20 px-2 py-1 text-xs font-medium">
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {analysis.roleMatch.missingKeywords.length > 0 && (
                  <div>
                    <p className="mb-2 text-sm font-bold text-red">Belum disebut (pertimbangkan ditambah)</p>
                    <div className="flex flex-wrap gap-2">
                      {analysis.roleMatch.missingKeywords.map((kw) => (
                        <span key={kw} className="brutal-radius border-2 border-dashed border-black bg-red/10 px-2 py-1 text-xs font-medium">
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </BrutalCard>

              {/* Detected hyperlinks */}
              <BrutalCard color="white">
                <h3 className="mb-3 flex items-center gap-2 font-display text-lg font-bold">
                  <Link2 className="h-5 w-5 text-blue" />
                  Tautan Terdeteksi
                </h3>
                {analysis.links.filter((l) => l.type !== 'email').length > 0 ? (
                  <div className="flex flex-col gap-2">
                    {analysis.links
                      .filter((l) => l.type !== 'email')
                      .map((link) => {
                        const Icon = LINK_ICON[link.type]
                        return (
                          <a
                            key={link.url}
                            href={link.url}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-3 brutal-border brutal-radius bg-cream-light p-3 transition-colors hover:bg-blue/10"
                          >
                            <Icon className="h-5 w-5 shrink-0 text-black/70" />
                            <span className="shrink-0 brutal-radius border-2 border-black bg-blue/20 px-2 py-0.5 text-xs font-bold">
                              {LINK_LABEL[link.type]}
                            </span>
                            <span className="truncate text-sm font-medium text-blue underline">{link.url}</span>
                          </a>
                        )
                      })}
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">
                    Tidak ada tautan yang bisa diklik (GitHub/portfolio/LinkedIn) terdeteksi. Tambahkan link asli (bukan
                    sekadar teks) agar rekruter dan ATS bisa membukanya.
                  </p>
                )}
              </BrutalCard>

              {/* Action bar: improve + cover letter */}
              <BrutalCard color="black">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="text-white">
                    <h3 className="font-display text-lg font-bold">Tingkatkan lebih jauh</h3>
                    <p className="text-sm text-white/70">
                      Biarkan AI menyusun ulang CV jadi lebih rapi (format ATS) dan membuat cover letter yang sesuai.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <BrutalButton color="pink" onClick={improveCv} loading={isImproving} disabled={isImproving}>
                      <Wand2 className="mr-2 h-4 w-4" />
                      {draft ? 'Susun ulang lagi' : 'Perbaiki CV'}
                    </BrutalButton>
                    <BrutalButton
                      color="purple"
                      variant={showCoverLetter ? 'outline' : 'primary'}
                      onClick={() => setShowCoverLetter((v) => !v)}
                    >
                      <Sparkles className="mr-2 h-4 w-4" />
                      {showCoverLetter ? 'Sembunyikan cover letter' : 'Buat Cover Letter'}
                    </BrutalButton>
                  </div>
                </div>
              </BrutalCard>

              {improveError && (
                <BrutalCard color="red" className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <p className="font-medium">{improveError}</p>
                </BrutalCard>
              )}

              {draft && <ImprovedCvView draft={draft} />}

              {showCoverLetter && cvText && (
                <CoverLetterView cvText={cvText} targetRole={analyzedRole} experienceLevel={analyzedLevel} />
              )}

              {/* Sections checklist */}
              <BrutalCard color="white">
                <h3 className="mb-4 flex items-center gap-2 font-display text-lg font-bold">
                  <ClipboardList className="h-5 w-5" />
                  Kelengkapan Bagian CV
                </h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {analysis.sections.map((section) => {
                    const Icon = SECTION_ICON[section.status]
                    return (
                      <div key={section.name} className="flex items-start gap-3 brutal-border brutal-radius bg-cream-light p-3">
                        <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${SECTION_COLOR[section.status]}`} />
                        <div>
                          <p className="font-bold">{section.name}</p>
                          <p className="text-sm text-gray-600">{section.feedback}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </BrutalCard>

              {/* Strengths */}
              {analysis.strengths.length > 0 && (
                <BrutalCard color="green">
                  <h3 className="mb-3 font-display text-lg font-bold">Yang sudah bagus</h3>
                  <ul className="space-y-2">
                    {analysis.strengths.map((strength, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
                        <span className="font-medium text-black/80">{strength}</span>
                      </li>
                    ))}
                  </ul>
                </BrutalCard>
              )}

              {/* Issues */}
              {analysis.issues.length > 0 && (
                <div>
                  <h3 className="mb-4 font-display text-xl font-bold">Temuan &amp; Perbaikan</h3>
                  <div className="space-y-4">
                    {analysis.issues.map((issue, i) => (
                      <motion.div key={i} initial={false} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                        <BrutalCard color="white">
                          <div className="mb-2 flex flex-wrap items-center gap-2">
                            <span className={`brutal-radius px-2 py-0.5 text-xs font-bold ${SEVERITY_STYLES[issue.severity].badge}`}>
                              {SEVERITY_STYLES[issue.severity].label}
                            </span>
                            <h4 className="font-bold">{issue.title}</h4>
                          </div>
                          <p className="mb-2 text-sm text-gray-700">{issue.detail}</p>
                          <div className="flex items-start gap-2 brutal-border brutal-radius bg-yellow/20 p-3">
                            <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-orange" />
                            <p className="text-sm font-medium">{issue.fix}</p>
                          </div>
                        </BrutalCard>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Revisions checklist */}
              {analysis.revisions.length > 0 && (
                <BrutalCard color="pink">
                  <h3 className="mb-4 font-display text-lg font-bold">Checklist Revisi (urut prioritas)</h3>
                  <ol className="space-y-2">
                    {analysis.revisions.map((rev, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center brutal-border brutal-radius bg-black text-sm font-bold text-white">
                          {i + 1}
                        </span>
                        <span className="font-medium">{rev}</span>
                      </li>
                    ))}
                  </ol>
                </BrutalCard>
              )}

              {source === 'fallback' && (
                <BrutalCard color="gray" className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <p className="text-sm">
                    Audit ini dihasilkan oleh mesin heuristik bawaan (layanan AI sedang tidak tersedia). Hasil tetap valid,
                    namun penilaian AI lengkap akan lebih mendetail saat layanan kembali aktif.
                  </p>
                </BrutalCard>
              )}
            </div>
          )}

          {/* Empty state */}
          {!analysis && !error && !isAnalyzing && (
            <BrutalCard color="gray" className="py-16 text-center">
              <ScanLine className="mx-auto mb-4 h-20 w-20 text-gray-300" />
              <h3 className="mb-2 font-display text-2xl font-bold">Audit CV-mu sebelum melamar</h3>
              <p className="mx-auto max-w-md text-gray-600">
                Unggah CV (PDF/DOCX/TXT), pilih role dan level tujuan, lalu AI akan memeriksa kelengkapan, kecocokan skill,
                keterbacaan ATS, dan memberi daftar revisi yang konkret.
              </p>
            </BrutalCard>
          )}
        </Container>
      </div>
    </AppShell>
  )
}
