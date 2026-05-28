'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Target, Mail, Lock, AlertCircle, ArrowRight, Eye, EyeOff, ArrowLeft } from 'lucide-react'
import { createSupabaseBrowserClient } from '@/lib/supabase/browser'
import { BrutalCard, BrutalButton } from '@/components/brutal'
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

  const supabase = createSupabaseBrowserClient()

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

      // Redirect to dashboard on success
      router.push('/dashboard')
      router.refresh()
    } catch (err) {
      setError('Something went wrong. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <BrutalBackgroundStyles />
      <AnimatedBrutalBackground variant="login" intensity="high" showDoodles />

      {/* Header */}
      <header className="border-b-3 border-black bg-white">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow brutal-border brutal-radius flex items-center justify-center">
              <Target className="w-6 h-6" />
            </div>
            <span className="font-display font-bold text-xl">SkillPath</span>
          </Link>
          <Link href="/register">
            <BrutalButton variant="ghost" color="black" size="sm">
              Create Account
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
          <BrutalCard color="yellow" shadow="lg" className="relative hidden p-8 lg:col-span-2 lg:block overflow-hidden">
            <div className="relative z-10">
              <div className="mb-4">
                <AnimatedCatMascot
                  size="xl"
                  mood="focus"
                  animated={true}
                  withMessage="Welcome back!"
                />
              </div>
              <h2 className="font-display text-2xl font-bold">Welcome Back</h2>
              <p className="mt-2 text-sm text-black/70">
                Continue your roadmap, finish quizzes, and ship your next project milestone.
              </p>
            </div>
            {/* Decorative shapes */}
            <div className="absolute -top-3 -right-3 w-12 h-12 bg-pink brutal-border brutal-radius opacity-40 animate-wiggle" />
            <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-blue brutal-border brutal-radius opacity-30 animate-float" />
            <div className="absolute top-1/2 right-2 w-6 h-6 bg-green brutal-border rounded-full opacity-30 animate-bounce" />
          </BrutalCard>

          <div className="lg:col-span-3">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="font-display text-3xl font-bold">Login</h1>
                <p className="text-gray-600">Sign in to continue your career journey</p>
              </div>
              <Link href="/">
                <BrutalButton variant="outline" color="black" size="sm">
                  <ArrowLeft className="mr-1 h-4 w-4" />
                  Back to Home
                </BrutalButton>
              </Link>
            </div>

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
