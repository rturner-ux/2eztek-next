'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: 49,
    trial: '7-day free trial',
    features: [
      '15 tracked keywords',
      '5 competitor domains',
      'Weekly Google rank scan',
      'Competitor gap report',
      'Weekly email report',
      'Rank history & trends',
    ],
    cta: 'Start Free Trial',
    highlight: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 99,
    trial: '7-day free trial',
    features: [
      '50 tracked keywords',
      '10 competitor domains',
      'Weekly Google rank scan',
      'Competitor gap report',
      'Weekly email report',
      'Rank history & trends',
      'AI blog post generation',
      'Customer search intelligence',
    ],
    cta: 'Start Free Trial',
    highlight: true,
  },
]

const INDUSTRIES = [
  'Fitness Equipment Repair',
  'HVAC / Air Conditioning',
  'Plumbing',
  'Electrical',
  'Landscaping / Lawn Care',
  'Roofing',
  'Pest Control',
  'Auto Repair',
  'Appliance Repair',
  'Cleaning Services',
  'Other Local Service',
]

type Step = 'plans' | 'info' | 'payment'

declare global {
  interface Window {
    Square?: {
      payments: (appId: string, locationId: string) => Promise<{
        card: () => Promise<{ attach: (selector: string) => Promise<void>; tokenize: () => Promise<{ token?: string; status: string; errors?: { message: string }[] }> }>
      }>
    }
  }
}

