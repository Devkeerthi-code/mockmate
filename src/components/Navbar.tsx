'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Mic, FileText, LayoutDashboard, Database, Shield, LogOut, ArrowRight, Sparkles, Terminal } from 'lucide-react'

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<{ email: string; name: string; role: string } | null>(null)

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) setUser(data.user)
      })
      .catch(() => setUser(null))
  }, [pathname])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    setUser(null)
    router.push('/login')
  }

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/interview/new', label: 'New Mock', icon: Mic },
    { href: '/resume', label: 'Resume Analyzer', icon: FileText },
    { href: '/question-bank', label: 'Question Bank', icon: Database },
  ]

  const tickerItems = [
    '⚡ Live Speech Recognition active',
    '🔒 Pyodide client-side sandbox enabled',
    '🎯 Line-by-line rubric citations',
    '🎓 Tier-1 placement question bank (2026)',
    '✍️ Zero audio stored on server',
  ]

  return (
    <header className="sticky top-0 z-50 border-b border-obsidian-750 bg-obsidian-950/85 backdrop-blur-md">
      {/* Live System Status Sub-bar */}
      <div className="overflow-hidden border-b border-obsidian-800 bg-obsidian-900/60 py-1 text-[11px] font-mono text-obsidian-400">
        <div className="flex animate-infinite-ticker whitespace-nowrap">
          {[...tickerItems, ...tickerItems].map((item, idx) => (
            <span key={idx} className="mx-6 flex items-center gap-1.5 font-medium text-obsidian-300">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-400 animate-pulse" />
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* Main Nav Bar */}
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand with Sticker */}
        <div className="flex items-center gap-3">
          <Link href="/" className="group flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500 font-display font-extrabold text-obsidian-950 shadow-[0_3px_0_#92400E] transition-transform group-hover:-translate-y-0.5">
              M
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-display text-xl font-extrabold tracking-tight text-obsidian-50">
                MockMate
              </span>
            </div>
          </Link>

          {/* dark-moon sticker badge */}
          <span className="sticker-badge sticker-tilt-left border-brand-400/60 bg-brand-500/10 text-brand-300 hidden sm:inline-flex">
            <span>CAMPUS ED.</span>
            <span className="font-mono text-[9px] text-brand-400">’26</span>
          </span>
        </div>

        {/* Navigation Links */}
        {user ? (
          <nav className="hidden items-center gap-1.5 md:flex">
            {navLinks.map((link) => {
              const Icon = link.icon
              const isActive = pathname === link.href || (link.href !== '/dashboard' && pathname.startsWith(link.href))
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-obsidian-800 text-brand-400 border border-brand-500/30 shadow-[0_2px_0_rgba(245,158,11,0.2)]'
                      : 'text-obsidian-300 hover:bg-obsidian-850 hover:text-obsidian-50 border border-transparent'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {link.label}
                </Link>
              )
            })}
          </nav>
        ) : (
          <div className="hidden items-center gap-6 text-xs font-medium text-obsidian-300 md:flex">
            <Link href="/question-bank" className="hover:text-obsidian-50 transition-colors">
              Question Bank
            </Link>
            <Link href="/privacy" className="hover:text-obsidian-50 transition-colors">
              Zero-Audio Privacy
            </Link>
            <span className="hand-annotation text-amber-300 text-base">
              No senior favors needed ✍️
            </span>
          </div>
        )}

        {/* User Profile / Auth Actions */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="hidden text-right text-xs sm:block">
                <p className="font-semibold text-obsidian-50">{user.name}</p>
                <p className="text-[10px] font-mono text-obsidian-400">{user.email}</p>
              </div>

              <Link
                href="/interview/new"
                className="btn-tactile-primary px-3.5 py-1.5 text-xs gap-1.5"
              >
                <Mic className="h-3.5 w-3.5" />
                <span>Start Mock</span>
              </Link>

              <button
                onClick={handleLogout}
                title="Sign out"
                className="flex items-center gap-1 rounded-xl border border-obsidian-700 bg-obsidian-850 px-2.5 py-1.5 text-xs font-medium text-obsidian-300 transition-colors hover:border-rose-500/40 hover:bg-rose-500/10 hover:text-rose-400"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="rounded-xl border border-obsidian-750 bg-obsidian-850 px-3.5 py-2 text-xs font-semibold text-obsidian-200 transition-colors hover:border-obsidian-600 hover:text-obsidian-50"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="btn-tactile-primary px-4 py-2 text-xs gap-1.5"
              >
                <span>Practice Free</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
