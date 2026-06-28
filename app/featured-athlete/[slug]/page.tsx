import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import BookServiceButton from '@/components/BookServiceButton'

export const dynamic = 'force-dynamic'

type PageProps = { params: Promise<{ slug: string }> }

type Athlete = {
  id: string
  slug: string
  athlete_name: string
  tagline: string | null
  location: string | null
  gym_type: string
  gym_name: string | null
  content: string
  equipment_used: string | null
  workout_style: string | null
  quote: string | null
  hero_image_url: string | null
  instagram_url: string | null
  facebook_url: string | null
  tiktok_url: string | null
  youtube_url: string | null
  featured_date: string
  published: boolean
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

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const { data } = await db()
    .from('featured_athletes')
    .select('athlete_name, tagline, hero_image_url')
    .eq('slug', slug)
    .eq('published', true)
    .single()

  if (!data) return {}

  return {
    title: `${data.athlete_name} — Featured Athlete of the Week | 2EZ TEK`,
    description: data.tagline ?? `Meet ${data.athlete_name}, featured athlete of the week at 2EZ TEK.`,
    openGraph: {
      title: `${data.athlete_name} — Featured Athlete | 2EZ TEK`,
      description: data.tagline ?? '',
      images: data.hero_image_url ? [{ url: data.hero_image_url, width: 1200, height: 630 }] : [],
    },
  }
}

