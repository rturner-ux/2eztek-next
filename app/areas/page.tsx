'use client'

import type React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { areas as areaData } from '@/lib/areaData'

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number]

const areas = areaData.map((a) => ({
  name: a.name,
  slug: a.slug,
  desc: a.landmarks.slice(0, 4).join(', ') + ` & all ${a.name}`,
}))


function CityRow({ area, index }: { area: typeof areas[0]; index: number }) {
  const [hovered, setHovered] = useState(false)
  const num = String(index + 1).padStart(2, '0')

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.6, delay: index * 0.04, ease: EASE }}
    >
      <Link
        href={'/areas/' + area.slug}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="group relative flex items-center gap-6 border-b border-slate-200 py-6 transition-colors duration-300 hover:border-cyan-300 lg:py-7"
      >
        <motion.div
          animate={{ scaleX: hovered ? 1 : 0 }}
          transition={{ duration: 0.35, ease: EASE }}
          style={{ originX: 0 }}
          className="absolute inset-0 -z-10 bg-cyan-50"
        />
        <span className="w-10 flex-shrink-0 text-sm font-black uppercase tracking-[0.2em] text-slate-400 transition-colors duration-300 group-hover:text-cyan-600">
          {num}
        </span>
        <span className="min-w-[160px] text-2xl font-black text-slate-900 transition-colors duration-300 group-hover:text-cyan-600 md:text-3xl lg:text-4xl">
          {area.name}
        </span>
        <span className="hidden flex-1 text-sm text-slate-500 transition-colors duration-300 group-hover:text-slate-700 lg:block">
          {area.desc}
        </span>
        <motion.span
          animate={{ x: hovered ? 6 : 0, opacity: hovered ? 1 : 0.4 }}
          transition={{ duration: 0.25 }}
          className="ml-auto flex-shrink-0 text-lg text-cyan-600"
        >
          →
        </motion.span>
      </Link>
    </motion.div>
  )
}

export default function AreasPage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">

      {/* ── Image Hero ── */}
      <section className="relative h-screen overflow-hidden">

        <img
          src="/images/areas-hero.webp"
          alt="Dallas Fort Worth fitness equipment repair"
          className="absolute inset-0 h-full w-full object-cover"
        />

        <div className="absolute inset-0 bg-black/40" />

        {/* Centered content, matches Precor contentContainer */}
        <div className="relative z-10 flex h-full flex-col items-center justify-center px-[60px] text-center">

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
            className="mb-6 inline-flex items-center gap-3"
          >
            <span className="h-px w-8 bg-cyan-400" />
            <span className="text-[10px] font-black uppercase tracking-[0.35em] text-cyan-300">Service Coverage</span>
            <span className="h-px w-8 bg-cyan-400" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.1, ease: EASE }}
            className="text-5xl font-black leading-tight tracking-tight text-white md:text-7xl lg:text-8xl"
          >
            Dallas<br />
            <span className="text-cyan-400">Fort Worth.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.25, ease: EASE }}
            className="mt-6 max-w-xl text-lg leading-relaxed text-white/80"
          >
            Professional fitness equipment repair, assembly, and maintenance across 27 cities and the entire DFW metroplex.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.4, ease: EASE }}
            className="mt-10 flex flex-wrap items-center justify-center gap-12"
          >
            {[
              { stat: '27', label: 'Cities Covered' },
              { stat: '500+', label: 'Five-Star Reviews' },
              { stat: 'Same Week', label: 'In Most Cases' },
            ].map(({ stat, label }) => (
              <div key={label} className="text-center">
                <div className="text-3xl font-black text-white md:text-4xl">{stat}</div>
                <div className="mt-1 text-[10px] font-black uppercase tracking-[0.25em] text-white/60">{label}</div>
              </div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.55, ease: EASE }}
            className="mt-10 flex gap-4"
          >
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent('open-booking-modal'))}
              className="bg-cyan-400 px-7 py-3 text-[11px] font-bold uppercase tracking-[0.15em] text-black transition-colors hover:bg-cyan-300"
            >
              Book Service
            </button>
            <a
              href="tel:9728077232"
              className="border border-white/30 bg-white/10 px-7 py-3 text-[11px] font-bold uppercase tracking-[0.15em] text-white backdrop-blur-sm transition-colors hover:border-white/60 hover:bg-white/20"
            >
              (972) 807-7232
            </a>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0 }}
          className="absolute bottom-8 left-1/2 z-20 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/40">Scroll</span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.4, repeat: Infinity }}
            className="h-4 w-px bg-white/30"
          />
        </motion.div>
      </section>

      {/* ── Cities list ── */}
      <section className="px-6 py-16 lg:px-16">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Coverage Areas</span>
          </div>
          {areas.map((area, i) => (
            <CityRow key={area.slug} area={area} index={i} />
          ))}
        </div>
      </section>

      {/* ── Bottom CTA, dark for contrast ── */}
      <section className="border-t border-slate-200 bg-slate-900 px-6 py-20 text-white lg:px-16">
        <div className="mx-auto max-w-6xl flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-400">Don&apos;t see your city?</div>
            <p className="mt-2 max-w-xl text-lg text-white/70">
              We cover all of DFW. Call us and we will confirm coverage for your area.
            </p>
          </div>
          <div className="flex flex-wrap gap-4">
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent('open-booking-modal'))}
              className="bg-cyan-400 px-8 py-4 text-sm font-black uppercase tracking-[0.12em] text-black transition-colors hover:bg-cyan-300"
            >
              Book Service
            </button>
            <a
              href="tel:9728077232"
              className="border border-white/25 px-8 py-4 text-sm font-black uppercase tracking-[0.12em] text-white transition-colors hover:border-white/50"
            >
              (972) 807-7232
            </a>
          </div>
        </div>
      </section>

    </main>
  )
}
