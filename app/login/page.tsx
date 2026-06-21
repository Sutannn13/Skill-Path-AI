'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, Lock, AlertCircle, ArrowRight, ArrowLeft, Rocket, Github } from 'lucide-react'
import { createSupabaseBrowserClient } from '@/lib/supabase/browser'
import {
  getDisabledOAuthProviderMessage,
  getOAuthProviderAvailability,
  isOAuthProviderConfigured,
} from '@/lib/supabase/oauth-providers'
import { BrutalCard, BrutalButton, StickerBadge } from '@/components/brutal'
import { AuthFormLayout, AuthInput, PasswordToggle, AuthError } from '@/components/auth/auth-form-layout'
import { ResumeSessionCard } from '@/components/auth/auth-quest-panel'
import type { CatMascotMood } from '@/components/illustrations/animated-cat-mascot'

interface LoginFormData {
  email: string
  password: string
}

export default function LoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState<LoginFormData>({ email: '', password: '' })
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [focusedField, setFocusedField] = useState<'email' | 'password' | null>(null)
  const [oauthLoading, setOauthLoading] = useState<'github' | 'google' | null>(null)

  const mascotMood: CatMascotMood =
    focusedField === 'password' && !showPassword ? 'sleepy' : focusedField === 'email' ? 'focus' : 'happy'

  const supabase = useMemo(() => createSupabaseBrowserClient(), [])

  useEffect(() => {
    let isActive = true
    const redirectAuthenticatedUser = async () => {
      if (!supabase) return
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (isActive && user) router.replace('/dashboard')
    }
    redirectAuthenticatedUser()
    return () => {
      isActive = false
    }
  }, [router, supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    if (!supabase) {
      setError('Supabase is not configured yet. Please set up your environment variables.')
      setIsLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      })
      if (error) {
        setError('Invalid email or password. Please try again.')
        setIsLoading(false)
        return
      }
      const nextPath =
        typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('next') : null
      const redirectTo = nextPath?.startsWith('/') && !nextPath.startsWith('//') ? nextPath : '/dashboard'
      router.push(redirectTo)
      router.refresh()
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
      routeTab="SKILLPATH://LOGIN"
      urlPill="app.skillpath.dev/login"
      litDot="green"
      sceneAccent="blue"
      sceneCaption="Resume your save"
      catMood={mascotMood}
      catMessage={mascotMood === 'sleepy' ? 'No peeking!' : 'Welcome back!'}
      headerRight={<StickerBadge variant="blue" label="Welcome Back" size="sm" />}
      welcome={
        <div className="space-y-4">
          <div>
            <h2 className="font-display text-xl font-bold">Continue your quest</h2>
            <p className="mt-1 text-sm text-secondary">
              Pick up your roadmap, quizzes, and job matches right where you left off.
            </p>
          </div>
          <ResumeSessionCard />
        </div>
      }
      footer={
        <div className="space-y-2">
          <p className="text-secondary">
            Do not have an account?{' '}
            <Link href="/register" className="font-bold text-black underline rounded focus-brutal-ring">
              Create one
            </Link>
          </p>
          <Link
            href="/forgot-password"
            className="inline-block text-sm text-secondary hover:text-black transition-colors rounded focus-brutal-ring"
          >
            Forgot your password?
          </Link>
        </div>
      }
    >
      <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Rocket className="w-6 h-6 text-pink-dark" aria-hidden="true" />
            <h1 className="font-display text-3xl font-black">Welcome Back</h1>
          </div>
          <p className="text-secondary">Sign in to continue your developer quest</p>
        </div>
        <Link href="/">
          <BrutalButton variant="outline" color="black" size="sm">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Home
          </BrutalButton>
        </Link>
      </div>

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

            <AuthInput
              id="password"
              type={showPassword ? 'text' : 'password'}
              label="Password"
              icon={Lock}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              onFocus={() => setFocusedField('password')}
              onBlur={() => setFocusedField(null)}
              placeholder="Enter your password"
              autoComplete="current-password"
              minLength={6}
              required
              trailing={<PasswordToggle shown={showPassword} onToggle={() => setShowPassword((p) => !p)} />}
            />

            {error && <AuthError message={error} />}

            <label htmlFor="remember" className="flex min-h-[44px] cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                id="remember"
                className="h-5 w-5 brutal-border brutal-radius accent-yellow cursor-pointer focus-brutal-ring"
              />
              <span className="text-sm font-bold">Remember me</span>
            </label>

            <BrutalButton type="submit" color="yellow" size="lg" fullWidth loading={isLoading} disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Login'}
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
    </AuthFormLayout>
  )
}