export default async function AthleteArticlePage({ params }: PageProps) {
  const { slug } = await params
  const { data: athlete } = await db()
    .from('featured_athletes')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .single()

  if (!athlete) notFound()

  const { data: others } = await db()
    .from('featured_athletes')
    .select('slug, athlete_name, tagline, hero_image_url, gym_type, featured_date')
    .eq('published', true)
    .neq('slug', slug)
    .order('featured_date', { ascending: false })
    .limit(3)

  const socials = [
    { href: athlete.instagram_url, label: 'Instagram', icon: '📸' },
    { href: athlete.tiktok_url,    label: 'TikTok',    icon: '🎵' },
    { href: athlete.youtube_url,   label: 'YouTube',   icon: '▶️' },
    { href: athlete.facebook_url,  label: 'Facebook',  icon: '👤' },
  ].filter(s => s.href)

  return (
    <div className="min-h-screen bg-[#050B14]">

      {/* Hero image */}
      <div className="relative h-[50vh] min-h-[380px] overflow-hidden">
        {athlete.hero_image_url ? (
          <img
            src={athlete.hero_image_url}
            alt={athlete.athlete_name}
            className="absolute inset-0 h-full w-full object-cover object-top"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050B14] via-[#050B14]/40 to-transparent" />

        {/* Breadcrumb */}
        <div className="absolute top-6 left-6 flex items-center gap-2 text-xs text-white/50">
          <Link href="/" className="hover:text-white transition">Home</Link>
          <span>/</span>
          <Link href="/featured-athlete" className="hover:text-white transition">Featured Athlete</Link>
          <span>/</span>
          <span className="text-white/80">{athlete.athlete_name}</span>
        </div>

        {/* Name overlay */}
        <div className="absolute bottom-0 left-0 right-0 px-6 pb-10 lg:px-16">
          <div className="mx-auto max-w-4xl">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="rounded-full bg-cyan-400/20 border border-cyan-400/30 px-3 py-1 text-xs font-bold uppercase tracking-widest text-cyan-400">
                Featured Athlete
              </span>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-slate-300">
                {athlete.gym_type === 'home_gym' ? '🏠 Home Gym' : '🏢 Commercial Gym'}
              </span>
              {athlete.gym_name && (
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-slate-300">
                  {athlete.gym_name}
                </span>
              )}
            </div>
            <h1 className="text-4xl font-black text-white lg:text-5xl">{athlete.athlete_name}</h1>
            {athlete.tagline && <p className="mt-2 text-xl text-cyan-400 font-semibold">{athlete.tagline}</p>}
            <p className="mt-1 text-sm text-slate-500">
              Week of {formatWeek(athlete.featured_date)}{athlete.location ? ` · ${athlete.location}` : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Article body */}
      <div className="px-6 py-16 lg:px-16">
        <div className="mx-auto max-w-4xl">
          <div className="lg:grid lg:grid-cols-[1fr_280px] lg:gap-12">

            {/* Main content */}
            <div>
              {/* Pull quote */}
              {athlete.quote && (
                <blockquote className="mb-10 rounded-2xl border border-cyan-400/20 bg-cyan-400/5 p-8">
                  <p className="text-xl font-bold text-white leading-relaxed italic">
                    &ldquo;{athlete.quote}&rdquo;
                  </p>
                  <cite className="mt-3 block text-sm text-cyan-400 font-semibold not-italic">
                    — {athlete.athlete_name}
                  </cite>
                </blockquote>
              )}

              {/* Article content */}
              <div
                className="prose prose-invert prose-lg max-w-none
                  prose-headings:font-black prose-headings:text-white
                  prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
                  prose-h3:text-xl prose-h3:text-cyan-400
                  prose-p:text-slate-300 prose-p:leading-relaxed
                  prose-strong:text-white prose-strong:font-bold
                  prose-ul:text-slate-300 prose-li:marker:text-cyan-400
                  prose-a:text-cyan-400 prose-a:no-underline hover:prose-a:underline"
                dangerouslySetInnerHTML={{ __html: athlete.content }}
              />

              {/* Social links */}
              {socials.length > 0 && (
                <div className="mt-10 flex flex-wrap gap-3">
                  {socials.map(s => (
                    <a
                      key={s.label}
                      href={s.href!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-bold text-white hover:border-cyan-400/40 hover:bg-cyan-400/10 transition"
                    >
                      <span>{s.icon}</span> {s.label}
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* Sidebar */}
            <aside className="mt-12 lg:mt-0 space-y-6">

              {/* Equipment */}
              {athlete.equipment_used && (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                  <h3 className="text-xs font-black uppercase tracking-widest text-cyan-400 mb-3">Equipment Used</h3>
                  <p className="text-sm text-slate-300 leading-relaxed">{athlete.equipment_used}</p>
                </div>
              )}

              {/* Workout style */}
              {athlete.workout_style && (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                  <h3 className="text-xs font-black uppercase tracking-widest text-cyan-400 mb-3">Training Style</h3>
                  <p className="text-sm text-slate-300 leading-relaxed">{athlete.workout_style}</p>
                </div>
              )}

              {/* Nominate */}
              <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/5 p-6 text-center">
                <p className="text-2xl mb-2">🏆</p>
                <h3 className="font-black text-white text-sm mb-2">Know someone who inspires?</h3>
                <p className="text-xs text-slate-400 mb-4">Nominate them for a future feature.</p>
                <a
                  href="mailto:rturner@2eztek.com?subject=Featured Athlete Nomination"
                  className="block w-full rounded-full bg-cyan-400 py-2.5 text-xs font-black text-black hover:bg-cyan-300 transition"
                >
                  Nominate →
                </a>
              </div>

              {/* Service CTA */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
                <p className="text-xs text-slate-500 mb-3">Equipment needs service?</p>
                <BookServiceButton />
              </div>
            </aside>
          </div>

          {/* Back link */}
          <div className="mt-16 pt-10 border-t border-white/10">
            <Link href="/featured-athlete" className="text-sm font-bold text-cyan-400 hover:text-cyan-300 transition">
              ← All Featured Athletes
            </Link>
          </div>
        </div>
      </div>

      {/* More athletes */}
      {others && others.length > 0 && (
        <section className="px-6 pb-24 lg:px-16 border-t border-white/5 pt-16">
          <div className="mx-auto max-w-7xl">
            <h2 className="text-xl font-black text-white mb-8">More Features</h2>
            <div className="grid gap-5 sm:grid-cols-3">
              {others.map(a => (
                <Link key={a.slug} href={`/featured-athlete/${a.slug}`} className="group block">
                  <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 transition hover:border-cyan-400/25">
                    <div className="relative h-40 overflow-hidden">
                      {a.hero_image_url ? (
                        <img src={a.hero_image_url} alt={a.athlete_name} className="h-full w-full object-cover group-hover:scale-105 transition duration-500" />
                      ) : (
                        <div className="h-full bg-slate-800 flex items-center justify-center"><span className="text-3xl">🏋️</span></div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#050B14]/80 to-transparent" />
                    </div>
                    <div className="p-4">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{formatWeek(a.featured_date)}</p>
                      <h3 className="font-black text-white mt-0.5">{a.athlete_name}</h3>
                      {a.tagline && <p className="text-xs text-slate-400 mt-1 line-clamp-1">{a.tagline}</p>}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
