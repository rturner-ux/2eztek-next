'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

const benefits = [
  {
    title: 'Sell Fitness Equipment Faster',
    description:
      'List treadmills, ellipticals, home gyms, benches, and commercial equipment directly through the 2EZ TEK marketplace.',
    icon: '$',
  },
  {
    title: 'Verified Equipment Support',
    description:
      'Buyers can request inspection, diagnostics, assembly, moving, and preventative maintenance services before purchasing.',
    icon: '✓',
  },
  {
    title: 'Delivery & Installation Available',
    description:
      'Offer white glove delivery, relocation, installation, and setup services through 2EZ TEK technicians.',
    icon: '↗',
  },
  {
    title: 'Trusted Service Ecosystem',
    description:
      'Every listing can connect directly into the SmartGymOps service ecosystem for future repairs and maintenance.',
    icon: '★',
  },
]

const categories = [
  'Treadmills',
  'Ellipticals',
  'Functional Trainers',
  'Home Gyms',
  'Smith Machines',
  'Commercial Cardio',
  'Benches',
  'Rowers',
  'Strength Equipment',
]

export default function EquipmentMarketplacePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-white text-slate-900">
      <section className="relative border-b border-slate-200">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.10),transparent_55%)]" />

        <div className="relative mx-auto max-w-7xl px-6 py-28">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl"
          >
            <div className="mb-6 inline-flex items-center rounded-full border border-cyan-200 bg-cyan-50 px-5 py-2 text-xs font-black uppercase tracking-[0.25em] text-cyan-600">
              SmartGymOps Marketplace
            </div>

            <h1 className="text-5xl font-black leading-tight md:text-7xl">
              Buy & Sell Fitness Equipment With Confidence
            </h1>

            <p className="mt-8 max-w-3xl text-lg leading-8 text-slate-600 md:text-xl">
              The 2EZ TEK marketplace combines equipment listings with real
              service infrastructure. Buyers and sellers gain access to
              inspections, diagnostics, delivery, installation, maintenance,
              and support from experienced fitness equipment technicians.
            </p>

            <div className="mt-12 flex flex-wrap gap-4">
              <Link
                href="/equipment-for-sale/new"
                className="inline-flex items-center gap-2 rounded-2xl bg-cyan-400 px-8 py-5 text-sm font-black uppercase tracking-wide text-black transition hover:scale-[1.02]"
              >
                List Equipment <span>→</span>
              </Link>

              <Link
                href="/equipment-for-sale"
                className="rounded-2xl border border-slate-200 bg-white px-8 py-5 text-sm font-black uppercase tracking-wide text-slate-700 shadow-sm transition hover:border-cyan-300 hover:bg-cyan-50"
              >
                Browse Listings
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="mb-12 text-center">
          <h2 className="text-4xl font-black md:text-5xl">
            More Than Just A Marketplace
          </h2>

          <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-slate-500">
            Unlike social media marketplaces, SmartGymOps connects equipment
            sales with professional repair, assembly, transport, and
            preventative maintenance services.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {benefits.map((benefit) => (
            <motion.div
              key={benefit.title}
              whileHover={{ y: -5 }}
              className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600">
                <span className="text-2xl font-black">{benefit.icon}</span>
              </div>

              <h3 className="mt-6 text-2xl font-black">{benefit.title}</h3>

              <p className="mt-4 leading-7 text-slate-500">
                {benefit.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="border-y border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <div className="mb-4 inline-flex rounded-full border border-cyan-200 bg-cyan-50 px-4 py-1 text-xs font-black uppercase tracking-[0.25em] text-cyan-600">
                Built For The Fitness Industry
              </div>

              <h2 className="text-4xl font-black md:text-5xl">
                A Trusted Ecosystem For Fitness Equipment
              </h2>

              <p className="mt-6 text-lg leading-8 text-slate-500">
                SmartGymOps is not just a classified listing site. It is a full
                equipment lifecycle platform designed to support commercial
                gyms, home gym owners, technicians, and fitness equipment
                buyers.
              </p>

              <div className="mt-10 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-3 text-cyan-600">
                    <span className="text-lg">🔧</span>
                    <span className="font-black uppercase tracking-wide">
                      Repair Services
                    </span>
                  </div>

                  <p className="mt-3 text-sm leading-6 text-slate-500">
                    Buyers can request diagnostics and repairs directly through
                    2EZ TEK.
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-3 text-cyan-600">
                    <span className="text-lg">🏋️</span>
                    <span className="font-black uppercase tracking-wide">
                      Equipment Knowledge
                    </span>
                  </div>

                  <p className="mt-3 text-sm leading-6 text-slate-500">
                    Access manuals, troubleshooting resources, and future AI
                    support systems.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[2.5rem] border border-slate-200 bg-gradient-to-br from-cyan-50 to-transparent p-10 shadow-sm">
              <h3 className="text-3xl font-black">Popular Categories</h3>

              <div className="mt-8 flex flex-wrap gap-3">
                {categories.map((category) => (
                  <div
                    key={category}
                    className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm"
                  >
                    {category}
                  </div>
                ))}
              </div>

              <div className="mt-10 rounded-3xl border border-cyan-200 bg-cyan-50 p-6">
                <div className="text-xs font-black uppercase tracking-[0.25em] text-cyan-600">
                  Future Feature
                </div>

                <h4 className="mt-4 text-2xl font-black">
                  2EZ TEK Certified Equipment
                </h4>

                <p className="mt-4 leading-7 text-slate-600">
                  Future listings will support inspection reports, verified
                  maintenance history, and technician certification to help
                  buyers purchase equipment with confidence.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA, dark for contrast */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="rounded-[2.5rem] bg-slate-900 p-12 text-center text-white">
          <h2 className="text-4xl font-black md:text-5xl">
            Ready To List Equipment?
          </h2>

          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-white/70">
            Reach local buyers while offering professional delivery,
            installation, and support services through the SmartGymOps
            ecosystem.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              href="/equipment-for-sale/new"
              className="rounded-2xl bg-cyan-400 px-8 py-5 text-sm font-black uppercase tracking-wide text-black transition hover:scale-[1.02]"
            >
              Create Listing
            </Link>

            <Link
              href="/contact"
              className="rounded-2xl border border-white/20 bg-white/10 px-8 py-5 text-sm font-black uppercase tracking-wide text-white transition hover:border-white/40"
            >
              Contact 2EZ TEK
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
