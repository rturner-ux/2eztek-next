import Link from 'next/link'

export const metadata = {
  title: 'Careers | 2EZ TEK Fitness Equipment Service',
  description:
    'Explore technician and field service opportunities with 2EZ TEK, a fitness equipment repair, assembly, installation, and maintenance company serving commercial and residential clients.',
}

export default function CareersPage() {
  return (
    <main className="min-h-screen bg-[#050B14] text-white">
      <section className="relative overflow-hidden px-6 py-24">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.22),transparent_38%),linear-gradient(180deg,#08111F_0%,#050B14_60%,#02050A_100%)]" />
        <div className="absolute -left-40 top-20 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute -right-40 bottom-10 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />

        <div className="relative mx-auto max-w-6xl">
          <div className="mb-6 inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-200">
            Careers at 2EZ TEK
          </div>

          <h1 className="max-w-4xl text-5xl font-black tracking-tight md:text-7xl">
            Build the future of fitness equipment service.
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            2EZ TEK is growing. We service, assemble, install, and maintain
            fitness equipment for homes, apartments, hotels, gyms, schools, and
            commercial fitness facilities.
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/contact"
              className="rounded-2xl bg-cyan-300 px-6 py-4 text-center font-black text-slate-950 shadow-[0_0_35px_rgba(34,211,238,0.35)] transition hover:bg-cyan-200"
            >
              Contact Us About Careers
            </Link>

            <Link
              href="/commercial-gym-maintenance"
              className="rounded-2xl border border-white/15 bg-white/10 px-6 py-4 text-center font-black text-white transition hover:bg-white/15"
            >
              View Our Services
            </Link>
          </div>
        </div>
      </section>

      <section className="px-6 py-20">
        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-3">
          {[
            {
              title: 'Field Technicians',
              text: 'Repair treadmills, ellipticals, bikes, strength machines, cables, consoles, and commercial equipment.',
            },
            {
              title: 'Assembly Specialists',
              text: 'Help install home gyms, racks, cardio units, functional trainers, and full fitness room buildouts.',
            },
            {
              title: 'Maintenance Support',
              text: 'Assist with preventive maintenance programs, inspection checklists, equipment tracking, and client support.',
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 shadow-2xl backdrop-blur"
            >
              <h2 className="text-2xl font-black text-cyan-200">
                {item.title}
              </h2>
              <p className="mt-4 leading-7 text-slate-300">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 pb-24">
        <div className="mx-auto max-w-6xl rounded-[2rem] border border-cyan-400/20 bg-gradient-to-br from-cyan-400/10 via-white/[0.04] to-blue-500/10 p-8 md:p-12">
          <h2 className="text-3xl font-black md:text-5xl">
            What we look for
          </h2>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {[
              'Mechanical or fitness equipment repair experience',
              'Strong customer service and communication',
              'Reliable transportation and field readiness',
              'Ability to troubleshoot and document issues clearly',
              'Professional appearance and jobsite discipline',
              'Willingness to learn SmartGymOps field workflows',
            ].map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-white/10 bg-black/20 p-5 text-slate-200"
              >
                {item}
              </div>
            ))}
          </div>

          <div className="mt-10 rounded-3xl border border-white/10 bg-black/30 p-6">
            <p className="text-lg leading-8 text-slate-300">
              Interested in working with 2EZ TEK? Send your name, experience,
              location, and the type of work you are interested in.
            </p>

            <div className="mt-6">
              <a
                href="mailto:rturner@2eztek.com?subject=Career%20Interest%20with%202EZ%20TEK"
                className="inline-flex rounded-2xl bg-white px-6 py-4 font-black text-slate-950 transition hover:bg-cyan-100"
              >
                Email 2EZ TEK
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}