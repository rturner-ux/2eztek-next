import Link from 'next/link'

export const metadata = {
  title: 'About 2EZ TEK | Fitness Equipment Repair & Assembly in DFW',
  description:
    'Learn about 2EZ TEK, a Dallas Fort Worth fitness equipment repair, assembly, installation, and maintenance company serving residential and commercial clients.',
}

export default function About2EZTEKPage() {
  return (
    <main className="min-h-screen bg-[#070B12] text-white">
      <section className="relative overflow-hidden px-8 py-28 lg:px-16">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.18),transparent_35%)]" />

        <div className="relative z-10 mx-auto max-w-6xl">
          <div className="text-sm font-black uppercase tracking-[0.3em] text-cyan-400">
            About 2EZ TEK
          </div>

          <h1 className="mt-6 max-w-5xl text-5xl font-black leading-tight md:text-7xl">
            Fitness Equipment Service Built On Experience, Trust, And Real Work.
          </h1>

          <p className="mt-8 max-w-3xl text-lg leading-relaxed text-white/65">
            2EZ TEK provides professional fitness equipment repair, assembly,
            installation, relocation, and preventative maintenance across the
            Dallas Fort Worth area. We serve homeowners, commercial gyms,
            apartments, training studios, hotels, schools, and fitness facilities
            that need reliable equipment support without the runaround.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/"
              className="rounded-2xl bg-cyan-400 px-7 py-4 text-sm font-black uppercase tracking-[0.12em] text-black"
            >
              Book Service
            </Link>

            <Link
              href="/commercial-gym-maintenance"
              className="rounded-2xl border border-white/10 bg-white/5 px-7 py-4 text-sm font-black uppercase tracking-[0.12em] text-white"
            >
              Commercial Services
            </Link>
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-[#0B1220] px-8 py-20 lg:px-16">
        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-3">
          {[
            ['500+', 'Five-Star Service Experiences'],
            ['DFW', 'Residential & Commercial Coverage'],
            ['SmartGymOps', 'Technology-Powered Service Tracking'],
          ].map(([stat, label]) => (
            <div
              key={label}
              className="rounded-[32px] border border-white/10 bg-white/[0.05] p-8"
            >
              <div className="text-4xl font-black text-cyan-400">{stat}</div>
              <div className="mt-3 text-sm font-semibold text-white/60">
                {label}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="px-8 py-24 lg:px-16">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2">
          <div>
            <div className="text-sm font-black uppercase tracking-[0.3em] text-cyan-400">
              What We Do
            </div>

            <h2 className="mt-4 text-4xl font-black md:text-5xl">
              From Home Gyms To Full Commercial Facilities.
            </h2>

            <p className="mt-6 leading-relaxed text-white/65">
              Our work covers everything from treadmill repair and elliptical
              diagnostics to cable replacement, strength equipment assembly,
              commercial gym installs, preventative maintenance programs, and
              larger buildout support.
            </p>
          </div>

          <div className="grid gap-4">
            {[
              'Fitness equipment repair and diagnostics',
              'Treadmill, elliptical, bike, rower, and strength machine service',
              'Home gym assembly and white-glove installation',
              'Commercial gym maintenance and facility support',
              'Preventative maintenance planning',
              'SmartGymOps-powered request tracking and equipment history',
            ].map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-white/10 bg-white/[0.05] p-5 text-white/70"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 bg-[#07101D] px-8 py-24 lg:px-16">
        <div className="mx-auto max-w-6xl">
          <div className="text-sm font-black uppercase tracking-[0.3em] text-cyan-400">
            Our Difference
          </div>

          <h2 className="mt-4 max-w-4xl text-4xl font-black md:text-5xl">
            We Combine Field Service With Smarter Operations.
          </h2>

          <p className="mt-6 max-w-3xl leading-relaxed text-white/65">
            2EZ TEK is not just a repair company. Our service process is being
            powered by SmartGymOps, giving us a stronger foundation for request
            intake, equipment history, technician workflow, commercial
            maintenance tracking, and long-term operational visibility.
          </p>

          <Link
            href="https://smartgymops.com"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-10 inline-flex rounded-2xl border border-cyan-400/30 bg-cyan-400/10 px-7 py-4 text-sm font-black uppercase tracking-[0.12em] text-cyan-300"
          >
            Visit SmartGymOps
          </Link>
        </div>
      </section>
    </main>
  )
}