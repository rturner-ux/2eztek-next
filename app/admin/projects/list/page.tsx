'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

type Project = {
  id: string
  name: string
  project_type: string
  job_source: string
  customer_name: string | null
  customer_phone: string | null
  site_address: string | null
  status: string
  priority: string
  quote_amount: number | null
  invoice_amount: number | null
  payment_status: string
  parts_status: string
  pod_required: boolean
  pod_signed: boolean
  scheduled_date: string | null
  technician: string | null
  dispatch_company: string | null
  dispatch_job_number: string | null
  equipment_type: string | null
  equipment_brand: string | null
  created_at: string
}

const STATUS_LABEL: Record<string, string> = {
  new: 'New', quoted: 'Quoted', parts_ordered: 'Parts Ordered',
  parts_received: 'Parts Received', scheduled: 'Scheduled', in_progress: 'In Progress',
  punch_list: 'Punch List', complete: 'Complete', invoiced: 'Invoiced', paid: 'Paid',
}
const STATUS_COLOR: Record<string, string> = {
  new: 'border-slate-300 bg-slate-100 text-slate-600',
  quoted: 'border-blue-200 bg-blue-50 text-blue-700',
  parts_ordered: 'border-amber-200 bg-amber-50 text-amber-700',
  parts_received: 'border-yellow-200 bg-yellow-50 text-yellow-700',
  scheduled: 'border-purple-200 bg-purple-50 text-purple-700',
  in_progress: 'border-cyan-200 bg-cyan-50 text-cyan-700',
  punch_list: 'border-orange-200 bg-orange-50 text-orange-700',
  complete: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  invoiced: 'border-indigo-200 bg-indigo-50 text-indigo-700',
  paid: 'border-green-200 bg-green-50 text-green-700',
}
const PRIORITY_COLOR: Record<string, string> = {
  low: 'text-slate-400',
  medium: 'text-blue-600',
  high: 'text-orange-600',
  urgent: 'text-red-600',
}

function fmt$(n: number | null) {
  if (n == null) return ''
  return '$' + Number(n).toLocaleString()
}

function ListContent() {
  const searchParams = useSearchParams()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState(searchParams.get('status') || 'all')
  const [filterSource, setFilterSource] = useState('all')
  const [deletingId, setDeletingId] = useState('')

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

  async function deleteProject(id: string, name: string) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return
    setDeletingId(id)
    try {
      await fetch(`/api/admin/projects/${id}`, {
        method: 'DELETE',
        headers: { 'x-admin-password': password },
      })
      setProjects(prev => prev.filter(p => p.id !== id))
    } finally {
      setDeletingId('')
    }
  }

  const filtered = useMemo(() => {
    let list = projects
    if (filterStatus !== 'all') list = list.filter(p => p.status === filterStatus)
    if (filterSource !== 'all') list = list.filter(p => p.job_source === filterSource)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        (p.customer_name || '').toLowerCase().includes(q) ||
        (p.dispatch_company || '').toLowerCase().includes(q) ||
        (p.dispatch_job_number || '').toLowerCase().includes(q) ||
        (p.site_address || '').toLowerCase().includes(q)
      )
    }
    return list
  }, [projects, filterStatus, filterSource, search])

  if (!authorized && !loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">All Jobs</p>
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

  return (
    <div className="space-y-5">
      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search jobs, customers, dispatch #..."
          className="min-w-[260px] flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
        />
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none">
          <option value="all">All Statuses</option>
          {Object.entries(STATUS_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <select value={filterSource} onChange={e => setFilterSource(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none">
          <option value="all">All Sources</option>
          <option value="direct">Direct</option>
          <option value="dispatch">Dispatch</option>
        </select>
        <Link href="/admin/projects/new" className="rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-black text-white hover:bg-slate-800">
          + New Job
        </Link>
      </div>

      <p className="text-xs text-slate-400">{filtered.length} job{filtered.length !== 1 ? 's' : ''}</p>

      {loading ? (
        <p className="py-10 text-center text-slate-400">Loading...</p>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 py-16 text-center">
          <p className="text-slate-400">No jobs found.</p>
          <Link href="/admin/projects/new" className="mt-4 inline-block rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-black text-white">+ New Job</Link>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(p => (
            <div key={p.id} className="group rounded-2xl border border-slate-200 bg-white px-5 py-4 hover:border-slate-300 hover:bg-slate-50">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link href={`/admin/projects/${p.id}`} className="text-base font-black text-slate-950 hover:text-cyan-600">
                      {p.name}
                    </Link>
                    <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase ${STATUS_COLOR[p.status] || 'border-slate-200 text-slate-500'}`}>
                      {STATUS_LABEL[p.status] || p.status}
                    </span>
                    <span className={`text-xs font-black uppercase ${PRIORITY_COLOR[p.priority] || 'text-slate-400'}`}>{p.priority}</span>
                    {p.pod_required && !p.pod_signed && p.status === 'complete' && (
                      <span className="rounded-full border border-orange-200 bg-orange-50 px-2 py-0.5 text-[10px] font-black text-orange-700">POD NEEDED</span>
                    )}
                  </div>
                  <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                    {p.customer_name && <span>{p.customer_name}</span>}
                    {p.site_address && <span>{p.site_address}</span>}
                    {p.dispatch_company && <span>{p.dispatch_company} #{p.dispatch_job_number}</span>}
                    {p.equipment_brand && <span>{p.equipment_brand} {p.equipment_type}</span>}
                    {p.scheduled_date && <span className="text-purple-700">Scheduled {p.scheduled_date}</span>}
                    {p.technician && <span>{p.technician}</span>}
                  </div>
                </div>
                <div className="flex flex-shrink-0 items-center gap-4">
                  {(p.quote_amount || p.invoice_amount) && (
                    <div className="text-right">
                      {p.quote_amount && <p className="text-sm font-black text-slate-950">{fmt$(p.quote_amount)}</p>}
                      {p.payment_status === 'paid' && <p className="text-xs text-emerald-600">PAID</p>}
                      {p.payment_status === 'invoiced' && <p className="text-xs text-indigo-600">INVOICED</p>}
                      {p.payment_status === 'unpaid' && p.status === 'complete' && <p className="text-xs text-amber-600">UNPAID</p>}
                    </div>
                  )}
                  <div className="flex gap-2 opacity-0 transition group-hover:opacity-100">
                    <Link href={`/admin/projects/${p.id}`} className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50">
                      Open
                    </Link>
                    <button
                      onClick={() => deleteProject(p.id, p.name)}
                      disabled={deletingId === p.id}
                      className="rounded-xl border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-100 disabled:opacity-50"
                    >
                      {deletingId === p.id ? '...' : 'Delete'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function ProjectsListPage() {
  return (
    <Suspense>
      <ListContent />
    </Suspense>
  )
}
