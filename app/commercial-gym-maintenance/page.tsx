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
    <main className="relative min-h-screen overflow-hidden bg-white text-slate-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaGraph) }}
      />

      {/* ── Hero — video background stays dark ──────────────────────────── */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        <video autoPlay muted loop playsInline className="h-full w-full object-cover">
          <source src="/videos/Lyle-Gym-Video.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.50)_0%,rgba(0,0,0,0.15)_50%,transparent_100%)]" />
      </div>

      <section className="relative z-10 flex min-h-screen items-center px-6 py-24 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-4xl">
            <div className="inline-flex rounded-full border border-cyan-200 bg-cyan-50 px-5 py-2 text-xs font-black uppercase tracking-[0.25em] text-cyan-600">
              Commercial & Residential Gym Maintenance — Dallas Fort Worth
            </div>

            <h1 data-speakable className="mt-8 text-5xl font-black leading-[0.92] tracking-tight text-white md:text-7xl">
              Commercial & Residential
              <span className="block text-cyan-400">Gym Maintenance & Repair</span>
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
              <BookServiceButton label="Book Service" className="rounded-2xl border border-slate-200 bg-white px-8 py-5 text-center text-sm font-black uppercase tracking-[0.14em] text-slate-700 shadow-sm transition hover:border-cyan-300 hover:bg-cyan-50" />
            </div>

            <div className="mt-20 grid gap-4 md:grid-cols-4">
              {stats.map(([stat, label]) => (
                <div key={label} className="rounded-[2rem] border border-white/10 bg-black/25 p-6">
                  <div className="text-5xl font-black text-cyan-400">{stat}</div>
                  <div className="mt-3 text-sm font-semibold uppercase tracking-[0.12em] text-white/70">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Residential Callout ──────────────────────────────────────── */}
      <section className="relative z-10 bg-slate-50 px-6 py-20 lg:px-16">
        <div className="mx-auto max-w-7xl rounded-[2.5rem] border border-cyan-200 bg-cyan-50 p-10 md:p-14">
          <div className="grid gap-10 lg:grid-cols-[1fr,1fr] lg:items-center">
            <div>
              <div className="text-xs font-black uppercase tracking-[0.3em] text-cyan-600">Homeowners Welcome</div>
              <h2 className="mt-4 text-3xl font-black leading-tight md:text-4xl">
                We Also Specialize In
                <span className="block text-cyan-600">Residential Home Gym Repair.</span>
              </h2>
              <p className="mt-5 text-lg leading-relaxed text-slate-600">
                Most maintenance companies only take commercial accounts — hotels, gyms, apartments.
                If you're a homeowner with a broken treadmill, elliptical, or exercise bike,
                most of them won't return your call.
              </p>
              <p className="mt-4 text-base leading-relaxed text-slate-500">
                2EZ TEK was built to serve residential clients. We come directly to your home,
                fix it onsite, and leave. No haul-away, no waiting weeks for a callback.
                Same-day and next-day appointments available across all of DFW.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/gym-equipment-repair-dallas" className="rounded-2xl bg-cyan-400 px-6 py-3 text-sm font-black uppercase tracking-[0.12em] text-black transition hover:bg-cyan-300">
                  Home Gym Repair Services
                </Link>
                <Link href="/services/treadmill-repair-dallas" className="rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-black uppercase tracking-[0.12em] text-slate-700 shadow-sm transition hover:border-cyan-300 hover:bg-cyan-50">
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
                <div key={item.label} className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="mt-0.5 h-2 w-2 flex-shrink-0 rounded-full bg-cyan-400" />
                  <div>
                    <div className="font-black text-slate-900 text-sm">{item.label}</div>
                    <p className="mt-1 text-xs leading-relaxed text-slate-500">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Commercial Programs ──────────────────────────────────────── */}
      <section className="relative z-10 bg-white px-6 py-24 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="text-sm font-black uppercase tracking-[0.28em] text-cyan-600">Commercial Programs</div>
              <h2 className="mt-4 text-4xl font-black md:text-6xl">
                Services Designed
                <span className="block text-slate-500">For Commercial Facilities</span>
              </h2>
            </div>
            <a
              href="tel:9728077232"
              className="rounded-2xl border border-cyan-200 bg-cyan-50 px-7 py-4 text-sm font-black uppercase tracking-[0.12em] text-cyan-600 transition hover:bg-cyan-100"
            >
              Speak With A Technician
            </a>
          </div>

          <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {commercialPrograms.map((program) => (
              <div
                key={program.title}
                className="group relative overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white p-8 shadow-sm transition duration-500 hover:-translate-y-2 hover:border-cyan-300 hover:shadow-md"
              >
                <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(34,211,238,0.06),transparent_65%)] opacity-80 transition duration-500 group-hover:opacity-100" />
                <div className="relative">
                  <div className="text-3xl font-black text-cyan-600">✓</div>
                  <h3 className="mt-6 text-2xl font-black leading-tight text-slate-900">{program.title}</h3>
                  <p className="mt-4 text-sm leading-7 text-slate-600">{program.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Who We Serve ─────────────────────────────────────────────── */}
      <section className="relative z-10 bg-slate-50 px-6 py-24 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-14">
            <div className="text-sm font-black uppercase tracking-[0.28em] text-cyan-600">Who We Serve</div>
            <h2 className="mt-4 text-4xl font-black md:text-5xl">
              Commercial Facilities
              <span className="block text-slate-500">Across Dallas Fort Worth</span>
            </h2>
          </div>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {commercialClients.map((client) => (
              <div key={client.label} className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-cyan-400 text-lg font-black text-black">✓</div>
                <div>
                  <div className="font-black text-slate-900">{client.label}</div>
                  <p className="mt-2 text-sm leading-relaxed text-slate-500">{client.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────── */}
      <section className="relative z-10 bg-white px-6 py-24 lg:px-16">
        <div className="mx-auto max-w-4xl">
          <div className="text-sm font-black uppercase tracking-[0.28em] text-cyan-600">Common Questions</div>
          <h2 className="mt-4 text-4xl font-black md:text-5xl">
            Gym Maintenance FAQ
            <span className="block text-slate-500">Commercial & Residential</span>
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
                className="group rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm open:border-cyan-200 open:bg-cyan-50"
              >
                <summary className="cursor-pointer list-none font-black text-slate-900 group-open:text-cyan-600">
                  {faq.q}
                </summary>
                <p className="mt-4 text-sm leading-relaxed text-slate-600">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA — dark for contrast ────────────────────────────── */}
      <section className="relative z-10 bg-slate-900 px-6 pb-28 lg:px-16">
        <div className="mx-auto max-w-7xl rounded-[3rem] border border-white/10 bg-white/5 p-10 md:p-16">
          <div className="grid gap-10 lg:grid-cols-[1fr,360px] lg:items-center">
            <div>
              <div className="text-sm font-black uppercase tracking-[0.28em] text-cyan-400">
                Ready To Schedule?
              </div>
              <h2 className="mt-5 max-w-4xl text-4xl font-black leading-tight text-white md:text-5xl">
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
              <BookServiceButton label="Request Appointment" className="rounded-2xl border border-white/20 bg-white/10 px-8 py-5 text-center text-sm font-black uppercase tracking-[0.14em] text-white transition hover:border-white/40" />
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
