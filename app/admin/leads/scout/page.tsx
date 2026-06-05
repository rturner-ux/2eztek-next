'use client'

import { useState } from 'react'

const SERVICES = [
  { value: 'treadmill_repair', label: 'Treadmill Repair' },
  { value: 'elliptical_repair', label: 'Elliptical Repair' },
  { value: 'bike_repair', label: 'Exercise Bike Repair' },
  { value: 'gym_assembly', label: 'Gym Equipment Assembly' },
  { value: 'commercial_maintenance', label: 'Commercial Gym Maintenance' },
  { value: 'all_repair', label: 'All Fitness Equipment Repair' },
]

const RECENCY = [
  { value: 'qdr:d',  label: 'Past 24 Hours', badge: 'Freshest' },
  { value: 'qdr:w',  label: 'Past Week',     badge: 'Recommended' },
  { value: 'qdr:m',  label: 'Past Month',    badge: '' },
]

const CITIES = [
  'Dallas', 'Fort Worth', 'Plano', 'Frisco', 'Irving',
  'Arlington', 'Richardson', 'McKinney', 'Garland', 'Mesquite',
  'Carrollton', 'Addison', 'All DFW',
]

type ScoutLead = {
  name: string
  company?: string
  email?: string
  phone?: string
  website?: string
  location?: string
  intent_score: number
  intent_reason: string
  source_url: string
  source_title: string
  snippet: string
  mode: 'active_request' | 'business'
}

type ScoutResult = {
  success: boolean
  leads: ScoutLead[]
  queries_used: string[]
  error?: string
}

function IntentBadge({ score }: { score: number }) {
  const color =
    score >= 8 ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300' :
    score >= 5 ? 'border-cyan-400/30 bg-cyan-400/10 text-cyan-300' :
    'border-white/10 bg-white/5 text-white/40'

  const label =
    score >= 8 ? 'High Intent' :
    score >= 5 ? 'Medium' :
    'Low'

  return (
    <span className={`rounded-full border px-3 py-1 text-xs font-black uppercase ${color}`}>
      {score}/10 · {label}
    </span>
  )
}

