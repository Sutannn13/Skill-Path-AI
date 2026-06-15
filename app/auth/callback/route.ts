import { type NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'
  const safeNext = next.startsWith('/') && !next.startsWith('//') ? next : '/dashboard'

  // If there's no code, redirect to login with error
  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=auth_callback_missing_code`)
  }

  const supabase = await createSupabaseServerClient()

  if (!supabase) {
    // Supabase not configured, redirect to login
    return NextResponse.redirect(`${origin}/login?error=supabase_not_configured`)
  }

  try {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error || !data.user) {
      console.error('Auth callback error:', error)
      return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
    }

    // Check if user has completed onboarding
    const { data: profile } = await supabase
      .from('profiles')
      .select('onboarding_completed')
      .eq('id', data.user.id)
      .single()

    // Determine redirect based on onboarding status
    const redirectTo = profile?.onboarding_completed ? safeNext : '/onboarding'
    return NextResponse.redirect(`${origin}${redirectTo}`)
  } catch (err) {
    console.error('Auth callback exception:', err)
    return NextResponse.redirect(`${origin}/login?error=auth_callback_exception`)
  }
}
