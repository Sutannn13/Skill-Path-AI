// Streaming progress types and helpers for the CV analysis pipeline.
// The backend emits NDJSON events as each analysis step completes; the frontend
// consumes them via ReadableStream to drive a real-time progress UI.

import { CvAnalysisResponse } from './types'

// ---------------------------------------------------------------------------
// Step definitions
// ---------------------------------------------------------------------------

export const ANALYSIS_STEPS = [
  { step: 1, label: 'Membaca file CV...' },
  { step: 2, label: 'Mengekstrak teks & struktur...' },
  { step: 3, label: 'Memeriksa keterbacaan ATS...' },
  { step: 4, label: 'Mencocokkan skill dengan role tujuan...' },
  { step: 5, label: 'Menganalisis dengan AI (Gemini)...' },
  { step: 6, label: 'Menyusun rekomendasi & checklist revisi...' },
] as const

export type StepNumber = (typeof ANALYSIS_STEPS)[number]['step']
export type StepStatus = 'pending' | 'running' | 'done' | 'error'

// ---------------------------------------------------------------------------
// Wire format (one JSON object per line, newline-delimited)
// ---------------------------------------------------------------------------

export interface AnalysisStepEvent {
  step: StepNumber
  label: string
  status: 'running' | 'done' | 'error'
  /** Present only when status is 'error'. */
  error?: string
  /** Present only on the final 'done' event (step 6). */
  result?: CvAnalysisResponse
}

// ---------------------------------------------------------------------------
// Encoder (server-side)
// ---------------------------------------------------------------------------

const encoder = new TextEncoder()

/** Encode a step event into a single NDJSON line (UTF-8 bytes + newline). */
export function encodeStep(event: AnalysisStepEvent): Uint8Array {
  return encoder.encode(JSON.stringify(event) + '\n')
}

// ---------------------------------------------------------------------------
// Client-side step state
// ---------------------------------------------------------------------------

export interface AnalysisStepState {
  step: StepNumber
  label: string
  status: StepStatus
  error?: string
}

/** Build the initial pending-state array for the frontend. */
export function initialStepStates(): AnalysisStepState[] {
  return ANALYSIS_STEPS.map((s) => ({
    step: s.step,
    label: s.label,
    status: 'pending' as StepStatus,
  }))
}