export default function LeadScoutPage() {
  const [password, setPassword] = useState('')
  const [authorized, setAuthorized] = useState(false)
  const [mode, setMode] = useState<'active_requests' | 'business_discovery'>('active_requests')
  const [service, setService] = useState('all_repair')
  const [city, setCity] = useState('All DFW')
  const [recency, setRecency] = useState('qdr:w')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ScoutResult | null>(null)
  const [queued, setQueued] = useState<Set<number>>(new Set())
  const [sending, setSending] = useState(false)
  const [sendDone, setSendDone] = useState(false)

  async function scout() {
    setLoading(true)
    setResult(null)
    setQueued(new Set())
    setSendDone(false)

    try {
      const res = await fetch('/api/admin/scout-leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
        body: JSON.stringify({ mode, service, city, recency }),
      })
      const data = await res.json()
      setResult(data)
    } catch (err: any) {
      setResult({ success: false, leads: [], queries_used: [], error: err.message })
    } finally {
      setLoading(false)
    }
  }

  function toggleQueue(i: number) {
    setQueued((prev) => {
      const next = new Set(prev)
      next.has(i) ? next.delete(i) : next.add(i)
      return next
    })
  }

  async function sendQueued() {
    if (!result || queued.size === 0) return
    const selectedLeads = [...queued].map((i) => result.leads[i]).filter(Boolean)
    setSending(true)

    const leads = selectedLeads.map((l) => ({
      name: l.name,
      title: '',
      company: l.company ?? l.name,
      industry: mode === 'active_requests' ? 'Fitness Equipment Repair Request' : 'Commercial Facility',
      email: l.email ?? '',
    })).filter((l) => l.email)

    if (leads.length === 0) {
      alert('No leads with email addresses to send. Add emails manually first.')
      setSending(false)
      return
    }

    try {
      const res = await fetch('/api/admin/send-leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
        body: JSON.stringify({ leads, dryRun: false }),
      })
      const data = await res.json()
      if (data.success) {
        setSendDone(true)
        setQueued(new Set())
      } else {
        alert(data.error || 'Send failed')
      }
    } catch (err: any) {
      alert(err.message)
    } finally {
      setSending(false)
    }
  }

  if (!authorized) {
    return (
      <main className="min-h-screen bg-[#050B14] px-6 py-28 text-white">
        <div className="mx-auto max-w-md rounded-[2rem] border border-white/10 bg-black/40 p-8">
          <h1 className="text-3xl font-black">AI Lead Scout</h1>
          <p className="mt-3 text-white/55">Enter admin password to access.</p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') setAuthorized(true) }}
            placeholder="Admin password"
            className="mt-6 w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-white outline-none focus:border-cyan-400"
          />
          <button onClick={() => setAuthorized(true)} className="mt-4 w-full rounded-2xl bg-cyan-400 py-4 text-sm font-black uppercase text-black">
            Enter
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#050B14] px-6 py-24 text-white">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <div className="mb-10">
          <div className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-5 py-2 text-xs font-black uppercase tracking-[0.28em] text-cyan-300">
            2EZ TEK
          </div>
          <h1 className="mt-6 text-4xl font-black md:text-6xl">AI Lead Scout</h1>
          <p className="mt-4 max-w-2xl text-white/55">
            AI searches the web for people actively requesting fitness equipment repair and assembly, plus commercial facilities likely needing maintenance — then surfaces them as actionable leads.
          </p>
          <div className="mt-4 flex gap-4">
            <a href="/admin/leads" className="text-sm font-black uppercase tracking-[0.14em] text-cyan-400 hover:text-cyan-300">
              ← Lead Email Tool
            </a>
          </div>
        </div>

        {/* Mode selector */}
        <div className="mb-6 grid gap-4 md:grid-cols-2">
          {([
            {
              key: 'active_requests',
              title: 'Active Requests',
              desc: 'Finds people RIGHT NOW posting on Craigslist, Reddit, forums, and local groups asking for fitness equipment repair or assembly in DFW.',
              badge: 'Highest Intent',
              badgeColor: 'bg-emerald-400/10 border-emerald-400/30 text-emerald-300',
            },
            {
              key: 'business_discovery',
              title: 'Business Discovery',
              desc: 'Finds gyms, hotels, apartments, corporate offices, and fitness facilities in DFW that likely have equipment needing maintenance.',
              badge: 'B2B Commercial',
              badgeColor: 'bg-cyan-400/10 border-cyan-400/30 text-cyan-300',
            },
          ] as const).map((m) => (
            <button
              key={m.key}
              type="button"
              onClick={() => setMode(m.key)}
              className={`rounded-[2rem] border p-6 text-left transition ${
                mode === m.key
                  ? 'border-cyan-400/50 bg-cyan-400/10'
                  : 'border-white/10 bg-black/20 hover:border-white/20'
              }`}
            >
              <div className="flex items-center gap-3 mb-3">
                <span className={`rounded-full border px-3 py-1 text-xs font-black uppercase ${m.badgeColor}`}>
                  {m.badge}
                </span>
                {mode === m.key && (
                  <span className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                )}
              </div>
              <h3 className="text-xl font-black">{m.title}</h3>
              <p className="mt-2 text-sm leading-6 text-white/55">{m.desc}</p>
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="mb-6 rounded-[2rem] border border-white/10 bg-black/30 p-6">
          <div className="mb-4 text-sm font-black uppercase tracking-[0.2em] text-cyan-300">Search Parameters</div>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-white/40">Service Type</label>
              <select
                value={service}
                onChange={(e) => setService(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
              >
                {SERVICES.map((s) => (
                  <option key={s.value} value={s.value} className="bg-[#050B14]">{s.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-white/40">DFW Area</label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
              >
                {CITIES.map((c) => (
                  <option key={c} value={c} className="bg-[#050B14]">{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-white/40">Posted Within</label>
              <div className="flex flex-col gap-2">
                {RECENCY.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setRecency(r.value)}
                    className={`flex items-center justify-between rounded-xl border px-4 py-2.5 text-sm transition ${
                      recency === r.value
                        ? 'border-cyan-400/50 bg-cyan-400/10 text-white'
                        : 'border-white/10 bg-white/[0.03] text-white/50 hover:border-white/20'
                    }`}
                  >
                    <span className="font-black">{r.label}</span>
                    {r.badge && (
                      <span className={`text-[10px] font-black uppercase tracking-wider ${
                        r.value === 'qdr:d' ? 'text-emerald-400' : 'text-cyan-400'
                      }`}>{r.badge}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={scout}
            disabled={loading}
            className="mt-6 rounded-2xl bg-cyan-400 px-8 py-5 text-sm font-black uppercase tracking-[0.15em] text-black transition hover:bg-cyan-300 disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center gap-3">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                </svg>
                AI Scouting...
              </span>
            ) : `Scout for ${mode === 'active_requests' ? 'Active Requests' : 'Businesses'}`}
          </button>
        </div>

        {/* Error */}
        {result && !result.success && (
          <div className="mb-6 rounded-2xl border border-red-400/20 bg-red-400/10 px-6 py-5 text-red-300">
            <div className="font-black">Scout failed</div>
            <div className="mt-1 text-sm">{result.error}</div>
            {result.error?.includes('SERPER_API_KEY') && (
              <div className="mt-4 rounded-xl border border-red-400/20 bg-black/30 p-4 text-sm text-white/70">
                <p className="font-black text-white mb-2">One-time setup required:</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Go to <span className="text-cyan-400">serper.dev</span> → sign up (free 2,500 queries)</li>
                  <li>Copy your API key from the dashboard</li>
                  <li>In Vercel → Settings → Environment Variables → add <span className="font-mono text-cyan-300">SERPER_API_KEY=your-key</span></li>
                  <li>Redeploy or trigger a new deployment</li>
                </ol>
              </div>
            )}
          </div>
        )}

        {/* Queries used */}
        {result?.queries_used && result.queries_used.length > 0 && (
          <div className="mb-6 rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-4">
            <div className="mb-2 text-xs font-black uppercase tracking-[0.18em] text-white/30">Search Queries Executed</div>
            <div className="space-y-1">
              {result.queries_used.map((q, i) => (
                <div key={i} className="font-mono text-xs text-white/50">{q}</div>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        {result?.success && (
          <>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-black">
                {result.leads.length} Lead{result.leads.length !== 1 ? 's' : ''} Found
              </h2>
              {queued.size > 0 && (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-white/50">{queued.size} selected</span>
                  <button
                    onClick={sendQueued}
                    disabled={sending}
                    className="rounded-2xl bg-cyan-400 px-6 py-3 text-xs font-black uppercase tracking-[0.14em] text-black transition hover:bg-cyan-300 disabled:opacity-50"
                  >
                    {sending ? 'Sending...' : `Send Emails to ${queued.size} Lead${queued.size !== 1 ? 's' : ''}`}
                  </button>
                </div>
              )}
            </div>

            {sendDone && (
              <div className="mb-4 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-6 py-4 text-emerald-300 font-black">
                Emails sent successfully.
              </div>
            )}

            {result.leads.length === 0 && (
              <div className="rounded-[2rem] border border-white/10 bg-black/20 p-12 text-center text-white/40">
                No leads found for these parameters. Try a different city or service type.
              </div>
            )}

            <div className="space-y-4">
              {result.leads.map((lead, i) => (
                <div
                  key={i}
                  className={`rounded-[2rem] border p-6 transition cursor-pointer ${
                    queued.has(i)
                      ? 'border-cyan-400/50 bg-cyan-400/[0.06]'
                      : 'border-white/10 bg-black/20 hover:border-white/20'
                  }`}
                  onClick={() => toggleQueue(i)}
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      {/* Checkbox */}
                      <div className={`mt-1 h-5 w-5 flex-shrink-0 rounded-md border-2 transition ${
                        queued.has(i) ? 'border-cyan-400 bg-cyan-400' : 'border-white/20 bg-transparent'
                      }`}>
                        {queued.has(i) && (
                          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" className="h-full w-full p-0.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                          </svg>
                        )}
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-black text-white text-lg">{lead.name}</span>
                          {lead.company && lead.company !== lead.name && (
                            <span className="text-white/40 text-sm">· {lead.company}</span>
                          )}
                          <span className={`rounded-full border px-2 py-0.5 text-[10px] font-black uppercase ${
                            lead.mode === 'active_request'
                              ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-400'
                              : 'border-cyan-400/20 bg-cyan-400/10 text-cyan-400'
                          }`}>
                            {lead.mode === 'active_request' ? 'Active Request' : 'Business'}
                          </span>
                        </div>
                        {lead.location && (
                          <div className="mt-1 text-sm text-white/40">{lead.location}</div>
                        )}
                      </div>
                    </div>
                    <IntentBadge score={lead.intent_score} />
                  </div>

                  {/* Contact info */}
                  <div className="mt-4 flex flex-wrap gap-4 text-sm">
                    {lead.email && (
                      <a href={`mailto:${lead.email}`} onClick={(e) => e.stopPropagation()} className="flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300">
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                        </svg>
                        {lead.email}
                      </a>
                    )}
                    {lead.phone && (
                      <a href={`tel:${lead.phone}`} onClick={(e) => e.stopPropagation()} className="flex items-center gap-1.5 text-white/60 hover:text-white">
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                        </svg>
                        {lead.phone}
                      </a>
                    )}
                    {lead.website && (
                      <a href={lead.website} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="flex items-center gap-1.5 text-white/40 hover:text-white/70 text-xs">
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                        </svg>
                        {lead.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                      </a>
                    )}
                  </div>

                  {/* Intent reason */}
                  <div className="mt-4 rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3">
                    <div className="text-xs font-black uppercase tracking-[0.14em] text-white/25 mb-1">Why this lead</div>
                    <p className="text-sm text-white/65 leading-5">{lead.intent_reason}</p>
                  </div>

                  {/* Source */}
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-xs text-white/25">Source:</span>
                    <a
                      href={lead.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-xs text-white/40 hover:text-cyan-400 truncate max-w-md"
                    >
                      {lead.source_title || lead.source_url}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  )
}
