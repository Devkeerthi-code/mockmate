'use client'

import { useState } from 'react'
import { Play, RotateCcw, HelpCircle, Terminal, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { executeCodeInBrowser } from '@/lib/client-sandbox'

export interface CodeEditorProps {
  initialCode?: string
  problemStatement?: string
  language?: 'javascript' | 'python'
  hints?: string[]
  onCodeExecuted?: (code: string, output: string, passed: boolean) => void
}

export function CodeEditor({
  initialCode = '// Write your solution here\nfunction solve(input) {\n  return input;\n}\n\nconsole.log(solve("Hello World"));',
  problemStatement = 'Implement an optimal solution and verify with test inputs.',
  language = 'javascript',
  hints = [
    'Consider using a hash map to achieve O(N) time complexity.',
    'Watch out for edge cases like empty arrays or negative integers.',
  ],
  onCodeExecuted,
}: CodeEditorProps) {
  const [code, setCode] = useState(initialCode)
  const [selectedLang, setSelectedLang] = useState<'javascript' | 'python'>(language)
  const [isRunning, setIsRunning] = useState(false)
  const [consoleOutput, setConsoleOutput] = useState<string>('')
  const [executionTime, setExecutionTime] = useState<number | null>(null)
  const [hasError, setHasError] = useState(false)
  const [revealedHintIndex, setRevealedHintIndex] = useState(-1)

  const handleRunCode = async () => {
    setIsRunning(true)
    setHasError(false)
    setConsoleOutput('Running in browser Web Worker sandbox...')

    const result = await executeCodeInBrowser(code, selectedLang, 5000)

    setIsRunning(false)
    setExecutionTime(result.executionTimeMs)

    if (result.success) {
      setConsoleOutput(result.output)
      setHasError(false)
      onCodeExecuted?.(code, result.output, true)
    } else {
      setConsoleOutput(result.error || result.output || 'Unknown execution error')
      setHasError(true)
      onCodeExecuted?.(code, result.error || 'Execution failed', false)
    }
  }

  const handleReset = () => {
    setCode(initialCode)
    setConsoleOutput('')
    setExecutionTime(null)
    setHasError(false)
  }

  return (
    <div className="flex h-full flex-col rounded-xl border border-obsidian-700 bg-obsidian-900 overflow-hidden shadow-2xl">
      {/* Top Bar */}
      <div className="flex items-center justify-between border-b border-obsidian-700 bg-obsidian-850 px-4 py-2.5">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-rose-500/80"></span>
            <span className="h-3 w-3 rounded-full bg-amber-500/80"></span>
            <span className="h-3 w-3 rounded-full bg-emerald-500/80"></span>
          </div>
          <span className="text-xs font-semibold text-obsidian-200">Interactive Code Sandbox</span>
          <span className="rounded border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-mono font-medium text-emerald-400">
            CLIENT-ONLY SANDBOX
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Language Selector */}
          <select
            value={selectedLang}
            onChange={(e) => setSelectedLang(e.target.value as any)}
            className="rounded-lg border border-obsidian-700 bg-obsidian-800 px-2.5 py-1 text-xs font-mono text-obsidian-200 focus:border-brand-500 focus:outline-none"
          >
            <option value="javascript">JavaScript (V8 Worker)</option>
            <option value="python">Python 3 (Pyodide)</option>
          </select>

          {/* Reset Code */}
          <button
            onClick={handleReset}
            title="Reset code"
            className="flex items-center gap-1 rounded-lg border border-obsidian-700 bg-obsidian-800 px-2.5 py-1 text-xs text-obsidian-300 hover:text-obsidian-50"
          >
            <RotateCcw className="h-3 w-3" />
          </button>

          {/* Run Code Button */}
          <button
            onClick={handleRunCode}
            disabled={isRunning}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-1 text-xs font-semibold text-obsidian-950 transition-all hover:bg-emerald-400 shadow-glow-emerald disabled:opacity-50"
          >
            {isRunning ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin" />
                <span>Running...</span>
              </>
            ) : (
              <>
                <Play className="h-3 w-3 fill-current" />
                <span>Run Code</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Problem Statement Card */}
      {problemStatement && (
        <div className="border-b border-obsidian-700 bg-obsidian-800/60 p-3 text-xs text-obsidian-200">
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-semibold text-obsidian-50">Problem Statement</span>
            {hints && hints.length > 0 && (
              <button
                onClick={() => setRevealedHintIndex((prev) => Math.min(prev + 1, hints.length - 1))}
                disabled={revealedHintIndex >= hints.length - 1}
                className="flex items-center gap-1 text-[11px] text-brand-400 hover:text-brand-300 disabled:opacity-40"
              >
                <HelpCircle className="h-3 w-3" />
                <span>{revealedHintIndex === -1 ? 'Ask for Hint' : `Hint (${revealedHintIndex + 1}/${hints.length})`}</span>
              </button>
            )}
          </div>
          <p className="whitespace-pre-line text-obsidian-300 font-mono text-[11px] leading-relaxed">
            {problemStatement}
          </p>

          {/* Revealed Hint Card */}
          {revealedHintIndex >= 0 && (
            <div className="mt-2 rounded-lg border border-brand-500/30 bg-brand-500/10 p-2 text-[11px] text-brand-300">
              <span className="font-semibold">💡 Hint {revealedHintIndex + 1}: </span>
              {hints[revealedHintIndex]}
            </div>
          )}
        </div>
      )}

      {/* Editor Textarea */}
      <div className="relative flex-1 bg-obsidian-950 font-mono text-xs">
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          spellCheck={false}
          className="h-full w-full resize-none bg-transparent p-4 font-mono text-xs text-obsidian-50 focus:outline-none leading-relaxed selection:bg-brand-500/30"
          placeholder="// Type your solution..."
        />
      </div>

      {/* Terminal Output */}
      <div className="border-t border-obsidian-700 bg-obsidian-950">
        <div className="flex items-center justify-between border-b border-obsidian-800 px-3 py-1.5 text-[11px] font-mono text-obsidian-400">
          <div className="flex items-center gap-1.5">
            <Terminal className="h-3 w-3" />
            <span>Execution Terminal</span>
          </div>
          {executionTime !== null && (
            <div className="flex items-center gap-1.5">
              {hasError ? (
                <span className="flex items-center gap-1 text-rose-400">
                  <AlertCircle className="h-3 w-3" /> Failed
                </span>
              ) : (
                <span className="flex items-center gap-1 text-emerald-400">
                  <CheckCircle2 className="h-3 w-3" /> Success
                </span>
              )}
              <span>({executionTime}ms)</span>
            </div>
          )}
        </div>
        <div className="h-28 overflow-y-auto p-3 font-mono text-[11px] leading-relaxed">
          {consoleOutput ? (
            <pre className={hasError ? 'text-rose-400 whitespace-pre-wrap' : 'text-emerald-300 whitespace-pre-wrap'}>
              {consoleOutput}
            </pre>
          ) : (
            <span className="text-obsidian-500">Output will appear here after clicking "Run Code"...</span>
          )}
        </div>
      </div>
    </div>
  )
}
