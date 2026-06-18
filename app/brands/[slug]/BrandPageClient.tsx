// app/brands/[slug]/BrandPageClient.tsx
'use client'

import Link from 'next/link'
import Script from 'next/script'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import type { BrandData } from '@/lib/brandData'

const PHONE_DISPLAY = '(972) 807-7232'
const PHONE_TEL = '9728077232'

// ─── Animation helpers ────────────────────────────────────────────────────────

const ease = [0.16, 1, 0.3, 1] as const

const fadeUp = {
  hidden: { opacity: 0, y: 36 },
  show: (delay = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 1.0, delay, ease },
  }),
}

const staggerContainer = (stagger = 0.08, delayChildren = 0) => ({
  hidden: {},
  show: { transition: { staggerChildren: stagger, delayChildren } },
})

const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.75, ease } },
}

function Reveal({
  children,
  className,
  delay = 0,
}: {
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

// ─── Section card list ────────────────────────────────────────────────────────

function CardList({ items, delay = 0 }: { items: string[]; delay?: number }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-50px' })
  return (
    <motion.ul
      ref={ref}
      variants={staggerContainer(0.07, delay)}
      initial="hidden"
      animate={inView ? 'show' : 'hidden'}
      className="grid gap-3 sm:grid-cols-2"
    >
      {items.map((item) => (
        <motion.li
          key={item}
          variants={staggerItem}
          className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm font-semibold text-slate-600 shadow-sm"
        >
          <span className="mt-0.5 h-2 w-2 flex-shrink-0 rounded-full bg-cyan-400" />
          {item}
        </motion.li>
      ))}
    </motion.ul>
  )
}

// ─── Section heading ──────────────────────────────────────────────────────────

function SectionHeading({ label, title }: { label: string; title: string }) {
  return (
    <Reveal>
      <div className="flex items-center gap-3 mb-6">
        <span className="h-px w-8 bg-cyan-400" />
        <span className="text-xs font-black uppercase tracking-[0.3em] text-cyan-600">{label}</span>
      </div>
      <h2 className="text-3xl font-black leading-tight md:text-5xl">{title}</h2>
    </Reveal>
  )
}

// ─── Main client component ────────────────────────────────────────────────────

export default function BrandPageClient({ brand }: { brand: BrandData }) {
  const serviceSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Service',
        name: brand.name + ' Equipment Repair in Dallas Fort Worth',
        provider: {
          '@type': 'LocalBusiness',
          '@id': 'https://www.2eztek.com/#localbusiness',
        },
        areaServed: { '@type': 'Place', name: 'Dallas Fort Worth, TX' },
        description: brand.metaDescription,
        url: 'https://www.2eztek.com/brands/' + brand.slug,
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.2eztek.com' },
          { '@type': 'ListItem', position: 2, name: 'Brands We Service', item: 'https://www.2eztek.com/brands' },
          { '@type': 'ListItem', position: 3, name: brand.name, item: 'https://www.2eztek.com/brands/' + brand.slug },
        ],
      },
    ],
  }

  return (
    <main className="min-h-screen overflow-hidden bg-white text-slate-900">
      <Script
        id={'brand-schema-' + brand.slug}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-36 pb-24 lg:pt-44 lg:pb-32">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.12),transparent_40%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(34,211,238,0.04),transparent_40%)]" />

        <div className="relative z-10 px-6 lg:px-16">
          {/* Breadcrumb */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease }}
            className="mb-10 flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-slate-400"
          >
            <Link href="/" className="transition hover:text-cyan-600">Home</Link>
            <span>/</span>
            <Link href="/brands" className="transition hover:text-cyan-600">Brands</Link>
            <span>/</span>
            <span className="text-slate-500">{brand.name}</span>
          </motion.div>

          {/* Eyebrow */}
          <div className="mb-6 flex items-center gap-3">
            <motion.span
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.7, delay: 0.2, ease }}
              style={{ originX: 0 }}
              className="block h-px w-10 bg-cyan-400"
            />
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.45 }}
              className="text-xs font-black uppercase tracking-[0.3em] text-cyan-600"
            >
              Dallas Fort Worth Fitness Equipment Experts
            </motion.span>
          </div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 48 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, delay: 0.2, ease }}
            className="max-w-5xl text-5xl font-black leading-[1] tracking-tight md:text-7xl lg:text-8xl"
          >
            {brand.name}
            <span className="block text-cyan-600">
              Repair & Service
            </span>
            <span className="block text-slate-400 text-4xl md:text-5xl lg:text-6xl mt-2">
              Dallas Fort Worth
            </span>
          </motion.h1>

          {/* Tagline + overview */}
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.45, ease }}
            className="mt-8 max-w-3xl text-lg leading-relaxed text-slate-600 md:text-xl"
          >
            {brand.overview}
          </motion.p>

          {/* Hero CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6, ease }}
            className="mt-10 flex flex-wrap gap-4"
          >
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent('open-booking-modal'))}
              className="rounded-2xl bg-cyan-400 px-8 py-5 text-sm font-black uppercase tracking-[0.12em] text-black transition hover:scale-105 active:scale-95"
            >
              Book {brand.name} Repair
            </button>
            <a
              href={'tel:' + PHONE_TEL}
              className="rounded-2xl border border-cyan-200 bg-cyan-50 px-8 py-5 text-sm font-black uppercase tracking-[0.12em] text-cyan-600 transition hover:bg-cyan-100"
            >
              Call {PHONE_DISPLAY}
            </a>
          </motion.div>

          {/* Quick stat bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.75, ease }}
            className="mt-14 flex flex-wrap gap-6 border-t border-slate-200 pt-10"
          >
            {[
              ['10K+', 'Machines Serviced'],
              ['500+', '5-Star Reviews'],
              ['24/7', 'Emergency Support'],
              ['DFW', 'Coverage Area'],
            ].map(([val, label]) => (
              <div key={label} className="min-w-[100px]">
                <div className="text-2xl font-black text-cyan-600">{val}</div>
                <div className="mt-1 text-xs text-slate-400 uppercase tracking-[0.15em]">{label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Equipment Types ──────────────────────────────────────────────────── */}
      <section className="border-t border-slate-200 bg-slate-50 px-6 py-24 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            label="Equipment We Service"
            title={brand.name + ' Equipment Types'}
          />
          <div className="mt-10">
            <CardList items={brand.equipmentTypes} />
          </div>
        </div>
      </section>

      {/* ── Common Issues ────────────────────────────────────────────────────── */}
      <section className="border-t border-slate-200 bg-white px-6 py-24 lg:px-16">
        <div className="mx-auto max-w-7xl grid gap-16 lg:grid-cols-2 lg:items-start">
          <div>
            <SectionHeading
              label="Common Problems"
              title={'Common ' + brand.name + ' Issues We Fix'}
            />
            <p className="mt-6 text-lg leading-relaxed text-slate-500">
              Our technicians are experienced with the most frequent failures seen on {brand.name} equipment in Dallas Fort Worth. Fast diagnosis, the right parts, and lasting repairs.
            </p>
          </div>
          <div className="mt-4 lg:mt-16">
            <CardList items={brand.commonIssues} delay={0.1} />
          </div>
        </div>
      </section>

      {/* ── Repair Services ──────────────────────────────────────────────────── */}
      <section className="border-t border-slate-200 bg-slate-50 px-6 py-24 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            label="Repair Services"
            title={brand.name + ' Repair Services'}
          />
          <div className="mt-10">
            <CardList items={brand.repairServices} />
          </div>
        </div>
      </section>

      {/* ── Maintenance ──────────────────────────────────────────────────────── */}
      <section className="border-t border-slate-200 bg-white px-6 py-24 lg:px-16">
        <div className="mx-auto max-w-7xl grid gap-16 lg:grid-cols-[1fr,1.1fr] lg:items-start">
          <div>
            <SectionHeading
              label="Preventative Maintenance"
              title={'Keep Your ' + brand.name + ' Running Longer'}
            />
            <p className="mt-6 text-lg leading-relaxed text-slate-500">
              Regular preventative maintenance extends equipment life, reduces downtime, and protects your investment. Our SmartGymOps-powered maintenance programs track every service visit and keep your {brand.name} equipment performing at its best.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/commercial-gym-maintenance"
                className="rounded-2xl border border-cyan-200 bg-cyan-50 px-6 py-4 text-sm font-black uppercase tracking-[0.12em] text-cyan-600 transition hover:bg-cyan-100"
              >
                View Maintenance Programs
              </Link>
              <Link
                href="https://smartgymops.com"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-2xl border border-slate-200 bg-white px-6 py-4 text-sm font-black uppercase tracking-[0.12em] text-slate-700 shadow-sm transition hover:border-cyan-300 hover:bg-cyan-50"
              >
                SmartGymOps ↗
              </Link>
            </div>
          </div>
          <div className="mt-4 lg:mt-16">
            <CardList items={brand.maintenancePrograms} delay={0.1} />
          </div>
        </div>
      </section>

      {/* ── Related Resources ────────────────────────────────────────────────── */}
      <section className="border-t border-slate-200 bg-slate-50 px-6 py-24 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <div className="flex items-center gap-3 mb-6">
              <span className="h-px w-8 bg-cyan-400" />
              <span className="text-xs font-black uppercase tracking-[0.3em] text-cyan-600">Related Resources</span>
            </div>
            <h2 className="text-3xl font-black leading-tight md:text-5xl">
              Manuals & Repair Guides
            </h2>
            <p className="mt-6 max-w-2xl text-lg text-slate-500">
              Access {brand.name} owner manuals, troubleshooting guides, and equipment resources in our library.
            </p>
          </Reveal>

          <motion.div
            variants={staggerContainer(0.1, 0.1)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-50px' }}
            className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {[
              { label: 'Search ' + brand.name + ' Manuals', href: '/manuals', desc: 'Owner manuals, parts diagrams, and troubleshooting guides' },
              { label: 'Read Repair Guides', href: '/blog', desc: 'Expert tips, common fixes, and maintenance advice' },
              { label: 'All Brands We Service', href: '/brands', desc: 'Browse all fitness equipment brands we repair' },
            ].map((item) => (
              <motion.div key={item.label} variants={staggerItem}>
                <Link
                  href={item.href}
                  className="block rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-cyan-300 hover:bg-cyan-50"
                >
                  <div className="text-base font-black text-slate-900">{item.label}</div>
                  <div className="mt-2 text-sm text-slate-500">{item.desc}</div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Final CTA, dark for contrast ────────────────────────────────────── */}
      <section className="relative overflow-hidden border-t border-slate-200 bg-slate-900 px-6 py-32 text-center text-white lg:px-16">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.1),transparent_55%)]" />
        <Reveal className="relative z-10 mx-auto max-w-4xl">
          <div className="flex items-center justify-center gap-3 mb-6">
            <span className="h-px w-8 bg-cyan-400" />
            <span className="text-xs font-black uppercase tracking-[0.3em] text-cyan-400">Ready To Schedule?</span>
            <span className="h-px w-8 bg-cyan-400" />
          </div>
          <h2 className="text-4xl font-black leading-tight md:text-6xl">
            Book {brand.name} Repair
            <span className="block text-white/45">With 2EZ TEK Today.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/60">
            Whether you need emergency repair, a preventative maintenance visit, or help diagnosing a problem, 2EZ TEK is ready to help with your {brand.name} equipment across Dallas Fort Worth.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <button
                type="button"
                onClick={() => window.dispatchEvent(new CustomEvent('open-booking-modal'))}
                className="block rounded-2xl bg-cyan-400 px-8 py-5 text-sm font-black uppercase tracking-[0.15em] text-black shadow-[0_0_40px_rgba(34,211,238,0.3)]"
              >
                Book Service Now
              </button>
            </motion.div>
            <a
              href={'tel:' + PHONE_TEL}
              className="rounded-2xl border border-white/20 bg-white/10 px-8 py-5 text-sm font-black uppercase tracking-[0.15em] text-white transition hover:border-white/40"
            >
              Call {PHONE_DISPLAY}
            </a>
          </div>
        </Reveal>
      </section>
    </main>
  )
}
