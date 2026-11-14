# MockMate

> **Voice-based AI mock interviewer for students preparing for campus placements and technical internships.**

---

### Who is this for and what problem does it solve?
**Who it's for:** Final-year and pre-final year engineering students preparing for on-campus placements, off-campus hiring drives, and technical internships.

**The problem it solves:**
Students practice for interviews in their heads or not at all. Real mock interviews with experienced seniors or working professionals are nearly impossible to schedule on demand, and peers rarely give structured, critical feedback. Whiteboard DSA sessions lack execution testing, behavioral questions miss structured STAR evaluation, and no one measures hesitation, dead air, or verbal fillers. 

MockMate provides an always-available, voice-driven mock interview partner that speaks, listens, interrogates real resume projects, executes whiteboard code safely in the browser, and delivers a rigorous performance dossier where every score cites exact transcript lines.

---

## Live Demo
> **Live Demo:** [TODO: Deploy on Vercel with Neon PostgreSQL]

---

## GitHub Repo Metadata
- **About line:** Voice-based AI mock interviewer for campus placements with real resume project interrogation, in-browser sandboxed code execution, and transcript-grounded rubrics.
- **Suggested Topics/Tags:** `mock-interview`, `placement-prep`, `voice-ai`, `nextjs14`, `prisma-neon`

---

## Core Features

1. **Email & Password Authentication (bcrypt & JWT)**
   - Secure salted password hashing (cost factor 10) and signed HTTP-only cookies.
   - One-click resume ingestion (PDF or text).

2. **Resume Project Deep-Dive**
   - Automatically parses projects, technologies, and work experience.
   - The AI interviewer targets the candidate’s actual projects (e.g., *"In your Redis task queue project, how did you handle orphan jobs when a worker crashed?"*).

3. **Live Voice Interview Studio**
   - **Speech Synthesis:** AI speaks naturally using the browser’s Speech Synthesis API.
   - **Speech Recognition:** Listens in real time via the Web Speech API (`webkitSpeechRecognition`).
   - **Typing Fallback:** Instant keyboard drawer for noisy environments or browsers lacking speech recognition.
   - **Voice Presence HUD:** Dynamic HTML5 dual harmonic waveform rendering active speaker states.

4. **In-Browser Sandboxed Whiteboard Coding**
   - Interactive code editor supporting **JavaScript** and **Python 3**.
   - **Zero Server Risk:** Code executes strictly in the client's browser using isolated Web Workers (V8 Worker for JS, Pyodide Web Worker for Python).
   - Strict **5-second watchdog timer** prevents infinite loops and memory exhaustion.
   - Interviewer inspects stdout and probes candidate on algorithmic complexity ($O(N)$ time/space) and edge cases.

5. **Evidence-Grounded Rubric Dossier**
   - Evaluated across 5 fixed dimensions: **Communication (20%)**, **Technical Depth (25%)**, **Problem Solving (25%)**, **Structure/STAR (15%)**, and **Confidence Signals (15%)**.
   - **Strict Citation Mandate:** Every score and improvement cites exact transcript lines (e.g., `Lines 2-4`). Clicking any citation chip highlights the exact line in the transcript.
   - Confirmed strengths, top 3 prioritized action items, and a side-by-side refactored **95+ STAR model answer** for the student's weakest response.

6. **Longitudinal Progress Analytics**
   - Historical score progression across sessions.
   - Identifies the student's weakest rubric area and recommends targeted next mock rounds.

7. **Curated Placement Question Bank**
   - Company-tier-specific question patterns (Product Unicorns, High-Growth Startups, Service Recruiters).
   - Admin-editable question vault with clear practice integrity disclaimers.

8. **Strict Privacy & Right to Erasure**
   - **Zero Audio Storage:** Audio is converted to text client-side; raw audio is never recorded, transmitted, or saved to disk.
   - **One-Click Data Purge:** Permanent "Delete My Data" action removes profile, resumes, transcripts, and evaluation dossiers in a single cascade.
   - Lightweight, privacy-respecting aggregated usage counters without PII.

---

## Architecture Diagram

