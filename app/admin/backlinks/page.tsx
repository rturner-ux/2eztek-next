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
  not_started: { label: 'Not Started', color: 'text-slate-500 border-slate-200 bg-slate-50',           next: 'submitted' },
  submitted:   { label: 'Submitted',   color: 'text-amber-700 border-amber-200 bg-amber-50',            next: 'live'      },
  live:        { label: 'Live',        color: 'text-emerald-700 border-emerald-200 bg-emerald-50'                        },
  rejected:    { label: 'Rejected',    color: 'text-red-700 border-red-200 bg-red-50'                                    },
}

const CAT_META: Record<string, { label: string; color: string }> = {
  citation:     { label: 'Citation',     color: 'text-sky-700 border-sky-200 bg-sky-50'       },
  manufacturer: { label: 'Manufacturer', color: 'text-violet-700 border-violet-200 bg-violet-50' },
  press:        { label: 'Press',        color: 'text-pink-700 border-pink-200 bg-pink-50'    },
  content:      { label: 'Content',      color: 'text-amber-700 border-amber-200 bg-amber-50' },
}

const PRIORITY_DOT: Record<string, string> = {
  high: 'bg-red-500', medium: 'bg-amber-500', low: 'bg-slate-300',
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
    <div className="flex min-h-[70vh] items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-1 text-[10px] font-black uppercase tracking-widest text-emerald-600">Backlink Tracker</div>
        <h1 className="text-xl font-black text-slate-900">Admin Access</h1>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') login() }} placeholder="Admin password" autoFocus className="mt-6 w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 placeholder:text-slate-400" />
        {authError && <p className="mt-2 text-sm text-red-600">{authError}</p>}
        <button onClick={login} className="mt-4 w-full rounded-lg bg-cyan-500 py-2.5 text-sm font-bold text-white transition hover:bg-cyan-600">Sign in</button>
      </div>
    </div>
  )

  return (
    <main className="px-6 pb-20 pt-10">

      {toast && (
        <div className="fixed bottom-5 right-5 z-50 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-white shadow-lg">{toast}</div>
      )}

      <div className="mx-auto max-w-5xl">

        {/* Header */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="mb-1 inline-block rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">SEO</span>
            <h1 className="text-2xl font-black text-slate-900">Backlink Tracker</h1>
            <p className="mt-0.5 text-sm text-slate-500">Log citations, manufacturer listings, and outreach. Track what's live.</p>
          </div>
          <button onClick={load} disabled={loading} className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:opacity-40">
            {loading ? 'Loading…' : 'Refresh'}
          </button>
        </div>

        {/* Needs setup */}
        {needsSetup && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-6">
            <p className="mb-3 text-sm font-semibold text-amber-800">Table not found. Run this SQL in your Supabase dashboard:</p>
            <pre className="overflow-x-auto rounded-lg border border-amber-200 bg-white p-4 text-xs text-slate-700">{SQL}</pre>
            <button onClick={() => { setNeedsSetup(false); load() }} className="mt-4 rounded-lg bg-amber-500 px-5 py-2 text-sm font-bold text-white hover:bg-amber-600">Retry after creating table</button>
          </div>
        )}

        {!needsSetup && (
          <>
            {/* Stats */}
            <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                { label: 'Total Targets', value: totalCount, color: 'text-slate-900' },
                { label: 'Live Links',    value: liveCount,      color: 'text-emerald-600' },
                { label: 'Submitted',     value: submittedCount, color: 'text-amber-600'   },
                { label: 'Coverage',      value: totalCount ? `${Math.round(liveCount / totalCount * 100)}%` : '0%', color: liveCount / Math.max(totalCount, 1) >= 0.5 ? 'text-emerald-600' : 'text-red-600' },
              ].map(({ label, value, color }) => (
                <div key={label} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className={`text-3xl font-black ${color}`}>{value}</div>
                  <div className="mt-1 text-xs font-semibold uppercase tracking-widest text-slate-400">{label}</div>
                </div>
              ))}
            </div>

            {/* Progress bar */}
            {totalCount > 0 && (
              <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-2 flex justify-between text-xs font-semibold text-slate-500">
                  <span>Live links built</span>
                  <span>{liveCount} / {totalCount}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${Math.round(liveCount / totalCount * 100)}%` }} />
                </div>
                <div className="mt-2 flex gap-4 text-[10px] text-slate-400">
                  {STATUS_ORDER.map(s => {
                    const n = targets.filter(t => t.status === s).length
                    if (!n) return null
                    return <span key={s}>{STATUS_META[s].label}: {n}</span>
                  })}
                </div>
              </div>
            )}

            {/* Filters + actions */}
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-1.5">
                {['all', ...CATEGORIES].map(c => (
                  <button key={c} onClick={() => setCatFilter(c)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold transition ${catFilter === c ? 'bg-slate-900 text-white' : 'border border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700'}`}>
                    {c === 'all' ? 'All' : CAT_META[c]?.label ?? c}
                  </button>
                ))}
                <span className="mx-0.5 self-center text-slate-200">|</span>
                {['all', ...STATUS_ORDER].map(s => (
                  <button key={s} onClick={() => setStatFilter(s)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold transition ${statFilter === s ? 'bg-slate-900 text-white' : 'border border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700'}`}>
                    {s === 'all' ? 'All Status' : STATUS_META[s as Target['status']].label}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                {targets.length === 0 && (
                  <button onClick={seed} disabled={seeding} className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-semibold text-amber-700 transition hover:bg-amber-100 disabled:opacity-40">
                    {seeding ? 'Seeding…' : 'Seed Default Targets'}
                  </button>
                )}
                <button onClick={() => setShowAdd(v => !v)} className="rounded-lg bg-cyan-500 px-4 py-2 text-xs font-bold text-white transition hover:bg-cyan-600">
                  + Add Target
                </button>
              </div>
            </div>

            {/* Add form */}
            {showAdd && (
              <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-500">New Target</div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Site name *" className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 placeholder:text-slate-400" />
                  <input value={newUrl}  onChange={e => setNewUrl(e.target.value)}  placeholder="URL (optional)" className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 placeholder:text-slate-400" />
                  <select value={newCat} onChange={e => setNewCat(e.target.value as typeof newCat)} className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-cyan-400">
                    {NEW_CATS.map(c => <option key={c} value={c}>{CAT_META[c].label}</option>)}
                  </select>
                  <select value={newPri} onChange={e => setNewPri(e.target.value as typeof newPri)} className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-cyan-400">
                    {NEW_PRIS.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)} Priority</option>)}
                  </select>
                  <textarea value={newNotes} onChange={e => setNewNotes(e.target.value)} placeholder="Notes" rows={2} className="sm:col-span-2 resize-none rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 placeholder:text-slate-400" />
                </div>
                <div className="mt-3 flex gap-2">
                  <button onClick={addTarget} disabled={addSaving || !newName.trim()} className="rounded-lg bg-cyan-500 px-5 py-2 text-sm font-bold text-white disabled:opacity-40">{addSaving ? 'Saving…' : 'Add'}</button>
                  <button onClick={() => setShowAdd(false)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-50">Cancel</button>
                </div>
              </div>
            )}

            {/* Target list grouped by priority */}
            {loading ? (
              <div className="py-16 text-center text-slate-400">Loading targets…</div>
            ) : filtered.length === 0 && targets.length === 0 ? (
              <div className="py-16 text-center">
                <p className="mb-4 text-slate-400">No backlink targets yet.</p>
                <button onClick={seed} disabled={seeding} className="rounded-lg bg-cyan-500 px-6 py-2.5 text-sm font-bold text-white disabled:opacity-40">
                  {seeding ? 'Adding…' : 'Seed 23 Default Targets'}
                </button>
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-16 text-center text-slate-400">No targets match this filter.</div>
            ) : (
              <div className="space-y-8">
                {[
                  { label: 'High Priority',   items: high,   dot: 'bg-red-500'   },
                  { label: 'Medium Priority', items: medium, dot: 'bg-amber-500' },
                  { label: 'Low Priority',    items: low,    dot: 'bg-slate-300' },
                ].map(({ label, items, dot }) => items.length > 0 && (
                  <div key={label}>
                    <div className="mb-3 flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${dot}`} />
                      <span className="text-xs font-bold uppercase tracking-widest text-slate-500">{label}</span>
                      <span className="text-xs text-slate-300">({items.length})</span>
                    </div>
                    <div className="space-y-2">
                      {items.map(t => {
                        const sm = STATUS_META[t.status]
                        const cm = CAT_META[t.category] ?? CAT_META.citation
                        const hasNext = !!sm.next
                        const notesOpen = expandNotes.has(t.id)
                        return (
                          <div key={t.id} className="rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
                            <div className="flex flex-wrap items-start gap-3">
                              <span className={`mt-1.5 h-2 w-2 flex-shrink-0 rounded-full ${PRIORITY_DOT[t.priority]}`} />

                              <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  {t.url ? (
                                    <a href={t.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-slate-900 hover:text-cyan-600 transition-colors">{t.name}</a>
                                  ) : (
                                    <span className="font-semibold text-slate-900">{t.name}</span>
                                  )}
                                  <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${cm.color}`}>{cm.label}</span>
                                  <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${sm.color}`}>{sm.label}</span>
                                </div>
                                {t.submitted_at && <p className="mt-0.5 text-[10px] text-slate-400">Submitted {new Date(t.submitted_at).toLocaleDateString()}{t.live_at ? ` · Live ${new Date(t.live_at).toLocaleDateString()}` : ''}</p>}
                              </div>

                              <div className="flex flex-shrink-0 flex-wrap items-center gap-1.5">
                                {hasNext && (
                                  <button onClick={() => advanceStatus(t)} className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1 text-[10px] font-semibold text-emerald-700 transition hover:bg-emerald-100">
                                    Mark {STATUS_META[sm.next!].label}
                                  </button>
                                )}
                                {t.status !== 'rejected' && t.status !== 'not_started' && (
                                  <button onClick={() => setRejected(t)} className="rounded-lg border border-slate-200 px-2.5 py-1 text-[10px] font-semibold text-slate-400 transition hover:border-red-200 hover:text-red-600">
                                    Reject
                                  </button>
                                )}
                                {t.status === 'rejected' && (
                                  <button onClick={() => resetStatus(t)} className="rounded-lg border border-slate-200 px-2.5 py-1 text-[10px] text-slate-400 hover:text-slate-700">Reset</button>
                                )}
                                <button onClick={() => toggleNotes(t.id)} className="rounded-lg border border-slate-200 px-2.5 py-1 text-[10px] text-slate-400 hover:text-slate-700">
                                  {notesOpen ? 'Hide' : 'Notes'}
                                </button>
                                <button onClick={() => deleteTarget(t.id)} className="rounded-lg border border-slate-200 px-2.5 py-1 text-[10px] text-slate-400 transition hover:border-red-200 hover:text-red-600">✕</button>
                              </div>
                            </div>

                            {notesOpen && (
                              <div className="mt-3 pl-5 border-t border-slate-100 pt-3">
                                {editNoteId === t.id ? (
                                  <div className="space-y-2">
                                    <textarea value={editNoteVal} onChange={e => setEditNoteVal(e.target.value)} rows={2} className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100" />
                                    <div className="flex gap-2">
                                      <button onClick={() => saveNote(t.id)} className="rounded-lg bg-cyan-500 px-4 py-1.5 text-xs font-bold text-white hover:bg-cyan-600">Save</button>
                                      <button onClick={() => setEditNoteId(null)} className="text-xs text-slate-400 hover:text-slate-700">Cancel</button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex gap-3">
                                    <p className="flex-1 text-sm text-slate-500 leading-relaxed">{t.notes || <span className="italic text-slate-300">No notes</span>}</p>
                                    <button onClick={() => { setEditNoteId(t.id); setEditNoteVal(t.notes || '') }} className="flex-shrink-0 text-[10px] text-slate-400 hover:text-slate-700">Edit</button>
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
