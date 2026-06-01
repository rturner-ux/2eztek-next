// app/api/cron/auto-area/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const AREAS = [
  { slug: 'dallas', name: 'Dallas', landmarks: ['Uptown', 'Preston Hollow', 'Deep Ellum', 'Oak Lawn', 'North Dallas'] },
  { slug: 'fort-worth', name: 'Fort Worth', landmarks: ['Westover Hills', 'Cultural District', 'TCU Area', 'Alliance Corridor'] },
  { slug: 'plano', name: 'Plano', landmarks: ['West Plano', 'Legacy Business District', 'Willow Bend'] },
  { slug: 'frisco', name: 'Frisco', landmarks: ['The Star District', 'Wade Park', 'Stonebriar Corridor'] },
  { slug: 'irving', name: 'Irving', landmarks: ['Las Colinas', 'Valley Ranch', 'DFW Airport Corridor'] },
  { slug: 'arlington', name: 'Arlington', landmarks: ['Entertainment District', 'UT Arlington Area', 'Viridian'] },
  { slug: 'richardson', name: 'Richardson', landmarks: ['Telecom Corridor', 'UTD Area', 'Canyon Creek'] },
  { slug: 'mckinney', name: 'McKinney', landmarks: ['Craig Ranch', 'Stonebridge Ranch', 'Historic Downtown'] },
  { slug: 'garland', name: 'Garland', landmarks: ['Firewheel Town Center', 'Duck Creek', 'North Garland'] },
  { slug: 'mesquite', name: 'Mesquite', landmarks: ['Town East Corridor', 'North Mesquite', 'Downtown Mesquite'] },
  { slug: 'carrollton', name: 'Carrollton', landmarks: ['Old Town Carrollton', 'Josey Ranch', 'Frankford Road'] },
  { slug: 'addison', name: 'Addison', landmarks: ['Addison Circle', 'Vitruvian Park', 'Belt Line Road'] },
]

function getCurrentSeason(): string {
  const month = new Date().getMonth()
  if (month >= 2 && month <= 4) return 'spring'
  if (month >= 5 && month <= 7) return 'summer'
  if (month >= 8 && month <= 10) return 'fall'
  return 'winter'
}

function cleanJsonOutput(text: string) {
  return text
    .replace(/^```json/i, '')
    .replace(/^```/i, '')
    .replace(/```$/i, '')
    .trim()
}

async function generateAreaUpdate(area: typeof AREAS[0]): Promise<{
  seasonal_intro: string
  trending_issues: string[]
  local_tip: string
}> {
  const season = getCurrentSeason()
  const month = new Date().toLocaleString('en-US', { month: 'long' })
  const year = new Date().getFullYear()

  const prompt = `You are a local fitness equipment repair expert writing content for 2EZ TEK, serving ${area.name}, TX in the Dallas Fort Worth area.

Generate fresh, locally relevant content for the ${area.name} service area page. Current season: ${season}. Month: ${month} ${year}.

Neighborhoods in ${area.name}: ${area.landmarks.join(', ')}

Return ONLY valid JSON:
{
  "seasonal_intro": "",
  "trending_issues": [],
  "local_tip": ""
}

Rules:
- seasonal_intro: 2-3 sentences about fitness equipment service in ${area.name} this ${season}. Mention the season naturally, reference 1-2 local landmarks. 60-80 words max.
- trending_issues: array of exactly 4 short strings (5-8 words each) describing common equipment issues this season in DFW. Example: "Treadmill belts slipping in humid summer heat"
- local_tip: 1-2 sentences of a genuinely useful local tip for ${area.name} residents about maintaining fitness equipment. Reference the area naturally.
- Sound like a real local expert, not generic marketing copy
- Do not mention same-day service, say same-week
`

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4.1-mini',
      input: prompt,
      temperature: 0.7,
    }),
  })

  const data = await response.json()
  if (!response.ok) throw new Error(data?.error?.message || 'OpenAI failed')

  const outputText =
    data.output_text ||
    data.output?.flatMap((i: any) => i.content || [])?.map((c: any) => c.text || '')?.join('') ||
    ''

  if (!outputText) throw new Error('No AI output')

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

    const updated: string[] = []
    const failed: string[] = []

    for (const area of AREAS) {
      try {
        const content = await generateAreaUpdate(area)

        const { error } = await supabase
          .from('area_updates')
          .upsert({
            area_slug: area.slug,
            seasonal_intro: content.seasonal_intro,
            trending_issues: content.trending_issues,
            local_tip: content.local_tip,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'area_slug' })

        if (error) throw error
        updated.push(area.name)

        // Small delay between API calls
        await new Promise((r) => setTimeout(r, 300))
      } catch (err) {
        console.error(`Failed to update area: ${area.name}`, err)
        failed.push(area.name)
      }
    }

    // Email summary
    if (process.env.RESEND_API_KEY) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: '2EZ TEK <support@2eztek.com>',
          to: ['support@2eztek.com'],
          subject: `Area Pages Auto-Updated: ${updated.length} cities refreshed`,
          html: `
            <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111;max-width:600px">
              <h2 style="color:#0891B2">Monthly Area Page Update Complete</h2>
              <p><strong>${updated.length} area pages</strong> updated with fresh seasonal content.</p>
              <p>Season: ${getCurrentSeason()} ${new Date().toLocaleString('en-US', { month: 'long' })} ${new Date().getFullYear()}</p>
              <h3>Updated Areas</h3>
              <p>${updated.join(', ')}</p>
              ${failed.length > 0 ? `<h3 style="color:#e53e3e">Failed</h3><p>${failed.join(', ')}</p>` : ''}
              <hr/>
              <p style="color:#666;font-size:13px">Auto-generated by 2EZ TEK Area Update Engine. Runs on the 1st of each month.</p>
            </div>
          `,
        }),
      })
    }

    return NextResponse.json({ success: true, updated: updated.length, failed: failed.length, areas: updated })
  } catch (error: any) {
    console.error('AUTO AREA ERROR:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}