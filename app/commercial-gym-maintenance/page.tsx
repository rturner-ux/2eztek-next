import type { Metadata } from 'next'
import Link from 'next/link'
import BookServiceButton from '@/components/BookServiceButton'

const PAGE_URL = 'https://www.2eztek.com/commercial-gym-maintenance'

export const metadata: Metadata = {
  title: 'Commercial & Residential Gym Maintenance Dallas Fort Worth | 2EZ TEK',
  description:
    'Gym equipment maintenance and repair for commercial facilities and home gyms across Dallas Fort Worth. Hotels, apartments, health clubs, and homeowners — 2EZ TEK serves both. Call (972) 807-7232.',
  alternates: {
    canonical: PAGE_URL,
  },
  openGraph: {
    title: 'Commercial & Residential Gym Maintenance Dallas Fort Worth | 2EZ TEK',
    description:
      'Fitness equipment maintenance and repair for commercial facilities and residential home gyms across Dallas Fort Worth. 500+ five-star reviews.',
    url: PAGE_URL,
    siteName: '2EZ TEK',
    type: 'website',
  },
}

const commercialPrograms = [
  {
    title: 'Preventative Maintenance Plans',
    description: 'Scheduled quarterly and annual visits with belt lubrication, tension checks, drive system inspections, and full safety assessments. Documented service history per machine.',
  },
  {
    title: 'Emergency Repair Services',
    description: 'Priority same-day and next-day response for commercial clients. Minimize member complaints and downtime with fast technician dispatch across all of DFW.',
  },
  {
    title: 'Quarterly Equipment Inspections',
    description: 'Comprehensive inspections covering all cardio and strength equipment. Each inspection is logged in SmartGymOps with a QR-accessible report for facility managers.',
  },
  {
    title: 'Cardio Equipment Servicing',
    description: 'Full service for treadmills, ellipticals, exercise bikes, StairMasters, and rowers. Belt replacements, motor checks, console repairs, and lubrication.',
  },
  {
    title: 'Strength Equipment Maintenance',
    description: 'Cable replacement, pulley and bearing service, upholstery replacement, weight stack inspections, and structural safety checks on selectorized and plate-loaded equipment.',
  },
  {
    title: 'Multi-Location Support',
    description: 'Coordinated service programs for property management companies, hotel groups, and fitness chains with multiple locations across Dallas Fort Worth.',
  },
]

const commercialClients = [
  { label: 'Apartment Fitness Centers', desc: 'Residents expect working equipment. We keep it that way with scheduled maintenance and fast repair response.' },
  { label: 'Hotels & Resorts', desc: 'Guest satisfaction depends on a functional fitness room. We provide maintenance contracts and priority repair for hospitality properties.' },
  { label: 'Health Clubs & Gyms', desc: 'High-traffic commercial equipment breaks down faster. Our maintenance programs are built to handle volume and keep machines safe.' },
  { label: 'Corporate Fitness Rooms', desc: 'Keep your employee wellness program running. We service and maintain corporate gym equipment on your schedule.' },
  { label: 'Training Studios', desc: 'Boutique studios and personal training facilities count on reliable equipment. We offer flexible service programs for smaller footprints.' },
  { label: 'Schools & Universities', desc: 'Athletic facilities and student recreation centers serviced on academic calendars with priority scheduling during off-peak hours.' },
]

const stats = [
  ['24/7', 'Support'],
  ['10K+', 'Machines Serviced'],
  ['500+', '5-Star Reviews'],
  ['All DFW', 'Coverage Area'],
]

