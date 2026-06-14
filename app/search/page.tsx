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
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <section className="relative overflow-hidden border-b border-slate-200 bg-slate-50 px-6 pb-16 pt-32">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.10),transparent_34%),linear-gradient(180deg,rgba(34,211,238,0.04),transparent_45%)]" />
        <div className="relative mx-auto max-w-5xl">
          <div className="mb-5 inline-flex rounded-full border border-cyan-200 bg-cyan-50 px-4 py-2 text-xs font-black uppercase tracking-[0.25em] text-cyan-600">
            Google Powered Site Search
          </div>
          <h1 className="text-5xl font-black tracking-tight text-slate-900 md:text-7xl">
            Search 2EZ TEK
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600">
            Search services, manuals, brands, repair guides, service areas, FAQs,
            and other resources across the 2EZ TEK website.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-12">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-5 text-slate-900 shadow-[0_30px_100px_rgba(0,0,0,0.08)] md:p-8">
          <GoogleProgrammableSearch />
        </div>
      </section>
    </main>
  )
}
