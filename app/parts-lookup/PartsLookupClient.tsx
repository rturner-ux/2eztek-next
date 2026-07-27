'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'

type PartResult = {
  partName: string
  partFunction: string
  likelyBrands: string[]
  commonPartNumbers: string
  difficulty: string
  difficultyReason: string
  urgency: string
  urgencyReason: string
  nextStep: string
  confidence: string
  confidenceNote: string
}

const URGENCY_COLORS: Record<string, string> = {
  'Non-Critical': 'text-emerald-600 border-emerald-300 bg-emerald-50',
  'Should Service Soon': 'text-yellow-600 border-yellow-300 bg-yellow-50',
  'Critical: Stop Using Equipment': 'text-red-600 border-red-300 bg-red-50',
}

const DIFFICULTY_COLORS: Record<string, string> = {
  'DIY-Friendly': 'text-emerald-600',
  'Moderate': 'text-yellow-600',
  'Professional Required': 'text-red-600',
}

async function resizeToBase64(file: File, maxPx = 1024, quality = 0.8): Promise<{ base64: string; mediaType: string }> {
  return new Promise((resolve, reject) => {
    const img = new window.Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      const scale = Math.min(1, maxPx / Math.max(img.width, img.height))
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(img.width * scale)
      canvas.height = Math.round(img.height * scale)
      canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height)
      const dataUrl = canvas.toDataURL('image/jpeg', quality)
      resolve({ base64: dataUrl.split(',')[1], mediaType: 'image/jpeg' })
    }
    img.onerror = reject
    img.src = url
  })
}

