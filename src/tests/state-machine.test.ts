import { evaluateNextInterviewStep, getQuestionTargetForDuration } from '../lib/state-machine'

export async function runStateMachineTests() {
  console.log('🧪 Testing Interview State Machine...')

  // Test 1: Duration Targets
  if (getQuestionTargetForDuration(15) !== 4) throw new Error('15 min target should be 4')
  if (getQuestionTargetForDuration(30) !== 7) throw new Error('30 min target should be 7')
  if (getQuestionTargetForDuration(45) !== 10) throw new Error('45 min target should be 10')
  console.log('  ✅ Question duration targets verified.')

  // Test 2: Trigger Follow-up on Vague/Brief Answer
  const briefContext = {
    interviewType: 'RESUME_DEEP_DIVE' as const,
    companyType: 'PRODUCT_BASED' as const,
    difficulty: 'MEDIUM' as const,
    durationMinutes: 30,
    elapsedMinutes: 5,
    totalQuestionsAsked: 1,
    followUpsOnCurrentQuestion: 0,
    candidateProjects: [{ title: 'Task Queue', techStack: ['Redis'], description: 'Worker queue' }],
    candidateSkills: ['Redis', 'Node.js'],
    isCodingRound: false,
    hasRunCode: false,
    codeExecutionPassed: false,
  }

  const vagueAnswer = 'I used redis to store jobs and workers read them.'
  const followUpStep = evaluateNextInterviewStep(briefContext, vagueAnswer)
  if (followUpStep.type !== 'PROBE_FOLLOW_UP') {
    throw new Error(`Expected PROBE_FOLLOW_UP on brief answer, got: ${followUpStep.type}`)
  }
  console.log('  ✅ Triggered probe follow-up on vague candidate response.')

  // Test 3: Coding Round Flow (after code run, request complexity)
  const codingContext = {
    ...briefContext,
    interviewType: 'DSA_CODING' as const,
    isCodingRound: true,
    hasRunCode: true,
    codeExecutionPassed: true,
  }
  const codeStep = evaluateNextInterviewStep(codingContext, 'I finished running the code and test passed.')
  if (codeStep.type !== 'REQUEST_CODE_COMPLEXITY') {
    throw new Error(`Expected REQUEST_CODE_COMPLEXITY after code execution, got: ${codeStep.type}`)
  }
  console.log('  ✅ Coding round complexity review transition verified.')

  // Test 4: Time Expiry triggers wrap-up / candidate questions
  const nearExpiryContext = {
    ...briefContext,
    elapsedMinutes: 28, // 2 mins remaining of 30
    totalQuestionsAsked: 5,
  }
  const expiryStep = evaluateNextInterviewStep(nearExpiryContext, 'That was how I approached the architecture.')
  if (expiryStep.type !== 'PROMPT_CANDIDATE_QUESTIONS') {
    throw new Error(`Expected PROMPT_CANDIDATE_QUESTIONS under 3m remaining, got: ${expiryStep.type}`)
  }
  console.log('  ✅ Graceful wrap-up triggered when under 3 minutes remaining.')

  return true
}
