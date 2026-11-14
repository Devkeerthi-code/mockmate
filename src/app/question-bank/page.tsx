'use client'

import { useState, useEffect } from 'react'
import { Database, Plus, Search, HelpCircle, CheckCircle2, ShieldAlert, Sparkles, Loader2, AlertCircle } from 'lucide-react'

export default function QuestionBankPage() {
  const [questions, setQuestions] = useState<any[]>([])
  const [category, setCategory] = useState<string>('')
  const [companyType, setCompanyType] = useState<string>('')
  const [difficulty, setDifficulty] = useState<string>('')
  const [disclaimer, setDisclaimer] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  // Admin add question state
  const [showAddModal, setShowAddModal] = useState(false)
  const [newTopic, setNewTopic] = useState('')
  const [newQuestionText, setNewQuestionText] = useState('')
  const [newCategory, setNewCategory] = useState('CS_FUNDAMENTALS')
  const [newCompanyType, setNewCompanyType] = useState('PRODUCT_BASED')
  const [newDifficulty, setNewDifficulty] = useState('MEDIUM')
  const [newExpectedPoints, setNewExpectedPoints] = useState('')
  const [newHints, setNewHints] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const fetchQuestions = () => {
    setIsLoading(true)
    const params = new URLSearchParams()
    if (category) params.append('category', category)
    if (companyType) params.append('companyType', companyType)
    if (difficulty) params.append('difficulty', difficulty)

    fetch(`/api/questions?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => {
        setQuestions(data.questions || [])
        setDisclaimer(data.disclaimer || '')
        setIsLoading(false)
      })
      .catch(() => setIsLoading(false))
  }

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setUser(d?.user || null))
    fetchQuestions()
  }, [category, companyType, difficulty])

  const handleCreateQuestion = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      const res = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: newCategory,
          companyType: newCompanyType,
          difficulty: newDifficulty,
          topic: newTopic,
          questionText: newQuestionText,
          expectedPoints: newExpectedPoints.split('\n').filter((l) => l.trim()),
          hints: newHints.split('\n').filter((l) => l.trim()),
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to add question.')
        setIsSubmitting(false)
        return
      }

      setShowAddModal(false)
      setNewTopic('')
      setNewQuestionText('')
      setNewExpectedPoints('')
      setNewHints('')
      setIsSubmitting(false)
      fetchQuestions()
    } catch {
      setError('Network error while saving question.')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-obsidian-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-3 py-0.5 text-xs font-semibold text-brand-400 mb-2">
            <Database className="h-3.5 w-3.5" />
            <span>Curated Placement Vault</span>
          </div>
          <h1 className="font-sans text-2xl font-bold tracking-tight text-obsidian-50 sm:text-3xl">
            Company Tier Question Bank
          </h1>
          <p className="text-xs text-obsidian-400 mt-1 max-w-2xl">
            Explore curated practice patterns used across campus recruitment drives. Questions calibrate the AI interviewer so practice sessions stay realistic.
          </p>
        </div>

        {user?.role === 'ADMIN' && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-xs font-semibold text-obsidian-950 hover:bg-brand-400 transition-all shadow-glow-brand"
          >
            <Plus className="h-4 w-4" />
            <span>Add Question (Admin)</span>
          </button>
        )}
      </div>

      {/* Mandatory Disclaimer Box */}
      <div className="flex items-start gap-3 rounded-xl border border-obsidian-700 bg-obsidian-850 p-4 text-xs text-obsidian-300">
        <ShieldAlert className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-semibold text-obsidian-100">Practice Pattern Integrity Disclaimer:</span>
          <p className="text-[11px] text-obsidian-400 leading-relaxed">
            {disclaimer ||
              'Questions are curated practice patterns representing company tier archetypes. They do not represent proprietary or leaked questions from any specific corporate entity.'}
          </p>
        </div>
      </div>

      {/* Filter Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-xl border border-obsidian-700 bg-obsidian-850 px-3 py-2 text-xs text-obsidian-100 focus:border-brand-500 focus:outline-none"
        >
          <option value="">All Categories</option>
          <option value="CS_FUNDAMENTALS">CS Fundamentals</option>
          <option value="DSA_CODING">DSA & Coding</option>
          <option value="RESUME_DEEP_DIVE">Resume Deep-Dive</option>
          <option value="HR_BEHAVIOURAL">HR & Behavioural</option>
        </select>

        <select
          value={companyType}
          onChange={(e) => setCompanyType(e.target.value)}
          className="rounded-xl border border-obsidian-700 bg-obsidian-850 px-3 py-2 text-xs text-obsidian-100 focus:border-brand-500 focus:outline-none"
        >
          <option value="">All Company Tiers</option>
          <option value="PRODUCT_BASED">Product Based / Unicorn</option>
          <option value="SERVICE_BASED">Service Based</option>
          <option value="STARTUP">Early-Stage Startup</option>
          <option value="GENERAL">General</option>
        </select>

        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
          className="rounded-xl border border-obsidian-700 bg-obsidian-850 px-3 py-2 text-xs text-obsidian-100 focus:border-brand-500 focus:outline-none"
        >
          <option value="">All Difficulties</option>
          <option value="EASY">Easy</option>
          <option value="MEDIUM">Medium</option>
          <option value="HARD">Hard</option>
        </select>
      </div>

      {/* Questions List */}
      {isLoading ? (
        <div className="flex min-h-[30vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-brand-400" />
        </div>
      ) : questions.length === 0 ? (
        <div className="rounded-xl border border-obsidian-700 bg-obsidian-850 p-8 text-center text-xs text-obsidian-400">
          No questions matched the selected filters.
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((q) => (
            <div
              key={q.id}
              className="rounded-xl border border-obsidian-750 bg-obsidian-850 p-5 space-y-3 transition-colors hover:border-obsidian-600"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-obsidian-50">{q.topic}</span>
                  <span className="rounded bg-obsidian-750 px-2 py-0.5 text-[10px] font-mono text-obsidian-300 border border-obsidian-700">
                    {q.category.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded bg-brand-500/10 px-2 py-0.5 text-[10px] font-mono text-brand-400 border border-brand-500/20">
                    {q.companyType.replace(/_/g, ' ')}
                  </span>
                  <span
                    className={`rounded px-2 py-0.5 text-[10px] font-mono font-semibold ${
                      q.difficulty === 'HARD'
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        : q.difficulty === 'MEDIUM'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    }`}
                  >
                    {q.difficulty}
                  </span>
                </div>
              </div>

              <p className="text-xs text-obsidian-100 font-medium leading-relaxed">{q.questionText}</p>

              {/* Expected Rubric Signals */}
              {q.expectedPoints && q.expectedPoints.length > 0 && (
                <div className="rounded-lg border border-obsidian-800 bg-obsidian-900/60 p-3 space-y-1">
                  <span className="text-[10px] uppercase font-mono font-bold text-emerald-400">
                    Key Interviewer Scoring Signals:
                  </span>
                  <ul className="space-y-1 text-[11px] text-obsidian-300">
                    {q.expectedPoints.map((pt: string, pIdx: number) => (
                      <li key={pIdx} className="flex items-start gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Admin Add Question Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-obsidian-950/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg space-y-4 rounded-2xl border border-obsidian-700 bg-obsidian-850 p-6 shadow-2xl">
            <h3 className="text-base font-bold text-obsidian-50">Add Practice Question</h3>

            {error && (
              <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-2 text-xs text-rose-400">
                {error}
              </div>
            )}

            <form onSubmit={handleCreateQuestion} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-obsidian-300 mb-1">Topic / Pattern Title</label>
                <input
                  type="text"
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value)}
                  required
                  placeholder="e.g. Distributed Consensus & Raft"
                  className="w-full rounded-xl border border-obsidian-700 bg-obsidian-900 px-3 py-2 text-xs text-obsidian-50"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-obsidian-400 mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full rounded-lg border border-obsidian-700 bg-obsidian-900 px-2 py-1.5 text-xs text-obsidian-50"
                  >
                    <option value="CS_FUNDAMENTALS">CS Fundamentals</option>
                    <option value="DSA_CODING">DSA & Coding</option>
                    <option value="RESUME_DEEP_DIVE">Resume Deep-Dive</option>
                    <option value="HR_BEHAVIOURAL">HR Behavioural</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-obsidian-400 mb-1">Tier</label>
                  <select
                    value={newCompanyType}
                    onChange={(e) => setNewCompanyType(e.target.value)}
                    className="w-full rounded-lg border border-obsidian-700 bg-obsidian-900 px-2 py-1.5 text-xs text-obsidian-50"
                  >
                    <option value="PRODUCT_BASED">Product Based</option>
                    <option value="STARTUP">Startup</option>
                    <option value="SERVICE_BASED">Service Based</option>
                    <option value="GENERAL">General</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-obsidian-400 mb-1">Difficulty</label>
                  <select
                    value={newDifficulty}
                    onChange={(e) => setNewDifficulty(e.target.value)}
                    className="w-full rounded-lg border border-obsidian-700 bg-obsidian-900 px-2 py-1.5 text-xs text-obsidian-50"
                  >
                    <option value="EASY">Easy</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HARD">Hard</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-obsidian-300 mb-1">Question Prompt</label>
                <textarea
                  rows={3}
                  value={newQuestionText}
                  onChange={(e) => setNewQuestionText(e.target.value)}
                  required
                  placeholder="Enter the exact question prompt..."
                  className="w-full rounded-xl border border-obsidian-700 bg-obsidian-900 p-2.5 text-xs text-obsidian-50 font-body"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-obsidian-300 mb-1">Expected Points (one per line)</label>
                <textarea
                  rows={2}
                  value={newExpectedPoints}
                  onChange={(e) => setNewExpectedPoints(e.target.value)}
                  placeholder="Point 1&#10;Point 2"
                  className="w-full rounded-xl border border-obsidian-700 bg-obsidian-900 p-2 text-xs text-obsidian-50"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-xl border border-obsidian-700 px-3 py-1.5 text-xs text-obsidian-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl bg-brand-500 px-4 py-1.5 text-xs font-semibold text-obsidian-950 disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save Question'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
