import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getSessionUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { evaluateNextInterviewStep } from '@/lib/state-machine'
import { generateInterviewerQuestion } from '@/lib/gemini'
import { countFillerWords } from '@/lib/rubric-evaluator'

const SendMessageSchema = z.object({
  content: z.string().min(1, 'Response cannot be empty'),
  durationMs: z.number().optional(),
  pauseMs: z.number().optional(),
  codeSnippet: z.string().optional(),
})

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getSessionUser(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const parsed = SendMessageSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
    }

    const { content, durationMs, pauseMs, codeSnippet } = parsed.data

    const interview = await prisma.interview.findUnique({
      where: { id: params.id },
      include: {
        messages: {
          orderBy: { orderIndex: 'asc' },
        },
      },
    })

    if (!interview) {
      return NextResponse.json({ error: 'Interview not found' }, { status: 404 })
    }

    if (interview.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (interview.status === 'COMPLETED') {
      return NextResponse.json({ error: 'Interview is already completed' }, { status: 400 })
    }

    // Analyze filler words in candidate speech
    const fillers = countFillerWords(content)

    // Calculate current order index
    const lastOrderIndex = interview.messages.length > 0
      ? interview.messages[interview.messages.length - 1].orderIndex
      : 0

    // Save candidate message
    const candidateMsg = await prisma.transcriptMessage.create({
      data: {
        interviewId: interview.id,
        role: 'CANDIDATE',
        content: content.trim(),
        orderIndex: lastOrderIndex + 1,
        durationMs: durationMs || null,
        pauseMs: pauseMs || null,
        fillerWords: fillers.words,
        fillerWordCount: fillers.count,
        isCodeSnippet: !!codeSnippet,
      },
    })

    // Fetch user resume for context
    const resume = await prisma.resume.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    })

    const candidateSkills = resume?.parsedSkills || []
    const candidateProjects = (resume?.parsedProjects as any[]) || []

    // Calculate elapsed time in minutes
    const startTime = interview.startedAt ? new Date(interview.startedAt).getTime() : Date.now()
    const elapsedMinutes = Math.floor((Date.now() - startTime) / 60000)

    // Count questions asked so far
    const interviewerMsgs = interview.messages.filter((m) => m.role === 'INTERVIEWER')
    const totalQuestionsAsked = interviewerMsgs.length

    // Run state machine
    const nextAction = evaluateNextInterviewStep(
      {
        interviewType: interview.type as any,
        companyType: interview.companyType as any,
        difficulty: interview.difficulty as any,
        durationMinutes: interview.durationMinutes,
        elapsedMinutes,
        totalQuestionsAsked,
        followUpsOnCurrentQuestion: 0,
        candidateProjects,
        candidateSkills,
        isCodingRound: interview.type === 'DSA_CODING',
        hasRunCode: !!interview.codeExecutionOutput,
        codeExecutionPassed: true,
      },
      content
    )

    // Format conversation history
    const history = [...interview.messages, candidateMsg].map((m) => ({
      role: m.role as 'INTERVIEWER' | 'CANDIDATE',
      content: m.content,
    }))

    // Generate interviewer's response
    const nextQuestionText = await generateInterviewerQuestion({
      interviewType: interview.type,
      targetRole: interview.targetRole,
      companyType: interview.companyType,
      difficulty: interview.difficulty,
      resumeSkills: candidateSkills,
      resumeProjects: candidateProjects,
      conversationHistory: history,
      actionType: nextAction.type,
      actionFocus: (nextAction as any).focusArea,
    })

    // Save interviewer message
    const interviewerMsg = await prisma.transcriptMessage.create({
      data: {
        interviewId: interview.id,
        role: 'INTERVIEWER',
        content: nextQuestionText,
        orderIndex: lastOrderIndex + 2,
      },
    })

    return NextResponse.json({
      success: true,
      candidateMessage: candidateMsg,
      interviewerMessage: interviewerMsg,
      nextActionType: nextAction.type,
    })
  } catch (error) {
    console.error('Send message error:', error)
    return NextResponse.json({ error: 'Failed to process interview message' }, { status: 500 })
  }
}
