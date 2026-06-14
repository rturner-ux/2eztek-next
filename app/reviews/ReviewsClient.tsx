'use client'

import Image from 'next/image'
import { motion, useInView, useScroll, useTransform } from 'framer-motion'
import { useRef, useState, useMemo } from 'react'
import { googleReviews, GOOGLE_REVIEW_URL } from '@/lib/reviews'
import { thumbtackReviews } from '@/lib/reviews-thumbtack'

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number]
const REVIEWS_PER_PAGE = 8

const fadeUp = {
  hidden: { opacity: 0, y: 36 },
  show: (delay = 0) => ({ opacity: 1, y: 0, transition: { duration: 1.0, delay, ease: EASE } }),
}
const staggerContainer = (stagger = 0.08, delayChildren = 0) => ({
  hidden: {},
  show: { transition: { staggerChildren: stagger, delayChildren } },
})
const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.75, ease: EASE } },
}

function Reveal({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <motion.div ref={ref} variants={fadeUp} initial="hidden" animate={inView ? 'show' : 'hidden'} custom={delay} className={className}>
      {children}
    </motion.div>
  )
}

function StarBar({ rating, pct }: { rating: number; pct: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-4 text-xs text-white/50">{rating}</span>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full bg-cyan-400 transition-all" style={{ width: `${pct}%` }} />
      </div>
      <span className="w-8 text-xs text-white/40">{pct}%</span>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg className="h-3.5 w-3.5 flex-shrink-0" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  )
}

function ThumbtackIcon() {
  return (
    <svg className="h-3.5 w-3.5 flex-shrink-0" viewBox="0 0 24 24" fill="#009FD9">
      <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm.5 14.5h-1v-6h1v6zm0-8h-1V7h1v1.5z"/>
    </svg>
  )
}

const stats = [
  { value: '500+', label: '5-Star Reviews' },
  { value: '10K+', label: 'Machines Serviced' },
  { value: '24/7', label: 'Emergency Support' },
  { value: 'DFW', label: 'Coverage Area' },
]

const SUMMARY = "Customers across Dallas Fort Worth consistently praise 2EZ TEK for fast response times, expert diagnostics, and professional service. Common themes include same-day appointments, technicians who go above and beyond, and equipment that works better than new after repair. Homeowners and commercial facility managers alike recommend 2EZ TEK for treadmill repair, equipment assembly, and preventative maintenance."

const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: 'recent', label: 'Most Recent' },
  { value: 'service', label: 'By Service' },
]

type UnifiedReview = {
  name: string
  role: string
  title: string
  review: string
  tag: string
  date: string
  source: 'google' | 'thumbtack'
}

const allReviews: UnifiedReview[] = [
  ...googleReviews.map((r) => ({ ...r, source: 'google' as const })),
  ...thumbtackReviews.map((r) => ({ name: r.name, role: r.service, title: r.title, review: r.review, tag: r.service, date: r.date, source: 'thumbtack' as const })),
]

const trustPoints = [
  'Fast response times',
  'Experienced technicians',
  'Commercial & residential service',
  'Trusted across Dallas Fort Worth',
]

