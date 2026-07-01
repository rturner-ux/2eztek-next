'use client'

import { useState } from 'react'
import Link from 'next/link'

type Faq = {
  question: string
  answer: string
  category: string | null
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="border-b border-slate-200">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-4 py-5 text-left"
        aria-expanded={open}
      >
        <span className="font-bold text-slate-900 leading-snug text-[15px]">{question}</span>
        <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center bg-cyan-600 text-white font-black text-lg leading-none">
          {open ? '−' : '+'}
        </span>
      </button>
      {open && (
        <div className="pb-6 pr-12 text-[15px] text-slate-600 leading-relaxed">
          {answer}
        </div>
      )}
    </div>
  )
}

export default function FaqsClient({
  faqs,
  categories,
}: {
  faqs: Faq[]
  categories: string[]
}) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  return (
    <div className="mx-auto max-w-4xl px-6 py-12 lg:px-8">

      {/* Category tabs */}
      <nav className="flex flex-wrap gap-2 border-b border-slate-200 pb-8 mb-12" aria-label="FAQ categories">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => {
              setActiveCategory(activeCategory === category ? null : category)
              const el = document.getElementById(category.toLowerCase().replace(/[^a-z0-9]+/g, '-'))
              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }}
            className="rounded border border-slate-300 bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.1em] text-slate-700 transition hover:border-cyan-500 hover:text-cyan-700"
          >
            {category}
          </button>
        ))}
      </nav>

      {/* FAQ sections */}
      <div className="space-y-14">
        {categories.map((category) => {
          const items = faqs.filter((f) => (f.category || 'General') === category)
          if (!items.length) return null
          return (
            <section
              key={category}
              id={category.toLowerCase().replace(/[^a-z0-9]+/g, '-')}
              className="scroll-mt-28"
            >
              <div className="mb-6">
                <h2 className="text-lg font-black uppercase tracking-[0.08em] text-slate-900">
                  {category}
                </h2>
                <hr className="mt-3 border-slate-900" />
              </div>

              <div>
                {items.map((faq) => (
                  <FaqItem
                    key={faq.question}
                    question={faq.question}
                    answer={faq.answer}
                  />
                ))}
              </div>
            </section>
          )
        })}
      </div>

      {/* CTA */}
      <div className="mt-16 border-t border-slate-200 pt-12 text-center">
        <p className="text-slate-600 mb-6">
          Can&apos;t find what you&apos;re looking for? We&apos;re happy to help.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/contact"
            className="rounded bg-cyan-600 px-8 py-3 text-sm font-black uppercase tracking-[0.1em] text-white transition hover:bg-cyan-700"
          >
            Book a Repair
          </Link>
          <a
            href="tel:9728077232"
            className="rounded border border-slate-300 bg-white px-8 py-3 text-sm font-black uppercase tracking-[0.1em] text-slate-700 transition hover:border-cyan-500"
          >
            (972) 807-7232
          </a>
        </div>
      </div>
    </div>
  )
}
