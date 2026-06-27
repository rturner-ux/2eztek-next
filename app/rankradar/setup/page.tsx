'use client'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

const INDUSTRY_KEYWORDS: Record<string, string[]> = {
  'Fitness Equipment Repair': ['treadmill repair [city]', 'elliptical repair [city]', 'exercise bike repair [city]', 'gym equipment repair [city]', 'NordicTrack repair [city]'],
  'HVAC / Air Conditioning': ['AC repair [city]', 'HVAC repair [city]', 'air conditioning service [city]', 'furnace repair [city]', 'heat pump repair [city]'],
  'Plumbing': ['plumber [city]', 'emergency plumber [city]', 'drain cleaning [city]', 'water heater repair [city]', 'pipe repair [city]'],
  'Electrical': ['electrician [city]', 'electrical repair [city]', 'panel upgrade [city]', 'outlet repair [city]', 'electrical inspection [city]'],
  'Landscaping / Lawn Care': ['lawn care [city]', 'landscaping [city]', 'lawn mowing service [city]', 'tree trimming [city]', 'sprinkler repair [city]'],
  'Roofing': ['roofer [city]', 'roof repair [city]', 'roof replacement [city]', 'roofing company [city]', 'storm damage roof repair [city]'],
  'Pest Control': ['pest control [city]', 'exterminator [city]', 'termite treatment [city]', 'ant control [city]', 'rodent removal [city]'],
  'Auto Repair': ['auto repair [city]', 'mechanic [city]', 'oil change [city]', 'brake repair [city]', 'transmission repair [city]'],
  'Appliance Repair': ['appliance repair [city]', 'washer repair [city]', 'dryer repair [city]', 'refrigerator repair [city]', 'dishwasher repair [city]'],
}

type Step = 'loading' | 'business' | 'keywords' | 'competitors' | 'done'

