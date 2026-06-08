'use client'

import { useState } from 'react'

type Props = {
  listingId: string
  listingTitle: string
}

export default function ListingContact({ listingId, listingTitle }: Props) {
  const [form, setForm] = useState({
    sender_name: '',
    sender_email: '',
    sender_phone: '',
    message: '',
  })
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  function updateField(field: string, value: string) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/listing-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listing_id: listingId,
          sender_name: form.sender_name,
          sender_email: form.sender_email,
          sender_phone: form.sender_phone,
          message: form.message,
        }),
      })

      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Failed to send')

      setSent(true)
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="rounded-[2rem] border border-green-500/20 bg-green-500/10 p-8 text-center">
        <div className="text-3xl font-black text-green-300">Message Sent</div>
        <p className="mt-4 leading-7 text-white/70">
          The seller will receive your message in their inbox and can reply
          directly to your email address. 2EZ TEK monitors all messages for
          your safety.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-[2rem] border border-white/10 bg-black/30 p-8 backdrop-blur-xl">
      <h2 className="text-2xl font-black">Message the Seller</h2>
      <p className="mt-3 text-sm leading-6 text-white/60">
        Ask questions, make an offer, or arrange to see the equipment.
        The seller will reply to your email — their contact info stays private.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <input
            value={form.sender_name}
            onChange={(e) => updateField('sender_name', e.target.value)}
            placeholder="Your name"
            required
            className="rounded-2xl border border-white/10 bg-white/[0.05] px-5 py-4 text-sm text-white outline-none placeholder:text-white/35 focus:border-cyan-400/60 transition"
          />
          <input
            value={form.sender_email}
            onChange={(e) => updateField('sender_email', e.target.value)}
            placeholder="Your email"
            type="email"
            required
            className="rounded-2xl border border-white/10 bg-white/[0.05] px-5 py-4 text-sm text-white outline-none placeholder:text-white/35 focus:border-cyan-400/60 transition"
          />
        </div>

        <input
          value={form.sender_phone}
          onChange={(e) => updateField('sender_phone', e.target.value)}
          placeholder="Your phone (optional)"
          className="rounded-2xl border border-white/10 bg-white/[0.05] px-5 py-4 text-sm text-white outline-none placeholder:text-white/35 focus:border-cyan-400/60 transition"
        />

        <textarea
          value={form.message}
          onChange={(e) => updateField('message', e.target.value)}
          placeholder={`Hi, I'm interested in your ${listingTitle}. Is it still available?`}
          required
          rows={4}
          className="rounded-2xl border border-white/10 bg-white/[0.05] px-5 py-4 text-sm text-white outline-none placeholder:text-white/35 focus:border-cyan-400/60 transition"
        />

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-xs leading-6 text-white/50">
          Your message will be forwarded to the seller. 2EZ TEK monitors all
          marketplace messages and can intervene if needed. The seller's email
          and phone are never shown publicly.
        </div>

        {error && (
          <p className="text-sm text-red-400">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="rounded-2xl bg-cyan-400 py-4 text-sm font-black uppercase tracking-[0.14em] text-black transition hover:bg-cyan-300 disabled:opacity-50"
        >
          {loading ? 'Sending...' : 'Send Message'}
        </button>
      </form>
    </div>
  )
}
