import Link from 'next/link'

export const metadata = {
  title: 'Gym Equipment Assembly | 2EZ TEK',
  description:
    'Professional gym equipment assembly services for home gyms, commercial fitness centers, apartments, and studios across Dallas Fort Worth.',
}

const assemblyServices = [
  'Home Gym Assembly',
  'Treadmill Assembly',
  'Smith Machine Assembly',
  'Functional Trainer Installation',
  'Commercial Gym Setup',
  'Multi-Station Equipment Assembly',
]

const benefits = [
  'Professional installation',
  'Safe equipment setup',
  'Commercial-grade experience',
  'Fast turnaround times',
]

const stats = [
  ['10K+', 'Machines Installed'],
  ['500+', '5-Star Reviews'],
  ['DFW', 'Coverage Area'],
  ['24/7', 'Support'],
]

export default function GymEquipmentAssemblyPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050B14] text-white">
      <div className="fixed inset-0 z-0 overflow-hidden">
        <img
          src="/images/Gym Build.webp"
          alt="2EZ TEK gym equipment assembly"
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
              Professional Assembly Services
            </div>

            <h1 className="mt-8 text-5xl font-black leading-[0.92] tracking-tight md:text-7xl">
              Expert
              <span className="block text-cyan-300">
                Gym Equipment Assembly
              </span>
            </h1>

            <p className="mt-8 max-w-2xl text-lg leading-8 text-white/88 md:text-xl">
              Professional assembly services for residential and commercial
              fitness equipment throughout Dallas Fort Worth.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <a
                href="tel:9728077232"
                className="rounded-2xl bg-cyan-400 px-8 py-5 text-center shadow-[0_0_45px_rgba(34,211,238,0.35)] transition hover:scale-[1.02] hover:bg-cyan-300"
              >
                <div className="text-xs font-black uppercase tracking-[0.28em] text-black/70">
                  Schedule Assembly
                </div>

                <div className="mt-1 text-2xl font-black text-black md:text-3xl">
                  (972) 807-7232
                </div>
              </a>

              <Link
                href="/contact"
                className="rounded-2xl border border-white/15 bg-white/10 px-8 py-5 text-center text-sm font-black uppercase tracking-[0.14em] text-white backdrop-blur-xl transition hover:bg-white/15"
              >
                Request Installation
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
                Assembly Services
              </div>

              <h2 className="mt-4 text-4xl font-black md:text-6xl">
                Equipment We
                <span className="block text-white/60">
                  Assemble Daily
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
            {assemblyServices.map((service) => (
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
                    Professional assembly and installation services completed
                    safely, efficiently, and with attention to detail.
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
                Why Choose 2EZ TEK
              </div>

              <h2 className="mt-5 text-4xl font-black leading-tight md:text-6xl">
                Professional
                <span className="block text-white/60">
                  Installation Experience.
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
                Ready To Build Your Gym?
              </div>

              <h2 className="mt-5 max-w-4xl text-4xl font-black leading-tight md:text-6xl">
                Schedule Professional
                <span className="block text-white/60">
                  Equipment Assembly.
                </span>
              </h2>

              <p className="mt-7 max-w-2xl text-lg leading-8 text-white/80">
                From single machines to complete commercial gym installations,
                2EZ TEK provides professional assembly services across
                Dallas Fort Worth.
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
                Request Installation
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}