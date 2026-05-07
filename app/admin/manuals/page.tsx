'use client'

import { useMemo, useState } from 'react'

export default function AdminManualsPage() {
  const [brand, setBrand] = useState('')
  const [model, setModel] = useState('')
  const [equipmentType, setEquipmentType] = useState('')
  const [description, setDescription] = useState('')
  const [file, setFile] = useState<File | null>(null)

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [uploadedUrl, setUploadedUrl] = useState('')

  const safeFilePreview = useMemo(() => {
    if (!brand && !model && !file) return ''

    const base = `${brand || 'brand'}-${model || 'model'}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '')

    return `${base || file?.name || 'manual'}.pdf`
  }, [brand, model, file])

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault()

    setMessage('')
    setUploadedUrl('')

    if (!file) {
      setMessage('Please select a PDF file.')
      return
    }

    if (file.type !== 'application/pdf') {
      setMessage('Only PDF files are allowed.')
      return
    }

    if (!brand.trim() || !model.trim()) {
      setMessage('Brand and model are required.')
      return
    }

    try {
      setLoading(true)
      setMessage('Uploading manual...')

      const formData = new FormData()
      formData.append('brand', brand.trim())
      formData.append('model', model.trim())
      formData.append('equipment_type', equipmentType.trim())
      formData.append('description', description.trim())
      formData.append('file', file)

      const response = await fetch('/api/admin/manuals/upload', {
        method: 'POST',
        body: formData,
      })

      const text = await response.text()

      let data: any = {}

      try {
        data = JSON.parse(text)
      } catch {
        throw new Error(
          `Upload API did not return JSON. Status: ${response.status}. Response: ${text.slice(
            0,
            160
          )}`
        )
      }

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed.')
      }

      setMessage('Manual uploaded successfully.')
      setUploadedUrl(data.manual_url || '')

      setBrand('')
      setModel('')
      setEquipmentType('')
      setDescription('')
      setFile(null)

      const fileInput = document.getElementById(
        'manual-file'
      ) as HTMLInputElement | null

      if (fileInput) fileInput.value = ''
    } catch (error: any) {
      setMessage(error.message || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#050B14] px-6 py-20 text-white">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 md:p-10">
          <div className="mb-8">
            <div className="mb-4 inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-1 text-xs font-black uppercase tracking-[0.25em] text-cyan-300">
              Admin Manuals Upload
            </div>

            <h1 className="text-4xl font-black md:text-5xl">
              Upload Equipment Manual
            </h1>

            <p className="mt-4 text-white/60">
              Upload PDF manuals into the 2EZ TEK equipment manuals database.
              Once uploaded, they can appear automatically on the public manuals
              page.
            </p>
          </div>

          <form onSubmit={handleUpload} className="space-y-6">
            <div className="grid gap-5 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-xs font-black uppercase tracking-[0.2em] text-cyan-300">
                  Brand
                </span>
                <input
                  type="text"
                  placeholder="Landmark Athletics"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-black/30 px-5 py-4 text-white outline-none placeholder:text-white/30 focus:border-cyan-400/50"
                  required
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-black uppercase tracking-[0.2em] text-cyan-300">
                  Model
                </span>
                <input
                  type="text"
                  placeholder="K2S All In One Gym"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-black/30 px-5 py-4 text-white outline-none placeholder:text-white/30 focus:border-cyan-400/50"
                  required
                />
              </label>
            </div>

            <label className="block">
              <span className="mb-2 block text-xs font-black uppercase tracking-[0.2em] text-cyan-300">
                Equipment Type
              </span>
              <input
                type="text"
                placeholder="Home Gym, Treadmill, Elliptical, Bike"
                value={equipmentType}
                onChange={(e) => setEquipmentType(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-black/30 px-5 py-4 text-white outline-none placeholder:text-white/30 focus:border-cyan-400/50"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-black uppercase tracking-[0.2em] text-cyan-300">
                Description
              </span>
              <textarea
                placeholder="Assembly manual, cable routing reference, troubleshooting guide, or technician resource."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[140px] w-full rounded-2xl border border-white/10 bg-black/30 px-5 py-4 text-white outline-none placeholder:text-white/30 focus:border-cyan-400/50"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-black uppercase tracking-[0.2em] text-cyan-300">
                PDF Manual
              </span>
              <input
                id="manual-file"
                type="file"
                accept="application/pdf"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="w-full rounded-2xl border border-white/10 bg-black/30 px-5 py-4 text-white file:mr-4 file:rounded-xl file:border-0 file:bg-cyan-400 file:px-4 file:py-2 file:text-sm file:font-black file:text-black"
                required
              />
            </label>

            {file && (
              <div className="rounded-2xl border border-white/10 bg-black/30 p-5 text-sm text-white/70">
                <div>
                  <span className="font-bold text-white">Selected:</span>{' '}
                  {file.name}
                </div>
                <div className="mt-2">
                  <span className="font-bold text-white">Suggested name:</span>{' '}
                  {safeFilePreview}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-cyan-400 px-8 py-5 text-sm font-black uppercase tracking-wide text-black transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Uploading...' : 'Upload Manual'}
            </button>

            {message && (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
                {message}
              </div>
            )}

            {uploadedUrl && (
              <a
                href={uploadedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-2xl border border-cyan-400/30 bg-cyan-400/10 p-4 text-sm font-bold text-cyan-300 transition hover:bg-cyan-400/15"
              >
                Open uploaded manual
              </a>
            )}
          </form>
        </div>
      </div>
    </main>
  )
}