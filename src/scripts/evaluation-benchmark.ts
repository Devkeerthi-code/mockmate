import { evaluateTranscriptRubric, TranscriptEntry } from '../lib/rubric-evaluator'

interface EvaluationCase {
  id: string
  name: string
  tier: 'STRONG' | 'AVERAGE' | 'WEAK'
  expectedMin: number
  expectedMax: number
  transcript: TranscriptEntry[]
}

export const EVALUATION_CASES: EvaluationCase[] = [
  // 1. Strong: Distributed Caching & Concurrency
  {
    id: 'CASE_01_STRONG_CACHE',
    name: 'Fictional SDE-1 Strong: Redis Caching & Invalidation',
    tier: 'STRONG',
    expectedMin: 80,
    expectedMax: 95,
    transcript: [
      {
        lineIndex: 1,
        role: 'INTERVIEWER',
        content: 'In your distributed e-commerce project, how did you avoid cache stampede when products went viral?',
      },
      {
        lineIndex: 2,
        role: 'CANDIDATE',
        content:
          'When building our flash sale service, we prevented cache stampede by pairing probabilistic early expiration (XFetch algorithm) with distributed mutex locks via Redis Redlock. If a hot key expired, only one worker thread acquired the lease to query PostgreSQL and repopulate Redis, while others served the slightly stale cached value for up to 3 seconds. This cut database CPU spikes by 78% and kept p99 latency at 45ms under 8,000 req/sec.',
        pauseMs: 800,
        fillerWordCount: 0,
      },
    ],
  },
  // 2. Strong: DSA Two-Pointer & Sliding Window
  {
    id: 'CASE_02_STRONG_DSA',
    name: 'Fictional SDE-1 Strong: Sliding Window Algorithm',
    tier: 'STRONG',
    expectedMin: 80,
    expectedMax: 95,
    transcript: [
      {
        lineIndex: 1,
        role: 'INTERVIEWER',
        content: 'How would you find the length of the longest substring with at most k distinct characters?',
      },
      {
        lineIndex: 2,
        role: 'CANDIDATE',
        content:
          'I would use an expandable sliding window with two pointers and a frequency hash map. We expand the right pointer to include characters and increment frequency. When the distinct keys in the map exceed k, we advance the left pointer and decrement frequency until distinct keys are back to k. This yields an optimal O(N) time complexity and O(K) auxiliary space, which is optimal because every character is visited at most twice.',
        pauseMs: 1100,
        fillerWordCount: 0,
      },
    ],
  },
  // 3. Strong: Behavioral STAR Leadership
  {
    id: 'CASE_03_STRONG_BEHAVIORAL',
    name: 'Fictional SDE-1 Strong: STAR Conflict Resolution',
    tier: 'STRONG',
    expectedMin: 78,
    expectedMax: 94,
    transcript: [
      {
        lineIndex: 1,
        role: 'INTERVIEWER',
        content: 'Tell me about a time you had a technical disagreement with a teammate.',
      },
      {
        lineIndex: 2,
        role: 'CANDIDATE',
        content:
          'During our capstone project, a teammate wanted to use MongoDB for our financial ledger, whereas I advocated for PostgreSQL. To resolve the deadlock objectively, I set up a benchmark test comparing transaction rollback guarantees under concurrent writes. When testing race conditions, MongoDB without multi-document transactions exhibited phantom writes. Showing these empirical results convinced the team to adopt PostgreSQL with ACID transactions, achieving zero reconciliation mismatches across 20,000 test transactions.',
        pauseMs: 1400,
        fillerWordCount: 0,
      },
    ],
  },
  // 4. Average: SQL vs NoSQL
  {
    id: 'CASE_04_AVG_DATABASE',
    name: 'Fictional SDE-1 Average: SQL vs NoSQL Trade-offs',
    tier: 'AVERAGE',
    expectedMin: 58,
    expectedMax: 76,
    transcript: [
      {
        lineIndex: 1,
        role: 'INTERVIEWER',
        content: 'When would you pick PostgreSQL over MongoDB for a new project?',
      },
      {
        lineIndex: 2,
        role: 'CANDIDATE',
        content:
          'PostgreSQL is great when you have structured data and need relationships between tables using foreign keys and joins. It provides ACID compliance which is necessary for payments. MongoDB is better for unstructured JSON documents where schema changes frequently. But PostgreSQL also has JSONB now, so the boundary is narrower. We used PostgreSQL because our data was relational.',
        pauseMs: 2300,
        fillerWordCount: 1,
      },
    ],
  },
  // 5. Average: React State Management
  {
    id: 'CASE_05_AVG_FRONTEND',
    name: 'Fictional SDE-1 Average: React Context vs Zustand',
    tier: 'AVERAGE',
    expectedMin: 58,
    expectedMax: 76,
    transcript: [
      {
        lineIndex: 1,
        role: 'INTERVIEWER',
        content: 'Why did you use Zustand instead of React Context in your web app?',
      },
      {
        lineIndex: 2,
        role: 'CANDIDATE',
        content:
          'React Context triggers re-renders on all consuming components whenever any value in the provider changes. With Zustand, we can select only specific slices of state so components only re-render when their specific field updates. It also has simpler boilerplate without needing provider wrappers everywhere.',
        pauseMs: 1900,
        fillerWordCount: 1,
      },
    ],
  },
  // 6. Average: Behavioral STAR Missing Quantified Results
  {
    id: 'CASE_06_AVG_BEHAVIORAL',
    name: 'Fictional SDE-1 Average: STAR Missing Quantitative Metrics',
    tier: 'AVERAGE',
    expectedMin: 55,
    expectedMax: 75,
    transcript: [
      {
        lineIndex: 1,
        role: 'INTERVIEWER',
        content: 'Describe a situation where you had to debug a difficult production issue.',
      },
      {
        lineIndex: 2,
        role: 'CANDIDATE',
        content:
          'In my college club portal, users reported that login was hanging randomly. I checked server logs and noticed database connection pool exhaustion. I realized we were opening connections inside an async loop without releasing them properly in the finally block. I refactored it to use connection pooling correctly, and after deploying the fix, nobody complained about hanging logins anymore.',
        pauseMs: 2200,
        fillerWordCount: 2,
      },
    ],
  },
  // 7. Average: OS Virtual Memory
  {
    id: 'CASE_07_AVG_OS',
    name: 'Fictional SDE-1 Average: Virtual Memory & Paging',
    tier: 'AVERAGE',
    expectedMin: 58,
    expectedMax: 76,
    transcript: [
      {
        lineIndex: 1,
        role: 'INTERVIEWER',
        content: 'Explain how virtual memory works and what happens during a page fault.',
      },
      {
        lineIndex: 2,
        role: 'CANDIDATE',
        content:
          'Virtual memory gives each process the illusion of having a contiguous block of memory. The MMU translates virtual addresses to physical frames using page tables. When a process accesses an address that is not currently mapped in RAM, the hardware triggers a page fault interrupt. The OS pauses the thread, fetches the page from disk into a free physical frame, updates the page table entry, and restarts the instruction.',
        pauseMs: 1800,
        fillerWordCount: 1,
      },
    ],
  },
  // 8. Weak: Excessive Fillers & Brief Answers
  {
    id: 'CASE_08_WEAK_FILLERS',
    name: 'Fictional SDE-1 Weak: Excessive Fillers & Hesitation',
    tier: 'WEAK',
    expectedMin: 30,
    expectedMax: 54,
    transcript: [
      {
        lineIndex: 1,
        role: 'INTERVIEWER',
        content: 'Can you explain the difference between a process and a thread?',
      },
      {
        lineIndex: 2,
        role: 'CANDIDATE',
        content:
          'Um, like, basically a process is an application and, like, a thread is inside the process, you know? They, like, share memory and, um, stuff like that.',
        pauseMs: 4800,
        fillerWordCount: 6,
      },
    ],
  },
  // 9. Weak: Hallucinated Tech & Zero Depth
  {
    id: 'CASE_09_WEAK_VAGUE',
    name: 'Fictional SDE-1 Weak: Vague & Missing Architecture',
    tier: 'WEAK',
    expectedMin: 28,
    expectedMax: 50,
    transcript: [
      {
        lineIndex: 1,
        role: 'INTERVIEWER',
        content: 'How did you handle database migrations when adding new features?',
      },
      {
        lineIndex: 2,
        role: 'CANDIDATE',
        content: 'I just dropped the database tables and recreated them whenever I changed my models.',
        pauseMs: 3600,
        fillerWordCount: 0,
      },
    ],
  },
  // 10. Weak: Incoherent Behavioural
  {
    id: 'CASE_10_WEAK_BEHAVIORAL',
    name: 'Fictional SDE-1 Weak: Negative Blaming & No STAR',
    tier: 'WEAK',
    expectedMin: 28,
    expectedMax: 50,
    transcript: [
      {
        lineIndex: 1,
        role: 'INTERVIEWER',
        content: 'Tell me about a time you missed a project deadline.',
      },
      {
        lineIndex: 2,
        role: 'CANDIDATE',
        content:
          'My teammates didn’t do their part of the frontend so we missed the submission deadline. It wasn’t my fault because my backend code was already finished.',
        pauseMs: 3900,
        fillerWordCount: 1,
      },
    ],
  },
]

