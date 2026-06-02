'use client'

import Image from 'next/image'
import Link from 'next/link'
import Script from 'next/script'
import { useState, useEffect, useRef } from 'react'
import {
  AnimatePresence,
  motion,
  useScroll,
  useTransform,
  useInView,
  useMotionValue,
  useSpring,
} from 'framer-motion'

const PHONE_DISPLAY = '(972) 807-7232'
const PHONE_TEL = '9728077232'

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number]

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: (delay = 0) => ({ opacity: 1, y: 0, transition: { duration: 1.1, delay, ease: EASE } }),
}
const fadeLeft = {
  hidden: { opacity: 0, x: -32 },
  show: (delay = 0) => ({ opacity: 1, x: 0, transition: { duration: 1.0, delay, ease: EASE } }),
}
const fadeRight = {
  hidden: { opacity: 0, x: 40 },
  show: (delay = 0) => ({ opacity: 1, x: 0, transition: { duration: 1.0, delay, ease: EASE } }),
}
const staggerContainer = (stagger = 0.09, delayChildren = 0) => ({
  hidden: {},
  show: { transition: { staggerChildren: stagger, delayChildren } },
})
const staggerItem = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.85, ease: EASE } },
}
const scaleReveal = {
  hidden: { opacity: 0, scale: 0.94 },
  show: (delay = 0) => ({ opacity: 1, scale: 1, transition: { duration: 1.2, delay, ease: EASE } }),
}
const lineDraw = {
  hidden: { scaleX: 0, originX: 0 },
  show: (delay = 0) => ({ scaleX: 1, transition: { duration: 0.7, delay, ease: EASE } }),
}

function CountUp({ target, suffix = '' }: { target: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const motionVal = useMotionValue(0)
  const spring = useSpring(motionVal, { stiffness: 60, damping: 18 })
  const [display, setDisplay] = useState('0')
  useEffect(() => { if (inView) motionVal.set(target) }, [inView, motionVal, target])
  useEffect(() => { return spring.on('change', (v) => { setDisplay(Math.round(v).toLocaleString()) }) }, [spring])
  return <span ref={ref}>{display}{suffix}</span>
}

function StatValue({ raw }: { raw: string }) {
  const match = raw.match(/^([\d,]+)(.*)$/)
  if (!match) return <>{raw}</>
  const num = parseInt(match[1].replace(/,/g, ''), 10)
  const suffix = match[2] || ''
  return <CountUp target={num} suffix={suffix} />
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
  { raw: '10K+', label: 'Machines Serviced', num: 10000, suffix: 'K+' },
  { raw: '500+', label: '5-Star Reviews', num: 500, suffix: '+' },
  { raw: '24/7', label: 'Emergency Support', plain: true },
  { raw: 'DFW', label: 'Coverage Area', plain: true },
] as const

const servicePaths = [
  { label: 'Residential', title: 'Home Gym Services', text: 'Treadmill repair, home gym assembly, elliptical service, relocation, diagnostics, and white-glove equipment setup.', button: 'Book Home Service', href: '/gym-equipment-repair-dallas', icon: '🏠' },
  { label: 'Commercial', title: 'Facility Maintenance', text: 'Preventative maintenance, repair programs, project installs, QR reporting, asset tracking, and SmartGymOps-powered service.', button: 'Explore Commercial', href: '/commercial-gym-maintenance', icon: '🏢' },
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

type Brand = {
  name: string
  slug: string
  domain?: string
  mark: string
}

const brands: Brand[] = [
  { name: 'Life Fitness', slug: 'life-fitness', domain: 'lifefitness.com', mark: 'LF' },
  { name: 'Precor', slug: 'precor', domain: 'precor.com', mark: 'P' },
  { name: 'Matrix', slug: 'matrix', domain: 'matrixfitness.com', mark: 'M' },
  { name: 'Technogym', slug: 'technogym', domain: 'technogym.com', mark: 'T' },
  { name: 'Cybex', slug: 'cybex', mark: 'C' },
  { name: 'StairMaster', slug: 'stairmaster', mark: 'SM' },
  { name: 'NordicTrack', slug: 'nordictrack', domain: 'nordictrack.com', mark: 'NT' },
  { name: 'Bowflex', slug: 'bowflex', domain: 'bowflex.com', mark: 'B' },
  { name: 'TRUE Fitness', slug: 'true-fitness', domain: 'truefitness.com', mark: 'TF' },
  { name: 'Schwinn', slug: 'schwinn', domain: 'schwinnfitness.com', mark: 'S' },
  { name: 'Nautilus', slug: 'nautilus', domain: 'nautilus.com', mark: 'N' },
  { name: 'Octane Fitness', slug: 'octane-fitness', domain: 'octanefitness.com', mark: 'O' },
  { name: 'Star Trac', slug: 'star-trac', mark: 'ST' },
  { name: 'FreeMotion', slug: 'freemotion', domain: 'freemotionfitness.com', mark: 'F' },
  { name: 'Hammer Strength', slug: 'hammer-strength', mark: 'HS' },
  { name: 'SportsArt', slug: 'sportsart', domain: 'sportsart.com', mark: 'SA' },
]

function BrandLogo({ brand }: { brand: Brand }) {
  const [failed, setFailed] = useState(false)

  return (
    <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-xs font-black tracking-[0.08em] text-cyan-200">
      {failed || !brand.domain ? (
        brand.mark
      ) : (
        // The favicon endpoint keeps manufacturer assets lightweight for this compact card.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`https://www.google.com/s2/favicons?domain=${brand.domain}&sz=128`}
          alt=""
          width="32"
          height="32"
          loading="lazy"
          onError={() => setFailed(true)}
          className="h-8 w-8 object-contain"
        />
      )}
    </span>
  )
}

const projectCards = [
  { image: '/images/darren.webp', title: 'Luxury Residential Setup', tag: 'Home Gym' },
  { image: '/images/fire.webp', title: 'First Responder Facility', tag: 'Government' },
]

const reviews = [
  { name: 'Residential Client', location: 'Plano, TX', rating: 5, text: 'Fast, professional, and extremely knowledgeable. Our treadmill was repaired the same day and works perfectly.' },
  { name: 'Apartment Fitness Center', location: 'Dallas, TX', rating: 5, text: '2EZ TEK completely transformed how we manage our fitness equipment maintenance and repairs.' },
  { name: 'Commercial Gym Owner', location: 'Fort Worth, TX', rating: 5, text: 'Professional communication, premium service, and real operational expertise from start to finish.' },
]


const DEFAULT_FAQS = [
  { question: 'Do you repair treadmills in Dallas Fort Worth?', answer: 'Yes. 2EZ TEK provides treadmill repair throughout Dallas Fort Worth, including diagnostics, belt issues, motor problems, console problems, incline failures, noise issues, and maintenance.' },
  { question: 'Do you service commercial gyms and apartment fitness centers?', answer: 'Yes. We service commercial gyms, apartment fitness centers, hotels, corporate fitness rooms, schools, training studios, and other facilities that rely on working fitness equipment.' },
  { question: 'What fitness equipment brands do you repair?', answer: 'We service many major brands including Life Fitness, Precor, Matrix, Cybex, Technogym, NordicTrack, Bowflex, TRUE Fitness, StairMaster, Schwinn, Nautilus, and more.' },
  { question: 'Do you assemble home gym equipment?', answer: 'Yes. We provide home gym assembly, treadmill assembly, elliptical assembly, strength machine assembly, functional trainer setup, and white-glove fitness equipment installation.' },
  { question: 'Do you offer preventative maintenance?', answer: 'Yes. Preventative maintenance is available for both residential and commercial clients. This helps reduce downtime, extend equipment life, and catch problems before they become major repairs.' },
]

const emptyForm = { name: '', phone: '', email: '', serviceType: 'Residential Service', address: '', equipmentType: '', brandModel: '', details: '' }
type FormData = typeof emptyForm
type FormErrors = Partial<Record<keyof FormData, string>>

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" aria-label={rating + ' out of 5 stars'}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} className={'h-4 w-4 ' + (i < rating ? 'text-cyan-400' : 'text-white/20')} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )
}

function FaqItem({ faq, index }: { faq: { question: string; answer: string }; index: number }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  return (
    <motion.div ref={ref} variants={staggerItem} initial="hidden" animate={inView ? 'show' : 'hidden'} transition={{ delay: index * 0.07 }} className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.05]">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition hover:bg-white/[0.03]">
        <h3 className="text-lg font-black text-white">{faq.question}</h3>
        <motion.span animate={{ rotate: open ? 45 : 0 }} transition={{ duration: 0.25, ease: EASE }} className="flex-shrink-0 text-2xl text-cyan-400">+</motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.35, ease: EASE }} className="overflow-hidden">
            <p className="px-6 pb-6 leading-relaxed text-white/60">{faq.answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

async function resizeImageToBase64(file: File, maxPx = 1024, quality = 0.8): Promise<{ base64: string; mediaType: string }> {
  return new Promise((resolve, reject) => {
    const img = new window.Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      const scale = Math.min(1, maxPx / Math.max(img.width, img.height))
      const w = Math.round(img.width * scale)
      const h = Math.round(img.height * scale)
      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, w, h)
      const dataUrl = canvas.toDataURL('image/jpeg', quality)
      resolve({ base64: dataUrl.split(',')[1], mediaType: 'image/jpeg' })
    }
    img.onerror = reject
    img.src = url
  })
}

