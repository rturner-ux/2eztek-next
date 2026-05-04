'use client'

import Link from 'next/link'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const PHONE_DISPLAY = '(972) 807-7232'

const stats = [
  ['10K+', 'Machines Serviced'],
  ['500+', '5-Star Reviews'],
  ['24/7', 'Emergency Support'],
  ['DFW', 'Coverage Area'],
]

const servicePaths = [
  {
    label: 'Residential',
    title: 'Home Gym Services',
    text: 'Treadmill repair, home gym assembly, elliptical service, relocation, diagnostics, and white-glove equipment setup.',
    button: 'Book Home Service',
    href: '/gym-equipment-repair-dallas',
  },
  {
    label: 'Commercial',
    title: 'Facility Maintenance',
    text: 'Preventative maintenance, repair programs, project installs, QR reporting, asset tracking, and SmartGymOps-powered service.',
    button: 'Explore Commercial',
    href: '/commercial-gym-maintenance',
  },
]

const projectCards = [
  { image: '/images/darren.webp', title: 'Luxury Residential Setup', tag: 'Home Gym' },
  { image: '/images/fire.webp', title: 'First Responder Facility', tag: 'Government' },
]

const reviews = [
  {
    name: 'Residential Client',
    text: 'Fast, professional, and extremely knowledgeable. Our treadmill was repaired the same day and works perfectly.',
  },
  {
    name: 'Apartment Fitness Center',
    text: '2EZ TEK completely transformed how we manage our fitness equipment maintenance and repairs.',
  },
  {
    name: 'Commercial Gym Owner',
    text: 'Professional communication, premium service, and real operational expertise from start to finish.',
  },
]

const emptyForm = {
  name: '',
  phone: '',
  email: '',
  serviceType: 'Residential Service',
  address: '',
  equipmentType: '',
  brandModel: '',
  details: '',
}

