import { NextResponse } from 'next/server'
import { getAccountByToken } from '@/lib/rankradar'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  const token = req.headers.get('x-rankradar-token') || ''
  const account = await getAccountByToken(token)
  if (!account) return NextResponse.json({ success: false }, { status: 401 })

  const body = await req.json()
  const { keyword, ourRank, competitorDomain, competitorRank, gap, notes } = body

  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'RankRadar <noreply@2eztek.com>',
        to: 'rturner@2eztek.com',
        subject: `SEO Help Request — ${account.business_name}`,
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
            <div style="background:#050B14;padding:24px;border-radius:12px 12px 0 0">
              <h1 style="color:#22d3ee;margin:0;font-size:20px">RankRadar — SEO Help Request</h1>
              <p style="color:#94a3b8;margin:8px 0 0">A subscriber wants you to close their ranking gap</p>
            </div>

            <div style="border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px;padding:24px">

              <h2 style="font-size:14px;color:#64748b;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 16px">Subscriber</h2>
              <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
                <tr><td style="padding:6px 0;color:#64748b;width:140px">Business</td><td style="font-weight:bold">${account.business_name}</td></tr>
                <tr><td style="padding:6px 0;color:#64748b">Contact</td><td>${account.owner_name || '—'}</td></tr>
                <tr><td style="padding:6px 0;color:#64748b">Email</td><td><a href="mailto:${account.owner_email}">${account.owner_email}</a></td></tr>
                <tr><td style="padding:6px 0;color:#64748b">Location</td><td>${account.location || '—'}</td></tr>
                <tr><td style="padding:6px 0;color:#64748b">Industry</td><td>${account.industry || '—'}</td></tr>
                <tr><td style="padding:6px 0;color:#64748b">Plan</td><td style="text-transform:capitalize">${account.plan}</td></tr>
              </table>

              <h2 style="font-size:14px;color:#64748b;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 16px">Ranking Gap</h2>
              <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:16px;margin-bottom:24px">
                <p style="font-size:18px;font-weight:900;margin:0 0 12px;color:#0f172a">${keyword}</p>
                <table style="width:100%;border-collapse:collapse">
                  <tr>
                    <td style="padding:4px 16px 4px 0;color:#64748b">Their rank</td>
                    <td style="font-weight:bold;color:#0f172a">${ourRank ? `#${ourRank}` : 'Not ranking'}</td>
                  </tr>
                  <tr>
                    <td style="padding:4px 16px 4px 0;color:#64748b">Competitor</td>
                    <td style="font-weight:bold;color:#dc2626">${competitorDomain} at #${competitorRank}</td>
                  </tr>
                  <tr>
                    <td style="padding:4px 16px 4px 0;color:#64748b">Gap</td>
                    <td style="font-weight:900;color:#dc2626">${gap ? `${gap} positions behind` : 'Not ranking at all'}</td>
                  </tr>
                </table>
              </div>

              ${notes ? `
                <h2 style="font-size:14px;color:#64748b;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 8px">Their Notes</h2>
                <p style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:12px;margin:0 0 24px">${notes}</p>
              ` : ''}

              <a href="mailto:${account.owner_email}?subject=Re: RankRadar SEO Help for ${encodeURIComponent(keyword)}"
                style="display:inline-block;background:#050B14;color:#22d3ee;text-decoration:none;padding:12px 24px;border-radius:100px;font-weight:900;font-size:14px">
                Reply to ${account.owner_name || account.owner_email} →
              </a>
            </div>
          </div>
        `,
      }),
    })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 })
  }
}
