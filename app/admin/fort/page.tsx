'use client'

import { useState, useEffect, useCallback } from 'react'

type Incident = {
  id: string
  ip: string
  user_agent: string
  path: string
  method: string
  query: string
  threat_type: string
  severity: string
  detail: string
  blocked: boolean
  created_at: string
}

type TopIP = { ip: string; count: number; severity: string; types: string[] }

const SEVERITY_STYLE: Record<string, { bg: string; text: string; border: string; label: string }> = {
  CRITICAL: { bg: 'bg-red-950/60',    text: 'text-red-400',    border: 'border-red-500/40',    label: 'CRITICAL' },
  HIGH:     { bg: 'bg-orange-950/60', text: 'text-orange-400', border: 'border-orange-500/40', label: 'HIGH' },
  ELEVATED: { bg: 'bg-yellow-950/60', text: 'text-yellow-400', border: 'border-yellow-500/30', label: 'ELEVATED' },
}

const THREAT_ICONS: Record<string, string> = {
  PROBE:    '🔍',
  RECON:    '🎯',
  INJECT:   '💉',
  TRAVERSAL:'⚠️',
  BOT:      '🤖',
  SIEGE:    '💥',
  GHOST:    '👻',
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  if (diff < 60_000)  return `${Math.round(diff / 1000)}s ago`
  if (diff < 3600_000) return `${Math.round(diff / 60_000)}m ago`
  return `${Math.round(diff / 3600_000)}h ago`
}

