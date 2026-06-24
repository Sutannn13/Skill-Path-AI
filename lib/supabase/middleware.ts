import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'
import { getSupabaseConfig } from './config'
import { canAccessAdmin, isUserRole } from '@/lib/auth/roles'

const protectedRoutePrefixes = [
  '/dashboard',
  '/onboarding',
  '/skills',
  '/jobs',
  '/roadmap',
  '/sprint',
  '/github',
  '/settings',
  '/projects',
  '/admin',
]

const adminRoutePrefixes = ['/admin', '/api/admin']

function matchesRoutePrefix(pathname: string, prefixes: string[]) {
  return prefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))
}

function copyResponseCookies(source: NextResponse, target: NextResponse) {
  source.cookies.getAll().forEach((cookie) => {
    target.cookies.set(cookie)
  })
}

function createForbiddenResponse(request: NextRequest, response: NextResponse) {
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const forbiddenResponse = NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    copyResponseCookies(response, forbiddenResponse)
    return forbiddenResponse
  }

  const redirectUrl = request.nextUrl.clone()
  redirectUrl.pathname = '/dashboard'
  redirectUrl.search = ''

  const redirectResponse = NextResponse.redirect(redirectUrl)
  copyResponseCookies(response, redirectResponse)
  return redirectResponse
}

export async function updateSupabaseSession(request: NextRequest) {
  const config = getSupabaseConfig()

  if (!config) {
    return NextResponse.next({ request })
  }

  let response = NextResponse.next({ request })

  const supabase = createServerClient(config.url, config.anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet, headersToSet) {
        response = NextResponse.next({ request })

        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options)
        })

        Object.entries(headersToSet).forEach(([key, value]) => {
          response.headers.set(key, value)
        })
      },
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  // NOTE: we intentionally do NOT redirect an authenticated user away from
  // /login or /register. Pressing "Sign In" must always present the login form
  // and require fresh credentials — a session left active (closed tab without
  // logging out) must not grant a free pass back in. The /login page clears any
  // stale session on load.

  if (!user && matchesRoutePrefix(pathname, protectedRoutePrefixes)) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/login'
    redirectUrl.searchParams.set('next', `${pathname}${request.nextUrl.search}`)

    const redirectResponse = NextResponse.redirect(redirectUrl)
    copyResponseCookies(response, redirectResponse)
    return redirectResponse
  }

  if (user && matchesRoutePrefix(pathname, adminRoutePrefixes)) {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()

    if (profileError) {
      console.error('[Middleware] Failed to load profile role:', profileError.message)
      return createForbiddenResponse(request, response)
    }

    const role = isUserRole(profile?.role) ? profile.role : null

    if (!canAccessAdmin(role)) {
      return createForbiddenResponse(request, response)
    }
  }

  return response
}
