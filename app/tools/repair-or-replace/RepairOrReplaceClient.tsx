'use client'

import { useState } from 'react'
import Link from 'next/link'

type Result = {
  score: number
  verdict: 'Repair' | 'Lean Repair' | 'Lean Replace' | 'Replace'
  headline: string
  repairPros: string[]
  replacePros: string[]
  whatRepairFixes: string
  whatRepairWontFix: string
  estimatedLifeIfRepaired: string
  recommendation: string
  callToAction: 'Repair' | 'Get a Diagnosis First' | 'Replace'
}

const VERDICT_CONFIG = {
  'Repair': {
    color: 'text-emerald-600',
    border: 'border-emerald-300',
    bg: 'bg-emerald-50',
    bar: 'bg-emerald-400',
    icon: '✓',
  },
  'Lean Repair': {
    color: 'text-cyan-600',
    border: 'border-cyan-300',
    bg: 'bg-cyan-50',
    bar: 'bg-cyan-400',
    icon: '↗',
  },
  'Lean Replace': {
    color: 'text-orange-500',
    border: 'border-orange-300',
    bg: 'bg-orange-50',
    bar: 'bg-orange-400',
    icon: '↘',
  },
  'Replace': {
    color: 'text-red-600',
    border: 'border-red-300',
    bg: 'bg-red-50',
    bar: 'bg-red-400',
    icon: '✕',
  },
}

const CTA_CONFIG = {
  'Repair': { label: 'Book Service', style: 'bg-emerald-400 text-black hover:bg-emerald-300' },
  'Get a Diagnosis First': { label: 'Book Service', style: 'bg-cyan-400 text-black hover:bg-cyan-300' },
  'Replace': { label: 'Book Service', style: 'bg-orange-400 text-black hover:bg-orange-300' },
}

function ScoreBar({ score, verdict }: { score: number; verdict: Result['verdict'] }) {
  const cfg = VERDICT_CONFIG[verdict]
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-xs font-black uppercase tracking-[0.15em]">
        <span className="text-emerald-600">Repair</span>
        <span className="text-red-600">Replace</span>
      </div>
      <div className="relative h-3 overflow-hidden rounded-full bg-slate-200">
        <div
          className={`h-full rounded-full transition-all duration-700 ${cfg.bar}`}
          style={{ width: `${Math.max(4, score)}%` }}
        />
        <div
          className="absolute top-0 h-full w-0.5 bg-slate-400/40"
          style={{ left: '50%' }}
        />
      </div>
      <div className="mt-1.5 flex justify-center">
        <span className={`text-xs font-black ${cfg.color}`}>Score: {score}/100</span>
      </div>
    </div>
  )
}

