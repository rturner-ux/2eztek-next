'use client'

import Image from 'next/image'
import Link from 'next/link'
import Script from 'next/script'
import { useState, useEffect, useRef } from 'react'
import { AnimatePresence, motion, useScroll, useTransform } from 'framer-motion'

// ─── Constants ───────────────────────────────────────────────────────────────

const PHONE_DISPLAY = '(972) 807-7232'
const PHONE_TEL = '9728077232'

// ─── Data ────────────────────────────────────────────────────────────────────

const stats = [
  ['10K+', 'Machines Serviced'],
  ['500+', '5-Star Reviews'],
  ['24/7', 'Emergency Support'],
  ['DFW', 'Coverage Area'],
] as const

const servicePaths = [
  {
    label: 'Residential',
    title: 'Home Gym Services',
    text: 'Treadmill repair, home gym assembly, elliptical service, relocation, diagnostics, and white-glove equipment setup.',
    button: 'Book Home Service',
    href: '/gym-equipment-repair-dallas',
    icon: '🏠',
  },
  {
    label: 'Commercial',
    title: 'Facility Maintenance',
    text: 'Preventative maintenance, repair programs, project installs, QR reporting, asset tracking, and SmartGymOps-powered service.',
    button: 'Explore Commercial',
    href: '/commercial-gym-maintenance',
    icon: '🏢',
  },
]

const seoServices = [
  { title: 'Treadmill Repair Dallas', href: '/treadmill-repair-dallas' },
  { title: 'Elliptical Repair Dallas', href: '/elliptical-repair-dallas' },
  { title: 'Exercise Bike Repair', href: '/exercise-bike-repair-dallas' },
  { title: 'Commercial Gym Maintenance', href: '/commercial-gym-maintenance' },
  { title: 'Fitness Equipment Assembly', href: '/fitness-equipment-assembly-dallas' },
  { title: 'Home Gym Installation', href: '/home-gym-installation-dallas' },
  { title: 'Preventative Maintenance', href: '/preventative-maintenance-dallas' },
  { title: 'Strength Equipment Repair', href: '/strength-equipment-repair-dallas' },
  { title: 'Cable Machine Repair', href: '/cable-machine-repair-dallas' },
  { title: 'Gym Equipment Troubleshooting', href: '/manuals' },
]

const serviceAreas = [
  'Dallas', 'Fort Worth', 'Plano', 'Frisco',
  'Irving', 'Arlington', 'Richardson', 'McKinney',
  'Garland', 'Mesquite', 'Carrollton', 'Addison',
]

const brands = [
  'Life Fitness', 'Precor', 'Matrix', 'Technogym',
  'Cybex', 'StairMaster', 'NordicTrack', 'Bowflex',
  'TRUE Fitness', 'Schwinn', 'Nautilus', 'Octane Fitness',
  'Star Trac', 'FreeMotion', 'Hammer Strength', 'SportsArt',
]

const projectCards = [
  { image: '/images/darren.webp', title: 'Luxury Residential Setup', tag: 'Home Gym' },
  { image: '/images/fire.webp', title: 'First Responder Facility', tag: 'Government' },
]

const reviews = [
  {
    name: 'Residential Client',
    location: 'Plano, TX',
    rating: 5,
    text: 'Fast, professional, and extremely knowledgeable. Our treadmill was repaired the same day and works perfectly.',
  },
  {
    name: 'Apartment Fitness Center',
    location: 'Dallas, TX',
    rating: 5,
    text: '2EZ TEK completely transformed how we manage our fitness equipment maintenance and repairs.',
  },
  {
    name: 'Commercial Gym Owner',
    location: 'Fort Worth, TX',
    rating: 5,
    text: 'Professional communication, premium service, and real operational expertise from start to finish.',
  },
]

const marketplacePreview = [
  {
    title: 'Life Fitness Discover SE3HD',
    price: '$4,800',
    tag: 'Commercial Cardio',
    href: '/equipment-for-sale/life-fitness-discover-se3hd',
    badge: 'New',
  },
  {
    title: 'Matrix Functional Trainer',
    price: '$2,300',
    tag: 'Strength Equipment',
    href: '/equipment-for-sale/matrix-functional-trainer',
    badge: null,
  },
  {
    title: 'Bowflex Treadmill 10',
    price: '$1,150',
    tag: 'Residential',
    href: '/equipment-for-sale/bowflex-treadmill-10',
    badge: null,
  },
]

