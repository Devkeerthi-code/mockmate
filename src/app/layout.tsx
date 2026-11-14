import type { Metadata } from 'next'
import { Syne, Caveat, Plus_Jakarta_Sans, Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { Navbar } from '@/components/Navbar'

const syne = Syne({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['700', '800'],
  display: 'swap',
})

const caveat = Caveat({
  subsets: ['latin'],
  variable: '--font-hand',
  weight: ['600', '700'],
  display: 'swap',
})

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'MockMate — Voice AI Mock Interviewer for Campus Placements',
  description:
    'Prepare for technical and behavioural campus placements with realistic AI voice interviews, in-browser sandboxed coding rounds, and transcript-grounded rubric feedback.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={`dark ${syne.variable} ${caveat.variable} ${plusJakartaSans.variable} ${inter.variable} ${jetbrainsMono.variable}`}
    >
      <body className="min-h-screen bg-obsidian-900 bg-grain font-body text-obsidian-100 flex flex-col selection:bg-brand-500 selection:text-obsidian-950">
        <Navbar />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-obsidian-800 bg-obsidian-950 py-8 text-center text-xs text-obsidian-400">
          <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-brand-500 font-display font-black text-obsidian-950 text-xs">
                M
              </span>
              <p className="font-sans font-semibold text-obsidian-200">
                MockMate — Hand-crafted for placement season
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] font-mono">
              <span className="text-emerald-400">⚡ Zero Audio Stored</span>
              <span className="text-sky-400">🔒 Pyodide Client Sandbox</span>
              <span className="text-brand-400">🎯 Exact Line Citations</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}
