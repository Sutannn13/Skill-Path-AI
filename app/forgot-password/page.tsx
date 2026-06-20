'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Mail, AlertCircle, CheckCircle, ArrowLeft, KeyRound, ExternalLink } from 'lucide-react'
import { createSupabaseBrowserClient } from '@/lib/supabase/browser'
import { BrutalCard, BrutalButton } from '@/components/brutal'
import { AuthFormLayout, AuthInput, AuthError } from '@/components/auth/auth-form-layout'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)

  const supabase = createSupabaseBrowserClient()

  const mascotMood = success ? 'cheer' : isLoading ? 'focus' : 'happy'
  const mascotMessage = success ? 'Mail sent!' : isLoading ? 'Searching...' : "Let's fix it!"

  const validateEmail = (value: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setValidationError(null)

    if (!email.trim()) {
      setValidationError('Please enter your email address.')
      return
    }
    if (!validateEmail(email)) {
      setValidationError('Please enter a valid email address.')
      return
    }
    if (!supabase) {
      setError('Password reset is not available. Please set up Supabase to enable this feature.')
      return
    }

    setIsLoading(true)
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
      })
      if (resetError) {
        setError(resetError.message)
        setIsLoading(false)
        return
      }
      setSuccess(true)
      setIsLoading(false)
    } catch (err) {
      setError('Something went wrong. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <AuthFormLayout
      welcomeColor="yellow"
      sceneAccent="orange"
      sceneCaption="Need a hand?"
      catMood={mascotMood}
      catMessage={mascotMessage}
      headerRight={
        <Link href="/login">
          <BrutalButton variant="ghost" color="black" size="sm">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to Login
          </BrutalButton>
        </Link>
      }
      welcome={
        <div className="text-center">
          <h2 className="font-display text-2xl font-bold">Forgot your password?</h2>
          <p className="mt-2 text-sm text-secondary">
            No worries. Enter your email and we will send you a reset link.
          </p>
        </div>
      }
      footer={
        <p className="text-secondary">
          Remember your password?{' '}
          <Link href="/login" className="font-bold text-black underline rounded focus-brutal-ring">
            Sign in
          </Link>
        </p>
      }
    >
      <div className="mb-6 flex items-center gap-3">
        <div className="w-12 h-12 bg-orange brutal-border brutal-radius flex items-center justify-center shrink-0">
          <KeyRound className="w-6 h-6" aria-hidden="true" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-bold">Reset Password</h1>
          <p className="text-secondary">We will help you get back on track</p>
        </div>
      </div>

      {success ? (
        <BrutalCard color="green" shadow="lg" className="p-8">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-16 h-16 bg-green/20 brutal-border brutal-radius flex items-center justify-center shrink-0">
              <CheckCircle className="w-8 h-8" aria-hidden="true" />
            </div>
            <div>
              <h3 className="font-display font-bold text-xl mb-2">Check your email!</h3>
              <p className="text-black/80 break-words">
                We have sent a password reset link to <strong>{email}</strong>. Check your inbox and click the link to
                reset your password.
              </p>
            </div>
          </div>

          <div className="bg-white brutal-border brutal-radius p-4 mb-6">
            <p className="text-sm">
              <strong>Did not receive the email?</strong> Check your spam folder or confirm you entered the correct
              address.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <a href="https://mail.google.com" target="_blank" rel="noreferrer">
              <BrutalButton color="yellow">
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
                Open Gmail
              </BrutalButton>
            </a>
            <Link href="/login">
              <BrutalButton variant="outline" color="black">
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                Back to Login
              </BrutalButton>
            </Link>
            <BrutalButton
              variant="outline"
              color="black"
              onClick={() => {
                setSuccess(false)
                setEmail('')
              }}
            >
              Try different email
            </BrutalButton>
          </div>
        </BrutalCard>
      ) : (
        <BrutalCard color="white" shadow="lg" className="p-8">
          {!supabase ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-yellow/20 brutal-border brutal-radius flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-orange" aria-hidden="true" />
              </div>
              <h3 className="font-display font-bold text-xl mb-2">Supabase Not Configured</h3>
              <p className="text-secondary mb-6">Password reset requires Supabase to be configured.</p>
              <div className="bg-gray-50 brutal-border brutal-radius p-4 text-left">
                <p className="text-sm font-medium mb-2">Required variables:</p>
                <code className="text-xs text-secondary">
                  NEXT_PUBLIC_SUPABASE_URL
                  <br />
                  NEXT_PUBLIC_SUPABASE_ANON_KEY
                </code>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <AuthInput
                  id="email"
                  type="email"
                  label="Email Address"
                  icon={Mail}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    setValidationError(null)
                  }}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                  invalid={Boolean(validationError)}
                />
                {validationError && (
                  <p className="text-sm font-medium text-red-dark mt-1 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" aria-hidden="true" />
                    {validationError}
                  </p>
                )}
              </div>

              {error && <AuthError message={error} />}

              <div className="bg-blue/10 brutal-border brutal-radius p-4">
                <p className="text-sm text-black/80">
                  <strong>How it works:</strong> Enter your email and we will send a secure reset link that expires in 1
                  hour.
                </p>
              </div>

              <BrutalButton type="submit" color="orange" size="lg" fullWidth loading={isLoading} disabled={isLoading}>
                {isLoading ? 'Sending...' : 'Send Reset Link'}
                {!isLoading && <Mail className="w-5 h-5" aria-hidden="true" />}
              </BrutalButton>
            </form>
          )}
        </BrutalCard>
      )}
    </AuthFormLayout>
  )
}
