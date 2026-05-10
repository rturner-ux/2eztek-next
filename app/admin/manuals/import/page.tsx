'use client'

import { useMemo, useState } from 'react'

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

const PAGE_SIZE = 50

const BRAND_OPTIONS = [
  'Matrix',
  'Johnson Health Tech',
  'Vision Fitness',
  'Horizon Fitness',
  'Sole',
  'TRUE Fitness',
  'Rogue Fitness',
  'Bowflex',
  'NordicTrack',
  'ProForm',
  'Precor',
  'Life Fitness',
  'Landice',
  'Inspire Fitness',
  'Unknown Brand',
]

const CATEGORY_OPTIONS = [
  'Treadmill',
  'Elliptical',
  'Bike',
  'Cycle',
  'Ascent Trainer',
  'ClimbMill',
  'Rower',
  'Strength',
  'Functional Trainer',
  'Bench',
  'Rack',
  'Console',
  'Fitness Equipment',
]

const MANUAL_TYPE_OPTIONS = [
  'Owner Manual',
  'Assembly Manual',
  'Service Manual',
  'Parts Manual',
  'User Manual',
  'Installation Manual',
  'Operation Manual',
  'Manual',
]

function buildDescription(record: ImportRecord) {
  return `${record.brand} ${record.model} ${record.category} ${record.manual_type}`
    .replace(/\s+/g, ' ')
    .trim()
}

