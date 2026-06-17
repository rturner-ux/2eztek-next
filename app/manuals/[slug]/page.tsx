import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@supabase/supabase-js'
import ManualQA from './ManualQA'
import BookServiceButton from '@/components/BookServiceButton'

export const dynamic = 'force-dynamic'

type PageProps = {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const url = `https://www.2eztek.com/manuals/${slug}`
  return {
    alternates: { canonical: url },
    openGraph: { url },
  }
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
  const stored = manual.manual_url || ''

  // External links (ManualsLib, manufacturer sites) — use directly, don't construct a local path
  if (stored.startsWith('http') && !stored.includes('supabase')) {
    return stored
  }

  if (!manual.slug) return stored

  const cleanSlug = slugify(manual.slug)
    .replace(/-pdf$/i, '')
    .replace(/\.pdf$/i, '')

  return `/manuals/${slugify(brand)}/${cleanSlug}.pdf`
}

function isExternalLink(url: string) {
  return url.startsWith('http') && !url.includes('supabase')
}

export default async function ManualDetailPage({
  params,
}: PageProps) {
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

  const mainManual =
    manualBySlug as unknown as ManualRecord

  const model = mainManual.equipment_models

  const brand =
    model?.brands?.name ||
    detectBrandFromSlug(
      mainManual.slug || slug
    )

  const category =
    model?.equipment_categories?.name ||
    'Fitness Equipment'

  const modelName =
    model?.model ||
    mainManual.description ||
    modelFromSlug(
      mainManual.slug || slug,
      brand
    )

  const manualUrl =
    buildBrandedManualUrl(
      mainManual,
      brand
    )

  const { data: relatedData } =
    await supabase
      .from('equipment_manuals_v2')
      .select(`
        id,
        slug,
        manual_url,
        manual_type,
        description,
        created_at
      `)
      .neq('slug', slug)
      .ilike(
        'slug',
        `${slugify(brand)}%`
      )
      .limit(6)

  const relatedManuals =
    (relatedData || []) as ManualRecord[]

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.2eztek.com' },
      { '@type': 'ListItem', position: 2, name: 'Manuals', item: 'https://www.2eztek.com/manuals' },
      { '@type': 'ListItem', position: 3, name: `${brand} ${modelName}`, item: `https://www.2eztek.com/manuals/${slug}` },
    ],
  }

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      {/* ── Full-Bleed Hero ─────────────────────────────────────────── */}
      <section className="relative min-h-[80vh] overflow-hidden">
        <Image
          src="/images/gym-equipment-repair-dallas.webp"
          alt={`${brand} ${modelName} manual`}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.55)_0%,rgba(0,0,0,0.20)_50%,transparent_100%)]" />

        <div className="relative z-10 flex min-h-[80vh] flex-col items-start justify-center px-6 pt-36 pb-16 lg:px-16 lg:pt-44">
          <div className="max-w-2xl">
            <nav className="mb-6 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em]">
              <Link href="/manuals" prefetch={false} className="text-white/50 transition hover:text-cyan-300">
                Manuals
              </Link>
              <span className="text-white/30">/</span>
              <span className="text-white/50">{brand}</span>
            </nav>

            <div className="mb-4 flex items-center gap-3">
              <span className="h-px w-8 bg-cyan-400" />
              <span className="text-[10px] font-black uppercase tracking-[0.35em] text-cyan-300">
                {brand} Manual Library
              </span>
            </div>

            <h1 className="text-3xl font-black leading-tight text-white md:text-5xl lg:text-[3.25rem]">
              {modelName}
            </h1>

            <div className="mt-5 flex flex-wrap gap-2">
              <span className="border border-cyan-400/40 bg-cyan-400/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-cyan-300">
                {brand}
              </span>
              <span className="border border-white/20 bg-white/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-white/70">
                {category}
              </span>
              <span className="border border-white/20 bg-white/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-white/70">
                {mainManual.manual_type || 'Manual'}
              </span>
            </div>

            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href={manualUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-cyan-400 px-7 py-3 text-[11px] font-bold uppercase tracking-[0.15em] text-black transition-colors hover:bg-cyan-300"
              >
                {isExternalLink(manualUrl) ? 'View Manual →' : 'Open Manual PDF'}
              </a>
              <BookServiceButton
                label="Request Service"
                className="border border-white/30 bg-white/10 px-7 py-3 text-[11px] font-bold uppercase tracking-[0.15em] text-white backdrop-blur-sm transition-colors hover:bg-white/20"
              />
              <a
                href="tel:9728077232"
                className="border border-white/30 bg-white/10 px-7 py-3 text-[11px] font-bold uppercase tracking-[0.15em] text-white backdrop-blur-sm transition-colors hover:bg-white/20"
              >
                (972) 807-7232
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Dark Section — Preview + Support ────────────────────────── */}
      <section className="bg-[#0A0D14] px-6 py-16 text-white lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">

            {/* PDF preview */}
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.35em] text-cyan-400">
                Manual Preview
              </span>
              <p className="mt-3 text-sm leading-6 text-white/50">
                Use this document for assembly reference, troubleshooting, maintenance checks, and service preparation.
              </p>
              {isExternalLink(manualUrl) ? (
                <div className="mt-6 flex flex-col items-center justify-center gap-5 border border-white/10 bg-white/[0.03] p-12 text-center">
                  <span className="text-4xl">📄</span>
                  <p className="text-sm text-white/50">
                    This manual is hosted on the manufacturer&apos;s site. Click below to view it.
                  </p>
                  <a
                    href={manualUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-cyan-400 px-7 py-3 text-[11px] font-bold uppercase tracking-[0.15em] text-black transition-colors hover:bg-cyan-300"
                  >
                    View Manual →
                  </a>
                </div>
              ) : (
                <div className="mt-6 overflow-hidden border border-white/10">
                  <iframe
                    src={manualUrl}
                    title={`${modelName} manual preview`}
                    className="h-[520px] w-full bg-black"
                  />
                </div>
              )}
            </div>

            {/* Support cards */}
            <div className="flex flex-col gap-6">
              <div className="border border-white/10 bg-white/[0.04] p-8">
                <span className="text-[10px] font-black uppercase tracking-[0.35em] text-cyan-400">
                  Troubleshooting Support
                </span>
                <h2 className="mt-4 text-2xl font-black text-white">
                  Need help with this equipment?
                </h2>
                <p className="mt-4 text-sm leading-7 text-white/60">
                  If this manual does not solve the issue, 2EZ TEK can diagnose, repair, or maintain this equipment. Submit a service request with the brand, model, serial number, and a short description of the issue.
                </p>
                <div className="mt-6 flex flex-col gap-3">
                  {['Assembly help', 'Error code diagnosis', 'Preventive maintenance'].map((item) => (
                    <div key={item} className="border border-white/10 bg-black/25 px-5 py-4 text-sm font-bold text-white/70">
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <div className="border border-cyan-400/20 bg-cyan-400/10 p-8">
                <h2 className="text-2xl font-black text-white">Request Service</h2>
                <p className="mt-3 text-sm leading-7 text-white/70">
                  Need this equipment repaired, assembled, moved, or maintained? Send the details directly to 2EZ TEK.
                </p>
                <BookServiceButton
                  label="Start Service Request"
                  className="mt-6 inline-flex bg-cyan-400 px-7 py-3 text-sm font-black uppercase tracking-wide text-black transition hover:bg-cyan-300"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── AI Q&A ───────────────────────────────────────────────────── */}
      <section className="bg-[#0A0D14] px-6 pb-16 text-white lg:px-16">
        <div className="mx-auto max-w-7xl border-t border-white/10 pt-10">
          <ManualQA slug={slug} brand={brand} modelName={modelName} />
        </div>
      </section>

      {/* ── Related Manuals (Light Card Grid) ────────────────────────── */}
      {relatedManuals.length > 0 && (
        <section className="bg-slate-50 px-6 py-16 lg:px-16">
          <div className="mx-auto max-w-7xl">
            <span className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-400">
              More From {brand}
            </span>
            <h2 className="mt-3 text-3xl font-black text-slate-900">
              Related {brand} Manuals
            </h2>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {relatedManuals.map((manual) => {
                const relatedUrl = buildBrandedManualUrl(manual, brand)
                return (
                  <div key={manual.id} className="border border-slate-200 bg-white p-6">
                    <span className="border border-cyan-200 bg-cyan-50 px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.15em] text-cyan-600">
                      {manual.manual_type || 'Manual'}
                    </span>
                    <h3 className="mt-4 text-base font-black leading-snug text-slate-900">
                      {manual.description || manual.slug}
                    </h3>
                    <div className="mt-5 flex items-center gap-3 border-t border-slate-100 pt-4">
                      <Link
                        href={`/manuals/${manual.slug}`}
                        className="text-xs font-bold text-cyan-600 transition hover:text-cyan-700"
                      >
                        View Details →
                      </Link>
                      <a
                        href={relatedUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-auto text-xs font-semibold text-slate-400 transition hover:text-slate-700"
                      >
                        PDF ↗
                      </a>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}
    </main>
  )
}
