'use client'
import { useState } from 'react'

export default function NewsletterSignup({ brandName }: { brandName?: string }) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return

    setStatus('loading')
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, brand: brandName }),
      })
      setStatus(res.ok ? 'success' : 'error')
    } catch {
      setStatus('error')
    }
  }

  return (
    <section className="bg-[#060C18] px-6 py-20 text-white lg:px-16">
      <div className="mx-auto max-w-3xl text-center">
        <span className="text-[10px] font-black uppercase tracking-[0.35em] text-cyan-400">
          Equipment Updates
        </span>
        <h2 className="mt-4 text-3xl font-black leading-tight text-white md:text-4xl">
          Stay ahead of equipment issues
        </h2>
        <p className="mt-5 text-base leading-8 text-white/55">
          Join our newsletter for updates on your equipment that may help prevent issues or address current ones. FAQ updates, new manuals, maintenance tips, and repair articles delivered to your inbox.
        </p>

        {status === 'success' ? (
          <div className="mt-8 border border-cyan-400/30 bg-cyan-400/10 px-8 py-6">
            <p className="text-base font-black text-cyan-300">You&apos;re in.</p>
            <p className="mt-1 text-sm text-white/50">Check your inbox for a confirmation from 2EZ TEK.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              className="w-full border border-white/20 bg-white/10 px-5 py-4 text-sm text-white placeholder:text-white/40 outline-none focus:border-cyan-400/60 sm:max-w-sm"
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="bg-cyan-400 px-8 py-4 text-[11px] font-black uppercase tracking-[0.2em] text-black transition hover:bg-cyan-300 disabled:opacity-50"
            >
              {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
            </button>
          </form>
        )}

        {status === 'error' && (
          <p className="mt-3 text-sm text-red-400">Something went wrong. Try again or email support@2eztek.com.</p>
        )}

        <p className="mt-5 text-xs text-white/25">No spam. Unsubscribe anytime.</p>
      </div>
    </section>
  )
}
