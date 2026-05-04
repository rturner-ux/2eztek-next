import Link from 'next/link'

export const metadata = {
  title: 'Careers | 2EZ TEK Fitness Equipment Service',
  description:
    'Join 2EZ TEK and build a career in fitness equipment repair, assembly, installation, and commercial gym maintenance across Dallas Fort Worth.',
}

const roles = [
  'Fitness Equipment Technicians',
  'Assembly Specialists',
  'Commercial Maintenance Support',
  'Field Service Helpers',
]

const qualities = [
  'Mechanical mindset',
  'Professional communication',
  'Reliable transportation',
  'Customer-first attitude',
  'Willingness to learn',
  'Clean jobsite discipline',
]

export default function CareersPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050B14] text-white">
      <div className="fixed inset-0 z-0 overflow-hidden">
        <img
          src="/images/careers-team.webp"
          alt="2EZ TEK technicians reviewing work on a tablet"
          className="careers-drift h-full w-[110%] max-w-none object-cover opacity-[0.62]"
        />

        <div className="absolute inset-0 bg-black/35" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,11,20,0.9)_0%,rgba(5,11,20,0.66)_42%,rgba(5,11,20,0.35)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.22),transparent_36%)]" />
      </div>

      <section className="relative z-10 px-6 pb-24 pt-32 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-4xl">
            <div className="inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-5 py-2 text-xs font-black uppercase tracking-[0.25em] text-cyan-300 backdrop-blur-xl">
              Careers at 2EZ TEK
            </div>

            <h1 className="mt-7 text-5xl font-black leading-[0.95] tracking-tight md:text-7xl">
              Build Your Career.
              <span className="block text-cyan-300">Make An Impact.</span>
            </h1>

            <p className="mt-7 max-w-2xl text-lg leading-8 text-white/75 md:text-xl">
              Join a growing fitness equipment service company helping homes,
              gyms, apartments, hotels, and commercial facilities keep their
              equipment running strong.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <a
                href="mailto:jobs@2eztek.com?subject=Career%20Interest%20with%202EZ%20TEK"
                className="rounded-2xl bg-cyan-400 px-7 py-4 text-center text-sm font-black uppercase tracking-[0.12em] text-black shadow-[0_0_35px_rgba(34,211,238,0.35)]"
              >
                Apply Now
              </a>

              <Link
                href="/contact"
                className="rounded-2xl border border-white/15 bg-white/10 px-7 py-4 text-center text-sm font-black uppercase tracking-[0.12em] text-white backdrop-blur-xl transition hover:bg-white/15"
              >
                Contact 2EZ TEK
              </Link>
            </div>
          </div>

          <div className="mt-16 grid gap-4 md:grid-cols-4">
            {roles.map((role) => (
              <div
                key={role}
                className="rounded-[2rem] border border-white/10 bg-black/30 p-6 backdrop-blur-xl"
              >
                <div className="text-xl font-black text-cyan-300">{role}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 px-6 py-24 lg:px-16">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <div className="text-sm font-black uppercase tracking-[0.28em] text-cyan-300">
              Who We’re Looking For
            </div>

            <h2 className="mt-5 text-4xl font-black leading-tight md:text-6xl">
              Skilled.
              <span className="block text-white/45">Reliable. Coachable.</span>
            </h2>

            <p className="mt-6 max-w-md text-lg leading-8 text-slate-300">
              We’re looking for people who take pride in their work, communicate
              clearly, and want to grow in the fitness equipment service industry.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {qualities.map((item) => (
              <div
                key={item}
                className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 backdrop-blur-xl"
              >
                <div className="flex items-center gap-3 text-lg font-black">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-cyan-300 text-sm text-black">
                    ✓
                  </span>
                  {item}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 px-6 pb-28 lg:px-16">
        <div className="mx-auto max-w-7xl rounded-[3rem] border border-cyan-400/20 bg-black/35 p-10 shadow-[0_25px_120px_rgba(0,0,0,0.45)] backdrop-blur-2xl md:p-16">
          <div className="grid gap-10 lg:grid-cols-[1fr,320px] lg:items-center">
            <div>
              <div className="text-sm font-black uppercase tracking-[0.28em] text-cyan-300">
                Ready To Join The Team?
              </div>

              <h2 className="mt-5 max-w-4xl text-4xl font-black leading-tight md:text-6xl">
                Start building with
                <span className="block text-white/45">2EZ TEK.</span>
              </h2>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
                Send your name, experience, location, availability, and the type
                of work you’re interested in.
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <a
                href="mailto:jobs@2eztek.com?subject=Career%20Interest%20with%202EZ%20TEK"
                className="rounded-2xl bg-cyan-400 px-7 py-5 text-center text-sm font-black uppercase tracking-[0.12em] text-black shadow-[0_0_35px_rgba(34,211,238,0.35)]"
              >
                Email jobs@2eztek.com
              </a>

              <a
                href="tel:9728077232"
                className="rounded-2xl border border-white/15 bg-white/10 px-7 py-5 text-center text-sm font-black uppercase tracking-[0.12em] text-white backdrop-blur-xl transition hover:bg-white/15"
              >
                Call (972) 807-7232
              </a>
            </div>
          </div>
        </div>
      </section>

      <style jsx global>{`
            @keyframes careersDrift {
        0% {
          transform: translateX(-3%) scale(1.06);
        }

        100% {
          transform: translateX(3%) scale(1.06);
        }
      }

      .careers-drift {
        animation: careersDrift 52s ease-in-out infinite alternate;
      }
      `}</style>
    </main>
  )
}