```mermaid
flowchart TD
    subgraph Browser ["Client Browser"]
        UI["Next.js App Router (Tailwind + React)"]
        SpeechIn["Web Speech Recognition (STT)"]
        SpeechOut["Web Speech Synthesis (TTS)"]
        Waveform["HTML5 Canvas Waveform"]
        
        subgraph Sandbox ["Isolated Web Worker Sandbox"]
            JSWorker["JS Worker (Strict Scope, 5s Watchdog)"]
            PyWorker["Pyodide Worker (Python 3, 10s Watchdog)"]
        end
    end

    subgraph Server ["Next.js Serverless Backend (Node.js)"]
        AuthModule["Auth & Session (bcrypt + JWT)"]
        ResumeParser["Resume Parser (pdf-parse + Regex)"]
        StateMachine["Interview State Machine (Pacing & Probing)"]
        RubricEngine["Rubric Evaluator (Grounding & Citations)"]
        RateLimiter["Token Bucket Rate Limiter"]
    end

    subgraph Cloud ["External Cloud Services"]
        GeminiAPI["Google Gemini 1.5 Flash (Interview Persona)"]
        NeonDB[("Neon Serverless PostgreSQL (Prisma ORM)")]
    end

    %% Client Interactions
    UI --> SpeechIn
    SpeechIn -->|Transcribed Text| UI
    UI --> Waveform
    UI -->|Spoken Utterance| SpeechOut
    UI -->|Execute Code| JSWorker
    UI -->|Execute Python| PyWorker
    JSWorker -->|Stdout / Duration| UI
    PyWorker -->|Stdout / Duration| UI

    %% Client to Server
    UI -->|REST API / Cookies| Server

    %% Server Logic
    Server --> AuthModule
    Server --> ResumeParser
    Server --> StateMachine
    Server --> RubricEngine
    Server --> RateLimiter

    %% Server to Cloud
    StateMachine -->|Interviewer Prompt| GeminiAPI
    GeminiAPI -->|Next Question| StateMachine
    Server -->|Prisma Client| NeonDB
```

---

## Design Decisions & Trade-Offs

1. **Client-Side Isolated Web Workers vs. Remote Containerized Sandbox (e.g., Docker / Firecracker)**
   - *Alternative Considered:* Spinning up backend micro-VMs or Docker containers to run student code.
   - *Decision:* Execute all student code in the browser via dedicated Web Workers and Pyodide.
   - *Trade-off:* Eliminates backend compute costs, eliminates remote code execution (RCE) vulnerabilities, and delivers sub-50ms execution latency. The trade-off is a ~12MB initial Pyodide runtime download for Python.

2. **Web Speech API vs. Server-Side Audio Streaming (Whisper / ElevenLabs)**
   - *Alternative Considered:* Streaming microphone audio chunks over WebSockets to Whisper and ElevenLabs.
   - *Decision:* Utilize native browser `webkitSpeechRecognition` and `SpeechSynthesis`.
   - *Trade-off:* Delivers zero audio persistence for absolute student privacy, zero latency streaming delays, and zero transcription API cost. Fallback text input guarantees accessibility on browsers without Web Speech support.

3. **Deterministic Heuristic Rubric Engine with Transcript Citations vs. Pure LLM Output**
   - *Alternative Considered:* Asking an LLM to generate scores and line citations directly as free-form JSON.
   - *Decision:* Pair rule-based analysis (speech hesitation, filler words ratio, STAR regex verification) with exact transcript index bounds checking.
   - *Trade-off:* Guarantees 100% citation validity (citations can never hallucinate non-existent lines) and ensures strict scoring reproducibility across evaluation benchmarks.

4. **Token Bucket Rate Limiting per Client Session**
   - *Alternative Considered:* Unrestricted access to the Gemini 1.5 Flash API.
   - *Decision:* In-memory token bucket rate limiter (20 burst capacity, 0.33 tokens/sec refill rate) with intelligent offline question fallbacks.
   - *Trade-off:* Protects the API quota from runaway loops while ensuring a student’s live mock interview never crashes even under rate limit pressures.

---

## Evaluation Benchmark & Test Results

An evaluation set of **10 distinct, fictional placement transcripts** across **Strong**, **Average**, and **Weak** candidate profiles was benchmarked against expected score bands:

| Benchmark Case | Candidate Profile & Topic | Tier | Score | Expected Range | Status |
| :--- | :--- | :---: | :---: | :---: | :---: |
| `CASE_01_STRONG_CACHE` | Redis Caching, Invalidation & Redlock | Strong | **84** | 80 – 95 | ✅ PASS |
| `CASE_02_STRONG_DSA` | Sliding Window & Complexity Proofs | Strong | **84** | 80 – 95 | ✅ PASS |
| `CASE_03_STRONG_BEHAVIORAL`| STAR Conflict Resolution on Database Selection | Strong | **84** | 78 – 94 | ✅ PASS |
| `CASE_04_AVG_DATABASE` | PostgreSQL vs MongoDB (Missing Metrics) | Average | **71** | 58 – 76 | ✅ PASS |
| `CASE_05_AVG_FRONTEND` | Zustand vs React Context Re-renders | Average | **68** | 58 – 76 | ✅ PASS |
| `CASE_06_AVG_BEHAVIORAL` | Production Debugging (Missing Quantified Result) | Average | **67** | 55 – 75 | ✅ PASS |
| `CASE_07_AVG_OS` | Virtual Memory, MMU & Page Fault Interrupts | Average | **71** | 58 – 76 | ✅ PASS |
| `CASE_08_WEAK_FILLERS` | Excessive Verbal Fillers ("like", "um", 25% ratio) | Weak | **42** | 30 – 54 | ✅ PASS |
| `CASE_09_WEAK_VAGUE` | Curt Database Migration ("just dropped tables") | Weak | **38** | 28 – 50 | ✅ PASS |
| `CASE_10_WEAK_BEHAVIORAL`| Defensive Blaming & Missing STAR Structure | Weak | **40** | 28 – 50 | ✅ PASS |

