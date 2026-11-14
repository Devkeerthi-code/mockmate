import { NextRequest, NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function DELETE(req: NextRequest) {
  try {
    const user = await getSessionUser(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Cascade delete user data (Prisma relations configured with onDelete: Cascade)
    await prisma.user.delete({
      where: { id: user.id },
    })

    const response = NextResponse.json({
      success: true,
      message: 'All personal data, resumes, transcripts, and evaluation dossiers have been permanently deleted.',
    })

    // Clear session cookie
    response.cookies.set('mockmate_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    })

    return response
  } catch (error) {
    console.error('Delete data error:', error)
    return NextResponse.json({ error: 'Failed to delete user data' }, { status: 500 })
  }
}