function SetupInner() {
  const router = useRouter()
  const params = useSearchParams()
  const token = params.get('token') || ''

  const [step, setStep] = useState<Step>('loading')
  const [account, setAccount] = useState<Record<string, string> | null>(null)

  // Business setup
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [location, setLocation] = useState('')

  // Keywords
  const [suggestedKeywords, setSuggestedKeywords] = useState<string[]>([])
  const [selectedKeywords, setSelectedKeywords] = useState<Set<string>>(new Set())
  const [customKeyword, setCustomKeyword] = useState('')

  // Competitors
  const [competitors, setCompetitors] = useState(['', '', ''])

  const [saving, setSaving] = useState(false)

  function headers() {
    return { 'Content-Type': 'application/json', 'x-rankradar-token': token }
  }

  useEffect(() => {
    if (!token) { router.push('/rankradar'); return }
    fetch('/api/rankradar/account', { headers: { 'x-rankradar-token': token } })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setAccount(d.account)
          setWebsiteUrl(d.account.website_url || '')
          setLocation(d.account.location || '')
          // Pre-populate keyword suggestions
          const industry = d.account.industry || ''
          const suggestions = (INDUSTRY_KEYWORDS[industry] || INDUSTRY_KEYWORDS['Fitness Equipment Repair'] || [])
          setSuggestedKeywords(suggestions)
          setSelectedKeywords(new Set(suggestions.slice(0, 5)))
          setStep(d.account.onboarded ? 'done' : 'business')
        } else {
          router.push('/rankradar')
        }
      })
  }, [token])

  function substituteLocation(kw: string) {
    const city = location.split(',')[0].trim() || 'your city'
    return kw.replace('[city]', city)
  }

  async function saveBusiness() {
    setSaving(true)
    await fetch('/api/rankradar/account', {
      method: 'PATCH',
      headers: headers(),
      body: JSON.stringify({ website_url: websiteUrl, location }),
    })
    setSaving(false)
    setStep('keywords')
  }

  async function saveKeywords() {
    setSaving(true)
    const kws = Array.from(selectedKeywords).map(substituteLocation)
    await fetch('/api/rankradar/keywords', {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ keywords: kws }),
    })
    setSaving(false)
    setStep('competitors')
  }

  async function saveCompetitors() {
    setSaving(true)
    const valid = competitors.filter((c) => c.trim())
    if (valid.length) {
      await fetch('/api/rankradar/competitors', {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ competitors: valid.map((d) => ({ domain: d })) }),
      })
    }
    await fetch('/api/rankradar/account', {
      method: 'PATCH',
      headers: headers(),
      body: JSON.stringify({ onboarded: true }),
    })
    setSaving(false)
    setStep('done')
  }

  if (step === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050B14]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
      </div>
    )
  }

  if (step === 'done') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050B14] px-6">
        <div className="max-w-md text-center">
          <div className="text-5xl">🎯</div>
          <h1 className="mt-6 text-3xl font-black text-white">You're all set!</h1>
          <p className="mt-3 text-slate-400">
            RankRadar will scan your keywords every week and email you a competitor gap report every Wednesday.
          </p>
          <p className="mt-2 text-sm text-slate-500">Want to run a scan right now to see your current rankings?</p>
          <div className="mt-8 flex flex-col gap-3">
            <button
              onClick={() => router.push(`/rankradar/dashboard?token=${token}`)}
              className="w-full rounded-full bg-cyan-400 py-3.5 font-black text-black hover:bg-cyan-300"
            >
              Go to My Dashboard
            </button>
          </div>
          <p className="mt-6 text-xs text-slate-500">
            Save this link to access your dashboard anytime:<br />
            <span className="font-mono text-slate-400">2eztek.com/rankradar/dashboard?token={token.slice(0, 8)}...</span>
          </p>
        </div>
      </div>
    )
  }

  const steps = ['business', 'keywords', 'competitors']
  const stepIdx = steps.indexOf(step)

  return (
    <div className="min-h-screen bg-[#050B14] px-6 py-12">
      <div className="mx-auto max-w-lg">
        {/* Progress */}
        <div className="mb-8 flex items-center gap-2">
          {steps.map((s, i) => (
            <div key={s} className={`h-1.5 flex-1 rounded-full ${i <= stepIdx ? 'bg-cyan-400' : 'bg-white/10'}`} />
          ))}
        </div>

        {step === 'business' && (
          <div>
            <h1 className="text-2xl font-black text-white">Set up your account</h1>
            <p className="mt-2 text-sm text-slate-400">Tell us about your business so we can find the right competitors.</p>
            <div className="mt-8 space-y-5">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Your website URL</label>
                <input
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://yourbusiness.com"
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none focus:border-cyan-400/60"
                />
                <p className="mt-1.5 text-xs text-slate-500">We use this to find YOUR rank position in search results.</p>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Your service area</label>
                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Dallas, TX"
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none focus:border-cyan-400/60"
                />
                <p className="mt-1.5 text-xs text-slate-500">The city and state you serve. Used to localize keywords.</p>
              </div>
              <button
                onClick={saveBusiness}
                disabled={saving || !websiteUrl || !location}
                className="w-full rounded-full bg-cyan-400 py-3.5 font-black text-black hover:bg-cyan-300 disabled:opacity-40"
              >
                {saving ? 'Saving...' : 'Continue →'}
              </button>
            </div>
          </div>
        )}

        {step === 'keywords' && (
          <div>
            <h1 className="text-2xl font-black text-white">Choose your keywords</h1>
            <p className="mt-2 text-sm text-slate-400">
              Select keywords your customers search for. We suggest some based on your industry.
              Limit: {account?.keywords_limit || 15}
            </p>
            <div className="mt-6 space-y-2">
              {suggestedKeywords.map((kw) => {
                const displayed = substituteLocation(kw)
                const on = selectedKeywords.has(kw)
                return (
                  <label key={kw} className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3.5 transition ${on ? 'border-cyan-400 bg-cyan-400/10' : 'border-white/10 bg-white/5 hover:border-white/20'}`}>
                    <input
                      type="checkbox"
                      checked={on}
                      onChange={() => setSelectedKeywords((s) => {
                        const n = new Set(s)
                        if (n.has(kw)) n.delete(kw); else n.add(kw)
                        return n
                      })}
                      className="accent-cyan-400"
                    />
                    <span className="text-sm text-white">{displayed}</span>
                  </label>
                )
              })}
            </div>
            <div className="mt-4 flex gap-2">
              <input
                value={customKeyword}
                onChange={(e) => setCustomKeyword(e.target.value)}
                placeholder="Add a custom keyword..."
                className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none focus:border-cyan-400/60"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && customKeyword.trim()) {
                    setSelectedKeywords((s) => new Set([...s, customKeyword.trim()]))
                    setCustomKeyword('')
                  }
                }}
              />
              <button
                onClick={() => { if (customKeyword.trim()) { setSelectedKeywords((s) => new Set([...s, customKeyword.trim()])); setCustomKeyword('') } }}
                className="rounded-lg bg-white/10 px-4 py-2.5 text-sm font-bold text-white hover:bg-white/20"
              >Add</button>
            </div>
            <button
              onClick={saveKeywords}
              disabled={saving || selectedKeywords.size === 0}
              className="mt-6 w-full rounded-full bg-cyan-400 py-3.5 font-black text-black hover:bg-cyan-300 disabled:opacity-40"
            >
              {saving ? 'Saving...' : `Save ${selectedKeywords.size} keywords →`}
            </button>
          </div>
        )}

        {step === 'competitors' && (
          <div>
            <h1 className="text-2xl font-black text-white">Add your competitors</h1>
            <p className="mt-2 text-sm text-slate-400">
              Enter the websites of businesses you compete with. We track their rankings every week so you can see the gap.
            </p>
            <div className="mt-6 space-y-3">
              {competitors.map((c, i) => (
                <div key={i}>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Competitor {i + 1}{i === 0 ? ' (required)' : ' (optional)'}</label>
                  <input
                    value={c}
                    onChange={(e) => setCompetitors((prev) => { const n = [...prev]; n[i] = e.target.value; return n })}
                    placeholder="competitor.com"
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none focus:border-cyan-400/60"
                  />
                </div>
              ))}
              {competitors.length < (account?.competitors_limit ? Number(account.competitors_limit) : 5) && (
                <button
                  onClick={() => setCompetitors((p) => [...p, ''])}
                  className="text-xs text-cyan-400 hover:text-cyan-300"
                >
                  + Add another competitor
                </button>
              )}
            </div>
            <button
              onClick={saveCompetitors}
              disabled={saving || !competitors[0].trim()}
              className="mt-6 w-full rounded-full bg-cyan-400 py-3.5 font-black text-black hover:bg-cyan-300 disabled:opacity-40"
            >
              {saving ? 'Finishing setup...' : 'Finish Setup →'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function SetupPage() {
  return (
    <Suspense>
      <SetupInner />
    </Suspense>
  )
}
