'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { bookingT, type Lang } from '@/lib/bookingModalI18n'

const PHONE_DISPLAY = '(972) 807-7232'
const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number]
const MAX_PHOTOS = 6

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

// Display-only date label in the selected language -- kept separate from
// buildDateOptions()'s `label`/`short`, which stay English since they also
// feed the submitted payload (Robby's internal emails/records expect
// English regardless of which language the customer used on the form).
function localizedDateShort(iso: string, lang: Lang): string {
  const t = bookingT[lang]
  const d = new Date(iso + 'T12:00:00')
  return `${t.days[d.getDay()]} ${t.months[d.getMonth()]} ${d.getDate()}`
}

const emptyForm = {
  name: '', phone: '', email: '', serviceType: 'Residential Service',
  address: '', city: '', state: 'TX', zip: '',
  equipmentType: '', brandModel: '', searchQuery: '', details: '',
  preferredDate: '', preferredWindow: '',
}
type FormData = typeof emptyForm
type FormErrors = Partial<Record<keyof FormData, string>>

type DateSuggestion = { dateIso: string; reason: 'nearby_job' | 'open'; distanceMiles: number | null }

type DateAvailability = Record<string, boolean>

type DateRecommendation = {
  chosenDateOk: boolean
  reason?: 'full' | 'distance'
  betterDate?: { dateIso: string; distanceMiles: number | null; nearbyJob: boolean; explanation: string }
}