const schemaGraph = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Service',
      name: 'Commercial & Residential Gym Maintenance Dallas Fort Worth',
      provider: {
        '@type': 'LocalBusiness',
        '@id': 'https://www.2eztek.com/#localbusiness',
      },
      areaServed: { '@type': 'Place', name: 'Dallas Fort Worth, TX' },
      description:
        'Fitness equipment maintenance and repair for commercial facilities and residential home gyms across Dallas Fort Worth. Hotels, apartments, health clubs, and homeowners served by 2EZ TEK.',
      url: PAGE_URL,
      telephone: '+19728077232',
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.2eztek.com' },
        { '@type': 'ListItem', position: 2, name: 'Commercial & Residential Gym Maintenance', item: PAGE_URL },
      ],
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Do you service home gym equipment as well as commercial facilities?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. 2EZ TEK serves both residential and commercial clients. We come to your home to repair treadmills, ellipticals, exercise bikes, and other home gym equipment — no haul-away required. We also provide scheduled maintenance programs for commercial facilities across Dallas Fort Worth.',
          },
        },
        {
          '@type': 'Question',
          name: 'What commercial facilities do you service in Dallas Fort Worth?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'We service apartment fitness centers, hotels, health clubs, corporate wellness rooms, training studios, and schools across Dallas Fort Worth. Commercial maintenance contracts include scheduled visits, priority emergency response, and SmartGymOps tracking with QR reports for facility managers.',
          },
        },
        {
          '@type': 'Question',
          name: 'How much does a commercial gym maintenance contract cost?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Commercial maintenance contracts are priced based on machine count, facility type, and visit frequency. Residential maintenance visits run $75 to $150 per machine. Contact 2EZ TEK at (972) 807-7232 for a custom commercial quote.',
          },
        },
        {
          '@type': 'Question',
          name: 'Do you offer emergency repair for commercial gyms?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. 2EZ TEK offers priority same-day and next-day emergency repair for commercial clients across Dallas Fort Worth. Contract clients receive priority scheduling to minimize member downtime.',
          },
        },
      ],
    },
  ],
}

