export type InterviewType = 'HR_BEHAVIOURAL' | 'RESUME_DEEP_DIVE' | 'DSA_CODING' | 'CS_FUNDAMENTALS'
export type CompanyType = 'SERVICE_BASED' | 'PRODUCT_BASED' | 'STARTUP' | 'GENERAL'
export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD'

export interface StateMachineContext {
  interviewType: InterviewType
  companyType: CompanyType
  difficulty: Difficulty
  durationMinutes: number
  elapsedMinutes: number
  totalQuestionsAsked: number
  followUpsOnCurrentQuestion: number
  candidateProjects: Array<{ title: string; techStack: string[]; description: string }>
  candidateSkills: string[]
  isCodingRound: boolean
  hasRunCode: boolean
  codeExecutionPassed: boolean
}

export type NextAction =
  | { type: 'ASK_INITIAL_QUESTION'; topic: string }
  | { type: 'PROBE_FOLLOW_UP'; reason: string; focusArea: string }
  | { type: 'REQUEST_CODE_COMPLEXITY'; focusArea: 'time_complexity' | 'space_complexity' | 'edge_cases' }
  | { type: 'NEXT_QUESTION'; topic: string }
  | { type: 'PROMPT_CANDIDATE_QUESTIONS' }
  | { type: 'WRAP_UP_INTERVIEW' }

export function getQuestionTargetForDuration(durationMinutes: number): number {
  if (durationMinutes <= 15) return 4
  if (durationMinutes <= 30) return 7
  return 10
}

export function evaluateNextInterviewStep(
  context: StateMachineContext,
  lastCandidateAnswer: string
): NextAction {
  const targetQuestions = getQuestionTargetForDuration(context.durationMinutes)
  const remainingMinutes = context.durationMinutes - context.elapsedMinutes

  // 1. Check if time is nearly exhausted (< 3 minutes remaining)
  if (remainingMinutes <= 3 && context.totalQuestionsAsked >= 2) {
    return { type: 'PROMPT_CANDIDATE_QUESTIONS' }
  }

  // 2. If it's a coding round and code was just executed
  if (context.isCodingRound) {
    if (context.hasRunCode && context.followUpsOnCurrentQuestion === 0) {
      return {
        type: 'REQUEST_CODE_COMPLEXITY',
        focusArea: 'time_complexity',
      }
    }
    if (context.hasRunCode && context.followUpsOnCurrentQuestion === 1) {
      return {
        type: 'REQUEST_CODE_COMPLEXITY',
        focusArea: 'edge_cases',
      }
    }
  }

  // 3. Evaluate answer depth for follow-up triggers
  const wordCount = lastCandidateAnswer.trim().split(/\s+/).filter(Boolean).length
  const isVagueOrShort = wordCount < 35 && wordCount > 0
  const mentionsBuzzwords = /(?:kafka|redis|microservices|distributed|concurrency|docker|aws|graphql|btree|index|deadlock)/i.test(
    lastCandidateAnswer
  )
  const lacksResultOrTradeoff = !/(?:result|metric|latency|percent|reduced|tradeoff|because|however|drawback|alternative)/i.test(
    lastCandidateAnswer
  )

  // Trigger pointed follow-up if answer was brief or mentioned tech without detailing mechanism/trade-off
  if (
    context.followUpsOnCurrentQuestion < 1 &&
    context.totalQuestionsAsked < targetQuestions &&
    (isVagueOrShort || (mentionsBuzzwords && lacksResultOrTradeoff))
  ) {
    let focusArea = 'technical_mechanism'
    if (context.interviewType === 'HR_BEHAVIOURAL') {
      focusArea = 'star_result_metrics'
    } else if (context.interviewType === 'RESUME_DEEP_DIVE') {
      focusArea = 'architectural_tradeoffs'
    }

    return {
      type: 'PROBE_FOLLOW_UP',
      reason: isVagueOrShort ? 'answer_too_brief' : 'missing_depth_or_tradeoffs',
      focusArea,
    }
  }

  // 4. If target question count reached or time is short, wrap up
  if (context.totalQuestionsAsked >= targetQuestions || remainingMinutes <= 5) {
    return { type: 'PROMPT_CANDIDATE_QUESTIONS' }
  }

  // 5. Otherwise, advance to next question topic
  let nextTopic = 'Core Problem Solving'
  if (context.interviewType === 'RESUME_DEEP_DIVE' && context.candidateProjects.length > 0) {
    const projectIndex = (context.totalQuestionsAsked - 1) % context.candidateProjects.length
    nextTopic = `Project Deep Dive: ${context.candidateProjects[projectIndex].title}`
  } else if (context.interviewType === 'CS_FUNDAMENTALS') {
    const topics = ['Database Indexing & ACID', 'OS Concurrency & Virtual Memory', 'Networking TCP/IP & HTTP/3', 'OOP Design Patterns']
    nextTopic = topics[context.totalQuestionsAsked % topics.length]
  } else if (context.interviewType === 'HR_BEHAVIOURAL') {
    const hrTopics = ['Conflict Resolution with Teammate', 'Handling Tight Deadlines', 'Learning From Mistakes', 'Cross-functional Collaboration']
    nextTopic = hrTopics[context.totalQuestionsAsked % hrTopics.length]
  }

  return {
    type: 'NEXT_QUESTION',
    topic: nextTopic,
  }
}