export default function PartsLookupClient() {
  const [description, setDescription] = useState('')
  const [brand, setBrand] = useState('')
  const [model, setModel] = useState('')
  const [equipmentType, setEquipmentType] = useState('')
  const [photoPreview, setPhotoPreview] = useState('')
  const [photoData, setPhotoData] = useState<{ base64: string; mediaType: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<PartResult | null>(null)
  const [error, setError] = useState('')
  const photoRef = useRef<HTMLInputElement>(null)

  async function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const data = await resizeToBase64(file)
      setPhotoPreview(`data:${data.mediaType};base64,${data.base64}`)
      setPhotoData(data)
    } catch {
      setError('Could not load image. Please try a different file.')
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!description.trim() && !photoData) {
      setError('Please describe the part or upload a photo.')
      return
    }
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const res = await fetch('/api/ai/parts-lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: description.trim(),
          imageBase64: photoData?.base64 || null,
          mediaType: photoData?.mediaType || null,
          brand: brand.trim(),
          model: model.trim(),
          equipmentType: equipmentType.trim(),
        }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.message)
      setResult(data.part)
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function reset() {
    setResult(null)
    setDescription('')
    setBrand('')
    setModel('')
    setEquipmentType('')
    setPhotoPreview('')
    setPhotoData(null)
    setError('')
    if (photoRef.current) photoRef.current.value = ''
  }

  const urgencyClass = result ? (URGENCY_COLORS[result.urgency] || 'text-slate-500 border-slate-200 bg-slate-50') : ''
  const difficultyClass = result ? (DIFFICULTY_COLORS[result.difficulty] || 'text-slate-500') : ''

  return (
    <main className="relative min-h-screen bg-slate-50 text-slate-900">

      <section className="relative flex min-h-[65vh] items-center overflow-hidden pt-36 pb-16 lg:pt-44">
        <Image
          src="/images/gym-equipment-repair-dallas.webp"
          alt="AI fitness equipment parts identification"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.55)_0%,rgba(0,0,0,0.20)_50%,transparent_100%)]" />
        <div className="relative z-10 mx-auto max-w-5xl px-6">
          <Link href="/" className="text-sm font-bold text-white/60 transition hover:text-cyan-300">← Back to Home</Link>
          <div className="mt-8">
            <div className="text-sm font-black uppercase tracking-[0.3em] text-cyan-300">AI Parts Identification</div>
            <h1 className="mt-4 text-5xl font-black leading-tight text-white md:text-7xl">
              Identify Your
              <span className="block text-cyan-400">Fitness Equipment Part</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/80">
              Describe the part or upload a photo. Our AI will identify it, explain what it does, assess urgency, and tell you what to do next.
            </p>
          </div>
        </div>
      </section>

      <section className="relative mx-auto max-w-5xl px-6 py-16">
        <div className="grid gap-10 lg:grid-cols-[1.1fr,0.9fr] lg:items-start">

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-[0.15em] text-slate-500">Brand</label>
                <input
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="e.g. NordicTrack"
                  className="w-full rounded-2xl border border-slate-300 bg-white px-5 py-4 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-cyan-400 transition"
                />
              </div>
              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-[0.15em] text-slate-500">Model</label>
                <input
                  type="text"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="e.g. T 6.5 Si"
                  className="w-full rounded-2xl border border-slate-300 bg-white px-5 py-4 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-cyan-400 transition"
                />
              </div>
              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-[0.15em] text-slate-500">Equipment Type</label>
                <select
                  value={equipmentType}
                  onChange={(e) => setEquipmentType(e.target.value)}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-5 py-4 text-sm text-slate-900 outline-none focus:border-cyan-400 transition"
                >
                  <option value="">Select type…</option>
                  <option>Treadmill</option>
                  <option>Elliptical</option>
                  <option>Exercise Bike</option>
                  <option>Cable Machine</option>
                  <option>Strength Machine</option>
                  <option>StairMaster</option>
                  <option>Rowing Machine</option>
                  <option>Other</option>
                </select>
              </div>
            </div>

            {/* Serial number helper */}
            <div className="rounded-xl border border-cyan-200 bg-cyan-50 px-4 py-3">
              <div className="flex items-center gap-2">
                <svg className="h-3.5 w-3.5 flex-shrink-0 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                </svg>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-700">Locate Serial Number</span>
              </div>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                To order a part under warranty, you need your equipment&apos;s serial number. Search our manual library to find where it&apos;s located on your specific model.
              </p>
              <Link
                href={`/manuals${brand.trim() ? `?brand=${encodeURIComponent(brand.trim())}${model.trim() ? `&q=${encodeURIComponent(model.trim())}` : ''}` : ''}#search`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-cyan-600 transition hover:text-cyan-700"
              >
                {brand.trim()
                  ? `Search ${brand.trim()}${model.trim() ? ` ${model.trim()}` : ''} manuals →`
                  : 'Search our manual library →'}
              </Link>
            </div>

            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-[0.15em] text-slate-500">Describe the Part</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="e.g. A thick black rubber belt that goes under the treadmill deck and keeps slipping... or: a circuit board near the motor with burnt marks on it..."
                className="w-full resize-none rounded-2xl border border-slate-300 bg-white px-5 py-4 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-cyan-400 transition"
              />
            </div>

            {/* Photo upload */}
            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-[0.15em] text-slate-500">Upload a Photo (optional)</label>
              {!photoPreview ? (
                <label className="flex cursor-pointer items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-6 text-sm text-slate-400 transition hover:border-cyan-300 hover:text-slate-600">
                  <svg className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Upload or take a photo of the part</span>
                  <input ref={photoRef} type="file" accept="image/*" className="sr-only" onChange={handlePhoto} />
                </label>
              ) : (
                <div className="relative overflow-hidden rounded-2xl border border-slate-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photoPreview} alt="Part photo" className="max-h-52 w-full object-contain bg-slate-100" />
                  <button type="button" onClick={() => { setPhotoPreview(''); setPhotoData(null); if (photoRef.current) photoRef.current.value = '' }} className="absolute right-2 top-2 rounded-xl border border-slate-200 bg-white/90 px-3 py-1 text-xs font-black text-slate-700 transition hover:bg-white">Remove</button>
                </div>
              )}
            </div>

            {error && <p className="rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={loading || (!description.trim() && !photoData)}
              className="w-full rounded-2xl bg-cyan-400 px-6 py-5 text-sm font-black uppercase tracking-[0.15em] text-black transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="inline-flex gap-1">
                    {[0,1,2].map(i => <span key={i} className="block h-1.5 w-1.5 animate-bounce rounded-full bg-black" style={{ animationDelay: `${i*0.15}s` }} />)}
                  </span>
                  Identifying Part…
                </span>
              ) : 'Identify This Part'}
            </button>
          </form>

          {/* Results */}
          <div>
            {!result && !loading && (
              <div className="rounded-[2rem] border border-slate-200 bg-white shadow-sm p-8">
                <div className="text-sm font-black uppercase tracking-[0.25em] text-cyan-600">How It Works</div>
                <div className="mt-6 space-y-4">
                  {[
                    ['Describe or photograph', 'Tell us what the part looks like, where it is, and what your equipment is doing.'],
                    ['AI identification', 'Claude analyzes your input against knowledge of 50+ fitness equipment brands and hundreds of components.'],
                    ['Get your answer', 'Part name, function, urgency level, and a clear next step in seconds.'],
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
                <div className="mt-8 rounded-2xl border border-cyan-200 bg-cyan-50 p-5">
                  <div className="text-sm font-bold text-cyan-700">Need service now?</div>
                  <a href="tel:9728077232" className="mt-2 block text-lg font-black text-slate-900">(972) 807-7232</a>
                  <div className="mt-1 text-xs text-slate-400">2EZ TEK · Dallas Fort Worth</div>
                </div>
              </div>
            )}

            {result && (
              <div className="space-y-4">
                {/* Part name + urgency */}
                <div className="rounded-[2rem] border border-slate-200 bg-white shadow-sm p-6">
                  <div className="text-xs font-black uppercase tracking-[0.2em] text-cyan-600">Identified Part</div>
                  <h2 className="mt-3 text-3xl font-black text-slate-900">{result.partName}</h2>
                  <p className="mt-2 text-sm text-slate-500">{result.partFunction}</p>
                  {result.likelyBrands.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {result.likelyBrands.map(b => (
                        <span key={b} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-600">{b}</span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Urgency */}
                <div className={`rounded-2xl border px-5 py-4 ${urgencyClass}`}>
                  <div className="text-xs font-black uppercase tracking-[0.15em] opacity-70">Urgency</div>
                  <div className="mt-1 text-base font-black">{result.urgency}</div>
                  <div className="mt-1 text-xs opacity-70">{result.urgencyReason}</div>
                </div>

                {/* Difficulty + Part Numbers */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4">
                    <div className="text-xs font-black uppercase tracking-[0.15em] text-slate-400">Repair Difficulty</div>
                    <div className={`mt-2 text-base font-black ${difficultyClass}`}>{result.difficulty}</div>
                    <div className="mt-1 text-xs text-slate-400">{result.difficultyReason}</div>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4">
                    <div className="text-xs font-black uppercase tracking-[0.15em] text-slate-400">Part Numbers</div>
                    <div className="mt-2 text-sm font-bold text-slate-700">{result.commonPartNumbers}</div>
                  </div>
                </div>

                {/* Confidence */}
                {result.confidence !== 'High' && (
                  <div className="rounded-2xl border border-yellow-300 bg-yellow-50 px-4 py-3">
                    <span className="text-xs font-black uppercase tracking-[0.15em] text-yellow-600">Confidence: {result.confidence}</span>
                    <p className="mt-1 text-xs text-slate-500">{result.confidenceNote}</p>
                  </div>
                )}

                {/* Next Step CTA */}
                <div className="rounded-2xl border border-cyan-200 bg-cyan-50 p-5">
                  <div className="text-xs font-black uppercase tracking-[0.15em] text-cyan-600">Recommended Next Step</div>
                  <p className="mt-2 text-sm leading-relaxed text-slate-700">{result.nextStep}</p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <a href="tel:9728077232" className="rounded-2xl bg-cyan-400 px-5 py-3 text-xs font-black text-black transition hover:bg-cyan-300">Call (972) 807-7232</a>
                    <button type="button" onClick={() => window.dispatchEvent(new CustomEvent('open-booking-modal'))} className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-xs font-black text-slate-700 transition hover:border-cyan-300 hover:bg-cyan-50">Book Service</button>
                  </div>
                </div>

                <button type="button" onClick={reset} className="w-full rounded-2xl border border-slate-200 bg-white py-3 text-sm font-black text-slate-500 transition hover:text-slate-900">
                  Look Up Another Part
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}
