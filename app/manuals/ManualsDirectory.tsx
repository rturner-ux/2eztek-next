'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'

type Manual = {
  id: string
  brand: string
  model: string
  equipment_type: string
  manual_url: string
  manual_type: string | null
  description: string | null
  created_at: string | null
}

export default function ManualsDirectory({ manuals }: { manuals: Manual[] }) {
  const [search, setSearch] = useState('')
  const [brand, setBrand] = useState('All')
  const [equipmentType, setEquipmentType] = useState('All')

  const brands = useMemo(() => {
    const uniqueBrands = manuals
      .map((manual) => manual.brand)
      .filter(Boolean)

    return ['All', ...Array.from(new Set(uniqueBrands)).sort()]
  }, [manuals])

  const equipmentTypes = useMemo(() => {
    const uniqueTypes = manuals
      .map((manual) => manual.equipment_type)
      .filter(Boolean)

    return ['All', ...Array.from(new Set(uniqueTypes)).sort()]
  }, [manuals])

  const hasActiveSearch =
    search.trim() !== '' || brand !== 'All' || equipmentType !== 'All'

  const filtered = hasActiveSearch
    ? manuals.filter((manual) => {
        const haystack = [
          manual.brand,
          manual.model,
          manual.equipment_type,
          manual.manual_type,
          manual.description,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()

        const matchesSearch = haystack.includes(search.trim().toLowerCase())
        const matchesBrand = brand === 'All' || manual.brand === brand
        const matchesType =
          equipmentType === 'All' || manual.equipment_type === equipmentType

        return matchesSearch && matchesBrand && matchesType
      })
    : []

  function clearFilters() {
    setSearch('')
    setBrand('All')
    setEquipmentType('All')
  }

  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <div className="mb-10">
        <h2 className="text-4xl font-black">Search Equipment Manuals</h2>

        <p className="mt-4 max-w-3xl text-white/60">
          Search by brand, model, or equipment type to find manuals, assembly
          references, and repair resources.
        </p>
      </div>

      <div className="grid gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 md:grid-cols-3">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search brand or model..."
          className="rounded-2xl border border-white/10 bg-black/40 px-4 py-4 text-white outline-none placeholder:text-white/40 focus:border-cyan-400/50"
        />

        <select
          value={brand}
          onChange={(event) => setBrand(event.target.value)}
          className="rounded-2xl border border-white/10 bg-black/40 px-4 py-4 text-white outline-none focus:border-cyan-400/50"
        >
          {brands.map((item) => (
            <option key={item} value={item} className="bg-[#050B14]">
              {item === 'All' ? 'All Brands' : item}
            </option>
          ))}
        </select>

        <select
          value={equipmentType}
          onChange={(event) => setEquipmentType(event.target.value)}
          className="rounded-2xl border border-white/10 bg-black/40 px-4 py-4 text-white outline-none focus:border-cyan-400/50"
        >
          {equipmentTypes.map((item) => (
            <option key={item} value={item} className="bg-[#050B14]">
              {item === 'All' ? 'All Equipment Types' : item}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-5 flex items-center justify-between gap-4 text-sm text-white/50">
        <span>
          {hasActiveSearch
            ? `${filtered.length} manual${filtered.length === 1 ? '' : 's'} found`
            : 'Select a brand, equipment type, or search to view manuals.'}
        </span>

        {hasActiveSearch && (
          <button
            type="button"
            onClick={clearFilters}
            className="font-bold text-cyan-300 hover:text-cyan-200"
          >
            Clear filters
          </button>
        )}
      </div>

      {!hasActiveSearch && (
        <div className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-10 text-center">
          <h3 className="text-2xl font-black">Search or select a filter</h3>

          <p className="mx-auto mt-3 max-w-2xl text-white/60">
            Manuals are hidden until you search or choose a filter. Enter a
            brand, model, or equipment type to view available manuals.
          </p>
        </div>
      )}

      {hasActiveSearch && filtered.length > 0 && (
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((manual) => (
            <div
              key={manual.id}
              className="rounded-3xl border border-white/10 bg-white/5 p-7"
            >
              <div className="text-xs font-black uppercase tracking-[0.25em] text-cyan-300">
                {manual.equipment_type || 'Fitness Equipment'}
              </div>

              <h3 className="mt-4 text-2xl font-black">
                {manual.brand || 'Unknown Brand'}
              </h3>

              <p className="mt-2 text-lg text-white/80">
                {manual.model || 'Manual Resource'}
              </p>

              {manual.description && (
                <p className="mt-4 leading-7 text-white/60">
                  {manual.description}
                </p>
              )}

              <div className="mt-8 flex flex-wrap gap-3">
                {manual.manual_url && (
                  <a
                    href={manual.manual_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-2xl bg-cyan-400 px-5 py-3 text-sm font-black uppercase tracking-wide text-black"
                  >
                    Open Manual
                  </a>
                )}

                <Link
                  href="/request-service"
                  className="rounded-2xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-black uppercase tracking-wide text-white"
                >
                  Need Service?
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {hasActiveSearch && filtered.length === 0 && (
        <div className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-10 text-center">
          <h3 className="text-2xl font-black">No manuals found</h3>

          <p className="mt-3 text-white/60">
            Try another brand, model, or equipment type.
          </p>
        </div>
      )}
    </section>
  )
}