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

// ── Only 5-star reviews ───────────────────────────────────────────────────────
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
    name: 'Willean',
    role: 'Equipment Repair Customer',
    title: 'Patient and explains everything clearly',
    review: 'Very patient and explains everything where you can understand the process and issues.',
    tag: 'Repair',
    date: '6 days ago',
  },
  {
    name: 'LaQuenda Jackson',
    role: 'Treadmill Repair Customer',
    title: 'Fixed my treadmill in record time',
    review: 'Robbie from 2EZ TEK LLC was amazing! He was very knowledgeable, professional, and incredibly helpful. He fixed my treadmill in record time and made the whole process easy and stress-free. I really appreciated how quickly he diagnosed the issue.',
    tag: 'Treadmill Repair',
    date: '2 weeks ago',
  },
  {
    name: 'Jeff Powell',
    role: 'Local Guide · Repeat Client',
    title: 'Flawless results every single time',
    review: "Robby is easy and effortless to work with. I've used him for a dozen jobs putting together fitness equipment for me. Flawless results each time.",
    tag: 'Assembly',
    date: '3 weeks ago',
  },
  {
    name: 'Jan Cunningham',
    role: 'Treadmill Repair Customer',
    title: 'Better than new treadmill',
    review: 'What could have been a frustrating experience turned into my now having a better than new treadmill. Robby clearly knows machines. He easily but carefully diagnosed and explained what would be involved in the repair which gave me a clear picture of the process.',
    tag: 'Treadmill Repair',
    date: '8 weeks ago',
  },
  {
    name: 'Jack Brown',
    role: 'StairMaster Installation',
    title: 'Exceptional communication start to finish',
    review: 'I had a stairmaster delivered to my house and coordinated with Robby on arrival and he had exceptional communication. He was here as soon as the shipper arrived and he got right to work. He helped unload the stairmaster and brought it in — outstanding.',
    tag: 'Installation',
    date: '10 weeks ago',
  },
  {
    name: 'Sabra Jackson',
    role: 'Local Guide · Treadmill Customer',
    title: 'Outstanding, diagnosed almost immediately',
    review: 'Robby with 2EZ TEK was outstanding. My treadmill suddenly stopped working and I thought it was going to be a major repair, but he diagnosed the issue almost immediately. He explained exactly what was wrong, fixed it quickly, and even showed me maintenance tips.',
    tag: 'Treadmill Repair',
    date: '10 weeks ago',
  },
  {
    name: 'Russell F',
    role: 'Home Equipment Owner',
    title: 'Diagnosed the problem in 5 seconds',
    review: "Amazing, can't say enough great things. Called on Wednesday afternoon, Thursday morning they were here and diagnosed the problem in 5 seconds. Fixed it in 20 minutes, all done.",
    tag: 'Repair',
    date: '12 weeks ago',
  },
  {
    name: 'Billy Marcinko',
    role: 'Local Guide · Gym Assembly',
    title: 'Robby is a beast, highly recommend',
    review: 'Robby is a beast! I highly recommend using him for any kind of gym assembly.',
    tag: 'Assembly',
    date: '41 weeks ago',
  },
  {
    name: 'sean nelson',
    role: 'Rogue Rack Customer',
    title: 'Would recommend 100 times over',
    review: 'Very professional. Called ahead to see if he could come earlier. Highly knowledgeable in setting my Rogue rack system. Would recommend his services a 100 times over and would use again.',
    tag: 'Assembly',
    date: 'Mar 2025',
  },
  {
    name: 'Red Jones',
    role: 'Equipment Assembly Customer',
    title: 'Customer service was immaculate',
    review: 'The customer service was immaculate. My equipment was assembled in a timely manner, I would definitely use again.',
    tag: 'Assembly',
    date: 'Feb 2025',
  },
  {
    name: 'Katy Angus',
    role: 'Treadmill Repair Customer',
    title: 'In touch right away, repaired within 5 days',
    review: 'We had a great experience with Robby! He got in touch with me right away. Came out and assessed the issue with our treadmill, knew exactly what was going on, ordered the part and came back to fix it all within 5 days! Very knowledgeable.',
    tag: 'Treadmill Repair',
    date: 'Jul 2024',
  },
  {
    name: 'Kelly Galloway',
    role: 'Local Guide · Precor Owner',
    title: 'Quick, professional, knowledgeable, efficient',
    review: 'Quick to return our call & schedule service. Professional. Personable. Knowledgeable. Helpful. Efficient. GREAT SERVICE! Robby helped us solve our treadmill error codes issues and inspected and performed maintenance on our Precor Treadmill.',
    tag: 'Maintenance',
    date: 'Aug 2023',
  },
  {
    name: 'Rita Adiani',
    role: 'Equipment Repair Customer',
    title: 'Brilliant diagnostics in under 30 mins',
    review: 'Absolutely brilliant diagnostics, service and complete solution delivery! All done in less than 30 mins whilst I waited for an alternative service company to figure it out for over 2 weeks!',
    tag: 'Repair',
    date: 'Jul 2023',
  },
  {
    name: 'Raw Rizo',
    role: 'Bowflex Owner',
    title: 'Repaired my Bowflex in 30 minutes flat',
    review: 'Robby repaired my Bowflex M5 elliptical in 30 minutes flat! He is extremely professional and knowledgeable across the industry. He even let me look over his shoulder and taught me a few things, highly recommended!!',
    tag: 'Repair',
    date: 'Jun 2023',
  },
  {
    name: 'Lucy Catala',
    role: 'Home Equipment Owner',
    title: 'Impeccable work, guaranteed',
    review: "What a fantastic job! Robby was responsive and timely. His work is impeccable. I am glad that I was able to find someone who knew what they were doing and wasn't afraid to guarantee the work. Thank You, Thank You, Thank You!",
    tag: 'Assembly',
    date: 'May 2023',
  },
  {
    name: 'Carrie Grissom',
    role: 'Local Guide · Service Customer',
    title: 'Super professional and friendly',
    review: 'Robby responded promptly to my service request and was quick and efficient once here. He was super professional and friendly — highly recommend!',
    tag: 'Repair',
    date: 'May 2023',
  },
  {
    name: 'Carmen Estep',
    role: 'Treadmill Assembly Customer',
    title: 'Robby saved the day',
    review: "Robby saved the day! Hubby and I tried to put our new treadmill together with no success. We should have called Robby when we ordered the machine. Robby corrected our mistakes and had it running in no time! Will definitely call him again.",
    tag: 'Assembly',
    date: 'Feb 2023',
  },
  {
    name: 'Tony Simons',
    role: 'Treadmill Repair Customer',
    title: 'On the books in less than 12 hours',
    review: "We were impressed with how swiftly 2EZ TEK came to our treadmill's rescue. Less than 12 hours after we'd placed a request, we were on the books for the following day. 2EZ TEK swiftly deduced the problem and helped us through the process.",
    tag: 'Treadmill Repair',
    date: 'Feb 2023',
  },
  {
    name: 'Daniel McGriff',
    role: 'Local Guide · Boxing Equipment',
    title: 'Excellent job despite limited instructions',
    review: 'Robby was a God send. He came out and set up our Boxing equipment. Did an excellent job even though the instructions were extremely limited. He was on time, efficient and gave some good tips upon leaving.',
    tag: 'Assembly',
    date: 'Aug 2022',
  },
  {
    name: 'Kassandra',
    role: 'Local Guide · NordicTrack Owner',
    title: 'Guru for assembling fitness equipment',
    review: 'Robby is the guru for assembling fitness equipment. Had no issues with my NordicTrack treadmill. Very professional and friendly. I would recommend him for your assembly.',
    tag: 'Assembly',
    date: 'Aug 2022',
  },
  {
    name: 'Shelley Herman',
    role: 'Treadmill Repair Customer',
    title: 'Repaired in less than 20 minutes',
    review: 'I was so happy to find 2EZ TEK to repair my treadmill. Every other company I called put me on a waiting list and said they would call when they had time. Robbie came out within the week and repaired the issue in less than 20 mins.',
    tag: 'Treadmill Repair',
    date: 'Oct 2022',
  },
]

