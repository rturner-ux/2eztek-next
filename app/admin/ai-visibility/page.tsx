'use client'

import { useState, useEffect, useCallback } from 'react'

type RunResult = {
  id: string
  prompt_id: string
  prompt: string
  category: string
  mentioned: boolean
  preferred: boolean
  response: string
}

type HistoryRun = {
  id: string
  score: number
  mentions: number
  total_prompts: number
  platform: string
  created_at: string
}

type GeneratedItem = { type: string; title?: string; question?: string }

const CATEGORY_COLORS: Record<string, string> = {
  local:      'text-cyan-400 bg-cyan-400/10',
  commercial: 'text-purple-400 bg-purple-400/10',
  brand:      'text-orange-400 bg-orange-400/10',
  branded:    'text-green-400 bg-green-400/10',
}

function ScoreGauge({ score }: { score: number }) {
  const label = score >= 75 ? 'Strong' : score >= 50 ? 'Moderate' : score >= 25 ? 'Low' : 'Dark'
  const color = score >= 75 ? '#22d3ee' : score >= 50 ? '#f59e0b' : score >= 25 ? '#f97316' : '#ef4444'
  const r = 70; const cx = 90; const cy = 90
  const circumference = Math.PI * r
  const offset = circumference - (score / 100) * circumference
  return (
    <div className="flex flex-col items-center">
      <svg width="180" height="110" viewBox="0 0 180 110">
        <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="14" strokeLinecap="round" />
        <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none" stroke={color} strokeWidth="14" strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1s ease' }} />
        <text x={cx} y={cy - 8} textAnchor="middle" fill="white" fontSize="32" fontWeight="900">{score}</text>
        <text x={cx} y={cy + 12} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="11">/ 100</text>
        <text x={cx} y={cy + 30} textAnchor="middle" fill={color} fontSize="14" fontWeight="700">{label}</text>
      </svg>
    </div>
  )
}

function OoRah({ score, mentions, total, onDone }: { score: number; mentions: number; total: number; onDone: () => void }) {
  useEffect(() => { const t = setTimeout(onDone, 3200); return () => clearTimeout(t) }, [onDone])
  const color = score >= 75 ? '#22d3ee' : score >= 50 ? '#f59e0b' : score >= 25 ? '#f97316' : '#ef4444'
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#050B14]/95 backdrop-blur-sm" onClick={onDone}>
      <p className="oorah-text text-[clamp(3rem,12vw,7rem)] font-black tracking-tighter text-white leading-none"
        style={{ textShadow: `0 0 80px ${color}, 0 0 160px ${color}44` }}>
        OO-RAH!
      </p>
      <p className="mt-4 text-xl font-black" style={{ color }}>{mentions} of {total} targets acquired</p>
      <p className="mt-2 text-slate-400 text-sm">Visibility Score: {score}/100</p>
      <p className="mt-8 text-xs text-slate-600">tap to continue</p>
    </div>
  )
}

