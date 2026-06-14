import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import BookServiceButton from '@/components/BookServiceButton'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Fitness Equipment Repair FAQs Dallas Fort Worth | 2EZ TEK',
  description:
    'Find answers about treadmill repair, elliptical service, gym equipment assembly, preventative maintenance, and commercial fitness equipment service in Dallas Fort Worth.',
  alternates: {
    canonical: 'https://www.2eztek.com/faqs',
  },
  openGraph: {
    title: 'Fitness Equipment Repair FAQs | 2EZ TEK',
    description:
      'Helpful answers about fitness equipment repair, maintenance, and assembly in Dallas Fort Worth.',
    url: 'https://www.2eztek.com/faqs',
    siteName: '2EZ TEK',
    type: 'website',
  },
}

type Faq = {
  question: string
  answer: string
  category: string | null
}

async function getFaqs(): Promise<Faq[]> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) return []

  const supabase = createClient(supabaseUrl, serviceRoleKey)
  const { data, error } = await supabase
    .from('faqs')
    .select('question, answer, category')
    .eq('active', true)
    .order('sort_order', { ascending: true })
    .limit(200)

  if (error) {
    console.error('FAQ DIRECTORY ERROR:', error)
    return []
  }

  return data || []
}

export default async function FaqsPage() {
  const faqs = await getFaqs()
  const categories = Array.from(
    new Set(faqs.map((faq) => faq.category || 'General'))
  )

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* ── Hero ── */}
      <section className="relative flex min-h-[65vh] items-center overflow-hidden pt-36 pb-16 lg:pt-44">
        <Image
          src="/images/gym-equipment-repair-dallas.webp"
          alt="Fitness equipment repair FAQ Dallas Fort Worth"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.55)_0%,rgba(0,0,0,0.20)_50%,transparent_100%)]" />
        <div className="relative z-10 px-6 lg:px-16">
          <div className="mb-4 inline-flex rounded-full border border-white/30 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-white backdrop-blur-sm">
            Help Center
          </div>
          <h1 className="mt-4 text-4xl font-black leading-tight text-white md:text-6xl">
            Fitness Equipment<span className="block text-cyan-400">Repair FAQs</span>
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-relaxed text-white/80">
            Browse answers about repairs, maintenance, assembly, and commercial
            fitness equipment service across Dallas Fort Worth.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-6 py-16 lg:px-16">

        <nav className="flex flex-wrap gap-3" aria-label="FAQ categories">
          {categories.map((category) => (
            <a
              key={category}
              href={`#${category.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-slate-700 shadow-sm transition hover:border-cyan-300 hover:bg-cyan-50"
            >
              {category}
            </a>
          ))}
        </nav>

        <div className="mt-14 space-y-14">
          {categories.map((category) => (
            <section
              key={category}
              id={category.toLowerCase().replace(/[^a-z0-9]+/g, '-')}
              className="scroll-mt-28"
            >
              <h2 className="text-2xl font-black text-cyan-600">{category}</h2>
              <div className="mt-5 space-y-4">
                {faqs
                  .filter((faq) => (faq.category || 'General') === category)
                  .map((faq) => (
                    <details
                      key={faq.question}
                      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                    >
                      <summary className="cursor-pointer font-black text-slate-900">
                        {faq.question}
                      </summary>
                      <p className="mt-4 leading-relaxed text-slate-600">
                        {faq.answer}
                      </p>
                    </details>
                  ))}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-16 flex flex-wrap gap-4">
          <BookServiceButton
            className="rounded-2xl bg-cyan-400 px-6 py-4 text-sm font-black uppercase tracking-[0.12em] text-black transition hover:bg-cyan-300"
          />
          <Link
            href="/"
            className="rounded-2xl border border-slate-200 bg-white px-6 py-4 text-sm font-black uppercase tracking-[0.12em] text-slate-700 shadow-sm transition hover:border-cyan-300 hover:bg-cyan-50"
          >
            Back To Home
          </Link>
        </div>
      </div>
    </main>
  )
}
