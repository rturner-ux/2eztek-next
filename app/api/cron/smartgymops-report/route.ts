// app/api/cron/smartgymops-report/route.ts
// Generates monthly AI-powered Equipment Health Reports for commercial clients.
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { callClaude, cleanJsonOutput } from '@/lib/claude'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const REPORT_SYSTEM = `You are a commercial fitness equipment analyst for 2EZ TEK, using SmartGymOps data to generate actionable equipment health reports for facility managers.

You analyze service history and generate professional, data-driven summaries that help commercial clients make smart maintenance decisions.

Return ONLY valid JSON:
{
  "summary": "2-3 sentence executive summary of the facility's equipment status this period",
  "healthScore": 0,
  "healthLabel": "Excellent | Good | Needs Attention | At Risk",
  "topIssues": ["issue1", "issue2", "issue3"],
  "recommendations": [
    { "priority": "High | Medium | Low", "action": "specific action", "reason": "why this matters" }
  ],
  "assetRoi": [
    { "asset": "equipment name/model", "repairCount": 0, "ageMonths": 0, "verdict": "Keep | Monitor | Replace Soon | Replace Now", "reason": "one sentence" }
  ],
  "upcomingMaintenance": "One sentence about what preventative work is recommended next",
  "costAvoidance": "One sentence about potential repair cost avoided by staying proactive"
}`

type ServiceRecord = {
  name: string
  equipment_type: string | null
  brand_model: string | null
  service_type: string | null
  details: string | null
  status: string
  last_request_at: string
  created_at?: string
}

type AssetSummary = {
  label: string
  repairCount: number
  firstSeenMonthsAgo: number
}

function buildAssetSummaries(allRecords: ServiceRecord[]): AssetSummary[] {
  const assetMap: Record<string, { count: number; earliest: Date }> = {}
  for (const r of allRecords) {
    const key = `${r.equipment_type || 'Equipment'} — ${r.brand_model || 'Unknown'}`
    const date = new Date(r.created_at || r.last_request_at)
    if (!assetMap[key]) {
      assetMap[key] = { count: 0, earliest: date }
    }
    assetMap[key].count++
    if (date < assetMap[key].earliest) assetMap[key].earliest = date
  }
  const now = new Date()
  return Object.entries(assetMap).map(([label, { count, earliest }]) => ({
    label,
    repairCount: count,
    firstSeenMonthsAgo: Math.round((now.getTime() - earliest.getTime()) / (30 * 24 * 60 * 60 * 1000)),
  }))
}

