'use client'
import { useEffect, useState } from 'react'
import { use } from 'react'
import Link from 'next/link'
import { qrImageUrl, equipmentQrUrl } from '@/lib/equipment-utils'

type Equipment = {
  id: string
  customer_name: string
  brand: string
  model: string
  equipment_type: string
  address: string
  created_at: string
}

type ServiceRequest = {
  id: string
  service_type: string
  details: string
  status: string
  created_at: string
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  new:         { label: 'Request Received',   color: 'bg-amber-100 text-amber-700 border border-amber-200' },
  scheduled:   { label: 'Scheduled',          color: 'bg-blue-100 text-blue-700 border border-blue-200' },
  in_progress: { label: 'In Progress',        color: 'bg-purple-100 text-purple-700 border border-purple-200' },
  completed:   { label: 'Completed',          color: 'bg-green-100 text-green-700 border border-green-200' },
}

const ISSUE_TYPES = [
  'Not turning on',
  'Unusual noise / vibration',
  'Belt / resistance issue',
  'Display / console problem',
  'Error code showing',
  'Safety key / emergency stop issue',
  'Speed or incline not working',
  'Heart rate monitor not working',
  'Bluetooth / connectivity issue',
  'Physical damage',
  'General maintenance / tune-up',
  'Other',
]

