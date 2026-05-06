import Link from 'next/link'

const brands = [
  {
    name: 'NordicTrack',
    href: '/brands/nordictrack',
  },
  {
    name: 'ProForm',
    href: '/brands/proform',
  },
  {
    name: 'Bowflex',
    href: '/brands/bowflex',
  },
  {
    name: 'Peloton',
    href: '/brands/peloton',
  },
  {
    name: 'Marcy',
    href: '/brands/marcy',
  },
]

export default function BrandsPage() {
  return (
    <main className="min-h-screen bg-[#050B14] text-white">
      <section className="border-b border-white/10">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <div className="max-w-3xl">
            <div className="mb-4 inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-1 text-xs font-bold uppercase tracking-[0.25em] text-cyan-300">
              Equipment Brands We Service
            </div>

            <h1 className="text-5xl font-black leading-tight md:text-6xl">
              Fitness Equipment Brands We Repair
            </h1>

            <p className="mt-6 text-lg text-white/70">
              2EZ TEK provides professional repair, assembly, diagnostics,
              maintenance, and onsite fitness equipment service throughout
              Dallas Fort Worth.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {brands.map((brand) => (
            <Link
              key={brand.name}
              href={brand.href}
              className="rounded-3xl border border-white/10 bg-white/5 p-8 transition hover:border-cyan-400/40 hover:bg-cyan-400/5"
            >
              <h2 className="text-2xl font-black">{brand.name}</h2>

              <p className="mt-3 text-sm text-white/60">
                Repair, diagnostics, assembly, maintenance, and onsite service.
              </p>

              <div className="mt-6 text-sm font-bold uppercase tracking-wide text-cyan-300">
                View Service Page →
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  )
}