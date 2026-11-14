'use client'

import { useState } from 'react'
import { Award, CheckCircle2, AlertCircle, ChevronDown, ChevronUp, Quote, Sparkles, ExternalLink, Target, Flame } from 'lucide-react'

export interface RubricCriterion {
  criterion: string
  scoreOutOf10: number
  weight: number
  rationale: string
  citedTranscriptLines: number[]
}

export interface TopImprovementItem {
  title: string
  description: string
  actionableTip: string
  citedLine: number
}

export interface RubricReportProps {
  overallScore: number
  communicationScore: number
  technicalDepthScore: number
  problemSolvingScore: number
  structureScore: number
  confidenceScore: number
  criteriaScores: RubricCriterion[]
  strengths: string[]
  topImprovements: TopImprovementItem[]
  weakestQuestion: string
  weakestAnswerSnippet: string
  betterSampleAnswer: string
  onSelectCitation?: (lineNumber: number) => void
}

export function RubricReport({
  overallScore,
  communicationScore,
  technicalDepthScore,
  problemSolvingScore,
  structureScore,
  confidenceScore,
  criteriaScores,
  strengths,
  topImprovements,
  weakestQuestion,
  weakestAnswerSnippet,
  betterSampleAnswer,
  onSelectCitation,
}: RubricReportProps) {
  const [modelAnswerExpanded, setModelAnswerExpanded] = useState(true)

  // Hiring Bar Decision Calculation
  let verdict = 'NEEDS WORK'
  let verdictStyle = 'text-rose-400 border-rose-500/40 bg-rose-500/10'
  let scoreColor = '#F43F5E'

  if (overallScore >= 85) {
    verdict = 'STRONG HIRE (DAY 1 TECH)'
    verdictStyle = 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10'
    scoreColor = '#10B981'
  } else if (overallScore >= 75) {
    verdict = 'HIRE (TIER-1 PLACEMENT)'
    verdictStyle = 'text-brand-300 border-brand-500/40 bg-brand-500/10'
    scoreColor = '#F59E0B'
  } else if (overallScore >= 65) {
    verdict = 'LEANING HIRE (BORDERLINE)'
    verdictStyle = 'text-amber-400 border-amber-500/40 bg-amber-500/10'
    scoreColor = '#FBBF24'
  }

  const dimensions = [
    { label: 'Technical Depth', score: technicalDepthScore, weight: '25%', color: 'from-brand-500 to-amber-400' },
    { label: 'Problem Solving', score: problemSolvingScore, weight: '25%', color: 'from-sky-500 to-blue-400' },
    { label: 'Communication & Cadence', score: communicationScore, weight: '20%', color: 'from-emerald-500 to-teal-400' },
    { label: 'Structure (STAR Framework)', score: structureScore, weight: '15%', color: 'from-purple-500 to-indigo-400' },
    { label: 'Confidence & Filler Words', score: confidenceScore, weight: '15%', color: 'from-rose-500 to-orange-400' },
  ]

  // Circular Dial Math (radius 48, perimeter ~301.6)
  const radius = 48
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (overallScore / 100) * circumference

  return (
    <div className="space-y-6 text-obsidian-100">
      {/* Visual Score Dial Header Card */}
      <div className="relative overflow-hidden rounded-3xl border border-obsidian-750 bg-gradient-to-b from-obsidian-850 to-obsidian-900 p-6 sm:p-8 shadow-xl">
        <div className="pointer-events-none absolute top-0 right-0 h-48 w-48 -translate-y-12 translate-x-12 rounded-full bg-brand-500/10 blur-3xl" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
            {/* Circular Gauge Dial */}
            <div className="relative flex h-28 w-28 shrink-0 items-center justify-center">
              <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 120 120">
                <circle
                  cx="60"
                  cy="60"
                  r={radius}
                  className="text-obsidian-800"
                  strokeWidth="8"
                  stroke="currentColor"
                  fill="transparent"
                />
                <circle
                  cx="60"
                  cy="60"
                  r={radius}
                  stroke={scoreColor}
                  strokeWidth="8"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="font-display text-3xl font-black tracking-tight text-obsidian-50">
                  {overallScore}
                </span>
                <span className="font-mono text-[9px] uppercase tracking-wider text-obsidian-400">
                  OUT OF 100
                </span>
              </div>
            </div>

            <div>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 mb-2">
                <h2 className="font-display text-2xl font-black tracking-tight text-obsidian-50">
                  Placement Evaluation Dossier
                </h2>
                <span className={`sticker-badge sticker-tilt-right ${verdictStyle}`}>
                  {verdict}
                </span>
              </div>
              <p className="text-xs text-obsidian-300 max-w-lg leading-relaxed">
                Evaluated against Tier-1 placement panels. Every score is directly cited from your live verbal statements.
              </p>
              <p className="mt-1 hand-annotation text-amber-300 text-sm">
                Transcript-grounded evidence ✍️
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center sm:items-end gap-2 text-right">
            <span className="sticker-badge sticker-tilt-left border-brand-400/60 bg-brand-500/10 text-brand-300 text-[10px]">
              CAMPUS HIRING BAR
            </span>
            <span className="font-mono text-[11px] text-obsidian-400">
              5 Standard Rubric Dimensions
            </span>
          </div>
        </div>
      </div>

      {/* 5 Radar Rubric Bars with Weights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {dimensions.map((dim) => (
          <div
            key={dim.label}
            className="flex flex-col justify-between rounded-2xl border border-obsidian-750 bg-obsidian-850 p-4 transition-all hover:border-obsidian-600 shadow-sm"
          >
            <div>
              <div className="flex items-center justify-between text-xs text-obsidian-400 mb-1.5">
                <span className="font-medium truncate">{dim.label}</span>
                <span className="font-mono text-[10px] text-obsidian-500">{dim.weight}</span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-display text-2xl font-black text-obsidian-50">
                  {dim.score}
                </span>
                <span className="font-mono text-[10px] text-obsidian-400">/100</span>
              </div>
            </div>

            <div className="mt-3.5">
              <div className="h-2 w-full overflow-hidden rounded-full bg-obsidian-800 border border-obsidian-750">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${dim.color} transition-all duration-700`}
                  style={{ width: `${Math.max(dim.score, 6)}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Rubric Rationale & Clickable Citation Badges */}
      {criteriaScores && criteriaScores.length > 0 && (
        <div className="rounded-2xl border border-obsidian-750 bg-obsidian-850 p-6 space-y-4 shadow-md">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-base font-bold text-obsidian-50 flex items-center gap-2">
              <Quote className="h-4 w-4 text-brand-400" />
              <span>Verbal Citation Badges & Evidence Analysis</span>
            </h3>
            <span className="hand-annotation text-amber-300 text-xs hidden sm:inline">
              Click any line badge to inspect transcript ✍️
            </span>
          </div>

          <div className="space-y-3">
            {criteriaScores.map((item, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-obsidian-750 bg-obsidian-900/70 p-4 text-xs space-y-2 transition-colors hover:border-obsidian-600"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className="font-semibold text-obsidian-100">{item.criterion}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-brand-400 text-xs">
                      {item.scoreOutOf10}/10
                    </span>
                    <span className="font-mono text-[10px] text-obsidian-400">
                      ({item.weight}% weight)
                    </span>
                  </div>
                </div>

                <p className="text-obsidian-300 text-[11px] leading-relaxed">
                  {item.rationale}
                </p>

                {item.citedTranscriptLines && item.citedTranscriptLines.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-obsidian-800/80">
                    <span className="font-mono text-[10px] uppercase text-obsidian-400">
                      Cited Transcript Lines:
                    </span>
                    {item.citedTranscriptLines.map((line) => (
                      <button
                        key={line}
                        onClick={() => onSelectCitation?.(line)}
                        className="sticker-badge sticker-tilt-subtle border-brand-500/40 bg-brand-500/10 text-brand-300 font-mono text-[10px] hover:bg-brand-500/20 transition-all active:scale-95"
                        title={`Jump to line ${line}`}
                      >
                        <span>Line {line}</span>
                        <ExternalLink className="h-2.5 w-2.5 opacity-60" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Strengths & Prioritized Top Improvements */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Confirmed Strengths */}
        <div className="rounded-2xl border border-obsidian-750 bg-obsidian-850 p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-sm font-bold text-emerald-400 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              <span>Confirmed Strengths</span>
            </h3>
            <span className="sticker-badge sticker-tilt-right border-emerald-400/50 bg-emerald-500/10 text-emerald-300 text-[9px]">
              KEEP DOING THIS
            </span>
          </div>

          <ul className="space-y-3">
            {strengths.map((str, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-xs text-obsidian-200">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />
                <span className="leading-relaxed">{str}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Top 3 Prioritized Improvements with hand-drawn tips */}
        <div className="rounded-2xl border border-obsidian-750 bg-obsidian-850 p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-sm font-bold text-amber-400 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              <span>Top Prioritized Improvements</span>
            </h3>
            <span className="hand-annotation text-amber-300 text-xs">
              Fix this before next mock ⚠️
            </span>
          </div>

          <div className="space-y-3">
            {topImprovements.map((imp, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-obsidian-750 bg-obsidian-900/60 p-3.5 text-xs space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-obsidian-100">
                    #{idx + 1} {imp.title}
                  </span>
                  {imp.citedLine && (
                    <button
                      onClick={() => onSelectCitation?.(imp.citedLine)}
                      className="sticker-badge sticker-tilt-left border-amber-500/40 bg-amber-500/10 text-amber-300 font-mono text-[9px]"
                    >
                      Line {imp.citedLine}
                    </button>
                  )}
                </div>
                <p className="text-obsidian-300 text-[11px] leading-relaxed">
                  {imp.description}
                </p>
                <div className="rounded-lg bg-obsidian-800/80 p-2 text-[11px] text-amber-300 border border-obsidian-700">
                  <span className="font-semibold text-amber-400">Actionable Drill: </span>
                  {imp.actionableTip}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Side-by-Side Candidate vs 95+ Model Answer */}
      <div className="rounded-2xl border-2 border-brand-500/40 bg-obsidian-850 p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-brand-400 font-display font-bold text-base">
            <Sparkles className="h-4 w-4" />
            <span>Side-by-Side Model Rewrite (Weakest Question Refactored)</span>
          </div>
          <button
            onClick={() => setModelAnswerExpanded(!modelAnswerExpanded)}
            className="flex items-center gap-1 text-xs text-obsidian-300 hover:text-obsidian-50 transition-colors"
          >
            <span className="font-mono text-[10px]">{modelAnswerExpanded ? 'Collapse' : 'Expand'}</span>
            {modelAnswerExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>

        {modelAnswerExpanded && (
          <div className="space-y-4 pt-2 text-xs">
            <div className="rounded-xl border border-obsidian-700 bg-obsidian-900/80 p-3.5">
              <span className="text-[10px] uppercase font-mono font-bold text-amber-400">
                Target Placement Question:
              </span>
              <p className="font-display font-bold text-obsidian-50 text-sm mt-0.5">
                {weakestQuestion || 'Walk me through a challenging technical problem you solved.'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Student's Actual Response */}
              <div className="rounded-xl border border-rose-500/40 bg-rose-500/5 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase font-bold text-rose-400">
                    Your Actual Response (Excerpt)
                  </span>
                  <span className="sticker-badge sticker-tilt-left border-rose-500/40 bg-rose-500/10 text-rose-300 text-[9px]">
                    TRANSCRIPT CITED
                  </span>
                </div>
                <p className="text-obsidian-200 text-xs leading-relaxed italic border-l-2 border-rose-500/40 pl-3 py-1">
                  &ldquo;{weakestAnswerSnippet || 'Brief or unstructured response.'}&rdquo;
                </p>
                <p className="text-[10px] text-rose-300/80 font-mono">
                  Analysis: Lacked quantified metrics and clear STAR situation framing.
                </p>
              </div>

              {/* Model 95+ Score Answer */}
              <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/5 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase font-bold text-emerald-400">
                    95+ Score Model Answer (STAR Grounded)
                  </span>
                  <span className="sticker-badge sticker-tilt-right border-emerald-500/40 bg-emerald-500/10 text-emerald-300 text-[9px]">
                    RECOMMENDED REWRITE
                  </span>
                </div>
                <div className="text-obsidian-100 text-xs leading-relaxed whitespace-pre-line border-l-2 border-emerald-500/40 pl-3 py-1 font-body">
                  {betterSampleAnswer}
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="rounded bg-sky-500/15 px-1.5 py-0.5 text-[9px] font-mono text-sky-300">
                    [SITUATION & METRIC]
                  </span>
                  <span className="rounded bg-brand-500/15 px-1.5 py-0.5 text-[9px] font-mono text-brand-300">
                    [ARCHITECTURAL ACTION]
                  </span>
                  <span className="rounded bg-emerald-500/15 px-1.5 py-0.5 text-[9px] font-mono text-emerald-300">
                    [QUANTIFIED RESULT]
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