const faqs = [
  {
    question: 'Do you repair treadmills in Dallas Fort Worth?',
    answer: 'Yes. 2EZ TEK provides treadmill repair throughout Dallas Fort Worth, including diagnostics, belt issues, motor problems, console problems, incline failures, noise issues, and maintenance.',
  },
  {
    question: 'Do you service commercial gyms and apartment fitness centers?',
    answer: 'Yes. We service commercial gyms, apartment fitness centers, hotels, corporate fitness rooms, schools, training studios, and other facilities that rely on working fitness equipment.',
  },
  {
    question: 'What fitness equipment brands do you repair?',
    answer: 'We service many major brands including Life Fitness, Precor, Matrix, Cybex, Technogym, NordicTrack, Bowflex, TRUE Fitness, StairMaster, Schwinn, Nautilus, and more.',
  },
  {
    question: 'Do you assemble home gym equipment?',
    answer: 'Yes. We provide home gym assembly, treadmill assembly, elliptical assembly, strength machine assembly, functional trainer setup, and white-glove fitness equipment installation.',
  },
  {
    question: 'Do you offer preventative maintenance?',
    answer: 'Yes. Preventative maintenance is available for both residential and commercial clients. This helps reduce downtime, extend equipment life, and catch problems before they become major repairs.',
  },
]

const REQUIRED_FIELDS = ['name', 'phone', 'email', 'address'] as const

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

type FormData = typeof emptyForm
type FormErrors = Partial<Record<keyof FormData, string>>

