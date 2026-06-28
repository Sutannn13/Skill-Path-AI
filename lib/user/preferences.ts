// App-wide display + notification preferences.
// localStorage is the correct home: these are per-device client prefs, survive
// reload, and work in both demo and authenticated mode. No notification backend
// consumes the email flags yet, so persisting them here (not Supabase) avoids a
// dead column. The same storage KEY is read by the pre-paint script in layout.tsx.
export type ThemePreference = 'light' | 'dark' | 'system'

export interface AppPreferences {
  theme: ThemePreference
  reducedMotion: boolean
  notifications: {
    weeklyReminders: boolean
    jobMatches: boolean
    roadmapUpdates: boolean
    marketingEmails: boolean
  }
}

export const PREFERENCES_KEY = 'skillpath_preferences'

export const defaultPreferences: AppPreferences = {
  theme: 'system',
  reducedMotion: false,
  notifications: {
    weeklyReminders: true,
    jobMatches: true,
    roadmapUpdates: false,
    marketingEmails: false,
  },
}

export function loadPreferences(): AppPreferences {
  if (typeof window === 'undefined') return defaultPreferences
  try {
    const raw = localStorage.getItem(PREFERENCES_KEY)
    if (!raw) return defaultPreferences
    const parsed = JSON.parse(raw) as Partial<AppPreferences>
    return {
      ...defaultPreferences,
      ...parsed,
      notifications: { ...defaultPreferences.notifications, ...parsed.notifications },
    }
  } catch {
    return defaultPreferences
  }
}

export function savePreferences(prefs: AppPreferences): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(prefs))
  } catch {
    // ignore quota / private-mode write failures
  }
  applyAppearance(prefs)
}

// Reflect theme + reduced-motion onto <html> so CSS picks them up app-wide.
// ponytail: 'system' is resolved at apply time; a live OS theme change while the
// page is open won't repaint until next load. Add a matchMedia listener if that matters.
export function applyAppearance(prefs: AppPreferences): void {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const dark = prefs.theme === 'dark' || (prefs.theme === 'system' && prefersDark)
  root.classList.toggle('dark', dark)
  root.classList.toggle('reduce-motion', prefs.reducedMotion)
}
