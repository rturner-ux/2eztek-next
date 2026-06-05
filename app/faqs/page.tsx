import type { Metadata } from 'next'
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
    <main className="min-h-screen bg-[#050B14] px-6 py-32 text-white lg:px-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="mx-auto max-w-5xl">
        <div className="inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-cyan-300">
          Help Center
        </div>
        <h1 className="mt-6 text-4xl font-black leading-tight md:text-6xl">
          Fitness Equipment Repair FAQs
        </h1>
        <p className="mt-5 max-w-3xl text-lg leading-relaxed text-white/60">
          Browse answers about repairs, maintenance, assembly, and commercial
          fitness equipment service across Dallas Fort Worth.
        </p>

        <nav className="mt-10 flex flex-wrap gap-3" aria-label="FAQ categories">
          {categories.map((category) => (
            <a
              key={category}
              href={`#${category.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-white transition hover:border-cyan-400/40 hover:bg-cyan-400/10"
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
              <h2 className="text-2xl font-black text-cyan-300">{category}</h2>
              <div className="mt-5 space-y-4">
                {faqs
                  .filter((faq) => (faq.category || 'General') === category)
                  .map((faq) => (
                    <details
                      key={faq.question}
                      className="rounded-2xl border border-white/10 bg-white/[0.04] p-5"
                    >
                      <summary className="cursor-pointer font-black text-white">
                        {faq.question}
                      </summary>
                      <p className="mt-4 leading-relaxed text-white/65">
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
            className="rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-sm font-black uppercase tracking-[0.12em] text-white transition hover:border-cyan-400/30 hover:bg-cyan-400/10"
          >
            Back To Home
          </Link>
        </div>
      </div>
    </main>
  )
}
