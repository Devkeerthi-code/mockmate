'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Mic, MicOff, Volume2, VolumeX, Keyboard, Send, CornerDownLeft } from 'lucide-react'

export interface VoiceControlsProps {
  onSendMessage: (text: string, durationMs?: number, pauseMs?: number) => Promise<void>
  isProcessing: boolean
  lastInterviewerQuestion?: string
  onStateChange: (state: 'interviewer_speaking' | 'candidate_speaking' | 'processing' | 'idle') => void
}

export function VoiceControls({
  onSendMessage,
  isProcessing,
  lastInterviewerQuestion,
  onStateChange,
}: VoiceControlsProps) {
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [audioEnabled, setAudioEnabled] = useState(true)
  const [showTextInput, setShowTextInput] = useState(false)
  const [typedText, setTypedText] = useState('')
  const [speechSupported, setSpeechSupported] = useState(true)
  const [transcriptInterim, setTranscriptInterim] = useState('')

  const recognitionRef = useRef<any>(null)
  const answerStartTimeRef = useRef<number>(0)
  const silenceStartTimeRef = useRef<number>(0)

  // Initialize Speech Synthesis & Speech Recognition
  useEffect(() => {
    if (typeof window === 'undefined') return

    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRec) {
      setSpeechSupported(false)
      setShowTextInput(true)
      return
    }

    const recognition = new SpeechRec()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onresult = (event: any) => {
      let interim = ''
      let final = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptPart = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          final += transcriptPart
        } else {
          interim += transcriptPart
        }
      }

      setTranscriptInterim(interim)

      if (final.trim()) {
        const duration = answerStartTimeRef.current ? Date.now() - answerStartTimeRef.current : 3000
        const pause = silenceStartTimeRef.current ? Date.now() - silenceStartTimeRef.current : 1000
        setTranscriptInterim('')
        stopListening()
        onSendMessage(final.trim(), duration, pause)
      }
    }

    recognition.onerror = (event: any) => {
      console.warn('Speech recognition error:', event.error)
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        setShowTextInput(true)
      }
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognitionRef.current = recognition

    return () => {
      try {
        recognition.stop()
      } catch {}
    }
  }, [onSendMessage])

  // Speak AI Interviewer Question via SpeechSynthesis
  const speakQuestion = useCallback(
    (text: string) => {
      if (typeof window === 'undefined' || !audioEnabled || !text) return

      window.speechSynthesis.cancel()

      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 1.02
      utterance.pitch = 1.0

      // Select natural English voice if available
      const voices = window.speechSynthesis.getVoices()
      const preferredVoice = voices.find(
        (v) =>
          v.lang.startsWith('en') &&
          (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Daniel'))
      )
      if (preferredVoice) utterance.voice = preferredVoice

      utterance.onstart = () => {
        setIsSpeaking(true)
        onStateChange('interviewer_speaking')
      }

      utterance.onend = () => {
        setIsSpeaking(false)
        silenceStartTimeRef.current = Date.now()
        onStateChange('idle')
        // Automatically start listening after interviewer finishes speaking
        startListening()
      }

      utterance.onerror = () => {
        setIsSpeaking(false)
        onStateChange('idle')
      }

      window.speechSynthesis.speak(utterance)
    },
    [audioEnabled, onStateChange]
  )

  // Trigger speech when interviewer question updates
  useEffect(() => {
    if (lastInterviewerQuestion && audioEnabled) {
      speakQuestion(lastInterviewerQuestion)
    }
  }, [lastInterviewerQuestion, audioEnabled, speakQuestion])

  // Voice Listening Start / Stop
  const startListening = () => {
    if (!recognitionRef.current || isProcessing || isSpeaking) return
    try {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
      recognitionRef.current.start()
      setIsListening(true)
      answerStartTimeRef.current = Date.now()
      onStateChange('candidate_speaking')
    } catch (e) {
      // recognition might already be active
      setIsListening(true)
      onStateChange('candidate_speaking')
    }
  }

  const stopListening = () => {
    if (!recognitionRef.current) return
    try {
      recognitionRef.current.stop()
    } catch {}
    setIsListening(false)
    onStateChange('idle')
  }

  const toggleListening = () => {
    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!typedText.trim() || isProcessing) return
    const textToSend = typedText.trim()
    setTypedText('')
    onSendMessage(textToSend, 4000, 1500)
  }

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Interim live speech feedback */}
      {transcriptInterim && (
        <div className="w-full max-w-xl rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-300">
          <span className="font-mono font-semibold text-emerald-400">Hearing: </span>
          {transcriptInterim}...
        </div>
      )}

      {/* Main Mic & Controls Row */}
      <div className="flex items-center gap-3">
        {/* Toggle Audio Output (Speaker) */}
        <button
          onClick={() => {
            if (audioEnabled) window.speechSynthesis.cancel()
            setAudioEnabled(!audioEnabled)
          }}
          title={audioEnabled ? 'Mute AI voice output' : 'Unmute AI voice output'}
          className={`flex h-10 w-10 items-center justify-center rounded-xl border transition-all ${
            audioEnabled
              ? 'border-obsidian-700 bg-obsidian-800 text-obsidian-200 hover:border-obsidian-600 hover:text-obsidian-50'
              : 'border-rose-500/40 bg-rose-500/10 text-rose-400'
          }`}
        >
          {audioEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
        </button>

        {/* Big Tactile Microphone Button */}
        <button
          onClick={toggleListening}
          disabled={isProcessing}
          className={`group relative flex h-14 w-14 items-center justify-center rounded-2xl border transition-all ${
            isListening
              ? 'border-emerald-500 bg-emerald-500 text-obsidian-950 shadow-glow-emerald animate-pulse'
              : 'border-obsidian-700 bg-obsidian-800 text-obsidian-100 hover:border-brand-500/60 hover:bg-obsidian-750 hover:text-brand-400'
          } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isListening ? (
            <Mic className="h-6 w-6 animate-bounce" />
          ) : (
            <MicOff className="h-6 w-6 text-obsidian-400 group-hover:text-brand-400" />
          )}
        </button>

        {/* Typing Fallback Toggle */}
        <button
          onClick={() => setShowTextInput(!showTextInput)}
          title="Toggle text input fallback"
          className={`flex h-10 w-10 items-center justify-center rounded-xl border transition-all ${
            showTextInput
              ? 'border-brand-500/50 bg-brand-500/10 text-brand-400'
              : 'border-obsidian-700 bg-obsidian-800 text-obsidian-300 hover:border-obsidian-600 hover:text-obsidian-50'
          }`}
        >
          <Keyboard className="h-4 w-4" />
        </button>
      </div>

      {/* Text Input Drawer */}
      {showTextInput && (
        <form onSubmit={handleTextSubmit} className="flex w-full max-w-xl items-center gap-2">
          <input
            type="text"
            value={typedText}
            onChange={(e) => setTypedText(e.target.value)}
            placeholder="Type your response here (Press Enter to send)..."
            disabled={isProcessing}
            className="flex-1 rounded-xl border border-obsidian-700 bg-obsidian-850 px-3.5 py-2.5 text-xs text-obsidian-50 placeholder-obsidian-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
          <button
            type="submit"
            disabled={!typedText.trim() || isProcessing}
            className="flex items-center gap-1.5 rounded-xl bg-brand-500 px-4 py-2.5 text-xs font-semibold text-obsidian-950 transition-all hover:bg-brand-400 disabled:opacity-50"
          >
            <span>Send</span>
            <CornerDownLeft className="h-3 w-3" />
          </button>
        </form>
      )}

      {!speechSupported && (
        <p className="text-[11px] text-amber-400">
          Note: Web Speech Recognition is not natively supported in this browser. Please use the text input above.
        </p>
      )}
    </div>
  )
}
