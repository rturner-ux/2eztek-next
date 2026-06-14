'use client'

import Image from 'next/image'
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
    <div className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm">
      <h2 className="text-2xl font-black text-slate-900">{title}</h2>
      <ul className="mt-6 grid gap-3">
        {items.map((item) => (
          <li
            key={item}
            className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold leading-6 text-slate-600"
          >
            <span className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-cyan-500" />
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
    <main className="min-h-screen bg-white text-slate-900">
      <section className="relative min-h-[80vh] overflow-hidden pt-36 pb-24 lg:pt-44 lg:pb-32">
        <Image
          src="/images/commercial-gym-maintenance.webp"
          alt="Fitness equipment brand repair and service"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.55)_0%,rgba(0,0,0,0.20)_50%,transparent_100%)]" />
        <div className="relative mx-auto max-w-6xl px-6">
          <div className="max-w-3xl">
            <div className="mb-4 inline-flex rounded-full border border-white/30 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.25em] text-white backdrop-blur-sm">
              {eyebrow}
            </div>
            <h1 className="text-5xl font-black leading-tight text-white md:text-6xl">
              {title}
            </h1>
            <p className="mt-6 text-lg leading-8 text-white/80">
              {description}
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <a
                href="tel:9728077232"
                className="rounded-2xl bg-cyan-400 px-8 py-4 text-sm font-black uppercase tracking-wide text-black shadow-[0_0_35px_rgba(34,211,238,0.18)] transition hover:scale-105 hover:bg-cyan-300"
              >
                Call 972-807-7232
              </a>
              <BookServiceButton className="rounded-2xl border border-white/30 bg-white/10 px-8 py-4 text-sm font-black uppercase tracking-wide text-white backdrop-blur-sm transition hover:border-white/60 hover:bg-white/20" />
              {affiliateUrl && (
                <a
                  href={affiliateUrl}
                  target="_blank"
                  rel="nofollow sponsored noopener"
                  className="rounded-2xl border border-white/30 bg-white/10 px-8 py-4 text-sm font-black uppercase tracking-wide text-white backdrop-blur-sm transition hover:border-white/60 hover:bg-white/20"
                >
                  Shop {affiliateBrand ?? 'Official Site'}
                </a>
              )}
            </div>
            {affiliateUrl && (
              <p className="mt-4 text-xs text-white/50">
                Affiliate link. We may earn a commission at no cost to you.
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="mb-8 grid gap-4 md:grid-cols-2">
          <button className="rounded-[2rem] border border-cyan-200 bg-cyan-50 p-6 text-left">
            <div className="text-xs font-black uppercase tracking-[0.25em] text-cyan-600">
              Brand
            </div>
            <div className="mt-2 text-2xl font-black text-slate-900">{title.replace(/ Repair.*$/i, '')}</div>
          </button>
          <button className="rounded-[2rem] border border-slate-200 bg-slate-50 p-6 text-left">
            <div className="text-xs font-black uppercase tracking-[0.25em] text-cyan-600">
              Category
            </div>
            <div className="mt-2 text-2xl font-black text-slate-900">Fitness Equipment Support</div>
          </button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <SupportList title="Common Issues" items={issues} />
          <SupportList title="Services We Provide" items={services} />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="rounded-[2rem] bg-slate-900 p-10 text-center text-white">
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
