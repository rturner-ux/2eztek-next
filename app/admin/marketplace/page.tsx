'use client'

import { useState } from 'react'

type Listing = {
  id: string
  title: string
  category: string | null
  brand: string | null
  condition: string | null
  city: string | null
  state: string | null
  price: number | null
  seller_name: string | null
  seller_email: string | null
  seller_phone: string | null
  status: string
  photo_url: string | null
  created_at: string
}

type Message = {
  id: string
  listing_id: string
  sender_name: string
  sender_email: string
  message: string
  created_at: string
  flagged: boolean
}

function formatPrice(price: number | null) {
  if (!price) return null
  return Number(price).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  })
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

const statusColors: Record<string, string> = {
  pending: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-300',
  approved: 'border-green-500/30 bg-green-500/10 text-green-300',
  rejected: 'border-red-500/30 bg-red-500/10 text-red-300',
}

export default function AdminMarketplacePage() {
  const [password, setPassword] = useState('')
  const [authorized, setAuthorized] = useState(false)
  const [listings, setListings] = useState<Listing[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [tab, setTab] = useState<'listings' | 'messages'>('listings')
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [actionLoading, setActionLoading] = useState('')

  async function load() {
    setLoading(true)
    setErrorMessage('')

    try {
      const response = await fetch('/api/admin/marketplace', {
        headers: { 'x-admin-password': password },
      })

      if (response.status === 401) {
        setErrorMessage('Incorrect password.')
        return
      }

      const data = await response.json()
      setListings(data.listings || [])
      setMessages(data.messages || [])
      setAuthorized(true)
    } catch {
      setErrorMessage('Failed to load. Check your connection.')
    } finally {
      setLoading(false)
    }
  }

  async function updateListing(id: string, status: string) {
    setActionLoading(id)
    await fetch('/api/admin/marketplace', {
      method: 'PATCH',
      headers: {
        'x-admin-password': password,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ type: 'listing', id, status }),
    })
    setListings((current) =>
      current.map((l) => (l.id === id ? { ...l, status } : l))
    )
    setActionLoading('')
  }

  async function deleteListing(id: string) {
    if (!confirm('Delete this listing permanently?')) return
    setActionLoading(id)
    await fetch('/api/admin/marketplace', {
      method: 'DELETE',
      headers: {
        'x-admin-password': password,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ type: 'listing', id }),
    })
    setListings((current) => current.filter((l) => l.id !== id))
    setActionLoading('')
  }

  async function toggleFlag(id: string, flagged: boolean) {
    setActionLoading(id)
    await fetch('/api/admin/marketplace', {
      method: 'PATCH',
      headers: {
        'x-admin-password': password,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ type: 'message', id, flagged: !flagged }),
    })
    setMessages((current) =>
      current.map((m) => (m.id === id ? { ...m, flagged: !flagged } : m))
    )
    setActionLoading('')
  }

  async function deleteMessage(id: string) {
    if (!confirm('Delete this message?')) return
    setActionLoading(id)
    await fetch('/api/admin/marketplace', {
      method: 'DELETE',
      headers: {
        'x-admin-password': password,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ type: 'message', id }),
    })
    setMessages((current) => current.filter((m) => m.id !== id))
    setActionLoading('')
  }

  const pendingCount = listings.filter((l) => l.status === 'pending').length
  const flaggedCount = messages.filter((m) => m.flagged).length

  if (!authorized) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050B14] text-white">
        <div className="w-full max-w-md space-y-5 rounded-[2rem] border border-white/10 bg-black/30 p-10 backdrop-blur-xl">
          <h1 className="text-3xl font-black">Marketplace Admin</h1>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && load()}
            placeholder="Admin password"
            className="w-full rounded-2xl border border-white/10 bg-white/[0.05] px-5 py-4 text-white outline-none placeholder:text-white/35 focus:border-cyan-400/60 transition"
          />
          {errorMessage && (
            <p className="text-sm text-red-400">{errorMessage}</p>
          )}
          <button
            onClick={load}
            disabled={loading}
            className="w-full rounded-2xl bg-cyan-400 py-4 text-sm font-black uppercase tracking-[0.14em] text-black disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Sign In'}
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#050B14] px-6 py-12 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black">Marketplace Admin</h1>
            <p className="mt-2 text-white/50">
              {listings.length} listings · {messages.length} messages
              {pendingCount > 0 && (
                <span className="ml-3 rounded-full border border-yellow-500/30 bg-yellow-500/10 px-3 py-1 text-xs font-bold text-yellow-300">
                  {pendingCount} pending review
                </span>
              )}
              {flaggedCount > 0 && (
                <span className="ml-2 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-xs font-bold text-red-300">
                  {flaggedCount} flagged messages
                </span>
              )}
            </p>
          </div>

          <button
            onClick={load}
            className="rounded-2xl border border-white/15 bg-white/5 px-6 py-3 text-sm font-bold text-white hover:border-cyan-400/40"
          >
            Refresh
          </button>
        </div>

        {/* Tabs */}
        <div className="mb-8 flex gap-3">
          {(['listings', 'messages'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-2xl px-6 py-3 text-sm font-black uppercase tracking-[0.14em] transition ${
                tab === t
                  ? 'bg-cyan-400 text-black'
                  : 'border border-white/15 bg-white/5 text-white hover:border-cyan-400/30'
              }`}
            >
              {t === 'listings' ? `Listings (${listings.length})` : `Messages (${messages.length})`}
            </button>
          ))}
        </div>

        {/* Listings tab */}
        {tab === 'listings' && (
          <div className="grid gap-5">
            {listings.map((listing) => {
              const msgCount = messages.filter((m) => m.listing_id === listing.id).length
              return (
                <div
                  key={listing.id}
                  className="overflow-hidden rounded-[2rem] border border-white/10 bg-black/25 backdrop-blur-xl"
                >
                  <div className="flex flex-wrap items-start gap-6 p-6">
                    {listing.photo_url && (
                      <img
                        src={listing.photo_url}
                        alt={listing.title}
                        className="h-20 w-28 rounded-xl object-cover"
                      />
                    )}

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <h2 className="text-xl font-black">{listing.title}</h2>
                        <span className={`rounded-full border px-3 py-1 text-xs font-bold ${statusColors[listing.status] || ''}`}>
                          {listing.status}
                        </span>
                        {msgCount > 0 && (
                          <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-bold text-cyan-300">
                            {msgCount} message{msgCount !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>

                      <div className="mt-2 flex flex-wrap gap-4 text-sm text-white/60">
                        <span>{listing.category || 'No category'}</span>
                        {listing.brand && <span>{listing.brand}</span>}
                        {listing.condition && <span>{listing.condition}</span>}
                        {(listing.city || listing.state) && (
                          <span>{[listing.city, listing.state].filter(Boolean).join(', ')}</span>
                        )}
                        {listing.price && <span className="font-bold text-cyan-300">{formatPrice(listing.price)}</span>}
                      </div>

                      <div className="mt-2 text-sm text-white/50">
                        Seller: <span className="text-white/70">{listing.seller_name}</span>
                        {' · '}
                        <a href={`mailto:${listing.seller_email}`} className="text-cyan-400 hover:underline">
                          {listing.seller_email}
                        </a>
                        {listing.seller_phone && (
                          <span> · {listing.seller_phone}</span>
                        )}
                      </div>

                      <div className="mt-1 text-xs text-white/35">
                        {formatDate(listing.created_at)}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {listing.status !== 'approved' && (
                        <button
                          onClick={() => updateListing(listing.id, 'approved')}
                          disabled={actionLoading === listing.id}
                          className="rounded-xl bg-green-500 px-4 py-2 text-xs font-black uppercase text-black disabled:opacity-50"
                        >
                          Approve
                        </button>
                      )}
                      {listing.status !== 'rejected' && (
                        <button
                          onClick={() => updateListing(listing.id, 'rejected')}
                          disabled={actionLoading === listing.id}
                          className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-xs font-black uppercase text-red-300 disabled:opacity-50"
                        >
                          Reject
                        </button>
                      )}
                      <button
                        onClick={() => deleteListing(listing.id)}
                        disabled={actionLoading === listing.id}
                        className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-xs font-black uppercase text-white/60 disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}

            {listings.length === 0 && (
              <div className="rounded-[2rem] border border-white/10 bg-black/20 p-12 text-center text-white/50">
                No listings yet.
              </div>
            )}
          </div>
        )}

        {/* Messages tab */}
        {tab === 'messages' && (
          <div className="grid gap-5">
            {messages.map((msg) => {
              const listing = listings.find((l) => l.id === msg.listing_id)
              return (
                <div
                  key={msg.id}
                  className={`rounded-[2rem] border bg-black/25 p-6 backdrop-blur-xl ${
                    msg.flagged
                      ? 'border-red-500/30 bg-red-500/5'
                      : 'border-white/10'
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="font-black">{msg.sender_name}</span>
                        <a
                          href={`mailto:${msg.sender_email}`}
                          className="text-sm text-cyan-400 hover:underline"
                        >
                          {msg.sender_email}
                        </a>
                        {msg.flagged && (
                          <span className="rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-xs font-bold text-red-300">
                            Flagged
                          </span>
                        )}
                      </div>

                      {listing && (
                        <div className="mt-1 text-xs text-white/40">
                          Re: {listing.title}
                        </div>
                      )}

                      <p className="mt-4 rounded-xl bg-white/[0.04] p-4 text-sm leading-7 text-white/75">
                        {msg.message}
                      </p>

                      <div className="mt-2 text-xs text-white/35">
                        {formatDate(msg.created_at)}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => toggleFlag(msg.id, msg.flagged)}
                        disabled={actionLoading === msg.id}
                        className={`rounded-xl border px-4 py-2 text-xs font-black uppercase disabled:opacity-50 ${
                          msg.flagged
                            ? 'border-white/15 bg-white/5 text-white/60'
                            : 'border-red-500/30 bg-red-500/10 text-red-300'
                        }`}
                      >
                        {msg.flagged ? 'Unflag' : 'Flag'}
                      </button>
                      <button
                        onClick={() => deleteMessage(msg.id)}
                        disabled={actionLoading === msg.id}
                        className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-xs font-black uppercase text-white/60 disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}

            {messages.length === 0 && (
              <div className="rounded-[2rem] border border-white/10 bg-black/20 p-12 text-center text-white/50">
                No messages yet.
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
