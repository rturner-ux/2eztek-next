'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

function ToastOoRah({ msg, onDone }: { msg: string; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2800)
    return () => clearTimeout(t)
  }, [onDone])
  return (
    <div className="toast-oorah fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 rounded-2xl border border-cyan-400/30 bg-[#050B14] px-6 py-4 shadow-2xl shadow-cyan-400/10">
      <span className="text-2xl font-black text-cyan-400 tracking-tight">OO-RAH!</span>
      <span className="text-sm font-semibold text-white/80">{msg}</span>
    </div>
  )
}

type Prospect = {
  id: string
  business_name: string
  business_type: string
  address: string
  city: string
  phone: string
  website: string
  email: string
  intent_score: number
  status: string
  notes: string
  last_contacted_at: string
  created_at: string
}

type DiscoveryLead = {
  name: string
  address: string
  phone?: string
  website?: string
  rating?: number
  category?: string
  intent_score: number
  intent_reason: string
}

const STATUS_COLORS: Record<string, string> = {
  new: 'bg-slate-700 text-slate-200',
  drafted: 'bg-blue-900 text-blue-200',
  sent: 'bg-yellow-900 text-yellow-200',
  replied: 'bg-cyan-900 text-cyan-200',
  booked: 'bg-green-900 text-green-200',
  not_interested: 'bg-red-950 text-red-300',
}

const BUSINESS_TYPES = [
  { value: 'gym', label: 'Commercial Gyms' },
  { value: 'hotel', label: 'Hotels' },
  { value: 'apartment', label: 'Apartment Complexes' },
  { value: 'corporate', label: 'Corporate Gyms' },
  { value: 'crossfit', label: 'CrossFit Boxes' },
]

