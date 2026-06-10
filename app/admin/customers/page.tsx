'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

type Customer = {
  id: string
  name: string
  email: string
  phone: string
  address: string | null
  service_type: string | null
  equipment_type: string | null
  brand_model: string | null
  details: string | null
  source: string | null
  page: string | null
  status: string
  created_at: string
  updated_at: string
  last_request_at: string
  distance_miles: number | null
  triage_score: number | null
  triage_priority: string | null
}

const PRIORITY_STYLES: Record<string, string> = {
  URGENT: 'border-red-400/30 bg-red-400/10 text-red-300',
  HIGH: 'border-orange-400/30 bg-orange-400/10 text-orange-300',
  MEDIUM: 'border-yellow-400/30 bg-yellow-400/10 text-yellow-300',
  STANDARD: 'border-white/10 bg-white/5 text-white/50',
}

function isNew(dateStr: string) {
  return Date.now() - new Date(dateStr).getTime() < 48 * 60 * 60 * 1000
}

function isToday(dateStr: string) {
  return Date.now() - new Date(dateStr).getTime() < 24 * 60 * 60 * 1000
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

export default function AdminCustomersPage() {
  const [password, setPassword] = useState('')
  const [customers, setCustomers] = useState<Customer[]>([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'today' | 'new'>('all')
  const [loading, setLoading] = useState(false)
  const [importing, setImporting] = useState(false)
  const [deletingId, setDeletingId] = useState('')
  const [authorized, setAuthorized] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const loadCustomers = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true)
      setErrorMessage('')
      const response = await fetch('/api/admin/customers', {
        headers: { 'x-admin-password': password },
      })
      const data = await response.json()
      if (!response.ok || !data.success) {
        throw new Error(data.message || data.error || 'Unable to load customers.')
      }
      setCustomers(data.customers || [])
      setAuthorized(true)
      setLastRefreshed(new Date())
    } catch (error) {
      if (!silent) {
        setAuthorized(false)
        setErrorMessage(error instanceof Error ? error.message : 'Unable to load customers.')
      }
    } finally {
      if (!silent) setLoading(false)
    }
  }, [password])

  // Auto-refresh every 90 seconds once signed in
  useEffect(() => {
    if (!authorized) return
    const interval = setInterval(() => loadCustomers(true), 90000)
    return () => clearInterval(interval)
  }, [authorized, loadCustomers])

  const filteredCustomers = useMemo(() => {
    let list = customers
    if (filter === 'today') list = list.filter((c) => isToday(c.last_request_at))
    if (filter === 'new') list = list.filter((c) => isNew(c.last_request_at))
    const query = search.toLowerCase().trim()
    if (!query) return list
    return list.filter((c) =>
      [c.name, c.email, c.phone, c.address, c.service_type, c.equipment_type, c.brand_model, c.source]
        .some((v) => v?.toLowerCase().includes(query))
    )
  }, [customers, search, filter])

  const todayCount = useMemo(() => customers.filter((c) => isToday(c.last_request_at)).length, [customers])
  const newCount = useMemo(() => customers.filter((c) => isNew(c.last_request_at)).length, [customers])

  async function importRecentCustomers() {
    try {
      setImporting(true)
      setErrorMessage('')
      const response = await fetch('/api/admin/customers', {
        method: 'POST',
        headers: { 'x-admin-password': password },
      })
      const data = await response.json()
      if (!response.ok || !data.success) throw new Error(data.message || 'Unable to import customers.')
      setErrorMessage(`Import complete. Added or updated: ${data.imported}. Skipped: ${data.skipped}.`)
      await loadCustomers()
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to import customers.')
    } finally {
      setImporting(false)
    }
  }

  async function deleteCustomer(customer: Customer) {
    if (!confirm(`Delete ${customer.name}? This cannot be undone.`)) return
    try {
      setDeletingId(customer.id)
      setErrorMessage('')
      const response = await fetch('/api/admin/customers', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
        body: JSON.stringify({ id: customer.id }),
      })
      const data = await response.json()
      if (!response.ok || !data.success) throw new Error(data.message || 'Unable to delete customer.')
      setCustomers((prev) => prev.filter((c) => c.id !== customer.id))
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to delete customer.')
    } finally {
      setDeletingId('')
    }
  }

  if (!authorized) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050B14] px-6 text-white">
        <form
          onSubmit={(e) => { e.preventDefault(); void loadCustomers() }}
          className="w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.05] p-8"
        >
          <div className="text-xs font-black uppercase tracking-[0.22em] text-cyan-300">Admin Access</div>
          <h1 className="mt-4 text-3xl font-black">Service Requests</h1>
          <p className="mt-3 text-sm leading-relaxed text-white/55">
            Failsafe dashboard. All bookings are stored here even if email notifications fail.
          </p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Admin password"
            className="mt-6 w-full rounded-2xl border border-white/10 bg-black/30 px-5 py-4 text-white outline-none placeholder:text-white/30 focus:border-cyan-400"
          />
          {errorMessage && <p className="mt-4 text-sm text-red-300">{errorMessage}</p>}
          <button
            type="submit"
            disabled={loading || !password}
            className="mt-5 w-full rounded-2xl bg-cyan-400 px-5 py-4 text-sm font-black uppercase tracking-[0.14em] text-black disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Open Dashboard'}
          </button>
        </form>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#050B14] px-5 py-10 text-white lg:px-10">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-xs font-black uppercase tracking-[0.22em] text-cyan-300">Admin Dashboard</div>
            <h1 className="mt-2 text-4xl font-black">Service Requests</h1>
            {lastRefreshed && (
              <p className="mt-1 text-xs text-white/35">
                Last refreshed {timeAgo(lastRefreshed.toISOString())} — auto-refreshes every 90s
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => void importRecentCustomers()}
              disabled={importing}
              className="rounded-2xl border border-cyan-400/30 bg-cyan-400/10 px-5 py-3 text-xs font-black uppercase tracking-[0.14em] text-cyan-200 disabled:opacity-50"
            >
              {importing ? 'Importing...' : 'Backfill from Email'}
            </button>
            <button
              onClick={() => void loadCustomers()}
              disabled={loading}
              className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-xs font-black uppercase tracking-[0.14em] text-white disabled:opacity-50"
            >
              {loading ? 'Refreshing...' : 'Refresh Now'}
            </button>
          </div>
        </div>

        {/* Summary chips */}
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={() => setFilter('all')}
            className={`rounded-full px-5 py-2 text-xs font-black uppercase tracking-[0.12em] transition ${filter === 'all' ? 'bg-white/15 text-white' : 'border border-white/10 text-white/45 hover:text-white/70'}`}
          >
            All {customers.length}
          </button>
          <button
            onClick={() => setFilter('today')}
            className={`rounded-full px-5 py-2 text-xs font-black uppercase tracking-[0.12em] transition ${filter === 'today' ? 'bg-cyan-400 text-black' : 'border border-cyan-400/20 text-cyan-300 hover:bg-cyan-400/10'}`}
          >
            Today {todayCount}
          </button>
          <button
            onClick={() => setFilter('new')}
            className={`rounded-full px-5 py-2 text-xs font-black uppercase tracking-[0.12em] transition ${filter === 'new' ? 'bg-cyan-400 text-black' : 'border border-cyan-400/20 text-cyan-300 hover:bg-cyan-400/10'}`}
          >
            Last 48h {newCount}
          </button>
        </div>

        {/* Search */}
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name, email, phone, address, equipment, or source..."
          className="mt-4 w-full rounded-2xl border border-white/10 bg-white/[0.05] px-5 py-4 text-white outline-none placeholder:text-white/30 focus:border-cyan-400"
        />

        {errorMessage && (
          <p className="mt-4 text-sm text-emerald-300">{errorMessage}</p>
        )}

        {/* Cards */}
        <div className="mt-6 space-y-3">
          {filteredCustomers.length === 0 && (
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-12 text-center text-white/35">
              No service requests found.
            </div>
          )}

          {filteredCustomers.map((customer) => {
            const fresh = isNew(customer.last_request_at)
            const expanded = expandedId === customer.id

            return (
              <article
                key={customer.id}
                className={`rounded-3xl border p-5 transition ${fresh ? 'border-cyan-400/25 bg-cyan-400/[0.04]' : 'border-white/10 bg-white/[0.03]'}`}
              >
                {/* Top row */}
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-black">{customer.name}</h2>
                      {fresh && (
                        <span className="rounded-full bg-cyan-400 px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.12em] text-black">
                          New
                        </span>
                      )}
                    </div>
                    <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                      <a href={`tel:${customer.phone}`} className="font-bold text-cyan-300 hover:text-cyan-200">
                        {customer.phone}
                      </a>
                      <a href={`mailto:${customer.email}`} className="text-white/60 hover:text-white/80">
                        {customer.email}
                      </a>
                    </div>
                  </div>

                  {/* Badges + actions */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-white/50">
                      {customer.status}
                    </span>
                    {customer.triage_priority && (
                      <span className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] ${PRIORITY_STYLES[customer.triage_priority] || PRIORITY_STYLES.STANDARD}`}>
                        {customer.triage_priority}{customer.triage_score != null ? ` · ${customer.triage_score}` : ''}
                      </span>
                    )}
                    {customer.distance_miles != null && (
                      <span className={`rounded-full border px-3 py-1 text-[10px] font-black tracking-[0.1em] ${customer.distance_miles <= 60 ? 'border-emerald-400/25 bg-emerald-400/10 text-emerald-300' : 'border-yellow-400/25 bg-yellow-400/10 text-yellow-300'}`}>
                        {customer.distance_miles} mi
                      </span>
                    )}
                    <span className="text-xs text-white/30">{timeAgo(customer.last_request_at)}</span>
                    <button
                      onClick={() => setExpandedId(expanded ? null : customer.id)}
                      className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.1em] text-white/50 hover:bg-white/10"
                    >
                      {expanded ? 'Less' : 'More'}
                    </button>
                    <button
                      onClick={() => void deleteCustomer(customer)}
                      disabled={deletingId === customer.id}
                      className="rounded-xl border border-red-400/20 bg-red-400/5 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.1em] text-red-300 hover:bg-red-400/10 disabled:opacity-50"
                    >
                      {deletingId === customer.id ? '...' : 'Delete'}
                    </button>
                  </div>
                </div>

                {/* Always-visible summary row */}
                <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm text-white/55">
                  {customer.service_type && <span><strong className="text-white/80">Service:</strong> {customer.service_type}</span>}
                  {customer.equipment_type && <span><strong className="text-white/80">Equipment:</strong> {customer.equipment_type}</span>}
                  {customer.brand_model && <span><strong className="text-white/80">Brand:</strong> {customer.brand_model}</span>}
                  {customer.address && <span><strong className="text-white/80">Address:</strong> {customer.address}</span>}
                </div>

                {/* Expanded details */}
                {expanded && (
                  <div className="mt-4 space-y-3 border-t border-white/10 pt-4">
                    {customer.details && (
                      <p className="whitespace-pre-wrap text-sm leading-relaxed text-white/60">
                        <strong className="text-white/80">Details:</strong> {customer.details}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-white/35">
                      <span>Source: {customer.source || 'Website Intake'}</span>
                      {customer.page && <span>Page: {customer.page}</span>}
                      <span>Created: {formatDate(customer.created_at)}</span>
                      <span>Last request: {formatDate(customer.last_request_at)}</span>
                    </div>
                  </div>
                )}
              </article>
            )
          })}
        </div>
      </div>
    </main>
  )
}
