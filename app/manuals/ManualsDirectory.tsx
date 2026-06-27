'use client'
import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'

// Brands with dedicated support pages — selecting them in the dropdown
// navigates directly to the brand's support page.
const SUPPORT_BRAND_ROUTES: Record<string, string> = {
  Tonal: '/manuals/tonal',
}

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
  const searchParams = useSearchParams()
  const router = useRouter()
  const [search, setSearch] = useState(() => searchParams.get('q') || '')
  const [brand, setBrand] = useState(() => searchParams.get('brand') || 'All')
  const [equipmentType, setEquipmentType] = useState('All')
  const [manuals, setManuals] = useState<Manual[]>(() => {
    const q = searchParams.get('q') || ''
    const b = searchParams.get('brand') || 'All'
    return q.trim() !== '' || b !== 'All' ? initialManuals : []
  })
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  // If someone types a support brand name, navigate them to that brand's page
  const searchMatchesSupportBrand = Object.keys(SUPPORT_BRAND_ROUTES).find(
    (b) => search.trim().toLowerCase() === b.toLowerCase()
  )

  useEffect(() => {
    if (searchMatchesSupportBrand) {
      router.push(SUPPORT_BRAND_ROUTES[searchMatchesSupportBrand])
    }
  }, [searchMatchesSupportBrand, router])

  const hasActiveSearch =
    search.trim() !== '' || brand !== 'All' || equipmentType !== 'All'

  useEffect(() => {
    const controller = new AbortController()

    async function runSearch() {
      if (!hasActiveSearch) {
        setManuals([])
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
    setManuals([])
    setErrorMessage('')
  }

  return (
    <>
      {/* ── Dark Search Bar ─────────────────────────────────────────── */}
      <section id="search" className="bg-[#0A0D14] px-6 pb-16 pt-0 lg:px-16">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-3 md:grid-cols-[1fr_190px_190px_auto]">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') setSearch(search.trim()) }}
              placeholder="Search by brand, model, or keyword..."
              className="border border-white/20 bg-white/10 px-5 py-4 text-sm text-white placeholder:text-white/40 outline-none focus:border-cyan-400/60 backdrop-blur-sm transition"
            />
            <select
              value={brand}
              onChange={(e) => {
                const val = e.target.value
                if (SUPPORT_BRAND_ROUTES[val]) {
                  router.push(SUPPORT_BRAND_ROUTES[val])
                } else {
                  setBrand(val)
                }
              }}
              className="border border-white/20 bg-[#0A0D14] px-4 py-4 text-sm text-white/70 outline-none focus:border-cyan-400/60 transition"
            >
              <option value="All">All Brands</option>
              {Object.keys(SUPPORT_BRAND_ROUTES).map((b) => (
                <option key={`support-${b}`} value={b}>{b} — Support</option>
              ))}
              {brands.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
            <select
              value={equipmentType}
              onChange={(e) => setEquipmentType(e.target.value)}
              className="border border-white/20 bg-[#0A0D14] px-4 py-4 text-sm text-white/70 outline-none focus:border-cyan-400/60 transition"
            >
              <option value="All">All Types</option>
              {equipmentTypes.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setSearch(search.trim())}
              className="bg-cyan-400 px-8 text-sm font-black uppercase tracking-[0.15em] text-black transition hover:bg-cyan-300"
            >
              Search
            </button>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="text-xs text-white/40">
              {loading
                ? 'Searching...'
                : hasActiveSearch
                  ? `${manuals.length.toLocaleString()} result${manuals.length === 1 ? '' : 's'} of ${totalManuals.toLocaleString()} manuals`
                  : `${totalManuals.toLocaleString()} manuals in library`}
            </div>
            {hasActiveSearch && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-xs font-bold text-cyan-400 transition hover:text-cyan-300"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ── Light Results Grid ─────────────────────────────────────────── */}
      <section className="bg-slate-50 px-6 py-16 lg:px-16">
        <div className="mx-auto max-w-6xl">

          <div className="mb-10">
            <span className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-400">
              Manual Library
            </span>
            <h2 className="mt-3 text-3xl font-black text-slate-900 md:text-4xl">
              {hasActiveSearch ? 'Search Results' : "Owner's Manuals"}
            </h2>
          </div>

          {errorMessage && (
            <div className="mb-8 border-l-4 border-red-500 bg-red-50 p-4 text-sm text-red-700">
              {errorMessage}
            </div>
          )}

          {!loading && manuals.length === 0 && !hasActiveSearch && (
            <div className="border border-slate-200 bg-white p-16 text-center">
              <span className="text-5xl">🔍</span>
              <h3 className="mt-5 text-2xl font-black text-slate-900">Search the manual library</h3>
              <p className="mt-3 text-slate-500">
                Type a brand or model above, or filter by equipment type to find your manual.
              </p>
            </div>
          )}

          {!loading && manuals.length === 0 && hasActiveSearch && (
            <div className="border border-slate-200 bg-white p-16 text-center">
              <h3 className="text-2xl font-black text-slate-900">No manuals found</h3>
              <p className="mt-3 text-slate-500">
                Try a different search or browse by brand.
              </p>
              <button
                type="button"
                onClick={clearFilters}
                className="mt-6 bg-cyan-400 px-6 py-3 text-sm font-black text-black transition hover:bg-cyan-300"
              >
                Clear Search
              </button>
            </div>
          )}

          {manuals.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {manuals.map((manual) => (
                <Link
                  key={manual.id}
                  href={`/manuals/${manual.slug}`}
                  className="group flex flex-col border border-slate-200 bg-white p-6 transition hover:border-cyan-300 hover:bg-cyan-50"
                >
                  <div className="mb-3">
                    <span className="border border-cyan-200 bg-cyan-50 px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.15em] text-cyan-600 transition group-hover:border-cyan-300 group-hover:bg-cyan-100">
                      {manual.equipment_type || 'Equipment'}
                    </span>
                  </div>
                  <h3 className="flex-1 text-base font-black leading-snug text-slate-900 transition group-hover:text-cyan-700">
                    {manual.model || 'Manual Resource'}
                  </h3>
                  <div className="mt-2 text-sm text-slate-500">{manual.brand}</div>
                  <div className="mt-5 flex items-center gap-3 border-t border-slate-100 pt-4">
                    <span className="text-xs font-bold text-cyan-600 transition group-hover:text-cyan-700">
                      View Details →
                    </span>
                    <a
                      href={`/manuals/${slugify(manual.brand)}/${manual.slug}.pdf`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="ml-auto text-xs font-semibold text-slate-400 transition hover:text-slate-700"
                    >
                      PDF ↗
                    </a>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {manuals.length > 0 && (
            <div className="mt-10 border-t border-slate-200 pt-6 text-center text-sm text-slate-500">
              Showing {manuals.length} of {totalManuals.toLocaleString()} manuals.{' '}
              <button
                type="button"
                onClick={() => window.dispatchEvent(new CustomEvent('open-booking-modal'))}
                className="font-bold text-cyan-600 transition hover:text-cyan-700"
              >
                Need help? Book a technician.
              </button>
            </div>
          )}
        </div>
      </section>
    </>
  )
}
