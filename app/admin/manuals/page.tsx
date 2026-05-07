'use client'

import { useMemo, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function AdminManualsPage() {
  const [brand, setBrand] = useState('')
  const [model, setModel] = useState('')
  const [equipmentType, setEquipmentType] = useState('')
  const [description, setDescription] = useState('')
  const [file, setFile] = useState<File | null>(null)

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [uploadedUrl, setUploadedUrl] = useState('')

  const safeFileName = useMemo(() => {
    const base = `${brand}-${model}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '')

    return `${base || 'manual'}.pdf`
  }, [brand, model])

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault()

    setMessage('')
    setUploadedUrl('')

    if (!file) {
      setMessage('Please select a PDF.')
      return
    }

    try {
      setLoading(true)

      const filePath = `manuals/${safeFileName}`

      const { error: uploadError } = await supabase.storage
        .from('manuals')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        })

      if (uploadError) {
        throw uploadError
      }

      const {
        data: { publicUrl },
      } = supabase.storage
        .from('manuals')
        .getPublicUrl(filePath)

      const { error: insertError } = await supabase
        .from('equipment_manuals')
        .insert({
          brand,
          model,
          equipment_type: equipmentType,
          description,
          manual_url: publicUrl,
        })

      if (insertError) {
        throw insertError
      }

      setUploadedUrl(publicUrl)

      setMessage('Manual uploaded successfully.')

      setBrand('')
      setModel('')
      setEquipmentType('')
      setDescription('')
      setFile(null)

      const input = document.getElementById(
        'manual-file'
      ) as HTMLInputElement | null

      if (input) {
        input.value = ''
      }
    } catch (error: any) {
      setMessage(error.message || 'Upload failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#050B14] px-6 py-20 text-white">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-10">
          <div className="mb-10">
            <div className="mb-4 inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-1 text-xs font-black uppercase tracking-[0.25em] text-cyan-300">
              SmartGymOps Manuals Upload
            </div>

            <h1 className="text-5xl font-black">
              Upload Equipment Manual
            </h1>

            <p className="mt-4 max-w-2xl text-white/60">
              Upload manuals directly into the 2EZ TEK equipment manuals
              database. Manuals automatically appear on the public manuals
              directory after upload.
            </p>
          </div>

          <form onSubmit={handleUpload} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
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
            </div>

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

            <div className="rounded-2xl border border-dashed border-cyan-400/30 bg-cyan-400/5 p-6">
              <div className="mb-4 text-sm font-bold text-cyan-300">
                Suggested Filename
              </div>

              <div className="rounded-xl bg-black/40 px-4 py-3 text-sm text-white/70">
                {safeFileName}
              </div>

              <input
                id="manual-file"
                type="file"
                accept="application/pdf"
                onChange={(e) =>
                  setFile(e.target.files?.[0] || null)
                }
                className="mt-5 w-full rounded-2xl border border-white/10 bg-black/30 px-5 py-4 text-white"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-cyan-400 px-8 py-5 text-sm font-black uppercase tracking-wide text-black transition hover:scale-[1.01] disabled:opacity-50"
            >
              {loading ? 'Uploading...' : 'Upload Manual'}
            </button>

            {message && (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-white/70">
                {message}
              </div>
            )}

            {uploadedUrl && (
              <a
                href={uploadedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-2xl border border-cyan-400/30 bg-cyan-400/10 p-5 text-sm font-bold text-cyan-300"
              >
                Open Uploaded Manual
              </a>
            )}
          </form>
        </div>
      </div>
    </main>
  )
}