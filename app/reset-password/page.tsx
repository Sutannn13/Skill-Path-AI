'use client'

import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Target, Lock, AlertCircle, CheckCircle, Eye, EyeOff, Check } from 'lucide-react'
import { createSupabaseBrowserClient } from '@/lib/supabase/browser'
import { BrutalCard, BrutalButton } from '@/components/brutal'
import { cn } from '@/lib/utils'
import { AnimatedBrutalBackground, BrutalBackgroundStyles } from '@/components/illustrations/animated-brutal-background'
import { AnimatedCatMascot } from '@/components/illustrations/animated-cat-mascot'

function ResetPasswordContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null)
  const [passwordChecks, setPasswordChecks] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  })

  const supabase = createSupabaseBrowserClient()

  // Check for valid token on mount
  useEffect(() => {
    const checkToken = async () => {
      if (!supabase) {
        setIsValidToken(false)
        return
      }

      const { error: sessionError } = await supabase.auth.getSession()
      if (sessionError || !sessionError) {
        // If we have a code in URL, exchange it
        const code = searchParams.get('code')
        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
          if (!exchangeError) {
            setIsValidToken(true)
            return
          }
        }
      }

      // Check session another way
      const { data } = await supabase.auth.getSession()
      setIsValidToken(!!data.session)
    }

    checkToken()
  }, [supabase, searchParams])

  // Password validation
  useEffect(() => {
    setPasswordChecks({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[^A-Za-z0-9]/.test(password),
    })
  }, [password])

  const passwordStrength = Object.values(passwordChecks).filter(Boolean).length
  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 2) return 'bg-red'
    if (passwordStrength <= 4) return 'bg-yellow'
    return 'bg-green'
  }

  const getPasswordStrengthLabel = () => {
    if (passwordStrength <= 2) return 'Weak'
    if (passwordStrength <= 4) return 'Medium'
    return 'Strong'
  }

  const isPasswordValid = passwordChecks.length && passwordChecks.uppercase && passwordChecks.lowercase && passwordChecks.number
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setValidationError(null)

    if (!isPasswordValid) {
      setValidationError('Password does not meet the requirements.')
      return
    }

    if (!passwordsMatch) {
      setValidationError('Passwords do not match.')
      return
    }

    if (!supabase) {
      setError('Password reset is not available. Please set up Supabase to enable this feature.')
      return
    }

    setIsLoading(true)

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      })

      if (updateError) {
        setError(updateError.message)
        setIsLoading(false)
        return
      }

      // Sign out other sessions
      await supabase.auth.signOut({ scope: 'others' })

      setSuccess(true)
      setIsLoading(false)
    } catch (err) {
      setError('Something went wrong. Please try again.')
      setIsLoading(false)
    }
  }

  // Loading state
  if (isValidToken === null) {
    return (
      <div className="min-h-screen bg-background">
        <BrutalBackgroundStyles />
        <AnimatedBrutalBackground variant="login" intensity="low" />
        <div className="flex items-center justify-center min-h-screen">
          <BrutalCard color="yellow" className="p-8 text-center">
            <div className="w-16 h-16 bg-yellow/20 brutal-border brutal-radius flex items-center justify-center mx-auto mb-4 animate-pulse">
              <Lock className="w-8 h-8" />
            </div>
            <p className="font-medium">Verifying your reset link...</p>
          </BrutalCard>
        </div>
      </div>
    )
  }

  // Invalid token state
  if (isValidToken === false) {
    return (
      <div className="min-h-screen bg-background">
        <BrutalBackgroundStyles />
        <AnimatedBrutalBackground variant="login" intensity="low" />

        <header className="border-b-3 border-black bg-white/80 backdrop-blur-sm">
          <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow brutal-border brutal-radius flex items-center justify-center">
                <Target className="w-6 h-6" />
              </div>
              <span className="font-display font-bold text-xl">SkillPath</span>
            </Link>
          </div>
        </header>

        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <BrutalCard color="red" className="p-8 max-w-md text-center">
            <div className="w-16 h-16 bg-red/20 brutal-border brutal-radius flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red" />
            </div>
            <h2 className="font-display font-bold text-xl mb-2">Invalid or Expired Link</h2>
            <p className="text-gray-600 mb-6">
              This password reset link is invalid or has expired. Please request a new one.
            </p>
            <Link href="/forgot-password">
              <BrutalButton color="orange">
                Request New Link
              </BrutalButton>
            </Link>
          </BrutalCard>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <BrutalBackgroundStyles />
      <AnimatedBrutalBackground variant="register" intensity="medium" />

      {/* Header */}
      <header className="border-b-3 border-black bg-white/80 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow brutal-border brutal-radius flex items-center justify-center">
              <Target className="w-6 h-6" />
            </div>
            <span className="font-display font-bold text-xl">SkillPath</span>
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
          <BrutalCard color="green" shadow="lg" className="relative hidden p-8 lg:col-span-2 lg:block overflow-hidden">
            <AnimatedCatMascot
              size="xl"
              mood="excited"
              animated={true}
              withMessage="New password time!"
              className="mx-auto"
            />
            <div className="text-center mt-4 relative z-10">
              <h2 className="font-display text-2xl font-bold">Create New Password</h2>
              <p className="mt-2 text-sm text-black/70">
                Choose a strong password to keep your account secure.
              </p>
            </div>

            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 w-16 h-16 bg-yellow brutal-border brutal-radius opacity-30 animate-float" />
            <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-pink brutal-border brutal-radius opacity-30 animate-wiggle" />
          </BrutalCard>

          {/* Right Side - Form */}
          <div className="lg:col-span-3">
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-green brutal-border brutal-radius flex items-center justify-center">
                  <Lock className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="font-display text-3xl font-bold">Set New Password</h1>
                  <p className="text-gray-600">Enter your new secure password</p>
                </div>
              </div>
            </div>

            {success ? (
              <BrutalCard color="green" shadow="lg" className="p-8">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-16 h-16 bg-green/20 brutal-border brutal-radius flex items-center justify-center shrink-0">
                    <Check className="w-8 h-8 text-green" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-xl mb-2">Password Updated!</h3>
                    <p className="text-gray-600">
                      Your password has been successfully reset. You can now sign in with your new password.
                    </p>
                  </div>
                </div>

                <div className="bg-green/10 brutal-border brutal-radius p-4 mb-6">
                  <p className="text-sm">
                    <strong>Security notice:</strong> All other sessions have been ended for your protection.
                    You will need to sign in again on other devices.
                  </p>
                </div>

                <Link href="/login">
                  <BrutalButton color="green">
                    Go to Login
                  </BrutalButton>
                </Link>
              </BrutalCard>
            ) : (
              <BrutalCard color="white" shadow="lg" className="p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="password" className="block mb-2 font-medium">
                      New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        id="password"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value)
                          setValidationError(null)
                        }}
                        placeholder="Min. 8 characters"
                        required
                        minLength={8}
                        className={cn(
                          'w-full pl-12 pr-12 py-3 brutal-border brutal-radius bg-gray-50 text-black placeholder-gray-500 caret-black',
                          'focus:bg-white focus:outline-none focus:ring-2 focus:ring-yellow',
                          'transition-all'
                        )}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded border-2 border-black bg-white p-1 hover:bg-gray-100"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>

                    {/* Password strength indicator */}
                    {password.length > 0 && (
                      <div className="mt-3">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={cn('h-2 flex-1 rounded-sm border-2 border-black', password.length >= 8 ? 'bg-green' : 'bg-gray-200')} />
                          <span className="text-xs font-medium">{getPasswordStrengthLabel()}</span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="flex items-center gap-1">
                            <CheckCircle className={cn('w-4 h-4', passwordChecks.length ? 'text-green' : 'text-gray-300')} />
                            <span>At least 8 characters</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <CheckCircle className={cn('w-4 h-4', passwordChecks.uppercase ? 'text-green' : 'text-gray-300')} />
                            <span>One uppercase letter</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <CheckCircle className={cn('w-4 h-4', passwordChecks.lowercase ? 'text-green' : 'text-gray-300')} />
                            <span>One lowercase letter</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <CheckCircle className={cn('w-4 h-4', passwordChecks.number ? 'text-green' : 'text-gray-300')} />
                            <span>One number</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block mb-2 font-medium">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        id="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value)
                          setValidationError(null)
                        }}
                        placeholder="Repeat your password"
                        required
                        minLength={8}
                        className={cn(
                          'w-full pl-12 pr-12 py-3 brutal-border brutal-radius bg-gray-50 text-black placeholder-gray-500 caret-black',
                          'focus:bg-white focus:outline-none focus:ring-2 focus:ring-yellow',
                          'transition-all',
                          confirmPassword && !passwordsMatch && 'border-red border-2'
                        )}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                        aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded border-2 border-black bg-white p-1 hover:bg-gray-100"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {confirmPassword && !passwordsMatch && (
                      <p className="text-sm text-red mt-1 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        Passwords do not match
                      </p>
                    )}
                    {passwordsMatch && (
                      <p className="text-sm text-green mt-1 flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" />
                        Passwords match
                      </p>
                    )}
                  </div>

                  {validationError && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2 p-4 bg-red/10 border-2 border-red brutal-radius"
                    >
                      <AlertCircle className="w-5 h-5 text-red shrink-0" />
                      <p className="text-sm text-red">{validationError}</p>
                    </motion.div>
                  )}

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

                  <div className="bg-yellow/10 brutal-border brutal-radius p-4">
                    <p className="text-sm text-gray-700">
                      <strong>Password tips:</strong> Use a mix of uppercase, lowercase, numbers, and special characters.
                      Avoid common words or personal information.
                    </p>
                  </div>

                  <BrutalButton
                    type="submit"
                    color="green"
                    size="lg"
                    fullWidth
                    loading={isLoading}
                    disabled={isLoading || !isPasswordValid || !passwordsMatch}
                  >
                    {isLoading ? 'Updating...' : 'Update Password'}
                    {!isLoading && <Lock className="w-5 h-5 ml-2" />}
                  </BrutalButton>
                </form>
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

function ResetPasswordLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="absolute inset-0 bg-gradient-to-br from-yellow/20 via-pink/10 to-blue/20" />
      <div className="flex items-center justify-center min-h-screen">
        <BrutalCard color="yellow" className="p-8 text-center">
          <div className="w-16 h-16 bg-yellow/20 brutal-border brutal-radius flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Lock className="w-8 h-8" />
          </div>
          <p className="font-medium">Loading...</p>
        </BrutalCard>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetPasswordLoading />}>
      <ResetPasswordContent />
    </Suspense>
  )
}
