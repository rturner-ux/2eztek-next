'use client'

import { useState } from 'react'

type ImportRecord = {
  selected: boolean
  title: string
  brand: string
  model: string
  category: string
  manual_type: string
  manual_url: string
  description: string
}

export default function ManualImportPage() {
  const [sourceUrl, setSourceUrl] = useState(
    'https://www.fitnesssuperstore.com/pages/all-manuals'
  )
  const [records, setRecords] = useState<ImportRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  async function scanManuals() {
    setLoading(true)
    setMessage('Scanning source...')

    try {
      const response = await fetch('/api/admin/manuals/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'scan', sourceUrl }),
      })

      const text = await response.text()
      let data: any = {}

      try {
        data = JSON.parse(text)
      } catch {
        throw new Error(`Import API returned non JSON response: ${text.slice(0, 200)}`)
      }

      if (!response.ok) {
        throw new Error(data.error || 'Scan failed.')
      }

      const found = data.records || []

      setRecords(
        found.map((record: Omit<ImportRecord, 'selected'>) => ({
          ...record,
          selected: true,
        }))
      )

      setMessage(`${found.length} manual record(s) found.`)
    } catch (error: any) {
      setMessage(error.message || 'Scan failed.')
    } finally {
      setLoading(false)
    }
  }

  async function importSelected() {
    const selected = records.filter((record) => record.selected)

    if (selected.length === 0) {
      setMessage('Select at least one manual to import.')
      return
    }

    setLoading(true)
    setMessage(`Importing ${selected.length} manual record(s)...`)

    try {
      const response = await fetch('/api/admin/manuals/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'import', records: selected }),
      })

      const text = await response.text()
      let data: any = {}

      try {
        data = JSON.parse(text)
      } catch {
        throw new Error(`Import API returned non JSON response: ${text.slice(0, 200)}`)
      }

      if (!response.ok) {
        throw new Error(data.error || 'Import failed.')
      }

      setMessage(`Imported ${data.imported} manual record(s) successfully.`)
    } catch (error: any) {
      setMessage(error.message || 'Import failed.')
    } finally {
      setLoading(false)
    }
  }

  function updateRecord(index: number, field: keyof ImportRecord, value: any) {
    setRecords((current) =>
      current.map((record, recordIndex) =>
        recordIndex === index ? { ...record, [field]: value } : record
      )
    )
  }

  function toggleAll(value: boolean) {
    setRecords((current) =>
      current.map((record) => ({
        ...record,
        selected: value,
      }))
    )
  }

  return (
    <main className="min-h-screen bg-[#050B14] px-6 py-20 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10">
          <div className="mb-4 inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-1 text-xs font-black uppercase tracking-[0.25em] text-cyan-300">
            SmartGymOps Manual Importer
          </div>

          <h1 className="text-5xl font-black">Import Manuals From Web</h1>

          <p className="mt-4 max-w-3xl text-white/60">
            Paste a manuals page URL or an API/XHR URL. The importer scans for PDF manual links,
            detects brand, model, category, and saves references into the normalized equipment library.
          </p>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8">
          <label>
            <span className="mb-2 block text-xs font-black uppercase tracking-[0.2em] text-cyan-300">
              Source URL
            </span>

            <input
              value={sourceUrl}
              onChange={(event) => setSourceUrl(event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-black/30 px-5 py-4 text-white outline-none"
            />
          </label>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={scanManuals}
              disabled={loading}
              className="rounded-2xl bg-cyan-400 px-6 py-3 text-sm font-black uppercase tracking-wide text-black disabled:opacity-50"
            >
              {loading ? 'Working...' : 'Scan Manuals'}
            </button>

            <button
              type="button"
              onClick={importSelected}
              disabled={loading || records.length === 0}
              className="rounded-2xl border border-cyan-400/30 bg-cyan-400/10 px-6 py-3 text-sm font-black uppercase tracking-wide text-cyan-300 disabled:opacity-50"
            >
              Import Selected
            </button>

            {records.length > 0 && (
              <>
                <button
                  type="button"
                  onClick={() => toggleAll(true)}
                  className="rounded-2xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-black uppercase tracking-wide text-white"
                >
                  Select All
                </button>

                <button
                  type="button"
                  onClick={() => toggleAll(false)}
                  className="rounded-2xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-black uppercase tracking-wide text-white"
                >
                  Deselect All
                </button>
              </>
            )}
          </div>

          {message && (
            <div className="mt-6 rounded-2xl border border-white/10 bg-black/30 p-4 text-white/70">
              {message}
            </div>
          )}
        </div>

        {records.length > 0 && (
          <div className="mt-10 grid gap-6">
            {records.map((record, index) => (
              <div
                key={`${record.manual_url}-${index}`}
                className="rounded-[2rem] border border-white/10 bg-white/5 p-6"
              >
                <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={record.selected}
                      onChange={(event) =>
                        updateRecord(index, 'selected', event.target.checked)
                      }
                    />

                    <span className="text-sm font-bold text-white/70">
                      Import this manual
                    </span>
                  </label>

                  <a
                    href={record.manual_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-bold text-cyan-300"
                  >
                    Open PDF
                  </a>
                </div>

                <div className="mb-4 break-all text-sm text-white/50">
                  Original title: {record.title}
                </div>

                <div className="grid gap-4 md:grid-cols-4">
                  <input
                    value={record.brand}
                    onChange={(event) =>
                      updateRecord(index, 'brand', event.target.value)
                    }
                    placeholder="Brand"
                    className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none"
                  />

                  <input
                    value={record.model}
                    onChange={(event) =>
                      updateRecord(index, 'model', event.target.value)
                    }
                    placeholder="Model"
                    className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none"
                  />

                  <input
                    value={record.category}
                    onChange={(event) =>
                      updateRecord(index, 'category', event.target.value)
                    }
                    placeholder="Category"
                    className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none"
                  />

                  <input
                    value={record.manual_type}
                    onChange={(event) =>
                      updateRecord(index, 'manual_type', event.target.value)
                    }
                    placeholder="Manual Type"
                    className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none"
                  />
                </div>

                <textarea
                  value={record.description}
                  onChange={(event) =>
                    updateRecord(index, 'description', event.target.value)
                  }
                  placeholder="Description"
                  className="mt-4 min-h-[90px] w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}