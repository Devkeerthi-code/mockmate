import { runResumeParserTests } from './resume-parser.test'
import { runStateMachineTests } from './state-machine.test'
import { runRubricEvaluatorTests } from './rubric-evaluator.test'
import { runSandboxTimeoutTests } from './sandbox-timeout.test'
import { runRateLimiterTests } from './rate-limiter.test'

async function runAllTests() {
  console.log('\n======================================================')
  console.log('   MOCKMATE TEST RUNNER — ALL CORE TEST SUITES')
  console.log('======================================================\n')

  let passed = 0
  let failed = 0

  const suites = [
    { name: 'Resume Parser', fn: runResumeParserTests },
    { name: 'Interview State Machine', fn: runStateMachineTests },
    { name: 'Rubric Evaluator & Citations', fn: runRubricEvaluatorTests },
    { name: 'Sandbox Watchdog Timeout', fn: runSandboxTimeoutTests },
    { name: 'Token Bucket Rate Limiter', fn: runRateLimiterTests },
  ]

  for (const suite of suites) {
    try {
      await suite.fn()
      passed++
      console.log(`✨ Suite "${suite.name}" PASSED.\n`)
    } catch (err: any) {
      failed++
      console.error(`❌ Suite "${suite.name}" FAILED:`, err.message, '\n')
    }
  }

  console.log('======================================================')
  console.log(`RESULTS: ${passed}/${suites.length} Suites Passed (${failed} Failed)`)
  console.log('======================================================\n')

  if (failed > 0) {
    process.exit(1)
  }
}

runAllTests()
