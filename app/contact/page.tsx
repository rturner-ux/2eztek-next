'use client'

import Link from 'next/link'
import { useState } from 'react'
import { motion } from 'framer-motion'

const phoneDisplay = '(972) 807-7232'
const phoneHref = 'tel:9728077232'

const primaryEmail = 'support@2eztek.com'
const infoEmail = 'info@2eztek.com'
const careersEmail = 'jobs@2eztek.com'

const bookingOption = 'Yes, I want to choose a preferred service window'

const emptyForm = {
  name: '',
  phone: '',
  email: '',
  serviceType: 'Treadmill Repair',
  address: '',
  equipmentType: '',
  brandModel: '',
  wantsBooking: 'No, contact me first',
  preferredDate: '',
  preferredTime: '',
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
        bookingRequested: formData.wantsBooking === bookingOption,
      }

      const response = await fetch('/api/contact', {
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

  const showBookingFields = formData.wantsBooking === bookingOption

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
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,11,20,0.88)_0%,rgba(5,11,20,0.68)_42%,rgba(5,11,20,0.32)_100%)]" />
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
              Tell us what equipment needs service. You can send a general request
              or choose a preferred service window for our team to confirm.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <a
                href={phoneHref}
                className="rounded-2xl bg-cyan-300 px-7 py-4 text-center text-sm font-black uppercase tracking-[0.12em] text-slate-950 shadow-[0_0_40px_rgba(34,211,238,0.35)] transition hover:bg-cyan-200"
              >
                Call {phoneDisplay}
              </a>

              <a
                href="#service-request"
                className="rounded-2xl border border-white/20 bg-white/10 px-7 py-4 text-center text-sm font-black uppercase tracking-[0.12em] text-white backdrop-blur-xl transition hover:bg-white/15"
              >
                Request Service
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 px-6 py-14 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-6 md:grid-cols-4">
            {[
              {
                title: 'Phone',
                value: phoneDisplay,
                text: 'Call or text for service',
                href: phoneHref,
                icon: '☎',
              },
              {
                title: 'Support',
                value: primaryEmail,
                text: 'Repair and service support',
                href: `mailto:${primaryEmail}`,
                icon: '🛠',
              },
              {
                title: 'General Info',
                value: infoEmail,
                text: 'Business inquiries',
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

      <section id="service-request" className="relative z-10 px-6 py-24 lg:px-16">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <div>
            <div className="text-sm font-black uppercase tracking-[0.28em] text-cyan-300">
              Service Intake
            </div>

            <h2 className="mt-5 text-4xl font-black leading-tight md:text-5xl">
              Tell Us What
              <span className="block">You Need Done.</span>
            </h2>

            <p className="mt-6 max-w-md text-lg leading-8 text-slate-300">
              Submit the request first. If you want to book, choose a preferred
              date and time window. Our team will confirm availability before the
              appointment is finalized.
            </p>

            <div className="mt-8 rounded-[2rem] border border-cyan-400/20 bg-cyan-400/10 p-6">
              <h3 className="text-xl font-black text-cyan-100">
                Best for booking
              </h3>

              <p className="mt-3 leading-7 text-slate-300">
                Use the booking option for repairs, assembly, commercial
                maintenance, diagnostics, and equipment moves.
              </p>
            </div>
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
                <option>Elliptical Repair</option>
                <option>Exercise Bike Repair</option>
                <option>Gym Equipment Repair</option>
                <option>Equipment Assembly</option>
                <option>Commercial Maintenance</option>
                <option>Preventive Maintenance</option>
                <option>Manual Troubleshooting Help</option>
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

            <select
              name="wantsBooking"
              value={formData.wantsBooking}
              onChange={updateForm}
              className="mt-4 w-full rounded-xl border border-white/10 bg-[#07101D] px-5 py-4 text-white outline-none focus:border-cyan-300/50"
            >
              <option>No, contact me first</option>
              <option>{bookingOption}</option>
            </select>

            {showBookingFields && (
              <div className="mt-4 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-5">
                <div className="mb-4 text-sm font-black uppercase tracking-[0.18em] text-cyan-200">
                  Preferred Service Window
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <input
                    name="preferredDate"
                    value={formData.preferredDate}
                    onChange={updateForm}
                    type="date"
                    required={showBookingFields}
                    className="rounded-xl border border-white/10 bg-black/30 px-5 py-4 text-white outline-none focus:border-cyan-300/50"
                  />

                  <select
                    name="preferredTime"
                    value={formData.preferredTime}
                    onChange={updateForm}
                    required={showBookingFields}
                    className="rounded-xl border border-white/10 bg-[#07101D] px-5 py-4 text-white outline-none focus:border-cyan-300/50"
                  >
                    <option value="">Preferred Time Window</option>
                    <option>Morning, 9 AM to 12 PM</option>
                    <option>Afternoon, 12 PM to 3 PM</option>
                    <option>Late Afternoon, 3 PM to 6 PM</option>
                  </select>
                </div>

                <p className="mt-4 text-sm leading-6 text-slate-300">
                  This is a preferred window, not a final confirmed appointment.
                  A 2EZ TEK team member will confirm availability.
                </p>
              </div>
            )}

            <textarea
              name="details"
              value={formData.details}
              onChange={updateForm}
              rows={6}
              placeholder="Describe the issue, project details, symptoms, error codes, or assembly needs."
              required
              className="mt-4 w-full resize-none rounded-xl border border-white/10 bg-black/30 px-5 py-4 text-white outline-none placeholder:text-slate-500 focus:border-cyan-300/50"
            />

            <button
              type="submit"
              disabled={submitting}
              className="mt-4 w-full rounded-xl bg-cyan-300 px-6 py-5 text-sm font-black uppercase tracking-[0.14em] text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? 'Submitting...' : showBookingFields ? 'Submit Booking Request' : 'Send Request'}
            </button>
          </form>
        </div>
      </section>
    </main>
  )
}