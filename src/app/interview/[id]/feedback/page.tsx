'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { RubricReport } from '@/components/RubricReport'
import { TranscriptView } from '@/components/TranscriptView'
import { ArrowLeft, RotateCcw, Loader2, AlertCircle, FileText, LayoutDashboard, Sparkles, CheckCircle2 } from 'lucide-react'

export default function InterviewFeedbackPage() {
  const params = useParams()
  const router = useRouter()
  const interviewId = params.id as string

  const [feedback, setFeedback] = useState<any>(null)
  const [transcript, setTranscript] = useState<any[]>([])
  const [interview, setInterview] = useState<any>(null)
  const [highlightedLine, setHighlightedLine] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`/api/interviews/${interviewId}/feedback`)
      .then((res) => {
        if (!res.ok) throw new Error('Feedback not available or unauthorized.')
        return res.json()
      })
      .then((data) => {
        setFeedback(data.feedback)
        setTranscript(data.transcript || [])
        setInterview(data.interview)
        setIsLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setIsLoading(false)
      })
  }, [interviewId])

  const handleSelectCitation = (lineNumber: number) => {
    setHighlightedLine(lineNumber)
    const element = document.getElementById(`transcript-line-${lineNumber}`)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[75vh] flex-col items-center justify-center space-y-3 bg-grain">
        <Loader2 className="h-8 w-8 animate-spin text-brand-400" />
        <p className="font-mono text-xs text-obsidian-400">Synthesizing rubric evidence & transcript citations...</p>
      </div>
    )
  }

  if (error || !feedback) {
    return (
      <div className="flex min-h-[75vh] flex-col items-center justify-center p-4 text-center bg-grain">
        <AlertCircle className="h-10 w-10 text-rose-400 mb-2" />
        <h2 className="font-display text-lg font-bold text-obsidian-50">{error || 'Evaluation dossier not found.'}</h2>
        <Link
          href="/dashboard"
          className="btn-tactile-primary mt-4 px-4 py-2 text-xs"
        >
          Return to Dashboard
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-8 bg-grain">
      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-obsidian-800 pb-5">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-obsidian-700 bg-obsidian-850 text-obsidian-300 hover:border-obsidian-600 hover:text-obsidian-50 transition-all shadow-sm active:translate-y-0.5"
            title="Back to Dashboard"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-xl font-black tracking-tight text-obsidian-50 sm:text-2xl">
                Placement Performance Dossier
              </h1>
              <span className="sticker-badge sticker-tilt-right border-brand-400/50 bg-brand-500/10 text-brand-300 font-mono text-[10px]">
                {interview?.type?.replace(/_/g, ' ')}
              </span>
            </div>
            <p className="text-xs text-obsidian-400 mt-0.5 font-mono">
              Target: {interview?.targetRole} • {interview?.companyType?.replace(/_/g, ' ')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/dashboard"
            className="btn-tactile-secondary px-3.5 py-2 text-xs gap-1.5"
          >
            <LayoutDashboard className="h-3.5 w-3.5" />
            <span>Dashboard</span>
          </Link>

          <Link
            href={`/interview/new?type=${interview?.type}`}
            className="btn-tactile-primary px-4 py-2 text-xs gap-1.5"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Retake Another Mock</span>
          </Link>
        </div>
      </div>

      {/* Main Grid: Rubric Dossier on Left, Interactive Transcript on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (Rubric Dossier): 7 cols on large screens */}
        <div className="lg:col-span-7 space-y-6">
          <RubricReport
            overallScore={feedback.overallScore}
            communicationScore={feedback.communicationScore}
            technicalDepthScore={feedback.technicalDepthScore}
            problemSolvingScore={feedback.problemSolvingScore}
            structureScore={feedback.structureScore}
            confidenceScore={feedback.confidenceScore}
            criteriaScores={feedback.criteriaScores || []}
            strengths={feedback.strengths || []}
            topImprovements={feedback.topImprovements || []}
            weakestQuestion={feedback.weakestQuestion}
            weakestAnswerSnippet={feedback.weakestAnswerSnippet}
            betterSampleAnswer={feedback.betterSampleAnswer}
            onSelectCitation={handleSelectCitation}
          />
        </div>

        {/* Right Column (Synchronized Transcript with Active Highlighting): 5 cols */}
        <div className="lg:col-span-5 sticky top-20 rounded-2xl border border-obsidian-750 bg-obsidian-900 overflow-hidden shadow-xl">
          <div className="border-b border-obsidian-750 bg-obsidian-850 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-obsidian-50">
              <FileText className="h-4 w-4 text-brand-400" />
              <span className="font-display">Full Interview Transcript</span>
            </div>
            <span className="font-mono text-[10px] text-obsidian-400 bg-obsidian-900 border border-obsidian-750 px-2 py-0.5 rounded-md">
              {transcript.length} lines indexed
            </span>
          </div>

          <div className="h-[750px] overflow-hidden bg-obsidian-950/40">
            <TranscriptView messages={transcript} highlightedLine={highlightedLine} />
          </div>
        </div>
      </div>
    </div>
  )
}
