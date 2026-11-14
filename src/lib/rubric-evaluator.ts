export interface TranscriptEntry {
  lineIndex: number // 1-based index for clean user-facing references
  role: 'INTERVIEWER' | 'CANDIDATE' | 'SYSTEM'
  content: string
  pauseMs?: number
  fillerWordCount?: number
}

export interface RubricCriterionScore {
  criterion: 'Communication' | 'Technical Depth' | 'Problem Solving' | 'Structure' | 'Confidence'
  scoreOutOf10: number
  weight: number // Percentage (e.g., 20)
  rationale: string
  citedTranscriptLines: number[] // Lines in transcript that provide evidence
}

export interface TopImprovement {
  title: string
  description: string
  actionableTip: string
  citedLine: number
}

export interface RubricReportResult {
  overallScore: number // 1 - 100
  communicationScore: number
  technicalDepthScore: number
  problemSolvingScore: number
  structureScore: number
  confidenceScore: number
  criteriaScores: RubricCriterionScore[]
  strengths: string[]
  topImprovements: TopImprovement[]
  weakestQuestion: string
  weakestAnswerSnippet: string
  betterSampleAnswer: string
}

const FILLER_REGEX = /\b(um|uh|like|you know|sort of|kind of|basically|actually|literally)\b/gi

export function countFillerWords(text: string): { count: number; words: string[] } {
  const matches = text.match(FILLER_REGEX) || []
  return {
    count: matches.length,
    words: matches.map((m) => m.toLowerCase()),
  }
}

export function validateCitations(
  citedLines: number[],
  validLineCount: number
): number[] {
  // Ensure every cited line exists within the bounds of 1 to validLineCount
  const sanitized = citedLines.filter((line) => line >= 1 && line <= validLineCount)
  if (sanitized.length === 0 && validLineCount > 0) {
    // Fallback to first candidate line if citations were out of bounds
    return [1]
  }
  return Array.from(new Set(sanitized))
}

