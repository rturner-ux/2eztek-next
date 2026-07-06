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

type Post = { slug: string; title: string; text: string }

type Tab = 'queries' | 'targets' | 'faqs'

type KeywordTarget = {
  keyword: string
  intent: string
  priority: 'high' | 'medium'
}

type TargetGroup = {
  label: string
  color: string
  targets: KeywordTarget[]
}

const KEYWORD_GROUPS: TargetGroup[] = [
  {
    label: 'Rogue Fitness Assembly',
    color: '#dc2626',
    targets: [
      { keyword: 'rogue fitness assembly dallas', intent: 'Hire someone to assemble Rogue rack in DFW', priority: 'high' },
      { keyword: 'rogue power rack assembly dallas fort worth', intent: 'Power rack build service', priority: 'high' },
      { keyword: 'rogue monster rack assembly dallas', intent: 'Commercial-grade Monster series install', priority: 'high' },
      { keyword: 'rogue rml-3w installation dallas', intent: 'Wall-mount fold rack install', priority: 'high' },
      { keyword: 'rogue wall mount squat rack installation dfw', intent: 'Wall mount installation service', priority: 'medium' },
      { keyword: 'rogue monster lite assembly dallas', intent: 'Monster Lite rack assembly', priority: 'medium' },
      { keyword: 'rogue squat stand assembly dallas', intent: 'SML-1/SML-2 stand assembly', priority: 'medium' },
    ],
  },
  {
    label: 'PRX Performance Assembly',
    color: '#2563eb',
    targets: [
      { keyword: 'prx folding rack installation dallas', intent: 'PRX fold rack professional install', priority: 'high' },
      { keyword: 'prx performance rack installation dallas fort worth', intent: 'Full PRX install service', priority: 'high' },
      { keyword: 'prx profile pro assembly dallas', intent: 'Profile PRO model installation', priority: 'high' },
      { keyword: 'prx squat rack assembly service dfw', intent: 'General PRX assembly', priority: 'medium' },
      { keyword: 'fold back squat rack installation dallas', intent: 'Fold-back style racks broadly', priority: 'medium' },
    ],
  },
  {
    label: 'Home Gym Setup',
    color: '#7c3aed',
    targets: [
      { keyword: 'home gym assembly service dallas fort worth', intent: 'Broad home gym setup', priority: 'high' },
      { keyword: 'home gym setup service dallas', intent: 'Full gym build service', priority: 'high' },
      { keyword: 'garage gym assembly dallas', intent: 'Garage gym specifically', priority: 'high' },
      { keyword: 'fitness equipment assembly service dfw', intent: 'General equipment assembly', priority: 'medium' },
      { keyword: 'gym equipment installation dallas tx', intent: 'Equipment install broadly', priority: 'medium' },
    ],
  },
  {
    label: 'Tonal Repair',
    color: '#0891b2',
    targets: [
      { keyword: 'tonal repair dallas fort worth', intent: 'Tonal needs service in DFW', priority: 'high' },
      { keyword: 'tonal service dallas', intent: 'Tonal service request', priority: 'high' },
      { keyword: 'tonal cable repair dallas', intent: 'Tonal cable issue', priority: 'medium' },
      { keyword: 'tonal touchscreen not working dallas', intent: 'Tonal screen issue', priority: 'medium' },
    ],
  },
  {
    label: 'Commercial Services',
    color: '#059669',
    targets: [
      { keyword: 'commercial gym equipment maintenance contract dallas', intent: 'Facility maintenance contract', priority: 'high' },
      { keyword: 'commercial gym equipment repair dallas fort worth', intent: 'Commercial repair broadly', priority: 'high' },
      { keyword: 'hotel gym equipment repair dallas', intent: 'Hotel facility maintenance', priority: 'medium' },
      { keyword: 'apartment gym equipment repair dfw', intent: 'Multifamily property manager', priority: 'medium' },
    ],
  },
  {
    label: 'Treadmill Repair',
    color: '#d97706',
    targets: [
      { keyword: 'treadmill repair dallas fort worth', intent: 'Core service search', priority: 'high' },
      { keyword: 'treadmill repair dallas tx', intent: 'Core service search', priority: 'high' },
      { keyword: 'nordictrack repair dallas', intent: 'NordicTrack brand repair', priority: 'medium' },
      { keyword: 'peloton repair dallas', intent: 'Peloton brand repair', priority: 'medium' },
      { keyword: 'treadmill belt replacement dallas', intent: 'Belt service specifically', priority: 'medium' },
    ],
  },
]

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
  const [queries, setQueries]     = useState<QueryRow[]>([])
  const [platforms, setPlatforms] = useState<PlatformRow[]>([])
  const [faqs, setFaqs]           = useState<Faq[]>([])
  const [posts, setPosts]         = useState<Post[]>([])
  const [loading, setLoading]     = useState(false)
  const [filter, setFilter]       = useState<'all' | 'gap' | 'covered'>('all')

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
        setPosts(data.posts || [])
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

  function checkKeywordCoverage(keyword: string): { covered: boolean; source: string } {
    const words = keyword.toLowerCase().split(/\s+/).filter((w) => w.length > 3)
    const faqText = faqs.map((f) => (f.question + ' ' + f.answer).toLowerCase())
    const faqCovered = faqText.some((ft) => words.filter((w) => ft.includes(w)).length >= Math.max(1, Math.floor(words.length * 0.45)))
    if (faqCovered) return { covered: true, source: 'FAQ' }
    const postCovered = posts.some((p) => words.filter((w) => p.text.includes(w)).length >= Math.max(1, Math.floor(words.length * 0.45)))
    if (postCovered) return { covered: true, source: 'Blog' }
    return { covered: false, source: '' }
  }

  const totalTargets  = KEYWORD_GROUPS.reduce((s, g) => s + g.targets.length, 0)
  const coveredTargets = KEYWORD_GROUPS.reduce((s, g) => s + g.targets.filter((t) => checkKeywordCoverage(t.keyword).covered).length, 0)

  const displayedQueries = queries.filter((q) =>
    filter === 'all' ? true : filter === 'gap' ? !q.covered : q.covered
  )

  const gapCount = queries.filter((q) => !q.covered).length
  const coveredCount = queries.filter((q) => q.covered).length

  if (!authorized) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-1 text-[10px] font-black uppercase tracking-widest text-amber-600">Search Insights</div>
          <h1 className="text-xl font-black text-slate-900">Admin Access</h1>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') login() }} placeholder="Admin password" autoFocus className="mt-6 w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 placeholder:text-slate-400" />
          {authError && <p className="mt-2 text-sm text-red-600">{authError}</p>}
          <button onClick={login} className="mt-4 w-full rounded-lg bg-cyan-500 py-2.5 text-sm font-bold text-white transition hover:bg-cyan-600">Sign in</button>
        </div>
      </div>
    )
  }

  return (
    <main className="px-6 pb-20 pt-10">

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-white shadow-lg">
          {toast}
        </div>
      )}

      {/* Generate FAQ Modal */}
      {genQuery !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-8 shadow-xl">
            <div className="mb-1 text-[10px] font-black uppercase tracking-widest text-amber-600">Generate FAQ</div>
            <p className="mb-6 text-sm text-slate-500">From search: <span className="font-semibold text-slate-800">&ldquo;{genQuery}&rdquo;</span></p>

            {genLoading ? (
              <div className="flex items-center gap-3 py-8 text-slate-400">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                AI is drafting the FAQ...
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-slate-400">Question</label>
                  <input value={genQ} onChange={(e) => setGenQ(e.target.value)} className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-slate-400">Answer</label>
                  <textarea value={genA} onChange={(e) => setGenA(e.target.value)} rows={4} className="w-full resize-none rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-slate-400">Category</label>
                  <select value={genCat} onChange={(e) => setGenCat(e.target.value)} className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-cyan-400">
                    {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                {genError && <p className="text-sm text-red-600">{genError}</p>}
              </div>
            )}

            <div className="mt-6 flex gap-3">
              <button onClick={saveFaq} disabled={genSaving || genLoading} className="flex-1 rounded-lg bg-cyan-500 py-2.5 text-sm font-bold text-white transition hover:bg-cyan-600 disabled:opacity-40">
                {genSaving ? 'Saving...' : 'Add to Site'}
              </button>
              <button onClick={() => setGenQuery(null)} className="rounded-lg border border-slate-200 px-6 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="mb-1 inline-block rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700">SEO</span>
            <h1 className="text-2xl font-black text-slate-900">Search Insights</h1>
            <p className="mt-0.5 text-sm text-slate-500">What customers searched before booking — and where your FAQ coverage has gaps.</p>
          </div>
          <button onClick={load} disabled={loading} className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:opacity-40">
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-5">
          {[
            { label: 'Customer Queries', value: queries.length,                            color: 'text-slate-900'    },
            { label: 'FAQ Gaps',         value: gapCount,                                  color: 'text-red-600'      },
            { label: 'Covered',          value: coveredCount,                              color: 'text-emerald-600'  },
            { label: 'FAQs Live',        value: faqs.filter((f) => f.active).length,       color: 'text-amber-600'    },
            { label: 'Keywords Covered', value: `${coveredTargets}/${totalTargets}`,        color: coveredTargets === totalTargets ? 'text-emerald-600' : 'text-violet-600' },
          ].map(({ label, value, color }) => (
            <div key={label} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className={`text-3xl font-black ${color}`}>{value}</div>
              <div className="mt-1 text-xs font-semibold uppercase tracking-widest text-slate-400">{label}</div>
            </div>
          ))}
        </div>

        {/* Platform / AI traffic */}
        {platforms.length > 0 && (
          <div className="mb-6 rounded-xl border border-violet-200 bg-violet-50 p-5">
            <div className="mb-2 flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-widest text-violet-700">AI &amp; Platform Traffic</span>
              <span className="rounded-full border border-violet-200 bg-white px-2 py-0.5 text-[10px] font-bold text-violet-600">{platforms.reduce((s, p) => s + p.count, 0)} customers</span>
            </div>
            <p className="mb-4 text-xs text-violet-600/80">These customers typed the platform name instead of their actual search query. They show which channel sent them, not what keyword they used.</p>
            <div className="flex flex-wrap gap-2">
              {platforms.map((p) => {
                const isAI = ['chatgpt', 'gemini', 'copilot', 'perplexity', 'claude', 'gpt', 'ai'].includes(p.platform)
                return (
                  <div key={p.platform} className={`flex items-center gap-1.5 rounded-full border px-3 py-1 ${isAI ? 'border-cyan-200 bg-cyan-50' : 'border-slate-200 bg-white'}`}>
                    <span className={`text-[10px] font-black uppercase ${isAI ? 'text-cyan-600' : 'text-slate-400'}`}>
                      {PLATFORM_ICONS[p.platform] ?? p.platform.slice(0, 2).toUpperCase()}
                    </span>
                    <span className={`text-sm font-semibold capitalize ${isAI ? 'text-cyan-700' : 'text-slate-600'}`}>{p.platform}</span>
                    <span className={`text-xs font-bold ${isAI ? 'text-cyan-600' : 'text-slate-400'}`}>{p.count}x</span>
                  </div>
                )
              })}
            </div>
            {platforms.some(p => ['chatgpt', 'gemini', 'copilot', 'perplexity'].includes(p.platform)) && (
              <p className="mt-3 text-xs font-semibold text-cyan-700">AI assistants are actively recommending 2EZ TEK. Keep your Google Business Profile complete and your site content answer-rich to maintain this visibility.</p>
            )}
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6 flex gap-1 rounded-lg border border-slate-200 bg-slate-100 p-1 w-fit">
          {(['queries', 'targets', 'faqs'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-md px-4 py-1.5 text-sm font-semibold transition ${tab === t ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
            >
              {t === 'queries' ? 'Customer Queries' : t === 'targets' ? 'Keyword Targets' : 'FAQ Manager'}
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
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition ${filter === f ? 'bg-slate-900 text-white' : 'border border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700'}`}
                >
                  {f === 'all' ? `All (${queries.length})` : f === 'gap' ? `Gaps (${gapCount})` : `Covered (${coveredCount})`}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="py-16 text-center text-slate-400">Loading search data...</div>
            ) : displayedQueries.length === 0 ? (
              <div className="py-16 text-center text-slate-400">No queries found.</div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm divide-y divide-slate-100">
                {displayedQueries.map((row, i) => (
                  <div key={i} className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 transition">
                    <span className={`flex-shrink-0 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${row.covered ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-red-200 bg-red-50 text-red-700'}`}>
                      {row.covered ? 'Covered' : 'Gap'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-medium text-slate-800">{row.query}</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {row.count > 1 ? `${row.count} customers` : '1 customer'} &middot; {row.lastSeen ? new Date(row.lastSeen).toLocaleDateString() : ''}
                      </p>
                    </div>
                    {row.count > 1 && (
                      <span className="flex-shrink-0 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-semibold text-slate-500">
                        x{row.count}
                      </span>
                    )}
                    {!row.covered && (
                      <button
                        onClick={() => generateFaqDraft(row.query)}
                        className="flex-shrink-0 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 transition hover:bg-amber-100"
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

        {/* KEYWORD TARGETS TAB */}
        {tab === 'targets' && (
          <div className="space-y-6">
            <p className="text-sm text-slate-500">High-value searches you want to rank for. Coverage is checked against your published blog posts and live FAQs.</p>
            {KEYWORD_GROUPS.map((group) => {
              const groupCovered = group.targets.filter((t) => checkKeywordCoverage(t.keyword).covered).length
              return (
                <div key={group.label} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                  <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-3.5" style={{ borderLeftColor: group.color, borderLeftWidth: 4 }}>
                    <div className="flex items-center gap-3">
                      <span className="font-black text-slate-900">{group.label}</span>
                      <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-semibold text-slate-500">{group.targets.length} targets</span>
                    </div>
                    <span className={`text-sm font-black ${groupCovered === group.targets.length ? 'text-emerald-600' : groupCovered > 0 ? 'text-amber-600' : 'text-red-600'}`}>
                      {groupCovered}/{group.targets.length} covered
                    </span>
                  </div>
                  <div className="divide-y divide-slate-50">
                    {group.targets.map((target) => {
                      const cov = checkKeywordCoverage(target.keyword)
                      return (
                        <div key={target.keyword} className="flex items-center gap-4 px-5 py-3 hover:bg-slate-50 transition">
                          <span className={`flex-shrink-0 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                            cov.covered
                              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                              : 'border-red-200 bg-red-50 text-red-700'
                          }`}>
                            {cov.covered ? cov.source : 'Gap'}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-800">{target.keyword}</p>
                            <p className="text-xs text-slate-400 mt-0.5">{target.intent}</p>
                          </div>
                          <span className={`flex-shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${
                            target.priority === 'high'
                              ? 'border-red-200 bg-red-50 text-red-600'
                              : 'border-slate-200 bg-slate-50 text-slate-500'
                          }`}>
                            {target.priority}
                          </span>
                          {!cov.covered && (
                            <button
                              onClick={() => generateFaqDraft(target.keyword)}
                              className="flex-shrink-0 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 transition hover:bg-amber-100"
                            >
                              Generate FAQ
                            </button>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* FAQS TAB */}
        {tab === 'faqs' && (
          <div>
            <div className="mb-4 flex justify-end">
              <button
                onClick={() => setShowNewFaq((v) => !v)}
                className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-cyan-600"
              >
                + Add FAQ
              </button>
            </div>

            {/* New FAQ form */}
            {showNewFaq && (
              <div className="mb-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-500">New FAQ</div>
                <div className="space-y-3">
                  <input value={newQ} onChange={(e) => setNewQ(e.target.value)} placeholder="Question" className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 placeholder:text-slate-400" />
                  <textarea value={newA} onChange={(e) => setNewA(e.target.value)} placeholder="Answer" rows={3} className="w-full resize-none rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 placeholder:text-slate-400" />
                  <div className="flex gap-3">
                    <select value={newCat} onChange={(e) => setNewCat(e.target.value)} className="flex-1 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-cyan-400">
                      {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                    </select>
                    <button onClick={addNewFaq} disabled={newSaving || !newQ.trim() || !newA.trim()} className="rounded-lg bg-cyan-500 px-5 py-2 text-sm font-bold text-white disabled:opacity-40">
                      {newSaving ? 'Saving...' : 'Save'}
                    </button>
                    <button onClick={() => setShowNewFaq(false)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-50">Cancel</button>
                  </div>
                </div>
              </div>
            )}

            {/* FAQ list */}
            <div className="space-y-2">
              {faqs.length === 0 ? (
                <div className="py-16 text-center text-slate-400">No FAQs yet.</div>
              ) : (
                faqs.map((faq) => (
                  <div key={faq.id} className={`rounded-xl border bg-white p-5 shadow-sm transition ${faq.active ? 'border-slate-200' : 'border-slate-100 opacity-50'}`}>
                    {editId === faq.id ? (
                      <div className="space-y-3">
                        <input value={editQ} onChange={(e) => setEditQ(e.target.value)} className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100" />
                        <textarea value={editA} onChange={(e) => setEditA(e.target.value)} rows={3} className="w-full resize-none rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100" />
                        <div className="flex gap-3">
                          <select value={editCat} onChange={(e) => setEditCat(e.target.value)} className="flex-1 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-cyan-400">
                            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                          </select>
                          <button onClick={saveEdit} disabled={editSaving} className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-bold text-white disabled:opacity-40">{editSaving ? 'Saving...' : 'Save'}</button>
                          <button onClick={() => setEditId(null)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-50">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="mb-1.5 flex items-start justify-between gap-4">
                          <p className="font-semibold text-slate-900 leading-snug">{faq.question}</p>
                          <div className="flex flex-shrink-0 items-center gap-1.5">
                            <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">{faq.category}</span>
                            <button onClick={() => toggleActive(faq)} className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide transition ${faq.active ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-red-200 hover:bg-red-50 hover:text-red-700' : 'border-slate-200 bg-slate-50 text-slate-500 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700'}`}>
                              {faq.active ? 'Live' : 'Hidden'}
                            </button>
                            <button onClick={() => startEdit(faq)} className="rounded-full border border-slate-200 px-2.5 py-0.5 text-[10px] font-semibold text-slate-500 transition hover:border-slate-300 hover:text-slate-700">Edit</button>
                            <button onClick={() => deleteFaq(faq.id)} className="rounded-full border border-slate-200 px-2.5 py-0.5 text-[10px] font-semibold text-slate-400 transition hover:border-red-200 hover:text-red-600">Del</button>
                          </div>
                        </div>
                        <p className="text-sm text-slate-500 leading-relaxed">{faq.answer}</p>
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
