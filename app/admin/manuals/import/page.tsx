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

  const [pastedData, setPastedData] = useState('')

  const [records, setRecords] = useState<ImportRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  async function scanFromUrl() {
    setLoading(true)
    setMessage('Scanning URL source...')

    try {
      const response = await fetch('/api/admin/manuals/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'scan',
          sourceUrl,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Scan failed.')
      }

      setRecords(
        data.records.map((record: any) => ({
          ...record,
          selected: true,
        }))
      )

      setMessage(`${data.records.length} records found.`)
    } catch (error: any) {
      setMessage(error.message || 'Scan failed.')
    } finally {
      setLoading(false)
    }
  }

  async function scanPastedData() {
    if (!pastedData.trim()) {
      setMessage('Paste manualsData content first.')
      return
    }

    setLoading(true)
    setMessage('Parsing pasted manuals data...')

    try {
      const response = await fetch('/api/admin/manuals/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'parse-pasted',
          pastedData,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Parse failed.')
      }

      setRecords(
        data.records.map((record: any) => ({
          ...record,
          selected: true,
        }))
      )

      setMessage(`${data.records.length} records parsed.`)
    } catch (error: any) {
      setMessage(error.message || 'Parse failed.')
    } finally {
      setLoading(false)
    }
  }

  async function importSelected() {
    const selected = records.filter((record) => record.selected)

    if (selected.length === 0) {
      setMessage('Select records first.')
      return
    }

    setLoading(true)
    setMessage(`Importing ${selected.length} manuals...`)

    try {
      const response = await fetch('/api/admin/manuals/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'import',
          records: selected,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Import failed.')
      }

      setMessage(`${data.imported} manuals imported successfully.`)
    } catch (error: any) {
      setMessage(error.message || 'Import failed.')
    } finally {
      setLoading(false)
    }
  }

  function toggleAll(value: boolean) {
    setRecords((current) =>
      current.map((record) => ({
        ...record,
        selected: value,
      }))
    )
  }

  function updateRecord(
    index: number,
    field: keyof ImportRecord,
    value: string | boolean
  ) {
    setRecords((current) =>
      current.map((record, recordIndex) =>
        recordIndex === index
          ? {
              ...record,
              [field]: value,
            }
          : record
      )
    )
  }

  return (
    <main className="min-h-screen bg-[#050B14] px-6 py-20 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10">
          <div className="mb-4 inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-1 text-xs font-black uppercase tracking-[0.25em] text-cyan-300">
            SmartGymOps Manual Importer
          </div>

          <h1 className="text-5xl font-black">
            Import Equipment Manuals
          </h1>

          <p className="mt-4 max-w-4xl text-lg leading-8 text-white/60">
            Scan manuals from URLs or paste the full manualsData
            JavaScript array directly into the importer.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8">
            <h2 className="mb-6 text-2xl font-black">
              Scan From URL
            </h2>

            <input
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              placeholder="https://..."
              className="w-full rounded-2xl border border-white/10 bg-black/30 px-5 py-4 text-white outline-none"
            />

            <button
              type="button"
              onClick={scanFromUrl}
              disabled={loading}
              className="mt-6 w-full rounded-2xl bg-cyan-400 px-6 py-4 text-sm font-black uppercase tracking-wide text-black disabled:opacity-50"
            >
              {loading ? 'Scanning...' : 'Scan URL'}
            </button>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8">
            <h2 className="mb-6 text-2xl font-black">
              Paste manualsData
            </h2>

            <textarea
              value={pastedData}
              onChange={(e) => setPastedData(e.target.value)}
              placeholder="Paste manualsData script here..."
              className="min-h-[220px] w-full rounded-2xl border border-white/10 bg-black/30 px-5 py-4 text-sm text-white outline-none"
            />

            <button
              type="button"
              onClick={scanPastedData}
              disabled={loading}
              className="mt-6 w-full rounded-2xl border border-cyan-400/30 bg-cyan-400/10 px-6 py-4 text-sm font-black uppercase tracking-wide text-cyan-300 disabled:opacity-50"
            >
              {loading ? 'Parsing...' : 'Parse Pasted Data'}
            </button>
          </div>
        </div>

        {message && (
          <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-5 text-white/70">
            {message}
          </div>
        )}

        {records.length > 0 && (
          <>
            <div className="mt-10 flex flex-wrap gap-4">
              <button
                type="button"
                onClick={importSelected}
                disabled={loading}
                className="rounded-2xl bg-cyan-400 px-8 py-4 text-sm font-black uppercase tracking-wide text-black"
              >
                Import Selected
              </button>

              <button
                type="button"
                onClick={() => toggleAll(true)}
                className="rounded-2xl border border-white/10 bg-white/5 px-8 py-4 text-sm font-black uppercase tracking-wide text-white"
              >
                Select All
              </button>

              <button
                type="button"
                onClick={() => toggleAll(false)}
                className="rounded-2xl border border-white/10 bg-white/5 px-8 py-4 text-sm font-black uppercase tracking-wide text-white"
              >
                Deselect All
              </button>
            </div>

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
                        onChange={(e) =>
                          updateRecord(
                            index,
                            'selected',
                            e.target.checked
                          )
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
                      Open Manual
                    </a>
                  </div>

                  <div className="grid gap-4 md:grid-cols-4">
                    <input
                      value={record.brand}
                      onChange={(e) =>
                        updateRecord(index, 'brand', e.target.value)
                      }
                      placeholder="Brand"
                      className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none"
                    />

                    <input
                      value={record.model}
                      onChange={(e) =>
                        updateRecord(index, 'model', e.target.value)
                      }
                      placeholder="Model"
                      className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none"
                    />

                    <input
                      value={record.category}
                      onChange={(e) =>
                        updateRecord(index, 'category', e.target.value)
                      }
                      placeholder="Category"
                      className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none"
                    />

                    <input
                      value={record.manual_type}
                      onChange={(e) =>
                        updateRecord(
                          index,
                          'manual_type',
                          e.target.value
                        )
                      }
                      placeholder="Manual Type"
                      className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none"
                    />
                  </div>

                  <textarea
                    value={record.description}
                    onChange={(e) =>
                      updateRecord(
                        index,
                        'description',
                        e.target.value
                      )
                    }
                    placeholder="Description"
                    className="mt-4 min-h-[90px] w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none"
                  />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  )
}