'use client'

import type React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useState } from 'react'

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number]
const TS = { textShadow: '0 1px 8px rgba(0,0,0,1), 0 2px 24px rgba(0,0,0,0.9)' }

const DROP = (delay: number) => ({
  initial: { y: -110, opacity: 0 },
  animate: { y: 0, opacity: 1 },
  transition: { type: 'spring' as const, stiffness: 52, damping: 13, mass: 1.3, delay },
})

const H1_3D: React.CSSProperties = {
  WebkitTextStroke: '1.5px rgba(255,255,255,0.80)',
  color: 'transparent',
  textShadow: [
    '2px 2px 0 rgba(255,255,255,0.10)',
    '4px 4px 0 rgba(255,255,255,0.07)',
    '6px 6px 0 rgba(0,0,0,0.30)',
    '8px 8px 0 rgba(0,0,0,0.22)',
    '10px 10px 20px rgba(0,0,0,0.40)',
  ].join(', '),
}

const CYAN_3D: React.CSSProperties = {
  WebkitTextStroke: '1.5px rgba(34,211,238,0.85)',
  color: 'transparent',
  textShadow: [
    '2px 2px 0 rgba(34,211,238,0.12)',
    '4px 4px 0 rgba(34,211,238,0.07)',
    '6px 6px 0 rgba(0,0,0,0.28)',
    '8px 8px 0 rgba(0,0,0,0.20)',
    '10px 10px 20px rgba(0,0,0,0.38)',
  ].join(', '),
}

const areas = [
  { name: 'Dallas', slug: 'dallas', desc: 'Uptown, Oak Cliff, Deep Ellum, Lake Highlands & all Dallas neighborhoods' },
  { name: 'Fort Worth', slug: 'fort-worth', desc: 'Cultural District, Sundance Square, TCU area & all Fort Worth' },
  { name: 'Plano', slug: 'plano', desc: 'Legacy, West Plano, Downtown Plano & surrounding areas' },
  { name: 'Frisco', slug: 'frisco', desc: 'The Star, Stonebriar, North Frisco & all of Frisco' },
  { name: 'Irving', slug: 'irving', desc: 'Las Colinas, Valley Ranch, DFW Corridor & Irving proper' },
  { name: 'Arlington', slug: 'arlington', desc: 'Entertainment District, Pantego, Dalworthington & surrounding' },
  { name: 'Richardson', slug: 'richardson', desc: 'Telecom Corridor, Arapaho, Canyon Creek & all Richardson' },
  { name: 'McKinney', slug: 'mckinney', desc: 'Historic Downtown, Craig Ranch, West McKinney & all areas' },
  { name: 'Garland', slug: 'garland', desc: 'Duck Creek, Sachse, Rowlett adjacent & all Garland' },
  { name: 'Mesquite', slug: 'mesquite', desc: 'Town East, Mesquite Rodeo area & all Mesquite neighborhoods' },
  { name: 'Carrollton', slug: 'carrollton', desc: 'Farmers Branch, Addison adjacent, Old Town & all Carrollton' },
  { name: 'Addison', slug: 'addison', desc: 'Restaurant Row, Addison Circle & full Addison coverage' },
]

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
        className="group relative flex items-center gap-6 border-b border-white/20 py-6 transition-colors duration-300 hover:border-cyan-400/50 lg:py-7"
      >
        <motion.div
          animate={{ scaleX: hovered ? 1 : 0 }}
          transition={{ duration: 0.35, ease: EASE }}
          style={{ originX: 0 }}
          className="absolute inset-0 -z-10 bg-black/30"
        />
        <span style={TS} className="w-10 flex-shrink-0 text-sm font-black uppercase tracking-[0.2em] text-white/60 transition-colors duration-300 group-hover:text-cyan-400">
          {num}
        </span>
        <span style={TS} className="min-w-[160px] text-2xl font-black text-white transition-colors duration-300 group-hover:text-cyan-300 md:text-3xl lg:text-4xl">
          {area.name}
        </span>
        <span style={TS} className="hidden flex-1 text-sm text-white/80 transition-colors duration-300 group-hover:text-white lg:block">
          {area.desc}
        </span>
        <motion.span
          animate={{ x: hovered ? 6 : 0, opacity: hovered ? 1 : 0.6 }}
          transition={{ duration: 0.25 }}
          style={TS}
          className="ml-auto flex-shrink-0 text-lg text-cyan-400"
        >
          →
        </motion.span>
      </Link>
    </motion.div>
  )
}