export default function ManualImportPage() {
  const [pastedData, setPastedData] = useState('')
  const [records, setRecords] = useState<ImportRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [page, setPage] = useState(1)

  const selectedCount = useMemo(
    () => records.filter((record) => record.selected).length,
    [records]
  )

  const totalPages = Math.max(1, Math.ceil(records.length / PAGE_SIZE))

  const visibleRecords = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE
    return records.slice(start, start + PAGE_SIZE)
  }, [records, page])

  async function parseServerSide() {
    if (!pastedData.trim()) {
      setMessage('Paste manufacturer data first.')
      return
    }

    setLoading(true)
    setMessage('Sending data to server parser...')

    try {
      const response = await fetch('/api/admin/manuals/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'parse-pasted', pastedData }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Server parse failed.')
      }

      const parsedRecords: ImportRecord[] = (data.records || []).map(
        (record: Partial<ImportRecord>) => ({
          selected: true,
          title: record.title || record.model || 'Manual',
          brand: record.brand || 'Unknown Brand',
          model: record.model || 'Unknown Model',
          category: record.category || 'Fitness Equipment',
          manual_type: record.manual_type || 'Manual',
          manual_url: record.manual_url || '',
          description:
            record.description ||
            `${record.brand || 'Unknown Brand'} ${
              record.model || 'Unknown Model'
            } ${record.manual_type || 'Manual'}`,
        })
      )

      setRecords(parsedRecords)
      setPage(1)
      setMessage(`${parsedRecords.length} manuals parsed successfully.`)
    } catch (error: any) {
      setMessage(error.message || 'Parse failed.')
    } finally {
      setLoading(false)
    }
  }

  async function importSelected() {
    const selected = records.filter((record) => record.selected)

    if (selected.length === 0) {
      setMessage('Select manuals first.')
      return
    }

    setLoading(true)
    setMessage(`Importing ${selected.length} manuals...`)

    try {
      const response = await fetch('/api/admin/manuals/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'import', records: selected }),
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

  function toggleVisible(value: boolean) {
    const visibleUrls = new Set(visibleRecords.map((record) => record.manual_url))

    setRecords((current) =>
      current.map((record) =>
        visibleUrls.has(record.manual_url)
          ? {
              ...record,
              selected: value,
            }
          : record
      )
    )
  }

  function updateRecord(
    manualUrl: string,
    field: keyof ImportRecord,
    value: string | boolean
  ) {
    setRecords((current) =>
      current.map((record) => {
        if (record.manual_url !== manualUrl) return record

        const updated = {
          ...record,
          [field]: value,
        }

        if (
          field === 'brand' ||
          field === 'model' ||
          field === 'category' ||
          field === 'manual_type'
        ) {
          updated.description = buildDescription(updated)
        }

        return updated
      })
    )
  }

  function bulkUpdate(field: keyof ImportRecord, value: string) {
    if (!value) return

    setRecords((current) =>
      current.map((record) => {
        if (!record.selected) return record

        const updated = {
          ...record,
          [field]: value,
        }

        if (
          field === 'brand' ||
          field === 'model' ||
          field === 'category' ||
          field === 'manual_type'
        ) {
          updated.description = buildDescription(updated)
        }

        return updated
      })
    )
  }

  return (
    <main className="min-h-screen bg-[#050B14] px-6 py-20 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12">
          <div className="mb-4 inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-1 text-xs font-black uppercase tracking-[0.25em] text-cyan-300">
            SmartGymOps Manual Importer
          </div>

          <h1 className="text-5xl font-black">Import Equipment Manuals</h1>

          <p className="mt-4 max-w-4xl text-lg leading-8 text-white/60">
            Paste manufacturer HTML, JSON, GraphQL response data, or direct PDF
            links. Parsing now runs through the server, and results are paginated
            so the browser does not freeze.
          </p>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8">
          <h2 className="mb-6 text-2xl font-black">
            Paste Manufacturer Data
          </h2>

          <textarea
            value={pastedData}
            onChange={(e) => setPastedData(e.target.value)}
            placeholder="Paste HTML, JSON, GraphQL response, or PDF links here..."
            className="min-h-[340px] w-full rounded-2xl border border-white/10 bg-black/30 px-5 py-4 text-sm text-white outline-none placeholder:text-white/35"
          />

          <button
            type="button"
            onClick={parseServerSide}
            disabled={loading}
            className="mt-6 w-full rounded-2xl border border-cyan-400/30 bg-cyan-400/10 px-6 py-4 text-sm font-black uppercase tracking-wide text-cyan-300 disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Parse Manuals Server Side'}
          </button>
        </div>

        {message && (
          <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-5 text-white/70">
            {message}
          </div>
        )}

        {records.length > 0 && (
          <>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={importSelected}
                disabled={loading}
                className="rounded-2xl bg-cyan-400 px-8 py-4 text-sm font-black uppercase tracking-wide text-black disabled:opacity-50"
              >
                Import Selected ({selectedCount})
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

              <button
                type="button"
                onClick={() => toggleVisible(true)}
                className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-8 py-4 text-sm font-black uppercase tracking-wide text-cyan-300"
              >
                Select Page
              </button>

              <button
                type="button"
                onClick={() => toggleVisible(false)}
                className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-8 py-4 text-sm font-black uppercase tracking-wide text-cyan-300"
              >
                Deselect Page
              </button>

              <div className="text-sm font-bold text-white/50">
                {records.length} total, {selectedCount} selected
              </div>
            </div>

            <div className="mt-6 rounded-[2rem] border border-cyan-400/20 bg-cyan-400/10 p-6">
              <div className="mb-4 text-sm font-black uppercase tracking-[0.2em] text-cyan-300">
                Bulk Edit Selected Manuals
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <select
                  defaultValue=""
                  onChange={(e) => {
                    bulkUpdate('brand', e.target.value)
                    e.target.value = ''
                  }}
                  className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none"
                >
                  <option value="">Apply Brand To Selected</option>
                  {BRAND_OPTIONS.map((brand) => (
                    <option key={brand} value={brand}>
                      {brand}
                    </option>
                  ))}
                </select>

                <select
                  defaultValue=""
                  onChange={(e) => {
                    bulkUpdate('category', e.target.value)
                    e.target.value = ''
                  }}
                  className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none"
                >
                  <option value="">Apply Category To Selected</option>
                  {CATEGORY_OPTIONS.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>

                <select
                  defaultValue=""
                  onChange={(e) => {
                    bulkUpdate('manual_type', e.target.value)
                    e.target.value = ''
                  }}
                  className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none"
                >
                  <option value="">Apply Manual Type To Selected</option>
                  {MANUAL_TYPE_OPTIONS.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 p-5">
              <button
                type="button"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={page === 1}
                className="rounded-xl border border-white/10 bg-black/30 px-5 py-3 text-sm font-bold text-white disabled:opacity-40"
              >
                Previous
              </button>

              <div className="text-sm font-bold text-white/60">
                Page {page} of {totalPages}, showing {visibleRecords.length} of{' '}
                {records.length}
              </div>

              <button
                type="button"
                onClick={() =>
                  setPage((current) => Math.min(totalPages, current + 1))
                }
                disabled={page === totalPages}
                className="rounded-xl border border-white/10 bg-black/30 px-5 py-3 text-sm font-bold text-white disabled:opacity-40"
              >
                Next
              </button>
            </div>

            <div className="mt-10 grid gap-6">
              {visibleRecords.map((record) => (
                <div
                  key={record.manual_url}
                  className="rounded-[2rem] border border-white/10 bg-white/5 p-6"
                >
                  <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={record.selected}
                        onChange={(e) =>
                          updateRecord(
                            record.manual_url,
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

                  <div className="mb-4 break-all rounded-2xl border border-white/10 bg-black/30 p-4 text-xs text-white/50">
                    {record.manual_url}
                  </div>

                  <div className="grid gap-4 md:grid-cols-4">
                    <select
                      value={record.brand}
                      onChange={(e) =>
                        updateRecord(record.manual_url, 'brand', e.target.value)
                      }
                      className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none"
                    >
                      {BRAND_OPTIONS.map((brand) => (
                        <option key={brand} value={brand}>
                          {brand}
                        </option>
                      ))}
                    </select>

                    <input
                      value={record.model}
                      onChange={(e) =>
                        updateRecord(record.manual_url, 'model', e.target.value)
                      }
                      placeholder="Model"
                      className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none"
                    />

                    <select
                      value={record.category}
                      onChange={(e) =>
                        updateRecord(
                          record.manual_url,
                          'category',
                          e.target.value
                        )
                      }
                      className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none"
                    >
                      {CATEGORY_OPTIONS.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>

                    <select
                      value={record.manual_type}
                      onChange={(e) =>
                        updateRecord(
                          record.manual_url,
                          'manual_type',
                          e.target.value
                        )
                      }
                      className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none"
                    >
                      {MANUAL_TYPE_OPTIONS.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>

                  <textarea
                    value={record.description}
                    onChange={(e) =>
                      updateRecord(
                        record.manual_url,
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