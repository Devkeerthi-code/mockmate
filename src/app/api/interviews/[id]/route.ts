import { NextRequest, NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
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

    if (interview.userId !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json({ interview })
  } catch (error) {
    console.error('Fetch interview error:', error)
    return NextResponse.json({ error: 'Failed to fetch interview' }, { status: 500 })
  }
}
