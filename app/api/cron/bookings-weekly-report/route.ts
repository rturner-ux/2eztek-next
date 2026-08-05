// app/api/cron/bookings-weekly-report/route.ts
// Weekly email to the owner summarizing how many leads came in and how many
// turned into actual booked appointments over the last 7 days.
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAdminRequest } from '@/lib/serverSecurity'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type CustomerRow = {
  name: string | null
  equipment_type: string | null
  brand_model: string | null
  job_status: string | null
  appointment_date: string | null
  address: string | null
  created_at: string
}

const BOOKED_STATUSES = new Set(['scheduled', 'in_progress', 'on_site', 'active', 'completed', 'done', 'closed', 'invoiced'])

function isBooked(row: CustomerRow): boolean {
  return !!row.appointment_date || BOOKED_STATUSES.has((row.job_status || '').toLowerCase().trim())
}

function parseCity(address: string | null): string {
  if (!address) return 'Unknown'
  const match = address.match(/,\s*([A-Za-z\s]+?)\s*,\s*[A-Z]{2}\b/)
  return match ? match[1].trim() : 'Unknown'
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const cronOk = authHeader === `Bearer ${process.env.CRON_SECRET}`
  const adminUnauthorized = cronOk ? null : requireAdminRequest(request)
  if (!cronOk && adminUnauthorized) return adminUnauthorized

  const resendKey = process.env.RESEND_API_KEY
  if (!resendKey) {
    return NextResponse.json({ success: false, error: 'RESEND_API_KEY not set' })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const now = new Date()
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const prevWeekAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString()

  const [{ data: thisWeek, error }, { data: lastWeek }] = await Promise.all([
    supabase
      .from('new_customers')
      .select('name, equipment_type, brand_model, job_status, appointment_date, address, created_at')
      .gte('created_at', weekAgo)
      .order('created_at', { ascending: false }),
    supabase
      .from('new_customers')
      .select('job_status, appointment_date, created_at')
      .gte('created_at', prevWeekAgo)
      .lt('created_at', weekAgo),
  ])

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }

  const rows = (thisWeek ?? []) as CustomerRow[]
  const prevRows = (lastWeek ?? []) as CustomerRow[]

  const totalLeads = rows.length
  const bookedRows = rows.filter(isBooked)
  const totalBooked = bookedRows.length
  const bookingRate = totalLeads > 0 ? Math.round((totalBooked / totalLeads) * 100) : 0

  const prevTotalLeads = prevRows.length
  const prevTotalBooked = prevRows.filter(isBooked).length
  const leadsDelta = prevTotalLeads > 0 ? Math.round(((totalLeads - prevTotalLeads) / prevTotalLeads) * 100) : null
  const bookedDelta = prevTotalBooked > 0 ? Math.round(((totalBooked - prevTotalBooked) / prevTotalBooked) * 100) : null

  const equipmentMap: Record<string, number> = {}
  for (const r of bookedRows) {
    const key = r.equipment_type || 'Unspecified'
    equipmentMap[key] = (equipmentMap[key] ?? 0) + 1
  }
  const topEquipment = Object.entries(equipmentMap).sort((a, b) => b[1] - a[1]).slice(0, 6)

  const cityMap: Record<string, number> = {}
  for (const r of bookedRows) {
    const city = parseCity(r.address)
    cityMap[city] = (cityMap[city] ?? 0) + 1
  }
  const topCities = Object.entries(cityMap).sort((a, b) => b[1] - a[1]).slice(0, 6)

  const dayMap: Record<string, number> = {}
  for (const r of bookedRows) {
    const day = new Date(r.created_at).toLocaleDateString('en-US', { timeZone: 'America/Chicago', weekday: 'short' })
    dayMap[day] = (dayMap[day] ?? 0) + 1
  }
  const dayOrder = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const dayRows = dayOrder.filter((d) => dayMap[d]).map((d) => [d, dayMap[d]] as const)

  const weekEnd = now.toLocaleDateString('en-US', { timeZone: 'America/Chicago', month: 'short', day: 'numeric', year: 'numeric' })
  const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    .toLocaleDateString('en-US', { timeZone: 'America/Chicago', month: 'short', day: 'numeric', year: 'numeric' })

  const td = (val: string, color?: string) =>
    `<td style="padding:7px 12px;border-bottom:1px solid #1e293b;font-family:monospace;font-size:12px;${color ? `color:${color};font-weight:700;` : 'color:#94a3b8;'}">${val}</td>`

  const deltaLabel = (pct: number | null) => {
    if (pct === null) return ''
    const color = pct >= 0 ? '#22c55e' : '#ef4444'
    const arrow = pct >= 0 ? '▲' : '▼'
    return `<span style="color:${color};font-size:12px;font-weight:700;">${arrow} ${Math.abs(pct)}% vs. last week</span>`
  }

  const equipmentRows = topEquipment.map(([type, count]) => `<tr>${td(type, '#22d3ee')}${td(String(count))}</tr>`).join('')
  const cityRows = topCities.map(([city, count]) => `<tr>${td(city, '#22d3ee')}${td(String(count))}</tr>`).join('')
  const dayRowsHtml = dayRows.map(([day, count]) => `<tr>${td(day, '#22d3ee')}${td(String(count))}</tr>`).join('')

  const html = `
    <div style="font-family:monospace;background:#050B14;color:#e2e8f0;padding:32px;max-width:680px;margin:0 auto;border:1px solid #22d3ee33;border-radius:12px;">

      <div style="border-bottom:1px solid #22d3ee22;padding-bottom:20px;margin-bottom:24px;">
        <p style="margin:0;font-size:10px;letter-spacing:0.3em;color:#22d3ee;font-weight:900;">2EZ TEK · OPERATIONS</p>
        <h1 style="margin:8px 0 4px;font-size:22px;font-weight:900;color:#f8fafc;">WEEKLY BOOKINGS REPORT</h1>
        <p style="margin:0;font-size:12px;color:#475569;">Period: ${weekStart} to ${weekEnd} CST</p>
      </div>

      <table style="width:100%;border-collapse:collapse;margin-bottom:12px;">
        <tr>
          <td style="padding:12px 16px;background:#0f172a;border-radius:8px;text-align:center;width:33%;">
            <div style="font-size:32px;font-weight:900;color:#22d3ee;">${totalBooked}</div>
            <div style="font-size:10px;letter-spacing:0.15em;color:#64748b;margin-top:4px;">BOOKINGS</div>
          </td>
          <td style="width:3%"></td>
          <td style="padding:12px 16px;background:#0f172a;border-radius:8px;text-align:center;width:33%;">
            <div style="font-size:32px;font-weight:900;color:#f8fafc;">${totalLeads}</div>
            <div style="font-size:10px;letter-spacing:0.15em;color:#64748b;margin-top:4px;">TOTAL LEADS</div>
          </td>
          <td style="width:3%"></td>
          <td style="padding:12px 16px;background:#0f172a;border-radius:8px;text-align:center;width:33%;">
            <div style="font-size:32px;font-weight:900;color:#f97316;">${bookingRate}%</div>
            <div style="font-size:10px;letter-spacing:0.15em;color:#64748b;margin-top:4px;">BOOKING RATE</div>
          </td>
        </tr>
      </table>

      <div style="text-align:center;margin-bottom:24px;">
        ${deltaLabel(bookedDelta)}${bookedDelta !== null && leadsDelta !== null ? ' &nbsp;&middot;&nbsp; ' : ''}${leadsDelta !== null ? `<span style="color:#64748b;font-size:12px;">${leadsDelta >= 0 ? '+' : ''}${leadsDelta}% leads vs. last week</span>` : ''}
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:24px;">

        <div>
          <p style="margin:0 0 8px;font-size:10px;letter-spacing:0.2em;color:#22d3ee;font-weight:900;">TOP EQUIPMENT BOOKED</p>
          <table style="width:100%;border-collapse:collapse;">
            <tr><th style="text-align:left;padding:5px 12px;font-size:10px;color:#334155;letter-spacing:0.1em;">TYPE</th>
                <th style="text-align:left;padding:5px 12px;font-size:10px;color:#334155;letter-spacing:0.1em;">COUNT</th></tr>
            ${equipmentRows || `<tr>${td('No bookings this week')}${td('')}</tr>`}
          </table>
        </div>

        <div>
          <p style="margin:0 0 8px;font-size:10px;letter-spacing:0.2em;color:#22d3ee;font-weight:900;">TOP CITIES</p>
          <table style="width:100%;border-collapse:collapse;">
            <tr><th style="text-align:left;padding:5px 12px;font-size:10px;color:#334155;letter-spacing:0.1em;">CITY</th>
                <th style="text-align:left;padding:5px 12px;font-size:10px;color:#334155;letter-spacing:0.1em;">COUNT</th></tr>
            ${cityRows || `<tr>${td('No bookings this week')}${td('')}</tr>`}
          </table>
        </div>

      </div>

      <div style="margin-bottom:24px;">
        <p style="margin:0 0 8px;font-size:10px;letter-spacing:0.2em;color:#94a3b8;font-weight:900;">BOOKINGS BY DAY</p>
        <table style="width:100%;border-collapse:collapse;">
          <tr><th style="text-align:left;padding:5px 12px;font-size:10px;color:#334155;letter-spacing:0.1em;">DAY</th>
              <th style="text-align:left;padding:5px 12px;font-size:10px;color:#334155;letter-spacing:0.1em;">COUNT</th></tr>
          ${dayRowsHtml || `<tr>${td('No bookings this week')}${td('')}</tr>`}
        </table>
      </div>

      <div style="background:rgba(34,211,238,0.04);border:1px solid #22d3ee22;border-radius:8px;padding:14px;margin-bottom:20px;">
        <p style="margin:0;font-size:11px;color:#475569;">"Bookings" = leads with an appointment on the books or a job status past new/pending. Full detail at /admin/ops.</p>
      </div>

      <p style="margin:0;font-size:10px;color:#1e293b;letter-spacing:0.1em;">2EZ TEK OPERATIONS &middot; WEEKLY DIGEST</p>
    </div>
  `

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: '2EZ TEK OPS <support@2eztek.com>',
      to: ['rturner@2eztek.com'],
      subject: `WEEKLY BOOKINGS: ${totalBooked} booked from ${totalLeads} leads, ${weekStart} to ${weekEnd}`,
      html,
    }),
  })

  if (!res.ok) {
    return NextResponse.json({ success: false, error: `Resend error: ${res.status}` }, { status: 500 })
  }

  return NextResponse.json({ success: true, totalLeads, totalBooked, bookingRate })
}
