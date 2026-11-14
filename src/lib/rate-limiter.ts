interface RateLimitRecord {
  tokens: number
  lastRefill: number
}

export class TokenBucketRateLimiter {
  private capacity: number
  private refillRatePerSec: number
  private store: Map<string, RateLimitRecord>

  constructor(capacity = 30, refillRatePerSec = 0.5) {
    this.capacity = capacity
    this.refillRatePerSec = refillRatePerSec
    this.store = new Map()
  }

  public check(key: string): { success: boolean; remaining: number; resetAfterMs: number } {
    const now = Date.now()
    let record = this.store.get(key)

    if (!record) {
      record = { tokens: this.capacity, lastRefill: now }
      this.store.set(key, record)
    } else {
      // Refill tokens based on elapsed time
      const elapsedSec = (now - record.lastRefill) / 1000
      const refilledTokens = elapsedSec * this.refillRatePerSec
      record.tokens = Math.min(this.capacity, record.tokens + refilledTokens)
      record.lastRefill = now
    }

    if (record.tokens >= 1) {
      record.tokens -= 1
      return {
        success: true,
        remaining: Math.floor(record.tokens),
        resetAfterMs: 0,
      }
    }

    const tokensNeeded = 1 - record.tokens
    const waitSec = tokensNeeded / this.refillRatePerSec
    return {
      success: false,
      remaining: 0,
      resetAfterMs: Math.ceil(waitSec * 1000),
    }
  }

  public reset(key?: string) {
    if (key) {
      this.store.delete(key)
    } else {
      this.store.clear()
    }
  }
}

// Global singleton instance for interview & Gemini operations
export const globalGeminiLimiter = new TokenBucketRateLimiter(20, 0.33) // ~20 burst, 1 token every 3s
