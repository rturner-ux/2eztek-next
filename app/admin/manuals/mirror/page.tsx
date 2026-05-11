'use client'

import { useEffect, useMemo, useState } from 'react'

type MirrorManual = {
  id: string
  brand: string | null
  model: string | null
  equipment_type: string | null
  manual_type: string | null
  manual_url: string | null
  original_manual_url: string | null
  mirrored_at: string | null
}

export default function MirrorManualsPage() {
  const [manuals, setManuals] = useState<MirrorManual[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [batchSize, setBatchSize] = useState(10)

  async function loadManuals() {
    setLoading(true)
    setMessage('Loading manuals...')

    try {
      const response = await fetch('/api/admin/manuals/mirror?limit=500')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load manuals.')
      }

      setManuals(data.manuals || [])
      setMessage(`${data.manuals?.length || 0} external manual(s) ready to mirror.`)
    } catch (error: any) {
      setMessage(error.message || 'Failed to load manuals.')
    } finally {
      setLoading(false)
    }
  }

  async function mirrorBatch() {
    setLoading(true)
    setMessage(`Mirroring next ${batchSize} manual(s)...`)

    try {
      const response = await fetch('/api/admin/manuals/mirror', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ batchSize }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Mirror failed.')
      }

      setMessage(
        `Mirrored ${data.mirrored || 0} manual(s). Failed: ${
          data.failed || 0
        }.`
      )

      await loadManuals()
    } catch (error: any) {
      setMessage(error.message || 'Mirror failed.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadManuals()
  }, [])

  const pendingCount = useMemo(() => manuals.length, [manuals])

  return (
    <main className="min-h-screen bg-[#050B14] px-6 py-20 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10">
          <div className="mb-4 inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-1 text-xs font-black uppercase tracking-[0.25em] text-cyan-300">
            SmartGymOps Manual Mirror
          </div>

          <h1 className="text-5xl font-black">Mirror External Manuals</h1>

          <p className="mt-4 max-w-4xl text-lg leading-8 text-white/60">
            Download external manual PDFs, upload them into your Supabase
            Storage bucket, and update the manual records so 2EZ TEK no longer
            points users directly to outside PDF sources.
          </p>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8">
          <div className="grid gap-5 md:grid-cols-[1fr_220px_220px]">
            <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
              <div className="text-xs font-black uppercase tracking-[0.25em] text-cyan-300">
                Pending External Manuals
              </div>

              <div className="mt-3 text-4xl font-black">{pendingCount}</div>

              <p className="mt-2 text-sm text-white/50">
                These manuals still point to external PDF URLs.
              </p>
            </div>

            <label className="block">
              <span className="mb-2 block text-xs font-black uppercase tracking-[0.2em] text-cyan-300">
                Batch Size
              </span>

              <select
                value={batchSize}
                onChange={(event) => setBatchSize(Number(event.target.value))}
                className="w-full rounded-2xl border border-white/10 bg-black/30 px-5 py-4 text-white outline-none"
              >
                <option value={1} className="bg-[#050B14]">
                  1
                </option>
                <option value={10} className="bg-[#050B14]">
                  10
                </option>
                <option value={25} className="bg-[#050B14]">
                  25
                </option>
                <option value={50} className="bg-[#050B14]">
                  50
                </option>
                <option value={100} className="bg-[#050B14]">
                  100
                </option>
                <option value={250} className="bg-[#050B14]">
                  250
                </option>
              </select>
            </label>

            <div className="flex items-end">
              <button
                type="button"
                onClick={mirrorBatch}
                disabled={loading || pendingCount === 0}
                className="w-full rounded-2xl bg-cyan-400 px-6 py-4 text-sm font-black uppercase tracking-wide text-black transition hover:scale-[1.01] disabled:opacity-50"
              >
                {loading ? 'Working...' : 'Mirror Next Batch'}
              </button>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={loadManuals}
              disabled={loading}
              className="rounded-2xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-black uppercase tracking-wide text-white disabled:opacity-50"
            >
              Refresh List
            </button>
          </div>

          {message && (
            <div className="mt-6 rounded-2xl border border-white/10 bg-black/30 p-4 text-white/70">
              {message}
            </div>
          )}
        </div>

        <div className="mt-10 grid gap-5">
          {manuals.map((manual) => (
            <div
              key={manual.id}
              className="rounded-[2rem] border border-white/10 bg-white/5 p-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="text-xs font-black uppercase tracking-[0.25em] text-cyan-300">
                    {manual.equipment_type || 'Fitness Equipment'}
                  </div>

                  <h2 className="mt-3 text-2xl font-black">
                    {manual.brand || 'Unknown Brand'}{' '}
                    {manual.model || 'Unknown Model'}
                  </h2>

                  <p className="mt-2 text-white/50">
                    {manual.manual_type || 'Manual'}
                  </p>
                </div>

                <div className="rounded-full border border-yellow-400/30 bg-yellow-400/10 px-4 py-2 text-xs font-black uppercase tracking-wide text-yellow-300">
                  External
                </div>
              </div>

              <div className="mt-5 break-all rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-white/60">
                {manual.manual_url}
              </div>

              {manual.manual_url && (
                <a
                  href={manual.manual_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex rounded-2xl border border-cyan-400/30 bg-cyan-400/10 px-5 py-3 text-sm font-black uppercase tracking-wide text-cyan-300"
                >
                  Open Current URL
                </a>
              )}
            </div>
          ))}
        </div>

        {manuals.length === 0 && !loading && (
          <div className="mt-10 rounded-[2rem] border border-white/10 bg-white/5 p-12 text-center">
            <h2 className="text-3xl font-black">No External Manuals Found</h2>

            <p className="mx-auto mt-4 max-w-2xl text-white/60">
              All manuals appear to be mirrored already, or there are no
              external PDF URLs left to process.
            </p>
          </div>
        )}
      </div>
    </main>
  )
}