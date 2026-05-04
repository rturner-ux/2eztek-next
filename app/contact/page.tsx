'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

const phoneDisplay = '(972) 807-7232'
const phoneHref = 'tel:9728077232'

const primaryEmail = 'support@2eztek.com'
const infoEmail = 'info@2eztek.com'
const careersEmail = 'jobs@2eztek.com'

export default function ContactPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050B14] text-white">
      <div className="fixed inset-0 z-0 overflow-hidden">
        <motion.img
          src="/images/contact-out-of-order.png"
          alt="Out of order treadmill background"
          initial={{ scale: 1.08, x: '-5%' }}
          animate={{ scale: 1.08, x: ['-5%', '5%'] }}
          transition={{
            duration: 80,
            repeat: Infinity,
            repeatType: 'mirror',
            ease: 'easeInOut',
          }}
          className="h-full w-[112%] max-w-none object-cover opacity-30"
        />

        <div className="absolute inset-0 bg-[#050B14]/75" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,11,20,0.98)_0%,rgba(5,11,20,0.82)_42%,rgba(5,11,20,0.64)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.18),transparent_38%)]" />
      </div>

      <section className="relative z-10 px-6 pb-20 pt-28 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <div className="mb-6 inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm font-black uppercase tracking-[0.22em] text-cyan-300">
              Contact 2EZ TEK
            </div>

            <h1 className="text-5xl font-black leading-[0.95] tracking-tight md:text-7xl">
              We’re Here
              <span className="block text-cyan-300">To Help.</span>
            </h1>

            <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-200">
              For fitness equipment repair, assembly, maintenance, or commercial
              service, reach out to our team and we’ll get you taken care of.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <a
                href={phoneHref}
                className="rounded-2xl bg-cyan-300 px-7 py-4 text-center text-sm font-black uppercase tracking-[0.12em] text-slate-950 shadow-[0_0_40px_rgba(34,211,238,0.35)] transition hover:bg-cyan-200"
              >
                Call {phoneDisplay}
              </a>

              <a
                href={`mailto:${primaryEmail}`}
                className="rounded-2xl border border-white/20 bg-white/10 px-7 py-4 text-center text-sm font-black uppercase tracking-[0.12em] text-white backdrop-blur-xl transition hover:bg-white/15"
              >
                Email Support
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 px-6 py-20 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <div className="text-sm font-black uppercase tracking-[0.28em] text-cyan-300">
              Get In Touch
            </div>

            <h2 className="mt-4 text-4xl font-black md:text-5xl">
              Multiple Ways To Reach Us
            </h2>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-4">
            {[
              {
                title: 'Phone',
                value: phoneDisplay,
                text: 'Call or text anytime',
                href: phoneHref,
                icon: '☎',
              },
              {
                title: 'Support',
                value: primaryEmail,
                text: 'Service & repair support',
                href: `mailto:${primaryEmail}`,
                icon: '🛠',
              },
              {
                title: 'General Info',
                value: infoEmail,
                text: 'Questions & business inquiries',
                href: `mailto:${infoEmail}`,
                icon: '✉',
              },
              {
                title: 'Careers',
                value: careersEmail,
                text: 'Technician opportunities',
                href: `mailto:${careersEmail}`,
                icon: '⚒',
              },
            ].map((item) => (
              <a
                key={item.title}
                href={item.href}
                className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-7 text-center shadow-2xl backdrop-blur-xl transition hover:border-cyan-400/30 hover:bg-cyan-400/10"
              >
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-cyan-300/60 bg-cyan-300/10 text-2xl">
                  {item.icon}
                </div>

                <h3 className="mt-6 text-2xl font-black">{item.title}</h3>

                <p className="mt-3 break-words text-lg font-black text-cyan-300">
                  {item.value}
                </p>

                <p className="mt-2 text-sm text-slate-400">{item.text}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 px-6 py-24 lg:px-16">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div>
            <div className="text-sm font-black uppercase tracking-[0.28em] text-cyan-300">
              Send Us A Message
            </div>

            <h2 className="mt-5 text-4xl font-black leading-tight md:text-5xl">
              Request Service
              <span className="block">Or Ask a Question</span>
            </h2>

            <p className="mt-6 max-w-md text-lg leading-8 text-slate-300">
              Fill out the form and our team will get back to you as soon as
              possible.
            </p>

            <div className="mt-8 space-y-4 text-slate-200">
              {['Fast Response', 'Expert Technicians', 'Quality Service Guaranteed'].map(
                (item) => (
                  <div key={item} className="flex items-center gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-300 text-xs font-black text-slate-950">
                      ✓
                    </span>
                    {item}
                  </div>
                )
              )}
            </div>
          </div>

          <form className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 shadow-[0_30px_100px_rgba(0,0,0,0.35)] backdrop-blur-xl">
            <div className="grid gap-4 md:grid-cols-2">
              <input placeholder="Full Name" className="rounded-xl border border-white/10 bg-black/30 px-5 py-4 text-white outline-none placeholder:text-slate-500 focus:border-cyan-300/50" />
              <input placeholder="Phone Number" className="rounded-xl border border-white/10 bg-black/30 px-5 py-4 text-white outline-none placeholder:text-slate-500 focus:border-cyan-300/50" />
              <input placeholder="Email Address" className="rounded-xl border border-white/10 bg-black/30 px-5 py-4 text-white outline-none placeholder:text-slate-500 focus:border-cyan-300/50" />

              <select className="rounded-xl border border-white/10 bg-[#07101D] px-5 py-4 text-white outline-none focus:border-cyan-300/50">
                <option>Service Type</option>
                <option>Treadmill Repair</option>
                <option>Gym Equipment Repair</option>
                <option>Equipment Assembly</option>
                <option>Commercial Maintenance</option>
                <option>Preventive Maintenance</option>
              </select>
            </div>

            <input placeholder="Service Address" className="mt-4 w-full rounded-xl border border-white/10 bg-black/30 px-5 py-4 text-white outline-none placeholder:text-slate-500 focus:border-cyan-300/50" />

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <input placeholder="Equipment Type" className="rounded-xl border border-white/10 bg-black/30 px-5 py-4 text-white outline-none placeholder:text-slate-500 focus:border-cyan-300/50" />
              <input placeholder="Brand / Model" className="rounded-xl border border-white/10 bg-black/30 px-5 py-4 text-white outline-none placeholder:text-slate-500 focus:border-cyan-300/50" />
            </div>

            <textarea rows={6} placeholder="Describe the issue or project details" className="mt-4 w-full resize-none rounded-xl border border-white/10 bg-black/30 px-5 py-4 text-white outline-none placeholder:text-slate-500 focus:border-cyan-300/50" />

            <button
              type="button"
              className="mt-4 w-full rounded-xl bg-cyan-300 px-6 py-5 text-sm font-black uppercase tracking-[0.14em] text-slate-950 transition hover:bg-cyan-200"
            >
              Send Message
            </button>
          </form>
        </div>
      </section>

      <footer className="relative z-10 border-t border-white/10 bg-[#03070D]/90 px-6 py-14 backdrop-blur-xl">
        <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-4">
          <div>
            <img src="/logo.png" alt="2EZ TEK" className="h-20 w-auto object-contain" />

            <p className="mt-5 max-w-sm leading-7 text-slate-400">
              Professional fitness equipment repair, assembly, installation,
              and maintenance for homes and commercial facilities across Dallas
              Fort Worth.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-black uppercase tracking-[0.25em] text-cyan-300">
              Quick Links
            </h3>

            <div className="mt-5 grid gap-3 text-slate-400">
              <Link href="/gym-equipment-repair-dallas">Home Services</Link>
              <Link href="/commercial-gym-maintenance">Commercial Maintenance</Link>
              <Link href="https://smartgymops.com">SmartGymOps</Link>
              <Link href="/reviews">Reviews</Link>
              <Link href="/about-2ez-tek">About 2EZ TEK</Link>
              <Link href="/contact">Contact</Link>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-black uppercase tracking-[0.25em] text-cyan-300">
              Services
            </h3>

            <div className="mt-5 grid gap-3 text-slate-400">
              <Link href="/treadmill-repair-dallas">Treadmill Repair</Link>
              <Link href="/gym-equipment-repair-dallas">Gym Equipment Repair</Link>
              <Link href="/gym-equipment-assembly-dallas">Equipment Assembly</Link>
              <Link href="/commercial-gym-maintenance">Preventive Maintenance</Link>
              <Link href="/commercial-gym-installation-dallas">Commercial Installation</Link>
              <Link href="/tech-onsite">Onsite Service</Link>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-black uppercase tracking-[0.25em] text-cyan-300">
              Contact Info
            </h3>

            <div className="mt-5 grid gap-4 text-slate-400">
              <a href={phoneHref}>{phoneDisplay}</a>
              <a href={`mailto:${primaryEmail}`}>{primaryEmail}</a>
              <a href={`mailto:${infoEmail}`}>{infoEmail}</a>
              <a href={`mailto:${careersEmail}`}>{careersEmail}</a>
              <p>Dallas Fort Worth, TX</p>
              <p>24/7 Emergency Support</p>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-12 flex max-w-7xl flex-col gap-4 border-t border-white/10 pt-6 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
          <p>© 2026 2EZ TEK. All Rights Reserved.</p>

          <div className="flex gap-6">
            <Link href="/privacy-policy">Privacy Policy</Link>
            <Link href="/terms-of-service">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </main>
  )
}