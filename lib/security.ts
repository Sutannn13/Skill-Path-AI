/**
 * Security utilities for XSS protection and input sanitization
 */

// HTML entity encoding map
const HTML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
  '`': '&#x60;',
  '=': '&#x3D;',
}

/**
 * Encode HTML entities to prevent XSS attacks
 */
export function encodeHTML(str: string): string {
  return str.replace(/[&<>"'`=/]/g, (char) => HTML_ENTITIES[char] || char)
}

/**
 * Sanitize HTML by removing dangerous tags and attributes
 */
export function sanitizeHTML(html: string): string {
  // Remove script tags
  let sanitized = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
  // Remove on* event handlers
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '')
  // Remove javascript: protocol
  sanitized = sanitized.replace(/javascript:/gi, '')
  // Remove data: protocol (can be used for XSS)
  sanitized = sanitized.replace(/data:/gi, '')
  return sanitized
}

/**
 * Validate and sanitize URL
 */
export function sanitizeURL(url: string): string {
  try {
    const parsed = new URL(url)
    // Only allow http, https, and mailto protocols
    if (!['http:', 'https:', 'mailto:'].includes(parsed.protocol)) {
      return ''
    }
    return parsed.toString()
  } catch {
    return ''
  }
}

/**
 * Sanitize user input for display
 */
export function sanitizeUserInput(input: string): string {
  if (!input) return ''
  return encodeHTML(input.trim())
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate password strength
 */
export interface PasswordValidation {
  isValid: boolean
  errors: string[]
  score: number // 0-5
}

export function validatePassword(password: string): PasswordValidation {
  const errors: string[] = []
  let score = 0

  if (password.length >= 8) {
    score++
  } else {
    errors.push('Password must be at least 8 characters')
  }

  if (/[A-Z]/.test(password)) {
    score++
  } else {
    errors.push('Password must contain at least one uppercase letter')
  }

  if (/[a-z]/.test(password)) {
    score++
  } else {
    errors.push('Password must contain at least one lowercase letter')
  }

  if (/\d/.test(password)) {
    score++
  } else {
    errors.push('Password must contain at least one number')
  }

  if (/[^A-Za-z0-9]/.test(password)) {
    score++
  } else {
    errors.push('Password should contain at least one special character')
  }

  return {
    isValid: errors.length === 0,
    errors,
    score,
  }
}

/**
 * Rate limiter for API endpoints
 */
export class RateLimiter {
  private requests: Map<string, number[]> = new Map()
  private maxRequests: number
  private windowMs: number

  constructor(maxRequests: number = 10, windowMs: number = 60000) {
    this.maxRequests = maxRequests
    this.windowMs = windowMs
  }

  isRateLimited(identifier: string): boolean {
    const now = Date.now()
    const requests = this.requests.get(identifier) || []

    // Filter out old requests outside the window
    const validRequests = requests.filter((timestamp) => now - timestamp < this.windowMs)

    if (validRequests.length >= this.maxRequests) {
      return true
    }

    // Add current request
    validRequests.push(now)
    this.requests.set(identifier, validRequests)

    return false
  }

  reset(identifier: string): void {
    this.requests.delete(identifier)
  }

  resetAll(): void {
    this.requests.clear()
  }
}

/**
 * Generate CSRF token
 */
export function generateCSRFToken(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('')
}

/**
 * Validate CSRF token
 */
export function validateCSRFToken(token: string, expectedToken: string): boolean {
  if (!token || !expectedToken) return false
  // Use timing-safe comparison
  if (token.length !== expectedToken.length) return false
  let result = 0
  for (let i = 0; i < token.length; i++) {
    result |= token.charCodeAt(i) ^ expectedToken.charCodeAt(i)
  }
  return result === 0
}

/** End of security utilities */
