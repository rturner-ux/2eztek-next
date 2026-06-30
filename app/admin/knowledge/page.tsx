'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

type QAPair = { question: string; answer: string; topic: string }
type CreatedItem = { type: string; title?: string; question?: string; id: string }
type ImportResult = { input: string; created: CreatedItem[] }

const NCFET_STARTER: QAPair[] = [
  {
    topic: 'Electrical Safety',
    question: 'What is the primary function of a GFCI (Ground Fault Circuit Interrupter) outlet?',
    answer: 'To protect against electrical shock by interrupting the circuit when a ground fault is detected.',
  },
  {
    topic: 'Electrical Safety',
    question: 'What is the primary function of a circuit breaker in a fitness machine\'s power supply?',
    answer: 'To protect the circuit from overcurrent and short circuits.',
  },
  {
    topic: 'Electrical Diagnostics',
    question: 'What does an ohm setting on a digital multimeter (DMM) measure?',
    answer: 'Electrical resistance, which is critical for checking continuity and testing for shorts in motor wiring.',
  },
  {
    topic: 'Mechanical Diagnostics',
    question: 'If a treadmill belt is slipping during a workout, what is the most likely first step?',
    answer: 'Adjust and tension the rear roller or drive belt per the manufacturer\'s specifications.',
  },
  {
    topic: 'Preventive Maintenance',
    question: 'Why are preventative maintenance (PM) protocols essential on cardio equipment?',
    answer: 'To prevent premature component wear, detect unsafe conditions, and eliminate sudden equipment failures.',
  },
  {
    topic: 'Safety Protocol',
    question: 'What is the recommended safety protocol before opening the motor hood of a treadmill?',
    answer: 'Ensure the machine is completely powered off and unplugged from the wall outlet.',
  },
  {
    topic: 'Professional Practice',
    question: 'Why should a technician comprehensively document parts used and time spent on a repair?',
    answer: 'To maintain warranty compliance, ensure proper billing, and provide accurate equipment history logs.',
  },
]

