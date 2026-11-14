import { GoogleGenerativeAI } from '@google/generative-ai'
import { globalGeminiLimiter } from './rate-limiter'

const apiKey = process.env.GEMINI_API_KEY || ''
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null

export interface InterviewerPromptParams {
  interviewType: string
  targetRole: string
  companyType: string
  difficulty: string
  resumeSkills?: string[]
  resumeProjects?: Array<{ title: string; techStack: string[]; description: string }>
  conversationHistory: Array<{ role: 'INTERVIEWER' | 'CANDIDATE'; content: string }>
  actionType: string
  actionFocus?: string
}

export async function generateInterviewerQuestion(params: InterviewerPromptParams): Promise<string> {
  // Check rate limit first
  const limitCheck = globalGeminiLimiter.check('gemini_interviewer')
  if (!limitCheck.success) {
    return getFallbackQuestion(params)
  }

  if (!genAI || !apiKey) {
    return getFallbackQuestion(params)
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    const systemInstruction = `You are a discerning, professional engineering mock interviewer conducting a collegiate technical placement interview for a ${params.targetRole} role at a ${params.companyType} company.
Interview Type: ${params.interviewType}.
Difficulty: ${params.difficulty}.

Resume Context:
- Candidate Skills: ${params.resumeSkills?.join(', ') || 'Standard Computer Science Curriculum'}
- Candidate Projects: ${params.resumeProjects?.map((p) => `${p.title} (${p.techStack.join(', ')}): ${p.description}`).join('; ') || 'Full stack web applications'}

RULES:
1. Speak directly in character as the interviewer. Never say "As an AI..." or give meta-commentary.
2. Ask exactly ONE clear, focused question or follow-up. Do not ask multi-part compound questions.
3. If this is a follow-up, dig specifically into the candidate's last answer, challenging assumptions or asking for metrics, internal mechanisms, or edge cases.
4. Keep the question under 3 sentences so it sounds natural when spoken via text-to-speech.
5. Action to take now: ${params.actionType} (Focus: ${params.actionFocus || 'general'}).`

    const historyPrompt = params.conversationHistory
      .slice(-6)
      .map((m) => `${m.role === 'INTERVIEWER' ? 'Interviewer' : 'Candidate'}: ${m.content}`)
      .join('\n\n')

    const prompt = `${systemInstruction}\n\nRecent Interview Dialogue:\n${historyPrompt || 'No prior messages. Deliver the opening question introducing the round.'}\n\nInterviewer's next question:`

    const result = await model.generateContent(prompt)
    const text = result.response.text().trim()
    return text || getFallbackQuestion(params)
  } catch (error) {
    console.warn('Gemini API call failed, using intelligent fallback:', error)
    return getFallbackQuestion(params)
  }
}

function getFallbackQuestion(params: InterviewerPromptParams): string {
  const { interviewType, actionType, actionFocus, conversationHistory } = params
  const turnCount = conversationHistory.filter((m) => m.role === 'INTERVIEWER').length

  if (actionType === 'PROMPT_CANDIDATE_QUESTIONS') {
    return "We have just a few minutes left in our scheduled slot. Do you have any questions for me about the role, our engineering culture, or the tech stack?"
  }

  if (actionType === 'PROBE_FOLLOW_UP') {
    if (actionFocus === 'star_result_metrics') {
      return "That gives good context on the task, but what was the measurable outcome or quantitative result of the actions you took?"
    }
    if (actionFocus === 'architectural_tradeoffs') {
      return "What were the primary architectural trade-offs you evaluated before choosing that approach, and what were its drawbacks?"
    }
    return "Can you walk me through the specific internal mechanism of how that component handled failure states or concurrency?"
  }

  if (actionType === 'REQUEST_CODE_COMPLEXITY') {
    if (actionFocus === 'edge_cases') {
      return "What edge cases would break your current implementation, such as empty inputs, duplicates, or very large arrays?"
    }
    return "What is the tightest time and auxiliary space complexity of your code, and could we optimize either further?"
  }

  // Type-based questions
  if (interviewType === 'HR_BEHAVIOURAL') {
    const hr = [
      "Tell me about a time when you had a disagreement with a team member on a technical decision. How did you resolve it?",
      "Can you describe a challenging project where requirements changed close to the deadline? How did you prioritize tasks?",
      "Tell me about a situation where you made a mistake or experienced a bug in production. What happened and what did you learn?",
      "Give an example of a time you had to learn a completely new framework or technology under tight time constraints.",
    ]
    return hr[turnCount % hr.length]
  }

  if (interviewType === 'CS_FUNDAMENTALS') {
    const cs = [
      "How does a B-Tree index work under the hood in a relational database, and when does adding an index actually hurt query performance?",
      "Explain the key difference between a process and a thread. How does the OS handle context switching between them?",
      "Can you explain the TCP three-way handshake and why TCP is preferred over UDP for reliable file transfer?",
      "Explain the concept of deadlock. What are the four Coffman conditions required for a deadlock to occur, and how do you prevent them?",
    ]
    return cs[turnCount % cs.length]
  }

  if (interviewType === 'DSA_CODING') {
    const dsa = [
      "Let's look at the problem on your editor: 'Given an array of integers, find the contiguous subarray with the largest sum.' Before typing, explain your high-level approach.",
      "How would you approach finding the longest substring without repeating characters with an optimal time complexity?",
      "Given two sorted arrays, how would you merge them in-place with O(1) extra space?",
    ]
    return dsa[turnCount % dsa.length]
  }

  // Default: Resume Deep Dive
  if (params.resumeProjects && params.resumeProjects.length > 0) {
    const proj = params.resumeProjects[turnCount % params.resumeProjects.length]
    return `In your resume, you highlighted '${proj.title}'. Could you explain the end-to-end architecture and the single most difficult technical challenge you solved while building it?`
  }

  return "Could you walk me through the system architecture of the most technically complex project you have engineered to date?"
}
