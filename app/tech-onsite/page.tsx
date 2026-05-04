import Link from 'next/link'

export const metadata = {
  title: 'Onsite Fitness Equipment Service | 2EZ TEK',
  description:
    '2EZ TEK provides onsite fitness equipment repair, maintenance, diagnostics, assembly, and commercial gym support for residential and commercial facilities.',
}

const services = [
  {
    title: 'Onsite Repairs',
    text: 'Professional diagnostics and repair services for treadmills, ellipticals, bikes, strength equipment, and functional trainers.',
  },
  {
    title: 'Preventive Maintenance',
    text: 'Routine inspections, lubrication, adjustments, calibration, and performance checks to reduce equipment downtime.',
  },
  {
    title: 'Commercial Gym Support',
    text: 'Fast-response service support for apartment gyms, hotels, schools, corporate fitness centers, and commercial facilities.',
  },
  {
    title: 'Equipment Assembly',
    text: 'White-glove assembly and installation for home gyms, cardio units, racks, and commercial fitness equipment.',
  },
]

export default function TechOnsitePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#050B14] text-white">
      <section className="relative px-6 py-24">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.20),transparent_40%),linear-gradient(180deg,#08111F_0%,#050B14_55%,#02050A_100%)]" />

        <div className="absolute left-[-120px] top-16 h-[450px] w-[450px] rounded-full bg-cyan-500/10 blur-3xl" />

        <div className="absolute right-[-140px] bottom-0 h-[450px] w-[450px] rounded-full bg-blue-500/10 blur-3xl" />

        <div className="relative mx-auto max-w-6xl">
          <div className="inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm font-bold text-cyan-200">
            2EZ TEK Onsite Service
          </div>

          <h1 className="mt-6 max-w-5xl text-5xl font-black tracking-tight md:text-7xl">
            Premium onsite fitness equipment service.
          </h1>

          <p className="mt-8 max-w-3xl text-lg leading-8 text-slate-300">
            2EZ TEK provides professional onsite repair, maintenance,
            diagnostics, assembly, and installation services for fitness
            equipment across residential and commercial environments.
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/request-service"
              className="rounded-2xl bg-cyan-300 px-6 py-4 text-center font-black text-slate-950 shadow-[0_0_35px_rgba(34,211,238,0.35)] transition hover:bg-cyan-200"
            >
              Schedule Service
            </Link>

            <Link
              href="/commercial-gym-maintenance"
              className="rounded-2xl border border-white/15 bg-white/10 px-6 py-4 text-center font-black text-white transition hover:bg-white/15"
            >
              Commercial Maintenance
            </Link>
          </div>
        </div>
      </section>

      <section className="px-6 pb-20">
        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2">
          {services.map((item) => (
            <div
              key={item.title}
              className="group relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 backdrop-blur-xl transition duration-500 hover:border-cyan-400/30 hover:bg-white/[0.06]"
            >
              <div className="absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/10 to-blue-500/10" />
              </div>

              <div className="relative">
                <h2 className="text-3xl font-black text-white">
                  {item.title}
                </h2>

                <p className="mt-5 leading-8 text-slate-300">
                  {item.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 pb-28">
        <div className="mx-auto max-w-6xl rounded-[2.5rem] border border-cyan-400/20 bg-gradient-to-br from-cyan-400/10 via-white/[0.03] to-blue-500/10 p-10 md:p-14">
          <div className="grid gap-10 md:grid-cols-2 md:items-center">
            <div>
              <h2 className="text-4xl font-black md:text-6xl">
                Fast response. Professional results.
              </h2>

              <p className="mt-6 text-lg leading-8 text-slate-300">
                We help minimize equipment downtime with responsive onsite
                support and professional service workflows designed for
                commercial and residential fitness environments.
              </p>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-black/30 p-8">
              <div className="space-y-5">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <div className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-300">
                    Service Areas
                  </div>

                  <div className="mt-3 text-slate-300">
                    Residential • Commercial • Apartments • Hotels • Schools • Fitness Centers
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <div className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-300">
                    Contact
                  </div>

                  <div className="mt-3 space-y-2 text-slate-300">
                    <div>Phone: (903) 445-2020</div>
                    <div>Email: rturner@2eztek.com</div>
                  </div>
                </div>

                <a
                  href="/request-service"
                  className="flex items-center justify-center rounded-2xl bg-white px-6 py-4 text-center font-black text-slate-950 transition hover:bg-cyan-100"
                >
                  Request Onsite Service
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}