function BookingModal({ onClose }: { onClose: () => void }) {
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [formData, setFormData] = useState<FormData>(emptyForm)
  const [fieldErrors, setFieldErrors] = useState<FormErrors>({})
  const [photoPreview, setPhotoPreview] = useState<string>('')
  const [diagnosing, setDiagnosing] = useState(false)
  const [diagnosis, setDiagnosis] = useState('')
  const firstFieldRef = useRef<HTMLInputElement>(null)
  const photoRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    firstFieldRef.current?.focus()
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [onClose])

  function updateForm(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (fieldErrors[name as keyof FormData]) setFieldErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 20 * 1024 * 1024) {
      setDiagnosis('Image too large. Please use a photo under 20MB.')
      return
    }
    try {
      const { base64, mediaType } = await resizeImageToBase64(file)
      setPhotoPreview(`data:${mediaType};base64,${base64}`)
      setDiagnosis('')
      setDiagnosing(true)
      const res = await fetch('/api/ai/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64,
          mediaType,
          equipmentType: formData.equipmentType,
          brandModel: formData.brandModel,
          details: formData.details,
        }),
      })
      const result = await res.json()
      setDiagnosis(result.diagnosis || 'Could not analyze image. Please describe the issue below.')
    } catch {
      setDiagnosis('Could not analyze image. Please describe the issue below.')
    } finally {
      setDiagnosing(false)
    }
  }

  function removePhoto() {
    setPhotoPreview('')
    setDiagnosis('')
    if (photoRef.current) photoRef.current.value = ''
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
      const detailsWithDiagnosis = diagnosis
        ? `${formData.details}\n\n[AI Photo Diagnosis]: ${diagnosis}`.trim()
        : formData.details
      const response = await fetch('/api/service-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, details: detailsWithDiagnosis }),
      })
      const result = await response.json()
      if (!response.ok || !result.success) throw new Error(result.message || 'Request failed')
      setSubmitted(true)
    } catch (error) {
      console.error('SERVICE REQUEST SUBMIT ERROR:', error)
      setErrorMessage('Something went wrong. Please call ' + PHONE_DISPLAY + ' or try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const inputClass = (field: keyof FormData) =>
    'w-full rounded-2xl border px-5 py-4 text-sm text-white outline-none placeholder:text-white/35 bg-white/[0.05] transition ' +
    (fieldErrors[field] ? 'border-red-400/60 focus:border-red-400' : 'border-white/10 focus:border-cyan-400/60')

  return (
    <motion.div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 px-4 backdrop-blur-xl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }} onClick={(e) => { if (e.target === e.currentTarget) onClose() }} role="dialog" aria-modal="true" aria-label="Book a service request">
      <motion.div initial={{ opacity: 0, y: 48, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 48, scale: 0.95 }} transition={{ duration: 0.5, ease: EASE }} className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[36px] border border-white/10 bg-[#07101D] p-6 shadow-[0_30px_120px_rgba(0,0,0,0.75)]">
        <div className="flex items-start justify-between gap-6 border-b border-white/10 pb-5">
          <div>
            <div className="text-sm font-black uppercase tracking-[0.3em] text-cyan-300">Service Request</div>
            <h2 className="mt-3 text-3xl font-black">Tell us what you need repaired or installed.</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close booking modal" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-black text-white transition hover:bg-white/10">✕</button>
        </div>

        {submitted ? (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }} className="mt-8 rounded-[28px] border border-cyan-400/20 bg-cyan-400/10 p-8 text-center">
            <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5, delay: 0.1, ease: EASE }} className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border-2 border-cyan-400/40 bg-cyan-400/10">
              <svg className="h-10 w-10 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <motion.path d="M5 13l4 4L19 7" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 0.3 }} />
              </svg>
              <motion.div className="absolute inset-0 rounded-full border border-cyan-400/30" animate={{ scale: [1, 1.5, 1.5], opacity: [0.6, 0, 0] }} transition={{ duration: 1.2, delay: 0.4, repeat: 2 }} />
            </motion.div>
            <div className="text-sm font-black uppercase tracking-[0.3em] text-cyan-300">Request Received</div>
            <h3 className="mt-4 text-3xl font-black">Thank you.</h3>
            <p className="mx-auto mt-4 max-w-xl text-white/65">Your service request has been captured. Our team will follow up shortly.</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <a href="tel:9728077232" className="rounded-2xl bg-cyan-400 px-6 py-4 text-sm font-black text-black transition hover:bg-cyan-300">Call Us Now</a>
              <button type="button" onClick={onClose} className="rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-sm font-black text-white transition hover:border-cyan-400/30">Close</button>
            </div>
          </motion.div>
        ) : (
          <form className="mt-6 grid gap-4" onSubmit={handleSubmit} noValidate>
            {errorMessage && <div role="alert" className="rounded-2xl border border-red-400/20 bg-red-500/10 px-5 py-4 text-sm font-bold text-red-200">{errorMessage}</div>}
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <input ref={firstFieldRef} type="text" name="name" value={formData.name} onChange={updateForm} placeholder="Full Name *" autoComplete="name" className={inputClass('name')} />
                {fieldErrors.name && <p className="mt-1 pl-1 text-xs text-red-400">{fieldErrors.name}</p>}
              </div>
              <div>
                <input type="tel" name="phone" value={formData.phone} onChange={updateForm} placeholder="Phone Number *" autoComplete="tel" pattern="[\d\s\-().+]{7,}" className={inputClass('phone')} />
                {fieldErrors.phone && <p className="mt-1 pl-1 text-xs text-red-400">{fieldErrors.phone}</p>}
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <input type="email" name="email" value={formData.email} onChange={updateForm} placeholder="Email Address *" autoComplete="email" className={inputClass('email')} />
                {fieldErrors.email && <p className="mt-1 pl-1 text-xs text-red-400">{fieldErrors.email}</p>}
              </div>
              <select name="serviceType" value={formData.serviceType} onChange={updateForm} className="rounded-2xl border border-white/10 bg-[#0B1220] px-5 py-4 text-sm text-white outline-none focus:border-cyan-400/60 transition">
                <option>Residential Service</option>
                <option>Commercial Service</option>
                <option>Assembly / Installation</option>
                <option>Preventative Maintenance</option>
                <option>Emergency Repair</option>
              </select>
            </div>
            <div>
              <input type="text" name="address" value={formData.address} onChange={updateForm} placeholder="Service Address *" autoComplete="street-address" className={inputClass('address')} />
              {fieldErrors.address && <p className="mt-1 pl-1 text-xs text-red-400">{fieldErrors.address}</p>}
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <input type="text" name="equipmentType" value={formData.equipmentType} onChange={updateForm} placeholder="Equipment Type (e.g. Treadmill)" className={inputClass('equipmentType')} />
              <input type="text" name="brandModel" value={formData.brandModel} onChange={updateForm} placeholder="Brand / Model" className={inputClass('brandModel')} />
            </div>

            {/* ── AI Photo Diagnosis ─────────────────────────────────────── */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <div className="mb-3 flex items-center gap-2">
                <svg className="h-4 w-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-xs font-black uppercase tracking-[0.2em] text-cyan-300">AI Photo Diagnosis</span>
                <span className="rounded-lg border border-white/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-white/35">Optional</span>
              </div>
              <p className="mb-3 text-xs text-white/45">Upload a photo of your equipment and our AI will analyze it instantly.</p>

              {!photoPreview ? (
                <label className="flex cursor-pointer items-center justify-center gap-3 rounded-2xl border border-dashed border-white/20 bg-white/[0.03] px-5 py-6 text-sm text-white/45 transition hover:border-cyan-400/40 hover:bg-cyan-400/[0.04] hover:text-white/65">
                  <svg className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 16v-4m0 0V8m0 4h4m-4 0H8m13 4a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Tap to upload or take a photo</span>
                  <input ref={photoRef} type="file" accept="image/*" capture="environment" className="sr-only" onChange={handlePhotoChange} />
                </label>
              ) : (
                <div className="space-y-3">
                  <div className="relative overflow-hidden rounded-2xl">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={photoPreview} alt="Equipment photo" className="max-h-48 w-full object-contain" />
                    <button type="button" onClick={removePhoto} className="absolute right-2 top-2 rounded-xl border border-white/20 bg-black/60 px-3 py-1 text-xs font-black text-white backdrop-blur transition hover:bg-black/80">Remove</button>
                  </div>

                  <AnimatePresence mode="wait">
                    {diagnosing && (
                      <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2 rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.06] px-4 py-3">
                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="h-4 w-4 rounded-full border-2 border-cyan-400/30 border-t-cyan-400" />
                        <span className="text-xs font-bold text-cyan-300">Analyzing your equipment…</span>
                      </motion.div>
                    )}
                    {!diagnosing && diagnosis && (
                      <motion.div key="result" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.06] px-4 py-4">
                        <div className="mb-2 flex items-center gap-2">
                          <svg className="h-4 w-4 flex-shrink-0 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-xs font-black uppercase tracking-[0.15em] text-cyan-300">AI Assessment</span>
                        </div>
                        <p className="text-sm leading-relaxed text-white/75">{diagnosis}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>

            <textarea name="details" value={formData.details} onChange={updateForm} placeholder="Describe the issue or project details" rows={4} className="resize-none rounded-2xl border border-white/10 bg-white/[0.05] px-5 py-4 text-sm text-white outline-none placeholder:text-white/35 focus:border-cyan-400/60 transition" />
            <p className="text-xs text-white/35">* Required fields</p>
            <button type="submit" disabled={submitting || diagnosing} className="button-glow mt-2 rounded-2xl bg-cyan-400 px-6 py-5 text-sm font-black uppercase tracking-[0.15em] text-black disabled:cursor-not-allowed disabled:opacity-60 transition">
              {submitting ? 'Submitting…' : 'Submit Service Request'}
            </button>
          </form>
        )}
      </motion.div>
    </motion.div>
  )
}

