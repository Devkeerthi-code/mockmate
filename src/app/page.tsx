'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Mic,
  Code2,
  FileText,
  Award,
  ArrowRight,
  Sparkles,
  Terminal,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  Flame,
  Volume2,
  Play,
  RotateCcw,
  Zap,
  BookOpen,
  Layers,
  ArrowUpRight,
  Users
} from 'lucide-react'

export default function HomePage() {
  const [activeRoundTab, setActiveRoundTab] = useState(0)

  const campusQuestions = [
    '“How do I explain my 6-month gap?”',
    '“Explain B-Tree vs LSM Tree for Uber storage engine”',
    '“What is the STAR format for Amazon leadership principles?”',
    '“Why PostgreSQL instead of MongoDB in your project?”',
    '“Explain virtual memory and page faults for Cisco”',
    '“How do you handle rate-limiting for 10M API requests?”',
    '“Tell me about a time a prod bug escaped your tests”',
  ]

  const roundFormats = [
    {
      id: 'resume',
      title: 'Resume Project Deep-Dive',
      role: 'Frontend / Full-Stack / Backend',
      tag: 'MOST POPULAR',
      tagColor: 'text-brand-300 border-brand-400/50 bg-brand-500/10',
      tilt: 'sticker-tilt-left',
      accentColor: 'border-brand-500/40 bg-brand-500/5',
      badgeColor: 'bg-brand-500 text-obsidian-950',
      description: 'The AI parses your PDF resume, selects your top project, and probes architectural trade-offs, state management choices, and database indexing.',
      questions: [
        '“You used WebSockets in ChatHub. How did you handle reconnects?”',
        '“What happens if Redis fails during session lookup?”',
      ],
      rubricFocus: 'Depth of ownership, technical honesty & trade-off clarity',
    },
    {
      id: 'dsa',
      title: 'DSA Whiteboard & Live Runner',
      role: 'SDE-1 / Product Companies',
      tag: 'SANDBOXED PYODIDE',
      tagColor: 'text-sky-300 border-sky-400/50 bg-sky-500/10',
      tilt: 'sticker-tilt-right',
      accentColor: 'border-sky-500/40 bg-sky-500/5',
      badgeColor: 'bg-sky-400 text-obsidian-950',
      description: 'Discuss optimal time complexity out loud, explain edge cases, then implement your solution in JavaScript or Python inside an isolated browser sandbox.',
      questions: [
        '“Before writing code: what is the worst-case space complexity?”',
        '“Can you solve it in O(N) using sliding window?”',
      ],
      rubricFocus: 'Complexity awareness, verbal walkthrough & edge case handling',
    },
    {
      id: 'fundamentals',
      title: 'CS Fundamentals & OS Core',
      role: 'Day 1 & Day 2 Campus Drives',
      tag: 'TIER-1 PLACEMENTS',
      tagColor: 'text-emerald-300 border-emerald-400/50 bg-emerald-500/10',
      tilt: 'sticker-tilt-left',
      accentColor: 'border-emerald-500/40 bg-emerald-500/5',
      badgeColor: 'bg-emerald-400 text-obsidian-950',
      description: 'Rapid-fire verbal drill on operating systems, processes vs threads, deadlock conditions, SQL normal forms, and TCP handshake mechanics.',
      questions: [
        '“What is the difference between mutex and semaphore?”',
        '“Walk me through what happens when you type google.com in a browser”',
      ],
      rubricFocus: 'Concept crispness, standard definitions & real-world analogies',
    },
    {
      id: 'behavioral',
      title: 'Behavioural STAR Dossier',
      role: 'Amazon / Microsoft / FinTech',
      tag: 'STAR FRAMEWORK',
      tagColor: 'text-purple-300 border-purple-400/50 bg-purple-500/10',
      tilt: 'sticker-tilt-right',
      accentColor: 'border-purple-500/40 bg-purple-500/5',
      badgeColor: 'bg-purple-400 text-obsidian-950',
      description: 'Structure your answers using Situation, Task, Action, and Result. The AI flags rambling, extracts metrics, and compares against a 95+ model answer.',
      questions: [
        '“Tell me about a time you had a major disagreement with a team member”',
        '“Describe your biggest project failure and what you learned”',
      ],
      rubricFocus: 'Quantified outcomes, conflict resolution & leadership empathy',
    },
  ]

  const steps = [
    {
      num: '01',
      title: 'Upload Resume & Select Target Role',
      desc: 'MockMate extracts your actual college projects, internship contributions, and tech stack in seconds. No generic questions.',
      note: 'Parses PDF instantly 📄',
    },
    {
      num: '02',
      title: 'Realistic Voice Interview Out Loud',
      desc: 'Speak naturally into your microphone. The AI responds verbally with natural cadence, asks follow-up interrogations, and tracks pause time.',
      note: 'Speaks & listens in real time 🎙️',
    },
    {
      num: '03',
      title: 'Sandboxed Code Runner on the Spot',
      desc: 'For DSA rounds, switch to the built-in editor. Execute Python or JavaScript in a Web Worker sandbox — code never touches an external server.',
      note: 'Zero server risk ✍️',
    },
    {
      num: '04',
      title: 'Line-by-Line Evidence Dossier',
      desc: 'Get scored across 5 placement dimensions. Every piece of praise and criticism links to exact line numbers in your transcript, plus a 95+ model rewrite.',
      note: 'STAR result cited 🔥',
    },
  ]

  return (
    <div className="relative overflow-hidden bg-grain">
      {/* Editorial Decorative Grid & Grain Ambient */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(245,158,11,0.12),transparent_70%)]" />

      {/* Hero Section */}
      <section className="relative mx-auto max-w-6xl px-4 pt-14 pb-20 text-center sm:px-6 lg:pt-20">
        {/* Playful chalk sticky callout */}
        <div className="mb-4 inline-flex items-center gap-2">
          <span className="sticker-badge sticker-tilt-left border-brand-400 bg-brand-500/10 text-brand-400">
            <Flame className="h-3.5 w-3.5 fill-brand-400" />
            2026 PLACEMENT SEASON READY
          </span>
          <span className="hand-annotation hidden text-amber-300 sm:inline-block">
            Tired of silent rejections? ✍️
          </span>
        </div>

        {/* Oversized Chunky Syne Heading */}
        <h1 className="font-display text-4xl font-black tracking-[-0.04em] text-obsidian-50 sm:text-6xl md:text-7xl lg:text-[80px] lg:leading-[1.02]">
          Master Your Placement <br className="hidden sm:block" />
          Interview{' '}
          <span className="relative inline-block text-brand-400 underline decoration-brand-500/40 decoration-wavy decoration-2">
            Out Loud.
          </span>
        </h1>

        {/* Problem & Value Subhead */}
        <p className="mx-auto mt-6 max-w-2xl text-base text-obsidian-200 sm:text-lg leading-relaxed font-body">
          Seniors are busy, mock apps feel like multiple-choice quizzes, and silent practice in your head won&apos;t save you in Round 2.
          MockMate is your voice-first AI interviewer that interrogates your actual resume projects, runs sandboxed code, and cites exact transcript lines.
        </p>

        {/* Tactile 3D Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/interview/new"
            className="btn-tactile-primary w-full sm:w-auto px-8 py-4 text-sm gap-2.5"
          >
            <Mic className="h-4 w-4" />
            <span>Start Practice Mock</span>
            <ArrowRight className="h-4 w-4" />
          </Link>

          <Link
            href="/question-bank"
            className="btn-tactile-secondary w-full sm:w-auto px-7 py-4 text-sm gap-2"
          >
            <BookOpen className="h-4 w-4 text-obsidian-300" />
            <span>Browse 500+ Campus Questions</span>
          </Link>
        </div>

        {/* Handwritten Guarantee Note */}
        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-obsidian-400 font-mono">
          <span className="hand-annotation text-sm text-emerald-400">
            Zero audio stored on server ✍️
          </span>
          <span>•</span>
          <span className="text-obsidian-300 font-medium">Free during placement season</span>
        </div>

        {/* Trust & Architecture Chips */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-2 rounded-xl border border-obsidian-750 bg-obsidian-900/80 px-3.5 py-2 text-obsidian-200 shadow-sm">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>Zero Audio Retained (Ephemeral Speech)</span>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-obsidian-750 bg-obsidian-900/80 px-3.5 py-2 text-obsidian-200 shadow-sm">
            <Terminal className="h-4 w-4 text-sky-400 shrink-0" />
            <span>Client Pyodide Sandbox (Zero Cloud Risk)</span>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-obsidian-750 bg-obsidian-900/80 px-3.5 py-2 text-obsidian-200 shadow-sm">
            <Award className="h-4 w-4 text-brand-400 shrink-0" />
            <span>Line-Numbered Feedback Citations</span>
          </div>
        </div>
      </section>

      {/* Infinite Scrolling Ticker Strip 1: Real Campus Placement Questions */}
      <section className="border-y border-obsidian-800 bg-obsidian-950/70 py-3.5 overflow-hidden ticker-pause-hover">
        <div className="flex animate-infinite-ticker whitespace-nowrap">
          {[...campusQuestions, ...campusQuestions].map((q, idx) => (
            <div
              key={idx}
              className="mx-4 flex items-center gap-3 rounded-lg border border-obsidian-750 bg-obsidian-900/80 px-4 py-2 font-mono text-xs text-obsidian-200 shadow-sm"
            >
              <span className="flex h-2 w-2 rounded-full bg-amber-400" />
              <span className="text-amber-300 font-bold">Q:</span>
              <span className="italic">{q}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Shelf-Style Momentum Carousel: Interview Round Formats */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-10">
          <div>
            <div className="inline-flex items-center gap-2">
              <span className="sticker-badge sticker-tilt-subtle border-sky-400 bg-sky-500/10 text-sky-300">
                SHELF OF ROUNDS
              </span>
              <span className="hand-annotation text-sky-300 text-sm">
                Pick your weakest format first ✍️
              </span>
            </div>
            <h2 className="mt-2 font-display text-2xl font-black tracking-tight text-obsidian-50 sm:text-4xl">
              Engineered For The Full Placement Pipeline
            </h2>
            <p className="mt-1 text-xs text-obsidian-400">
              Select a specialized module or take a multi-stage composite mock.
            </p>
          </div>

          <Link
            href="/interview/new"
            className="flex items-center gap-1.5 text-xs font-semibold text-brand-400 hover:text-brand-300 font-mono"
          >
            <span>Custom Mock Setup</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {/* 4 Shelf Cards Grid with Tactile Book-Cover feel */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {roundFormats.map((format, index) => {
            return (
              <div
                key={format.id}
                className={`group relative flex flex-col justify-between rounded-2xl border p-6 transition-all duration-200 hover:-translate-y-1.5 hover:shadow-2xl ${
                  index === 0
                    ? 'border-brand-500/50 bg-gradient-to-b from-[#181308] to-obsidian-900 shadow-[0_8px_0_#78350F]'
                    : 'border-obsidian-700 bg-gradient-to-b from-obsidian-850 to-obsidian-900 shadow-[0_8px_0_#161C27]'
                }`}
              >
                {/* Book Spine Accent Line */}
                <div className="absolute top-0 left-0 bottom-0 w-1.5 rounded-l-2xl bg-gradient-to-b from-brand-400/40 via-sky-400/30 to-transparent" />

                <div>
                  {/* Top Sticker Tag */}
                  <div className="flex items-center justify-between mb-4">
                    <span className={`sticker-badge ${format.tilt} ${format.tagColor}`}>
                      {format.tag}
                    </span>
                    <span className="font-mono text-[10px] text-obsidian-400">
                      ROUND 0{index + 1}
                    </span>
                  </div>

                  {/* Title & Target Role */}
                  <h3 className="font-display text-lg font-bold tracking-tight text-obsidian-50 group-hover:text-brand-300 transition-colors">
                    {format.title}
                  </h3>
                  <p className="mt-1 text-[11px] font-mono text-obsidian-400">
                    {format.role}
                  </p>

                  <p className="mt-3 text-xs text-obsidian-300 leading-relaxed">
                    {format.description}
                  </p>

                  {/* Real Question Sample */}
                  <div className="mt-4 rounded-xl border border-obsidian-750 bg-obsidian-950/60 p-3 font-mono text-[11px] text-obsidian-300">
                    <span className="text-[10px] font-bold uppercase text-amber-400 block mb-1">
                      Sample Interrogation:
                    </span>
                    {format.questions[0]}
                  </div>
                </div>

                <div className="mt-6 border-t border-obsidian-800 pt-4">
                  <div className="text-[10px] font-mono text-obsidian-400 mb-3">
                    <span className="text-obsidian-200 font-semibold">Evaluation Rubric:</span> {format.rubricFocus}
                  </div>
                  <Link
                    href={`/interview/new?type=${format.id.toUpperCase()}`}
                    className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-obsidian-700 bg-obsidian-800/80 py-2.5 text-xs font-semibold text-obsidian-200 transition-all hover:border-brand-500/50 hover:bg-brand-500/10 hover:text-brand-300"
                  >
                    <span>Practice This Round</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Illustrated 4-Step "How Placement Mocking Works" */}
      <section className="border-t border-obsidian-800 bg-obsidian-950/40 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center mb-16">
            <span className="sticker-badge sticker-tilt-right border-emerald-400 bg-emerald-500/10 text-emerald-300">
              WORKFLOW BLUEPRINT
            </span>
            <h2 className="mt-3 font-display text-3xl font-black tracking-tight text-obsidian-50 sm:text-4xl">
              How Placement Mocking Actually Works
            </h2>
            <p className="mt-2 text-xs text-obsidian-400 max-w-lg mx-auto">
              No robotic scripts. Just grounded, multi-turn conversational rigor modeled on real Tier-1 and service-based college placement panels.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {steps.map((step, idx) => (
              <div
                key={step.num}
                className="relative rounded-2xl border border-obsidian-750 bg-obsidian-900/90 p-6 flex flex-col justify-between shadow-lg hover:border-obsidian-600 transition-all"
              >
                {/* Connecting dashed line badge */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-obsidian-800 border-2 border-brand-500/40 font-mono text-base font-black text-brand-400 shadow-[0_3px_0_#92400E]">
                    {step.num}
                  </div>
                  <span className="hand-annotation text-amber-300 text-sm">
                    {step.note}
                  </span>
                </div>

                <div>
                  <h3 className="font-display text-base font-bold text-obsidian-50">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-xs text-obsidian-300 leading-relaxed font-body">
                    {step.desc}
                  </p>
                </div>

                <div className="mt-6 pt-3 border-t border-obsidian-800 flex items-center gap-1.5 text-[10px] font-mono text-emerald-400">
                  <CheckCircle2 className="h-3 w-3 shrink-0" />
                  <span>Real Placement Standard</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tactile Comparison: Traditional Solo Prep vs MockMate */}
      <section className="mx-auto max-w-5xl px-4 py-20 sm:px-6">
        <div className="text-center mb-12">
          <span className="sticker-badge sticker-tilt-left border-purple-400 bg-purple-500/10 text-purple-300">
            THE REALITY CHECK
          </span>
          <h2 className="mt-3 font-display text-3xl font-black tracking-tight text-obsidian-50 sm:text-4xl">
            Why Silent Preparation Fails On Campus Day
          </h2>
          <p className="mt-2 text-xs text-obsidian-400">
            When the interviewer interrupts your project explanation, silence is fatal.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Traditional Card */}
          <div className="rounded-2xl border border-rose-500/20 bg-rose-950/10 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="rounded-md border border-rose-500/40 bg-rose-500/10 px-2.5 py-1 font-mono text-xs font-bold text-rose-400">
                TRADITIONAL PREP
              </span>
              <span className="hand-annotation text-rose-400 text-sm">Freezing in Round 1 ❌</span>
            </div>
            <ul className="space-y-3 text-xs text-obsidian-300">
              <li className="flex items-start gap-2">
                <span className="text-rose-400 font-bold">✕</span>
                <span>Reading LeetCode discussion forums silently in your browser without articulating thought process.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-400 font-bold">✕</span>
                <span>Begging busy seniors for a mock slot that gets rescheduled 4 times.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-400 font-bold">✕</span>
                <span>Generic feedback like &quot;work on confidence&quot; with zero citation of which sentence was weak.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-400 font-bold">✕</span>
                <span>No live proctoring of filler words (&quot;um&quot;, &quot;basically&quot;, &quot;like&quot;) or 8-second speech pauses.</span>
              </li>
            </ul>
          </div>

          {/* MockMate Card */}
          <div className="rounded-2xl border border-brand-500/40 bg-brand-500/5 p-6 space-y-4 shadow-[0_4px_24px_-4px_rgba(245,158,11,0.15)]">
            <div className="flex items-center justify-between">
              <span className="rounded-md border border-brand-500 bg-brand-500/20 px-2.5 py-1 font-mono text-xs font-bold text-brand-300">
                MOCKMATE VOICE AI
              </span>
              <span className="hand-annotation text-amber-300 text-sm">Clear offers faster ✨</span>
            </div>
            <ul className="space-y-3 text-xs text-obsidian-200">
              <li className="flex items-start gap-2">
                <span className="text-brand-400 font-bold">✓</span>
                <span>High-pressure conversational voice mock with natural interruption and follow-up prompts.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand-400 font-bold">✓</span>
                <span>Runs 24/7 on demand. Practice at 2 AM before your campus drive with zero embarrassment.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand-400 font-bold">✓</span>
                <span>Exact line-numbered transcript citations linking each grade directly to your actual words.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand-400 font-bold">✓</span>
                <span>Refactored 95+ model answer showing you precisely how to rephrase using STAR.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Final Tactical Call to Action */}
      <section className="relative mx-auto max-w-4xl px-4 py-16 text-center sm:px-6">
        <div className="rounded-3xl border-2 border-brand-500/50 bg-gradient-to-b from-brand-500/10 to-obsidian-950 p-8 sm:p-12 shadow-[0_8px_32px_-8px_rgba(245,158,11,0.3)]">
          <span className="sticker-badge sticker-tilt-right border-brand-400 bg-brand-500/20 text-brand-300 mb-4 inline-flex">
            READY FOR PLACEMENT ROUNDS?
          </span>

          <h2 className="font-display text-3xl font-black tracking-tight text-obsidian-50 sm:text-5xl">
            Give Your First Voice Mock in 60 Seconds
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-xs sm:text-sm text-obsidian-300 font-body">
            Upload your resume or pick a standard CS fundamentals round. No credit cards, no audio storage, and no awkward small talk.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/interview/new"
              className="btn-tactile-primary w-full sm:w-auto px-8 py-4 text-sm gap-2"
            >
              <Mic className="h-4 w-4" />
              <span>Launch Free Voice Studio</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="/login"
              className="btn-tactile-secondary w-full sm:w-auto px-6 py-4 text-sm gap-2"
            >
              <span>Sign In with Existing Account</span>
            </Link>
          </div>

          <p className="mt-5 font-hand text-lg text-amber-300">
            Real interview pressure. Instant rubric feedback. ✍️
          </p>
        </div>
      </section>
    </div>
  )
}
