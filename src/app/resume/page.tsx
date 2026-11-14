'use client'

import { useState, useEffect } from 'react'
import { UploadCloud, FileText, CheckCircle2, AlertCircle, Loader2, Code, Layers, Briefcase, GraduationCap } from 'lucide-react'

export default function ResumePage() {
  const [file, setFile] = useState<File | null>(null)
  const [pastedText, setPastedText] = useState('')
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload')
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState('')
  const [resumeData, setResumeData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetch('/api/resume/upload')
      .then((r) => (r.ok ? r.json() : { resume: null }))
      .then((data) => {
        if (data?.resume) setResumeData(data.resume)
        setIsLoading(false)
      })
      .catch(() => setIsLoading(false))
  }, [])

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsUploading(true)

    try {
      const formData = new FormData()
      if (activeTab === 'upload') {
        if (!file) {
          setError('Please select a PDF or document file to upload.')
          setIsUploading(false)
          return
        }
        formData.append('file', file)
      } else {
        if (!pastedText.trim() || pastedText.length < 50) {
          setError('Please paste a substantive resume text (at least 50 characters).')
          setIsUploading(false)
          return
        }
        formData.append('text', pastedText)
      }

      const res = await fetch('/api/resume/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to process resume.')
        setIsUploading(false)
        return
      }

      setResumeData(data.resume)
      setFile(null)
      setPastedText('')
      setIsUploading(false)
    } catch {
      setError('Network error during upload.')
      setIsUploading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-400" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 space-y-8">
      <div>
        <h1 className="font-sans text-2xl font-bold tracking-tight text-obsidian-50 sm:text-3xl">
          Placement Resume Context
        </h1>
        <p className="text-xs text-obsidian-400 mt-1">
          MockMate parses your real engineering projects, technical stack, and experiences so the interviewer can conduct deep, contextual architectural drills.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs text-rose-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Upload & Ingestion Box */}
      <div className="rounded-2xl border border-obsidian-700 bg-obsidian-850 p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-obsidian-800 pb-3">
          <h2 className="text-sm font-bold text-obsidian-50">Upload or Update Resume</h2>
          <div className="flex items-center gap-1 rounded-lg bg-obsidian-900 p-1 border border-obsidian-750">
            <button
              onClick={() => setActiveTab('upload')}
              className={`rounded-md px-3 py-1 text-xs font-semibold transition-colors ${
                activeTab === 'upload'
                  ? 'bg-brand-500 text-obsidian-950'
                  : 'text-obsidian-400 hover:text-obsidian-100'
              }`}
            >
              PDF Upload
            </button>
            <button
              onClick={() => setActiveTab('paste')}
              className={`rounded-md px-3 py-1 text-xs font-semibold transition-colors ${
                activeTab === 'paste'
                  ? 'bg-brand-500 text-obsidian-950'
                  : 'text-obsidian-400 hover:text-obsidian-100'
              }`}
            >
              Paste Text
            </button>
          </div>
        </div>

        <form onSubmit={handleUpload} className="space-y-4">
          {activeTab === 'upload' ? (
            <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-obsidian-700 bg-obsidian-900/60 p-8 text-center transition-colors hover:border-brand-500/50">
              <UploadCloud className="h-10 w-10 text-brand-400 mb-2" />
              <label className="cursor-pointer text-xs font-semibold text-brand-400 hover:text-brand-300">
                <span>Select PDF or text file</span>
                <input
                  type="file"
                  accept=".pdf,.txt,.doc,.docx"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
              </label>
              <p className="text-[11px] text-obsidian-400 mt-1">
                {file ? file.name : 'Upload your standard college placement resume (PDF)'}
              </p>
            </div>
          ) : (
            <textarea
              rows={6}
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              placeholder="Paste the raw text of your resume here..."
              className="w-full rounded-xl border border-obsidian-700 bg-obsidian-900 p-3.5 text-xs text-obsidian-50 placeholder-obsidian-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 font-mono leading-relaxed"
            />
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isUploading}
              className="flex items-center gap-2 rounded-xl bg-brand-500 px-5 py-2.5 text-xs font-semibold text-obsidian-950 transition-all hover:bg-brand-400 shadow-glow-brand disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Parsing Projects & Skills...</span>
                </>
              ) : (
                <>
                  <FileText className="h-3.5 w-3.5" />
                  <span>{resumeData ? 'Re-Parse & Save' : 'Parse Resume'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Extracted Resume Diagnostics */}
      {resumeData && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-obsidian-50 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>Parsed Candidate Profile</span>
            </h2>
            <span className="text-xs text-obsidian-400 font-mono">
              Indexed on {new Date(resumeData.createdAt).toLocaleDateString()}
            </span>
          </div>

          {/* Skills Grid */}
          <div className="rounded-xl border border-obsidian-700 bg-obsidian-850 p-5 space-y-3">
            <h3 className="text-xs font-bold text-obsidian-50 uppercase tracking-wider flex items-center gap-1.5 text-brand-400">
              <Code className="h-3.5 w-3.5" />
              <span>Extracted Technical Skills</span>
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {resumeData.parsedSkills?.map((skill: string, idx: number) => (
                <span
                  key={idx}
                  className="rounded-lg border border-obsidian-700 bg-obsidian-900 px-2.5 py-1 text-xs font-mono font-medium text-obsidian-200"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Parsed Projects */}
          <div className="rounded-xl border border-obsidian-700 bg-obsidian-850 p-5 space-y-4">
            <h3 className="text-xs font-bold text-obsidian-50 uppercase tracking-wider flex items-center gap-1.5 text-sky-400">
              <Layers className="h-3.5 w-3.5" />
              <span>Extracted Engineering Projects (Ready for Follow-ups)</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(resumeData.parsedProjects as any[])?.map((proj, idx) => (
                <div
                  key={idx}
                  className="rounded-lg border border-obsidian-750 bg-obsidian-900/60 p-4 space-y-2"
                >
                  <h4 className="font-semibold text-xs text-obsidian-50">{proj.title}</h4>
                  {proj.techStack && (
                    <div className="flex flex-wrap gap-1">
                      {proj.techStack.map((tech: string, tIdx: number) => (
                        <span
                          key={tIdx}
                          className="rounded bg-sky-500/10 px-1.5 py-0.5 text-[10px] font-mono text-sky-300 border border-sky-500/20"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                  <p className="text-[11px] text-obsidian-300 leading-relaxed">
                    {proj.description || proj.highlights?.[0]}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
