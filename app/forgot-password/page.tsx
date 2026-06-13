'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Target, Mail, AlertCircle, CheckCircle, ArrowLeft, KeyRound, ExternalLink } from 'lucide-react'
import { createSupabaseBrowserClient } from '@/lib/supabase/browser'
import { BrutalCard, BrutalButton } from '@/components/brutal'
import { cn } from '@/lib/utils'
import { AnimatedBrutalBackground, BrutalBackgroundStyles } from '@/components/illustrations/animated-brutal-background'
import { AnimatedCatMascot } from '@/components/illustrations/animated-cat-mascot'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)

  const supabase = createSupabaseBrowserClient()

  const mascotMood = success ? 'cheer' : isLoading ? 'focus' : 'happy'
  const mascotMessage = success ? 'Mail sent!' : isLoading ? 'Searching...' : 'Reset your password!'

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

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
    <div className="min-h-screen bg-background">
      <BrutalBackgroundStyles />
      <AnimatedBrutalBackground variant="login" intensity="medium" />

      {/* Header */}
      <header className="border-b-3 border-black bg-white/80 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow brutal-border brutal-radius flex items-center justify-center">
              <Target className="w-6 h-6" />
            </div>
            <span className="font-display font-bold text-xl">SkillPath</span>
          </Link>
          <Link href="/login">
            <BrutalButton variant="ghost" color="black" size="sm">
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back to Login
            </BrutalButton>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-6xl px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="grid gap-6 lg:grid-cols-5"
        >
          {/* Left Side - Mascot */}
          <BrutalCard
            color="yellow"
            shadow="lg"
            className="relative hidden p-8 lg:col-span-2 lg:block overflow-hidden"
          >
            <AnimatedCatMascot
              size="xl"
              mood={mascotMood}
              animated={true}
              withMessage={mascotMessage}
              className="mx-auto"
            />
            <div className="text-center mt-4 relative z-10">
              <h2 className="font-display text-2xl font-bold">Forgot your password?</h2>
              <p className="mt-2 text-sm text-black/70">
                No worries! Enter your email and we will send you a reset link.
              </p>
            </div>

            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-pink brutal-border brutal-radius opacity-30 animate-wiggle" />
            <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-blue brutal-border brutal-radius opacity-30 animate-float" />
            <div className="absolute top-1/2 right-2 w-8 h-8 bg-green brutal-border rounded-full opacity-40 animate-bounce" />
          </BrutalCard>

          {/* Right Side - Form */}
          <div className="lg:col-span-3">
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-orange brutal-border brutal-radius flex items-center justify-center">
                  <KeyRound className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="font-display text-3xl font-bold">Reset Password</h1>
                  <p className="text-gray-600">We will help you get back on track</p>
                </div>
              </div>
            </div>

            {success ? (
              <BrutalCard color="green" shadow="lg" className="p-8">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-16 h-16 bg-green/20 brutal-border brutal-radius flex items-center justify-center shrink-0">
                    <CheckCircle className="w-8 h-8 text-green" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-xl mb-2">Check your email!</h3>
                    <p className="text-gray-600">
                      We have sent a password reset link to <strong>{email}</strong>.
                      Please check your inbox and click the link to reset your password.
                    </p>
                  </div>
                </div>

                <div className="bg-yellow/20 brutal-border brutal-radius p-4 mb-6">
                  <p className="text-sm">
                    <strong>Did not receive the email?</strong> Check your spam folder or make sure
                    you entered the correct email address.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <a href="https://mail.google.com" target="_blank" rel="noreferrer">
                    <BrutalButton color="yellow" className="active:translate-y-[2px] active:translate-x-[2px] active:shadow-none">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Open Gmail
                    </BrutalButton>
                  </a>
                  <Link href="/login">
                    <BrutalButton variant="outline" color="black" className="active:translate-y-[2px] active:translate-x-[2px] active:shadow-none">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back to Login
                    </BrutalButton>
                  </Link>
                  <button
                    onClick={() => {
                      setSuccess(false)
                      setEmail('')
                    }}
                    className="px-4 py-2 brutal-border brutal-radius font-bold hover:bg-gray-100 transition-all active:translate-y-[2px] active:translate-x-[2px]"
                  >
                    Try different email
                  </button>
                </div>
              </BrutalCard>
            ) : (
              <BrutalCard color="white" shadow="lg" className="p-8">
                {!supabase ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-yellow/20 brutal-border brutal-radius flex items-center justify-center mx-auto mb-4">
                      <AlertCircle className="w-8 h-8 text-yellow" />
                    </div>
                    <h3 className="font-display font-bold text-xl mb-2">Supabase Not Configured</h3>
                    <p className="text-gray-600 mb-6">
                      Password reset requires Supabase to be configured.
                    </p>
                    <div className="bg-gray-50 brutal-border brutal-radius p-4 text-left">
                      <p className="text-sm font-medium mb-2">Required variables:</p>
                      <code className="text-xs text-gray-600">
                        NEXT_PUBLIC_SUPABASE_URL
                        <br />
                        NEXT_PUBLIC_SUPABASE_ANON_KEY
                      </code>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label htmlFor="email" className="block mb-2 font-medium">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="email"
                          id="email"
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value)
                            setValidationError(null)
                          }}
                          placeholder="you@example.com"
                          required
                          className={cn(
                            'w-full pl-12 pr-4 py-3 brutal-border brutal-radius brutal-input-focus bg-gray-50 text-black placeholder-gray-500 caret-black',
                            'focus:bg-white focus:outline-none focus:ring-4 focus:ring-yellow focus:border-black',
                            'transition-all',
                            validationError && 'border-red border-2'
                          )}
                        />
                      </div>
                      {validationError && (
                        <p className="text-sm text-red mt-1 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {validationError}
                        </p>
                      )}
                    </div>

                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-2 p-4 bg-red/10 border-2 border-red brutal-radius"
                      >
                        <AlertCircle className="w-5 h-5 text-red shrink-0" />
                        <p className="text-sm text-red">{error}</p>
                      </motion.div>
                    )}

                    <div className="bg-blue/10 brutal-border brutal-radius p-4">
                      <p className="text-sm text-gray-700">
                        <strong>How it works:</strong> Enter your email and we will send you a secure link
                        to reset your password. The link will expire in 1 hour.
                      </p>
                    </div>

                    <BrutalButton
                      type="submit"
                      color="orange"
                      size="lg"
                      fullWidth
                      loading={isLoading}
                      disabled={isLoading}
                      className="active:translate-y-[2px] active:translate-x-[2px] active:shadow-none"
                    >
                      {isLoading ? 'Sending...' : 'Send Reset Link'}
                      {!isLoading && <Mail className="w-5 h-5 ml-2" />}
                    </BrutalButton>
                  </form>
                )}
              </BrutalCard>
            )}

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Remember your password?{' '}
                <Link href="/login" className="font-bold text-black hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  )
}