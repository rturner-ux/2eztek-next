'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { useState } from 'react'

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number]

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
        className="group relative flex items-center gap-6 border-b border-white/10 py-6 transition-colors duration-300 hover:border-cyan-400/30 lg:py-7"
      >
        <motion.div
          animate={{ scaleX: hovered ? 1 : 0 }}
          transition={{ duration: 0.35, ease: EASE }}
          style={{ originX: 0 }}
          className="absolute inset-0 -z-10 bg-white/[0.04]"
        />
        <span className="w-10 flex-shrink-0 text-sm font-black uppercase tracking-[0.2em] text-white/30 transition-colors duration-300 group-hover:text-cyan-400/70">
          {num}
        </span>
        <span className="min-w-[160px] text-2xl font-black text-white transition-colors duration-300 group-hover:text-cyan-300 md:text-3xl lg:text-4xl">
          {area.name}
        </span>
        <span className="hidden flex-1 text-sm text-white/50 transition-colors duration-300 group-hover:text-white/70 lg:block">
          {area.desc}
        </span>
        <motion.span
          animate={{ x: hovered ? 6 : 0, opacity: hovered ? 1 : 0.4 }}
          transition={{ duration: 0.25 }}
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

      {/* Fixed video — stays in place while page scrolls */}
      <div className="fixed inset-0 -z-10">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="h-full w-full object-cover"
        >
          <source src="/videos/dallas-night.mp4" type="video/mp4" />
        </video>
      </div>

      {/* Hero */}
      <section className="flex min-h-[85vh] flex-col justify-between px-6 pb-16 pt-36 lg:px-16 lg:pt-44">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: EASE }}
        >
          <div className="flex items-center gap-3">
            <span className="h-px w-10 bg-cyan-400" />
            <span className="text-xs font-black uppercase tracking-[0.3em] text-cyan-400">Service Coverage</span>
          </div>
          <h1 className="mt-6 text-6xl font-black leading-[0.9] tracking-tight md:text-8xl lg:text-[9rem]">
            Dallas
            <span className="block text-cyan-400">Fort Worth.</span>
          </h1>
          <p className="mt-8 max-w-lg text-lg leading-relaxed text-white/80">
            Professional fitness equipment repair, assembly, and maintenance across 12 cities and the entire DFW metroplex.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.4, ease: EASE }}
          className="flex flex-wrap items-center gap-10"
        >
          {[
            { stat: '12', label: 'Cities Covered' },
            { stat: '500+', label: 'Five-Star Reviews' },
            { stat: 'Same Week', label: 'In Most Cases' },
          ].map(({ stat, label }) => (
            <div key={label}>
              <div className="text-3xl font-black text-white md:text-4xl">{stat}</div>
              <div className="mt-1 text-xs font-black uppercase tracking-[0.2em] text-white/50">{label}</div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Cities list — solid bg so text stays readable as video shows behind */}
      <section className="bg-[#050B14]/90 px-6 pb-4 backdrop-blur-sm lg:px-16">
        <div className="mx-auto max-w-6xl">
          {areas.map((area, i) => (
            <CityRow key={area.slug} area={area} index={i} />
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-[#050B14]/90 px-6 py-24 backdrop-blur-sm lg:px-16">
        <div className="mx-auto max-w-6xl flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-xs font-black uppercase tracking-[0.3em] text-cyan-400">Don&apos;t see your city?</div>
            <p className="mt-2 max-w-xl text-lg text-white/70">
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
              className="rounded-2xl border border-white/20 bg-white/5 px-8 py-4 text-sm font-black uppercase tracking-[0.12em] text-white transition hover:border-cyan-400/30"
            >
              (972) 807-7232
            </a>
          </div>
        </div>
      </section>

    </main>
  )
}
