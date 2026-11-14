import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding MockMate Question Bank and Demo User...')

  // Create demo admin and demo student
  const salt = await bcrypt.genSalt(10)
  const passwordHash = await bcrypt.hash('placement2026', salt)

  const admin = await prisma.user.upsert({
    where: { email: 'pdevkeerthi7@gmail.com' },
    update: { role: 'ADMIN' },
    create: {
      email: 'pdevkeerthi7@gmail.com',
      name: 'Platform Admin',
      passwordHash,
      role: 'ADMIN',
    },
  })

  const student = await prisma.user.upsert({
    where: { email: 'student@example.com' },
    update: {},
    create: {
      email: 'student@example.com',
      name: 'Aditya Verma (Demo Student)',
      passwordHash,
      role: 'STUDENT',
    },
  })

  // Seed standard practice questions in Question Bank
  const questions = [
    {
      category: 'CS_FUNDAMENTALS' as const,
      companyType: 'PRODUCT_BASED' as const,
      difficulty: 'MEDIUM' as const,
      topic: 'DBMS Indexing & B-Trees',
      questionText: 'How does a B-Tree index accelerate SQL read queries under the hood, and what are the trade-offs on INSERT and UPDATE throughput?',
      expectedPoints: [
        'Logarithmic lookup time O(log N)',
        'Balanced multi-way search tree minimizing disk I/O blocks',
        'Overhead during writes: node splits, rebalancing, and WAL writes',
      ],
      hints: [
        'Think about disk page block sizing and fan-out ratio.',
        'Consider write amplification when index depth increases.',
      ],
    },
    {
      category: 'CS_FUNDAMENTALS' as const,
      companyType: 'SERVICE_BASED' as const,
      difficulty: 'EASY' as const,
      topic: 'Object-Oriented Programming (OOP)',
      questionText: 'What is the difference between Method Overloading and Method Overriding in Java/C++? Give a concrete real-world example of runtime polymorphism.',
      expectedPoints: [
        'Overloading is compile-time (static polymorphism) within the same class signature',
        'Overriding is runtime (dynamic polymorphism) using virtual tables (vtable)',
        'Base class reference pointing to derived class instance at runtime',
      ],
      hints: [
        'Think about when method signatures are resolved by the compiler vs virtual machine.',
      ],
    },
    {
      category: 'HR_BEHAVIOURAL' as const,
      companyType: 'PRODUCT_BASED' as const,
      difficulty: 'MEDIUM' as const,
      topic: 'Conflict Resolution (STAR)',
      questionText: 'Describe a situation where you strongly disagreed with a peer or team lead regarding a software design choice. How did you resolve the deadlock?',
      expectedPoints: [
        'Situation: clearly frame the stakes and project context',
        'Task: define the conflicting viewpoints neutrally',
        'Action: empirical benchmarking, A/B testing, or data-driven discussion',
        'Result: team alignment, delivery on time, zero interpersonal friction',
      ],
      hints: [
        'Avoid blaming the other person; emphasize data, prototypes, and shared project goals.',
      ],
    },
    {
      category: 'DSA_CODING' as const,
      companyType: 'PRODUCT_BASED' as const,
      difficulty: 'MEDIUM' as const,
      topic: 'Dynamic Programming & Arrays',
      questionText: 'Given an integer array nums, find the contiguous subarray with the largest sum and return its value (Kadane’s Algorithm).',
      expectedPoints: [
        'Optimal time complexity: O(N) single pass',
        'Auxiliary space complexity: O(1) in-place accumulation',
        'Handling array of all negative numbers properly',
      ],
      hints: [
        'At each index i, decide whether to start a new subarray or extend the current one.',
      ],
      starterCode: 'function maxSubArray(nums) {\n  // Write optimal Kadane solution\n}',
    },
    {
      category: 'RESUME_DEEP_DIVE' as const,
      companyType: 'STARTUP' as const,
      difficulty: 'HARD' as const,
      topic: 'Distributed Systems & Microservices',
      questionText: 'When designing a microservice architecture for order checkout, how do you handle partial failures across payment gateway and inventory decrement without distributed two-phase commit (2PC)?',
      expectedPoints: [
        'Saga pattern (orchestration or choreography)',
        'Compensating transactions on failure',
        'Idempotency keys on payment endpoints',
        'Outbox pattern for reliable message dispatch',
      ],
      hints: [
        'Think about eventual consistency and compensating actions instead of strict locking.',
      ],
    },
  ]

  for (const q of questions) {
    await prisma.questionBank.create({
      data: {
        category: q.category,
        companyType: q.companyType,
        difficulty: q.difficulty,
        topic: q.topic,
        questionText: q.questionText,
        expectedPoints: q.expectedPoints,
        hints: q.hints,
        starterCode: q.starterCode || null,
        createdById: admin.id,
      },
    })
  }

  console.log('✅ Seed completed successfully.')
}

main()
  .catch((e) => {
    console.error('Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
