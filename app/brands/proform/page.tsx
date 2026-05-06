import Link from 'next/link'

export const metadata = {
  title: 'ProForm Repair Dallas TX | Treadmill & Elliptical Service',
  description:
    '2EZ TEK provides ProForm treadmill repair, elliptical service, console troubleshooting, incline diagnostics, and onsite fitness equipment repair across Dallas Fort Worth.',
}

export default function ProFormPage() {
  return (
    <main className="min-h-screen bg-[#050B14] text-white">
      <section className="border-b border-white/10 bg-gradient-to-b from-cyan-500/10 to-transparent">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <div className="max-w-3xl">
            <div className="mb-4 inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-1 text-xs font-bold uppercase tracking-[0.25em] text-cyan-300">
              ProForm Repair Experts
            </div>

            <h1 className="text-5xl font-black leading-tight md:text-6xl">
              ProForm Repair Dallas
            </h1>

            <p className="mt-6 text-lg text-white/70">
              Professional ProForm treadmill repair, elliptical diagnostics,
              incline troubleshooting, black screen repair, and onsite fitness
              equipment service throughout Dallas Fort Worth.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <a
                href="tel:9728077232"
                className="rounded-2xl bg-cyan-400 px-8 py-4 text-sm font-black uppercase tracking-wide text-black transition hover:scale-105"
              >
                Call 972-807-7232
              </a>

              <Link
                href="/request-service"
                className="rounded-2xl border border-white/15 bg-white/5 px-8 py-4 text-sm font-black uppercase tracking-wide text-white transition hover:border-cyan-400/50"
              >
                Request Service
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid gap-8 md:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
            <h2 className="text-2xl font-black">Common ProForm Issues</h2>

            <ul className="mt-6 space-y-4 text-white/70">
              <li>• Black screen or frozen console</li>
              <li>• Treadmill not powering on</li>
              <li>• Incline not working properly</li>
              <li>• Belt slipping or stopping</li>
              <li>• iFit software update problems</li>
              <li>• Resistance issues on ellipticals</li>
              <li>• Speed fluctuation problems</li>
              <li>• Loud squeaking or grinding noises</li>
            </ul>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
            <h2 className="text-2xl font-black">Services We Provide</h2>

            <ul className="mt-6 space-y-4 text-white/70">
              <li>• ProForm treadmill repair</li>
              <li>• Elliptical diagnostics</li>
              <li>• Console troubleshooting</li>
              <li>• Software and iFit support</li>
              <li>• Belt replacement and adjustment</li>
              <li>• Preventative maintenance</li>
              <li>• Commercial gym service</li>
              <li>• Onsite diagnostics</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="rounded-3xl border border-cyan-400/20 bg-cyan-400/10 p-10 text-center">
          <h2 className="text-4xl font-black">
            Need ProForm Repair Fast?
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-white/70">
            2EZ TEK provides professional onsite ProForm repair services for
            residential and commercial fitness clients across Dallas Fort Worth.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <a
              href="tel:9728077232"
              className="rounded-2xl bg-cyan-400 px-8 py-4 text-sm font-black uppercase tracking-wide text-black transition hover:scale-105"
            >
              Call Now
            </a>

            <Link
              href="/request-service"
              className="rounded-2xl border border-white/15 bg-white/5 px-8 py-4 text-sm font-black uppercase tracking-wide text-white transition hover:border-cyan-400/50"
            >
              Schedule Service
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}