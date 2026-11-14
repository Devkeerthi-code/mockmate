'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Mic, FileCode2, Code, Database, Clock, Sparkles, Building2, CheckCircle2, ArrowRight, Loader2, AlertCircle, Terminal, Layers } from 'lucide-react'

export default function NewInterviewPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialType = (searchParams.get('type') as any) || 'RESUME_DEEP_DIVE'

  const [type, setType] = useState<string>(initialType)
  const [targetRole, setTargetRole] = useState('Software Engineer (SDE-1)')
  const [companyType, setCompanyType] = useState('PRODUCT_BASED')
  const [difficulty, setDifficulty] = useState('MEDIUM')
  const [durationMinutes, setDurationMinutes] = useState(30)
  const [codingLanguage, setCodingLanguage] = useState<'javascript' | 'python'>('javascript')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLaunch = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const res = await fetch('/api/interviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          targetRole,
          companyType,
          difficulty,
          durationMinutes,
          codingLanguage: type === 'DSA_CODING' ? codingLanguage : undefined,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to initialize interview.')
        setIsLoading(false)
        return
      }

      router.push(`/interview/${data.interview.id}`)
    } catch {
      setError('Network error while starting mock.')
      setIsLoading(false)
    }
  }

  const interviewTypes = [
    {
      id: 'RESUME_DEEP_DIVE',
      title: 'Resume Project Deep-Dive',
      desc: 'Technical interrogation of your actual projects, architectural decisions, and trade-offs.',
      icon: Code,
      badge: 'RECOMMENDED',
      tilt: 'sticker-tilt-left',
    },
    {
      id: 'DSA_CODING',
      title: 'DSA & Coding Whiteboard',
      desc: 'Live problem solving with in-browser sandboxed code execution, complexity, and edge cases.',
      icon: FileCode2,
      badge: 'PYODIDE SANDBOX',
      tilt: 'sticker-tilt-right',
    },
    {
      id: 'CS_FUNDAMENTALS',
      title: 'Core CS Fundamentals',
      desc: 'DBMS indexing & ACID, Operating Systems concurrency, Computer Networks, and OOP.',
      icon: Database,
      badge: 'PLACEMENT CORE',
      tilt: 'sticker-tilt-left',
    },
    {
      id: 'HR_BEHAVIOURAL',
      title: 'HR & Behavioural (STAR)',
      desc: 'Situational questions evaluated strictly against Situation, Task, Action, and Result.',
      icon: Mic,
      badge: 'BEHAVIOURAL',
      tilt: 'sticker-tilt-right',
    },
  ]

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 space-y-8 bg-grain">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2">
          <span className="sticker-badge sticker-tilt-left border-brand-400 bg-brand-500/10 text-brand-300">
            MOCK CALIBRATION STUDIO
          </span>
          <span className="hand-annotation text-amber-300 text-sm hidden sm:inline">
            Choose what you fear most ✍️
          </span>
        </div>

        <h1 className="font-display text-3xl font-black tracking-tight text-obsidian-50 sm:text-4xl">
          Configure Your Placement Interview
        </h1>
        <p className="text-xs text-obsidian-400 max-w-md mx-auto">
          Tailored to your target company type, tech stack, and placement timeline.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-2xl border border-rose-500/40 bg-rose-500/10 p-4 text-xs text-rose-300">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleLaunch} className="space-y-6">
        {/* 1. Interview Format Selector */}
        <div className="space-y-3">
          <label className="block font-mono text-xs font-bold text-obsidian-200 uppercase tracking-wider">
            1. Select Interview Format
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {interviewTypes.map((item) => {
              const Icon = item.icon
              const isSelected = type === item.id
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setType(item.id)}
                  className={`group relative flex flex-col justify-between rounded-2xl border p-5 text-left transition-all ${
                    isSelected
                      ? 'border-brand-500 bg-brand-500/10 shadow-[0_4px_0_#92400E]'
                      : 'border-obsidian-750 bg-obsidian-850 hover:border-obsidian-600'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-xl border ${
                          isSelected
                            ? 'bg-brand-500 text-obsidian-950 border-brand-400'
                            : 'bg-obsidian-900 text-obsidian-400 border-obsidian-700'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <span
                        className={`sticker-badge ${item.tilt} ${
                          isSelected
                            ? 'border-brand-400 text-brand-300 bg-brand-500/20'
                            : 'border-obsidian-700 text-obsidian-400 bg-obsidian-900'
                        }`}
                      >
                        {item.badge}
                      </span>
                    </div>

                    <h3 className="font-display text-sm font-bold text-obsidian-50">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-xs text-obsidian-300 leading-relaxed font-body">
                      {item.desc}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-obsidian-800/80 flex items-center justify-between">
                    <span className="font-mono text-[10px] text-obsidian-400">
                      Standard Placement Format
                    </span>
                    <span
                      className={`text-xs font-mono font-bold ${
                        isSelected ? 'text-brand-400' : 'text-obsidian-600'
                      }`}
                    >
                      {isSelected ? '● SELECTED' : 'SELECT'}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* 2. Target Role & Company Calibration */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block font-mono text-xs font-bold text-obsidian-200 uppercase tracking-wider">
              2. Target Role Title
            </label>
            <input
              type="text"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              required
              placeholder="e.g. SDE-1, Full-Stack Intern, Data Analyst"
              className="w-full rounded-xl border border-obsidian-750 bg-obsidian-900 py-3 px-3.5 text-xs text-obsidian-50 placeholder-obsidian-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block font-mono text-xs font-bold text-obsidian-200 uppercase tracking-wider">
              Target Company Category
            </label>
            <select
              value={companyType}
              onChange={(e) => setCompanyType(e.target.value)}
              className="w-full rounded-xl border border-obsidian-750 bg-obsidian-900 py-3 px-3.5 text-xs text-obsidian-50 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-colors"
            >
              <option value="PRODUCT_BASED">Product Company (Amazon, Uber, Microsoft, Atlassian)</option>
              <option value="SERVICE_BASED">Mass Recruiter (TCS, Infosys, Wipro, Cognizant)</option>
              <option value="STARTUP">High-Growth Tech Startup (Series A - Unicorn)</option>
              <option value="FINTECH">Fintech & Quant (Goldman Sachs, Morgan Stanley, Razorpay)</option>
            </select>
          </div>
        </div>

        {/* 3. Duration & Difficulty Calibration */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block font-mono text-xs font-bold text-obsidian-200 uppercase tracking-wider">
              3. Interview Duration
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[15, 30, 45].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setDurationMinutes(mins)}
                  className={`flex items-center justify-center gap-1.5 rounded-xl border py-2.5 text-xs font-mono font-semibold transition-all ${
                    durationMinutes === mins
                      ? 'border-brand-500 bg-brand-500 text-obsidian-950 font-bold shadow-[0_2px_0_#92400E]'
                      : 'border-obsidian-750 bg-obsidian-850 text-obsidian-300 hover:text-obsidian-50'
                  }`}
                >
                  <Clock className="h-3 w-3" />
                  <span>{mins} Mins</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block font-mono text-xs font-bold text-obsidian-200 uppercase tracking-wider">
              Difficulty Tier
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['EASY', 'MEDIUM', 'HARD'].map((diff) => (
                <button
                  key={diff}
                  type="button"
                  onClick={() => setDifficulty(diff)}
                  className={`rounded-xl border py-2.5 text-xs font-mono font-semibold transition-all ${
                    difficulty === diff
                      ? 'border-brand-500 bg-brand-500 text-obsidian-950 font-bold shadow-[0_2px_0_#92400E]'
                      : 'border-obsidian-750 bg-obsidian-850 text-obsidian-300 hover:text-obsidian-50'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* If DSA, Coding Language Choice */}
        {type === 'DSA_CODING' && (
          <div className="space-y-2 rounded-2xl border border-sky-500/30 bg-sky-500/5 p-4">
            <label className="block font-mono text-xs font-bold text-sky-400 uppercase tracking-wider">
              In-Browser Sandbox Language
            </label>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 text-xs text-obsidian-100 cursor-pointer">
                <input
                  type="radio"
                  name="lang"
                  checked={codingLanguage === 'javascript'}
                  onChange={() => setCodingLanguage('javascript')}
                  className="accent-brand-500"
                />
                <span>JavaScript (Node.js / V8 Web Worker)</span>
              </label>
              <label className="flex items-center gap-2 text-xs text-obsidian-100 cursor-pointer">
                <input
                  type="radio"
                  name="lang"
                  checked={codingLanguage === 'python'}
                  onChange={() => setCodingLanguage('python')}
                  className="accent-brand-500"
                />
                <span>Python 3 (Pyodide Client Sandbox)</span>
              </label>
            </div>
          </div>
        )}

        {/* Pre-flight Checklist */}
        <div className="rounded-2xl border border-obsidian-750 bg-obsidian-900/80 p-4 text-xs text-obsidian-300 space-y-2">
          <span className="font-semibold text-obsidian-200">Pre-Flight Placement Studio Check:</span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono text-[11px] text-obsidian-400">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              Microphone input verified
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              Keyboard typing fallback
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              Zero audio recorded
            </span>
          </div>
        </div>

        {/* 3D Tactile Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="btn-tactile-primary w-full py-4 text-sm gap-2 disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Spinning Up Interviewer Studio...</span>
            </>
          ) : (
            <>
              <Mic className="h-4 w-4" />
              <span>Launch Live Voice Studio</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>
    </div>
  )
}
