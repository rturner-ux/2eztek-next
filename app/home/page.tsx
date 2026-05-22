import Link from 'next/link'

export const metadata = {
  title: 'Home | 2EZ TEK',
  description:
    '2EZ TEK provides professional fitness equipment repair, assembly, installation, and commercial gym maintenance across Dallas Fort Worth.',
  alternates: {
    canonical: '/',
  },
}

export default function LegacyHomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050B14] text-white">
      <div className="fixed inset-0 z-0 overflow-hidden">
        <img
          src="/images/rev.webp"
          alt="2EZ TEK fitness equipment service"
          className="hero-image h-full w-[110%] max-w-none object-cover opacity-[0.48]"
        />

        <div className="absolute inset-0 bg-black/45" />

        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,11,20,0.9)_0%,rgba(5,11,20,0.62)_45%,rgba(5,11,20,0.25)_100%)]" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.18),transparent_34%)]" />
      </div>

      <section className="relative z-10 flex min-h-screen items-center px-6 py-24 lg:px-16">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-4xl">
            <div className="inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-5 py-2 text-xs font-black uppercase tracking-[0.25em] text-cyan-300 backdrop-blur-xl">
              Welcome To 2EZ TEK
            </div>

            <h1 className="mt-8 text-5xl font-black leading-[0.95] tracking-tight md:text-7xl">
              Fitness Equipment
              <span className="block text-cyan-300">
                Repair & Assembly.
              </span>
            </h1>

            <p className="mt-8 max-w-2xl text-lg leading-8 text-white/75 md:text-xl">
              Professional onsite repair, assembly, installation, and
              commercial gym maintenance services across Dallas Fort Worth.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/contact"
                className="rounded-2xl bg-cyan-400 px-7 py-4 text-center text-sm font-black uppercase tracking-[0.12em] text-black shadow-[0_0_35px_rgba(34,211,238,0.35)]"
              >
                Request Service
              </Link>

              <Link
                href="/gym-equipment-repair-dallas"
                className="rounded-2xl border border-white/15 bg-white/10 px-7 py-4 text-center text-sm font-black uppercase tracking-[0.12em] text-white backdrop-blur-xl transition hover:bg-white/15"
              >
                View Services
              </Link>
            </div>

            <div className="mt-16 grid gap-4 md:grid-cols-4">
              {[
                ['10K+', 'Machines Serviced'],
                ['500+', '5-Star Reviews'],
                ['24/7', 'Emergency Support'],
                ['DFW', 'Coverage Area'],
              ].map(([stat, label]) => (
                <div
                  key={label}
                  className="rounded-[2rem] border border-white/10 bg-black/30 p-6 backdrop-blur-xl"
                >
                  <div className="text-4xl font-black text-cyan-300">
                    {stat}
                  </div>

                  <div className="mt-2 text-sm font-semibold text-white/55">
                    {label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}