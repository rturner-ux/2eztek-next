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

const BRAND_OPTIONS = [
  'Sole',
  'TRUE Fitness',
  'Rogue Fitness',
  'Bowflex',
  'NordicTrack',
  'ProForm',
  'Matrix',
  'Precor',
  'Cybex',
  'Technogym',
  'StairMaster',
  'Life Fitness',
  'Body-Solid',
  'Nautilus',
  'Landice',
  'Spirit',
  'Octane',
  'Vision Fitness',
  'Horizon Fitness',
  'Star Trac',
  'Woodway',
  'Freemotion',
  'Peloton',
  'Concept2',
  'Inspire Fitness',
  'Torque Fitness',
  'Hammer Strength',
  'SportsArt',
  'Unknown Brand',
]

const CATEGORY_OPTIONS = [
  'Treadmill',
  'Elliptical',
  'Bike',
  'Recumbent Bike',
  'Upright Bike',
  'Spin Bike',
  'Indoor Cycle',
  'Air Bike',
  'Rower',
  'Climber',
  'Stepper',
  'Strength',
  'Functional Trainer',
  'Cable Machine',
  'Smith Machine',
  'Power Rack',
  'Half Rack',
  'Bench',
  'Home Gym',
  'All In One Gym',
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

function cleanManualUrl(url: string) {
  return url.split('?')[0].trim()
}

function isManualUrl(url: string) {
  const value = url.toLowerCase()

  return (
    value.includes('.pdf') ||
    value.includes('/instructions/') ||
    value.includes('/manuals/') ||
    value.includes('/image/upload/')
  )
}

function detectBrand(input: string) {
  const value = input.toLowerCase()

  for (const brand of BRAND_OPTIONS) {
    if (brand === 'Unknown Brand') continue

    const normalized = brand.toLowerCase()

    if (
      value.includes(normalized) ||
      value.includes(normalized.replace(/\s+/g, '')) ||
      value.includes(normalized.replace(/\s+/g, '-'))
    ) {
      return brand
    }
  }

  if (value.includes('truefitness.com')) {
    return 'TRUE Fitness'
  }

  if (value.includes('soletreadmills.com')) {
    return 'Sole'
  }

  if (value.includes('assets.roguefitness.com')) {
    return 'Rogue Fitness'
  }

  return 'Unknown Brand'
}

function detectCategory(title: string) {
  const value = title.toLowerCase()

  if (value.includes('treadmill')) return 'Treadmill'
  if (value.includes('elliptical')) return 'Elliptical'
  if (value.includes('recumbent')) return 'Recumbent Bike'
  if (value.includes('upright')) return 'Upright Bike'
  if (value.includes('spin')) return 'Spin Bike'
  if (value.includes('cycle')) return 'Indoor Cycle'
  if (value.includes('air bike')) return 'Air Bike'
  if (value.includes('bike')) return 'Bike'
  if (value.includes('rower')) return 'Rower'
  if (value.includes('climber')) return 'Climber'
  if (value.includes('stepper')) return 'Stepper'
  if (value.includes('smith')) return 'Smith Machine'
  if (value.includes('functional trainer')) return 'Functional Trainer'
  if (value.includes('trainer')) return 'Functional Trainer'
  if (value.includes('rack')) return 'Power Rack'
  if (value.includes('bench')) return 'Bench'
  if (value.includes('gym')) return 'Home Gym'
  if (value.includes('strength')) return 'Strength'

  return 'Fitness Equipment'
}

function detectManualType(title: string) {
  const value = title.toLowerCase()

  if (value.includes('service')) return 'Service Manual'
  if (value.includes('parts')) return 'Parts Manual'
  if (value.includes('installation')) return 'Installation Manual'
  if (value.includes('operation')) return 'Operation Manual'
  if (value.includes('assembly')) return 'Assembly Manual'
  if (value.includes('instruction')) return 'Assembly Manual'
  if (value.includes('owner')) return 'Owner Manual'
  if (value.includes('user')) return 'User Manual'

  return 'Manual'
}

function getTitleFromUrl(url: string) {
  const fileName = decodeURIComponent(url.split('/').pop() || '')
    .replace(/\.pdf$/i, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  return fileName || 'Equipment Manual'
}

function cleanModel(title: string, brand: string) {
  return title
    .replace(new RegExp(brand, 'gi'), '')
    .replace(/owners?/gi, '')
    .replace(/owner'?s/gi, '')
    .replace(/user/gi, '')
    .replace(/manual/gi, '')
    .replace(/assembly/gi, '')
    .replace(/guide/gi, '')
    .replace(/instructions?/gi, '')
    .replace(/installation/gi, '')
    .replace(/operation/gi, '')
    .replace(/online version/gi, '')
    .replace(/print/gi, '')
    .replace(/web/gi, '')
    .replace(/\bpdf\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function buildDescription(record: ImportRecord) {
  return `${record.brand} ${record.model} ${record.category} ${record.manual_type}`
    .replace(/\s+/g, ' ')
    .trim()
}

function parsePdfAnchors(rawHtml: string): ImportRecord[] {
  const html = rawHtml.trim()

  const matches = [
    ...html.matchAll(/href=["'](https?:\/\/[^"']+)["']/gi),
  ]

  const records = matches
    .map((match) => {
      const manualUrl = cleanManualUrl(match[1])

      if (!isManualUrl(manualUrl)) return null

      const title = getTitleFromUrl(manualUrl)

      const brand = detectBrand(`${manualUrl} ${title}`)

      const category = detectCategory(title)

      const manualType = detectManualType(title)

      const model = cleanModel(title, brand)

      const record: ImportRecord = {
        selected: true,
        title,
        brand,
        model,
        category,
        manual_type: manualType,
        manual_url: manualUrl,
        description: '',
      }

      record.description = buildDescription(record)

      return record
    })
    .filter(Boolean) as ImportRecord[]

  return records.filter(
    (record, index, list) =>
      index ===
      list.findIndex(
        (item) => item.manual_url === record.manual_url
      )
  )
}

export default function ManualImportPage() {
  const [pastedData, setPastedData] = useState('')
  const [records, setRecords] = useState<ImportRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const selectedCount = useMemo(
    () => records.filter((record) => record.selected).length,
    [records]
  )

  async function scanPastedData() {
    if (!pastedData.trim()) {
      setMessage('Paste manufacturer HTML first.')
      return
    }

    setLoading(true)
    setMessage('Parsing manuals...')

    try {
      const parsed = parsePdfAnchors(pastedData)

      setRecords(parsed)

      setMessage(`${parsed.length} manuals parsed.`)
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
      current.map((record, recordIndex) => {
        if (recordIndex !== index) return record

        const updated = {
          ...record,
          [field]: value,
        }

        updated.description = buildDescription(updated)

        return updated
      })
    )
  }

  function bulkUpdate(
    field: keyof ImportRecord,
    value: string
  ) {
    if (!value) return

    setRecords((current) =>
      current.map((record) => {
        if (!record.selected) return record

        const updated = {
          ...record,
          [field]: value,
        }

        updated.description = buildDescription(updated)

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

          <h1 className="text-5xl font-black">
            Import Equipment Manuals
          </h1>

          <p className="mt-4 max-w-4xl text-lg leading-8 text-white/60">
            Paste manufacturer HTML and automatically extract
            manuals, brands, models, equipment types, and
            manual classifications before importing.
          </p>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8">
          <h2 className="mb-6 text-2xl font-black">
            Paste Manufacturer HTML
          </h2>

          <textarea
            value={pastedData}
            onChange={(e) => setPastedData(e.target.value)}
            placeholder="Paste manufacturer HTML containing manual links..."
            className="min-h-[280px] w-full rounded-2xl border border-white/10 bg-black/30 px-5 py-4 text-sm text-white outline-none"
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

              <div className="text-sm font-bold text-white/50">
                {records.length} total record(s), {selectedCount}{' '}
                selected
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
                  <option value="" className="bg-[#050B14]">
                    Apply Brand To Selected
                  </option>

                  {BRAND_OPTIONS.map((brand) => (
                    <option
                      key={brand}
                      value={brand}
                      className="bg-[#050B14]"
                    >
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
                  <option value="" className="bg-[#050B14]">
                    Apply Category To Selected
                  </option>

                  {CATEGORY_OPTIONS.map((category) => (
                    <option
                      key={category}
                      value={category}
                      className="bg-[#050B14]"
                    >
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
                  <option value="" className="bg-[#050B14]">
                    Apply Manual Type To Selected
                  </option>

                  {MANUAL_TYPE_OPTIONS.map((type) => (
                    <option
                      key={type}
                      value={type}
                      className="bg-[#050B14]"
                    >
                      {type}
                    </option>
                  ))}
                </select>
              </div>
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

                  <div className="mb-4 break-all rounded-2xl border border-white/10 bg-black/30 p-4 text-xs text-white/50">
                    {record.manual_url}
                  </div>

                  <div className="grid gap-4 md:grid-cols-4">
                    <select
                      value={record.brand}
                      onChange={(e) =>
                        updateRecord(
                          index,
                          'brand',
                          e.target.value
                        )
                      }
                      className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none"
                    >
                      {BRAND_OPTIONS.map((brand) => (
                        <option
                          key={brand}
                          value={brand}
                          className="bg-[#050B14]"
                        >
                          {brand}
                        </option>
                      ))}
                    </select>

                    <input
                      value={record.model}
                      onChange={(e) =>
                        updateRecord(
                          index,
                          'model',
                          e.target.value
                        )
                      }
                      placeholder="Model"
                      className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none"
                    />

                    <select
                      value={record.category}
                      onChange={(e) =>
                        updateRecord(
                          index,
                          'category',
                          e.target.value
                        )
                      }
                      className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none"
                    >
                      {CATEGORY_OPTIONS.map((category) => (
                        <option
                          key={category}
                          value={category}
                          className="bg-[#050B14]"
                        >
                          {category}
                        </option>
                      ))}
                    </select>

                    <select
                      value={record.manual_type}
                      onChange={(e) =>
                        updateRecord(
                          index,
                          'manual_type',
                          e.target.value
                        )
                      }
                      className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none"
                    >
                      {MANUAL_TYPE_OPTIONS.map((type) => (
                        <option
                          key={type}
                          value={type}
                          className="bg-[#050B14]"
                        >
                          {type}
                        </option>
                      ))}
                    </select>
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