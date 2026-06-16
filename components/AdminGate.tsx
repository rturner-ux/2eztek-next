'use client'

import { useEffect, useState } from 'react'

const LS_KEY = 'blogAdminPassword'

export default function AdminGate({ children, title = 'Admin' }: { children: React.ReactNode; title?: string }) {
  const [password, setPassword] = useState('')
  const [authorized, setAuthorized] = useState(false)
  const [checking, setChecking] = useState(true)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(LS_KEY)
    if (stored) setPassword(stored)
    setChecking(false)
  }, [])

  async function validate(pwd: string, silent = false) {
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pwd }),
      })
      if (res.ok) {
        localStorage.setItem(LS_KEY, pwd)
        setAuthorized(true)
      } else {
        localStorage.removeItem(LS_KEY)
        if (!silent) setError('Incorrect password.')
      }
    } catch {
      if (!silent) setError('Could not verify password.')
    } finally {
      setChecking(false)
      setLoading(false)
    }
  }

  async function login() {
    if (!password) { setError('Enter the admin password.'); return }
    setLoading(true)
    setError('')
    await validate(password)
  }

  if (checking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050B14] text-white">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-cyan-400" />
      </main>
    )
  }

  if (!authorized) {
    return (
      <main className="min-h-screen bg-[#050B14] px-6 py-28 text-white">
        <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.18),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.12),transparent_32%)]" />
        <div className="relative mx-auto max-w-xl rounded-[2rem] border border-white/10 bg-black/40 p-8 shadow-2xl backdrop-blur-2xl">
          <div className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-5 py-2 text-xs font-black uppercase tracking-[0.28em] text-cyan-300">
            2EZ TEK Admin
          </div>
          <h1 className="mt-5 text-3xl font-black">{title}</h1>
          <p className="mt-3 text-white/55">Enter your admin password to continue.</p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') login() }}
            placeholder="Admin password"
            className="mt-8 w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-white outline-none transition focus:border-cyan-400"
          />
          {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
          <button
            onClick={login}
            disabled={loading}
            className="mt-5 w-full rounded-2xl bg-cyan-400 px-7 py-4 text-sm font-black uppercase tracking-[0.16em] text-black transition hover:bg-cyan-300 disabled:opacity-50"
          >
            {loading ? 'Checking…' : 'Enter'}
          </button>
        </div>
      </main>
    )
  }

  return <>{children}</>
}
