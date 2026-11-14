'use client'

import { useEffect, useRef } from 'react'

export interface AudioWaveformProps {
  state: 'interviewer_speaking' | 'candidate_speaking' | 'processing' | 'idle'
  candidateVolume?: number // 0 to 1
}

export function AudioWaveform({ state, candidateVolume = 0.5 }: AudioWaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number
    let phase = 0

    const render = () => {
      const width = canvas.width
      const height = canvas.height
      ctx.clearRect(0, 0, width, height)

      phase += 0.045

      // Determine wave parameters based on speaker state
      let color = 'rgba(100, 116, 139, 0.4)' // Idle slate
      let amplitude = 6
      let frequency = 0.02
      let lines = 2

      if (state === 'interviewer_speaking') {
        color = '#38BDF8' // Sky blue for AI interviewer
        amplitude = 22 + Math.sin(phase * 2.5) * 8
        frequency = 0.032
        lines = 5
      } else if (state === 'candidate_speaking') {
        color = '#10B981' // Emerald for student speaker
        amplitude = 16 + candidateVolume * 28
        frequency = 0.038
        lines = 5
      } else if (state === 'processing') {
        color = '#F59E0B' // Amber for AI reasoning/processing
        amplitude = 12 + Math.sin(phase * 5) * 5
        frequency = 0.05
        lines = 4
      }

      const centerY = height / 2

      // Draw subtle horizontal center guide line
      ctx.beginPath()
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)'
      ctx.lineWidth = 1
      ctx.moveTo(0, centerY)
      ctx.lineTo(width, centerY)
      ctx.stroke()

      // Draw harmonic sinusoidal waveform
      for (let l = 0; l < lines; l++) {
        ctx.beginPath()
        ctx.lineWidth = l === 0 ? 3 : 1.5
        const alpha = l === 0 ? 0.95 : 0.45 / (l + 0.6)
        ctx.strokeStyle = color.startsWith('#')
          ? hexToRgba(color, alpha)
          : color

        for (let x = 0; x < width; x++) {
          const envelope = Math.sin((x / width) * Math.PI) // Taper waves cleanly at edges
          const y =
            centerY +
            Math.sin(x * frequency + phase + l * 0.75) *
              amplitude *
              envelope *
              (1 - l * 0.16)

          if (x === 0) {
            ctx.moveTo(x, y)
          } else {
            ctx.lineTo(x, y)
          }
        }
        ctx.stroke()
      }

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      cancelAnimationFrame(animationFrameId)
    }
  }, [state, candidateVolume])

  return (
    <div className="relative flex flex-col items-center justify-center w-full">
      <div className="w-full relative flex items-center justify-center py-2">
        <canvas
          ref={canvasRef}
          width={480}
          height={90}
          className="h-20 w-full max-w-lg rounded-xl"
        />
      </div>

      <div className="mt-2 flex items-center gap-2 font-mono text-[11px] font-semibold tracking-wider uppercase">
        {state === 'interviewer_speaking' && (
          <span className="flex items-center gap-1.5 rounded-full border border-sky-500/40 bg-sky-500/10 px-3 py-1 text-sky-400 animate-pulse">
            <span className="h-2 w-2 rounded-full bg-sky-400" />
            Interviewer Speaking Out Loud
          </span>
        )}
        {state === 'candidate_speaking' && (
          <span className="flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-emerald-400 animate-pulse">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Your Microphone Live
          </span>
        )}
        {state === 'processing' && (
          <span className="flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-amber-400 animate-pulse">
            <span className="h-2 w-2 rounded-full bg-amber-400" />
            Evaluating Response & Formulating Next Question...
          </span>
        )}
        {state === 'idle' && (
          <span className="flex items-center gap-1.5 rounded-full border border-obsidian-750 bg-obsidian-900 px-3 py-1 text-obsidian-400">
            <span className="h-2 w-2 rounded-full bg-obsidian-600" />
            Studio Standing By
          </span>
        )}
      </div>
    </div>
  )
}

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}
