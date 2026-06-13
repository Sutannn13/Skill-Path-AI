'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Target, Mail, Lock, User, AlertCircle, CheckCircle, ArrowRight, Eye, EyeOff, ArrowLeft, Rocket, Star, Github } from 'lucide-react'
import { createSupabaseBrowserClient } from '@/lib/supabase/browser'
import { BrutalCard, BrutalButton, StickerBadge } from '@/components/brutal'
import { cn } from '@/lib/utils'
import { AnimatedBrutalBackground, BrutalBackgroundStyles } from '@/components/illustrations/animated-brutal-background'
import { AnimatedCatMascot, CatMascotMood } from '@/components/illustrations/animated-cat-mascot'

interface RegisterFormData {
  fullName: string
  email: string
  password: string
  confirmPassword: string
}

function getPasswordStrength(password: string) {
  const rules = [
    { label: '8+ Chars', met: password.length >= 8 },
    { label: 'Upper', met: /[A-Z]/.test(password) },
    { label: 'Lower', met: /[a-z]/.test(password) },
    { label: 'Number', met: /\d/.test(password) },
    { label: 'Special', met: /[^A-Za-z0-9]/.test(password) },
  ]
  const metCount = rules.filter(r => r.met).length
  const strength = metCount <= 2 ? 'Weak' : metCount <= 4 ? 'Medium' : 'Strong'
  const color = metCount <= 2 ? 'text-red' : metCount <= 4 ? 'text-yellow' : 'text-green'
  return { rules, strength, color }
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
  const [focusedField, setFocusedField] = useState<'fullName' | 'email' | 'password' | 'confirmPassword' | null>(null)
  const [oauthLoading, setOauthLoading] = useState<'github' | 'google' | null>(null)

  const mascotMood: CatMascotMood = (focusedField === 'password' || focusedField === 'confirmPassword') && !showPassword 
    ? 'sleepy' 
    : focusedField === 'email' || focusedField === 'fullName'
      ? 'focus' 
      : 'cheer'

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
        console.error('Sign up error:', signUpError)
        setError(signUpError.message || 'Failed to create account. Please try again.')
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

  const handleOAuthLogin = async (provider: 'github' | 'google') => {
    if (!supabase) {
      setError('Supabase is not configured. Cannot sign in with OAuth.')
      return
    }
    setOauthLoading(provider)
    setError(null)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) {
        setError(error.message)
        setOauthLoading(null)
      }
    } catch (err) {
      setError('OAuth sign-in failed. Please try again.')
      setOauthLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <BrutalBackgroundStyles />
      <AnimatedBrutalBackground variant="register" intensity="high" showDoodles />

      {/* Header */}
      <header className="border-b-3 border-black bg-white/90 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 bg-yellow brutal-border brutal-radius flex items-center justify-center shadow-brutal-sm group-hover:shadow-brutal transition-all">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <span className="font-display font-bold text-xl">SkillPath</span>
              <span className="text-[10px] text-black/50 block">Career OS</span>
            </div>
          </Link>
          <Link href="/login">
            <BrutalButton variant="ghost" color="black" size="sm">
              Sign In
            </BrutalButton>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-6xl px-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="grid gap-6 lg:grid-cols-5 items-start"
        >
          {/* Welcome Panel - Create Your Hero */}
          <BrutalCard color="pink" shadow="lg" className="relative hidden p-8 lg:col-span-2 lg:block overflow-hidden">
            <div className="relative z-10">
              <div className="mb-6">
                <AnimatedCatMascot
                  size="xl"
                  mood={mascotMood}
                  animated={true}
                  withMessage={mascotMood === 'sleepy' ? "A secret!" : "Create your Hero!"}
                />
              </div>
              <h2 className="font-display text-2xl font-bold mb-2">Create Your Developer Hero</h2>
              <p className="text-sm text-black/70 mb-4">
                Build your learning roadmap, pass quiz challenges, and submit portfolio projects.
              </p>
              {/* Benefits */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-green brutal-border brutal-radius flex items-center justify-center">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <span className="text-sm">Your Personalized Roadmap</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-green brutal-border brutal-radius flex items-center justify-center">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <span className="text-sm">Quiz Progress Saved</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-green brutal-border brutal-radius flex items-center justify-center">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <span className="text-sm">Job Match Alerts</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-green brutal-border brutal-radius flex items-center justify-center">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <span className="text-sm">Project Review Feedback</span>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <StickerBadge variant="blue" label="AI Gen Roadmap" size="sm" />
                <StickerBadge variant="green" label="Free" size="sm" />
              </div>
            </div>
            {/* Decorative shapes */}
            <div className="absolute -top-3 -left-3 w-12 h-12 bg-yellow brutal-border brutal-radius opacity-40 animate-wiggle" />
            <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-green brutal-border brutal-radius opacity-30 animate-float" />
            <div className="absolute top-1/3 left-4 w-8 h-8 bg-blue brutal-border rounded-full opacity-30 animate-bounce" />
          </BrutalCard>

          <div className="lg:col-span-3">
            <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <StickerBadge variant="yellow" label="Character Setup" size="sm" />
                  <StickerBadge variant="pink" label="Credentials" size="sm" />
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <Rocket className="w-6 h-6 text-pink" />
                  <h1 className="font-display text-3xl font-black">Character Creation</h1>
                </div>
                <p className="text-gray-600">Start your adventure with SkillPath</p>
              </div>
              <Link href="/">
                <BrutalButton variant="outline" color="black" size="sm">
                  <ArrowLeft className="mr-1 h-4 w-4" />
                  Home
                </BrutalButton>
              </Link>
            </div>

            {success ? (
              <BrutalCard color="green" shadow="lg" className="p-8 text-center">
                <div className="w-20 h-20 bg-green/20 brutal-border brutal-radius flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">🎉</span>
                </div>
                <StickerBadge variant="completed" label="Email Sent!" size="lg" className="mb-4 inline-block" />
                <h3 className="font-display font-bold text-2xl mb-2">Check Your Inbox!</h3>
                <p className="text-gray-600 mb-6">
                  We have sent a confirmation link to <strong>{formData.email}</strong>.
                  Click the link to activate your hero!
                </p>
                <Link href="/login">
                  <BrutalButton color="green">
                    <Star className="w-4 h-4 mr-2" />
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
                          onFocus={() => setFocusedField('fullName')}
                          onBlur={() => setFocusedField(null)}
                          placeholder="John Doe"
                          required
                          className={cn(
                            'w-full pl-12 pr-4 py-3 brutal-border brutal-radius brutal-input-focus bg-gray-50 text-black placeholder-gray-500 caret-black',
                            'focus:bg-white focus:outline-none focus:ring-4 focus:ring-yellow focus:border-black',
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
                          onFocus={() => setFocusedField('email')}
                          onBlur={() => setFocusedField(null)}
                          placeholder="you@example.com"
                          required
                          className={cn(
                            'w-full pl-12 pr-4 py-3 brutal-border brutal-radius brutal-input-focus bg-gray-50 text-black placeholder-gray-500 caret-black',
                            'focus:bg-white focus:outline-none focus:ring-4 focus:ring-yellow focus:border-black',
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
                          onFocus={() => setFocusedField('password')}
                          onBlur={() => setFocusedField(null)}
                          placeholder="Min. 8 characters"
                          required
                          minLength={8}
                          className={cn(
                            'w-full pl-12 pr-12 py-3 brutal-border brutal-radius brutal-input-focus bg-gray-50 text-black placeholder-gray-500 caret-black',
                            'focus:bg-white focus:outline-none focus:ring-4 focus:ring-yellow focus:border-black',
                            'transition-all'
                          )}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((prev) => !prev)}
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                          className="absolute right-3 top-1/2 -translate-y-1/2 rounded border-2 border-black bg-white p-1"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      <div className="mt-3 flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <span className={cn('text-xs font-bold uppercase', passwordStrength.color)}>Strength: {passwordStrength.strength}</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {passwordStrength.rules.map((rule) => (
                            <StickerBadge 
                              key={rule.label} 
                              variant={rule.met ? 'green' : 'gray'} 
                              label={rule.label} 
                              size="sm" 
                              className={cn("transition-all duration-300", !rule.met && "opacity-50 grayscale")}
                            />
                          ))}
                        </div>
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
                          onFocus={() => setFocusedField('confirmPassword')}
                          onBlur={() => setFocusedField(null)}
                          placeholder="Repeat your password"
                          required
                          minLength={8}
                          className={cn(
                            'w-full pl-12 pr-12 py-3 brutal-border brutal-radius brutal-input-focus bg-gray-50 text-black placeholder-gray-500 caret-black',
                            'focus:bg-white focus:outline-none focus:ring-4 focus:ring-yellow focus:border-black',
                            'transition-all',
                            formData.confirmPassword && !passwordMatch && 'border-red border-2'
                          )}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword((prev) => !prev)}
                          aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
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
                      className="active:translate-y-[2px] active:translate-x-[2px] active:shadow-none"
                    >
                      {isLoading ? 'Creating account...' : 'Create Account'}
                      {!isLoading && <ArrowRight className="w-5 h-5 ml-2" />}
                    </BrutalButton>

                    <div className="relative my-6">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t-3 border-black"></div>
                      </div>
                      <div className="relative flex justify-center">
                        <span className="bg-white px-4 font-bold text-sm">OR</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <BrutalButton 
                        variant="outline" color="black" 
                        className="w-full shadow-brutal-sm hover:shadow-brutal active:translate-y-[2px] active:translate-x-[2px] active:shadow-none"
                        onClick={() => handleOAuthLogin('github')}
                        disabled={oauthLoading !== null}
                        loading={oauthLoading === 'github'}
                      >
                        <Github className="w-5 h-5 mr-2" />
                        GitHub
                      </BrutalButton>
                      <BrutalButton 
                        variant="outline" color="black" 
                        className="w-full shadow-brutal-sm hover:shadow-brutal active:translate-y-[2px] active:translate-x-[2px] active:shadow-none"
                        onClick={() => handleOAuthLogin('google')}
                        disabled={oauthLoading !== null}
                        loading={oauthLoading === 'google'}
                      >
                        Google
                      </BrutalButton>
                    </div>
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
