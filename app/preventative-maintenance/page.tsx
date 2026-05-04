import Link from 'next/link'

export const metadata = {
  title: 'Preventative Maintenance | 2EZ TEK',
  description:
    'Preventative maintenance services for commercial and residential fitness equipment across Dallas Fort Worth.',
}

const maintenanceServices = [
  'Treadmill Belt & Deck Inspections',
  'Lubrication & Calibration',
  'Elliptical & Bike Adjustments',
  'Cable & Pulley Inspections',
  'Commercial Gym Equipment Servicing',
  'Monthly & Quarterly Maintenance Plans',
]

const benefits = [
  'Reduce equipment downtime',
  'Extend machine lifespan',
  'Improve member experience',
  'Prevent costly repairs',
]

const stats = [
  ['10K+', 'Machines Serviced'],
  ['500+', '5-Star Reviews'],
  ['24/7', 'Support'],
  ['DFW', 'Coverage Area'],
]

export default function PreventativeMaintenancePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050B14] text-white">
      <div className="fixed inset-0 z-0 overflow-hidden">
        <img
          src="/images/rogue.webp"
          alt="Commercial gym preventative maintenance"
          className="hero-image h-full w-[112%] max-w-none object-cover opacity-[0.72]"
        />

        <div className="absolute inset-0 bg-black/12" />

        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,11,20,0.68)_0%,rgba(5,11,20,0.34)_42%,rgba(5,11,20,0.14)_100%)]" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.16),transparent_34%)]" />
      </div>

      <section className="relative z-10 flex min-h-screen items-center px-6 py-24 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-4xl">
            <div className="inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-5 py-2 text-xs font-black uppercase tracking-[0.25em] text-cyan-300 backdrop-blur-xl">
              Preventative Maintenance
            </div>

            <h1 className="mt-8 text-5xl font-black leading-[0.92] tracking-tight md:text-7xl">
              Protect Your
              <span className="block text-cyan-300">
                Fitness Equipment.
              </span>
            </h1>

            <p className="mt-8 max-w-2xl text-lg leading-8 text-white/88 md:text-xl">
              Professional preventative maintenance services designed to
              reduce downtime, improve performance, and extend the life of
              your fitness equipment.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <a
                href="tel:9728077232"
                className="rounded-2xl bg-cyan-400 px-8 py-5 text-center shadow-[0_0_45px_rgba(34,211,238,0.35)] transition hover:scale-[1.02] hover:bg-cyan-300"
              >
                <div className="text-xs font-black uppercase tracking-[0.28em] text-black/70">
                  Schedule Service
                </div>

                <div className="mt-1 text-2xl font-black text-black md:text-3xl">
                  (972) 807-7232
                </div>
              </a>

              <Link
                href="/contact"
                className="rounded-2xl border border-white/15 bg-white/10 px-8 py-5 text-center text-sm font-black uppercase tracking-[0.14em] text-white backdrop-blur-xl transition hover:bg-white/15"
              >
                Request Maintenance
              </Link>
            </div>

            <div className="mt-20 grid gap-4 md:grid-cols-4">
              {stats.map(([stat, label]) => (
                <div
                  key={label}
                  className="rounded-[2rem] border border-white/10 bg-black/18 p-6 shadow-[0_20px_80px_rgba(0,0,0,0.28)] backdrop-blur-xl"
                >
                  <div className="text-5xl font-black text-cyan-300">
                    {stat}
                  </div>

                  <div className="mt-3 text-sm font-semibold uppercase tracking-[0.12em] text-white/70">
                    {label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 px-6 py-24 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="text-sm font-black uppercase tracking-[0.28em] text-cyan-300">
                Maintenance Services
              </div>

              <h2 className="mt-4 text-4xl font-black md:text-6xl">
                Keep Equipment
                <span className="block text-white/60">
                  Running Smoothly
                </span>
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
            {maintenanceServices.map((service) => (
              <div
                key={service}
                className="group relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-black/18 p-8 shadow-[0_25px_90px_rgba(0,0,0,0.30)] backdrop-blur-2xl transition duration-500 hover:-translate-y-2 hover:border-cyan-300/30"
              >
                <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(34,211,238,0.12),transparent_65%)] opacity-80 transition duration-500 group-hover:opacity-100" />

                <div className="relative">
                  <div className="text-3xl font-black text-cyan-300">
                    ✓
                  </div>

                  <h3 className="mt-6 text-3xl font-black leading-tight">
                    {service}
                  </h3>

                  <p className="mt-5 leading-8 text-white/80">
                    Detailed inspections and servicing to help prevent
                    breakdowns and maintain peak machine performance.
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 px-6 py-24 lg:px-16">
        <div className="mx-auto max-w-7xl rounded-[3rem] border border-cyan-400/20 bg-black/18 p-10 shadow-[0_30px_120px_rgba(0,0,0,0.38)] backdrop-blur-2xl md:p-16">
          <div className="grid gap-10 lg:grid-cols-2">
            <div>
              <div className="text-sm font-black uppercase tracking-[0.28em] text-cyan-300">
                Why Maintenance Matters
              </div>

              <h2 className="mt-5 text-4xl font-black leading-tight md:text-6xl">
                Avoid Expensive
                <span className="block text-white/60">
                  Equipment Failures.
                </span>
              </h2>
            </div>

            <div className="grid gap-5">
              {benefits.map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.05] p-5 backdrop-blur-xl"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-300 text-lg font-black text-black">
                    ✓
                  </div>

                  <div className="text-lg font-bold text-white/88">
                    {item}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 px-6 pb-28 lg:px-16">
        <div className="mx-auto max-w-7xl rounded-[3rem] border border-cyan-400/20 bg-black/18 p-10 shadow-[0_30px_120px_rgba(0,0,0,0.38)] backdrop-blur-2xl md:p-16">
          <div className="grid gap-10 lg:grid-cols-[1fr,360px] lg:items-center">
            <div>
              <div className="text-sm font-black uppercase tracking-[0.28em] text-cyan-300">
                Ready To Protect Your Equipment?
              </div>

              <h2 className="mt-5 max-w-4xl text-4xl font-black leading-tight md:text-6xl">
                Schedule Preventative
                <span className="block text-white/60">
                  Maintenance Today.
                </span>
              </h2>

              <p className="mt-7 max-w-2xl text-lg leading-8 text-white/80">
                Keep your gym equipment operating safely and efficiently with
                professional maintenance services from 2EZ TEK.
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <a
                href="tel:9728077232"
                className="rounded-2xl bg-cyan-400 px-8 py-6 text-center shadow-[0_0_45px_rgba(34,211,238,0.35)] transition hover:scale-[1.02] hover:bg-cyan-300"
              >
                <div className="text-xs font-black uppercase tracking-[0.28em] text-black/70">
                  Call 2EZ TEK
                </div>

                <div className="mt-2 text-3xl font-black text-black">
                  (972) 807-7232
                </div>
              </a>

              <Link
                href="/contact"
                className="rounded-2xl border border-white/15 bg-white/10 px-8 py-5 text-center text-sm font-black uppercase tracking-[0.14em] text-white backdrop-blur-xl transition hover:bg-white/15"
              >
                Request Maintenance
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}