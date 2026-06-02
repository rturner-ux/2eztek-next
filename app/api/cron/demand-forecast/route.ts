// app/api/cron/demand-forecast/route.ts
// Analyzes service request volume by week/area/equipment and generates a monthly demand forecast.
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { callClaude, cleanJsonOutput } from '@/lib/claude'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const FORECAST_SYSTEM = `You are a business analyst for 2EZ TEK, a fitness equipment repair company in Dallas Fort Worth. You analyze service request data to identify patterns and forecast demand.

You generate actionable monthly briefings that help the team plan technician schedules, marketing spend, and inventory focus areas.

Return ONLY valid JSON:
{
  "headline": "One sentence: the single most important insight from this data",
  "volumeTrend": "Increasing | Stable | Decreasing",
  "volumeNote": "One sentence about request volume trend",
  "topEquipment": ["equipment type 1", "equipment type 2", "equipment type 3"],
  "topAreas": ["area 1", "area 2", "area 3"],
  "peakDaysPattern": "One sentence about which days/weeks are busiest",
  "forecastNextMonth": "2-3 sentences forecasting likely demand next month based on patterns and seasonality",
  "recommendations": [
    "Specific operational recommendation 1",
    "Specific operational recommendation 2",
    "Specific marketing/content recommendation"
  ],
  "opportunityAlert": "One sentence identifying a growth opportunity in the data"
}`

type RequestRecord = {
  equipment_type: string | null
  service_type: string | null
  address: string | null
  created_at: string
}

function extractCity(address: string | null): string {
  if (!address) return 'Unknown'
  const cities = ['Dallas', 'Fort Worth', 'Plano', 'Frisco', 'Irving', 'Arlington', 'Richardson', 'McKinney', 'Garland', 'Mesquite', 'Carrollton', 'Addison']
  for (const city of cities) {
    if (address.toLowerCase().includes(city.toLowerCase())) return city
  }
  return 'Other DFW'
}

function buildDataSummary(records: RequestRecord[]): string {
  if (records.length === 0) return 'No service records in this period.'

  // Equipment frequency
  const equipmentCount: Record<string, number> = {}
  const areaCount: Record<string, number> = {}
  const weekCount: Record<string, number> = {}

  for (const r of records) {
    const eq = r.equipment_type || 'Unknown'
    equipmentCount[eq] = (equipmentCount[eq] || 0) + 1

    const city = extractCity(r.address)
    areaCount[city] = (areaCount[city] || 0) + 1

    const week = new Date(r.created_at).toISOString().slice(0, 10)
    weekCount[week] = (weekCount[week] || 0) + 1
  }

  const topEquipment = Object.entries(equipmentCount).sort((a, b) => b[1] - a[1]).slice(0, 5)
  const topAreas = Object.entries(areaCount).sort((a, b) => b[1] - a[1]).slice(0, 5)
  const weekTrend = Object.entries(weekCount).sort((a, b) => a[0].localeCompare(b[0]))

  return `Total requests last 90 days: ${records.length}

Equipment breakdown:
${topEquipment.map(([k, v]) => `- ${k}: ${v} requests`).join('\n')}

Top service areas:
${topAreas.map(([k, v]) => `- ${k}: ${v} requests`).join('\n')}

Weekly volume (last 12 weeks sample):
${weekTrend.slice(-12).map(([d, v]) => `- Week of ${d}: ${v} requests`).join('\n')}

Current month: ${new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' })}
Current season: ${['winter','winter','spring','spring','spring','summer','summer','summer','fall','fall','fall','winter'][new Date().getMonth()]}`
}

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const ninetyDaysAgo = new Date()
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)

    const { data: records, error } = await supabase
      .from('new_customers')
      .select('equipment_type, service_type, address, created_at')
      .gte('created_at', ninetyDaysAgo.toISOString())
      .order('created_at', { ascending: true })

    if (error) throw new Error(error.message)

    const dataSummary = buildDataSummary((records || []) as RequestRecord[])

    const outputText = await callClaude({
      system: FORECAST_SYSTEM,
      userMessage: `Analyze this service request data and generate the monthly demand forecast briefing.\n\n${dataSummary}`,
      maxTokens: 1024,
      temperature: 0.4,
    })

    const forecast = JSON.parse(cleanJsonOutput(outputText))

    if (process.env.RESEND_API_KEY) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: '2EZ TEK <support@2eztek.com>',
          to: ['support@2eztek.com'],
          subject: `Monthly Demand Forecast — ${new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' })}`,
          html: `
            <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111;max-width:620px">
              <div style="background:#050B14;padding:20px 24px;border-radius:14px 14px 0 0">
                <div style="color:#67e8f9;font-size:18px;font-weight:900">2EZ TEK Demand Forecast</div>
                <div style="color:#94a3b8;font-size:12px">${new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' })}</div>
              </div>
              <div style="padding:24px;border:1px solid #e5e5e5;border-top:none;border-radius:0 0 14px 14px">
                <div style="padding:14px;background:#e0f9ff;border-radius:10px;border:1px solid #b2e8f7;margin-bottom:20px">
                  <strong>Key Insight:</strong> ${forecast.headline}
                </div>

                <h3 style="margin:0 0 8px">Volume Trend: <span style="color:${forecast.volumeTrend === 'Increasing' ? '#10b981' : forecast.volumeTrend === 'Decreasing' ? '#ef4444' : '#666'}">${forecast.volumeTrend}</span></h3>
                <p>${forecast.volumeNote}</p>

                <div style="margin:20px 0;display:grid;grid-template-columns:1fr 1fr;gap:16px">
                  <div style="padding:14px;border-radius:10px;background:#f9f9f9;border:1px solid #e5e5e5">
                    <strong style="font-size:12px;text-transform:uppercase;letter-spacing:0.08em;color:#666">Top Equipment</strong>
                    <ul style="margin:8px 0 0;padding-left:16px;color:#333">${forecast.topEquipment?.map((e: string) => `<li>${e}</li>`).join('')}</ul>
                  </div>
                  <div style="padding:14px;border-radius:10px;background:#f9f9f9;border:1px solid #e5e5e5">
                    <strong style="font-size:12px;text-transform:uppercase;letter-spacing:0.08em;color:#666">Top Areas</strong>
                    <ul style="margin:8px 0 0;padding-left:16px;color:#333">${forecast.topAreas?.map((a: string) => `<li>${a}</li>`).join('')}</ul>
                  </div>
                </div>

                <h3>Next Month Forecast</h3>
                <p>${forecast.forecastNextMonth}</p>

                <h3>Recommendations</h3>
                <ul>${forecast.recommendations?.map((r: string) => `<li style="margin-bottom:6px">${r}</li>`).join('')}</ul>

                <div style="margin-top:16px;padding:14px;border-radius:10px;background:#f0fff0;border:1px solid #b7ddb7">
                  <strong>Opportunity:</strong> ${forecast.opportunityAlert}
                </div>

                <hr style="margin-top:24px"/>
                <p style="color:#999;font-size:12px">Auto-generated by 2EZ TEK Demand Forecast Engine. Runs on the 1st of each month.</p>
              </div>
            </div>
          `,
        }),
      })
    }

    return NextResponse.json({ success: true, forecast })
  } catch (error: any) {
    console.error('DEMAND FORECAST ERROR:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
