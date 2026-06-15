'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { createSupabaseBrowserClient } from '@/lib/supabase/browser'
import { BrutalButton } from '@/components/brutal'
import { cn } from '@/lib/utils'
import { clearUserProfile } from '@/lib/user/profile'

interface LogoutButtonProps {
  variant?: 'button' | 'link'
  color?: 'yellow' | 'blue' | 'pink' | 'green' | 'orange' | 'purple' | 'black' | 'white' | 'red' | 'gray'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  redirectTo?: string
}

export function LogoutButton({
  variant = 'button',
  color = 'black',
  size = 'sm',
  className,
  redirectTo = '/login',
}: LogoutButtonProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const supabase = createSupabaseBrowserClient()

  const handleLogout = async () => {
    setIsLoading(true)
    setErrorMessage(null)

    try {
      if (supabase) {
        const { error } = await supabase.auth.signOut()

        if (error) {
          throw error
        }
      }

      if (typeof window !== 'undefined') {
        clearUserProfile()
        localStorage.removeItem('skillpath_notes')
        localStorage.removeItem('skillpath_checklist')
      }

      router.push(redirectTo)
      router.refresh()
    } catch (error) {
      console.error('[Auth] Failed to sign out:', error)
      setErrorMessage('Failed to sign out. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <div className={cn('flex flex-col items-start gap-1', className)}>
      <BrutalButton
        onClick={handleLogout}
        variant={variant === 'link' ? 'ghost' : 'outline'}
        color={color}
        size={size}
        loading={isLoading}
        disabled={isLoading}
      >
        <LogOut className="w-4 h-4" />
        {isLoading ? 'Signing out...' : 'Logout'}
      </BrutalButton>

      {errorMessage && (
        <p className="text-xs font-medium text-red">{errorMessage}</p>
      )}
    </div>
  )
}
