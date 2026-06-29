import type { Metadata } from 'next'
import { Space_Grotesk, Inter, JetBrains_Mono, Silkscreen } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { Analytics } from '@vercel/analytics/next'

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
})

// Arcade Quest: monospace metric/XP numerals
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

// Arcade Quest: pixel HUD accent — short uppercase labels only
const silkscreen = Silkscreen({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-hud',
  display: 'swap',
})

// Resolve the canonical site origin for metadata. A malformed NEXT_PUBLIC_APP_URL
// (missing scheme, stray quotes/spaces, or the whole "KEY=value" pasted in) must never
// crash the production build, so each candidate is validated and we fall back through
// Vercel-provided hosts to localhost.
function resolveSiteUrl(): URL {
  const candidates = [
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.VERCEL_PROJECT_PRODUCTION_URL,
    process.env.VERCEL_URL,
  ]

  for (const candidate of candidates) {
    const value = candidate?.trim()
    if (!value) continue
    try {
      return new URL(value)
    } catch {
      try {
        // Tolerate a bare host like "example.vercel.app" by assuming https.
        return new URL(`https://${value}`)
      } catch {
        // Ignore this malformed candidate and try the next one.
      }
    }
  }

  return new URL('http://localhost:3000')
}

export const metadata: Metadata = {
  metadataBase: resolveSiteUrl(),
  title: 'SkillPath - Career Operating System for Developers',
  description: 'Find your developer career path before you waste months guessing. SkillPath checks your skills, compares them with real jobs, builds your learning roadmap, and tracks your progress every week.',
  icons: {
    icon: '/icon',
    shortcut: '/icon',
    apple: '/icon',
  },
  keywords: ['developer', 'career', 'skills', 'learning', 'roadmap', 'jobs', 'internship', 'portfolio'],
  authors: [{ name: 'SkillPath' }],
  openGraph: {
    title: 'SkillPath - Career Operating System for Developers',
    description: 'Find your developer career path before you waste months guessing.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable} ${silkscreen.variable}`}>
      <head>
        {/* Apply saved theme + reduced-motion before paint to avoid a flash.
            Mirrors lib/user/preferences.ts (must stay inline: runs pre-hydration). */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var p=JSON.parse(localStorage.getItem('skillpath_preferences')||'{}');var t=p.theme||'system';var dark=t==='dark'||(t==='system'&&matchMedia('(prefers-color-scheme: dark)').matches);var r=document.documentElement;r.classList.toggle('dark',dark);if(p.reducedMotion)r.classList.add('reduce-motion');}catch(e){}})();`,
          }}
        />
      </head>
      <body className="font-body antialiased">
        <Providers>
          {children}
        </Providers>
        <Analytics />
      </body>
    </html>
  )
}
