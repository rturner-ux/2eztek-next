// app/careers-1/CareersClient.tsx
'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion, useInView, useScroll, useTransform, AnimatePresence } from 'framer-motion'
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

const roles = [
  {
    title: 'Fitness Equipment Technician',
    type: 'Field Service',
    location: 'Dallas Fort Worth, TX',
    icon: '⚙️',
    description: 'Diagnose, repair, and maintain treadmills, ellipticals, bikes, strength machines, and commercial gym equipment across DFW. Residential and commercial clients.',
    requirements: [
      'Experience with fitness equipment repair or mechanical/electrical service',
      'Reliable vehicle and ability to travel across DFW',
      'Professional communication and clean jobsite discipline',
      'Ability to work independently and manage your own schedule',
      'Experience with brands like Life Fitness, Precor, Matrix, NordicTrack a plus',
    ],
    perks: [
      'Flexible scheduling',
      'Competitive pay',
      'SmartGymOps-powered workflow',
      'Growing client base',
    ],
  },
  {
    title: 'Customer Support Specialist',
    type: 'Remote / Hybrid',
    location: 'Dallas Fort Worth, TX',
    icon: '📞',
    description: 'Handle inbound service requests, schedule technician appointments, follow up with clients, and support the 2EZ TEK operations team using SmartGymOps.',
    requirements: [
      'Strong communication skills — phone, email, and text',
      'Organized and detail-oriented with scheduling and follow-up',
      'Comfortable using CRM and service management tools',
      'Ability to manage multiple requests simultaneously',
      'Customer service or dispatch background a plus',
    ],
    perks: [
      'Remote / hybrid flexibility',
      'Competitive compensation',
      'SmartGymOps platform training provided',
      'Growing team environment',
    ],
  },
]

const values = [
  { icon: '🎯', title: 'Professional Standards', desc: 'We show up on time, communicate clearly, and leave every job site clean.' },
  { icon: '📈', title: 'Room to Grow', desc: 'As 2EZ TEK expands across DFW, so do the opportunities for our team.' },
  { icon: '⚡', title: 'SmartGymOps Powered', desc: 'Work smarter with AI-assisted tools, digital job tracking, and real-time updates.' },
  { icon: '🤝', title: 'Team Culture', desc: 'We treat every team member with the same respect we give our clients.' },
]

const emptyForm = {
  name: '',
  email: '',
  phone: '',
  role: 'Fitness Equipment Technician',
  experience: '',
  message: '',
}