export default function FortPage() {
  const [password, setPassword]   = useState('')
  const [authed, setAuthed]       = useState(false)
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [topIPs, setTopIPs]       = useState<TopIP[]>([])
  const [typeBreakdown, setTypeBreakdown] = useState<Record<string, number>>({})
  const [totalToday, setTotalToday]       = useState(0)
  const [criticalToday, setCritical]      = useState(0)
  const [loading, setLoading]     = useState(false)
  const [expanded, setExpanded]   = useState<string | null>(null)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem('blogAdminPassword')
    if (stored) { setPassword(stored); setAuthed(true) }
  }, [])

  function login(e: React.FormEvent) {
    e.preventDefault()
    localStorage.setItem('blogAdminPassword', password)
    setAuthed(true)
  }

  const load = useCallback(async (pw = password) => {
    setLoading(true)
    const res  = await fetch('/api/admin/fort', {
      headers: { 'x-admin-password': pw, 'Content-Type': 'application/json' },
    })
    const data = await res.json()
    setIncidents(data.incidents   ?? [])
    setTopIPs(data.topIPs         ?? [])
    setTypeBreakdown(data.typeBreakdown ?? {})
    setTotalToday(data.totalToday ?? 0)
    setCritical(data.criticalToday ?? 0)
    setLastRefresh(new Date())
    setLoading(false)
  }, [password])

  useEffect(() => {
    if (!authed) return
    load()
    const interval = setInterval(() => load(), 30_000)
    return () => clearInterval(interval)
  }, [authed, load])

  const hasCritical = incidents.some(
    (i) => i.severity === 'CRITICAL' && Date.now() - new Date(i.created_at).getTime() < 3600_000
  )
  const fortStatus = hasCritical ? 'BREACH DETECTED' : totalToday > 0 ? 'CONTACT — THREATS NEUTRALIZED' : 'SECURE'
  const statusColor = hasCritical ? 'text-red-400' : totalToday > 0 ? 'text-yellow-400' : 'text-green-400'
  const statusDot   = hasCritical ? 'bg-red-400' : totalToday > 0 ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'

  if (!authed) {
    return (
      <div className="min-h-screen bg-[#050B14] flex items-center justify-center p-6">
        <form onSubmit={login} className="w-full max-w-sm space-y-4">
          <div className="text-center mb-6">
            <p className="text-xs font-black tracking-[0.3em] text-red-400 mb-1">FORT 2EZ TEK</p>
            <h1 className="text-2xl font-black text-white">COMMAND CENTER</h1>
            <p className="text-sm text-slate-500 mt-1">Authorized Personnel Only</p>
          </div>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
            placeholder="Security clearance required"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-red-400 font-mono" />
          <button type="submit" className="w-full rounded-xl bg-red-500 py-3 font-black text-white hover:bg-red-400 transition">
            AUTHENTICATE
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#050B14] text-white font-mono">
      <div className="mx-auto max-w-7xl px-6 py-8">

        {/* FORT STATUS HEADER */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black tracking-[0.35em] text-red-400 mb-1">FORT 2EZ TEK — COMMAND CENTER</p>
              <div className="flex items-center gap-3">
                <span className={`h-3 w-3 rounded-full ${statusDot}`} />
                <h1 className={`text-2xl font-black ${statusColor}`}>{fortStatus}</h1>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                {lastRefresh ? `Last sweep: ${lastRefresh.toLocaleTimeString('en-US', { timeZone: 'America/Chicago', hour: 'numeric', minute: '2-digit', second: '2-digit' })} CST` : 'Sweeping...'}
                {' · '}Auto-refresh every 30s
              </p>
            </div>
            <button onClick={() => load()} disabled={loading}
              className="rounded-xl border border-white/10 px-5 py-2 text-xs font-black text-slate-400 hover:text-white hover:border-white/25 transition disabled:opacity-50">
              {loading ? 'SWEEPING...' : 'SWEEP NOW'}
            </button>
          </div>
        </div>

        {/* INTEL SUMMARY */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-[10px] font-black tracking-widest text-slate-500 mb-2">THREATS TODAY</p>
            <p className={`text-4xl font-black ${totalToday > 0 ? 'text-yellow-400' : 'text-green-400'}`}>{totalToday}</p>
            <p className="text-xs text-slate-600 mt-1">contacts intercepted</p>
          </div>
          <div className="rounded-2xl border border-red-500/20 bg-red-950/20 p-5">
            <p className="text-[10px] font-black tracking-widest text-red-500 mb-2">CRITICAL</p>
            <p className={`text-4xl font-black ${criticalToday > 0 ? 'text-red-400' : 'text-slate-600'}`}>{criticalToday}</p>
            <p className="text-xs text-slate-600 mt-1">breach attempts</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-[10px] font-black tracking-widest text-slate-500 mb-2">HOSTILE IPs</p>
            <p className="text-4xl font-black text-orange-400">{topIPs.length}</p>
            <p className="text-xs text-slate-600 mt-1">unique actors</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-[10px] font-black tracking-widest text-slate-500 mb-2">LOG ENTRIES</p>
            <p className="text-4xl font-black text-white">{incidents.length}</p>
            <p className="text-xs text-slate-600 mt-1">showing last 100</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">

          {/* THREAT FEED — main column */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-black tracking-[0.25em] text-slate-400">THREAT FEED — LIVE</p>
              {hasCritical && (
                <span className="animate-pulse rounded-full bg-red-500/20 border border-red-500/40 px-3 py-1 text-[10px] font-black text-red-400">
                  ⚠ BREACH ALERT ACTIVE
                </span>
              )}
            </div>

            {incidents.length === 0 && !loading && (
              <div className="rounded-2xl border border-green-500/20 bg-green-950/10 p-10 text-center">
                <p className="text-3xl mb-3">🟢</p>
                <p className="font-black text-green-400">FORT SECURE</p>
                <p className="text-sm text-slate-500 mt-1">No hostile contacts recorded. Perimeter holding.</p>
              </div>
            )}

            <div className="space-y-2">
              {incidents.map((inc) => {
                const style = SEVERITY_STYLE[inc.severity] ?? SEVERITY_STYLE.ELEVATED
                const icon  = THREAT_ICONS[inc.threat_type] ?? '⚡'
                return (
                  <div key={inc.id}>
                    <button
                      onClick={() => setExpanded(expanded === inc.id ? null : inc.id)}
                      className={`w-full text-left rounded-xl border ${style.border} ${style.bg} p-4 transition hover:brightness-110`}>
                      <div className="flex items-center gap-3">
                        <span className="text-lg leading-none">{icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-[10px] font-black tracking-wider ${style.text}`}>{inc.severity}</span>
                            <span className="text-[10px] text-slate-500">·</span>
                            <span className="text-[10px] font-bold text-slate-400">{inc.threat_type}</span>
                            <span className="text-[10px] text-slate-500">·</span>
                            <span className="text-[10px] text-slate-500">{timeAgo(inc.created_at)}</span>
                          </div>
                          <p className="text-xs text-slate-300 truncate">{inc.detail}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className={`text-xs font-black ${style.text} font-mono`}>{inc.ip}</p>
                          <p className="text-[10px] text-slate-600 mt-0.5 truncate max-w-[120px]">{inc.path}</p>
                        </div>
                      </div>
                    </button>

                    {expanded === inc.id && (
                      <div className={`mx-2 border border-t-0 ${style.border} rounded-b-xl p-4 bg-black/40 space-y-2`}>
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div><span className="text-slate-500">IP</span><br/><span className={`font-black font-mono ${style.text}`}>{inc.ip}</span></div>
                          <div><span className="text-slate-500">METHOD</span><br/><span className="text-white font-bold">{inc.method}</span></div>
                          <div className="col-span-2"><span className="text-slate-500">PATH</span><br/><span className="text-slate-200 break-all">{inc.path}{inc.query}</span></div>
                          <div className="col-span-2"><span className="text-slate-500">AGENT</span><br/><span className="text-slate-400 break-all text-[11px]">{inc.user_agent || '(empty)'}</span></div>
                          <div className="col-span-2"><span className="text-slate-500">DETAIL</span><br/><span className="text-slate-200">{inc.detail}</span></div>
                          <div className="col-span-2"><span className="text-slate-500">TIME</span><br/>
                            <span className="text-slate-400">{new Date(inc.created_at).toLocaleString('en-US', { timeZone: 'America/Chicago' })} CST</span>
                          </div>
                        </div>
                        <div className="pt-2 border-t border-white/5">
                          <span className="text-[10px] font-black text-green-400">ACTION: ENGAGE — CONNECTION TERMINATED</span>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* SIDEBAR — intel panels */}
          <div className="space-y-5">

            {/* Top hostile IPs */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="text-[10px] font-black tracking-[0.25em] text-slate-400 mb-4">TOP HOSTILE ACTORS</p>
              {topIPs.length === 0 ? (
                <p className="text-xs text-slate-600">No hostile contacts in last 24h.</p>
              ) : topIPs.map((actor) => {
                const style = SEVERITY_STYLE[actor.severity] ?? SEVERITY_STYLE.ELEVATED
                return (
                  <div key={actor.ip} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                    <div>
                      <p className={`text-xs font-black font-mono ${style.text}`}>{actor.ip}</p>
                      <p className="text-[10px] text-slate-600">{actor.types.join(' · ')}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-white">{actor.count}</p>
                      <p className="text-[10px] text-slate-600">contacts</p>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Threat type breakdown */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="text-[10px] font-black tracking-[0.25em] text-slate-400 mb-4">THREAT CLASSIFICATION</p>
              {Object.keys(typeBreakdown).length === 0 ? (
                <p className="text-xs text-slate-600">No threats logged in last 24h.</p>
              ) : (
                Object.entries(typeBreakdown)
                  .sort(([, a], [, b]) => b - a)
                  .map(([type, count]) => {
                    const total = Object.values(typeBreakdown).reduce((s, n) => s + n, 0)
                    const pct   = Math.round((count / total) * 100)
                    return (
                      <div key={type} className="mb-3">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="font-bold text-slate-300">{THREAT_ICONS[type] ?? '⚡'} {type}</span>
                          <span className="text-slate-500">{count} · {pct}%</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                          <div className="h-full rounded-full bg-red-500/70 transition-all" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    )
                  })
              )}
            </div>

            {/* FORT mission statement */}
            <div className="rounded-2xl border border-red-500/15 bg-red-950/10 p-5">
              <p className="text-[10px] font-black tracking-[0.25em] text-red-400 mb-2">STANDING ORDERS</p>
              <p className="text-xs text-slate-400 leading-relaxed">
                FORT 2EZ TEK screens every inbound request. Hostile actors are engaged and terminated at the perimeter. HIGH and CRITICAL threats trigger immediate breach alerts to Command. Fort does not negotiate. Fort does not yield.
              </p>
              <p className="text-[10px] text-red-900 mt-3 font-black tracking-wider">SEMPER FIDELIS — ALWAYS FAITHFUL</p>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
