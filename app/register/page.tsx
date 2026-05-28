'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Target, Mail, Lock, User, AlertCircle, CheckCircle, ArrowRight, Eye, EyeOff, ArrowLeft } from 'lucide-react'
import { createSupabaseBrowserClient } from '@/lib/supabase/browser'
import { BrutalCard, BrutalButton } from '@/components/brutal'
import { cn } from '@/lib/utils'
import { AnimatedBrutalBackground, BrutalBackgroundStyles } from '@/components/illustrations/animated-brutal-background'
import { AnimatedCatMascot } from '@/components/illustrations/animated-cat-mascot'

interface RegisterFormData {
  fullName: string
  email: string
  password: string
  confirmPassword: string
}

function getPasswordStrength(password: string) {
  let score = 0
  if (password.length >= 8) score += 1
  if (/[A-Z]/.test(password)) score += 1
  if (/[a-z]/.test(password)) score += 1
  if (/\d/.test(password)) score += 1
  if (/[^A-Za-z0-9]/.test(password)) score += 1

  if (score <= 2) return { label: 'Weak', color: 'bg-red' }
  if (score <= 4) return { label: 'Medium', color: 'bg-yellow' }
  return { label: 'Strong', color: 'bg-green' }
}

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState<RegisterFormData>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const supabase = createSupabaseBrowserClient()

  const passwordMatch = formData.password === formData.confirmPassword
  const canSubmit =
    formData.fullName.trim() !== '' &&
    formData.email.trim() !== '' &&
    formData.password.length >= 6 &&
    passwordMatch &&
    !isLoading
  const passwordStrength = getPasswordStrength(formData.password)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    // Validate password match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match. Please try again.')
      setIsLoading(false)
      return
    }

    if (!supabase) {
      setError('Supabase is not configured yet. Please set up your environment variables.')
      setIsLoading(false)
      return
    }

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
          },
        },
      })

      if (signUpError) {
        setError('Failed to create account. Please try again.')
        setIsLoading(false)
        return
      }

      // If session exists (email confirmation disabled), create profile and redirect
      if (data.session && data.user) {
        // Create profile in public.profiles table
        const { error: profileError } = await supabase.from('profiles').upsert({
          id: data.user.id,
          full_name: formData.fullName,
          role: 'user',
          onboarding_completed: false,
        })

        if (profileError) {
          console.error('Profile creation error:', profileError)
          // Continue anyway - profile can be created during onboarding
        }

        router.push('/onboarding')
        router.refresh()
      } else {
        // Email confirmation required
        setSuccess(true)
        setIsLoading(false)
      }
    } catch (err) {
      setError('Something went wrong. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <BrutalBackgroundStyles />
      <AnimatedBrutalBackground variant="register" intensity="high" showDoodles />

      {/* Header */}
      <header className="border-b-3 border-black bg-white">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow brutal-border brutal-radius flex items-center justify-center">
              <Target className="w-6 h-6" />
            </div>
            <span className="font-display font-bold text-xl">SkillPath</span>
          </Link>
          <Link href="/login">
            <BrutalButton variant="ghost" color="black" size="sm">
              Sign In
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
          <BrutalCard color="pink" shadow="lg" className="relative hidden p-8 lg:col-span-2 lg:block overflow-hidden">
            <div className="relative z-10">
              <div className="mb-4">
                <AnimatedCatMascot
                  size="xl"
                  mood="cheer"
                  animated={true}
                  withMessage="Join us!"
                />
              </div>
              <h2 className="font-display text-2xl font-bold">Create your account</h2>
              <p className="mt-2 text-sm text-black/70">
                Build your learning roadmap, pass quizzes, and submit portfolio projects in one place.
              </p>
            </div>
            {/* Decorative shapes */}
            <div className="absolute -top-3 -left-3 w-12 h-12 bg-yellow brutal-border brutal-radius opacity-40 animate-wiggle" />
            <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-green brutal-border brutal-radius opacity-30 animate-float" />
            <div className="absolute top-1/3 left-4 w-8 h-8 bg-blue brutal-border rounded-full opacity-30 animate-bounce" />
          </BrutalCard>

          <div className="lg:col-span-3">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="font-display text-3xl font-bold">Create Account</h1>
                <p className="text-gray-600">Start your career journey with SkillPath</p>
              </div>
              <Link href="/">
                <BrutalButton variant="outline" color="black" size="sm">
                  <ArrowLeft className="mr-1 h-4 w-4" />
                  Back to Home
                </BrutalButton>
              </Link>
            </div>

            {success ? (
              <BrutalCard color="green" shadow="lg" className="p-8 text-center">
                <div className="w-16 h-16 bg-green/20 brutal-border brutal-radius flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green" />
                </div>
                <h3 className="font-display font-bold text-xl mb-2">Check Your Email</h3>
                <p className="text-gray-600 mb-6">
                  We have sent a confirmation link to <strong>{formData.email}</strong>.
                  Click the link to activate your account.
                </p>
                <Link href="/login">
                  <BrutalButton variant="outline" color="black">
                    Back to Login
                  </BrutalButton>
                </Link>
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
                      Please set up your Supabase environment variables to enable authentication.
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
                      <label htmlFor="fullName" className="block mb-2 font-medium">
                        Full Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          id="fullName"
                          value={formData.fullName}
                          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                          placeholder="John Doe"
                          required
                          className={cn(
                            'w-full pl-12 pr-4 py-3 brutal-border brutal-radius bg-gray-50 text-black placeholder-gray-500 caret-black',
                            'focus:bg-white focus:outline-none focus:ring-2 focus:ring-yellow',
                            'transition-all'
                          )}
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="email" className="block mb-2 font-medium">
                        Email
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="email"
                          id="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="you@example.com"
                          required
                          className={cn(
                            'w-full pl-12 pr-4 py-3 brutal-border brutal-radius bg-gray-50 text-black placeholder-gray-500 caret-black',
                            'focus:bg-white focus:outline-none focus:ring-2 focus:ring-yellow',
                            'transition-all'
                          )}
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="password" className="block mb-2 font-medium">
                        Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          id="password"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          placeholder="Min. 6 characters"
                          required
                          minLength={6}
                          className={cn(
                            'w-full pl-12 pr-12 py-3 brutal-border brutal-radius bg-gray-50 text-black placeholder-gray-500 caret-black',
                            'focus:bg-white focus:outline-none focus:ring-2 focus:ring-yellow',
                            'transition-all'
                          )}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((prev) => !prev)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 rounded border-2 border-black bg-white p-1"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <span className={cn('h-2 w-20 rounded-sm border-2 border-black', passwordStrength.color)} />
                        <span className="text-xs font-medium">{passwordStrength.label}</span>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="confirmPassword" className="block mb-2 font-medium">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          id="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                          placeholder="Repeat your password"
                          required
                          minLength={6}
                          className={cn(
                            'w-full pl-12 pr-12 py-3 brutal-border brutal-radius bg-gray-50 text-black placeholder-gray-500 caret-black',
                            'focus:bg-white focus:outline-none focus:ring-2 focus:ring-yellow',
                            'transition-all',
                            formData.confirmPassword && !passwordMatch && 'border-red border-2'
                          )}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword((prev) => !prev)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 rounded border-2 border-black bg-white p-1"
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {formData.confirmPassword && !passwordMatch && (
                        <p className="text-sm text-red mt-1">Passwords do not match</p>
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

                    <BrutalButton
                      type="submit"
                      color="yellow"
                      size="lg"
                      fullWidth
                      loading={isLoading}
                      disabled={!canSubmit}
                    >
                      {isLoading ? 'Creating account...' : 'Create Account'}
                      {!isLoading && <ArrowRight className="w-5 h-5 ml-2" />}
                    </BrutalButton>
                  </form>
                )}
              </BrutalCard>
            )}

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Already have an account?{' '}
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