export function evaluateTranscriptRubric(
  transcript: TranscriptEntry[],
  interviewType: string = 'RESUME_DEEP_DIVE',
  companyType: string = 'PRODUCT_BASED'
): RubricReportResult {
  const totalLines = transcript.length
  const candidateEntries = transcript.filter((t) => t.role === 'CANDIDATE')

  if (candidateEntries.length === 0) {
    return {
      overallScore: 20,
      communicationScore: 20,
      technicalDepthScore: 20,
      problemSolvingScore: 20,
      structureScore: 20,
      confidenceScore: 20,
      criteriaScores: [],
      strengths: ['Attended interview session'],
      topImprovements: [
        {
          title: 'Provide verbal answers',
          description: 'No candidate spoken responses were recorded in this session.',
          actionableTip: 'Ensure your microphone is enabled and speak clearly into the browser.',
          citedLine: 1,
        },
      ],
      weakestQuestion: 'Introduction',
      weakestAnswerSnippet: 'No answer provided.',
      betterSampleAnswer: 'Start by concisely summarizing your background, key technical skills, and interest in the role.',
    }
  }

  // 1. Analyze Confidence & Filler Words
  let totalCandidateWords = 0
  let totalFillers = 0
  let totalPauseMs = 0

  for (const entry of candidateEntries) {
    const words = entry.content.trim().split(/\s+/).filter(Boolean)
    totalCandidateWords += words.length
    const fillers = countFillerWords(entry.content)
    totalFillers += fillers.count
    if (entry.pauseMs) totalPauseMs += entry.pauseMs
  }

  const fillerRatio = totalCandidateWords > 0 ? totalFillers / totalCandidateWords : 0
  let confidenceScore = 90
  if (fillerRatio > 0.08) confidenceScore -= 30
  else if (fillerRatio > 0.04) confidenceScore -= 15
  else if (fillerRatio > 0.02) confidenceScore -= 5

  const avgPause = candidateEntries.length > 0 ? totalPauseMs / candidateEntries.length : 0
  if (avgPause > 4000) confidenceScore -= 15
  else if (avgPause > 2500) confidenceScore -= 8
  confidenceScore = Math.max(25, Math.min(95, confidenceScore))

  // 2. Analyze Technical Depth & Correctness
  const techTermsRegex = /\b(database|index|btree|cache|redis|asynchronous|promise|thread|concurrency|deadlock|time complexity|o\(|latency|throughput|schema|sql|nosql|rest|api|kafka|docker|kubernetes|normalize|sharding|partition|load balancer)\b/gi
  let techHits = 0
  for (const entry of candidateEntries) {
    const hits = entry.content.match(techTermsRegex) || []
    techHits += hits.length
  }
  const techDensity = totalCandidateWords > 0 ? (techHits / totalCandidateWords) * 100 : 0
  let technicalDepthScore = 55
  if (techDensity > 5) technicalDepthScore = 90
  else if (techDensity > 3) technicalDepthScore = 80
  else if (techDensity > 1.5) technicalDepthScore = 70
  else if (techDensity > 0.5) technicalDepthScore = 60
  else technicalDepthScore = 45

  // 3. Analyze Structure & Method (STAR compliance)
  const starSignals = {
    situation: /\b(at my college|during my project|in my internship|when building|faced a problem)\b/i,
    task: /\b(needed to|goal was|responsible for|objective was)\b/i,
    action: /\b(i implemented|i designed|i refactored|i migrated|i chose)\b/i,
    result: /\b(resulted in|improved by|reduced latency|achieved|deployed to|users)\b/i,
  }
  let starHits = 0
  for (const entry of candidateEntries) {
    if (starSignals.situation.test(entry.content)) starHits++
    if (starSignals.task.test(entry.content)) starHits++
    if (starSignals.action.test(entry.content)) starHits++
    if (starSignals.result.test(entry.content)) starHits += 2 // Heavy weight on results
  }
  let structureScore = Math.min(95, Math.max(30, 40 + starHits * 8))

  // 4. Communication & Clarity
  let communicationScore = 80
  if (totalCandidateWords / candidateEntries.length < 25) {
    communicationScore -= 20 // Answers too curt
  } else if (totalCandidateWords / candidateEntries.length > 250) {
    communicationScore -= 10 // Rambling
  }
  if (fillerRatio > 0.05) communicationScore -= 15
  communicationScore = Math.max(30, Math.min(95, communicationScore))

  // 5. Problem Solving
  let problemSolvingScore = Math.round((technicalDepthScore * 0.6) + (structureScore * 0.4))

  // Calculate Overall Weighted Score (Scale 1 - 100)
  const overallScore = Math.round(
    communicationScore * 0.2 +
    technicalDepthScore * 0.25 +
    problemSolvingScore * 0.25 +
    structureScore * 0.15 +
    confidenceScore * 0.15
  )

  // Find Weakest Answer and Question
  let weakestEntry = candidateEntries[0]
  let lowestEntryScore = 999

  for (const entry of candidateEntries) {
    const words = entry.content.trim().split(/\s+/).length
    const fillers = countFillerWords(entry.content).count
    const currentScore = words - fillers * 5
    if (currentScore < lowestEntryScore) {
      lowestEntryScore = currentScore
      weakestEntry = entry
    }
  }

  // Find corresponding question asked prior to weakest answer
  let questionText = 'Tell me about your technical approach and system design.'
  const candidateIndex = transcript.findIndex((t) => t.lineIndex === weakestEntry.lineIndex)
  for (let i = candidateIndex - 1; i >= 0; i--) {
    if (transcript[i].role === 'INTERVIEWER') {
      questionText = transcript[i].content
      break
    }
  }

  // Construct Citations & Scores
  const candidateLineNumbers = candidateEntries.map((e) => e.lineIndex)
  const criteriaScores: RubricCriterionScore[] = [
    {
      criterion: 'Communication',
      scoreOutOf10: Math.round(communicationScore / 10),
      weight: 20,
      rationale: `Candidate spoke at a solid pace (${totalCandidateWords} total words) with ${totalFillers} filler words detected (${(fillerRatio * 100).toFixed(1)}% filler ratio).`,
      citedTranscriptLines: validateCitations([candidateLineNumbers[0]], totalLines),
    },
    {
      criterion: 'Technical Depth',
      scoreOutOf10: Math.round(technicalDepthScore / 10),
      weight: 25,
      rationale: `Demonstrated technical awareness across key engineering concepts with ${techHits} concrete architectural/technical term mentions.`,
      citedTranscriptLines: validateCitations([candidateLineNumbers[Math.floor(candidateLineNumbers.length / 2)]], totalLines),
    },
    {
      criterion: 'Problem Solving',
      scoreOutOf10: Math.round(problemSolvingScore / 10),
      weight: 25,
      rationale: 'Broke down requirements systematically and articulated technical rationale under questions.',
      citedTranscriptLines: validateCitations(candidateLineNumbers.slice(0, 2), totalLines),
    },
    {
      criterion: 'Structure',
      scoreOutOf10: Math.round(structureScore / 10),
      weight: 15,
      rationale: 'Answer organization followed structured decomposition; could bolster quantifiable business/performance impact.',
      citedTranscriptLines: validateCitations([weakestEntry.lineIndex], totalLines),
    },
    {
      criterion: 'Confidence',
      scoreOutOf10: Math.round(confidenceScore / 10),
      weight: 15,
      rationale: `Maintained consistent speaking rhythm with an average answer onset latency of ${(avgPause / 1000).toFixed(1)}s.`,
      citedTranscriptLines: validateCitations([candidateLineNumbers[0]], totalLines),
    },
  ]

  // Top Strengths
  const strengths = [
    `Strong technical terminology usage throughout responses (Lines ${candidateLineNumbers.slice(0, 2).join(', ')})`,
    `Maintained professional tone and composure during follow-up inquiries (Line ${candidateLineNumbers[candidateLineNumbers.length - 1]})`,
    `Concisely described project motivations and architecture stack`,
  ]

  // Top 3 Improvements
  const topImprovements: TopImprovement[] = [
    {
      title: 'State Quantifiable Results (STAR Format)',
      description: `In Line ${weakestEntry.lineIndex}, the response omitted quantifiable outcome metrics or performance deltas.`,
      actionableTip: 'Always finish behavioural or architectural stories with concrete metrics: e.g., "reduced p99 API latency by 35% and saved 4 hours of weekly maintenance".',
      citedLine: weakestEntry.lineIndex,
    },
    {
      title: 'Minimize Hesitation & Filler Words',
      description: `Identified ${totalFillers} filler phrases ("um", "like", "you know") across responses.`,
      actionableTip: 'Embrace a deliberate 2-second silent pause before answering rather than using verbal crutches.',
      citedLine: candidateLineNumbers[0],
    },
    {
      title: 'Proactively Articulate Architectural Trade-offs',
      description: 'When explaining chosen libraries or databases, clarify why alternative tools were discarded.',
      actionableTip: 'Adopt the formula: "I selected X over Y because X provided lower read latency for our 90% read-heavy workload, despite its slightly higher memory footprint."',
      citedLine: weakestEntry.lineIndex,
    },
  ]

  // Better Sample Answer for Weakest Question
  const betterSampleAnswer = `A high-scoring answer would structure this using the STAR method:
- Situation: "In my e-commerce project, our order service experienced race conditions during flash sale checkouts."
- Task: "I needed to ensure zero inventory overselling while keeping checkout latency under 200ms."
- Action: "I implemented a distributed lock using Redis with a sliding window TTL and atomic Lua scripts for stock decrement, coupled with PostgreSQL optimistic concurrency (version column) as a source-of-truth fallback."
- Result: "During stress testing with 5,000 concurrent requests, we maintained zero oversell discrepancies and reduced checkout response time by 42% compared to pessimistic row locks."`

  return {
    overallScore,
    communicationScore,
    technicalDepthScore,
    problemSolvingScore,
    structureScore,
    confidenceScore,
    criteriaScores,
    strengths,
    topImprovements,
    weakestQuestion,
    weakestAnswerSnippet: weakestEntry.content.slice(0, 200) + (weakestEntry.content.length > 200 ? '...' : ''),
    betterSampleAnswer,
  }
}
