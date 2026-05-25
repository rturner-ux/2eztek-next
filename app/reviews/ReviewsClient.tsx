// app/reviews/ReviewsClient.tsx
'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion, useInView, useScroll, useTransform } from 'framer-motion'
import { useRef, useState } from 'react'

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number]

const fadeUp = {
  hidden: { opacity: 0, y: 36 },
  show: (delay = 0) => ({ opacity: 1, y: 0, transition: { duration: 1.0, delay, ease: EASE } }),
}

const staggerContainer = (stagger = 0.08, delayChildren = 0) => ({
  hidden: {},
  show: { transition: { staggerChildren: stagger, delayChildren } },
})

const staggerItem = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.85, ease: EASE } },
}

function Reveal({ children, className, delay = 0 }: {
  children: React.ReactNode
  className?: string
  delay?: number
}) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <motion.div ref={ref} variants={fadeUp} initial="hidden" animate={inView ? 'show' : 'hidden'} custom={delay} className={className}>
      {children}
    </motion.div>
  )
}

const reviews = [
  {
    name: 'Chad F',
    role: 'Repeat Client · Multiple Homes',
    title: 'My go-to for anything fitness assembly',
    review: 'This company is my go-to source for anything fitness assembly and help. I have used them multiple times in different homes. They have gone out of their way to make sure I get taken care of. The owner especially has been amazing to deal with.',
    tag: 'Assembly',
    date: '6 days ago',
  },
  {
    name: 'LaQuenda Jackson',
    role: 'Treadmill Repair Customer',
    title: 'Fixed my treadmill in record time',
    review: 'Robbie from 2EZ TEK LLC was amazing! He was very knowledgeable, professional, and incredibly helpful. He fixed my treadmill in record time and made the whole process easy and stress-free. I really appreciated how quickly he diagnosed the issue.',
    tag: 'Treadmill Repair',
    date: '1 week ago',
  },
  {
    name: 'Russell F',
    role: 'Home Equipment Owner',
    title: 'Diagnosed the problem in 5 seconds',
    review: 'Amazing, can\'t say enough great things. Called on Wednesday afternoon, Thursday morning they were here and diagnosed the problem in 5 seconds. Fixed it in 20 minutes, all done.',
    tag: 'Repair',
    date: '2 months ago',
  },
  {
    name: 'Sabra Jackson',
    role: 'Treadmill Repair Customer',
    title: 'Outstanding — diagnosed immediately',
    review: 'Robby with 2EZ TEK was outstanding. My treadmill suddenly stopped working and I thought it was going to be a major repair, but he diagnosed the issue almost immediately. He explained exactly what was wrong, fixed it quickly, and even showed me maintenance tips.',
    tag: 'Treadmill Repair',
    date: '2 months ago',
  },
  {
    name: 'Jeff Powell',
    role: 'Local Guide · Repeat Client',
    title: 'Flawless results every single time',
    review: 'Robby is easy and effortless to work with. I\'ve used him for a dozen jobs putting together fitness equipment for me. Flawless results each time.',
    tag: 'Assembly',
    date: '2 weeks ago',
  },
  {
    name: 'Jan Cunningham',
    role: 'Treadmill Repair Customer',
    title: 'Better than new treadmill',
    review: 'What could have been a frustrating experience turned into my now having a better than new treadmill. Robby clearly knows machines. He easily but carefully diagnosed and explained what would be involved in the repair which gave me a clear picture of the process.',
    tag: 'Treadmill Repair',
    date: '1 month ago',
  },
  {
    name: 'Jack Brown',
    role: 'StairMaster Installation',
    title: 'Exceptional communication and service',
    review: 'I had a stairmaster delivered to my house and coordinated with Robby on arrival and he had exceptional communication. He was here as soon as the shipper arrived and he got right to work. He helped unload the stairmaster and brought it in — outstanding.',
    tag: 'Installation',
    date: '2 months ago',
  },
  {
    name: 'Rita Adiani',
    role: 'Equipment Repair Customer',
    title: 'Brilliant diagnostics in under 30 mins',
    review: 'Absolutely brilliant diagnostics, service and complete solution delivery! All done in less than 30 mins whilst I waited for an alternative service company to figure it out for over 2 weeks!',
    tag: 'Repair',
    date: '2 years ago',
  },
  {
    name: 'Lucy Catala',
    role: 'Home Equipment Owner',
    title: 'Impeccable work, guaranteed',
    review: 'What a fantastic job! Robby was responsive and timely. His work is impeccable. I am glad that I was able to find someone who knew what they were doing and wasn\'t afraid to guarantee the work. Thank You, Thank You, Thank You!',
    tag: 'Assembly',
    date: '2 years ago',
  },
  {
    name: 'Kelly Galloway',
    role: 'Local Guide · Precor Owner',
    title: 'Quick, professional, knowledgeable',
    review: 'Quick to return our call & schedule service. Professional. Personable. Knowledgeable. Helpful. Efficient. GREAT SERVICE! Robby helped us solve our treadmill error codes issues and inspected and performed maintenance on our Precor Treadmill.',
    tag: 'Maintenance',
    date: '2 years ago',
  },
  {
    name: 'Raw Rizo',
    role: 'Bowflex Owner',
    title: 'Repaired my Bowflex in 30 minutes flat',
    review: 'Robby repaired my Bowflex M5 elliptical in 30 minutes flat! He is extremely professional and knowledgeable across the industry. He even let me look over his shoulder and taught me a few things, highly recommended!!',
    tag: 'Repair',
    date: '2 years ago',
  },
  {
    name: 'sean nelson',
    role: 'Rogue Rack Customer',
    title: 'Highly knowledgeable, highly recommend',
    review: 'Very professional. Called ahead to see if he could come earlier. Highly knowledgeable in setting my Rogue rack system. Would recommend his services a 100 times over and would use again.',
    tag: 'Assembly',
    date: '1 year ago',
  },
]

