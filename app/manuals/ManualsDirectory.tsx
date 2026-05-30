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
  const [searched, setSearched] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const hasActiveSearch =
    search.trim() !== '' || brand !== 'All' || equipmentType !== 'All'

  useEffect(() => {
    const controller = new AbortController()

    async function runSearch() {
      if (!hasActiveSearch) {
        setManuals([])
        setSearched(false)
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
        setSearched(true)
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          setErrorMessage('Manual search failed. Please try again.')
        }
      } finally {
        setLoading(false)
      }
    }

    const timer = setTimeout(runSearch, 350)
    return () => { clearTimeout(timer); controller.abort() }
  }, [search, brand, equipmentType, hasActiveSearch])

  function clearFilters() {
    setSearch('')
    setBrand('All')
    setEquipmentType('All')
    setManuals([])
    setSearched(false)
    setErrorMessage('')
  }

  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <div className="mb-10">
        <div className="mb-4 inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-1 text-xs font-black uppercase tracking-[0.25em] text-cyan-300">
          2EZ TEK Manual Library
        </div>
        <h3 className="text-3xl font-black">Find Fitness Equipment Manuals</h3>
        <p className="mt-4 max-w-2xl leading-8 text-white/60">
          Search {totalManuals.toLocaleString()}+ manuals by brand, model, or equipment type.
        </p>
      </div>

      {/* Search filters */}
      <div className="grid gap-4 rounded-[2rem] border border-white/10 bg-white/5 p-6 md:grid-cols-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search model, brand, or keyword..."
          className="rounded-2xl border border-white/10 bg-black/40 px-5 py-4 text-white outline-none placeholder:text-white/40 focus:border-cyan-400/50"
        />
        <select
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
          className="rounded-2xl border border-white/10 bg-black/40 px-5 py-4 text-white outline-none focus:border-cyan-400/50"
        >
          <option value="All" className="bg-[#050B14]">All Brands</option>
          {brands.map((item) => (
            <option key={item} value={item} className="bg-[#050B14]">{item}</option>
          ))}
        </select>
        <select
          value={equipmentType}
          onChange={(e) => setEquipmentType(e.target.value)}
          className="rounded-2xl border border-white/10 bg-black/40 px-5 py-4 text-white outline-none focus:border-cyan-400/50"
        >
          <option value="All" className="bg-[#050B14]">All Equipment Types</option>
          {equipmentTypes.map((item) => (
            <option key={item} value={item} className="bg-[#050B14]">{item}</option>
          ))}
        </select>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-4 text-sm text-white/50">
        <span>
          {loading
            ? 'Searching manuals...'
            : hasActiveSearch
              ? `${manuals.length} result${manuals.length === 1 ? '' : 's'} found`
              : `Search by brand, model, or keyword to find manuals.`}
        </span>
        {hasActiveSearch && (
          <button type="button" onClick={clearFilters} className="font-bold text-cyan-300 transition hover:text-cyan-200">
            Clear Filters
          </button>
        )}
      </div>

      {errorMessage && (
        <div className="mt-6 rounded-2xl border border-red-400/30 bg-red-500/10 p-5 text-sm text-red-200">
          {errorMessage}
        </div>
      )}

      {/* Empty state — no search yet */}
      {!hasActiveSearch && !loading && (
        <div className="mt-16 rounded-[2rem] border border-white/10 bg-white/[0.03] p-16 text-center">
          <div className="text-5xl mb-6">🔍</div>
          <h3 className="text-2xl font-black text-white">Search the Manual Library</h3>
          <p className="mt-4 max-w-md mx-auto text-white/55 leading-7">
            Type a brand name, model, or keyword above to search {totalManuals.toLocaleString()}+ fitness equipment manuals.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {['NordicTrack', 'Life Fitness', 'Precor', 'Bowflex', 'Matrix', 'Technogym'].map((b) => (
              <button
                key={b}
                onClick={() => setBrand(b)}
                className="rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm font-black text-white/60 transition hover:border-cyan-400/30 hover:text-cyan-300"
              >
                {b}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* No results */}
      {!loading && manuals.length === 0 && searched && (
        <div className="mt-10 rounded-[2rem] border border-white/10 bg-white/5 p-12 text-center">
          <h3 className="text-3xl font-black">No manuals found</h3>
          <p className="mt-4 text-white/60">Try another search term, brand, or equipment type.</p>
          <Link href="/contact" className="mt-6 inline-flex rounded-2xl bg-cyan-400 px-6 py-4 text-sm font-black text-black transition hover:bg-cyan-300">
            Request Service Instead
          </Link>
        </div>
      )}

      {/* Results grid */}
      {manuals.length > 0 && (
        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {manuals.map((manual) => (
            <div
              key={manual.id}
              className="group rounded-[2rem] border border-white/10 bg-white/5 p-7 transition duration-300 hover:border-cyan-400/30 hover:bg-cyan-400/[0.03]"
            >
              {manual.brand_logo && (
                <img
                  src={manual.brand_logo}
                  alt={`${manual.brand} logo`}
                  className="mb-5 h-10 max-w-[160px] object-contain opacity-95"
                />
              )}
              <div className="text-xs font-black uppercase tracking-[0.25em] text-cyan-300">
                {manual.equipment_type || 'Fitness Equipment'}
              </div>
              <Link href={`/manuals/${manual.slug}`} className="block">
                <h3 className="mt-5 text-2xl font-black transition duration-300 group-hover:text-cyan-300">
                  {manual.brand || 'Fitness Equipment'}
                </h3>
                <p className="mt-2 text-lg text-white/80">{manual.model || 'Manual Resource'}</p>
              </Link>
              {manual.manual_type && (
                <div className="mt-5 inline-flex rounded-full border border-white/10 bg-black/30 px-4 py-2 text-xs font-black uppercase tracking-wide text-white/60">
                  {manual.manual_type}
                </div>
              )}
              {manual.description && (
                <p className="mt-5 line-clamp-3 leading-7 text-white/60">{manual.description}</p>
              )}
              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href={`/manuals/${slugify(manual.brand)}/${manual.slug}.pdf`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-2xl bg-cyan-400 px-5 py-3 text-sm font-black uppercase tracking-wide text-black transition hover:scale-[1.03]"
                >
                  Open Manual
                </a>
                {manual.slug && (
                  <Link
                    href={`/manuals/${manual.slug}`}
                    className="rounded-2xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-black uppercase tracking-wide text-white transition hover:border-cyan-400/30"
                  >
                    View Details
                  </Link>
                )}
                <Link
                  href="/contact"
                  className="rounded-2xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-black uppercase tracking-wide text-white transition hover:border-cyan-400/30"
                >
                  Need Service?
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
