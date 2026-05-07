'use client'

import { useState } from 'react'

export default function AdminManualsPage() {
  const [brand, setBrand] = useState('')
  const [model, setModel] = useState('')
  const [equipmentType, setEquipmentType] = useState('')
  const [description, setDescription] = useState('')
  const [file, setFile] = useState<File | null>(null)

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault()

    if (!file) {
      setMessage('Please select a PDF file.')
      return
    }

    try {
      setLoading(true)
      setMessage('Uploading manual...')

      const formData = new FormData()

      formData.append('brand', brand)
      formData.append('model', model)
      formData.append('equipment_type', equipmentType)
      formData.append('description', description)
      formData.append('file', file)

      const response = await fetch('/api/admin/manuals/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed')
      }

      setMessage('Manual uploaded successfully.')

      setBrand('')
      setModel('')
      setEquipmentType('')
      setDescription('')
      setFile(null)
    } catch (error: any) {
      setMessage(error.message || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#050B14] px-6 py-20 text-white">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-10">
          <div className="mb-8">
            <div className="mb-4 inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-1 text-xs font-black uppercase tracking-[0.25em] text-cyan-300">
              Admin Manuals Upload
            </div>

            <h1 className="text-5xl font-black">
              Upload Equipment Manual
            </h1>

            <p className="mt-4 text-white/60">
              Upload fitness equipment manuals directly into the
              SmartGymOps manuals database.
            </p>
          </div>

          <form onSubmit={handleUpload} className="space-y-6">
            <input
              type="text"
              placeholder="Brand"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-black/30 px-5 py-4 text-white outline-none"
              required
            />

            <input
              type="text"
              placeholder="Model"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-black/30 px-5 py-4 text-white outline-none"
              required
            />

            <input
              type="text"
              placeholder="Equipment Type"
              value={equipmentType}
              onChange={(e) => setEquipmentType(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-black/30 px-5 py-4 text-white outline-none"
            />

            <textarea
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[140px] w-full rounded-2xl border border-white/10 bg-black/30 px-5 py-4 text-white outline-none"
            />

            <input
              type="file"
              accept="application/pdf"
              onChange={(e) =>
                setFile(e.target.files?.[0] || null)
              }
              className="w-full rounded-2xl border border-white/10 bg-black/30 px-5 py-4 text-white"
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-cyan-400 px-8 py-5 text-sm font-black uppercase tracking-wide text-black transition hover:scale-[1.01] disabled:opacity-50"
            >
              {loading ? 'Uploading...' : 'Upload Manual'}
            </button>

            {message && (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
                {message}
              </div>
            )}
          </form>
        </div>
      </div>
    </main>
  )
}