'use client'

import { useEffect, useState, useCallback } from 'react'

type QueryRow = {
  query: string
  count: number
  lastSeen: string
  covered: boolean
}

type PlatformRow = {
  platform: string
  count: number
  lastSeen: string
}

type Faq = {
  id: string
  question: string
  answer: string
  category: string
  active: boolean
  sort_order: number
}

type Tab = 'queries' | 'faqs'

const PLATFORM_ICONS: Record<string, string> = {
  google: 'G', chatgpt: 'AI', gemini: 'AI', copilot: 'AI', perplexity: 'AI',
  bing: 'B', yahoo: 'Y', facebook: 'fb', instagram: 'ig', yelp: 'Yp',
  thumbtack: 'TT', nextdoor: 'ND', 'google maps': 'Maps', 'apple maps': 'Maps',
}

const CATEGORIES = ['General', 'Services', 'Pricing', 'Brands', 'Areas', 'Commercial', 'Residential']

export default function SearchInsightsPage() {
  const [password, setPassword] = useState('')
  const [authorized, setAuthorized] = useState(false)
  const [authError, setAuthError] = useState('')
  const [tab, setTab] = useState<Tab>('queries')
  const [queries, setQueries]   = useState<QueryRow[]>([])
  const [platforms, setPlatforms] = useState<PlatformRow[]>([])
  const [faqs, setFaqs] = useState<Faq[]>([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState<'all' | 'gap' | 'covered'>('all')

  // FAQ generation modal
  const [genQuery, setGenQuery] = useState<string | null>(null)
  const [genQ, setGenQ] = useState('')
  const [genA, setGenA] = useState('')
  const [genCat, setGenCat] = useState('General')
  const [genLoading, setGenLoading] = useState(false)
  const [genSaving, setGenSaving] = useState(false)
  const [genError, setGenError] = useState('')

  // FAQ edit
  const [editId, setEditId] = useState<string | null>(null)
  const [editQ, setEditQ] = useState('')
  const [editA, setEditA] = useState('')
  const [editCat, setEditCat] = useState('')
  const [editSaving, setEditSaving] = useState(false)

  // New FAQ form
  const [showNewFaq, setShowNewFaq] = useState(false)
  const [newQ, setNewQ] = useState('')
  const [newA, setNewA] = useState('')
  const [newCat, setNewCat] = useState('General')
  const [newSaving, setNewSaving] = useState(false)

  const [toast, setToast] = useState('')

  useEffect(() => {
    const saved = localStorage.getItem('blogAdminPassword')
    if (saved) { setPassword(saved); setAuthorized(true) }
  }, [])

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  const headers = useCallback(() => ({
    'Content-Type': 'application/json',
    'x-admin-password': password,
  }), [password])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/search-insights', { headers: headers() })
      const data = await res.json()
      if (data.success) {
        setQueries(data.queries || [])
        setFaqs(data.faqs || [])
        setPlatforms(data.platforms || [])
      }
    } finally {
      setLoading(false)
    }
  }, [headers])

  async function login() {
    if (!password) { setAuthError('Enter the admin password.'); return }
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      if (res.ok) {
        localStorage.setItem('blogAdminPassword', password)
        setAuthorized(true)
      } else {
        setAuthError('Incorrect password.')
      }
    } catch {
      setAuthError('Could not connect.')
    }
  }

  useEffect(() => {
    if (authorized) load()
  }, [authorized, load])

  async function generateFaqDraft(query: string) {
    setGenQuery(query)
    setGenQ('')
    setGenA('')
    setGenCat('General')
    setGenError('')
    setGenLoading(true)
    try {
      const res = await fetch('/api/admin/credit-ai', {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({
          messages: [{
            role: 'user',
            content: `A customer found 2EZ TEK by searching: "${query}"

Generate a FAQ entry for the 2EZ TEK website (Dallas Fort Worth fitness equipment repair & installation company) that directly answers the intent behind this search.

Respond with ONLY valid JSON in this exact format, no markdown, no explanation:
{"question":"...","answer":"...","category":"Services|General|Pricing|Brands|Areas|Commercial|Residential"}

Rules:
- question: natural-sounding FAQ question, 8-15 words
- answer: 2-3 sentences, conversational, mentions Dallas Fort Worth, no em dashes
- category: pick the single most fitting category from the list`,
          }],
        }),
      })
      const data = await res.json()
      const raw = (data.content || data.result || '').replace(/```json|```/g, '').trim()
      const parsed = JSON.parse(raw)
      setGenQ(parsed.question || '')
      setGenA(parsed.answer || '')
      setGenCat(parsed.category || 'General')
    } catch {
      setGenError('Could not generate — fill in manually below.')
    } finally {
      setGenLoading(false)
    }
  }

  async function saveFaq() {
    if (!genQ.trim() || !genA.trim()) { setGenError('Question and answer required.'); return }
    setGenSaving(true)
    try {
      const res = await fetch('/api/admin/faqs', {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ question: genQ, answer: genA, category: genCat }),
      })
      const data = await res.json()
      if (data.success) {
        setFaqs((prev) => [...prev, data.faq])
        setGenQuery(null)
        showToast('FAQ added and will appear on the site homepage.')
        load()
      } else {
        setGenError(data.error || 'Save failed.')
      }
    } finally {
      setGenSaving(false)
    }
  }

  async function toggleActive(faq: Faq) {
    const res = await fetch(`/api/admin/faqs/${faq.id}`, {
      method: 'PATCH',
      headers: headers(),
      body: JSON.stringify({ active: !faq.active }),
    })
    const data = await res.json()
    if (data.success) {
      setFaqs((prev) => prev.map((f) => (f.id === faq.id ? { ...f, active: !f.active } : f)))
      showToast(faq.active ? 'FAQ hidden from site.' : 'FAQ is now live on the homepage.')
    }
  }

  async function deleteFaq(id: string) {
    if (!confirm('Delete this FAQ? This cannot be undone.')) return
    const res = await fetch(`/api/admin/faqs/${id}`, { method: 'DELETE', headers: headers() })
    const data = await res.json()
    if (data.success) {
      setFaqs((prev) => prev.filter((f) => f.id !== id))
      showToast('FAQ deleted.')
    }
  }

  function startEdit(faq: Faq) {
    setEditId(faq.id)
    setEditQ(faq.question)
    setEditA(faq.answer)
    setEditCat(faq.category)
  }

  async function saveEdit() {
    if (!editId) return
    setEditSaving(true)
    try {
      const res = await fetch(`/api/admin/faqs/${editId}`, {
        method: 'PATCH',
        headers: headers(),
        body: JSON.stringify({ question: editQ, answer: editA, category: editCat }),
      })
      const data = await res.json()
      if (data.success) {
        setFaqs((prev) => prev.map((f) => (f.id === editId ? { ...f, question: editQ, answer: editA, category: editCat } : f)))
        setEditId(null)
        showToast('FAQ updated.')
      }
    } finally {
      setEditSaving(false)
    }
  }

  async function addNewFaq() {
    if (!newQ.trim() || !newA.trim()) return
    setNewSaving(true)
    try {
      const res = await fetch('/api/admin/faqs', {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ question: newQ, answer: newA, category: newCat }),
      })
      const data = await res.json()
      if (data.success) {
        setFaqs((prev) => [...prev, data.faq])
        setNewQ(''); setNewA(''); setNewCat('General'); setShowNewFaq(false)
        showToast('FAQ added.')
      }
    } finally {
      setNewSaving(false)
    }
  }

  const displayedQueries = queries.filter((q) =>
    filter === 'all' ? true : filter === 'gap' ? !q.covered : q.covered
  )

  const gapCount = queries.filter((q) => !q.covered).length
  const coveredCount = queries.filter((q) => q.covered).length

  if (!authorized) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050B14] px-6">
        <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-black/50 p-8 shadow-2xl backdrop-blur-2xl">
          <div className="mb-4 inline-flex rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-1 text-xs font-black uppercase tracking-[0.25em] text-amber-300">
            Search Insights
          </div>
          <h1 className="text-3xl font-black text-white">Admin Access</h1>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') login() }}
            placeholder="Admin password"
            autoFocus
            className="mt-8 w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-white outline-none transition focus:border-amber-400 placeholder:text-white/30"
          />
          {authError && <p className="mt-3 text-sm text-red-400">{authError}</p>}
          <button onClick={login} className="mt-4 w-full rounded-2xl bg-amber-400 px-7 py-4 text-sm font-black uppercase tracking-[0.16em] text-black transition hover:bg-amber-300">
            Enter
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#050B14] px-6 pb-24 pt-28 text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.06),transparent_40%)]" />

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-6 py-3 text-sm font-bold text-emerald-300 shadow-2xl backdrop-blur-xl">
          {toast}
        </div>
      )}

      {/* Generate FAQ Modal */}
      {genQuery !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-[2rem] border border-white/10 bg-[#0a1220] p-8 shadow-2xl">
            <div className="mb-1 text-xs font-black uppercase tracking-widest text-amber-400">Generate FAQ</div>
            <p className="mb-6 text-white/50 text-sm">From search: <span className="text-white/80">&ldquo;{genQuery}&rdquo;</span></p>

            {genLoading ? (
              <div className="flex items-center gap-3 py-8 text-white/40">
                <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                AI is drafting the FAQ...
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-widest text-white/40">Question</label>
                  <input
                    value={genQ}
                    onChange={(e) => setGenQ(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-widest text-white/40">Answer</label>
                  <textarea
                    value={genA}
                    onChange={(e) => setGenA(e.target.value)}
                    rows={4}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-amber-400 resize-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-widest text-white/40">Category</label>
                  <select
                    value={genCat}
                    onChange={(e) => setGenCat(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#0a1220] px-4 py-3 text-white outline-none focus:border-amber-400"
                  >
                    {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                {genError && <p className="text-sm text-red-400">{genError}</p>}
              </div>
            )}

            <div className="mt-6 flex gap-3">
              <button
                onClick={saveFaq}
                disabled={genSaving || genLoading}
                className="flex-1 rounded-2xl bg-amber-400 py-3 text-sm font-black uppercase tracking-widest text-black transition hover:bg-amber-300 disabled:opacity-40"
              >
                {genSaving ? 'Saving...' : 'Add to Site'}
              </button>
              <button
                onClick={() => setGenQuery(null)}
                className="rounded-2xl border border-white/10 px-6 py-3 text-sm font-bold text-white/50 transition hover:text-white"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="relative mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
          <div>
            <div className="mb-4 inline-flex rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-1 text-xs font-black uppercase tracking-[0.25em] text-amber-300">
              SEO
            </div>
            <h1 className="text-5xl font-black">Search Insights</h1>
            <p className="mt-2 text-white/50">What customers searched before booking — and where your FAQ coverage has gaps.</p>
          </div>
          <div className="flex gap-3">
            <button onClick={load} disabled={loading} className="rounded-2xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-bold text-white/50 transition hover:text-white disabled:opacity-40">
              {loading ? 'Loading...' : 'Refresh'}
            </button>
            <a href="/admin" className="rounded-2xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-bold text-white/50 transition hover:text-white">
              Admin Hub
            </a>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: 'Real Queries', value: queries.length, color: 'text-white' },
            { label: 'FAQ Gaps', value: gapCount, color: 'text-red-400' },
            { label: 'Covered', value: coveredCount, color: 'text-emerald-400' },
            { label: 'FAQs Live', value: faqs.filter((f) => f.active).length, color: 'text-amber-400' },
          ].map(({ label, value, color }) => (
            <div key={label} className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5">
              <div className={`text-3xl font-black ${color}`}>{value}</div>
              <div className="mt-1 text-xs font-bold uppercase tracking-widest text-white/35">{label}</div>
            </div>
          ))}
        </div>

        {/* Platform / AI traffic attribution */}
        {platforms.length > 0 && (
          <div className="mb-8 rounded-2xl border border-violet-400/20 bg-violet-400/[0.05] p-5">
            <div className="mb-3 flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-widest text-violet-400">AI &amp; Platform Traffic</span>
              <span className="rounded-full border border-violet-400/20 bg-violet-400/10 px-2 py-0.5 text-[10px] font-black text-violet-400">{platforms.reduce((s, p) => s + p.count, 0)} customers</span>
            </div>
            <p className="mb-4 text-xs text-white/35">These customers typed the platform name instead of their search query — they tell you which channel sent them, not what keyword they used. Optimize your site content and Google Business Profile to stay visible on these platforms.</p>
            <div className="flex flex-wrap gap-2">
              {platforms.map((p) => {
                const isAI = ['chatgpt', 'gemini', 'copilot', 'perplexity', 'claude', 'gpt', 'ai'].includes(p.platform)
                return (
                  <div key={p.platform} className={`flex items-center gap-2 rounded-full border px-3 py-1.5 ${isAI ? 'border-cyan-400/25 bg-cyan-400/[0.07]' : 'border-white/10 bg-white/[0.03]'}`}>
                    <span className={`text-[10px] font-black uppercase ${isAI ? 'text-cyan-400' : 'text-white/40'}`}>
                      {PLATFORM_ICONS[p.platform] ?? p.platform.slice(0, 2).toUpperCase()}
                    </span>
                    <span className={`text-sm font-bold capitalize ${isAI ? 'text-cyan-300' : 'text-white/70'}`}>{p.platform}</span>
                    <span className={`text-xs font-black ${isAI ? 'text-cyan-400' : 'text-white/40'}`}>{p.count}x</span>
                  </div>
                )
              })}
            </div>
            {platforms.some(p => ['chatgpt', 'gemini', 'copilot', 'perplexity'].includes(p.platform)) && (
              <p className="mt-3 text-xs text-cyan-400/70">AI assistants are actively recommending 2EZ TEK. Keep your Google Business Profile complete and your site content answer-rich to maintain this visibility.</p>
            )}
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6 flex gap-2">
          {(['queries', 'faqs'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-full px-5 py-2 text-sm font-black uppercase tracking-widest transition ${tab === t ? 'bg-amber-400 text-black' : 'border border-white/10 text-white/40 hover:text-white'}`}
            >
              {t === 'queries' ? 'Search Queries' : 'FAQ Manager'}
            </button>
          ))}
        </div>

        {/* QUERIES TAB */}
        {tab === 'queries' && (
          <div>
            {/* Filter pills */}
            <div className="mb-4 flex gap-2">
              {(['all', 'gap', 'covered'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`rounded-full px-4 py-1.5 text-xs font-black uppercase tracking-widest transition ${filter === f ? 'bg-white/10 text-white' : 'text-white/30 hover:text-white/60'}`}
                >
                  {f === 'all' ? `All (${queries.length})` : f === 'gap' ? `Gaps (${gapCount})` : `Covered (${coveredCount})`}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="py-16 text-center text-white/30">Loading search data...</div>
            ) : displayedQueries.length === 0 ? (
              <div className="py-16 text-center text-white/30">No queries found.</div>
            ) : (
              <div className="divide-y divide-white/[0.05] rounded-2xl border border-white/[0.07] bg-white/[0.03] overflow-hidden">
                {displayedQueries.map((row, i) => (
                  <div key={i} className="flex items-center gap-4 px-6 py-4">
                    {/* Coverage badge */}
                    <span className={`flex-shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest ${row.covered ? 'border border-emerald-400/30 bg-emerald-400/10 text-emerald-400' : 'border border-red-400/30 bg-red-400/10 text-red-400'}`}>
                      {row.covered ? 'Covered' : 'Gap'}
                    </span>

                    {/* Query text */}
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm text-white/90">{row.query}</p>
                      <p className="text-xs text-white/30 mt-0.5">
                        {row.count > 1 ? `${row.count} customers` : '1 customer'} &middot; {row.lastSeen ? new Date(row.lastSeen).toLocaleDateString() : ''}
                      </p>
                    </div>

                    {/* Count badge */}
                    {row.count > 1 && (
                      <span className="flex-shrink-0 rounded-full border border-white/10 px-2.5 py-0.5 text-xs font-bold text-white/50">
                        x{row.count}
                      </span>
                    )}

                    {/* Action */}
                    {!row.covered && (
                      <button
                        onClick={() => generateFaqDraft(row.query)}
                        className="flex-shrink-0 rounded-xl border border-amber-400/30 bg-amber-400/10 px-3 py-1.5 text-xs font-black uppercase tracking-widest text-amber-400 transition hover:bg-amber-400/20"
                      >
                        Generate FAQ
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* FAQS TAB */}
        {tab === 'faqs' && (
          <div>
            <div className="mb-4 flex justify-end">
              <button
                onClick={() => setShowNewFaq((v) => !v)}
                className="rounded-2xl bg-amber-400 px-5 py-2.5 text-sm font-black uppercase tracking-widest text-black transition hover:bg-amber-300"
              >
                + Add FAQ
              </button>
            </div>

            {/* New FAQ form */}
            {showNewFaq && (
              <div className="mb-6 rounded-2xl border border-amber-400/20 bg-amber-400/5 p-6">
                <div className="mb-4 text-xs font-black uppercase tracking-widest text-amber-400">New FAQ</div>
                <div className="space-y-3">
                  <input
                    value={newQ}
                    onChange={(e) => setNewQ(e.target.value)}
                    placeholder="Question"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-amber-400 placeholder:text-white/25"
                  />
                  <textarea
                    value={newA}
                    onChange={(e) => setNewA(e.target.value)}
                    placeholder="Answer"
                    rows={3}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-amber-400 placeholder:text-white/25 resize-none"
                  />
                  <div className="flex gap-3">
                    <select
                      value={newCat}
                      onChange={(e) => setNewCat(e.target.value)}
                      className="flex-1 rounded-xl border border-white/10 bg-[#050B14] px-4 py-3 text-white outline-none focus:border-amber-400"
                    >
                      {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                    </select>
                    <button
                      onClick={addNewFaq}
                      disabled={newSaving || !newQ.trim() || !newA.trim()}
                      className="rounded-2xl bg-amber-400 px-6 py-3 text-sm font-black text-black disabled:opacity-40"
                    >
                      {newSaving ? 'Saving...' : 'Save'}
                    </button>
                    <button onClick={() => setShowNewFaq(false)} className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-bold text-white/40 hover:text-white">
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* FAQ list */}
            <div className="space-y-3">
              {faqs.length === 0 ? (
                <div className="py-16 text-center text-white/30">No FAQs yet.</div>
              ) : (
                faqs.map((faq) => (
                  <div key={faq.id} className={`rounded-2xl border p-5 transition ${faq.active ? 'border-white/[0.07] bg-white/[0.03]' : 'border-white/[0.04] bg-white/[0.01] opacity-50'}`}>
                    {editId === faq.id ? (
                      <div className="space-y-3">
                        <input
                          value={editQ}
                          onChange={(e) => setEditQ(e.target.value)}
                          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-amber-400"
                        />
                        <textarea
                          value={editA}
                          onChange={(e) => setEditA(e.target.value)}
                          rows={3}
                          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-amber-400 resize-none"
                        />
                        <div className="flex gap-3">
                          <select
                            value={editCat}
                            onChange={(e) => setEditCat(e.target.value)}
                            className="flex-1 rounded-xl border border-white/10 bg-[#050B14] px-4 py-3 text-white outline-none focus:border-amber-400"
                          >
                            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                          </select>
                          <button onClick={saveEdit} disabled={editSaving} className="rounded-2xl bg-amber-400 px-5 py-2 text-sm font-black text-black disabled:opacity-40">
                            {editSaving ? 'Saving...' : 'Save'}
                          </button>
                          <button onClick={() => setEditId(null)} className="rounded-2xl border border-white/10 px-4 py-2 text-sm font-bold text-white/40 hover:text-white">
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="mb-1 flex items-start justify-between gap-4">
                          <p className="font-bold text-white leading-snug">{faq.question}</p>
                          <div className="flex flex-shrink-0 items-center gap-2">
                            <span className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white/30">{faq.category}</span>
                            <button onClick={() => toggleActive(faq)} className={`rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest transition ${faq.active ? 'border-emerald-400/30 text-emerald-400 hover:border-red-400/30 hover:text-red-400' : 'border-white/10 text-white/30 hover:border-emerald-400/30 hover:text-emerald-400'}`}>
                              {faq.active ? 'Live' : 'Hidden'}
                            </button>
                            <button onClick={() => startEdit(faq)} className="rounded-full border border-white/10 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest text-white/30 transition hover:text-white">Edit</button>
                            <button onClick={() => deleteFaq(faq.id)} className="rounded-full border border-white/10 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest text-white/20 transition hover:border-red-400/30 hover:text-red-400">Del</button>
                          </div>
                        </div>
                        <p className="text-sm text-white/45 leading-relaxed">{faq.answer}</p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
