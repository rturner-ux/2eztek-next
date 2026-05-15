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

function normalize(value: string | null | undefined) {
  return String(value || '')
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '')
}

function slugify(value: string | null | undefined) {
  return String(value || '')
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

function searchableText(manual: Manual) {
  return [
    manual.brand,
    manual.model,
    manual.slug,
    manual.equipment_type,
    manual.manual_type,
    manual.description,
    manual.manual_url,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
}

function getBrandAlias(brand: string) {
  const normalized = normalize(brand)

  const aliases: Record<string, string[]> = {
    lifefitness: ['lifefitness', 'life-fitness'],
    truefitness: ['truefitness', 'true-fitness', 'true'],
    bodysolid: ['bodysolid', 'body-solid'],
    dynamicfluidfitness: ['dynamicfluidfitness', 'dynamic-fluid-fitness'],
    expressofitness: ['expressofitness', 'expresso-fitness'],
    freemotion: ['freemotion', 'free-motion'],
    frenchfitness: ['frenchfitness', 'french-fitness'],
    hammerstrength: ['hammerstrength', 'hammer-strength'],
    jacobsladder: ['jacobsladder', 'jacobs-ladder'],
    marpokinetics: ['marpokinetics', 'marpo-kinetics'],
    octanefitness: ['octanefitness', 'octane-fitness'],
    powerplate: ['powerplate', 'power-plate'],
    startrac: ['startrac', 'star-trac'],
    totalgym: ['totalgym', 'total-gym'],
    woodwayusa: ['woodwayusa', 'woodway'],
  }

  return aliases[normalized] || [normalized]
}

function detectBrandFromSlug(slug: string) {
  const brandMap: Record<string, string> = {
    rogue: 'Rogue',
    precor: 'Precor',
    matrix: 'Matrix',
    'life-fitness': 'Life Fitness',
    'body-solid': 'Body-Solid',
    bowflex: 'Bowflex',
    cybex: 'Cybex',
    freemotion: 'FreeMotion',
    'free-motion': 'FreeMotion',
    'french-fitness': 'French Fitness',
    technogym: 'Technogym',
    schwinn: 'Schwinn',
    stairmaster: 'Stairmaster',
    'star-trac': 'Star Trac',
    sportsart: 'SportsArt',
    scifit: 'SciFit',
    'true-fitness': 'True Fitness',
    woodway: 'Woodway USA',
    nordictrack: 'NordicTrack',
    proform: 'ProForm',
    nautilus: 'Nautilus',
    octane: 'Octane Fitness',
    versaclimber: 'VersaClimber',
    throwdown: 'Throwdown',
    marpo: 'Marpo Kinetics',
    biodex: 'Biodex',
    jacobs: 'Jacobs Ladder',
    hammer: 'Hammer Strength',
  }

  const normalized = slugify(slug)

  for (const [key, value] of Object.entries(brandMap)) {
    if (
      normalized.startsWith(key) ||
      normalized.includes(`${key}-`)
    ) {
      return value
    }
  }

  return 'Fitness Equipment'
}

function buildBrandedManualUrl(manual: Manual) {
  const resolvedBrand =
    manual.brand &&
    manual.brand !== 'Unknown Brand'
      ? manual.brand
      : detectBrandFromSlug(manual.slug)

  const brandSlug = slugify(resolvedBrand)

  const manualSlug = slugify(manual.slug)
    .replace(/-pdf$/i, '')
    .replace(/\.pdf$/i, '')

  return `/manuals/${brandSlug}/${manualSlug}.pdf`
}

export default function ManualsDirectory({
  manuals,
}: {
  manuals: Manual[]
}) {
  const [search, setSearch] = useState('')
  const [brand, setBrand] = useState('All')
  const [equipmentType, setEquipmentType] = useState('All')

  const brandOptions = useMemo(() => {
    const uniqueBrands = manuals
      .map((manual) =>
        manual.brand &&
        manual.brand !== 'Unknown Brand'
          ? manual.brand
          : detectBrandFromSlug(manual.slug || '')
      )
      .filter(Boolean)
      .map((item) => item.trim())

    return ['All', ...Array.from(new Set(uniqueBrands)).sort()]
  }, [manuals])

  const equipmentTypes = useMemo(() => {
    const uniqueTypes = manuals
      .map((manual) => manual.equipment_type)
      .filter(Boolean)
      .map((item) => item.trim())

    return ['All', ...Array.from(new Set(uniqueTypes)).sort()]
  }, [manuals])

  const hasActiveSearch =
    search.trim() !== '' ||
    brand !== 'All' ||
    equipmentType !== 'All'

  const filtered = useMemo(() => {
    if (!hasActiveSearch) return []

    const cleanSearch = search.trim().toLowerCase()
    const brandAliases = getBrandAlias(brand)

    return manuals.filter((manual) => {
      const haystack = searchableText(manual)

      const normalizedManualBrand = normalize(
        manual.brand &&
          manual.brand !== 'Unknown Brand'
          ? manual.brand
          : detectBrandFromSlug(manual.slug || '')
      )

      const normalizedManualSlug = normalize(manual.slug)
      const normalizedManualUrl = normalize(manual.manual_url)
      const normalizedManualDescription = normalize(manual.description)
      const normalizedManualModel = normalize(manual.model)

      const matchesSearch =
        cleanSearch === '' ||
        haystack.includes(cleanSearch)

      const matchesBrand =
        brand === 'All' ||
        brandAliases.some((alias) => {
          const cleanAlias = normalize(alias)

          return (
            normalizedManualBrand === cleanAlias ||
            normalizedManualBrand.includes(cleanAlias) ||
            normalizedManualSlug.startsWith(cleanAlias) ||
            normalizedManualSlug.includes(cleanAlias) ||
            normalizedManualUrl.includes(cleanAlias) ||
            normalizedManualDescription.includes(cleanAlias) ||
            normalizedManualModel.includes(cleanAlias)
          )
        })

      const matchesType =
        equipmentType === 'All' ||
        normalize(manual.equipment_type) ===
          normalize(equipmentType)

      return (
        matchesSearch &&
        matchesBrand &&
        matchesType
      )
    })
  }, [
    manuals,
    search,
    brand,
    equipmentType,
    hasActiveSearch,
  ])

  function clearFilters() {
    setSearch('')
    setBrand('All')
    setEquipmentType('All')
  }

  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <div className="mb-10">
        <div className="mb-4 inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-1 text-xs font-black uppercase tracking-[0.25em] text-cyan-300">
          2EZ TEK Manual Library
        </div>
          <h3 className="text-3xl font-black">
            Find Fitness Equipment Manuals
          </h3>

          <p className="mx-auto mt-4 max-w-2xl leading-8 text-white/60">
            Search by brand, model, or equipment type to find owner manuals,
            assembly guides, service documents, and troubleshooting resources.
            Need hands-on help? 2EZ TEK can assist with repair, assembly,
            diagnostics, and preventative maintenance.
          </p>
      </div>

      <div className="grid gap-4 rounded-[2rem] border border-white/10 bg-white/5 p-6 md:grid-cols-3">
        <input
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          placeholder="Search model, brand, or keyword..."
          className="rounded-2xl border border-white/10 bg-black/40 px-5 py-4 text-white outline-none placeholder:text-white/40 focus:border-cyan-400/50"
        />

        <select
          value={brand}
          onChange={(event) =>
            setBrand(event.target.value)
          }
          className="rounded-2xl border border-white/10 bg-black/40 px-5 py-4 text-white outline-none focus:border-cyan-400/50"
        >
          {brandOptions.map((item) => (
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
                filtered.length === 1
                  ? ''
                  : 's'
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
            Search by brand, model, or equipment type to find owner manuals,
            assembly guides, service documents, and troubleshooting resources.
            Need hands-on help? 2EZ TEK can assist with repair, assembly, and maintenance.
          </p>
        </div>
      )}

      {hasActiveSearch &&
        filtered.length > 0 && (
          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((manual) => {
              const resolvedBrand =
                manual.brand &&
                manual.brand !== 'Unknown Brand'
                  ? manual.brand
                  : detectBrandFromSlug(
                      manual.slug || ''
                    )

              return (
                <div
                  key={manual.id}
                  className="group rounded-[2rem] border border-white/10 bg-white/5 p-7 transition duration-300 hover:border-cyan-400/30 hover:bg-cyan-400/[0.03]"
                >
                  {manual.brand_logo && (
                    <img
                      src={manual.brand_logo}
                      alt={`${resolvedBrand} logo`}
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
                      {resolvedBrand}
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
                    <a
                      href={buildBrandedManualUrl(
                        manual
                      )}
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
              )
            })}
          </div>
        )}

      {hasActiveSearch &&
        filtered.length === 0 && (
          <div className="mt-10 rounded-[2rem] border border-white/10 bg-white/5 p-12 text-center">
            <h3 className="text-3xl font-black">
              No manuals found
            </h3>

            <p className="mt-4 text-white/60">
              Try another search term,
              brand, or equipment type.
            </p>
          </div>
        )}
    </section>
  )
}