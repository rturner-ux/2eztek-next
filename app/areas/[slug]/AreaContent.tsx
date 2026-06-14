// app/areas/[slug]/AreaContent.tsx
'use client'

import Link from 'next/link'
import Image from 'next/image'
import Script from 'next/script'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import type { AreaData } from '@/lib/areaData'

const PHONE_DISPLAY = '(972) 807-7232'
const PHONE_TEL = '9728077232'
const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number]

const fadeUp = {
  hidden: { opacity: 0, y: 36 },
  show: (delay = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 1.0, delay, ease: EASE },
  }),
}

const staggerContainer = (stagger = 0.08, delayChildren = 0) => ({
  hidden: {},
  show: { transition: { staggerChildren: stagger, delayChildren } },
})

const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.75, ease: EASE } },
}

function Reveal({ children, className, delay = 0 }: {
  children: React.ReactNode
  className?: string
  delay?: number
}) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <motion.div
      ref={ref}
      variants={fadeUp}
      initial="hidden"
      animate={inView ? 'show' : 'hidden'}
      custom={delay}
      className={className}
    >
      {children}
    </motion.div>
  )
}

function CardList({ items }: { items: string[] }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-50px' })
  return (
    <motion.ul
      ref={ref}
      variants={staggerContainer(0.07)}
      initial="hidden"
      animate={inView ? 'show' : 'hidden'}
      className="grid gap-3 sm:grid-cols-2"
    >
      {items.map((item) => (
        <motion.li
          key={item}
          variants={staggerItem}
          className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white shadow-sm px-5 py-4 text-sm font-semibold text-slate-600"
        >
          <span className="mt-0.5 h-2 w-2 flex-shrink-0 rounded-full bg-cyan-400" />
          {item}
        </motion.li>
      ))}
    </motion.ul>
  )
}

