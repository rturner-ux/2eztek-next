'use client'

import { useCallback, useEffect, useState } from 'react'

type Target = {
  id: string
  name: string
  url: string
  category: 'citation' | 'manufacturer' | 'press' | 'content'
  priority: 'high' | 'medium' | 'low'
  status: 'not_started' | 'submitted' | 'live' | 'rejected'
  notes: string
  submitted_at: string | null
  live_at: string | null
  created_at: string
}

const STATUS_ORDER: Target['status'][] = ['not_started', 'submitted', 'live', 'rejected']

const STATUS_META: Record<Target['status'], { label: string; color: string; next?: Target['status'] }> = {
  not_started: { label: 'Not Started', color: 'text-white/30 border-white/10 bg-white/[0.03]',          next: 'submitted' },
  submitted:   { label: 'Submitted',   color: 'text-amber-400 border-amber-400/30 bg-amber-400/[0.08]', next: 'live'      },
  live:        { label: 'Live',        color: 'text-emerald-400 border-emerald-400/30 bg-emerald-400/[0.08]' },
  rejected:    { label: 'Rejected',    color: 'text-red-400 border-red-400/30 bg-red-400/[0.08]' },
}

const CAT_META: Record<string, { label: string; color: string }> = {
  citation:     { label: 'Citation',     color: 'text-cyan-400 border-cyan-400/25 bg-cyan-400/[0.07]'     },
  manufacturer: { label: 'Manufacturer', color: 'text-violet-400 border-violet-400/25 bg-violet-400/[0.07]' },
  press:        { label: 'Press',        color: 'text-pink-400 border-pink-400/25 bg-pink-400/[0.07]'     },
  content:      { label: 'Content',      color: 'text-amber-400 border-amber-400/25 bg-amber-400/[0.07]'  },
}

const PRIORITY_DOT: Record<string, string> = {
  high: 'bg-red-400', medium: 'bg-amber-400', low: 'bg-white/20',
}

const CATEGORIES = ['citation', 'manufacturer', 'press', 'content'] as const
const NEW_CATS   = [...CATEGORIES]
const NEW_PRIS   = ['high', 'medium', 'low'] as const

