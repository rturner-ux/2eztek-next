import Link from 'next/link'

export const metadata = {
  title: 'About 2EZ TEK | Fitness Equipment Repair & Assembly in DFW',
  description:
    'Learn about 2EZ TEK, a Dallas Fort Worth fitness equipment repair, assembly, installation, and maintenance company serving residential and commercial clients.',
}

const stats = [
  ['500+', 'Five-Star Service Experiences'],
  ['DFW', 'Residential & Commercial Coverage'],
  ['24/7', 'Service Support'],
  ['SmartGymOps', 'Technology-Powered Tracking'],
]

const services = [
  'Fitness equipment repair and diagnostics',
  'Treadmill, elliptical, bike, rower, and strength machine service',
  'Home gym assembly and white-glove installation',
  'Commercial gym maintenance and facility support',
  'Preventative maintenance planning',
  'SmartGymOps-powered request tracking and equipment history',
]

const values = [
  'Professional communication',
  'Reliable field service',
  'Clean jobsite discipline',
  'Smarter service tracking',
]

export default function About2EZTEKPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050B14] text-white">
      <div className="fixed inset-0 z-0 overflow-hidden">
        <img
          src="/images/about-smartgymops-support.webp"
          alt="2EZ TEK support team using SmartGymOps"
          className="hero-image h-full w-[112%] max-w-none object-cover opacity-[0.74]"
        />

        <div className="absolute inset-0 bg-black/16" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,11,20,0.72)_0%,rgba(5,11,20,0.42)_42%,rgba(5,11,20,0.18)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.18),transparent_35%)]" />
      </div>

      <section className="relative z-10 flex min-h-screen items-center px-6 py-24 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-5xl">
            <div className="inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-5 py-2 text-xs font-black uppercase tracking-[0.25em] text-cyan-300 backdrop-blur-xl">
              About 2EZ TEK
            </div>

            <h1 className="mt-8 text-5xl font-black leading-[0.92] tracking-tight md:text-7xl">
              Field Service
              <span className="block text-cyan-300">
                Powered By Smarter Operations.
              </span>
            </h1>

            <p className="mt-8 max-w-3xl text-lg leading-8 text-white/85 md:text-xl">
              2EZ TEK provides professional fitness equipment repair, assembly,
              installation, relocation, and preventative maintenance across the
              Dallas Fort Worth area. We combine hands-on service experience
              with SmartGymOps-powered tracking, support, and operational
              visibility.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/contact"
                className="rounded-2xl bg-cyan-400 px-8 py-5 text-center text-sm font-black uppercase tracking-[0.14em] text-black shadow-[0_0_45px_rgba(34,211,238,0.35)] transition hover:scale-[1.02] hover:bg-cyan-300"
              >
                Book Service
              </Link>

              <Link
                href="/smartgymops-features"
                className="rounded-2xl border border-white/15 bg-white/10 px-8 py-5 text-center text-sm font-black uppercase tracking-[0.14em] text-white backdrop-blur-xl transition hover:bg-white/15"
              >
                View SmartGymOps
              </Link>
            </div>

            <div className="mt-20 grid gap-4 md:grid-cols-4">
              {stats.map(([stat, label]) => (
                <div
                  key={label}
                  className="rounded-[2rem] border border-white/10 bg-black/18 p-6 shadow-[0_20px_80px_rgba(0,0,0,0.28)] backdrop-blur-xl"
                >
                  <div className="text-4xl font-black text-cyan-300">
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
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-2">
          <div>
            <div className="text-sm font-black uppercase tracking-[0.28em] text-cyan-300">
              What We Do
            </div>

            <h2 className="mt-5 text-4xl font-black leading-tight md:text-6xl">
              From Home Gyms
              <span className="block text-white/60">
                To Commercial Facilities.
              </span>
            </h2>

            <p className="mt-7 text-lg leading-8 text-white/78">
              Our work covers everything from treadmill repair and elliptical
              diagnostics to cable replacement, strength equipment assembly,
              commercial gym installs, preventative maintenance programs, and
              larger buildout support.
            </p>
          </div>

          <div className="grid gap-4">
            {services.map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-white/10 bg-black/20 p-5 text-white/80 shadow-[0_20px_70px_rgba(0,0,0,0.25)] backdrop-blur-xl"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 px-6 pb-28 lg:px-16">
        <div className="mx-auto max-w-7xl rounded-[3rem] border border-cyan-400/20 bg-black/20 p-10 shadow-[0_30px_120px_rgba(0,0,0,0.38)] backdrop-blur-2xl md:p-16">
          <div className="grid gap-10 lg:grid-cols-2">
            <div>
              <div className="text-sm font-black uppercase tracking-[0.28em] text-cyan-300">
                Our Difference
              </div>

              <h2 className="mt-5 text-4xl font-black leading-tight md:text-6xl">
                Real Technicians.
                <span className="block text-white/60">
                  Smarter Systems.
                </span>
              </h2>

              <p className="mt-7 text-lg leading-8 text-white/78">
                2EZ TEK is not just a repair company. Our service process is
                supported by SmartGymOps, helping us manage request intake,
                technician workflow, equipment history, commercial maintenance
                tracking, and long-term operational visibility.
              </p>
            </div>

            <div className="grid gap-5">
              {values.map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur-xl"
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

          <div className="mt-12 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/smartgymops-features"
              className="rounded-2xl bg-cyan-400 px-8 py-5 text-center text-sm font-black uppercase tracking-[0.14em] text-black shadow-[0_0_45px_rgba(34,211,238,0.35)] transition hover:scale-[1.02] hover:bg-cyan-300"
            >
              Explore SmartGymOps
            </Link>

            <a
              href="tel:9728077232"
              className="rounded-2xl border border-white/15 bg-white/10 px-8 py-5 text-center text-sm font-black uppercase tracking-[0.14em] text-white backdrop-blur-xl transition hover:bg-white/15"
            >
              Call (972) 807-7232
            </a>
          </div>
        </div>
      </section>
    </main>
  )
}