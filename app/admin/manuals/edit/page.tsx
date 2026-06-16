'use client'

import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

type ManualRow = {
  id: string
  manual_url: string
  manual_type: string
  description: string
  slug: string
  brand: string
  model: string
  category: string
  dirty: boolean
  saving: boolean
  saved: boolean
  error: string
}

const MANUAL_TYPES = [
  'Assembly Manual', 'Owner Manual', 'Service Manual', 'Parts Manual',
  'Product Data Sheet', 'User Manual', 'Installation Manual',
  'Operation Manual', 'Support Library', 'Manual',
]

function supabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

const PAGE_SIZE = 50

export default function ManualEditPage() {
  const [password, setPassword]     = useState('')
  const [authorized, setAuthorized] = useState(false)
  const [authError, setAuthError]   = useState('')
  const [authLoading, setAuthLoading] = useState(false)

  const [rows, setRows]             = useState<ManualRow[]>([])
  const [brands, setBrands]         = useState<string[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [filterBrand, setFilterBrand]   = useState('')
  const [search, setSearch]         = useState('')
  const [page, setPage]             = useState(1)
  const [total, setTotal]           = useState(0)
  const [loading, setLoading]       = useState(false)
  const [message, setMessage]       = useState('')

  useEffect(() => {
    const saved = localStorage.getItem('blogAdminPassword')
    if (saved) setPassword(saved)
  }, [])

  async function login() {
    if (!password) { setAuthError('Enter the admin password.'); return }
    setAuthLoading(true)
    setAuthError('')
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
    } finally {
      setAuthLoading(false)
    }
  }

  const loadMeta = useCallback(async () => {
    const sb = supabaseClient()
    const [{ data: bData }, { data: cData }] = await Promise.all([
      sb.from('brands').select('name').order('name'),
      sb.from('equipment_categories').select('name').order('name'),
    ])
    setBrands((bData || []).map((b: any) => b.name))
    setCategories((cData || []).map((c: any) => c.name))
  }, [])

  const loadManuals = useCallback(async () => {
    setLoading(true)
    setMessage('')
    try {
      const sb = supabaseClient()
      let q = sb
        .from('equipment_manuals_v2')
        .select(`
          id, manual_url, manual_type, description, slug,
          equipment_models ( model, brands ( name ), equipment_categories ( name ) )
        `, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1)

      const data: ManualRow[] = []
      const { data: raw, count, error } = await q

      if (error) throw error

      for (const r of raw || []) {
        const em = (r as any).equipment_models
        const brand    = em?.brands?.name || 'Unknown Brand'
        const model    = em?.model || ''
        const category = em?.equipment_categories?.name || ''

        if (filterBrand && brand !== filterBrand) continue
        if (search) {
          const hay = `${brand} ${model} ${category} ${r.manual_url}`.toLowerCase()
          if (!hay.includes(search.toLowerCase())) continue
        }

        data.push({
          id: r.id,
          manual_url: r.manual_url,
          manual_type: r.manual_type,
          description: r.description || '',
          slug: r.slug || '',
          brand,
          model,
          category,
          dirty: false,
          saving: false,
          saved: false,
          error: '',
        })
      }

      setRows(data)
      setTotal(count || 0)
    } catch (err: any) {
      setMessage(err.message || 'Failed to load.')
    } finally {
      setLoading(false)
    }
  }, [page, filterBrand, search])

  useEffect(() => {
    if (authorized) {
      loadMeta()
      loadManuals()
    }
  }, [authorized, loadMeta, loadManuals])

  function update(id: string, field: keyof ManualRow, value: string) {
    setRows(current =>
      current.map(r => r.id === id ? { ...r, [field]: value, dirty: true, saved: false, error: '' } : r)
    )
  }

  async function save(row: ManualRow) {
    setRows(current => current.map(r => r.id === row.id ? { ...r, saving: true, error: '' } : r))
    try {
      const res = await fetch('/api/admin/manuals/edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
        body: JSON.stringify({
          action: 'update',
          id: row.id,
          brand: row.brand,
          model: row.model,
          category: row.category,
          manual_type: row.manual_type,
          description: row.description,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Save failed.')
      setRows(current => current.map(r => r.id === row.id ? { ...r, saving: false, saved: true, dirty: false } : r))
    } catch (err: any) {
      setRows(current => current.map(r => r.id === row.id ? { ...r, saving: false, error: err.message } : r))
    }
  }

  async function deleteManual(id: string) {
    if (!confirm('Delete this manual? This cannot be undone.')) return
    try {
      await fetch('/api/admin/manuals/edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
        body: JSON.stringify({ action: 'delete', id }),
      })
      setRows(current => current.filter(r => r.id !== id))
    } catch (err: any) {
      setMessage(err.message)
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const dirtyCount = rows.filter(r => r.dirty).length

  if (!authorized) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050B14] px-6">
        <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-black/50 p-8 shadow-2xl">
          <div className="mb-4 inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-1 text-xs font-black uppercase tracking-[0.25em] text-cyan-300">2EZ TEK Admin</div>
          <h1 className="text-3xl font-black text-white">Edit Manuals</h1>
          <p className="mt-2 text-white/50">Enter your admin password to continue.</p>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') login() }} placeholder="Admin password" autoFocus className="mt-8 w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-white outline-none transition focus:border-cyan-400 placeholder:text-white/30" />
          {authError && <p className="mt-3 text-sm text-red-400">{authError}</p>}
          <button onClick={login} disabled={authLoading} className="mt-4 w-full rounded-2xl bg-cyan-400 px-7 py-4 text-sm font-black uppercase tracking-[0.16em] text-black transition hover:bg-cyan-300 disabled:opacity-50">{authLoading ? 'Checking…' : 'Enter'}</button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#050B14] px-6 pb-24 pt-28 text-white">
      <div className="mx-auto max-w-7xl">

        <div className="mb-8">
          <div className="mb-3 inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-1 text-xs font-black uppercase tracking-[0.25em] text-cyan-300">Manuals Library</div>
          <h1 className="text-4xl font-black">Edit Manuals</h1>
          <p className="mt-2 text-white/50">Search, filter, and fix any manual already in the database.</p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-3">
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search brand, model, URL..."
            className="flex-1 min-w-[200px] rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none placeholder:text-white/30"
          />
          <select
            value={filterBrand}
            onChange={e => { setFilterBrand(e.target.value); setPage(1) }}
            className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none"
          >
            <option value="">All Brands</option>
            <option value="Unknown Brand">Unknown Brand</option>
            {brands.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
          <button
            onClick={() => { setFilterBrand('Unknown Brand'); setPage(1) }}
            className="rounded-2xl border border-amber-400/30 bg-amber-400/10 px-5 py-3 text-sm font-black uppercase tracking-wide text-amber-300"
          >
            Show Unknown Brand
          </button>
          <button onClick={loadManuals} className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-black uppercase tracking-wide text-white">
            Refresh
          </button>
        </div>

        {message && (
          <div className="mb-6 rounded-2xl border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-300">{message}</div>
        )}

        {loading ? (
          <div className="py-20 text-center text-white/40">Loading manuals...</div>
        ) : rows.length === 0 ? (
          <div className="py-20 text-center text-white/40">No manuals found.</div>
        ) : (
          <>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
              <div className="text-sm text-white/50">{rows.length} shown{dirtyCount > 0 && <span className="ml-3 text-amber-300">{dirtyCount} unsaved</span>}</div>
              <div className="flex gap-3">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="rounded-xl border border-white/10 bg-black/30 px-4 py-2 text-sm font-bold text-white disabled:opacity-30">Prev</button>
                <span className="px-3 py-2 text-sm text-white/50">Page {page} of {totalPages}</span>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="rounded-xl border border-white/10 bg-black/30 px-4 py-2 text-sm font-bold text-white disabled:opacity-30">Next</button>
              </div>
            </div>

            <div className="grid gap-4">
              {rows.map(row => (
                <div key={row.id} className={`rounded-[1.5rem] border p-5 ${row.saved ? 'border-emerald-400/30 bg-emerald-400/5' : row.error ? 'border-red-400/30 bg-red-500/5' : row.dirty ? 'border-amber-400/20 bg-amber-400/5' : 'border-white/[0.07] bg-white/[0.03]'}`}>
                  <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                    <a href={row.manual_url} target="_blank" rel="noopener noreferrer" className="break-all text-xs text-cyan-400 hover:underline">{row.manual_url}</a>
                    <div className="flex gap-2">
                      {row.saved && <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-black text-emerald-300">Saved</span>}
                      {row.dirty && !row.saving && <span className="rounded-full bg-amber-400/15 px-3 py-1 text-xs font-black text-amber-300">Unsaved</span>}
                    </div>
                  </div>

                  <div className="grid gap-3 md:grid-cols-4">
                    <div>
                      <label className="mb-1 block text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Brand</label>
                      <input
                        list={`brands-${row.id}`}
                        value={row.brand}
                        onChange={e => update(row.id, 'brand', e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-400"
                      />
                      <datalist id={`brands-${row.id}`}>
                        {brands.map(b => <option key={b} value={b} />)}
                      </datalist>
                    </div>
                    <div>
                      <label className="mb-1 block text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Model</label>
                      <input
                        value={row.model}
                        onChange={e => update(row.id, 'model', e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-400"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Category</label>
                      <input
                        list={`cats-${row.id}`}
                        value={row.category}
                        onChange={e => update(row.id, 'category', e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-400"
                      />
                      <datalist id={`cats-${row.id}`}>
                        {categories.map(c => <option key={c} value={c} />)}
                      </datalist>
                    </div>
                    <div>
                      <label className="mb-1 block text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Type</label>
                      <select
                        value={row.manual_type}
                        onChange={e => update(row.id, 'manual_type', e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-400"
                      >
                        {MANUAL_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                  </div>

                  <input
                    value={row.description}
                    onChange={e => update(row.id, 'description', e.target.value)}
                    placeholder="Description"
                    className="mt-3 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-400"
                  />

                  {row.error && <p className="mt-2 text-xs text-red-400">{row.error}</p>}

                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => save(row)}
                      disabled={row.saving || !row.dirty}
                      className="rounded-xl bg-cyan-400 px-5 py-2 text-xs font-black uppercase tracking-wide text-black disabled:opacity-40"
                    >
                      {row.saving ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={() => deleteManual(row.id)}
                      className="rounded-xl border border-red-400/30 bg-red-500/10 px-5 py-2 text-xs font-black uppercase tracking-wide text-red-400"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-center gap-3">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="rounded-xl border border-white/10 bg-black/30 px-5 py-3 text-sm font-bold text-white disabled:opacity-30">Previous</button>
              <span className="px-4 py-3 text-sm text-white/50">Page {page} of {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="rounded-xl border border-white/10 bg-black/30 px-5 py-3 text-sm font-bold text-white disabled:opacity-30">Next</button>
            </div>
          </>
        )}
      </div>
    </main>
  )
}