// ─── Sub-components ──────────────────────────────────────────────────────────

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className={`h-4 w-4 ${i < rating ? 'text-cyan-400' : 'text-white/20'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )
}

function FaqItem({ faq }: { faq: typeof faqs[0] }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.05] overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition hover:bg-white/[0.03]"
      >
        <h3 className="text-lg font-black text-white">{faq.question}</h3>
        <motion.span
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0 text-2xl text-cyan-400"
        >
          +
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <p className="px-6 pb-6 leading-relaxed text-white/60">{faq.answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Booking Modal ────────────────────────────────────────────────────────────

interface BookingModalProps {
  onClose: () => void
}

function BookingModal({ onClose }: BookingModalProps) {
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [formData, setFormData] = useState<FormData>(emptyForm)
  const [fieldErrors, setFieldErrors] = useState<FormErrors>({})
  const firstFieldRef = useRef<HTMLInputElement>(null)

  // Trap focus & handle Escape
  useEffect(() => {
    firstFieldRef.current?.focus()
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  function updateForm(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear field error on change
    if (fieldErrors[name as keyof FormData]) {
      setFieldErrors(prev => ({ ...prev, [name]: undefined }))
    }
  }

  function validate(): boolean {
    const errors: FormErrors = {}
    if (!formData.name.trim()) errors.name = 'Name is required'
    if (!formData.phone.trim()) errors.phone = 'Phone is required'
    else if (!/^[\d\s\-().+]{7,}$/.test(formData.phone)) errors.phone = 'Enter a valid phone number'
    if (!formData.email.trim()) errors.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = 'Enter a valid email'
    if (!formData.address.trim()) errors.address = 'Service address is required'
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    try {
      setSubmitting(true)
      setErrorMessage('')

      const response = await fetch('/api/service-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const result = await response.json()
      if (!response.ok || !result.success) throw new Error(result.message || 'Request failed')

      setSubmitted(true)
    } catch (error) {
      console.error('SERVICE REQUEST SUBMIT ERROR:', error)
      setErrorMessage(`Something went wrong. Please call ${PHONE_DISPLAY} or try again.`)
    } finally {
      setSubmitting(false)
    }
  }

  const inputClass = (field: keyof FormData) =>
    `w-full rounded-2xl border px-5 py-4 text-sm text-white outline-none placeholder:text-white/35 bg-white/[0.05] transition
    ${fieldErrors[field]
      ? 'border-red-400/60 focus:border-red-400'
      : 'border-white/10 focus:border-cyan-400/60'
    }`

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 px-4 backdrop-blur-xl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      role="dialog"
      aria-modal="true"
      aria-label="Book a service request"
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
            type="button"
            onClick={onClose}
            aria-label="Close booking modal"
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-black text-white transition hover:bg-white/10"
          >
            ✕
          </button>
        </div>

        {submitted ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 rounded-[28px] border border-cyan-400/20 bg-cyan-400/10 p-8 text-center"
          >
            <div className="text-4xl">✅</div>
            <div className="mt-4 text-sm font-black uppercase tracking-[0.3em] text-cyan-300">
              Request Received
            </div>
            <h3 className="mt-4 text-3xl font-black">Thank you.</h3>
            <p className="mx-auto mt-4 max-w-xl text-white/65">
              Your service request has been captured. Our team will follow up shortly.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="button-glow mt-8 rounded-2xl bg-cyan-400 px-6 py-4 text-sm font-black text-black"
            >
              Close
            </button>
          </motion.div>
        ) : (
          <form className="mt-6 grid gap-4" onSubmit={handleSubmit} noValidate>
            {errorMessage && (
              <div role="alert" className="rounded-2xl border border-red-400/20 bg-red-500/10 px-5 py-4 text-sm font-bold text-red-200">
                {errorMessage}
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <input
                  ref={firstFieldRef}
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={updateForm}
                  placeholder="Full Name *"
                  autoComplete="name"
                  className={inputClass('name')}
                />
                {fieldErrors.name && <p className="mt-1 pl-1 text-xs text-red-400">{fieldErrors.name}</p>}
              </div>
              <div>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={updateForm}
                  placeholder="Phone Number *"
                  autoComplete="tel"
                  pattern="[\d\s\-().+]{7,}"
                  className={inputClass('phone')}
                />
                {fieldErrors.phone && <p className="mt-1 pl-1 text-xs text-red-400">{fieldErrors.phone}</p>}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={updateForm}
                  placeholder="Email Address *"
                  autoComplete="email"
                  className={inputClass('email')}
                />
                {fieldErrors.email && <p className="mt-1 pl-1 text-xs text-red-400">{fieldErrors.email}</p>}
              </div>
              <select
                name="serviceType"
                value={formData.serviceType}
                onChange={updateForm}
                className="rounded-2xl border border-white/10 bg-[#0B1220] px-5 py-4 text-sm text-white outline-none focus:border-cyan-400/60 transition"
              >
                <option>Residential Service</option>
                <option>Commercial Service</option>
                <option>Assembly / Installation</option>
                <option>Preventative Maintenance</option>
                <option>Emergency Repair</option>
              </select>
            </div>

            <div>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={updateForm}
                placeholder="Service Address *"
                autoComplete="street-address"
                className={inputClass('address')}
              />
              {fieldErrors.address && <p className="mt-1 pl-1 text-xs text-red-400">{fieldErrors.address}</p>}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <input
                type="text"
                name="equipmentType"
                value={formData.equipmentType}
                onChange={updateForm}
                placeholder="Equipment Type (e.g. Treadmill)"
                className={inputClass('equipmentType')}
              />
              <input
                type="text"
                name="brandModel"
                value={formData.brandModel}
                onChange={updateForm}
                placeholder="Brand / Model"
                className={inputClass('brandModel')}
              />
            </div>

            <textarea
              name="details"
              value={formData.details}
              onChange={updateForm}
              placeholder="Describe the issue or project details"
              rows={5}
              className="resize-none rounded-2xl border border-white/10 bg-white/[0.05] px-5 py-4 text-sm text-white outline-none placeholder:text-white/35 focus:border-cyan-400/60 transition"
            />

            <p className="text-xs text-white/35">* Required fields</p>

            <button
              type="submit"
              disabled={submitting}
              className="button-glow mt-2 rounded-2xl bg-cyan-400 px-6 py-5 text-sm font-black uppercase tracking-[0.15em] text-black disabled:cursor-not-allowed disabled:opacity-60 transition"
            >
              {submitting ? 'Submitting…' : 'Submit Service Request'}
            </button>
          </form>
        )}
      </motion.div>
    </motion.div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function HomePage() {
  const [bookingOpen, setBookingOpen] = useState(false)
  const heroRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '18%'])

  function openBooking() { setBookingOpen(true) }
  function closeBooking() { setBookingOpen(false) }

  // ── Schemas ─────────────────────────────────────────────────────────────

  const localBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': 'https://2eztek.com',
    name: '2EZ TEK',
    url: 'https://2eztek.com',
    telephone: PHONE_DISPLAY,
    email: 'support@2eztek.com',
    image: 'https://2eztek.com/images/rev.webp',
    areaServed: serviceAreas.map(area => ({ '@type': 'City', name: area })),
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Dallas',
      addressRegion: 'TX',
      addressCountry: 'US',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '5',
      reviewCount: '500',
    },
    serviceType: [
      'Fitness Equipment Repair',
      'Treadmill Repair',
      'Elliptical Repair',
      'Exercise Bike Repair',
      'Gym Equipment Assembly',
      'Commercial Gym Maintenance',
      'Preventative Maintenance',
    ],
  }

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  }

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <main className="min-h-screen overflow-hidden bg-[#070B12] text-white">
      <Script id="local-business-schema" type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }} />
      <Script id="faq-schema" type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      {/* ── Floating CTA ──────────────────────────────────────────────────── */}
      <motion.button
        onClick={openBooking}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1, duration: 0.6 }}
        aria-label="Open service booking form"
        className="button-glow fixed bottom-5 right-5 z-50 rounded-full bg-cyan-400 px-6 py-4 text-sm font-black text-black shadow-[0_0_45px_rgba(34,211,238,0.35)] transition hover:scale-105 active:scale-95"
      >
        Book Service
      </motion.button>

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section ref={heroRef} className="relative min-h-screen overflow-hidden pt-28 lg:pt-32">
        <div className="absolute inset-0 overflow-hidden">
          <motion.div style={{ y: heroY }} className="relative h-full w-[112%]">
            <Image
              src="/images/rev.webp"
              alt="Commercial fitness equipment service in Dallas Fort Worth by 2EZ TEK"
              fill
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 80vw, 3840px"
              className="object-cover opacity-60"
            />
          </motion.div>
        </div>

        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,11,18,0.96)_0%,rgba(7,11,18,0.72)_43%,rgba(7,11,18,0.18)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.24),transparent_35%)]" />

        <div className="relative z-10 grid min-h-[82vh] items-center gap-12 px-6 py-20 lg:grid-cols-[1fr,420px] lg:px-16">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.1 }}
            className="max-w-4xl"
          >
            <div className="mb-6 inline-flex items-center rounded-full border border-cyan-400/20 bg-cyan-400/10 px-5 py-2 text-xs font-black uppercase tracking-[0.25em] text-cyan-300 backdrop-blur-xl">
              Dallas Fort Worth Fitness Equipment Experts
            </div>

            <h1 className="max-w-4xl text-4xl font-black leading-[1] tracking-tight md:text-6xl lg:text-7xl">
              Fitness Equipment Repair In Dallas Fort Worth
              <span className="block text-cyan-400">
                Treadmills, Ellipticals, Gyms & Commercial Equipment
              </span>
            </h1>

            <p className="mt-6 max-w-3xl text-lg leading-relaxed text-white/75 md:text-xl">
              2EZ TEK provides professional treadmill repair, elliptical repair,
              exercise bike service, gym equipment assembly, preventative maintenance,
              and commercial fitness equipment repair throughout Dallas Fort Worth.
            </p>

            <p className="mt-4 max-w-3xl text-base leading-relaxed text-white/55 md:text-lg">
              From luxury home gyms to apartment fitness centers and commercial
              facilities, our technicians help keep equipment running, members happy,
              and downtime under control.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <button
                onClick={openBooking}
                className="button-glow rounded-2xl bg-cyan-400 px-7 py-4 text-sm font-black uppercase tracking-[0.1em] text-black transition hover:scale-105 active:scale-95"
              >
                Book Repair Service
              </button>
              <a
                href={`tel:${PHONE_TEL}`}
                className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-7 py-4 text-sm font-black uppercase tracking-[0.1em] text-cyan-200 transition hover:bg-cyan-400/15"
              >
                Call {PHONE_DISPLAY}
              </a>
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

          {/* Hero side card */}
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
                  'Access manuals, troubleshooting, and smarter service records',
                ].map(item => (
                  <div key={item} className="rounded-2xl border border-white/10 bg-white/[0.05] p-4 text-sm text-white/70">
                    {item}
                  </div>
                ))}
              </div>
              <a
                href={`tel:${PHONE_TEL}`}
                className="mt-5 flex items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-5 py-4 text-sm font-black text-cyan-200 transition hover:bg-cyan-400/15"
              >
                Call {PHONE_DISPLAY}
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Trust Bar ─────────────────────────────────────────────────────── */}
      <section className="border-y border-white/10 bg-[#0B1220] px-6 py-16 lg:px-16">
        <div className="text-center">
          <div className="text-sm font-black uppercase tracking-[0.3em] text-cyan-400">
            Trusted By Homeowners & Fitness Facilities
          </div>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-8 text-sm font-black uppercase tracking-[0.16em] text-white/35 md:text-base">
            {['Dallas Fort Worth', 'Treadmill Repair', 'Gym Assembly', 'Commercial Maintenance', 'SmartGymOps Powered'].map(t => (
              <span key={t}>{t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Services Grid ─────────────────────────────────────────────────── */}
      <section className="bg-[#070B12] px-6 py-24 lg:px-16">
        <div className="mb-14 max-w-4xl">
          <div className="text-sm font-black uppercase tracking-[0.3em] text-cyan-400">
            Fitness Equipment Services
          </div>
          <h2 className="mt-4 text-4xl font-black leading-tight md:text-6xl">
            Repair, Assembly & Maintenance
            <span className="block text-white/45">For Homes And Commercial Gyms.</span>
          </h2>
          <p className="mt-6 max-w-3xl text-lg leading-relaxed text-white/60">
            Our service pages are built around the way real customers search for help:
            equipment type, problem, city, and service need.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {seoServices.map(service => (
            <Link
              key={service.title}
              href={service.href}
              className="rounded-3xl border border-white/10 bg-white/[0.05] p-5 text-sm font-black text-white/75 transition hover:border-cyan-400/30 hover:bg-cyan-400/10 hover:text-cyan-200"
            >
              {service.title}
            </Link>
          ))}
        </div>
      </section>

      {/* ── Service Path Cards ────────────────────────────────────────────── */}
      <section className="bg-[#070B12] px-6 pb-24 lg:px-16">
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
              <div className="mb-8 flex items-center gap-3">
                <span className="text-3xl">{item.icon}</span>
                <div className="inline-flex rounded-2xl bg-cyan-400/10 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-cyan-300">
                  {item.label}
                </div>
              </div>
              <h3 className="text-4xl font-black">{item.title}</h3>
              <p className="mt-5 max-w-xl text-white/60">{item.text}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  onClick={openBooking}
                  className="button-glow rounded-2xl bg-cyan-400 px-6 py-4 text-sm font-black text-black transition hover:scale-105 active:scale-95"
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

      {/* ── Brands ────────────────────────────────────────────────────────── */}
      <section className="border-t border-white/10 bg-[#07101D] px-6 py-24 lg:px-16">
        <div className="grid gap-12 lg:grid-cols-[0.9fr,1.1fr] lg:items-start">
          <div>
            <div className="text-sm font-black uppercase tracking-[0.3em] text-cyan-400">
              Brands We Service
            </div>
            <h2 className="mt-4 text-4xl font-black leading-tight md:text-6xl">
              Major Fitness Equipment Brands
              <span className="block text-white/45">Serviced By Real Technicians.</span>
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-white/60">
              2EZ TEK repairs and maintains many residential and commercial equipment
              brands, including treadmills, ellipticals, bikes, strength machines,
              functional trainers, and commercial cardio equipment.
            </p>
            <Link
              href="/manuals"
              className="mt-8 inline-flex rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-7 py-4 text-sm font-black uppercase tracking-[0.12em] text-cyan-200 transition hover:bg-cyan-400/15"
            >
              Search Manuals
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {brands.map(brand => (
              <div key={brand} className="rounded-3xl border border-white/10 bg-white/[0.05] p-5 text-sm font-black text-white/70 transition hover:border-cyan-400/20 hover:text-white/90">
                {brand}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Service Areas ─────────────────────────────────────────────────── */}
      <section className="border-t border-white/10 bg-[#050B14] px-6 py-24 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-4xl">
            <div className="text-sm font-black uppercase tracking-[0.3em] text-cyan-400">
              Service Areas
            </div>
            <h2 className="mt-4 text-4xl font-black leading-tight md:text-6xl">
              Fitness Equipment Repair Across
              <span className="block text-white/45">Dallas Fort Worth.</span>
            </h2>
            <p className="mt-6 max-w-3xl text-lg leading-relaxed text-white/60">
              We help homeowners, apartments, hotels, schools, studios, corporate gyms,
              and commercial fitness centers across the DFW area.
            </p>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {serviceAreas.map(area => (
              <div key={area} className="rounded-3xl border border-white/10 bg-white/[0.05] p-5 text-sm font-black uppercase tracking-[0.14em] text-white/65">
                {area}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SmartGymOps ───────────────────────────────────────────────────── */}
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
              <span className="block text-white/45">Smarter Equipment Operations.</span>
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
              ].map(item => (
                <div key={item} className="rounded-2xl border border-white/10 bg-white/[0.05] p-5 text-sm font-semibold text-white/70">
                  {item}
                </div>
              ))}
            </div>
            <div className="mt-10 flex flex-wrap gap-3">
              <button
                onClick={openBooking}
                className="button-glow rounded-2xl bg-cyan-400 px-7 py-4 text-sm font-black uppercase tracking-[0.12em] text-black transition hover:scale-105 active:scale-95"
              >
                Request Smart Service
              </button>
              <Link
                href="https://smartgymops.com"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-2xl border border-white/10 bg-white/5 px-7 py-4 text-sm font-black uppercase tracking-[0.12em] text-white transition hover:border-cyan-400/30 hover:bg-cyan-400/10"
              >
                Visit SmartGymOps ↗
              </Link>
            </div>
          </div>

          <div className="rounded-[36px] border border-white/10 bg-white/[0.06] p-6 shadow-[0_25px_100px_rgba(0,0,0,0.45)] backdrop-blur-xl">
            <div className="rounded-[28px] bg-[#0B1220] p-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-5">
                <div>
                  <div className="text-xl font-black">SmartGymOps</div>
                  <div className="mt-1 text-sm text-white/45">Service Intelligence Layer</div>
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
                  <div key={title} className="rounded-2xl border border-white/10 bg-white/[0.05] p-4">
                    <div className="font-black text-cyan-300">{title}</div>
                    <div className="mt-1 text-sm text-white/50">{text}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── Marketplace ───────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-t border-white/10 bg-[#050B14] px-6 py-32 lg:px-16">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.12),transparent_35%)]" />
        <div className="absolute right-[-180px] top-[120px] h-[520px] w-[520px] rounded-full bg-cyan-500/10 blur-3xl" />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative z-10 mx-auto max-w-7xl"
        >
          <div className="grid gap-16 lg:grid-cols-[1.05fr,0.95fr] lg:items-center">
            <div>
              <div className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-5 py-2 text-xs font-black uppercase tracking-[0.28em] text-cyan-300">
                SmartGymOps Marketplace
              </div>
              <h2 className="mt-6 max-w-4xl text-5xl font-black leading-tight md:text-7xl">
                Buy. Sell.
                <span className="block text-cyan-400">Service Fitness Equipment.</span>
              </h2>
              <p className="mt-8 max-w-2xl text-lg leading-8 text-white/65 md:text-xl">
                2EZ TEK is building a smarter marketplace for fitness equipment.
                Browse listings, sell equipment, request delivery, schedule repairs,
                and access professional support backed by real technicians.
              </p>
              <div className="mt-10 flex flex-wrap gap-4">
                <Link href="/equipment-for-sale/listings" className="button-glow rounded-2xl bg-cyan-400 px-8 py-5 text-sm font-black uppercase tracking-[0.15em] text-black transition hover:scale-105 active:scale-95">
                  Browse Marketplace
                </Link>
                <Link href="/equipment-for-sale/new" className="rounded-2xl border border-white/10 bg-white/5 px-8 py-5 text-sm font-black uppercase tracking-[0.15em] text-white transition hover:border-cyan-400/30 hover:bg-cyan-400/10">
                  Sell Equipment
                </Link>
              </div>
              <div className="mt-14 grid gap-4 md:grid-cols-2">
                {['Local buyers and sellers', 'Commercial and residential equipment', 'Delivery and installation services', 'Repair and diagnostics support'].map(item => (
                  <div key={item} className="rounded-2xl border border-white/10 bg-white/[0.05] p-5 text-sm font-semibold text-white/70 backdrop-blur-xl">
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[40px] border border-white/10 bg-white/[0.06] p-6 shadow-[0_30px_120px_rgba(0,0,0,0.45)] backdrop-blur-xl">
              <div className="rounded-[32px] bg-[#0B1220] p-6">
                <div className="flex items-center justify-between border-b border-white/10 pb-5">
                  <div>
                    <div className="text-xl font-black">Featured Marketplace Listings</div>
                    <div className="mt-1 text-sm text-white/45">Powered by SmartGymOps</div>
                  </div>
                  <div className="rounded-full bg-cyan-400/10 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-cyan-300">
                    New
                  </div>
                </div>
                <div className="mt-6 space-y-4">
                  {marketplacePreview.map(item => (
                    <div key={item.title} className="rounded-3xl border border-white/10 bg-white/[0.05] p-5 transition hover:border-cyan-400/30 hover:bg-cyan-400/[0.03]">
                      <div className="flex items-start justify-between gap-5">
                        <div>
                          <div className="text-lg font-black text-white">{item.title}</div>
                          <div className="mt-2 inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-cyan-300">
                            {item.tag}
                          </div>
                        </div>
                        <div className="text-2xl font-black text-cyan-400">{item.price}</div>
                      </div>
                      <div className="mt-5 flex flex-wrap gap-3">
                        <Link href={item.href} className="rounded-2xl bg-cyan-400 px-5 py-3 text-xs font-black uppercase tracking-[0.15em] text-black transition hover:scale-105 active:scale-95">
                          View Listing
                        </Link>
                        <Link href="/contact" className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-xs font-black uppercase tracking-[0.15em] text-white transition hover:border-cyan-400/20 hover:bg-cyan-400/5">
                          Need Delivery?
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
                <Link href="/equipment-for-sale/listings" className="mt-6 flex items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-5 py-4 text-sm font-black uppercase tracking-[0.15em] text-cyan-200 transition hover:bg-cyan-400/15">
                  Explore Marketplace
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── Projects ──────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-t border-white/10 bg-[#0B1220] px-6 py-28 lg:px-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative z-10"
        >
          <div className="max-w-4xl">
            <div className="text-sm font-black uppercase tracking-[0.3em] text-cyan-400">Featured Projects</div>
            <h2 className="mt-4 text-4xl font-black leading-tight md:text-6xl">
              Real Work.
              <span className="block text-white/45">Real Installations.</span>
            </h2>
          </div>

          <div className="mt-16 grid gap-6 lg:grid-cols-12">
            <motion.div whileHover={{ y: -8 }} className="group relative overflow-hidden rounded-[36px] border border-white/10 lg:col-span-7">
              <Image
                src="/images/rev.webp"
                alt="REV Fitness Fort Worth commercial fitness equipment project by 2EZ TEK"
                width={1200}
                height={760}
                className="hero-image h-[620px] w-full object-cover transition duration-500 group-hover:scale-105"
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
              {projectCards.map(item => (
                <motion.div key={item.title} whileHover={{ y: -8 }} className="group relative overflow-hidden rounded-[36px] border border-white/10">
                  <Image
                    src={item.image}
                    alt={`${item.title} — 2EZ TEK fitness equipment project`}
                    width={800}
                    height={500}
                    className="hero-image h-[297px] w-full object-cover transition duration-500 group-hover:scale-105"
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

      {/* ── Manuals ───────────────────────────────────────────────────────── */}
      <section className="border-t border-white/10 bg-[#07101D] px-6 py-24 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-[0.95fr,1.05fr] lg:items-center">
            <div>
              <div className="text-sm font-black uppercase tracking-[0.3em] text-cyan-400">
                Manuals & Troubleshooting
              </div>
              <h2 className="mt-4 text-4xl font-black leading-tight md:text-6xl">
                Find Fitness Equipment Manuals
                <span className="block text-white/45">And Repair Resources.</span>
              </h2>
              <p className="mt-6 text-lg leading-relaxed text-white/60">
                Our manuals library helps customers, technicians, and facility managers
                locate equipment manuals, troubleshooting information, exploded diagrams,
                and repair guidance for major fitness equipment brands.
              </p>
              <div className="mt-10 flex flex-wrap gap-3">
                <Link href="/manuals" className="button-glow rounded-2xl bg-cyan-400 px-7 py-4 text-sm font-black uppercase tracking-[0.12em] text-black transition hover:scale-105 active:scale-95">
                  Search Manuals
                </Link>
                <Link href="/blog" className="rounded-2xl border border-white/10 bg-white/5 px-7 py-4 text-sm font-black uppercase tracking-[0.12em] text-white transition hover:border-cyan-400/30 hover:bg-cyan-400/10">
                  Read Repair Guides
                </Link>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {['Owner manuals', 'Troubleshooting guides', 'Brand-specific repair help', 'Exploded parts support', 'Assembly references', 'Commercial maintenance resources'].map(item => (
                <div key={item} className="rounded-3xl border border-white/10 bg-white/[0.05] p-6 text-sm font-black text-white/70 transition hover:border-cyan-400/20 hover:text-white/90">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Reviews ───────────────────────────────────────────────────────── */}
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
            {reviews.map(review => (
              <motion.div
                key={review.name}
                whileHover={{ y: -8 }}
                className="glow-card rounded-[36px] border border-white/10 bg-white/[0.05] p-8 backdrop-blur-xl"
                itemScope
                itemType="https://schema.org/Review"
              >
                <StarRating rating={review.rating} />
                <div className="mt-4 text-4xl font-black text-cyan-400">"</div>
                <p className="mt-2 leading-relaxed text-white/70" itemProp="reviewBody">
                  {review.text}
                </p>
                <div className="mt-8">
                  <div className="text-sm font-black uppercase tracking-[0.2em] text-cyan-300" itemProp="author">
                    {review.name}
                  </div>
                  <div className="mt-1 text-xs text-white/35">{review.location}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── FAQs ──────────────────────────────────────────────────────────── */}
      <section className="border-t border-white/10 bg-[#050B14] px-6 py-24 lg:px-16">
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <div className="text-sm font-black uppercase tracking-[0.3em] text-cyan-400">
              Frequently Asked Questions
            </div>
            <h2 className="mt-4 text-4xl font-black leading-tight md:text-6xl">
              Fitness Equipment Repair FAQs
            </h2>
          </div>

          <div className="mt-12 space-y-4">
            {faqs.map(faq => <FaqItem key={faq.question} faq={faq} />)}
          </div>

          <div className="mt-14 text-center">
            <button
              onClick={openBooking}
              className="button-glow inline-flex rounded-2xl bg-cyan-400 px-7 py-4 text-sm font-black uppercase tracking-[0.12em] text-black transition hover:scale-105 active:scale-95"
            >
              Request Service
            </button>
          </div>
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────────────────────────── */}
      <section className="border-t border-white/10 bg-[#07101D] px-6 py-24 text-center lg:px-16">
        <div className="mx-auto max-w-4xl">
          <div className="text-sm font-black uppercase tracking-[0.3em] text-cyan-400">
            Ready To Schedule?
          </div>
          <h2 className="mt-4 text-4xl font-black leading-tight md:text-6xl">
            Book Fitness Equipment Repair With 2EZ TEK
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/60">
            Whether you need treadmill repair, home gym assembly, commercial maintenance,
            or diagnostics for a machine that stopped working, 2EZ TEK is ready to help.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <button
              onClick={openBooking}
              className="button-glow rounded-2xl bg-cyan-400 px-8 py-5 text-sm font-black uppercase tracking-[0.15em] text-black transition hover:scale-105 active:scale-95"
            >
              Book Service
            </button>
            <a
              href={`tel:${PHONE_TEL}`}
              className="rounded-2xl border border-white/10 bg-white/5 px-8 py-5 text-sm font-black uppercase tracking-[0.15em] text-white transition hover:border-cyan-400/30 hover:bg-cyan-400/10"
            >
              Call {PHONE_DISPLAY}
            </a>
          </div>
        </div>
      </section>

      {/* ── Booking Modal ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {bookingOpen && <BookingModal onClose={closeBooking} />}
      </AnimatePresence>
    </main>
  )
}