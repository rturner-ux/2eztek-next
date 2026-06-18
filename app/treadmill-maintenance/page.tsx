import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import BookServiceButton from '@/components/BookServiceButton'

export const metadata: Metadata = {
  title: 'Treadmill Maintenance Dallas Fort Worth | 2EZ TEK',
  description:
    'Professional treadmill maintenance in Dallas Fort Worth. Belt lubrication, deck inspection, motor service, console calibration, and full tune-ups by certified technicians. Call 2EZ TEK.',
  alternates: {
    canonical: 'https://www.2eztek.com/treadmill-maintenance',
  },
  openGraph: {
    title: 'Treadmill Maintenance Dallas Fort Worth | 2EZ TEK',
    description:
      'Professional treadmill maintenance in Dallas Fort Worth. Belt lubrication, deck inspection, motor service, and full tune-ups by 2EZ TEK.',
    url: 'https://www.2eztek.com/treadmill-maintenance',
    siteName: '2EZ TEK',
    type: 'website',
  },
}

const schema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Treadmill Maintenance',
  provider: {
    '@type': 'LocalBusiness',
    name: '2EZ TEK',
    telephone: '+19728077232',
    areaServed: 'Dallas Fort Worth',
    url: 'https://www.2eztek.com',
  },
  description:
    'Professional treadmill maintenance including belt lubrication, deck inspection, drive motor service, console calibration, and full preventive tune-ups across Dallas Fort Worth.',
  serviceType: 'Treadmill Maintenance',
  areaServed: {
    '@type': 'GeoCircle',
    geoMidpoint: { '@type': 'GeoCoordinates', latitude: 32.7767, longitude: -96.797 },
    geoRadius: '80000',
  },
}

const maintenanceItems = [
  {
    title: 'Belt Lubrication',
    desc: 'Treadmill belts require silicone lubrication every 150 hours of use or 3 months, whichever comes first. Running a dry belt generates excess heat that degrades the belt, the deck, and the drive motor — often causing all three to fail at once.',
  },
  {
    title: 'Belt & Deck Inspection',
    desc: 'We measure belt tension and alignment, inspect the walking deck for wear patterns, and check the belt underside for glazing or cracking. A worn deck creates friction spikes that burn through belts faster and put load spikes on the motor.',
  },
  {
    title: 'Drive Motor Service',
    desc: 'The drive motor is the most expensive component on a treadmill. During maintenance we clean motor brushes, inspect the drive belt, check roller bearings, and test amp draw under load — catching early signs of motor wear before it becomes a full replacement.',
  },
  {
    title: 'Console & Speed Calibration',
    desc: 'Console speed readouts and incline calibration drift over time. We verify accuracy, reset calibration where needed, and test all console functions. Inaccurate speed or incline can affect workout data and signal underlying control board issues.',
  },
  {
    title: 'Roller & Bearing Inspection',
    desc: 'Front and rear rollers carry the full load of every stride. We inspect roller diameter (smaller rollers generate more heat), check bearing condition, and look for flat spots that create vibration and belt tracking problems.',
  },
  {
    title: 'Frame & Safety System Check',
    desc: 'We inspect the frame for stress cracks, test the safety key and emergency stop, verify the incline motor and lift rods, and check all covers and hardware for proper installation. A treadmill that is not mechanically sound is a liability.',
  },
]

const whyItMatters = [
  { stat: '3x', label: 'Longer belt life with regular lubrication' },
  { stat: '80%', label: 'Of treadmill repairs are preventable' },
  { stat: '$400+', label: 'Average drive motor replacement cost' },
  { stat: '$25', label: 'Cost of a lubrication service vs. $400 repair' },
]

const brands = [
  'NordicTrack', 'ProForm', 'Life Fitness', 'Precor', 'Technogym',
  'Matrix', 'True Fitness', 'Sole', 'Horizon', 'Bowflex',
  'Schwinn', 'Star Trac', 'Cybex', 'Body-Solid', 'Nautilus',
]

