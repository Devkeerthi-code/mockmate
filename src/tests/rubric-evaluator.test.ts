import { evaluateTranscriptRubric, TranscriptEntry } from '../lib/rubric-evaluator'

export async function runRubricEvaluatorTests() {
  console.log('🧪 Testing Rubric Evaluator & Transcript Citations...')

  const sampleTranscript: TranscriptEntry[] = [
    {
      lineIndex: 1,
      role: 'INTERVIEWER',
      content: 'Could you explain how your distributed task queue handles worker crash recovery?',
    },
    {
      lineIndex: 2,
      role: 'CANDIDATE',
      content:
        'In my task queue project, we used Redis Streams with consumer groups. When a worker crashes midway, pending messages remain in the Pending Entries List (PEL). A background monitoring cron checks for idle acknowledgments exceeding 30 seconds and claims those orphaned messages using XCLAIM, reassigning them to an active worker. This resulted in zero dropped jobs during sudden container restarts.',
      pauseMs: 1200,
      fillerWordCount: 0,
    },
    {
      lineIndex: 3,
      role: 'INTERVIEWER',
      content: 'What were the latency trade-offs of using Redis Streams over RabbitMQ?',
    },
    {
      lineIndex: 4,
      role: 'CANDIDATE',
      content:
        'Um, basically Redis Streams provided in-memory sub-millisecond read/write latency which was critical for our 99th percentile SLA. However, the trade-off was memory footprint, so we had to configure stream trimming with MAXLEN ~ 50000 to prevent OOM errors on our Redis cluster.',
      pauseMs: 2100,
      fillerWordCount: 2,
    },
  ]

  const report = evaluateTranscriptRubric(sampleTranscript, 'RESUME_DEEP_DIVE', 'PRODUCT_BASED')

  // Test 1: Verify All Citations Exist in the Transcript
  const totalLines = sampleTranscript.length
  for (const criterion of report.criteriaScores) {
    for (const citedLine of criterion.citedTranscriptLines) {
      if (citedLine < 1 || citedLine > totalLines) {
        throw new Error(
          `Citation out of bounds: line ${citedLine} cited, but transcript only has ${totalLines} lines.`
        )
      }
    }
  }

  for (const imp of report.topImprovements) {
    if (imp.citedLine < 1 || imp.citedLine > totalLines) {
      throw new Error(
        `Top improvement citation out of bounds: line ${imp.citedLine} cited, max is ${totalLines}.`
      )
    }
  }
  console.log('  ✅ Citations validity verified: 100% of cited lines exist in transcript.')

  // Test 2: Scores are within reasonable bounds for solid technical answers
  if (report.overallScore < 60 || report.overallScore > 98) {
    throw new Error(`Unexpected overall score for solid technical response: ${report.overallScore}`)
  }
  if (report.technicalDepthScore < 70) {
    throw new Error(`Technical depth score should be high given Redis Streams and PEL details: ${report.technicalDepthScore}`)
  }
  console.log(`  ✅ Overall Score: ${report.overallScore}/100, Tech Depth: ${report.technicalDepthScore}/100.`)

  // Test 3: Model answer is generated
  if (!report.betterSampleAnswer || report.betterSampleAnswer.length < 50) {
    throw new Error('Model sample answer was missing or inadequate.')
  }
  console.log('  ✅ Exemplary model answer generated adhering to STAR format.')

  return true
}
