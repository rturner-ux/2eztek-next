'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

type Manual = {
  id: string
  brand: string
  brand_logo: string
  model: string
  slug: string
  equipment_type: string
  manual_url: string
  manual_type: string | null
  description: string | null
  created_at: string | null
}

type Props = {
  initialManuals: Manual[]
  brands: string[]
  equipmentTypes: string[]
  totalManuals: number
}

function slugify(value: string | null | undefined) {
  return String(value || '')
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

export default function ManualsDirectory({
  initialManuals,
  brands,
  equipmentTypes,
  totalManuals,
}: Props) {
  const [search, setSearch] = useState('')
  const [brand, setBrand] = useState('All')
  const [equipmentType, setEquipmentType] = useState('All')
  const [manuals, setManuals] = useState<Manual[]>(initialManuals)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const hasActiveSearch =
    search.trim() !== '' || brand !== 'All' || equipmentType !== 'All'

  useEffect(() => {
    const controller = new AbortController()

    async function runSearch() {
      if (!hasActiveSearch) {
        setManuals(initialManuals)
        return
      }

      try {
        setLoading(true)
        setErrorMessage('')

        const response = await fetch('/api/manuals/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({ search, brand, equipmentType, limit: 50 }),
        })

        const result = await response.json()

        if (!response.ok || !result.success) {
          throw new Error(result.message || 'Search failed.')
        }

        setManuals(result.manuals || [])
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          setErrorMessage('Manual search failed. Please try again.')
        }
      } finally {
        setLoading(false)
      }
    }

    const timer = setTimeout(runSearch, 350)
    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [search, brand, equipmentType, hasActiveSearch, initialManuals])

  function clearFilters() {
    setSearch('')
    setBrand('All')
    setEquipmentType('All')
    setManuals(initialManuals)
    setErrorMessage('')
  }

  function manualYear(manual: Manual) {
    if (!manual.created_at) return '-'
    const year = new Date(manual.created_at).getFullYear()
    return Number.isFinite(year) ? String(year) : '-'
  }

  return (
    <section className="bg-[#050B14]">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid overflow-hidden border border-white/10 lg:grid-cols-[300px_1fr]">
          <aside className="bg-[#07101D] p-5 lg:p-8">
            <div className="mb-7">
              <label className="text-sm font-black text-white">
                Brand
              </label>
              <select
                value={brand}
                onChange={(event) => setBrand(event.target.value)}
                className="mt-2 w-full border border-white/15 bg-[#050B14] px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
              >
                <option value="All">Select One</option>
                {brands.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-black text-white">
                Category
              </label>
              <select
                value={equipmentType}
                onChange={(event) => setEquipmentType(event.target.value)}
                className="mt-2 w-full border border-white/15 bg-[#050B14] px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
              >
                <option value="All">Select One</option>
                {equipmentTypes.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </div>
          </aside>

          <div className="bg-[#0B1220] p-5 lg:p-8">
            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="text-xs font-black uppercase tracking-[0.22em] text-cyan-300">
                  2EZ TEK Manual Library
                </div>
                <h3 className="mt-2 text-2xl font-black text-white">
                  Owner&apos;s Manuals
                </h3>
              </div>
              {hasActiveSearch && (
                <button type="button" onClick={clearFilters} className="text-sm font-bold text-cyan-300 transition hover:text-cyan-200">
                  Clear Filters
                </button>
              )}
            </div>

            <div className="mb-4 grid gap-3 md:grid-cols-[1fr_auto]">
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by keyword"
                className="border border-white/15 bg-[#050B14] px-4 py-3 text-white outline-none placeholder:text-white/40 focus:border-cyan-400"
              />
              <button
                type="button"
                onClick={() => setSearch(search.trim())}
                className="bg-cyan-400 px-7 py-3 text-sm font-black text-black transition hover:bg-cyan-300"
              >
                Search
              </button>
            </div>

            <div className="py-2 text-sm font-black text-white">
              {loading
                ? 'Searching manuals...'
                : `${manuals.length} item${manuals.length === 1 ? '' : 's'}`}
              <span className="ml-2 font-normal text-white/45">
                of {totalManuals.toLocaleString()} available
              </span>
            </div>

            {errorMessage && (
              <div className="mt-4 border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-200">
                {errorMessage}
              </div>
            )}

            {!loading && manuals.length === 0 && (
              <div className="mt-6 border border-white/10 bg-[#050B14] p-10 text-center">
                <h3 className="text-2xl font-black">No manuals found</h3>
                <p className="mt-3 text-white/60">Try another search term, brand, or category.</p>
                <button type="button" onClick={() => window.dispatchEvent(new CustomEvent('open-booking-modal'))} className="mt-6 inline-flex bg-cyan-400 px-6 py-3 text-sm font-black text-black transition hover:bg-cyan-300">
                  Request Service Instead
                </button>
              </div>
            )}

            {manuals.length > 0 && (
              <div className="mt-2 overflow-hidden border border-white/10 bg-[#050B14]">
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead className="bg-white/10 text-sm text-white">
                      <tr>
                        <th className="px-4 py-3 font-black">Model</th>
                        <th className="px-4 py-3 font-black">Brand</th>
                        <th className="px-4 py-3 font-black">Category</th>
                        <th className="px-4 py-3 font-black">Year</th>
                        <th className="px-4 py-3 font-black">Documents</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10 bg-[#07101D]">
                      {manuals.map((manual) => (
                        <tr key={manual.id}>
                          <td className="px-4 py-3">
                            <Link href={`/manuals/${manual.slug}`} className="font-bold text-white transition hover:text-cyan-300">
                              {manual.model || 'Manual Resource'}
                            </Link>
                            {manual.manual_type && (
                              <span className="mt-1 block text-xs text-white/45">
                                {manual.manual_type}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-white/70">
                            {manual.brand || 'Fitness Equipment'}
                          </td>
                          <td className="px-4 py-3 text-white/70">
                            {manual.equipment_type || 'Fitness Equipment'}
                          </td>
                          <td className="px-4 py-3 text-white/60">{manualYear(manual)}</td>
                          <td className="px-4 py-3">
                            <a
                              href={`/manuals/${slugify(manual.brand)}/${manual.slug}.pdf`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block p-0 text-left font-bold text-cyan-300 transition hover:text-cyan-200"
                            >
                              Owner&apos;s Guide
                            </a>
                            <Link
                              href={`/manuals/${manual.slug}`}
                              className="mt-1 block text-xs font-bold text-white/45 transition hover:text-white"
                            >
                              Details
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="border-t border-white/10 p-4 text-center">
                  <button
                    type="button"
                    className="border border-white/25 px-6 py-2 text-sm font-bold text-white/75 transition hover:border-cyan-400 hover:text-cyan-300"
                  >
                    Showing First {manuals.length}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