const faqs = [
  {
    q: 'How often should a treadmill be serviced?',
    a: 'Residential treadmills should be lubricated every 3 months or 150 hours of use and receive a full inspection annually. Commercial treadmills running 6-10 hours per day should be lubricated monthly and fully inspected every 90 days.',
  },
  {
    q: 'What happens if I skip treadmill maintenance?',
    a: 'Running a dry belt creates friction heat that degrades the walking deck and overloads the drive motor. A motor replacement typically costs $300-$600 in parts and labor. A lubrication service costs a fraction of that. Most major mechanical failures are preceded by skipped maintenance.',
  },
  {
    q: 'How long does a treadmill maintenance visit take?',
    a: 'A standard residential maintenance visit takes 45-60 minutes. Commercial visits with more detailed documentation and multi-unit service take longer depending on the number of machines.',
  },
  {
    q: 'Do you service commercial treadmills?',
    a: 'Yes. We provide preventive maintenance programs for gyms, apartment fitness centers, hotels, corporate wellness facilities, and medical rehabilitation centers across Dallas Fort Worth. We can service multiple units per visit and provide SmartGymOps documentation for each machine.',
  },
  {
    q: 'Can you service my treadmill even if it is still working?',
    a: 'Yes — and this is actually the ideal time to service it. Preventive maintenance catches problems before they cause failures. By the time a treadmill shows symptoms, the damage has usually already occurred.',
  },
  {
    q: 'What brands of treadmills do you service?',
    a: 'We service all major residential and commercial brands including NordicTrack, ProForm, Life Fitness, Precor, Technogym, Matrix, True Fitness, Sole, Horizon, Bowflex, Cybex, Star Trac, and many more.',
  },
]

