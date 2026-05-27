'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, Loader2 } from 'lucide-react'
import { createSupabaseBrowserClient } from '@/lib/supabase/browser'
import { BrutalButton } from '@/components/brutal'

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

  const supabase = createSupabaseBrowserClient()

  const handleLogout = async () => {
    setIsLoading(true)

    if (supabase) {
      await supabase.auth.signOut()
    }

    // Clear local storage profile data
    if (typeof window !== 'undefined') {
      localStorage.removeItem('skillpath_profile')
      localStorage.removeItem('skillpath_user_skills')
      localStorage.removeItem('skillpath_onboarding_completed')
      localStorage.removeItem('skillpath_user_profile')
    }

    router.push(redirectTo)
    router.refresh()
  }

  return (
    <BrutalButton
      onClick={handleLogout}
      variant={variant === 'link' ? 'ghost' : 'outline'}
      color={color}
      size={size}
      loading={isLoading}
      className={className}
      disabled={isLoading}
    >
      <LogOut className="w-4 h-4" />
      {isLoading ? 'Signing out...' : 'Logout'}
    </BrutalButton>
  )
}