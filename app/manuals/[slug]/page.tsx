import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

type PageProps = {
  params: Promise<{
    slug: string
  }>
}

type ManualRecord = {
  id: string
  slug: string | null
  manual_url: string | null
  manual_type: string | null
  description: string | null
  created_at: string | null
  equipment_models?: {
    id: string
    model: string | null
    slug: string | null
    brands?: {
      name: string | null
    } | null
    equipment_categories?: {
      name: string | null
    } | null
  } | null
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
    sportsartfitness: 'SportsArt',
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

function modelFromSlug(slug: string, brand: string) {
  const brandSlug = slugify(brand)

  const cleaned = slugify(slug)
    .replace(new RegExp(`^${brandSlug}-?`), '')
    .replace(/owner-manual|assembly-manual|service-manual|manual|guide/g, '')
    .replace(/-+/g, '-')
    .replace(/(^-|-$)+/g, '')

  return titleCase(cleaned || slug)
}

function buildBrandedManualUrl(manual: ManualRecord, brand: string) {
  if (!manual.slug) {
    return manual.manual_url || ''
  }

  return `/manuals/${slugify(brand)}/${slugify(manual.slug)}.pdf`
}

export default async function ManualDetailPage({ params }: PageProps) {
  const { slug } = await params

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: manualBySlug } = await supabase
    .from('equipment_manuals_v2')
    .select(`
      id,
      slug,
      manual_url,
      manual_type,
      description,
      created_at,
      equipment_models (
        id,
        model,
        slug,
        brands ( name ),
        equipment_categories ( name )
      )
    `)
    .eq('slug', slug)
    .maybeSingle()

  if (!manualBySlug) {
    notFound()
  }

  const mainManual = manualBySlug as unknown as ManualRecord

  const model = mainManual.equipment_models
  const brand = model?.brands?.name || detectBrandFromSlug(mainManual.slug || slug)
  const category =
    model?.equipment_categories?.name || 'Fitness Equipment'

  const modelName =
    model?.model ||
    mainManual.description ||
    modelFromSlug(mainManual.slug || slug, brand)

  const manualUrl = buildBrandedManualUrl(mainManual, brand)

  const { data: relatedData } = await supabase
    .from('equipment_manuals_v2')
    .select('id, slug, manual_url, manual_type, description, created_at')
    .neq('slug', slug)
    .ilike('slug', `${slugify(brand)}%`)
    .limit(6)

  const relatedManuals = (relatedData || []) as ManualRecord[]

  return (
    <main className="min-h-screen bg-[#050B14] text-white">
      <section className="relative overflow-hidden border-b border-white/10 bg-[#050B14]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.22),transparent_35%),linear-gradient(180deg,rgba(34,211,238,0.08),transparent_48%)]" />

        <div className="relative mx-auto max-w-7xl px-6 pb-20 pt-32">
          <Link
            href="/manuals"
            prefetch={false}
            className="text-sm font-bold text-cyan-300 transition hover:text-cyan-200"
          >
            ← Back to Manuals
          </Link>

          <div className="mt-8 grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
            <div>
              <div className="mb-4 inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-xs font-black uppercase tracking-[0.25em] text-cyan-300">
                {brand} Manual Library
              </div>

              <h1 className="text-5xl font-black leading-[0.95] tracking-tight md:text-7xl">
                {modelName}
              </h1>

              <p className="mt-6 max-w-3xl text-lg leading-8 text-white/70">
                Access the {brand} {modelName} {mainManual.manual_type || 'manual'},
                service reference, assembly support, and troubleshooting resource
                through the 2EZ TEK equipment library.
              </p>

              <div className="mt-6 flex flex-wrap gap-3 text-xs font-black uppercase tracking-[0.18em] text-white/50">
                <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2">
                  {brand}
                </span>

                <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2">
                  {category}
                </span>

                <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2">
                  {mainManual.manual_type || 'Manual'}
                </span>
              </div>

              <div className="mt-10 flex flex-wrap gap-4">
                <a
                  href={manualUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-2xl bg-cyan-400 px-8 py-4 text-sm font-black uppercase tracking-wide text-black shadow-[0_0_35px_rgba(34,211,238,0.22)] transition hover:scale-105 hover:bg-cyan-300"
                >
                  Open Manual PDF
                </a>

                <Link
                  href="/contact"
                  prefetch={false}
                  className="rounded-2xl border border-white/15 bg-white/5 px-8 py-4 text-sm font-black uppercase tracking-wide text-white transition hover:border-cyan-400/50 hover:bg-cyan-400/10"
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
              <h2 className="text-2xl font-black">Manual Preview</h2>

              <p className="mt-3 text-sm leading-6 text-white/60">
                Use this document for assembly reference, troubleshooting,
                maintenance checks, and service preparation.
              </p>

              <div className="mt-6 overflow-hidden rounded-3xl border border-white/10 bg-black/30">
                <iframe
                  src={manualUrl}
                  title={`${modelName} manual preview`}
                  className="h-[520px] w-full"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-6 py-20 lg:grid-cols-[1fr_0.85fr]">
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-8">
          <div className="text-sm font-black uppercase tracking-[0.25em] text-cyan-300">
            Troubleshooting Support
          </div>

          <h2 className="mt-4 text-4xl font-black">
            Need help with this equipment?
          </h2>

          <p className="mt-5 leading-8 text-white/65">
            If this manual does not solve the issue, 2EZ TEK can help diagnose,
            assemble, repair, or maintain this equipment. Submit a service
            request with the brand, model, serial number, and a short description
            of the issue.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              'Assembly help',
              'Error code diagnosis',
              'Preventive maintenance',
            ].map((item) => (
              <div
                key={item}
                className="rounded-3xl border border-white/10 bg-black/25 p-5 text-sm font-bold text-white/70"
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] border border-cyan-400/20 bg-cyan-400/10 p-8">
          <h2 className="text-3xl font-black">Request Service</h2>

          <p className="mt-4 leading-7 text-white/70">
            Need this equipment repaired, assembled, moved, or maintained?
            Send the details directly to 2EZ TEK.
          </p>

          <Link
            href="/contact"
            prefetch={false}
            className="mt-8 inline-flex rounded-2xl bg-cyan-400 px-7 py-4 text-sm font-black uppercase tracking-wide text-black transition hover:bg-cyan-300"
          >
            Start Service Request
          </Link>
        </div>
      </section>

      {relatedManuals.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 pb-24">
          <h2 className="text-4xl font-black">Related {brand} Manuals</h2>

          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {relatedManuals.map((manual) => {
              const relatedUrl = buildBrandedManualUrl(manual, brand)

              return (
                <div
                  key={manual.id}
                  className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-7"
                >
                  <div className="text-xs font-black uppercase tracking-[0.22em] text-cyan-300">
                    {manual.manual_type || 'Manual'}
                  </div>

                  <h3 className="mt-4 text-xl font-black">
                    {manual.description || manual.slug}
                  </h3>

                  <a
                    href={relatedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-6 inline-flex rounded-2xl bg-white/10 px-5 py-3 text-sm font-black uppercase tracking-wide text-white transition hover:bg-cyan-400 hover:text-black"
                  >
                    Open PDF
                  </a>
                </div>
              )
            })}
          </div>
        </section>
      )}
    </main>
  )
}