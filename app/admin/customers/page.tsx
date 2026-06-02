'use client'

import { useMemo, useState } from 'react'

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
  const [loading, setLoading] = useState(false)
  const [importing, setImporting] = useState(false)
  const [deletingId, setDeletingId] = useState('')
  const [authorized, setAuthorized] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const filteredCustomers = useMemo(() => {
    const query = search.toLowerCase().trim()

    if (!query) return customers

    return customers.filter((customer) =>
      [
        customer.name,
        customer.email,
        customer.phone,
        customer.address,
        customer.service_type,
        customer.equipment_type,
        customer.brand_model,
        customer.source,
      ].some((value) => value?.toLowerCase().includes(query))
    )
  }, [customers, search])

  async function loadCustomers() {
    try {
      setLoading(true)
      setErrorMessage('')

      const response = await fetch('/api/admin/customers', {
        headers: {
          'x-admin-password': password,
        },
      })
      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.message || data.error || 'Unable to load customers.')
      }

      setCustomers(data.customers || [])
      setAuthorized(true)
    } catch (error) {
      setAuthorized(false)
      setErrorMessage(
        error instanceof Error ? error.message : 'Unable to load customers.'
      )
    } finally {
      setLoading(false)
    }
  }

  async function importRecentCustomers() {
    try {
      setImporting(true)
      setErrorMessage('')

      const response = await fetch('/api/admin/customers', {
        method: 'POST',
        headers: {
          'x-admin-password': password,
        },
      })
      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Unable to import customers.')
      }

      alert(
        `Past-week import complete. Added or updated: ${data.imported}. Skipped: ${data.skipped}.`
      )
      await loadCustomers()
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Unable to import customers.'
      )
    } finally {
      setImporting(false)
    }
  }

  async function deleteCustomer(customer: Customer) {
    const confirmed = window.confirm(
      `Delete ${customer.name} from the new-customer list? This cannot be undone.`
    )

    if (!confirmed) return

    try {
      setDeletingId(customer.id)
      setErrorMessage('')

      const response = await fetch('/api/admin/customers', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': password,
        },
        body: JSON.stringify({ id: customer.id }),
      })
      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Unable to delete customer.')
      }

      setCustomers((current) =>
        current.filter((item) => item.id !== customer.id)
      )
      setErrorMessage(`✓ ${customer.name} deleted from Supabase.`)
      setTimeout(() => setErrorMessage(''), 3000)
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Unable to delete customer.'
      )
    } finally {
      setDeletingId('')
    }
  }

  if (!authorized) {
    return (
      <main className="min-h-screen bg-[#050B14] px-6 py-32 text-white">
        <form
          onSubmit={(event) => {
            event.preventDefault()
            void loadCustomers()
          }}
          className="mx-auto max-w-md rounded-3xl border border-white/10 bg-white/[0.05] p-7"
        >
          <div className="text-xs font-black uppercase tracking-[0.22em] text-cyan-300">
            Admin Access
          </div>
          <h1 className="mt-4 text-3xl font-black">New Customers</h1>
          <p className="mt-3 text-sm leading-relaxed text-white/55">
            Enter the admin password to view customer intake records.
          </p>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Admin password"
            className="mt-6 w-full rounded-2xl border border-white/10 bg-black/30 px-5 py-4 text-white outline-none placeholder:text-white/30 focus:border-cyan-400"
          />
          {errorMessage ? (
            <p className="mt-4 text-sm text-red-300">{errorMessage}</p>
          ) : null}
          <button
            type="submit"
            disabled={loading || !password}
            className="mt-5 w-full rounded-2xl bg-cyan-400 px-5 py-4 text-sm font-black uppercase tracking-[0.14em] text-black disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Open Customer List'}
          </button>
        </form>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#050B14] px-6 py-28 text-white lg:px-12">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <div className="text-xs font-black uppercase tracking-[0.22em] text-cyan-300">
              Admin Dashboard
            </div>
            <h1 className="mt-3 text-4xl font-black">New Customers</h1>
            <p className="mt-3 text-white/55">
              Website intake records, newest request first.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => void importRecentCustomers()}
              disabled={importing}
              className="rounded-2xl border border-cyan-400/30 bg-cyan-400/10 px-5 py-4 text-xs font-black uppercase tracking-[0.14em] text-cyan-200 disabled:opacity-50"
            >
              {importing ? 'Importing...' : 'Import Past 7 Days'}
            </button>
            <button
              onClick={() => void loadCustomers()}
              disabled={loading}
              className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-xs font-black uppercase tracking-[0.14em] text-white disabled:opacity-50"
            >
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-[1fr,auto]">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search name, email, phone, address, equipment, or source"
            className="rounded-2xl border border-white/10 bg-white/[0.05] px-5 py-4 text-white outline-none placeholder:text-white/30 focus:border-cyan-400"
          />
          <div className="rounded-2xl border border-white/10 bg-white/[0.05] px-5 py-4 text-sm font-black text-cyan-200">
            {filteredCustomers.length} customers
          </div>
        </div>

        {errorMessage ? (
          <p className={`mt-5 text-sm ${errorMessage.startsWith('✓') ? 'text-emerald-400' : 'text-red-300'}`}>{errorMessage}</p>
        ) : null}

        <div className="mt-8 space-y-4">
          {filteredCustomers.map((customer) => (
            <article
              key={customer.id}
              className="rounded-3xl border border-white/10 bg-white/[0.04] p-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black">{customer.name}</h2>
                  <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2 text-sm">
                    <a className="text-cyan-300" href={`tel:${customer.phone}`}>
                      {customer.phone}
                    </a>
                    <a className="text-cyan-300" href={`mailto:${customer.email}`}>
                      {customer.email}
                    </a>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-cyan-200">
                    {customer.status}
                  </div>
                  {customer.triage_priority && (
                    <div className={`rounded-full border px-3 py-2 text-[10px] font-black uppercase tracking-[0.16em] ${
                      customer.triage_priority === 'URGENT' ? 'border-red-400/30 bg-red-400/10 text-red-300' :
                      customer.triage_priority === 'HIGH' ? 'border-orange-400/30 bg-orange-400/10 text-orange-300' :
                      customer.triage_priority === 'MEDIUM' ? 'border-yellow-400/30 bg-yellow-400/10 text-yellow-300' :
                      'border-white/10 bg-white/5 text-white/50'
                    }`}>
                      {customer.triage_priority}{customer.triage_score != null ? ` · ${customer.triage_score}` : ''}
                    </div>
                  )}
                  {customer.distance_miles != null && (
                    <div className={`rounded-full border px-3 py-2 text-[10px] font-black tracking-[0.1em] ${
                      customer.distance_miles <= 60
                        ? 'border-emerald-400/25 bg-emerald-400/10 text-emerald-300'
                        : 'border-yellow-400/25 bg-yellow-400/10 text-yellow-300'
                    }`}>
                      📍 {customer.distance_miles} mi
                    </div>
                  )}
                  <button
                    onClick={() => void deleteCustomer(customer)}
                    disabled={deletingId === customer.id}
                    className="rounded-xl border border-red-400/25 bg-red-400/10 px-3 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-red-200 transition hover:bg-red-400/15 disabled:opacity-50"
                  >
                    {deletingId === customer.id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>

              <div className="mt-5 grid gap-4 text-sm text-white/65 md:grid-cols-2 lg:grid-cols-4">
                <div>
                  <strong className="block text-white">Service</strong>
                  {customer.service_type || 'Not specified'}
                </div>
                <div>
                  <strong className="block text-white">Equipment</strong>
                  {customer.equipment_type || 'Not specified'}
                </div>
                <div>
                  <strong className="block text-white">Brand / Model</strong>
                  {customer.brand_model || 'Not specified'}
                </div>
                <div>
                  <strong className="block text-white">Last Request</strong>
                  {formatDate(customer.last_request_at)}
                </div>
              </div>

              {customer.address ? (
                <p className="mt-5 text-sm text-white/65">
                  <strong className="text-white">Address:</strong>{' '}
                  {customer.address}
                </p>
              ) : null}
              {customer.details ? (
                <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-white/55">
                  {customer.details}
                </p>
              ) : null}
              <p className="mt-4 text-xs text-white/35">
                Source: {customer.source || 'Website Intake'}
              </p>
            </article>
          ))}
        </div>
      </div>
    </main>
  )
}
