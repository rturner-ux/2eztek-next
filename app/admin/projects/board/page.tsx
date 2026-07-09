'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

type Project = {
  id: string
  name: string
  project_type: string
  job_source: string
  customer_name: string | null
  status: string
  priority: string
  quote_amount: number | null
  scheduled_date: string | null
  dispatch_company: string | null
  pod_required: boolean
  pod_signed: boolean
  equipment_brand: string | null
  equipment_type: string | null
}

const COLUMNS = [
  { status: 'new',            label: 'New',            color: 'border-slate-200 bg-slate-50',   dot: 'bg-slate-400', label_color: 'text-slate-600' },
  { status: 'quoted',         label: 'Quoted',         color: 'border-blue-200 bg-blue-50',     dot: 'bg-blue-500',  label_color: 'text-blue-700' },
  { status: 'parts_ordered',  label: 'Parts Ordered',  color: 'border-amber-200 bg-amber-50',   dot: 'bg-amber-500', label_color: 'text-amber-700' },
  { status: 'parts_received', label: 'Parts Received', color: 'border-yellow-200 bg-yellow-50', dot: 'bg-yellow-500', label_color: 'text-yellow-700' },
  { status: 'scheduled',      label: 'Scheduled',      color: 'border-purple-200 bg-purple-50', dot: 'bg-purple-500', label_color: 'text-purple-700' },
  { status: 'in_progress',    label: 'In Progress',    color: 'border-cyan-200 bg-cyan-50',     dot: 'bg-cyan-500',  label_color: 'text-cyan-700' },
  { status: 'punch_list',     label: 'Punch List',     color: 'border-orange-200 bg-orange-50', dot: 'bg-orange-500', label_color: 'text-orange-700' },
  { status: 'complete',       label: 'Complete',       color: 'border-emerald-200 bg-emerald-50', dot: 'bg-emerald-500', label_color: 'text-emerald-700' },
  { status: 'invoiced',       label: 'Invoiced',       color: 'border-indigo-200 bg-indigo-50', dot: 'bg-indigo-500', label_color: 'text-indigo-700' },
  { status: 'paid',           label: 'Paid',           color: 'border-green-200 bg-green-50',   dot: 'bg-green-500', label_color: 'text-green-700' },
]

const PRIORITY_DOT: Record<string, string> = {
  urgent: 'bg-red-500',
  high: 'bg-orange-500',
  medium: 'bg-blue-500',
  low: 'bg-slate-400',
}

function fmt$(n: number | null) {
  if (!n) return null
  return '$' + Number(n).toLocaleString()
}

export default function BoardPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [movingId, setMovingId] = useState('')

  useEffect(() => {
    const stored = localStorage.getItem('blogAdminPassword')
    if (stored) { setPassword(stored); load(stored) }
    else setLoading(false)
  }, [])

  async function load(pw: string) {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/projects', { headers: { 'x-admin-password': pw } })
      const data = await res.json()
      if (!data.success) throw new Error(data.error || 'Unauthorized')
      setProjects(data.projects || [])
      setAuthorized(true)
      localStorage.setItem('blogAdminPassword', pw)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed')
      setAuthorized(false)
    } finally {
      setLoading(false)
    }
  }

  async function moveStatus(id: string, status: string) {
    setMovingId(id)
    try {
      const res = await fetch(`/api/admin/projects/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
        body: JSON.stringify({ status }),
      })
      const data = await res.json()
      if (data.success) {
        setProjects(prev => prev.map(p => p.id === id ? { ...p, status } : p))
      }
    } finally {
      setMovingId('')
    }
  }

  if (!authorized && !loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Board</p>
          <h2 className="mt-1 text-xl font-black text-slate-900">Admin Password</h2>
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          <input type="password" value={password} onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && load(password)}
            placeholder="Password" autoFocus
            className="mt-5 w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 placeholder:text-slate-400" />
          <button onClick={() => load(password)} className="mt-4 w-full rounded-lg bg-slate-950 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800">Unlock</button>
        </div>
      </div>
    )
  }

  const statuses = COLUMNS.map(col => col.status)
  const NEXT: Record<string, string> = {}
  const PREV: Record<string, string> = {}
  statuses.forEach((s, i) => {
    if (i < statuses.length - 1) NEXT[s] = statuses[i + 1]
    if (i > 0) PREV[s] = statuses[i - 1]
  })

  if (loading) return <p className="py-10 text-center text-slate-400">Loading...</p>

  return (
    <div className="overflow-x-auto pb-6">
      <div className="flex gap-4" style={{ minWidth: `${COLUMNS.length * 260}px` }}>
        {COLUMNS.map(col => {
          const cards = projects.filter(p => p.status === col.status)
          return (
            <div key={col.status} className="w-64 flex-shrink-0">
              <div className={`rounded-2xl border ${col.color} p-3`}>
                <div className="mb-3 flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${col.dot}`} />
                  <span className={`text-xs font-black uppercase tracking-wider ${col.label_color}`}>{col.label}</span>
                  <span className="ml-auto rounded-full bg-black/10 px-2 py-0.5 text-[10px] font-black text-slate-600">{cards.length}</span>
                </div>
                <div className="space-y-2">
                  {cards.map(p => (
                    <div key={p.id} className="group rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                      <Link href={`/admin/projects/${p.id}`} className="block">
                        <div className="flex items-start gap-1.5">
                          <span className={`mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full ${PRIORITY_DOT[p.priority] || 'bg-slate-400'}`} />
                          <p className="text-sm font-bold leading-snug text-slate-950 hover:text-cyan-600">{p.name}</p>
                        </div>
                        <div className="mt-2 space-y-1 text-xs text-slate-500">
                          {p.customer_name && <p>{p.customer_name}</p>}
                          {p.dispatch_company && <p className="text-amber-600">{p.dispatch_company}</p>}
                          {p.equipment_brand && <p>{p.equipment_brand} {p.equipment_type}</p>}
                          {p.scheduled_date && <p className="text-purple-700">{p.scheduled_date}</p>}
                          {p.quote_amount && <p className="font-black text-slate-700">{fmt$(p.quote_amount)}</p>}
                          {p.pod_required && !p.pod_signed && <p className="font-bold text-orange-600">POD needed</p>}
                        </div>
                      </Link>
                      {/* Move arrows */}
                      <div className="mt-2 flex gap-1 opacity-0 transition group-hover:opacity-100">
                        {PREV[p.status] && (
                          <button
                            onClick={() => moveStatus(p.id, PREV[p.status])}
                            disabled={movingId === p.id}
                            className="flex-1 rounded-lg border border-slate-200 py-1 text-[10px] font-black text-slate-500 hover:border-slate-300 hover:text-slate-700 disabled:opacity-30"
                          >
                            Back
                          </button>
                        )}
                        {NEXT[p.status] && (
                          <button
                            onClick={() => moveStatus(p.id, NEXT[p.status])}
                            disabled={movingId === p.id}
                            className="flex-1 rounded-lg border border-cyan-200 bg-cyan-50 py-1 text-[10px] font-black text-cyan-700 hover:bg-cyan-100 disabled:opacity-30"
                          >
                            Advance
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  {cards.length === 0 && (
                    <div className="rounded-xl border border-dashed border-slate-200 py-6 text-center text-xs text-slate-400">
                      Empty
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
