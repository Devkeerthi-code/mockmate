'use client'

import Link from 'next/link'
import { TrendingUp, AlertTriangle, ArrowRight, Target, Calendar } from 'lucide-react'

export interface PastInterviewItem {
  id: string
  type: string
  targetRole: string
  companyType: string
  createdAt: string
  feedback?: {
    overallScore: number
    communicationScore: number
    technicalDepthScore: number
    problemSolvingScore: number
    structureScore: number
    confidenceScore: number
  } | null
}

export interface ProgressChartsProps {
  interviews: PastInterviewItem[]
}

export function ProgressCharts({ interviews }: ProgressChartsProps) {
  const completed = interviews.filter((i) => i.feedback)

  if (completed.length === 0) {
    return (
      <div className="rounded-2xl border border-obsidian-700 bg-obsidian-850 p-8 text-center text-obsidian-300">
        <Target className="mx-auto h-10 w-10 text-brand-400 mb-3" />
        <h3 className="text-base font-bold text-obsidian-50">No Completed Mock Interviews Yet</h3>
        <p className="text-xs text-obsidian-400 mt-1 max-w-md mx-auto">
          Complete your first mock interview to unlock your longitudinal rubric scores, communication diagnostics, and company-tier readiness.
        </p>
        <Link
          href="/interview/new"
          className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-brand-500 px-4 py-2 text-xs font-semibold text-obsidian-950 transition-all hover:bg-brand-400 shadow-glow-brand"
        >
          <span>Start Your First Mock</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    )
  }

  // Calculate average scores per dimension
  let totalOverall = 0
  let totalTech = 0
  let totalProb = 0
  let totalComm = 0
  let totalStruct = 0
  let totalConf = 0

  for (const item of completed) {
    const f = item.feedback!
    totalOverall += f.overallScore
    totalTech += f.technicalDepthScore
    totalProb += f.problemSolvingScore
    totalComm += f.communicationScore
    totalStruct += f.structureScore
    totalConf += f.confidenceScore
  }

  const count = completed.length
  const avgOverall = Math.round(totalOverall / count)
  const avgTech = Math.round(totalTech / count)
  const avgProb = Math.round(totalProb / count)
  const avgComm = Math.round(totalComm / count)
  const avgStruct = Math.round(totalStruct / count)
  const avgConf = Math.round(totalConf / count)

  // Find weakest dimension
  const dimensionAverages = [
    { name: 'Technical Depth', score: avgTech, recommendedType: 'RESUME_DEEP_DIVE' },
    { name: 'Problem Solving', score: avgProb, recommendedType: 'DSA_CODING' },
    { name: 'Communication', score: avgComm, recommendedType: 'HR_BEHAVIOURAL' },
    { name: 'Structure (STAR)', score: avgStruct, recommendedType: 'HR_BEHAVIOURAL' },
    { name: 'Confidence Signals', score: avgConf, recommendedType: 'CS_FUNDAMENTALS' },
  ]

  dimensionAverages.sort((a, b) => a.score - b.score)
  const weakestDimension = dimensionAverages[0]

  return (
    <div className="space-y-6">
      {/* Top Trend Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Longitudinal Score Card */}
        <div className="rounded-xl border border-obsidian-700 bg-obsidian-850 p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-obsidian-400">
            <span>Historical Average</span>
            <TrendingUp className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono text-obsidian-50">{avgOverall}</span>
            <span className="text-xs text-obsidian-400">/100 across {count} sessions</span>
          </div>
          <p className="text-[11px] text-obsidian-300">
            {avgOverall >= 80 ? 'Consistent Tier-1 Product Hiring Bar standard.' : 'Trending upwards towards target campus cutoff.'}
          </p>
        </div>

        {/* Weakest Area Flag */}
        <div className="rounded-xl border border-obsidian-700 bg-obsidian-850 p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-amber-400 font-semibold">
            <span>Primary Focus Area</span>
            <AlertTriangle className="h-4 w-4" />
          </div>
          <div className="text-xl font-bold text-obsidian-50">
            {weakestDimension.name} ({weakestDimension.score}/100)
          </div>
          <p className="text-[11px] text-obsidian-400">
            Identified as lowest scoring rubric dimension across your interview history.
          </p>
        </div>

        {/* Suggested Next Interview */}
        <div className="rounded-xl border border-brand-500/30 bg-brand-500/10 p-5 space-y-2 flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase text-brand-400">AI Placement Recommendation</span>
            <h4 className="text-sm font-bold text-obsidian-50 mt-1">
              Targeted {weakestDimension.recommendedType.replace('_', ' ')} Mock
            </h4>
            <p className="text-[11px] text-obsidian-300 mt-0.5">
              Refine your {weakestDimension.name.toLowerCase()} before placement season.
            </p>
          </div>
          <Link
            href={`/interview/new?type=${weakestDimension.recommendedType}`}
            className="inline-flex items-center justify-between rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-semibold text-obsidian-950 hover:bg-brand-400 transition-colors"
          >
            <span>Launch Recommended Mock</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* Historical Score Progression Chart */}
      <div className="rounded-xl border border-obsidian-700 bg-obsidian-850 p-5 space-y-4">
        <h4 className="text-sm font-bold text-obsidian-50 flex items-center gap-2">
          <Calendar className="h-4 w-4 text-brand-400" />
          <span>Score Progression Trajectory</span>
        </h4>

        <div className="space-y-3">
          {completed.slice(-5).map((item, idx) => {
            const score = item.feedback!.overallScore
            const dateStr = new Date(item.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })

            return (
              <div key={item.id} className="flex items-center gap-4 text-xs">
                <span className="w-16 font-mono text-obsidian-400 text-[11px]">{dateStr}</span>
                <span className="w-28 font-medium text-obsidian-200 truncate">{item.type.replace('_', ' ')}</span>
                <div className="flex-1 h-3 rounded-full bg-obsidian-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      score >= 80 ? 'bg-emerald-500' : score >= 65 ? 'bg-amber-500' : 'bg-rose-500'
                    }`}
                    style={{ width: `${score}%` }}
                  />
                </div>
                <span className="w-12 text-right font-mono font-bold text-obsidian-50">{score}</span>
                <Link
                  href={`/interview/${item.id}/feedback`}
                  className="text-brand-400 hover:text-brand-300 text-[11px] underline"
                >
                  View
                </Link>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
