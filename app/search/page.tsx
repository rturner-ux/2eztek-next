import GoogleProgrammableSearch from '@/components/GoogleProgrammableSearch'

export const metadata = {
  title: 'Search 2EZ TEK',
  description:
    'Search 2EZ TEK services, manuals, brands, repair guides, service areas, FAQs, and fitness equipment resources.',
  alternates: {
    canonical: 'https://www.2eztek.com/search',
  },
}

export default function SearchPage() {
  return (
    <main className="min-h-screen bg-[#050B14] text-white">
      <section className="relative overflow-hidden border-b border-white/10 bg-[#050B14] px-6 pb-16 pt-32">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.22),transparent_34%),linear-gradient(180deg,rgba(34,211,238,0.08),transparent_45%)]" />
        <div className="relative mx-auto max-w-5xl">
          <div className="mb-5 inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-xs font-black uppercase tracking-[0.25em] text-cyan-300">
            Google Powered Site Search
          </div>
          <h1 className="text-5xl font-black tracking-tight md:text-7xl">
            Search 2EZ TEK
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-white/70">
            Search services, manuals, brands, repair guides, service areas, FAQs,
            and other resources across the 2EZ TEK website.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-12">
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.96] p-5 text-[#111827] shadow-[0_30px_100px_rgba(0,0,0,0.35)] md:p-8">
          <GoogleProgrammableSearch />
        </div>
      </section>
    </main>
  )
}
