import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'About 2EZ TEK — Veteran-Owned Fitness Equipment Repair in Dallas Fort Worth',
  description: 'Learn about 2EZ TEK, founded by Robby Turner — USMC Veteran, Six Sigma Black Belt, and Certified Personal Trainer. Serving DFW since 2019 with 4.9 stars across 500+ reviews.',
  alternates: { canonical: 'https://www.2eztek.com/about' },
  openGraph: {
    title: 'About 2EZ TEK | Veteran-Owned Fitness Equipment Repair, Dallas TX',
    description: '4.9 stars. 500+ reviews. Founded 2019 by Robby Turner, USMC Veteran and Six Sigma Black Belt. Mobile fitness equipment repair across all of DFW.',
    url: 'https://www.2eztek.com/about',
    siteName: '2EZ TEK',
    type: 'website',
  },
}

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#050B14] text-white">

      {/* Hero */}
      <section className="px-6 pt-20 pb-16 text-center max-w-3xl mx-auto">
        <p className="text-xs font-black tracking-[0.3em] text-[#00E5B4] mb-4">VETERAN-OWNED · DALLAS FORT WORTH</p>
        <h1 className="text-4xl md:text-5xl font-black leading-tight mb-6">
          About 2EZ TEK
        </h1>
        <p className="text-lg text-slate-300 leading-relaxed">
          2EZ TEK is a mobile fitness equipment repair and maintenance company serving Dallas Fort Worth since 2019. We come to you — home, apartment, hotel, or commercial gym — and fix it on-site. No haul-away. No waiting weeks for a service center appointment.
        </p>
      </section>

      {/* Founder */}
      <section className="px-6 py-16 max-w-4xl mx-auto">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 md:p-12">
          <p className="text-xs font-black tracking-[0.25em] text-[#00E5B4] mb-4">FOUNDER &amp; OWNER</p>
          <h2 className="text-3xl font-black mb-6">Robby Turner</h2>

          <div className="grid md:grid-cols-2 gap-8 text-slate-300 leading-relaxed">
            <div>
              <p className="mb-4">
                Robby Turner founded 2EZ TEK in 2019 with a straightforward mission: give DFW residents and businesses a fitness equipment service company they could actually trust to show up, diagnose the problem correctly, and fix it right the first time.
              </p>
              <p>
                Robby served in the United States Marine Corps, where he developed the discipline and attention to detail that define how 2EZ TEK operates today. Every service call runs on the same principles he learned in uniform: be on time, communicate clearly, and never cut corners.
              </p>
            </div>
            <div>
              <p className="mb-4">
                As a Six Sigma Black Belt, Robby applies process improvement methodology to how 2EZ TEK runs its field operations — reducing repeat visits, tightening diagnostic accuracy, and ensuring technicians carry the right parts on every truck.
              </p>
              <p>
                As a Certified Personal Trainer, he understands fitness equipment from the user's perspective, not just the repair bench. That context shapes how 2EZ TEK communicates with customers and how technicians assess whether a machine is performing safely.
              </p>
            </div>
          </div>

          {/* Credentials */}
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'USMC Veteran', icon: '🎖️' },
              { label: 'Six Sigma Black Belt', icon: '⚫' },
              { label: 'Certified Scrum Master', icon: '📋' },
              { label: 'Certified Personal Trainer', icon: '💪' },
            ].map((cred) => (
              <div key={cred.label} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
                <p className="text-2xl mb-2">{cred.icon}</p>
                <p className="text-xs font-black text-slate-300 leading-snug">{cred.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="px-6 py-12 max-w-4xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          {[
            { stat: '4.9★', label: 'Average Rating' },
            { stat: '500+', label: 'Verified Reviews' },
            { stat: '2019', label: 'Year Founded' },
            { stat: 'All DFW', label: 'Service Area' },
          ].map((item) => (
            <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <p className="text-3xl font-black text-[#00E5B4] mb-1">{item.stat}</p>
              <p className="text-sm text-slate-400">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why 2EZ TEK */}
      <section className="px-6 py-12 max-w-3xl mx-auto">
        <h2 className="text-2xl font-black mb-8 text-center">Why Customers Choose 2EZ TEK</h2>
        <div className="space-y-4">
          {[
            {
              title: 'We come to you',
              body: 'Fully mobile operation. We show up at your home, apartment, hotel, or commercial gym anywhere in Dallas Fort Worth with a loaded truck.',
            },
            {
              title: 'Most repairs done in one visit',
              body: 'Technicians carry common belts, lubricants, boards, cables, and parts on every truck. Most treadmill and elliptical repairs are completed same-day.',
            },
            {
              title: 'Transparent pricing',
              body: 'We diagnose the problem and give you a clear quote before any work begins. No surprises, no upsells you did not ask for.',
            },
            {
              title: 'Commercial-grade reliability',
              body: 'Hotels, apartment communities, and corporate gyms trust 2EZ TEK for scheduled maintenance contracts because we show up when we say we will and document every visit.',
            },
            {
              title: 'Veteran-owned accountability',
              body: 'The same discipline that governed Robby Turner\'s service in the Marines governs how 2EZ TEK operates: punctuality, honesty, and work that stands behind itself.',
            },
          ].map((item) => (
            <div key={item.title} className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h3 className="font-black text-white mb-2">{item.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-16 text-center max-w-xl mx-auto">
        <h2 className="text-2xl font-black mb-4">Ready to get your equipment running again?</h2>
        <p className="text-slate-400 mb-8">Same-day and next-day appointments available across Dallas Fort Worth.</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/contact"
            className="rounded-full bg-[#00E5B4] px-8 py-4 font-black text-[#050B14] hover:brightness-110 transition">
            Book a Repair
          </Link>
          <a href="tel:9728077232"
            className="rounded-full border border-white/20 px-8 py-4 font-black text-white hover:bg-white/10 transition">
            (972) 807-7232
          </a>
        </div>
      </section>

    </main>
  )
}
