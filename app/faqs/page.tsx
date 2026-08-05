import type { Metadata } from 'next'
import Image from 'next/image'
import { createClient } from '@supabase/supabase-js'
import FaqsClient from './FaqsClient'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Fitness Equipment Repair FAQs Dallas Fort Worth',
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

      {/* Hero */}
      <section className="relative flex min-h-[45vh] items-end overflow-hidden pb-12 pt-36">
        <Image
          src="/images/gym-equipment-repair-dallas.webp"
          alt="Fitness equipment repair FAQ Dallas Fort Worth"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/55" />
        <div className="relative z-10 w-full px-6 text-center lg:px-8">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-white/70 mb-3">FAQs</p>
          <h1 className="text-4xl font-black uppercase leading-tight text-white md:text-5xl">
            How Can We Help?
          </h1>
        </div>
      </section>

      {/* Intro */}
      <div className="border-b border-slate-200 py-8 text-center px-6">
        <p className="text-slate-600 text-[15px] max-w-2xl mx-auto">
          Browse our most frequently asked questions. Can&apos;t find the answer you&apos;re looking for?{' '}
          <a href="/contact" className="text-cyan-600 hover:underline">Contact us</a>{' '}
          for a service request or general inquiry, we&apos;re happy to help.
        </p>
      </div>

      <FaqsClient faqs={faqs} categories={categories} />
    </main>
  )
}