async function generateFacilityReport(facilityName: string, records: ServiceRecord[], allRecords: ServiceRecord[]): Promise<any> {
  const history = records.map(r => (
    `- ${r.equipment_type || 'Equipment'} (${r.brand_model || 'Unknown brand'}): ${r.service_type || 'Service'} — ${r.details?.slice(0, 100) || 'No details'} [${r.last_request_at?.slice(0, 10)}]`
  )).join('\n')

  const assets = buildAssetSummaries(allRecords)
  const assetLines = assets.map(a =>
    `- ${a.label}: ${a.repairCount} repair(s), first seen ${a.firstSeenMonthsAgo} months ago`
  ).join('\n')

  const userMessage = `Generate a monthly Equipment Health Report for this commercial facility.

Facility: ${facilityName}
Service records this period (${records.length} entries):
${history || 'No service records this period'}

Asset lifetime repair history:
${assetLines || 'No history available'}

Generate a professional report with health score (0-100), issues, recommendations, and per-asset ROI verdicts (Keep / Monitor / Replace Soon / Replace Now).`

  const outputText = await callClaude({
    system: REPORT_SYSTEM,
    userMessage,
    maxTokens: 1024,
    temperature: 0.4,
  })

  return JSON.parse(cleanJsonOutput(outputText))
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

    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    // Recent records for this period's report
    const { data: commercialRecords, error } = await supabase
      .from('new_customers')
      .select('name, email, equipment_type, brand_model, service_type, details, status, last_request_at, created_at')
      .in('service_type', ['Commercial Service', 'Preventative Maintenance', 'commercial', 'preventative'])
      .gte('last_request_at', thirtyDaysAgo.toISOString())
      .not('email', 'is', null)

    if (error) throw new Error(error.message)
    if (!commercialRecords || commercialRecords.length === 0) {
      return NextResponse.json({ success: true, message: 'No commercial records this period', reports: 0 })
    }

    // All-time records for ROI/age analysis (up to 2 years)
    const twoYearsAgo = new Date()
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2)
    const { data: allTimeRecords } = await supabase
      .from('new_customers')
      .select('name, equipment_type, brand_model, service_type, last_request_at, created_at')
      .in('service_type', ['Commercial Service', 'Preventative Maintenance', 'commercial', 'preventative'])
      .gte('last_request_at', twoYearsAgo.toISOString())

    const allByFacility: Record<string, ServiceRecord[]> = {}
    for (const record of (allTimeRecords || []) as ServiceRecord[]) {
      if (!allByFacility[record.name]) allByFacility[record.name] = []
      allByFacility[record.name].push(record)
    }

    // Group by facility (using name as proxy — in production this would be a facilities table)
    const byFacility: Record<string, ServiceRecord[]> = {}
    for (const record of commercialRecords as ServiceRecord[]) {
      const key = record.name
      if (!byFacility[key]) byFacility[key] = []
      byFacility[key].push(record)
    }

    const reports: string[] = []
    const failed: string[] = []

    for (const [facilityName, records] of Object.entries(byFacility)) {
      try {
        const report = await generateFacilityReport(facilityName, records, allByFacility[facilityName] || records)
        const email = (records[0] as any).email

        const healthColorMap: Record<string, string> = { 'Excellent': '#10b981', 'Good': '#22d3ee', 'Needs Attention': '#f59e0b', 'At Risk': '#ef4444' }
        const healthColor = healthColorMap[report.healthLabel as string] || '#22d3ee'

        if (process.env.RESEND_API_KEY) {
          await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
              from: '2EZ TEK SmartGymOps <support@2eztek.com>',
              to: [email],
              bcc: ['support@2eztek.com'],
              subject: `Equipment Health Report — ${new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' })} | ${facilityName}`,
              html: `
                <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#111">
                  <div style="background:#050B14;padding:24px 28px;border-radius:16px 16px 0 0">
                    <div style="color:#67e8f9;font-size:20px;font-weight:900">SmartGymOps</div>
                    <div style="color:#94a3b8;font-size:12px">Powered by 2EZ TEK</div>
                  </div>
                  <div style="padding:28px;border:1px solid #e5e5e5;border-top:none;border-radius:0 0 16px 16px">
                    <h2 style="margin:0 0 4px">Monthly Equipment Health Report</h2>
                    <div style="color:#666;font-size:13px;margin-bottom:20px">${facilityName} · ${new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' })}</div>

                    <div style="padding:18px;border-radius:12px;background:${healthColor}18;border:1px solid ${healthColor}44;margin-bottom:20px">
                      <div style="font-size:13px;text-transform:uppercase;letter-spacing:0.08em;color:${healthColor};font-weight:900">Health Score</div>
                      <div style="font-size:42px;font-weight:900;color:${healthColor};line-height:1">${report.healthScore}<span style="font-size:20px">/100</span></div>
                      <div style="font-size:14px;font-weight:bold;color:${healthColor}">${report.healthLabel}</div>
                    </div>

                    <p style="color:#333;line-height:1.7">${report.summary}</p>

                    ${report.topIssues?.length ? `
                      <h3 style="margin-top:20px">Top Issues This Period</h3>
                      <ul style="color:#555;padding-left:18px">${report.topIssues.map((i: string) => `<li style="margin-bottom:6px">${i}</li>`).join('')}</ul>
                    ` : ''}

                    ${report.recommendations?.length ? `
                      <h3 style="margin-top:20px">Recommendations</h3>
                      ${report.recommendations.map((r: any) => `
                        <div style="padding:12px;border-radius:8px;background:#f9f9f9;border:1px solid #e5e5e5;margin-bottom:10px">
                          <div style="font-weight:bold;color:${r.priority === 'High' ? '#ef4444' : r.priority === 'Medium' ? '#f59e0b' : '#10b981'}">${r.priority} Priority: ${r.action}</div>
                          <div style="font-size:13px;color:#666;margin-top:4px">${r.reason}</div>
                        </div>
                      `).join('')}
                    ` : ''}

                    ${report.assetRoi?.length ? `
                      <h3 style="margin-top:20px">Equipment ROI Analysis</h3>
                      <table style="width:100%;border-collapse:collapse;font-size:13px">
                        <tr style="background:#f3f4f6">
                          <th style="text-align:left;padding:8px 10px;border-bottom:2px solid #e5e5e5">Asset</th>
                          <th style="text-align:center;padding:8px 10px;border-bottom:2px solid #e5e5e5">Repairs</th>
                          <th style="text-align:center;padding:8px 10px;border-bottom:2px solid #e5e5e5">Age (mo)</th>
                          <th style="text-align:center;padding:8px 10px;border-bottom:2px solid #e5e5e5">Verdict</th>
                        </tr>
                        ${report.assetRoi.map((a: any) => {
                          const verdictColors: Record<string, string> = { 'Keep': '#10b981', 'Monitor': '#f59e0b', 'Replace Soon': '#f97316', 'Replace Now': '#ef4444' }
                          const color = verdictColors[a.verdict] || '#666'
                          return `<tr>
                            <td style="padding:8px 10px;border-bottom:1px solid #eee">${a.asset}</td>
                            <td style="text-align:center;padding:8px 10px;border-bottom:1px solid #eee">${a.repairCount}</td>
                            <td style="text-align:center;padding:8px 10px;border-bottom:1px solid #eee">${a.ageMonths}</td>
                            <td style="text-align:center;padding:8px 10px;border-bottom:1px solid #eee;font-weight:bold;color:${color}">${a.verdict}</td>
                          </tr>
                          <tr><td colspan="4" style="padding:4px 10px 10px;font-size:12px;color:#666;border-bottom:1px solid #eee">${a.reason}</td></tr>`
                        }).join('')}
                      </table>
                    ` : ''}

                    <div style="margin-top:20px;padding:14px;border-radius:10px;background:#e0f9ff;border:1px solid #b2e8f7">
                      <strong>Next Steps:</strong> ${report.upcomingMaintenance}
                    </div>
                    <div style="margin-top:10px;padding:14px;border-radius:10px;background:#f0fff0;border:1px solid #b7ddb7">
                      <strong>Cost Avoidance:</strong> ${report.costAvoidance}
                    </div>

                    <div style="margin-top:24px;padding-top:20px;border-top:1px solid #eee">
                      <a href="tel:9728077232" style="display:inline-block;background:#22d3ee;color:#000;font-weight:900;padding:12px 24px;border-radius:12px;text-decoration:none;font-size:13px">Schedule Service: (972) 807-7232</a>
                    </div>

                    <div style="margin-top:20px;font-size:12px;color:#999">2EZ TEK · Dallas Fort Worth · 2eztek.com</div>
                  </div>
                </div>
              `,
            }),
          })
        }

        reports.push(facilityName)
        await new Promise(r => setTimeout(r, 500))
      } catch (err) {
        console.error('Report failed for:', facilityName, err)
        failed.push(facilityName)
      }
    }

    return NextResponse.json({ success: true, reports: reports.length, failed: failed.length, facilities: reports })
  } catch (error: any) {
    console.error('SMARTGYMOPS REPORT ERROR:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
