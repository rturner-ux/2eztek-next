'use client'
import { useEffect, useState } from 'react'
import { use } from 'react'
import Link from 'next/link'
import { qrImageUrl, equipmentQrUrl } from '@/lib/equipment-utils'

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

type ServiceRequest = {
  id: string
  service_type: string
  equipment_type: string
  brand_model: string
  details: string
  status: string
  source: string
  created_at: string
}

function getPassword() {
  if (typeof window === 'undefined') return ''
  return localStorage.getItem('blogAdminPassword') || ''
}

const STATUS_COLORS: Record<string, string> = {
  new: 'bg-amber-100 text-amber-700',
  scheduled: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-purple-100 text-purple-700',
  completed: 'bg-green-100 text-green-700',
}

export default function EquipmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [equipment, setEquipment] = useState<Equipment | null>(null)
  const [history, setHistory] = useState<ServiceRequest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/admin/equipment/${id}`, {
      headers: { 'x-admin-password': getPassword() },
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setEquipment(d.equipment)
          setHistory(d.history)
        }
      })
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-400">Loading equipment...</p>
      </div>
    )
  }

  if (!equipment) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">Equipment not found.</p>
      </div>
    )
  }

  const publicUrl = equipmentQrUrl(equipment.id)

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white px-8 py-6">
        <Link href="/admin/equipment" className="text-xs font-bold text-cyan-600 hover:text-cyan-700">
          ← Equipment / Asset Tags
        </Link>
        <div className="mt-3 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Asset Tag</p>
            <h1 className="mt-1 text-2xl font-black text-slate-900">
              {equipment.brand} {equipment.model || ''}
            </h1>
            <span className="mt-1 inline-block rounded-full bg-cyan-100 px-2.5 py-0.5 text-xs font-bold text-cyan-700">
              {equipment.equipment_type || 'Equipment'}
            </span>
          </div>
          <button
            onClick={() => window.print()}
            className="flex-shrink-0 rounded-lg bg-slate-900 px-5 py-2.5 text-xs font-black uppercase tracking-widest text-white transition hover:bg-slate-700"
          >
            Print Asset Tag
          </button>
        </div>
      </div>

      <div className="px-8 py-6">
        <div className="grid gap-6 lg:grid-cols-3">

          {/* QR Code card */}
          <div className="lg:col-span-1">
            <div className="rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm print:border-2 print:border-slate-900">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">2EZ TEK Asset Tag</p>
              <p className="mt-1 text-sm font-black text-slate-900">
                {equipment.brand} {equipment.model || ''}
              </p>
              <p className="text-xs text-slate-500">{equipment.equipment_type}</p>

              <div className="my-5 flex justify-center">
                <img
                  src={qrImageUrl(equipment.id, 220)}
                  alt="QR Code"
                  width={220}
                  height={220}
                  className="rounded-lg border border-slate-100"
                />
              </div>

              <p className="text-[10px] text-slate-400 break-all">{publicUrl}</p>
              <p className="mt-2 text-[10px] text-slate-400">Scan to report an issue or view service history</p>

              <a
                href={qrImageUrl(equipment.id, 600)}
                download={`asset-tag-${equipment.id}.png`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-block w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-bold text-slate-700 transition hover:border-cyan-400 hover:text-cyan-700"
              >
                Download QR Code
              </a>
            </div>

            {/* Customer info */}
            <div className="mt-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Customer</p>
              <p className="mt-2 font-bold text-slate-900">{equipment.customer_name}</p>
              <p className="text-sm text-slate-500">{equipment.customer_email}</p>
              <p className="text-sm text-slate-500">{equipment.customer_phone}</p>
              {equipment.address && (
                <p className="mt-1 text-sm text-slate-400">{equipment.address}</p>
              )}
              <p className="mt-3 text-xs text-slate-400">
                Asset created {new Date(equipment.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Service history */}
          <div className="lg:col-span-2">
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-6 py-4 flex items-center justify-between">
                <div>
                  <h2 className="font-black text-slate-900">Service History</h2>
                  <p className="text-xs text-slate-500">{history.length} request{history.length !== 1 ? 's' : ''} on record</p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                  {history.length} visits
                </span>
              </div>

              {history.length === 0 ? (
                <div className="py-16 text-center">
                  <p className="text-2xl">🔧</p>
                  <p className="mt-2 text-sm font-bold text-slate-700">No service history yet</p>
                  <p className="mt-1 text-xs text-slate-400">
                    Service requests will appear here as they come in.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {history.map((req, i) => (
                    <div key={req.id} className="px-6 py-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-black text-slate-500">
                            {history.length - i}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-slate-900">
                                {req.service_type || 'Service Request'}
                              </span>
                              <span className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wide ${STATUS_COLORS[req.status] || 'bg-slate-100 text-slate-600'}`}>
                                {req.status || 'new'}
                              </span>
                            </div>
                            {req.details && (
                              <p className="mt-1.5 text-sm text-slate-600">{req.details}</p>
                            )}
                            <div className="mt-2 flex items-center gap-3 text-xs text-slate-400">
                              <span>{new Date(req.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                              {req.source && <span>via {req.source}</span>}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
