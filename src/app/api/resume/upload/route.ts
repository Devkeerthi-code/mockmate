import { NextRequest, NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { parseResumeText } from '@/lib/resume-parser'
import { recordMetric } from '@/lib/metrics'

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized. Please sign in.' }, { status: 401 })
    }

    const contentType = req.headers.get('content-type') || ''
    let rawText = ''
    let fileName = 'resume.txt'
    let fileSize = 0

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData()
      const file = formData.get('file') as File | null
      const directText = formData.get('text') as string | null

      if (directText && directText.trim().length > 50) {
        rawText = directText
        fileName = 'pasted-resume.txt'
        fileSize = Buffer.byteLength(rawText)
      } else if (file) {
        fileName = file.name
        fileSize = file.size
        const buffer = Buffer.from(await file.arrayBuffer())

        if (fileName.toLowerCase().endsWith('.pdf')) {
          try {
            // Lazy load pdf-parse
            const pdfParse = require('pdf-parse')
            const pdfData = await pdfParse(buffer)
            rawText = pdfData.text
          } catch (pdfErr) {
            console.warn('PDF parse failed, using fallback string decoding:', pdfErr)
            rawText = buffer.toString('utf-8')
          }
        } else {
          rawText = buffer.toString('utf-8')
        }
      } else {
        return NextResponse.json({ error: 'Please upload a PDF resume or paste text.' }, { status: 400 })
      }
    } else {
      const json = await req.json()
      rawText = json.text || ''
      fileName = json.fileName || 'resume.txt'
      fileSize = Buffer.byteLength(rawText)
    }

    if (!rawText || rawText.trim().length < 40) {
      return NextResponse.json(
        { error: 'Uploaded resume content is too short or empty. Please upload a detailed resume.' },
        { status: 400 }
      )
    }

    // Parse structured entities
    const parsed = parseResumeText(rawText)

    // Store in database
    const savedResume = await prisma.resume.create({
      data: {
        userId: user.id,
        fileName,
        fileSize,
        rawText,
        parsedSkills: parsed.skills,
        parsedProjects: parsed.projects as any,
        parsedExperience: parsed.experience as any,
        education: parsed.education as any,
      },
    })

    await recordMetric('RESUMES_PARSED')

    return NextResponse.json({
      success: true,
      resume: savedResume,
      parsed,
    })
  } catch (error) {
    console.error('Resume upload error:', error)
    return NextResponse.json({ error: 'Failed to parse and save resume' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const latestResume = await prisma.resume.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ resume: latestResume })
  } catch (error) {
    console.error('Resume fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch resume' }, { status: 500 })
  }
}
