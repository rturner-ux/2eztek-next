import type { Metadata } from 'next'
import Link from 'next/link'
import BookServiceButton from '@/components/BookServiceButton'

const PAGE_URL = 'https://www.2eztek.com/gym-equipment-repair-dallas'

export const metadata: Metadata = {
  title: 'Gym Equipment Repair Dallas Fort Worth | 2EZ TEK — Onsite Repair',
  description:
    'Expert gym equipment repair in Dallas Fort Worth. Treadmills, ellipticals, bikes, cable machines, and commercial equipment repaired onsite — $100–$400. Call 2EZ TEK at (972) 807-7232.',
  alternates: {
    canonical: PAGE_URL,
  },
  openGraph: {
    title: 'Gym Equipment Repair Dallas Fort Worth | 2EZ TEK',
    description:
      'Onsite gym equipment repair across Dallas Fort Worth. Treadmills, ellipticals, bikes, strength machines, and commercial equipment. 500+ five-star reviews.',
    url: PAGE_URL,
    siteName: '2EZ TEK',
    type: 'website',
  },
}

const services = [
  {
    label: 'Treadmill Repair',
    href: '/services/treadmill-repair-dallas',
    description:
      'Belt slipping, motor failures, incline not working, console errors — we diagnose and fix all treadmill issues onsite. Belt replacement and lubrication from $100.',
  },
  {
    label: 'Elliptical Repair',
    href: '/services/elliptical-repair-dallas',
    description:
      'Squeaking, resistance stuck, flywheel grinding, stride issues. We service all elliptical brands and types — residential and commercial — at your location.',
  },
  {
    label: 'Exercise Bike Repair',
    href: '/services/exercise-bike-repair-dallas',
    description:
      'Upright, recumbent, spin, and Peloton-style bikes. Resistance motors, drive belts, flywheel service, and console repair in a single onsite visit.',
  },
  {
    label: 'Cable Machine Repair',
    href: '/services/cable-machine-repair-dallas',
    description:
      'Frayed cables, pulley failures, weight stack issues, and tension imbalance on functional trainers, dual cable crosses, and lat pulldowns. Full cable replacement $150–$250.',
  },
  {
    label: 'Strength Equipment Repair',
    href: '/services/strength-equipment-repair-dallas',
    description:
      'Selectorized machines, cable crossovers, Smith machines, and plate-loaded equipment. Cables, pulleys, upholstery, and selector pin repairs for home and commercial gyms.',
  },
  {
    label: 'Commercial Gym Maintenance',
    href: '/commercial-gym-maintenance',
    description:
      'Scheduled maintenance contracts for apartment fitness centers, hotel gyms, and health clubs across DFW. Priority response, SmartGymOps tracking, and QR reporting for managers.',
  },
]

const stats = [
  ['10K+', 'Machines Serviced'],
  ['500+', '5-Star Reviews'],
  ['Same Day', 'Service Available'],
  ['All DFW', 'Coverage Area'],
]

const faqs = [
  {
    question: 'How much does gym equipment repair cost in Dallas?',
    answer:
      'Gym equipment repair in Dallas typically costs $100 to $400 depending on the equipment and issue. Treadmill belt service runs $100 to $175. Motor and controller board repairs are $200 to $400. Elliptical and bike repairs are $75 to $300. Cable machine cable replacement is $150 to $250. 2EZ TEK provides a diagnostic quote before any work begins.',
  },
  {
    question: 'Do you come to my home, or do I bring the equipment to you?',
    answer:
      '2EZ TEK is fully mobile. We come directly to your home, apartment, hotel, or commercial gym anywhere in Dallas Fort Worth — no haul-away, no drop-off. A technician arrives at your location and repairs the equipment onsite.',
  },
  {
    question: 'What gym equipment brands do you repair in Dallas?',
    answer:
      'We service NordicTrack, ProForm, Bowflex, Peloton, Life Fitness, Precor, Matrix, Technogym, TRUE Fitness, Cybex, Schwinn, Nautilus, Sole, Horizon, StairMaster, Woodway, Hammer Strength, and most other major brands. If you don\'t see yours listed, call — we likely service it.',
  },
  {
    question: 'How quickly can you repair my gym equipment in Dallas?',
    answer:
      '2EZ TEK offers same-day and next-day appointments across Dallas Fort Worth. Most repairs are completed in a single visit of 1 to 2 hours. Technicians carry common replacement parts on every truck so belt replacements, lubrication, bearing swaps, and many console repairs are resolved the same day.',
  },
  {
    question: 'Is it worth repairing gym equipment or should I just replace it?',
    answer:
      'In most cases repair is the smarter choice. If the repair cost is under 50% of the equipment\'s replacement value, repairing almost always wins. 2EZ TEK provides an honest diagnostic assessment — we\'ll tell you if replacement makes more sense before any work begins.',
  },
  {
    question: 'Do you repair commercial gym equipment for apartments and hotels?',
    answer:
      '2EZ TEK is a preferred vendor for commercial fitness equipment repair and maintenance across Dallas Fort Worth. We serve apartment fitness centers, hotel gyms, corporate wellness rooms, training studios, and health clubs. Commercial maintenance contracts are available for facilities that need scheduled service.',
  },
]