export default function CommercialGymMaintenancePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050B14] text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaGraph) }}
      />

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        <video autoPlay muted loop playsInline className="h-full w-full object-cover opacity-[0.72]">
          <source src="/videos/Lyle-Gym-Video.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/12" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,11,20,0.70)_0%,rgba(5,11,20,0.34)_42%,rgba(5,11,20,0.12)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.16),transparent_34%)]" />
      </div>

      <section className="relative z-10 flex min-h-screen items-center px-6 py-24 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-4xl">
            <div className="inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-5 py-2 text-xs font-black uppercase tracking-[0.25em] text-cyan-300 backdrop-blur-xl">
              Commercial & Residential Gym Maintenance — Dallas Fort Worth
            </div>

            <h1 data-speakable className="mt-8 text-5xl font-black leading-[0.92] tracking-tight md:text-7xl">
              Commercial & Residential
              <span className="block text-cyan-300">Gym Maintenance & Repair</span>
              <span className="block text-white/50 text-4xl md:text-5xl mt-2">In Dallas Fort Worth</span>
            </h1>

            <p data-speakable className="mt-8 max-w-2xl text-lg leading-8 text-white/88 md:text-xl">
              Whether you manage a hotel fitness room, an apartment gym, or you're
              a homeowner with a treadmill that needs attention — 2EZ TEK comes to you.
              We specialize in both commercial facility maintenance and residential home gym repair.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <a
                href="tel:9728077232"
                className="rounded-2xl bg-cyan-400 px-8 py-5 text-center shadow-[0_0_45px_rgba(34,211,238,0.35)] transition hover:scale-[1.02] hover:bg-cyan-300"
              >
                <div className="text-xs font-black uppercase tracking-[0.28em] text-black/70">Schedule Service</div>
                <div className="mt-1 text-2xl font-black text-black md:text-3xl">(972) 807-7232</div>
              </a>
              <BookServiceButton label="Book Service" className="rounded-2xl border border-white/15 bg-white/10 px-8 py-5 text-center text-sm font-black uppercase tracking-[0.14em] text-white backdrop-blur-xl transition hover:bg-white/15" />
            </div>

            <div className="mt-20 grid gap-4 md:grid-cols-4">
              {stats.map(([stat, label]) => (
                <div key={label} className="rounded-[2rem] border border-white/10 bg-black/18 p-6 shadow-[0_20px_80px_rgba(0,0,0,0.28)] backdrop-blur-xl">
                  <div className="text-5xl font-black text-cyan-300">{stat}</div>
                  <div className="mt-3 text-sm font-semibold uppercase tracking-[0.12em] text-white/70">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Residential Callout ──────────────────────────────────────── */}
      <section className="relative z-10 bg-[#07101D] px-6 py-20 lg:px-16">
        <div className="mx-auto max-w-7xl rounded-[2.5rem] border border-cyan-400/25 bg-cyan-400/[0.04] p-10 md:p-14">
          <div className="grid gap-10 lg:grid-cols-[1fr,1fr] lg:items-center">
            <div>
              <div className="text-xs font-black uppercase tracking-[0.3em] text-cyan-400">Homeowners Welcome</div>
              <h2 className="mt-4 text-3xl font-black leading-tight md:text-4xl">
                We Also Specialize In
                <span className="block text-cyan-300">Residential Home Gym Repair.</span>
              </h2>
              <p className="mt-5 text-lg leading-relaxed text-white/70">
                Most maintenance companies only take commercial accounts — hotels, gyms, apartments.
                If you're a homeowner with a broken treadmill, elliptical, or exercise bike,
                most of them won't return your call.
              </p>
              <p className="mt-4 text-base leading-relaxed text-white/55">
                2EZ TEK was built to serve residential clients. We come directly to your home,
                fix it onsite, and leave. No haul-away, no waiting weeks for a callback.
                Same-day and next-day appointments available across all of DFW.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/gym-equipment-repair-dallas" className="rounded-2xl bg-cyan-400 px-6 py-3 text-sm font-black uppercase tracking-[0.12em] text-black transition hover:bg-cyan-300">
                  Home Gym Repair Services
                </Link>
                <Link href="/services/treadmill-repair-dallas" className="rounded-2xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-black uppercase tracking-[0.12em] text-white transition hover:border-cyan-400/30 hover:bg-cyan-400/10">
                  Treadmill Repair
                </Link>
              </div>
            </div>
            <div className="grid gap-3">
              {[
                { label: 'Treadmills & Ellipticals', desc: 'Belt replacement, motor repair, incline failures, console issues — repaired in your home.' },
                { label: 'Exercise Bikes', desc: 'Upright, recumbent, spin bikes, and Peloton. Resistance, flywheel, and console service.' },
                { label: 'Home Gym Assembly', desc: 'Full home gym setup, equipment placement, calibration, and white-glove installation.' },
                { label: 'Strength Equipment', desc: 'Cable machines, functional trainers, selectorized machines, and plate-loaded racks.' },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <div className="mt-0.5 h-2 w-2 flex-shrink-0 rounded-full bg-cyan-400" />
                  <div>
                    <div className="font-black text-white text-sm">{item.label}</div>
                    <p className="mt-1 text-xs leading-relaxed text-white/55">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Commercial Programs ──────────────────────────────────────── */}
      <section className="relative z-10 bg-[#050B14] px-6 py-24 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="text-sm font-black uppercase tracking-[0.28em] text-cyan-300">Commercial Programs</div>
              <h2 className="mt-4 text-4xl font-black md:text-6xl">
                Services Designed
                <span className="block text-white/60">For Commercial Facilities</span>
              </h2>
            </div>
            <a
              href="tel:9728077232"
              className="rounded-2xl border border-cyan-300/30 bg-cyan-300/10 px-7 py-4 text-sm font-black uppercase tracking-[0.12em] text-cyan-200 backdrop-blur-xl transition hover:bg-cyan-300/20"
            >
              Speak With A Technician
            </a>
          </div>

          <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {commercialPrograms.map((program) => (
              <div
                key={program.title}
                className="group relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-black/18 p-8 shadow-[0_25px_90px_rgba(0,0,0,0.30)] backdrop-blur-2xl transition duration-500 hover:-translate-y-2 hover:border-cyan-300/30"
              >
                <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(34,211,238,0.12),transparent_65%)] opacity-80 transition duration-500 group-hover:opacity-100" />
                <div className="relative">
                  <div className="text-3xl font-black text-cyan-300">✓</div>
                  <h3 className="mt-6 text-2xl font-black leading-tight">{program.title}</h3>
                  <p className="mt-4 text-sm leading-7 text-white/70">{program.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Who We Serve ─────────────────────────────────────────────── */}
      <section className="relative z-10 bg-[#07101D] px-6 py-24 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-14">
            <div className="text-sm font-black uppercase tracking-[0.28em] text-cyan-300">Who We Serve</div>
            <h2 className="mt-4 text-4xl font-black md:text-5xl">
              Commercial Facilities
              <span className="block text-white/60">Across Dallas Fort Worth</span>
            </h2>
          </div>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {commercialClients.map((client) => (
              <div key={client.label} className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-6">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-cyan-300 text-lg font-black text-black">✓</div>
                <div>
                  <div className="font-black text-white">{client.label}</div>
                  <p className="mt-2 text-sm leading-relaxed text-white/60">{client.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────── */}
      <section className="relative z-10 bg-[#050B14] px-6 py-24 lg:px-16">
        <div className="mx-auto max-w-4xl">
          <div className="text-sm font-black uppercase tracking-[0.28em] text-cyan-300">Common Questions</div>
          <h2 className="mt-4 text-4xl font-black md:text-5xl">
            Gym Maintenance FAQ
            <span className="block text-white/60">Commercial & Residential</span>
          </h2>
          <div className="mt-12 space-y-3">
            {[
              {
                q: 'Do you service home gym equipment as well as commercial facilities?',
                a: 'Yes. 2EZ TEK serves both residential and commercial clients. We come to your home to repair treadmills, ellipticals, exercise bikes, and other home gym equipment — no haul-away required. We also provide scheduled maintenance programs for commercial facilities across Dallas Fort Worth.',
              },
              {
                q: 'What commercial facilities do you service?',
                a: 'We service apartment fitness centers, hotels, health clubs, corporate wellness rooms, training studios, and schools across Dallas Fort Worth. Commercial maintenance contracts include scheduled visits, priority emergency response, and SmartGymOps tracking with QR reports for facility managers.',
              },
              {
                q: 'How much does a commercial gym maintenance contract cost?',
                a: 'Commercial maintenance contracts are priced based on machine count, facility type, and visit frequency. Residential maintenance visits run $75 to $150 per machine. Contact 2EZ TEK at (972) 807-7232 for a custom commercial quote.',
              },
              {
                q: 'Do you offer emergency repair for commercial gyms?',
                a: 'Yes. 2EZ TEK offers priority same-day and next-day emergency repair for commercial clients across Dallas Fort Worth. Contract clients receive priority scheduling to minimize member downtime.',
              },
            ].map((faq) => (
              <details
                key={faq.q}
                className="group rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-5 open:border-cyan-400/20 open:bg-cyan-400/[0.03]"
              >
                <summary className="cursor-pointer list-none font-black text-white group-open:text-cyan-300">
                  {faq.q}
                </summary>
                <p className="mt-4 text-sm leading-relaxed text-white/65">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────────────────────── */}
      <section className="relative z-10 bg-[#07101D] px-6 pb-28 lg:px-16">
        <div className="mx-auto max-w-7xl rounded-[3rem] border border-cyan-400/20 bg-black/18 p-10 shadow-[0_30px_120px_rgba(0,0,0,0.38)] backdrop-blur-2xl md:p-16">
          <div className="grid gap-10 lg:grid-cols-[1fr,360px] lg:items-center">
            <div>
              <div className="text-sm font-black uppercase tracking-[0.28em] text-cyan-300">
                Ready To Schedule?
              </div>
              <h2 className="mt-5 max-w-4xl text-4xl font-black leading-tight md:text-5xl">
                Commercial Facility or Home Gym —
                <span className="block text-white/60">We Come To You.</span>
              </h2>
              <p className="mt-7 max-w-2xl text-lg leading-8 text-white/80">
                2EZ TEK provides maintenance, repair, and assembly for commercial fitness facilities
                and residential homeowners across Dallas, Fort Worth, Plano, Frisco, McKinney,
                Arlington, Irving, and all surrounding DFW communities.
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
              <BookServiceButton label="Request Appointment" className="rounded-2xl border border-white/15 bg-white/10 px-8 py-5 text-center text-sm font-black uppercase tracking-[0.14em] text-white backdrop-blur-xl transition hover:bg-white/15" />
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
