import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type Incident = {
  ip: string
  threat_type: string
  severity: string
  path: string
  detail: string
  created_at: string
}

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const resendKey = process.env.RESEND_API_KEY
  if (!resendKey) {
    return NextResponse.json({ success: false, error: 'RESEND_API_KEY not set' })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const { data: incidents, error } = await supabase
    .from('security_log')
    .select('ip, threat_type, severity, path, detail, created_at')
    .gte('created_at', sevenDaysAgo)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }

  const rows = (incidents ?? []) as Incident[]
  const total     = rows.length
  const criticals = rows.filter((r) => r.severity === 'CRITICAL').length
  const highs     = rows.filter((r) => r.severity === 'HIGH').length
  const uniqueIPs = new Set(rows.map((r) => r.ip)).size

  const typeMap: Record<string, number> = {}
  for (const r of rows) typeMap[r.threat_type] = (typeMap[r.threat_type] ?? 0) + 1

  const ipMap: Record<string, number> = {}
  for (const r of rows) ipMap[r.ip] = (ipMap[r.ip] ?? 0) + 1
  const topIPs = Object.entries(ipMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)

  const pathMap: Record<string, number> = {}
  for (const r of rows) pathMap[r.path] = (pathMap[r.path] ?? 0) + 1
  const topPaths = Object.entries(pathMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)

  const recent = rows.slice(0, 10)

  const now = new Date()
  const weekEnd   = now.toLocaleDateString('en-US', { timeZone: 'America/Chicago', month: 'short', day: 'numeric', year: 'numeric' })
  const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    .toLocaleDateString('en-US', { timeZone: 'America/Chicago', month: 'short', day: 'numeric', year: 'numeric' })

  const td = (val: string, color?: string) =>
    `<td style="padding:7px 12px;border-bottom:1px solid #1e293b;font-family:monospace;font-size:12px;${color ? `color:${color};font-weight:700;` : 'color:#94a3b8;'}">${val}</td>`

  const typeRows = Object.entries(typeMap)
    .sort((a, b) => b[1] - a[1])
    .map(([type, count]) => `<tr>${td(type, '#22d3ee')}${td(String(count))}</tr>`)
    .join('')

  const ipRows = topIPs
    .map(([ip, count]) => `<tr>${td(ip, '#f97316')}${td(String(count))}</tr>`)
    .join('')

  const pathRows = topPaths
    .map(([path, count]) => `<tr>${td(path)}${td(String(count))}</tr>`)
    .join('')

  const recentRows = recent
    .map((r) => {
      const sevColor = r.severity === 'CRITICAL' ? '#ef4444' : r.severity === 'HIGH' ? '#f97316' : '#f59e0b'
      const ts = new Date(r.created_at).toLocaleString('en-US', {
        timeZone: 'America/Chicago', month: 'short', day: 'numeric',
        hour: 'numeric', minute: '2-digit', hour12: true,
      })
      return `<tr>
        ${td(ts)}
        ${td(r.severity, sevColor)}
        ${td(r.threat_type, '#22d3ee')}
        ${td(r.ip, '#f97316')}
        ${td(r.path)}
      </tr>`
    })
    .join('')

  const html = `
    <div style="font-family:monospace;background:#050B14;color:#e2e8f0;padding:32px;max-width:680px;margin:0 auto;border:1px solid #22d3ee33;border-radius:12px;">

      <div style="border-bottom:1px solid #22d3ee22;padding-bottom:20px;margin-bottom:24px;">
        <p style="margin:0;font-size:10px;letter-spacing:0.3em;color:#22d3ee;font-weight:900;">FORT 2EZ TEK — SECURITY COMMAND</p>
        <h1 style="margin:8px 0 4px;font-size:22px;font-weight:900;color:#f8fafc;">WEEKLY INTELLIGENCE REPORT</h1>
        <p style="margin:0;font-size:12px;color:#475569;">Period: ${weekStart} — ${weekEnd} CST</p>
      </div>

      <table style="width:100%;border-collapse:collapse;margin-bottom:28px;">
        <tr>
          <td style="padding:12px 16px;background:#0f172a;border-radius:8px;text-align:center;width:25%;">
            <div style="font-size:28px;font-weight:900;color:#f8fafc;">${total}</div>
            <div style="font-size:10px;letter-spacing:0.15em;color:#64748b;margin-top:4px;">TOTAL THREATS</div>
          </td>
          <td style="width:4%"></td>
          <td style="padding:12px 16px;background:#0f172a;border-radius:8px;text-align:center;width:25%;">
            <div style="font-size:28px;font-weight:900;color:#ef4444;">${criticals}</div>
            <div style="font-size:10px;letter-spacing:0.15em;color:#64748b;margin-top:4px;">CRITICAL</div>
          </td>
          <td style="width:4%"></td>
          <td style="padding:12px 16px;background:#0f172a;border-radius:8px;text-align:center;width:25%;">
            <div style="font-size:28px;font-weight:900;color:#f97316;">${highs}</div>
            <div style="font-size:10px;letter-spacing:0.15em;color:#64748b;margin-top:4px;">HIGH</div>
          </td>
          <td style="width:4%"></td>
          <td style="padding:12px 16px;background:#0f172a;border-radius:8px;text-align:center;width:25%;">
            <div style="font-size:28px;font-weight:900;color:#22d3ee;">${uniqueIPs}</div>
            <div style="font-size:10px;letter-spacing:0.15em;color:#64748b;margin-top:4px;">UNIQUE IPs</div>
          </td>
        </tr>
      </table>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:24px;">

        <div>
          <p style="margin:0 0 8px;font-size:10px;letter-spacing:0.2em;color:#22d3ee;font-weight:900;">THREAT BREAKDOWN</p>
          <table style="width:100%;border-collapse:collapse;">
            <tr><th style="text-align:left;padding:5px 12px;font-size:10px;color:#334155;letter-spacing:0.1em;">TYPE</th>
                <th style="text-align:left;padding:5px 12px;font-size:10px;color:#334155;letter-spacing:0.1em;">COUNT</th></tr>
            ${typeRows}
          </table>
        </div>

        <div>
          <p style="margin:0 0 8px;font-size:10px;letter-spacing:0.2em;color:#f97316;font-weight:900;">TOP HOSTILE IPs</p>
          <table style="width:100%;border-collapse:collapse;">
            <tr><th style="text-align:left;padding:5px 12px;font-size:10px;color:#334155;letter-spacing:0.1em;">IP</th>
                <th style="text-align:left;padding:5px 12px;font-size:10px;color:#334155;letter-spacing:0.1em;">HITS</th></tr>
            ${ipRows}
          </table>
        </div>

      </div>

      <div style="margin-bottom:24px;">
        <p style="margin:0 0 8px;font-size:10px;letter-spacing:0.2em;color:#94a3b8;font-weight:900;">MOST TARGETED PATHS</p>
        <table style="width:100%;border-collapse:collapse;">
          <tr><th style="text-align:left;padding:5px 12px;font-size:10px;color:#334155;letter-spacing:0.1em;">PATH</th>
              <th style="text-align:left;padding:5px 12px;font-size:10px;color:#334155;letter-spacing:0.1em;">HITS</th></tr>
          ${pathRows}
        </table>
      </div>

      ${recentRows ? `
      <div style="margin-bottom:24px;">
        <p style="margin:0 0 8px;font-size:10px;letter-spacing:0.2em;color:#94a3b8;font-weight:900;">MOST RECENT INCIDENTS</p>
        <table style="width:100%;border-collapse:collapse;font-size:11px;">
          <tr>
            <th style="text-align:left;padding:5px 12px;font-size:9px;color:#334155;letter-spacing:0.1em;">TIME</th>
            <th style="text-align:left;padding:5px 12px;font-size:9px;color:#334155;letter-spacing:0.1em;">SEV</th>
            <th style="text-align:left;padding:5px 12px;font-size:9px;color:#334155;letter-spacing:0.1em;">TYPE</th>
            <th style="text-align:left;padding:5px 12px;font-size:9px;color:#334155;letter-spacing:0.1em;">IP</th>
            <th style="text-align:left;padding:5px 12px;font-size:9px;color:#334155;letter-spacing:0.1em;">PATH</th>
          </tr>
          ${recentRows}
        </table>
      </div>` : ''}

      <div style="background:rgba(34,211,238,0.04);border:1px solid #22d3ee22;border-radius:8px;padding:14px;margin-bottom:20px;">
        <p style="margin:0;font-size:11px;font-weight:900;color:#22d3ee;letter-spacing:0.1em;">PERIMETER STATUS: SECURE</p>
        <p style="margin:4px 0 0;font-size:11px;color:#475569;">All ${total} threats blocked. Logs available at /admin/fort.</p>
      </div>

      <p style="margin:0;font-size:10px;color:#1e293b;letter-spacing:0.1em;">— FORT SECURITY COMMAND · 2EZ TEK OPERATIONS · WEEKLY DIGEST</p>
    </div>
  `

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from:    '2EZ TEK FORT <support@2eztek.com>',
      to:      ['rturner@2eztek.com'],
      subject: `FORT WEEKLY REPORT — ${total} threats blocked · ${weekStart} to ${weekEnd}`,
      html,
    }),
  })

  if (!res.ok) {
    return NextResponse.json({ success: false, error: `Resend error: ${res.status}` }, { status: 500 })
  }

  return NextResponse.json({ success: true, total, criticals, highs, uniqueIPs })
}
