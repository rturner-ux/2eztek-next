import Link from 'next/link'

export const metadata = {
  title: 'Customer Reviews | 2EZ TEK',
  description:
    'Read customer reviews for 2EZ TEK fitness equipment repair, assembly, maintenance, and commercial gym service.',
}

const reviews = [
  {
    name: 'Commercial Fitness Client',
    title: 'Fast response and professional service',
    review:
      '2EZ TEK handled multiple treadmill and elliptical repairs for our facility quickly and professionally. Communication was excellent and downtime was minimized.',
  },
  {
    name: 'Residential Customer',
    title: 'Excellent home gym assembly',
    review:
      'Our home gym installation was completed perfectly. Everything was organized, clean, and professionally assembled.',
  },
  {
    name: 'Apartment Fitness Center',
    title: 'Reliable maintenance partner',
    review:
      'Preventive maintenance has helped keep our equipment running consistently. Very responsive and dependable service.',
  },
]

export default function ReviewsPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#050B14] text-white">
      <section className="relative px-6 py-24">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.20),transparent_40%),linear-gradient(180deg,#08111F_0%,#050B14_55%,#02050A_100%)]" />

        <div className="absolute left-[-120px] top-20 h-[420px] w-[420px] rounded-full bg-cyan-500/10 blur-3xl" />

        <div className="absolute right-[-120px] bottom-0 h-[420px] w-[420px] rounded-full bg-blue-500/10 blur-3xl" />

        <div className="relative mx-auto max-w-6xl">
          <div className="inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm font-bold text-cyan-200">
            2EZ TEK Reviews
          </div>

          <h1 className="mt-6 max-w-5xl text-5xl font-black tracking-tight md:text-7xl">
            Trusted by gyms, fitness centers, and residential clients.
          </h1>

          <p className="mt-8 max-w-3xl text-lg leading-8 text-slate-300">
            2EZ TEK provides fitness equipment repair, assembly,
            installation, and preventive maintenance with a focus on
            professionalism, communication, and reducing equipment downtime.
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/request-service"
              className="rounded-2xl bg-cyan-300 px-6 py-4 text-center font-black text-slate-950 shadow-[0_0_35px_rgba(34,211,238,0.35)] transition hover:bg-cyan-200"
            >
              Request Service
            </Link>

            <Link
              href="/commercial-gym-maintenance"
              className="rounded-2xl border border-white/15 bg-white/10 px-6 py-4 text-center font-black text-white transition hover:bg-white/15"
            >
              Explore Services
            </Link>
          </div>
        </div>
      </section>

      <section className="px-6 pb-24">
        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-3">
          {reviews.map((item) => (
            <div
              key={item.title}
              className="group relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 backdrop-blur-xl transition duration-500 hover:border-cyan-400/30 hover:bg-white/[0.06]"
            >
              <div className="absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/10 to-blue-500/10" />
              </div>

              <div className="relative">
                <div className="mb-5 flex gap-1 text-cyan-300">
                  ★★★★★
                </div>

                <h2 className="text-2xl font-black text-white">
                  {item.title}
                </h2>

                <p className="mt-5 leading-8 text-slate-300">
                  “{item.review}”
                </p>

                <div className="mt-8 border-t border-white/10 pt-5 text-sm font-semibold text-cyan-200">
                  {item.name}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 pb-28">
        <div className="mx-auto max-w-6xl rounded-[2.5rem] border border-cyan-400/20 bg-gradient-to-br from-cyan-400/10 via-white/[0.03] to-blue-500/10 p-10 md:p-14">
          <div className="max-w-4xl">
            <h2 className="text-4xl font-black md:text-6xl">
              Looking for dependable fitness equipment service?
            </h2>

            <p className="mt-6 text-lg leading-8 text-slate-300">
              From commercial gyms to residential fitness rooms, 2EZ TEK
              helps keep equipment operational, professionally assembled,
              and properly maintained.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <a
                href="tel:9034452020"
                className="rounded-2xl bg-white px-6 py-4 text-center font-black text-slate-950 transition hover:bg-cyan-100"
              >
                Call 2EZ TEK
              </a>

              <a
                href="mailto:rturner@2eztek.com"
                className="rounded-2xl border border-white/15 bg-white/10 px-6 py-4 text-center font-black text-white transition hover:bg-white/15"
              >
                Email Us
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}