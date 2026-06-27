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
  equipment_type: string
  address: string
  created_at: string
}

function getPassword() {
  if (typeof window === 'undefined') return ''
  return localStorage.getItem('blogAdminPassword') || ''
}

export default function EquipmentPage() {
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [backfilling, setBackfilling] = useState(false)
  const [backfillResult, setBackfillResult] = useState<{ created: number; skipped: number; total: number } | null>(null)

  function loadEquipment() {
    setLoading(true)
    fetch('/api/admin/equipment', {
      headers: { 'x-admin-password': getPassword() },
    })
      .then((r) => r.json())
      .then((d) => { if (d.success) setEquipment(d.equipment) })
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadEquipment() }, [])

  async function runBackfill() {
    setBackfilling(true)
    setBackfillResult(null)
    try {
      const res = await fetch('/api/admin/equipment/backfill', {
        method: 'POST',
        headers: { 'x-admin-password': getPassword() },
      })
      const data = await res.json()
      if (data.success) {
        setBackfillResult({ created: data.created, skipped: data.skipped, total: data.total })
        loadEquipment()
      }
    } finally {
      setBackfilling(false)
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
        {loading ? (
          <div className="py-20 text-center text-sm text-slate-400">Loading equipment...</div>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white py-20 text-center">
            <div className="text-4xl">📋</div>
            <p className="mt-3 font-bold text-slate-900">No equipment records yet</p>
            <p className="mt-1 text-sm text-slate-500">
              Equipment records are created automatically when customers submit service requests.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((eq) => (
              <Link
                key={eq.id}
                href={`/admin/equipment/${eq.id}`}
                className="group flex items-start gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-cyan-300 hover:shadow-md"
              >
                {/* Mini QR */}
                <img
                  src={qrImageUrl(eq.id, 80)}
                  alt="QR"
                  width={80}
                  height={80}
                  className="flex-shrink-0 rounded border border-slate-100"
                />

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-cyan-100 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-cyan-700">
                      {eq.equipment_type || 'Equipment'}
                    </span>
                  </div>
                  <p className="mt-1.5 font-black text-slate-900 truncate">
                    {eq.brand} {eq.model || ''}
                  </p>
                  <p className="mt-0.5 text-sm text-slate-600 truncate">{eq.customer_name}</p>
                  <p className="mt-0.5 text-xs text-slate-400 truncate">{eq.customer_email}</p>
                  <p className="mt-2 text-xs text-slate-400">
                    Created {new Date(eq.created_at).toLocaleDateString()}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
