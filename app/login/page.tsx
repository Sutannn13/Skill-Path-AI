'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Target, Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react'
import { createSupabaseBrowserClient } from '@/lib/supabase/browser'
import { BrutalCard, BrutalButton } from '@/components/brutal'
import { cn } from '@/lib/utils'

interface LoginFormData {
  email: string
  password: string
}

export default function LoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState<LoginFormData>({ email: '', password: '' })
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

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
      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-yellow/20 via-pink/10 to-blue/20" />
      </div>

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
      <main className="max-w-md mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="font-display font-bold text-3xl mb-2">Welcome Back</h1>
            <p className="text-gray-600">Sign in to continue your career journey</p>
          </div>

          {/* Form Card */}
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
                <div className="mt-6">
                  <Link href="/">
                    <BrutalButton variant="outline" color="black">
                      Back to Home
                    </BrutalButton>
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Input */}
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
                        'w-full pl-12 pr-4 py-3 brutal-border brutal-radius bg-gray-50',
                        'focus:bg-white focus:outline-none focus:ring-2 focus:ring-yellow',
                        'transition-all'
                      )}
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <label htmlFor="password" className="block mb-2 font-medium">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="password"
                      id="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Enter your password"
                      required
                      minLength={6}
                      className={cn(
                        'w-full pl-12 pr-4 py-3 brutal-border brutal-radius bg-gray-50',
                        'focus:bg-white focus:outline-none focus:ring-2 focus:ring-yellow',
                        'transition-all'
                      )}
                    />
                  </div>
                </div>

                {/* Error Message */}
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

                {/* Submit Button */}
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

          {/* Footer Links */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Do not have an account?{' '}
              <Link href="/register" className="font-bold text-black hover:underline">
                Create one
              </Link>
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  )
}