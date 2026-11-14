'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Lock, Mail, ArrowRight, Loader2, AlertCircle, ShieldCheck, Sparkles } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to sign in. Please verify your credentials.')
        setIsLoading(false)
        return
      }

      router.push('/dashboard')
    } catch {
      setError('Network error. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-[82vh] items-center justify-center px-4 py-12 bg-grain">
      {/* Decorative ambient background */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.08)_0,transparent_70%)]" />

      <div className="relative w-full max-w-md">
        {/* Playful chalk sticky note pinned to top corner */}
        <div className="absolute -top-5 -right-2 z-10 hidden sm:block">
          <span className="sticker-badge sticker-tilt-right border-brand-400 bg-brand-500/15 text-brand-300 shadow-md">
            BATCH &apos;26 PORTAL 🎓
          </span>
        </div>

        {/* Tactile Editorial Card */}
        <div className="rounded-3xl border border-obsidian-700 bg-gradient-to-b from-obsidian-850 to-obsidian-900 p-8 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.8)] relative">
          <div className="text-center mb-6">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500 font-display font-extrabold text-obsidian-950 shadow-[0_4px_0_#92400E] mb-3">
              M
            </div>

            <h1 className="font-display text-2xl font-black tracking-tight text-obsidian-50">
              Welcome Back
            </h1>
            <p className="mt-1 text-xs text-obsidian-400">
              Continue your voice mock sessions and feedback dossiers.
            </p>
          </div>

          {error && (
            <div className="mb-5 flex items-center gap-2 rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-xs text-rose-300">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-obsidian-200 mb-1.5 font-mono">
                COLLEGE OR PERSONAL EMAIL
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-obsidian-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="student@college.edu"
                  className="w-full rounded-xl border border-obsidian-750 bg-obsidian-950/90 py-3 pl-10 pr-4 text-xs text-obsidian-50 placeholder-obsidian-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-obsidian-200 font-mono">
                  PASSWORD
                </label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-obsidian-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-obsidian-750 bg-obsidian-950/90 py-3 pl-10 pr-4 text-xs text-obsidian-50 placeholder-obsidian-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-tactile-primary w-full py-3.5 text-xs gap-2 mt-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Candidate Studio</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick toggle link */}
          <div className="mt-6 border-t border-obsidian-800 pt-5 text-center text-xs text-obsidian-400">
            <span>First time preparing here? </span>
            <Link
              href="/register"
              className="font-semibold text-brand-400 hover:text-brand-300 underline underline-offset-2"
            >
              Create candidate account
            </Link>
          </div>

          <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] font-mono text-emerald-400">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Encrypted Session • Zero Audio Stored</span>
          </div>
        </div>

        {/* Hand-drawn encouragement note */}
        <p className="mt-3 text-center hand-annotation text-amber-300 text-base">
          Consistency beats last-minute cramming ✍️
        </p>
      </div>
    </div>
  )
}
