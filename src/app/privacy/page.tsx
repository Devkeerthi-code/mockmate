'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Shield, Trash2, CheckCircle2, Lock, EyeOff, Server, AlertTriangle, Loader2 } from 'lucide-react'

export default function PrivacyPage() {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [message, setMessage] = useState('')

  const handleDeleteData = async () => {
    setIsDeleting(true)
    try {
      const res = await fetch('/api/user/delete-data', {
        method: 'DELETE',
      })

      if (res.ok) {
        setMessage('Your profile, uploaded resumes, transcripts, and evaluation data have been permanently purged.')
        setTimeout(() => {
          router.push('/')
        }, 2000)
      } else {
        setMessage('Failed to delete data. Please try again.')
        setIsDeleting(false)
      }
    } catch {
      setMessage('Network error. Please try again.')
      setIsDeleting(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 space-y-8">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-0.5 text-xs font-semibold text-emerald-400 mb-2">
          <Shield className="h-3.5 w-3.5" />
          <span>Student Privacy Architecture</span>
        </div>
        <h1 className="font-sans text-2xl font-bold tracking-tight text-obsidian-50 sm:text-3xl">
          Privacy & Data Governance
        </h1>
        <p className="text-xs text-obsidian-400 mt-1 max-w-2xl leading-relaxed">
          MockMate was built specifically for students. We adhere to strict data-minimization principles, transparent telemetry, and zero audio persistence.
        </p>
      </div>

      {message && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* 4 Architectural Privacy Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-obsidian-700 bg-obsidian-850 p-6 space-y-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <EyeOff className="h-5 w-5" />
          </div>
          <h3 className="text-sm font-bold text-obsidian-50">1. Zero Audio Storage</h3>
          <p className="text-xs text-obsidian-300 leading-relaxed">
            Speech is processed locally in your browser using the HTML5 Web Speech API (`SpeechRecognition`). Raw audio waveforms and microphone recordings are never uploaded, stored, or sent to server disks.
          </p>
        </div>

        <div className="rounded-2xl border border-obsidian-700 bg-obsidian-850 p-6 space-y-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/30">
            <Server className="h-5 w-5" />
          </div>
          <h3 className="text-sm font-bold text-obsidian-50">2. In-Browser Sandboxed Code</h3>
          <p className="text-xs text-obsidian-300 leading-relaxed">
            Your JavaScript and Python code runs strictly inside client-side Web Workers (using Pyodide for Python). No student code is ever executed on our servers.
          </p>
        </div>

        <div className="rounded-2xl border border-obsidian-700 bg-obsidian-850 p-6 space-y-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/30">
            <Lock className="h-5 w-5" />
          </div>
          <h3 className="text-sm font-bold text-obsidian-50">3. Passwords & Auth</h3>
          <p className="text-xs text-obsidian-300 leading-relaxed">
            All student passwords are cryptographic hashes salted with bcrypt (cost factor 10). Session tokens use signed, HTTP-only JSON Web Tokens (JWT).
          </p>
        </div>

        <div className="rounded-2xl border border-obsidian-700 bg-obsidian-850 p-6 space-y-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <Shield className="h-5 w-5" />
          </div>
          <h3 className="text-sm font-bold text-obsidian-50">4. Telemetry Minimization</h3>
          <p className="text-xs text-obsidian-300 leading-relaxed">
            Platform usage counters (`UsageMetric`) track aggregated event tallies only (e.g. total mock interviews conducted). No IP addresses or personal identifiable telemetry are retained.
          </p>
        </div>
      </div>

      {/* Purge / Delete My Data Section */}
      <div className="rounded-2xl border border-rose-500/30 bg-obsidian-850 p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/30">
            <Trash2 className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-rose-300">Right to Erasure ("Delete My Data")</h3>
            <p className="text-xs text-obsidian-400 mt-0.5">
              Permanently purges your student profile, uploaded resumes, transcripts, and evaluation rubrics in a single transaction.
            </p>
          </div>
        </div>

        {!showConfirm ? (
          <button
            onClick={() => setShowConfirm(true)}
            className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-2 text-xs font-semibold text-rose-300 hover:bg-rose-500/20 transition-colors"
          >
            Request Full Account & Data Purge
          </button>
        ) : (
          <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-4 space-y-3">
            <div className="flex items-start gap-2 text-xs text-rose-300">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>
                Are you absolutely sure? This action is irreversible. All your mock interview recordings, resume extractions, and scores will be permanently deleted from PostgreSQL.
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleDeleteData}
                disabled={isDeleting}
                className="flex items-center gap-1.5 rounded-xl bg-rose-500 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-600 transition-colors disabled:opacity-50"
              >
                {isDeleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                <span>Yes, Permanently Purge Everything</span>
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className="rounded-xl border border-obsidian-700 bg-obsidian-900 px-4 py-2 text-xs text-obsidian-300 hover:text-obsidian-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
