'use client'
import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

function getPassword() {
  if (typeof window === 'undefined') return ''
  return localStorage.getItem('blogAdminPassword') || ''
}

type Form = {
  customer_name: string
  customer_email: string
  customer_phone: string
  address: string
  brand: string
  model: string
  equipment_type: string
}

const emptyForm: Form = {
  customer_name: '',
  customer_email: '',
  customer_phone: '',
  address: '',
  brand: '',
  model: '',
  equipment_type: '',
}

function NewEquipmentForm() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [authorized, setAuthorized] = useState(false)
  const [password, setPassword] = useState('')
  const [checking, setChecking] = useState(true)
  const [authError, setAuthError] = useState('')

  const [form, setForm] = useState<Form>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setForm((f) => ({
      ...f,
      customer_name: searchParams.get('customer_name') || '',
      customer_email: searchParams.get('customer_email') || '',
      customer_phone: searchParams.get('customer_phone') || '',
      address: searchParams.get('address') || '',
    }))
  }, [searchParams])

  useEffect(() => {
    const stored = localStorage.getItem('blogAdminPassword')
    if (stored) {
      setPassword(stored)
      verify(stored)
    } else {
      setChecking(false)
    }
  }, [])

  async function verify(pw: string) {
    setChecking(true)
    try {
      const res = await fetch('/api/admin/equipment', { headers: { 'x-admin-password': pw } })
      const data = await res.json()
      if (data.success) {
        setAuthorized(true)
        localStorage.setItem('blogAdminPassword', pw)
      } else {
        setAuthorized(false)
        setAuthError(data.message || 'Unauthorized')
      }
    } finally {
      setChecking(false)
    }
  }

  function field(key: keyof Form) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }))
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.customer_name.trim() || !form.customer_email.trim() || !form.brand.trim()) {
      setError('Customer name, email, and brand are required.')
      return
    }
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/admin/equipment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (data.success) {
        router.push(`/admin/equipment/${data.id}`)
      } else {
        setError(data.message || 'Failed to create equipment record')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (checking) {
    return <p className="py-10 text-center text-slate-400">Loading...</p>
  }

  if (!authorized) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Equipment / Asset Tags</p>
          <h2 className="mt-1 text-xl font-black text-slate-900">Admin Password</h2>
          {authError && <p className="mt-2 text-sm text-red-600">{authError}</p>}
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && verify(password)}
            placeholder="Password" autoFocus
            className="mt-5 w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 placeholder:text-slate-400" />
          <button onClick={() => verify(password)} className="mt-4 w-full rounded-lg bg-slate-950 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800">Unlock</button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="border-b border-slate-200 bg-white px-8 py-6">
        <Link href="/admin/equipment" className="text-xs font-bold text-cyan-600 hover:text-cyan-700">
          ← Equipment / Asset Tags
        </Link>
        <h1 className="mt-3 text-2xl font-black text-slate-900">Add Equipment</h1>
        <p className="mt-1 text-sm text-slate-500">
          Create a new asset tag, e.g. for a second piece of equipment discovered during a visit.
        </p>
      </div>

      <div className="px-8 py-6">
        <form onSubmit={submit} className="max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Brand *</label>
            <input value={form.brand} onChange={field('brand')} placeholder="e.g. NordicTrack"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100" />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Model / Serial</label>
            <input value={form.model} onChange={field('model')} placeholder="e.g. Commercial 1750"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100" />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Equipment Type</label>
            <input value={form.equipment_type} onChange={field('equipment_type')} placeholder="e.g. Treadmill"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100" />
          </div>

          <hr className="border-slate-100" />

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Customer Name *</label>
            <input value={form.customer_name} onChange={field('customer_name')}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100" />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Email *</label>
            <input value={form.customer_email} onChange={field('customer_email')} type="email"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100" />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Phone</label>
            <input value={form.customer_phone} onChange={field('customer_phone')}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100" />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Address</label>
            <input value={form.address} onChange={field('address')}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100" />
          </div>

          {error && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-lg bg-cyan-400 py-3 text-sm font-black uppercase tracking-widest text-black transition hover:bg-cyan-300 disabled:opacity-50"
          >
            {saving ? 'Creating...' : 'Create Asset Tag'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function NewEquipmentPage() {
  return (
    <Suspense>
      <NewEquipmentForm />
    </Suspense>
  )
}
