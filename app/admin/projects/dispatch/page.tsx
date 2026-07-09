'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'

type Project = {
  id: string
  name: string
  customer_name: string | null
  customer_phone: string | null
  customer_email: string | null
  site_address: string | null
  dispatch_company: string | null
  dispatch_job_number: string | null
  dispatch_contact: string | null
  dispatch_billing_email: string | null
  dispatch_tech_support: string | null
  status: string
  quote_amount: number | null
  invoice_amount: number | null
  payment_status: string
  pod_required: boolean
  pod_signed: boolean
  scheduled_date: string | null
  equipment_brand: string | null
  equipment_model: string | null
  equipment_type: string | null
  parts_status: string
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

function fmt$(n: number | null) {
  if (n == null) return '--'
  return '$' + Number(n).toLocaleString()
}

export default function DispatchPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [filterCompany, setFilterCompany] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterPod, setFilterPod] = useState('all')

  useEffect(() => {
    const stored = localStorage.getItem('blogAdminPassword')
    if (stored) { setPassword(stored); load(stored) }
    else setLoading(false)
  }, [])

  async function load(pw: string) {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/projects?source=dispatch', { headers: { 'x-admin-password': pw } })
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

  const companies = useMemo(() => {
    const set = new Set(projects.map(p => p.dispatch_company).filter(Boolean) as string[])
    return Array.from(set).sort()
  }, [projects])

  const filtered = useMemo(() => {
    let list = projects
    if (filterCompany !== 'all') list = list.filter(p => p.dispatch_company === filterCompany)
    if (filterStatus !== 'all') list = list.filter(p => p.status === filterStatus)
    if (filterPod === 'needed') list = list.filter(p => p.pod_required && !p.pod_signed && p.status === 'complete')
    if (filterPod === 'signed') list = list.filter(p => p.pod_signed)
    return list
  }, [projects, filterCompany, filterStatus, filterPod])

  const podNeeded = projects.filter(p => p.pod_required && !p.pod_signed && p.status === 'complete').length
  const unpaid = projects.filter(p => p.payment_status === 'invoiced').length
  const totalOwed = projects.filter(p => p.payment_status === 'invoiced').reduce((s, p) => s + (p.invoice_amount || p.quote_amount || 0), 0)
  const totalPaid = projects.filter(p => p.payment_status === 'paid').reduce((s, p) => s + (p.invoice_amount || 0), 0)

  if (!authorized && !loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Dispatch</p>
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
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Dispatch Jobs</p>
        <p className="mt-1 text-sm text-slate-500">All third-party dispatch work orders from Fitness Superstore, Ace Fitness, and others.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Total Jobs" value={String(projects.length)} color="text-slate-950" />
        <StatCard label="POD Needed" value={String(podNeeded)} color={podNeeded > 0 ? 'text-orange-600' : 'text-slate-400'} />
        <StatCard label="Outstanding" value={fmt$(totalOwed)} color={unpaid > 0 ? 'text-indigo-600' : 'text-slate-400'} />
        <StatCard label="Total Collected" value={fmt$(totalPaid)} color="text-emerald-600" />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select value={filterCompany} onChange={e => setFilterCompany(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none">
          <option value="all">All Companies</option>
          {companies.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none">
          <option value="all">All Statuses</option>
          {Object.entries(STATUS_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <select value={filterPod} onChange={e => setFilterPod(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none">
          <option value="all">All POD Status</option>
          <option value="needed">POD Needed</option>
          <option value="signed">POD Signed</option>
        </select>
        <Link href="/admin/projects/new" className="rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-black text-white hover:bg-slate-800">
          + New Dispatch Job
        </Link>
      </div>

      <p className="text-xs text-slate-400">{filtered.length} dispatch job{filtered.length !== 1 ? 's' : ''}</p>

      {loading ? (
        <p className="py-10 text-center text-slate-400">Loading...</p>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 py-16 text-center">
          <p className="text-slate-400">No dispatch jobs found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(p => (
            <div key={p.id} className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link href={`/admin/projects/${p.id}`} className="text-base font-black text-slate-950 hover:text-amber-600">
                      {p.name}
                    </Link>
                    <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase ${STATUS_COLOR[p.status] || 'border-slate-200 text-slate-500'}`}>
                      {STATUS_LABEL[p.status] || p.status}
                    </span>
                    {p.pod_required && !p.pod_signed && p.status === 'complete' && (
                      <span className="rounded-full border border-orange-200 bg-orange-50 px-2.5 py-0.5 text-[10px] font-black text-orange-700">POD NEEDED</span>
                    )}
                    {p.pod_signed && (
                      <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-black text-emerald-700">POD SIGNED</span>
                    )}
                  </div>

                  <div className="grid gap-2 text-xs text-slate-600 sm:grid-cols-2 lg:grid-cols-3">
                    <div>
                      <span className="font-black uppercase text-slate-400">Company</span>
                      <p className="font-bold text-amber-700">{p.dispatch_company || '--'}</p>
                    </div>
                    <div>
                      <span className="font-black uppercase text-slate-400">Job #</span>
                      <p className="font-bold text-slate-900">{p.dispatch_job_number || '--'}</p>
                    </div>
                    <div>
                      <span className="font-black uppercase text-slate-400">Customer</span>
                      <p className="font-bold text-slate-900">{p.customer_name || '--'}</p>
                    </div>
                    <div>
                      <span className="font-black uppercase text-slate-400">Address</span>
                      <p className="font-bold text-slate-900">{p.site_address || '--'}</p>
                    </div>
                    <div>
                      <span className="font-black uppercase text-slate-400">Equipment</span>
                      <p className="font-bold text-slate-900">{[p.equipment_brand, p.equipment_model].filter(Boolean).join(' ') || '--'}</p>
                    </div>
                    <div>
                      <span className="font-black uppercase text-slate-400">Parts</span>
                      <p className={`font-bold ${p.parts_status === 'received' ? 'text-emerald-600' : p.parts_status === 'ordered' ? 'text-amber-600' : 'text-slate-400'}`}>
                        {p.parts_status === 'none' ? '--' : p.parts_status}
                      </p>
                    </div>
                  </div>

                  {p.dispatch_billing_email && (
                    <div className="flex flex-wrap gap-3 pt-1">
                      <a href={`tel:${p.customer_phone}`} className="text-xs text-cyan-600 hover:text-cyan-500">{p.customer_phone}</a>
                      <a href={`mailto:${p.customer_email}`} className="text-xs text-cyan-600 hover:text-cyan-500">{p.customer_email}</a>
                      <a href={`mailto:${p.dispatch_billing_email}?subject=Invoice - Job ${p.dispatch_job_number}`}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-500">
                        Email Invoice
                      </a>
                    </div>
                  )}
                </div>

                <div className="flex flex-shrink-0 flex-col items-end gap-2">
                  <div className="text-right">
                    <p className="text-lg font-black text-slate-950">{fmt$(p.quote_amount)}</p>
                    {p.payment_status === 'paid' && <p className="text-xs font-black text-emerald-600">PAID</p>}
                    {p.payment_status === 'invoiced' && <p className="text-xs font-black text-indigo-600">INVOICED</p>}
                    {p.payment_status === 'unpaid' && p.status === 'complete' && <p className="text-xs font-black text-amber-600">COLLECT PAYMENT</p>}
                  </div>
                  {p.scheduled_date && <p className="text-xs text-purple-700">{p.scheduled_date}</p>}
                  <Link href={`/admin/projects/${p.id}`} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-white">
                    Open Job
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</p>
      <p className={`mt-2 text-2xl font-black ${color}`}>{value}</p>
    </div>
  )
}
