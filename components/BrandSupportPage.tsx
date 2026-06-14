'use client'

import BookServiceButton from './BookServiceButton'

type BrandSupportPageProps = {
  eyebrow: string
  title: string
  description: string
  issues: string[]
  services: string[]
  ctaTitle: string
  ctaText: string
  affiliateUrl?: string
  affiliateBrand?: string
}

function SupportList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-7 backdrop-blur-xl">
      <h2 className="text-2xl font-black text-white">{title}</h2>
      <ul className="mt-6 grid gap-3">
        {items.map((item) => (
          <li
            key={item}
            className="flex items-start gap-3 rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm font-semibold leading-6 text-white/70"
          >
            <span className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-cyan-400" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function BrandSupportPage({
  eyebrow,
  title,
  description,
  issues,
  services,
  ctaTitle,
  ctaText,
  affiliateUrl,
  affiliateBrand,
}: BrandSupportPageProps) {
  return (
    <main className="min-h-screen bg-[#050B14] text-white">
      <section className="relative overflow-hidden border-b border-white/10 bg-[#050B14]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.22),transparent_34%),linear-gradient(180deg,rgba(34,211,238,0.08),transparent_45%)]" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-cyan-300/40 to-transparent" />
        <div className="relative mx-auto max-w-6xl px-6 py-24">
          <div className="max-w-3xl">
            <div className="mb-4 inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-xs font-black uppercase tracking-[0.25em] text-cyan-300">
              {eyebrow}
            </div>
            <h1 className="text-5xl font-black leading-tight md:text-6xl">
              {title}
            </h1>
            <p className="mt-6 text-lg leading-8 text-white/70">
              {description}
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <a
                href="tel:9728077232"
                className="rounded-2xl bg-cyan-400 px-8 py-4 text-sm font-black uppercase tracking-wide text-black shadow-[0_0_35px_rgba(34,211,238,0.22)] transition hover:scale-105 hover:bg-cyan-300"
              >
                Call 972-807-7232
              </a>
              <BookServiceButton className="rounded-2xl border border-white/15 bg-white/5 px-8 py-4 text-sm font-black uppercase tracking-wide text-white transition hover:border-cyan-400/50 hover:bg-cyan-400/10" />
              {affiliateUrl && (
                <a
                  href={affiliateUrl}
                  target="_blank"
                  rel="nofollow sponsored noopener"
                  className="rounded-2xl border border-cyan-400/40 bg-cyan-400/15 px-8 py-4 text-sm font-black uppercase tracking-wide text-cyan-300 transition hover:bg-cyan-400/25"
                >
                  Shop {affiliateBrand ?? 'Official Site'}
                </a>
              )}
            </div>
            {affiliateUrl && (
              <p className="mt-4 text-xs text-white/35">
                Affiliate link. We may earn a commission at no cost to you.
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="mb-8 grid gap-4 md:grid-cols-2">
          <button className="rounded-[2rem] border border-cyan-400/25 bg-cyan-400/10 p-6 text-left">
            <div className="text-xs font-black uppercase tracking-[0.25em] text-cyan-300">
              Brand
            </div>
            <div className="mt-2 text-2xl font-black">{title.replace(/ Repair.*$/i, '')}</div>
          </button>
          <button className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-6 text-left">
            <div className="text-xs font-black uppercase tracking-[0.25em] text-cyan-300">
              Category
            </div>
            <div className="mt-2 text-2xl font-black">Fitness Equipment Support</div>
          </button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <SupportList title="Common Issues" items={issues} />
          <SupportList title="Services We Provide" items={services} />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="rounded-[2rem] border border-cyan-400/20 bg-cyan-400/10 p-10 text-center">
          <h2 className="text-4xl font-black">{ctaTitle}</h2>
          <p className="mx-auto mt-4 max-w-2xl leading-7 text-white/70">
            {ctaText}
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <a
              href="tel:9728077232"
              className="rounded-2xl bg-cyan-400 px-8 py-4 text-sm font-black uppercase tracking-wide text-black transition hover:scale-105 hover:bg-cyan-300"
            >
              Call Now
            </a>
            <BookServiceButton className="rounded-2xl border border-white/15 bg-white/5 px-8 py-4 text-sm font-black uppercase tracking-wide text-white transition hover:border-cyan-400/50 hover:bg-cyan-400/10" />
          </div>
        </div>
      </section>
    </main>
  )
}
