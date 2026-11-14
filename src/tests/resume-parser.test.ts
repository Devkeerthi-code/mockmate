import { parseResumeText, extractSkillsFromText, extractProjectsFromText } from '../lib/resume-parser'

export async function runResumeParserTests() {
  console.log('🧪 Testing Resume Parser...')

  const sampleResume = `
ADITYA VERMA
Email: aditya@example.com | Phone: +91 9876543210
GitHub: github.com/aditya-sample | LinkedIn: linkedin.com/in/aditya-sample

EDUCATION
B.Tech in Computer Science and Engineering - 2025
Indian Institute of Technology | CGPA: 8.7/10

TECHNICAL SKILLS
Languages: C++, Java, Python, JavaScript, TypeScript
Web & Backend: React, Next.js, Node.js, Express, Tailwind CSS
Databases & Cloud: PostgreSQL, MongoDB, Redis, Docker, AWS
Core CS: Data Structures, Algorithms, DBMS, Operating Systems, Computer Networks

PROJECTS
Distributed Task Queue | Redis, Node.js, TypeScript, Docker
• Architected an asynchronous task processing engine using Redis Streams and BullMQ
• Implemented sliding-window rate limiting and exponential backoff retry policies
• Reduced p95 job processing latency by 35% under 10,000 concurrent payload bursts

Campus Placement Portal | React, Next.js, PostgreSQL, Prisma
• Engineered full-stack recruitment portal supporting 1,500 active campus students
• Designed normalized relational schema with indexing on student eligibility filters
• Integrated role-based access control and automated resume verification pipelines

WORK EXPERIENCE
Software Engineer Intern | CloudTech Solutions (May 2024 - July 2024)
• Built RESTful microservices in Go and PostgreSQL for automated compliance checks
• Optimized database queries cutting execution time from 1.2s to 180ms
  `

  // Test 1: Extract Skills
  const skills = extractSkillsFromText(sampleResume)
  if (!skills.includes('TypeScript') || !skills.includes('PostgreSQL') || !skills.includes('Redis')) {
    throw new Error(`Failed to extract core skills. Got: ${JSON.stringify(skills)}`)
  }
  console.log('  ✅ Extracted core skills correctly:', skills.slice(0, 6).join(', '))

  // Test 2: Extract Projects
  const projects = extractProjectsFromText(sampleResume)
  if (projects.length < 2) {
    throw new Error(`Expected at least 2 parsed projects, got: ${projects.length}`)
  }
  if (!projects[0].title.toLowerCase().includes('task queue') && !projects[0].title.toLowerCase().includes('distributed')) {
    throw new Error(`Project title parsing inaccurate: ${projects[0].title}`)
  }
  console.log('  ✅ Parsed structured projects:', projects.map((p) => p.title).join(', '))

  // Test 3: Full Resume Parse Object
  const fullResult = parseResumeText(sampleResume)
  if (!fullResult.education || !fullResult.education.gradYear.includes('2025')) {
    throw new Error(`Education parsing failed: ${JSON.stringify(fullResult.education)}`)
  }
  console.log('  ✅ Education and complete resume schema validated successfully.')
  return true
}
