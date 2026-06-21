'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, Lock, User, AlertCircle, CheckCircle, ArrowRight, ArrowLeft, Rocket, Star, Github } from 'lucide-react'
import { createSupabaseBrowserClient } from '@/lib/supabase/browser'
import {
  getDisabledOAuthProviderMessage,
  getOAuthProviderAvailability,
  isOAuthProviderConfigured,
} from '@/lib/supabase/oauth-providers'
import { BrutalCard, BrutalButton, StickerBadge } from '@/components/brutal'
import { AuthFormLayout, AuthInput, PasswordToggle, AuthError } from '@/components/auth/auth-form-layout'
import { CharacterCreationCard } from '@/components/auth/auth-quest-panel'
import { cn } from '@/lib/utils'
import type { CatMascotMood } from '@/components/illustrations/animated-cat-mascot'

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
  const metCount = rules.filter((r) => r.met).length
  const strength = metCount <= 2 ? 'Weak' : metCount <= 4 ? 'Medium' : 'Strong'
  const color = metCount <= 2 ? 'text-red-dark' : metCount <= 4 ? 'text-orange' : 'text-green-dark'
  return { rules, strength, color }
}

const benefits = ['Your Personalized Roadmap', 'Quiz Progress Saved', 'Job Match Alerts', 'Project Review Feedback']

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

  const mascotMood: CatMascotMood =
    (focusedField === 'password' || focusedField === 'confirmPassword') && !showPassword
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
        options: { data: { full_name: formData.fullName } },
      })

      if (signUpError) {
        setError(signUpError.message || 'Failed to create account. Please try again.')
        setIsLoading(false)
        return
      }

      if (data.session && data.user) {
        await supabase.from('profiles').upsert({
          id: data.user.id,
          full_name: formData.fullName,
          role: 'user',
          onboarding_completed: false,
        })
        router.push('/onboarding')
        router.refresh()
      } else {
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
      const availability = await getOAuthProviderAvailability(provider)
      if (availability === 'disabled') {
        setError(getDisabledOAuthProviderMessage(provider))
        setOauthLoading(null)
        return
      }
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: `${window.location.origin}/auth/callback` },
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
    <AuthFormLayout
      routeTab="SKILLPATH://NEW-GAME"
      urlPill="app.skillpath.dev/signup"
      sceneAccent="green"
      sceneCaption="New player · Slot 1"
      catMood={mascotMood}
      catMessage={mascotMood === 'sleepy' ? 'A secret!' : "Let's go!"}
      headerRight={
        <Link href="/login">
          <BrutalButton variant="ghost" color="black" size="sm">
            Sign In
          </BrutalButton>
        </Link>
      }
      welcome={
        <div className="space-y-4">
          <div>
            <h2 className="font-display text-xl font-bold">Start a new game</h2>
            <p className="mt-1 text-sm text-secondary">
              Create your developer hero and unlock your roadmap, quizzes, and job radar.
            </p>
          </div>
          <CharacterCreationCard />
          <div className="space-y-2">
            {benefits.map((benefit) => (
              <div key={benefit} className="flex items-center gap-2">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center bg-green brutal-border brutal-radius">
                  <CheckCircle className="h-4 w-4" aria-hidden="true" />
                </div>
                <span className="text-sm">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      }
      footer={
        !success ? (
          <p className="text-secondary">
            Already have an account?{' '}
            <Link href="/login" className="font-bold text-black underline rounded focus-brutal-ring">
              Sign in
            </Link>
          </p>
        ) : undefined
      }
    >
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <StickerBadge variant="yellow" label="Account Setup" size="sm" />
            <StickerBadge variant="pink" label="Credentials" size="sm" />
          </div>
          <div className="flex items-center gap-2 mb-1">
            <Rocket className="w-6 h-6 text-pink-dark" aria-hidden="true" />
            <h1 className="font-display text-3xl font-black">Create Your Account</h1>
          </div>
          <p className="text-secondary">Start your adventure with SkillPath</p>
        </div>
        <Link href="/">
          <BrutalButton variant="outline" color="black" size="sm">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Home
          </BrutalButton>
        </Link>
      </div>

      {success ? (
        <BrutalCard color="green" shadow="lg" className="p-8 text-center">
          <div className="w-20 h-20 bg-green/20 brutal-border brutal-radius flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">🎉</span>
          </div>
          <StickerBadge variant="completed" label="Email Sent!" size="lg" className="mb-4 inline-flex" />
          <h3 className="font-display font-bold text-2xl mb-2">Check Your Inbox!</h3>
          <p className="text-secondary mb-6 break-words">
            We have sent a confirmation link to <strong className="text-black">{formData.email}</strong>. Click the link
            to activate your hero!
          </p>
          <Link href="/login">
            <BrutalButton color="green">
              <Star className="w-4 h-4" aria-hidden="true" />
              Back to Login
            </BrutalButton>
          </Link>
        </BrutalCard>
      ) : (
        <BrutalCard color="white" shadow="lg" className="p-6">
          {!supabase ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-yellow/20 brutal-border brutal-radius flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-orange" aria-hidden="true" />
              </div>
              <h3 className="font-display font-bold text-xl mb-2">Supabase Not Configured</h3>
              <p className="text-secondary mb-6">
                Please set up your Supabase environment variables to enable authentication.
              </p>
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
              <AuthInput
                id="fullName"
                type="text"
                label="Full Name"
                icon={User}
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                onFocus={() => setFocusedField('fullName')}
                onBlur={() => setFocusedField(null)}
                placeholder="John Doe"
                autoComplete="name"
                required
              />

              <AuthInput
                id="email"
                type="email"
                label="Email"
                icon={Mail}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                placeholder="you@example.com"
                autoComplete="email"
                required
              />

              <div>
                <AuthInput
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  label="Password"
                  icon={Lock}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Min. 8 characters"
                  autoComplete="new-password"
                  minLength={8}
                  required
                  trailing={<PasswordToggle shown={showPassword} onToggle={() => setShowPassword((p) => !p)} />}
                />
                <div className="mt-3 flex flex-col gap-2">
                  <span className={cn('text-xs font-bold uppercase', passwordStrength.color)}>
                    Strength: {passwordStrength.strength}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {passwordStrength.rules.map((rule) => (
                      <StickerBadge
                        key={rule.label}
                        variant={rule.met ? 'green' : 'gray'}
                        label={rule.label}
                        size="sm"
                        className={cn('transition-all duration-300', !rule.met && 'opacity-60')}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <AuthInput
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  label="Confirm Password"
                  icon={Lock}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  onFocus={() => setFocusedField('confirmPassword')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Repeat your password"
                  autoComplete="new-password"
                  minLength={8}
                  required
                  invalid={Boolean(formData.confirmPassword) && !passwordMatch}
                  trailing={
                    <PasswordToggle
                      shown={showConfirmPassword}
                      onToggle={() => setShowConfirmPassword((p) => !p)}
                      label="confirm password"
                    />
                  }
                />
                {formData.confirmPassword && !passwordMatch && (
                  <p className="text-sm font-medium text-red-dark mt-1">Passwords do not match</p>
                )}
              </div>

              {error && <AuthError message={error} />}

              <BrutalButton type="submit" color="yellow" size="lg" fullWidth loading={isLoading} disabled={!canSubmit}>
                {isLoading ? 'Creating account...' : 'Create Account'}
                {!isLoading && <ArrowRight className="w-5 h-5" aria-hidden="true" />}
              </BrutalButton>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t-3 border-black" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white px-4 font-bold text-sm">OR</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <BrutalButton
                  variant="outline"
                  color="black"
                  className="w-full shadow-brutal-sm hover:shadow-brutal"
                  onClick={() => handleOAuthLogin('github')}
                  disabled={oauthLoading !== null || !isOAuthProviderConfigured('github')}
                  loading={oauthLoading === 'github'}
                >
                  <Github className="w-5 h-5" aria-hidden="true" />
                  {isOAuthProviderConfigured('github') ? 'GitHub' : 'Unavailable'}
                </BrutalButton>
                <BrutalButton
                  variant="outline"
                  color="black"
                  className="w-full shadow-brutal-sm hover:shadow-brutal"
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
    </AuthFormLayout>
  )
}
