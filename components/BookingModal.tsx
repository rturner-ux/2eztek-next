'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

const PHONE_DISPLAY = '(972) 807-7232'
const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number]

const TIME_WINDOWS = [
  { id: 'morning',   label: 'Morning',   sub: '8 am – 12 pm' },
  { id: 'afternoon', label: 'Afternoon', sub: '12 pm – 5 pm'  },
  { id: 'all-day',   label: 'All Day',   sub: 'Flexible'      },
  { id: 'asap',      label: 'ASAP',      sub: 'Urgent'        },
]

function buildDateOptions(): Array<{ iso: string; label: string; short: string }> {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const result = []
  const today = new Date()
  for (let i = 1; result.length < 12; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    if (d.getDay() === 0) continue // skip Sunday
    const iso = d.toISOString().slice(0, 10)
    result.push({
      iso,
      label: `${days[d.getDay()]}, ${months[d.getMonth()]} ${d.getDate()}`,
      short: `${days[d.getDay()]} ${months[d.getMonth()]} ${d.getDate()}`,
    })
  }
  return result
}

const emptyForm = {
  name: '', phone: '', email: '', serviceType: 'Residential Service',
  address: '', city: '', state: 'TX', zip: '',
  equipmentType: '', brandModel: '', searchQuery: '', details: '',
  preferredDate: '', preferredWindow: '',
}
type FormData = typeof emptyForm
type FormErrors = Partial<Record<keyof FormData, string>>

type ServiceRequestResponse = {
  success?: boolean
  message?: string
}

async function resizeImageToBase64(file: File, maxPx = 1024, quality = 0.8): Promise<{ base64: string; mediaType: string }> {
  return new Promise((resolve, reject) => {
    const img = new window.Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      const scale = Math.min(1, maxPx / Math.max(img.width, img.height))
      const w = Math.round(img.width * scale)
      const h = Math.round(img.height * scale)
      const canvas = document.createElement('canvas')
      canvas.width = w; canvas.height = h
      canvas.getContext('2d')!.drawImage(img, 0, 0, w, h)
      const dataUrl = canvas.toDataURL('image/jpeg', quality)
      resolve({ base64: dataUrl.split(',')[1], mediaType: 'image/jpeg' })
    }
    img.onerror = reject
    img.src = url
  })
}

