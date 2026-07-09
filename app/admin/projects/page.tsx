'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

type Project = {
  id: string
  name: string
  project_type: string
  job_source: string
  customer_name: string | null
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
  created_at: string
  updated_at: string
}

const STATUS_ORDER = ['new', 'quoted', 'parts_ordered', 'parts_received', 'scheduled', 'in_progress', 'punch_list', 'complete', 'invoiced', 'paid']

const STATUS_LABEL: Record<string, string> = {
  new: 'New',
  quoted: 'Quoted',
  parts_ordered: 'Parts Ordered',
  parts_received: 'Parts Received',
  scheduled: 'Scheduled',
  in_progress: 'In Progress',
  punch_list: 'Punch List',
  complete: 'Complete',
  invoiced: 'Invoiced',
  paid: 'Paid',
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

function fmt$(n: number | null) {
  if (n == null) return '--'
  return '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 0 })
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const h = Math.floor(diff / 3600000)
  if (h < 1) return 'just now'
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

export default function ProjectsDashboard() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const stored = localStorage.getItem('blogAdminPassword')
    if (stored) { setPassword(stored); load(stored) }
    else setLoading(false)
  }, [])

  async function load(pw: string) {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/projects', { headers: { 'x-admin-password': pw } })
      const data = await res.json()
      if (!data.success) throw new Error(data.error || 'Unauthorized')
      setProjects(data.projects || [])
      setAuthorized(true)
      localStorage.setItem('blogAdminPassword', pw)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load')
      setAuthorized(false)
    } finally {
      setLoading(false)
    }
  }

  if (!authorized && !loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">MISSION — Access</p>
          <h2 className="mt-1 text-xl font-black text-slate-900">Admin Password</h2>
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && load(password)}
            placeholder="Password"
            autoFocus
            className="mt-5 w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 placeholder:text-slate-400"
          />
          <button
            onClick={() => load(password)}
            className="mt-4 w-full rounded-lg bg-slate-950 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800"
          >
            Unlock
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-slate-400">
        Loading command center...
      </div>
    )
  }

  // Revenue metrics
  const totalQuoted = projects.reduce((s, p) => s + (p.quote_amount || 0), 0)
  const totalInvoiced = projects.reduce((s, p) => s + (p.invoice_amount || 0), 0)
  const totalPaid = projects.filter(p => p.payment_status === 'paid').reduce((s, p) => s + (p.invoice_amount || 0), 0)
  const outstanding = projects.filter(p => p.payment_status === 'invoiced').reduce((s, p) => s + (p.invoice_amount || 0), 0)

  // Status breakdown
  const byStatus = STATUS_ORDER.map(s => ({ status: s, count: projects.filter(p => p.status === s).length })).filter(x => x.count > 0)

  // Active jobs
  const active = projects.filter(p => !['paid', 'complete'].includes(p.status))
  const needsAttention = active.filter(p => ['new', 'punch_list', 'parts_received'].includes(p.status))
  const scheduled = projects.filter(p => p.status === 'scheduled' && p.scheduled_date).sort((a, b) => String(a.scheduled_date).localeCompare(String(b.scheduled_date)))
  const dispatchPod = projects.filter(p => p.pod_required && !p.pod_signed && p.status === 'complete')
  const uninvoiced = projects.filter(p => p.status === 'complete' && p.payment_status === 'unpaid')

  return (
    <div className="space-y-6">
      {/* Revenue strip */}
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <RevenueCard label="Total Quoted" value={fmt$(totalQuoted)} color="text-blue-600" />
        <RevenueCard label="Total Invoiced" value={fmt$(totalInvoiced)} color="text-indigo-600" />
        <RevenueCard label="Collected" value={fmt$(totalPaid)} color="text-emerald-600" />
        <RevenueCard label="Outstanding" value={fmt$(outstanding)} color="text-amber-600" />
      </div>

      {/* Status pipeline */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <p className="mb-4 text-xs font-black uppercase tracking-widest text-slate-400">Pipeline</p>
        <div className="flex flex-wrap gap-2">
          {byStatus.map(({ status, count }) => (
            <Link
              key={status}
              href={`/admin/projects/list?status=${status}`}
              className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-bold transition hover:opacity-80 ${STATUS_COLOR[status] || 'border-slate-200 text-slate-500'}`}
            >
              <span>{STATUS_LABEL[status]}</span>
              <span className="rounded-full bg-black/10 px-2 py-0.5 text-xs font-black">{count}</span>
            </Link>
          ))}
          {byStatus.length === 0 && (
            <p className="text-sm text-slate-400">No jobs yet. <Link href="/admin/projects/new" className="text-cyan-600 underline">Create your first job.</Link></p>
          )}
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        {/* Needs attention */}
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-xs font-black uppercase tracking-widest text-red-600">Needs Attention</p>
            <span className="rounded-full border border-red-200 bg-white px-2.5 py-0.5 text-xs font-black text-red-600">{needsAttention.length}</span>
          </div>
          <div className="space-y-2">
            {needsAttention.slice(0, 6).map(p => (
              <Link key={p.id} href={`/admin/projects/${p.id}`} className="block rounded-xl border border-red-100 bg-white p-3 hover:border-red-200">
                <p className="text-sm font-bold text-slate-900">{p.name}</p>
                <div className="mt-1 flex items-center gap-2">
                  <span className={`rounded-full border px-2 py-0.5 text-[10px] font-black uppercase ${STATUS_COLOR[p.status]}`}>{STATUS_LABEL[p.status]}</span>
                  {p.customer_name && <span className="text-xs text-slate-500">{p.customer_name}</span>}
                </div>
              </Link>
            ))}
            {needsAttention.length === 0 && <p className="text-sm text-slate-500">All clear.</p>}
          </div>
        </div>

        {/* Upcoming scheduled */}
        <div className="rounded-2xl border border-purple-200 bg-purple-50 p-5">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-xs font-black uppercase tracking-widest text-purple-700">Upcoming Jobs</p>
            <span className="rounded-full border border-purple-200 bg-white px-2.5 py-0.5 text-xs font-black text-purple-700">{scheduled.length}</span>
          </div>
          <div className="space-y-2">
            {scheduled.slice(0, 6).map(p => (
              <Link key={p.id} href={`/admin/projects/${p.id}`} className="block rounded-xl border border-purple-100 bg-white p-3 hover:border-purple-200">
                <p className="text-sm font-bold text-slate-900">{p.name}</p>
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-xs text-purple-700">{p.scheduled_date}</span>
                  {p.technician && <span className="text-xs text-slate-500">{p.technician}</span>}
                </div>
              </Link>
            ))}
            {scheduled.length === 0 && <p className="text-sm text-slate-500">No upcoming scheduled jobs.</p>}
          </div>
        </div>

        {/* Money actions */}
        <div className="space-y-4">
          {dispatchPod.length > 0 && (
            <div className="rounded-2xl border border-orange-200 bg-orange-50 p-5">
              <p className="mb-3 text-xs font-black uppercase tracking-widest text-orange-700">POD Required ({dispatchPod.length})</p>
              <div className="space-y-2">
                {dispatchPod.slice(0, 4).map(p => (
                  <Link key={p.id} href={`/admin/projects/${p.id}`} className="block rounded-xl border border-orange-100 bg-white p-3 hover:border-orange-200">
                    <p className="text-sm font-bold text-slate-900">{p.name}</p>
                    <p className="text-xs text-slate-500">{p.dispatch_company} #{p.dispatch_job_number}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {uninvoiced.length > 0 && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
              <p className="mb-3 text-xs font-black uppercase tracking-widest text-emerald-700">Ready to Invoice ({uninvoiced.length})</p>
              <div className="space-y-2">
                {uninvoiced.slice(0, 4).map(p => (
                  <Link key={p.id} href={`/admin/projects/${p.id}`} className="block rounded-xl border border-emerald-100 bg-white p-3 hover:border-emerald-200">
                    <p className="text-sm font-bold text-slate-900">{p.name}</p>
                    <p className="text-xs text-emerald-700">{fmt$(p.quote_amount)}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {dispatchPod.length === 0 && uninvoiced.length === 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="text-sm text-slate-400">No money actions needed right now.</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent activity */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-xs font-black uppercase tracking-widest text-slate-400">Recent Jobs</p>
          <Link href="/admin/projects/list" className="text-xs font-bold text-cyan-600 hover:text-cyan-500">View all</Link>
        </div>
        <div className="space-y-2">
          {projects.slice(0, 8).map(p => (
            <Link key={p.id} href={`/admin/projects/${p.id}`} className="flex items-center gap-4 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 hover:border-slate-200 hover:bg-white">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-slate-950">{p.name}</p>
                <p className="mt-0.5 text-xs text-slate-500">{p.customer_name || 'No customer'}{p.dispatch_company ? ` · ${p.dispatch_company}` : ''}</p>
              </div>
              <div className="flex flex-shrink-0 items-center gap-3">
                {p.quote_amount && <span className="text-sm font-black text-slate-700">{fmt$(p.quote_amount)}</span>}
                <span className={`rounded-full border px-2.5 py-1 text-[10px] font-black uppercase ${STATUS_COLOR[p.status] || 'border-slate-200 text-slate-500'}`}>
                  {STATUS_LABEL[p.status] || p.status}
                </span>
                <span className="text-xs text-slate-400">{timeAgo(p.updated_at || p.created_at)}</span>
              </div>
            </Link>
          ))}
          {projects.length === 0 && (
            <div className="py-10 text-center">
              <p className="text-slate-400">No jobs yet.</p>
              <Link href="/admin/projects/new" className="mt-3 inline-block rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-black text-white hover:bg-slate-800">
                + Create First Job
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function RevenueCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</p>
      <p className={`mt-2 text-3xl font-black ${color}`}>{value}</p>
    </div>
  )
}
