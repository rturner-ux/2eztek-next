// app/about-2ez-tek/AboutClient.tsx
'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion, useInView, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number]

const fadeUp = {
  hidden: { opacity: 0, y: 36 },
  show: (delay = 0) => ({ opacity: 1, y: 0, transition: { duration: 1.0, delay, ease: EASE } }),
}

const fadeLeft = {
  hidden: { opacity: 0, x: -32 },
  show: (delay = 0) => ({ opacity: 1, x: 0, transition: { duration: 1.0, delay, ease: EASE } }),
}

const fadeRight = {
  hidden: { opacity: 0, x: 32 },
  show: (delay = 0) => ({ opacity: 1, x: 0, transition: { duration: 1.0, delay, ease: EASE } }),
}

const staggerContainer = (stagger = 0.08, delayChildren = 0) => ({
  hidden: {},
  show: { transition: { staggerChildren: stagger, delayChildren } },
})

const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.75, ease: EASE } },
}

function Reveal({ children, className, delay = 0, direction = 'up' }: {
  children: React.ReactNode
  className?: string
  delay?: number
  direction?: 'up' | 'left' | 'right'
}) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const variant = direction === 'left' ? fadeLeft : direction === 'right' ? fadeRight : fadeUp
  return (
    <motion.div ref={ref} variants={variant} initial="hidden" animate={inView ? 'show' : 'hidden'} custom={delay} className={className}>
      {children}
    </motion.div>
  )
}

const stats = [
  { value: '500+', label: 'Five-Star Reviews' },
  { value: 'DFW', label: 'Full Metro Coverage' },
  { value: '24/7', label: 'Emergency Support' },
  { value: '10K+', label: 'Machines Serviced' },
]

const services = [
  { title: 'Treadmill Repair', desc: 'Belt, motor, incline, console, and drive system diagnostics and repair.' },
  { title: 'Elliptical & Bike Service', desc: 'Resistance, flywheel, stride mechanism, and pedal system repair.' },
  { title: 'Strength Equipment', desc: 'Cable replacement, pulley service, selectorized and plate-loaded systems.' },
  { title: 'Home Gym Assembly', desc: 'White-glove setup, placement, calibration, and installation.' },
  { title: 'Commercial Maintenance', desc: 'Preventative programs, QR reporting, and SmartGymOps tracking.' },
  { title: 'Equipment Relocation', desc: 'Disassembly, transport coordination, and reassembly service.' },
]

const values = [
  { icon: '⚙️', title: 'Professional Communication', desc: 'Clear updates from intake to completion on every job.' },
  { icon: '🎯', title: 'Reliable Field Service', desc: 'On time, every time. We show up and fix it right the first time.' },
  { icon: '✦', title: 'Clean Jobsite Discipline', desc: 'We treat every space with respect, whether residential or commercial.' },
  { icon: '📊', title: 'SmartGymOps Tracking', desc: 'Every service job is documented, tracked, and accessible.' },
]

const timeline = [
  { year: 'Founded', event: '2EZ TEK established in Dallas Fort Worth as a fitness equipment service company.' },
  { year: 'Growth', event: 'Expanded to serve commercial gyms, apartment fitness centers, hotels, and corporate facilities.' },
  { year: 'SmartGymOps', event: 'Integrated SmartGymOps to power service tracking, equipment history, and QR reporting.' },
  { year: 'Today', event: '10,000+ machines serviced. 500+ five-star reviews. Full DFW coverage.' },
]

const areas = ['Dallas', 'Fort Worth', 'Plano', 'Frisco', 'Irving', 'Arlington', 'Richardson', 'McKinney', 'Garland', 'Mesquite', 'Carrollton', 'Addison']