export default function HomePage() {
  const [bookingOpen, setBookingOpen] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [formData, setFormData] = useState(emptyForm)

  function openBooking() {
    setBookingOpen(true)
    setErrorMessage('')
  }

  function closeBooking() {
    setBookingOpen(false)
    setSubmitted(false)
    setSubmitting(false)
    setErrorMessage('')
  }

  function updateForm(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  async function submitServiceRequest() {
    try {
      setSubmitting(true)
      setErrorMessage('')

      const response = await fetch('/api/service-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Request failed')
      }

      setSubmitted(true)
      setFormData(emptyForm)
    } catch (error) {
      console.error('SERVICE REQUEST SUBMIT ERROR:', error)
      setErrorMessage(`Something went wrong. Please call ${PHONE_DISPLAY} or try again.`)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#070B12] text-white">
      <motion.button
        onClick={openBooking}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1, duration: 0.6 }}
        className="button-glow fixed bottom-5 right-5 z-50 rounded-full bg-cyan-400 px-6 py-4 text-sm font-black text-black shadow-[0_0_45px_rgba(34,211,238,0.35)]"
      >
        Book Service
      </motion.button>

      <section className="relative min-h-screen overflow-hidden pt-28 lg:pt-32">
        <div className="absolute inset-0 overflow-hidden">
          <motion.img
            src="/images/rev.webp"
            alt="REV Fitness Fort Worth"
            initial={{ scale: 1.08, x: '-4%' }}
            animate={{ scale: 1.08, x: ['-4%', '4%'] }}
            transition={{
              duration: 70,
              repeat: Infinity,
              repeatType: 'mirror',
              ease: 'easeInOut',
            }}
            className="h-full w-[112%] max-w-none object-cover opacity-[0.6]"
          />
        </div>

        <div className="absolute inset-0 bg-black/34" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,11,18,0.96)_0%,rgba(7,11,18,0.72)_43%,rgba(7,11,18,0.18)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.24),transparent_35%)]" />
        <div className="absolute left-[-120px] top-[180px] h-[420px] w-[420px] rounded-full bg-cyan-500/10 blur-3xl" />

        <div className="relative z-10 grid min-h-[82vh] items-center gap-12 px-6 py-20 lg:grid-cols-[1fr,420px] lg:px-16">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.1 }}
            className="max-w-4xl"
          >
            <div className="mb-6 inline-flex items-center rounded-full border border-cyan-400/20 bg-cyan-400/10 px-5 py-2 text-xs font-black uppercase tracking-[0.25em] text-cyan-300 backdrop-blur-xl">
              500+ Five-Star Service Experiences
            </div>

            <h1 className="max-w-4xl text-4xl font-black leading-[1] tracking-tight md:text-6xl lg:text-7xl">
              Professional Fitness Equipment
              <span className="block text-cyan-400">Repair & Assembly.</span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/75 md:text-xl">
              From luxury home gyms to commercial fitness centers, 2EZ TEK delivers fast,
              reliable service powered by smarter technology and real-world expertise.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <button
                onClick={openBooking}
                className="button-glow rounded-2xl bg-cyan-400 px-7 py-4 text-sm font-black uppercase tracking-[0.1em] text-black"
              >
                Book Repair Service
              </button>

              <Link
                href="/gym-equipment-repair-dallas"
                className="rounded-2xl border border-white/10 bg-white/5 px-7 py-4 text-sm font-black uppercase tracking-[0.1em] text-white backdrop-blur-xl transition hover:border-cyan-400/30 hover:bg-cyan-400/10"
              >
                View Services
              </Link>
            </div>

            <div className="mt-14 grid grid-cols-2 gap-4 md:grid-cols-4">
              {stats.map(([stat, label], i) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55, delay: 0.25 + i * 0.08 }}
                  className="glow-card rounded-3xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur-xl"
                >
                  <div className="text-3xl font-black text-cyan-400">{stat}</div>
                  <div className="mt-2 text-sm text-white/55">{label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 36 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.85, delay: 0.25 }}
            className="rounded-[32px] border border-white/10 bg-white/[0.08] p-5 shadow-[0_20px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl"
          >
            <div className="rounded-[24px] bg-[#0B1220]/90 p-5">
              <div className="text-sm font-black uppercase tracking-[0.25em] text-cyan-300">
                Smart Service
              </div>

              <h2 className="mt-3 text-2xl font-black">
                Easy booking. Clear updates. Better repairs.
              </h2>

              <div className="mt-6 space-y-3">
                {[
                  'Schedule residential or commercial service',
                  'Get real-time job status updates',
                  'Track equipment history and maintenance needs',
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-white/10 bg-white/[0.05] p-4 text-sm text-white/70"
                  >
                    {item}
                  </div>
                ))}
              </div>

              <a
                href="tel:9728077232"
                className="mt-5 flex items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-5 py-4 text-sm font-black text-cyan-200 transition hover:bg-cyan-400/15"
              >
                Call {PHONE_DISPLAY}
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-[#0B1220] px-6 py-16 lg:px-16">
        <div className="text-center">
          <div className="text-sm font-black uppercase tracking-[0.3em] text-cyan-400">
            Trusted By Homeowners & Fitness Facilities
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-8 text-sm font-black uppercase tracking-[0.16em] text-white/35 md:text-base">
            <span>500+ 5-Star Reviews</span>
            <span>Dallas Fort Worth</span>
            <span>Home Gyms</span>
            <span>Commercial Facilities</span>
            <span>SmartGymOps Powered</span>
          </div>
        </div>
      </section>

      <section className="bg-[#070B12] px-6 py-24 lg:px-16">
        <div className="mb-14 max-w-4xl">
          <div className="text-sm font-black uppercase tracking-[0.3em] text-cyan-400">
            Choose Your Service
          </div>

          <h2 className="mt-4 text-4xl font-black leading-tight md:text-6xl">
            Built For Homes.
            <span className="block text-white/45">Ready For Commercial Gyms.</span>
          </h2>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {servicePaths.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.7, delay: i * 0.12 }}
              className="card-hover rounded-[36px] border border-white/10 bg-white/[0.05] p-8 backdrop-blur-xl"
            >
              <div className="mb-8 inline-flex rounded-2xl bg-cyan-400/10 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-cyan-300">
                {item.label}
              </div>

              <h3 className="text-4xl font-black">{item.title}</h3>

              <p className="mt-5 max-w-xl text-white/60">{item.text}</p>

              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  onClick={openBooking}
                  className="button-glow rounded-2xl bg-cyan-400 px-6 py-4 text-sm font-black text-black"
                >
                  {item.button}
                </button>

                <Link
                  href={item.href}
                  className="rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-sm font-black text-white transition hover:border-cyan-400/30 hover:bg-cyan-400/10"
                >
                  Learn More
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="relative overflow-hidden border-t border-white/10 bg-[#07101D] px-6 py-28 lg:px-16">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.12),transparent_35%)]" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative z-10 grid gap-12 lg:grid-cols-[1fr,460px] lg:items-center"
        >
          <div>
            <div className="text-sm font-black uppercase tracking-[0.3em] text-cyan-400">
              Powered By SmartGymOps
            </div>

            <h2 className="mt-4 max-w-4xl text-4xl font-black leading-tight md:text-6xl">
              Premium Field Service.
              <span className="block text-white/45">
                Smarter Equipment Operations.
              </span>
            </h2>

            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/65">
              2EZ TEK delivers hands-on repair, assembly, and maintenance.
              SmartGymOps powers the workflow behind the scenes with smarter tracking,
              service history, QR reporting, and operational visibility.
            </p>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {[
                'Service requests organized from intake to completion',
                'Equipment history tracked across every machine',
                'QR reporting support for commercial facilities',
                'Maintenance visibility built for long-term uptime',
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-white/10 bg-white/[0.05] p-5 text-sm font-semibold text-white/70"
                >
                  {item}
                </div>
              ))}
            </div>

            <div className="mt-10 flex flex-wrap gap-3">
              <button
                onClick={openBooking}
                className="button-glow rounded-2xl bg-cyan-400 px-7 py-4 text-sm font-black uppercase tracking-[0.12em] text-black"
              >
                Request Smart Service
              </button>

              <Link
                href="https://smartgymops.com"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-2xl border border-white/10 bg-white/5 px-7 py-4 text-sm font-black uppercase tracking-[0.12em] text-white transition hover:border-cyan-400/30 hover:bg-cyan-400/10"
              >
                Visit SmartGymOps
              </Link>
            </div>
          </div>

          <div className="rounded-[36px] border border-white/10 bg-white/[0.06] p-6 shadow-[0_25px_100px_rgba(0,0,0,0.45)] backdrop-blur-xl">
            <div className="rounded-[28px] bg-[#0B1220] p-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-5">
                <div>
                  <div className="text-xl font-black">SmartGymOps</div>
                  <div className="mt-1 text-sm text-white/45">
                    Service Intelligence Layer
                  </div>
                </div>

                <div className="rounded-full bg-emerald-400/10 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-emerald-300">
                  Active
                </div>
              </div>

              <div className="mt-6 space-y-4">
                {[
                  ['Request Created', 'Customer issue captured'],
                  ['Tech Assigned', 'Job routed for service'],
                  ['Repair Logged', 'Equipment history updated'],
                  ['Uptime Improved', 'Maintenance insight retained'],
                ].map(([title, text]) => (
                  <div
                    key={title}
                    className="rounded-2xl border border-white/10 bg-white/[0.05] p-4"
                  >
                    <div className="font-black text-cyan-300">{title}</div>
                    <div className="mt-1 text-sm text-white/50">{text}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      <section className="relative overflow-hidden border-t border-white/10 bg-[#0B1220] px-6 py-28 lg:px-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative z-10"
        >
          <div className="max-w-4xl">
            <div className="text-sm font-black uppercase tracking-[0.3em] text-cyan-400">
              Featured Projects
            </div>

            <h2 className="mt-4 text-4xl font-black leading-tight md:text-6xl">
              Real Work.
              <span className="block text-white/45">Real Installations.</span>
            </h2>
          </div>

          <div className="mt-16 grid gap-6 lg:grid-cols-12">
            <motion.div
              whileHover={{ y: -8 }}
              className="group relative overflow-hidden rounded-[36px] border border-white/10 lg:col-span-7"
            >
              <img
                src="/images/rev.webp"
                alt="REV Fitness Fort Worth"
                className="hero-image h-[620px] w-full object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

              <div className="absolute bottom-0 p-8">
                <div className="inline-flex rounded-full bg-cyan-400/10 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-cyan-300 backdrop-blur-xl">
                  Commercial Facility
                </div>

                <h3 className="mt-5 text-4xl font-black">REV Fitness Fort Worth</h3>
              </div>
            </motion.div>

            <div className="grid gap-6 lg:col-span-5">
              {projectCards.map((item) => (
                <motion.div
                  key={item.title}
                  whileHover={{ y: -8 }}
                  className="group relative overflow-hidden rounded-[36px] border border-white/10"
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    className="hero-image h-[297px] w-full object-cover"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

                  <div className="absolute bottom-0 p-6">
                    <div className="inline-flex rounded-full bg-cyan-400/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-cyan-300 backdrop-blur-xl">
                      {item.tag}
                    </div>

                    <h3 className="mt-4 text-2xl font-black">{item.title}</h3>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <Link
            href="/projects"
            className="mt-10 inline-flex rounded-2xl border border-white/10 bg-white/5 px-7 py-4 text-sm font-black uppercase tracking-[0.12em] text-white transition hover:border-cyan-400/30 hover:bg-cyan-400/10"
          >
            View More Projects
          </Link>
        </motion.div>
      </section>

      <section className="relative overflow-hidden border-t border-white/10 bg-[#070B12] px-6 py-28 lg:px-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative z-10"
        >
          <div className="text-center">
            <div className="text-sm font-black uppercase tracking-[0.3em] text-cyan-400">
              Customer Experience
            </div>

            <h2 className="mt-4 text-4xl font-black md:text-6xl">
              Trusted By Homeowners
              <span className="block text-white/45">Across Dallas Fort Worth.</span>
            </h2>
          </div>

          <div className="mt-16 grid gap-6 lg:grid-cols-3">
            {reviews.map((review) => (
              <motion.div
                key={review.name}
                whileHover={{ y: -8 }}
                className="glow-card rounded-[36px] border border-white/10 bg-white/[0.05] p-8 backdrop-blur-xl"
              >
                <div className="text-5xl font-black text-cyan-400">“</div>
                <p className="mt-4 leading-relaxed text-white/70">{review.text}</p>
                <div className="mt-8 text-sm font-black uppercase tracking-[0.2em] text-cyan-300">
                  {review.name}
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-14 text-center">
            <Link
              href="/contact"
              className="button-glow inline-flex rounded-2xl bg-cyan-400 px-7 py-4 text-sm font-black uppercase tracking-[0.12em] text-black"
            >
              Contact 2EZ TEK
            </Link>
          </div>
        </motion.div>
      </section>

      <AnimatePresence>
        {bookingOpen && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4 backdrop-blur-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.96 }}
              transition={{ duration: 0.3 }}
              className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[36px] border border-white/10 bg-[#07101D] p-6 shadow-[0_30px_120px_rgba(0,0,0,0.75)]"
            >
              <div className="flex items-start justify-between gap-6 border-b border-white/10 pb-5">
                <div>
                  <div className="text-sm font-black uppercase tracking-[0.3em] text-cyan-300">
                    Service Request
                  </div>

                  <h2 className="mt-3 text-3xl font-black">
                    Tell us what you need repaired or installed.
                  </h2>
                </div>

                <button
                  onClick={closeBooking}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-black text-white"
                >
                  Close
                </button>
              </div>

              {submitted ? (
                <div className="mt-8 rounded-[28px] border border-cyan-400/20 bg-cyan-400/10 p-8 text-center">
                  <div className="text-sm font-black uppercase tracking-[0.3em] text-cyan-300">
                    Request Received
                  </div>

                  <h3 className="mt-4 text-3xl font-black">Thank you.</h3>

                  <p className="mx-auto mt-4 max-w-xl text-white/65">
                    Your service request has been captured successfully. Our team will follow up shortly.
                  </p>

                  <button
                    type="button"
                    onClick={closeBooking}
                    className="button-glow mt-8 rounded-2xl bg-cyan-400 px-6 py-4 text-sm font-black text-black"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <form className="mt-6 grid gap-4">
                  {errorMessage && (
                    <div className="rounded-2xl border border-red-400/20 bg-red-500/10 px-5 py-4 text-sm font-bold text-red-200">
                      {errorMessage}
                    </div>
                  )}

                  <div className="grid gap-4 md:grid-cols-2">
                    <input name="name" value={formData.name} onChange={updateForm} placeholder="Full Name" className="rounded-2xl border border-white/10 bg-white/[0.05] px-5 py-4 text-sm text-white outline-none placeholder:text-white/35 focus:border-cyan-400/40" />
                    <input name="phone" value={formData.phone} onChange={updateForm} placeholder="Phone Number" className="rounded-2xl border border-white/10 bg-white/[0.05] px-5 py-4 text-sm text-white outline-none placeholder:text-white/35 focus:border-cyan-400/40" />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <input name="email" value={formData.email} onChange={updateForm} placeholder="Email Address" className="rounded-2xl border border-white/10 bg-white/[0.05] px-5 py-4 text-sm text-white outline-none placeholder:text-white/35 focus:border-cyan-400/40" />

                    <select name="serviceType" value={formData.serviceType} onChange={updateForm} className="rounded-2xl border border-white/10 bg-[#0B1220] px-5 py-4 text-sm text-white outline-none focus:border-cyan-400/40">
                      <option>Residential Service</option>
                      <option>Commercial Service</option>
                      <option>Assembly / Installation</option>
                      <option>Preventative Maintenance</option>
                      <option>Emergency Repair</option>
                    </select>
                  </div>

                  <input name="address" value={formData.address} onChange={updateForm} placeholder="Service Address" className="rounded-2xl border border-white/10 bg-white/[0.05] px-5 py-4 text-sm text-white outline-none placeholder:text-white/35 focus:border-cyan-400/40" />

                  <div className="grid gap-4 md:grid-cols-2">
                    <input name="equipmentType" value={formData.equipmentType} onChange={updateForm} placeholder="Equipment Type" className="rounded-2xl border border-white/10 bg-white/[0.05] px-5 py-4 text-sm text-white outline-none placeholder:text-white/35 focus:border-cyan-400/40" />
                    <input name="brandModel" value={formData.brandModel} onChange={updateForm} placeholder="Brand / Model" className="rounded-2xl border border-white/10 bg-white/[0.05] px-5 py-4 text-sm text-white outline-none placeholder:text-white/35 focus:border-cyan-400/40" />
                  </div>

                  <textarea name="details" value={formData.details} onChange={updateForm} placeholder="Describe the issue or project details" rows={5} className="resize-none rounded-2xl border border-white/10 bg-white/[0.05] px-5 py-4 text-sm text-white outline-none placeholder:text-white/35 focus:border-cyan-400/40" />

                  <button
                    type="button"
                    onClick={submitServiceRequest}
                    disabled={submitting}
                    className="button-glow mt-2 rounded-2xl bg-cyan-400 px-6 py-5 text-sm font-black uppercase tracking-[0.15em] text-black disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submitting ? 'Submitting...' : 'Submit Service Request'}
                  </button>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}