import BookServiceButton from '@/components/BookServiceButton'
import Link from 'next/link'

export const metadata = {
  title: 'Tonal Support Center | 2EZ TEK',
  description:
    'Official Tonal support guides for troubleshooting, installation, getting started, WiFi, error messages, arm rotation, and more. 2EZ TEK repairs Tonal systems in Dallas Fort Worth.',
  alternates: {
    canonical: 'https://www.2eztek.com/manuals/tonal',
  },
}

export default function TonalSupportPage() {
  return (
    <main className="min-h-screen bg-[#050B14] text-white">
      {/* Slim hero */}
      <section className="border-b border-white/10 bg-gradient-to-b from-cyan-500/10 to-transparent">
        <div className="mx-auto max-w-7xl px-6 py-14">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="mb-3 inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-1 text-xs font-black uppercase tracking-[0.25em] text-cyan-300">
                Tonal Resource Center
              </div>
              <h1 className="text-4xl font-black leading-tight md:text-5xl">
                Tonal Support Center
              </h1>
              <p className="mt-3 max-w-xl text-base text-white/60">
                Official Tonal guides for setup, troubleshooting, error messages, arm issues, and more.
                2EZ TEK also repairs Tonal systems across Dallas Fort Worth.
              </p>
            </div>
            <div className="flex flex-shrink-0 flex-wrap gap-3">
              <BookServiceButton className="bg-cyan-400 px-7 py-3 text-sm font-black uppercase tracking-wide text-black transition hover:bg-cyan-300" />
              <Link
                href="/manuals"
                className="border border-white/15 bg-white/5 px-7 py-3 text-sm font-black uppercase tracking-wide text-white transition hover:border-cyan-400/50"
              >
                All Manuals
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Proxied Tonal knowledge base — serves real knowledge.tonal.com content */}
      <section className="bg-white">
        <iframe
          src="/api/proxy/tonal/kb/en"
          title="Tonal Support Center"
          className="h-[3200px] w-full border-0"
          loading="lazy"
        />
      </section>
    </main>
  )
}
