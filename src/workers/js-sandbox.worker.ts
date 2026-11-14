// In-browser Sandboxed JavaScript Execution Worker
// Strict Client-Side Only — Zero Server Execution

export interface JSWorkerInput {
  code: string
  timeoutMs?: number
}

export interface JSWorkerOutput {
  success: boolean
  output: string
  executionTimeMs: number
  error?: string
}

self.onmessage = (event: MessageEvent<JSWorkerInput>) => {
  const { code } = event.data
  const startTime = performance.now()
  const logs: string[] = []

  // Capture stdout / console
  const customConsole = {
    log: (...args: unknown[]) => {
      logs.push(args.map(formatArg).join(' '))
    },
    error: (...args: unknown[]) => {
      logs.push('[ERROR] ' + args.map(formatArg).join(' '))
    },
    warn: (...args: unknown[]) => {
      logs.push('[WARN] ' + args.map(formatArg).join(' '))
    },
    info: (...args: unknown[]) => {
      logs.push(args.map(formatArg).join(' '))
    },
  }

  function formatArg(arg: unknown): string {
    if (typeof arg === 'object' && arg !== null) {
      try {
        return JSON.stringify(arg, null, 2)
      } catch {
        return String(arg)
      }
    }
    return String(arg)
  }

  // Nullify sensitive or network-capable APIs
  const blacklisted = [
    'fetch',
    'XMLHttpRequest',
    'importScripts',
    'WebSocket',
    'EventSource',
    'indexedDB',
    'localStorage',
    'sessionStorage',
    'caches',
    'navigator',
    'location',
  ]

  try {
    // Create an isolated evaluation scope with strict wrapper
    const sandboxScope = {
      console: customConsole,
      Math,
      Date,
      JSON,
      Array,
      Object,
      String,
      Number,
      Boolean,
      RegExp,
      Map,
      Set,
      parseInt,
      parseFloat,
      isNaN,
      isFinite,
    }

    const scopeKeys = Object.keys(sandboxScope)
    const scopeValues = Object.values(sandboxScope)

    // Mask blacklisted properties with undefined
    const blacklistedKeys = blacklisted.join(', ')
    const wrappedCode = `
      "use strict";
      return (function(${scopeKeys.join(', ')}, ${blacklistedKeys}) {
        ${code}
      })(${scopeValues.map((_, i) => `arguments[0][${i}]`).join(', ')});
    `

    const fn = new Function(wrappedCode)
    const result = fn(scopeValues)

    if (result !== undefined && logs.length === 0) {
      logs.push(formatArg(result))
    }

    const executionTimeMs = performance.now() - startTime
    const response: JSWorkerOutput = {
      success: true,
      output: logs.join('\n') || 'Code executed successfully (no stdout).',
      executionTimeMs: Math.round(executionTimeMs * 10) / 10,
    }

    self.postMessage(response)
  } catch (err: unknown) {
    const executionTimeMs = performance.now() - startTime
    const errorMessage = err instanceof Error ? err.message : String(err)
    const response: JSWorkerOutput = {
      success: false,
      output: logs.join('\n'),
      error: errorMessage,
      executionTimeMs: Math.round(executionTimeMs * 10) / 10,
    }
    self.postMessage(response)
  }
}