export default function RepairOrReplaceClient() {
  const [equipmentType, setEquipmentType] = useState('')
  const [brandModel, setBrandModel] = useState('')
  const [ageYears, setAgeYears] = useState('')
  const [symptom, setSymptom] = useState('')
  const [priorRepairs, setPriorRepairs] = useState('0')
  const [repairQuote, setRepairQuote] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<Result | null>(null)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!equipmentType || !symptom.trim()) {
      setError('Equipment type and issue description are required.')
      return
    }
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const res = await fetch('/api/ai/repair-or-replace', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          equipmentType,
          brandModel: brandModel.trim(),
          ageYears: parseFloat(ageYears) || 0,
          symptom: symptom.trim(),
          priorRepairs: parseInt(priorRepairs) || 0,
          repairQuote: repairQuote.trim() || undefined,
        }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.message || 'Analysis failed.')
      setResult(data.result)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function reset() {
    setResult(null)
    setError('')
    setEquipmentType('')
    setBrandModel('')
    setAgeYears('')
    setSymptom('')
    setPriorRepairs('0')
    setRepairQuote('')
  }

  const cfg = result ? VERDICT_CONFIG[result.verdict] : null
  const ctaCfg = result ? CTA_CONFIG[result.callToAction] : null

  const inputClass = 'w-full rounded-2xl border border-slate-300 bg-white px-5 py-4 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-cyan-400 transition'
  const selectClass = 'w-full rounded-2xl border border-slate-300 bg-white px-5 py-4 text-sm text-slate-900 outline-none focus:border-cyan-400 transition'
  const labelClass = 'mb-2 block text-xs font-black uppercase tracking-[0.15em] text-slate-500'

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-slate-200 bg-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.08),transparent_40%)]" />
        <div className="relative mx-auto max-w-5xl px-6 pb-20 pt-32">
          <Link href="/" className="text-sm font-bold text-cyan-600 transition hover:text-cyan-700">← Back to Home</Link>
          <div className="mt-8">
            <div className="text-sm font-black uppercase tracking-[0.3em] text-cyan-600">AI Decision Tool</div>
            <h1 className="mt-4 text-5xl font-black leading-tight text-slate-900 md:text-7xl">
              Repair or Replace?
              <span className="block text-cyan-600">Get an Expert Answer.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-600">
              Tell us about your equipment and the problem. Our AI gives you a scored recommendation in seconds, trained on real fitness equipment service data.
            </p>
          </div>
        </div>
      </section>

      {/* Main */}
      <section className="mx-auto max-w-5xl px-6 py-16">
        <div className="grid gap-10 lg:grid-cols-[1.1fr,0.9fr] lg:items-start">

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Equipment Type *</label>
                <select value={equipmentType} onChange={(e) => setEquipmentType(e.target.value)} className={selectClass} required>
                  <option value="">Select type…</option>
                  <option>Treadmill</option>
                  <option>Elliptical</option>
                  <option>Exercise Bike</option>
                  <option>Cable Machine</option>
                  <option>Strength Machine</option>
                  <option>StairMaster / Step Mill</option>
                  <option>Rowing Machine</option>
                  <option>Functional Trainer</option>
                  <option>Home Gym System</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Brand / Model</label>
                <input
                  type="text"
                  value={brandModel}
                  onChange={(e) => setBrandModel(e.target.value)}
                  placeholder="e.g. NordicTrack C 990"
                  className={inputClass}
                  maxLength={100}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Equipment Age (years)</label>
                <input
                  type="number"
                  value={ageYears}
                  onChange={(e) => setAgeYears(e.target.value)}
                  placeholder="e.g. 5"
                  min="0"
                  max="50"
                  step="0.5"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Prior Repairs (count)</label>
                <select value={priorRepairs} onChange={(e) => setPriorRepairs(e.target.value)} className={selectClass}>
                  <option value="0">None, first repair</option>
                  <option value="1">1 previous repair</option>
                  <option value="2">2 previous repairs</option>
                  <option value="3">3 previous repairs</option>
                  <option value="4">4 previous repairs</option>
                  <option value="5">5+ previous repairs</option>
                </select>
              </div>
            </div>

            <div>
              <label className={labelClass}>Describe the Current Issue *</label>
              <textarea
                value={symptom}
                onChange={(e) => setSymptom(e.target.value)}
                rows={4}
                placeholder="e.g. The treadmill belt slips when I get above 4mph. The motor smells like it's burning slightly. We've already replaced the belt once two years ago."
                className="w-full resize-none rounded-2xl border border-slate-300 bg-white px-5 py-4 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-cyan-400 transition"
                required
                maxLength={2000}
              />
            </div>

            <div>
              <label className={labelClass}>Repair Quote / Estimated Cost (optional)</label>
              <input
                type="text"
                value={repairQuote}
                onChange={(e) => setRepairQuote(e.target.value)}
                placeholder="e.g. $350 quoted by technician, or 'unknown'"
                className={inputClass}
                maxLength={200}
              />
            </div>

            {error && (
              <p className="rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading || !equipmentType || !symptom.trim()}
              className="w-full rounded-2xl bg-cyan-400 px-6 py-5 text-sm font-black uppercase tracking-[0.15em] text-black transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="inline-flex gap-1">
                    {[0, 1, 2].map(i => (
                      <span key={i} className="block h-1.5 w-1.5 animate-bounce rounded-full bg-black" style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </span>
                  Analyzing…
                </span>
              ) : 'Get My Recommendation'}
            </button>
          </form>

          {/* Result panel */}
          <div>
            {!result && !loading && (
              <div className="rounded-[2rem] border border-slate-200 bg-white shadow-sm p-8">
                <div className="text-sm font-black uppercase tracking-[0.25em] text-cyan-600">How It Works</div>
                <div className="mt-6 space-y-4">
                  {[
                    ['Equipment profile', 'We factor in the type, brand, age, and repair history. The same variables a technician considers.'],
                    ['Issue analysis', 'The AI assesses whether the current problem is a routine fix or a sign of deeper decline.'],
                    ['Scored verdict', 'You get a 0-100 score, a clear recommendation, and practical next steps. In seconds.'],
                  ].map(([title, text]) => (
                    <div key={title} className="flex gap-4">
                      <div className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-cyan-400" />
                      <div>
                        <div className="text-sm font-black text-slate-900">{title}</div>
                        <div className="mt-1 text-sm text-slate-500">{text}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-xs text-slate-400">
                  This tool gives guidance based on the information you provide. A technician diagnosis is always the most accurate way to evaluate your specific machine.
                </div>
                <div className="mt-4 rounded-2xl border border-cyan-200 bg-cyan-50 p-5">
                  <div className="text-sm font-bold text-cyan-700">Want a real diagnosis?</div>
                  <a href="tel:9728077232" className="mt-2 block text-lg font-black text-slate-900">(972) 807-7232</a>
                  <div className="mt-1 text-xs text-slate-400">2EZ TEK · Dallas Fort Worth</div>
                </div>
              </div>
            )}

            {result && cfg && ctaCfg && (
              <div className="space-y-4">

                {/* Verdict card */}
                <div className={`rounded-[2rem] border p-6 ${cfg.border} ${cfg.bg}`}>
                  <div className={`text-xs font-black uppercase tracking-[0.2em] ${cfg.color}`}>AI Recommendation</div>
                  <div className="mt-3 flex items-center gap-3">
                    <span className={`text-4xl font-black ${cfg.color}`}>{cfg.icon}</span>
                    <h2 className={`text-4xl font-black ${cfg.color}`}>{result.verdict}</h2>
                  </div>
                  <p className="mt-3 text-base font-bold text-slate-700">{result.headline}</p>
                  <div className="mt-5">
                    <ScoreBar score={result.score} verdict={result.verdict} />
                  </div>
                </div>

                {/* Pros grid */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                    <div className="mb-3 text-xs font-black uppercase tracking-[0.15em] text-emerald-600">Reasons to Repair</div>
                    <ul className="space-y-2">
                      {result.repairPros.map((pro, i) => (
                        <li key={i} className="flex gap-2 text-sm text-slate-600">
                          <span className="mt-0.5 flex-shrink-0 text-emerald-500">+</span>
                          {pro}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
                    <div className="mb-3 text-xs font-black uppercase tracking-[0.15em] text-red-600">Reasons to Replace</div>
                    <ul className="space-y-2">
                      {result.replacePros.map((pro, i) => (
                        <li key={i} className="flex gap-2 text-sm text-slate-600">
                          <span className="mt-0.5 flex-shrink-0 text-red-500">−</span>
                          {pro}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* What repair covers */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4">
                    <div className="mb-2 text-xs font-black uppercase tracking-[0.12em] text-slate-400">What Repair Would Fix</div>
                    <p className="text-sm text-slate-600">{result.whatRepairFixes}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4">
                    <div className="mb-2 text-xs font-black uppercase tracking-[0.12em] text-slate-400">What It Won&apos;t Fix</div>
                    <p className="text-sm text-slate-600">{result.whatRepairWontFix}</p>
                  </div>
                </div>

                {/* Estimated life */}
                <div className="rounded-2xl border border-cyan-200 bg-cyan-50 px-5 py-4">
                  <div className="text-xs font-black uppercase tracking-[0.12em] text-cyan-600">Estimated Life If Repaired</div>
                  <p className="mt-1.5 text-sm font-bold text-slate-700">{result.estimatedLifeIfRepaired}</p>
                </div>

                {/* Recommendation */}
                <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5">
                  <div className="mb-2 text-xs font-black uppercase tracking-[0.12em] text-slate-400">Our Recommendation</div>
                  <p className="text-sm leading-relaxed text-slate-700">{result.recommendation}</p>
                </div>

                {/* CTA */}
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => window.dispatchEvent(new CustomEvent('open-booking-modal'))}
                    className={`rounded-2xl px-6 py-4 text-sm font-black uppercase tracking-[0.12em] transition ${ctaCfg.style}`}
                  >
                    {ctaCfg.label}
                  </button>
                  <a
                    href="tel:9728077232"
                    className="rounded-2xl border border-slate-200 bg-white px-6 py-4 text-sm font-black text-slate-700 transition hover:border-cyan-300 hover:bg-cyan-50"
                  >
                    Call (972) 807-7232
                  </a>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-400">
                  This is AI-generated guidance based on the information you provided. A hands-on diagnosis by a certified technician is always the most accurate assessment.
                </div>

                <button
                  type="button"
                  onClick={reset}
                  className="w-full rounded-2xl border border-slate-200 bg-white py-3 text-sm font-black text-slate-500 transition hover:text-slate-900"
                >
                  Analyze Another Machine
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* SEO trust section — dark CTA for contrast */}
      <section className="border-t border-slate-200 bg-slate-900 px-6 py-20 lg:px-16">
        <div className="mx-auto max-w-4xl text-center">
          <div className="text-sm font-black uppercase tracking-[0.3em] text-cyan-400">Not Sure? Talk to a Technician.</div>
          <h2 className="mt-4 text-3xl font-black text-white md:text-5xl">
            2EZ TEK Diagnoses Equipment Across Dallas Fort Worth
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-white/60">
            This tool gives you a starting point. Our technicians give you a definitive answer with hands-on inspection, accurate repair quotes, and honest advice. No upselling. No guessing.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <button type="button" onClick={() => window.dispatchEvent(new CustomEvent('open-booking-modal'))} className="rounded-2xl bg-cyan-400 px-8 py-4 text-sm font-black text-black transition hover:bg-cyan-300">
              Book Service
            </button>
            <a href="tel:9728077232" className="rounded-2xl border border-white/10 bg-white/5 px-8 py-4 text-sm font-black text-white transition hover:border-cyan-400/30">
              Call (972) 807-7232
            </a>
          </div>
        </div>
      </section>
    </main>
  )
}
