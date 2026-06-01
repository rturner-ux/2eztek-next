// app/areas/page.tsx
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Fitness Equipment Repair Service Areas | Dallas Fort Worth',
  description: 'Professional fitness equipment repair across Dallas Fort Worth. View all service areas including Dallas, Plano, Frisco, Irving, Arlington, and more.',
  alternates: { canonical: 'https://www.2eztek.com/areas' },
}

const areas = [
  { name: 'Dallas', slug: 'dallas' },
  { name: 'Fort Worth', slug: 'fort-worth' },
  { name: 'Plano', slug: 'plano' },
  { name: 'Frisco', slug: 'frisco' },
  { name: 'Irving', slug: 'irving' },
  { name: 'Arlington', slug: 'arlington' },
  { name: 'Richardson', slug: 'richardson' },
  { name: 'McKinney', slug: 'mckinney' },
  { name: 'Garland', slug: 'garland' },
  { name: 'Mesquite', slug: 'mesquite' },
  { name: 'Carrollton', slug: 'carrollton' },
  { name: 'Addison', slug: 'addison' },
]

export default function AreasPage() {
  return (
    <main className="min-h-screen bg-[#050B14] text-white px-6 py-32 lg:px-16">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-cyan-300">
          Service Areas
        </div>
        <h1 className="text-4xl font-black leading-tight md:text-6xl">
          Fitness Equipment Repair
          <span className="block text-white/45">Across Dallas Fort Worth.</span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/60">
          2EZ TEK provides professional fitness equipment repair, assembly, and maintenance across the entire DFW metroplex.
        </p>
        <div className="mt-14 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {areas.map((area) => (
            <Link
              key={area.slug}
              href={'/areas/' + area.slug}
              className="group block rounded-3xl border border-white/10 bg-white/[0.05] p-6 transition hover:border-cyan-400/30 hover:bg-cyan-400/[0.05]"
            >
              <div className="font-black text-white transition group-hover:text-cyan-300">
                {area.name}
              </div>
              <div className="mt-1 text-xs font-black uppercase tracking-[0.15em] text-white/30 transition group-hover:text-cyan-400/60">
                View Service Area →
              </div>
            </Link>
          ))}
        </div>
        <div className="mt-12 flex flex-wrap gap-4">
          <Link
            href="/contact"
            className="rounded-2xl bg-cyan-400 px-7 py-4 text-sm font-black uppercase tracking-[0.12em] text-black transition hover:bg-cyan-300"
          >
            Book Service
          </Link>
          <a
            href="tel:9728077232"
            className="rounded-2xl border border-white/10 bg-white/5 px-7 py-4 text-sm font-black uppercase tracking-[0.12em] text-white transition hover:border-cyan-400/30"
          >
            Call (972) 807-7232
          </a>
        </div>
      </div>
    </main>
  )
}