export default function BookingModal({ onClose }: { onClose: () => void }) {
  const [submitted, setSubmitted]       = useState(false)
  const [submitting, setSubmitting]     = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [formData, setFormData]         = useState<FormData>(emptyForm)
  const [fieldErrors, setFieldErrors]   = useState<FormErrors>({})
  const [photoPreview, setPhotoPreview] = useState<string>('')
  const [photoBase64, setPhotoBase64]   = useState<string>('')
  const [photoMediaType, setPhotoMediaType] = useState<string>('')
  const [diagnosing, setDiagnosing]     = useState(false)
  const [diagnosis, setDiagnosis]       = useState('')
  const [distanceMiles, setDistanceMiles]     = useState<number | null>(null)
  const [distanceLoading, setDistanceLoading] = useState(false)
  const firstFieldRef = useRef<HTMLInputElement>(null)
  const photoRef      = useRef<HTMLInputElement>(null)
  const dateOptions   = buildDateOptions()

  async function lookupDistance(address: string) {
    if (!address.trim() || address.trim().length < 8) return
    setDistanceLoading(true)
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 7000)
      const res = await fetch('/api/utils/distance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address }),
        signal: controller.signal,
      })
      clearTimeout(timeout)
      const data = await res.json()
      if (data.success) setDistanceMiles(data.miles)
    } catch { /* silent */ } finally {
      setDistanceLoading(false)
    }
  }

  useEffect(() => {
    firstFieldRef.current?.focus()
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [onClose])

  function updateForm(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (fieldErrors[name as keyof FormData]) setFieldErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 20 * 1024 * 1024) { setDiagnosis('Image too large. Please use a photo under 20MB.'); return }
    try {
      const { base64, mediaType } = await resizeImageToBase64(file)
      setPhotoPreview(`data:${mediaType};base64,${base64}`)
      setPhotoBase64(base64)
      setPhotoMediaType(mediaType)
      setDiagnosis('')
      setDiagnosing(true)
      const res = await fetch('/api/ai/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64, mediaType, equipmentType: formData.equipmentType, brandModel: formData.brandModel, details: formData.details }),
      })
      const result = await res.json()
      setDiagnosis(result.diagnosis || 'Could not analyze image. Please describe the issue below.')
    } catch {
      setDiagnosis('Could not analyze image. Please describe the issue below.')
    } finally {
      setDiagnosing(false)
    }
  }

  function removePhoto() {
    setPhotoPreview('')
    setPhotoBase64('')
    setPhotoMediaType('')
    setDiagnosis('')
    if (photoRef.current) photoRef.current.value = ''
  }

  function validate(): boolean {
    const errors: FormErrors = {}
    if (!formData.name.trim())  errors.name  = 'Name is required'
    if (!formData.phone.trim()) errors.phone = 'Phone is required'
    else if (!/^[\d\s\-().+]{7,}$/.test(formData.phone)) errors.phone = 'Enter a valid phone number'
    if (!formData.email.trim()) errors.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = 'Enter a valid email'
    if (!formData.address.trim()) errors.address = 'Street address is required'
    if (!formData.city.trim()) errors.city = 'City is required'
    if (!formData.zip.trim()) errors.zip = 'ZIP code is required'
    else if (!/^\d{5}(-\d{4})?$/.test(formData.zip.trim())) errors.zip = 'Enter a valid ZIP code'
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    try {
      setSubmitting(true)
      setErrorMessage('')
      const detailsWithDiagnosis = diagnosis
        ? `${formData.details}\n\n[AI Photo Diagnosis]: ${diagnosis}`.trim()
        : formData.details

      // Build human-readable appointment string for the email
      const apptDate   = formData.preferredDate === 'asap' ? 'ASAP' : (dateOptions.find(d => d.iso === formData.preferredDate)?.label || '')
      const apptWindow = TIME_WINDOWS.find(w => w.id === formData.preferredWindow)
      const preferredDateLabel   = apptDate   || ''
      const preferredWindowLabel = apptWindow ? `${apptWindow.label} (${apptWindow.sub})` : ''

      const response = await fetch('/api/service-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          details: detailsWithDiagnosis,
          preferredDate:      preferredDateLabel,
          preferredDateIso:   formData.preferredDate === 'asap' ? '' : formData.preferredDate,
          preferredWindow:    preferredWindowLabel,
          preferredWindowId:  formData.preferredWindow,
          photoBase64:        photoBase64 || undefined,
          photoMediaType:     photoMediaType || undefined,
          aiDiagnosis:        diagnosis || undefined,
        }),
      })
      const result = (await response.json().catch(() => null)) as ServiceRequestResponse | null
      if (!response.ok || !result?.success) throw new Error(result?.message || 'Request failed')
      setSubmitted(true)
    } catch (error) {
      console.error('SERVICE REQUEST SUBMIT ERROR:', error)
      const message = error instanceof Error && error.message !== 'Request failed'
        ? error.message
        : 'Something went wrong. Please call ' + PHONE_DISPLAY + ' or try again.'
      setErrorMessage(message)
    } finally {
      setSubmitting(false)
    }
  }

  const inputClass = (field: keyof FormData) =>
    'w-full rounded-2xl border px-5 py-4 text-sm text-white outline-none placeholder:text-white/35 bg-white/[0.05] transition ' +
    (fieldErrors[field] ? 'border-red-400/60 focus:border-red-400' : 'border-white/10 focus:border-cyan-400/60')

  // Appointment summary for the confirmation screen
  const confirmedDate   = formData.preferredDate === 'asap' ? 'ASAP' : dateOptions.find(d => d.iso === formData.preferredDate)?.label
  const confirmedWindow = TIME_WINDOWS.find(w => w.id === formData.preferredWindow)

  return (
    <motion.div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/75 px-4 backdrop-blur-xl"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      role="dialog" aria-modal="true" aria-label="Book a service request"
    >
      <motion.div
        initial={{ opacity: 0, y: 48, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 48, scale: 0.95 }}
        transition={{ duration: 0.5, ease: EASE }}
        className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[36px] border border-white/10 bg-[#07101D] p-6 shadow-[0_30px_120px_rgba(0,0,0,0.75)]"
      >
        <div className="flex items-start justify-between gap-6 border-b border-white/10 pb-5">
          <div>
            <div className="text-sm font-black uppercase tracking-[0.3em] text-cyan-300">Service Request</div>
            <h2 className="mt-3 text-3xl font-black">Tell us what you need repaired or installed.</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close booking modal" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-black text-white transition hover:bg-white/10">✕</button>
        </div>

        {submitted ? (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }} className="mt-8 space-y-5">

            {/* Confirmation */}
            <div className="flex items-center gap-4 rounded-[24px] border border-cyan-400/20 bg-cyan-400/10 p-6">
              <motion.div
                initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.1, ease: EASE }}
                className="relative flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full border-2 border-cyan-400/40 bg-cyan-400/10"
              >
                <svg className="h-7 w-7 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <motion.path d="M5 13l4 4L19 7" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 0.3 }} />
                </svg>
                <motion.div className="absolute inset-0 rounded-full border border-cyan-400/30" animate={{ scale: [1, 1.5, 1.5], opacity: [0.6, 0, 0] }} transition={{ duration: 1.2, delay: 0.4, repeat: 2 }} />
              </motion.div>
              <div>
                <div className="text-xs font-black uppercase tracking-[0.25em] text-cyan-300">Request Received</div>
                <p className="mt-1 font-black text-white">We have your service request.</p>
                <p className="text-sm text-white/60">Our team will call to confirm your appointment.</p>
              </div>
            </div>

            {/* Appointment summary */}
            {(confirmedDate || confirmedWindow) && (
              <div className="rounded-[24px] border border-emerald-400/20 bg-emerald-400/[0.06] p-6">
                <div className="mb-3 flex items-center gap-2">
                  <svg className="h-4 w-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-xs font-black uppercase tracking-[0.25em] text-emerald-300">Appointment Preference</span>
                </div>
                <div className="flex flex-wrap gap-3">
                  {confirmedDate && (
                    <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-5 py-3">
                      <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400/70">Date</p>
                      <p className="mt-0.5 font-black text-white">{confirmedDate}</p>
                    </div>
                  )}
                  {confirmedWindow && (
                    <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-5 py-3">
                      <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400/70">Time Window</p>
                      <p className="mt-0.5 font-black text-white">{confirmedWindow.label}</p>
                      <p className="text-xs text-white/50">{confirmedWindow.sub}</p>
                    </div>
                  )}
                </div>
                <p className="mt-4 text-sm text-white/50">We will call to confirm the exact time. Our team will reach you within 2 business hours during Mon–Sat, 8 am–6 pm.</p>
              </div>
            )}

            {/* No preference set */}
            {!confirmedDate && !confirmedWindow && (
              <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5 text-sm text-white/60">
                Our team will call you at <span className="font-bold text-white">{formData.phone}</span> to schedule your appointment. Mon–Sat, 8 am–6 pm.
              </div>
            )}

            <div className="flex flex-wrap justify-end gap-3">
              <a href="tel:9728077232" className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3.5 text-sm font-black text-white transition hover:border-cyan-400/30">
                Call Us: {PHONE_DISPLAY}
              </a>
              <button type="button" onClick={onClose} className="rounded-2xl bg-cyan-400 px-5 py-3.5 text-sm font-black text-black transition hover:bg-cyan-300">
                Done
              </button>
            </div>
          </motion.div>
        ) : (
          <form className="mt-6 grid gap-4" onSubmit={handleSubmit} noValidate>
            {errorMessage && <div role="alert" className="rounded-2xl border border-red-400/20 bg-red-500/10 px-5 py-4 text-sm font-bold text-red-200">{errorMessage}</div>}

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <input ref={firstFieldRef} type="text" name="name" value={formData.name} onChange={updateForm} placeholder="Full Name *" autoComplete="name" className={inputClass('name')} />
                {fieldErrors.name && <p className="mt-1 pl-1 text-xs text-red-400">{fieldErrors.name}</p>}
              </div>
              <div>
                <input type="tel" name="phone" value={formData.phone} onChange={updateForm} placeholder="Phone Number *" autoComplete="tel" pattern="[\d\s\-().+]{7,}" className={inputClass('phone')} />
                {fieldErrors.phone && <p className="mt-1 pl-1 text-xs text-red-400">{fieldErrors.phone}</p>}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <input type="email" name="email" value={formData.email} onChange={updateForm} placeholder="Email Address *" autoComplete="email" className={inputClass('email')} />
                {fieldErrors.email && <p className="mt-1 pl-1 text-xs text-red-400">{fieldErrors.email}</p>}
              </div>
              <select name="serviceType" value={formData.serviceType} onChange={updateForm} className="rounded-2xl border border-white/10 bg-[#0B1220] px-5 py-4 text-sm text-white outline-none focus:border-cyan-400/60 transition">
                <option>Residential Service</option>
                <option>Commercial Service</option>
                <option>Assembly / Installation</option>
                <option>Preventative Maintenance</option>
                <option>Emergency Repair</option>
              </select>
            </div>

            <div>
              <input type="text" name="address" value={formData.address} onChange={updateForm} placeholder="Street Address *" autoComplete="address-line1" className={inputClass('address')} />
              {fieldErrors.address && <p className="mt-1 pl-1 text-xs text-red-400">{fieldErrors.address}</p>}
            </div>

            <div className="grid gap-4 md:grid-cols-[1fr_80px_120px]">
              <div>
                <input type="text" name="city" value={formData.city} onChange={updateForm} onBlur={() => { const full = [formData.address, formData.city, formData.state, formData.zip].filter(Boolean).join(', '); lookupDistance(full) }} placeholder="City *" autoComplete="address-level2" className={inputClass('city')} />
                {fieldErrors.city && <p className="mt-1 pl-1 text-xs text-red-400">{fieldErrors.city}</p>}
              </div>
              <div>
                <input type="text" name="state" value={formData.state} onChange={updateForm} placeholder="State" autoComplete="address-level1" maxLength={2} className={inputClass('state')} />
              </div>
              <div>
                <input type="text" name="zip" value={formData.zip} onChange={updateForm} placeholder="ZIP *" autoComplete="postal-code" inputMode="numeric" maxLength={10} className={inputClass('zip')} />
                {fieldErrors.zip && <p className="mt-1 pl-1 text-xs text-red-400">{fieldErrors.zip}</p>}
              </div>
            </div>

            {distanceLoading && (
              <p className="flex items-center gap-1.5 pl-1 text-xs text-white/40">
                <span className="inline-block h-2.5 w-2.5 animate-spin rounded-full border border-white/20 border-t-cyan-400" />
                Calculating distance…
              </p>
            )}
            {!distanceLoading && distanceMiles !== null && (
              <p className={`pl-1 text-xs font-bold ${distanceMiles <= 60 ? 'text-emerald-400' : 'text-yellow-400'}`}>
                📍 ~{distanceMiles} miles from our shop{distanceMiles > 60 && ', please call to confirm coverage'}
              </p>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <input type="text" name="equipmentType" value={formData.equipmentType} onChange={updateForm} placeholder="Equipment Type (e.g. Treadmill)" className={inputClass('equipmentType')} />
              <input type="text" name="brandModel" value={formData.brandModel} onChange={updateForm} placeholder="Brand / Model" className={inputClass('brandModel')} />
            </div>

            {/* AI Photo Diagnosis */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <div className="mb-3 flex items-center gap-2">
                <svg className="h-4 w-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-xs font-black uppercase tracking-[0.2em] text-cyan-300">AI Photo Diagnosis</span>
                <span className="rounded-lg border border-white/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-white/35">Optional</span>
              </div>
              <p className="mb-3 text-xs text-white/45">Upload a photo and our AI will analyze it instantly.</p>
              {!photoPreview ? (
                <label className="flex cursor-pointer items-center justify-center gap-3 rounded-2xl border border-dashed border-white/20 bg-white/[0.03] px-5 py-6 text-sm text-white/45 transition hover:border-cyan-400/40 hover:bg-cyan-400/[0.04] hover:text-white/65">
                  <svg className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 16v-4m0 0V8m0 4h4m-4 0H8m13 4a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Tap to upload or take a photo</span>
                  <input ref={photoRef} type="file" accept="image/*" capture="environment" className="sr-only" onChange={handlePhotoChange} />
                </label>
              ) : (
                <div className="space-y-3">
                  <div className="relative overflow-hidden rounded-2xl">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={photoPreview} alt="Equipment photo" className="max-h-48 w-full object-contain" />
                    <button type="button" onClick={removePhoto} className="absolute right-2 top-2 rounded-xl border border-white/20 bg-black/60 px-3 py-1 text-xs font-black text-white backdrop-blur transition hover:bg-black/80">Remove</button>
                  </div>
                  <AnimatePresence mode="wait">
                    {diagnosing && (
                      <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2 rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.06] px-4 py-3">
                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="h-4 w-4 rounded-full border-2 border-cyan-400/30 border-t-cyan-400" />
                        <span className="text-xs font-bold text-cyan-300">Analyzing your equipment…</span>
                      </motion.div>
                    )}
                    {!diagnosing && diagnosis && (
                      <motion.div key="result" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.06] px-4 py-4">
                        <div className="mb-2 flex items-center gap-2">
                          <svg className="h-4 w-4 flex-shrink-0 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-xs font-black uppercase tracking-[0.15em] text-cyan-300">AI Assessment</span>
                        </div>
                        <p className="text-sm leading-relaxed text-white/75">{diagnosis}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>

            <textarea name="details" value={formData.details} onChange={updateForm} placeholder="Describe the issue or project details" rows={4} className="resize-none rounded-2xl border border-white/10 bg-white/[0.05] px-5 py-4 text-sm text-white outline-none placeholder:text-white/35 focus:border-cyan-400/60 transition" />

            {/* Appointment preference */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <div className="mb-4 flex items-center gap-2">
                <svg className="h-4 w-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-xs font-black uppercase tracking-[0.2em] text-emerald-300">Preferred Appointment</span>
                <span className="rounded-lg border border-white/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-white/35">Optional</span>
              </div>

              {/* Date grid */}
              <p className="mb-3 text-xs text-white/45">Pick a preferred date (Mon–Sat):</p>
              <div className="mb-4 grid grid-cols-3 gap-2 sm:grid-cols-4">
                {dateOptions.map((d) => (
                  <button
                    key={d.iso}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, preferredDate: prev.preferredDate === d.iso ? '' : d.iso }))}
                    className={`rounded-xl border py-2.5 text-center text-xs font-bold transition ${
                      formData.preferredDate === d.iso
                        ? 'border-emerald-400/60 bg-emerald-400/20 text-emerald-300'
                        : 'border-white/10 text-white/55 hover:border-white/30 hover:text-white'
                    }`}
                  >
                    {d.short}
                  </button>
                ))}
              </div>

              {/* Time window */}
              <p className="mb-3 text-xs text-white/45">Preferred time window:</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {TIME_WINDOWS.map((w) => (
                  <button
                    key={w.id}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, preferredWindow: prev.preferredWindow === w.id ? '' : w.id, preferredDate: w.id === 'asap' ? 'asap' : prev.preferredDate }))}
                    className={`rounded-xl border px-3 py-3 text-center transition ${
                      formData.preferredWindow === w.id
                        ? 'border-emerald-400/60 bg-emerald-400/20 text-emerald-300'
                        : 'border-white/10 text-white/55 hover:border-white/30 hover:text-white'
                    }`}
                  >
                    <p className="text-xs font-black">{w.label}</p>
                    <p className="text-[10px] text-current opacity-60">{w.sub}</p>
                  </button>
                ))}
              </div>
            </div>

            <input type="text" name="searchQuery" value={formData.searchQuery} onChange={updateForm} placeholder="What did you type in Google, ChatGPT, etc. to find us? (optional)" className="w-full rounded-2xl border border-white/10 bg-white/[0.05] px-5 py-4 text-sm text-white outline-none placeholder:text-white/35 focus:border-cyan-400/60 transition" />

            <p className="text-xs text-white/35">* Required fields. We will call to confirm your appointment date and time.</p>
            <button
              type="submit"
              disabled={submitting || diagnosing}
              className="button-glow mt-2 rounded-2xl bg-cyan-400 px-6 py-5 text-sm font-black uppercase tracking-[0.15em] text-black disabled:cursor-not-allowed disabled:opacity-60 transition"
            >
              {submitting ? 'Submitting…' : 'Submit Service Request'}
            </button>
          </form>
        )}
      </motion.div>
    </motion.div>
  )
}
