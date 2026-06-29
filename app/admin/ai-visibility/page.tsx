'use client'

import { useState, useEffect, useCallback } from 'react'

type RunResult = {
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

const CATEGORY_COLORS: Record<string, string> = {
  local:      'text-cyan-400 bg-cyan-400/10',
  commercial: 'text-purple-400 bg-purple-400/10',
  brand:      'text-orange-400 bg-orange-400/10',
  branded:    'text-green-400 bg-green-400/10',
}

function ScoreGauge({ score }: { score: number }) {
  const label = score >= 75 ? 'Strong' : score >= 50 ? 'Moderate' : score >= 25 ? 'Low' : 'Dark'
  const color = score >= 75 ? '#22d3ee' : score >= 50 ? '#f59e0b' : score >= 25 ? '#f97316' : '#ef4444'

  // SVG semicircle gauge
  const r = 70
  const cx = 90
  const cy = 90
  const circumference = Math.PI * r  // half circle
  const offset = circumference - (score / 100) * circumference

  return (
    <div className="flex flex-col items-center">
      <svg width="180" height="110" viewBox="0 0 180 110">
        {/* Track */}
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="14" strokeLinecap="round"
        />
        {/* Fill */}
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none" stroke={color} strokeWidth="14" strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
        {/* Score text */}
        <text x={cx} y={cy - 8} textAnchor="middle" fill="white" fontSize="32" fontWeight="900">
          {score}
        </text>
        <text x={cx} y={cy + 12} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="11">
          / 100
        </text>
        <text x={cx} y={cy + 30} textAnchor="middle" fill={color} fontSize="14" fontWeight="700">
          {label}
        </text>
      </svg>
    </div>
  )
}

export default function AIVisibilityPage() {
  const [password, setPassword] = useState('')
  const [authed, setAuthed]     = useState(false)
  const [running, setRunning]   = useState(false)
  const [history, setHistory]   = useState<HistoryRun[]>([])
  const [results, setResults]   = useState<RunResult[]>([])
  const [expanded, setExpanded] = useState<string | null>(null)
  const [lastRun, setLastRun]   = useState<{ score: number; mentions: number; total: number } | null>(null)

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
    }
    setRunning(false)
  }

  const mentionedCount  = results.filter((r) => r.mentioned).length
  const preferredCount  = results.filter((r) => r.preferred).length
  const score           = lastRun?.score ?? history[0]?.score ?? 0

  const delta = history.length >= 2 ? history[0].score - history[1].score : null

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
              <>
                <span className="h-4 w-4 rounded-full border-2 border-black/30 border-t-black animate-spin" />
                Running 12 Probes...
              </>
            ) : 'Run PHANTOM Scan'}
          </button>
        </div>

        {/* Score cards */}
        <div className="grid gap-5 mb-8 lg:grid-cols-4">

          {/* Gauge */}
          <div className="lg:col-span-1 rounded-2xl border border-white/10 bg-white/5 p-6 flex flex-col items-center">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">AI Visibility Score</p>
            <ScoreGauge score={score} />
            {delta !== null && (
              <p className={`mt-3 text-sm font-bold ${delta >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {delta >= 0 ? '▲' : '▼'} {Math.abs(delta)} pts vs last scan
              </p>
            )}
            <p className="mt-2 text-xs text-slate-500">
              {score >= 75 ? 'Frequently mentioned by AI' : score >= 50 ? 'Moderately visible to AI' : score >= 25 ? 'Low AI visibility — needs content' : 'Not yet on AI radar'}
            </p>
          </div>

          {/* Stats */}
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
                    <div style={{ height: h, backgroundColor: color, opacity: i === history.length - 1 ? 1 : 0.5 }}
                      className="w-full rounded-t-md transition-all" />
                    <span className="text-[9px] text-slate-600">
                      {new Date(run.created_at).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' })}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Prompt breakdown */}
        {results.length > 0 && (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Probe Breakdown</p>
            <div className="space-y-2">
              {results.map((r) => (
                <div key={r.prompt_id}>
                  <button onClick={() => setExpanded(expanded === r.prompt_id ? null : r.prompt_id)}
                    className="w-full text-left flex items-center gap-3 rounded-xl p-4 border border-white/5 hover:border-white/15 transition">
                    {/* Status indicator */}
                    <span className={`h-3 w-3 rounded-full flex-shrink-0 ${r.mentioned ? r.preferred ? 'bg-cyan-400' : 'bg-green-400' : 'bg-slate-600'}`} />

                    {/* Category */}
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${CATEGORY_COLORS[r.category] ?? 'text-slate-400 bg-white/5'}`}>
                      {r.category}
                    </span>

                    {/* Prompt */}
                    <p className="flex-1 text-sm text-slate-300 text-left truncate">{r.prompt}</p>

                    {/* Result badge */}
                    <span className={`shrink-0 text-xs font-black ${r.mentioned ? r.preferred ? 'text-cyan-400' : 'text-green-400' : 'text-slate-600'}`}>
                      {r.mentioned ? r.preferred ? 'PREFERRED' : 'MENTIONED' : 'MISSING'}
                    </span>

                    <span className="text-slate-600 text-xs">{expanded === r.prompt_id ? '▲' : '▼'}</span>
                  </button>

                  {expanded === r.prompt_id && r.response && (
                    <div className="mx-4 mb-2 rounded-b-xl border border-t-0 border-white/5 bg-black/20 p-4">
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">AI Response</p>
                      <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{r.response}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="mt-5 flex flex-wrap gap-4 border-t border-white/5 pt-4">
              <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-cyan-400" /><span className="text-xs text-slate-400">Preferred — AI actively recommends 2EZ TEK</span></div>
              <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-green-400" /><span className="text-xs text-slate-400">Mentioned — 2EZ TEK appears in response</span></div>
              <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-slate-600" /><span className="text-xs text-slate-400">Missing — not in AI response</span></div>
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