export default function TreadmillMaintenancePage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen overflow-hidden">
        <Image
          src="/images/gym-equipment-repair-dallas.webp"
          alt="Treadmill maintenance Dallas Fort Worth"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.62)_0%,rgba(0,0,0,0.25)_55%,transparent_100%)]" />

        <div className="relative z-10 flex min-h-screen flex-col justify-center px-6 pt-36 pb-16 lg:px-16 lg:pt-44">
          <div className="max-w-2xl">
            <div className="mb-5 flex items-center gap-3">
              <span className="h-px w-8 bg-cyan-400" />
              <span className="text-[10px] font-black uppercase tracking-[0.35em] text-cyan-300">
                Preventive Maintenance
              </span>
            </div>

            <h1 className="text-4xl font-black leading-tight text-white md:text-6xl lg:text-[3.5rem]">
              Treadmill Maintenance
              <span className="block text-cyan-400">Dallas Fort Worth</span>
            </h1>

            <p className="mt-6 max-w-lg text-base leading-relaxed text-white/80 md:text-lg">
              Professional treadmill tune-ups, belt lubrication, deck inspection, motor service, and full preventive maintenance programs for residential and commercial clients across DFW.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-10">
              {whyItMatters.map(({ stat, label }) => (
                <div key={label}>
                  <div className="text-2xl font-black text-white md:text-3xl">{stat}</div>
                  <div className="mt-1 text-[10px] font-black uppercase tracking-[0.2em] text-white/55">{label}</div>
                </div>
              ))}
            </div>

            <div className="mt-10 flex flex-wrap gap-4">
              <BookServiceButton
                label="Schedule Maintenance"
                className="bg-cyan-400 px-7 py-3 text-[11px] font-bold uppercase tracking-[0.15em] text-black transition-colors hover:bg-cyan-300"
              />
              <a
                href="tel:9728077232"
                className="border border-white/30 bg-white/10 px-7 py-3 text-[11px] font-bold uppercase tracking-[0.15em] text-white backdrop-blur-sm transition-colors hover:bg-white/20"
              >
                (972) 807-7232
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── What We Do ───────────────────────────────────────────────────── */}
      <section className="bg-[#0A0D14] px-6 py-24 text-white lg:px-16">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6">
            <span className="text-[10px] font-black uppercase tracking-[0.35em] text-cyan-400">
              What Is Included
            </span>
          </div>
          <h2 className="text-3xl font-black leading-tight text-white md:text-4xl">
            A COMPLETE TREADMILL MAINTENANCE
            <br />VISIT COVERS ALL OF THIS.
          </h2>
          <div className="mx-auto mt-8 h-px max-w-xs bg-white/10" />

          <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {maintenanceItems.map((item, i) => (
              <div key={item.title} className="border border-white/10 bg-white/[0.04] p-7">
                <div className="mb-4 flex items-center gap-3">
                  <span className="text-[10px] font-black uppercase tracking-[0.25em] text-cyan-400">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="h-px flex-1 bg-white/10" />
                </div>
                <h3 className="text-base font-black text-white">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-white/50">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why Maintenance Matters ───────────────────────────────────────── */}
      <section className="bg-white px-6 py-24 lg:px-16">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.35em] text-cyan-600">
                Why It Matters
              </span>
              <h2 className="mt-4 text-3xl font-black leading-tight text-slate-900 md:text-5xl">
                Most Treadmill Repairs
                <span className="block text-slate-400">Are Preventable.</span>
              </h2>
              <div className="mt-8 space-y-5 text-base leading-8 text-slate-600">
                <p>
                  A treadmill belt running without lubrication generates friction heat that damages the walking deck surface, overloads the drive motor, and accelerates bearing wear. The motor compensates by drawing more current, which shortens its service life. By the time the machine stops working, multiple components have been damaged simultaneously.
                </p>
                <p>
                  Drive motor replacement on a residential treadmill typically runs $300-$600 parts and labor. A walking deck replacement can run $150-$400. A lubrication and inspection visit costs far less than either — and extends the useful life of both.
                </p>
                <p>
                  Commercial treadmills running multiple hours per day need maintenance even more frequently. An out-of-service machine in a gym or apartment complex costs member satisfaction, generates complaints, and creates liability exposure that preventive maintenance eliminates.
                </p>
              </div>
              <div className="mt-8 flex flex-wrap gap-4">
                <BookServiceButton
                  label="Schedule Maintenance"
                  className="bg-cyan-400 px-7 py-3 text-[11px] font-black uppercase tracking-[0.15em] text-black transition hover:bg-cyan-300"
                />
                <Link
                  href="/commercial-gym-maintenance"
                  className="border border-slate-200 px-7 py-3 text-[11px] font-black uppercase tracking-[0.15em] text-slate-700 transition hover:border-cyan-300 hover:bg-cyan-50"
                >
                  Commercial Programs →
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Lubrication prevents belt & deck wear', detail: 'Every 3 months residential / monthly commercial' },
                { label: 'Motor inspection catches amp draw issues early', detail: 'Before overheating causes permanent damage' },
                { label: 'Roller bearing checks prevent belt tracking', detail: 'Worn rollers cause belt drift and vibration' },
                { label: 'Calibration keeps speed & incline accurate', detail: 'Drift in readings can mask control board issues' },
              ].map(({ label, detail }) => (
                <div key={label} className="border border-slate-200 bg-slate-50 p-6">
                  <div className="h-1 w-8 bg-cyan-400 mb-4" />
                  <p className="text-sm font-black text-slate-900">{label}</p>
                  <p className="mt-2 text-xs leading-5 text-slate-500">{detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Brands ───────────────────────────────────────────────────────── */}
      <section className="bg-slate-50 px-6 py-20 lg:px-16">
        <div className="mx-auto max-w-6xl">
          <div className="mb-3 text-center">
            <span className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-400">
              Brands We Service
            </span>
          </div>
          <h2 className="text-center text-2xl font-black text-slate-900">
            All Major Treadmill Brands
          </h2>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {brands.map((brand) => (
              <span
                key={brand}
                className="border border-slate-200 bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-slate-600 shadow-sm"
              >
                {brand}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Commercial CTA ───────────────────────────────────────────────── */}
      <section className="bg-[#0A0D14] px-6 py-20 text-white lg:px-16">
        <div className="mx-auto max-w-6xl grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.35em] text-cyan-400">
              Commercial Maintenance
            </span>
            <h2 className="mt-4 text-3xl font-black leading-tight text-white md:text-4xl">
              Running a Gym, Apartment Complex, or Hotel?
            </h2>
            <p className="mt-5 text-base leading-8 text-white/60">
              We build recurring preventive maintenance programs for commercial fitness facilities across Dallas Fort Worth. Each visit includes multi-unit service, SmartGymOps documentation, and a written report of findings for every machine. Facilities get full service history, flagged issues, and prioritized repair recommendations.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/commercial-gym-maintenance"
                className="bg-cyan-400 px-7 py-3 text-[11px] font-black uppercase tracking-[0.15em] text-black transition hover:bg-cyan-300"
              >
                Commercial Programs
              </Link>
              <a
                href="tel:9728077232"
                className="border border-white/25 px-7 py-3 text-[11px] font-black uppercase tracking-[0.15em] text-white transition hover:border-white/50"
              >
                (972) 807-7232
              </a>
            </div>
          </div>
          <div className="space-y-4">
            {[
              { title: 'Apartment Fitness Centers', desc: 'Recurring monthly maintenance with documented service records and resident-facing QR codes.' },
              { title: 'Hotel Fitness Rooms', desc: 'Multi-brand service visits coordinated around guest schedules. Hospitality experience.' },
              { title: 'Commercial Gyms', desc: 'High-frequency maintenance programs for clubs running equipment 8-12 hours per day.' },
              { title: 'Corporate Wellness Facilities', desc: 'Scheduled maintenance with admin reporting for corporate wellness administrators.' },
            ].map(({ title, desc }) => (
              <div key={title} className="border border-white/10 bg-white/[0.04] px-6 py-5">
                <div className="text-sm font-black text-white">{title}</div>
                <p className="mt-1 text-xs leading-6 text-white/45">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <section className="bg-white px-6 py-24 lg:px-16">
        <div className="mx-auto max-w-3xl">
          <div className="mb-3 text-center">
            <span className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-400">
              Common Questions
            </span>
          </div>
          <h2 className="mb-12 text-center text-3xl font-black text-slate-900 md:text-4xl">
            Treadmill Maintenance FAQ
          </h2>
          <div className="space-y-6">
            {faqs.map(({ q, a }) => (
              <div key={q} className="border border-slate-200 p-7">
                <h3 className="text-base font-black text-slate-900">{q}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────────────────────────── */}
      <section className="bg-[#0A0D14] px-6 py-24 text-white lg:px-16">
        <div className="mx-auto max-w-3xl text-center">
          <span className="text-[10px] font-black uppercase tracking-[0.35em] text-cyan-400">
            Ready To Schedule
          </span>
          <h2 className="mt-4 text-3xl font-black leading-tight text-white md:text-4xl">
            Treadmill Maintenance
            <span className="block text-white/50">Across Dallas Fort Worth</span>
          </h2>
          <p className="mt-5 text-base leading-8 text-white/55">
            Residential tune-ups, commercial maintenance programs, and emergency repair service. Our technicians serve all of DFW — from Denton to Cedar Hill, Flower Mound to Rowlett.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <BookServiceButton
              label="Schedule Maintenance"
              className="bg-cyan-400 px-8 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-black transition hover:bg-cyan-300"
            />
            <a
              href="tel:9728077232"
              className="border border-white/25 px-8 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-white transition hover:border-white/50"
            >
              (972) 807-7232
            </a>
          </div>
        </div>
      </section>
    </main>
  )
}
