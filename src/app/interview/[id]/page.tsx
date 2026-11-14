'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { AudioWaveform } from '@/components/AudioWaveform'
import { VoiceControls } from '@/components/VoiceControls'
import { TranscriptView, MessageItem } from '@/components/TranscriptView'
import { CodeEditor } from '@/components/CodeEditor'
import { Clock, StopCircle, Award, Terminal, Code, Sparkles, AlertCircle, Loader2, Mic, Activity, ShieldCheck, Flame } from 'lucide-react'

export default function LiveInterviewStudio() {
  const params = useParams()
  const router = useRouter()
  const interviewId = params.id as string

  const [interview, setInterview] = useState<any>(null)
  const [messages, setMessages] = useState<MessageItem[]>([])
  const [audioState, setAudioState] = useState<'interviewer_speaking' | 'candidate_speaking' | 'processing' | 'idle'>('idle')
  const [isProcessing, setIsProcessing] = useState(false)
  const [remainingSeconds, setRemainingSeconds] = useState<number>(1800) // 30 mins default
  const [isEnding, setIsEnding] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'voice' | 'code'>('voice')

  // Load interview details
  useEffect(() => {
    fetch(`/api/interviews/${interviewId}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load interview')
        return res.json()
      })
      .then((data) => {
        setInterview(data.interview)
        setMessages(data.interview.messages || [])
        if (data.interview.status === 'COMPLETED') {
          router.push(`/interview/${interviewId}/feedback`)
        }
        // Calculate remaining seconds based on duration
        const plannedSec = data.interview.durationMinutes * 60
        setRemainingSeconds(plannedSec)
      })
      .catch((err) => setError(err.message))
  }, [interviewId, router])

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Send candidate answer / speech to server
  const handleSendMessage = async (text: string, durationMs?: number, pauseMs?: number) => {
    if (!text.trim() || isProcessing) return

    setIsProcessing(true)
    setAudioState('processing')

    // Optimistically add candidate message
    const tempCandidateMsg: MessageItem = {
      role: 'CANDIDATE',
      content: text,
      orderIndex: messages.length + 1,
      durationMs,
      pauseMs,
    }
    setMessages((prev) => [...prev, tempCandidateMsg])

    try {
      const res = await fetch(`/api/interviews/${interviewId}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: text,
          durationMs,
          pauseMs,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to process response')
      }

      // Append interviewer message from Gemini / state machine
      setMessages((prev) => [...prev, data.interviewerMessage])
      setIsProcessing(false)
    } catch (err: any) {
      setError(err.message || 'Error communicating with interviewer')
      setIsProcessing(false)
      setAudioState('idle')
    }
  }

  // Handle code execution in DSA round
  const handleCodeExecuted = async (code: string, output: string, passed: boolean) => {
    try {
      await fetch(`/api/interviews/${interviewId}/code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          output,
          language: interview?.codingLanguage,
        }),
      })

      // Send automated notification to interviewer so they can review the code
      handleSendMessage(
        `I executed my code in the sandbox. The terminal reported:\n\`\`\`\n${output}\n\`\`\`\nI would like to discuss the time and space complexity now.`,
        2000,
        1000
      )
    } catch (e) {
      console.warn('Failed to sync code:', e)
    }
  }

  // Complete interview and navigate to rubric report
  const handleCompleteInterview = async () => {
    if (isEnding) return
    setIsEnding(true)

    try {
      const res = await fetch(`/api/interviews/${interviewId}/complete`, {
        method: 'POST',
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to complete interview')
      }

      router.push(`/interview/${interviewId}/feedback`)
    } catch (err: any) {
      setError(err.message || 'Error generating evaluation dossier')
      setIsEnding(false)
    }
  }

  if (error) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center p-4 text-center bg-grain">
        <AlertCircle className="h-10 w-10 text-rose-400 mb-2" />
        <h2 className="font-display text-lg font-bold text-obsidian-50">{error}</h2>
        <button
          onClick={() => window.location.reload()}
          className="btn-tactile-primary mt-4 px-4 py-2 text-xs"
        >
          Retry Session
        </button>
      </div>
    )
  }

  if (!interview) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-grain">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-brand-400" />
          <p className="font-mono text-xs text-obsidian-400">Initializing Live Voice Studio...</p>
        </div>
      </div>
    )
  }

  // Format timer MM:SS
  const mins = Math.floor(remainingSeconds / 60)
  const secs = remainingSeconds % 60
  const formattedTimer = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`

  const isDsaRound = interview.type === 'DSA_CODING'
  const lastInterviewerMsg = messages.filter((m) => m.role === 'INTERVIEWER').slice(-1)[0]?.content

  // Total candidate filler words count
  const totalFillers = messages.reduce((acc, m) => acc + (m.fillerWordCount || 0), 0)

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col bg-obsidian-950 font-body">
      {/* Studio Header HUD */}
      <div className="flex flex-wrap items-center justify-between border-b border-obsidian-750 bg-obsidian-900 px-4 py-2.5 sm:px-6 shadow-sm">
        <div className="flex items-center gap-3">
          {/* Status Indicator */}
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
            </span>
            <span className="font-display text-sm font-extrabold tracking-tight text-obsidian-50">
              {interview.type.replace(/_/g, ' ')}
            </span>
          </div>

          <span className="sticker-badge sticker-tilt-subtle border-brand-400/50 bg-brand-500/10 text-brand-300 hidden sm:inline-flex text-[10px]">
            {interview.companyType.replace(/_/g, ' ')}
          </span>

          <span className="hidden md:inline font-mono text-[11px] text-obsidian-400">
            Target: {interview.targetRole}
          </span>
        </div>

        {/* Live Proctoring Cues & Timer */}
        <div className="flex items-center gap-3">
          {/* Proctoring Cues */}
          <div className="hidden sm:flex items-center gap-2 font-mono text-[11px]">
            <div className="flex items-center gap-1.5 rounded-lg border border-obsidian-750 bg-obsidian-850 px-2.5 py-1 text-obsidian-300">
              <Activity className="h-3.5 w-3.5 text-sky-400" />
              <span>Fillers: <strong className={totalFillers > 3 ? 'text-amber-400' : 'text-emerald-400'}>{totalFillers}</strong></span>
            </div>

            <div className="flex items-center gap-1.5 rounded-lg border border-obsidian-750 bg-obsidian-850 px-2.5 py-1 text-obsidian-300">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span>Voice Sandbox Active</span>
            </div>
          </div>

          {/* Countdown Clock */}
          <div className="flex items-center gap-1.5 rounded-xl border border-obsidian-750 bg-obsidian-850 px-3 py-1.5 font-mono text-xs font-bold text-obsidian-100 shadow-inner">
            <Clock className="h-3.5 w-3.5 text-brand-400" />
            <span className={remainingSeconds < 180 ? 'text-rose-400 animate-pulse' : 'text-brand-300'}>
              {formattedTimer}
            </span>
          </div>

          {/* End Interview Button */}
          <button
            onClick={handleCompleteInterview}
            disabled={isEnding}
            className="flex items-center gap-1.5 rounded-xl border border-rose-500/40 bg-rose-500/10 px-3.5 py-1.5 text-xs font-semibold text-rose-300 transition-all hover:bg-rose-500/20 active:translate-y-0.5 disabled:opacity-50"
          >
            {isEnding ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Grading Dossier...</span>
              </>
            ) : (
              <>
                <StopCircle className="h-3.5 w-3.5 text-rose-400" />
                <span>Finish Mock</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Mobile DSA Round View Switcher Tabs */}
      {isDsaRound && (
        <div className="flex border-b border-obsidian-800 bg-obsidian-900 lg:hidden">
          <button
            onClick={() => setActiveTab('voice')}
            className={`flex-1 py-2 text-xs font-bold font-mono transition-colors ${
              activeTab === 'voice'
                ? 'border-b-2 border-brand-400 text-brand-300 bg-obsidian-850'
                : 'text-obsidian-400 hover:text-obsidian-200'
            }`}
          >
            Voice Studio & Transcript
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`flex-1 py-2 text-xs font-bold font-mono transition-colors ${
              activeTab === 'code'
                ? 'border-b-2 border-sky-400 text-sky-300 bg-obsidian-850'
                : 'text-obsidian-400 hover:text-obsidian-200'
            }`}
          >
            Sandboxed Code Editor
          </button>
        </div>
      )}

      {/* Main Studio Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Column: Voice Presence & Live Line-Numbered Transcript */}
        <div
          className={`flex flex-col border-r border-obsidian-750 bg-obsidian-900 ${
            isDsaRound
              ? activeTab === 'voice'
                ? 'w-full lg:w-1/2 flex'
                : 'hidden lg:flex lg:w-1/2'
              : 'w-full max-w-4xl mx-auto'
          }`}
        >
          {/* Big Speaker & Mic Tactile Stage with Waveform */}
          <div className="border-b border-obsidian-750 bg-gradient-to-b from-obsidian-850 to-obsidian-900 p-4 shadow-sm">
            <AudioWaveform state={audioState} />
          </div>

          {/* Transcript Scroll Area */}
          <div className="flex-1 overflow-hidden bg-obsidian-950/40">
            <TranscriptView messages={messages} />
          </div>

          {/* Bottom Voice Controls & Mic Trigger */}
          <div className="border-t border-obsidian-750 bg-obsidian-900 p-4 shadow-lg">
            <VoiceControls
              onSendMessage={handleSendMessage}
              isProcessing={isProcessing}
              lastInterviewerQuestion={lastInterviewerMsg}
              onStateChange={setAudioState}
            />
          </div>
        </div>

        {/* Right Column: Code Editor & Client Web Worker Sandbox (DSA Rounds Only) */}
        {isDsaRound && (
          <div
            className={`flex-1 flex-col p-4 bg-obsidian-950 overflow-hidden ${
              activeTab === 'code' ? 'flex' : 'hidden lg:flex'
            }`}
          >
            <CodeEditor
              initialCode={interview.submittedCode || interview.starterCode}
              problemStatement={interview.problemStatement}
              language={interview.codingLanguage as any}
              onCodeExecuted={handleCodeExecuted}
            />
          </div>
        )}
      </div>
    </div>
  )
}
