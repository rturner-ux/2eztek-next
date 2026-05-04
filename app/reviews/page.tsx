'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

export const metadata = {
  title: 'Customer Reviews | 2EZ TEK',
  description:
    'Read customer reviews for 2EZ TEK fitness equipment repair, assembly, maintenance, and commercial gym service.',
}

const reviews = [
  {
    name: 'Commercial Fitness Client',
    role: 'Gym Operations Manager',
    title: 'Fast response and professional service',
    review:
      '2EZ TEK handled multiple treadmill and elliptical repairs for our facility quickly and professionally. Communication was excellent and downtime was minimized.',
  },
  {
    name: 'Residential Customer',
    role: 'Home Gym Owner',
    title: 'Excellent home gym assembly',
    review:
      'Our home gym installation was completed perfectly. Everything was organized, clean, and professionally assembled.',
  },
  {
    name: 'Apartment Fitness Center',
    role: 'Property Management',
    title: 'Reliable maintenance partner',
    review:
      'Preventive maintenance has helped keep our equipment running consistently. Very responsive and dependable service.',
  },
]

const stats = [
  ['500+', '5-Star Reviews'],
  ['10K+', 'Machines Serviced'],
  ['24/7', 'Emergency Support'],
  ['DFW', 'Coverage Area'],
]

export default function ReviewsPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050B14] text-white">
      <div className="fixed inset-0 z-0 overflow-hidden">
        <motion.img
          src="/images/reviews-handshake.webp"
          alt="Happy customer shaking hands with 2EZ TEK technician"
          initial={{ scale: 1.05, x: '-3%' }}
          animate={{ scale: 1.05, x: ['-3%', '3%'] }}
          transition={{
            duration: 45,
            repeat: Infinity,
            repeatType: 'mirror',
            ease: 'easeInOut',
          }}
          className="h-full w-[108%] max-w-none object-cover opacity-[0.72]"
        />

        <div className="absolute inset-0 bg-black/38" />

        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,11,20,0.82)_0%,rgba(5,11,20,0.52)_40%,rgba(5,11,20,0.28)_100%)]" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.20),transparent_34%)]" />
      </div>

      <section className="relative z-10 px-6 pb-20 pt-32 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl"
          >
            <div className="inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-5 py-2 text-xs font-black uppercase tracking-[0.25em] text-cyan-300 backdrop-blur-xl">
              Real Clients. Real Results.
            </div>

            <h1 className="mt-7 text-5xl font-black leading-[0.95] tracking-tight md:text-7xl">
              Reviews You
              <span className="block text-cyan-300">Can Trust.</span>
            </h1>

            <p className="mt-7 max-w-2xl text-lg leading-8 text-white/75 md:text-xl">
              5-star service from homeowners, gym owners, property managers,
              and fitness facilities across Dallas Fort Worth.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/contact"
                className="rounded-2xl bg-cyan-400 px-7 py-4 text-sm font-black uppercase tracking-[0.12em] text-black shadow-[0_0_35px_rgba(34,211,238,0.35)]"
              >
                Book Your Service
              </Link>

              <a
                href="tel:9728077232"
                className="rounded-2xl border border-white/15 bg-white/10 px-7 py-4 text-sm font-black uppercase tracking-[0.12em] text-white backdrop-blur-xl transition hover:bg-white/15"
              >
                Call (972) 807-7232
              </a>
            </div>
          </motion.div>

          <div className="mt-16 grid gap-4 md:grid-cols-4">
            {stats.map(([stat, label]) => (
              <div
                key={label}
                className="rounded-[2rem] border border-white/10 bg-black/25 p-6 backdrop-blur-xl"
              >
                <div className="text-4xl font-black text-cyan-300">
                  {stat}
                </div>

                <div className="mt-2 text-sm font-semibold text-white/55">
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 px-6 py-24 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="text-sm font-black uppercase tracking-[0.28em] text-cyan-300">
                Customer Experiences
              </div>

              <h2 className="mt-4 text-4xl font-black md:text-6xl">
                What Our Clients
                <span className="block text-white/45">Are Saying</span>
              </h2>
            </div>

            <Link
              href="/contact"
              className="rounded-2xl border border-white/15 bg-white/10 px-7 py-4 text-sm font-black uppercase tracking-[0.12em] text-white backdrop-blur-xl transition hover:bg-white/15"
            >
              Request Service
            </Link>
          </div>

          <div className="mt-16 grid gap-6 lg:grid-cols-3">
            {reviews.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.6,
                  delay: i * 0.1,
                }}
                whileHover={{ y: -8 }}
                className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-black/28 p-8 shadow-[0_20px_80px_rgba(0,0,0,0.35)] backdrop-blur-2xl"
              >
                <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(34,211,238,0.08),transparent_60%)]" />

                <div className="relative">
                  <div className="flex gap-1 text-cyan-300">
                    ★★★★★
                  </div>

                  <h3 className="mt-6 text-3xl font-black">
                    {item.title}
                  </h3>

                  <p className="mt-6 leading-8 text-white/70">
                    “{item.review}”
                  </p>

                  <div className="mt-10 border-t border-white/10 pt-5">
                    <div className="font-black text-cyan-300">
                      {item.name}
                    </div>

                    <div className="mt-1 text-sm text-white/45">
                      {item.role}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 px-6 pb-28 lg:px-16">
        <div className="mx-auto max-w-7xl rounded-[3rem] border border-cyan-400/20 bg-black/30 p-10 shadow-[0_25px_120px_rgba(0,0,0,0.45)] backdrop-blur-2xl md:p-16">
          <div className="grid gap-10 lg:grid-cols-[1fr,320px] lg:items-center">
            <div>
              <div className="text-sm font-black uppercase tracking-[0.28em] text-cyan-300">
                Ready To Experience 5-Star Service?
              </div>

              <h2 className="mt-5 max-w-4xl text-4xl font-black leading-tight md:text-6xl">
                Let’s Get Your Equipment
                <span className="block text-white/45">
                  Back To 100%.
                </span>
              </h2>

              <div className="mt-8 grid gap-4 md:grid-cols-2">
                {[
                  'Fast response times',
                  'Expert technicians',
                  'Transparent pricing',
                  'Satisfaction guaranteed',
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 text-white/75"
                  >
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-300 text-xs font-black text-black">
                      ✓
                    </span>

                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <Link
                href="/contact"
                className="rounded-2xl bg-cyan-400 px-7 py-5 text-center text-sm font-black uppercase tracking-[0.12em] text-black shadow-[0_0_35px_rgba(34,211,238,0.35)]"
              >
                Book Your Service
              </Link>

              <a
                href="tel:9728077232"
                className="rounded-2xl border border-white/15 bg-white/10 px-7 py-5 text-center text-sm font-black uppercase tracking-[0.12em] text-white backdrop-blur-xl transition hover:bg-white/15"
              >
                Call (972) 807-7232
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}