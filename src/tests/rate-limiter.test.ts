import { TokenBucketRateLimiter } from '../lib/rate-limiter'

export async function runRateLimiterTests() {
  console.log('🧪 Testing Rate Limiter (Token Bucket)...')

  // Create a small rate limiter: capacity 3, refill rate 1 token every second (1 token/sec)
  const limiter = new TokenBucketRateLimiter(3, 1)

  // 1. Consume 3 tokens immediately (burst)
  const r1 = limiter.check('client-1')
  const r2 = limiter.check('client-1')
  const r3 = limiter.check('client-1')

  if (!r1.success || !r2.success || !r3.success) {
    throw new Error('Initial burst within capacity should succeed.')
  }
  console.log('  ✅ Allowed initial burst of 3 requests.')

  // 2. 4th request without delay should be rejected
  const r4 = limiter.check('client-1')
  if (r4.success) {
    throw new Error('4th request should be rate-limited.')
  }
  if (r4.remaining !== 0) {
    throw new Error(`Expected remaining to be 0, got ${r4.remaining}`)
  }
  console.log('  ✅ 4th burst request rejected with rate limit header.')

  // 3. Different client key should have its own bucket
  const rOther = limiter.check('client-2')
  if (!rOther.success) {
    throw new Error('Independent key client-2 should not be blocked.')
  }
  console.log('  ✅ Key isolation verified: client-2 allowed independently.')

  // 4. Wait 1.1 seconds for 1 token refill
  await new Promise((res) => setTimeout(res, 1100))
  const rRefilled = limiter.check('client-1')
  if (!rRefilled.success) {
    throw new Error('Token refill failed after 1.1s delay.')
  }
  console.log('  ✅ Token bucket refilled successfully after delay.')

  return true
}
