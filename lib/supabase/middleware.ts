import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'
import { getSupabaseConfig } from './config'

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
]

const authRoutePrefixes = ['/login', '/register']

function matchesRoutePrefix(pathname: string, prefixes: string[]) {
  return prefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))
}

function copyResponseCookies(source: NextResponse, target: NextResponse) {
  source.cookies.getAll().forEach((cookie) => {
    target.cookies.set(cookie)
  })
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

  if (user && matchesRoutePrefix(pathname, authRoutePrefixes)) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/dashboard'
    redirectUrl.search = ''

    const redirectResponse = NextResponse.redirect(redirectUrl)
    copyResponseCookies(response, redirectResponse)
    return redirectResponse
  }

  if (!user && matchesRoutePrefix(pathname, protectedRoutePrefixes)) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/login'
    redirectUrl.searchParams.set('next', `${pathname}${request.nextUrl.search}`)

    const redirectResponse = NextResponse.redirect(redirectUrl)
    copyResponseCookies(response, redirectResponse)
    return redirectResponse
  }

  return response
}
