'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'

type Project = {
  id: string
  name: string
  customer_name: string | null
  customer_email: string | null
  customer_phone: string | null
  dispatch_company: string | null
  dispatch_job_number: string | null
  dispatch_billing_email: string | null
  status: string
  job_source: string
  quote_amount: number | null
  invoice_amount: number | null
  payment_status: string
  equipment_brand: string | null
  equipment_type: string | null
  created_at: string
}

const STATUS_COLOR: Record<string, string> = {
  new: 'border-slate-300 bg-slate-100 text-slate-600',
  quoted: 'border-blue-200 bg-blue-50 text-blue-700',
  complete: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  invoiced: 'border-indigo-200 bg-indigo-50 text-indigo-700',
  paid: 'border-green-200 bg-green-50 text-green-700',
}
const STATUS_LABEL: Record<string, string> = {
  new: 'New', quoted: 'Quoted', parts_ordered: 'Parts Ordered',
  parts_received: 'Parts Received', scheduled: 'Scheduled', in_progress: 'In Progress',
  punch_list: 'Punch List', complete: 'Complete', invoiced: 'Invoiced', paid: 'Paid',
}

function fmt$(n: number | null) {
  if (n == null) return '--'
  return '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 0 })
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function QuotesPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [filterPay, setFilterPay] = useState('all')
  const [search, setSearch] = useState('')
  const [composing, setComposing] = useState<Project | null>(null)
  const [quoteText, setQuoteText] = useState('')

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

  const quoted = useMemo(() => {
    let list = projects.filter(p => p.quote_amount != null)
    if (filterPay !== 'all') list = list.filter(p => p.payment_status === filterPay)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        (p.customer_name || '').toLowerCase().includes(q) ||
        (p.dispatch_company || '').toLowerCase().includes(q)
      )
    }
    return list
  }, [projects, filterPay, search])

  const totalQuoted = quoted.reduce((s, p) => s + (p.quote_amount || 0), 0)
  const totalInvoiced = quoted.filter(p => p.payment_status !== 'unpaid').reduce((s, p) => s + (p.invoice_amount || p.quote_amount || 0), 0)
  const totalPaid = quoted.filter(p => p.payment_status === 'paid').reduce((s, p) => s + (p.invoice_amount || p.quote_amount || 0), 0)

  function buildQuoteEmail(p: Project): string {
    const isDispatch = p.job_source === 'dispatch'
    if (isDispatch) {
      return `Hi ${p.dispatch_company || 'Team'},

Thank you for sending over the work order details. Here is our quote for the repair at ${p.customer_name ? p.customer_name + ', ' : ''}${p.name}:

All-Inclusive Quote: ${fmt$(p.quote_amount)}
Includes labor, travel, and all work specified in the job description. No additional taxes or fees.

Return Trip (if required): $125.00
Same all-inclusive rate.

Parts Shipping Address:
2EZ TEK
1227 Addison Rd, Apt 170
Dallas, TX 75287

Please confirm the work order and we will schedule at the customer's earliest convenience.

Robby Turner
2EZ TEK | (972) 807-7232
rturner@2eztek.com`
    }
    return `Hi ${p.customer_name || 'there'},

Thank you for contacting 2EZ TEK. Here is your quote for the requested service:

Service: ${p.name}
Equipment: ${[p.equipment_brand, p.equipment_type].filter(Boolean).join(' ') || 'As discussed'}
Quote: ${fmt$(p.quote_amount)}

This is an all-inclusive quote with no hidden fees. We will come to you, complete the work on-site, and test everything before leaving.

To schedule, reply to this email or call (972) 807-7232. We have same-week availability.

Robby Turner
2EZ TEK | (972) 807-7232
rturner@2eztek.com`
  }

  if (!authorized && !loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Quotes</p>
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
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Quotes</p>
        <p className="mt-1 text-sm text-slate-500">All jobs with a quote attached. Generate emails, track payment status.</p>
      </div>

      {/* Revenue strip */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Quoted</p>
          <p className="mt-1.5 text-2xl font-black text-blue-600">{fmt$(totalQuoted)}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Invoiced</p>
          <p className="mt-1.5 text-2xl font-black text-indigo-600">{fmt$(totalInvoiced)}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Collected</p>
          <p className="mt-1.5 text-2xl font-black text-emerald-600">{fmt$(totalPaid)}</p>
        </div>
      </div>

      {/* Quote composer modal */}
      {composing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-black uppercase tracking-widest text-slate-400">Quote Email</p>
              <button onClick={() => setComposing(null)} className="text-slate-400 hover:text-slate-900">✕</button>
            </div>
            <div className="mb-3 flex gap-2 text-xs text-slate-500">
              {composing.customer_email && <span>To: {composing.customer_email}</span>}
              {composing.dispatch_billing_email && <span>To: {composing.dispatch_billing_email}</span>}
            </div>
            <textarea
              value={quoteText}
              onChange={e => setQuoteText(e.target.value)}
              rows={16}
              className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-mono text-sm text-slate-900 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
            />
            <div className="mt-4 flex gap-3">
              <button
                onClick={() => { navigator.clipboard.writeText(quoteText) }}
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-white"
              >
                Copy to Clipboard
              </button>
              {(composing.customer_email || composing.dispatch_billing_email) && (
                <a
                  href={`mailto:${composing.dispatch_billing_email || composing.customer_email}?subject=Quote - ${composing.name}&body=${encodeURIComponent(quoteText)}`}
                  className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-black text-white hover:bg-slate-800"
                >
                  Open in Email
                </a>
              )}
              <button onClick={() => setComposing(null)} className="ml-auto rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-500 hover:text-slate-900">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search quotes..."
          className="min-w-[200px] flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100" />
        <select value={filterPay} onChange={e => setFilterPay(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none">
          <option value="all">All Payment Status</option>
          <option value="unpaid">Unpaid</option>
          <option value="invoiced">Invoiced</option>
          <option value="paid">Paid</option>
        </select>
        <Link href="/admin/projects/new" className="rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-black text-white hover:bg-slate-800">
          + New Job
        </Link>
      </div>

      {loading ? <p className="py-10 text-center text-slate-400">Loading...</p> : (
        <div className="space-y-2">
          {quoted.map(p => (
            <div key={p.id} className="group flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 md:flex-row md:items-center md:justify-between hover:border-slate-300 hover:bg-slate-50">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Link href={`/admin/projects/${p.id}`} className="text-sm font-black text-slate-950 hover:text-cyan-600">{p.name}</Link>
                  <span className={`rounded-full border px-2 py-0.5 text-[10px] font-black uppercase ${STATUS_COLOR[p.status] || 'border-slate-200 text-slate-500'}`}>
                    {STATUS_LABEL[p.status] || p.status}
                  </span>
                  <span className={`text-[10px] font-black uppercase ${p.payment_status === 'paid' ? 'text-emerald-600' : p.payment_status === 'invoiced' ? 'text-indigo-600' : 'text-amber-600'}`}>
                    {p.payment_status}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {p.customer_name || p.dispatch_company || 'No customer'}
                  {p.dispatch_job_number ? ` · Job #${p.dispatch_job_number}` : ''}
                  {' · '}{fmtDate(p.created_at)}
                </p>
              </div>
              <div className="flex flex-shrink-0 items-center gap-4">
                <p className="text-lg font-black text-slate-950">{fmt$(p.quote_amount)}</p>
                <button
                  onClick={() => { setComposing(p); setQuoteText(buildQuoteEmail(p)) }}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 opacity-0 group-hover:opacity-100 hover:bg-white transition"
                >
                  Quote Email
                </button>
                <Link href={`/admin/projects/${p.id}`} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 opacity-0 group-hover:opacity-100 hover:bg-white transition">
                  Open
                </Link>
              </div>
            </div>
          ))}
          {quoted.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-300 py-16 text-center">
              <p className="text-slate-400">No quoted jobs yet.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
