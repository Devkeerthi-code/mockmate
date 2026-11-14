// Client-side execution coordinator for JavaScript & Python Web Workers
// Zero Server Execution Guaranteed

export interface ExecutionResult {
  success: boolean
  output: string
  executionTimeMs: number
  error?: string
  timedOut?: boolean
}

export async function executeCodeInBrowser(
  code: string,
  language: 'javascript' | 'python',
  timeoutMs: number = 5000
): Promise<ExecutionResult> {
  if (language === 'javascript') {
    return executeJavaScriptWithWatchdog(code, timeoutMs)
  } else {
    return executePythonWithWatchdog(code, Math.max(timeoutMs, 8000))
  }
}

function executeJavaScriptWithWatchdog(code: string, timeoutMs: number): Promise<ExecutionResult> {
  return new Promise((resolve) => {
    const startTime = performance.now()

    // Inline worker code blob to avoid cross-origin / bundler worker path hurdles
    const workerCode = `
      self.onmessage = function(e) {
        var code = e.data.code;
        var logs = [];
        var customConsole = {
          log: function() {
            var args = Array.prototype.slice.call(arguments);
            logs.push(args.map(function(a) { return typeof a === 'object' ? JSON.stringify(a) : String(a); }).join(' '));
          },
          error: function() {
            var args = Array.prototype.slice.call(arguments);
            logs.push('[ERROR] ' + args.join(' '));
          },
          warn: function() {
            var args = Array.prototype.slice.call(arguments);
            logs.push('[WARN] ' + args.join(' '));
          }
        };

        try {
          var runner = new Function('console', 'fetch', 'XMLHttpRequest', 'importScripts', 'localStorage', 'sessionStorage', 'indexedDB', code);
          var result = runner(customConsole, undefined, undefined, undefined, undefined, undefined, undefined);
          if (result !== undefined && logs.length === 0) {
            logs.push(typeof result === 'object' ? JSON.stringify(result) : String(result));
          }
          self.postMessage({ success: true, output: logs.join('\\n') });
        } catch(err) {
          self.postMessage({ success: false, output: logs.join('\\n'), error: err.message || String(err) });
        }
      };
    `

    const blob = new Blob([workerCode], { type: 'application/javascript' })
    const workerUrl = URL.createObjectURL(blob)
    const worker = new Worker(workerUrl)

    let isDone = false

    const timer = setTimeout(() => {
      if (!isDone) {
        isDone = true
        worker.terminate()
        URL.revokeObjectURL(workerUrl)
        const elapsed = Math.round(performance.now() - startTime)
        resolve({
          success: false,
          output: '',
          error: `Execution timed out after ${timeoutMs}ms (watchdog terminated possible infinite loop).`,
          executionTimeMs: elapsed,
          timedOut: true,
        })
      }
    }, timeoutMs)

    worker.onmessage = (event) => {
      if (!isDone) {
        isDone = true
        clearTimeout(timer)
        worker.terminate()
        URL.revokeObjectURL(workerUrl)
        const elapsed = Math.round(performance.now() - startTime)
        resolve({
          success: event.data.success,
          output: event.data.output || 'Code executed successfully with zero errors.',
          error: event.data.error,
          executionTimeMs: elapsed,
          timedOut: false,
        })
      }
    }

    worker.onerror = (err) => {
      if (!isDone) {
        isDone = true
        clearTimeout(timer)
        worker.terminate()
        URL.revokeObjectURL(workerUrl)
        const elapsed = Math.round(performance.now() - startTime)
        resolve({
          success: false,
          output: '',
          error: err.message || 'Worker runtime execution error',
          executionTimeMs: elapsed,
          timedOut: false,
        })
      }
    }

    worker.postMessage({ code })
  })
}

// In-browser Pyodide runtime loader
let pyodideInstance: any = null

async function executePythonWithWatchdog(code: string, timeoutMs: number): Promise<ExecutionResult> {
  return new Promise(async (resolve) => {
    const startTime = performance.now()

    try {
      if (typeof window === 'undefined') {
        return resolve({
          success: false,
          output: '',
          error: 'Python code can only be executed in a client browser context.',
          executionTimeMs: 0,
        })
      }

      // Check if pyodide script is already present, if not load it dynamically
      if (!pyodideInstance) {
        if (!(window as any).loadPyodide) {
          const script = document.createElement('script')
          script.src = 'https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js'
          script.async = true
          document.head.appendChild(script)

          await new Promise((res, rej) => {
            script.onload = res
            script.onerror = rej
          })
        }

        pyodideInstance = await (window as any).loadPyodide({
          indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.25.0/full/',
        })
      }

      // Run Python script with stdout redirection
      const stdoutCaptureCode = `
import sys
import io
sys.stdout = io.StringIO()
sys.stderr = io.StringIO()
`
      await pyodideInstance.runPythonAsync(stdoutCaptureCode)

      // Execute student code with timeout promise race
      const timeoutPromise = new Promise((_, rej) =>
        setTimeout(() => rej(new Error(`Execution timed out after ${timeoutMs}ms limit.`)), timeoutMs)
      )

      await Promise.race([pyodideInstance.runPythonAsync(code), timeoutPromise])

      const stdout = await pyodideInstance.runPythonAsync('sys.stdout.getvalue()')
      const stderr = await pyodideInstance.runPythonAsync('sys.stderr.getvalue()')

      const elapsed = Math.round(performance.now() - startTime)
      const combined = (stdout + (stderr ? '\n[STDERR] ' + stderr : '')).trim()

      resolve({
        success: true,
        output: combined || 'Python script executed successfully with no output.',
        executionTimeMs: elapsed,
      })
    } catch (err: any) {
      const elapsed = Math.round(performance.now() - startTime)
      const isTimeout = err.message && err.message.includes('timed out')
      resolve({
        success: false,
        output: '',
        error: err.message || String(err),
        executionTimeMs: elapsed,
        timedOut: isTimeout,
      })
    }
  })
}
