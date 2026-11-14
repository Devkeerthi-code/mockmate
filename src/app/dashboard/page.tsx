'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Plus, FileText, ArrowRight, Clock, Award, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { ProgressCharts, PastInterviewItem } from '@/components/ProgressCharts'

export default function DashboardPage() {
  const router = useRouter()
  const [interviews, setInterviews] = useState<PastInterviewItem[]>([])
  const [resume, setResume] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/interviews').then((r) => (r.ok ? r.json() : { interviews: [] })),
      fetch('/api/resume/upload').then((r) => (r.ok ? r.json() : { resume: null })),
    ])
      .then(([intData, resData]) => {
        setInterviews(intData.interviews || [])
        setResume(resData.resume || null)
        setIsLoading(false)
      })
      .catch((err) => {
        console.error('Failed to load dashboard:', err)
        setIsLoading(false)
      })
  }, [])

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-400" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-8">
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-obsidian-800 pb-6">
        <div>
          <h1 className="font-sans text-2xl font-bold tracking-tight text-obsidian-50 sm:text-3xl">
            Candidate Placement Studio
          </h1>
          <p className="text-xs text-obsidian-400 mt-1">
            Voice practice sessions, real resume project interrogation, and transcript-grounded rubrics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/resume"
            className="flex items-center gap-1.5 rounded-xl border border-obsidian-700 bg-obsidian-850 px-3.5 py-2 text-xs font-semibold text-obsidian-200 hover:border-obsidian-600 hover:text-obsidian-50 transition-colors"
          >
            <FileText className="h-3.5 w-3.5 text-brand-400" />
            <span>{resume ? 'Manage Resume' : 'Upload Resume'}</span>
          </Link>
          <Link
            href="/interview/new"
            className="flex items-center gap-1.5 rounded-xl bg-brand-500 px-4 py-2 text-xs font-semibold text-obsidian-950 hover:bg-brand-400 transition-all shadow-glow-brand"
          >
            <Plus className="h-4 w-4" />
            <span>New Mock Interview</span>
          </Link>
        </div>
      </div>

      {/* Resume Ingestion Status Card */}
      {!resume ? (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400">
              <AlertCircle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-obsidian-50">Upload Your Resume to Unlock Project Drills</h3>
              <p className="text-xs text-obsidian-300 mt-0.5">
                The interviewer extracts your actual engineering projects to ask pointed architectural follow-up questions.
              </p>
            </div>
          </div>
          <Link
            href="/resume"
            className="rounded-xl bg-amber-500 px-4 py-2 text-xs font-semibold text-obsidian-950 hover:bg-amber-400 transition-colors shrink-0"
          >
            Upload Resume (PDF)
          </Link>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl border border-obsidian-700 bg-obsidian-850 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-obsidian-50">{resume.fileName}</span>
                <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-mono text-emerald-400 border border-emerald-500/20">
                  PARSED & ACTIVE
                </span>
              </div>
              <p className="text-[11px] text-obsidian-400 mt-0.5">
                {resume.parsedSkills?.length || 0} skills indexed • {(resume.parsedProjects as any[])?.length || 0} projects ready for technical interrogation.
              </p>
            </div>
          </div>
          <Link
            href="/resume"
            className="text-xs text-brand-400 hover:text-brand-300 font-semibold underline"
          >
            View Parsed Skills & Projects →
          </Link>
        </div>
      )}

      {/* Progress Analytics Component */}
      <section>
        <ProgressCharts interviews={interviews} />
      </section>

      {/* Past Interview History Table */}
      <section className="rounded-xl border border-obsidian-700 bg-obsidian-850 p-5 space-y-4">
        <h3 className="text-sm font-bold text-obsidian-50 flex items-center gap-2">
          <Clock className="h-4 w-4 text-brand-400" />
          <span>Recent Mock Interviews</span>
        </h3>

        {interviews.length === 0 ? (
          <div className="py-8 text-center text-xs text-obsidian-400">
            No mock sessions on record yet. Click "New Mock Interview" to begin your first round.
          </div>
        ) : (
          <div className="divide-y divide-obsidian-800">
            {interviews.map((item) => {
              const score = item.feedback?.overallScore
              const dateStr = new Date(item.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })

              return (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3.5 hover:bg-obsidian-800/40 px-2 rounded-lg transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-obsidian-50">
                        {item.type.replace(/_/g, ' ')}
                      </span>
                      <span className="rounded bg-obsidian-750 px-2 py-0.5 text-[10px] font-mono text-obsidian-300 border border-obsidian-700">
                        {item.companyType.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-obsidian-400">
                      <span>Target: {item.targetRole}</span>
                      <span>•</span>
                      <span>{dateStr}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {score !== undefined && score !== null ? (
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <span className="block font-mono font-bold text-sm text-obsidian-50">
                            {score}
                            <span className="text-xs text-obsidian-400">/100</span>
                          </span>
                          <span className="text-[10px] text-emerald-400 font-semibold">Evaluated</span>
                        </div>
                        <Link
                          href={`/interview/${item.id}/feedback`}
                          className="flex items-center gap-1 rounded-lg border border-obsidian-700 bg-obsidian-800 px-3 py-1.5 text-xs font-semibold text-obsidian-200 hover:border-brand-500/50 hover:text-brand-400 transition-colors"
                        >
                          <span>Dossier</span>
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      </div>
                    ) : (
                      <Link
                        href={`/interview/${item.id}`}
                        className="rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-obsidian-950 hover:bg-emerald-400 transition-colors"
                      >
                        Resume Mock
                      </Link>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
