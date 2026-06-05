'use client'

import { motion } from 'framer-motion'
import BookServiceButton from '@/components/BookServiceButton'

const phoneDisplay = '(972) 807-7232'
const phoneHref = 'tel:9728077232'
const primaryEmail = 'support@2eztek.com'
const infoEmail = 'info@2eztek.com'
const careersEmail = 'jobs@2eztek.com'
const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number]

const contactCards = [
  { title: 'Phone', value: phoneDisplay, text: 'Call or text for service', href: phoneHref },
  { title: 'Support', value: primaryEmail, text: 'Repair and service support', href: `mailto:${primaryEmail}` },
  { title: 'General Info', value: infoEmail, text: 'Business inquiries', href: `mailto:${infoEmail}` },
  { title: 'Careers', value: careersEmail, text: 'Technician opportunities', href: `mailto:${careersEmail}` },
]

export default function ContactPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050B14] text-white">
      <div className="fixed inset-0 z-0 overflow-hidden">
        <motion.img
          src="/images/contact-out-of-order.png"
          alt="Out of order treadmill background"
          initial={{ scale: 1.08, x: '-5%' }}
          animate={{ scale: 1.08, x: ['-5%', '5%'] }}
          transition={{ duration: 80, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
          className="h-full w-[112%] max-w-none object-cover opacity-90"
        />
        <div className="absolute inset-0 bg-[#050B14]/15" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,11,20,0.75)_0%,rgba(5,11,20,0.35)_42%,rgba(5,11,20,0.05)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.2),transparent_38%)]" />
      </div>

      <section className="relative z-10 px-6 pb-16 pt-32 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-4xl">
            <div className="mb-6 inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm font-black uppercase tracking-[0.22em] text-cyan-300">
              Contact 2EZ TEK
            </div>

            <h1 className="text-5xl font-black leading-[0.95] tracking-tight md:text-7xl">
              Repair, Assembly,
              <span className="block text-cyan-300">And Service Requests.</span>
            </h1>

            <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-200">
              Use the same booking form from across the site for repairs, assembly,
              diagnostics, and commercial maintenance. Your request goes straight
              into the service intake flow.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <BookServiceButton
                label="Book Service"
                className="rounded-2xl bg-cyan-300 px-7 py-4 text-center text-sm font-black uppercase tracking-[0.12em] text-slate-950 shadow-[0_0_40px_rgba(34,211,238,0.35)] transition hover:bg-cyan-200"
              />

              <a href={phoneHref} className="rounded-2xl border border-white/20 bg-white/10 px-7 py-4 text-center text-sm font-black uppercase tracking-[0.12em] text-white backdrop-blur-xl transition hover:bg-white/15">
                Call {phoneDisplay}
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 px-6 py-14 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-6 md:grid-cols-4">
            {contactCards.map((item) => (
              <a key={item.title} href={item.href} className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-7 text-center shadow-2xl backdrop-blur-xl transition hover:border-cyan-400/30 hover:bg-cyan-400/10">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-cyan-300/60 bg-cyan-300/10 text-xs font-black uppercase tracking-[0.2em] text-cyan-200">
                  {item.title.slice(0, 2)}
                </div>

                <h3 className="mt-6 text-2xl font-black">{item.title}</h3>
                <p className="mt-3 break-words text-lg font-black text-cyan-300">{item.value}</p>
                <p className="mt-2 text-sm text-slate-400">{item.text}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section id="service-request" className="relative z-10 px-6 py-24 lg:px-16">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <div>
            <div className="text-sm font-black uppercase tracking-[0.28em] text-cyan-300">
              Service Intake
            </div>

            <h2 className="mt-5 text-4xl font-black leading-tight md:text-5xl">
              One Booking Flow
              <span className="block">For Every Request.</span>
            </h2>

            <p className="mt-6 max-w-md text-lg leading-8 text-slate-300">
              The contact page now uses the same working booking form as the
              header, home page, service pages, and brand pages.
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE }}
            className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-8 shadow-[0_30px_100px_rgba(0,0,0,0.35)] backdrop-blur-xl md:p-10"
          >
            <div className="text-sm font-black uppercase tracking-[0.28em] text-cyan-300">
              Book Service
            </div>

            <h3 className="mt-4 text-3xl font-black md:text-4xl">
              Tell us what needs repaired or installed.
            </h3>

            <p className="mt-5 max-w-2xl leading-8 text-slate-300">
              The booking form collects your contact details, service address,
              equipment information, issue description, and optional photo for
              AI-assisted diagnostics.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <BookServiceButton
                label="Open Booking Form"
                className="button-glow rounded-2xl bg-cyan-400 px-8 py-5 text-center text-sm font-black uppercase tracking-[0.15em] text-black transition hover:bg-cyan-300"
              />

              <a href={phoneHref} className="rounded-2xl border border-white/15 bg-white/5 px-8 py-5 text-center text-sm font-black uppercase tracking-[0.15em] text-white transition hover:border-cyan-400/30">
                Call Instead
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  )
}
