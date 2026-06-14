import { createClient } from '@supabase/supabase-js'
import { Suspense } from 'react'
import ManualsDirectory from './ManualsDirectory'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Fitness Equipment Manuals & Troubleshooting',
  description:
    'Search fitness equipment manuals, troubleshooting resources, repair guidance, assembly support, preventative maintenance information, videos, and exploded diagrams.',
  alternates: {
    canonical: 'https://www.2eztek.com/manuals',
  },
}

type DirectoryManual = {
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

type ManualRow = {
  id: string
  slug?: string | null
  manual_url?: string | null
  manual_type?: string | null
  description?: string | null
  created_at?: string | null
  equipment_models?: {
    model?: string | null
    brands?: {
      name?: string | null
      logo_url?: string | null
    } | Array<{
      name?: string | null
      logo_url?: string | null
    }> | null
    equipment_categories?: {
      name?: string | null
    } | Array<{
      name?: string | null
    }> | null
  } | Array<{
    model?: string | null
    brands?: {
      name?: string | null
      logo_url?: string | null
    } | Array<{
      name?: string | null
      logo_url?: string | null
    }> | null
    equipment_categories?: {
      name?: string | null
    } | Array<{
      name?: string | null
    }> | null
  }> | null
}

function slugify(value: string) {
  return String(value || '')
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

function cleanText(value: string) {
  return String(value || '')
    .replace(/\.[a-z0-9]+$/i, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function getNested<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] || null
  return value || null
}

function normalizeManual(row: ManualRow): DirectoryManual {
  const modelData = getNested(row.equipment_models)
  const brandData = getNested(modelData?.brands)
  const categoryData = getNested(modelData?.equipment_categories)

  const brand = cleanText(brandData?.name || 'Unknown Brand')
  const model = cleanText(modelData?.model || row.description || 'Manual Resource')
  const equipmentType = cleanText(categoryData?.name || 'Fitness Equipment')
  const slug = row.slug || slugify(`${brand}-${model}-${row.id}`)

  return {
    id: row.id,
    brand,
    brand_logo: brandData?.logo_url || '',
    model,
    slug,
    equipment_type: equipmentType,
    manual_url: row.manual_url || '',
    manual_type: row.manual_type || 'Manual',
    description: row.description || `${brand} ${model} manual and technician reference.`,
    created_at: row.created_at || '',
  }
}

export default async function ManualsPage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [
    { count: totalManuals },
    { data: brandData },
    { data: categoryData },
    { data: manualData },
  ] =
    await Promise.all([
      supabase
        .from('equipment_manuals_v2')
        .select('*', { count: 'exact', head: true }),

      supabase
        .from('brands')
        .select('name')
        .order('name', { ascending: true }),

      supabase
        .from('equipment_categories')
        .select('name')
        .order('name', { ascending: true }),

      supabase
        .from('equipment_manuals_v2')
        .select(`
          id,
          slug,
          manual_url,
          manual_type,
          description,
          created_at,
          equipment_models (
            model,
            brands ( name, logo_url ),
            equipment_categories ( name )
          )
        `)
        .order('created_at', { ascending: false })
        .limit(25),
    ])

  const brands = Array.from(
    new Set((brandData || []).map((item) => item.name).filter(Boolean))
  ).sort()

  const equipmentTypes = Array.from(
    new Set((categoryData || []).map((item) => item.name).filter(Boolean))
  ).sort()

  return (
    <main className="min-h-screen bg-white text-slate-900">

      {/* ── Full-Bleed Hero ─────────────────────────────────────────── */}
      <section className="relative min-h-screen overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/optimized-om_image.jpg"
          alt="Fitness equipment owner's manuals"
          className="absolute inset-0 h-full w-full object-cover"
          fetchPriority="high"
          loading="eager"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.58)_0%,rgba(0,0,0,0.22)_55%,transparent_100%)]" />

        <div className="relative z-10 flex min-h-screen flex-col justify-center px-6 pt-36 pb-16 lg:px-16 lg:pt-44">
          <div className="grid w-full items-center gap-10 lg:grid-cols-[1fr_auto]">

            {/* Left — text */}
            <div className="max-w-xl">
              <div className="mb-5 flex items-center gap-3">
                <span className="h-px w-8 bg-cyan-400" />
                <span className="text-[10px] font-black uppercase tracking-[0.35em] text-cyan-300">
                  Manuals &amp; Resources
                </span>
              </div>

              <h1 className="text-3xl font-black leading-tight text-white md:text-5xl lg:text-[3.25rem]">
                Fitness Equipment
                <span className="block text-cyan-400">Owner&apos;s Manuals</span>
              </h1>

              <p className="mt-4 max-w-md text-base leading-relaxed text-white/80">
                Search owner&apos;s guides, service manuals, troubleshooting resources, and technical documentation across {brands.length}+ brands.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-10">
                {[
                  { stat: totalManuals?.toLocaleString() || '3,900+', label: 'Manuals' },
                  { stat: String(brands.length) + '+', label: 'Brands' },
                  { stat: String(equipmentTypes.length), label: 'Equipment Types' },
                ].map(({ stat, label }) => (
                  <div key={label}>
                    <div className="text-2xl font-black text-white md:text-3xl">{stat}</div>
                    <div className="mt-1 text-[10px] font-black uppercase tracking-[0.25em] text-white/60">{label}</div>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex flex-wrap gap-4">
                <a
                  href="#search"
                  className="bg-cyan-400 px-7 py-3 text-[11px] font-bold uppercase tracking-[0.15em] text-black transition-colors hover:bg-cyan-300"
                >
                  Search Library
                </a>
                <a
                  href="tel:9728077232"
                  className="border border-white/30 bg-white/10 px-7 py-3 text-[11px] font-bold uppercase tracking-[0.15em] text-white backdrop-blur-sm transition-colors hover:bg-white/20"
                >
                  (972) 807-7232
                </a>
              </div>
            </div>

            {/* Right — 3D logo, mix-blend-screen drops the black bg */}
            <div className="hidden lg:flex lg:items-center lg:justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/3d-logo.png"
                alt="2EZ TEK"
                className="w-72 mix-blend-screen xl:w-80"
              />
            </div>

          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 z-20 -translate-x-1/2 flex flex-col items-center gap-2">
          <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/40">Scroll</span>
          <div className="h-4 w-px bg-white/30" />
        </div>
      </section>

      {/* ── Dark Info Section (Precor "What Sets Us Apart" pattern) ── */}
      <section className="bg-[#0A0D14] px-6 py-24 text-white lg:px-16">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 text-center">
            <span className="text-[10px] font-black uppercase tracking-[0.35em] text-cyan-400">
              What&apos;s In The Library
            </span>
          </div>
          <h2 className="text-center text-3xl font-black leading-tight text-white md:text-4xl">
            SEARCH {totalManuals?.toLocaleString() || '3,900+'} FITNESS EQUIPMENT
            <br />MANUALS AND TECHNICAL GUIDES.
          </h2>
          <div className="mx-auto mt-8 h-px max-w-xs bg-white/10" />
          <div className="mt-12 grid gap-10 text-center md:grid-cols-3">
            {[
              {
                title: "OWNER'S GUIDES",
                desc: 'Step-by-step assembly, operation, and maintenance instructions direct from the manufacturer.',
              },
              {
                title: 'SERVICE MANUALS',
                desc: 'Technical documentation for diagnostics, repair procedures, and parts specifications.',
              },
              {
                title: `${equipmentTypes.length} EQUIPMENT TYPES`,
                desc: 'Treadmills, ellipticals, bikes, cable machines, strength equipment, and more.',
              },
            ].map(({ title, desc }) => (
              <div key={title}>
                <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-white">{title}</h3>
                <p className="mt-4 text-sm leading-7 text-white/50">{desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <a
              href="#search"
              className="border border-white/25 px-8 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-white transition hover:border-white/60"
            >
              SEARCH LIBRARY →
            </a>
          </div>
        </div>
      </section>

      {/* ── Manuals Directory (search bar + card grid) ───────────────── */}
      <Suspense fallback={null}>
        <ManualsDirectory
          initialManuals={(manualData || []).map(normalizeManual)}
          brands={brands}
          equipmentTypes={equipmentTypes}
          totalManuals={totalManuals || 0}
        />
      </Suspense>
    </main>
  )
}
