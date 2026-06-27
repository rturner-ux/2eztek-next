'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

type Account = {
  id: string
  access_token: string
  business_name: string
  owner_email: string
  location: string
  industry: string
  plan: string
  subscription_status: string
  onboarded: boolean
  last_scanned_at: string | null
  created_at: string
}

function getPassword() {
  if (typeof window === 'undefined') return ''
  return localStorage.getItem('blogAdminPassword') || ''
}

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  trialing: 'bg-cyan-100 text-cyan-700',
  past_due: 'bg-amber-100 text-amber-700',
  cancelled: 'bg-red-100 text-red-700',
  pending: 'bg-slate-100 text-slate-600',
}

export default function RankRadarAdminPage() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetch('/api/admin/rankradar', { headers: { 'x-admin-password': getPassword() } })
      .then((r) => r.json())
      .then((d) => { if (d.success) setAccounts(d.accounts) })
      .finally(() => setLoading(false))
  }, [])

  const filtered = accounts.filter((a) => {
    const q = search.toLowerCase()
    return a.business_name?.toLowerCase().includes(q) || a.owner_email?.toLowerCase().includes(q) || a.industry?.toLowerCase().includes(q)
  })

  const active = accounts.filter((a) => a.subscription_status === 'active' || a.subscription_status === 'trialing').length
  const mrr = accounts.filter((a) => a.subscription_status === 'active').reduce((sum, a) => sum + (a.plan === 'pro' ? 99 : 49), 0)

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="border-b border-slate-200 bg-white px-8 py-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Revenue</p>
            <h1 className="mt-1 text-2xl font-black text-slate-900">RankRadar Subscribers</h1>
            <p className="mt-1 text-sm text-slate-500">Manage all RankRadar subscriptions.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="rounded-xl border border-green-200 bg-green-50 px-5 py-3 text-center">
              <p className="text-2xl font-black text-green-700">${mrr}</p>
              <p className="text-xs text-green-600">MRR</p>
            </div>
            <div className="rounded-xl border border-cyan-200 bg-cyan-50 px-5 py-3 text-center">
              <p className="text-2xl font-black text-cyan-700">{active}</p>
              <p className="text-xs text-cyan-600">Active</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-5 py-3 text-center">
              <p className="text-2xl font-black text-slate-700">{accounts.length}</p>
              <p className="text-xs text-slate-500">Total</p>
            </div>
          </div>
        </div>
        <div className="mt-5">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by business, email, industry..."
            className="w-full max-w-md rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
          />
        </div>
      </div>

      <div className="px-8 py-6">
        {loading ? (
          <div className="py-20 text-center text-sm text-slate-400">Loading subscribers...</div>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white py-20 text-center">
            <p className="text-4xl">📡</p>
            <p className="mt-3 font-bold text-slate-900">No subscribers yet</p>
            <p className="mt-1 text-sm text-slate-500">Share the RankRadar landing page to start getting signups.</p>
            <Link href="/rankradar" target="_blank" className="mt-4 inline-block rounded-full bg-slate-900 px-5 py-2 text-xs font-black text-white hover:bg-slate-700">
              View Landing Page ↗
            </Link>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-100 bg-slate-50">
                <tr>
                  {['Business', 'Email', 'Industry', 'Plan', 'Status', 'Last Scan', 'Dashboard', ''].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3.5">
                      <p className="font-bold text-slate-900">{a.business_name}</p>
                      <p className="text-xs text-slate-400">{a.location}</p>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">{a.owner_email}</td>
                    <td className="px-5 py-3.5 text-slate-600">{a.industry || '—'}</td>
                    <td className="px-5 py-3.5">
                      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold capitalize text-slate-700">{a.plan}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase ${STATUS_COLORS[a.subscription_status] || 'bg-slate-100 text-slate-600'}`}>
                        {a.subscription_status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-400">
                      {a.last_scanned_at ? new Date(a.last_scanned_at).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="px-5 py-3.5">
                      <Link
                        href={`/rankradar/dashboard?token=${a.access_token}`}
                        target="_blank"
                        className="text-xs text-cyan-600 hover:text-cyan-800"
                      >
                        View ↗
                      </Link>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-400">
                      {new Date(a.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