const PERSONA_HERO: Record<string, { headline: string; sub: string; cta: string }> = {
  commercial: {
    headline: 'Commercial Gym Maintenance & Repair In Dallas Fort Worth',
    sub: 'Preventative maintenance programs, emergency repair, QR reporting, and SmartGymOps-powered service for hotels, apartments, corporate gyms, and fitness facilities.',
    cta: 'Explore Commercial Service',
  },
  treadmill: {
    headline: 'Treadmill Repair In Dallas Fort Worth — Fast, Professional Service',
    sub: 'Belt slipping, motor problems, incline failures, error codes, and console issues — 2EZ TEK services all major treadmill brands across DFW.',
    cta: 'Book Treadmill Repair',
  },
  elliptical: {
    headline: 'Elliptical Repair In Dallas Fort Worth',
    sub: 'Resistance issues, stride problems, console failures, and noise diagnostics. 2EZ TEK services Life Fitness, Precor, NordicTrack, and more across DFW.',
    cta: 'Book Elliptical Repair',
  },
  assembly: {
    headline: 'Fitness Equipment Assembly & Installation In Dallas Fort Worth',
    sub: 'Professional home gym assembly, treadmill setup, strength machine installation, and white-glove equipment delivery across Dallas Fort Worth.',
    cta: 'Book Assembly Service',
  },
}