function GeneratedBadge({ item }: { item: GeneratedItem }) {
  const isBlog = item.type === 'blog'
  const isSkipped = item.type === 'blog_skipped'
  const label = isBlog ? 'Blog draft saved' : isSkipped ? 'Blog already exists' : 'FAQ draft saved'
  const color = isSkipped ? 'text-slate-500 bg-white/5 border-white/10' : isBlog ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30' : 'text-blue-400 bg-blue-400/10 border-blue-400/30'
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-bold ${color}`}>
      {isBlog ? '📝' : isSkipped ? '⏭' : '❓'} {label}
      {(item.title || item.question) && (
        <span className="opacity-70 truncate max-w-[200px]">— {item.title ?? item.question}</span>
      )}
    </span>
  )
}

export default function AIVisibilityPage() {
  const [password, setPassword]     = useState('')
  const [authed, setAuthed]         = useState(false)
  const [running, setRunning]       = useState(false)
  const [history, setHistory]       = useState<HistoryRun[]>([])
  const [results, setResults]       = useState<RunResult[]>([])
  const [expanded, setExpanded]     = useState<string | null>(null)
  const [lastRun, setLastRun]       = useState<{ score: number; mentions: number; total: number } | null>(null)
  const [showOoRah, setShowOoRah]   = useState(false)

  // Content generation state
  const [generating, setGenerating]     = useState<Record<string, boolean>>({})
  const [generated, setGenerated]       = useState<Record<string, GeneratedItem[]>>({})
  const [bulkGenerating, setBulkGenerating] = useState(false)
  const [bulkDone, setBulkDone]         = useState<{ total: number; items: GeneratedItem[] } | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem('blogAdminPassword')
    if (stored) { setPassword(stored); setAuthed(true) }
  }, [])

  function login(e: React.FormEvent) {
    e.preventDefault()
    localStorage.setItem('blogAdminPassword', password)
    setAuthed(true)
  }

  const headers = useCallback(() => ({
    'Content-Type': 'application/json',
    'x-admin-password': password,
  }), [password])

  const loadHistory = useCallback(async () => {
    const res  = await fetch('/api/admin/ai-visibility', { headers: headers() })
    const data = await res.json()
    setHistory(data.runs ?? [])
    if (data.latestResults?.length) setResults(data.latestResults)
    if (data.runs?.[0]) {
      const r = data.runs[0]
      setLastRun({ score: r.score, mentions: r.mentions, total: r.total_prompts })
    }
  }, [headers])

  useEffect(() => { if (authed) loadHistory() }, [authed, loadHistory])

  async function runScan() {
    setRunning(true)
    const res  = await fetch('/api/admin/ai-visibility/run', { method: 'POST', headers: headers() })
    const data = await res.json()
    if (data.score !== undefined) {
      setLastRun({ score: data.score, mentions: data.mentions, total: data.total })
      setResults(data.results ?? [])
      await loadHistory()
      setShowOoRah(true)
    }
    setRunning(false)
  }

  async function generateContent(r: RunResult) {
    setGenerating((prev) => ({ ...prev, [r.prompt_id]: true }))
    setExpanded(r.prompt_id)
    try {
      const res  = await fetch('/api/admin/ai-visibility/content-generate', {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({
          prompt: r.prompt,
          category: r.category,
          response: r.response,
          mentioned: r.mentioned,
          preferred: r.preferred,
          result_id: r.id,
        }),
      })
      const data = await res.json()
      if (data.created) {
        setGenerated((prev) => ({ ...prev, [r.prompt_id]: data.created }))
      }
    } finally {
      setGenerating((prev) => ({ ...prev, [r.prompt_id]: false }))
    }
  }

  async function generateAllGaps() {
    const gaps = results.filter((r) => !r.preferred)
    if (!gaps.length) return
    setBulkGenerating(true)
    setBulkDone(null)
    const allCreated: GeneratedItem[] = []
    for (const r of gaps) {
      try {
        const res  = await fetch('/api/admin/ai-visibility/content-generate', {
          method: 'POST',
          headers: headers(),
          body: JSON.stringify({
            prompt: r.prompt,
            category: r.category,
            response: r.response,
            mentioned: r.mentioned,
            preferred: r.preferred,
            result_id: r.id,
          }),
        })
        const data = await res.json()
        if (data.created) {
          allCreated.push(...data.created)
          setGenerated((prev) => ({ ...prev, [r.prompt_id]: data.created }))
        }
      } catch {
        // continue on single failure
      }
    }
    setBulkGenerating(false)
    setBulkDone({ total: gaps.length, items: allCreated })
  }

  const mentionedCount  = results.filter((r) => r.mentioned).length
  const preferredCount  = results.filter((r) => r.preferred).length
  const gapCount        = results.filter((r) => !r.preferred).length
  const score           = lastRun?.score ?? history[0]?.score ?? 0
  const delta           = history.length >= 2 ? history[0].score - history[1].score : null

  if (!authed) {
    return (
      <div className="min-h-screen bg-[#050B14] flex items-center justify-center p-6">
        <form onSubmit={login} className="w-full max-w-sm space-y-4">
          <h1 className="text-2xl font-black text-white">PHANTOM</h1>
          <p className="text-sm text-slate-400">AI Visibility Intelligence</p>
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
      {showOoRah && lastRun && (
        <OoRah score={lastRun.score} mentions={lastRun.mentions} total={lastRun.total} onDone={() => setShowOoRah(false)} />
      )}
      <div className="mx-auto max-w-7xl px-6 py-8">

        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-0.5 text-xs font-black tracking-widest text-cyan-400">PHANTOM</span>
              <span className="text-xs text-slate-500">AI Visibility</span>
            </div>
            <h1 className="text-3xl font-black text-white">AI Visibility Intel</h1>
            <p className="mt-1 text-sm text-slate-400">How often does 2EZ TEK appear when people ask AI about fitness equipment repair?</p>
          </div>
          <button onClick={runScan} disabled={running}
            className="rounded-2xl bg-cyan-400 px-8 py-3 font-black text-black disabled:opacity-50 hover:bg-cyan-300 transition flex items-center gap-2">
            {running ? (
              <><span className="h-4 w-4 rounded-full border-2 border-black/30 border-t-black animate-spin" />Running 12 Probes...</>
            ) : 'Run PHANTOM Scan'}
          </button>
        </div>

        {/* Score cards */}
        <div className="grid gap-5 mb-8 lg:grid-cols-4">
          <div className="lg:col-span-1 rounded-2xl border border-white/10 bg-white/5 p-6 flex flex-col items-center">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">AI Visibility Score</p>
            <ScoreGauge score={score} />
            {delta !== null && (
              <p className={`mt-3 text-sm font-bold ${delta >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {delta >= 0 ? '▲' : '▼'} {Math.abs(delta)} pts vs last scan
              </p>
            )}
            <p className="mt-2 text-xs text-slate-500 text-center">
              {score >= 75 ? 'Frequently mentioned by AI' : score >= 50 ? 'Moderately visible to AI' : score >= 25 ? 'Low AI visibility — needs content' : 'Not yet on AI radar'}
            </p>
          </div>
          <div className="lg:col-span-3 grid grid-cols-3 gap-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Mentions</p>
              <p className="text-4xl font-black text-white">{mentionedCount || lastRun?.mentions || '—'}</p>
              <p className="text-sm text-slate-500 mt-1">of {results.length || lastRun?.total || 12} probes</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Preferred</p>
              <p className="text-4xl font-black text-cyan-400">{preferredCount || '—'}</p>
              <p className="text-sm text-slate-500 mt-1">actively recommended</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Scans Run</p>
              <p className="text-4xl font-black text-white">{history.length}</p>
              <p className="text-sm text-slate-500 mt-1">
                {history[0] ? new Date(history[0].created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'No scans yet'}
              </p>
            </div>
          </div>
        </div>

        {/* History sparkline */}
        {history.length > 1 && (
          <div className="mb-8 rounded-2xl border border-white/10 bg-white/5 p-6">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Score History</p>
            <div className="flex items-end gap-2 h-20">
              {[...history].reverse().map((run, i) => {
                const h = Math.max(8, (run.score / 100) * 80)
                const color = run.score >= 75 ? '#22d3ee' : run.score >= 50 ? '#f59e0b' : run.score >= 25 ? '#f97316' : '#ef4444'
                return (
                  <div key={run.id} className="flex-1 flex flex-col items-center gap-1">
                    <div style={{ height: h, backgroundColor: color, opacity: i === history.length - 1 ? 1 : 0.5 }} className="w-full rounded-t-md transition-all" />
                    <span className="text-[9px] text-slate-600">{new Date(run.created_at).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' })}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Bulk generate banner */}
        {bulkDone && (
          <div className="mb-6 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="font-black text-emerald-400">Content mission complete — {bulkDone.items.filter(i => i.type !== 'blog_skipped').length} pieces generated from {bulkDone.total} probes</p>
              <button onClick={() => setBulkDone(null)} className="text-xs text-slate-500 hover:text-white">dismiss</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {bulkDone.items.map((item, i) => <GeneratedBadge key={i} item={item} />)}
            </div>
            <p className="mt-3 text-xs text-slate-400">Blog drafts saved as unpublished — review and publish in <a href="/admin/blog" className="text-cyan-400 underline">COMMS</a>. FAQs saved as inactive — activate in the <a href="/admin/faqs" className="text-cyan-400 underline">FAQ manager</a>.</p>
          </div>
        )}

        {/* Prompt breakdown */}
        {results.length > 0 && (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Probe Breakdown</p>
              {gapCount > 0 && (
                <button
                  onClick={generateAllGaps}
                  disabled={bulkGenerating}
                  className="flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2 text-xs font-black text-white hover:bg-emerald-400 transition disabled:opacity-50">
                  {bulkGenerating ? (
                    <><span className="h-3.5 w-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />Generating {gapCount} pieces...</>
                  ) : (
                    <>⚡ Generate Content for All {gapCount} Gaps</>
                  )}
                </button>
              )}
            </div>

            <div className="space-y-2">
              {results.map((r) => {
                const isGap  = !r.preferred
                const isGenerating = generating[r.prompt_id]
                const genItems     = generated[r.prompt_id]

                return (
                  <div key={r.prompt_id}>
                    <button onClick={() => setExpanded(expanded === r.prompt_id ? null : r.prompt_id)}
                      className="w-full text-left flex items-center gap-3 rounded-xl p-4 border border-white/5 hover:border-white/15 transition">
                      <span className={`h-3 w-3 rounded-full flex-shrink-0 ${r.mentioned ? r.preferred ? 'bg-cyan-400' : 'bg-green-400' : 'bg-slate-600'}`} />
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${CATEGORY_COLORS[r.category] ?? 'text-slate-400 bg-white/5'}`}>
                        {r.category}
                      </span>
                      <p className="flex-1 text-sm text-slate-300 text-left truncate">{r.prompt}</p>
                      {genItems && <span className="shrink-0 text-[10px] font-black text-emerald-400">✓ CONTENT CREATED</span>}
                      <span className={`shrink-0 text-xs font-black ${r.mentioned ? r.preferred ? 'text-cyan-400' : 'text-green-400' : 'text-slate-600'}`}>
                        {r.mentioned ? r.preferred ? 'PREFERRED' : 'MENTIONED' : 'MISSING'}
                      </span>
                      <span className="text-slate-600 text-xs">{expanded === r.prompt_id ? '▲' : '▼'}</span>
                    </button>

                    {expanded === r.prompt_id && (
                      <div className="mx-4 mb-2 rounded-b-xl border border-t-0 border-white/5 bg-black/20 p-5 space-y-4">
                        {/* AI Response */}
                        {r.response && (
                          <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">AI Response</p>
                            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{r.response}</p>
                          </div>
                        )}

                        {/* Content actions */}
                        {isGap && (
                          <div className="border-t border-white/5 pt-4">
                            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                              {r.mentioned ? 'Mentioned but not leading — generate reinforcing content' : 'Missing from AI response — generate targeted content'}
                            </p>

                            {genItems ? (
                              <div className="space-y-2">
                                <p className="text-xs font-black text-emerald-400 mb-2">Content generated:</p>
                                <div className="flex flex-wrap gap-2">
                                  {genItems.map((item, i) => <GeneratedBadge key={i} item={item} />)}
                                </div>
                              </div>
                            ) : (
                              <button
                                onClick={() => generateContent(r)}
                                disabled={isGenerating || bulkGenerating}
                                className="flex items-center gap-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 px-5 py-2.5 text-sm font-black text-emerald-400 hover:bg-emerald-500/30 transition disabled:opacity-50">
                                {isGenerating ? (
                                  <><span className="h-4 w-4 rounded-full border-2 border-emerald-400/30 border-t-emerald-400 animate-spin" />Generating content...</>
                                ) : (
                                  <>⚡ Generate {r.category === 'brand' || r.category === 'commercial' ? 'Blog Post' : r.category === 'branded' ? 'FAQ Entry' : 'Blog + FAQ'} from this probe</>
                                )}
                              </button>
                            )}
                          </div>
                        )}

                        {r.preferred && (
                          <div className="border-t border-white/5 pt-4">
                            <p className="text-xs font-black text-cyan-400">PREFERRED — 2EZ TEK is the AI recommendation for this query. No action needed.</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Legend */}
            <div className="mt-5 flex flex-wrap gap-4 border-t border-white/5 pt-4">
              <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-cyan-400" /><span className="text-xs text-slate-400">Preferred — AI actively recommends 2EZ TEK</span></div>
              <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-green-400" /><span className="text-xs text-slate-400">Mentioned — 2EZ TEK appears in response</span></div>
              <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-slate-600" /><span className="text-xs text-slate-400">Missing — not in AI response</span></div>
              <div className="flex items-center gap-2"><span className="text-emerald-400 text-xs">✓</span><span className="text-xs text-slate-400">Content created from this probe</span></div>
            </div>
          </div>
        )}

        {/* Empty state */}
        {results.length === 0 && !running && (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-16 text-center">
            <p className="text-4xl mb-4">🎯</p>
            <h2 className="text-xl font-black text-white">No scan data yet</h2>
            <p className="mt-2 text-slate-400">Run your first PHANTOM scan to see how visible 2EZ TEK is across AI platforms.</p>
            <button onClick={runScan} disabled={running}
              className="mt-6 rounded-2xl bg-cyan-400 px-8 py-3 font-black text-black disabled:opacity-50 hover:bg-cyan-300 transition">
              Run First Scan
            </button>
          </div>
        )}

        {running && (
          <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/5 p-10 text-center">
            <div className="mx-auto mb-4 h-10 w-10 rounded-full border-2 border-cyan-400/30 border-t-cyan-400 animate-spin" />
            <p className="font-black text-white">Probing AI systems...</p>
            <p className="mt-1 text-sm text-slate-400">Sending 12 prompts to Claude — analyzing which queries mention 2EZ TEK</p>
          </div>
        )}

      </div>
    </div>
  )
}