export default function ReviewsClient() {
  const heroRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '20%'])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0])

  const [sort, setSort] = useState('featured')
  const [page, setPage] = useState(1)
  const [summaryExpanded, setSummaryExpanded] = useState(false)

  const sorted = useMemo(() => {
    if (sort === 'service') return [...allReviews].sort((a, b) => a.tag.localeCompare(b.tag))
    return allReviews
  }, [sort])

  const totalPages = Math.ceil(sorted.length / REVIEWS_PER_PAGE)
  const start = (page - 1) * REVIEWS_PER_PAGE
  const visible = sorted.slice(start, start + REVIEWS_PER_PAGE)

  function changePage(next: number) {
    setPage(next)
    document.getElementById('reviews-list')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const reviewSchema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': 'https://www.2eztek.com/#localbusiness',
    name: '2EZ TEK',
    aggregateRating: { '@type': 'AggregateRating', ratingValue: '4.9', reviewCount: '500', bestRating: '5', worstRating: '1' },
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#070B12] text-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(reviewSchema) }} />

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section ref={heroRef} className="relative min-h-screen overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <motion.div style={{ y: heroY }} className="relative h-[115%] w-[112%]">
            <motion.div initial={{ scale: 1.08 }} animate={{ scale: 1 }} transition={{ duration: 2.2, ease: EASE }} className="h-full w-full">
              <Image src="/images/reviews-handshake.webp" alt="2EZ TEK customer reviews" fill priority sizes="100vw" className="object-cover opacity-95" />
            </motion.div>
          </motion.div>
        </div>
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,11,18,0.92)_0%,rgba(7,11,18,0.55)_50%,rgba(7,11,18,0.05)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.18),transparent_38%)]" />

        <motion.div style={{ opacity: heroOpacity }} className="relative z-10 flex min-h-screen items-center px-6 py-32 lg:px-16">
          <div className="max-w-5xl">
            <div className="mb-8 flex items-center gap-3">
              <motion.span initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.7, delay: 0.3, ease: EASE }} style={{ originX: 0 }} className="block h-px w-10 bg-cyan-400" />
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7, delay: 0.55 }} className="text-xs font-black uppercase tracking-[0.3em] text-cyan-400">
                Verified Customer Reviews
              </motion.span>
            </div>
            <motion.h1 initial={{ opacity: 0, y: 56 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.1, delay: 0.2, ease: EASE }} className="text-5xl font-black leading-[0.92] tracking-tight md:text-7xl lg:text-8xl">
              Trusted By
              <span className="block text-cyan-400">Dallas Fort Worth.</span>
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.5, ease: EASE }} className="mt-8 max-w-2xl text-lg leading-8 text-white/80 md:text-xl">
              Homeowners, gyms, apartments, and commercial fitness facilities trust 2EZ TEK for reliable repair, assembly, diagnostics, and preventive maintenance across Dallas Fort Worth.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.65, ease: EASE }} className="mt-10 flex flex-wrap items-center gap-4">
              <button type="button" onClick={() => window.dispatchEvent(new CustomEvent('open-booking-modal'))} className="button-glow rounded-2xl bg-cyan-400 px-7 py-4 text-sm font-black uppercase tracking-[0.12em] text-black shadow-[0_0_40px_rgba(34,211,238,0.38)] transition hover:scale-105 active:scale-95">Book Service</button>
              <a href="tel:9728077232" className="rounded-2xl border border-white/15 bg-white/10 px-7 py-4 text-sm font-black uppercase tracking-[0.12em] text-white backdrop-blur-xl transition hover:border-cyan-400/30 hover:bg-cyan-400/10">Call (972) 807-7232</a>
            </motion.div>
            <motion.div variants={staggerContainer(0.1, 0.85)} initial="hidden" animate="show" className="mt-16 grid grid-cols-2 gap-4 md:grid-cols-4">
              {stats.map((s) => (
                <motion.div key={s.label} variants={staggerItem} whileHover={{ y: -4 }} className="rounded-3xl border border-white/10 bg-black/30 p-6 backdrop-blur-xl">
                  <div className="text-4xl font-black text-cyan-400">{s.value}</div>
                  <div className="mt-2 text-xs font-black uppercase tracking-[0.15em] text-white/50">{s.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ── Reviews & Ratings ────────────────────────────────────────────────── */}
      <section className="border-t border-white/10 bg-[#0B1220] px-6 py-20 lg:px-16">
        <div className="mx-auto max-w-5xl">

          {/* Overview */}
          <Reveal className="mb-10">
            <h2 className="text-3xl font-black md:text-4xl">Reviews &amp; Ratings</h2>
            <div className="mt-8 flex flex-col gap-8 md:flex-row md:items-start md:gap-16">

              {/* Score + stars */}
              <div className="flex-shrink-0 text-center md:text-left">
                <div className="text-7xl font-black text-cyan-400">4.9</div>
                <div className="mt-1 text-xl text-cyan-400">★★★★★</div>
                <div className="mt-1 text-sm text-white/50">{allReviews.length} Reviews</div>
                <a
                  href={GOOGLE_REVIEW_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 py-2.5 text-xs font-black uppercase tracking-[0.15em] text-white transition hover:border-cyan-400/30 hover:bg-cyan-400/10"
                >
                  <GoogleIcon />
                  Write a Review
                </a>
              </div>

              {/* Star breakdown */}
              <div className="flex-1 space-y-2">
                <StarBar rating={5} pct={96} />
                <StarBar rating={4} pct={3} />
                <StarBar rating={3} pct={1} />
                <StarBar rating={2} pct={0} />
                <StarBar rating={1} pct={0} />
              </div>
            </div>
          </Reveal>

          <hr className="border-white/[0.08]" />

          {/* Summary */}
          <Reveal className="py-8">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white/50">Summary of Reviews</h3>
            <p className={`mt-3 text-sm leading-7 text-white/65 ${summaryExpanded ? '' : 'line-clamp-3'}`}>{SUMMARY}</p>
            <button onClick={() => setSummaryExpanded((v) => !v)} className="mt-2 text-xs font-black text-cyan-400 transition hover:text-cyan-300">
              {summaryExpanded ? 'View less' : 'View more'}
            </button>
          </Reveal>

          <hr className="border-white/[0.08]" />

          {/* Sort + count */}
          <div id="reviews-list" className="flex flex-wrap items-center justify-between gap-4 py-6">
            <div className="text-sm text-white/40">
              {start + 1} – {Math.min(start + REVIEWS_PER_PAGE, sorted.length)} of {sorted.length} Reviews
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/35">Sort by</span>
              <select
                value={sort}
                onChange={(e) => { setSort(e.target.value); setPage(1) }}
                className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400/40"
              >
                {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value} className="bg-[#0B1220]">{o.label}</option>)}
              </select>
            </div>
          </div>

          <hr className="border-white/[0.08]" />

          {/* Review rows */}
          <motion.div key={sort + page} variants={staggerContainer(0.06, 0.05)} initial="hidden" animate="show" className="divide-y divide-white/[0.07]">
            {visible.map((item, i) => (
              <motion.article key={item.name + item.date + i} variants={staggerItem} className="flex flex-col gap-5 py-8 md:flex-row md:gap-10">

                {/* Author */}
                <div className="flex-shrink-0 md:w-36">
                  <div className="font-black text-white">{item.name}</div>
                  <div className="mt-1 text-xs text-white/40 leading-5">{item.role}</div>
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-base text-cyan-400">★★★★★</span>
                    <span className="text-xs text-white/35">{item.date}</span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-[0.15em] text-white/40">{item.tag}</span>
                  </div>
                  <h3 className="mt-2 font-black text-white">{item.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-white/60">{item.review}</p>
                  <div className="mt-4 flex items-center gap-4">
                    <div className="flex items-center gap-1.5 text-xs text-cyan-400/70">
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                      <span>Recommends 2EZ TEK</span>
                    </div>
                    <div className="flex items-center gap-1.5 rounded-full border border-white/10 px-2.5 py-1 text-[10px] text-white/30">
                      {item.source === 'google' ? <><GoogleIcon /><span>Google</span></> : <><ThumbtackIcon /><span>Thumbtack</span></>}
                    </div>
                  </div>
                </div>

              </motion.article>
            ))}
          </motion.div>

          <hr className="border-white/[0.08]" />

          {/* Pagination */}
          <div className="flex items-center justify-between pt-8">
            <div className="text-sm text-white/40">
              {start + 1} – {Math.min(start + REVIEWS_PER_PAGE, sorted.length)} of {sorted.length} Reviews
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => changePage(page - 1)}
                disabled={page === 1}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 text-white/40 transition hover:border-cyan-400/30 hover:text-white disabled:opacity-25 disabled:cursor-not-allowed"
                aria-label="Previous page"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
              </button>
              <button
                onClick={() => changePage(page + 1)}
                disabled={page === totalPages}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 text-white/40 transition hover:border-cyan-400/30 hover:text-white disabled:opacity-25 disabled:cursor-not-allowed"
                aria-label="Next page"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────────────────────────────── */}
      <section className="border-t border-white/10 bg-[#07101D] px-6 py-28 lg:px-16">
        <div className="mx-auto max-w-7xl rounded-[3rem] border border-cyan-400/20 bg-black/20 p-10 shadow-[0_30px_120px_rgba(0,0,0,0.38)] backdrop-blur-2xl md:p-16">
          <div className="grid gap-10 lg:grid-cols-[1fr,320px] lg:items-center">
            <Reveal>
              <div className="flex items-center gap-3 mb-6">
                <span className="h-px w-8 bg-cyan-400" />
                <span className="text-xs font-black uppercase tracking-[0.3em] text-cyan-400">Experience The Difference</span>
              </div>
              <h2 className="max-w-4xl text-4xl font-black leading-tight md:text-6xl">
                Let's Get Your Equipment
                <span className="block text-white/45">Running Again.</span>
              </h2>
              <div className="mt-8 grid gap-3 md:grid-cols-2">
                {trustPoints.map((item) => (
                  <div key={item} className="flex items-center gap-3 text-white/70">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-400 text-xs font-black text-black">✓</span>
                    {item}
                  </div>
                ))}
              </div>
            </Reveal>
            <Reveal delay={0.15} className="flex flex-col gap-4">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <button type="button" onClick={() => window.dispatchEvent(new CustomEvent('open-booking-modal'))} className="block w-full rounded-2xl bg-cyan-400 px-7 py-5 text-center text-sm font-black uppercase tracking-[0.12em] text-black shadow-[0_0_35px_rgba(34,211,238,0.35)] transition hover:bg-cyan-300">Book Service</button>
              </motion.div>
              <a href="tel:9728077232" className="rounded-2xl border border-white/15 bg-white/10 px-7 py-5 text-center text-sm font-black uppercase tracking-[0.12em] text-white backdrop-blur-xl transition hover:border-cyan-400/30 hover:bg-cyan-400/10">
                Call (972) 807-7232
              </a>
            </Reveal>
          </div>
        </div>
      </section>
    </main>
  )
}
