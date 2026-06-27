'use client'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

// Brands with dedicated support pages — show native content inline
// instead of manual PDF search results when selected.
const SUPPORT_BRANDS = ['Tonal']

const TONAL_CATEGORIES = [
  { icon: '🔧', title: 'Accessories Troubleshooting', items: ['Smart handles not registering weight', 'Rope attachment slipping or detaching', 'Bar accessory connection issues', 'Accessory pairing reset procedure'] },
  { icon: '👤', title: 'Account & Membership', items: ['Reset your Tonal password', 'Manage membership or billing', 'Add or switch profiles on device', 'Link account to the Tonal app'] },
  { icon: '📱', title: 'Integrations & External Apps', items: ['Connect to Apple Health or Google Fit', 'Strava and Garmin sync setup', 'AirPods pairing issues', 'Bluetooth audio troubleshooting'] },
  { icon: '⚠️', title: 'Error Messages', items: ['Cable tension error at startup', 'Arm calibration failure codes', 'Weight limit exceeded warnings', 'Screen unresponsive after error'] },
  { icon: '🔌', title: 'Cable Walk-Out', items: ['How to perform a cable walk-out', 'Cable re-seating after a jam', 'Walk-out required at startup', 'Preventing future cable jams'] },
  { icon: '📷', title: 'Tonal 2 Camera', items: ['Camera not detecting movement', 'Form feedback not activating', 'Camera lens cleaning and care', 'Privacy settings for the camera'] },
  { icon: '📺', title: 'Smart View', items: ['Smart View mirror mode setup', 'Display not mirroring correctly', 'Smart View lag or connection drops'] },
  { icon: '⬇️', title: 'Software & Firmware Updates', items: ['Checking current software version', 'How to trigger a manual update', 'Update stuck or failed mid-install'] },
  { icon: '📶', title: 'WiFi', items: ['Tonal not connecting to WiFi', 'Connect to a captive portal network', 'Weak signal and connection drops', 'Switching to a new router'] },
  { icon: '🔋', title: 'Arm Batteries', items: ['How to change Tonal arm batteries', 'Battery type and replacement interval', 'Arms not responding after battery swap'] },
  { icon: '🔄', title: 'Arm Rotation', items: ['How to troubleshoot arm rotation', 'Arms stuck or not rotating freely', 'Re-calibrating arm position sensors'] },
  { icon: '🔦', title: 'Power & Startup', items: ["Tonal will not turn on", 'Power cycle and reset procedure', 'Checking wall outlet and power cord'] },
  { icon: '✖️', title: 'Cross-Linked Arms', items: ['How to troubleshoot cross-linked arms', 'Arms reading reversed weights', 'Re-pairing left and right arms after error'] },
  { icon: '📲', title: 'App & Data', items: ['How to reset app data on Tonal', 'Sync issues between device and app', 'Workout history not showing'] },
  { icon: '🆔', title: 'Device ID & General', items: ['Locating your Tonal Device ID', 'General troubleshooting steps', 'Factory reset your Tonal'] },
]

const SUPPORT_CONTENT: Record<string, { title: string; description: string; categories: { icon: string; title: string; items: string[] }[] }> = {
  Tonal: {
    title: 'Tonal Troubleshooting & Support',
    description: 'Guides for Tonal error messages, cable walk-out, cross-linked arms, WiFi issues, software updates, arm batteries, and more.',
    categories: TONAL_CATEGORIES,
  },
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
              onChange={(e) => setBrand(e.target.value)}
              className="border border-white/20 bg-[#0A0D14] px-4 py-4 text-sm text-white/70 outline-none focus:border-cyan-400/60 transition"
            >
              <option value="All">All Brands</option>
              {SUPPORT_BRANDS.map((b) => (
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

      {/* ── Native Support Brand Panel ───────────────────────────────── */}
      {SUPPORT_CONTENT[brand as keyof typeof SUPPORT_CONTENT] && (() => {
        const support = SUPPORT_CONTENT[brand as keyof typeof SUPPORT_CONTENT]
        return (
          <section className="bg-[#050B14] px-6 py-16 lg:px-16">
            <div className="mx-auto max-w-6xl">
              <div className="mb-10">
                <span className="text-[10px] font-black uppercase tracking-[0.35em] text-cyan-400/60">
                  {brand} Resource Center
                </span>
                <h2 className="mt-3 text-3xl font-black text-white md:text-4xl">
                  {support.title}
                </h2>
                <p className="mt-3 text-white/60">{support.description}</p>
              </div>
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {support.categories.map((cat) => (
                  <div
                    key={cat.title}
                    className="rounded-xl border border-white/10 bg-white/5 p-6 transition hover:border-cyan-400/30 hover:bg-white/[0.07]"
                  >
                    <div className="mb-3 flex items-center gap-3">
                      <span className="text-xl">{cat.icon}</span>
                      <h3 className="text-sm font-black text-white">{cat.title}</h3>
                    </div>
                    <ul className="space-y-1.5">
                      {cat.items.map((item) => (
                        <li key={item} className="flex items-start gap-2 text-xs text-white/50">
                          <span className="mt-0.5 flex-shrink-0 text-cyan-400">›</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              <div className="mt-12 rounded-2xl border border-cyan-400/20 bg-cyan-400/5 p-8 text-center">
                <p className="text-sm text-white/70">
                  Still having trouble? 2EZ TEK technicians diagnose and repair {brand} systems across Dallas Fort Worth.
                </p>
                <button
                  type="button"
                  onClick={() => window.dispatchEvent(new CustomEvent('open-booking-modal'))}
                  className="mt-5 bg-cyan-400 px-8 py-3 text-sm font-black uppercase tracking-widest text-black transition hover:bg-cyan-300"
                >
                  Book a Technician
                </button>
              </div>
            </div>
          </section>
        )
      })()}

      {/* ── Light Results Grid (Precor "Our Portfolio" pattern) ─────── */}
      {!SUPPORT_BRANDS.includes(brand) && (
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
      )}
    </>
  )
}