export default function AreasPage() {
  return (
    <main className="relative min-h-screen text-white">

      {/* Fixed video */}
      <div className="fixed inset-0 -z-10">
        <video autoPlay muted loop playsInline className="h-full w-full object-cover">
          <source src="/videos/LA-Fitness-1.mp4" type="video/mp4" />
        </video>
      </div>

      {/* Hero */}
      <section className="flex min-h-[85vh] flex-col justify-between px-6 pb-16 pt-36 lg:px-16 lg:pt-44">
        <div>
          {/* Eyebrow — slides in from left */}
          <motion.div
            initial={{ opacity: 0, x: -28 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.05 }}
            className="flex items-center gap-3"
          >
            <span className="h-px w-10 bg-cyan-400" />
            <span style={TS} className="text-xs font-black uppercase tracking-[0.3em] text-cyan-400">Service Coverage</span>
          </motion.div>

          {/* Title — each line drops in from above */}
          <h1 className="mt-6 overflow-hidden text-5xl font-extralight leading-[0.95] tracking-widest md:text-7xl lg:text-[7.5rem]">
            <motion.span {...DROP(0.18)} style={H1_3D} className="block">
              Dallas
            </motion.span>
            <motion.span {...DROP(0.42)} style={CYAN_3D} className="block">
              Fort Worth.
            </motion.span>
          </h1>

          {/* Description — fades up after title lands */}
          <motion.p
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.82, ease: EASE }}
            style={TS}
            className="mt-8 max-w-lg text-lg leading-relaxed text-white"
          >
            Professional fitness equipment repair, assembly, and maintenance across 12 cities and the entire DFW metroplex.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 1.0, ease: EASE }}
          className="flex flex-wrap items-center gap-10"
        >
          {[
            { stat: '12', label: 'Cities Covered' },
            { stat: '500+', label: 'Five-Star Reviews' },
            { stat: 'Same Week', label: 'In Most Cases' },
          ].map(({ stat, label }) => (
            <div key={label}>
              <div style={TS} className="text-3xl font-black text-white md:text-4xl">{stat}</div>
              <div style={TS} className="mt-1 text-xs font-black uppercase tracking-[0.2em] text-white/70">{label}</div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Cities list */}
      <section className="px-6 pb-4 lg:px-16">
        <div className="mx-auto max-w-6xl">
          {areas.map((area, i) => (
            <CityRow key={area.slug} area={area} index={i} />
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="px-6 py-24 lg:px-16">
        <div className="mx-auto max-w-6xl flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <div>
            <div style={TS} className="text-xs font-black uppercase tracking-[0.3em] text-cyan-400">Don&apos;t see your city?</div>
            <p style={TS} className="mt-2 max-w-xl text-lg text-white">
              We cover all of DFW. Call us and we will confirm coverage for your area.
            </p>
          </div>
          <div className="flex flex-wrap gap-4">
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent('open-booking-modal'))}
              className="button-glow rounded-2xl bg-cyan-400 px-8 py-4 text-sm font-black uppercase tracking-[0.12em] text-black transition hover:bg-cyan-300"
            >
              Book Service
            </button>
            <a
              href="tel:9728077232"
              className="rounded-2xl border border-white/40 bg-black/30 px-8 py-4 text-sm font-black uppercase tracking-[0.12em] text-white backdrop-blur-sm transition hover:border-white/60"
            >
              (972) 807-7232
            </a>
          </div>
        </div>
      </section>

    </main>
  )
}
