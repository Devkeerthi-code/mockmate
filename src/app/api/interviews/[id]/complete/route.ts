import { NextRequest, NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { evaluateTranscriptRubric, TranscriptEntry } from '@/lib/rubric-evaluator'
import { recordMetric } from '@/lib/metrics'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getSessionUser(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const interview = await prisma.interview.findUnique({
      where: { id: params.id },
      include: {
        messages: {
          orderBy: { orderIndex: 'asc' },
        },
        feedback: true,
      },
    })

    if (!interview) {
      return NextResponse.json({ error: 'Interview not found' }, { status: 404 })
    }

    if (interview.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // If feedback already generated, return existing
    if (interview.feedback) {
      return NextResponse.json({ success: true, feedback: interview.feedback })
    }

    const now = new Date()
    const startTime = interview.startedAt ? new Date(interview.startedAt).getTime() : now.getTime()
    const totalSeconds = Math.max(1, Math.round((now.getTime() - startTime) / 1000))

    // Prepare transcript for rubric evaluation
    const transcriptEntries: TranscriptEntry[] = interview.messages.map((m, idx) => ({
      lineIndex: idx + 1,
      role: m.role as any,
      content: m.content,
      pauseMs: m.pauseMs || undefined,
      fillerWordCount: m.fillerWordCount || 0,
    }))

    // Compute rubric evaluation
    const rubric = evaluateTranscriptRubric(
      transcriptEntries,
      interview.type,
      interview.companyType
    )

    // Save feedback and mark interview completed
    const [updatedInterview, feedback] = await prisma.$transaction([
      prisma.interview.update({
        where: { id: interview.id },
        data: {
          status: 'COMPLETED',
          endedAt: now,
          totalDurationSeconds: totalSeconds,
        },
      }),
      prisma.interviewFeedback.create({
        data: {
          interviewId: interview.id,
          overallScore: rubric.overallScore,
          communicationScore: rubric.communicationScore,
          technicalDepthScore: rubric.technicalDepthScore,
          problemSolvingScore: rubric.problemSolvingScore,
          structureScore: rubric.structureScore,
          confidenceScore: rubric.confidenceScore,
          criteriaScores: rubric.criteriaScores as any,
          strengths: rubric.strengths,
          topImprovements: rubric.topImprovements as any,
          weakestQuestion: rubric.weakestQuestion,
          weakestAnswerSnippet: rubric.weakestAnswerSnippet,
          betterSampleAnswer: rubric.betterSampleAnswer,
        },
      }),
    ])

    await recordMetric('INTERVIEWS_COMPLETED')

    return NextResponse.json({
      success: true,
      interview: updatedInterview,
      feedback,
    })
  } catch (error) {
    console.error('Complete interview error:', error)
    return NextResponse.json({ error: 'Failed to complete interview and evaluate rubric' }, { status: 500 })
  }
}
