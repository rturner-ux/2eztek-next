'use client'

import Image from 'next/image'
import Link from 'next/link'
import { type ReactNode, useState, useEffect, useRef } from 'react'
import {
  AnimatePresence,
  motion,
  useScroll,
  useTransform,
  useInView,
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
  const inView = useInView(ref, { once: true, margin: '0px' })
  const [display, setDisplay] = useState(target)
  useEffect(() => {
    if (!inView) return
    const duration = 1400
    const startTime = performance.now()
    let raf: number
    function tick(now: number) {
      const elapsed = Math.min(now - startTime, duration)
      const eased = 1 - Math.pow(1 - elapsed / duration, 3)
      setDisplay(Math.round(eased * target))
      if (elapsed < duration) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [inView, target])
  return <span ref={ref}>{display.toLocaleString()}{suffix}</span>
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

type ServiceIcon =
  | 'assembly'
  | 'bike'
  | 'cable'
  | 'diagnostic'
  | 'elliptical'
  | 'facility'
  | 'home'
  | 'maintenance'
  | 'strength'
  | 'treadmill'

function ServicePathIcon({ icon }: { icon: ServiceIcon }) {
  const iconPaths: Record<ServiceIcon, ReactNode> = {
    assembly: (
      <>
        <path d="M5 7h14" />
        <path d="M7 7v10" />
        <path d="M17 7v10" />
        <path d="M4 17h16" />
      </>
    ),
    bike: (
      <>
        <circle cx="7" cy="17" r="3" />
        <circle cx="17" cy="17" r="3" />
        <path d="M9 17l3-7 4 7" />
        <path d="M12 10h3" />
      </>
    ),
    cable: (
      <>
        <path d="M7 5v14" />
        <path d="M17 5v14" />
        <path d="M7 8h10" />
        <path d="M7 16h10" />
        <path d="M10 8v8" />
      </>
    ),
    diagnostic: (
      <>
        <path d="M4 13h4l2-6 4 12 2-6h4" />
        <path d="M4 20h16" />
      </>
    ),
    elliptical: (
      <>
        <path d="M5 18c4-8 10-8 14 0" />
        <path d="M8 18h8" />
        <path d="M12 6v12" />
        <path d="M9 8h6" />
      </>
    ),
    facility: (
      <>
        <path d="M5 20V6.5A2.5 2.5 0 0 1 7.5 4h9A2.5 2.5 0 0 1 19 6.5V20" />
        <path d="M3 20h18" />
        <path d="M9 8h1" />
        <path d="M14 8h1" />
        <path d="M9 12h1" />
        <path d="M14 12h1" />
        <path d="M10 20v-4h4v4" />
      </>
    ),
    home: (
      <>
        <path d="m3 11 9-7 9 7" />
        <path d="M5 10v10h14V10" />
        <path d="M9 20v-6h6v6" />
      </>
    ),
    maintenance: (
      <>
        <path d="M12 3v3" />
        <path d="M12 18v3" />
        <path d="M4.2 7.5l2.6 1.5" />
        <path d="M17.2 15l2.6 1.5" />
        <path d="M4.2 16.5l2.6-1.5" />
        <path d="M17.2 9l2.6-1.5" />
        <circle cx="12" cy="12" r="4" />
      </>
    ),
    strength: (
      <>
        <path d="M4 10v4" />
        <path d="M8 8v8" />
        <path d="M16 8v8" />
        <path d="M20 10v4" />
        <path d="M4 12h16" />
      </>
    ),
    treadmill: (
      <>
        <path d="M4 16h11.5a4.5 4.5 0 0 0 4.5-4.5V7" />
        <path d="M4 19h14" />
        <path d="M7 13h8" />
        <path d="M18 7h2" />
      </>
    ),
  }

  return (
    <span className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-2xl border border-cyan-200 bg-cyan-50 text-cyan-600">
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        {iconPaths[icon]}
      </svg>
    </span>
  )
}

const stats = [
  { raw: '10K+', label: 'Machines Serviced', num: 10000, suffix: 'K+' },
  { raw: '500+', label: '5-Star Reviews', num: 500, suffix: '+' },
  { raw: '24/7', label: 'Emergency Support', plain: true },
  { raw: 'DFW', label: 'Coverage Area', plain: true },
] as const

const servicePaths = [
  { label: 'Residential', title: 'Home Gym Services', text: 'Most repair companies only take commercial accounts. We come to your home. Treadmill repair, elliptical service, exercise bike repair, assembly, relocation, and white-glove setup for homeowners across DFW. If you\'re a homeowner with a broken machine, we\'re the ones who actually show up.', button: 'Book Home Service', href: '/gym-equipment-repair-dallas', icon: 'home' as ServiceIcon },
  { label: 'Commercial', title: 'Facility Maintenance', text: 'Preventative maintenance contracts, emergency repair, QR-based equipment reporting, and asset tracking for hotels, apartment fitness centers, health clubs, corporate gyms, and training studios across Dallas Fort Worth.', button: 'Explore Commercial', href: '/commercial-gym-maintenance', icon: 'facility' as ServiceIcon },
]

const seoServices = [
  { title: 'Treadmill Repair Dallas', href: '/treadmill-repair-dallas', text: 'Belt, motor, deck, incline, and console diagnostics.', icon: 'treadmill' as ServiceIcon },
  { title: 'Elliptical Repair Dallas', href: '/elliptical-repair-dallas', text: 'Stride, resistance, noise, sensor, and console service.', icon: 'elliptical' as ServiceIcon },
  { title: 'Exercise Bike Repair', href: '/exercise-bike-repair-dallas', text: 'Resistance, pedal, flywheel, display, and drivetrain fixes.', icon: 'bike' as ServiceIcon },
  { title: 'Commercial Gym Maintenance', href: '/commercial-gym-maintenance', text: 'Fleet maintenance for gyms, hotels, apartments, and studios.', icon: 'facility' as ServiceIcon },
  { title: 'Fitness Equipment Assembly', href: '/fitness-equipment-assembly-dallas', text: 'Professional setup, leveling, calibration, and testing.', icon: 'assembly' as ServiceIcon },
  { title: 'Home Gym Installation', href: '/home-gym-installation-dallas', text: 'White-glove home gym placement, buildout, and setup.', icon: 'home' as ServiceIcon },
  { title: 'Preventative Maintenance', href: '/preventative-maintenance-dallas', text: 'Routine service that reduces downtime and extends equipment life.', icon: 'maintenance' as ServiceIcon },
  { title: 'Strength Equipment Repair', href: '/strength-equipment-repair-dallas', text: 'Benches, racks, selectorized machines, pulleys, and frames.', icon: 'strength' as ServiceIcon },
  { title: 'Cable Machine Repair', href: '/cable-machine-repair-dallas', text: 'Cable, pulley, guide rod, weight stack, and bearing service.', icon: 'cable' as ServiceIcon },
  { title: 'Gym Equipment Troubleshooting', href: '/manuals', text: 'Manuals, symptoms, model support, and repair guidance.', icon: 'diagnostic' as ServiceIcon },
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
  { name: 'Peloton', slug: 'peloton', domain: 'onepeloton.com', mark: 'P' },
  { name: 'Rogue Fitness', slug: 'rogue-fitness', domain: 'roguefitness.com', mark: 'R' },
  { name: 'PRX Performance', slug: 'prx', domain: 'prxperformance.com', mark: 'PRX' },
]

function BrandLogo({ brand }: { brand: Brand }) {
  const [failed, setFailed] = useState(false)

  return (
    <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-slate-100 text-xs font-black tracking-[0.08em] text-cyan-600">
      {failed || !brand.domain ? (
        brand.mark
      ) : (
        // The favicon endpoint keeps manufacturer assets lightweight for this compact card.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`https://www.google.com/s2/favicons?domain=${brand.domain}&sz=128`}
          alt={`${brand.name} logo`}
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
  { name: 'Marcus T.', location: 'Plano, TX', rating: 5, authorType: 'Person', text: 'My NordicTrack treadmill belt was burning and slipping. Robby diagnosed it on the spot, replaced the belt and lubricated the deck in one visit. Runs like new. Did not try to upsell me on anything I did not need.' },
  { name: 'Jennifer R.', location: 'Frisco, TX', rating: 5, authorType: 'Person', text: 'Scheduled same-day for my Peloton Bike. The resistance motor had completely failed. Tech had the part on the truck, fixed it in under an hour. This is the kind of service you expect but rarely get.' },
  { name: 'Stoneleigh at Stonebriar', location: 'Frisco, TX', rating: 5, authorType: 'Organization', text: 'We have 14 machines across our two fitness centers. 2EZ TEK handles all of it on a quarterly contract. Every visit is documented, every machine has a service history. Our residents notice the difference.' },
]


const DEFAULT_FAQS = [
  { question: 'Do you repair treadmills in Dallas Fort Worth?', answer: 'Yes. 2EZ TEK provides treadmill repair throughout Dallas Fort Worth, including diagnostics, belt issues, motor problems, console problems, incline failures, noise issues, and maintenance.' },
  { question: 'Do you service commercial gyms and apartment fitness centers?', answer: 'Yes. We service commercial gyms, apartment fitness centers, hotels, corporate fitness rooms, schools, training studios, and other facilities that rely on working fitness equipment.' },
  { question: 'What fitness equipment brands do you repair and assemble?', answer: 'We service and assemble many major brands including Life Fitness, Precor, Matrix, Cybex, Technogym, NordicTrack, Bowflex, TRUE Fitness, StairMaster, Rogue Fitness, PRX Performance, Schwinn, Nautilus, and more.' },
  { question: 'Do you assemble home gym equipment?', answer: 'Yes. We provide home gym assembly, treadmill assembly, elliptical assembly, strength machine assembly, functional trainer setup, and white-glove fitness equipment installation.' },
  { question: 'Do you offer preventative maintenance?', answer: 'Yes. Preventative maintenance is available for both residential and commercial clients. This helps reduce downtime, extend equipment life, and catch problems before they become major repairs.' },
]

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" aria-label={rating + ' out of 5 stars'}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} className={'h-4 w-4 ' + (i < rating ? 'text-cyan-500' : 'text-slate-200')} fill="currentColor" viewBox="0 0 20 20">
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
    <motion.div ref={ref} variants={staggerItem} initial="hidden" animate={inView ? 'show' : 'hidden'} transition={{ delay: index * 0.07 }} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition hover:bg-slate-50">
        <h3 className="text-lg font-black text-slate-900">{faq.question}</h3>
        <motion.span animate={{ rotate: open ? 45 : 0 }} transition={{ duration: 0.25, ease: EASE }} className="flex-shrink-0 text-2xl text-cyan-400">+</motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.35, ease: EASE }} className="overflow-hidden">
            <p className="px-6 pb-6 leading-relaxed text-slate-500">{faq.answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
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
    headline: 'Treadmill Repair In Dallas Fort Worth, Fast, Professional Service',
    sub: 'Belt slipping, motor problems, incline failures, error codes, and console issues, 2EZ TEK services all major treadmill brands across DFW.',
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

function openBooking() { window.dispatchEvent(new CustomEvent('open-booking-modal')) }

export default function HomePageClient() {
  const [faqs, setFaqs] = useState(DEFAULT_FAQS)
  const [persona, setPersona] = useState('')
  const heroRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '22%'])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.55], [1, 0])
  const heroScale = useTransform(scrollYProgress, [0, 0.55], [1, 0.97])

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

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({ '@type': 'Question', name: faq.question, acceptedAnswer: { '@type': 'Answer', text: faq.answer } })),
  }

  return (
    <main className="min-h-screen overflow-hidden bg-white text-slate-900">
      <script id="faq-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />


      {/* â"€â"€ Floating CTA â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€ */}
      <motion.button onClick={openBooking} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.4, duration: 0.7, ease: EASE }} whileHover={{ scale: 1.08, boxShadow: '0 0 60px rgba(34,211,238,0.5)' }} whileTap={{ scale: 0.94 }} aria-label="Open service booking form" className="fixed bottom-5 right-5 z-50 rounded-full bg-cyan-400 px-6 py-4 text-sm font-black text-black shadow-[0_0_45px_rgba(34,211,238,0.35)]">
        Book Service
      </motion.button>

      {/* â"€â"€ Hero â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€ */}
      <section ref={heroRef} className="relative min-h-screen overflow-hidden pt-28 lg:pt-32">
        <div className="absolute inset-0 overflow-hidden">
          <motion.div style={{ y: heroY }} className="relative h-[115%] w-[112%]">
            <motion.div initial={{ scale: 1.08 }} animate={{ scale: 1 }} transition={{ duration: 2.2, ease: EASE }} className="h-full w-full">
              <Image src="/images/Tour_11.webp" alt="Commercial fitness equipment service in Dallas Fort Worth by 2EZ TEK" fill priority sizes="100vw" className="object-cover" />
            </motion.div>
          </motion.div>
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.50)_0%,rgba(0,0,0,0.15)_50%,transparent_100%)]" />

        <motion.div style={{ opacity: heroOpacity, scale: heroScale }} className="relative z-10 flex min-h-[82vh] items-center px-6 py-20 lg:px-16">
          <div className="max-w-4xl">
            <div className="mb-6 flex items-center gap-3">
              <motion.span variants={lineDraw} initial="hidden" animate="show" custom={0.3} className="block h-px w-8 bg-cyan-400" />
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7, delay: 0.6 }} className="text-xs font-black uppercase tracking-[0.25em] text-cyan-300">
                Dallas Fort Worth Fitness Equipment Experts
              </motion.span>
            </div>

            <div className="overflow-hidden">
              <motion.h1 initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.1, delay: 0.25, ease: EASE }} className="max-w-3xl text-3xl font-black leading-tight tracking-tight text-white md:text-5xl lg:text-[3.25rem]">
                {personaHero ? (
                  personaHero.headline
                ) : (
                  <>
                    Fitness Equipment Repair In Dallas Fort Worth
                    <motion.span initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.0, delay: 0.4, ease: EASE }} className="block text-cyan-400">
                      Home Gyms, Treadmills, Ellipticals & Commercial Facilities
                    </motion.span>
                  </>
                )}
              </motion.h1>
            </div>

            <motion.p initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.55, ease: EASE }} className="mt-6 max-w-3xl text-lg leading-relaxed text-white/85 md:text-xl">
              {personaHero
                ? personaHero.sub
                : 'We come to your home. Most repair companies only service commercial accounts, if you\'re a homeowner with a broken treadmill, elliptical, or exercise bike, most of them won\'t return your call. 2EZ TEK was built for residential clients first.'
              }
            </motion.p>

            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.65, ease: EASE }} className="mt-4 max-w-3xl text-base leading-relaxed text-white/65 md:text-lg">
              We repair treadmills, ellipticals, exercise bikes, and strength equipment in home gyms and commercial facilities across Dallas Fort Worth. 500+ five-star reviews.
            </motion.p>

            <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.75, ease: EASE }} className="mt-5 text-xl font-black text-cyan-400 md:text-2xl">
              We got your back.
            </motion.p>

            <motion.div variants={staggerContainer(0.1, 0.75)} initial="hidden" animate="show" className="mt-10 flex flex-wrap items-center gap-4">
              {[
                { node: <button onClick={openBooking} className="button-glow rounded-2xl bg-cyan-400 px-7 py-4 text-sm font-black uppercase tracking-[0.1em] text-black">Book Service</button> },
                { node: <a href={'tel:' + PHONE_TEL} className="rounded-2xl border border-white/20 bg-white/10 px-7 py-4 text-sm font-black uppercase tracking-[0.1em] text-white backdrop-blur-sm transition hover:bg-white/20">Call {PHONE_DISPLAY}</a> },
                { node: <Link href="/gym-equipment-repair-dallas" className="rounded-2xl border border-white/15 bg-white/5 px-7 py-4 text-sm font-black uppercase tracking-[0.1em] text-white backdrop-blur-sm transition hover:bg-white/15">View Services</Link> },
              ].map((btn, i) => <motion.div key={i} variants={staggerItem}>{btn.node}</motion.div>)}
            </motion.div>

            <motion.div variants={staggerContainer(0.1, 0.9)} initial="hidden" animate="show" className="mt-14 grid grid-cols-2 gap-4 md:grid-cols-4">
              {stats.map((s) => (
                <motion.div key={s.label} variants={staggerItem} whileHover={{ y: -4 }} className="rounded-3xl border border-white/15 bg-white/10 p-5 backdrop-blur-sm transition-colors">
                  <div className="text-3xl font-black text-cyan-400">{'plain' in s && s.plain ? s.raw : <StatValue raw={s.raw} />}</div>
                  <div className="mt-2 text-sm text-white/65">{s.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>

        </motion.div>
      </section>

      {/* â"€â"€ Trust Bar â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€ */}
      <section className="border-y border-slate-200 bg-slate-50 px-6 py-16 lg:px-16">
        <Reveal className="text-center">
          <div className="text-sm font-black uppercase tracking-[0.3em] text-cyan-600">Trusted By Homeowners & Fitness Facilities</div>
          <motion.div variants={staggerContainer(0.1, 0.2)} initial="hidden" whileInView="show" viewport={{ once: true }} className="mt-10 flex flex-wrap items-center justify-center gap-8 text-sm font-black uppercase tracking-[0.16em] text-slate-400 md:text-base">
            {['Dallas Fort Worth', 'Treadmill Repair', 'Gym Assembly', 'Commercial Maintenance', 'SmartGymOps Powered'].map((t) => (
              <motion.span key={t} variants={staggerItem}>{t}</motion.span>
            ))}
          </motion.div>
        </Reveal>
      </section>

      {/* â"€â"€ Services Grid â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€ */}
      <section className="bg-white px-6 py-24 lg:px-16">
        <Reveal className="mb-14 max-w-4xl">
          <div className="text-sm font-black uppercase tracking-[0.3em] text-cyan-600">Fitness Equipment Services</div>
          <h2 className="mt-4 text-4xl font-black leading-tight md:text-6xl">
            Repair, Assembly & Maintenance
            <span className="block text-slate-400">For Homes And Commercial Gyms.</span>
          </h2>
          <p className="mt-6 max-w-3xl text-lg leading-relaxed text-slate-500">Our service pages are built around the way real customers search for help: equipment type, problem, city, and service need.</p>
        </Reveal>
        <motion.div variants={staggerContainer(0.055, 0.1)} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }} className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {seoServices.map((service) => (
            <motion.div key={service.title} variants={staggerItem}>
              <Link href={service.href} className="group block min-h-44 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-cyan-300 hover:shadow-md">
                <ServicePathIcon icon={service.icon} />
                <h3 className="mt-5 text-lg font-black text-slate-900 transition group-hover:text-cyan-600">{service.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-500">{service.text}</p>
                <span className="mt-5 inline-flex text-xs font-black uppercase tracking-[0.18em] text-cyan-600">View {service.title}</span>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* â"€â"€ Service Path Cards â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€ */}
      <section className="bg-white px-6 pb-24 lg:px-16">
        <div className="grid gap-4 lg:grid-cols-2">
          {servicePaths.map((item, i) => (
            <Reveal key={item.title} delay={i * 0.15} direction={i === 0 ? 'left' : 'right'} className="h-full">
              <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.4, ease: EASE }} className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-5 flex items-center gap-3">
                  <ServicePathIcon icon={item.icon} />
                  <div className="border-l-2 border-cyan-500 pl-3 text-xs font-black uppercase tracking-[0.2em] text-cyan-600">{item.label}</div>
                </div>
                <h3 className="text-2xl font-black text-slate-900 md:text-3xl">{item.title}</h3>
                <p className="mt-4 max-w-xl text-sm leading-6 text-slate-500">{item.text}</p>
                <div className="mt-auto pt-6 flex flex-wrap gap-3">
                  <button onClick={openBooking} className="button-glow rounded-xl bg-cyan-400 px-5 py-3 text-xs font-black uppercase tracking-[0.12em] text-black transition hover:scale-105 active:scale-95">{item.button}</button>
                  <Link href={item.href} className="rounded-xl border border-slate-200 bg-slate-50 px-5 py-3 text-xs font-black uppercase tracking-[0.12em] text-slate-700 transition hover:border-cyan-300 hover:bg-cyan-50 hover:text-cyan-700">View {item.title}</Link>
                </div>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Residential First */}
      <section className="border-t border-slate-200 bg-slate-50 px-6 py-28 lg:px-16">
        <div className="mx-auto max-w-7xl grid gap-16 lg:grid-cols-2 lg:items-center">
          <Reveal direction="left">
            <div className="flex items-center gap-3 mb-5">
              <span className="h-px w-8 bg-cyan-500" />
              <span className="text-xs font-black uppercase tracking-[0.3em] text-cyan-600">Residential Repair</span>
            </div>
            <h2 className="text-4xl font-black leading-tight text-slate-900 md:text-6xl">
              We Come To Your Home.
              <span className="block text-slate-400">Most Companies Won't.</span>
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-slate-600">
              The majority of fitness equipment repair companies in DFW only accept commercial accounts. Hotels, gyms, apartment complexes. If you're a homeowner with a broken treadmill, most of them won't return your call.
            </p>
            <p className="mt-4 text-lg leading-relaxed text-slate-600">
              2EZ TEK was built differently. Residential repair is the core of what we do. Whether your treadmill belt is slipping, your elliptical stopped responding, or your home gym needs a full setup, we come to you, on time, and fix it right.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-3">
              <button onClick={openBooking} className="button-glow rounded-2xl bg-cyan-400 px-7 py-4 text-sm font-black uppercase tracking-[0.12em] text-black transition hover:scale-105 active:scale-95">Book Home Service</button>
              <a href={'tel:' + PHONE_TEL} className="rounded-2xl border border-slate-200 bg-white px-7 py-4 text-sm font-black uppercase tracking-[0.12em] text-slate-700 transition hover:border-cyan-300 hover:bg-cyan-50">Call {PHONE_DISPLAY}</a>
            </div>
          </Reveal>

          <Reveal direction="right" delay={0.12}>
            <div className="grid gap-4">
              {[
                { stat: '10K+', label: 'Residential jobs completed', desc: 'Homeowners across DFW trust 2EZ TEK for repair, assembly, and installation.' },
                { stat: '500+', label: 'Five-star Google reviews', desc: 'Most from residential clients who had nowhere else to turn.' },
                { stat: 'Same Week', label: 'Service scheduling', desc: 'We don\'t put residential clients on a 3-week waiting list.' },
                { stat: 'All Brands', label: 'Treadmills, ellipticals, bikes, strength', desc: 'NordicTrack, ProForm, Peloton, Bowflex, Life Fitness, and more.' },
              ].map((item) => (
                <motion.div key={item.stat} variants={staggerItem} whileHover={{ x: 4 }} transition={{ duration: 0.25, ease: EASE }} className="flex items-start gap-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-cyan-300">
                  <div className="flex-shrink-0 text-2xl font-black text-cyan-600 w-28">{item.stat}</div>
                  <div>
                    <div className="font-black text-slate-900">{item.label}</div>
                    <p className="mt-1 text-sm text-slate-500">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Brands ──────────────────────────────────────────────────────────── */}
      <section className="border-t border-slate-200 bg-white px-6 py-24 lg:px-16">
        <div className="grid gap-12 lg:grid-cols-[0.9fr,1.1fr] lg:items-start">
          <Reveal direction="left">
            <div className="text-sm font-black uppercase tracking-[0.3em] text-cyan-600">Brands We Service</div>
            <h2 className="mt-4 text-4xl font-black leading-tight text-slate-900 md:text-6xl">
              Major Fitness Equipment Brands
              <span className="block text-slate-400">Serviced By Real Technicians.</span>
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-slate-500">2EZ TEK repairs and maintains many residential and commercial equipment brands, including treadmills, ellipticals, bikes, strength machines, functional trainers, and commercial cardio equipment.</p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/manuals" className="rounded-2xl border border-cyan-200 bg-cyan-50 px-7 py-4 text-sm font-black uppercase tracking-[0.12em] text-cyan-700 transition hover:bg-cyan-100">Search Manuals</Link>
              <Link href="/brands" className="rounded-2xl border border-slate-200 bg-slate-50 px-7 py-4 text-sm font-black uppercase tracking-[0.12em] text-slate-700 transition hover:border-cyan-300 hover:bg-cyan-50">All Brand Pages</Link>
            </div>
          </Reveal>
          <motion.div variants={staggerContainer(0.045, 0.1)} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {brands.map((brand) => (
              <motion.div key={brand.slug} variants={staggerItem} whileHover={{ y: -5 }} transition={{ duration: 0.3, ease: EASE }}>
                <Link href={'/brands/' + brand.slug} className="group flex min-h-40 flex-col rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:border-cyan-300 hover:shadow-md">
                  <BrandLogo brand={brand} />
                  <span className="mt-5 text-sm font-black text-slate-700 transition-colors duration-300 group-hover:text-cyan-600">{brand.name}</span>
                  <span className="mt-2 flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400 transition-colors duration-300 group-hover:text-cyan-600">
                    View Repair Page
                    <motion.span initial={{ x: 0 }} whileHover={{ x: 3 }} className="inline-block">&#8594;</motion.span>
                  </span>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Service Areas */}
      <section className="relative overflow-hidden" style={{ height: 'clamp(600px, 85vh, 900px)' }}>

        {/* Ken Burns aerial background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="h-full w-full" style={{ animation: 'kenBurns 40s ease-in-out infinite alternate' }}>
            <Image
              src="/images/Tour_11.webp"
              alt="Dallas Fort Worth aerial view"
              fill
              sizes="100vw"
              className="object-cover object-center"
            />
          </div>
        </div>

        {/* Overlays */}
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(5,11,20,0.98)_0%,rgba(5,11,20,0.55)_45%,rgba(5,11,20,0.15)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(5,11,20,0.7)_0%,transparent_60%)]" />

        {/* Content */}
        <div className="relative z-10 flex h-full flex-col justify-between px-6 py-16 lg:px-16">
          <Reveal>
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-cyan-400" />
              <span className="text-xs font-black uppercase tracking-[0.3em] text-cyan-400">Dallas Fort Worth</span>
            </div>
            <h2 className="mt-4 max-w-3xl text-4xl font-black leading-tight text-white md:text-6xl">
              Serving All Of DFW. <span className="block text-white/50">From Home Gyms To Commercial Facilities.</span>
            </h2>
          </Reveal>

          <div>
            <motion.div variants={staggerContainer(0.04, 0.1)} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-40px' }} className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {serviceAreas.map((area) => (
                <motion.div key={area.slug} variants={staggerItem} whileHover={{ y: -3, scale: 1.02 }} transition={{ duration: 0.25, ease: EASE }}>
                  <Link href={'/areas/' + area.slug} className="group flex flex-col gap-1 border border-white/10 bg-white/[0.08] px-4 py-4 backdrop-blur-sm transition-all duration-300 hover:border-cyan-400/50 hover:bg-cyan-400/[0.1]">
                    <span className="text-sm font-black text-white transition-colors duration-300 group-hover:text-cyan-300">{area.name}</span>
                    <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-[0.18em] text-white/30 transition-colors duration-300 group-hover:text-cyan-400/70">
                      <svg className="h-2.5 w-2.5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                      Service Area
                    </span>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
            <Reveal delay={0.2} className="mt-6">
              <Link href="/areas" className="inline-flex items-center gap-2 border border-cyan-400/30 bg-black/30 px-7 py-3 text-xs font-black uppercase tracking-[0.2em] text-cyan-200 backdrop-blur-sm transition hover:border-cyan-400 hover:bg-cyan-400/10">
                View All Service Areas <span className="text-cyan-400">&#8594;</span>
              </Link>
            </Reveal>
          </div>
        </div>

        <style>{`@keyframes kenBurns { 0% { transform: scale(1.0) translate(0%,0%); } 33% { transform: scale(1.08) translate(-1.5%,-1%); } 66% { transform: scale(1.05) translate(1%,-0.5%); } 100% { transform: scale(1.1) translate(-0.5%,1%); } }`}</style>
      </section>

      {/* â"€â"€ SmartGymOps â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€ */}
      <section className="relative overflow-hidden border-t border-slate-200 bg-slate-50 px-6 py-28 lg:px-16">
        <div className="relative z-10 grid gap-12 lg:grid-cols-[1fr,460px] lg:items-center">
          <Reveal direction="left">
            <div className="text-sm font-black uppercase tracking-[0.3em] text-cyan-600">Powered By SmartGymOps</div>
            <h2 className="mt-4 max-w-4xl text-4xl font-black leading-tight text-slate-900 md:text-6xl">
              Premium Field Service.
              <span className="block text-slate-400">Smarter Equipment Operations.</span>
            </h2>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-600">2EZ TEK delivers hands-on repair, assembly, and maintenance. SmartGymOps powers the workflow behind the scenes with smarter tracking, service history, QR reporting, and operational visibility.</p>
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {['Service requests organized from intake to completion', 'Equipment history tracked across every machine', 'QR reporting support for commercial facilities', 'Maintenance visibility built for long-term uptime'].map((item) => (
                <div key={item} className="rounded-2xl border border-slate-200 bg-white p-5 text-sm font-semibold text-slate-600 shadow-sm">{item}</div>
              ))}
            </div>
            <div className="mt-10 flex flex-wrap items-center gap-3">
              <button onClick={openBooking} className="button-glow rounded-2xl bg-cyan-400 px-7 py-4 text-sm font-black uppercase tracking-[0.12em] text-black transition hover:scale-105 active:scale-95">Book Service</button>
              <Link href="https://smartgymops.com" target="_blank" rel="noopener noreferrer" className="rounded-2xl border border-slate-200 bg-white px-7 py-4 text-sm font-black uppercase tracking-[0.12em] text-slate-700 transition hover:border-cyan-300 hover:bg-cyan-50">Visit SmartGymOps &#8599;</Link>
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

      {/* Marketplace — hidden until listings are populated */}
      {false && <section className="relative overflow-hidden border-t border-slate-200 bg-white px-6 py-32 lg:px-16">
        <div className="relative z-10 mx-auto max-w-7xl">
          <div className="grid gap-16 lg:grid-cols-[1.05fr,0.95fr] lg:items-center">
            <Reveal direction="left">
              <div className="flex items-center gap-3">
                <span className="h-px w-6 bg-cyan-500" />
                <span className="text-xs font-black uppercase tracking-[0.28em] text-cyan-600">SmartGymOps Marketplace</span>
              </div>
              <h2 className="mt-6 max-w-4xl text-5xl font-black leading-tight text-slate-900 md:text-7xl">
                Buy. Sell.
                <span className="block text-cyan-500">Service Fitness Equipment.</span>
              </h2>
              <p className="mt-8 max-w-2xl text-lg leading-8 text-slate-600 md:text-xl">2EZ TEK is building a smarter marketplace for fitness equipment. Browse listings, sell equipment, request delivery, schedule repairs, and access professional support backed by real technicians.</p>
              <div className="mt-10 flex flex-wrap items-center gap-4">
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                  <Link href="/equipment-for-sale/listings" className="button-glow block rounded-2xl bg-cyan-400 px-8 py-5 text-sm font-black uppercase tracking-[0.15em] text-black">Browse Marketplace</Link>
                </motion.div>
                <Link href="/equipment-for-sale/new" className="rounded-2xl border border-slate-200 bg-slate-50 px-8 py-5 text-sm font-black uppercase tracking-[0.15em] text-slate-700 transition hover:border-cyan-300 hover:bg-cyan-50">Sell Equipment</Link>
              </div>
              <div className="mt-14 grid gap-4 md:grid-cols-2">
                {['Local buyers and sellers', 'Commercial and residential equipment', 'Delivery and installation services', 'Repair and diagnostics support'].map((item) => (
                  <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm font-semibold text-slate-600">{item}</div>
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
                        <span className="mt-0.5 flex-shrink-0 text-cyan-400">&#8594;</span>
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
      </section>}

      {/* Projects â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€ */}
      <section className="relative overflow-hidden border-t border-slate-200 bg-white px-6 py-28 lg:px-16">
        <Reveal className="max-w-4xl">
          <div className="text-sm font-black uppercase tracking-[0.3em] text-cyan-600">Featured Projects</div>
          <h2 className="mt-4 text-4xl font-black leading-tight text-slate-900 md:text-6xl">Real Work. <span className="block text-slate-400">Real Installations.</span></h2>
        </Reveal>
        <div className="mt-16 grid gap-6 lg:grid-cols-12">
          <motion.div variants={scaleReveal} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }} custom={0} whileHover={{ y: -8 }} transition={{ duration: 0.5, ease: EASE }} className="group relative overflow-hidden rounded-[36px] border border-slate-200 lg:col-span-7">
            <Image src="/images/rev.webp" alt="REV Fitness Fort Worth commercial fitness equipment project by 2EZ TEK" width={1200} height={760} className="h-[620px] w-full object-cover transition duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
            <div className="absolute bottom-0 p-8">
              <div className="inline-flex items-center gap-2 border-l-2 border-cyan-400 pl-3 text-xs font-black uppercase tracking-[0.2em] text-cyan-300">Commercial Facility</div>
              <h3 className="mt-5 text-4xl font-black">REV Fitness Fort Worth</h3>
            </div>
          </motion.div>
          <div className="grid gap-6 lg:col-span-5">
            {projectCards.map((item, i) => (
              <motion.div key={item.title} variants={scaleReveal} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }} custom={i * 0.12} whileHover={{ y: -8 }} transition={{ duration: 0.5, ease: EASE }} className="group relative overflow-hidden rounded-[36px] border border-slate-200">
                <Image src={item.image} alt={item.title + ', 2EZ TEK fitness equipment project'} width={800} height={500} className="h-[297px] w-full object-cover transition duration-700 group-hover:scale-105" />
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
          <Link href="/projects" className="mt-10 inline-flex rounded-2xl border border-slate-200 bg-white px-7 py-4 text-sm font-black uppercase tracking-[0.12em] text-slate-700 shadow-sm transition hover:border-cyan-300 hover:bg-cyan-50">View More Projects</Link>
        </Reveal>
      </section>

      {/* ── Video ─────────────────────────────────────────────────────────── */}
      <section className="border-t border-slate-800 bg-slate-900 px-6 py-24 lg:px-16">
        <Reveal className="mb-12 text-center">
          <div className="text-sm font-black uppercase tracking-[0.3em] text-cyan-400">See Us In Action</div>
          <h2 className="mt-4 text-4xl font-black text-white md:text-5xl">
            Fitness Equipment Repair
            <span className="block text-white/40">Done Right, Every Time.</span>
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="mx-auto max-w-5xl overflow-hidden rounded-[32px] border border-white/10 shadow-[0_30px_120px_rgba(0,0,0,0.5)]">
            <video
              controls
              playsInline
              preload="metadata"
              className="aspect-video w-full bg-black"
            >
              <source src="/videos/commercial1.mp4" type="video/mp4" />
            </video>
          </div>
        </Reveal>
      </section>

      {/* â"€â"€ Manuals â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€ */}
      <section className="border-t border-slate-200 bg-slate-50 px-6 py-24 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-[0.95fr,1.05fr] lg:items-center">
            <Reveal direction="left">
              <div className="text-sm font-black uppercase tracking-[0.3em] text-cyan-600">Manuals & Troubleshooting</div>
              <h2 className="mt-4 text-4xl font-black leading-tight text-slate-900 md:text-6xl">Find Fitness Equipment Manuals<span className="block text-slate-400">And Repair Resources.</span></h2>
              <p className="mt-6 text-lg leading-relaxed text-slate-500">Our manuals library helps customers, technicians, and facility managers locate equipment manuals, troubleshooting information, exploded diagrams, and repair guidance for major fitness equipment brands.</p>
              <div className="mt-10 flex flex-wrap items-center gap-3">
                <Link href="/manuals" className="button-glow rounded-2xl bg-cyan-400 px-7 py-4 text-sm font-black uppercase tracking-[0.12em] text-black transition hover:scale-105 active:scale-95">Search Manuals</Link>
                <Link href="/blog" className="rounded-2xl border border-slate-200 bg-white px-7 py-4 text-sm font-black uppercase tracking-[0.12em] text-slate-700 transition hover:border-cyan-300 hover:bg-cyan-50">Read Repair Guides</Link>
              </div>
            </Reveal>
            <motion.div variants={staggerContainer(0.08, 0.1)} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }} className="grid gap-4 md:grid-cols-2">
              {['Owner manuals', 'Troubleshooting guides', 'Brand-specific repair help', 'Exploded parts support', 'Assembly references', 'Commercial maintenance resources'].map((item) => (
                <motion.div key={item} variants={staggerItem} whileHover={{ y: -4 }} className="rounded-3xl border border-slate-200 bg-white p-6 text-sm font-black text-slate-600 shadow-sm transition hover:border-cyan-300 hover:text-slate-900">{item}</motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* â"€â"€ Reviews â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€ */}
      <section className="relative overflow-hidden border-t border-slate-200 bg-slate-50 px-6 py-28 lg:px-16">
        <Reveal className="text-center">
          <div className="text-sm font-black uppercase tracking-[0.3em] text-cyan-600">Customer Experience</div>
          <h2 className="mt-4 text-4xl font-black text-slate-900 md:text-6xl">Trusted By Homeowners<span className="block text-slate-400">Across Dallas Fort Worth.</span></h2>
        </Reveal>
        <motion.div variants={staggerContainer(0.15, 0.15)} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }} className="mt-16 grid gap-6 lg:grid-cols-3">
          {reviews.map((review) => (
            <motion.div key={review.name} variants={staggerItem} whileHover={{ y: -8 }} transition={{ duration: 0.4, ease: EASE }} className="rounded-[36px] border border-slate-200 bg-white p-8 shadow-sm" itemScope itemType="https://schema.org/Review">
              <div itemProp="itemReviewed" itemScope itemType="https://schema.org/LocalBusiness" className="hidden">
                <meta itemProp="name" content="2EZ TEK" />
                <meta itemProp="url" content="https://www.2eztek.com" />
              </div>
              <div itemProp="reviewRating" itemScope itemType="https://schema.org/Rating" className="hidden">
                <meta itemProp="ratingValue" content={String(review.rating)} />
                <meta itemProp="bestRating" content="5" />
                <meta itemProp="worstRating" content="1" />
              </div>
              <StarRating rating={review.rating} />
              <div className="mt-4 text-4xl font-black text-cyan-500">&quot;</div>
              <p className="mt-2 leading-relaxed text-slate-600" itemProp="reviewBody">{review.text}</p>
              <div className="mt-8">
                <div className="text-sm font-black uppercase tracking-[0.2em] text-cyan-600" itemProp="author" itemScope itemType={`https://schema.org/${review.authorType}`}>
                  <span itemProp="name">{review.name}</span>
                </div>
                <div className="mt-1 text-xs text-slate-400">{review.location}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* â"€â"€ FAQs â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€ */}
      <section className="border-t border-slate-200 bg-white px-6 py-24 lg:px-16">
        <div className="mx-auto max-w-5xl">
          <Reveal className="text-center">
            <div className="text-sm font-black uppercase tracking-[0.3em] text-cyan-600">Frequently Asked Questions</div>
            <h2 className="mt-4 text-4xl font-black leading-tight text-slate-900 md:text-6xl">Fitness Equipment Repair FAQs</h2>
          </Reveal>
          <div className="mt-12 space-y-4">
            {faqs.map((faq, i) => <FaqItem key={faq.question} faq={faq} index={i} />)}
          </div>
          <Reveal delay={0.2} className="mt-14 flex flex-wrap items-center justify-center gap-4 text-center">
            <Link href="/faqs" className="inline-flex rounded-2xl border border-cyan-200 bg-cyan-50 px-7 py-4 text-sm font-black uppercase tracking-[0.12em] text-cyan-600 transition hover:bg-cyan-100">Browse All FAQs</Link>
            <button onClick={openBooking} className="button-glow inline-flex rounded-2xl bg-cyan-400 px-7 py-4 text-sm font-black uppercase tracking-[0.12em] text-black transition hover:scale-105 active:scale-95">Book Service</button>
          </Reveal>
        </div>
      </section>

      {/* â"€â"€ Final CTA â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€ */}
      <section className="border-t border-slate-200 bg-slate-900 px-6 py-24 text-center text-white lg:px-16">
        <Reveal className="mx-auto max-w-4xl">
          <div className="text-sm font-black uppercase tracking-[0.3em] text-cyan-400">Ready To Schedule?</div>
          <h2 className="mt-4 text-4xl font-black leading-tight md:text-6xl">Book Fitness Equipment Repair With 2EZ TEK</h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/60">Whether you need treadmill repair, home gym assembly, commercial maintenance, or diagnostics for a machine that stopped working, 2EZ TEK is ready to help.</p>
          <motion.div variants={staggerContainer(0.12, 0.2)} initial="hidden" whileInView="show" viewport={{ once: true }} className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <motion.div variants={staggerItem} className="inline-flex">
              <button onClick={openBooking} className="button-glow rounded-2xl bg-cyan-400 px-8 py-5 text-sm font-black uppercase tracking-[0.15em] text-black transition hover:scale-105 active:scale-95">Book Service</button>
            </motion.div>
            <motion.div variants={staggerItem} className="inline-flex">
              <a href={'tel:' + PHONE_TEL} className="rounded-2xl border border-white/10 bg-white/5 px-8 py-5 text-sm font-black uppercase tracking-[0.15em] text-white transition hover:border-cyan-400/30 hover:bg-cyan-400/10">Call {PHONE_DISPLAY}</a>
            </motion.div>
          </motion.div>
        </Reveal>
      </section>

    </main>
  )
}
