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
      <section className="border-b border-slate-200 bg-white pt-28 pb-0 lg:pt-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-16">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">

            {/* Left — text */}
            <div className="py-12 lg:py-20">
              <div className="text-sm font-black uppercase tracking-[0.3em] text-cyan-600">
                Manuals &amp; Resources
              </div>
              <h1 className="mt-4 text-4xl font-black leading-tight text-slate-900 md:text-5xl lg:text-6xl">
                Fitness Equipment<span className="block text-cyan-600">Owner&apos;s Manuals</span>
              </h1>
              <p className="mt-6 text-lg leading-relaxed text-slate-600">
                Search {totalManuals?.toLocaleString() || '3,900+'} manuals, troubleshooting guides, repair references, and assembly documentation across {brands.length} equipment brands.
              </p>
              <div className="mt-8 flex flex-wrap gap-10">
                <div>
                  <div className="text-4xl font-black text-cyan-600">{totalManuals?.toLocaleString() || '3,900+'}</div>
                  <div className="mt-1 text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Manuals</div>
                </div>
                <div>
                  <div className="text-4xl font-black text-cyan-600">{brands.length}+</div>
                  <div className="mt-1 text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Brands</div>
                </div>
                <div>
                  <div className="text-4xl font-black text-cyan-600">{equipmentTypes.length}</div>
                  <div className="mt-1 text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Equipment Types</div>
                </div>
              </div>
            </div>

            {/* Right — image, no overlay */}
            <div className="relative overflow-hidden lg:h-[580px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/optimized-om_image.jpg"
                alt="Fitness equipment owner's manuals and documentation"
                className="h-full w-full object-cover"
              />
            </div>

          </div>
        </div>
      </section>

      <ManualsDirectory
        initialManuals={(manualData || []).map(normalizeManual)}
        brands={brands}
        equipmentTypes={equipmentTypes}
        totalManuals={totalManuals || 0}
      />
    </main>
  )
}
