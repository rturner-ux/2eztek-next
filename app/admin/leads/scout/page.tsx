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

const SOURCE_FOCUS = [
  {
    value: 'nextdoor_local',
    label: 'Nextdoor + Local Posts',
    desc: 'Best for neighborhood recommendation threads and urgent homeowner requests.',
  },
  {
    value: 'neighborhood_groups',
    label: 'All Neighborhood Sources',
    desc: 'Searches local groups, forums, Reddit, Craigslist, and community pages.',
  },
  {
    value: 'craigslist_marketplace',
    label: 'Marketplace + Moves',
    desc: 'Finds used-equipment, assembly, disassembly, moving, and repair opportunities.',
  },
  {
    value: 'commercial_facilities',
    label: 'Commercial Facilities',
    desc: 'Focuses on gyms, hotels, apartments, schools, and facility operators.',
  },
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

type MapsLead = {
  name: string
  address: string
  phone?: string
  website?: string
  rating?: number
  reviewCount?: number
  category?: string
  intent_score: number
  intent_reason: string
}

type MapsResult = {
  success: boolean
  leads: MapsLead[]
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

function sourceLabel(url: string) {
  const lower = url.toLowerCase()
  if (lower.includes('nextdoor.com')) return 'Nextdoor'
  if (lower.includes('reddit.com')) return 'Reddit'
  if (lower.includes('craigslist.org')) return 'Craigslist'
  if (lower.includes('facebook.com')) return 'Facebook'
  if (lower.includes('angi.com') || lower.includes('homeadvisor.com')) return 'Service Marketplace'
  return 'Web'
}

function replyDraft(lead: ScoutLead) {
  const service = lead.mode === 'business'
    ? 'fitness equipment maintenance and repair'
    : 'fitness equipment repair, assembly, and diagnostics'

  return `Hi ${lead.name && lead.name !== 'Unknown' ? lead.name : 'there'} - 2EZ TEK helps with ${service} across DFW. If you are still looking, we can take a look, confirm the issue, and give you a clear next step. You can call/text us or book here: https://www.2eztek.com/contact`
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Something went wrong'
}

const FACILITY_TYPES = [
  { value: 'all', label: 'All Facilities' },
  { value: 'hotel', label: 'Hotels' },
  { value: 'apartment', label: 'Apartments' },
  { value: 'gym', label: 'Gyms' },
  { value: 'corporate', label: 'Corporate' },
]

function MapsIntentBadge({ score }: { score: number }) {
  const color =
    score >= 8 ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300' :
    score >= 5 ? 'border-cyan-400/30 bg-cyan-400/10 text-cyan-300' :
    'border-white/10 bg-white/5 text-white/40'
  const label = score >= 8 ? 'High Value' : score >= 5 ? 'Medium' : 'Low'
  return (
    <span className={`rounded-full border px-3 py-1 text-xs font-black uppercase ${color}`}>
      {score}/10 · {label}
    </span>
  )
}

export default function LeadScoutPage() {
  const [password, setPassword] = useState('')
  const [authorized, setAuthorized] = useState(false)
  const [tab, setTab] = useState<'scout' | 'maps'>('scout')
  const [mode, setMode] = useState<'active_requests' | 'business_discovery'>('active_requests')
  const [service, setService] = useState('all_repair')
  const [city, setCity] = useState('All DFW')
  const [recency, setRecency] = useState('qdr:w')
  const [sourceFocus, setSourceFocus] = useState('nextdoor_local')
  const [facilityType, setFacilityType] = useState('all')
  const [mapsCity, setMapsCity] = useState('All DFW')
  const [mapsLoading, setMapsLoading] = useState(false)
  const [mapsResult, setMapsResult] = useState<MapsResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ScoutResult | null>(null)
  const [queued, setQueued] = useState<Set<number>>(new Set())
  const [sending, setSending] = useState(false)
  const [sendDone, setSendDone] = useState(false)
  const [copiedLead, setCopiedLead] = useState<number | null>(null)

  async function scout() {
    setLoading(true)
    setResult(null)
    setQueued(new Set())
    setSendDone(false)

    try {
      const res = await fetch('/api/admin/scout-leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
        body: JSON.stringify({ mode, service, city, recency, sourceFocus }),
      })
      const data = await res.json()
      setResult(data)
    } catch (err: unknown) {
      setResult({ success: false, leads: [], queries_used: [], error: errorMessage(err) })
    } finally {
      setLoading(false)
    }
  }

  async function scoutMaps() {
    setMapsLoading(true)
    setMapsResult(null)
    try {
      const res = await fetch('/api/admin/scout-maps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
        body: JSON.stringify({ facilityType, city: mapsCity }),
      })
      const data = await res.json()
      setMapsResult(data)
    } catch {
      setMapsResult({ success: false, leads: [], queries_used: [], error: 'Request failed' })
    } finally {
      setMapsLoading(false)
    }
  }

  async function copyReply(lead: ScoutLead, index: number) {
    await navigator.clipboard.writeText(replyDraft(lead))
    setCopiedLead(index)
    window.setTimeout(() => setCopiedLead(null), 1600)
  }

  function toggleQueue(i: number) {
    setQueued((prev) => {
      const next = new Set(prev)
      if (next.has(i)) {
        next.delete(i)
      } else {
        next.add(i)
      }
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
    } catch (err: unknown) {
      alert(errorMessage(err))
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

  const selectedEmailCount = result
    ? [...queued].map((i) => result.leads[i]).filter((lead) => lead?.email).length
    : 0

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
            AI searches publicly indexed local posts, neighborhood recommendations, marketplace listings, and commercial facility pages for people already looking for fitness equipment help.
          </p>
          <div className="mt-4 flex gap-4">
            <a href="/admin/leads" className="text-sm font-black uppercase tracking-[0.14em] text-cyan-400 hover:text-cyan-300">
              ← Lead Email Tool
            </a>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="mb-8 flex gap-3">
          {[
            { key: 'scout', label: 'Community Scout' },
            { key: 'maps', label: 'Google Maps Discovery' },
          ].map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key as 'scout' | 'maps')}
              className={`rounded-2xl px-6 py-3 text-sm font-black uppercase tracking-[0.14em] transition ${
                tab === t.key
                  ? 'bg-cyan-400 text-black'
                  : 'border border-white/10 bg-white/5 text-white/60 hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Google Maps Discovery Tab */}
        {tab === 'maps' && (
          <div>
            <div className="mb-6 rounded-[2rem] border border-white/10 bg-black/30 p-6">
              <div className="mb-4 text-sm font-black uppercase tracking-[0.2em] text-cyan-300">Facility Type</div>
              <div className="mb-6 flex flex-wrap gap-3">
                {FACILITY_TYPES.map((f) => (
                  <button
                    key={f.value}
                    type="button"
                    onClick={() => setFacilityType(f.value)}
                    className={`rounded-2xl px-5 py-3 text-sm font-black transition ${
                      facilityType === f.value
                        ? 'bg-cyan-400 text-black'
                        : 'border border-white/10 bg-white/5 text-white/60 hover:text-white'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <div className="mb-6">
                <label className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-white/40">DFW Area</label>
                <select
                  value={mapsCity}
                  onChange={(e) => setMapsCity(e.target.value)}
                  className="w-full max-w-xs rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
                >
                  {CITIES.map((c) => (
                    <option key={c} value={c} className="bg-[#050B14]">{c}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={scoutMaps}
                disabled={mapsLoading}
                className="rounded-2xl bg-cyan-400 px-8 py-5 text-sm font-black uppercase tracking-[0.15em] text-black transition hover:bg-cyan-300 disabled:opacity-50"
              >
                {mapsLoading ? (
                  <span className="flex items-center gap-3">
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                    </svg>
                    Searching Google Maps...
                  </span>
                ) : 'Find Facilities on Google Maps'}
              </button>
            </div>

            {mapsResult && !mapsResult.success && (
              <div className="mb-6 rounded-2xl border border-red-400/20 bg-red-400/10 px-6 py-5 text-red-300">
                <div className="font-black">Search failed</div>
                <div className="mt-1 text-sm">{mapsResult.error}</div>
              </div>
            )}

            {mapsResult?.queries_used && mapsResult.queries_used.length > 0 && (
              <div className="mb-6 rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-4">
                <div className="mb-2 text-xs font-black uppercase tracking-[0.18em] text-white/30">Queries Executed</div>
                <div className="space-y-1">
                  {mapsResult.queries_used.map((q, i) => (
                    <div key={i} className="font-mono text-xs text-white/50">{q}</div>
                  ))}
                </div>
              </div>
            )}

            {mapsResult?.success && (
              <>
                <div className="mb-4">
                  <h2 className="text-2xl font-black">{mapsResult.leads.length} Facilities Found</h2>
                  <p className="mt-1 text-sm text-white/40">Sorted by maintenance value score. Call or email facilities with phone numbers listed.</p>
                </div>

                {mapsResult.leads.length === 0 && (
                  <div className="rounded-[2rem] border border-white/10 bg-black/20 p-12 text-center text-white/40">
                    No facilities found. Try a different facility type or city.
                  </div>
                )}

                <div className="space-y-4">
                  {mapsResult.leads.map((lead, i) => (
                    <div key={i} className="rounded-[2rem] border border-white/10 bg-black/20 p-6">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <div className="text-lg font-black text-white">{lead.name}</div>
                          <div className="mt-1 text-sm text-white/40">{lead.address}</div>
                          {lead.category && (
                            <div className="mt-1 text-xs text-white/30">{lead.category}</div>
                          )}
                        </div>
                        <MapsIntentBadge score={lead.intent_score} />
                      </div>

                      <div className="mt-4 flex flex-wrap gap-4 text-sm">
                        {lead.phone && (
                          <a href={`tel:${lead.phone}`} className="flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300">
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                            </svg>
                            {lead.phone}
                          </a>
                        )}
                        {lead.website && (
                          <a href={lead.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-white/40 hover:text-white/70 text-xs">
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                            </svg>
                            {lead.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                          </a>
                        )}
                        {lead.rating && (
                          <span className="text-xs text-white/30">
                            {lead.rating} stars · {lead.reviewCount ?? 0} reviews
                          </span>
                        )}
                      </div>

                      <div className="mt-4 rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3">
                        <div className="text-xs font-black uppercase tracking-[0.14em] text-white/25 mb-1">Why this facility</div>
                        <p className="text-sm text-white/65 leading-5">{lead.intent_reason}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {tab === 'scout' && (
        <div className="mb-6 grid gap-3 md:grid-cols-3">
          {[
            ['Find the ask', 'Prioritize posts where someone says they need help, a recommendation, assembly, or repair.'],
            ['Reply fast', 'For Nextdoor-style leads, open the source thread and use the quick reply instead of waiting for an email address.'],
            ['Track contactable leads', 'Queue email-ready prospects, but treat source links as live opportunities too.'],
          ].map(([title, text]) => (
            <div key={title} className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4">
              <div className="text-sm font-black text-white">{title}</div>
              <p className="mt-1 text-sm leading-6 text-white/50">{text}</p>
            </div>
          ))}
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

        <div className="mb-6 rounded-[2rem] border border-white/10 bg-black/30 p-6">
          <div className="mb-4 text-sm font-black uppercase tracking-[0.2em] text-cyan-300">Lead Source Strategy</div>
          <div className="grid gap-3 md:grid-cols-4">
            {SOURCE_FOCUS.map((source) => (
              <button
                key={source.value}
                type="button"
                onClick={() => setSourceFocus(source.value)}
                className={`rounded-2xl border p-4 text-left transition ${
                  sourceFocus === source.value
                    ? 'border-cyan-400/50 bg-cyan-400/10'
                    : 'border-white/10 bg-white/[0.03] hover:border-white/20'
                }`}
              >
                <div className="text-sm font-black text-white">{source.label}</div>
                <p className="mt-2 text-xs leading-5 text-white/50">{source.desc}</p>
              </button>
            ))}
          </div>
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
                  <span className="text-sm text-white/50">
                    {queued.size} selected · {selectedEmailCount} email-ready
                  </span>
                  <button
                    onClick={sendQueued}
                    disabled={sending || selectedEmailCount === 0}
                    className="rounded-2xl bg-cyan-400 px-6 py-3 text-xs font-black uppercase tracking-[0.14em] text-black transition hover:bg-cyan-300 disabled:opacity-50"
                  >
                    {sending ? 'Sending...' : `Send Emails to ${selectedEmailCount} Lead${selectedEmailCount !== 1 ? 's' : ''}`}
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
                No leads found for these parameters. Try Nextdoor + Local Posts with Past Week, or switch to All Neighborhood Sources for broader coverage.
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
                          <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] font-black uppercase text-white/45">
                            {sourceLabel(lead.source_url)}
                          </span>
                          {!lead.email && lead.mode === 'active_request' && (
                            <span className="rounded-full border border-amber-300/20 bg-amber-300/10 px-2 py-0.5 text-[10px] font-black uppercase text-amber-200">
                              Reply on source
                            </span>
                          )}
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

                  {lead.mode === 'active_request' && (
                    <div className="mt-3 rounded-xl border border-cyan-400/10 bg-cyan-400/[0.04] px-4 py-3">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <div className="text-xs font-black uppercase tracking-[0.14em] text-cyan-300/70">Suggested fast reply</div>
                          <p className="mt-1 text-sm leading-5 text-white/60">{replyDraft(lead)}</p>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            copyReply(lead, i)
                          }}
                          className="rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-cyan-200 transition hover:bg-cyan-400/20"
                        >
                          {copiedLead === i ? 'Copied' : 'Copy Reply'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Source */}
                  <div className="mt-3 flex flex-wrap items-center gap-2">
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
                    <a
                      href={lead.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="rounded-full border border-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-white/45 transition hover:border-cyan-400/40 hover:text-cyan-300"
                    >
                      Open
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
        </div>
        )}
      </div>
    </main>
  )
}
