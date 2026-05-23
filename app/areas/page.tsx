// app/areas/page.tsx
'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { areas } from '@/lib/areaData'

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

export default function AreasPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#070B12] text-white">

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-36 pb-24 lg:pt-44 lg:pb-32">
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
              Dallas Fort Worth Service Areas
            </motion.span>
          </div>

          <motion.h1
            initial={{ opacity: 0, y: 48 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, delay: 0.2, ease: EASE }}
            className="max-w-5xl text-5xl font-black leading-[1] tracking-tight md:text-7xl"
          >
            Fitness Equipment Repair
            <span className="block text-cyan-400">Across Dallas Fort Worth</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.45, ease: EASE }}
            className="mt-8 max-w-3xl text-lg leading-relaxed text-white/70 md:text-xl"
          >
            2EZ TEK provides professional fitness equipment repair, assembly, and commercial maintenance throughout the Dallas Fort Worth metroplex. Select your city to learn more about the services we offer in your area.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6, ease: EASE }}
            className="mt-10 flex flex-wrap gap-4"
          >
            <Link
              href="/contact"
              className="button-glow rounded-2xl bg-cyan-400 px-8 py-5 text-sm font-black uppercase tracking-[0.12em] text-black transition hover:scale-105 active:scale-95"
            >
              Book Repair Service
            </Link>
            <a
              href={'tel:' + PHONE_TEL}
              className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-8 py-5 text-sm font-black uppercase tracking-[0.12em] text-cyan-200 transition hover:bg-cyan-400/15"
            >
              Call {PHONE_DISPLAY}
            </a>
          </motion.div>
        </div>
      </section>

      {/* ── Areas Grid ────────────────────────────────────────────────── */}
      <section className="border-t border-white/10 bg-[#0B1220] px-6 py-24 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-60px' }}
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          >
            {areas.map((area) => (
              <motion.div
                key={area.slug}
                variants={staggerItem}
                whileHover={{ y: -5 }}
                transition={{ duration: 0.3, ease: EASE }}
              >
                <Link
                  href={'/areas/' + area.slug}
                  className="group flex flex-col rounded-3xl border border-white/10 bg-white/[0.05] p-6 transition-all duration-300 hover:border-cyan-400/35 hover:bg-cyan-400/[0.06]"
                >
                  <div className="text-lg font-black text-white transition-colors duration-300 group-hover:text-cyan-300">
                    {area.name}
                  </div>
                  <div className="mt-1 text-xs text-white/40">{area.county}</div>
                  <div className="mt-3 border-l-2 border-cyan-400/40 pl-2 text-xs font-black uppercase tracking-[0.18em] text-white/30 transition-colors duration-300 group-hover:border-cyan-400 group-hover:text-cyan-400/70">
                    View Service Area →
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-white/45 line-clamp-2">
                    {area.metaDescription}
                  </p>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────── */}
      <section className="border-t border-white/10 bg-[#07101D] px-6 py-24 text-center lg:px-16">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center justify-center gap-3 mb-6">
            <span className="h-px w-8 bg-cyan-400" />
            <span className="text-xs font-black uppercase tracking-[0.3em] text-cyan-400">
              Don't See Your City?
            </span>
            <span className="h-px w-8 bg-cyan-400" />
          </div>
          <h2 className="text-4xl font-black leading-tight md:text-6xl">
            We Cover All of DFW.
            <span className="block text-white/45">Call To Confirm.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/60">
            If your city isn't listed, we likely still service your area. Call our team to confirm availability.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              href="/contact"
              className="button-glow rounded-2xl bg-cyan-400 px-8 py-5 text-sm font-black uppercase tracking-[0.15em] text-black transition hover:scale-105 active:scale-95"
            >
              Contact Us
            </Link>
            <a
              href={'tel:' + PHONE_TEL}
              className="rounded-2xl border border-white/10 bg-white/5 px-8 py-5 text-sm font-black uppercase tracking-[0.15em] text-white transition hover:border-cyan-400/30 hover:bg-cyan-400/10"
            >
              Call {PHONE_DISPLAY}
            </a>
          </div>
        </div>
      </section>
    </main>
  )
}
