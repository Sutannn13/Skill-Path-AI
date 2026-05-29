'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Target, Mail, Lock, AlertCircle, ArrowRight, Eye, EyeOff, ArrowLeft, Rocket } from 'lucide-react'
import { createSupabaseBrowserClient } from '@/lib/supabase/browser'
import { BrutalCard, BrutalButton, StickerBadge } from '@/components/brutal'
import { cn } from '@/lib/utils'
import { AnimatedBrutalBackground, BrutalBackgroundStyles } from '@/components/illustrations/animated-brutal-background'
import { AnimatedCatMascot } from '@/components/illustrations/animated-cat-mascot'

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

  const supabase = useMemo(() => createSupabaseBrowserClient(), [])

  useEffect(() => {
    let isActive = true

    const redirectAuthenticatedUser = async () => {
      if (!supabase) return

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (isActive && user) {
        router.replace('/dashboard')
      }
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

      const nextPath = typeof window !== 'undefined'
        ? new URLSearchParams(window.location.search).get('next')
        : null
      const redirectTo = nextPath?.startsWith('/') && !nextPath.startsWith('//')
        ? nextPath
        : '/dashboard'
      router.push(redirectTo)
      router.refresh()
    } catch (err) {
      setError('Something went wrong. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <BrutalBackgroundStyles />
      <AnimatedBrutalBackground variant="login" intensity="high" showDoodles />

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
          <StickerBadge variant="blue" label="Welcome Back" size="sm" />
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
          {/* Welcome Panel */}
          <BrutalCard color="yellow" shadow="lg" className="relative hidden p-8 lg:col-span-2 lg:block overflow-hidden">
            <div className="relative z-10">
              <div className="mb-6">
                <AnimatedCatMascot
                  size="xl"
                  mood="happy"
                  animated={true}
                  withMessage="Welcome back!"
                />
              </div>
              <h2 className="font-display text-2xl font-bold mb-2">Welcome Back, Hero!</h2>
              <p className="text-sm text-black/70 mb-4">
                Continue your roadmap, finish quests, and level up your developer career.
              </p>
              <div className="flex flex-wrap gap-2">
                <StickerBadge variant="completed" label="Roadmap" size="sm" />
                <StickerBadge variant="in-progress" label="Quiz" size="sm" />
                <StickerBadge variant="blue" label="Jobs" size="sm" />
              </div>
            </div>
            {/* Decorative shapes */}
            <div className="absolute -top-3 -right-3 w-12 h-12 bg-pink brutal-border brutal-radius opacity-40 animate-wiggle" />
            <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-blue brutal-border brutal-radius opacity-30 animate-float" />
            <div className="absolute top-1/2 right-2 w-6 h-6 bg-green brutal-border rounded-full opacity-30 animate-bounce" />
            <div className="absolute bottom-4 right-4 w-8 h-8 bg-orange brutal-border brutal-radius opacity-20 animate-float-slow" />
          </BrutalCard>

          {/* Login Form */}
          <div className="lg:col-span-3">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Rocket className="w-6 h-6 text-yellow" />
                  <h1 className="font-display text-3xl font-black">Login to Your Quest</h1>
                </div>
                <p className="text-gray-600">Sign in to continue your developer journey</p>
              </div>
              <Link href="/">
                <BrutalButton variant="outline" color="black" size="sm">
                  <ArrowLeft className="mr-1 h-4 w-4" />
                  Home
                </BrutalButton>
              </Link>
            </div>

            <BrutalCard color="white" shadow="lg" className="p-8 relative overflow-hidden">
              {/* Corner decorations */}
              <div className="absolute top-0 right-0 w-16 h-16 bg-yellow/10 brutal-border brutal-radius" style={{ borderBottomLeftRadius: '100%' }} />
              <div className="absolute bottom-0 left-0 w-12 h-12 bg-pink/10" style={{ borderTopRightRadius: '100%' }} />

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
                        placeholder="Enter your password"
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
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded border-2 border-black bg-white p-1"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
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
                    disabled={isLoading}
                  >
                    {isLoading ? 'Signing in...' : 'Login'}
                    {!isLoading && <ArrowRight className="w-5 h-5 ml-2" />}
                  </BrutalButton>
                </form>
              )}
            </BrutalCard>

            <div className="mt-6 text-center space-y-2">
              <p className="text-gray-600">
                Do not have an account?{' '}
                <Link href="/register" className="font-bold text-black hover:underline">
                  Create one
                </Link>
              </p>
              <Link href="/forgot-password" className="block text-sm text-gray-500 hover:text-black transition-colors">
                Forgot your password?
              </Link>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  )
}
