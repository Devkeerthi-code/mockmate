'use client'

import { useEffect, useRef } from 'react'
import { Bot, User as UserIcon, AlertTriangle, Sparkles, Volume2 } from 'lucide-react'

export interface MessageItem {
  id?: string
  role: 'INTERVIEWER' | 'CANDIDATE' | 'SYSTEM'
  content: string
  orderIndex: number
  durationMs?: number | null
  pauseMs?: number | null
  fillerWords?: string[] | null
  fillerWordCount?: number | null
  isCodeSnippet?: boolean
}

export interface TranscriptViewProps {
  messages: MessageItem[]
  highlightedLine?: number | null
}

export function TranscriptView({ messages, highlightedLine }: TranscriptViewProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom as new messages arrive
  useEffect(() => {
    if (scrollRef.current && !highlightedLine) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages.length, highlightedLine])

  return (
    <div
      ref={scrollRef}
      className="flex h-full flex-col gap-3 overflow-y-auto p-4 font-body text-xs scroll-smooth bg-grain"
    >
      {messages.length === 0 ? (
        <div className="flex h-full flex-col items-center justify-center text-center text-obsidian-400 p-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-obsidian-850 border border-obsidian-750 text-obsidian-500 mb-3">
            <Bot className="h-6 w-6" />
          </div>
          <p className="font-display font-bold text-obsidian-200 text-sm">Session Ready</p>
          <p className="text-xs text-obsidian-400 mt-1 max-w-xs">
            The AI interviewer will ask the first question out loud. Speak clearly into your mic.
          </p>
          <span className="hand-annotation text-amber-300 text-sm mt-3">
            Don&apos;t rush. Think before speaking ✍️
          </span>
        </div>
      ) : (
        messages.map((msg, index) => {
          const lineNumber = index + 1
          const isInterviewer = msg.role === 'INTERVIEWER'
          const isHighlighted = highlightedLine === lineNumber

          return (
            <div
              key={msg.id || index}
              id={`transcript-line-${lineNumber}`}
              className={`group flex items-start gap-3 rounded-2xl p-3.5 transition-all duration-300 ${
                isHighlighted
                  ? 'border-2 border-brand-400 bg-brand-500/15 shadow-[0_0_24px_rgba(245,158,11,0.25)] ring-2 ring-brand-400/40 translate-x-1'
                  : 'border border-obsidian-800/80 bg-obsidian-900/60 hover:border-obsidian-700 hover:bg-obsidian-850/80'
              }`}
            >
              {/* Line Index Badge */}
              <div className="flex flex-col items-center shrink-0">
                <span
                  className={`select-none font-mono text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    isHighlighted
                      ? 'bg-brand-500 text-obsidian-950 shadow-sm'
                      : 'text-obsidian-500 bg-obsidian-800/60 group-hover:text-obsidian-300'
                  }`}
                >
                  L{lineNumber}
                </span>
              </div>

              {/* Avatar Icon */}
              <div
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-xl border shadow-sm ${
                  isInterviewer
                    ? 'bg-sky-500/15 text-sky-400 border-sky-500/30'
                    : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                }`}
              >
                {isInterviewer ? <Bot className="h-4 w-4" /> : <UserIcon className="h-4 w-4" />}
              </div>

              {/* Message Content */}
              <div className="flex-1 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[11px] font-bold tracking-wide font-display ${
                        isInterviewer ? 'text-sky-300' : 'text-emerald-300'
                      }`}
                    >
                      {isInterviewer ? 'AI Interviewer' : 'You (Candidate)'}
                    </span>

                    {isInterviewer && (
                      <span className="flex items-center gap-1 text-[9px] font-mono text-sky-400/70">
                        <Volume2 className="h-2.5 w-2.5" />
                        <span>Speech Audio</span>
                      </span>
                    )}
                  </div>

                  {/* Speech telemetry indicators */}
                  {!isInterviewer && (
                    <div className="flex items-center gap-2 font-mono text-[10px] text-obsidian-400">
                      {msg.durationMs && (
                        <span>{(msg.durationMs / 1000).toFixed(1)}s verbal</span>
                      )}
                      {msg.fillerWordCount && msg.fillerWordCount > 0 && (
                        <span className="flex items-center gap-1 rounded border border-rose-500/30 bg-rose-500/15 px-1.5 py-0.5 text-rose-300 font-bold">
                          <AlertTriangle className="h-2.5 w-2.5" />
                          {msg.fillerWordCount} filler{msg.fillerWordCount > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <p className="whitespace-pre-wrap text-obsidian-100 text-xs leading-relaxed font-body">
                  {msg.content}
                </p>
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}
