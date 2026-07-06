import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createHmac } from 'crypto'
import { captureNewCustomer } from '@/lib/newCustomers'
import { escapeHtml } from '@/lib/serverSecurity'
import { callClaude, cleanJsonOutput } from '@/lib/claude'

const TRIAGE_SYSTEM = `You are a service request triage specialist for 2EZ TEK, a fitness equipment repair company in Dallas Fort Worth.

Score incoming service requests by priority so technicians can handle the most critical work first.

Scoring criteria:
- Commercial facility (hotel gym, apartment gym, corporate gym, health club) = +30 points base
- High-value brand (Life Fitness, Precor, Matrix, Technogym, Cybex, Peloton, TRUE Fitness) = +20 points
- Mid-range brand (NordicTrack, ProForm, Bowflex, Schwinn, Nautilus, StairMaster) = +10 points
- Severe issue (motor failure, console dead, error code, won't turn on, safety stop) = +25 points
- Moderate issue (belt slipping, resistance stuck, squeaking, wobbling) = +10 points
- Assembly/installation request = base 40 points
- Preventative maintenance = base 35 points
- Emergency or urgent language = +15 points
- Multiple machines mentioned = +10 points
- Score range: 0-100

Priority labels:
- 80-100: URGENT
- 60-79: HIGH
- 40-59: MEDIUM
- 0-39: STANDARD

Return ONLY valid JSON:
{ "score": 0, "priority": "STANDARD", "notes": "one sentence explaining the score" }`

type TriageResult = {
  score: number
  priority: string
  notes: string
}

async function triageServiceRequest(payload: ServiceRequestPayload): Promise<TriageResult> {
  const userMessage = `Score this incoming service request:

Service Type: ${payload.requestType || payload.serviceType || 'Not specified'}
Equipment Type: ${payload.equipmentType || 'Not specified'}
Brand / Model: ${payload.brandModel || 'Not specified'}
Issue Details: ${payload.issueDescription || payload.details || 'Not specified'}
Source: ${payload.source || 'Website'}`

  try {
    const outputText = await callClaude({
      system: TRIAGE_SYSTEM,
      userMessage,
      maxTokens: 256,
      temperature: 0.1,
    })
    return JSON.parse(cleanJsonOutput(outputText))
  } catch {
    return { score: 50, priority: 'MEDIUM', notes: 'Triage scoring unavailable' }
  }
}

async function saveTriageScore(email: string, triage: TriageResult) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) return

    const supabase = createClient(
      supabaseUrl,
      serviceRoleKey
    )
    await supabase
      .from('new_customers')
      .update({
        triage_score: triage.score,
        triage_priority: triage.priority,
        triage_notes: triage.notes,
      })
      .eq('normalized_email', email.toLowerCase())
  } catch (err) {
    console.error('TRIAGE SAVE ERROR:', err)
  }
}

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const BASE_LAT = 32.970
const BASE_LNG = -96.836

function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3958.8
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function cleanAddress(raw: string): string {
  const zipMatch = raw.match(/^(.+?\b\d{5}\b)/)
  if (zipMatch) return zipMatch[1].trim()
  return raw.split(',').slice(0, 3).join(',').trim()
}

type Coords = { lat: number; lng: number }

