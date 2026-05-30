import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
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

function getNested(value: any) {
  if (Array.isArray(value)) return value[0] || null
  return value || null
}

function normalizeManual(row: any): DirectoryManual {
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

  const [{ count: totalManuals }, { data: brandData }, { data: categoryData }] =
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
    ])

  const brands = Array.from(
    new Set((brandData || []).map((item) => item.name).filter(Boolean))
  ).sort()

  const equipmentTypes = Array.from(
    new Set((categoryData || []).map((item) => item.name).filter(Boolean))
  ).sort()

  return (
    <main className="min-h-screen bg-[#050B14] text-white">
      <section className="relative overflow-hidden border-b border-white/10 bg-[#050B14]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.22),transparent_34%),linear-gradient(180deg,rgba(34,211,238,0.08),transparent_45%)]" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-cyan-300/40 to-transparent" />

        <div className="relative mx-auto max-w-7xl px-6 pb-20 pt-32">
          <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <div className="mb-5 inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-xs font-black uppercase tracking-[0.25em] text-cyan-300">
                Fitness Equipment Resource Center
              </div>

              <h1 className="max-w-5xl text-5xl font-black leading-[0.95] tracking-tight md:text-7xl">
                Manuals, Repair Help
                <span className="block text-cyan-300">
                  & Troubleshooting.
                </span>
              </h1>

              <p className="mt-7 max-w-3xl text-lg leading-8 text-white/70">
                Search owner manuals, assembly guides, troubleshooting resources,
                preventative maintenance documentation, exploded diagrams, videos,
                and service references for residential and commercial fitness equipment.
              </p>

              <div className="mt-10 flex flex-wrap gap-4">
                <Link
                  href="/contact"
                  prefetch={false}
                  className="rounded-2xl bg-cyan-400 px-8 py-4 text-sm font-black uppercase tracking-wide text-black shadow-[0_0_35px_rgba(34,211,238,0.22)] transition hover:scale-105 hover:bg-cyan-300"
                >
                  Request Service
                </Link>

                <a
                  href="tel:9728077232"
                  className="rounded-2xl border border-white/15 bg-white/5 px-8 py-4 text-sm font-black uppercase tracking-wide text-white transition hover:border-cyan-400/50 hover:bg-cyan-400/10"
                >
                  Call 972-807-7232
                </a>
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 shadow-[0_30px_100px_rgba(0,0,0,0.35)] backdrop-blur-xl">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-3xl border border-white/10 bg-black/25 p-5">
                  <div className="text-4xl font-black text-cyan-300">
                    {totalManuals?.toLocaleString() || '3,900+'}
                  </div>
                  <div className="mt-2 text-xs font-black uppercase tracking-[0.18em] text-white/50">
                    Manuals
                  </div>
                </div>

                <div className="rounded-3xl border border-white/10 bg-black/25 p-5">
                  <div className="text-4xl font-black text-cyan-300">
                    {brands.length}
                  </div>
                  <div className="mt-2 text-xs font-black uppercase tracking-[0.18em] text-white/50">
                    Brands
                  </div>
                </div>

                <div className="rounded-3xl border border-white/10 bg-black/25 p-5">
                  <div className="text-4xl font-black text-cyan-300">
                    24/7
                  </div>
                  <div className="mt-2 text-xs font-black uppercase tracking-[0.18em] text-white/50">
                    Access
                  </div>
                </div>
              </div>

              <div className="mt-5 rounded-3xl border border-cyan-400/20 bg-cyan-400/10 p-5">
                <h2 className="text-xl font-black text-white">
                  Search To Find Your Manual
                </h2>
                <p className="mt-3 text-sm leading-6 text-white/65">
                  Type your brand or model in the search box below. Results load instantly on demand.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <ManualsDirectory
        initialManuals={[]}
        brands={brands}
        equipmentTypes={equipmentTypes}
        totalManuals={totalManuals || 0}
      />
    </main>
  )
}