function getCookieValue(name: string): string {
  if (typeof document === 'undefined') return ''
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
  return match ? match[2] : ''
}

export default function HomePageClient() {
  const [bookingOpen, setBookingOpen] = useState(false)
  const [faqs, setFaqs] = useState(DEFAULT_FAQS)
  const [persona, setPersona] = useState('')
  const heroRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '22%'])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.55], [1, 0])
  const heroScale = useTransform(scrollYProgress, [0, 0.55], [1, 0.97])

  function openBooking() { setBookingOpen(true) }
  function closeBooking() { setBookingOpen(false) }

  useEffect(() => {
    setPersona(getCookieValue('2ez_persona'))
  }, [])

  // Load FAQs from Supabase via API
  useEffect(() => {
    fetch('/api/faqs')
      .then((r) => r.json())
      .then((data) => { if (data.success && data.faqs?.length > 0) setFaqs(data.faqs) })
      .catch(() => {})
  }, [])

  const personaHero = persona ? PERSONA_HERO[persona] : null

  const localBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': 'https://www.2eztek.com',
    name: '2EZ TEK',
    url: 'https://www.2eztek.com',
    telephone: PHONE_DISPLAY,
    email: 'support@2eztek.com',
    image: 'https://www.2eztek.com/images/rev.webp',
    areaServed: serviceAreas.map((area) => ({ '@type': 'City', name: area.name })),
    address: { '@type': 'PostalAddress', addressLocality: 'Dallas', addressRegion: 'TX', addressCountry: 'US' },
    aggregateRating: { '@type': 'AggregateRating', ratingValue: '5', reviewCount: '500' },
    serviceType: ['Fitness Equipment Repair', 'Treadmill Repair', 'Elliptical Repair', 'Exercise Bike Repair', 'Gym Equipment Assembly', 'Commercial Gym Maintenance', 'Preventative Maintenance'],
  }

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({ '@type': 'Question', name: faq.question, acceptedAnswer: { '@type': 'Answer', text: faq.answer } })),
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#070B12] text-white">
      <Script id="local-business-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }} />
      <Script id="faq-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      {/* ── Floating CTA ──────────────────────────────────────────────────── */}
      <motion.button onClick={openBooking} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.4, duration: 0.7, ease: EASE }} whileHover={{ scale: 1.08, boxShadow: '0 0 60px rgba(34,211,238,0.5)' }} whileTap={{ scale: 0.94 }} aria-label="Open service booking form" className="fixed bottom-5 right-5 z-50 rounded-full bg-cyan-400 px-6 py-4 text-sm font-black text-black shadow-[0_0_45px_rgba(34,211,238,0.35)]">
        Book Service
      </motion.button>

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section ref={heroRef} className="relative min-h-screen overflow-hidden pt-28 lg:pt-32">
        <div className="absolute inset-0 overflow-hidden">
          <motion.div style={{ y: heroY }} className="relative h-[115%] w-[112%]">
            <motion.div initial={{ scale: 1.08 }} animate={{ scale: 1 }} transition={{ duration: 2.2, ease: EASE }} className="h-full w-full">
              <Image src="/images/rev.webp" alt="Commercial fitness equipment service in Dallas Fort Worth by 2EZ TEK" fill priority sizes="(max-width: 768px) 100vw, (max-width: 1280px) 80vw, 3840px" className="object-cover opacity-85" />
            </motion.div>
          </motion.div>
        </div>
        <div className="absolute inset-0 bg-black/25" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,11,18,0.92)_0%,rgba(7,11,18,0.55)_43%,rgba(7,11,18,0.05)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.24),transparent_35%)]" />

        <motion.div style={{ opacity: heroOpacity, scale: heroScale }} className="relative z-10 grid min-h-[82vh] items-center gap-12 px-6 py-20 lg:grid-cols-[1fr,420px] lg:px-16">
          <div className="max-w-4xl">
            <div className="mb-6 flex items-center gap-3">
              <motion.span variants={lineDraw} initial="hidden" animate="show" custom={0.3} className="block h-px w-8 bg-cyan-400" />
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7, delay: 0.6 }} className="text-xs font-black uppercase tracking-[0.25em] text-cyan-400">
                Dallas Fort Worth Fitness Equipment Experts
              </motion.span>
            </div>

            <div className="overflow-hidden">
              <motion.h1 initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.1, delay: 0.25, ease: EASE }} className="max-w-4xl text-4xl font-black leading-[1] tracking-tight md:text-6xl lg:text-7xl">
                {personaHero ? (
                  personaHero.headline
                ) : (
                  <>
                    Fitness Equipment Repair In Dallas Fort Worth
                    <motion.span initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.0, delay: 0.4, ease: EASE }} className="block text-cyan-400">
                      Treadmills, Ellipticals, Gyms & Commercial Equipment
                    </motion.span>
                  </>
                )}
              </motion.h1>
            </div>

            <motion.p initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.55, ease: EASE }} className="mt-6 max-w-3xl text-lg leading-relaxed text-white/75 md:text-xl">
              {personaHero
                ? personaHero.sub
                : '2EZ TEK provides professional treadmill repair, elliptical repair, exercise bike service, gym equipment assembly, preventative maintenance, and commercial fitness equipment repair throughout Dallas Fort Worth.'
              }
            </motion.p>

            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.65, ease: EASE }} className="mt-4 max-w-3xl text-base leading-relaxed text-white/55 md:text-lg">
              From luxury home gyms to apartment fitness centers and commercial facilities, our technicians help keep equipment running, members happy, and downtime under control.
            </motion.p>

            <motion.div variants={staggerContainer(0.1, 0.75)} initial="hidden" animate="show" className="mt-10 flex flex-wrap gap-4">
              {[
                { node: <button onClick={openBooking} className="button-glow rounded-2xl bg-cyan-400 px-7 py-4 text-sm font-black uppercase tracking-[0.1em] text-black">Book Repair Service</button> },
                { node: <a href={'tel:' + PHONE_TEL} className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-7 py-4 text-sm font-black uppercase tracking-[0.1em] text-cyan-200 transition hover:bg-cyan-400/15">Call {PHONE_DISPLAY}</a> },
                { node: <Link href="/gym-equipment-repair-dallas" className="rounded-2xl border border-white/10 bg-white/5 px-7 py-4 text-sm font-black uppercase tracking-[0.1em] text-white backdrop-blur-xl transition hover:border-cyan-400/30 hover:bg-cyan-400/10">View Services</Link> },
              ].map((btn, i) => <motion.div key={i} variants={staggerItem}>{btn.node}</motion.div>)}
            </motion.div>

            <motion.div variants={staggerContainer(0.1, 0.9)} initial="hidden" animate="show" className="mt-14 grid grid-cols-2 gap-4 md:grid-cols-4">
              {stats.map((s) => (
                <motion.div key={s.label} variants={staggerItem} whileHover={{ y: -4, borderColor: 'rgba(34,211,238,0.25)' }} className="glow-card rounded-3xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur-xl transition-colors">
                  <div className="text-3xl font-black text-cyan-400">{'plain' in s && s.plain ? s.raw : <StatValue raw={s.raw} />}</div>
                  <div className="mt-2 text-sm text-white/55">{s.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0, x: 56, y: 16 }} animate={{ opacity: 1, x: 0, y: 0 }} transition={{ duration: 1.1, delay: 0.5, ease: EASE }} className="rounded-[32px] border border-white/10 bg-white/[0.08] p-5 shadow-[0_20px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl">
            <div className="rounded-[24px] bg-[#0B1220]/90 p-5">
              <div className="text-sm font-black uppercase tracking-[0.25em] text-cyan-300">Smart Service</div>
              <h2 className="mt-3 text-2xl font-black">Easy booking. Clear updates. Better repairs.</h2>
              <motion.div variants={staggerContainer(0.08, 0.7)} initial="hidden" animate="show" className="mt-6 space-y-3">
                {['Schedule residential or commercial service', 'Get real-time job status updates', 'Track equipment history and maintenance needs', 'Access manuals, troubleshooting, and smarter service records'].map((item) => (
                  <motion.div key={item} variants={staggerItem} className="rounded-2xl border border-white/10 bg-white/[0.05] p-4 text-sm text-white/70">{item}</motion.div>
                ))}
              </motion.div>
              <a href={'tel:' + PHONE_TEL} className="mt-5 flex items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-5 py-4 text-sm font-black text-cyan-200 transition hover:bg-cyan-400/15">Call {PHONE_DISPLAY}</a>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ── Trust Bar ─────────────────────────────────────────────────────── */}
      <section className="border-y border-white/10 bg-[#0B1220] px-6 py-16 lg:px-16">
        <Reveal className="text-center">
          <div className="text-sm font-black uppercase tracking-[0.3em] text-cyan-400">Trusted By Homeowners & Fitness Facilities</div>
          <motion.div variants={staggerContainer(0.1, 0.2)} initial="hidden" whileInView="show" viewport={{ once: true }} className="mt-10 flex flex-wrap items-center justify-center gap-8 text-sm font-black uppercase tracking-[0.16em] text-white/35 md:text-base">
            {['Dallas Fort Worth', 'Treadmill Repair', 'Gym Assembly', 'Commercial Maintenance', 'SmartGymOps Powered'].map((t) => (
              <motion.span key={t} variants={staggerItem}>{t}</motion.span>
            ))}
          </motion.div>
        </Reveal>
      </section>

      {/* ── Services Grid ─────────────────────────────────────────────────── */}
      <section className="bg-[#070B12] px-6 py-24 lg:px-16">
        <Reveal className="mb-14 max-w-4xl">
          <div className="text-sm font-black uppercase tracking-[0.3em] text-cyan-400">Fitness Equipment Services</div>
          <h2 className="mt-4 text-4xl font-black leading-tight md:text-6xl">
            Repair, Assembly & Maintenance
            <span className="block text-white/45">For Homes And Commercial Gyms.</span>
          </h2>
          <p className="mt-6 max-w-3xl text-lg leading-relaxed text-white/60">Our service pages are built around the way real customers search for help: equipment type, problem, city, and service need.</p>
        </Reveal>
        <motion.div variants={staggerContainer(0.055, 0.1)} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }} className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {seoServices.map((service) => (
            <motion.div key={service.title} variants={staggerItem}>
              <Link href={service.href} className="block rounded-3xl border border-white/10 bg-white/[0.05] p-5 text-sm font-black text-white/75 transition hover:border-cyan-400/30 hover:bg-cyan-400/10 hover:text-cyan-200">{service.title}</Link>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── Service Path Cards ────────────────────────────────────────────── */}
      <section className="bg-[#070B12] px-6 pb-24 lg:px-16">
        <div className="grid gap-6 lg:grid-cols-2">
          {servicePaths.map((item, i) => (
            <Reveal key={item.title} delay={i * 0.15} direction={i === 0 ? 'left' : 'right'}>
              <motion.div whileHover={{ y: -6 }} transition={{ duration: 0.4, ease: EASE }} className="card-hover rounded-[36px] border border-white/10 bg-white/[0.05] p-8 backdrop-blur-xl">
                <div className="mb-8 flex items-center gap-3">
                  <span className="text-3xl">{item.icon}</span>
                  <div className="border-l-2 border-cyan-400 pl-3 text-xs font-black uppercase tracking-[0.2em] text-cyan-300">{item.label}</div>
                </div>
                <h3 className="text-4xl font-black">{item.title}</h3>
                <p className="mt-5 max-w-xl text-white/60">{item.text}</p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <button onClick={openBooking} className="button-glow rounded-2xl bg-cyan-400 px-6 py-4 text-sm font-black text-black transition hover:scale-105 active:scale-95">{item.button}</button>
                  <Link href={item.href} className="rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-sm font-black text-white transition hover:border-cyan-400/30 hover:bg-cyan-400/10">Learn More</Link>
                </div>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Brands ────────────────────────────────────────────────────────── */}
      <section className="border-t border-white/10 bg-[#07101D] px-6 py-24 lg:px-16">
        <div className="grid gap-12 lg:grid-cols-[0.9fr,1.1fr] lg:items-start">
          <Reveal direction="left">
            <div className="text-sm font-black uppercase tracking-[0.3em] text-cyan-400">Brands We Service</div>
            <h2 className="mt-4 text-4xl font-black leading-tight md:text-6xl">
              Major Fitness Equipment Brands
              <span className="block text-white/45">Serviced By Real Technicians.</span>
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-white/60">2EZ TEK repairs and maintains many residential and commercial equipment brands, including treadmills, ellipticals, bikes, strength machines, functional trainers, and commercial cardio equipment.</p>
            <Link href="/manuals" className="mt-8 inline-flex rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-7 py-4 text-sm font-black uppercase tracking-[0.12em] text-cyan-200 transition hover:bg-cyan-400/15">Search Manuals</Link>
            <Link href="/brands" className="mt-3 inline-flex rounded-2xl border border-white/10 bg-white/5 px-7 py-4 text-sm font-black uppercase tracking-[0.12em] text-white transition hover:border-cyan-400/30 hover:bg-cyan-400/10">All Brand Pages</Link>
          </Reveal>
          <motion.div variants={staggerContainer(0.045, 0.1)} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {brands.map((brand) => (
              <motion.div key={brand.slug} variants={staggerItem} whileHover={{ y: -5 }} transition={{ duration: 0.3, ease: EASE }}>
                <Link href={'/brands/' + brand.slug} className="group flex min-h-40 flex-col rounded-3xl border border-white/10 bg-white/[0.05] p-5 transition-all duration-300 hover:border-cyan-400/35 hover:bg-cyan-400/[0.06]">
                  <BrandLogo brand={brand} />
                  <span className="mt-5 text-sm font-black text-white/75 transition-colors duration-300 group-hover:text-cyan-300">{brand.name}</span>
                  <span className="mt-2 flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.18em] text-white/25 transition-colors duration-300 group-hover:text-cyan-400/70">
                    View Repair Page
                    <motion.span initial={{ x: 0 }} whileHover={{ x: 3 }} className="inline-block">→</motion.span>
                  </span>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Service Areas ─────────────────────────────────────────────────── */}
      <section className="border-t border-white/10 bg-[#050B14] px-6 py-24 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <Reveal className="max-w-4xl">
            <div className="text-sm font-black uppercase tracking-[0.3em] text-cyan-400">Service Areas</div>
            <h2 className="mt-4 text-4xl font-black leading-tight md:text-6xl">
              Fitness Equipment Repair Across
              <span className="block text-white/45">Dallas Fort Worth.</span>
            </h2>
            <p className="mt-6 max-w-3xl text-lg leading-relaxed text-white/60">We help homeowners, apartments, hotels, schools, studios, corporate gyms, and commercial fitness centers across the DFW area.</p>
          </Reveal>

          <motion.div variants={staggerContainer(0.05, 0.1)} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }} className="mt-12 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {serviceAreas.map((area) => (
              <motion.div key={area.slug} variants={staggerItem} whileHover={{ y: -4 }} transition={{ duration: 0.3, ease: EASE }}>
                <Link href={'/areas/' + area.slug} className="group block rounded-3xl border border-white/10 bg-white/[0.05] p-5 transition-all duration-300 hover:border-cyan-400/30 hover:bg-cyan-400/[0.05]">
                  <span className="text-sm font-black uppercase tracking-[0.14em] text-white/65 transition-colors duration-300 group-hover:text-cyan-300">{area.name}</span>
                  <span className="mt-2 block text-[10px] font-black uppercase tracking-[0.15em] text-white/25 transition-colors duration-300 group-hover:text-cyan-400/60">View Service Area →</span>
                </Link>
              </motion.div>
            ))}
          </motion.div>

          <Reveal delay={0.2} className="mt-8">
            <Link href="/areas" className="inline-flex rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-7 py-4 text-sm font-black uppercase tracking-[0.12em] text-cyan-200 transition hover:bg-cyan-400/15">
              View All Service Areas
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ── SmartGymOps ───────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-t border-white/10 bg-[#07101D] px-6 py-28 lg:px-16">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.12),transparent_35%)]" />
        <div className="relative z-10 grid gap-12 lg:grid-cols-[1fr,460px] lg:items-center">
          <Reveal direction="left">
            <div className="text-sm font-black uppercase tracking-[0.3em] text-cyan-400">Powered By SmartGymOps</div>
            <h2 className="mt-4 max-w-4xl text-4xl font-black leading-tight md:text-6xl">
              Premium Field Service.
              <span className="block text-white/45">Smarter Equipment Operations.</span>
            </h2>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/65">2EZ TEK delivers hands-on repair, assembly, and maintenance. SmartGymOps powers the workflow behind the scenes with smarter tracking, service history, QR reporting, and operational visibility.</p>
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {['Service requests organized from intake to completion', 'Equipment history tracked across every machine', 'QR reporting support for commercial facilities', 'Maintenance visibility built for long-term uptime'].map((item) => (
                <div key={item} className="rounded-2xl border border-white/10 bg-white/[0.05] p-5 text-sm font-semibold text-white/70">{item}</div>
              ))}
            </div>
            <div className="mt-10 flex flex-wrap gap-3">
              <button onClick={openBooking} className="button-glow rounded-2xl bg-cyan-400 px-7 py-4 text-sm font-black uppercase tracking-[0.12em] text-black transition hover:scale-105 active:scale-95">Request Smart Service</button>
              <Link href="https://smartgymops.com" target="_blank" rel="noopener noreferrer" className="rounded-2xl border border-white/10 bg-white/5 px-7 py-4 text-sm font-black uppercase tracking-[0.12em] text-white transition hover:border-cyan-400/30 hover:bg-cyan-400/10">Visit SmartGymOps ↗</Link>
            </div>
          </Reveal>
          <Reveal direction="right" delay={0.15}>
            <div className="rounded-[36px] border border-white/10 bg-white/[0.06] p-6 shadow-[0_25px_100px_rgba(0,0,0,0.45)] backdrop-blur-xl">
              <div className="rounded-[28px] bg-[#0B1220] p-6">
                <div className="flex items-center justify-between border-b border-white/10 pb-5">
                  <div>
                    <div className="text-xl font-black">SmartGymOps</div>
                    <div className="mt-1 text-sm text-white/45">Service Intelligence Layer</div>
                  </div>
                  <div className="rounded-sm border border-emerald-400/30 px-3 py-1 text-xs font-black uppercase tracking-[0.2em] text-emerald-300">Active</div>
                </div>
                <motion.div variants={staggerContainer(0.1, 0.3)} initial="hidden" whileInView="show" viewport={{ once: true }} className="mt-6 space-y-4">
                  {[['Request Created', 'Customer issue captured'], ['Tech Assigned', 'Job routed for service'], ['Repair Logged', 'Equipment history updated'], ['Uptime Improved', 'Maintenance insight retained']].map(([title, text]) => (
                    <motion.div key={title} variants={staggerItem} className="rounded-2xl border border-white/10 bg-white/[0.05] p-4">
                      <div className="font-black text-cyan-300">{title}</div>
                      <div className="mt-1 text-sm text-white/50">{text}</div>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Marketplace ───────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-t border-white/10 bg-[#050B14] px-6 py-32 lg:px-16">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.12),transparent_35%)]" />
        <div className="absolute right-[-180px] top-[120px] h-[520px] w-[520px] rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="relative z-10 mx-auto max-w-7xl">
          <div className="grid gap-16 lg:grid-cols-[1.05fr,0.95fr] lg:items-center">
            <Reveal direction="left">
              <div className="flex items-center gap-3">
                <span className="h-px w-6 bg-cyan-400" />
                <span className="text-xs font-black uppercase tracking-[0.28em] text-cyan-300">SmartGymOps Marketplace</span>
              </div>
              <h2 className="mt-6 max-w-4xl text-5xl font-black leading-tight md:text-7xl">
                Buy. Sell.
                <span className="block text-cyan-400">Service Fitness Equipment.</span>
              </h2>
              <p className="mt-8 max-w-2xl text-lg leading-8 text-white/65 md:text-xl">2EZ TEK is building a smarter marketplace for fitness equipment. Browse listings, sell equipment, request delivery, schedule repairs, and access professional support backed by real technicians.</p>
              <div className="mt-10 flex flex-wrap gap-4">
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                  <Link href="/equipment-for-sale/listings" className="button-glow block rounded-2xl bg-cyan-400 px-8 py-5 text-sm font-black uppercase tracking-[0.15em] text-black">Browse Marketplace</Link>
                </motion.div>
                <Link href="/equipment-for-sale/new" className="rounded-2xl border border-white/10 bg-white/5 px-8 py-5 text-sm font-black uppercase tracking-[0.15em] text-white transition hover:border-cyan-400/30 hover:bg-cyan-400/10">Sell Equipment</Link>
              </div>
              <div className="mt-14 grid gap-4 md:grid-cols-2">
                {['Local buyers and sellers', 'Commercial and residential equipment', 'Delivery and installation services', 'Repair and diagnostics support'].map((item) => (
                  <div key={item} className="rounded-2xl border border-white/10 bg-white/[0.05] p-5 text-sm font-semibold text-white/70 backdrop-blur-xl">{item}</div>
                ))}
              </div>
            </Reveal>
            <Reveal direction="right" delay={0.15}>
              <div className="rounded-[40px] border border-white/10 bg-white/[0.06] p-6 shadow-[0_30px_120px_rgba(0,0,0,0.45)] backdrop-blur-xl">
                <div className="rounded-[32px] bg-[#0B1220] p-6">
                  <div className="border-b border-white/10 pb-5">
                    <div className="text-xl font-black">Sell Your Fitness Equipment</div>
                    <div className="mt-1 text-sm text-white/45">Powered by SmartGymOps</div>
                  </div>
                  <div className="mt-6 space-y-4">
                    {['List treadmills, ellipticals, bikes, and strength equipment', 'Reach local buyers across Dallas Fort Worth', 'We handle delivery, assembly, and diagnostics', 'Commercial and residential equipment welcome'].map((item) => (
                      <div key={item} className="flex gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                        <span className="mt-0.5 flex-shrink-0 text-cyan-400">→</span>
                        <span className="text-sm text-white/70">{item}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 space-y-3">
                    <Link href="/equipment-for-sale/new" className="flex items-center justify-center rounded-2xl bg-cyan-400 px-5 py-4 text-sm font-black uppercase tracking-[0.15em] text-black transition hover:bg-cyan-300">List Your Equipment</Link>
                    <Link href="/equipment-for-sale/listings" className="flex items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-5 py-4 text-sm font-black uppercase tracking-[0.15em] text-cyan-200 transition hover:bg-cyan-400/15">Browse Marketplace</Link>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── Projects ──────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-t border-white/10 bg-[#0B1220] px-6 py-28 lg:px-16">
        <Reveal className="max-w-4xl">
          <div className="text-sm font-black uppercase tracking-[0.3em] text-cyan-400">Featured Projects</div>
          <h2 className="mt-4 text-4xl font-black leading-tight md:text-6xl">Real Work.<span className="block text-white/45">Real Installations.</span></h2>
        </Reveal>
        <div className="mt-16 grid gap-6 lg:grid-cols-12">
          <motion.div variants={scaleReveal} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }} custom={0} whileHover={{ y: -8 }} transition={{ duration: 0.5, ease: EASE }} className="group relative overflow-hidden rounded-[36px] border border-white/10 lg:col-span-7">
            <Image src="/images/rev.webp" alt="REV Fitness Fort Worth commercial fitness equipment project by 2EZ TEK" width={1200} height={760} className="h-[620px] w-full object-cover transition duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
            <div className="absolute bottom-0 p-8">
              <div className="inline-flex items-center gap-2 border-l-2 border-cyan-400 pl-3 text-xs font-black uppercase tracking-[0.2em] text-cyan-300">Commercial Facility</div>
              <h3 className="mt-5 text-4xl font-black">REV Fitness Fort Worth</h3>
            </div>
          </motion.div>
          <div className="grid gap-6 lg:col-span-5">
            {projectCards.map((item, i) => (
              <motion.div key={item.title} variants={scaleReveal} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }} custom={i * 0.12} whileHover={{ y: -8 }} transition={{ duration: 0.5, ease: EASE }} className="group relative overflow-hidden rounded-[36px] border border-white/10">
                <Image src={item.image} alt={item.title + ' — 2EZ TEK fitness equipment project'} width={800} height={500} className="h-[297px] w-full object-cover transition duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
                <div className="absolute bottom-0 p-6">
                  <div className="inline-flex items-center gap-2 border-l-2 border-cyan-400 pl-3 text-[10px] font-black uppercase tracking-[0.2em] text-cyan-300">{item.tag}</div>
                  <h3 className="mt-4 text-2xl font-black">{item.title}</h3>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        <Reveal delay={0.2}>
          <Link href="/projects" className="mt-10 inline-flex rounded-2xl border border-white/10 bg-white/5 px-7 py-4 text-sm font-black uppercase tracking-[0.12em] text-white transition hover:border-cyan-400/30 hover:bg-cyan-400/10">View More Projects</Link>
        </Reveal>
      </section>

      {/* ── Manuals ───────────────────────────────────────────────────────── */}
      <section className="border-t border-white/10 bg-[#07101D] px-6 py-24 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-[0.95fr,1.05fr] lg:items-center">
            <Reveal direction="left">
              <div className="text-sm font-black uppercase tracking-[0.3em] text-cyan-400">Manuals & Troubleshooting</div>
              <h2 className="mt-4 text-4xl font-black leading-tight md:text-6xl">Find Fitness Equipment Manuals<span className="block text-white/45">And Repair Resources.</span></h2>
              <p className="mt-6 text-lg leading-relaxed text-white/60">Our manuals library helps customers, technicians, and facility managers locate equipment manuals, troubleshooting information, exploded diagrams, and repair guidance for major fitness equipment brands.</p>
              <div className="mt-10 flex flex-wrap gap-3">
                <Link href="/manuals" className="button-glow rounded-2xl bg-cyan-400 px-7 py-4 text-sm font-black uppercase tracking-[0.12em] text-black transition hover:scale-105 active:scale-95">Search Manuals</Link>
                <Link href="/blog" className="rounded-2xl border border-white/10 bg-white/5 px-7 py-4 text-sm font-black uppercase tracking-[0.12em] text-white transition hover:border-cyan-400/30 hover:bg-cyan-400/10">Read Repair Guides</Link>
              </div>
            </Reveal>
            <motion.div variants={staggerContainer(0.08, 0.1)} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }} className="grid gap-4 md:grid-cols-2">
              {['Owner manuals', 'Troubleshooting guides', 'Brand-specific repair help', 'Exploded parts support', 'Assembly references', 'Commercial maintenance resources'].map((item) => (
                <motion.div key={item} variants={staggerItem} whileHover={{ y: -4 }} className="rounded-3xl border border-white/10 bg-white/[0.05] p-6 text-sm font-black text-white/70 transition hover:border-cyan-400/20 hover:text-white/90">{item}</motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Reviews ───────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-t border-white/10 bg-[#070B12] px-6 py-28 lg:px-16">
        <Reveal className="text-center">
          <div className="text-sm font-black uppercase tracking-[0.3em] text-cyan-400">Customer Experience</div>
          <h2 className="mt-4 text-4xl font-black md:text-6xl">Trusted By Homeowners<span className="block text-white/45">Across Dallas Fort Worth.</span></h2>
        </Reveal>
        <motion.div variants={staggerContainer(0.15, 0.15)} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }} className="mt-16 grid gap-6 lg:grid-cols-3">
          {reviews.map((review) => (
            <motion.div key={review.name} variants={staggerItem} whileHover={{ y: -8 }} transition={{ duration: 0.4, ease: EASE }} className="glow-card rounded-[36px] border border-white/10 bg-white/[0.05] p-8 backdrop-blur-xl" itemScope itemType="https://schema.org/Review">
              <StarRating rating={review.rating} />
              <div className="mt-4 text-4xl font-black text-cyan-400">"</div>
              <p className="mt-2 leading-relaxed text-white/70" itemProp="reviewBody">{review.text}</p>
              <div className="mt-8">
                <div className="text-sm font-black uppercase tracking-[0.2em] text-cyan-300" itemProp="author">{review.name}</div>
                <div className="mt-1 text-xs text-white/35">{review.location}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── FAQs ──────────────────────────────────────────────────────────── */}
      <section className="border-t border-white/10 bg-[#050B14] px-6 py-24 lg:px-16">
        <div className="mx-auto max-w-5xl">
          <Reveal className="text-center">
            <div className="text-sm font-black uppercase tracking-[0.3em] text-cyan-400">Frequently Asked Questions</div>
            <h2 className="mt-4 text-4xl font-black leading-tight md:text-6xl">Fitness Equipment Repair FAQs</h2>
          </Reveal>
          <div className="mt-12 space-y-4">
            {faqs.map((faq, i) => <FaqItem key={faq.question} faq={faq} index={i} />)}
          </div>
          <Reveal delay={0.2} className="mt-14 flex flex-wrap justify-center gap-4 text-center">
            <Link href="/faqs" className="inline-flex rounded-2xl border border-cyan-400/30 bg-cyan-400/10 px-7 py-4 text-sm font-black uppercase tracking-[0.12em] text-cyan-200 transition hover:bg-cyan-400/15">Browse All FAQs</Link>
            <button onClick={openBooking} className="button-glow inline-flex rounded-2xl bg-cyan-400 px-7 py-4 text-sm font-black uppercase tracking-[0.12em] text-black transition hover:scale-105 active:scale-95">Request Service</button>
          </Reveal>
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────────────────────────── */}
      <section className="border-t border-white/10 bg-[#07101D] px-6 py-24 text-center lg:px-16">
        <Reveal className="mx-auto max-w-4xl">
          <div className="text-sm font-black uppercase tracking-[0.3em] text-cyan-400">Ready To Schedule?</div>
          <h2 className="mt-4 text-4xl font-black leading-tight md:text-6xl">Book Fitness Equipment Repair With 2EZ TEK</h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/60">Whether you need treadmill repair, home gym assembly, commercial maintenance, or diagnostics for a machine that stopped working, 2EZ TEK is ready to help.</p>
          <motion.div variants={staggerContainer(0.12, 0.2)} initial="hidden" whileInView="show" viewport={{ once: true }} className="mt-10 flex flex-wrap justify-center gap-4">
            <motion.div variants={staggerItem}>
              <button onClick={openBooking} className="button-glow rounded-2xl bg-cyan-400 px-8 py-5 text-sm font-black uppercase tracking-[0.15em] text-black transition hover:scale-105 active:scale-95">Book Service</button>
            </motion.div>
            <motion.div variants={staggerItem}>
              <a href={'tel:' + PHONE_TEL} className="rounded-2xl border border-white/10 bg-white/5 px-8 py-5 text-sm font-black uppercase tracking-[0.15em] text-white transition hover:border-cyan-400/30 hover:bg-cyan-400/10">Call {PHONE_DISPLAY}</a>
            </motion.div>
          </motion.div>
        </Reveal>
      </section>

      <AnimatePresence>
        {bookingOpen && <BookingModal onClose={closeBooking} />}
      </AnimatePresence>
    </main>
  )
}
