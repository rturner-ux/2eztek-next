import Image from 'next/image'
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
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <section className="relative overflow-hidden border-b border-slate-200 bg-slate-50 pt-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="relative flex min-h-[260px] items-end justify-center overflow-hidden border border-slate-200 bg-white px-6 pb-8 text-center md:min-h-[340px]">
            <Image
              src="/images/project-5.webp"
              alt=""
              fill
              priority
              sizes="(min-width: 1280px) 1216px, 100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/30" />
            <div className="relative rounded-2xl border border-white/20 bg-white/90 px-6 py-5 shadow-[0_20px_60px_rgba(0,0,0,0.12)] backdrop-blur-md md:px-10">
              <div className="mb-2 text-[11px] font-black uppercase tracking-[0.22em] text-cyan-600">
                {totalManuals?.toLocaleString() || '3,900+'} Manuals | {brands.length} Brands
              </div>
              <h1 className="text-3xl font-black tracking-tight text-slate-900 md:text-5xl">
                Owner&apos;s Manuals
              </h1>
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
