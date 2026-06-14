// app/brands/page.tsx
'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { brands } from '@/lib/brandData'
import BrandLogo from '@/components/BrandLogo'

const PHONE_TEL = '9728077232'
const PHONE_DISPLAY = '(972) 807-7232'

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number]

const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.055, delayChildren: 0.1 } },
}

const staggerItem = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE } },
}

export default function BrandsPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-white text-slate-900">

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-36 pb-24 lg:pt-44 lg:pb-32">
        <video autoPlay muted loop playsInline className="absolute inset-0 h-full w-full object-cover opacity-75">
          <source src="/videos/LA-Fitness-1.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/25" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,11,18,0.74)_0%,rgba(7,11,18,0.38)_46%,rgba(7,11,18,0.10)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.18),transparent_40%)]" />
        <div className="relative z-10 px-6 lg:px-16">
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
            className="max-w-5xl text-5xl font-black leading-[1] tracking-tight text-white md:text-7xl"
          >
            Fitness Equipment Brands
            <span className="block text-cyan-400">We Repair & Service</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.45, ease: EASE }}
            className="mt-8 max-w-3xl text-lg leading-relaxed text-white/70 md:text-xl"
          >
            2EZ TEK services all major residential and commercial fitness equipment brands across Dallas Fort Worth. Select a brand to learn more about the equipment types we service, common issues we fix, and repair programs we offer.
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
              className="rounded-2xl bg-cyan-400 px-8 py-5 text-sm font-black uppercase tracking-[0.12em] text-black transition hover:scale-105 active:scale-95"
            >
              Book Repair Service
            </button>
            <a
              href={'tel:' + PHONE_TEL}
              className="rounded-2xl border border-cyan-200 bg-cyan-50 px-8 py-5 text-sm font-black uppercase tracking-[0.12em] text-cyan-600 transition hover:bg-cyan-100"
            >
              Call {PHONE_DISPLAY}
            </a>
          </motion.div>
        </div>
      </section>

      {/* ── Brand Grid ──────────────────────────────────────────────────── */}
      <section className="border-t border-slate-200 bg-slate-50 px-6 py-24 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-60px' }}
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          >
            {brands.map((brand) => (
              <motion.div
                key={brand.slug}
                variants={staggerItem}
                whileHover={{ y: -5 }}
                transition={{ duration: 0.3, ease: EASE }}
              >
                <Link
                  href={'/brands/' + brand.slug}
                  className="group flex flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:border-cyan-300 hover:bg-cyan-50"
                >
                  <BrandLogo slug={brand.slug} name={brand.name} />
                  <div className="mt-4 text-lg font-black text-slate-900 transition-colors duration-300 group-hover:text-cyan-600">
                    {brand.name}
                  </div>
                  <div className="mt-1.5 border-l-2 border-cyan-300 pl-2 text-xs font-black uppercase tracking-[0.18em] text-slate-400 transition-colors duration-300 group-hover:border-cyan-400 group-hover:text-cyan-600">
                    View Repair Page →
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-slate-500 line-clamp-2">
                    {brand.tagline}
                  </p>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── CTA — dark for contrast ─────────────────────────────────────── */}
      <section className="border-t border-slate-200 bg-slate-900 px-6 py-24 text-center text-white lg:px-16">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center justify-center gap-3 mb-6">
            <span className="h-px w-8 bg-cyan-400" />
            <span className="text-xs font-black uppercase tracking-[0.3em] text-cyan-400">
              Don't See Your Brand?
            </span>
            <span className="h-px w-8 bg-cyan-400" />
          </div>
          <h2 className="text-4xl font-black leading-tight md:text-6xl">
            We Service Many More Brands.
            <span className="block text-white/45">Call Us To Confirm.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/60">
            If your brand isn't listed, chances are we still service it. Call our team or submit a service request and we'll confirm availability for your equipment.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent('open-booking-modal'))}
              className="rounded-2xl bg-cyan-400 px-8 py-5 text-sm font-black uppercase tracking-[0.15em] text-black transition hover:scale-105 active:scale-95"
            >
              Book Service
            </button>
            <a
              href={'tel:' + PHONE_TEL}
              className="rounded-2xl border border-white/20 bg-white/10 px-8 py-5 text-sm font-black uppercase tracking-[0.15em] text-white transition hover:border-white/40"
            >
              Call {PHONE_DISPLAY}
            </a>
          </div>
        </div>
      </section>
    </main>
  )
}
