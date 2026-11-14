import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getSessionUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { recordMetric } from '@/lib/metrics'

const SyncCodeSchema = z.object({
  code: z.string(),
  output: z.string().optional(),
  language: z.enum(['javascript', 'python']).optional(),
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
    const parsed = SyncCodeSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
    }

    const { code, output, language } = parsed.data

    const updated = await prisma.interview.update({
      where: { id: params.id },
      data: {
        submittedCode: code,
        codeExecutionOutput: output || null,
        codingLanguage: language,
      },
      select: {
        id: true,
        submittedCode: true,
        codeExecutionOutput: true,
        codingLanguage: true,
      },
    })

    if (output) {
      await recordMetric('CODE_EXECUTIONS')
    }

    return NextResponse.json({ success: true, interview: updated })
  } catch (error) {
    console.error('Code sync error:', error)
    return NextResponse.json({ error: 'Failed to sync code' }, { status: 500 })
  }
}