**Benchmark Accuracy:** **10 / 10 Cases (100.0%)** landed strictly within their predicted hiring score band.

### Unit & Integration Test Suites
- `Resume Parser`: Validates extraction of skills, multi-line project headers, and degree metadata.
- `Interview State Machine`: Validates 15m/30m/45m question budgeting, follow-up triggering on brief answers, and 3-minute grace conclusion.
- `Rubric Citations Integrity`: Verifies that 100% of cited lines strictly exist within transcript bounds.
- `Sandbox Watchdog`: Confirms termination of infinite loops on watchdog expiration.
- `Token Bucket Rate Limiter`: Verifies burst depletion, client key isolation, and replenishment.

---

## How to Run Locally

### Prerequisites
- Node.js (v18.17+ or v20+)
- PostgreSQL connection string (Neon serverless or local PostgreSQL)

### Quick Setup

1. **Clone the repository and install dependencies:**
   ```bash
   git clone <repo-url> mockmate
   cd mockmate
   npm install
   ```

2. **Configure environment variables:**
   Copy the `.env.example` file to `.env`:
   ```bash
   cp .env.example .env
   ```
   Fill in your PostgreSQL URL and Gemini API Key:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/mockmate?sslmode=require"
   GEMINI_API_KEY="your-gemini-api-key"
   JWT_SECRET="your-random-32-character-secret"
   ADMIN_EMAILS="your-email@example.com"
   ```

3. **Initialize Database Schema & Question Bank Seed:**
   ```bash
   npx prisma db push
   npm run db:seed
   ```

4. **Run the Automated Tests & Benchmark:**
   ```bash
   npm test
   npm run eval
   ```

5. **Start the Development Server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in Google Chrome or Microsoft Edge (recommended for Web Speech API support).

---

## Deployment (Free Tier on Vercel + Neon)

1. **Database:**
   - Create a free serverless PostgreSQL database on [Neon.tech](https://neon.tech).
   - Copy the Pooled Connection String into `DATABASE_URL`.

2. **Vercel Deployment:**
   - Import the repository on [Vercel](https://vercel.com).
   - Add the following Environment Variables in the Vercel project settings:
     - `DATABASE_URL`: Your Neon connection string.
     - `GEMINI_API_KEY`: Your Google AI Studio API key.
     - `JWT_SECRET`: Random 32-character hex secret.
     - `ADMIN_EMAILS`: Your admin email address.
   - Build Command: `npx prisma generate && next build`
   - Output Directory: `.next`

---

## Limitations & What Breaks at Scale

1. **Browser Speech Recognition Variance:**
   - The Web Speech API (`webkitSpeechRecognition`) relies on browser-native implementations. Chrome and Edge provide near-instant speech recognition, while Firefox and Safari have limited support and automatically utilize the built-in typing fallback.
2. **In-Memory Rate Limiting Across Multi-Region Serverless Instances:**
   - The current token-bucket limiter operates in server memory. On multi-instance serverless deployments (e.g. Vercel multi-region), state is per-container rather than globally centralized. Upgrading to Upstash Redis would centralize global IP rate limits.
3. **Heavy Python Libraries in Client Sandbox:**
   - Pyodide runs standard library Python seamlessly in-browser. However, heavy machine learning libraries like `torch` or `tensorflow` cannot run client-side without massive multi-hundred-megabyte WebAssembly bundles.

---

## What I Learned & Future Improvements

### What I Learned
1. **Web Audio & Speech Synchronization:** Handling `window.speechSynthesis` event cancellation and managing race conditions when a user interrupts an AI utterance required careful state management.
2. **Deterministic Citations:** Generating structured, verifiable transcript line citations prevents hallucination and creates much more actionable feedback for students.
3. **Client-Side Sandboxing:** Running user code in isolated Web Workers using `new Blob()` prevents server vulnerabilities, avoids infrastructure costs, and runs in milliseconds.

### What I'd Improve Next
1. **WebRTC Full-Duplex Audio:** Transition to direct audio streaming with WebSockets for sub-100ms conversational turn-taking.
2. **Monaco Editor IntelliSense:** Integrate language server protocol (LSP) workers for richer auto-complete in coding whiteboard rounds.
3. **Peer Comparison Percentiles:** Show students where their communication and technical depth scores rank compared to anonymous batchmate cohorts.
