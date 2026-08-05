import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import type { Metadata } from 'next'
import BookServiceButton from '@/components/BookServiceButton'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Featured Athlete of the Week',
  description: 'Every week 2EZ TEK spotlights a real home gym warrior or commercial gym athlete from the DFW fitness community. Read their story, their training, and what drives them.',
  alternates: { canonical: 'https://www.2eztek.com/featured-athlete' },
  openGraph: {
    title: 'Featured Athlete of the Week | 2EZ TEK',
    description: 'Real athletes. Real gyms. Real stories. Every week from the DFW fitness community.',
    url: 'https://www.2eztek.com/featured-athlete',
    siteName: '2EZ TEK',
    type: 'website',
    images: [{ url: '/images/featured-athlete-hero.jpg', width: 1200, height: 630 }],
  },
}

type Athlete = {
  id: string
  slug: string
  athlete_name: string
  tagline: string | null
  location: string | null
  gym_type: string
  gym_name: string | null
  quote: string | null
  hero_image_url: string | null
  featured_date: string
}

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

function formatWeek(dateStr: string) {
  const d = new Date(dateStr)
  return new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(d)
}

export default async function FeaturedAthletePage() {
  const { data: athletes } = await db()
    .from('featured_athletes')
    .select('id, slug, athlete_name, tagline, location, gym_type, gym_name, quote, hero_image_url, featured_date')
    .eq('published', true)
    .order('featured_date', { ascending: false })

  const current = athletes?.[0] ?? null
  const past = athletes?.slice(1) ?? []

  return (
    <div className="min-h-screen bg-[#050B14]">

      {/* Hero */}
      <section className="relative px-6 py-20 lg:px-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#050B14] via-[#071828] to-[#050B14]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(34,211,238,0.08)_0%,transparent_60%)]" />
        <div className="relative mx-auto max-w-7xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/5 px-4 py-1.5 mb-6">
            <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">Weekly Feature</span>
          </div>
          <h1 className="text-4xl font-black text-white lg:text-6xl">
            Featured Athlete<br />
            <span className="text-cyan-400">of the Week</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-400">
            Real athletes. Home gyms and commercial gyms. Every week we spotlight someone from the DFW fitness community who puts in the work.
          </p>
        </div>
      </section>

      {/* Current featured athlete */}
      {current ? (
        <section className="px-6 pb-20 lg:px-16">
          <div className="mx-auto max-w-7xl">
            <Link href={`/featured-athlete/${current.slug}`} className="group block">
              <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 transition hover:border-cyan-400/30">
                <div className="lg:grid lg:grid-cols-2">

                  {/* Image */}
                  <div className="relative h-72 lg:h-full min-h-[420px] overflow-hidden">
                    {current.hero_image_url ? (
                      <img
                        src={current.hero_image_url}
                        alt={current.athlete_name}
                        className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                        <span className="text-6xl">🏋️</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#050B14] hidden lg:block" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050B14] to-transparent lg:hidden" />
                  </div>

                  {/* Content */}
                  <div className="p-8 lg:p-12 flex flex-col justify-center">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="rounded-full bg-cyan-400/10 border border-cyan-400/20 px-3 py-1 text-xs font-bold uppercase tracking-widest text-cyan-400">
                        This Week
                      </span>
                      <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-semibold text-slate-400">
                        {current.gym_type === 'home_gym' ? '🏠 Home Gym' : '🏢 Commercial Gym'}
                      </span>
                    </div>

                    <h2 className="text-3xl font-black text-white lg:text-4xl">{current.athlete_name}</h2>
                    {current.tagline && (
                      <p className="mt-2 text-lg text-cyan-400 font-semibold">{current.tagline}</p>
                    )}
                    {current.location && (
                      <p className="mt-1 text-sm text-slate-500">{current.location}</p>
                    )}

                    {current.quote && (
                      <blockquote className="mt-6 border-l-2 border-cyan-400 pl-4 text-slate-300 italic leading-relaxed">
                        &ldquo;{current.quote}&rdquo;
                      </blockquote>
                    )}

                    <div className="mt-8 flex items-center gap-2 text-sm font-bold text-cyan-400 group-hover:gap-4 transition-all">
                      Read Full Story <span>→</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </section>
      ) : (
        <section className="px-6 pb-20 lg:px-16">
          <div className="mx-auto max-w-3xl text-center rounded-3xl border border-white/10 bg-white/5 p-16">
            <p className="text-4xl mb-4">🏆</p>
            <h2 className="text-2xl font-black text-white">First feature coming soon</h2>
            <p className="mt-3 text-slate-400">Check back next week for the first featured athlete spotlight.</p>
          </div>
        </section>
      )}

      {/* Past athletes grid */}
      {past.length > 0 && (
        <section className="px-6 pb-20 lg:px-16 border-t border-white/5 pt-16">
          <div className="mx-auto max-w-7xl">
            <h2 className="text-2xl font-black text-white mb-10">Past Features</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {past.map((a) => (
                <Link key={a.id} href={`/featured-athlete/${a.slug}`} className="group block">
                  <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 transition hover:border-cyan-400/25">
                    <div className="relative h-48 overflow-hidden">
                      {a.hero_image_url ? (
                        <img
                          src={a.hero_image_url}
                          alt={a.athlete_name}
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="h-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                          <span className="text-4xl">🏋️</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#050B14]/80 to-transparent" />
                      <div className="absolute bottom-3 left-3">
                        <span className="rounded-full bg-black/50 backdrop-blur px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-cyan-400">
                          {a.gym_type === 'home_gym' ? '🏠 Home Gym' : '🏢 Commercial Gym'}
                        </span>
                      </div>
                    </div>
                    <div className="p-5">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">
                        Week of {formatWeek(a.featured_date)}
                      </p>
                      <h3 className="font-black text-white text-lg">{a.athlete_name}</h3>
                      {a.tagline && <p className="mt-1 text-sm text-slate-400 line-clamp-2">{a.tagline}</p>}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Nominate CTA */}
      <section className="px-6 py-20 lg:px-16">
        <div className="mx-auto max-w-3xl text-center rounded-3xl border border-cyan-400/20 bg-cyan-400/5 p-12">
          <p className="text-3xl mb-4">🏆</p>
          <h2 className="text-3xl font-black text-white">Know someone who deserves the spotlight?</h2>
          <p className="mt-4 text-slate-400 max-w-lg mx-auto">
            Nominate a home gym builder, competitive athlete, or anyone in the DFW area who inspires others with their fitness journey.
          </p>
          <a
            href="mailto:rturner@2eztek.com?subject=Featured Athlete Nomination"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-cyan-400 px-8 py-4 text-sm font-black text-black hover:bg-cyan-300 transition"
          >
            Submit a Nomination →
          </a>
        </div>
      </section>

      {/* Service CTA */}
      <section className="px-6 pb-24 lg:px-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-slate-500 text-sm mb-4">Equipment keeping you out of the game?</p>
          <BookServiceButton className="mx-auto" />
        </div>
      </section>
    </div>
  )
}
