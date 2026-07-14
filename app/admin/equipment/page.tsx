'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { qrImageUrl } from '@/lib/equipment-utils'

type Equipment = {
  id: string
  customer_name: string
  customer_email: string
  customer_phone: string
  brand: string
  model: string
  serial_number: string | null
  equipment_type: string
  address: string
  created_at: string
}

export default function EquipmentPage() {
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)
  const [password, setPassword] = useState('')
  const [loadError, setLoadError] = useState('')
  const [search, setSearch] = useState('')
  const [backfilling, setBackfilling] = useState(false)
  const [backfillResult, setBackfillResult] = useState<{ created: number; skipped: number; total: number } | null>(null)
  const [emailStatus, setEmailStatus] = useState<Record<string, 'sending' | 'sent' | 'error'>>({})

  useEffect(() => {
    const stored = localStorage.getItem('blogAdminPassword')
    if (stored) { setPassword(stored); loadEquipment(stored) }
    else setLoading(false)
  }, [])

  function loadEquipment(pw: string) {
    setLoading(true)
    setLoadError('')
    fetch('/api/admin/equipment', {
      headers: { 'x-admin-password': pw },
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setEquipment(d.equipment)
          setAuthorized(true)
          localStorage.setItem('blogAdminPassword', pw)
        } else {
          setAuthorized(false)
          setLoadError(d.message || 'Failed to load equipment')
        }
      })
      .catch(() => setLoadError('Failed to reach the server'))
      .finally(() => setLoading(false))
  }

  async function runBackfill() {
    setBackfilling(true)
    setBackfillResult(null)
    try {
      const res = await fetch('/api/admin/equipment/backfill', {
        method: 'POST',
        headers: { 'x-admin-password': password },
      })
      const data = await res.json()
      if (data.success) {
        setBackfillResult({ created: data.created, skipped: data.skipped, total: data.total })
        loadEquipment(password)
      }
    } finally {
      setBackfilling(false)
    }
  }

  async function sendAssetEmail(ids: string[], key: string) {
    setEmailStatus((s) => ({ ...s, [key]: 'sending' }))
    try {
      const res = await fetch('/api/admin/equipment/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
        body: JSON.stringify({ ids }),
      })
      const data = await res.json()
      setEmailStatus((s) => ({ ...s, [key]: data.success ? 'sent' : 'error' }))
    } catch {
      setEmailStatus((s) => ({ ...s, [key]: 'error' }))
    }
  }

  const filtered = equipment.filter((e) => {
    const q = search.toLowerCase()
    return (
      e.customer_name?.toLowerCase().includes(q) ||
      e.customer_email?.toLowerCase().includes(q) ||
      e.brand?.toLowerCase().includes(q) ||
      e.model?.toLowerCase().includes(q) ||
      e.equipment_type?.toLowerCase().includes(q)
    )
  })

  // Group by customer so someone with multiple assets (e.g. a treadmill
  // and an elliptical) shows up once with everything nested underneath,
  // instead of requiring a search to find their other equipment.
  const groups = new Map<string, Equipment[]>()
  for (const eq of filtered) {
    const key = (eq.customer_email || eq.customer_name || eq.id).toLowerCase()
    const list = groups.get(key)
    if (list) list.push(eq)
    else groups.set(key, [eq])
  }
  const customerGroups = Array.from(groups.values())
    .map((assets) => [...assets].sort((a, b) => b.created_at.localeCompare(a.created_at)))
    .sort((a, b) => b[0].created_at.localeCompare(a[0].created_at))

  if (!authorized && !loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Equipment / Asset Tags</p>
          <h2 className="mt-1 text-xl font-black text-slate-900">Admin Password</h2>
          {loadError && <p className="mt-2 text-sm text-red-600">{loadError}</p>}
          <input type="password" value={password} onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && loadEquipment(password)}
            placeholder="Password" autoFocus
            className="mt-5 w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 placeholder:text-slate-400" />
          <button onClick={() => loadEquipment(password)} className="mt-4 w-full rounded-lg bg-slate-950 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800">Unlock</button>
        </div>
      </div>
    )
  }

  if (loading) {
    return <p className="py-10 text-center text-slate-400">Loading...</p>
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="border-b border-slate-200 bg-white px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">CRM</p>
            <h1 className="mt-1 text-2xl font-black text-slate-900">Equipment / Asset Tags</h1>
            <p className="mt-1 text-sm text-slate-500">
              Each piece of equipment gets a unique QR code. Customers scan to report issues and view history.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/admin/equipment/new"
              className="rounded-lg bg-cyan-400 px-5 py-2.5 text-xs font-black uppercase tracking-widest text-black transition hover:bg-cyan-300"
            >
              + Add Equipment
            </Link>
            <button
              onClick={runBackfill}
              disabled={backfilling}
              className="rounded-lg bg-slate-900 px-5 py-2.5 text-xs font-black uppercase tracking-widest text-white transition hover:bg-slate-700 disabled:opacity-50"
            >
              {backfilling ? 'Importing...' : 'Backfill Last 30 Days'}
            </button>
            <div className="flex items-center gap-2 rounded-full bg-cyan-50 border border-cyan-200 px-4 py-2">
              <span className="text-xl">📱</span>
              <span className="text-sm font-bold text-cyan-700">{equipment.length} asset tags</span>
            </div>
          </div>
        </div>

        {backfillResult && (
          <div className="mt-4 rounded-lg border border-green-200 bg-green-50 px-5 py-3 text-sm text-green-800">
            <strong>Backfill complete:</strong> {backfillResult.created} equipment records created
            {backfillResult.skipped > 0 && `, ${backfillResult.skipped} skipped (missing email or brand)`}
            {' '}from {backfillResult.total} customers.
          </div>
        )}

        <div className="mt-5">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by customer, brand, model..."
            className="w-full max-w-md rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
          />
        </div>
      </div>

      <div className="px-8 py-6">
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white py-20 text-center">
            <div className="text-4xl">📋</div>
            <p className="mt-3 font-bold text-slate-900">No equipment records yet</p>
            <p className="mt-1 text-sm text-slate-500">
              Equipment records are created automatically when customers submit service requests.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {customerGroups.map((assets) => {
              const primary = assets[0]
              return (
                <div key={primary.id} className="rounded-xl border border-slate-200 bg-white shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
                    <div>
                      <p className="font-black text-slate-900">{primary.customer_name || 'Unknown Customer'}</p>
                      <p className="text-xs text-slate-400">
                        {primary.customer_email}
                        {primary.customer_phone && <span> · {primary.customer_phone}</span>}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-slate-500">
                        {assets.length} asset{assets.length !== 1 ? 's' : ''}
                      </span>
                      {primary.customer_email && assets.length > 1 && (
                        <button
                          onClick={() => sendAssetEmail(assets.map((a) => a.id), `group:${primary.id}`)}
                          disabled={emailStatus[`group:${primary.id}`] === 'sending'}
                          className="rounded-full border border-slate-200 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-600 hover:border-cyan-300 hover:text-cyan-700 disabled:opacity-50"
                        >
                          {emailStatus[`group:${primary.id}`] === 'sending' ? 'Sending...'
                            : emailStatus[`group:${primary.id}`] === 'sent' ? 'Emailed ✓'
                            : emailStatus[`group:${primary.id}`] === 'error' ? 'Failed, retry'
                            : 'Email All Assets'}
                        </button>
                      )}
                      {primary.customer_email && (
                        <Link
                          href={`/admin/customers?q=${encodeURIComponent(primary.customer_email)}`}
                          className="rounded-full border border-slate-200 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-600 hover:border-cyan-300 hover:text-cyan-700"
                        >
                          View in Roster
                        </Link>
                      )}
                    </div>
                  </div>

                  <div className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-3">
                    {assets.map((eq) => (
                      <div key={eq.id} className="rounded-lg border border-slate-200 p-3 transition hover:border-cyan-300 hover:shadow-sm">
                        <Link href={`/admin/equipment/${eq.id}`} className="flex items-start gap-3">
                          <img
                            src={qrImageUrl(eq.id, 56)}
                            alt="QR"
                            width={56}
                            height={56}
                            className="flex-shrink-0 rounded border border-slate-100"
                          />
                          <div className="min-w-0 flex-1">
                            <span className="rounded-full bg-cyan-100 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-cyan-700">
                              {eq.equipment_type || 'Equipment'}
                            </span>
                            <p className="mt-1 font-bold text-slate-900 truncate text-sm">
                              {eq.brand} {eq.model || ''}
                            </p>
                            <p className="mt-1 text-xs text-slate-400">
                              Created {new Date(eq.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </Link>
                        {eq.customer_email && (
                          <button
                            onClick={() => sendAssetEmail([eq.id], eq.id)}
                            disabled={emailStatus[eq.id] === 'sending'}
                            className="mt-2 w-full rounded-md border border-slate-200 py-1.5 text-[10px] font-bold uppercase tracking-wide text-slate-500 transition hover:border-cyan-300 hover:text-cyan-700 disabled:opacity-50"
                          >
                            {emailStatus[eq.id] === 'sending' ? 'Sending...'
                              : emailStatus[eq.id] === 'sent' ? 'Emailed ✓'
                              : emailStatus[eq.id] === 'error' ? 'Failed, retry'
                              : 'Email Customer'}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
