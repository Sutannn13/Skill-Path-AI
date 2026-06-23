// Shared Gemini JSON caller for the CV tooling (audit, improve, cover letter).
// Encapsulates the canonical retry/timeout/backoff loop so each generator only
// has to supply a prompt and parse the result. Returns the raw model text, or
// null on any failure (no key, timeout, non-retryable error) so callers can
// fall back to a deterministic path.

import {
  GEMINI_GENERATE_CONTENT_URL,
  getGeminiRequestHeaders,
} from '@/lib/ai/gemini-config'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const GEMINI_TIMEOUT_MS = 22000
const GEMINI_MAX_ATTEMPTS = 3
const GEMINI_BASE_BACKOFF_MS = 400

export function hasGeminiKey(): boolean {
  return Boolean(GEMINI_API_KEY)
}

function getBackoffDelayMs(attempt: number): number {
  const exponential = GEMINI_BASE_BACKOFF_MS * 2 ** (attempt - 1)
  const jitter = Math.floor(Math.random() * 120)
  return exponential + jitter
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export interface GeminiJsonOptions {
  temperature?: number
  maxOutputTokens?: number
  label?: string
}

/**
 * Call Gemini with a single text prompt expecting a JSON response. Returns the
 * raw generated string (already stripped of code fences) or null on failure.
 */
export async function callGeminiJson(
  prompt: string,
  options: GeminiJsonOptions = {}
): Promise<string | null> {
  if (!GEMINI_API_KEY) return null

  const { temperature = 0.5, maxOutputTokens = 4096, label = 'CV' } = options
  let response: Response | null = null

  for (let attempt = 1; attempt <= GEMINI_MAX_ATTEMPTS; attempt++) {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), GEMINI_TIMEOUT_MS)

    try {
      response = await fetch(GEMINI_GENERATE_CONTENT_URL, {
        method: 'POST',
        headers: getGeminiRequestHeaders(GEMINI_API_KEY),
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature,
            maxOutputTokens,
            responseMimeType: 'application/json',
          },
        }),
        signal: controller.signal,
      })

      if (response.ok) break

      const shouldRetry = response.status === 429 || response.status >= 500
      if (!shouldRetry || attempt === GEMINI_MAX_ATTEMPTS) {
        console.error(`[${label}] Gemini API error:`, response.status)
        return null
      }
      await wait(getBackoffDelayMs(attempt))
    } catch (error) {
      if (attempt === GEMINI_MAX_ATTEMPTS) {
        console.error(`[${label}] Gemini request failed:`, error instanceof Error ? error.message : 'unknown')
        return null
      }
      await wait(getBackoffDelayMs(attempt))
    } finally {
      clearTimeout(timeoutId)
    }
  }

  if (!response || !response.ok) return null

  try {
    const data = await response.json()
    const generatedText: string | undefined = data.candidates?.[0]?.content?.parts?.[0]?.text
    if (!generatedText) return null
    return generatedText.replace(/```json\n?|```\n?/g, '').trim()
  } catch (error) {
    console.error(`[${label}] Gemini response parse failed:`, error instanceof Error ? error.message : 'unknown')
    return null
  }
}

// Control chars (0x00-0x1F except TAB/LF/CR, plus 0x7F DEL) stripped before
// prompting. Built via String.fromCharCode so the source stays pure ASCII.
function buildControlCharsRegex(): RegExp {
  const codes: number[] = []
  for (let c = 0; c <= 0x1f; c++) {
    if (c === 9 || c === 10 || c === 13) continue
    codes.push(c)
  }
  codes.push(0x7f)
  const cls = codes.map((c) => String.fromCharCode(c)).join('')
  return new RegExp('[' + cls + ']', 'g')
}

const CONTROL_CHARS_RE = buildControlCharsRegex()

/** Strip control chars + code fences and cap length to keep prompts bounded. */
export function sanitizeForPrompt(text: string, maxChars = 14000): string {
  return text
    .replace(CONTROL_CHARS_RE, ' ')
    .replace(/`{3,}/g, ' ')
    .slice(0, maxChars)
}
