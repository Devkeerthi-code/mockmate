import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getSessionUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateInterviewerQuestion } from '@/lib/gemini'
import { recordMetric } from '@/lib/metrics'

const CreateInterviewSchema = z.object({
  type: z.enum(['HR_BEHAVIOURAL', 'RESUME_DEEP_DIVE', 'DSA_CODING', 'CS_FUNDAMENTALS']),
  targetRole: z.string().min(2).default('Software Engineer (SDE-1)'),
  companyType: z.enum(['SERVICE_BASED', 'PRODUCT_BASED', 'STARTUP', 'GENERAL']).default('PRODUCT_BASED'),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).default('MEDIUM'),
  durationMinutes: z.number().min(15).max(60).default(30),
  codingLanguage: z.enum(['javascript', 'python']).optional(),
})

const DSA_PROBLEMS = [
  {
    title: 'Maximum Subarray Sum (Kadane’s Algorithm)',
    statement: `Given an integer array nums, find the contiguous subarray (containing at least one number) which has the largest sum and return its sum.\n\nExample 1:\nInput: nums = [-2,1,-3,4,-1,2,1,-5,4]\nOutput: 6\nExplanation: [4,-1,2,1] has the largest sum = 6.\n\nConstraints:\n- 1 <= nums.length <= 10^5\n- -10^4 <= nums[i] <= 10^4`,
    starterJS: `function maxSubArray(nums) {\n  // Implement Kadane's algorithm\n  let maxSum = nums[0];\n  let currentSum = nums[0];\n  for (let i = 1; i < nums.length; i++) {\n    currentSum = Math.max(nums[i], currentSum + nums[i]);\n    maxSum = Math.max(maxSum, currentSum);\n  }\n  return maxSum;\n}\n\n// Test execution\nconsole.log("Test 1 Result:", maxSubArray([-2,1,-3,4,-1,2,1,-5,4]));`,
    starterPy: `def max_sub_array(nums):\n    # Implement Kadane's algorithm\n    max_sum = nums[0]\n    current_sum = nums[0]\n    for num in nums[1:]:\n        current_sum = max(num, current_sum + num)\n        max_sum = max(max_sum, current_sum)\n    return max_sum\n\n# Test execution\nprint("Test 1 Result:", max_sub_array([-2,1,-3,4,-1,2,1,-5,4]))`,
  },
  {
    title: 'Two Sum Problem',
    statement: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nConstraints:\n- Exactly one valid answer exists.\n- Time complexity target: O(N).`,
    starterJS: `function twoSum(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i];\n    if (map.has(complement)) {\n      return [map.get(complement), i];\n    }\n    map.set(nums[i], i);\n  }\n  return [];\n}\n\nconsole.log("Result:", twoSum([2, 7, 11, 15], 9));`,
    starterPy: `def two_sum(nums, target):\n    lookup = {}\n    for i, num in enumerate(nums):\n        diff = target - num\n        if diff in lookup:\n            return [lookup[diff], i]\n        lookup[num] = i\n    return []\n\nprint("Result:", two_sum([2, 7, 11, 15], 9))`,
  },
]

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized. Please sign in.' }, { status: 401 })
    }

    const body = await req.json()
    const parsed = CreateInterviewSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
    }

    const { type, targetRole, companyType, difficulty, durationMinutes, codingLanguage } = parsed.data

    // Fetch user's latest resume for context
    const latestResume = await prisma.resume.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    })

    const parsedSkills = latestResume?.parsedSkills || []
    const parsedProjects = (latestResume?.parsedProjects as any[]) || []

    // Prepare coding problem if type is DSA
    let problemStatement: string | null = null
    let starterCode: string | null = null
    const chosenLang = codingLanguage || 'javascript'

    if (type === 'DSA_CODING') {
      const problem = DSA_PROBLEMS[Math.floor(Math.random() * DSA_PROBLEMS.length)]
      problemStatement = `${problem.title}\n\n${problem.statement}`
      starterCode = chosenLang === 'python' ? problem.starterPy : problem.starterJS
    }

    // Generate initial greeting / question
    const openingQuestion = await generateInterviewerQuestion({
      interviewType: type,
      targetRole,
      companyType,
      difficulty,
      resumeSkills: parsedSkills,
      resumeProjects: parsedProjects,
      conversationHistory: [],
      actionType: 'ASK_INITIAL_QUESTION',
      actionFocus: 'greeting_and_first_topic',
    })

    // Create interview record
    const interview = await prisma.interview.create({
      data: {
        userId: user.id,
        type,
        targetRole,
        companyType,
        difficulty,
        durationMinutes,
        status: 'IN_PROGRESS',
        codingLanguage: type === 'DSA_CODING' ? chosenLang : null,
        problemStatement,
        starterCode,
        submittedCode: starterCode,
        startedAt: new Date(),
        messages: {
          create: [
            {
              role: 'INTERVIEWER',
              content: openingQuestion,
              orderIndex: 1,
            },
          ],
        },
      },
      include: {
        messages: true,
      },
    })

    await recordMetric('INTERVIEWS_STARTED')

    return NextResponse.json({
      success: true,
      interview,
    })
  } catch (error) {
    console.error('Create interview error:', error)
    return NextResponse.json({ error: 'Failed to create interview session' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const interviews = await prisma.interview.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        feedback: {
          select: {
            overallScore: true,
            communicationScore: true,
            technicalDepthScore: true,
            problemSolvingScore: true,
            structureScore: true,
            confidenceScore: true,
            createdAt: true,
          },
        },
        _count: {
          select: { messages: true },
        },
      },
    })

    return NextResponse.json({ interviews })
  } catch (error) {
    console.error('List interviews error:', error)
    return NextResponse.json({ error: 'Failed to list interviews' }, { status: 500 })
  }
}
