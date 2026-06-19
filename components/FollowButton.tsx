'use client'

import { useEffect, useState } from 'react'

type Props = {
  followerCount: number
}

export default function FollowButton({ followerCount }: Props) {
  const [state, setState] = useState<'idle' | 'open' | 'loading' | 'done'>('idle')
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [count, setCount] = useState(followerCount)
  const [error, setError] = useState('')

  useEffect(() => {
    if (localStorage.getItem('blog-following') === 'true') setState('done')
  }, [])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setState('loading')
    setError('')
    try {
      const res = await fetch('/api/blog/follow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), name: name.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed')
      setState('done')
      setCount((c) => c + 1)
      localStorage.setItem('blog-following', 'true')
    } catch (err: any) {
      setError(err.message || 'Something went wrong.')
      setState('open')
    }
  }

  if (state === 'done') {
    return (
      <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-5 py-2.5 text-sm font-bold text-cyan-400">
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
        Following
        {count > 0 && (
          <span className="rounded-full bg-cyan-400/10 px-2 py-0.5 text-xs text-cyan-300">
            {count.toLocaleString()}
          </span>
        )}
      </div>
    )
  }

  if (state === 'open' || state === 'loading') {
    return (
      <form onSubmit={submit} className="flex flex-wrap items-center gap-2">
        <input
          type="text"
          placeholder="Name (optional)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-36 rounded-xl border border-white/15 bg-white/10 px-3 py-2.5 text-sm text-white placeholder-white/35 backdrop-blur-sm focus:border-cyan-400/50 focus:outline-none"
        />
        <input
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoFocus
          className="w-52 rounded-xl border border-white/15 bg-white/10 px-3 py-2.5 text-sm text-white placeholder-white/35 backdrop-blur-sm focus:border-cyan-400/50 focus:outline-none"
        />
        <button
          type="submit"
          disabled={state === 'loading'}
          className="rounded-xl bg-cyan-400 px-5 py-2.5 text-xs font-black uppercase tracking-[0.14em] text-black transition hover:bg-cyan-300 disabled:opacity-50"
        >
          {state === 'loading' ? 'Following...' : 'Follow'}
        </button>
        <button
          type="button"
          onClick={() => setState('idle')}
          className="text-xs text-white/35 transition hover:text-white/70"
        >
          Cancel
        </button>
        {error && <p className="w-full text-xs text-red-400">{error}</p>}
      </form>
    )
  }

  return (
    <button
      onClick={() => setState('open')}
      className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/10 px-5 py-2.5 text-sm font-bold text-white backdrop-blur-sm transition hover:border-cyan-400/40 hover:bg-white/15"
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4 text-cyan-400" fill="none" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
      </svg>
      Follow
      {count > 0 && (
        <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-bold text-white/60">
          {count.toLocaleString()}
        </span>
      )}
    </button>
  )
}