export default function AreaContent({ area }: { area: AreaData }) {
  const areaSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Service',
        name: 'Fitness Equipment Repair in ' + area.name + ', TX',
        provider: {
          '@type': 'LocalBusiness',
          '@id': 'https://www.2eztek.com/#localbusiness',
        },
        areaServed: {
          '@type': 'City',
          name: area.name + ', TX',
        },
        description: area.metaDescription,
        url: 'https://www.2eztek.com/areas/' + area.slug,
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.2eztek.com' },
          { '@type': 'ListItem', position: 2, name: 'Service Areas', item: 'https://www.2eztek.com/areas' },
          { '@type': 'ListItem', position: 3, name: area.name, item: 'https://www.2eztek.com/areas/' + area.slug },
        ],
      },
    ],
  }

  return (
    <main className="min-h-screen overflow-hidden bg-white text-slate-900">
      <Script
        id={'area-schema-' + area.slug}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(areaSchema) }}
      />

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="relative min-h-[80vh] overflow-hidden pt-36 pb-24 lg:pt-44 lg:pb-32">
        <Image
          src="/images/gym-equipment-repair-dallas.webp"
          alt="Fitness equipment repair Dallas Fort Worth"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.55)_0%,rgba(0,0,0,0.20)_50%,transparent_100%)]" />

        <div className="relative z-10 px-6 lg:px-16">
          {/* Breadcrumb */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
            className="mb-10 flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-white/50"
          >
            <Link href="/" className="transition hover:text-cyan-300">Home</Link>
            <span>/</span>
            <Link href="/areas" className="transition hover:text-cyan-300">Areas</Link>
            <span>/</span>
            <span className="text-white/70">{area.name}</span>
          </motion.div>

          {/* Eyebrow */}
          <div className="mb-6 flex items-center gap-3">
            <motion.span
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.7, delay: 0.2, ease: EASE }}
              style={{ originX: 0 }}
              className="block h-px w-10 bg-cyan-400"
            />
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.45 }}
              className="text-xs font-black uppercase tracking-[0.3em] text-cyan-300"
            >
              {area.county} · Dallas Fort Worth
            </motion.span>
          </div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 48 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, delay: 0.2, ease: EASE }}
            className="max-w-5xl text-5xl font-black leading-[1] tracking-tight text-white md:text-7xl"
          >
            Fitness Equipment Repair
            <span className="block text-cyan-400">{area.name}, TX</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.45, ease: EASE }}
            className="mt-8 max-w-3xl text-lg leading-relaxed text-white/80 md:text-xl"
          >
            {area.overview}
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6, ease: EASE }}
            className="mt-10 flex flex-wrap items-center gap-4"
          >
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent('open-booking-modal'))}
              className="button-glow rounded-2xl bg-cyan-400 px-8 py-5 text-sm font-black uppercase tracking-[0.12em] text-black transition hover:scale-105 active:scale-95"
            >
              Book Service in {area.name}
            </button>
            <a
              href={'tel:' + PHONE_TEL}
              className="rounded-2xl border border-white/30 bg-white/10 px-8 py-5 text-sm font-black uppercase tracking-[0.12em] text-white backdrop-blur-sm transition hover:border-white/60 hover:bg-white/20"
            >
              Call {PHONE_DISPLAY}
            </a>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.75, ease: EASE }}
            className="mt-14 flex flex-wrap gap-6 border-t border-white/20 pt-10"
          >
            {[
              ['10K+', 'Machines Serviced'],
              ['500+', '5-Star Reviews'],
              ['24/7', 'Emergency Support'],
              ['DFW', 'Coverage Area'],
            ].map(([val, label]) => (
              <div key={label} className="min-w-[100px]">
                <div className="text-2xl font-black text-white">{val}</div>
                <div className="mt-1 text-xs text-white/60 uppercase tracking-[0.15em]">{label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Services in this area ────────────────────────────────────── */}
      <section className="border-t border-slate-200 bg-slate-50 px-6 py-24 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <div className="flex items-center gap-3 mb-6">
              <span className="h-px w-8 bg-cyan-400" />
              <span className="text-xs font-black uppercase tracking-[0.3em] text-cyan-600">
                Services in {area.name}
              </span>
            </div>
            <h2 className="text-3xl font-black leading-tight md:text-5xl">
              What We Service in {area.name}
            </h2>
          </Reveal>
          <div className="mt-10">
            <CardList items={area.services} />
          </div>
        </div>
      </section>

      {/* ── Areas we cover ──────────────────────────────────────────── */}
      <section className="border-t border-slate-200 bg-white px-6 py-24 lg:px-16">
        <div className="mx-auto max-w-7xl grid gap-16 lg:grid-cols-2 lg:items-start">
          <div>
            <Reveal>
              <div className="flex items-center gap-3 mb-6">
                <span className="h-px w-8 bg-cyan-400" />
                <span className="text-xs font-black uppercase tracking-[0.3em] text-cyan-600">
                  Neighborhoods &amp; Areas
                </span>
              </div>
              <h2 className="text-3xl font-black leading-tight md:text-5xl">
                We Cover All of {area.name}
              </h2>
              <p className="mt-6 text-lg leading-relaxed text-slate-500">
                Our technicians service all neighborhoods and communities throughout {area.name}, including:
              </p>
            </Reveal>
          </div>
          <div className="mt-4 lg:mt-16">
            <CardList items={area.landmarks} />
          </div>
        </div>
      </section>

      {/* ── Why Choose Us ───────────────────────────────────────────── */}
      <section className="border-t border-slate-200 bg-slate-50 px-6 py-24 lg:px-16">
        <div className="mx-auto max-w-7xl grid gap-16 lg:grid-cols-[1fr,1.1fr] lg:items-start">
          <div>
            <Reveal>
              <div className="flex items-center gap-3 mb-6">
                <span className="h-px w-8 bg-cyan-400" />
                <span className="text-xs font-black uppercase tracking-[0.3em] text-cyan-600">
                  Why 2EZ TEK
                </span>
              </div>
              <h2 className="text-3xl font-black leading-tight md:text-5xl">
                The {area.name} Fitness Equipment Experts
              </h2>
              <p className="mt-6 text-lg leading-relaxed text-slate-500">
                2EZ TEK has built a reputation across Dallas Fort Worth for showing up on time, diagnosing accurately, and fixing equipment right the first time. Every job is backed by SmartGymOps service tracking.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => window.dispatchEvent(new CustomEvent('open-booking-modal'))}
                  className="rounded-2xl border border-cyan-200 bg-cyan-50 px-6 py-4 text-sm font-black uppercase tracking-[0.12em] text-cyan-600 transition hover:bg-cyan-100 hover:border-cyan-300"
                >
                  Book Service
                </button>
                <Link
                  href="/brands"
                  className="rounded-2xl border border-slate-200 bg-white px-6 py-4 text-sm font-black uppercase tracking-[0.12em] text-slate-700 transition hover:border-cyan-300 hover:bg-cyan-50"
                >
                  Brands We Service
                </Link>
              </div>
            </Reveal>
          </div>
          <div className="mt-4 lg:mt-16">
            <CardList items={area.whyChooseUs} />
          </div>
        </div>
      </section>

      {/* ── Other Areas ─────────────────────────────────────────────── */}
      <section className="border-t border-slate-200 bg-white px-6 py-24 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <div className="flex items-center gap-3 mb-6">
              <span className="h-px w-8 bg-cyan-400" />
              <span className="text-xs font-black uppercase tracking-[0.3em] text-cyan-600">
                More Service Areas
              </span>
            </div>
            <h2 className="text-3xl font-black leading-tight md:text-5xl">
              We Service All of DFW
            </h2>
          </Reveal>

          <motion.div
            variants={staggerContainer(0.06, 0.1)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-50px' }}
            className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          >
            {[
              { name: 'Dallas', slug: 'dallas' },
              { name: 'Fort Worth', slug: 'fort-worth' },
              { name: 'Plano', slug: 'plano' },
              { name: 'Frisco', slug: 'frisco' },
              { name: 'Irving', slug: 'irving' },
              { name: 'Arlington', slug: 'arlington' },
              { name: 'Richardson', slug: 'richardson' },
              { name: 'McKinney', slug: 'mckinney' },
            ]
              .filter((a) => a.slug !== area.slug)
              .slice(0, 7)
              .map((a) => (
                <motion.div key={a.slug} variants={staggerItem}>
                  <Link
                    href={'/areas/' + a.slug}
                    className="group block rounded-3xl border border-slate-200 bg-white shadow-sm p-5 transition hover:border-cyan-300 hover:bg-cyan-50"
                  >
                    <div className="font-black text-slate-900 transition group-hover:text-cyan-600">
                      {a.name}
                    </div>
                    <div className="mt-1 text-xs text-slate-400 transition group-hover:text-cyan-600">
                      View Service Area →
                    </div>
                  </Link>
                </motion.div>
              ))}
          </motion.div>
        </div>
      </section>

      {/* ── Final CTA ───────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-t border-slate-200 bg-slate-900 px-6 py-32 text-center lg:px-16">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.1),transparent_55%)]" />
        <Reveal className="relative z-10 mx-auto max-w-4xl">
          <div className="flex items-center justify-center gap-3 mb-6">
            <span className="h-px w-8 bg-cyan-400" />
            <span className="text-xs font-black uppercase tracking-[0.3em] text-cyan-400">
              Ready To Schedule?
            </span>
            <span className="h-px w-8 bg-cyan-400" />
          </div>
          <h2 className="text-4xl font-black leading-tight text-white md:text-6xl">
            Book Fitness Equipment Repair
            <span className="block text-white/45">in {area.name} Today.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/60">
            Whether you need emergency repair, preventative maintenance, or a new home gym setup, 2EZ TEK is ready to help in {area.name} and all of Dallas Fort Worth.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="inline-flex">
              <button
                type="button"
                onClick={() => window.dispatchEvent(new CustomEvent('open-booking-modal'))}
                className="button-glow rounded-2xl bg-cyan-400 px-8 py-5 text-sm font-black uppercase tracking-[0.15em] text-black shadow-[0_0_40px_rgba(34,211,238,0.3)]"
              >
                Book Service Now
              </button>
            </motion.div>
            <a
              href={'tel:' + PHONE_TEL}
              className="rounded-2xl border border-white/10 bg-white/5 px-8 py-5 text-sm font-black uppercase tracking-[0.15em] text-white transition hover:border-cyan-400/30 hover:bg-cyan-400/10"
            >
              Call {PHONE_DISPLAY}
            </a>
          </div>
        </Reveal>
      </section>
    </main>
  )
}
