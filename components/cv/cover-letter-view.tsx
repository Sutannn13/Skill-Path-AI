'use client'

import { useState } from 'react'
import { BrutalCard, BrutalButton, StickerBadge } from '@/components/brutal'
import type { TargetRole } from '@/types'
import type { ExperienceLevel } from '@/lib/constants/experience'
import type { CoverLetter, CoverLetterResponse } from '@/lib/cv/types'
import {
  coverLetterToPlainText,
  downloadText,
  downloadCoverLetterAsPdf,
  formatIdDate,
} from '@/lib/cv/export'
import {
  Mail,
  Download,
  FileText,
  Copy,
  Check,
  Sparkles,
  Loader2,
  AlertCircle,
} from 'lucide-react'

interface CoverLetterViewProps {
  cvText: string
  targetRole: TargetRole
  experienceLevel: ExperienceLevel
}

export function CoverLetterView({ cvText, targetRole, experienceLevel }: CoverLetterViewProps) {
  const [company, setCompany] = useState('')
  const [position, setPosition] = useState('')
  const [letter, setLetter] = useState<CoverLetter | null>(null)
  const [loading, setLoading] = useState(false)
  const [busyPdf, setBusyPdf] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generate = async () => {
    setLoading(true)
    setError(null)
    setLetter(null)
    try {
      const response = await fetch('/api/cv/cover-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: cvText,
          targetRole,
          experienceLevel,
          company: company.trim() || undefined,
          position: position.trim() || undefined,
        }),
      })
      const data = (await response.json().catch(() => null)) as CoverLetterResponse | { message?: string } | null
      if (!response.ok || !data || !('coverLetter' in data)) {
        throw new Error((data && 'message' in data && data.message) || 'Gagal membuat cover letter.')
      }
      setLetter(data.coverLetter)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal membuat cover letter.')
    } finally {
      setLoading(false)
    }
  }

  const copyText = async () => {
    if (!letter) return
    try {
      await navigator.clipboard.writeText(coverLetterToPlainText(letter))
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      /* ignore */
    }
  }

  const downloadPdf = async () => {
    if (!letter) return
    setBusyPdf(true)
    try {
      await downloadCoverLetterAsPdf(letter, `cover_letter_${company.trim() || targetRole}`)
    } finally {
      setBusyPdf(false)
    }
  }

  return (
    <BrutalCard color="white" className="space-y-4">
      <h3 className="flex items-center gap-2 font-display text-xl font-bold">
        <Mail className="h-5 w-5 text-purple" />
        Cover Letter Digital
        {letter && (
          <StickerBadge
            variant={letter.source === 'ai' ? 'green' : 'yellow'}
            label={letter.source === 'ai' ? 'AI' : 'Template'}
            size="sm"
          />
        )}
      </h3>
      <p className="text-sm text-black/70">
        Isi nama perusahaan dan posisi (opsional) agar surat lebih tertarget. Dibuat berdasarkan isi CV Anda.
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="cl-company" className="mb-1 block text-sm font-bold">
            Nama perusahaan
          </label>
          <input
            id="cl-company"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="mis. Tokopedia"
            className="w-full brutal-border brutal-radius bg-white px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label htmlFor="cl-position" className="mb-1 block text-sm font-bold">
            Posisi yang dilamar
          </label>
          <input
            id="cl-position"
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            placeholder="mis. Backend Developer"
            className="w-full brutal-border brutal-radius bg-white px-3 py-2 text-sm"
          />
        </div>
      </div>

      <BrutalButton color="purple" onClick={generate} loading={loading} disabled={loading} className="w-full sm:w-auto">
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Menyusun surat...
          </>
        ) : (
          <>
            <Sparkles className="mr-2 h-4 w-4" />
            {letter ? 'Buat ulang' : 'Buat cover letter'}
          </>
        )}
      </BrutalButton>

      {error && (
        <div className="flex items-start gap-2 brutal-border brutal-radius bg-red/10 p-3">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {letter && (
        <div className="space-y-3">
          <div className="flex flex-wrap justify-end gap-2">
            <BrutalButton color="white" variant="outline" size="sm" onClick={copyText}>
              {copied ? <Check className="mr-1 h-4 w-4" /> : <Copy className="mr-1 h-4 w-4" />}
              {copied ? 'Tersalin' : 'Salin'}
            </BrutalButton>
            <BrutalButton
              color="blue"
              size="sm"
              onClick={() => downloadText(coverLetterToPlainText(letter), 'cover_letter.txt')}
            >
              <FileText className="mr-1 h-4 w-4" />
              .txt
            </BrutalButton>
            <BrutalButton color="purple" size="sm" onClick={downloadPdf} loading={busyPdf} disabled={busyPdf}>
              <Download className="mr-1 h-4 w-4" />
              Download PDF
            </BrutalButton>
          </div>

          <div className="brutal-border brutal-radius space-y-3 bg-cream-light p-5 leading-relaxed">
            <div>
              <p className="font-bold">{letter.senderName}</p>
              {letter.senderContact && <p className="text-xs text-black/70">{letter.senderContact}</p>}
            </div>
            <p className="text-sm text-black/70">{formatIdDate()}</p>
            <div>
              {letter.recipientLines.map((r, i) => (
                <p key={i} className="text-sm font-medium">
                  {r}
                </p>
              ))}
            </div>
            <p className="font-medium">{letter.greeting}</p>
            {letter.paragraphs.map((para, i) => (
              <p key={i} className="text-sm text-black/85">
                {para}
              </p>
            ))}
            <div className="pt-2">
              <p className="text-sm">{letter.closing}</p>
              <p className="mt-6 font-bold">{letter.signature}</p>
            </div>
          </div>
        </div>
      )}
    </BrutalCard>
  )
}
