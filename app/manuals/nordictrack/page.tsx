import Link from 'next/link'

export const metadata = {
  title: 'NordicTrack Manuals & Troubleshooting | 2EZ TEK',
  description:
    'NordicTrack treadmill manuals, iFIT troubleshooting, black screen issues, boot loop problems, incline failures, and repair resources from 2EZ TEK.',
}

export default function NordicTrackManualsPage() {
  return (
    <main className="min-h-screen bg-[#050B14] text-white">
      <section className="border-b border-white/10 bg-gradient-to-b from-cyan-500/10 to-transparent">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="max-w-4xl">
            <div className="mb-4 inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-1 text-xs font-black uppercase tracking-[0.25em] text-cyan-300">
              NordicTrack Resource Center
            </div>

            <h1 className="text-5xl font-black leading-tight md:text-6xl">
              NordicTrack Manuals & Troubleshooting
            </h1>

            <p className="mt-6 text-lg leading-8 text-white/70">
              Find NordicTrack troubleshooting guidance, repair information,
              iFIT issue support, black screen diagnostics, boot loop
              information, incline problems, and treadmill maintenance
              resources.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/brands/nordictrack"
                className="rounded-2xl bg-cyan-400 px-8 py-4 text-sm font-black uppercase tracking-wide text-black transition hover:scale-105"
              >
                NordicTrack Repair
              </Link>

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

      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
            <h2 className="text-3xl font-black">Common NordicTrack Issues</h2>

            <div className="mt-6 grid gap-4 text-white/70">
              <p>• Black screen or frozen touchscreen</p>
              <p>• Endless boot loop during startup</p>
              <p>• iFIT update failures</p>
              <p>• Incline calibration problems</p>
              <p>• Belt slipping or stopping</p>
              <p>• Console not loading dashboard</p>
              <p>• WiFi connection problems</p>
              <p>• Speed or motor control issues</p>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
            <h2 className="text-3xl font-black">Helpful Resources</h2>

            <div className="mt-6 grid gap-4">
              <Link
                href="/brands/nordictrack"
                className="rounded-2xl border border-white/10 bg-black/20 p-5 text-white/70 transition hover:border-cyan-400/40 hover:text-cyan-300"
              >
                NordicTrack Repair Dallas
              </Link>

              <Link
                href="/treadmill-repair-dallas"
                className="rounded-2xl border border-white/10 bg-black/20 p-5 text-white/70 transition hover:border-cyan-400/40 hover:text-cyan-300"
              >
                Treadmill Repair Dallas
              </Link>

              <Link
                href="/request-service"
                className="rounded-2xl border border-white/10 bg-black/20 p-5 text-white/70 transition hover:border-cyan-400/40 hover:text-cyan-300"
              >
                Request Professional Diagnostics
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-white/[0.03]">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <h2 className="text-4xl font-black">
            NordicTrack Manual Support
          </h2>

          <p className="mt-6 max-w-4xl text-lg leading-8 text-white/60">
            NordicTrack equipment can vary by model, year, console version,
            and iFIT software generation. Before replacing parts, it is
            important to properly identify the model number, serial number,
            console behavior, power condition, and any error symptoms.
          </p>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <h3 className="text-xl font-black">Before Service</h3>
              <p className="mt-4 text-white/60">
                Locate your model number, serial number, purchase date, and a
                clear description of the issue.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <h3 className="text-xl font-black">Common Diagnostics</h3>
              <p className="mt-4 text-white/60">
                Power checks, console inspection, lower board testing, belt
                movement, incline behavior, and software status.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <h3 className="text-xl font-black">Repair Options</h3>
              <p className="mt-4 text-white/60">
                Some issues may be corrected with reset procedures, while
                severe software or hardware failures may require parts.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="rounded-[2rem] border border-cyan-400/20 bg-cyan-400/10 p-12 text-center">
          <h2 className="text-4xl font-black">
            Need NordicTrack Help?
          </h2>

          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-white/70">
            2EZ TEK provides NordicTrack diagnostics, treadmill repair,
            touchscreen troubleshooting, preventative maintenance, and onsite
            fitness equipment service throughout Dallas Fort Worth.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
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
      </section>
    </main>
  )
}