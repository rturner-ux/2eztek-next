import Link from 'next/link'

export const metadata = {
  title: 'Fitness Equipment Manuals & Troubleshooting | 2EZ TEK',
  description:
    'Browse fitness equipment manuals, troubleshooting resources, repair guidance, assembly support, and preventative maintenance information for treadmills, ellipticals, home gyms, and commercial fitness equipment.',
}

const brands = [
  {
    name: 'NordicTrack',
    href: '/manuals/nordictrack',
    description:
      'Treadmill manuals, iFIT troubleshooting, black screen issues, and repair resources.',
  },
  {
    name: 'ProForm',
    href: '/manuals/proform',
    description:
      'Treadmill troubleshooting, startup failures, incline issues, and owner resources.',
  },
  {
    name: 'Bowflex',
    href: '/manuals/bowflex',
    description:
      'Home gym assembly manuals, cable routing, and repair information.',
  },
  {
    name: 'Marcy',
    href: '/manuals/marcy',
    description:
      'Home gym assembly support, pulley systems, and maintenance guides.',
  },
  {
    name: 'Peloton',
    href: '/manuals/peloton',
    description:
      'Bike and treadmill troubleshooting, calibration support, and diagnostics.',
  },
]

export default function ManualsPage() {
  return (
    <main className="min-h-screen bg-[#050B14] text-white">
      {/* HERO */}
      <section className="border-b border-white/10 bg-gradient-to-b from-cyan-500/10 to-transparent">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="max-w-4xl">
            <div className="mb-4 inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-1 text-xs font-black uppercase tracking-[0.25em] text-cyan-300">
              Fitness Equipment Resource Center
            </div>

            <h1 className="text-5xl font-black leading-tight md:text-6xl">
              Fitness Equipment Manuals & Troubleshooting
            </h1>

            <p className="mt-6 text-lg leading-8 text-white/70">
              Access fitness equipment manuals, troubleshooting resources,
              assembly guidance, preventative maintenance information, and
              repair support for treadmills, ellipticals, home gyms, and
              commercial fitness equipment throughout Dallas Fort Worth.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/request-service"
                className="rounded-2xl bg-cyan-400 px-8 py-4 text-sm font-black uppercase tracking-wide text-black transition hover:scale-105"
              >
                Request Service
              </Link>

              <a
                href="tel:9728077232"
                className="rounded-2xl border border-white/15 bg-white/5 px-8 py-4 text-sm font-black uppercase tracking-wide text-white transition hover:border-cyan-400/50"
              >
                Call 972-807-7232
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* BRANDS */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="mb-12">
          <h2 className="text-4xl font-black">
            Browse Equipment Brands
          </h2>

          <p className="mt-4 max-w-3xl text-lg text-white/60">
            Explore troubleshooting information, owner manuals, repair
            guidance, assembly support, and preventative maintenance
            resources for popular fitness equipment brands.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {brands.map((brand) => (
            <Link
              key={brand.name}
              href={brand.href}
              className="group rounded-3xl border border-white/10 bg-white/5 p-8 transition hover:border-cyan-400/40 hover:bg-cyan-400/5"
            >
              <h3 className="text-2xl font-black transition group-hover:text-cyan-300">
                {brand.name}
              </h3>

              <p className="mt-4 leading-7 text-white/60">
                {brand.description}
              </p>

              <div className="mt-8 text-sm font-black uppercase tracking-wide text-cyan-300">
                View Resources →
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* COMMON ISSUES */}
      <section className="border-y border-white/10 bg-white/[0.03]">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="grid gap-10 lg:grid-cols-2">
            <div>
              <h2 className="text-4xl font-black">
                Common Fitness Equipment Issues
              </h2>

              <p className="mt-6 text-lg leading-8 text-white/60">
                Modern fitness equipment relies heavily on electronics,
                software systems, touchscreen consoles, and wireless
                connectivity. Many common issues now involve both
                hardware and software diagnostics.
              </p>
            </div>

            <div className="grid gap-4 text-white/70">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                • Treadmill black screen problems
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                • Endless boot loop issues
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                • Incline calibration failures
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                • Treadmill belt slipping
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                • Elliptical resistance problems
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                • Home gym cable failures
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="rounded-[2rem] border border-cyan-400/20 bg-cyan-400/10 p-12 text-center">
          <h2 className="text-4xl font-black">
            Need Professional Diagnostics?
          </h2>

          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-white/70">
            2EZ TEK provides professional fitness equipment diagnostics,
            repair, assembly, preventative maintenance, and onsite service
            throughout Dallas Fort Worth for residential and commercial
            clients.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              href="/request-service"
              className="rounded-2xl bg-cyan-400 px-8 py-4 text-sm font-black uppercase tracking-wide text-black transition hover:scale-105"
            >
              Request Service
            </Link>

            <a
              href="tel:9728077232"
              className="rounded-2xl border border-white/15 bg-white/5 px-8 py-4 text-sm font-black uppercase tracking-wide text-white transition hover:border-cyan-400/50"
            >
              Call Now
            </a>
          </div>
        </div>
      </section>
    </main>
  )
}