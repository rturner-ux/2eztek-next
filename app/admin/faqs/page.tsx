'use client'

import { useState, useEffect, useCallback } from 'react'

type Faq = {
  id: string
  question: string
  answer: string
  category: string
  active: boolean
  sort_order: number
}

const CATEGORIES = [
  'General', 'Treadmill Repair', 'Elliptical Repair', 'Exercise Bike Repair',
  'Commercial Gym', 'Equipment Assembly', 'Preventive Maintenance',
  'Electrical Safety', 'Pricing',
]

export default function FaqsAdminPage() {
  const [password, setPassword] = useState('')
  const [authed, setAuthed]     = useState(false)
  const [faqs, setFaqs]         = useState<Faq[]>([])
  const [loading, setLoading]   = useState(false)
  const [filter, setFilter]     = useState<'all' | 'active' | 'inactive'>('all')
  const [catFilter, setCatFilter] = useState('all')
  const [editing, setEditing]   = useState<string | null>(null)
  const [editData, setEditData] = useState<Partial<Faq>>({})
  const [adding, setAdding]     = useState(false)
  const [newFaq, setNewFaq]     = useState({ question: '', answer: '', category: 'General' })
  const [saving, setSaving]     = useState(false)
  const [toast, setToast]       = useState('')

  useEffect(() => {
    const stored = localStorage.getItem('blogAdminPassword')
    if (stored) { setPassword(stored); setAuthed(true) }
  }, [])

  function login(e: React.FormEvent) {
    e.preventDefault()
    localStorage.setItem('blogAdminPassword', password)
    setAuthed(true)
  }

  const hdrs = useCallback(() => ({
    'Content-Type': 'application/json',
    'x-admin-password': password,
  }), [password])

  const load = useCallback(async () => {
    setLoading(true)
    const res  = await fetch('/api/admin/faqs', { headers: hdrs() })
    const data = await res.json()
    setFaqs(data.faqs ?? [])
    setLoading(false)
  }, [hdrs])

  useEffect(() => { if (authed) load() }, [authed, load])

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }

  async function toggleActive(faq: Faq) {
    const res  = await fetch(`/api/admin/faqs/${faq.id}`, {
      method: 'PATCH', headers: hdrs(), body: JSON.stringify({ active: !faq.active }),
    })
    if (res.ok) {
      setFaqs((prev) => prev.map((f) => f.id === faq.id ? { ...f, active: !faq.active } : f))
      showToast(faq.active ? 'FAQ deactivated' : 'FAQ activated — now live on site')
    }
  }

  async function saveEdit(id: string) {
    setSaving(true)
    const res  = await fetch(`/api/admin/faqs/${id}`, {
      method: 'PATCH', headers: hdrs(), body: JSON.stringify(editData),
    })
    if (res.ok) {
      setFaqs((prev) => prev.map((f) => f.id === id ? { ...f, ...editData } : f))
      setEditing(null)
      showToast('FAQ updated')
    }
    setSaving(false)
  }

  async function deleteFaq(id: string) {
    if (!confirm('Delete this FAQ?')) return
    const res  = await fetch(`/api/admin/faqs/${id}`, { method: 'DELETE', headers: hdrs() })
    if (res.ok) {
      setFaqs((prev) => prev.filter((f) => f.id !== id))
      showToast('FAQ deleted')
    }
  }

  async function addFaq() {
    if (!newFaq.question.trim() || !newFaq.answer.trim()) return
    setSaving(true)
    const res  = await fetch('/api/admin/faqs', {
      method: 'POST', headers: hdrs(), body: JSON.stringify(newFaq),
    })
    const data = await res.json()
    if (data.success) {
      setFaqs((prev) => [...prev, data.faq])
      setNewFaq({ question: '', answer: '', category: 'General' })
      setAdding(false)
      showToast('FAQ added and activated')
    }
    setSaving(false)
  }

  const visible = faqs.filter((f) => {
    if (filter === 'active'   && !f.active) return false
    if (filter === 'inactive' &&  f.active) return false
    if (catFilter !== 'all' && f.category !== catFilter) return false
    return true
  })

  const activeCount   = faqs.filter((f) => f.active).length
  const inactiveCount = faqs.filter((f) => !f.active).length

  if (!authed) {
    return (
      <div className="min-h-screen bg-[#050B14] flex items-center justify-center p-6">
        <form onSubmit={login} className="w-full max-w-sm space-y-4">
          <h1 className="text-2xl font-black text-white">FAQ Manager</h1>
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
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 rounded-2xl bg-emerald-500 px-6 py-3 font-black text-white shadow-xl text-sm">
          {toast}
        </div>
      )}

      <div className="mx-auto max-w-5xl px-6 py-8">

        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-xs font-black tracking-[0.25em] text-cyan-400 mb-1">FAQ MANAGER</p>
            <h1 className="text-3xl font-black">Frequently Asked Questions</h1>
            <p className="mt-1 text-sm text-slate-400">
              {activeCount} active on site · {inactiveCount} drafts
            </p>
          </div>
          <button onClick={() => { setAdding(true); setEditing(null) }}
            className="rounded-2xl bg-cyan-400 px-6 py-3 font-black text-black hover:bg-cyan-300 transition text-sm">
            + Add FAQ
          </button>
        </div>

        {/* Add form */}
        {adding && (
          <div className="mb-6 rounded-2xl border border-cyan-400/30 bg-cyan-400/5 p-6 space-y-4">
            <p className="font-black text-cyan-400 text-sm">New FAQ</p>
            <input value={newFaq.question} onChange={(e) => setNewFaq((p) => ({ ...p, question: e.target.value }))}
              placeholder="Question"
              className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-cyan-400 text-sm" />
            <textarea value={newFaq.answer} onChange={(e) => setNewFaq((p) => ({ ...p, answer: e.target.value }))}
              placeholder="Answer" rows={3}
              className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-cyan-400 text-sm resize-none" />
            <select value={newFaq.category} onChange={(e) => setNewFaq((p) => ({ ...p, category: e.target.value }))}
              className="rounded-xl border border-white/10 bg-black/30 px-4 py-2.5 text-white outline-none focus:border-cyan-400 text-sm">
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <div className="flex gap-3">
              <button onClick={addFaq} disabled={saving}
                className="rounded-xl bg-emerald-500 px-6 py-2.5 font-black text-white text-sm hover:bg-emerald-400 transition disabled:opacity-50">
                {saving ? 'Saving...' : 'Add & Activate'}
              </button>
              <button onClick={() => setAdding(false)}
                className="rounded-xl border border-white/15 px-6 py-2.5 font-black text-slate-400 text-sm hover:text-white transition">
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="mb-5 flex flex-wrap gap-3">
          {(['all', 'active', 'inactive'] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`rounded-full px-4 py-1.5 text-xs font-black capitalize transition ${filter === f ? 'bg-cyan-400 text-black' : 'border border-white/15 text-slate-400 hover:text-white'}`}>
              {f === 'all' ? `All (${faqs.length})` : f === 'active' ? `Active (${activeCount})` : `Drafts (${inactiveCount})`}
            </button>
          ))}
          <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)}
            className="rounded-full border border-white/15 bg-transparent px-4 py-1.5 text-xs font-black text-slate-400 outline-none">
            <option value="all">All Categories</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* FAQ list */}
        {loading ? (
          <div className="text-center py-16 text-slate-500">Loading...</div>
        ) : visible.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-16 text-center">
            <p className="text-slate-400">No FAQs found. Add one above or generate from CODEX.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {visible.map((faq) => (
              <div key={faq.id} className={`rounded-2xl border p-5 transition ${faq.active ? 'border-white/10 bg-white/5' : 'border-white/5 bg-white/[0.02]'}`}>
                {editing === faq.id ? (
                  <div className="space-y-3">
                    <input value={editData.question ?? faq.question}
                      onChange={(e) => setEditData((p) => ({ ...p, question: e.target.value }))}
                      className="w-full rounded-xl border border-white/15 bg-black/30 px-4 py-2.5 text-white outline-none focus:border-cyan-400 text-sm font-bold" />
                    <textarea value={editData.answer ?? faq.answer} rows={3}
                      onChange={(e) => setEditData((p) => ({ ...p, answer: e.target.value }))}
                      className="w-full rounded-xl border border-white/15 bg-black/30 px-4 py-2.5 text-slate-300 outline-none focus:border-cyan-400 text-sm resize-none" />
                    <select value={editData.category ?? faq.category}
                      onChange={(e) => setEditData((p) => ({ ...p, category: e.target.value }))}
                      className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white outline-none text-xs">
                      {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <div className="flex gap-3">
                      <button onClick={() => saveEdit(faq.id)} disabled={saving}
                        className="rounded-xl bg-emerald-500 px-5 py-2 text-xs font-black text-white hover:bg-emerald-400 transition disabled:opacity-50">
                        {saving ? 'Saving...' : 'Save'}
                      </button>
                      <button onClick={() => { setEditing(null); setEditData({}) }}
                        className="rounded-xl border border-white/15 px-5 py-2 text-xs font-black text-slate-400 hover:text-white transition">
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`h-2 w-2 rounded-full flex-shrink-0 ${faq.active ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                          <span className="text-[10px] font-black tracking-wider text-slate-500">{faq.category}</span>
                        </div>
                        <p className="font-black text-white text-sm leading-snug">{faq.question}</p>
                        <p className="mt-2 text-sm text-slate-400 leading-relaxed">{faq.answer}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button onClick={() => toggleActive(faq)}
                          className={`rounded-full px-3 py-1 text-[11px] font-black transition ${faq.active ? 'bg-emerald-400/20 text-emerald-400 hover:bg-red-400/20 hover:text-red-400' : 'bg-white/10 text-slate-400 hover:bg-emerald-400/20 hover:text-emerald-400'}`}>
                          {faq.active ? 'Active' : 'Activate'}
                        </button>
                        <button onClick={() => { setEditing(faq.id); setEditData({}); setAdding(false) }}
                          className="rounded-full border border-white/10 px-3 py-1 text-[11px] font-black text-slate-400 hover:text-white hover:border-white/25 transition">
                          Edit
                        </button>
                        <button onClick={() => deleteFaq(faq.id)}
                          className="rounded-full border border-white/10 px-3 py-1 text-[11px] font-black text-slate-600 hover:text-red-400 hover:border-red-400/30 transition">
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
