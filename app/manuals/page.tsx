import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import ManualsDirectory from './ManualsDirectory'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Fitness Equipment Manuals & Troubleshooting | 2EZ TEK',
  description:
    'Search fitness equipment manuals, troubleshooting resources, repair guidance, assembly support, and preventative maintenance information.',
}

type ManualRecord = {
  id: string
  manual_url: string | null
  manual_type: string | null
  description: string | null
  created_at: string | null
  model: string | null
  brand: string | null
  brand_logo: string | null
  equipment_type: string | null
  slug: string | null
}

type ManualV2Record = {
  id: string
  slug: string | null
  manual_url: string | null
  manual_type: string | null
  description: string | null
  created_at: string | null
  mirrored: boolean | null
  mirrored_path: string | null
}

function slugify(value: string) {
  return String(value || '')
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

function titleCase(value: string) {
  return String(value || '')
    .split('-')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function cleanDescription(value: string) {
  return String(value || '')
    .replace(/\s+/g, ' ')
    .trim()
}

function detectBrandFromSlug(slug: string) {
  const brandMap: Record<string, string> = {
    'body-solid': 'Body-Solid',
    bowflex: 'Bowflex',
    cybex: 'Cybex',
    'dynamic-fluid-fitness': 'Dynamic Fluid Fitness',
    'expresso-fitness': 'Expresso Fitness',
    freemotion: 'FreeMotion',
    'free-motion': 'FreeMotion',
    'french-fitness': 'French Fitness',
    goldendesigns: 'GoldenDesigns',
    'hammer-strength': 'Hammer Strength',
    'jacobs-ladder': 'Jacobs Ladder',
    'life-fitness': 'Life Fitness',
    'marpo-kinetics': 'Marpo Kinetics',
    matrix: 'Matrix',
    monark: 'Monark',
    nautilus: 'Nautilus',
    nustep: 'Nustep',
    'octane-fitness': 'Octane Fitness',
    'power-plate': 'Power Plate',
    powerblock: 'PowerBlock',
    precor: 'Precor',
    schwinn: 'Schwinn',
    scifit: 'SciFit',
    sportsart: 'SportsArt',
    stairmaster: 'Stairmaster',
    'star-trac': 'Star Trac',
    technogym: 'Technogym',
    throwdown: 'Throwdown',
    'total-gym': 'Total Gym',
    'true-fitness': 'True Fitness',
    versaclimber: 'Versaclimber',
    woodway: 'Woodway USA',
  }

  const normalizedSlug = slugify(slug)

  for (const [key, value] of Object.entries(brandMap)) {
    if (normalizedSlug.startsWith(key)) {
      return value
    }
  }

  return 'Other'
}

function modelFromSlug(slug: string, brand: string) {
  const brandSlug = slugify(brand)

  const cleaned = slugify(slug).replace(
    new RegExp(`^${brandSlug}-?`),
    ''
  )

  return titleCase(cleaned)
}

function getBrandedManualUrl(manual: {
  slug: string
  brand: string
  manual_url: string
}) {
  if (!manual.slug || !manual.brand) {
    return manual.manual_url
  }

  const brandSlug = slugify(manual.brand)

  const fileName = `${slugify(manual.slug)}.pdf`

  return `/manuals/${brandSlug}/${fileName}`
}

export default async function ManualsPage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data: viewData, error: viewError } =
    await supabase
      .from('manuals_directory_view')
      .select(
        'id, manual_url, manual_type, description, created_at, model, brand, brand_logo, equipment_type, slug'
      )
      .order('brand', { ascending: true })
      .order('model', { ascending: true })
      .limit(5000)

  const { data: v2Data, error: v2Error } =
    await supabase
      .from('equipment_manuals_v2')
      .select(
        'id, slug, manual_url, manual_type, description, created_at, mirrored, mirrored_path'
      )
      .order('created_at', { ascending: false })
      .limit(5000)

  const viewManuals =
    viewData?.map((manual: ManualRecord) => {
      const fallbackSlug = slugify(
        [manual.brand, manual.model, manual.manual_type]
          .filter(Boolean)
          .join(' ')
      )

      const brand =
        manual.brand ||
        detectBrandFromSlug(
          manual.slug || fallbackSlug
        )

      const slug = manual.slug || fallbackSlug

      const model =
        manual.model ||
        cleanDescription(
          manual.description || ''
        ) ||
        modelFromSlug(slug, brand)

      const manualUrl = getBrandedManualUrl({
        slug,
        brand,
        manual_url: manual.manual_url || '',
      })

      return {
        id: manual.id,
        manual_url: manualUrl,
        manual_type:
          manual.manual_type || 'Manual',
        description:
          manual.description || model,
        created_at:
          manual.created_at || '',
        model,
        brand,
        brand_logo:
          manual.brand_logo || '',
        equipment_type:
          manual.equipment_type ||
          'Fitness Equipment',
        slug,
      }
    }) || []

  const v2Manuals =
    v2Data?.map((manual: ManualV2Record) => {
      const slug =
        manual.slug ||
        slugify(
          manual.description ||
            manual.id
        )

      const brand =
        detectBrandFromSlug(slug)

      const model =
        cleanDescription(
          manual.description ||
            modelFromSlug(slug, brand)
        )

      const manualUrl =
        getBrandedManualUrl({
          slug,
          brand,
          manual_url:
            manual.manual_url || '',
        })

      return {
        id: manual.id,
        manual_url: manualUrl,
        manual_type:
          manual.manual_type || 'Manual',
        description:
          manual.description || model,
        created_at:
          manual.created_at || '',
        model,
        brand,
        brand_logo: '',
        equipment_type:
          'Fitness Equipment',
        slug,
      }
    }) || []

  const manuals = Array.from(
    new Map(
      [...viewManuals, ...v2Manuals].map(
        (manual) => [
          manual.slug,
          manual,
        ]
      )
    ).values()
  ).sort((a, b) => {
    const brandCompare =
      a.brand.localeCompare(b.brand)

    if (brandCompare !== 0) {
      return brandCompare
    }

    return a.model.localeCompare(
      b.model
    )
  })

  const totalManuals = manuals.length

  const totalBrands = new Set(
    manuals.map((manual) => manual.brand)
  ).size

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
                Search owner manuals,
                assembly guides, service
                references,
                troubleshooting
                resources, and
                preventative maintenance
                information for
                residential and
                commercial fitness
                equipment.
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

              {(viewError || v2Error) && (
                <div className="mt-8 rounded-2xl border border-red-400/30 bg-red-500/10 p-5 text-sm text-red-200">
                  Some manuals could not
                  load. Check Supabase
                  views and
                  equipment_manuals_v2.
                </div>
              )}
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 shadow-[0_30px_100px_rgba(0,0,0,0.35)] backdrop-blur-xl">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-3xl border border-white/10 bg-black/25 p-5">
                  <div className="text-4xl font-black text-cyan-300">
                    {totalManuals}
                  </div>

                  <div className="mt-2 text-xs font-black uppercase tracking-[0.18em] text-white/50">
                    Manuals
                  </div>
                </div>

                <div className="rounded-3xl border border-white/10 bg-black/25 p-5">
                  <div className="text-4xl font-black text-cyan-300">
                    {totalBrands}
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
                  Imported manuals are
                  now searchable.
                </h2>

                <p className="mt-3 text-sm leading-6 text-white/65">
                  Imported and mirrored
                  manuals now appear in
                  the same directory
                  dropdowns alongside
                  existing 2EZ TEK
                  records.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <ManualsDirectory manuals={manuals} />
    </main>
  )
}