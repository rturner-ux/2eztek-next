'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import BeforeAfterSlider from '@/components/BeforeAfterSlider'

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number]

const projects = [
  {
    before: '/images/before-1.webp',
    after: '/images/project-1.webp',
    title: 'Luxury Functional Trainer Build',
    category: 'Residential',
    location: 'Dallas, TX',
    description: 'Full assembly, anchoring, and cable calibration of a premium functional trainer system.',
  },
  {
    before: '/images/before-2.webp',
    after: '/images/project-2.webp',
    title: 'PRx Space Saving System',
    category: 'Garage Gym',
    location: 'Plano, TX',
    description: 'Wall-mount rack assembly and barbell system installation for a clean garage conversion.',
  },
  {
    before: '/images/before-3.webp',
    after: '/images/project-3.webp',
    title: 'Commercial Strength Floor',
    category: 'Commercial',
    location: 'Frisco, TX',
    description: 'Multi-rack installation and rubber flooring layout for a full commercial performance floor.',
  },
  {
    before: '/images/before-4.webp',
    after: '/images/project-4.webp',
    title: 'StairMaster Cardio Bank',
    category: 'Commercial',
    location: 'Irving, TX',
    description: 'Eight StairMaster units delivered, assembled, and tested for a mid-size health club.',
  },
  {
    before: '/images/before-5.webp',
    after: '/images/project-5.webp',
    title: 'Modern Home Fitness Room',
    category: 'Residential',
    location: 'McKinney, TX',
    description: 'Complete treadmill, elliptical, and cable machine setup in a dedicated home fitness room.',
  },
  {
    before: '/images/before-6.webp',
    after: '/images/project-6.webp',
    title: 'Multi-Station Cable System',
    category: 'Commercial',
    location: 'Arlington, TX',
    description: 'Custom dual-stack cable system assembled, leveled, and tested for full commercial use.',
  },
]

const CATEGORIES = ['All', 'Residential', 'Commercial', 'Garage Gym']

export default function ProjectsClient() {
  const [active, setActive] = useState('All')
  const filtered = active === 'All' ? projects : projects.filter((p) => p.category === active)

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050B14] text-white">

      {/* Fixed background */}
      <div className="fixed inset-0 -z-10">
        <img src="/images/project-3.webp" alt="" className="h-full w-full object-cover opacity-[0.18]" />
        <div className="absolute inset-0 bg-black/60" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.12),transparent_40%)]" />
      </div>

      {/* Hero */}
      <section className="px-6 pb-16 pt-32 lg:px-16 lg:pt-44">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE }}
          >
            <div className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-5 py-2 text-xs font-black uppercase tracking-[0.28em] text-cyan-300">
              Before &amp; After
            </div>
            <h1 className="mt-7 text-5xl font-black leading-[0.92] tracking-tight md:text-7xl">
              Real Jobs.
              <span className="block text-white/50">Real Results.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/65">
              Drag the slider on each photo to see exactly what we walked into and what we left behind.
              Every project completed across Dallas Fort Worth.
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: EASE }}
            className="mt-12 flex flex-wrap gap-4"
          >
            {[
              ['10K+', 'Machines Serviced'],
              ['500+', 'Five-Star Reviews'],
              ['6', 'Cities Shown'],
              ['DFW', 'Coverage Area'],
            ].map(([stat, label]) => (
              <div key={label} className="rounded-[2rem] border border-white/10 bg-black/20 px-6 py-5 backdrop-blur-xl">
                <div className="text-3xl font-black text-cyan-300">{stat}</div>
                <div className="mt-1 text-xs font-black uppercase tracking-[0.14em] text-white/50">{label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Filter tabs */}
      <section className="px-6 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap gap-2 border-b border-white/10 pb-6">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActive(cat)}
                className={`rounded-xl px-5 py-2.5 text-xs font-black uppercase tracking-[0.18em] transition ${
                  active === cat
                    ? 'bg-cyan-400 text-black'
                    : 'border border-white/15 text-white/60 hover:border-cyan-400/40 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Project grid */}
      <section className="px-6 py-12 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <AnimatePresence mode="popLayout">
            <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
              {filtered.map((project, i) => (
                <motion.div
                  key={project.title}
                  layout
                  initial={{ opacity: 0, y: 32 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.5, delay: i * 0.06, ease: EASE }}
                  className="group overflow-hidden rounded-[2.5rem] border border-white/10 bg-black/25 shadow-[0_25px_90px_rgba(0,0,0,0.4)] backdrop-blur-xl"
                >
                  {/* Slider */}
                  <div className="h-[360px] w-full">
                    <BeforeAfterSlider
                      before={project.before}
                      after={project.after}
                      alt={project.title}
                    />
                  </div>

                  {/* Info */}
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <span className="rounded-lg border border-cyan-400/25 bg-cyan-400/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-cyan-300">
                        {project.category}
                      </span>
                      <span className="flex items-center gap-1.5 text-xs text-white/40">
                        <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                        </svg>
                        {project.location}
                      </span>
                    </div>
                    <h2 className="mt-3 text-xl font-black leading-tight text-white">
                      {project.title}
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-white/55">
                      {project.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="px-6 pb-28 pt-8 lg:px-16">
        <div className="mx-auto max-w-7xl rounded-[3rem] border border-cyan-400/20 bg-black/20 p-10 backdrop-blur-2xl md:p-16">
          <div className="grid gap-10 lg:grid-cols-[1fr,360px] lg:items-center">
            <div>
              <div className="text-sm font-black uppercase tracking-[0.28em] text-cyan-300">
                Ready for your own transformation?
              </div>
              <h2 className="mt-5 text-4xl font-black leading-tight md:text-5xl">
                Residential or Commercial.
                <span className="block text-white/50">We Build It Right.</span>
              </h2>
              <p className="mt-5 max-w-xl text-lg leading-8 text-white/65">
                From premium home gyms to large commercial facilities, 2EZ TEK handles installation,
                assembly, maintenance, and full project support across DFW.
              </p>
            </div>
            <div className="flex flex-col gap-4">
              <a
                href="tel:9728077232"
                className="rounded-2xl bg-cyan-400 px-8 py-6 text-center shadow-[0_0_45px_rgba(34,211,238,0.35)] transition hover:scale-[1.02] hover:bg-cyan-300"
              >
                <div className="text-xs font-black uppercase tracking-[0.28em] text-black/70">Call 2EZ TEK</div>
                <div className="mt-2 text-3xl font-black text-black">(972) 807-7232</div>
              </a>
              <button
                type="button"
                onClick={() => window.dispatchEvent(new CustomEvent('open-booking-modal'))}
                className="rounded-2xl border border-white/15 bg-white/10 px-8 py-5 text-center text-sm font-black uppercase tracking-[0.14em] text-white backdrop-blur-xl transition hover:bg-white/15"
              >
                Request Project Quote
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