export default function EquipmentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [equipment, setEquipment] = useState<Equipment | null>(null)
  const [history, setHistory] = useState<ServiceRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const [issue, setIssue] = useState('')
  const [details, setDetails] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState('')

  useEffect(() => {
    fetch(`/api/equipment/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setEquipment(d.equipment)
          setHistory(d.history)
        } else {
          setNotFound(true)
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [id])

  async function submitRequest(e: React.FormEvent) {
    e.preventDefault()
    if (!issue) return
    setSubmitting(true)
    setSubmitError('')
    try {
      const res = await fetch(`/api/equipment/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ issue, details }),
      })
      const data = await res.json()
      if (data.success) {
        setSubmitted(true)
        setHistory((h) => [
          { id: Date.now().toString(), service_type: issue, details, status: 'new', created_at: new Date().toISOString() },
          ...h,
        ])
        setIssue('')
        setDetails('')
      } else {
        setSubmitError(data.message || 'Something went wrong. Please try again.')
      }
    } catch {
      setSubmitError('Network error. Please try again.')
    }
    setSubmitting(false)
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050B14]">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent mx-auto" />
          <p className="mt-3 text-sm text-slate-400">Loading your equipment...</p>
        </div>
      </div>
    )
  }

  if (notFound || !equipment) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050B14] px-6">
        <div className="text-center">
          <p className="text-4xl">🔍</p>
          <h1 className="mt-4 text-xl font-black text-white">Equipment not found</h1>
          <p className="mt-2 text-sm text-slate-400">This QR code may be outdated or invalid.</p>
          <Link
            href="/"
            className="mt-6 inline-block rounded-full bg-cyan-400 px-6 py-3 text-sm font-black text-black hover:bg-cyan-300"
          >
            Visit 2EZ TEK
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#050B14]">
      {/* Header */}
      <header className="border-b border-white/10 px-6 py-4">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-black text-white">2EZ</span>
            <span className="text-xl font-black text-cyan-400">TEK</span>
          </Link>
          <Link
            href="/book"
            className="rounded-full border border-cyan-400/30 px-4 py-1.5 text-xs font-bold text-cyan-400 hover:bg-cyan-400/10"
          >
            Book Service
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-8 space-y-6">

        {/* Equipment card */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="flex items-start gap-5">
            <div className="flex-shrink-0">
              <img
                src={qrImageUrl(id, 100)}
                alt="Asset QR Code"
                width={100}
                height={100}
                className="rounded-xl border border-white/10"
              />
            </div>
            <div className="flex-1 min-w-0">
              <span className="inline-block rounded-full bg-cyan-400/10 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest text-cyan-400">
                {equipment.equipment_type || 'Equipment'}
              </span>
              <h1 className="mt-2 text-2xl font-black text-white">
                {equipment.brand} {equipment.model || ''}
              </h1>
              <p className="mt-1 text-sm text-slate-400">
                Owner: <span className="text-white">{equipment.customer_name}</span>
              </p>
              <p className="mt-0.5 text-xs text-slate-500">
                Registered {new Date(equipment.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>
        </div>

        {/* Report issue form */}
        {submitted ? (
          <div className="rounded-2xl border border-green-500/30 bg-green-500/10 p-6 text-center">
            <p className="text-3xl">✅</p>
            <h2 className="mt-3 text-lg font-black text-white">Request Submitted!</h2>
            <p className="mt-2 text-sm text-slate-300">
              We received your service request and will be in touch shortly.
            </p>
            <p className="mt-1 text-xs text-slate-400">
              2EZ TEK &mdash; Dallas / Fort Worth Fitness Equipment Repair
            </p>
            <div className="mt-5 flex justify-center">
              <img
                src={qrImageUrl(id, 180)}
                alt="Your asset QR code"
                width={180}
                height={180}
                className="rounded-xl border border-white/10"
              />
            </div>
            <p className="mt-3 text-xs text-slate-500">Save or screenshot this QR code to track your service history and report future issues.</p>
            <button
              onClick={() => setSubmitted(false)}
              className="mt-4 rounded-full border border-white/20 px-5 py-2 text-xs font-bold text-slate-300 hover:bg-white/5"
            >
              Report Another Issue
            </button>
          </div>
        ) : (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-base font-black text-white">Report an Issue</h2>
            <p className="mt-1 text-sm text-slate-400">Tell us what's going on with your equipment.</p>

            <form onSubmit={submitRequest} className="mt-5 space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                  What issue are you experiencing? *
                </label>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {ISSUE_TYPES.map((opt) => (
                    <label key={opt} className={`flex cursor-pointer items-center gap-2.5 rounded-lg border p-3 transition ${issue === opt ? 'border-cyan-400 bg-cyan-400/10' : 'border-white/10 bg-white/5 hover:border-white/20'}`}>
                      <input
                        type="radio"
                        name="issue"
                        value={opt}
                        checked={issue === opt}
                        onChange={(e) => setIssue(e.target.value)}
                        className="accent-cyan-400"
                      />
                      <span className="text-sm text-slate-200">{opt}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                  Additional details (optional)
                </label>
                <textarea
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  rows={3}
                  placeholder="Describe what's happening, when it started, any error codes, etc."
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/10 resize-none"
                />
              </div>

              {submitError && (
                <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-400">
                  {submitError}
                </p>
              )}

              <button
                type="submit"
                disabled={!issue || submitting}
                className="w-full rounded-full bg-cyan-400 py-3.5 text-sm font-black text-black transition hover:bg-cyan-300 disabled:opacity-40"
              >
                {submitting ? 'Submitting...' : 'Submit Service Request'}
              </button>
            </form>
          </div>
        )}

        {/* Service history */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-base font-black text-white">
            Service History
            <span className="ml-2 text-sm font-normal text-slate-400">({history.length} {history.length === 1 ? 'visit' : 'visits'})</span>
          </h2>

          {history.length === 0 ? (
            <div className="mt-6 text-center py-8">
              <p className="text-2xl">🔧</p>
              <p className="mt-3 text-sm text-slate-400">No service history yet.</p>
              <p className="mt-1 text-xs text-slate-500">Your first request will appear here.</p>
            </div>
          ) : (
            <div className="mt-4 space-y-4">
              {history.map((req, i) => {
                const s = STATUS_LABELS[req.status] || { label: req.status, color: 'bg-slate-700 text-slate-300 border border-white/10' }
                return (
                  <div key={req.id} className="flex gap-4">
                    <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-black text-slate-400">
                      {history.length - i}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-white text-sm">{req.service_type || 'Service Request'}</p>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${s.color}`}>{s.label}</span>
                      </div>
                      {req.details && <p className="mt-1 text-sm text-slate-400">{req.details}</p>}
                      <p className="mt-1 text-xs text-slate-500">
                        {new Date(req.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer CTA */}
        <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/5 p-6 text-center">
          <p className="text-sm font-bold text-white">Need immediate help?</p>
          <p className="mt-1 text-sm text-slate-400">Call us directly or book a service appointment online.</p>
          <div className="mt-4 flex justify-center gap-3 flex-wrap">
            <a
              href="tel:+14692060303"
              className="rounded-full bg-cyan-400 px-5 py-2.5 text-xs font-black text-black hover:bg-cyan-300"
            >
              Call Now
            </a>
            <Link
              href="/book"
              className="rounded-full border border-cyan-400/40 px-5 py-2.5 text-xs font-black text-cyan-400 hover:bg-cyan-400/10"
            >
              Book Service
            </Link>
          </div>
        </div>

      </main>
    </div>
  )
}