const schemaGraph = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Service',
      name: 'Gym Equipment Repair Dallas Fort Worth',
      provider: {
        '@type': 'LocalBusiness',
        '@id': 'https://www.2eztek.com/#localbusiness',
      },
      areaServed: { '@type': 'Place', name: 'Dallas Fort Worth, TX' },
      description:
        'Professional onsite gym equipment repair and maintenance in Dallas Fort Worth. Treadmills, ellipticals, exercise bikes, cable machines, strength equipment, and commercial fitness facility service by 2EZ TEK.',
      url: PAGE_URL,
      serviceType: [
        'Treadmill Repair',
        'Elliptical Repair',
        'Exercise Bike Repair',
        'Cable Machine Repair',
        'Strength Equipment Repair',
        'Commercial Gym Maintenance',
      ],
      telephone: '+19728077232',
      priceRange: '$100 – $400',
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.2eztek.com' },
        { '@type': 'ListItem', position: 2, name: 'Gym Equipment Repair Dallas', item: PAGE_URL },
      ],
    },
    {
      '@type': 'FAQPage',
      mainEntity: faqs.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: { '@type': 'Answer', text: faq.answer },
      })),
    },
  ],
}

export default function GymEquipmentRepairPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050B14] text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaGraph) }}
      />

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        <video autoPlay muted loop playsInline className="h-full w-full object-cover opacity-[0.72]">
          <source src="/videos/gym-video.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/12" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,11,20,0.70)_0%,rgba(5,11,20,0.34)_42%,rgba(5,11,20,0.12)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.16),transparent_34%)]" />
      </div>

      <section className="relative z-10 flex min-h-screen items-center px-6 py-24 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-4xl">
            <div className="inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-5 py-2 text-xs font-black uppercase tracking-[0.25em] text-cyan-300 backdrop-blur-xl">
              Dallas Fort Worth Fitness Equipment Repair
            </div>

            <h1
              data-speakable
              className="mt-8 text-5xl font-black leading-[0.92] tracking-tight md:text-7xl"
            >
              Professional
              <span className="block text-cyan-300">Gym Equipment Repair</span>
              <span className="block text-white/50">In Dallas Fort Worth</span>
            </h1>

            <p data-speakable className="mt-8 max-w-2xl text-lg leading-8 text-white/88 md:text-xl">
              Onsite repair for treadmills, ellipticals, exercise bikes, cable machines,
              and commercial fitness equipment across all of DFW. No haul-away — we come to you.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <a
                href="tel:9728077232"
                className="group rounded-2xl bg-cyan-400 px-8 py-5 text-center shadow-[0_0_45px_rgba(34,211,238,0.35)] transition hover:scale-[1.02] hover:bg-cyan-300"
              >
                <div className="text-xs font-black uppercase tracking-[0.28em] text-black/70">Call Now</div>
                <div className="mt-1 text-2xl font-black text-black md:text-3xl">(972) 807-7232</div>
              </a>
              <BookServiceButton className="rounded-2xl border border-white/15 bg-white/10 px-8 py-5 text-center text-sm font-black uppercase tracking-[0.14em] text-white backdrop-blur-xl transition hover:bg-white/15" />
            </div>

            <div className="mt-20 grid gap-4 md:grid-cols-4">
              {stats.map(([stat, label]) => (
                <div
                  key={label}
                  className="rounded-[2rem] border border-white/10 bg-black/18 p-6 shadow-[0_20px_80px_rgba(0,0,0,0.28)] backdrop-blur-xl"
                >
                  <div className="text-5xl font-black text-cyan-300">{stat}</div>
                  <div className="mt-3 text-sm font-semibold uppercase tracking-[0.12em] text-white/70">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Services ─────────────────────────────────────────────────── */}
      <section className="relative z-10 bg-[#050B14] px-6 py-24 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="text-sm font-black uppercase tracking-[0.28em] text-cyan-300">Repair Services</div>
              <h2 className="mt-4 text-4xl font-black md:text-6xl">
                Equipment We
                <span className="block text-white/60">Service Daily</span>
              </h2>
            </div>
            <a
              href="tel:9728077232"
              className="rounded-2xl border border-cyan-300/30 bg-cyan-300/10 px-7 py-4 text-sm font-black uppercase tracking-[0.12em] text-cyan-200 backdrop-blur-xl transition hover:bg-cyan-300/20"
            >
              Call Technician
            </a>
          </div>

          <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <Link
                key={service.label}
                href={service.href}
                className="group relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-black/18 p-8 shadow-[0_25px_90px_rgba(0,0,0,0.30)] backdrop-blur-2xl transition duration-500 hover:-translate-y-2 hover:border-cyan-300/30"
              >
                <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(34,211,238,0.12),transparent_65%)] opacity-80 transition duration-500 group-hover:opacity-100" />
                <div className="relative">
                  <div className="text-3xl font-black text-cyan-300">✓</div>
                  <h3 className="mt-6 text-2xl font-black leading-tight">{service.label}</h3>
                  <p className="mt-4 text-sm leading-7 text-white/70">{service.description}</p>
                  <div className="mt-6 text-xs font-black uppercase tracking-[0.18em] text-cyan-400">
                    Learn more →
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────── */}
      <section className="relative z-10 bg-[#07101D] px-6 py-24 lg:px-16">
        <div className="mx-auto max-w-4xl">
          <div className="text-sm font-black uppercase tracking-[0.28em] text-cyan-300">Common Questions</div>
          <h2 className="mt-4 text-4xl font-black md:text-5xl">
            Gym Equipment Repair
            <span className="block text-white/60">FAQ — Dallas Fort Worth</span>
          </h2>

          <div className="mt-12 space-y-3">
            {faqs.map((faq) => (
              <details
                key={faq.question}
                className="group rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-5 open:border-cyan-400/20 open:bg-cyan-400/[0.03]"
              >
                <summary className="cursor-pointer list-none font-black text-white group-open:text-cyan-300">
                  {faq.question}
                </summary>
                <p className="mt-4 text-sm leading-relaxed text-white/65">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────────────────────── */}
      <section className="relative z-10 bg-[#050B14] px-6 pb-28 lg:px-16">
        <div className="mx-auto max-w-7xl rounded-[3rem] border border-cyan-400/20 bg-black/18 p-10 shadow-[0_30px_120px_rgba(0,0,0,0.38)] backdrop-blur-2xl md:p-16">
          <div className="grid gap-10 lg:grid-cols-[1fr,360px] lg:items-center">
            <div>
              <div className="text-sm font-black uppercase tracking-[0.28em] text-cyan-300">
                Need Immediate Service?
              </div>
              <h2 className="mt-5 max-w-4xl text-4xl font-black leading-tight md:text-6xl">
                Speak Directly
                <span className="block text-white/60">With A Technician.</span>
              </h2>
              <p className="mt-7 max-w-2xl text-lg leading-8 text-white/80">
                Same-day and next-day appointments available across Dallas, Fort Worth, Plano,
                Frisco, McKinney, Arlington, Irving, and all surrounding DFW communities.
              </p>
            </div>
            <div className="flex flex-col gap-4">
              <a
                href="tel:9728077232"
                className="rounded-2xl bg-cyan-400 px-8 py-6 text-center shadow-[0_0_45px_rgba(34,211,238,0.35)] transition hover:scale-[1.02] hover:bg-cyan-300"
              >
                <div className="text-xs font-black uppercase tracking-[0.28em] text-black/70">Call 2EZ TEK</div>
                <div className="mt-2 text-3xl font-black text-black">(972) 807-7232</div>
              </a>
              <BookServiceButton
                label="Request Appointment"
                className="rounded-2xl border border-white/15 bg-white/10 px-8 py-5 text-center text-sm font-black uppercase tracking-[0.14em] text-white backdrop-blur-xl transition hover:bg-white/15"
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
