import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getSessionUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const QuestionSchema = z.object({
  category: z.enum(['HR_BEHAVIOURAL', 'RESUME_DEEP_DIVE', 'DSA_CODING', 'CS_FUNDAMENTALS']),
  companyType: z.enum(['SERVICE_BASED', 'PRODUCT_BASED', 'STARTUP', 'GENERAL']).default('GENERAL'),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).default('MEDIUM'),
  topic: z.string().min(2),
  questionText: z.string().min(5),
  expectedPoints: z.array(z.string()).default([]),
  hints: z.array(z.string()).default([]),
  starterCode: z.string().optional(),
})

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category')
    const companyType = searchParams.get('companyType')
    const difficulty = searchParams.get('difficulty')

    const where: any = { isApproved: true }
    if (category) where.category = category
    if (companyType) where.companyType = companyType
    if (difficulty) where.difficulty = difficulty

    const questions = await prisma.questionBank.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    return NextResponse.json({
      disclaimer: 'Questions are curated practice patterns representing company tier archetypes. They do not represent proprietary or leaked questions from any specific corporate entity.',
      questions,
    })
  } catch (error) {
    console.error('Fetch questions error:', error)
    return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required to edit question bank.' }, { status: 403 })
    }

    const body = await req.json()
    const parsed = QuestionSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
    }

    const newQuestion = await prisma.questionBank.create({
      data: {
        category: parsed.data.category,
        companyType: parsed.data.companyType,
        difficulty: parsed.data.difficulty,
        topic: parsed.data.topic,
        questionText: parsed.data.questionText,
        expectedPoints: parsed.data.expectedPoints,
        hints: parsed.data.hints,
        starterCode: parsed.data.starterCode || null,
        createdById: user.id,
      },
    })

    return NextResponse.json({ success: true, question: newQuestion })
  } catch (error) {
    console.error('Create question error:', error)
    return NextResponse.json({ error: 'Failed to create question' }, { status: 500 })
  }
}