const stats = [
  { value: '500+', label: '5-Star Reviews' },
  { value: '10K+', label: 'Machines Serviced' },
  { value: '24/7', label: 'Emergency Support' },
  { value: 'DFW', label: 'Coverage Area' },
]

const tags = ['All', 'Repair', 'Assembly', 'Treadmill Repair', 'Maintenance', 'Installation']

const trustPoints = [
  'Fast response times',
  'Experienced technicians',
  'Commercial & residential service',
  'Trusted across Dallas Fort Worth',
]

export default function ReviewsClient() {
  const heroRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '20%'])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0])

  const [activeTag, setActiveTag] = useState('All')

  const filtered = activeTag === 'All'
    ? reviews
    : reviews.filter((r) => r.tag === activeTag)

  return (
    <main className="min-h-screen overflow-hidden bg-[#070B12] text-white">

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section ref={heroRef} className="relative min-h-screen overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <motion.div style={{ y: heroY }} className="relative h-[115%] w-[112%]">
            <motion.div
              initial={{ scale: 1.08 }}
              animate={{ scale: 1 }}
              transition={{ duration: 2.2, ease: EASE }}
              className="h-full w-full"
            >
              <Image
                src="/images/reviews-handshake.webp"
                alt="2EZ TEK customer reviews"
                fill
                priority
                sizes="100vw"
                className="object-cover opacity-80"
              />
            </motion.div>
          </motion.div>
        </div>
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,11,18,0.95)_0%,rgba(7,11,18,0.6)_50%,rgba(7,11,18,0.1)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.2),transparent_38%)]" />

        <motion.div style={{ opacity: heroOpacity }} className="relative z-10 flex min-h-screen items-center px-6 py-32 lg:px-16">
          <div className="max-w-5xl">
            <div className="mb-8 flex items-center gap-3">
              <motion.span initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.7, delay: 0.3, ease: EASE }} style={{ originX: 0 }} className="block h-px w-10 bg-cyan-400" />
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7, delay: 0.55 }} className="text-xs font-black uppercase tracking-[0.3em] text-cyan-400">
                Verified Customer Reviews
              </motion.span>
            </div>

            <motion.h1
              initial={{ opacity: 0, y: 56 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.1, delay: 0.2, ease: EASE }}
              className="text-5xl font-black leading-[0.92] tracking-tight md:text-7xl lg:text-8xl"
            >
              Trusted By
              <span className="block text-cyan-400">Dallas Fort Worth.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.5, ease: EASE }}
              className="mt-8 max-w-2xl text-lg leading-8 text-white/70 md:text-xl"
            >
              Homeowners, gyms, apartments, and commercial fitness facilities trust 2EZ TEK for reliable repair, assembly, diagnostics, and preventive maintenance.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.65, ease: EASE }}
              className="mt-10 flex flex-wrap gap-4"
            >
              <Link href="/contact" className="button-glow rounded-2xl bg-cyan-400 px-7 py-4 text-sm font-black uppercase tracking-[0.12em] text-black shadow-[0_0_40px_rgba(34,211,238,0.38)] transition hover:scale-105 active:scale-95">
                Book Your Service
              </Link>
              <a href="tel:9728077232" className="rounded-2xl border border-white/10 bg-white/5 px-7 py-4 text-sm font-black uppercase tracking-[0.12em] text-white transition hover:border-cyan-400/30 hover:bg-cyan-400/10">
                Call (972) 807-7232
              </a>
            </motion.div>

            {/* Stats */}
            <motion.div
              variants={staggerContainer(0.1, 0.85)}
              initial="hidden"
              animate="show"
              className="mt-16 grid grid-cols-2 gap-4 md:grid-cols-4"
            >
              {stats.map((s) => (
                <motion.div
                  key={s.label}
                  variants={staggerItem}
                  whileHover={{ y: -4 }}
                  className="rounded-3xl border border-white/10 bg-white/[0.06] p-6 backdrop-blur-xl"
                >
                  <div className="text-4xl font-black text-cyan-400">{s.value}</div>
                  <div className="mt-2 text-xs font-black uppercase tracking-[0.15em] text-white/50">{s.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ── Reviews Grid ──────────────────────────────────────────────────── */}
      <section className="border-t border-white/10 bg-[#0B1220] px-6 py-28 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <Reveal className="mb-14">
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="h-px w-8 bg-cyan-400" />
                  <span className="text-xs font-black uppercase tracking-[0.3em] text-cyan-400">5-Star Service</span>
                </div>
                <h2 className="text-4xl font-black leading-tight md:text-6xl">
                  What Our Clients
                  <span className="block text-white/45">Are Saying.</span>
                </h2>
              </div>
              <Link href="/contact" className="self-start rounded-2xl border border-white/10 bg-white/5 px-7 py-4 text-sm font-black uppercase tracking-[0.12em] text-white transition hover:border-cyan-400/30 hover:bg-cyan-400/10">
                Request Service
              </Link>
            </div>
          </Reveal>

          {/* Filter pills */}
          <Reveal delay={0.1} className="mb-12 flex flex-wrap gap-3">
            {tags.map((tag) => (
              <button
                key={tag}
                onClick={() => setActiveTag(tag)}
                className={`rounded-full border px-5 py-2 text-xs font-black uppercase tracking-[0.15em] transition ${
                  activeTag === tag
                    ? 'border-cyan-400 bg-cyan-400/10 text-cyan-300'
                    : 'border-white/10 bg-white/5 text-white/50 hover:border-cyan-400/30 hover:text-white/70'
                }`}
              >
                {tag}
              </button>
            ))}
          </Reveal>

          {/* Grid */}
          <motion.div
            key={activeTag}
            variants={staggerContainer(0.06, 0.05)}
            initial="hidden"
            animate="show"
            className="grid gap-6 lg:grid-cols-3"
          >
            {filtered.map((item) => (
              <motion.article
                key={item.name + item.title}
                variants={staggerItem}
                whileHover={{ y: -8 }}
                transition={{ duration: 0.35, ease: EASE }}
                className="group relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-black/20 p-8 shadow-[0_25px_90px_rgba(0,0,0,0.30)] backdrop-blur-2xl transition-colors duration-500 hover:border-cyan-400/25"
              >
                {/* Gradient overlay */}
                <motion.div
                  className="absolute inset-0 bg-[linear-gradient(135deg,rgba(34,211,238,0.1),transparent_65%)]"
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.4 }}
                />

                <div className="relative">
                  {/* Stars + tag */}
                  <div className="flex items-center justify-between mb-5">
                    <div aria-label="5 out of 5 stars" className="flex gap-0.5 text-cyan-400 text-sm">
                      ★★★★★
                    </div>
                    <span className="border-l-2 border-cyan-400/50 pl-2 text-[10px] font-black uppercase tracking-[0.18em] text-cyan-400/70">
                      {item.tag}
                    </span>
                  </div>

                  <h3 className="text-xl font-black leading-tight text-white">{item.title}</h3>

                  <p className="mt-5 text-sm leading-7 text-white/70">"{item.review}"</p>

                  <div className="mt-8 flex items-end justify-between border-t border-white/10 pt-5">
                    <div>
                      <div className="font-black text-cyan-300">{item.name}</div>
                      <div className="mt-1 text-xs text-white/40">{item.role}</div>
                    </div>
                    <div className="text-xs text-white/25">{item.date}</div>
                  </div>
                </div>
              </motion.article>
            ))}
          </motion.div>

          {/* Google reviews link */}
          <Reveal delay={0.2} className="mt-14 text-center">
            <a
              href="https://www.google.com/maps/place/2EZ+TEK+LLC"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-7 py-4 text-sm font-black uppercase tracking-[0.12em] text-white transition hover:border-cyan-400/30 hover:bg-cyan-400/10"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              View All Google Reviews
            </a>
          </Reveal>
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────────────────────────── */}
      <section className="border-t border-white/10 bg-[#07101D] px-6 py-28 lg:px-16">
        <div className="mx-auto max-w-7xl rounded-[3rem] border border-cyan-400/20 bg-black/20 p-10 shadow-[0_30px_120px_rgba(0,0,0,0.38)] backdrop-blur-2xl md:p-16">
          <div className="grid gap-10 lg:grid-cols-[1fr,320px] lg:items-center">
            <Reveal>
              <div className="flex items-center gap-3 mb-6">
                <span className="h-px w-8 bg-cyan-400" />
                <span className="text-xs font-black uppercase tracking-[0.3em] text-cyan-400">Experience The Difference</span>
              </div>
              <h2 className="max-w-4xl text-4xl font-black leading-tight md:text-6xl">
                Let's Get Your Equipment
                <span className="block text-white/45">Running Again.</span>
              </h2>
              <div className="mt-8 grid gap-3 md:grid-cols-2">
                {trustPoints.map((item) => (
                  <div key={item} className="flex items-center gap-3 text-white/70">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-400 text-xs font-black text-black">✓</span>
                    {item}
                  </div>
                ))}
              </div>
            </Reveal>

            <Reveal delay={0.15} className="flex flex-col gap-4">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link href="/contact" className="block rounded-2xl bg-cyan-400 px-7 py-5 text-center text-sm font-black uppercase tracking-[0.12em] text-black shadow-[0_0_35px_rgba(34,211,238,0.35)] transition hover:bg-cyan-300">
                  Book Your Service
                </Link>
              </motion.div>
              <a href="tel:9728077232" className="rounded-2xl border border-white/15 bg-white/10 px-7 py-5 text-center text-sm font-black uppercase tracking-[0.12em] text-white backdrop-blur-xl transition hover:border-cyan-400/30 hover:bg-cyan-400/10">
                Call (972) 807-7232
              </a>
            </Reveal>
          </div>
        </div>
      </section>
    </main>
  )
}
