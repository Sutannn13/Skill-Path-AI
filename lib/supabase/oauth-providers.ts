import { getSupabaseConfig } from '@/lib/supabase/config'

export type OAuthProvider = 'github' | 'google'
export type OAuthProviderAvailability = 'enabled' | 'disabled' | 'unknown'

const DEFAULT_OAUTH_PROVIDERS: OAuthProvider[] = ['google']

function getConfiguredOAuthProviders() {
  const configuredProviders = process.env.NEXT_PUBLIC_SUPABASE_OAUTH_PROVIDERS
    ?.split(',')
    .map((provider) => provider.trim().toLowerCase())
    .filter((provider): provider is OAuthProvider =>
      provider === 'github' || provider === 'google'
    )

  return new Set(
    configuredProviders && configuredProviders.length > 0
      ? configuredProviders
      : DEFAULT_OAUTH_PROVIDERS
  )
}

export function isOAuthProviderConfigured(provider: OAuthProvider) {
  return getConfiguredOAuthProviders().has(provider)
}

export async function getOAuthProviderAvailability(
  provider: OAuthProvider
): Promise<OAuthProviderAvailability> {
  if (!isOAuthProviderConfigured(provider)) return 'disabled'

  const config = getSupabaseConfig()
  if (!config) return 'unknown'

  try {
    const response = await fetch(`${config.url}/auth/v1/settings`, {
      headers: {
        apikey: config.anonKey,
      },
      cache: 'no-store',
    })

    if (!response.ok) return 'unknown'

    const settings = await response.json() as {
      external?: Record<string, boolean>
      [key: string]: unknown
    }
    const externalValue = settings.external?.[provider]
    if (typeof externalValue === 'boolean') {
      return externalValue ? 'enabled' : 'disabled'
    }

    const legacyValue = settings[`${provider}_enabled`]
    if (typeof legacyValue === 'boolean') {
      return legacyValue ? 'enabled' : 'disabled'
    }

    return 'unknown'
  } catch {
    return 'unknown'
  }
}

export function getDisabledOAuthProviderMessage(provider: OAuthProvider) {
  const label = provider === 'github' ? 'GitHub' : 'Google'
  return `${label} sign-in is not enabled in Supabase Auth. Enable the provider and configure its OAuth credentials before using this button.`
}
