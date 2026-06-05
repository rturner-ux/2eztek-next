// app/[slug]/ServiceContent.tsx
'use client'

import Link from 'next/link'
import Script from 'next/script'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import type { ServiceData } from '@/lib/serviceData'

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
          className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.05] px-5 py-4 text-sm font-semibold text-white/70"
        >
          <span className="mt-0.5 h-2 w-2 flex-shrink-0 rounded-full bg-cyan-400" />
          {item}
        </motion.li>
      ))}
    </motion.ul>
  )
}

function SectionHeading({ label, title }: { label: string; title: string }) {
  return (
    <Reveal>
      <div className="flex items-center gap-3 mb-6">
        <span className="h-px w-8 bg-cyan-400" />
        <span className="text-xs font-black uppercase tracking-[0.3em] text-cyan-400">{label}</span>
      </div>
      <h2 className="text-3xl font-black leading-tight md:text-5xl">{title}</h2>
    </Reveal>
  )
}

export default function ServiceContent({ service }: { service: ServiceData }) {
  const serviceSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Service',
        name: service.name,
        provider: {
          '@type': 'LocalBusiness',
          '@id': 'https://www.2eztek.com/#localbusiness',
        },
        areaServed: { '@type': 'Place', name: 'Dallas Fort Worth, TX' },
        description: service.metaDescription,
        url: 'https://www.2eztek.com/' + service.slug,
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.2eztek.com' },
          { '@type': 'ListItem', position: 2, name: 'Services', item: 'https://www.2eztek.com/services' },
          { '@type': 'ListItem', position: 3, name: service.name, item: 'https://www.2eztek.com/' + service.slug },
        ],
      },
    ],
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#070B12] text-white">
      <Script
        id={'service-schema-' + service.slug}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-36 pb-24 lg:pt-44 lg:pb-32">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.18),transparent_40%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(34,211,238,0.06),transparent_40%)]" />
        <div className="relative z-10 px-6 lg:px-16">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
            className="mb-10 flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-white/35"
          >
            <Link href="/" className="transition hover:text-cyan-400">Home</Link>
            <span>/</span>
            <span className="text-white/60">{service.shortName}</span>
          </motion.div>

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
              className="text-xs font-black uppercase tracking-[0.3em] text-cyan-400"
            >
              Dallas Fort Worth Fitness Equipment Experts
            </motion.span>
          </div>

          <motion.h1
            initial={{ opacity: 0, y: 48 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, delay: 0.2, ease: EASE }}
            className="max-w-5xl text-5xl font-black leading-[1] tracking-tight md:text-7xl"
          >
            {service.shortName}
            <span className="block text-cyan-400">In Dallas Fort Worth</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.45, ease: EASE }}
            className="mt-8 max-w-3xl text-lg leading-relaxed text-white/70 md:text-xl"
          >
            {service.overview}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6, ease: EASE }}
            className="mt-10 flex flex-wrap gap-4"
          >
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent('open-booking-modal'))}
              className="button-glow rounded-2xl bg-cyan-400 px-8 py-5 text-sm font-black uppercase tracking-[0.12em] text-black transition hover:scale-105 active:scale-95"
            >
              Book {service.shortName}
            </button>
            <a
              href={'tel:' + PHONE_TEL}
              className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-8 py-5 text-sm font-black uppercase tracking-[0.12em] text-cyan-200 transition hover:bg-cyan-400/15"
            >
              Call {PHONE_DISPLAY}
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.75, ease: EASE }}
            className="mt-14 flex flex-wrap gap-6 border-t border-white/10 pt-10"
          >
            {[
              ['10K+', 'Machines Serviced'],
              ['500+', '5-Star Reviews'],
              ['24/7', 'Emergency Support'],
              ['DFW', 'Coverage Area'],
            ].map(([val, label]) => (
              <div key={label} className="min-w-[100px]">
                <div className="text-2xl font-black text-cyan-400">{val}</div>
                <div className="mt-1 text-xs text-white/45 uppercase tracking-[0.15em]">{label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Equipment Types ─────────────────────────────────────────── */}
      <section className="border-t border-white/10 bg-[#0B1220] px-6 py-24 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <SectionHeading label="Equipment We Service" title={'Types of ' + service.shortName} />
          <div className="mt-10"><CardList items={service.equipmentTypes} /></div>
        </div>
      </section>

      {/* ── Common Issues ───────────────────────────────────────────── */}
      <section className="border-t border-white/10 bg-[#070B12] px-6 py-24 lg:px-16">
        <div className="mx-auto max-w-7xl grid gap-16 lg:grid-cols-2 lg:items-start">
          <div>
            <SectionHeading label="Common Problems" title="Common Issues We Fix" />
            <p className="mt-6 text-lg leading-relaxed text-white/60">
              Our technicians are experienced with the most frequent failures seen on fitness equipment across Dallas Fort Worth. Fast diagnosis, quality parts, lasting repairs.
            </p>
          </div>
          <div className="mt-4 lg:mt-16">
            <CardList items={service.commonIssues} />
          </div>
        </div>
      </section>

      {/* ── Repair Services ─────────────────────────────────────────── */}
      <section className="border-t border-white/10 bg-[#07101D] px-6 py-24 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <SectionHeading label="What We Do" title={'Our ' + service.shortName + ' Services'} />
          <div className="mt-10"><CardList items={service.repairServices} /></div>
        </div>
      </section>

      {/* ── Why Choose Us ───────────────────────────────────────────── */}
      <section className="border-t border-white/10 bg-[#050B14] px-6 py-24 lg:px-16">
        <div className="mx-auto max-w-7xl grid gap-16 lg:grid-cols-[1fr,1.1fr] lg:items-start">
          <div>
            <SectionHeading label="Why 2EZ TEK" title={'Why Choose Us For ' + service.shortName} />
            <p className="mt-6 text-lg leading-relaxed text-white/60">
              2EZ TEK has serviced thousands of machines across Dallas Fort Worth. We show up on time, diagnose accurately, and fix it right. Every job is backed by SmartGymOps service tracking.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button type="button" onClick={() => window.dispatchEvent(new CustomEvent('open-booking-modal'))} className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-6 py-4 text-sm font-black uppercase tracking-[0.12em] text-cyan-200 transition hover:bg-cyan-400/15">
                Book Service
              </button>
              <Link href="/brands" className="rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-sm font-black uppercase tracking-[0.12em] text-white transition hover:border-cyan-400/30 hover:bg-cyan-400/10">
                Brands We Service
              </Link>
            </div>
          </div>
          <div className="mt-4 lg:mt-16">
            <CardList items={service.whyChooseUs} />
          </div>
        </div>
      </section>

      {/* ── Related Services ────────────────────────────────────────── */}
      <section className="border-t border-white/10 bg-[#0B1220] px-6 py-24 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <div className="flex items-center gap-3 mb-6">
              <span className="h-px w-8 bg-cyan-400" />
              <span className="text-xs font-black uppercase tracking-[0.3em] text-cyan-400">More Services</span>
            </div>
            <h2 className="text-3xl font-black leading-tight md:text-5xl">Related Services</h2>
          </Reveal>
          <motion.div
            variants={staggerContainer(0.08, 0.1)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-50px' }}
            className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {[
              { label: 'Treadmill Repair', href: '/treadmill-repair-dallas' },
              { label: 'Elliptical Repair', href: '/elliptical-repair-dallas' },
              { label: 'Exercise Bike Repair', href: '/exercise-bike-repair-dallas' },
              { label: 'Strength Equipment Repair', href: '/strength-equipment-repair-dallas' },
              { label: 'Commercial Gym Maintenance', href: '/commercial-gym-maintenance' },
              { label: 'Equipment Assembly', href: '/fitness-equipment-assembly-dallas' },
            ]
              .filter((s) => s.href !== '/' + service.slug)
              .slice(0, 5)
              .map((s) => (
                <motion.div key={s.label} variants={staggerItem}>
                  <Link
                    href={s.href}
                    className="block rounded-3xl border border-white/10 bg-white/[0.05] p-6 transition hover:border-cyan-400/30 hover:bg-cyan-400/[0.04]"
                  >
                    <div className="text-base font-black text-white">{s.label}</div>
                    <div className="mt-1 text-sm text-white/45">Dallas Fort Worth</div>
                  </Link>
                </motion.div>
              ))}
          </motion.div>
        </div>
      </section>

      {/* ── Final CTA ───────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-t border-white/10 bg-[#070B12] px-6 py-32 text-center lg:px-16">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.1),transparent_55%)]" />
        <Reveal className="relative z-10 mx-auto max-w-4xl">
          <div className="flex items-center justify-center gap-3 mb-6">
            <span className="h-px w-8 bg-cyan-400" />
            <span className="text-xs font-black uppercase tracking-[0.3em] text-cyan-400">Ready To Schedule?</span>
            <span className="h-px w-8 bg-cyan-400" />
          </div>
          <h2 className="text-4xl font-black leading-tight md:text-6xl">
            Book {service.shortName}
            <span className="block text-white/45">With 2EZ TEK Today.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/60">
            Whether you need emergency repair, a preventative maintenance visit, or help diagnosing a problem, 2EZ TEK is ready to help across Dallas Fort Worth.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <button
                type="button"
                onClick={() => window.dispatchEvent(new CustomEvent('open-booking-modal'))}
                className="button-glow block rounded-2xl bg-cyan-400 px-8 py-5 text-sm font-black uppercase tracking-[0.15em] text-black shadow-[0_0_40px_rgba(34,211,238,0.3)]"
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
