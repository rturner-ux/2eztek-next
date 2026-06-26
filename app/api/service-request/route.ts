import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
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

async function geocodeDistance(address: string): Promise<number | undefined> {
  const cleaned = cleanAddress(address)
  try {
    // US Census Geocoding API — free, no key, reliable from Vercel
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8000)
    const url = `https://geocoding.geo.census.gov/geocoder/locations/onelineaddress?address=${encodeURIComponent(cleaned)}&benchmark=2020&format=json`
    const res = await fetch(url, { signal: controller.signal })
    clearTimeout(timeout)
    if (res.ok) {
      const data = await res.json()
      const match = data?.result?.addressMatches?.[0]
      if (match) {
        const miles = haversine(BASE_LAT, BASE_LNG, parseFloat(match.coordinates.y), parseFloat(match.coordinates.x))
        return Math.round(miles)
      }
    }
  } catch { /* fall through to Nominatim */ }

  // Nominatim fallback
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 6000)
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cleaned + ', Texas, USA')}&format=json&limit=1&countrycodes=us`,
      { signal: controller.signal, headers: { 'User-Agent': '2EZTEK-ServiceApp/1.0 (support@2eztek.com)', 'Accept-Language': 'en' } }
    )
    clearTimeout(timeout)
    const results = await res.json()
    if (results?.length) {
      const miles = haversine(BASE_LAT, BASE_LNG, parseFloat(results[0].lat), parseFloat(results[0].lon))
      return Math.round(miles)
    }
  } catch { /* silent */ }

  return undefined
}

type ServiceRequestPayload = {
  name?: string
  phone?: string
  email?: string
  serviceType?: string
  requestType?: string
  address?: string
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
  preferredWindow?: string
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
  const address = escapeHtml(payload.serviceAddress || payload.address)
  const details = escapeHtml(payload.issueDescription || payload.details)
  const priorityColor = triage ? (PRIORITY_COLORS[triage.priority] || '#6b7280') : '#6b7280'

  return `
    <div style="font-family:Arial,sans-serif;background:#050B14;color:#ffffff;padding:24px;">
      <div style="max-width:680px;margin:0 auto;background:#07101D;border:1px solid rgba(255,255,255,0.12);border-radius:18px;padding:24px;">
        <h1 style="margin:0 0 10px;color:#67e8f9;">New 2EZ TEK Service Request</h1>
        <p style="color:#cbd5e1;">A customer submitted a request from the website.</p>

        ${distanceMiles !== undefined ? `
        <div style="margin:16px 0;padding:10px 18px;border-radius:12px;background:${distanceMiles <= 60 ? '#06b65122' : '#f5950022'};border:1px solid ${distanceMiles <= 60 ? '#06b65155' : '#f5950055'};">
          <span style="font-size:15px;font-weight:bold;color:${distanceMiles <= 60 ? '#4ade80' : '#f59e0b'};">
            📍 ${distanceMiles} miles from shop${distanceMiles > 60 ? ' — outside typical range' : ''}
          </span>
        </div>
        ` : ''}

        ${triage ? `
        <div style="margin:16px 0;padding:14px 18px;border-radius:12px;background:${priorityColor}22;border:1px solid ${priorityColor}55;">
          <span style="font-size:18px;font-weight:bold;color:${priorityColor};">
            ${triage.priority} PRIORITY
          </span>
          <span style="margin-left:12px;font-size:22px;font-weight:bold;color:${priorityColor};">
            ${triage.score}/100
          </span>
          <p style="margin:6px 0 0;color:#cbd5e1;font-size:14px;">${escapeHtml(triage.notes)}</p>
        </div>
        ` : ''}

        <table style="width:100%;border-collapse:collapse;margin-top:20px;">
          <tr><td><strong>Name:</strong></td><td>${escapeHtml(payload.name)}</td></tr>
          <tr><td><strong>Phone:</strong></td><td>${escapeHtml(payload.phone)}</td></tr>
          <tr><td><strong>Email:</strong></td><td>${escapeHtml(payload.email)}</td></tr>
          <tr><td><strong>Service Type:</strong></td><td>${serviceType}</td></tr>
          <tr><td><strong>Address:</strong></td><td>${address}</td></tr>
          <tr><td><strong>Equipment Type:</strong></td><td>${escapeHtml(payload.equipmentType)}</td></tr>
          <tr><td><strong>Brand / Model:</strong></td><td>${escapeHtml(payload.brandModel)}</td></tr>
          <tr><td><strong>Source:</strong></td><td>${escapeHtml(payload.source)}</td></tr>
          <tr><td><strong>Page:</strong></td><td>${escapeHtml(payload.page)}</td></tr>
          ${payload.searchQuery ? `<tr><td><strong>Searched for:</strong></td><td style="color:#67e8f9;font-weight:bold;">${escapeHtml(payload.searchQuery)}</td></tr>` : ''}
          ${payload.preferredDate ? `<tr><td><strong>Preferred Date:</strong></td><td style="color:#4ade80;font-weight:bold;">${escapeHtml(payload.preferredDate)}</td></tr>` : ''}
          ${payload.preferredWindow ? `<tr><td><strong>Preferred Time:</strong></td><td style="color:#4ade80;font-weight:bold;">${escapeHtml(payload.preferredWindow)}</td></tr>` : ''}
        </table>

        <div style="margin-top:22px;padding:18px;border-radius:14px;background:rgba(255,255,255,0.06);">
          <strong>Details:</strong>
          <p style="white-space:pre-wrap;line-height:1.6;">${details}</p>
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

    // Run triage scoring, customer capture, and distance lookup in parallel
    const serviceAddress = payload.serviceAddress || payload.address || ''
    const [customerSaved, triage, distanceMiles] = await Promise.all([
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

    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [alertEmail],
        reply_to: email,
        subject,
        html: buildEmailHtml(payload, triage, distanceMiles),
      }),
    })

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
