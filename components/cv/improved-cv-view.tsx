'use client'

import { useState } from 'react'
import { BrutalCard, BrutalButton, StickerBadge } from '@/components/brutal'
import type { CvDraft } from '@/lib/cv/types'
import {
  draftToPlainText,
  downloadText,
  downloadDraftAsPdf,
  safeFileBase,
  CV_SECTION_LABELS,
} from '@/lib/cv/export'
import { Download, FileText, Copy, Check, Sparkles, Lightbulb } from 'lucide-react'

interface ImprovedCvViewProps {
  draft: CvDraft
}

export function ImprovedCvView({ draft }: ImprovedCvViewProps) {
  const [copied, setCopied] = useState(false)
  const [busy, setBusy] = useState(false)

  const copyText = async () => {
    try {
      await navigator.clipboard.writeText(draftToPlainText(draft))
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      /* clipboard blocked; ignore */
    }
  }

  const downloadPdf = async () => {
    setBusy(true)
    try {
      await downloadDraftAsPdf(draft)
    } finally {
      setBusy(false)
    }
  }

  return (
    <BrutalCard color="white" className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 font-display text-xl font-bold">
          <Sparkles className="h-5 w-5 text-pink" />
          CV Versi Perbaikan
          <StickerBadge
            variant={draft.source === 'ai' ? 'green' : 'yellow'}
            label={draft.source === 'ai' ? 'AI' : 'Auto'}
            size="sm"
          />
        </h3>
        <div className="flex flex-wrap gap-2">
          <BrutalButton color="white" variant="outline" size="sm" onClick={copyText}>
            {copied ? <Check className="mr-1 h-4 w-4" /> : <Copy className="mr-1 h-4 w-4" />}
            {copied ? 'Tersalin' : 'Salin teks'}
          </BrutalButton>
          <BrutalButton
            color="blue"
            size="sm"
            onClick={() => downloadText(draftToPlainText(draft), `${safeFileBase(draft.fullName)}_CV.txt`)}
          >
            <FileText className="mr-1 h-4 w-4" />
            .txt (ATS)
          </BrutalButton>
          <BrutalButton color="pink" size="sm" onClick={downloadPdf} loading={busy} disabled={busy}>
            <Download className="mr-1 h-4 w-4" />
            Download PDF
          </BrutalButton>
        </div>
      </div>

      {draft.improvementNotes.length > 0 && (
        <div className="brutal-border brutal-radius bg-yellow/15 p-3">
          <p className="mb-2 flex items-center gap-2 text-sm font-bold">
            <Lightbulb className="h-4 w-4 text-orange" />
            Yang diperbaiki &amp; perlu Anda cek
          </p>
          <ul className="space-y-1">
            {draft.improvementNotes.map((note, i) => (
              <li key={i} className="text-sm text-black/75">
                - {note}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Rendered preview — single column, ATS-parseable structure */}
      <div className="brutal-border brutal-radius bg-cream-light p-5">
        <div className="border-b-2 border-black pb-3 text-center">
          <h2 className="font-display text-2xl font-bold">{draft.fullName}</h2>
          {draft.headline && <p className="font-medium text-black/70">{draft.headline}</p>}
          <p className="mt-1 text-sm text-black/60">
            {[draft.contact.email, draft.contact.phone, draft.contact.location].filter(Boolean).join('  •  ')}
          </p>
          {draft.links.length > 0 && (
            <p className="mt-1 flex flex-wrap justify-center gap-x-3 gap-y-1 text-sm">
              {draft.links.map((l) => (
                <a key={l.url} href={l.url} target="_blank" rel="noreferrer" className="font-medium text-blue underline">
                  {l.label}
                </a>
              ))}
            </p>
          )}
        </div>

        {draft.summary && (
          <Section title={CV_SECTION_LABELS.summary}>
            <p className="text-sm text-black/80">{draft.summary}</p>
          </Section>
        )}

        {draft.education.length > 0 && (
          <Section title={CV_SECTION_LABELS.education}>
            <div className="space-y-2">
              {draft.education.map((edu, i) => (
                <div key={i}>
                  <div className="flex flex-wrap items-baseline justify-between gap-x-2">
                    <p className="font-bold">{[edu.degree, edu.institution].filter(Boolean).join(' | ')}</p>
                    {edu.period && <p className="text-xs italic text-black/60">{edu.period}</p>}
                  </div>
                  {edu.detail && <p className="text-sm text-black/80">- {edu.detail}</p>}
                </div>
              ))}
            </div>
          </Section>
        )}

        {draft.experience.length > 0 && (
          <Section title={CV_SECTION_LABELS.experience}>
            <div className="space-y-3">
              {draft.experience.map((exp, i) => (
                <div key={i}>
                  <div className="flex flex-wrap items-baseline justify-between gap-x-2">
                    <p className="font-bold">{[exp.role, exp.company].filter(Boolean).join(' | ')}</p>
                    {(exp.period || exp.location) && (
                      <p className="text-xs italic text-black/60">
                        {[exp.location, exp.period].filter(Boolean).join(', ')}
                      </p>
                    )}
                  </div>
                  <ul className="mt-1 list-disc space-y-0.5 pl-5">
                    {exp.bullets.map((b, j) => (
                      <li key={j} className="text-sm text-black/80">
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Section>
        )}

        {draft.projects.length > 0 && (
          <Section title={CV_SECTION_LABELS.projects}>
            <div className="space-y-2">
              {draft.projects.map((proj, i) => (
                <div key={i}>
                  <p className="font-bold">
                    {proj.name}
                    {proj.stack && <span className="font-medium text-black/70"> ({proj.stack})</span>}
                  </p>
                  {proj.link && (
                    <a href={proj.link} target="_blank" rel="noreferrer" className="text-sm font-medium text-blue underline">
                      {proj.link}
                    </a>
                  )}
                  {proj.description && <p className="text-sm text-black/80">{proj.description}</p>}
                  {proj.bullets && proj.bullets.length > 0 && (
                    <ul className="mt-1 list-disc space-y-0.5 pl-5">
                      {proj.bullets.map((b, j) => (
                        <li key={j} className="text-sm text-black/80">
                          {b}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </Section>
        )}

        {draft.skills.length > 0 && (
          <Section title={CV_SECTION_LABELS.skills}>
            <ul className="space-y-1">
              {draft.skills.map((group) => (
                <li key={group.category} className="text-sm">
                  <span className="font-bold">{group.category}:</span> {group.items.join(', ')}
                </li>
              ))}
            </ul>
          </Section>
        )}

        {draft.certifications.length > 0 && (
          <Section title={CV_SECTION_LABELS.certifications}>
            <ul className="list-disc space-y-0.5 pl-5">
              {draft.certifications.map((cert, i) => (
                <li key={i} className="text-sm text-black/80">
                  {cert}
                </li>
              ))}
            </ul>
          </Section>
        )}

        {draft.languages.length > 0 && (
          <Section title={CV_SECTION_LABELS.languages}>
            <ul className="list-disc space-y-0.5 pl-5">
              {draft.languages.map((lang, i) => (
                <li key={i} className="text-sm text-black/80">
                  <span className="font-medium">{lang.name}:</span> {lang.level}
                </li>
              ))}
            </ul>
          </Section>
        )}

        {draft.publications.length > 0 && (
          <Section title={CV_SECTION_LABELS.publications}>
            <ul className="list-disc space-y-0.5 pl-5">
              {draft.publications.map((pub, i) => (
                <li key={i} className="text-sm text-black/80">
                  <LinkedText text={pub} />
                </li>
              ))}
            </ul>
          </Section>
        )}
      </div>
    </BrutalCard>
  )
}

// Linkify http(s) URLs and bare doi.org references inside a string (e.g. a
// publication citation) without pulling in a markdown library.
function LinkedText({ text }: { text: string }) {
  const parts = text.split(/(https?:\/\/[^\s)]+|(?:www\.|doi\.org\/)[^\s)]+)/gi)
  return (
    <>
      {parts.map((part, i) =>
        /^(https?:\/\/|www\.|doi\.org\/)/i.test(part) ? (
          <a
            key={i}
            href={part.startsWith('http') ? part : `https://${part}`}
            target="_blank"
            rel="noreferrer"
            className="font-medium text-blue underline"
          >
            {part}
          </a>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-4">
      <h3 className="mb-1 border-b border-black/30 pb-0.5 font-display text-sm font-bold uppercase tracking-wide text-black/70">
        {title}
      </h3>
      {children}
    </div>
  )
}
