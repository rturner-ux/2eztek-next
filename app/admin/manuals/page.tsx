'use client'

import { useMemo, useState, useCallback } from 'react'
import AdminGate from '@/components/AdminGate'

type Manual = {
  id: string
  brand: string
  model: string
  equipment_type: string
  manual_type: string
  description: string
  slug: string
  manual_url: string
  created_at: string
}

function getPassword() {
  return typeof window !== 'undefined' ? localStorage.getItem('blogAdminPassword') || '' : ''
}

export default function AdminManualsPage() {
  const [tab, setTab] = useState<'upload' | 'manage'>('upload')

  // Upload state
  const [brand, setBrand]               = useState('')
  const [model, setModel]               = useState('')
  const [equipmentType, setEquipmentType] = useState('')
  const [description, setDescription]  = useState('')
  const [manualType, setManualType]     = useState('Owner Manual')
  const [file, setFile]                 = useState<File | null>(null)
  const [loading, setLoading]           = useState(false)
  const [message, setMessage]           = useState('')
  const [messageOk, setMessageOk]       = useState(true)
  const [uploadedUrl, setUploadedUrl]   = useState('')

  // Migration state
  const [migrating, setMigrating]       = useState(false)
  const [migrateResult, setMigrateResult] = useState('')
  const [fixLoading, setFixLoading]     = useState(false)
  const [fixResult, setFixResult]       = useState<any>(null)

  // Manage state
  const [manuals, setManuals]           = useState<Manual[]>([])
  const [loadingManuals, setLoadingManuals] = useState(false)
  const [manualFilter, setManualFilter] = useState('')
  const [editingId, setEditingId]       = useState<string | null>(null)
  const [editForm, setEditForm]         = useState<Partial<Manual>>({})
  const [saving, setSaving]             = useState(false)
  const [saveMsg, setSaveMsg]           = useState('')
  const [selected, setSelected]         = useState<Set<string>>(new Set())
  const [bulkBrand, setBulkBrand]       = useState('Landmark Athletics')
  const [bulkSaving, setBulkSaving]     = useState(false)
  const [bulkMsg, setBulkMsg]           = useState('')

  const safeFileName = useMemo(() => {
    const base = `${brand}-${model}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
    return `${base || 'manual'}.pdf`
  }, [brand, model])

  const filteredManuals = useMemo(() => {
    const q = manualFilter.toLowerCase()
    if (!q) return manuals
    return manuals.filter(m =>
      m.brand.toLowerCase().includes(q) ||
      m.model.toLowerCase().includes(q) ||
      m.manual_type.toLowerCase().includes(q)
    )
  }, [manuals, manualFilter])

  async function loadManuals(filterBrand = '') {
    setLoadingManuals(true)
    try {
      const q = filterBrand ? `&q=${encodeURIComponent(filterBrand)}` : ''
      const res = await fetch(`/api/admin/manuals/search?limit=200${q}`, {
        headers: { 'x-admin-password': getPassword() },
      })
      const data = await res.json()
      setManuals(data.manuals || [])
    } catch {
      setManuals([])
    } finally {
      setLoadingManuals(false)
    }
  }

  function openManageTab() {
    setTab('manage')
    if (manuals.length === 0) loadManuals()
  }

  function startEdit(m: Manual) {
    setEditingId(m.id)
    setEditForm({
      brand: m.brand === 'Unknown Brand' ? '' : m.brand,
      model: m.model === 'Unknown Model' ? '' : m.model,
      equipment_type: m.equipment_type,
      manual_type: m.manual_type,
      description: m.description || '',
    })
    setSaveMsg('')
  }

  async function saveEdit(id: string) {
    setSaving(true)
    setSaveMsg('')
    try {
      const res = await fetch('/api/admin/manuals/edit', {
        method: 'POST',
        headers: { 'x-admin-password': getPassword(), 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update',
          id,
          brand: editForm.brand,
          model: editForm.model,
          category: editForm.equipment_type,
          manual_type: editForm.manual_type,
          description: editForm.description,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setSaveMsg('Saved')
        setManuals(prev => prev.map(m => m.id === id ? {
          ...m,
          brand: editForm.brand || m.brand,
          model: editForm.model || m.model,
          equipment_type: editForm.equipment_type || m.equipment_type,
          manual_type: editForm.manual_type || m.manual_type,
          description: editForm.description ?? m.description,
        } : m))
        setTimeout(() => { setEditingId(null); setSaveMsg('') }, 800)
      } else {
        setSaveMsg(`Error: ${data.error}`)
      }
    } catch (err: any) {
      setSaveMsg(`Error: ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  function toggleSelect(id: string) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function selectAll() {
    if (selected.size === filteredManuals.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(filteredManuals.map(m => m.id)))
    }
  }

  async function bulkAssign() {
    if (!selected.size || !bulkBrand.trim()) return
    setBulkSaving(true)
    setBulkMsg('')
    try {
      const res = await fetch('/api/admin/manuals/bulk-assign', {
        method: 'POST',
        headers: { 'x-admin-password': getPassword(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: Array.from(selected), brand: bulkBrand.trim() }),
      })
      const data = await res.json()
      if (data.success) {
        setBulkMsg(`Updated ${data.updated} manuals${data.errors ? `, ${data.errors} errors` : ''}.`)
        setManuals(prev => prev.map(m =>
          selected.has(m.id) ? { ...m, brand: bulkBrand.trim() } : m
        ))
        setSelected(new Set())
      } else {
        setBulkMsg(`Error: ${data.error}`)
      }
    } catch (err: any) {
      setBulkMsg(`Error: ${err.message}`)
    } finally {
      setBulkSaving(false)
    }
  }

  async function deleteManual(id: string) {
    if (!confirm('Delete this manual? This cannot be undone.')) return
    try {
      await fetch('/api/admin/manuals/edit', {
        method: 'POST',
        headers: { 'x-admin-password': getPassword(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', id }),
      })
      setManuals(prev => prev.filter(m => m.id !== id))
    } catch { /* ignore */ }
  }

  async function handleMigrate() {
    setMigrating(true)
    setMigrateResult('')
    try {
      const res = await fetch('/api/admin/manuals/migrate', {
        method: 'POST',
        headers: { 'x-admin-password': getPassword() },
      })
      const data = await res.json()
      if (data.success) {
        const parts = []
        if (data.migrated)  parts.push(`${data.migrated} newly indexed`)
        if (data.relinked)  parts.push(`${data.relinked} brand corrections`)
        if (data.skipped)   parts.push(`${data.skipped} already correct`)
        if (data.errors)    parts.push(`${data.errors} errors`)
        const base = parts.length ? `Done. ${parts.join(', ')}.` : 'Done. Nothing to update.'
        const la = `Landmark Athletics: ${data.landmark_in_old_table ?? '?'} in old table, ${data.landmark_in_v2 ?? '?'} in index.`
        setMigrateResult(`${base} | ${la}`)
      } else {
        setMigrateResult(`Error: ${data.error}`)
      }
    } catch (err: any) {
      setMigrateResult(`Failed: ${err.message}`)
    } finally {
      setMigrating(false)
    }
  }

  async function handleFixBrand(brandName: string) {
    setFixLoading(true)
    setFixResult(null)
    try {
      const res = await fetch('/api/admin/manuals/reindex-brand', {
        method: 'POST',
        headers: { 'x-admin-password': getPassword(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ brand: brandName }),
      })
      setFixResult(await res.json())
    } catch (err: any) {
      setFixResult({ error: err.message })
    } finally {
      setFixLoading(false)
    }
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault()
    setMessage('')
    setUploadedUrl('')
    if (!file) { setMessage('Please select a PDF.'); setMessageOk(false); return }
    try {
      setLoading(true)
      const fd = new FormData()
      fd.append('brand', brand)
      fd.append('model', model)
      fd.append('equipment_type', equipmentType || 'Fitness Equipment')
      fd.append('description', description)
      fd.append('manual_type', manualType)
      fd.append('file', file)
      const res = await fetch('/api/admin/manuals/upload', {
        method: 'POST',
        headers: { 'x-admin-password': getPassword() },
        body: fd,
      })
      const data = await res.json()
      if (!res.ok || !data.success) { setMessageOk(false); setMessage(data.error || 'Upload failed.'); return }
      setUploadedUrl(data.manual_url)
      setMessageOk(true)
      setMessage('Manual uploaded and indexed successfully.')
      setBrand(''); setModel(''); setEquipmentType(''); setDescription(''); setFile(null)
      const input = document.getElementById('manual-file') as HTMLInputElement | null
      if (input) input.value = ''
    } catch (error: any) {
      setMessageOk(false)
      setMessage(error.message || 'Upload failed.')
    } finally {
      setLoading(false)
    }
  }

  const inputCls = 'w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400/60'

  return (
    <AdminGate title="Manuals Admin">
      <main className="min-h-screen bg-[#050B14] px-6 pt-28 pb-20 text-white">
        <div className="mx-auto max-w-4xl">

          {/* Tab bar */}
          <div className="mb-6 flex gap-2">
            {(['upload', 'manage'] as const).map(t => (
              <button
                key={t}
                onClick={() => t === 'manage' ? openManageTab() : setTab(t)}
                className={`rounded-2xl px-6 py-3 text-sm font-black uppercase tracking-wide transition ${tab === t ? 'bg-cyan-400 text-black' : 'bg-white/10 text-white hover:bg-white/20'}`}
              >
                {t === 'upload' ? 'Upload' : 'Manage Manuals'}
              </button>
            ))}
          </div>

          {/* UPLOAD TAB */}
          {tab === 'upload' && (
            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-10">
              <div className="mb-8">
                <div className="mb-4 inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-1 text-xs font-black uppercase tracking-[0.25em] text-cyan-300">
                  SmartGymOps Manuals Upload
                </div>
                <h1 className="text-4xl font-black">Upload Equipment Manual</h1>
                <p className="mt-3 text-white/60 text-sm">Manuals automatically appear in the public directory after upload.</p>
              </div>

              {/* Migration tools */}
              <div className="mb-8 rounded-2xl border border-amber-400/30 bg-amber-400/10 p-5 space-y-4">
                <div>
                  <p className="mb-1 text-sm font-black text-amber-300">Previously uploaded manuals not showing in search?</p>
                  <p className="mb-3 text-xs text-amber-200/70">Safe to run multiple times.</p>
                  <div className="flex items-center gap-4 flex-wrap">
                    <button type="button" onClick={handleMigrate} disabled={migrating}
                      className="rounded-2xl bg-amber-400 px-6 py-3 text-sm font-black text-black hover:bg-amber-300 disabled:opacity-50">
                      {migrating ? 'Migrating...' : 'Index Existing Uploads'}
                    </button>
                    {migrateResult && <p className="text-sm font-bold text-amber-200">{migrateResult}</p>}
                  </div>
                </div>

                <div className="border-t border-amber-400/20 pt-4">
                  <p className="mb-1 text-xs font-black text-amber-300">Force re-index Landmark Athletics</p>
                  <div className="flex items-start gap-4 flex-wrap">
                    <button type="button" onClick={() => handleFixBrand('Landmark Athletics')} disabled={fixLoading}
                      className="rounded-2xl bg-rose-500 px-6 py-3 text-sm font-black text-white hover:bg-rose-400 disabled:opacity-50">
                      {fixLoading ? 'Fixing...' : 'Fix Landmark Athletics'}
                    </button>
                    {fixResult && (
                      <div className="flex-1 rounded-xl bg-black/40 p-3 text-xs text-white/70">
                        {fixResult.error ? <p className="text-red-400 font-bold">{fixResult.error}</p> : (
                          <>
                            <p className="font-bold text-white mb-1">Found {fixResult.found}. Fixed {fixResult.fixed}, created {fixResult.created}, errors {fixResult.errors}.</p>
                            {(fixResult.log || []).map((l: string, i: number) => <p key={i} className="text-white/50">{l}</p>)}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Upload form */}
              <form onSubmit={handleUpload} className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <input type="text" placeholder="Brand (e.g. Landmark Athletics)" value={brand}
                    onChange={e => setBrand(e.target.value)} className={inputCls} required />
                  <input type="text" placeholder="Model (e.g. TC-200)" value={model}
                    onChange={e => setModel(e.target.value)} className={inputCls} required />
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                  <input type="text" placeholder="Equipment Type (e.g. Treadmill)" value={equipmentType}
                    onChange={e => setEquipmentType(e.target.value)} className={inputCls} />
                  <select value={manualType} onChange={e => setManualType(e.target.value)} className={inputCls}>
                    <option>Owner Manual</option>
                    <option>Assembly Guide</option>
                    <option>Service Manual</option>
                    <option>Parts Diagram</option>
                    <option>Quick Start Guide</option>
                    <option>Warranty Guide</option>
                  </select>
                </div>
                <textarea placeholder="Description (optional)" value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="min-h-[80px] w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400/60" />
                <div className="rounded-2xl border border-dashed border-cyan-400/30 bg-cyan-400/5 p-5">
                  <p className="mb-1 text-xs font-bold text-cyan-300">Suggested Filename</p>
                  <p className="mb-3 rounded-xl bg-black/40 px-3 py-2 text-xs text-white/50">{safeFileName}</p>
                  <input id="manual-file" type="file" accept="application/pdf"
                    onChange={e => setFile(e.target.files?.[0] || null)}
                    className="w-full text-sm text-white/70" required />
                </div>
                <button type="submit" disabled={loading}
                  className="w-full rounded-2xl bg-cyan-400 px-8 py-5 text-sm font-black uppercase tracking-wide text-black hover:scale-[1.01] disabled:opacity-50">
                  {loading ? 'Uploading...' : 'Upload Manual'}
                </button>
                {message && (
                  <div className={`rounded-2xl border p-4 text-sm ${messageOk ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300' : 'border-red-400/30 bg-red-400/10 text-red-300'}`}>
                    {message}
                  </div>
                )}
                {uploadedUrl && (
                  <a href={uploadedUrl} target="_blank" rel="noopener noreferrer"
                    className="block rounded-2xl border border-cyan-400/30 bg-cyan-400/10 p-4 text-sm font-bold text-cyan-300">
                    Open Uploaded Manual
                  </a>
                )}
              </form>
            </div>
          )}

          {/* MANAGE TAB */}
          {tab === 'manage' && (
            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8">
              <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
                <h2 className="text-2xl font-black">Manage Manuals</h2>
                <div className="flex gap-2 flex-wrap">
                  <input
                    type="text" placeholder="Filter by brand or model..." value={manualFilter}
                    onChange={e => setManualFilter(e.target.value)}
                    className="rounded-2xl border border-white/10 bg-black/30 px-4 py-2 text-sm text-white outline-none focus:border-cyan-400/60 w-56"
                  />
                  <button onClick={() => setManualFilter('Unknown Brand')}
                    className="rounded-2xl bg-rose-500/20 border border-rose-500/30 px-4 py-2 text-xs font-black text-rose-300 hover:bg-rose-500/30">
                    Show Unknown Brands
                  </button>
                  <button onClick={() => loadManuals()}
                    className="rounded-2xl bg-white/10 px-4 py-2 text-xs font-black text-white hover:bg-white/20">
                    {loadingManuals ? 'Loading...' : 'Refresh'}
                  </button>
                </div>
              </div>

              <div className="mb-4 flex items-center justify-between gap-3 flex-wrap">
                <p className="text-xs text-white/40">{filteredManuals.length} of {manuals.length} manuals</p>
                {selected.size > 0 && (
                  <div className="flex items-center gap-2 flex-wrap rounded-2xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-2">
                    <span className="text-xs font-black text-cyan-300">{selected.size} selected</span>
                    <input
                      value={bulkBrand} onChange={e => setBulkBrand(e.target.value)}
                      placeholder="Brand name"
                      className="rounded-xl border border-white/10 bg-black/30 px-3 py-1.5 text-xs text-white outline-none focus:border-cyan-400/60 w-44"
                    />
                    <button onClick={bulkAssign} disabled={bulkSaving || !bulkBrand.trim()}
                      className="rounded-xl bg-cyan-400 px-4 py-1.5 text-xs font-black text-black hover:bg-cyan-300 disabled:opacity-50">
                      {bulkSaving ? 'Saving...' : 'Assign Brand'}
                    </button>
                    {bulkMsg && <span className="text-xs font-bold text-emerald-400">{bulkMsg}</span>}
                  </div>
                )}
              </div>

              {loadingManuals ? (
                <p className="text-white/40 text-sm py-8 text-center">Loading manuals...</p>
              ) : filteredManuals.length === 0 ? (
                <p className="text-white/40 text-sm py-8 text-center">No manuals found.</p>
              ) : (
                <div className="space-y-3">
                  {/* Select all row */}
                  <div className="flex items-center gap-3 px-1 pb-1">
                    <input type="checkbox"
                      checked={selected.size === filteredManuals.length && filteredManuals.length > 0}
                      onChange={selectAll}
                      className="h-4 w-4 rounded accent-cyan-400 cursor-pointer"
                    />
                    <span className="text-xs text-white/40 cursor-pointer" onClick={selectAll}>
                      {selected.size === filteredManuals.length && filteredManuals.length > 0 ? 'Deselect all' : 'Select all'}
                    </span>
                  </div>

                  {filteredManuals.map(m => (
                    <div key={m.id} className={`rounded-2xl border p-4 ${selected.has(m.id) ? 'border-cyan-400/40 bg-cyan-400/5' : m.brand === 'Unknown Brand' ? 'border-rose-500/30 bg-rose-500/5' : 'border-white/8 bg-white/3'}`}>
                      {editingId === m.id ? (
                        /* Edit form */
                        <div className="space-y-3">
                          <div className="grid gap-3 md:grid-cols-2">
                            <div>
                              <label className="mb-1 block text-xs text-white/40">Brand</label>
                              <input value={editForm.brand || ''} onChange={e => setEditForm(f => ({ ...f, brand: e.target.value }))}
                                placeholder="Brand name" className={inputCls} />
                            </div>
                            <div>
                              <label className="mb-1 block text-xs text-white/40">Model</label>
                              <input value={editForm.model || ''} onChange={e => setEditForm(f => ({ ...f, model: e.target.value }))}
                                placeholder="Model name" className={inputCls} />
                            </div>
                          </div>
                          <div className="grid gap-3 md:grid-cols-2">
                            <div>
                              <label className="mb-1 block text-xs text-white/40">Equipment Type</label>
                              <input value={editForm.equipment_type || ''} onChange={e => setEditForm(f => ({ ...f, equipment_type: e.target.value }))}
                                placeholder="e.g. Treadmill" className={inputCls} />
                            </div>
                            <div>
                              <label className="mb-1 block text-xs text-white/40">Manual Type</label>
                              <select value={editForm.manual_type || 'Owner Manual'} onChange={e => setEditForm(f => ({ ...f, manual_type: e.target.value }))}
                                className={inputCls}>
                                <option>Owner Manual</option>
                                <option>Assembly Guide</option>
                                <option>Service Manual</option>
                                <option>Parts Diagram</option>
                                <option>Quick Start Guide</option>
                                <option>Warranty Guide</option>
                              </select>
                            </div>
                          </div>
                          <div>
                            <label className="mb-1 block text-xs text-white/40">Description</label>
                            <input value={editForm.description || ''} onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))}
                              placeholder="Optional description" className={inputCls} />
                          </div>
                          <div className="flex items-center gap-3">
                            <button onClick={() => saveEdit(m.id)} disabled={saving}
                              className="rounded-2xl bg-cyan-400 px-6 py-2 text-sm font-black text-black hover:bg-cyan-300 disabled:opacity-50">
                              {saving ? 'Saving...' : 'Save'}
                            </button>
                            <button onClick={() => setEditingId(null)}
                              className="rounded-2xl bg-white/10 px-6 py-2 text-sm font-black text-white hover:bg-white/20">
                              Cancel
                            </button>
                            {saveMsg && <p className={`text-sm font-bold ${saveMsg === 'Saved' ? 'text-emerald-400' : 'text-red-400'}`}>{saveMsg}</p>}
                          </div>
                        </div>
                      ) : (
                        /* Display row */
                        <div className="flex items-start gap-3">
                          <input type="checkbox"
                            checked={selected.has(m.id)}
                            onChange={() => toggleSelect(m.id)}
                            className="mt-1 h-4 w-4 rounded accent-cyan-400 cursor-pointer flex-shrink-0"
                          />
                        <div className="flex flex-1 items-start justify-between gap-4">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`text-sm font-black ${m.brand === 'Unknown Brand' ? 'text-rose-400' : 'text-white'}`}>{m.brand}</span>
                              <span className="text-white/30">/</span>
                              <span className="text-sm text-white/70">{m.model}</span>
                              <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/50">{m.manual_type}</span>
                            </div>
                            {m.description && <p className="mt-1 text-xs text-white/40 truncate">{m.description}</p>}
                            <a href={m.manual_url} target="_blank" rel="noopener noreferrer"
                              className="mt-1 inline-block text-xs text-cyan-400/60 hover:text-cyan-400 truncate max-w-xs">
                              PDF
                            </a>
                          </div>
                          <div className="flex gap-2 flex-shrink-0">
                            <button onClick={() => startEdit(m)}
                              className="rounded-xl bg-white/10 px-4 py-2 text-xs font-black text-white hover:bg-white/20">
                              Edit
                            </button>
                            <button onClick={() => deleteManual(m.id)}
                              className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-2 text-xs font-black text-red-400 hover:bg-red-500/20">
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
          )}
        </div>
      </main>
    </AdminGate>
  )
}
