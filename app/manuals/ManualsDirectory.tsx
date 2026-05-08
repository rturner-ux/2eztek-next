'use client'

import { useMemo, useState } from 'react'
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

export default function ManualsDirectory({
  manuals,
}: {
  manuals: Manual[]
}) {
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
    search.trim() !== '' ||
    brand !== 'All' ||
    equipmentType !== 'All'

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

        const matchesSearch = haystack.includes(
          search.trim().toLowerCase()
        )

        const matchesBrand =
          brand === 'All' || manual.brand === brand

        const matchesType =
          equipmentType === 'All' ||
          manual.equipment_type === equipmentType

        return (
          matchesSearch &&
          matchesBrand &&
          matchesType
        )
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
        <div className="mb-4 inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-1 text-xs font-black uppercase tracking-[0.25em] text-cyan-300">
          SmartGymOps Equipment Library
        </div>

        <h2 className="text-4xl font-black md:text-5xl">
          Search Equipment Manuals
        </h2>

        <p className="mt-4 max-w-4xl text-lg leading-8 text-white/60">
          Search fitness equipment manuals, service documentation,
          exploded diagrams, troubleshooting guides, and assembly
          references by brand, model, or equipment type.
        </p>
      </div>

      <div className="grid gap-4 rounded-[2rem] border border-white/10 bg-white/5 p-6 md:grid-cols-3">
        <input
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          placeholder="Search model or brand..."
          className="rounded-2xl border border-white/10 bg-black/40 px-5 py-4 text-white outline-none placeholder:text-white/40 focus:border-cyan-400/50"
        />

        <select
          value={brand}
          onChange={(event) =>
            setBrand(event.target.value)
          }
          className="rounded-2xl border border-white/10 bg-black/40 px-5 py-4 text-white outline-none focus:border-cyan-400/50"
        >
          {brands.map((item) => (
            <option
              key={item}
              value={item}
              className="bg-[#050B14]"
            >
              {item === 'All'
                ? 'All Brands'
                : item}
            </option>
          ))}
        </select>

        <select
          value={equipmentType}
          onChange={(event) =>
            setEquipmentType(event.target.value)
          }
          className="rounded-2xl border border-white/10 bg-black/40 px-5 py-4 text-white outline-none focus:border-cyan-400/50"
        >
          {equipmentTypes.map((item) => (
            <option
              key={item}
              value={item}
              className="bg-[#050B14]"
            >
              {item === 'All'
                ? 'All Equipment Types'
                : item}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-4 text-sm text-white/50">
        <span>
          {hasActiveSearch
            ? `${filtered.length} manual${
                filtered.length === 1 ? '' : 's'
              } found`
            : 'Search or select filters to view manuals.'}
        </span>

        {hasActiveSearch && (
          <button
            type="button"
            onClick={clearFilters}
            className="font-bold text-cyan-300 transition hover:text-cyan-200"
          >
            Clear Filters
          </button>
        )}
      </div>

      {!hasActiveSearch && (
        <div className="mt-10 rounded-[2rem] border border-white/10 bg-white/5 p-12 text-center">
          <h3 className="text-3xl font-black">
            Search Equipment Manuals
          </h3>

          <p className="mx-auto mt-4 max-w-2xl leading-8 text-white/60">
            Manuals remain hidden until a search or filter is
            selected. Search by brand, model, or equipment type
            to access the SmartGymOps equipment library.
          </p>
        </div>
      )}

      {hasActiveSearch && filtered.length > 0 && (
        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((manual) => (
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
                {manual.equipment_type ||
                  'Fitness Equipment'}
              </div>

              <Link
                href={`/manuals/${manual.slug}`}
                className="block"
              >
                <h3 className="mt-5 text-2xl font-black transition duration-300 group-hover:text-cyan-300">
                  {manual.brand || 'Unknown Brand'}
                </h3>

                <p className="mt-2 text-lg text-white/80">
                  {manual.model ||
                    'Manual Resource'}
                </p>
              </Link>

              {manual.manual_type && (
                <div className="mt-5 inline-flex rounded-full border border-white/10 bg-black/30 px-4 py-2 text-xs font-black uppercase tracking-wide text-white/60">
                  {manual.manual_type}
                </div>
              )}

              {manual.description && (
                <p className="mt-5 leading-7 text-white/60">
                  {manual.description}
                </p>
              )}

              <div className="mt-8 flex flex-wrap gap-3">
                {manual.manual_url && (
                  <a
                    href={`/manual-files/${manual.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-2xl bg-cyan-400 px-5 py-3 text-sm font-black uppercase tracking-wide text-black transition hover:scale-[1.03]"
                  >
                    Open Manual
                  </a>
                )}

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

      {hasActiveSearch && filtered.length === 0 && (
        <div className="mt-10 rounded-[2rem] border border-white/10 bg-white/5 p-12 text-center">
          <h3 className="text-3xl font-black">
            No manuals found
          </h3>

          <p className="mt-4 text-white/60">
            Try another search term, brand, or equipment type.
          </p>
        </div>
      )}
    </section>
  )
}