const stats = [
  { value: '500+', label: '5-Star Reviews' },
  { value: '10K+', label: 'Machines Serviced' },
  { value: '24/7', label: 'Emergency Support' },
  { value: 'DFW', label: 'Coverage Area' },
]

const tags = ['All', 'Repair', 'Treadmill Repair', 'Assembly', 'Maintenance', 'Installation']

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

  const reviewSchema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': 'https://www.2eztek.com/#localbusiness',
    name: '2EZ TEK',
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      reviewCount: '500',
      bestRating: '5',
      worstRating: '1',
    },
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#070B12] text-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(reviewSchema) }} />

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
                className="object-cover opacity-95"
              />
            </motion.div>
          </motion.div>
        </div>
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,11,18,0.92)_0%,rgba(7,11,18,0.55)_50%,rgba(7,11,18,0.05)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.18),transparent_38%)]" />

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
              className="mt-8 max-w-2xl text-lg leading-8 text-white/80 md:text-xl"
            >
              Homeowners, gyms, apartments, and commercial fitness facilities trust 2EZ TEK for reliable repair, assembly, diagnostics, and preventive maintenance across Dallas Fort Worth.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.65, ease: EASE }}
              className="mt-10 flex flex-wrap items-center gap-4"
            >
              <button type="button" onClick={() => window.dispatchEvent(new CustomEvent('open-booking-modal'))} className="button-glow rounded-2xl bg-cyan-400 px-7 py-4 text-sm font-black uppercase tracking-[0.12em] text-black shadow-[0_0_40px_rgba(34,211,238,0.38)] transition hover:scale-105 active:scale-95">Book Service</button>
              <a href="tel:9728077232" className="rounded-2xl border border-white/15 bg-white/10 px-7 py-4 text-sm font-black uppercase tracking-[0.12em] text-white backdrop-blur-xl transition hover:border-cyan-400/30 hover:bg-cyan-400/10">
                Call (972) 807-7232
              </a>
            </motion.div>

            <motion.div
              variants={staggerContainer(0.1, 0.85)}
              initial="hidden"
              animate="show"
              className="mt-16 grid grid-cols-2 gap-4 md:grid-cols-4"
            >
              {stats.map((s) => (
                <motion.div key={s.label} variants={staggerItem} whileHover={{ y: -4 }} className="rounded-3xl border border-white/10 bg-black/30 p-6 backdrop-blur-xl">
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
                  <span className="text-xs font-black uppercase tracking-[0.3em] text-cyan-400">5-Star Service · {reviews.length} Reviews</span>
                </div>
                <h2 className="text-4xl font-black leading-tight md:text-6xl">
                  What Our Clients
                  <span className="block text-white/45">Are Saying.</span>
                </h2>
              </div>
              <button type="button" onClick={() => window.dispatchEvent(new CustomEvent('open-booking-modal'))} className="self-start rounded-2xl border border-white/10 bg-white/5 px-7 py-4 text-sm font-black uppercase tracking-[0.12em] text-white transition hover:border-cyan-400/30 hover:bg-cyan-400/10">Book Service</button>
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
                {tag} {tag !== 'All' && `(${reviews.filter(r => r.tag === tag).length})`}
              </button>
            ))}
          </Reveal>

          {/* Grid */}
          <motion.div
            key={activeTag}
            variants={staggerContainer(0.05, 0.05)}
            initial="hidden"
            animate="show"
            className="grid gap-5 md:grid-cols-2 lg:grid-cols-3"
          >
            {filtered.map((item) => (
              <motion.article
                key={item.name + item.title}
                variants={staggerItem}
                whileHover={{ y: -6 }}
                transition={{ duration: 0.3, ease: EASE }}
                className="group relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-black/20 p-7 shadow-[0_25px_90px_rgba(0,0,0,0.30)] backdrop-blur-2xl transition-colors duration-500 hover:border-cyan-400/25"
              >
                <motion.div
                  className="absolute inset-0 bg-[linear-gradient(135deg,rgba(34,211,238,0.09),transparent_65%)]"
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.4 }}
                />
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div aria-label="5 out of 5 stars" className="flex gap-0.5 text-cyan-400 text-sm">★★★★★</div>
                    <span className="border-l-2 border-cyan-400/40 pl-2 text-[10px] font-black uppercase tracking-[0.18em] text-cyan-400/60">
                      {item.tag}
                    </span>
                  </div>

                  <h3 className="text-lg font-black leading-tight text-white">{item.title}</h3>
                  <p className="mt-4 text-sm leading-7 text-white/65">"{item.review}"</p>

                  <div className="mt-7 flex items-end justify-between border-t border-white/10 pt-5">
                    <div>
                      <div className="text-sm font-black text-cyan-300">{item.name}</div>
                      <div className="mt-0.5 text-xs text-white/35">{item.role}</div>
                    </div>
                    <div className="text-xs text-white/20">{item.date}</div>
                  </div>
                </div>
              </motion.article>
            ))}
          </motion.div>

          {/* Google link */}
          <Reveal delay={0.2} className="mt-14 text-center">
            <a
              href="https://g.page/r/CQFJm5whu0tLEBM/review"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-7 py-4 text-sm font-black uppercase tracking-[0.12em] text-white transition hover:border-cyan-400/30 hover:bg-cyan-400/10"
            >
              <svg className="h-5 w-5 flex-shrink-0" viewBox="0 0 24 24">
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
                <button type="button" onClick={() => window.dispatchEvent(new CustomEvent('open-booking-modal'))} className="block rounded-2xl bg-cyan-400 px-7 py-5 text-center text-sm font-black uppercase tracking-[0.12em] text-black shadow-[0_0_35px_rgba(34,211,238,0.35)] transition hover:bg-cyan-300">Book Service</button>
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
