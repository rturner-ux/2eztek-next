'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number]

const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04, delayChildren: 0.1 } },
}
const staggerItem = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
}

const areas = [
  { name: 'Dallas', slug: 'dallas' },
  { name: 'Fort Worth', slug: 'fort-worth' },
  { name: 'Plano', slug: 'plano' },
  { name: 'Frisco', slug: 'frisco' },
  { name: 'Irving', slug: 'irving' },
  { name: 'Arlington', slug: 'arlington' },
  { name: 'Richardson', slug: 'richardson' },
  { name: 'McKinney', slug: 'mckinney' },
  { name: 'Garland', slug: 'garland' },
  { name: 'Mesquite', slug: 'mesquite' },
  { name: 'Carrollton', slug: 'carrollton' },
  { name: 'Addison', slug: 'addison' },
]

export default function AreasPage() {
  return (
    <main className="min-h-screen bg-[#050B14] text-white">

      {/* Hero — Ken Burns aerial */}
      <section className="relative overflow-hidden" style={{ height: 'clamp(600px, 90vh, 960px)' }}>

        <div className="absolute inset-0 overflow-hidden">
          <div className="h-full w-full" style={{ animation: 'kenBurns 40s ease-in-out infinite alternate' }}>
            <Image
              src="/images/rev.webp"
              alt="Dallas Fort Worth aerial"
              fill
              sizes="100vw"
              className="object-cover object-center"
              priority
            />
          </div>
        </div>

        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(5,11,20,1)_0%,rgba(5,11,20,0.6)_40%,rgba(5,11,20,0.15)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(5,11,20,0.7)_0%,transparent_55%)]" />

        <div className="relative z-10 flex h-full flex-col justify-between px-6 pt-32 pb-16 lg:px-16">

          {/* Headline */}
          <motion.div initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: EASE }}>
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-cyan-400" />
              <span className="text-xs font-black uppercase tracking-[0.3em] text-cyan-400">Dallas Fort Worth</span>
            </div>
            <h1 className="mt-4 max-w-3xl text-5xl font-black leading-tight md:text-7xl">
              Serving All Of DFW.
              <span className="block text-white/50">From Home Gyms To Commercial Facilities.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/65">
              2EZ TEK provides professional fitness equipment repair, assembly, and maintenance across the entire DFW metroplex.
            </p>
          </motion.div>

          {/* City cards */}
          <div>
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="show"
              className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6"
            >
              {areas.map((area) => (
                <motion.div key={area.slug} variants={staggerItem} whileHover={{ y: -3, scale: 1.02 }} transition={{ duration: 0.25, ease: EASE }}>
                  <Link
                    href={'/areas/' + area.slug}
                    className="group flex flex-col gap-1 border border-white/10 bg-white/[0.08] px-4 py-4 backdrop-blur-sm transition-all duration-300 hover:border-cyan-400/50 hover:bg-cyan-400/[0.1]"
                  >
                    <span className="text-sm font-black text-white transition-colors duration-300 group-hover:text-cyan-300">
                      {area.name}
                    </span>
                    <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-[0.18em] text-white/30 transition-colors duration-300 group-hover:text-cyan-400/70">
                      <svg className="h-2.5 w-2.5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                      </svg>
                      Service Area
                    </span>
                  </Link>
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6, ease: EASE }}
              className="mt-6 flex flex-wrap gap-4"
            >
              <button
                type="button"
                onClick={() => window.dispatchEvent(new CustomEvent('open-booking-modal'))}
                className="border border-cyan-400 bg-cyan-400/10 px-7 py-3 text-xs font-black uppercase tracking-[0.2em] text-cyan-200 backdrop-blur-sm transition hover:bg-cyan-400 hover:text-black"
              >
                Book Service
              </button>
              <a
                href="tel:9728077232"
                className="border border-white/20 bg-black/30 px-7 py-3 text-xs font-black uppercase tracking-[0.2em] text-white/70 backdrop-blur-sm transition hover:border-white/40 hover:text-white"
              >
                Call (972) 807-7232
              </a>
            </motion.div>
          </div>
        </div>

        <style>{`@keyframes kenBurns { 0% { transform: scale(1.0) translate(0%,0%); } 33% { transform: scale(1.08) translate(-1.5%,-1%); } 66% { transform: scale(1.05) translate(1%,-0.5%); } 100% { transform: scale(1.1) translate(-0.5%,1%); } }`}</style>
      </section>

      {/* Area details below fold */}
      <section className="border-t border-white/10 bg-[#050B14] px-6 py-20 lg:px-16">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-black md:text-5xl">
            Full Coverage Across Dallas Fort Worth
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-white/60">
            Whether you're in a high-rise apartment gym in Uptown Dallas, a corporate facility in Plano, or a home gym in Frisco, 2EZ TEK services your area with same-week availability in most cases.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent('open-booking-modal'))}
              className="button-glow rounded-2xl bg-cyan-400 px-8 py-4 text-sm font-black uppercase tracking-[0.12em] text-black transition hover:bg-cyan-300"
            >
              Book Service
            </button>
            <a
              href="tel:9728077232"
              className="rounded-2xl border border-white/10 bg-white/5 px-8 py-4 text-sm font-black uppercase tracking-[0.12em] text-white transition hover:border-cyan-400/30"
            >
              Call (972) 807-7232
            </a>
          </div>
        </div>
      </section>
    </main>
  )
}
