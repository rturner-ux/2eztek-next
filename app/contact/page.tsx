'use client'

import Link from 'next/link'
import { useState } from 'react'
import { motion } from 'framer-motion'

const phoneDisplay = '(972) 807-7232'
const phoneHref = 'tel:9728077232'

const primaryEmail = 'support@2eztek.com'
const infoEmail = 'info@2eztek.com'
const careersEmail = 'jobs@2eztek.com'

const emptyForm = {
  name: '',
  phone: '',
  email: '',
  serviceType: 'Treadmill Repair',
  address: '',
  equipmentType: '',
  brandModel: '',
  details: '',
}

export default function ContactPage() {
  const [formData, setFormData] = useState(emptyForm)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  function updateForm(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  async function submitServiceRequest(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    try {
      setSubmitting(true)
      setSubmitted(false)
      setErrorMessage('')

      const payload = {
        ...formData,
        source: 'Contact Page',
        page: '/contact',
        requestType: formData.serviceType,
        issueDescription: formData.details,
        serviceAddress: formData.address,
      }

      const response = await fetch('/api/service-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Request failed')
      }

      setSubmitted(true)
      setFormData(emptyForm)
    } catch (error) {
      console.error('CONTACT FORM SUBMIT ERROR:', error)
      setErrorMessage(
        `Something went wrong. Please call ${phoneDisplay} or email ${primaryEmail}.`
      )
    } finally {
      setSubmitting(false)
    }
  }

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
          className="h-full w-[112%] max-w-none object-cover opacity-55"
        />

        <div className="absolute inset-0 bg-[#050B14]/45" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,11,20,0.82)_0%,rgba(5,11,20,0.58)_38%,rgba(5,11,20,0.28)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.18),transparent_38%)]" />
      </div>

      <section className="relative z-10 px-6 pb-20 pt-32 lg:px-16">
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
          </div>

          <form
            onSubmit={submitServiceRequest}
            className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 shadow-[0_30px_100px_rgba(0,0,0,0.35)] backdrop-blur-xl"
          >
            {submitted && (
              <div className="mb-5 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-5 py-4 text-sm font-bold text-cyan-100">
                Your request was submitted successfully. Our team will follow up shortly.
              </div>
            )}

            {errorMessage && (
              <div className="mb-5 rounded-2xl border border-red-400/20 bg-red-500/10 px-5 py-4 text-sm font-bold text-red-200">
                {errorMessage}
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <input
                name="name"
                value={formData.name}
                onChange={updateForm}
                placeholder="Full Name"
                required
                className="rounded-xl border border-white/10 bg-black/30 px-5 py-4 text-white outline-none placeholder:text-slate-500 focus:border-cyan-300/50"
              />

              <input
                name="phone"
                value={formData.phone}
                onChange={updateForm}
                placeholder="Phone Number"
                required
                className="rounded-xl border border-white/10 bg-black/30 px-5 py-4 text-white outline-none placeholder:text-slate-500 focus:border-cyan-300/50"
              />

              <input
                name="email"
                value={formData.email}
                onChange={updateForm}
                placeholder="Email Address"
                type="email"
                required
                className="rounded-xl border border-white/10 bg-black/30 px-5 py-4 text-white outline-none placeholder:text-slate-500 focus:border-cyan-300/50"
              />

              <select
                name="serviceType"
                value={formData.serviceType}
                onChange={updateForm}
                className="rounded-xl border border-white/10 bg-[#07101D] px-5 py-4 text-white outline-none focus:border-cyan-300/50"
              >
                <option>Treadmill Repair</option>
                <option>Gym Equipment Repair</option>
                <option>Equipment Assembly</option>
                <option>Commercial Maintenance</option>
                <option>Preventive Maintenance</option>
                <option>General Question</option>
              </select>
            </div>

            <input
              name="address"
              value={formData.address}
              onChange={updateForm}
              placeholder="Service Address"
              required
              className="mt-4 w-full rounded-xl border border-white/10 bg-black/30 px-5 py-4 text-white outline-none placeholder:text-slate-500 focus:border-cyan-300/50"
            />

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <input
                name="equipmentType"
                value={formData.equipmentType}
                onChange={updateForm}
                placeholder="Equipment Type"
                className="rounded-xl border border-white/10 bg-black/30 px-5 py-4 text-white outline-none placeholder:text-slate-500 focus:border-cyan-300/50"
              />

              <input
                name="brandModel"
                value={formData.brandModel}
                onChange={updateForm}
                placeholder="Brand / Model"
                className="rounded-xl border border-white/10 bg-black/30 px-5 py-4 text-white outline-none placeholder:text-slate-500 focus:border-cyan-300/50"
              />
            </div>

            <textarea
              name="details"
              value={formData.details}
              onChange={updateForm}
              rows={6}
              placeholder="Describe the issue or project details"
              required
              className="mt-4 w-full resize-none rounded-xl border border-white/10 bg-black/30 px-5 py-4 text-white outline-none placeholder:text-slate-500 focus:border-cyan-300/50"
            />

            <button
              type="submit"
              disabled={submitting}
              className="mt-4 w-full rounded-xl bg-cyan-300 px-6 py-5 text-sm font-black uppercase tracking-[0.14em] text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? 'Submitting...' : 'Send Message'}
            </button>
          </form>
        </div>
      </section>
    </main>
  )
}