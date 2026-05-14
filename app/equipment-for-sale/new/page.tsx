'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables')
  }

  return createClient(supabaseUrl, supabaseKey)
}

const categories = [
  'Treadmill',
  'Elliptical',
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
  const supabase = useMemo(() => getSupabaseClient(), [])

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [success, setSuccess] = useState(false)

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
    setForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()

    setLoading(true)
    setSuccess(false)
    setMessage('Submitting listing...')

    try {
      const payload = {
        title: form.title.trim(),
        brand: form.brand.trim(),
        model: form.model.trim(),
        category: form.category,
        condition: form.condition,
        price: form.price ? Number(form.price) : null,
        city: form.city.trim(),
        state: form.state.trim() || 'TX',
        description: form.description.trim(),
        seller_name: form.seller_name.trim(),
        seller_email: form.seller_email.trim(),
        seller_phone: form.seller_phone.trim(),
        status: 'pending',
      }

      const { error } = await supabase
        .from('equipment_listings')
        .insert(payload)

      if (error) {
        throw error
      }

      setSuccess(true)

      setMessage(
        'Listing submitted successfully. 2EZ TEK will review it before publishing.'
      )

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
    } catch (error: any) {
      console.error(error)

      setSuccess(false)

      setMessage(
        error?.message ||
          'Something went wrong submitting the listing.'
      )
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
          <Link
            href="/equipment-for-sale"
            className="text-sm font-bold text-cyan-300"
          >
            ← Back to Marketplace
          </Link>

          <div className="mt-8 overflow-hidden rounded-[2.5rem] border border-white/10 bg-black/25 shadow-[0_25px_90px_rgba(0,0,0,0.35)] backdrop-blur-2xl">
            <div className="border-b border-white/10 p-8 md:p-12">
              <div className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-5 py-2 text-xs font-black uppercase tracking-[0.24em] text-cyan-300">
                SmartGymOps Marketplace
              </div>

              <h1 className="mt-7 text-4xl font-black leading-tight md:text-6xl">
                Submit Fitness Equipment
                <span className="block text-white/55">
                  For Sale
                </span>
              </h1>

              <p className="mt-6 max-w-3xl text-lg leading-8 text-white/70">
                Submit treadmills, ellipticals, commercial cardio,
                home gyms, benches, and strength equipment.
                Listings are reviewed before publishing publicly.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="grid gap-6 p-8 md:p-12"
            >
              <div className="grid gap-5 md:grid-cols-2">
                <input
                  value={form.title}
                  onChange={(event) =>
                    updateField('title', event.target.value)
                  }
                  placeholder="Listing title"
                  required
                  className="rounded-2xl border border-white/10 bg-black/30 px-5 py-4 text-white outline-none placeholder:text-white/40"
                />

                <input
                  value={form.price}
                  onChange={(event) =>
                    updateField('price', event.target.value)
                  }
                  placeholder="Asking price"
                  type="number"
                  min="0"
                  className="rounded-2xl border border-white/10 bg-black/30 px-5 py-4 text-white outline-none placeholder:text-white/40"
                />
              </div>

              <div className="grid gap-5 md:grid-cols-3">
                <input
                  value={form.brand}
                  onChange={(event) =>
                    updateField('brand', event.target.value)
                  }
                  placeholder="Brand"
                  className="rounded-2xl border border-white/10 bg-black/30 px-5 py-4 text-white outline-none placeholder:text-white/40"
                />

                <input
                  value={form.model}
                  onChange={(event) =>
                    updateField('model', event.target.value)
                  }
                  placeholder="Model"
                  className="rounded-2xl border border-white/10 bg-black/30 px-5 py-4 text-white outline-none placeholder:text-white/40"
                />

                <select
                  value={form.category}
                  onChange={(event) =>
                    updateField('category', event.target.value)
                  }
                  className="rounded-2xl border border-white/10 bg-black/30 px-5 py-4 text-white outline-none"
                >
                  <option value="" className="bg-[#050B14]">
                    Select category
                  </option>

                  {categories.map((category) => (
                    <option
                      key={category}
                      value={category}
                      className="bg-[#050B14]"
                    >
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-5 md:grid-cols-3">
                <select
                  value={form.condition}
                  onChange={(event) =>
                    updateField('condition', event.target.value)
                  }
                  className="rounded-2xl border border-white/10 bg-black/30 px-5 py-4 text-white outline-none"
                >
                  <option value="" className="bg-[#050B14]">
                    Select condition
                  </option>

                  {conditions.map((condition) => (
                    <option
                      key={condition}
                      value={condition}
                      className="bg-[#050B14]"
                    >
                      {condition}
                    </option>
                  ))}
                </select>

                <input
                  value={form.city}
                  onChange={(event) =>
                    updateField('city', event.target.value)
                  }
                  placeholder="City"
                  className="rounded-2xl border border-white/10 bg-black/30 px-5 py-4 text-white outline-none placeholder:text-white/40"
                />

                <input
                  value={form.state}
                  onChange={(event) =>
                    updateField('state', event.target.value)
                  }
                  placeholder="State"
                  className="rounded-2xl border border-white/10 bg-black/30 px-5 py-4 text-white outline-none placeholder:text-white/40"
                />
              </div>

              <textarea
                value={form.description}
                onChange={(event) =>
                  updateField('description', event.target.value)
                }
                placeholder="Describe the condition, known issues, age, usage, missing parts, or anything buyers should know."
                className="min-h-[180px] rounded-2xl border border-white/10 bg-black/30 px-5 py-4 text-white outline-none placeholder:text-white/40"
              />

              <div className="grid gap-5 md:grid-cols-3">
                <input
                  value={form.seller_name}
                  onChange={(event) =>
                    updateField('seller_name', event.target.value)
                  }
                  placeholder="Your name"
                  required
                  className="rounded-2xl border border-white/10 bg-black/30 px-5 py-4 text-white outline-none placeholder:text-white/40"
                />

                <input
                  value={form.seller_email}
                  onChange={(event) =>
                    updateField('seller_email', event.target.value)
                  }
                  placeholder="Email"
                  type="email"
                  required
                  className="rounded-2xl border border-white/10 bg-black/30 px-5 py-4 text-white outline-none placeholder:text-white/40"
                />

                <input
                  value={form.seller_phone}
                  onChange={(event) =>
                    updateField('seller_phone', event.target.value)
                  }
                  placeholder="Phone"
                  className="rounded-2xl border border-white/10 bg-black/30 px-5 py-4 text-white outline-none placeholder:text-white/40"
                />
              </div>

              <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-5 text-sm leading-7 text-white/70">
                Listings are reviewed before publishing.
                2EZ TEK may contact you regarding optional delivery,
                diagnostics, repair, installation, or inspection services.
              </div>

              <button
                type="submit"
                disabled={loading}
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