export function runEvaluationBenchmark() {
  console.log('\n========================================================================')
  console.log('   MOCKMATE EVALUATION BENCHMARK: 10 FICTIONAL PLACEMENT TRANSCRIPTS')
  console.log('========================================================================\n')

  let correctLandingCount = 0
  const results: Array<{ id: string; name: string; tier: string; score: number; expected: string; pass: boolean }> = []

  for (const testCase of EVALUATION_CASES) {
    const report = evaluateTranscriptRubric(testCase.transcript, 'RESUME_DEEP_DIVE', 'PRODUCT_BASED')
    const score = report.overallScore
    const passed = score >= testCase.expectedMin && score <= testCase.expectedMax

    if (passed) correctLandingCount++

    results.push({
      id: testCase.id,
      name: testCase.name,
      tier: testCase.tier,
      score,
      expected: `${testCase.expectedMin} - ${testCase.expectedMax}`,
      pass: passed,
    })
  }

  // Print results table
  console.log('| ID | Benchmark Name | Tier | Actual Score | Expected Range | Status |')
  console.log('| :--- | :--- | :---: | :---: | :---: | :---: |')
  for (const r of results) {
    const statusEmoji = r.pass ? '✅ PASS' : '❌ FAIL'
    console.log(`| ${r.id} | ${r.name} | ${r.tier} | **${r.score}** | ${r.expected} | ${statusEmoji} |`)
  }

  const accuracy = (correctLandingCount / EVALUATION_CASES.length) * 100
  console.log('\n========================================================================')
  console.log(`BENCHMARK ACCURACY: ${correctLandingCount} / ${EVALUATION_CASES.length} (${accuracy.toFixed(1)}% in expected score band)`)
  console.log('========================================================================\n')

  return {
    accuracy,
    results,
  }
}

// Execute if run directly
if (require.main === module || process.argv[1]?.includes('evaluation-benchmark')) {
  runEvaluationBenchmark()
}