export default function CareersClient() {
  const heroRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '20%'])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0])

  const [expandedRole, setExpandedRole] = useState<number | null>(null)
  const [formData, setFormData] = useState(emptyForm)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  function updateForm(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      setSubmitting(true)
      setError('')
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          source: 'Careers Page',
          details: `Role: ${formData.role}\nExperience: ${formData.experience}\nMessage: ${formData.message}`,
        }),
      })
      const result = await response.json()
      if (!response.ok || !result.success) throw new Error(result.message || 'Submission failed')
      setSubmitted(true)
      setFormData(emptyForm)
    } catch (err) {
      setError('Something went wrong. Please email jobs@2eztek.com directly.')
    } finally {
      setSubmitting(false)
    }
  }

  const inputClass = 'w-full rounded-2xl border border-white/10 bg-white/[0.05] px-5 py-4 text-sm text-white outline-none placeholder:text-white/35 focus:border-cyan-400/60 transition'

  return (
    <main className="min-h-screen overflow-hidden bg-[#070B12] text-white">

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section ref={heroRef} className="relative min-h-screen overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <motion.div style={{ y: heroY }} className="relative h-[115%] w-[112%]">
            <motion.div initial={{ scale: 1.08 }} animate={{ scale: 1 }} transition={{ duration: 2.2, ease: EASE }} className="h-full w-full">
              <Image src="/images/careers-team.webp" alt="2EZ TEK team" fill priority sizes="100vw" className="object-cover opacity-90" />
            </motion.div>
          </motion.div>
        </div>
        <div className="absolute inset-0 bg-black/15" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,11,18,0.80)_0%,rgba(7,11,18,0.35)_50%,rgba(7,11,18,0.0)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.12),transparent_38%)]" />

        <motion.div style={{ opacity: heroOpacity }} className="relative z-10 flex min-h-screen items-center px-6 py-32 lg:px-16">
          <div className="max-w-5xl">
            <div className="mb-8 flex items-center gap-3">
              <motion.span initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.7, delay: 0.3, ease: EASE }} style={{ originX: 0 }} className="block h-px w-10 bg-cyan-400" />
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7, delay: 0.55 }} className="text-xs font-black uppercase tracking-[0.3em] text-cyan-400">
                Join The 2EZ TEK Team
              </motion.span>
            </div>

            <motion.h1 initial={{ opacity: 0, y: 56 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.1, delay: 0.2, ease: EASE }} className="text-5xl font-black leading-[0.92] tracking-tight md:text-7xl lg:text-8xl">
              Build Your Career
              <span className="block text-cyan-400">In Fitness Equipment</span>
              <span className="block text-white/40">Service.</span>
            </motion.h1>

            <motion.p initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.5, ease: EASE }} className="mt-8 max-w-2xl text-lg leading-8 text-white/75 md:text-xl">
              2EZ TEK is growing across Dallas Fort Worth. We're looking for skilled technicians and customer support professionals who take pride in their work and want to be part of a technology-forward service company.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.65, ease: EASE }} className="mt-10 flex flex-wrap gap-4">
              <a href="#apply" className="button-glow rounded-2xl bg-cyan-400 px-8 py-5 text-sm font-black uppercase tracking-[0.12em] text-black transition hover:scale-105 active:scale-95">
                Apply Now
              </a>
              <a href="mailto:jobs@2eztek.com" className="rounded-2xl border border-white/10 bg-white/5 px-8 py-5 text-sm font-black uppercase tracking-[0.12em] text-white transition hover:border-cyan-400/30 hover:bg-cyan-400/10">
                Email jobs@2eztek.com
              </a>
            </motion.div>

            {/* Quick stats */}
            <motion.div variants={staggerContainer(0.1, 0.85)} initial="hidden" animate="show" className="mt-16 grid grid-cols-2 gap-4 md:grid-cols-4">
              {[
                { value: 'DFW', label: 'Service Area' },
                { value: '2', label: 'Open Roles' },
                { value: 'Flex', label: 'Scheduling' },
                { value: 'Tech', label: 'SmartGymOps Tools' },
              ].map((s) => (
                <motion.div key={s.label} variants={staggerItem} whileHover={{ y: -4 }} className="rounded-3xl border border-white/10 bg-black/30 p-5 backdrop-blur-xl">
                  <div className="text-2xl font-black text-cyan-400">{s.value}</div>
                  <div className="mt-2 text-xs font-black uppercase tracking-[0.15em] text-white/45">{s.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ── Why 2EZ TEK ───────────────────────────────────────────────────── */}
      <section className="border-t border-white/10 bg-[#0B1220] px-6 py-28 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <Reveal className="mb-14 max-w-3xl">
            <div className="flex items-center gap-3 mb-6">
              <span className="h-px w-8 bg-cyan-400" />
              <span className="text-xs font-black uppercase tracking-[0.3em] text-cyan-400">Why Work With Us</span>
            </div>
            <h2 className="text-4xl font-black leading-tight md:text-6xl">
              A Company That
              <span className="block text-white/45">Works As Hard As You Do.</span>
            </h2>
          </Reveal>

          <motion.div variants={staggerContainer(0.08, 0.1)} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }} className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((v) => (
              <motion.div key={v.title} variants={staggerItem} whileHover={{ y: -6 }} transition={{ duration: 0.3, ease: EASE }} className="rounded-3xl border border-white/10 bg-white/[0.05] p-7 transition-all duration-300 hover:border-cyan-400/25">
                <div className="text-3xl mb-4">{v.icon}</div>
                <h3 className="font-black text-white">{v.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-white/55">{v.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Open Roles ────────────────────────────────────────────────────── */}
      <section className="border-t border-white/10 bg-[#070B12] px-6 py-28 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <Reveal className="mb-14 max-w-3xl">
            <div className="flex items-center gap-3 mb-6">
              <span className="h-px w-8 bg-cyan-400" />
              <span className="text-xs font-black uppercase tracking-[0.3em] text-cyan-400">Open Positions</span>
            </div>
            <h2 className="text-4xl font-black leading-tight md:text-6xl">
              We're Hiring
              <span className="block text-white/45">Across DFW.</span>
            </h2>
          </Reveal>

          <div className="grid gap-5">
            {roles.map((role, i) => (
              <motion.div
                key={role.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.7, delay: i * 0.1, ease: EASE }}
                className="rounded-3xl border border-white/10 bg-white/[0.05] overflow-hidden transition-all duration-300 hover:border-cyan-400/25"
              >
                {/* Role header */}
                <button
                  type="button"
                  onClick={() => setExpandedRole(expandedRole === i ? null : i)}
                  className="w-full flex items-center justify-between gap-6 p-8 text-left"
                >
                  <div className="flex items-center gap-5">
                    <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-2xl">
                      {role.icon}
                    </div>
                    <div>
                      <div className="text-xl font-black text-white">{role.title}</div>
                      <div className="mt-1 flex flex-wrap items-center gap-3">
                        <span className="border-l-2 border-cyan-400/50 pl-2 text-xs font-black uppercase tracking-[0.18em] text-cyan-400/70">{role.type}</span>
                        <span className="text-xs text-white/35">{role.location}</span>
                      </div>
                    </div>
                  </div>
                  <motion.div
                    animate={{ rotate: expandedRole === i ? 45 : 0 }}
                    transition={{ duration: 0.25, ease: EASE }}
                    className="flex-shrink-0 text-2xl text-cyan-400"
                  >
                    +
                  </motion.div>
                </button>

                {/* Expanded content */}
                <AnimatePresence initial={false}>
                  {expandedRole === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.4, ease: EASE }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-white/10 px-8 pb-8 pt-6">
                        <p className="text-white/65 leading-relaxed mb-8">{role.description}</p>

                        <div className="grid gap-8 md:grid-cols-2">
                          <div>
                            <div className="text-xs font-black uppercase tracking-[0.2em] text-cyan-400 mb-4">Requirements</div>
                            <ul className="space-y-3">
                              {role.requirements.map((req) => (
                                <li key={req} className="flex items-start gap-3 text-sm text-white/60">
                                  <span className="mt-0.5 h-2 w-2 flex-shrink-0 rounded-full bg-cyan-400" />
                                  {req}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <div className="text-xs font-black uppercase tracking-[0.2em] text-cyan-400 mb-4">What You Get</div>
                            <ul className="space-y-3">
                              {role.perks.map((perk) => (
                                <li key={perk} className="flex items-start gap-3 text-sm text-white/60">
                                  <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-cyan-400/20 text-[10px] font-black text-cyan-400">✓</span>
                                  {perk}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        <div className="mt-8 flex flex-wrap gap-3">
                          <a
                            href="#apply"
                            onClick={() => setFormData((prev) => ({ ...prev, role: role.title }))}
                            className="rounded-2xl bg-cyan-400 px-6 py-4 text-sm font-black uppercase tracking-[0.12em] text-black transition hover:scale-105 active:scale-95"
                          >
                            Apply For This Role
                          </a>
                          <a
                            href={`mailto:jobs@2eztek.com?subject=Application: ${role.title}`}
                            className="rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-sm font-black uppercase tracking-[0.12em] text-white transition hover:border-cyan-400/30 hover:bg-cyan-400/10"
                          >
                            Email Application
                          </a>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Application Form ──────────────────────────────────────────────── */}
      <section id="apply" className="border-t border-white/10 bg-[#0B1220] px-6 py-28 lg:px-16">
        <div className="mx-auto max-w-7xl grid gap-16 lg:grid-cols-[1fr,1.2fr] lg:items-start">
          <Reveal>
            <div className="flex items-center gap-3 mb-6">
              <span className="h-px w-8 bg-cyan-400" />
              <span className="text-xs font-black uppercase tracking-[0.3em] text-cyan-400">Apply Now</span>
            </div>
            <h2 className="text-4xl font-black leading-tight md:text-5xl">
              Ready To Join
              <span className="block text-white/45">The Team?</span>
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-white/60">
              Fill out the form and we'll be in touch. You can also email your resume directly to{' '}
              <a href="mailto:jobs@2eztek.com" className="text-cyan-400 hover:underline">jobs@2eztek.com</a>.
            </p>

            <div className="mt-10 space-y-4">
              {[
                { icon: '📧', label: 'Email', value: 'jobs@2eztek.com', href: 'mailto:jobs@2eztek.com' },
                { icon: '📍', label: 'Location', value: 'Dallas Fort Worth, TX', href: null },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4">
                  <span className="text-xl">{item.icon}</span>
                  <div>
                    <div className="text-xs font-black uppercase tracking-[0.18em] text-cyan-400">{item.label}</div>
                    {item.href ? (
                      <a href={item.href} className="text-sm text-white/65 hover:text-cyan-300 transition">{item.value}</a>
                    ) : (
                      <div className="text-sm text-white/65">{item.value}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.15}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 24 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.7, ease: EASE }}
              className="rounded-[2.5rem] border border-white/10 bg-white/[0.04] p-8 backdrop-blur-xl overflow-hidden"
            >
              <AnimatePresence mode="wait">
              {submitted ? (
                <motion.div
                  key="confirmation"
                  initial={{ opacity: 0, y: 24, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.5, ease: EASE }}
                  className="text-center py-12"
                >
                  <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5, delay: 0.1, ease: EASE }} className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border-2 border-cyan-400/40 bg-cyan-400/10">
                    <svg className="h-10 w-10 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <motion.path d="M5 13l4 4L19 7" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 0.3 }} />
                    </svg>
                    <motion.div className="absolute inset-0 rounded-full border border-cyan-400/30" animate={{ scale: [1, 1.5, 1.5], opacity: [0.6, 0, 0] }} transition={{ duration: 1.2, delay: 0.4, repeat: 2 }} />
                  </motion.div>
                  <div className="text-xs font-black uppercase tracking-[0.3em] text-cyan-400 mb-3">Application Received</div>
                  <h3 className="text-3xl font-black">Thank you!</h3>
                  <p className="mt-4 text-white/60">We'll review your application and be in touch soon.</p>
                  <button onClick={() => setSubmitted(false)} className="mt-8 rounded-2xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-black text-white transition hover:border-cyan-400/30">
                    Submit Another
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="grid gap-4" noValidate>
                  {error && (
                    <div className="rounded-2xl border border-red-400/20 bg-red-500/10 px-5 py-4 text-sm text-red-200">{error}</div>
                  )}

                  <div className="grid gap-4 md:grid-cols-2">
                    <input type="text" name="name" value={formData.name} onChange={updateForm} placeholder="Full Name *" required className={inputClass} />
                    <input type="email" name="email" value={formData.email} onChange={updateForm} placeholder="Email Address *" required className={inputClass} />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <input type="tel" name="phone" value={formData.phone} onChange={updateForm} placeholder="Phone Number *" required className={inputClass} />
                    <select name="role" value={formData.role} onChange={updateForm} className="w-full rounded-2xl border border-white/10 bg-[#0B1220] px-5 py-4 text-sm text-white outline-none focus:border-cyan-400/60 transition">
                      <option>Fitness Equipment Technician</option>
                      <option>Customer Support Specialist</option>
                      <option>Open to Either Role</option>
                    </select>
                  </div>

                  <input type="text" name="experience" value={formData.experience} onChange={updateForm} placeholder="Years of relevant experience" className={inputClass} />

                  <textarea name="message" value={formData.message} onChange={updateForm} rows={5} placeholder="Tell us about yourself, your background, and why you want to join 2EZ TEK." required className={`resize-none ${inputClass}`} />

                  <p className="text-xs text-white/30">* Required fields</p>

                  <button type="submit" disabled={submitting} className="button-glow rounded-2xl bg-cyan-400 px-6 py-5 text-sm font-black uppercase tracking-[0.15em] text-black disabled:cursor-not-allowed disabled:opacity-60 transition hover:scale-105 active:scale-95">
                    {submitting ? 'Submitting…' : 'Submit Application'}
                  </button>
                </form>
              )}
            </AnimatePresence>
            </motion.div>
          </Reveal>
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-t border-white/10 bg-[#070B12] px-6 py-28 text-center lg:px-16">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.08),transparent_55%)]" />
        <Reveal className="relative z-10 mx-auto max-w-3xl">
          <div className="flex items-center justify-center gap-3 mb-6">
            <span className="h-px w-8 bg-cyan-400" />
            <span className="text-xs font-black uppercase tracking-[0.3em] text-cyan-400">Questions?</span>
            <span className="h-px w-8 bg-cyan-400" />
          </div>
          <h2 className="text-4xl font-black leading-tight md:text-6xl">
            Have Questions?
            <span className="block text-white/45">Reach Out Directly.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-white/55">
            Email us at{' '}
            <a href="mailto:jobs@2eztek.com" className="text-cyan-400 hover:underline">jobs@2eztek.com</a>
            {' '}or call{' '}
            <a href="tel:9728077232" className="text-cyan-400 hover:underline">(972) 807-7232</a>.
          </p>
        </Reveal>
      </section>
    </main>
  )
}
