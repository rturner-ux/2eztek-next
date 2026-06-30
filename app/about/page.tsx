import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'About 2EZ TEK — Veteran-Owned Fitness Equipment Repair in Dallas Fort Worth',
  description: '2EZ TEK is a veteran-owned fitness equipment repair company built on discipline, certified standards, and one promise: we got your back. Serving DFW since 2019.',
  alternates: { canonical: 'https://www.2eztek.com/about' },
  openGraph: {
    title: 'About 2EZ TEK | Veteran-Owned Fitness Equipment Repair, Dallas TX',
    description: '4.9 stars. 500+ reviews. Founded 2019. Veteran-owned, NCFET-certified, Six Sigma-operated. Mobile fitness equipment repair across all of DFW.',
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
        <p className="text-xs font-black tracking-[0.3em] text-[#00E5B4] mb-4">VETERAN-OWNED · DALLAS FORT WORTH · EST. 2019</p>
        <h1 className="text-4xl md:text-5xl font-black leading-tight mb-6">
          We got your back.
        </h1>
        <p className="text-lg text-slate-300 leading-relaxed">
          2EZ TEK is a mobile fitness equipment repair company built on one belief: when your equipment goes down, someone reliable should show up, fix it right the first time, and treat your home or facility like it matters. That is not a tagline. It is a standard every technician on this team is trained and held to.
        </p>
      </section>

      {/* The Promise */}
      <section className="px-6 py-12 max-w-4xl mx-auto">
        <div className="rounded-3xl border border-[#00E5B4]/20 bg-[#00E5B4]/5 p-8 md:p-12 text-center">
          <p className="text-xs font-black tracking-[0.3em] text-[#00E5B4] mb-4">THE 2EZ TEK PROMISE</p>
          <h2 className="text-2xl md:text-3xl font-black mb-6 leading-snug">
            You are not calling a contractor.<br className="hidden md:block" />
            You are calling a team with a standard.
          </h2>
          <p className="text-slate-300 leading-relaxed max-w-2xl mx-auto">
            Every technician who represents 2EZ TEK goes through the same training, follows the same protocols, and documents every job the same way. Whether it is your first call or your fiftieth, you get the same 2EZ TEK experience. That consistency is not an accident. It is the system we built so the quality never depends on who shows up.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="px-6 py-8 max-w-4xl mx-auto">
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

      {/* Residential First */}
      <section className="px-6 py-12 max-w-4xl mx-auto">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 md:p-12">
          <p className="text-xs font-black tracking-[0.25em] text-[#00E5B4] mb-4">WHO WE SERVE</p>
          <h2 className="text-2xl font-black mb-6">Built for the home. Ready for the facility.</h2>
          <div className="grid md:grid-cols-2 gap-8 text-slate-300 leading-relaxed">
            <div>
              <p className="mb-4">
                Customers choose 2EZ TEK because we actually care about the home. Your treadmill sits in your living room or your garage. It is part of your routine, your health, your household. We treat it that way. No attitude about residential calls. No upsells you did not ask for. Just a technician who shows up ready to fix it.
              </p>
              <p>
                That residential focus is what separates us from companies that only chase commercial contracts. We earn the commercial accounts because we proved ourselves at the front door first.
              </p>
            </div>
            <div>
              <p className="mb-4">
                For apartment communities, hotels, corporate fitness rooms, and commercial gyms, 2EZ TEK delivers scheduled maintenance contracts, priority emergency response, and SmartGymOps documentation so facility managers have a clear record of every machine&apos;s service history.
              </p>
              <p>
                Residential or commercial, the standard is the same. On time. Documented. Fixed right.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="px-6 py-12 max-w-4xl mx-auto">
        <h2 className="text-2xl font-black mb-3 text-center">How We Operate</h2>
        <p className="text-center text-slate-400 text-sm mb-8 max-w-xl mx-auto">These are not values on a wall. They are the process every 2EZ TEK technician follows on every job, every time.</p>
        <div className="grid md:grid-cols-2 gap-4">
          {[
            {
              title: 'Show up. On time.',
              body: 'We book a time, we keep it. If anything changes, you hear from us before the window. Your time is not ours to waste.',
            },
            {
              title: 'Diagnose before you bill.',
              body: 'We identify the problem, tell you what it costs, and wait for your go-ahead before touching a part. No surprises on the invoice.',
            },
            {
              title: 'Carry what you need.',
              body: 'Technicians stock common belts, boards, lubricants, cables, and parts on every truck. Most repairs are handled in one visit without a return trip.',
            },
            {
              title: 'Document everything.',
              body: 'Every job is logged: parts used, work performed, machine condition. That history protects you if the same issue comes back and gives facility managers the records they need.',
            },
            {
              title: 'No shortcuts.',
              body: 'NCFET-standard diagnostic protocols on every repair. Lockout before opening any motor cover. Right tools, right process, every time. Shortcuts cause callbacks. We do not do callbacks.',
            },
            {
              title: 'Stand behind the work.',
              body: '4.9 stars across 500+ reviews is the result of doing things the right way consistently, not just on the first call. That reputation belongs to the team. We protect it.',
            },
          ].map((item) => (
            <div key={item.title} className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h3 className="font-black text-white mb-2">{item.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Foundation */}
      <section className="px-6 py-12 max-w-4xl mx-auto">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 md:p-12">
          <p className="text-xs font-black tracking-[0.25em] text-[#00E5B4] mb-4">THE FOUNDATION</p>
          <h2 className="text-2xl font-black mb-6">Where the standard came from</h2>
          <p className="text-slate-300 leading-relaxed mb-4">
            2EZ TEK was built in Dallas, TX by a USMC Veteran and enterprise IT Director who holds a Six Sigma Black Belt, dual Scrum Master certifications, and a decade of running technology programs for manufacturing and corporate operations. Every one of those systems was brought into fitness equipment repair: documented protocols, accountability at every step, and SmartGymOps, a proprietary platform that tracks every machine&apos;s service history the way an enterprise IT system tracks assets.
          </p>
          <p className="text-slate-300 leading-relaxed mb-4">
            Add ISSA certifications in Personal Training and Sports Nutrition, CPR/AED credentials, and NCFET field certification, and you have a background that does not exist at any other repair company in DFW. It is why the process is different, and why 500+ five-star reviews back it up.
          </p>
          <p className="text-slate-300 leading-relaxed">
            2EZ TEK is growing. New markets, new technicians, and a presence across more of Texas. The standard travels with the brand, not with any one person. When you call 2EZ TEK, you get 2EZ TEK.
          </p>

          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'USMC Veteran',           desc: 'Discipline-first mindset' },
              { label: 'Six Sigma Black Belt',   desc: 'CSSBB + CSSGB certified' },
              { label: 'Enterprise IT Director', desc: 'Why SmartGymOps exists' },
              { label: 'Certified Scrum Master', desc: 'CSM · SMC dual certified' },
              { label: 'NCFET Certified Tech',   desc: 'National field standard' },
              { label: 'ISSA Personal Trainer',  desc: 'NCCPT-CPT certified' },
              { label: 'Sports Nutritionist',    desc: 'ISSA certified' },
              { label: 'CPR & AED Certified',    desc: 'First-response ready' },
            ].map((cred) => (
              <div key={cred.label} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-center">
                <p className="text-xs font-black text-white leading-snug mb-1">{cred.label}</p>
                <p className="text-[11px] text-slate-500">{cred.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-16 text-center max-w-xl mx-auto">
        <h2 className="text-2xl font-black mb-3">Ready to get your equipment running?</h2>
        <p className="text-slate-400 mb-8">Same-day and next-day appointments available across Dallas Fort Worth. We got your back.</p>
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