export default function RankRadarLanding() {
  const [step, setStep] = useState<Step>('plans')
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [form, setForm] = useState({ businessName: '', ownerName: '', ownerEmail: '', industry: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Square card refs
  const cardRef = useRef<{ tokenize: () => Promise<{ token?: string; status: string; errors?: { message: string }[] }> } | null>(null)
  const squareReady = useRef(false)

  useEffect(() => {
    if (step !== 'payment') return
    if (squareReady.current) return

    const appId = process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID
    const locationId = process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID
    if (!appId || !locationId) return

    const script = document.createElement('script')
    script.src = 'https://web.squarecdn.com/v1/square.js'
    script.onload = async () => {
      if (!window.Square) return
      const payments = await window.Square.payments(appId, locationId)
      const card = await payments.card()
      await card.attach('#square-card-container')
      cardRef.current = card
      squareReady.current = true
    }
    document.body.appendChild(script)
    return () => { document.body.removeChild(script) }
  }, [step])

  function selectPlan(id: string) {
    setSelectedPlan(id)
    setStep('info')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function goToPayment(e: React.FormEvent) {
    e.preventDefault()
    if (!form.businessName || !form.ownerEmail) return
    setStep('payment')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handlePayment(e: React.FormEvent) {
    e.preventDefault()
    if (!cardRef.current) { setError('Card form not ready. Please wait a moment and try again.'); return }
    setLoading(true)
    setError('')

    const result = await cardRef.current.tokenize()
    if (result.status !== 'OK' || !result.token) {
      setError(result.errors?.[0]?.message || 'Card could not be processed. Please check your card details.')
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/rankradar/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: selectedPlan, ...form, nonce: result.token }),
      })
      const data = await res.json()
      if (data.success && data.redirectUrl) {
        window.location.href = data.redirectUrl
      } else {
        setError(data.message || 'Something went wrong. Please try again.')
      }
    } catch {
      setError('Network error. Please try again.')
    }
    setLoading(false)
  }

  const planLabel = selectedPlan === 'pro' ? 'Pro' : 'Starter'
  const planPrice = selectedPlan === 'pro' ? 99 : 49

  return (
    <div className="min-h-screen bg-[#050B14] text-white">
      {/* Nav */}
      <nav className="border-b border-white/10 px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-lg font-black text-white">Rank</span>
            <span className="text-lg font-black text-cyan-400">Radar</span>
            <span className="ml-2 rounded-full bg-cyan-400/10 px-2 py-0.5 text-[10px] font-bold text-cyan-400">by 2EZ TEK</span>
          </div>
          <Link href="/" className="text-xs text-slate-400 hover:text-white">← 2EZ TEK</Link>
        </div>
      </nav>

      <div className="mx-auto max-w-5xl px-6 py-16">

        {step === 'info' && (
          <div className="mx-auto max-w-lg">
            <button onClick={() => setStep('plans')} className="mb-8 text-sm text-slate-400 hover:text-white">← Back to plans</button>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
              <div className="mb-6">
                <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-xs font-bold text-cyan-400">
                  {planLabel} Plan — ${planPrice}/mo
                </span>
                <h2 className="mt-3 text-2xl font-black">Tell us about your business</h2>
                <p className="mt-1 text-sm text-slate-400">7 days free, then ${planPrice}/month. Cancel anytime.</p>
              </div>
              <form onSubmit={goToPayment} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Business Name *</label>
                  <input required value={form.businessName} onChange={(e) => setForm((f) => ({ ...f, businessName: e.target.value }))} placeholder="e.g. Johnson HVAC Services" className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none focus:border-cyan-400/60" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Your Name</label>
                  <input value={form.ownerName} onChange={(e) => setForm((f) => ({ ...f, ownerName: e.target.value }))} placeholder="First and last name" className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none focus:border-cyan-400/60" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Email Address *</label>
                  <input required type="email" value={form.ownerEmail} onChange={(e) => setForm((f) => ({ ...f, ownerEmail: e.target.value }))} placeholder="you@yourbusiness.com" className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none focus:border-cyan-400/60" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Industry</label>
                  <select value={form.industry} onChange={(e) => setForm((f) => ({ ...f, industry: e.target.value }))} className="w-full rounded-lg border border-white/10 bg-[#050B14] px-4 py-3 text-sm text-white outline-none focus:border-cyan-400/60">
                    <option value="">Select your industry</option>
                    {INDUSTRIES.map((ind) => <option key={ind} value={ind}>{ind}</option>)}
                  </select>
                </div>
                <button type="submit" className="w-full rounded-full bg-cyan-400 py-3.5 text-sm font-black text-black transition hover:bg-cyan-300">
                  Continue to Payment →
                </button>
                <div className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-center">
                  <p className="text-xs font-bold text-white">No charge for 7 days</p>
                  <p className="mt-0.5 text-xs text-slate-400">Your card is saved to start your trial. You won't be billed until day 8. Cancel before then and you owe nothing.</p>
                </div>
              </form>
            </div>
          </div>
        )}

        {step === 'payment' && (
          <div className="mx-auto max-w-lg">
            <button onClick={() => setStep('info')} className="mb-8 text-sm text-slate-400 hover:text-white">← Back</button>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black">Payment</h2>
                  <p className="mt-1 text-sm text-slate-400">{form.businessName} — {planLabel} Plan</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-cyan-400">${planPrice}<span className="text-sm font-normal text-slate-400">/mo</span></p>
                  <p className="text-xs text-slate-500">Free for 7 days</p>
                </div>
              </div>
              {/* Trial notice — prominent */}
              <div className="rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3.5 flex items-start gap-3">
                <span className="text-green-400 text-lg leading-none mt-0.5">✓</span>
                <div>
                  <p className="text-sm font-black text-green-400">Your card will NOT be charged today</p>
                  <p className="mt-0.5 text-xs text-green-300/70">
                    We collect your card to start your free trial. Your first charge of ${planPrice} happens after your 7-day trial ends. Cancel anytime before then and you owe nothing.
                  </p>
                </div>
              </div>

              <form onSubmit={handlePayment} className="space-y-5">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Card Details</label>
                  <div
                    id="square-card-container"
                    className="rounded-lg border border-white/10 bg-white/5 p-1 min-h-[56px]"
                  />
                  {!squareReady.current && (
                    <p className="mt-2 text-xs text-slate-500">Loading secure payment form...</p>
                  )}
                </div>

                {error && (
                  <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-400">{error}</p>
                )}

                <button type="submit" disabled={loading} className="w-full rounded-full bg-cyan-400 py-3.5 text-sm font-black text-black transition hover:bg-cyan-300 disabled:opacity-50">
                  {loading ? 'Processing...' : `Start Free Trial — No Charge for 7 Days`}
                </button>
                <p className="text-center text-xs text-slate-500">
                  Secured by Square &bull; ${planPrice}/month after trial &bull; Cancel anytime
                </p>
              </form>
            </div>
          </div>
        )}

        {step === 'plans' && (
          <>
            {/* Hero */}
            <div className="text-center">
              <span className="inline-block rounded-full border border-cyan-400/30 bg-cyan-400/5 px-4 py-1.5 text-xs font-bold text-cyan-400">
                SEO Competitor Intelligence for Local Service Businesses
              </span>
              <h1 className="mt-6 text-4xl font-black leading-tight sm:text-5xl">
                Know exactly why your<br />
                <span className="text-cyan-400">competitors outrank you</span>
              </h1>
              <p className="mx-auto mt-5 max-w-xl text-lg text-slate-300">
                RankRadar tracks your Google rankings against competitors every week, finds the gaps hurting your business, and tells you exactly what to do about it.
              </p>
            </div>

            {/* Stats */}
            <div className="mt-12 grid grid-cols-3 gap-4 rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-8">
              {[
                { val: '15+', label: 'keywords tracked' },
                { val: 'Weekly', label: 'automated scans' },
                { val: 'Instant', label: 'gap reports' },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <p className="text-2xl font-black text-cyan-400">{s.val}</p>
                  <p className="mt-1 text-xs text-slate-400">{s.label}</p>
                </div>
              ))}
            </div>

            {/* How it works */}
            <div className="mt-16">
              <h2 className="text-center text-2xl font-black">How it works</h2>
              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                {[
                  { n: '1', title: 'Add your keywords', body: 'Enter the search terms your customers use to find businesses like yours.' },
                  { n: '2', title: 'Add competitor URLs', body: 'Tell us who you compete with. We find their rankings every single week.' },
                  { n: '3', title: 'Get your gap report', body: 'Every Wednesday you get a report showing exactly where they beat you and what to do about it.' },
                ].map((s) => (
                  <div key={s.n} className="rounded-2xl border border-white/10 bg-white/5 p-6">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-cyan-400 text-sm font-black text-black">{s.n}</div>
                    <h3 className="mt-4 font-black text-white">{s.title}</h3>
                    <p className="mt-2 text-sm text-slate-400">{s.body}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Pricing */}
            <div className="mt-16">
              <h2 className="text-center text-2xl font-black">Simple pricing</h2>
              <p className="mt-2 text-center text-sm text-slate-400">7-day free trial. Cancel anytime.</p>
              <div className="mt-8 grid gap-5 sm:grid-cols-2">
                {PLANS.map((plan) => (
                  <div key={plan.id} className={`relative rounded-2xl border p-7 ${plan.highlight ? 'border-cyan-400/50 bg-cyan-400/5' : 'border-white/10 bg-white/5'}`}>
                    {plan.highlight && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-cyan-400 px-4 py-1 text-[10px] font-black text-black">MOST POPULAR</span>
                    )}
                    <p className="font-black text-white">{plan.name}</p>
                    <div className="mt-3 flex items-end gap-1">
                      <span className="text-4xl font-black text-white">${plan.price}</span>
                      <span className="mb-1 text-sm text-slate-400">/month</span>
                    </div>
                    <p className="mt-1 text-xs text-cyan-400">{plan.trial}</p>
                    <ul className="mt-6 space-y-2.5">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-center gap-2 text-sm text-slate-300">
                          <span className="text-cyan-400">✓</span> {f}
                        </li>
                      ))}
                    </ul>
                    <button onClick={() => selectPlan(plan.id)} className={`mt-7 w-full rounded-full py-3 text-sm font-black transition ${plan.highlight ? 'bg-cyan-400 text-black hover:bg-cyan-300' : 'border border-white/20 text-white hover:bg-white/10'}`}>
                      {plan.cta}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <p className="mt-16 text-center text-xs text-slate-500">
              Built by <a href="/" className="text-cyan-400 hover:underline">2EZ TEK</a> — powered by real Google data
            </p>
          </>
        )}
      </div>
    </div>
  )
}