export default function BacklinksPage() {
  const [password, setPassword]       = useState('')
  const [authorized, setAuthorized]   = useState(false)
  const [authError, setAuthError]     = useState('')
  const [targets, setTargets]         = useState<Target[]>([])
  const [loading, setLoading]         = useState(false)
  const [needsSetup, setNeedsSetup]   = useState(false)
  const [toast, setToast]             = useState('')

  const [catFilter, setCatFilter]     = useState<string>('all')
  const [statFilter, setStatFilter]   = useState<string>('all')
  const [expandNotes, setExpandNotes] = useState<Set<string>>(new Set())

  const [showAdd, setShowAdd]         = useState(false)
  const [newName, setNewName]         = useState('')
  const [newUrl, setNewUrl]           = useState('')
  const [newCat, setNewCat]           = useState<typeof CATEGORIES[number]>('citation')
  const [newPri, setNewPri]           = useState<typeof NEW_PRIS[number]>('medium')
  const [newNotes, setNewNotes]       = useState('')
  const [addSaving, setAddSaving]     = useState(false)

  const [editNoteId, setEditNoteId]   = useState<string | null>(null)
  const [editNoteVal, setEditNoteVal] = useState('')

  const [seeding, setSeeding]         = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('blogAdminPassword')
    if (saved) { setPassword(saved); setAuthorized(true) }
  }, [])

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const hdrs = useCallback(() => ({
    'Content-Type': 'application/json',
    'x-admin-password': password,
  }), [password])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res  = await fetch('/api/admin/backlinks', { headers: hdrs() })
      const data = await res.json()
      if (data.needsSetup) { setNeedsSetup(true); return }
      if (data.success) setTargets(data.targets || [])
    } finally { setLoading(false) }
  }, [hdrs])

  useEffect(() => { if (authorized) load() }, [authorized, load])

  async function login() {
    if (!password) { setAuthError('Enter the admin password.'); return }
    const res = await fetch('/api/admin/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }) })
    if (res.ok) { localStorage.setItem('blogAdminPassword', password); setAuthorized(true) }
    else setAuthError('Incorrect password.')
  }

  async function seed() {
    setSeeding(true)
    try {
      const res  = await fetch('/api/admin/backlinks', { method: 'POST', headers: hdrs(), body: JSON.stringify({ seed: true }) })
      const data = await res.json()
      if (data.needsSetup) { setNeedsSetup(true); return }
      if (data.success) { showToast(`${data.count} targets added.`); load() }
    } finally { setSeeding(false) }
  }

  async function advanceStatus(t: Target) {
    const next = STATUS_META[t.status].next
    if (!next) return
    const res  = await fetch(`/api/admin/backlinks/${t.id}`, { method: 'PATCH', headers: hdrs(), body: JSON.stringify({ status: next }) })
    const data = await res.json()
    if (data.success) {
      setTargets(prev => prev.map(x => x.id === t.id ? data.target : x))
      showToast(`Marked as ${STATUS_META[next].label}.`)
    }
  }

  async function setRejected(t: Target) {
    const res  = await fetch(`/api/admin/backlinks/${t.id}`, { method: 'PATCH', headers: hdrs(), body: JSON.stringify({ status: 'rejected' }) })
    const data = await res.json()
    if (data.success) { setTargets(prev => prev.map(x => x.id === t.id ? data.target : x)); showToast('Marked as rejected.') }
  }

  async function resetStatus(t: Target) {
    const res  = await fetch(`/api/admin/backlinks/${t.id}`, { method: 'PATCH', headers: hdrs(), body: JSON.stringify({ status: 'not_started', submitted_at: null, live_at: null }) })
    const data = await res.json()
    if (data.success) { setTargets(prev => prev.map(x => x.id === t.id ? data.target : x)) }
  }

  async function saveNote(id: string) {
    const res  = await fetch(`/api/admin/backlinks/${id}`, { method: 'PATCH', headers: hdrs(), body: JSON.stringify({ notes: editNoteVal }) })
    const data = await res.json()
    if (data.success) { setTargets(prev => prev.map(x => x.id === id ? data.target : x)); setEditNoteId(null); showToast('Note saved.') }
  }

  async function deleteTarget(id: string) {
    if (!confirm('Delete this target?')) return
    await fetch(`/api/admin/backlinks/${id}`, { method: 'DELETE', headers: hdrs() })
    setTargets(prev => prev.filter(x => x.id !== id))
    showToast('Deleted.')
  }

  async function addTarget() {
    if (!newName.trim()) return
    setAddSaving(true)
    try {
      const res  = await fetch('/api/admin/backlinks', { method: 'POST', headers: hdrs(), body: JSON.stringify({ name: newName, url: newUrl, category: newCat, priority: newPri, notes: newNotes }) })
      const data = await res.json()
      if (data.success) {
        setTargets(prev => [...prev, data.target])
        setNewName(''); setNewUrl(''); setNewNotes(''); setShowAdd(false)
        showToast('Target added.')
      }
    } finally { setAddSaving(false) }
  }

  function toggleNotes(id: string) {
    setExpandNotes(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s })
  }

  const filtered = targets.filter(t =>
    (catFilter  === 'all' || t.category === catFilter) &&
    (statFilter === 'all' || t.status   === statFilter)
  )

  const liveCount      = targets.filter(t => t.status === 'live').length
  const submittedCount = targets.filter(t => t.status === 'submitted').length
  const totalCount     = targets.length

  // Group by priority within filtered list
  const high   = filtered.filter(t => t.priority === 'high')
  const medium = filtered.filter(t => t.priority === 'medium')
  const low    = filtered.filter(t => t.priority === 'low')

  const SQL = `create table backlink_targets (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  url text default '',
  category text default 'citation',
  priority text default 'medium',
  status text default 'not_started',
  notes text default '',
  submitted_at timestamptz,
  live_at timestamptz,
  updated_at timestamptz,
  created_at timestamptz default now()
);`

  if (!authorized) return (
    <main className="flex min-h-screen items-center justify-center bg-[#050B14] px-6">
      <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-black/50 p-8 shadow-2xl backdrop-blur-2xl">
        <div className="mb-4 inline-flex rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-1 text-xs font-black uppercase tracking-[0.25em] text-emerald-300">Backlink Tracker</div>
        <h1 className="text-3xl font-black text-white">Admin Access</h1>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') login() }} placeholder="Admin password" autoFocus className="mt-8 w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-white outline-none transition focus:border-emerald-400 placeholder:text-white/30" />
        {authError && <p className="mt-3 text-sm text-red-400">{authError}</p>}
        <button onClick={login} className="mt-4 w-full rounded-2xl bg-emerald-400 px-7 py-4 text-sm font-black uppercase tracking-[0.16em] text-black transition hover:bg-emerald-300">Enter</button>
      </div>
    </main>
  )

  return (
    <main className="min-h-screen bg-[#050B14] px-6 pb-24 pt-28 text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_right,rgba(52,211,153,0.05),transparent_40%)]" />

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-6 py-3 text-sm font-bold text-emerald-300 shadow-2xl backdrop-blur-xl">{toast}</div>
      )}

      <div className="relative mx-auto max-w-5xl">

        {/* Header */}
        <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
          <div>
            <div className="mb-4 inline-flex rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-1 text-xs font-black uppercase tracking-[0.25em] text-emerald-300">SEO</div>
            <h1 className="text-5xl font-black">Backlink Tracker</h1>
            <p className="mt-2 text-white/50">Log citations, manufacturer listings, and outreach. Track what's live.</p>
          </div>
          <div className="flex gap-3">
            <button onClick={load} disabled={loading} className="rounded-2xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-bold text-white/50 transition hover:text-white disabled:opacity-40">
              {loading ? 'Loading…' : 'Refresh'}
            </button>
            <a href="/admin/competitor-intel" className="rounded-2xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-bold text-white/50 transition hover:text-white">← Competitor Intel</a>
          </div>
        </div>

        {/* Needs setup */}
        {needsSetup && (
          <div className="rounded-2xl border border-amber-400/20 bg-amber-400/5 p-6">
            <p className="mb-3 text-sm font-bold text-amber-400">Table not found. Run this SQL in your Supabase dashboard:</p>
            <pre className="overflow-x-auto rounded-xl bg-black/50 p-4 text-xs text-white/70">{SQL}</pre>
            <button onClick={() => { setNeedsSetup(false); load() }} className="mt-4 rounded-xl bg-amber-400 px-5 py-2 text-sm font-black text-black">Retry after creating table</button>
          </div>
        )}

        {!needsSetup && (
          <>
            {/* Stats */}
            <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                { label: 'Total Targets', value: totalCount, color: 'text-white' },
                { label: 'Live Links',    value: liveCount,      color: 'text-emerald-400' },
                { label: 'Submitted',     value: submittedCount, color: 'text-amber-400'   },
                { label: 'Coverage',      value: totalCount ? `${Math.round(liveCount / totalCount * 100)}%` : '0%', color: liveCount / Math.max(totalCount, 1) >= 0.5 ? 'text-emerald-400' : 'text-red-400' },
              ].map(({ label, value, color }) => (
                <div key={label} className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5">
                  <div className={`text-3xl font-black ${color}`}>{value}</div>
                  <div className="mt-1 text-xs font-bold uppercase tracking-widest text-white/35">{label}</div>
                </div>
              ))}
            </div>

            {/* Progress bar */}
            {totalCount > 0 && (
              <div className="mb-8 rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5">
                <div className="mb-2 flex justify-between text-xs font-bold text-white/40">
                  <span>Live links built</span>
                  <span>{liveCount} / {totalCount}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
                  <div className="h-full rounded-full bg-emerald-400 transition-all" style={{ width: `${Math.round(liveCount / totalCount * 100)}%` }} />
                </div>
                <div className="mt-2 flex gap-4 text-[10px] text-white/30">
                  {STATUS_ORDER.map(s => {
                    const n = targets.filter(t => t.status === s).length
                    if (!n) return null
                    return <span key={s}>{STATUS_META[s].label}: {n}</span>
                  })}
                </div>
              </div>
            )}

            {/* Filters + actions */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                {/* Category */}
                {['all', ...CATEGORIES].map(c => (
                  <button key={c} onClick={() => setCatFilter(c)}
                    className={`rounded-full px-4 py-1.5 text-xs font-black uppercase tracking-widest transition ${catFilter === c ? 'bg-white/10 text-white' : 'text-white/30 hover:text-white/60'}`}>
                    {c === 'all' ? 'All' : CAT_META[c]?.label ?? c}
                  </button>
                ))}
                <span className="mx-1 text-white/10">|</span>
                {/* Status */}
                {['all', ...STATUS_ORDER].map(s => (
                  <button key={s} onClick={() => setStatFilter(s)}
                    className={`rounded-full px-4 py-1.5 text-xs font-black uppercase tracking-widest transition ${statFilter === s ? 'bg-white/10 text-white' : 'text-white/30 hover:text-white/60'}`}>
                    {s === 'all' ? 'All Status' : STATUS_META[s as Target['status']].label}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                {targets.length === 0 && (
                  <button onClick={seed} disabled={seeding} className="rounded-2xl border border-amber-400/30 bg-amber-400/10 px-4 py-2 text-xs font-black uppercase tracking-widest text-amber-400 transition hover:bg-amber-400/20 disabled:opacity-40">
                    {seeding ? 'Seeding…' : 'Seed Default Targets'}
                  </button>
                )}
                <button onClick={() => setShowAdd(v => !v)} className="rounded-2xl bg-emerald-400 px-4 py-2 text-xs font-black uppercase tracking-widest text-black transition hover:bg-emerald-300">
                  + Add Target
                </button>
              </div>
            </div>

            {/* Add form */}
            {showAdd && (
              <div className="mb-6 rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-5">
                <div className="mb-4 text-xs font-black uppercase tracking-widest text-emerald-400">New Target</div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Site name *" className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400 placeholder:text-white/25" />
                  <input value={newUrl}  onChange={e => setNewUrl(e.target.value)}  placeholder="URL (optional)" className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400 placeholder:text-white/25" />
                  <select value={newCat} onChange={e => setNewCat(e.target.value as typeof newCat)} className="rounded-xl border border-white/10 bg-[#050B14] px-4 py-3 text-sm text-white outline-none focus:border-emerald-400">
                    {NEW_CATS.map(c => <option key={c} value={c}>{CAT_META[c].label}</option>)}
                  </select>
                  <select value={newPri} onChange={e => setNewPri(e.target.value as typeof newPri)} className="rounded-xl border border-white/10 bg-[#050B14] px-4 py-3 text-sm text-white outline-none focus:border-emerald-400">
                    {NEW_PRIS.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)} Priority</option>)}
                  </select>
                  <textarea value={newNotes} onChange={e => setNewNotes(e.target.value)} placeholder="Notes" rows={2} className="sm:col-span-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400 resize-none placeholder:text-white/25" />
                </div>
                <div className="mt-3 flex gap-2">
                  <button onClick={addTarget} disabled={addSaving || !newName.trim()} className="rounded-2xl bg-emerald-400 px-5 py-2 text-sm font-black text-black disabled:opacity-40">{addSaving ? 'Saving…' : 'Add'}</button>
                  <button onClick={() => setShowAdd(false)} className="rounded-2xl border border-white/10 px-4 py-2 text-sm font-bold text-white/40 hover:text-white">Cancel</button>
                </div>
              </div>
            )}

            {/* Target list grouped by priority */}
            {loading ? (
              <div className="py-16 text-center text-white/30">Loading targets…</div>
            ) : filtered.length === 0 && targets.length === 0 ? (
              <div className="py-16 text-center">
                <p className="text-white/30 mb-4">No backlink targets yet.</p>
                <button onClick={seed} disabled={seeding} className="rounded-2xl bg-emerald-400 px-6 py-3 text-sm font-black text-black disabled:opacity-40">
                  {seeding ? 'Adding…' : 'Seed 23 Default Targets'}
                </button>
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-16 text-center text-white/30">No targets match this filter.</div>
            ) : (
              <div className="space-y-8">
                {[
                  { label: 'High Priority', items: high,   dot: 'bg-red-400'    },
                  { label: 'Medium Priority', items: medium, dot: 'bg-amber-400'  },
                  { label: 'Low Priority',  items: low,    dot: 'bg-white/20'   },
                ].map(({ label, items, dot }) => items.length > 0 && (
                  <div key={label}>
                    <div className="mb-3 flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${dot}`} />
                      <span className="text-xs font-black uppercase tracking-widest text-white/35">{label}</span>
                      <span className="text-xs text-white/20">({items.length})</span>
                    </div>
                    <div className="space-y-2">
                      {items.map(t => {
                        const sm = STATUS_META[t.status]
                        const cm = CAT_META[t.category] ?? CAT_META.citation
                        const hasNext = !!sm.next
                        const notesOpen = expandNotes.has(t.id)
                        return (
                          <div key={t.id} className="rounded-2xl border border-white/[0.07] bg-white/[0.03] px-5 py-4">
                            <div className="flex flex-wrap items-start gap-3">
                              {/* Priority dot */}
                              <span className={`mt-1 h-2 w-2 flex-shrink-0 rounded-full ${PRIORITY_DOT[t.priority]}`} />

                              {/* Name + URL */}
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  {t.url ? (
                                    <a href={t.url} target="_blank" rel="noopener noreferrer" className="font-bold text-white hover:text-emerald-400 transition-colors">{t.name}</a>
                                  ) : (
                                    <span className="font-bold text-white">{t.name}</span>
                                  )}
                                  <span className={`rounded-full border px-2 py-0.5 text-[10px] font-black uppercase tracking-widest ${cm.color}`}>{cm.label}</span>
                                  <span className={`rounded-full border px-2 py-0.5 text-[10px] font-black uppercase tracking-widest ${sm.color}`}>{sm.label}</span>
                                </div>
                                {t.submitted_at && <p className="mt-0.5 text-[10px] text-white/25">Submitted {new Date(t.submitted_at).toLocaleDateString()}{t.live_at ? ` · Live ${new Date(t.live_at).toLocaleDateString()}` : ''}</p>}
                              </div>

                              {/* Actions */}
                              <div className="flex flex-shrink-0 flex-wrap items-center gap-1.5">
                                {hasNext && (
                                  <button onClick={() => advanceStatus(t)}
                                    className="rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-emerald-400 transition hover:bg-emerald-400/20">
                                    Mark {STATUS_META[sm.next!].label}
                                  </button>
                                )}
                                {t.status !== 'rejected' && t.status !== 'not_started' && (
                                  <button onClick={() => setRejected(t)} className="rounded-xl border border-white/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-white/25 transition hover:border-red-400/30 hover:text-red-400">
                                    Reject
                                  </button>
                                )}
                                {(t.status === 'rejected') && (
                                  <button onClick={() => resetStatus(t)} className="rounded-xl border border-white/10 px-2.5 py-1 text-[10px] text-white/25 hover:text-white">
                                    Reset
                                  </button>
                                )}
                                <button onClick={() => toggleNotes(t.id)} className="rounded-xl border border-white/10 px-2.5 py-1 text-[10px] text-white/25 hover:text-white">
                                  {notesOpen ? 'Hide' : 'Notes'}
                                </button>
                                <button onClick={() => deleteTarget(t.id)} className="rounded-xl border border-white/10 px-2.5 py-1 text-[10px] text-white/20 transition hover:border-red-400/30 hover:text-red-400">✕</button>
                              </div>
                            </div>

                            {/* Notes */}
                            {notesOpen && (
                              <div className="mt-3 pl-5">
                                {editNoteId === t.id ? (
                                  <div className="space-y-2">
                                    <textarea value={editNoteVal} onChange={e => setEditNoteVal(e.target.value)} rows={2} className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-emerald-400 resize-none" />
                                    <div className="flex gap-2">
                                      <button onClick={() => saveNote(t.id)} className="rounded-xl bg-emerald-400 px-4 py-1.5 text-xs font-black text-black">Save</button>
                                      <button onClick={() => setEditNoteId(null)} className="text-xs text-white/30 hover:text-white">Cancel</button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex gap-3">
                                    <p className="flex-1 text-sm text-white/45 leading-relaxed">{t.notes || <span className="text-white/20 italic">No notes</span>}</p>
                                    <button onClick={() => { setEditNoteId(t.id); setEditNoteVal(t.notes || '') }} className="flex-shrink-0 text-[10px] text-white/25 hover:text-white">Edit</button>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  )
}