async function geocodeCoords(address: string): Promise<Coords | null> {
  const cleaned = cleanAddress(address)
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8000)
    const url = `https://geocoding.geo.census.gov/geocoder/locations/onelineaddress?address=${encodeURIComponent(cleaned)}&benchmark=2020&format=json`
    const res = await fetch(url, { signal: controller.signal })
    clearTimeout(timeout)
    if (res.ok) {
      const data = await res.json()
      const match = data?.result?.addressMatches?.[0]
      if (match) return { lat: parseFloat(match.coordinates.y), lng: parseFloat(match.coordinates.x) }
    }
  } catch { /* fall through */ }

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 6000)
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cleaned + ', Texas, USA')}&format=json&limit=1&countrycodes=us`,
      { signal: controller.signal, headers: { 'User-Agent': '2EZTEK-ServiceApp/1.0 (support@2eztek.com)', 'Accept-Language': 'en' } }
    )
    clearTimeout(timeout)
    const results = await res.json()
    if (results?.length) return { lat: parseFloat(results[0].lat), lng: parseFloat(results[0].lon) }
  } catch { /* silent */ }

  return null
}

async function geocodeDistance(address: string): Promise<number | undefined> {
  const coords = await geocodeCoords(address)
  if (!coords) return undefined
  return Math.round(haversine(BASE_LAT, BASE_LNG, coords.lat, coords.lng))
}

async function checkDayCompatibility(dateIso: string, newAddress: string): Promise<boolean> {
  const token = await getGraphToken()
  if (!token) return true // no Azure creds yet, allow all

  const calEmail = process.env.OUTLOOK_CALENDAR_EMAIL || 'rturner@2eztek.com'
  try {
    const res = await fetch(
      `https://graph.microsoft.com/v1.0/users/${calEmail}/calendarView` +
      `?startDateTime=${dateIso}T00:00:00&endDateTime=${dateIso}T23:59:59` +
      `&$select=subject,location&$top=20`,
      { headers: { Authorization: `Bearer ${token}`, Prefer: 'outlook.timezone="Central Standard Time"' } }
    )
    if (!res.ok) return true
    const data = await res.json()
    const events: Array<{ location?: { displayName?: string } }> = data.value || []
    if (events.length === 0) return true // first booking of the day, allow

    const newCoords = await geocodeCoords(newAddress)
    if (!newCoords) return true // can't geocode new address, allow

    for (const event of events) {
      const loc = event.location?.displayName
      if (!loc) continue
      const existingCoords = await geocodeCoords(loc)
      if (!existingCoords) continue
      const dist = haversine(newCoords.lat, newCoords.lng, existingCoords.lat, existingCoords.lng)
      if (dist <= 20) return true // within 20 miles of an existing appointment
    }

    return false // all existing appointments are more than 20 miles away
  } catch {
    return true // on any error, allow the booking
  }
}

type ServiceRequestPayload = {
  name?: string
  phone?: string
  email?: string
  serviceType?: string
  requestType?: string
  address?: string
  city?: string
  state?: string
  zip?: string
  serviceAddress?: string
  equipmentType?: string
  brandModel?: string
  details?: string
  issueDescription?: string
  source?: string
  page?: string
  companyWebsite?: string
  searchQuery?: string
  preferredDate?: string
  preferredDateIso?: string
  preferredWindow?: string
  preferredWindowId?: string
  photoBase64?: string
  photoMediaType?: string
  aiDiagnosis?: string
}

const WINDOW_TIMES: Record<string, { start: string; end: string }> = {
  morning:   { start: '08:00:00', end: '12:00:00' },
  afternoon: { start: '12:00:00', end: '17:00:00' },
  'all-day': { start: '08:00:00', end: '17:00:00' },
  asap:      { start: '08:00:00', end: '17:00:00' },
}

