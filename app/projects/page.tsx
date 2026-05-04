import Link from 'next/link'

export const metadata = {
  title: 'Projects | 2EZ TEK',
  description:
    'Explore premium gym installations, fitness equipment assembly projects, commercial buildouts, and luxury home gyms completed by 2EZ TEK across Dallas Fort Worth.',
}

const projects = [
  {
    image: '/images/project-1.webp',
    title: 'Luxury Functional Trainer Build',
    category: 'Residential Installation',
  },
  {
    image: '/images/project-2.webp',
    title: 'PRx Space Saving System',
    category: 'Garage Gym Conversion',
  },
  {
    image: '/images/project-3.webp',
    title: 'Commercial Strength Setup',
    category: 'Performance Facility',
  },
  {
    image: '/images/project-4.webp',
    title: 'StairMaster Cardio Installation',
    category: 'Commercial Cardio',
  },
  {
    image: '/images/project-5.webp',
    title: 'Modern Home Fitness Room',
    category: 'Luxury Home Gym',
  },
  {
    image: '/images/project-6.webp',
    title: 'Multi-Station Cable System',
    category: 'Custom Equipment Install',
  },
]

export default function ProjectsPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050B14] text-white">
      <div className="fixed inset-0 z-0 overflow-hidden">
        <img
          src="/images/project-1.webp"
          alt="2EZ TEK fitness installation projects"
          className="hero-image h-full w-[112%] max-w-none object-cover opacity-[0.28]"
        />

        <div className="absolute inset-0 bg-black/55" />

        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,11,20,0.72)_0%,rgba(5,11,20,0.92)_100%)]" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.16),transparent_35%)]" />
      </div>

      <section className="relative z-10 px-6 pb-24 pt-32 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-4xl">
            <div className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-5 py-2 text-xs font-black uppercase tracking-[0.28em] text-cyan-300 backdrop-blur-xl">
              Featured Projects
            </div>

            <h1 className="mt-7 text-5xl font-black leading-[0.92] tracking-tight md:text-7xl">
              Real Installations.
              <span className="block text-white/55">
                Premium Results.
              </span>
            </h1>

            <p className="mt-7 max-w-2xl text-lg leading-8 text-white/72 md:text-xl">
              Explore luxury residential gym builds, commercial fitness
              installations, cardio equipment setups, and complete gym
              transformations completed by 2EZ TEK.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <a
                href="tel:9728077232"
                className="rounded-2xl bg-cyan-400 px-7 py-4 text-center text-sm font-black uppercase tracking-[0.14em] text-black shadow-[0_0_40px_rgba(34,211,238,0.30)] transition hover:scale-[1.02] hover:bg-cyan-300"
              >
                Call (972) 807-7232
              </a>

              <Link
                href="/contact"
                className="rounded-2xl border border-white/10 bg-white/10 px-7 py-4 text-center text-sm font-black uppercase tracking-[0.14em] text-white backdrop-blur-xl transition hover:bg-white/15"
              >
                Request A Quote
              </Link>
            </div>
          </div>

          <div className="mt-20 grid gap-4 md:grid-cols-4">
            {[
              ['10K+', 'Machines Installed'],
              ['500+', '5-Star Reviews'],
              ['DFW', 'Coverage Area'],
              ['24/7', 'Support'],
            ].map(([stat, label]) => (
              <div
                key={label}
                className="rounded-[2rem] border border-white/10 bg-black/20 p-6 shadow-[0_20px_80px_rgba(0,0,0,0.28)] backdrop-blur-xl"
              >
                <div className="text-5xl font-black text-cyan-300">
                  {stat}
                </div>

                <div className="mt-3 text-sm font-semibold uppercase tracking-[0.12em] text-white/65">
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 px-6 pb-32 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-7 md:grid-cols-2 xl:grid-cols-3">
            {projects.map((project, index) => (
              <div
                key={index}
                className="group relative overflow-hidden rounded-[2.7rem] border border-white/10 bg-black/20 shadow-[0_30px_120px_rgba(0,0,0,0.40)] backdrop-blur-2xl"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="h-[420px] w-full object-cover transition duration-[1800ms] group-hover:scale-110"
                  />

                  <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_0%,rgba(0,0,0,0.18)_45%,rgba(0,0,0,0.82)_100%)]" />

                  <div className="absolute inset-0 bg-cyan-400/0 transition duration-700 group-hover:bg-cyan-400/5" />

                  <div className="absolute bottom-0 left-0 right-0 p-7">
                    <div className="inline-flex rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.22em] text-cyan-200 backdrop-blur-xl">
                      {project.category}
                    </div>

                    <h2 className="mt-5 text-3xl font-black leading-tight text-white">
                      {project.title}
                    </h2>

                    <div className="mt-6 flex items-center justify-between">
                      <div className="text-sm font-semibold uppercase tracking-[0.16em] text-white/55">
                        2EZ TEK PROJECT
                      </div>

                      <div className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-white/80 backdrop-blur-xl transition group-hover:border-cyan-300/20 group-hover:bg-cyan-300/10 group-hover:text-cyan-200">
                        Completed
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 px-6 pb-28 lg:px-16">
        <div className="mx-auto max-w-7xl rounded-[3rem] border border-cyan-400/20 bg-black/20 p-10 shadow-[0_30px_120px_rgba(0,0,0,0.38)] backdrop-blur-2xl md:p-16">
          <div className="grid gap-10 lg:grid-cols-[1fr,360px] lg:items-center">
            <div>
              <div className="text-sm font-black uppercase tracking-[0.28em] text-cyan-300">
                Build Your Dream Gym
              </div>

              <h2 className="mt-5 max-w-4xl text-4xl font-black leading-tight md:text-6xl">
                Residential Or Commercial.
                <span className="block text-white/60">
                  We Build It Right.
                </span>
              </h2>

              <p className="mt-7 max-w-2xl text-lg leading-8 text-white/80">
                From premium home gyms to large commercial fitness facilities,
                2EZ TEK provides professional installation, assembly,
                maintenance, and project support across Dallas Fort Worth.
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
                Request Project Quote
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}