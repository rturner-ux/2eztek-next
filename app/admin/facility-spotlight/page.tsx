'use client'

import { useState } from 'react'

const emptyForm = {
  facility_name: '',
  slug: '',
  city: '',
  state: 'TX',
  facility_type: '',
  headline: '',
  description: '',
  services: '',
  equipment_types: '',
  spotlight_month: '',
  uptime_award: false,
  is_featured: false,
  is_published: true,
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

export default function AdminFacilitySpotlightPage() {
  const [formData, setFormData] = useState(emptyForm)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  function updateField(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value, type } = e.target

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData((prev) => ({ ...prev, [name]: checked }))
      return
    }

    setFormData((prev) => {
      const next = { ...prev, [name]: value }

      if (name === 'facility_name' && !prev.slug) {
        next.slug = slugify(value)
      }

      return next
    })
  }

  async function submitForm(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitting(true)
    setMessage('')

    try {
      const body = new FormData()

      Object.entries(formData).forEach(([key, value]) => {
        body.append(key, String(value))
      })

      if (imageFile) body.append('image', imageFile)
      if (logoFile) body.append('logo', logoFile)

      const response = await fetch('/api/admin/facility-spotlight', {
        method: 'POST',
        body,
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to save facility spotlight')
      }

      setMessage('Facility spotlight saved successfully.')
      setFormData(emptyForm)
      setImageFile(null)
      setLogoFile(null)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Something went wrong.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#050B14] px-6 py-24 text-white">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <div className="mb-4 text-xs font-black uppercase tracking-[0.25em] text-cyan-300">
            Admin
          </div>

          <h1 className="text-5xl font-black">Add Facility Spotlight</h1>

          <p className="mt-4 max-w-2xl text-white/60">
            Add a featured facility, upload images, publish the spotlight, and
            mark it as featured without editing code.
          </p>
        </div>

        {message && (
          <div className="mb-6 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-4 text-sm font-bold text-cyan-100">
            {message}
          </div>
        )}

        <form
          onSubmit={submitForm}
          className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <input
              name="facility_name"
              value={formData.facility_name}
              onChange={updateField}
              placeholder="Facility Name"
              required
              className="rounded-xl border border-white/10 bg-black/30 px-5 py-4 outline-none focus:border-cyan-300/50"
            />

            <input
              name="slug"
              value={formData.slug}
              onChange={updateField}
              placeholder="Slug"
              required
              className="rounded-xl border border-white/10 bg-black/30 px-5 py-4 outline-none focus:border-cyan-300/50"
            />

            <input
              name="city"
              value={formData.city}
              onChange={updateField}
              placeholder="City"
              className="rounded-xl border border-white/10 bg-black/30 px-5 py-4 outline-none focus:border-cyan-300/50"
            />

            <input
              name="state"
              value={formData.state}
              onChange={updateField}
              placeholder="State"
              className="rounded-xl border border-white/10 bg-black/30 px-5 py-4 outline-none focus:border-cyan-300/50"
            />

            <input
              name="facility_type"
              value={formData.facility_type}
              onChange={updateField}
              placeholder="Facility Type"
              className="rounded-xl border border-white/10 bg-black/30 px-5 py-4 outline-none focus:border-cyan-300/50"
            />

            <input
              name="spotlight_month"
              value={formData.spotlight_month}
              onChange={updateField}
              placeholder="Spotlight Month"
              className="rounded-xl border border-white/10 bg-black/30 px-5 py-4 outline-none focus:border-cyan-300/50"
            />
          </div>

          <input
            name="headline"
            value={formData.headline}
            onChange={updateField}
            placeholder="Headline"
            className="mt-4 w-full rounded-xl border border-white/10 bg-black/30 px-5 py-4 outline-none focus:border-cyan-300/50"
          />

          <textarea
            name="description"
            value={formData.description}
            onChange={updateField}
            rows={5}
            placeholder="Description"
            className="mt-4 w-full rounded-xl border border-white/10 bg-black/30 px-5 py-4 outline-none focus:border-cyan-300/50"
          />

          <textarea
            name="services"
            value={formData.services}
            onChange={updateField}
            rows={3}
            placeholder="Services, comma separated"
            className="mt-4 w-full rounded-xl border border-white/10 bg-black/30 px-5 py-4 outline-none focus:border-cyan-300/50"
          />

          <textarea
            name="equipment_types"
            value={formData.equipment_types}
            onChange={updateField}
            rows={3}
            placeholder="Equipment types, comma separated"
            className="mt-4 w-full rounded-xl border border-white/10 bg-black/30 px-5 py-4 outline-none focus:border-cyan-300/50"
          />

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="rounded-xl border border-white/10 bg-black/30 p-5">
              <span className="block text-sm font-bold text-white/70">
                Facility Image
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                className="mt-3 text-sm"
              />
            </label>

            <label className="rounded-xl border border-white/10 bg-black/30 p-5">
              <span className="block text-sm font-bold text-white/70">
                Logo Image
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                className="mt-3 text-sm"
              />
            </label>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/30 p-4">
              <input
                type="checkbox"
                name="uptime_award"
                checked={formData.uptime_award}
                onChange={updateField}
              />
              Uptime Award
            </label>

            <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/30 p-4">
              <input
                type="checkbox"
                name="is_featured"
                checked={formData.is_featured}
                onChange={updateField}
              />
              Featured
            </label>

            <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/30 p-4">
              <input
                type="checkbox"
                name="is_published"
                checked={formData.is_published}
                onChange={updateField}
              />
              Published
            </label>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="mt-6 w-full rounded-xl bg-cyan-300 px-6 py-5 text-sm font-black uppercase tracking-[0.14em] text-slate-950 disabled:opacity-60"
          >
            {submitting ? 'Saving...' : 'Save Facility Spotlight'}
          </button>
        </form>
      </div>
    </main>
  )
}