export default function AboutClient() {
  const heroRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '20%'])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0])

  return (
    <main className="min-h-screen overflow-hidden bg-[#070B12] text-white">

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section ref={heroRef} className="relative min-h-screen overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <motion.div style={{ y: heroY }} className="relative h-[115%] w-full">
            <motion.div initial={{ scale: 1.08 }} animate={{ scale: 1 }} transition={{ duration: 2.2, ease: EASE }} className="h-full w-full">
              <Image
                src="/images/product-documentation.webp"
                alt="2EZ TEK fitness equipment service"
                fill
                priority
                sizes="100vw"
                className="object-cover opacity-[0.52]"
              />
            </motion.div>
          </motion.div>
        </div>
        <div className="absolute inset-0 bg-[rgba(10,40,90,0.52)]" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,11,20,0.96)_0%,rgba(5,11,20,0.72)_45%,rgba(5,11,20,0.34)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.18),transparent_34%)]" />

        <motion.div style={{ opacity: heroOpacity }} className="relative z-10 flex min-h-screen items-center px-6 py-32 lg:px-16">
          <div className="max-w-5xl">
            <div className="mb-8 flex items-center gap-3">
              <motion.span initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.7, delay: 0.3, ease: EASE }} style={{ originX: 0 }} className="block h-px w-10 bg-cyan-400" />
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7, delay: 0.55 }} className="text-xs font-black uppercase tracking-[0.3em] text-cyan-400">
                About 2EZ TEK
              </motion.span>
            </div>

            <motion.h1 initial={{ opacity: 0, y: 56 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.1, delay: 0.2, ease: EASE }} className="text-5xl font-black leading-[0.95] tracking-tight md:text-7xl lg:text-8xl">
              Field Service
              <span className="block text-cyan-400">Powered By Smarter</span>
              <span className="block text-white/40">Operations.</span>
            </motion.h1>

            <motion.p initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.5, ease: EASE }} className="mt-8 max-w-2xl text-lg leading-relaxed text-white/70 md:text-xl">
              2EZ TEK provides professional fitness equipment repair, assembly, installation, relocation, and preventative maintenance across Dallas Fort Worth, backed by SmartGymOps-powered tracking and operational visibility.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.65, ease: EASE }} className="mt-10 flex flex-wrap items-center gap-4">
              <button type="button" onClick={() => window.dispatchEvent(new CustomEvent('open-booking-modal'))} className="button-glow rounded-2xl bg-cyan-400 px-8 py-5 text-sm font-black uppercase tracking-[0.12em] text-black transition hover:scale-105 active:scale-95">Book Service</button>
              <Link href="/smartgymops-features" className="rounded-2xl border border-white/10 bg-white/5 px-8 py-5 text-sm font-black uppercase tracking-[0.12em] text-white transition hover:border-cyan-400/30 hover:bg-cyan-400/10">View SmartGymOps</Link>
            </motion.div>

            <motion.div variants={staggerContainer(0.1, 0.85)} initial="hidden" animate="show" className="mt-16 grid grid-cols-2 gap-4 md:grid-cols-4">
              {stats.map((s) => (
                <motion.div key={s.label} variants={staggerItem} whileHover={{ y: -4 }} className="rounded-3xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur-xl">
                  <div className="text-3xl font-black text-cyan-400">{s.value}</div>
                  <div className="mt-2 text-xs font-black uppercase tracking-[0.15em] text-white/50">{s.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ── Who We Are ────────────────────────────────────────────────────── */}
      <section className="border-t border-white/10 bg-[#0B1220] px-6 py-28 lg:px-16">
        <div className="mx-auto max-w-7xl grid gap-16 lg:grid-cols-2 lg:items-center">
          <Reveal direction="left">
            <div className="flex items-center gap-3 mb-6">
              <span className="h-px w-8 bg-cyan-400" />
              <span className="text-xs font-black uppercase tracking-[0.3em] text-cyan-400">Who We Are</span>
            </div>
            <h2 className="text-4xl font-black leading-tight md:text-6xl">
              Dallas Fort Worth's
              <span className="block text-white/45">Fitness Equipment Experts.</span>
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-white/65">
              2EZ TEK was built to solve a real problem: fitness equipment breaks down, and most repair companies are slow, unreliable, or don't specialize in fitness. We do. Our technicians are experienced across all major brands, all equipment types, and all facility sizes, from luxury home gyms to commercial fitness centers.
            </p>
            <p className="mt-4 text-lg leading-relaxed text-white/65">
              What separates us is our commitment to professional communication, clean jobsite discipline, and SmartGymOps-powered service tracking. Every client always knows the status of their equipment.
            </p>
          </Reveal>

          <Reveal direction="right" delay={0.15}>
            <div className="rounded-[36px] border border-white/10 bg-white/[0.05] p-8 backdrop-blur-xl">
              <div className="space-y-6">
                {timeline.map((item, i) => (
                  <div key={item.year} className="flex gap-5">
                    <div className="flex flex-col items-center">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-cyan-400/30 bg-cyan-400/10 text-xs font-black text-cyan-400">{i + 1}</div>
                      {i < timeline.length - 1 && <div className="mt-2 h-full w-px bg-white/10" />}
                    </div>
                    <div className="pb-6">
                      <div className="text-xs font-black uppercase tracking-[0.2em] text-cyan-400">{item.year}</div>
                      <p className="mt-2 text-sm leading-relaxed text-white/60">{item.event}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Meet the Founder ──────────────────────────────────────────────── */}
      <section className="border-t border-white/10 bg-[#050B14] px-6 py-28 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <Reveal className="mb-16 text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <span className="h-px w-8 bg-cyan-400" />
              <span className="text-xs font-black uppercase tracking-[0.3em] text-cyan-400">Meet the Founder</span>
              <span className="h-px w-8 bg-cyan-400" />
            </div>
          </Reveal>

          <div className="grid gap-16 lg:grid-cols-[340px,1fr] lg:items-start">
            {/* Photo + bio card */}
            <Reveal direction="left">
              <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
                <div className="h-44 w-44 overflow-hidden rounded-full border-2 border-cyan-400/30 shadow-[0_0_40px_rgba(34,211,238,0.15)]">
                  <img
                    src="/images/profile-image.jpg"
                    alt="Robby Turner, Founder & CEO of 2EZ TEK"
                    className="h-full w-full object-cover object-top"
                  />
                </div>
                <h2 className="mt-6 text-3xl font-black text-white">Robby Turner</h2>
                <p className="mt-1 text-sm font-black uppercase tracking-[0.2em] text-cyan-400">Founder & CEO</p>

                <div className="mt-8 w-full rounded-3xl border border-white/10 bg-white/[0.04] p-6">
                  <p className="mb-4 text-xs font-black uppercase tracking-[0.2em] text-white/40">Certifications</p>
                  <ul className="space-y-2">
                    {[
                      { cert: 'Sports Nutritionist', org: 'ISSA' },
                      { cert: 'CPR & AED', org: 'ISSA' },
                      { cert: 'Certified Personal Trainer NCCPT-CPT', org: 'ISSA' },
                      { cert: 'Scrum Master Certified (SMC)', org: 'Int\'l Six Sigma Institute' },
                      { cert: 'Certified ScrumMaster (CSM)', org: 'Scrum.org' },
                      { cert: 'Six Sigma Green Belt (CSSGB)', org: 'Int\'l Six Sigma Institute' },
                      { cert: 'Six Sigma Black Belt (CSSBB)', org: 'Int\'l Six Sigma Institute' },
                    ].map((item) => (
                      <li key={item.cert} className="flex items-start justify-between gap-3 text-sm">
                        <div>
                          <span className="font-bold text-white/80">{item.cert}</span>
                          <span className="block text-xs text-white/40">{item.org}</span>
                        </div>
                        <span className="flex-shrink-0 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-2 py-0.5 text-xs font-black text-cyan-400">Current</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Reveal>

            {/* Story + recommendations */}
            <Reveal direction="right" delay={0.1}>
              <div className="flex flex-col gap-8">
                {/* Origin story */}
                <div>
                  <div className="text-lg leading-relaxed text-white/70 space-y-4">
                    <p>During the pandemic, I made a decision that changed everything. I stepped away from my role and went all in on the fitness equipment space. At first, it was residential. People building home gyms. High demand. Immediate need.</p>
                    <p>But when commercial gyms reopened, I saw a bigger problem. Equipment wasn't just breaking. It was staying down. The same machines sitting with "Out of Order" signs for weeks. That's not just an inconvenience. That's lost revenue, frustrated members, and negative reviews that hurt long-term growth.</p>
                    <p>As someone who works in process improvement, asset management, and automation, I knew this wasn't a repair problem. It was a system problem. So I built one.</p>
                  </div>
                </div>

                {/* Expertise tags */}
                <div className="flex flex-wrap gap-2">
                  {['Fitness Equipment Repair', 'Process Improvement', 'Asset Management', 'Six Sigma', 'Scrum', 'Automation', 'Commercial Gym Operations', 'Residential Service'].map((tag) => (
                    <span key={tag} className="rounded-full border border-white/10 bg-white/[0.05] px-4 py-1.5 text-xs font-black uppercase tracking-[0.14em] text-white/55">{tag}</span>
                  ))}
                </div>

                {/* Recommendations */}
                <div className="space-y-4">
                  <p className="text-xs font-black uppercase tracking-[0.25em] text-white/35">LinkedIn Recommendations</p>

                  <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
                    <p className="text-sm leading-relaxed text-white/65 italic">"Robby Turner is an exceptional professional whose commitment to excellence and client satisfaction is truly impressive. Working with 2EZ TEK has been an outstanding experience. His communication skills are impeccable, and his ability to provide quality service for home gym repair and assembly has been remarkable. I highly recommend Robby and 2EZ TEK for anyone seeking reliable, high-quality gym equipment services."</p>
                    <div className="mt-4 flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full border border-white/15 bg-white/10 flex items-center justify-center text-xs font-black text-white/50">GS</div>
                      <div>
                        <p className="text-sm font-black text-white/75">Gina Smith</p>
                        <p className="text-xs text-white/40">Client Recommendation</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
                    <p className="text-sm leading-relaxed text-white/65 italic">"Robby is a forward-thinking entrepreneur with a genuine passion for delivering excellent service. His approach to fitness equipment repair combines technical expertise with a strong understanding of customer needs. The work 2EZ TEK does is a direct reflection of Robby's drive to provide professional, reliable service that clients can count on."</p>
                    <div className="mt-4 flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full border border-white/15 bg-white/10 flex items-center justify-center text-xs font-black text-white/50">EE</div>
                      <div>
                        <p className="text-sm font-black text-white/75">Ernie Elbert</p>
                        <p className="text-xs text-white/40">Client Recommendation</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── Services ──────────────────────────────────────────────────────── */}
      <section className="border-t border-white/10 bg-[#070B12] px-6 py-28 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <Reveal className="mb-14 max-w-3xl">
            <div className="flex items-center gap-3 mb-6">
              <span className="h-px w-8 bg-cyan-400" />
              <span className="text-xs font-black uppercase tracking-[0.3em] text-cyan-400">What We Do</span>
            </div>
            <h2 className="text-4xl font-black leading-tight md:text-6xl">
              From Home Gyms
              <span className="block text-white/45">To Commercial Facilities.</span>
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-white/60">Our work covers the full spectrum of fitness equipment service: repair, assembly, maintenance, and installation for residential and commercial clients across DFW.</p>
          </Reveal>

          <motion.div variants={staggerContainer(0.07, 0.1)} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service, i) => (
              <motion.div key={service.title} variants={staggerItem} whileHover={{ y: -6 }} transition={{ duration: 0.3, ease: EASE }} className="rounded-3xl border border-white/10 bg-white/[0.05] p-7 transition-all duration-300 hover:border-cyan-400/25 hover:bg-cyan-400/[0.04]">
                <div className="flex items-center gap-3 mb-3">
                  <span className="h-px w-5 bg-cyan-400" />
                  <span className="text-xs font-black uppercase tracking-[0.2em] text-cyan-400">Service {String(i + 1).padStart(2, '0')}</span>
                </div>
                <h3 className="text-xl font-black text-white">{service.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-white/55">{service.desc}</p>
              </motion.div>
            ))}
          </motion.div>

          <Reveal delay={0.2} className="mt-10 flex flex-wrap items-center gap-4">
            <Link href="/gym-equipment-repair-dallas" className="button-glow rounded-2xl bg-cyan-400 px-7 py-4 text-sm font-black uppercase tracking-[0.12em] text-black transition hover:scale-105 active:scale-95">View All Services</Link>
            <Link href="/brands" className="rounded-2xl border border-white/10 bg-white/5 px-7 py-4 text-sm font-black uppercase tracking-[0.12em] text-white transition hover:border-cyan-400/30 hover:bg-cyan-400/10">Brands We Service</Link>
          </Reveal>
        </div>
      </section>

      {/* ── Values ────────────────────────────────────────────────────────── */}
      <section className="border-t border-white/10 bg-[#07101D] px-6 py-28 lg:px-16">
        <div className="mx-auto max-w-7xl grid gap-16 lg:grid-cols-[1fr,1.2fr] lg:items-start">
          <Reveal direction="left">
            <div className="flex items-center gap-3 mb-6">
              <span className="h-px w-8 bg-cyan-400" />
              <span className="text-xs font-black uppercase tracking-[0.3em] text-cyan-400">Our Difference</span>
            </div>
            <h2 className="text-4xl font-black leading-tight md:text-6xl">
              Real Technicians.
              <span className="block text-white/45">Smarter Systems.</span>
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-white/65">
              2EZ TEK is not just a repair company. Our service process is supported by SmartGymOps, helping us manage request intake, technician workflow, equipment history, commercial maintenance tracking, and long-term operational visibility.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-3">
              <Link href="/smartgymops-features" className="button-glow rounded-2xl bg-cyan-400 px-7 py-4 text-sm font-black uppercase tracking-[0.12em] text-black transition hover:scale-105 active:scale-95">Explore SmartGymOps</Link>
              <a href="tel:9728077232" className="rounded-2xl border border-white/10 bg-white/5 px-7 py-4 text-sm font-black uppercase tracking-[0.12em] text-white transition hover:border-cyan-400/30 hover:bg-cyan-400/10">Call (972) 807-7232</a>
            </div>
          </Reveal>

          <motion.div variants={staggerContainer(0.1, 0.1)} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }} className="grid gap-4">
            {values.map((v) => (
              <motion.div key={v.title} variants={staggerItem} whileHover={{ x: 6 }} transition={{ duration: 0.3, ease: EASE }} className="flex items-start gap-5 rounded-3xl border border-white/10 bg-white/[0.05] p-6 transition-all duration-300 hover:border-cyan-400/25">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-xl">{v.icon}</div>
                <div>
                  <div className="font-black text-white">{v.title}</div>
                  <p className="mt-1 text-sm leading-relaxed text-white/55">{v.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Service Areas ─────────────────────────────────────────────────── */}
      <section className="border-t border-white/10 bg-[#050B14] px-6 py-28 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <Reveal className="text-center max-w-3xl mx-auto mb-14">
            <div className="flex items-center justify-center gap-3 mb-6">
              <span className="h-px w-8 bg-cyan-400" />
              <span className="text-xs font-black uppercase tracking-[0.3em] text-cyan-400">Where We Work</span>
              <span className="h-px w-8 bg-cyan-400" />
            </div>
            <h2 className="text-4xl font-black leading-tight md:text-6xl">
              Serving All of Dallas
              <span className="block text-white/45">Fort Worth.</span>
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-white/60">From Addison to Arlington, Frisco to Fort Worth. 2EZ TEK covers the full DFW metroplex for residential and commercial fitness equipment service.</p>
          </Reveal>

          <Reveal delay={0.2} className="flex flex-wrap justify-center gap-3">
            {areas.map((area) => (
              <Link key={area} href={'/areas/' + area.toLowerCase().replace(' ', '-')} className="rounded-2xl border border-white/10 bg-white/[0.05] px-5 py-3 text-sm font-black uppercase tracking-[0.14em] text-white/65 transition hover:border-cyan-400/30 hover:bg-cyan-400/[0.05] hover:text-cyan-300">
                {area}
              </Link>
            ))}
          </Reveal>
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-t border-white/10 bg-[#070B12] px-6 py-32 text-center lg:px-16">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.1),transparent_55%)]" />
        <Reveal className="relative z-10 mx-auto max-w-4xl">
          <div className="flex items-center justify-center gap-3 mb-6">
            <span className="h-px w-8 bg-cyan-400" />
            <span className="text-xs font-black uppercase tracking-[0.3em] text-cyan-400">Ready To Work Together?</span>
            <span className="h-px w-8 bg-cyan-400" />
          </div>
          <h2 className="text-4xl font-black leading-tight md:text-6xl">
            Book Your Service With
            <span className="block text-white/45">2EZ TEK Today.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/60">Whether you need a single repair or a full commercial maintenance program, our team is ready to help across Dallas Fort Worth.</p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <button type="button" onClick={() => window.dispatchEvent(new CustomEvent('open-booking-modal'))} className="button-glow block rounded-2xl bg-cyan-400 px-8 py-5 text-sm font-black uppercase tracking-[0.15em] text-black shadow-[0_0_40px_rgba(34,211,238,0.3)]">Book Service</button>
            </motion.div>
            <a href="tel:9728077232" className="rounded-2xl border border-white/10 bg-white/5 px-8 py-5 text-sm font-black uppercase tracking-[0.15em] text-white transition hover:border-cyan-400/30 hover:bg-cyan-400/10">Call (972) 807-7232</a>
          </div>
        </Reveal>
      </section>
    </main>
  )
}
