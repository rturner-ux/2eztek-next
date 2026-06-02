'use client'

import { useState, useRef, useEffect } from 'react'

type Message = { role: 'user' | 'assistant'; content: string }

const SUGGESTED = [
  'What does this error code mean?',
  'How do I lubricate the belt?',
  'Why is the treadmill making a noise?',
  'Console is not turning on — what should I check?',
]

export default function ManualQA({ slug, brand, modelName }: { slug: string; brand: string; modelName: string }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [listening, setListening] = useState(false)
  const [voiceSupported, setVoiceSupported] = useState(false)
  const recognitionRef = useRef<any>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setVoiceSupported(
      typeof window !== 'undefined' &&
      ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)
    )
  }, [])

  function toggleVoice() {
    if (listening) {
      recognitionRef.current?.stop()
      setListening(false)
      return
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) return
    const recognition = new SpeechRecognition()
    recognition.lang = 'en-US'
    recognition.interimResults = true
    recognition.maxAlternatives = 1
    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((r: any) => r[0].transcript)
        .join('')
      setInput(transcript)
    }
    recognition.onend = () => setListening(false)
    recognition.onerror = () => setListening(false)
    recognitionRef.current = recognition
    recognition.start()
    setListening(true)
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function ask(question: string) {
    if (!question.trim() || loading) return
    const userMsg: Message = { role: 'user', content: question.trim() }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/ai/manual-qa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, question: question.trim(), history: messages }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.message)
      setMessages((prev) => [...prev, { role: 'assistant', content: data.answer }])
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.')
      setMessages((prev) => prev.slice(0, -1))
    } finally {
      setLoading(false)
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    ask(input)
  }

  return (
    <div className="rounded-[2rem] border border-cyan-400/20 bg-cyan-400/[0.04] p-6 md:p-8">
      <div className="mb-2 text-sm font-black uppercase tracking-[0.25em] text-cyan-300">
        AI Q&amp;A
      </div>
      <h2 className="text-3xl font-black md:text-4xl">
        Ask About Your {brand} {modelName}
      </h2>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/55">
        Ask any question about this equipment — error codes, belt slipping, console issues, maintenance — and our AI technician will help.
      </p>

      {/* Suggested questions */}
      {messages.length === 0 && (
        <div className="mt-5 flex flex-wrap gap-2">
          {SUGGESTED.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => ask(q)}
              disabled={loading}
              className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-2 text-xs font-bold text-white/60 transition hover:border-cyan-400/30 hover:bg-cyan-400/[0.06] hover:text-white/80 disabled:opacity-40"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Conversation */}
      {messages.length > 0 && (
        <div className="mt-5 max-h-[400px] space-y-4 overflow-y-auto pr-1">
          {messages.map((m, i) => (
            <div key={i} className={m.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
              <div
                className={
                  m.role === 'user'
                    ? 'max-w-[80%] rounded-3xl rounded-br-lg bg-cyan-400 px-5 py-3 text-sm font-bold text-black'
                    : 'max-w-[85%] rounded-3xl rounded-bl-lg border border-white/10 bg-white/[0.06] px-5 py-4 text-sm leading-relaxed text-white/80'
                }
              >
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="flex items-center gap-2 rounded-3xl rounded-bl-lg border border-white/10 bg-white/[0.06] px-5 py-4">
                <span className="inline-flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="block h-1.5 w-1.5 animate-bounce rounded-full bg-cyan-400"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </span>
                <span className="text-xs text-white/40">Analyzing…</span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="mt-5 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={listening ? 'Listening…' : `Ask about your ${brand} ${modelName}…`}
          disabled={loading}
          className={`flex-1 rounded-2xl border bg-white/[0.05] px-5 py-4 text-sm text-white outline-none placeholder:text-white/30 disabled:opacity-50 transition ${listening ? 'border-red-400/50 placeholder:text-red-300/60' : 'border-white/10 focus:border-cyan-400/50'}`}
        />
        {voiceSupported && (
          <button
            type="button"
            onClick={toggleVoice}
            title={listening ? 'Stop listening' : 'Speak your question'}
            className={`rounded-2xl border px-4 py-4 text-sm transition ${listening ? 'border-red-400/40 bg-red-400/10 text-red-400' : 'border-white/10 bg-white/5 text-white/50 hover:border-cyan-400/30 hover:text-white/80'}`}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </button>
        )}
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="rounded-2xl bg-cyan-400 px-6 py-4 text-sm font-black text-black transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Ask
        </button>
      </form>

      <p className="mt-3 text-[11px] text-white/30">
        AI responses are general guidance. For confirmed issues, call 2EZ TEK at (972) 807-7232.
      </p>
    </div>
  )
}
