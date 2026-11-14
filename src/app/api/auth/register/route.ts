import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { hashPassword, signToken, isUserAdmin } from '@/lib/auth'
import { recordMetric } from '@/lib/metrics'

const RegisterSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = RegisterSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
    }

    const { email, password, name } = parsed.data
    const normalizedEmail = email.toLowerCase().trim()

    let existing = null
    try {
      existing = await prisma.user.findUnique({
        where: { email: normalizedEmail },
      })
    } catch (dbErr: any) {
      console.error('Database query error on user lookup:', dbErr)
      return NextResponse.json(
        {
          error:
            'Database error: Could not query User table. Please make sure you ran `npm run db:push` to sync the Prisma schema to your PostgreSQL database. Details: ' +
            (dbErr?.message || String(dbErr)),
        },
        { status: 500 }
      )
    }

    if (existing) {
      return NextResponse.json({ error: 'An account with this email already exists. Please sign in.' }, { status: 409 })
    }

    const passwordHash = await hashPassword(password)
    const role = isUserAdmin(normalizedEmail) ? 'ADMIN' : 'STUDENT'

    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        passwordHash,
        name: name.trim(),
        role,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    })

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    })

    await recordMetric('USERS_REGISTERED')

    const response = NextResponse.json({ user, token })
    response.cookies.set('mockmate_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    })

    return response
  } catch (error: any) {
    console.error('Registration unhandled error:', error)
    return NextResponse.json(
      { error: error?.message || 'Internal server error during registration' },
      { status: 500 }
    )
  }
}
