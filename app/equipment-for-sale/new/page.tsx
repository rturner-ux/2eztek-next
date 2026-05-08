'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

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
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

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
    setMessage('Submitting listing...')

    try {
      const { error } = await supabase.from('equipment_listings').insert({
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
      })

      if (error) {
        throw error
      }

      setMessage(
        'Listing submitted successfully. 2EZ TEK will review it before it appears publicly.'
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
      setMessage(error.message || 'Something went wrong submitting the listing.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#050B14] px-6 py-20 text-white">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/equipment-for-sale"
          className="text-sm font-bold text-cyan-300"
        >
          ← Back to Marketplace
        </Link>

        <div className="mt-8 rounded-[2.5rem] border border-white/10 bg-white/5 p-8 md:p-12">
          <div className="mb-10">
            <div className="mb-4 inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-1 text-xs font-black uppercase tracking-[0.25em] text-cyan-300">
              List Equipment
            </div>

            <h1 className="text-4xl font-black md:text-6xl">
              Submit Fitness Equipment For Sale
            </h1>

            <p className="mt-5 max-w-3xl text-lg leading-8 text-white/60">
              Submit your treadmill, elliptical, home gym, functional trainer,
              or commercial fitness equipment. Listings are reviewed before
              being published.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="grid gap-6">
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

            <textarea
              value={form.description}
              onChange={(event) =>
                updateField('description', event.target.value)
              }
              placeholder="Describe condition, known issues, age, usage, missing parts, or anything the buyer should know."
              className="min-h-[160px] rounded-2xl border border-white/10 bg-black/30 px-5 py-4 text-white outline-none placeholder:text-white/40"
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
              Listings are reviewed before publishing. 2EZ TEK may contact you
              to offer optional inspection, delivery, installation, or repair
              support.
            </div>

            <button
              type="submit"
              disabled={loading}
              className="rounded-2xl bg-cyan-400 px-8 py-5 text-sm font-black uppercase tracking-wide text-black transition hover:scale-[1.01] disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit Listing'}
            </button>

            {message && (
              <div className="rounded-2xl border border-white/10 bg-black/30 p-5 text-white/70">
                {message}
              </div>
            )}
          </form>
        </div>
      </div>
    </main>
  )
}