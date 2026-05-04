import Link from 'next/link'

export const metadata = {
  title: 'Contact 2EZ TEK | Fitness Equipment Repair & Assembly',
  description:
    'Contact 2EZ TEK for fitness equipment repair, assembly, installation, and commercial gym maintenance across Dallas Fort Worth.',
}

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[#050B14] text-white">
      <section className="relative overflow-hidden px-6 py-24">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.22),transparent_38%),linear-gradient(180deg,#08111F_0%,#050B14_60%,#02050A_100%)]" />
        <div className="absolute -left-40 top-20 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute -right-40 bottom-10 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />

        <div className="relative mx-auto max-w-6xl">
          <div className="mb-6 inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-200">
            Contact 2EZ TEK
          </div>

          <h1 className="max-w-4xl text-5xl font-black tracking-tight md:text-7xl">
            Need fitness equipment repaired, assembled, or maintained?
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            Contact 2EZ TEK for professional onsite fitness equipment service
            across Dallas Fort Worth.
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <a
              href="tel:9728077232"
              className="rounded-2xl bg-cyan-300 px-6 py-4 text-center font-black text-slate-950 shadow-[0_0_35px_rgba(34,211,238,0.35)] transition hover:bg-cyan-200"
            >
              Call (972) 807-7232
            </a>

            <a
              href="mailto:rturner@2eztek.com"
              className="rounded-2xl border border-white/15 bg-white/10 px-6 py-4 text-center font-black text-white transition hover:bg-white/15"
            >
              Email 2EZ TEK
            </a>
          </div>
        </div>
      </section>

      <section className="px-6 pb-24">
        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8">
            <h2 className="text-2xl font-black text-cyan-200">Phone</h2>
            <p className="mt-4 text-slate-300">(972) 807-7232</p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8">
            <h2 className="text-2xl font-black text-cyan-200">Email</h2>
            <p className="mt-4 text-slate-300">rturner@2eztek.com</p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8">
            <h2 className="text-2xl font-black text-cyan-200">Service Area</h2>
            <p className="mt-4 text-slate-300">Dallas Fort Worth</p>
          </div>
        </div>
      </section>

      <section className="px-6 pb-28">
        <div className="mx-auto max-w-6xl rounded-[2.5rem] border border-cyan-400/20 bg-gradient-to-br from-cyan-400/10 via-white/[0.03] to-blue-500/10 p-10 md:p-14">
          <h2 className="text-4xl font-black md:text-6xl">
            Request service today.
          </h2>

          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">
            For treadmill repair, gym equipment assembly, commercial maintenance,
            onsite diagnostics, or full fitness room support, reach out and our
            team will follow up.
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/gym-equipment-repair-dallas"
              className="rounded-2xl bg-white px-6 py-4 text-center font-black text-slate-950 transition hover:bg-cyan-100"
            >
              View Home Services
            </Link>

            <Link
              href="/commercial-gym-maintenance"
              className="rounded-2xl border border-white/15 bg-white/10 px-6 py-4 text-center font-black text-white transition hover:bg-white/15"
            >
              Commercial Maintenance
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}