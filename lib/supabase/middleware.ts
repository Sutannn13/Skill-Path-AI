import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'
import { getSupabaseConfig } from './config'

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

  await supabase.auth.getUser()

  return response
}