function ItemBadge({ item }: { item: CreatedItem }) {
  const isBlog    = item.type === 'blog'
  const isSkipped = item.type === 'blog_skipped'
  const color = isSkipped
    ? 'text-slate-500 bg-white/5 border-white/10'
    : isBlog
    ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30'
    : 'text-blue-400 bg-blue-400/10 border-blue-400/30'
  const label = isBlog ? 'Blog draft' : isSkipped ? 'Blog skipped (exists)' : 'FAQ draft'
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-bold ${color}`}>
      {isBlog ? '📝' : isSkipped ? '⏭' : '❓'} {label}
    </span>
  )
}

export default function KnowledgePage() {
  const [password, setPassword] = useState('')
  const [authed, setAuthed]     = useState(false)
  const [pairs, setPairs]       = useState<QAPair[]>(NCFET_STARTER)
  const [mode, setMode]         = useState<'both' | 'blog' | 'faq'>('both')
  const [running, setRunning]   = useState(false)
  const [results, setResults]   = useState<ImportResult[] | null>(null)
  const [totalCreated, setTotalCreated] = useState(0)
  const [rawInput, setRawInput] = useState('')
  const [parseError, setParseError] = useState('')

  useEffect(() => {
    const stored = localStorage.getItem('blogAdminPassword')
    if (stored) { setPassword(stored); setAuthed(true) }
  }, [])

  function login(e: React.FormEvent) {
    e.preventDefault()
    localStorage.setItem('blogAdminPassword', password)
    setAuthed(true)
  }

  function updatePair(i: number, field: keyof QAPair, value: string) {
    setPairs((prev) => prev.map((p, idx) => idx === i ? { ...p, [field]: value } : p))
  }

  function addPair() {
    setPairs((prev) => [...prev, { topic: '', question: '', answer: '' }])
  }

  function removePair(i: number) {
    setPairs((prev) => prev.filter((_, idx) => idx !== i))
  }

  function parseRaw() {
    setParseError('')
    // Try to parse "Q: ... A: ..." or "Question: ... Answer: ..." format
    const lines = rawInput.split('\n').map((l) => l.trim()).filter(Boolean)
    const parsed: QAPair[] = []
    let current: Partial<QAPair> = {}

    for (const line of lines) {
      const qMatch = line.match(/^(?:Q(?:uestion)?[:.]?\s*)(.*)/i)
      const aMatch = line.match(/^(?:A(?:nswer)?[:.]?\s*)(.*)/i)
      const tMatch = line.match(/^(?:Topic[:.]?\s*)(.*)/i)

      if (tMatch) { current.topic = tMatch[1] }
      else if (qMatch) {
        if (current.question && current.answer) {
          parsed.push({ topic: current.topic || '', question: current.question, answer: current.answer })
        }
        current = { topic: current.topic || '', question: qMatch[1] }
      } else if (aMatch) {
        current.answer = aMatch[1]
      }
    }
    if (current.question && current.answer) {
      parsed.push({ topic: current.topic || '', question: current.question, answer: current.answer })
    }

    if (!parsed.length) {
      setParseError('Could not parse Q&A pairs. Use "Question: ... Answer: ..." format, one per block.')
      return
    }
    setPairs((prev) => [...prev, ...parsed])
    setRawInput('')
  }

  async function runImport() {
    setRunning(true)
    setResults(null)
    const valid = pairs.filter((p) => p.question.trim() && p.answer.trim())
    const res = await fetch('/api/admin/knowledge/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
      body: JSON.stringify({ pairs: valid, mode }),
    })
    const data = await res.json()
    setResults(data.results ?? [])
    setTotalCreated(data.totalCreated ?? 0)
    setRunning(false)
  }

  if (!authed) {
    return (
      <div className="min-h-screen bg-[#050B14] flex items-center justify-center p-6">
        <form onSubmit={login} className="w-full max-w-sm space-y-4">
          <h1 className="text-2xl font-black text-white">CODEX</h1>
          <p className="text-sm text-slate-400">Knowledge Base Import</p>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
            placeholder="Admin password"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-cyan-400" />
          <button type="submit" className="w-full rounded-xl bg-cyan-400 py-3 font-black text-black">Enter</button>
        </form>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#050B14] text-white">
      <div className="mx-auto max-w-5xl px-6 py-8">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <span className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-0.5 text-xs font-black tracking-widest text-cyan-400">CODEX</span>
            <span className="text-xs text-slate-500">Knowledge Import</span>
          </div>
          <h1 className="text-3xl font-black">Knowledge Base Import</h1>
          <p className="mt-1 text-sm text-slate-400">Turn technical Q&A pairs into blog posts and FAQ entries. NCFET exam topics, field knowledge, anything you know — published as authoritative content.</p>
        </div>

        {/* Success banner */}
        {results && (
          <div className="mb-8 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 p-6">
            <p className="font-black text-emerald-400 mb-3">
              {totalCreated} pieces generated from {results.length} Q&A pairs
            </p>
            <div className="space-y-3">
              {results.map((r, i) => (
                <div key={i} className="text-sm">
                  <p className="text-slate-400 mb-1 truncate">{r.input}</p>
                  <div className="flex flex-wrap gap-2">
                    {r.created.map((item, j) => <ItemBadge key={j} item={item} />)}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex gap-4 text-xs">
              <Link href="/admin/blog" className="text-cyan-400 underline">Review blog drafts in COMMS</Link>
              <Link href="/admin/faqs" className="text-cyan-400 underline">Activate FAQs in FAQ manager</Link>
            </div>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-3">

          {/* Controls */}
          <div className="lg:col-span-1 space-y-5">

            {/* Mode selector */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="text-xs font-black tracking-widest text-slate-400 mb-4">GENERATE</p>
              {(['both', 'blog', 'faq'] as const).map((m) => (
                <label key={m} className="flex items-center gap-3 mb-3 cursor-pointer">
                  <input type="radio" name="mode" value={m} checked={mode === m} onChange={() => setMode(m)}
                    className="accent-cyan-400" />
                  <span className="text-sm font-bold capitalize">
                    {m === 'both' ? 'Blog + FAQ (recommended)' : m === 'blog' ? 'Blog posts only' : 'FAQ entries only'}
                  </span>
                </label>
              ))}
            </div>

            {/* Paste raw Q&A */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="text-xs font-black tracking-widest text-slate-400 mb-3">PASTE RAW Q&A</p>
              <p className="text-xs text-slate-500 mb-3">Paste "Question: ... Answer: ..." blocks and click Parse to add them to the list.</p>
              <textarea
                value={rawInput}
                onChange={(e) => setRawInput(e.target.value)}
                rows={6}
                placeholder={"Question: Why does my treadmill trip the GFCI?\nAnswer: Ground fault detected in the motor or wiring."}
                className="w-full rounded-xl border border-white/10 bg-black/30 p-3 text-xs text-slate-300 outline-none focus:border-cyan-400 font-mono resize-none"
              />
              {parseError && <p className="text-xs text-red-400 mt-1">{parseError}</p>}
              <button onClick={parseRaw} disabled={!rawInput.trim()}
                className="mt-3 w-full rounded-xl border border-white/15 py-2 text-xs font-black text-slate-300 hover:text-white hover:border-white/30 transition disabled:opacity-40">
                Parse &amp; Add to List
              </button>
            </div>

            {/* Run button */}
            <button onClick={runImport} disabled={running || pairs.filter(p => p.question && p.answer).length === 0}
              className="w-full rounded-2xl bg-emerald-500 py-4 font-black text-white hover:bg-emerald-400 transition disabled:opacity-50 flex items-center justify-center gap-2">
              {running ? (
                <><span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />Generating {pairs.filter(p => p.question && p.answer).length} pairs...</>
              ) : (
                <>⚡ Generate {pairs.filter(p => p.question && p.answer).length} Q&A Pairs</>
              )}
            </button>
          </div>

          {/* Q&A list */}
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-black tracking-widest text-slate-400">Q&A PAIRS ({pairs.length})</p>
              <button onClick={addPair} className="rounded-xl border border-white/15 px-4 py-1.5 text-xs font-black text-slate-400 hover:text-white hover:border-white/30 transition">
                + Add Pair
              </button>
            </div>

            {pairs.map((pair, i) => (
              <div key={i} className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <input
                    value={pair.topic}
                    onChange={(e) => updatePair(i, 'topic', e.target.value)}
                    placeholder="Topic (e.g. Electrical Safety)"
                    className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-cyan-400 font-bold outline-none focus:border-cyan-400/50 placeholder:text-slate-600"
                  />
                  <button onClick={() => removePair(i)} className="ml-3 text-slate-600 hover:text-red-400 transition text-xs font-bold">remove</button>
                </div>
                <textarea
                  value={pair.question}
                  onChange={(e) => updatePair(i, 'question', e.target.value)}
                  rows={2}
                  placeholder="Question..."
                  className="w-full rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-white outline-none focus:border-white/25 resize-none placeholder:text-slate-600"
                />
                <textarea
                  value={pair.answer}
                  onChange={(e) => updatePair(i, 'answer', e.target.value)}
                  rows={2}
                  placeholder="Answer..."
                  className="w-full rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-slate-300 outline-none focus:border-white/25 resize-none placeholder:text-slate-600"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
