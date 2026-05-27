import type { Metadata } from 'next'
import { Space_Grotesk, Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

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

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: 'SkillPath - Career Operating System for Developers',
  description: 'Find your developer career path before you waste months guessing. SkillPath checks your skills, compares them with real jobs, builds your learning roadmap, and tracks your progress every week.',
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
    <html lang="en" className={`${spaceGrotesk.variable} ${inter.variable}`}>
      <body className="font-body antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
