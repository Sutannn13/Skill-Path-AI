export const GEMINI_MODEL = process.env.GEMINI_MODEL?.trim() || 'gemini-3.5-flash'

export const GEMINI_GENERATE_CONTENT_URL =
  `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(GEMINI_MODEL)}:generateContent`

export function getGeminiRequestHeaders(apiKey: string) {
  return {
    'Content-Type': 'application/json',
    'x-goog-api-key': apiKey,
  }
}