export default function OutreachPage() {
  const [tab, setTab] = useState<'discover' | 'pipeline' | 'sent'>('discover')
  const [password, setPassword] = useState('')
  const [authed, setAuthed] = useState(false)

  const [facilityType, setFacilityType] = useState('gym')
  const [discovering, setDiscovering] = useState(false)
  const [leads, setLeads] = useState<DiscoveryLead[]>([])
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set())
  const [saving, setSaving] = useState<Set<string>>(new Set())

  const [prospects, setProspects] = useState<Prospect[]>([])
  const [statusFilter, setStatusFilter] = useState('all')
  const [selected, setSelected] = useState<Prospect | null>(null)

  const [composing, setComposing] = useState(false)
  const [emailDraft, setEmailDraft] = useState({ subject: '', body: '' })
  const [toEmail, setToEmail] = useState('')
  const [sending, setSending] = useState(false)
  const [sentMsg, setSentMsg]     = useState('')
  const [toast, setToast]         = useState<string | null>(null)

  const [sentEmails, setSentEmails] = useState<Array<{ subject: string; sent_at: string; prospect_id: string }>>([])

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

  async function discover() {
    setDiscovering(true)
    setLeads([])
    const res = await fetch('/api/admin/scout-maps', {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ facilityType, city: 'All DFW' }),
    })
    const data = await res.json()
    setLeads(data.leads ?? [])
    setDiscovering(false)
  }

  async function saveLead(lead: DiscoveryLead) {
    const key = lead.name + lead.address
    setSaving((s) => new Set(s).add(key))
    await fetch('/api/admin/outreach', {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({
        business_name: lead.name,
        business_type: facilityType,
        address: lead.address,
        phone: lead.phone,
        website: lead.website,
        intent_score: lead.intent_score,
      }),
    })
    setSavedIds((s) => new Set(s).add(key))
    setSaving((prev) => { const n = new Set(prev); n.delete(key); return n })
  }

  async function saveAll() {
    for (const lead of leads) {
      const key = lead.name + lead.address
      if (!savedIds.has(key)) await saveLead(lead)
    }
  }

  const loadProspects = useCallback(async () => {
    const res = await fetch(`/api/admin/outreach?status=${statusFilter}`, { headers: headers() })
    const data = await res.json()
    setProspects(data.prospects ?? [])
  }, [headers, statusFilter])

  useEffect(() => {
    if (authed && tab === 'pipeline') loadProspects()
  }, [authed, tab, statusFilter, loadProspects])

  async function compose() {
    if (!selected) return
    setComposing(true)
    setEmailDraft({ subject: '', body: '' })
    setSentMsg('')
    const res = await fetch('/api/admin/outreach/compose', {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(selected),
    })
    const data = await res.json()
    setEmailDraft({ subject: data.subject ?? '', body: data.body ?? '' })
    setToEmail(selected.email ?? '')
    setComposing(false)
  }

  async function send() {
    if (!toEmail || !emailDraft.subject || !emailDraft.body) return
    setSending(true)
    setSentMsg('')
    const res = await fetch('/api/admin/outreach/send', {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({
        prospect_id: selected?.id,
        to_email: toEmail,
        subject: emailDraft.subject,
        body: emailDraft.body,
      }),
    })
    const data = await res.json()
    if (data.success) {
      setSentMsg('Sent!')
      setToast(`Round downrange — ${selected?.business_name ?? 'prospect'} contacted.`)
      if (selected) setSelected({ ...selected, status: 'sent' })
      await loadProspects()
    } else {
      setSentMsg(data.error || 'Failed to send')
    }
    setSending(false)
  }

  async function updateStatus(id: string, status: string) {
    await fetch('/api/admin/outreach', {
      method: 'PUT',
      headers: headers(),
      body: JSON.stringify({ id, status }),
    })
    await loadProspects()
    if (selected?.id === id) setSelected((p) => p ? { ...p, status } : p)
  }

  async function deleteProspect(id: string) {
    if (!confirm('Remove this prospect?')) return
    await fetch('/api/admin/outreach', {
      method: 'DELETE',
      headers: headers(),
      body: JSON.stringify({ id }),
    })
    setSelected(null)
    await loadProspects()
  }

  if (!authed) {
    return (
      <div className="min-h-screen bg-[#050B14] flex items-center justify-center p-6">
        <form onSubmit={login} className="w-full max-w-sm space-y-4">
          <h1 className="text-2xl font-black text-white">Outreach Studio</h1>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
            placeholder="Admin password" className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-cyan-400" />
          <button type="submit" className="w-full rounded-xl bg-cyan-400 py-3 font-black text-black">Enter</button>
        </form>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#050B14] text-white">
      {toast && <ToastOoRah msg={toast} onDone={() => setToast(null)} />}
      <div className="mx-auto max-w-7xl px-6 py-8">

        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-white">Outreach Studio</h1>
            <p className="mt-1 text-sm text-slate-400">Find prospects · Compose with AI · Send · Track</p>
          </div>
          <div className="flex gap-2">
            {(['discover', 'pipeline', 'sent'] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className={`rounded-full px-5 py-2 text-sm font-bold capitalize transition ${tab === t ? 'bg-cyan-400 text-black' : 'border border-white/10 text-slate-400 hover:text-white'}`}>
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* DISCOVER TAB */}
        {tab === 'discover' && (
          <div className="space-y-6">
            {/* Search controls */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <p className="mb-4 text-xs font-bold uppercase tracking-widest text-cyan-400">Find Prospects in DFW</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {BUSINESS_TYPES.map((t) => (
                  <button key={t.value} onClick={() => setFacilityType(t.value)}
                    className={`rounded-full px-4 py-1.5 text-sm font-bold transition ${facilityType === t.value ? 'bg-cyan-400 text-black' : 'border border-white/10 text-slate-400 hover:text-white'}`}>
                    {t.label}
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <button onClick={discover} disabled={discovering}
                  className="rounded-xl bg-cyan-400 px-8 py-3 font-black text-black disabled:opacity-50 hover:bg-cyan-300 transition">
                  {discovering ? 'Searching...' : 'Discover'}
                </button>
                {leads.length > 0 && (
                  <button onClick={saveAll}
                    className="rounded-xl border border-cyan-400/40 px-6 py-3 text-sm font-bold text-cyan-400 hover:bg-cyan-400/10 transition">
                    Save All to Pipeline
                  </button>
                )}
              </div>
            </div>

            {/* Results */}
            {leads.length > 0 && (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {leads.map((lead) => {
                  const key = lead.name + lead.address
                  const isSaved = savedIds.has(key)
                  return (
                    <div key={key} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-black text-white text-sm leading-tight">{lead.name}</h3>
                        <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-bold ${lead.intent_score >= 70 ? 'bg-green-900 text-green-300' : lead.intent_score >= 40 ? 'bg-yellow-900 text-yellow-300' : 'bg-slate-700 text-slate-300'}`}>
                          {lead.intent_score}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mb-1">{lead.address}</p>
                      {lead.phone && <p className="text-xs text-slate-500">{lead.phone}</p>}
                      {lead.website && (
                        <a href={lead.website} target="_blank" rel="noopener noreferrer"
                          className="block mt-1 text-xs text-cyan-400 hover:underline truncate">{lead.website}</a>
                      )}
                      <p className="mt-2 text-xs text-slate-500 italic">{lead.intent_reason}</p>
                      <button onClick={() => saveLead(lead)} disabled={isSaved || saving.has(key)}
                        className={`mt-3 w-full rounded-xl py-2 text-xs font-black transition ${isSaved ? 'bg-green-900/50 text-green-400 cursor-default' : 'bg-cyan-400/10 text-cyan-400 hover:bg-cyan-400/20'}`}>
                        {isSaved ? 'Saved to Pipeline' : saving.has(key) ? 'Saving...' : '+ Add to Pipeline'}
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* PIPELINE TAB */}
        {tab === 'pipeline' && (
          <div className="flex gap-6 h-[calc(100vh-180px)]">

            {/* Prospect list */}
            <div className="w-80 shrink-0 flex flex-col gap-3 overflow-y-auto pr-1">
              {/* Status filter */}
              <div className="flex flex-wrap gap-1.5">
                {['all', 'new', 'drafted', 'sent', 'replied', 'booked', 'not_interested'].map((s) => (
                  <button key={s} onClick={() => setStatusFilter(s)}
                    className={`rounded-full px-3 py-1 text-xs font-bold capitalize transition ${statusFilter === s ? 'bg-cyan-400 text-black' : 'border border-white/10 text-slate-400 hover:text-white'}`}>
                    {s.replace('_', ' ')}
                  </button>
                ))}
              </div>

              {prospects.length === 0 ? (
                <p className="text-sm text-slate-500 mt-4">No prospects yet. Discover and save some first.</p>
              ) : prospects.map((p) => (
                <button key={p.id} onClick={() => { setSelected(p); setEmailDraft({ subject: '', body: '' }); setSentMsg('') }}
                  className={`text-left rounded-2xl border p-4 transition ${selected?.id === p.id ? 'border-cyan-400/50 bg-cyan-400/5' : 'border-white/10 bg-white/5 hover:border-white/20'}`}>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-black text-white text-sm leading-tight truncate">{p.business_name}</span>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${STATUS_COLORS[p.status] ?? 'bg-slate-700 text-slate-200'}`}>
                      {p.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 truncate">{p.address}</p>
                  {p.intent_score > 0 && (
                    <p className="text-xs text-slate-500 mt-1">Score: {p.intent_score}</p>
                  )}
                </button>
              ))}
            </div>

            {/* Detail panel */}
            <div className="flex-1 overflow-y-auto">
              {!selected ? (
                <div className="flex h-full items-center justify-center text-slate-500">
                  <p>Select a prospect to compose and send</p>
                </div>
              ) : (
                <div className="space-y-5">
                  {/* Prospect info */}
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div>
                        <h2 className="text-xl font-black text-white">{selected.business_name}</h2>
                        <p className="text-sm text-slate-400">{selected.address}</p>
                        {selected.phone && <p className="text-sm text-cyan-400">{selected.phone}</p>}
                        {selected.website && (
                          <a href={selected.website} target="_blank" rel="noopener noreferrer"
                            className="text-sm text-slate-400 hover:text-cyan-400 underline">{selected.website}</a>
                        )}
                      </div>
                      <button onClick={() => deleteProspect(selected.id)}
                        className="text-xs text-slate-600 hover:text-red-400 transition">Remove</button>
                    </div>

                    {/* Status controls */}
                    <div className="flex flex-wrap gap-2">
                      {['new', 'sent', 'replied', 'booked', 'not_interested'].map((s) => (
                        <button key={s} onClick={() => updateStatus(selected.id, s)}
                          className={`rounded-full px-3 py-1 text-xs font-bold capitalize transition border ${selected.status === s ? 'bg-cyan-400 text-black border-transparent' : 'border-white/10 text-slate-400 hover:text-white'}`}>
                          {s.replace('_', ' ')}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Email compose */}
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold uppercase tracking-widest text-cyan-400">Compose Outreach Email</p>
                      <button onClick={compose} disabled={composing}
                        className="rounded-xl bg-cyan-400/10 border border-cyan-400/30 px-4 py-1.5 text-xs font-black text-cyan-400 hover:bg-cyan-400/20 transition disabled:opacity-50">
                        {composing ? 'AI Writing...' : emailDraft.subject ? 'Regenerate' : 'AI Compose'}
                      </button>
                    </div>

                    <div>
                      <label className="block text-xs text-slate-400 mb-1">To (email address)</label>
                      <input value={toEmail} onChange={(e) => setToEmail(e.target.value)}
                        placeholder="contact@businessname.com"
                        className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-2.5 text-sm text-white outline-none focus:border-cyan-400" />
                      {selected.website && (
                        <p className="mt-1 text-xs text-slate-500">
                          Find email at: <a href={selected.website} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">{selected.website}</a>
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Subject</label>
                      <input value={emailDraft.subject} onChange={(e) => setEmailDraft((d) => ({ ...d, subject: e.target.value }))}
                        placeholder="Subject line..."
                        className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-2.5 text-sm text-white outline-none focus:border-cyan-400" />
                    </div>

                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Body</label>
                      <textarea value={emailDraft.body} onChange={(e) => setEmailDraft((d) => ({ ...d, body: e.target.value }))}
                        rows={10} placeholder="Click 'AI Compose' to generate a personalized email..."
                        className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400 resize-none" />
                    </div>

                    <div className="flex items-center gap-4">
                      <button onClick={send} disabled={sending || !toEmail || !emailDraft.subject || !emailDraft.body}
                        className="rounded-xl bg-cyan-400 px-8 py-3 text-sm font-black text-black disabled:opacity-40 hover:bg-cyan-300 transition">
                        {sending ? 'Sending...' : 'Send Email'}
                      </button>
                      {sentMsg && (
                        <span className={`text-sm font-bold ${sentMsg === 'Sent!' ? 'text-green-400' : 'text-red-400'}`}>
                          {sentMsg}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* SENT TAB */}
        {tab === 'sent' && (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <p className="text-xs font-bold uppercase tracking-widest text-cyan-400 mb-4">Sent Emails</p>
            {sentEmails.length === 0 ? (
              <p className="text-sm text-slate-500">No emails sent yet. Start from the Pipeline tab.</p>
            ) : (
              <div className="space-y-3">
                {sentEmails.map((e, i) => (
                  <div key={i} className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <p className="font-bold text-white text-sm">{e.subject}</p>
                    <p className="text-xs text-slate-400">{new Date(e.sent_at).toLocaleString('en-US', { timeZone: 'America/Chicago' })}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}
