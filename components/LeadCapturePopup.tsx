'use client'

import { useEffect, useState, useRef } from 'react'
import { usePathname } from 'next/navigation'

export default function LeadCapturePopup() {
  const pathname = usePathname()
  const [visible, setVisible] = useState(false)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const triggered = useRef(false)

  const isAdmin = pathname?.startsWith('/admin')
  const isBlog = pathname?.startsWith('/blog')

  useEffect(() => {
    if (isAdmin) return
    if (typeof window === 'undefined') return
    if (localStorage.getItem('lead-popup-dismissed')) return

    function trigger() {
      if (triggered.current) return
      triggered.current = true
      setVisible(true)
    }

    // Exit intent: mouse leaves top of viewport
    function onMouseLeave(e: MouseEvent) {
      if (e.clientY <= 0) trigger()
    }

    // Time-based: 45 seconds
    const timer = window.setTimeout(trigger, 45000)

    document.addEventListener('mouseleave', onMouseLeave)
    return () => {
      clearTimeout(timer)
      document.removeEventListener('mouseleave', onMouseLeave)
    }
  }, [isAdmin])

  function dismiss() {
    setVisible(false)
    localStorage.setItem('lead-popup-dismissed', '1')
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!phone && !email) return
    setLoading(true)
    try {
      await fetch('/api/leads/capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, email, page_url: window.location.href }),
      })
      setDone(true)
      localStorage.setItem('lead-popup-dismissed', '1')
      setTimeout(() => setVisible(false), 2800)
    } catch {
      // silently fail — don't block the user
    } finally {
      setLoading(false)
    }
  }

  if (!visible || isAdmin) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-end justify-center p-4 sm:items-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={dismiss} />

      <div className="relative w-full max-w-md rounded-[2rem] border border-white/10 bg-[#050B14] p-8 shadow-2xl">
        <button
          type="button"
          onClick={dismiss}
          className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-white/40 transition hover:border-white/30 hover:text-white/80"
          aria-label="Close"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {done ? (
          <div className="py-4 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-cyan-400/10">
              <svg viewBox="0 0 24 24" className="h-7 w-7 text-cyan-400" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-black text-white">Got it. We will reach out soon.</h3>
            <p className="mt-2 text-sm text-white/50">2EZ TEK serves all of Dallas Fort Worth. Same-week service in most cases.</p>
          </div>
        ) : (
          <>
            <div className="mb-1 text-xs font-black uppercase tracking-[0.25em] text-cyan-400">
              {isBlog ? 'Need Equipment Service?' : 'Get a Free Quote'}
            </div>
            <h3 className="text-2xl font-black text-white">
              {isBlog
                ? 'Talk to a technician'
                : 'Leave your number and we call you'}
            </h3>
            <p className="mt-2 text-sm leading-6 text-white/50">
              Same-week service across DFW. No diagnosis fees, just honest repair.
            </p>

            <form onSubmit={submit} className="mt-6 space-y-3">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name (optional)"
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-cyan-400"
              />
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone number"
                type="tel"
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-cyan-400"
              />
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email (optional)"
                type="email"
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-cyan-400"
              />
              <button
                type="submit"
                disabled={loading || (!phone && !email)}
                className="w-full rounded-2xl bg-cyan-400 py-4 text-sm font-black uppercase tracking-[0.14em] text-black transition hover:bg-cyan-300 disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Request a Callback'}
              </button>
            </form>

            <p className="mt-4 text-center text-xs text-white/25">
              We never spam. Your info stays private.
            </p>
          </>
        )}
      </div>
    </div>
  )
}
