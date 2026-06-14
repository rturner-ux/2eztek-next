import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@supabase/supabase-js'
import BookServiceButton from '@/components/BookServiceButton'

export const dynamic = 'force-dynamic'

type PageProps = {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const url = `https://www.2eztek.com/facility-spotlight/${slug}`
  return {
    alternates: { canonical: url },
    openGraph: { url },
  }
}

type FacilitySpotlight = {
  id: string
  facility_name: string
  slug: string
  city: string | null
  state: string | null
  facility_type: string | null
  image_url: string | null
  logo_url: string | null
  website_url: string | null
  headline: string | null
  description: string | null
  services: string[] | null
  equipment_types: string[] | null
  spotlight_month: string | null
  uptime_award: boolean | null
  is_published: boolean | null
  created_at: string | null
}

export default async function FacilitySpotlightDetailPage({
  params,
}: PageProps) {
  const { slug } = await params

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: facility } = await supabase
    .from('facility_spotlights')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .maybeSingle()

  if (!facility) {
    notFound()
  }

  const spotlight = facility as FacilitySpotlight
  const location = [spotlight.city, spotlight.state].filter(Boolean).join(', ')
  const services = spotlight.services || []
  const equipmentTypes = spotlight.equipment_types || []

  return (
    <main className="min-h-screen bg-[#050B14] text-white">
      <section className="relative overflow-hidden border-b border-white/10">
        {spotlight.image_url && (
          <img
            src={spotlight.image_url}
            alt={spotlight.facility_name}
            className="absolute inset-0 h-full w-full object-cover opacity-35"
            fetchPriority="high"
            loading="eager"
          />
        )}

        <div className="absolute inset-0 bg-[#050B14]/70" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.24),transparent_35%)]" />

        <div className="relative mx-auto max-w-7xl px-6 pb-24 pt-32">
          <Link
            href="/facility-spotlight"
            className="text-sm font-bold text-cyan-300 transition hover:text-cyan-200"
          >
            ← Back to Facility Spotlight
          </Link>

          <div className="mt-10 max-w-5xl">
            <div className="mb-5 inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-xs font-black uppercase tracking-[0.25em] text-cyan-300">
              Featured Facility
            </div>

            {spotlight.logo_url && (
              <img
                src={spotlight.logo_url}
                alt={`${spotlight.facility_name} logo`}
                className="mb-8 max-h-20 max-w-[220px] object-contain"
                loading="lazy"
              />
            )}

            <h1 className="text-5xl font-black leading-[0.95] tracking-tight md:text-7xl">
              {spotlight.facility_name}
            </h1>

            <p className="mt-6 max-w-3xl text-xl leading-9 text-white/75">
              {spotlight.headline ||
                spotlight.description ||
                'A featured fitness facility recognized by 2EZ TEK for prioritizing equipment uptime, maintenance, and member experience.'}
            </p>

            <div className="mt-8 flex flex-wrap gap-3 text-xs font-black uppercase tracking-[0.18em] text-white/60">
              {location && (
                <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2">
                  {location}
                </span>
              )}

              {spotlight.facility_type && (
                <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2">
                  {spotlight.facility_type}
                </span>
              )}

              {spotlight.spotlight_month && (
                <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2">
                  {spotlight.spotlight_month}
                </span>
              )}

              {spotlight.uptime_award && (
                <span className="rounded-full border border-emerald-400/30 bg-emerald-400/15 px-4 py-2 text-emerald-300">
                  SmartGymOps Uptime Award
                </span>
              )}
            </div>

            <div className="mt-10 flex flex-wrap gap-4">
              {spotlight.website_url && (
                <a
                  href={spotlight.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-2xl bg-white px-8 py-4 text-sm font-black uppercase tracking-wide text-black shadow-[0_0_35px_rgba(255,255,255,0.16)] transition hover:scale-105 hover:bg-cyan-100"
                >
                  Visit Facility Website
                </a>
              )}

              <BookServiceButton className="rounded-2xl bg-cyan-400 px-8 py-4 text-sm font-black uppercase tracking-wide text-black shadow-[0_0_35px_rgba(34,211,238,0.22)] transition hover:scale-105 hover:bg-cyan-300" />

              <a
                href="tel:9728077232"
                className="rounded-2xl border border-white/15 bg-white/5 px-8 py-4 text-sm font-black uppercase tracking-wide text-white transition hover:border-cyan-400/50 hover:bg-cyan-400/10"
              >
                Call 972-807-7232
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-6 py-20 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-8">
          <div className="text-sm font-black uppercase tracking-[0.25em] text-cyan-300">
            Facility Story
          </div>

          <h2 className="mt-4 text-4xl font-black">
            Why This Facility Stands Out
          </h2>

          <p className="mt-6 text-lg leading-9 text-white/70">
            {spotlight.description ||
              `${spotlight.facility_name} is featured for its commitment to professional equipment care, facility presentation, and uptime-focused maintenance.`}
          </p>
        </div>

        <div className="rounded-[2rem] border border-cyan-400/20 bg-cyan-400/10 p-8">
          <div className="text-sm font-black uppercase tracking-[0.25em] text-cyan-300">
            2EZ TEK Support
          </div>

          <h2 className="mt-4 text-3xl font-black">Services Highlighted</h2>

          <div className="mt-6 flex flex-wrap gap-2">
            {(services.length > 0
              ? services
              : ['Fitness Equipment Repair', 'Preventative Maintenance', 'Assembly Support']
            ).map((service) => (
              <span
                key={service}
                className="rounded-full border border-white/10 bg-black/25 px-4 py-2 text-xs font-black uppercase tracking-wide text-white/75"
              >
                {service}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="rounded-[2rem] border border-white/10 bg-black/20 p-8">
          <div className="grid gap-8 lg:grid-cols-2">
            <div>
              <div className="text-sm font-black uppercase tracking-[0.25em] text-cyan-300">
                Equipment Focus
              </div>

              <h2 className="mt-4 text-4xl font-black">
                Equipment Types Supported
              </h2>

              <div className="mt-6 flex flex-wrap gap-2">
                {(equipmentTypes.length > 0
                  ? equipmentTypes
                  : ['Treadmills', 'Ellipticals', 'Strength Equipment', 'Cable Machines']
                ).map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-black uppercase tracking-wide text-white/70"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-cyan-400/20 bg-cyan-400/10 p-8">
              <h2 className="text-3xl font-black">
                Want Your Facility Featured?
              </h2>

              <p className="mt-4 leading-8 text-white/70">
                2EZ TEK highlights gyms, apartment fitness centers, hotels,
                training studios, schools, and commercial fitness spaces that
                value equipment care and member experience.
              </p>

              <Link
                href="/contact"
                className="mt-8 inline-flex rounded-2xl bg-cyan-400 px-7 py-4 text-sm font-black uppercase tracking-wide text-black transition hover:bg-cyan-300"
              >
                Contact 2EZ TEK
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}