async function getGraphToken(): Promise<string | null> {
  const tenantId     = process.env.AZURE_TENANT_ID
  const clientId     = process.env.AZURE_CLIENT_ID
  const clientSecret = process.env.AZURE_CLIENT_SECRET
  if (!tenantId || !clientId || !clientSecret) {
    console.log('OUTLOOK: missing Azure env vars — skipping calendar')
    return null
  }

  const res = await fetch(
    `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type:    'client_credentials',
        client_id:     clientId,
        client_secret: clientSecret,
        scope:         'https://graph.microsoft.com/.default',
      }),
    }
  )
  if (!res.ok) {
    const err = await res.text()
    console.error('OUTLOOK TOKEN ERROR:', res.status, err)
    return null
  }
  const data = await res.json()
  return data.access_token || null
}

async function createOutlookEvent(payload: ServiceRequestPayload): Promise<string | null> {
  const dateIso    = payload.preferredDateIso
  const windowId   = payload.preferredWindowId || 'all-day'
  const calEmail   = process.env.OUTLOOK_CALENDAR_EMAIL || 'rturner@2eztek.com'

  if (!dateIso) {
    console.log('OUTLOOK: no preferredDateIso — skipping calendar event')
    return null
  }

  console.log(`OUTLOOK: creating event for ${dateIso} ${windowId} → ${calEmail}`)

  const times  = WINDOW_TIMES[windowId] || WINDOW_TIMES['all-day']
  const name   = payload.name || 'Customer'
  const svcType = payload.serviceType || payload.requestType || 'Service'
  const rawAddress = payload.serviceAddress || payload.address || ''
  const fullAddress = [rawAddress, payload.city, payload.state, payload.zip].filter(Boolean).join(', ')

  const apptDate = dateIso ? new Date(dateIso + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : ''
  const apptTime = payload.preferredWindow || ''

  const body = [
    `DATE: ${apptDate}`,
    `TIME: ${apptTime}`,
    '',
    `CUSTOMER: ${name}`,
    `PHONE: ${payload.phone || ''}`,
    `EMAIL: ${payload.email || ''}`,
    `ADDRESS: ${fullAddress}`,
    '',
    `EQUIPMENT: ${payload.equipmentType || ''} | ${payload.brandModel || ''}`,
    `SERVICE: ${svcType}`,
    '',
    `ISSUE:`,
    payload.issueDescription || payload.details || '',
  ].join('\n')

  const token = await getGraphToken()
  if (!token) return null

  const graphRes = await fetch(`https://graph.microsoft.com/v1.0/users/${calEmail}/calendar/events`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      subject: `[PENDING] 2EZ TEK: ${svcType} | ${name} | ${payload.email || ''}`,
      body: { contentType: 'text', content: body },
      start: { dateTime: `${dateIso}T${times.start}`, timeZone: 'Central Standard Time' },
      end:   { dateTime: `${dateIso}T${times.end}`,   timeZone: 'Central Standard Time' },
      location: { displayName: fullAddress || 'Dallas Fort Worth, TX' },
      showAs: 'tentative',
    }),
  })

  if (!graphRes.ok) {
    const errBody = await graphRes.text()
    console.error('OUTLOOK GRAPH ERROR:', graphRes.status, errBody)
    return null
  }

  const eventData = await graphRes.json()
  console.log('OUTLOOK: tentative event created, id:', eventData.id)
  return (eventData.id as string) || null
}

