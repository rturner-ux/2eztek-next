'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

const categories = [
  'Treadmill',
  'Elliptical',
  'StairMaster',
  'Exercise Bike',
  'Rower',
  'Functional Trainer',
  'Home Gym',
  'Smith Machine',
  'Bench',
  'Strength Equipment',
  'Commercial Cardio',
]

const conditions = [
  'Like New',
  'Excellent',
  'Good',
  'Fair',
  'Needs Repair',
]

export default function NewEquipmentListingPage() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const loadedAtRef = useRef<number>(0)

  useEffect(() => {
    loadedAtRef.current = Date.now()
  }, [])

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [success, setSuccess] = useState(false)
  const [photoUrl, setPhotoUrl] = useState('')
  const [photoUploading, setPhotoUploading] = useState(false)
  const [photoError, setPhotoError] = useState('')
  const [honeypot, setHoneypot] = useState('')

  const [form, setForm] = useState({
    title: '',
    brand: '',
    model: '',
    category: '',
    condition: '',
    price: '',
    city: '',
    state: 'TX',
    description: '',
    seller_name: '',
    seller_email: '',
    seller_phone: '',
  })

  function updateField(field: string, value: string) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  async function handlePhotoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    setPhotoError('')
    setPhotoUploading(true)
    setPhotoUrl('')

    try {
      const data = new FormData()
      data.append('file', file)

      const response = await fetch('/api/marketplace-upload', {
        method: 'POST',
        body: data,
      })

      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Upload failed')

      setPhotoUrl(result.url)
    } catch (error: any) {
      setPhotoError(error.message || 'Photo upload failed. Try again.')
    } finally {
      setPhotoUploading(false)
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()

    setLoading(true)
    setSuccess(false)
    setMessage('Submitting listing...')

    try {
      const response = await fetch('/api/marketplace-listing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title.trim(),
          brand: form.brand.trim(),
          model: form.model.trim(),
          category: form.category,
          condition: form.condition,
          price: form.price || null,
          city: form.city.trim(),
          state: form.state.trim() || 'TX',
          description: form.description.trim(),
          seller_name: form.seller_name.trim(),
          seller_email: form.seller_email.trim(),
          seller_phone: form.seller_phone.trim(),
          photo_url: photoUrl || null,
          _hp: honeypot,
          _t: loadedAtRef.current,
        }),
      })

      const result = await response.json()
      if (!response.ok) throw new Error(result.message || 'Submission failed.')

      setSuccess(true)
      setMessage('Listing submitted successfully. 2EZ TEK will review it before publishing.')
      setForm({
        title: '',
        brand: '',
        model: '',
        category: '',
        condition: '',
        price: '',
        city: '',
        state: 'TX',
        description: '',
        seller_name: '',
        seller_email: '',
        seller_phone: '',
      })
      setPhotoUrl('')
      if (fileInputRef.current) fileInputRef.current.value = ''
    } catch (error: any) {
      setSuccess(false)
      setMessage(error?.message || 'Something went wrong submitting the listing.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050B14] text-white">
      <div className="fixed inset-0 z-0 overflow-hidden">
        <img
          src="/images/blog-gym-background.webp"
          alt="Marketplace Background"
          className="h-full w-[112%] max-w-none object-cover opacity-[0.35]"
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,11,20,0.25)_0%,rgba(5,11,20,0.96)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.14),transparent_34%)]" />
      </div>

      <div className="relative z-10 px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <Link href="/equipment-for-sale" className="text-sm font-bold text-cyan-300">
            ← Back to Marketplace
          </Link>

          <div className="mt-8 overflow-hidden rounded-[2.5rem] border border-white/10 bg-black/25 shadow-[0_25px_90px_rgba(0,0,0,0.35)] backdrop-blur-2xl">
            <div className="border-b border-white/10 p-8 md:p-12">
              <div className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-5 py-2 text-xs font-black uppercase tracking-[0.24em] text-cyan-300">
                SmartGymOps Marketplace
              </div>

              <h1 className="mt-7 text-4xl font-black leading-tight md:text-6xl">
                Submit Fitness Equipment
                <span className="block text-white/55">For Sale</span>
              </h1>

              <p className="mt-6 max-w-3xl text-lg leading-8 text-white/70">
                Submit treadmills, ellipticals, StairMasters, commercial cardio,
                home gyms, benches, and strength equipment. Listings are reviewed
                before publishing publicly.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="grid gap-6 p-8 md:p-12">
              {/* Honeypot, hidden from humans, traps bots */}
              <div style={{ position: 'absolute', left: '-9999px', opacity: 0, pointerEvents: 'none' }} aria-hidden="true">
                <input
                  type="text"
                  name="website"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>
              {/* Title + Price */}
              <div className="grid gap-5 md:grid-cols-2">
                <input
                  value={form.title}
                  onChange={(event) => updateField('title', event.target.value)}
                  placeholder="Listing title"
                  required
                  className="rounded-2xl border border-white/10 bg-black/30 px-5 py-4 text-white outline-none placeholder:text-white/40"
                />
                <input
                  value={form.price}
                  onChange={(event) => updateField('price', event.target.value)}
                  placeholder="Asking price"
                  type="number"
                  min="0"
                  className="rounded-2xl border border-white/10 bg-black/30 px-5 py-4 text-white outline-none placeholder:text-white/40"
                />
              </div>

              {/* Brand + Model + Category */}
              <div className="grid gap-5 md:grid-cols-3">
                <input
                  value={form.brand}
                  onChange={(event) => updateField('brand', event.target.value)}
                  placeholder="Brand"
                  className="rounded-2xl border border-white/10 bg-black/30 px-5 py-4 text-white outline-none placeholder:text-white/40"
                />
                <input
                  value={form.model}
                  onChange={(event) => updateField('model', event.target.value)}
                  placeholder="Model"
                  className="rounded-2xl border border-white/10 bg-black/30 px-5 py-4 text-white outline-none placeholder:text-white/40"
                />
                <select
                  value={form.category}
                  onChange={(event) => updateField('category', event.target.value)}
                  className="rounded-2xl border border-white/10 bg-black/30 px-5 py-4 text-white outline-none"
                >
                  <option value="" className="bg-[#050B14]">Select category</option>
                  {categories.map((category) => (
                    <option key={category} value={category} className="bg-[#050B14]">
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Condition + City + State */}
              <div className="grid gap-5 md:grid-cols-3">
                <select
                  value={form.condition}
                  onChange={(event) => updateField('condition', event.target.value)}
                  className="rounded-2xl border border-white/10 bg-black/30 px-5 py-4 text-white outline-none"
                >
                  <option value="" className="bg-[#050B14]">Select condition</option>
                  {conditions.map((condition) => (
                    <option key={condition} value={condition} className="bg-[#050B14]">
                      {condition}
                    </option>
                  ))}
                </select>
                <input
                  value={form.city}
                  onChange={(event) => updateField('city', event.target.value)}
                  placeholder="City"
                  className="rounded-2xl border border-white/10 bg-black/30 px-5 py-4 text-white outline-none placeholder:text-white/40"
                />
                <input
                  value={form.state}
                  onChange={(event) => updateField('state', event.target.value)}
                  placeholder="State"
                  className="rounded-2xl border border-white/10 bg-black/30 px-5 py-4 text-white outline-none placeholder:text-white/40"
                />
              </div>

              {/* Description */}
              <textarea
                value={form.description}
                onChange={(event) => updateField('description', event.target.value)}
                placeholder="Describe the condition, known issues, age, usage, missing parts, or anything buyers should know."
                className="min-h-[180px] rounded-2xl border border-white/10 bg-black/30 px-5 py-4 text-white outline-none placeholder:text-white/40"
              />

              {/* Photo upload */}
              <div>
                <div className="mb-3 text-sm font-bold text-white/70">
                  Equipment Photo (optional, helps buyers decide faster)
                </div>

                <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-white/20 bg-black/20 px-6 py-8 text-center transition hover:border-cyan-400/40">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handlePhotoChange}
                    disabled={photoUploading}
                  />
                  {photoUploading ? (
                    <span className="text-sm text-white/50">Uploading...</span>
                  ) : photoUrl ? (
                    <div className="flex flex-col items-center gap-3">
                      <img
                        src={photoUrl}
                        alt="Equipment preview"
                        className="h-40 w-auto rounded-xl object-cover"
                      />
                      <span className="text-xs text-cyan-300">
                        Photo uploaded. Click to replace.
                      </span>
                    </div>
                  ) : (
                    <>
                      <span className="text-4xl text-white/20">+</span>
                      <span className="text-sm text-white/50">
                        Click to upload a photo (JPEG, PNG, or WebP, max 5MB)
                      </span>
                    </>
                  )}
                </label>

                {photoError && (
                  <p className="mt-2 text-xs text-red-400">{photoError}</p>
                )}
              </div>

              {/* Seller info */}
              <div className="grid gap-5 md:grid-cols-3">
                <input
                  value={form.seller_name}
                  onChange={(event) => updateField('seller_name', event.target.value)}
                  placeholder="Your name"
                  required
                  className="rounded-2xl border border-white/10 bg-black/30 px-5 py-4 text-white outline-none placeholder:text-white/40"
                />
                <input
                  value={form.seller_email}
                  onChange={(event) => updateField('seller_email', event.target.value)}
                  placeholder="Email"
                  type="email"
                  required
                  className="rounded-2xl border border-white/10 bg-black/30 px-5 py-4 text-white outline-none placeholder:text-white/40"
                />
                <input
                  value={form.seller_phone}
                  onChange={(event) => updateField('seller_phone', event.target.value)}
                  placeholder="Phone (optional)"
                  className="rounded-2xl border border-white/10 bg-black/30 px-5 py-4 text-white outline-none placeholder:text-white/40"
                />
              </div>

              {/* Privacy notice */}
              <div className="rounded-2xl border border-yellow-400/20 bg-yellow-400/5 p-5 text-sm leading-7 text-white/70">
                <span className="font-bold text-yellow-300">Privacy:</span>{' '}
                Your email address and phone number will never be displayed publicly.
                Interested buyers contact you through the marketplace message system,
                and their message is delivered directly to your inbox. Only the item
                details and a contact form are shown publicly.
              </div>

              {/* Review notice */}
              <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-5 text-sm leading-7 text-white/70">
                Listings are reviewed before publishing. 2EZ TEK may contact you
                regarding optional delivery, diagnostics, repair, installation, or
                inspection services.
              </div>

              <button
                type="submit"
                disabled={loading || photoUploading}
                className="rounded-2xl bg-cyan-400 px-8 py-5 text-sm font-black uppercase tracking-[0.14em] text-black transition hover:scale-[1.01] hover:bg-cyan-300 disabled:opacity-50"
              >
                {loading ? 'Submitting...' : 'Submit Listing'}
              </button>

              {message && (
                <div
                  className={`rounded-2xl border p-5 text-sm leading-7 ${
                    success
                      ? 'border-green-500/20 bg-green-500/10 text-green-200'
                      : 'border-red-500/20 bg-red-500/10 text-red-200'
                  }`}
                >
                  {message}
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </main>
  )
}
