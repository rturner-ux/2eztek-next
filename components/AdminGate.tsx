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
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-cyan-500" />
      </div>
    )
  }

  if (!authorized) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-1 text-[10px] font-black uppercase tracking-widest text-cyan-600">2EZ TEK Admin</div>
          <h1 className="text-xl font-black text-slate-900">{title}</h1>
          <p className="mt-1 text-sm text-slate-500">Enter your admin password to continue.</p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') login() }}
            placeholder="Admin password"
            autoFocus
            className="mt-6 w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 placeholder:text-slate-400"
          />
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          <button
            onClick={login}
            disabled={loading}
            className="mt-4 w-full rounded-lg bg-cyan-500 py-2.5 text-sm font-bold text-white transition hover:bg-cyan-600 disabled:opacity-50"
          >
            {loading ? 'Checking…' : 'Sign in'}
          </button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