export async function approveOutlookEvent(eventId: string, subject: string): Promise<void> {
  const token = await getGraphToken()
  if (!token) return
  const calEmail = process.env.OUTLOOK_CALENDAR_EMAIL || 'rturner@2eztek.com'
  await fetch(`https://graph.microsoft.com/v1.0/users/${calEmail}/calendar/events/${eventId}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      subject: subject.replace('[PENDING] ', ''),
      showAs: 'busy',
    }),
  })
}

export async function deleteOutlookEvent(eventId: string): Promise<void> {
  const token = await getGraphToken()
  if (!token) return
  const calEmail = process.env.OUTLOOK_CALENDAR_EMAIL || 'rturner@2eztek.com'
  await fetch(`https://graph.microsoft.com/v1.0/users/${calEmail}/calendar/events/${eventId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })
}

function signBookingData(data: object): string {
  const json = JSON.stringify(data)
  const encoded = Buffer.from(json).toString('base64url')
  const sig = createHmac('sha256', process.env.ADMIN_BLOG_PASSWORD || 'dev-secret')
    .update(encoded)
    .digest('hex')
  return `${encoded}.${sig}`
}

export function verifyBookingToken(token: string): Record<string, string> | null {
  const dot = token.lastIndexOf('.')
  if (dot === -1) return null
  const encoded = token.slice(0, dot)
  const sig = token.slice(dot + 1)
  const expectedSig = createHmac('sha256', process.env.ADMIN_BLOG_PASSWORD || 'dev-secret')
    .update(encoded)
    .digest('hex')
  if (sig !== expectedSig) return null
  try {
    return JSON.parse(Buffer.from(encoded, 'base64url').toString())
  } catch {
    return null
  }
}

function clean(value: unknown) {
  return String(value || '').trim()
}

const PRIORITY_COLORS: Record<string, string> = {
  URGENT: '#ef4444',
  HIGH: '#f97316',
  MEDIUM: '#eab308',
  STANDARD: '#6b7280',
}

function buildEmailHtml(payload: ServiceRequestPayload, triage?: TriageResult, distanceMiles?: number) {
  const serviceType = escapeHtml(payload.requestType || payload.serviceType)
  const streetAddress = payload.serviceAddress || payload.address || ''
  const fullAddress = [streetAddress, payload.city, payload.state, payload.zip].filter(Boolean).join(', ')
  const address = escapeHtml(fullAddress || streetAddress)
  const details = escapeHtml(payload.issueDescription || payload.details)
  const priorityColor = triage ? (PRIORITY_COLORS[triage.priority] || '#6b7280') : '#6b7280'

  const submittedAt = new Date().toLocaleString('en-US', {
    timeZone: 'America/Chicago',
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true,
  }) + ' CST'

  const phoneHref = payload.phone ? `tel:${String(payload.phone).replace(/\D/g, '')}` : null
  const emailHref = payload.email ? `mailto:${payload.email}` : null

  return `
    <div style="font-family:Arial,sans-serif;background:#050B14;color:#ffffff;padding:24px;">
      <div style="max-width:680px;margin:0 auto;background:#07101D;border:1px solid rgba(255,255,255,0.12);border-radius:18px;overflow:hidden;">

        <!-- Header -->
        <div style="padding:24px 28px 20px;border-bottom:1px solid rgba(255,255,255,0.08);">
          <h1 style="margin:0 0 4px;color:#67e8f9;font-size:20px;">New 2EZ TEK Service Request</h1>
          <p style="margin:0;color:#64748b;font-size:13px;">Submitted ${submittedAt}</p>
        </div>

        <div style="padding:24px 28px;">

          <!-- APPOINTMENT BOX — most important, shown first -->
          ${(payload.preferredDate || payload.preferredWindow) ? `
          <div style="margin-bottom:20px;padding:18px 20px;border-radius:14px;background:#052a1a;border:2px solid #22c55e;">
            <p style="margin:0 0 4px;font-size:10px;font-weight:bold;letter-spacing:0.15em;text-transform:uppercase;color:#4ade80;">Requested Appointment</p>
            ${payload.preferredDate ? `<p style="margin:4px 0 0;font-size:20px;font-weight:900;color:#ffffff;">📅 ${escapeHtml(payload.preferredDate)}</p>` : ''}
            ${payload.preferredWindow ? `<p style="margin:4px 0 0;font-size:16px;font-weight:700;color:#4ade80;">🕐 ${escapeHtml(payload.preferredWindow)}</p>` : ''}
          </div>
          ` : `
          <div style="margin-bottom:20px;padding:14px 18px;border-radius:12px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);">
            <p style="margin:0;font-size:13px;color:#94a3b8;">No preferred date/time selected — contact to schedule.</p>
          </div>
          `}

          <!-- Priority -->
          ${triage ? `
          <div style="margin-bottom:20px;padding:14px 18px;border-radius:12px;background:${priorityColor}22;border:1px solid ${priorityColor}55;">
            <span style="font-size:16px;font-weight:bold;color:${priorityColor};">${triage.priority} PRIORITY</span>
            <span style="margin-left:10px;font-size:18px;font-weight:bold;color:${priorityColor};">${triage.score}/100</span>
            <p style="margin:6px 0 0;color:#cbd5e1;font-size:13px;">${escapeHtml(triage.notes)}</p>
          </div>
          ` : ''}

          <!-- Distance -->
          ${distanceMiles !== undefined ? `
          <div style="margin-bottom:20px;padding:10px 18px;border-radius:12px;background:${distanceMiles <= 60 ? '#06b65122' : '#f5950022'};border:1px solid ${distanceMiles <= 60 ? '#06b65155' : '#f5950055'};">
            <span style="font-size:14px;font-weight:bold;color:${distanceMiles <= 60 ? '#4ade80' : '#f59e0b'};">
              📍 ${distanceMiles} miles from shop${distanceMiles > 60 ? ' — outside typical range' : ''}
            </span>
          </div>
          ` : ''}

          <!-- Contact + service details -->
          <table style="width:100%;border-collapse:collapse;font-size:14px;">
            <tr style="border-bottom:1px solid rgba(255,255,255,0.06);">
              <td style="padding:9px 0;color:#64748b;width:130px;">Name</td>
              <td style="padding:9px 0;font-weight:700;">${escapeHtml(payload.name)}</td>
            </tr>
            <tr style="border-bottom:1px solid rgba(255,255,255,0.06);">
              <td style="padding:9px 0;color:#64748b;">Phone</td>
              <td style="padding:9px 0;">${phoneHref ? `<a href="${phoneHref}" style="color:#67e8f9;font-weight:700;text-decoration:none;">${escapeHtml(payload.phone)}</a>` : escapeHtml(payload.phone)}</td>
            </tr>
            <tr style="border-bottom:1px solid rgba(255,255,255,0.06);">
              <td style="padding:9px 0;color:#64748b;">Email</td>
              <td style="padding:9px 0;">${emailHref ? `<a href="${emailHref}" style="color:#67e8f9;text-decoration:none;">${escapeHtml(payload.email)}</a>` : escapeHtml(payload.email)}</td>
            </tr>
            <tr style="border-bottom:1px solid rgba(255,255,255,0.06);">
              <td style="padding:9px 0;color:#64748b;">Service Type</td>
              <td style="padding:9px 0;font-weight:700;">${serviceType}</td>
            </tr>
            <tr style="border-bottom:1px solid rgba(255,255,255,0.06);">
              <td style="padding:9px 0;color:#64748b;">Address</td>
              <td style="padding:9px 0;">${address}</td>
            </tr>
            <tr style="border-bottom:1px solid rgba(255,255,255,0.06);">
              <td style="padding:9px 0;color:#64748b;">Equipment</td>
              <td style="padding:9px 0;">${escapeHtml(payload.equipmentType)}</td>
            </tr>
            <tr style="border-bottom:1px solid rgba(255,255,255,0.06);">
              <td style="padding:9px 0;color:#64748b;">Brand / Model</td>
              <td style="padding:9px 0;">${escapeHtml(payload.brandModel)}</td>
            </tr>
            ${payload.searchQuery ? `
            <tr style="border-bottom:1px solid rgba(255,255,255,0.06);">
              <td style="padding:9px 0;color:#64748b;">Searched for</td>
              <td style="padding:9px 0;color:#67e8f9;font-weight:bold;">${escapeHtml(payload.searchQuery)}</td>
            </tr>` : ''}
            <tr>
              <td style="padding:9px 0;color:#64748b;">Source</td>
              <td style="padding:9px 0;color:#94a3b8;">${escapeHtml(payload.source)}</td>
            </tr>
          </table>

          <!-- Customer photo — shown inline so you never need to ask for it again -->
          ${payload.photoBase64 ? `
          <div style="margin-top:20px;">
            <p style="margin:0 0 8px;font-size:11px;font-weight:bold;letter-spacing:0.12em;text-transform:uppercase;color:#64748b;">Customer Photo</p>
            <img src="data:${payload.photoMediaType || 'image/jpeg'};base64,${payload.photoBase64}" alt="Customer equipment photo" style="max-width:100%;border-radius:12px;border:1px solid rgba(255,255,255,0.1);" />
          </div>
          ` : ''}

          <!-- AI Diagnosis -->
          ${payload.aiDiagnosis ? `
          <div style="margin-top:20px;padding:16px 18px;border-radius:12px;background:#0a1a2e;border:1px solid #22d3ee44;">
            <p style="margin:0 0 8px;font-size:11px;font-weight:bold;letter-spacing:0.12em;text-transform:uppercase;color:#67e8f9;">AI Photo Analysis</p>
            <p style="margin:0;white-space:pre-wrap;line-height:1.7;color:#cbd5e1;font-size:14px;">${escapeHtml(payload.aiDiagnosis)}</p>
          </div>
          ` : ''}

          <!-- Issue details -->
          <div style="margin-top:20px;padding:16px 18px;border-radius:12px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);">
            <p style="margin:0 0 8px;font-size:11px;font-weight:bold;letter-spacing:0.12em;text-transform:uppercase;color:#64748b;">Issue Description</p>
            <p style="margin:0;white-space:pre-wrap;line-height:1.7;color:#e2e8f0;">${details}</p>
          </div>

          <!-- Action buttons -->
          <div style="margin-top:20px;display:flex;gap:10px;flex-wrap:wrap;">
            ${phoneHref ? `<a href="${phoneHref}" style="display:inline-block;background:#22d3ee;color:#050B14;text-decoration:none;padding:11px 24px;border-radius:100px;font-weight:900;font-size:13px;">Call Now</a>` : ''}
            ${emailHref ? `<a href="${emailHref}" style="display:inline-block;background:rgba(255,255,255,0.08);color:#ffffff;text-decoration:none;padding:11px 24px;border-radius:100px;font-weight:700;font-size:13px;border:1px solid rgba(255,255,255,0.15);">Reply by Email</a>` : ''}
          </div>

          <!-- Approval buttons -->
          <div style="margin-top:24px;padding:20px;border-radius:14px;background:#052a1a;border:2px solid #22c55e;">
            <p style="margin:0 0 14px;font-size:11px;font-weight:bold;letter-spacing:0.15em;text-transform:uppercase;color:#4ade80;">Appointment Approval</p>
            <div style="display:flex;gap:10px;flex-wrap:wrap;">
              <a href="${approveUrl}" style="display:inline-block;background:#22c55e;color:#000;text-decoration:none;padding:13px 28px;border-radius:100px;font-weight:900;font-size:14px;">Approve Appointment</a>
              <a href="${rejectUrl}" style="display:inline-block;background:rgba(255,255,255,0.08);color:#ffffff;text-decoration:none;padding:13px 28px;border-radius:100px;font-weight:700;font-size:13px;border:1px solid rgba(255,255,255,0.2);">Decline / Reschedule</a>
            </div>
          </div>

        </div>
      </div>
    </div>
  `
}

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as ServiceRequestPayload

    const name = clean(payload.name)
    const phone = clean(payload.phone)
    const email = clean(payload.email)
    const serviceType = clean(payload.requestType || payload.serviceType)
    const details = clean(payload.issueDescription || payload.details)

    if (!name || !phone || !email || !serviceType) {
      return NextResponse.json(
        {
          success: false,
          message: 'Missing required service request fields.',
        },
        { status: 400 }
      )
    }

    if (
      name.length > 80 ||
      phone.length > 30 ||
      email.length > 254 ||
      serviceType.length > 120 ||
      details.length > 5000 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      phone.replace(/\D/g, '').length < 7
    ) {
      return NextResponse.json(
        { success: false, message: 'Invalid service request fields.' },
        { status: 400 }
      )
    }

    const rawAddress = payload.serviceAddress || payload.address || ''
    const serviceAddress = [rawAddress, payload.city, payload.state, payload.zip].filter(Boolean).join(', ')

    // Route compatibility check: block if more than 20 miles from all existing appointments that day
    if (payload.preferredDateIso && payload.preferredDateIso !== 'asap' && serviceAddress) {
      const compatible = await checkDayCompatibility(payload.preferredDateIso, serviceAddress)
      if (!compatible) {
        return NextResponse.json(
          {
            success: false,
            message: 'We already have appointments in a different area on that date. Please select a different date or call us at (972) 807-7232 and we will find a time that works.',
          },
          { status: 409 }
        )
      }
    }

    // Run triage scoring, customer capture, distance lookup, and calendar event in parallel
    const [customerSaved, triage, distanceMiles, calendarEventId] = await Promise.all([
      captureNewCustomer({
        name,
        phone,
        email,
        address: serviceAddress,
        serviceType,
        equipmentType: payload.equipmentType,
        brandModel: payload.brandModel,
        details,
        source: payload.source || 'Homepage Booking Modal',
        page: payload.page || '/',
        searchQuery: payload.searchQuery,
      }),
      triageServiceRequest(payload),
      geocodeDistance(serviceAddress),
      createOutlookEvent(payload),
    ])

    // Update distance on customer record. This enrichment must not block booking.
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (distanceMiles !== undefined && supabaseUrl && serviceRoleKey) {
      const supabase = createClient(supabaseUrl, serviceRoleKey)
      supabase
        .from('new_customers')
        .update({ distance_miles: distanceMiles })
        .eq('normalized_email', email.toLowerCase())
        .then(({ error }) => {
          if (error) console.error('DISTANCE SAVE ERROR:', error)
        })
    }

    // Save triage score back to the customer record (fire and forget)
    saveTriageScore(email, triage)

    const resendApiKey = process.env.RESEND_API_KEY
    const alertEmail = process.env.SERVICE_ALERT_EMAIL || 'support@2eztek.com'
    const alertEmails = [...new Set([alertEmail, 'rturner@2eztek.com'])]
    const fromEmail = process.env.SERVICE_FROM_EMAIL || '2EZ TEK <support@2eztek.com>'

    if (!resendApiKey) {
      return NextResponse.json(
        {
          success: false,
          message: 'Missing RESEND_API_KEY environment variable.',
        },
        { status: 500 }
      )
    }

    const priorityTag = triage ? ` [${triage.priority}]` : ''
    const subject = `${priorityTag} New 2EZ TEK Request: ${serviceType.replace(/[\r\n]/g, ' ')} from ${name.replace(/[\r\n]/g, ' ')}`

    // Build signed approval token for approve/reject links
    const BASE_URL = 'https://www.2eztek.com'
    const bookingToken = signBookingData({
      eventId:      calendarEventId || '',
      customerName: name,
      customerEmail: email,
      customerPhone: payload.phone || '',
      serviceType,
      preferredDate:   payload.preferredDate || '',
      preferredWindow: payload.preferredWindow || '',
      address: serviceAddress,
    })
    const approveUrl = `${BASE_URL}/api/admin/booking-action?token=${encodeURIComponent(bookingToken)}&action=approve`
    const rejectUrl  = `${BASE_URL}/api/admin/booking-action?token=${encodeURIComponent(bookingToken)}&action=reject`

    const firstName = name.trim().split(' ')[0]
    const aiDiagnosis = payload.aiDiagnosis || ''
    const autoReplyHtml = `
      <div style="font-family:Arial,sans-serif;background:#f8fafc;padding:32px 16px;">
        <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,0.08);">

          <!-- Header -->
          <div style="background:#050B14;padding:28px 32px;text-align:center;">
            <p style="margin:0;font-size:28px;font-weight:900;letter-spacing:-0.5px;color:#ffffff;">2EZ<span style="color:#22d3ee;">TEK</span></p>
            <p style="margin:6px 0 0;font-size:12px;font-weight:600;letter-spacing:0.18em;text-transform:uppercase;color:rgba(255,255,255,0.4);">Fitness Equipment Repair · DFW</p>
          </div>

          <div style="padding:32px;">

            <h2 style="margin:0 0 8px;font-size:22px;font-weight:900;color:#0f172a;">
              We received your request, ${firstName}. Confirming availability now.
            </h2>
            <p style="margin:0 0 24px;font-size:15px;color:#475569;line-height:1.7;">
              We got your service request for <strong>${escapeHtml(serviceType)}</strong>. We are checking technician availability for your requested date and will confirm your appointment within the hour. You will receive a confirmation email as soon as it is approved.
            </p>

            <!-- AI Diagnosis — shown only if photo was submitted -->
            ${aiDiagnosis ? `
            <div style="background:#f0f9ff;border-left:4px solid #22d3ee;border-radius:0 12px 12px 0;padding:18px 20px;margin-bottom:24px;">
              <p style="margin:0 0 8px;font-size:10px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:#0891b2;">AI Equipment Assessment</p>
              <p style="margin:0;font-size:14px;color:#1e293b;line-height:1.75;">${escapeHtml(aiDiagnosis)}</p>
              <p style="margin:12px 0 0;font-size:12px;color:#94a3b8;">This is an initial assessment. Our technician will perform a full hands-on inspection at your appointment.</p>
            </div>
            ` : ''}

            <!-- Appointment time -->
            ${(payload.preferredDate || payload.preferredWindow) ? `
            <div style="background:#052a1a;border:2px solid #22c55e;border-radius:12px;padding:18px 20px;margin-bottom:24px;">
              <p style="margin:0 0 4px;font-size:10px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:#4ade80;">Your Requested Appointment</p>
              ${payload.preferredDate ? `<p style="margin:4px 0 0;font-size:18px;font-weight:900;color:#ffffff;">📅 ${escapeHtml(payload.preferredDate)}</p>` : ''}
              ${payload.preferredWindow ? `<p style="margin:4px 0 0;font-size:15px;font-weight:700;color:#4ade80;">🕐 ${escapeHtml(payload.preferredWindow)}</p>` : ''}
            </div>
            ` : ''}

            <!-- What happens next -->
            <div style="background:#f1f5f9;border-radius:12px;padding:20px 24px;margin-bottom:24px;">
              <p style="margin:0 0 12px;font-size:11px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:#64748b;">What happens next</p>
              <div style="display:flex;flex-direction:column;gap:10px;">
                <div style="display:flex;align-items:flex-start;gap:12px;">
                  <span style="background:#22d3ee;color:#050B14;font-weight:900;font-size:11px;border-radius:100px;padding:2px 8px;flex-shrink:0;margin-top:1px;">1</span>
                  <p style="margin:0;font-size:14px;color:#334155;">We call you within the hour to confirm your appointment time</p>
                </div>
                <div style="display:flex;align-items:flex-start;gap:12px;">
                  <span style="background:#22d3ee;color:#050B14;font-weight:900;font-size:11px;border-radius:100px;padding:2px 8px;flex-shrink:0;margin-top:1px;">2</span>
                  <p style="margin:0;font-size:14px;color:#334155;">Our certified technician comes to you — no drop-off needed</p>
                </div>
                <div style="display:flex;align-items:flex-start;gap:12px;">
                  <span style="background:#22d3ee;color:#050B14;font-weight:900;font-size:11px;border-radius:100px;padding:2px 8px;flex-shrink:0;margin-top:1px;">3</span>
                  <p style="margin:0;font-size:14px;color:#334155;">Diagnosed and repaired on-site in most cases, same visit</p>
                </div>
              </div>
            </div>

            <p style="margin:0 0 12px;font-size:14px;color:#475569;">Need to reach us right now?</p>
            <a href="tel:9728077232" style="display:inline-block;background:#050B14;color:#22d3ee;text-decoration:none;padding:13px 28px;border-radius:100px;font-weight:900;font-size:14px;">
              Call (972) 807-7232
            </a>
          </div>

          <div style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:20px 32px;text-align:center;">
            <p style="margin:0;font-size:12px;color:#94a3b8;">
              2EZ TEK · Dallas Fort Worth · <a href="https://www.2eztek.com" style="color:#22d3ee;text-decoration:none;">www.2eztek.com</a>
            </p>
          </div>
        </div>
      </div>
    `

    const [emailResponse] = await Promise.all([
      // Internal notification
      fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${resendApiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: fromEmail,
          to: alertEmails,
          reply_to: email,
          subject,
          html: buildEmailHtml(payload, triage, distanceMiles),
        }),
      }),
      // Instant auto-reply to customer
      fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${resendApiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: '2EZ TEK <support@2eztek.com>',
          to: [email],
          reply_to: alertEmail,
          subject: `Your service request is confirmed — 2EZ TEK`,
          html: autoReplyHtml,
        }),
      }),
    ])

    const emailResult = await emailResponse.json().catch(() => null)

    if (!emailResponse.ok) {
      console.error('SERVICE REQUEST EMAIL ERROR:', emailResult)
      // Booking is already saved to Supabase. Don't fail the customer-facing
      // request just because the admin notification email failed.
      return NextResponse.json({
        success: true,
        message: 'Service request received.',
        emailId: null,
        customerSaved,
        emailError: emailResult?.message || 'Email notification failed',
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Service request received.',
      emailId: emailResult?.id || null,
      customerSaved,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown server error.',
      },
      { status: 500 }
    )
  }
}