type ServiceRequestResponse = {
  success?: boolean
  message?: string
  reason?: 'full' | 'distance'
  suggestedDates?: DateSuggestion[]
  autoApproved?: boolean
  confirmedDateIso?: string | null
  confirmedWindow?: string | null
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

export default function BookingModal({ onClose, initialKind = 'service' }: { onClose: () => void; initialKind?: 'service' | 'estimate' }) {
  const requestKind = initialKind
  const [lang, setLang] = useState<Lang>('en')
  const t = bookingT[lang]
  // Must start unchecked: carriers reject toll-free verification when the
  // SMS opt-in is pre-selected (Twilio rejection 30508).
  const [smsConsent, setSmsConsent] = useState(false)
  const [submitted, setSubmitted]           = useState(false)
  const [submitting, setSubmitting]         = useState(false)
  const [errorMessage, setErrorMessage]     = useState('')
  const [showErrorPopup, setShowErrorPopup] = useState(false)
  const [showDateConflict, setShowDateConflict] = useState(false)
  const [dateConflictInfo, setDateConflictInfo] = useState<{ reason?: 'full' | 'distance'; suggestedDates?: DateSuggestion[] }>({})
  const [intakeBrief, setIntakeBrief] = useState<{
    greeting: string
    insights: string[]
    repairOutlook: string
    blogPosts: Array<{ slug: string; title: string; excerpt: string; hero_image_url: string | null; category: string }>
  } | null>(null)
  const [intakeLoading, setIntakeLoading] = useState(false)
  const [autoApproved, setAutoApproved] = useState(false)
  const [confirmedDateIso, setConfirmedDateIso] = useState<string | null>(null)
  const [confirmedWindowLabel, setConfirmedWindowLabel] = useState<string | null>(null)
  const [followupQuestion, setFollowupQuestion] = useState('')
  const [followupAsking, setFollowupAsking] = useState(false)
  const [followupThread, setFollowupThread] = useState<Array<{ question: string; answer: string }>>([])
  const errorTimerRef   = useRef<ReturnType<typeof setTimeout> | null>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const dateSectionRef     = useRef<HTMLDivElement>(null)
  const [formData, setFormData]         = useState<FormData>(emptyForm)
  const [fieldErrors, setFieldErrors]   = useState<FormErrors>({})
  const [photos, setPhotos] = useState<Array<{ preview: string; base64: string; mediaType: string }>>([])
  const [diagnosing, setDiagnosing]     = useState(false)
  const [diagnosis, setDiagnosis]       = useState('')
  const [distanceMiles, setDistanceMiles]     = useState<number | null>(null)
  const [distanceLoading, setDistanceLoading] = useState(false)
  const [dateRecommendation, setDateRecommendation] = useState<DateRecommendation | null>(null)
  const [checkingEfficiency, setCheckingEfficiency] = useState(false)
  const [dismissedRecommendationFor, setDismissedRecommendationFor] = useState('')
  const efficiencyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [dateAvailability, setDateAvailability] = useState<DateAvailability | null>(null)
  const availabilityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [equipmentSummary, setEquipmentSummary] = useState('')
  const [equipmentQuestion, setEquipmentQuestion] = useState('')
  const [summarizing, setSummarizing]           = useState(false)
  const lastSummarized = useRef('')
  const firstFieldRef  = useRef<HTMLInputElement>(null)
  const photoRef       = useRef<HTMLInputElement>(null)
  const dateOptions    = buildDateOptions()

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

  // Live schedule-efficiency check: fires whenever the customer has entered
  // an address and picked a real calendar date (not ASAP, which already
  // means "as soon as possible"). Debounced so it doesn't fire on every
  // keystroke -- only once things settle after the last change.
  useEffect(() => {
    if (efficiencyTimerRef.current) clearTimeout(efficiencyTimerRef.current)
    // Clear immediately, not just when inputs become insufficient -- avoids
    // showing a banner left over from a previous date pick while the fresh
    // check for the new one is still in flight.
    setDateRecommendation(null)

    const address = [formData.address, formData.city, formData.state, formData.zip].filter(Boolean).join(', ')
    const dateIso = formData.preferredDate
    if (!address.trim() || address.trim().length < 8 || !dateIso || dateIso === 'asap') {
      return
    }

    efficiencyTimerRef.current = setTimeout(async () => {
      setCheckingEfficiency(true)
      try {
        const res = await fetch('/api/utils/recommend-date', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ address, dateIso, serviceType: formData.serviceType, details: formData.details, lang }),
        })
        const data = await res.json()
        if (data.success) setDateRecommendation(data as DateRecommendation)
      } catch { /* silent -- this is a nudge, not a required check */ } finally {
        setCheckingEfficiency(false)
      }
    }, 700)

    return () => { if (efficiencyTimerRef.current) clearTimeout(efficiencyTimerRef.current) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.address, formData.city, formData.state, formData.zip, formData.preferredDate, lang])

  // Marks each date button in the grid as available or not, based on real
  // distance/route compatibility and the job's estimated duration -- fires
  // as soon as the address is filled in, before any date is picked, so the
  // customer sees which days actually work instead of finding out only
  // after choosing one (that's what the effect above still does, as a
  // second-layer nudge for whichever specific date ends up picked).
  useEffect(() => {
    if (availabilityTimerRef.current) clearTimeout(availabilityTimerRef.current)
    setDateAvailability(null)

    const address = [formData.address, formData.city, formData.state, formData.zip].filter(Boolean).join(', ')
    if (!address.trim() || address.trim().length < 8) return

    availabilityTimerRef.current = setTimeout(async () => {
      try {
        const dates = buildDateOptions().map((d) => d.iso)
        const res = await fetch('/api/utils/recommend-dates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ address, dates, serviceType: formData.serviceType, details: formData.details }),
        })
        const data = await res.json()
        if (data.success && Array.isArray(data.results)) {
          const map: DateAvailability = {}
          for (const r of data.results) map[r.dateIso] = r.compatible
          setDateAvailability(map)
        }
      } catch { /* silent -- this is a nudge, not a required check */ }
    }, 700)

    return () => { if (availabilityTimerRef.current) clearTimeout(availabilityTimerRef.current) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.address, formData.city, formData.state, formData.zip])

  useEffect(() => {
    firstFieldRef.current?.focus()
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [onClose])

  useEffect(() => {
    const val = formData.brandModel.trim()
    const detailsVal = formData.details.trim()
    const key = `${val}|${detailsVal}`
    if (val.length < 3 || key === lastSummarized.current) return
    const timer = setTimeout(async () => {
      lastSummarized.current = key
      setSummarizing(true)
      setEquipmentSummary('')
      setEquipmentQuestion('')
      try {
        const res = await fetch('/api/ai/equipment-summary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ brandModel: val, equipmentType: formData.equipmentType, details: detailsVal, lang }),
        })
        const data = await res.json()
        if (data.success) {
          setEquipmentSummary(data.summary || '')
          setEquipmentQuestion(data.question || '')
        }
      } catch { /* silent */ } finally {
        setSummarizing(false)
      }
    }, 1500)
    return () => clearTimeout(timer)
  }, [formData.brandModel, formData.equipmentType, formData.details, lang])

  function updateForm(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (fieldErrors[name as keyof FormData]) setFieldErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  async function handlePhotosChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    if (photoRef.current) photoRef.current.value = ''
    if (files.length === 0) return

    const isFirstBatch = photos.length === 0
    const remainingSlots = MAX_PHOTOS - photos.length
    const eligible = files.slice(0, remainingSlots).filter((f) => f.size <= 20 * 1024 * 1024)
    if (eligible.length === 0) return

    try {
      const resized = await Promise.all(eligible.map((f) => resizeImageToBase64(f)))
      const newPhotos = resized.map(({ base64, mediaType }) => ({ preview: `data:${mediaType};base64,${base64}`, base64, mediaType }))
      setPhotos((prev) => [...prev, ...newPhotos])

      // Only the first photo ever added gets AI-analyzed -- keeps the
      // diagnosis call (and its cost) to one image regardless of how many
      // photos the customer ultimately attaches.
      if (isFirstBatch) {
        setDiagnosis('')
        setDiagnosing(true)
        const first = newPhotos[0]
        const res = await fetch('/api/ai/diagnose', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: first.base64, mediaType: first.mediaType, equipmentType: formData.equipmentType, brandModel: formData.brandModel, details: formData.details, serviceType: formData.serviceType, lang }),
        })
        const result = await res.json()
        setDiagnosis(result.diagnosis || (lang === 'es' ? 'No se pudo analizar la imagen. Por favor describa el problema abajo.' : 'Could not analyze image. Please describe the issue below.'))
      }
    } catch {
      setDiagnosis(lang === 'es' ? 'No se pudo analizar la imagen. Por favor describa el problema abajo.' : 'Could not analyze image. Please describe the issue below.')
    } finally {
      setDiagnosing(false)
    }
  }

  function removePhoto(index: number) {
    setPhotos((prev) => prev.filter((_, i) => i !== index))
    if (index === 0) setDiagnosis('')
  }

  async function handleFollowupAsk() {
    const question = followupQuestion.trim()
    if (!question || followupAsking) return
    setFollowupAsking(true)
    try {
      const res = await fetch('/api/ai/booking-followup-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          name: formData.name,
          equipmentType: formData.equipmentType,
          brandModel: formData.brandModel,
          details: formData.details,
          serviceType: formData.serviceType,
          aiDiagnosis: diagnosis || equipmentSummary || '',
          autoApproved,
          confirmedDateIso,
          confirmedWindow: confirmedWindowLabel,
          address: [formData.address, formData.city, formData.state, formData.zip].filter(Boolean).join(', '),
          lang,
        }),
      })
      const data = await res.json()
      const fallback = lang === 'es' ? 'No se pudo obtener una respuesta en este momento. Por favor llame al (972) 807-7232.' : 'Could not get an answer right now. Please call (972) 807-7232.'
      const answer = data.success ? data.answer : (data.message || fallback)
      setFollowupThread((prev) => [...prev, { question, answer }])
      setFollowupQuestion('')
    } catch {
      const fallback = lang === 'es' ? 'No se pudo obtener una respuesta en este momento. Por favor llame al (972) 807-7232.' : 'Could not get an answer right now. Please call (972) 807-7232.'
      setFollowupThread((prev) => [...prev, { question, answer: fallback }])
      setFollowupQuestion('')
    } finally {
      setFollowupAsking(false)
    }
  }

  function validate(): boolean {
    const errors: FormErrors = {}
    if (!formData.name.trim())  errors.name  = t.errors.nameRequired
    if (!formData.phone.trim()) errors.phone = t.errors.phoneRequired
    else if (!/^[\d\s\-().+]{7,}$/.test(formData.phone)) errors.phone = t.errors.phoneInvalid
    if (!formData.email.trim()) errors.email = t.errors.emailRequired
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = t.errors.emailInvalid
    if (!formData.address.trim()) errors.address = t.errors.addressRequired
    if (!formData.city.trim()) errors.city = t.errors.cityRequired
    if (!formData.zip.trim()) errors.zip = t.errors.zipRequired
    else if (!/^\d{5}(-\d{4})?$/.test(formData.zip.trim())) errors.zip = t.errors.zipInvalid
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    try {
      setSubmitting(true)
      setErrorMessage('')
      const isAssemblyRequest = /^(assembly|installation)$/i.test(formData.serviceType.trim())
      const detailsWithDiagnosis = [
        formData.details,
        diagnosis          ? `[${isAssemblyRequest ? 'AI Photo Assessment' : 'AI Photo Diagnosis'}]: ${diagnosis}` : '',
        equipmentQuestion  ? `[AI Follow-up Question]: ${equipmentQuestion}` : '',
      ].filter(Boolean).join('\n\n').trim()

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
          photos:             photos.length > 0 ? photos.map(({ base64, mediaType }) => ({ base64, mediaType })) : undefined,
          aiDiagnosis:        diagnosis || equipmentSummary || undefined,
          requestKind,
          smsConsent,
        }),
      })
      const result = (await response.json().catch(() => null)) as ServiceRequestResponse | null
      if (!response.ok || !result?.success) {
        if (response.status === 409) {
          setDateConflictInfo({ reason: result?.reason, suggestedDates: result?.suggestedDates })
          setShowDateConflict(true)
          return
        }
        throw new Error(result?.message || 'Request failed')
      }
      setSubmitted(true)
      setAutoApproved(Boolean(result?.autoApproved))
      setConfirmedDateIso(result?.confirmedDateIso || null)
      setConfirmedWindowLabel(result?.confirmedWindow || null)
      // Fire intake brief in background -- does not block the confirmation screen
      setIntakeLoading(true)
      fetch('/api/ai/service-intake-brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          equipmentType: formData.equipmentType,
          brandModel: formData.brandModel,
          details: formData.details,
          aiDiagnosis: diagnosis || equipmentSummary || '',
          serviceType: formData.serviceType,
          lang,
        }),
      })
        .then((r) => r.json())
        .then((data) => { if (data.success) setIntakeBrief(data) })
        .catch(() => {})
        .finally(() => setIntakeLoading(false))
    } catch (error) {
      console.error('SERVICE REQUEST SUBMIT ERROR:', error)
      const message = error instanceof Error && error.message !== 'Request failed'
        ? error.message
        : t.genericError(PHONE_DISPLAY)
      setErrorMessage(message)
      setShowErrorPopup(true)
      if (errorTimerRef.current) clearTimeout(errorTimerRef.current)
      errorTimerRef.current = setTimeout(() => setShowErrorPopup(false), 8000)
    } finally {
      setSubmitting(false)
    }
  }

  const inputClass = (field: keyof FormData) =>
    'w-full rounded-2xl border px-5 py-4 text-sm text-white outline-none placeholder:text-white/35 bg-white/[0.05] transition ' +
    (fieldErrors[field] ? 'border-red-400/60 focus:border-red-400' : 'border-white/10 focus:border-cyan-400/60')

  // Appointment summary for the confirmation screen
  const confirmedDate   = formData.preferredDate === 'asap'
    ? t.asapLabel
    : (formData.preferredDate ? localizedDateShort(formData.preferredDate, lang) : undefined)
  const confirmedWindow = TIME_WINDOWS.find(w => w.id === formData.preferredWindow)

  return (
    <motion.div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/75 px-4 backdrop-blur-xl"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}
      role="dialog" aria-modal="true" aria-label="Book a service request"
    >
      <motion.div
        initial={{ opacity: 0, y: 48, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 48, scale: 0.95 }}
        transition={{ duration: 0.5, ease: EASE }}
        ref={scrollContainerRef}
        className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[36px] border border-white/10 bg-[#07101D] p-6 shadow-[0_30px_120px_rgba(0,0,0,0.75)]"
      >
        <div className="flex items-start justify-between gap-6 border-b border-white/10 pb-5">
          <div>
            <div className="flex items-center gap-3">
              <div className="text-sm font-black uppercase tracking-[0.3em] text-cyan-300">
                {requestKind === 'estimate' ? t.estimateRequest : t.serviceRequest}
              </div>
              <div className="flex rounded-full border border-white/10 bg-white/5 p-0.5 text-[11px] font-black">
                <button
                  type="button"
                  onClick={() => setLang('en')}
                  className={`rounded-full px-2.5 py-1 transition ${lang === 'en' ? 'bg-cyan-400 text-black' : 'text-white/50 hover:text-white'}`}
                >
                  EN
                </button>
                <button
                  type="button"
                  onClick={() => setLang('es')}
                  className={`rounded-full px-2.5 py-1 transition ${lang === 'es' ? 'bg-cyan-400 text-black' : 'text-white/50 hover:text-white'}`}
                >
                  ES
                </button>
              </div>
            </div>
            <h2 className="mt-3 text-3xl font-black">
              {requestKind === 'estimate' ? t.titleEstimate : t.titleService}
            </h2>
          </div>
          <button type="button" onClick={onClose} aria-label={t.close} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-black text-white transition hover:bg-white/10">✕</button>
        </div>

        {submitted ? (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }} className="mt-8 space-y-5">

            {/* Confirmation header */}
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
                {autoApproved && confirmedDateIso ? (
                  <>
                    <div className="text-xs font-black uppercase tracking-[0.25em] text-cyan-300">{t.youreConfirmed}</div>
                    <p className="mt-1 font-black text-white">
                      {new Date(confirmedDateIso + 'T12:00:00').toLocaleDateString(lang === 'es' ? 'es-US' : 'en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                      {confirmedWindowLabel ? `, ${confirmedWindowLabel}` : ''}
                    </p>
                    <p className="text-sm text-white/60">{t.realAvailabilityChecked}</p>
                  </>
                ) : (
                  <>
                    <div className="text-xs font-black uppercase tracking-[0.25em] text-cyan-300">{t.requestReceived}</div>
                    <p className="mt-1 font-black text-white">{t.willCallToConfirm(formData.phone)}</p>
                    <p className="text-sm text-white/60">{t.hoursNote}</p>
                  </>
                )}
              </div>
            </div>

            {/* Appointment summary */}
            {(confirmedDate || confirmedWindow) && (
              <div className="rounded-[24px] border border-emerald-400/20 bg-emerald-400/[0.06] p-5">
                <div className="mb-3 flex items-center gap-2">
                  <svg className="h-4 w-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-xs font-black uppercase tracking-[0.25em] text-emerald-300">{autoApproved ? t.yourConfirmedAppointment : t.yourRequestedAppointment}</span>
                </div>
                <div className="flex flex-wrap gap-3">
                  {confirmedDate && (
                    <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-5 py-3">
                      <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400/70">{t.date}</p>
                      <p className="mt-0.5 font-black text-white">{confirmedDate}</p>
                    </div>
                  )}
                  {confirmedWindow && (
                    <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-5 py-3">
                      <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400/70">{t.timeWindow}</p>
                      <p className="mt-0.5 font-black text-white">{t.timeWindows[confirmedWindow.id as keyof typeof t.timeWindows].label}</p>
                      <p className="text-xs text-white/50">{t.timeWindows[confirmedWindow.id as keyof typeof t.timeWindows].sub}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* AI intake brief -- loading state */}
            <AnimatePresence mode="wait">
              {intakeLoading && (
                <motion.div key="brief-loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="rounded-[24px] border border-cyan-400/15 bg-white/[0.03] p-6">
                  <div className="mb-4 flex items-center gap-3">
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                      className="h-5 w-5 rounded-full border-2 border-cyan-400/20 border-t-cyan-400" />
                    <span className="text-xs font-black uppercase tracking-[0.25em] text-cyan-300">{lang === 'es' ? 'IA Analizando Su Equipo' : 'AI Analyzing Your Equipment'}</span>
                  </div>
                  <div className="space-y-2">
                    {[80, 60, 70].map((w, i) => (
                      <motion.div key={i} className="h-3 rounded-full bg-white/5"
                        animate={{ opacity: [0.3, 0.7, 0.3] }}
                        transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.2 }}
                        style={{ width: `${w}%` }} />
                    ))}
                  </div>
                </motion.div>
              )}

              {/* AI intake brief -- results */}
              {!intakeLoading && intakeBrief && (
                <motion.div key="brief-result" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: EASE }} className="space-y-4">

                  {/* Greeting */}
                  <div className="rounded-[24px] border border-cyan-400/25 bg-gradient-to-b from-cyan-400/[0.07] to-transparent p-6">
                    <div className="mb-3 flex items-center gap-2.5">
                      <div className="flex h-7 w-7 items-center justify-center rounded-xl border border-cyan-400/30 bg-cyan-400/15">
                        <svg className="h-4 w-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      </div>
                      <span className="text-xs font-black uppercase tracking-[0.25em] text-cyan-300">{t.aiAssessmentBrief}</span>
                    </div>
                    <p className="text-[15px] leading-relaxed text-white/85">{intakeBrief.greeting}</p>
                  </div>

                  {/* Expert insights */}
                  {intakeBrief.insights.length > 0 && (
                    <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-6">
                      <p className="mb-4 text-xs font-black uppercase tracking-[0.22em] text-white/40">{t.whatTechWillKnow}</p>
                      <div className="space-y-3">
                        {intakeBrief.insights.map((insight, i) => (
                          <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.4, delay: 0.1 * i, ease: EASE }}
                            className="flex items-start gap-3">
                            <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-lg border border-cyan-400/30 bg-cyan-400/10 text-[10px] font-black text-cyan-400">{i + 1}</span>
                            <p className="text-sm leading-relaxed text-white/75">{insight}</p>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Repair outlook */}
                  {intakeBrief.repairOutlook && (
                    <div className="rounded-[24px] border border-amber-400/20 bg-amber-400/[0.05] p-5">
                      <div className="mb-2 flex items-center gap-2">
                        <svg className="h-4 w-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-xs font-black uppercase tracking-[0.2em] text-amber-300">{t.whatToExpect}</span>
                      </div>
                      <p className="text-sm leading-relaxed text-white/70">{intakeBrief.repairOutlook}</p>
                    </div>
                  )}

                  {/* Related blog posts */}
                  {intakeBrief.blogPosts.length > 0 && (
                    <div className="rounded-[24px] border border-white/8 bg-white/[0.02] p-5">
                      <p className="mb-4 text-xs font-black uppercase tracking-[0.22em] text-white/40">{t.aiFoundArticles}</p>
                      <div className="space-y-3">
                        {intakeBrief.blogPosts.map((post, i) => (
                          <motion.a
                            key={post.slug}
                            href={`/blog/${post.slug}`}
                            onClick={onClose}
                            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.15 * i, ease: EASE }}
                            className="flex items-start gap-4 rounded-2xl border border-white/8 bg-white/[0.03] p-4 transition hover:border-cyan-400/30 hover:bg-cyan-400/[0.04]"
                          >
                            {post.hero_image_url && (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={post.hero_image_url} alt="" className="h-14 w-14 flex-shrink-0 rounded-xl object-cover opacity-80" />
                            )}
                            <div className="min-w-0">
                              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-cyan-400/70">{post.category}</p>
                              <p className="mt-0.5 text-sm font-black leading-snug text-white">{post.title}</p>
                              {post.excerpt && <p className="mt-1 line-clamp-2 text-xs text-white/45">{post.excerpt}</p>}
                            </div>
                            <svg className="ml-auto h-4 w-4 flex-shrink-0 text-white/25" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                            </svg>
                          </motion.a>
                        ))}
                      </div>
                      <a href="/blog" onClick={onClose} className="mt-3 block text-center text-xs font-black uppercase tracking-[0.15em] text-white/30 transition hover:text-cyan-300">
                        {t.browseAllGuides}
                      </a>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Interactive follow-up -- real answers, not just a static brief */}
            <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-6">
              <p className="mb-3 text-xs font-black uppercase tracking-[0.22em] text-white/40">{t.askUsAnything}</p>

              {followupThread.length > 0 && (
                <div className="mb-4 space-y-4">
                  {followupThread.map((qa, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: EASE }}>
                      <p className="text-sm font-black text-cyan-300">{qa.question}</p>
                      <p className="mt-1 text-sm leading-relaxed text-white/75">{qa.answer}</p>
                    </motion.div>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <input
                  type="text"
                  value={followupQuestion}
                  onChange={(e) => setFollowupQuestion(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleFollowupAsk() } }}
                  placeholder={t.askPlaceholder}
                  disabled={followupAsking}
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.05] px-5 py-3.5 text-sm text-white outline-none placeholder:text-white/35 focus:border-cyan-400/60 transition disabled:opacity-60"
                />
                <button
                  type="button"
                  onClick={handleFollowupAsk}
                  disabled={followupAsking || !followupQuestion.trim()}
                  className="flex-shrink-0 rounded-2xl bg-cyan-400 px-5 py-3.5 text-sm font-black text-black transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {followupAsking ? '…' : t.ask}
                </button>
              </div>
            </div>

            <div className="flex flex-wrap justify-end gap-3 pt-1">
              <a href="tel:9728077232" className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3.5 text-sm font-black text-white transition hover:border-cyan-400/30">
                {t.callUs}: {PHONE_DISPLAY}
              </a>
              <button type="button" onClick={onClose} className="rounded-2xl bg-cyan-400 px-5 py-3.5 text-sm font-black text-black transition hover:bg-cyan-300">
                {t.done}
              </button>
            </div>
          </motion.div>
        ) : (
          <form className="mt-6 grid gap-4" onSubmit={handleSubmit} noValidate>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <input ref={firstFieldRef} type="text" name="name" value={formData.name} onChange={updateForm} placeholder={t.fullName} autoComplete="name" className={inputClass('name')} />
                {fieldErrors.name && <p className="mt-1 pl-1 text-xs text-red-400">{fieldErrors.name}</p>}
              </div>
              <div>
                <input type="tel" name="phone" value={formData.phone} onChange={updateForm} placeholder={t.phoneNumber} autoComplete="tel" pattern="[\d\s\-().+]{7,}" className={inputClass('phone')} />
                {fieldErrors.phone && <p className="mt-1 pl-1 text-xs text-red-400">{fieldErrors.phone}</p>}
              </div>
            </div>

            <label className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3">
              <input
                type="checkbox"
                checked={smsConsent}
                onChange={(e) => setSmsConsent(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-white/20 bg-[#0B1220] accent-cyan-400"
              />
              <span className="text-xs leading-relaxed text-white/50">
                {t.consent}
              </span>
            </label>
            <p className="text-xs leading-relaxed text-white/35">
              {t.consentNote}{' '}
              <a href="/privacy-policy" target="_blank" rel="noopener noreferrer" className="underline hover:text-white/60">{t.privacyPolicy}</a> {t.and}{' '}
              <a href="/terms-of-service" target="_blank" rel="noopener noreferrer" className="underline hover:text-white/60">{t.termsOfService}</a>.
            </p>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <input type="email" name="email" value={formData.email} onChange={updateForm} placeholder={t.emailAddress} autoComplete="email" className={inputClass('email')} />
                {fieldErrors.email && <p className="mt-1 pl-1 text-xs text-red-400">{fieldErrors.email}</p>}
              </div>
              <select name="serviceType" value={formData.serviceType} onChange={updateForm} className="rounded-2xl border border-white/10 bg-[#0B1220] px-5 py-4 text-sm text-white outline-none focus:border-cyan-400/60 transition">
                {Object.keys(t.serviceTypes).map((key) => (
                  <option key={key} value={key}>{t.serviceTypes[key]}</option>
                ))}
              </select>
            </div>

            <div>
              <input type="text" name="address" value={formData.address} onChange={updateForm} placeholder={t.streetAddress} autoComplete="address-line1" className={inputClass('address')} />
              {fieldErrors.address && <p className="mt-1 pl-1 text-xs text-red-400">{fieldErrors.address}</p>}
            </div>

            <div className="grid gap-4 md:grid-cols-[1fr_80px_120px]">
              <div>
                <input type="text" name="city" value={formData.city} onChange={updateForm} onBlur={() => { const full = [formData.address, formData.city, formData.state, formData.zip].filter(Boolean).join(', '); lookupDistance(full) }} placeholder={t.city} autoComplete="address-level2" className={inputClass('city')} />
                {fieldErrors.city && <p className="mt-1 pl-1 text-xs text-red-400">{fieldErrors.city}</p>}
              </div>
              <div>
                <input type="text" name="state" value={formData.state} onChange={updateForm} placeholder={t.state} autoComplete="address-level1" maxLength={2} className={inputClass('state')} />
              </div>
              <div>
                <input type="text" name="zip" value={formData.zip} onChange={updateForm} placeholder={t.zip} autoComplete="postal-code" inputMode="numeric" maxLength={10} className={inputClass('zip')} />
                {fieldErrors.zip && <p className="mt-1 pl-1 text-xs text-red-400">{fieldErrors.zip}</p>}
              </div>
            </div>

            {distanceLoading && (
              <p className="flex items-center gap-1.5 pl-1 text-xs text-white/40">
                <span className="inline-block h-2.5 w-2.5 animate-spin rounded-full border border-white/20 border-t-cyan-400" />
                {t.calculatingDistance}
              </p>
            )}
            {!distanceLoading && distanceMiles !== null && (
              <p className={`pl-1 text-xs font-bold ${distanceMiles <= 60 ? 'text-emerald-400' : 'text-yellow-400'}`}>
                {t.milesFromShop(distanceMiles)}{distanceMiles > 60 && t.pleaseCallToConfirmCoverage}
              </p>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <input type="text" name="equipmentType" value={formData.equipmentType} onChange={updateForm} placeholder={t.equipmentType} className={inputClass('equipmentType')} />
              <input type="text" name="brandModel" value={formData.brandModel} onChange={updateForm} placeholder={t.brandModel} className={inputClass('brandModel')} />
            </div>

            {/* AI Equipment Summary */}
            <AnimatePresence>
              {summarizing && (
                <motion.div key="sum-loading" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="flex items-center gap-2.5 rounded-2xl border border-amber-400/20 bg-amber-400/[0.05] px-4 py-3">
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="h-4 w-4 rounded-full border-2 border-amber-400/30 border-t-amber-400 flex-shrink-0" />
                  <span className="text-xs font-bold text-amber-300">{t.lookingUpEquipment}</span>
                </motion.div>
              )}
              {!summarizing && equipmentSummary && (
                <motion.div key="sum-result" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="rounded-2xl border border-amber-400/20 bg-amber-400/[0.05] p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <svg className="h-4 w-4 flex-shrink-0 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <span className="text-xs font-black uppercase tracking-[0.15em] text-amber-300">{t.aiEquipmentBrief}</span>
                  </div>
                  <p className="text-sm leading-relaxed text-white/80">{equipmentSummary}</p>
                  {equipmentQuestion && (
                    <div className="mt-3 rounded-xl border border-amber-400/15 bg-amber-400/[0.06] px-3 py-2.5">
                      <p className="text-xs font-black uppercase tracking-[0.12em] text-amber-400/70 mb-1">{t.helpUsPrepare}</p>
                      <p className="text-sm font-bold text-white/90">{equipmentQuestion}</p>
                      <p className="mt-1 text-[11px] text-white/40">{t.answerInDetailsBelow}</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* AI Photo Diagnosis */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <div className="mb-3 flex items-center gap-2">
                <svg className="h-4 w-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-xs font-black uppercase tracking-[0.2em] text-cyan-300">{t.aiPhotoDiagnosis}</span>
                <span className="rounded-lg border border-white/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-white/35">{t.optional}</span>
              </div>
              <p className="mb-3 text-xs text-white/45">{t.uploadPhotosHint}</p>
              {photos.length === 0 ? (
                <label className="flex cursor-pointer items-center justify-center gap-3 rounded-2xl border border-dashed border-white/20 bg-white/[0.03] px-5 py-6 text-sm text-white/45 transition hover:border-cyan-400/40 hover:bg-cyan-400/[0.04] hover:text-white/65">
                  <svg className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 16v-4m0 0V8m0 4h4m-4 0H8m13 4a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{t.tapToUpload}</span>
                  <input ref={photoRef} type="file" accept="image/*" multiple className="sr-only" onChange={handlePhotosChange} />
                </label>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-2">
                    {photos.map((photo, i) => (
                      <div key={i} className="relative overflow-hidden rounded-xl">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={photo.preview} alt={`Equipment photo ${i + 1}`} className="h-24 w-full object-cover" />
                        <button type="button" onClick={() => removePhoto(i)} aria-label="Remove photo" className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-lg border border-white/20 bg-black/60 text-xs font-black text-white backdrop-blur transition hover:bg-black/80">✕</button>
                      </div>
                    ))}
                    {photos.length < MAX_PHOTOS && (
                      <label className="flex h-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-white/20 bg-white/[0.03] text-white/45 transition hover:border-cyan-400/40 hover:bg-cyan-400/[0.04] hover:text-white/65">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                        <span className="text-[10px] font-bold">{t.addPhoto}</span>
                        <input ref={photoRef} type="file" accept="image/*" multiple className="sr-only" onChange={handlePhotosChange} />
                      </label>
                    )}
                  </div>
                  <AnimatePresence mode="wait">
                    {diagnosing && (
                      <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2 rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.06] px-4 py-3">
                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="h-4 w-4 rounded-full border-2 border-cyan-400/30 border-t-cyan-400" />
                        <span className="text-xs font-bold text-cyan-300">{t.analyzingEquipment}</span>
                      </motion.div>
                    )}
                    {!diagnosing && diagnosis && (
                      <motion.div key="result" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.06] px-4 py-4">
                        <div className="mb-2 flex items-center gap-2">
                          <svg className="h-4 w-4 flex-shrink-0 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-xs font-black uppercase tracking-[0.15em] text-cyan-300">{t.aiAssessment}</span>
                        </div>
                        <p className="text-sm leading-relaxed text-white/75">{diagnosis}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>

            <textarea name="details" value={formData.details} onChange={updateForm} placeholder={t.details} rows={4} className="resize-none rounded-2xl border border-white/10 bg-white/[0.05] px-5 py-4 text-sm text-white outline-none placeholder:text-white/35 focus:border-cyan-400/60 transition" />

            {/* Appointment preference */}
            <div ref={dateSectionRef} className={`rounded-2xl border bg-white/[0.03] p-5 transition-all duration-300 ${showDateConflict ? 'border-amber-400/60 ring-2 ring-amber-400/20' : 'border-white/10'}`}>
              <div className="mb-4 flex items-center gap-2">
                <svg className="h-4 w-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-xs font-black uppercase tracking-[0.2em] text-emerald-300">{t.preferredAppointment}</span>
                <span className="rounded-lg border border-white/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-white/35">{t.optional}</span>
              </div>

              {/* Date grid */}
              <p className="mb-3 text-xs text-white/45">
                {t.pickDateHint}{dateAvailability && <span className="text-white/30">{t.dimmedDatesHint}</span>}:
              </p>
              <div className="mb-4 grid grid-cols-3 gap-2 sm:grid-cols-4">
                {dateOptions.map((d) => {
                  const isAvailable = dateAvailability ? dateAvailability[d.iso] !== false : true
                  return (
                    <button
                      key={d.iso}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, preferredDate: prev.preferredDate === d.iso ? '' : d.iso }))}
                      title={!isAvailable ? t.dateTightTitle : undefined}
                      className={`relative rounded-xl border py-2.5 text-center text-xs font-bold transition ${
                        formData.preferredDate === d.iso
                          ? 'border-emerald-400/60 bg-emerald-400/20 text-emerald-300'
                          : isAvailable
                          ? 'border-white/10 text-white/55 hover:border-white/30 hover:text-white'
                          : 'border-white/5 text-white/25 hover:border-white/20 hover:text-white/50'
                      }`}
                    >
                      {!isAvailable && formData.preferredDate !== d.iso && (
                        <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-amber-400/70" />
                      )}
                      {localizedDateShort(d.iso, lang)}
                    </button>
                  )
                })}
              </div>

              {/* Time window */}
              <p className="mb-3 text-xs text-white/45">{t.preferredTimeWindow}</p>
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
                    <p className="text-xs font-black">{t.timeWindows[w.id as keyof typeof t.timeWindows].label}</p>
                    <p className="text-[10px] text-current opacity-60">{t.timeWindows[w.id as keyof typeof t.timeWindows].sub}</p>
                  </button>
                ))}
              </div>

              {/* Live efficiency suggestion -- fires as soon as address + a
                  real date are both filled in, before the customer submits */}
              {checkingEfficiency && (
                <p className="mt-4 text-xs text-white/40">{t.checkingEfficiency}</p>
              )}
              {!checkingEfficiency && dateRecommendation?.betterDate && dismissedRecommendationFor !== formData.preferredDate && (
                <div className={`mt-4 rounded-xl border p-4 ${dateRecommendation.chosenDateOk ? 'border-cyan-400/30 bg-cyan-400/5' : 'border-amber-400/40 bg-amber-400/10'}`}>
                  <p className={`text-xs font-black uppercase tracking-widest ${dateRecommendation.chosenDateOk ? 'text-cyan-300' : 'text-amber-300'}`}>
                    {dateRecommendation.chosenDateOk ? t.moreEfficientDate : t.mayNeedReschedule}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-white/80">{dateRecommendation.betterDate.explanation}</p>
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setFormData((prev) => ({ ...prev, preferredDate: dateRecommendation.betterDate!.dateIso }))
                        setDateRecommendation(null)
                      }}
                      className={`rounded-lg px-4 py-2 text-xs font-black uppercase tracking-widest transition ${
                        dateRecommendation.chosenDateOk ? 'bg-cyan-400 text-black hover:bg-cyan-300' : 'bg-amber-400 text-black hover:bg-amber-300'
                      }`}
                    >
                      {t.useThisDate}
                    </button>
                    <button
                      type="button"
                      onClick={() => setDismissedRecommendationFor(formData.preferredDate)}
                      className="rounded-lg border border-white/15 px-4 py-2 text-xs font-bold text-white/60 transition hover:text-white"
                    >
                      {t.keepMyDate}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <input type="text" name="searchQuery" value={formData.searchQuery} onChange={updateForm} placeholder={t.searchQuery} className="w-full rounded-2xl border border-white/10 bg-white/[0.05] px-5 py-4 text-sm text-white outline-none placeholder:text-white/35 focus:border-cyan-400/60 transition" />

            <p className="text-xs text-white/35">* {t.requiredFieldsNote}</p>
            <button
              type="submit"
              disabled={submitting || diagnosing}
              className="button-glow mt-2 rounded-2xl bg-cyan-400 px-6 py-5 text-sm font-black uppercase tracking-[0.15em] text-black disabled:cursor-not-allowed disabled:opacity-60 transition"
            >
              {submitting ? t.submitting : requestKind === 'estimate' ? t.submitEstimate : t.submitService}
            </button>
          </form>
        )}
      </motion.div>

      {/* Date conflict popup -- shown when the selected date has no route-compatible availability */}
      <AnimatePresence>
        {showDateConflict && (
          <motion.div
            role="alert"
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="fixed left-1/2 top-1/2 z-[300] w-[min(90vw,480px)] -translate-x-1/2 -translate-y-1/2 rounded-[28px] border border-amber-400/30 bg-[#140f00] p-6 shadow-[0_30px_80px_rgba(0,0,0,0.8)]"
          >
            <div className="mb-4 flex items-start gap-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-amber-400/30 bg-amber-500/15">
                <svg className="h-5 w-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-black uppercase tracking-[0.18em] text-amber-400">
                  {dateConflictInfo.reason === 'full' ? t.dateFullyBooked : t.dateNotAvailable}
                </p>
                <p className="mt-1.5 text-sm leading-relaxed text-white/80">
                  {dateConflictInfo.reason === 'full' ? t.fullyBookedExplanation : t.notAvailableExplanation}
                </p>
              </div>
            </div>

            {dateConflictInfo.suggestedDates && dateConflictInfo.suggestedDates.length > 0 && (
              <div className="mb-4">
                <p className="mb-2 text-xs font-bold uppercase tracking-widest text-amber-300/70">{t.suggestedDates}</p>
                <div className="flex flex-wrap gap-2">
                  {dateConflictInfo.suggestedDates.map((s) => {
                    const d = new Date(s.dateIso + 'T12:00:00')
                    const label = d.toLocaleDateString(lang === 'es' ? 'es-US' : 'en-US', { weekday: 'short', month: 'short', day: 'numeric' })
                    return (
                      <button
                        key={s.dateIso}
                        type="button"
                        onClick={() => {
                          setFormData((prev) => ({ ...prev, preferredDate: s.dateIso }))
                          setShowDateConflict(false)
                        }}
                        className="rounded-xl border border-amber-400/40 bg-amber-500/10 px-3 py-2 text-xs font-bold text-amber-200 transition hover:border-amber-400/70 hover:bg-amber-500/20"
                      >
                        {label}
                        {s.reason === 'nearby_job' && <span className="ml-1.5 text-[10px] text-emerald-300">{t.nearYourArea}</span>}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowDateConflict(false)
                  setFormData((prev) => ({ ...prev, preferredDate: '', preferredWindow: '' }))
                  setTimeout(() => {
                    dateSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                  }, 100)
                }}
                className="flex-1 rounded-2xl bg-amber-400 py-3 text-xs font-black uppercase tracking-[0.15em] text-black transition hover:bg-amber-300"
              >
                {t.chooseDifferentDate}
              </button>
              <a
                href="tel:9728077232"
                className="flex-1 rounded-2xl border border-amber-400/30 bg-amber-500/10 py-3 text-center text-xs font-black uppercase tracking-[0.15em] text-amber-300 transition hover:bg-amber-500/20"
              >
                {t.callUsInstead}
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error popup -- fixed center of viewport so it's always visible regardless of scroll */}
      <AnimatePresence>
        {showErrorPopup && errorMessage && (
          <motion.div
            role="alert"
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="fixed left-1/2 top-1/2 z-[300] w-[min(90vw,480px)] -translate-x-1/2 -translate-y-1/2 rounded-[28px] border border-red-400/30 bg-[#1a0a0a] p-6 shadow-[0_30px_80px_rgba(0,0,0,0.8)]"
          >
            <div className="mb-4 flex items-start gap-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-red-400/30 bg-red-500/15">
                <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-black uppercase tracking-[0.18em] text-red-400">{t.unableToSubmit}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-white/80">{errorMessage}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowErrorPopup(false)}
                className="flex-1 rounded-2xl border border-white/10 bg-white/5 py-3 text-xs font-black uppercase tracking-[0.15em] text-white transition hover:bg-white/10"
              >
                {t.tryAgain}
              </button>
              <a
                href="tel:9728077232"
                className="flex-1 rounded-2xl bg-red-500/20 border border-red-400/30 py-3 text-center text-xs font-black uppercase tracking-[0.15em] text-red-300 transition hover:bg-red-500/30"
              >
                {t.callUsInstead}
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
