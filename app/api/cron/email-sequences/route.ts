import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const FROM = '2EZ TEK <support@2eztek.com>'
const SITE = 'https://www.2eztek.com'
const PHONE = '(972) 807-7232'
const PHONE_TEL = '9728077232'

function footer() {
  return `
    <div style="margin-top:40px;padding-top:20px;border-top:1px solid #e2e8f0;color:#94a3b8;font-size:12px;line-height:1.6">
      2EZ TEK Fitness Equipment Repair &nbsp;|&nbsp; Dallas Fort Worth, TX<br>
      <a href="${SITE}" style="color:#0891b2;text-decoration:none">2eztek.com</a> &nbsp;&middot;&nbsp;
      <a href="tel:${PHONE_TEL}" style="color:#0891b2;text-decoration:none">${PHONE}</a>
    </div>
  `
}

function wrap(content: string) {
  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#1e293b;line-height:1.7;background:#fff;padding:32px 28px">
      ${content}
      ${footer()}
    </div>
  `
}

function welcomeDay3Html() {
  return wrap(`
    <img src="${SITE}/images/2eztek-logo.webp" alt="2EZ TEK" width="120" style="margin-bottom:28px" onerror="this.style.display='none'"/>
    <p style="font-size:11px;font-weight:900;letter-spacing:0.25em;text-transform:uppercase;color:#0891b2;margin:0 0 12px">Maintenance Tips</p>
    <h1 style="font-size:26px;font-weight:900;margin:0 0 20px;line-height:1.3;color:#0f172a">3 quick checks that prevent most equipment breakdowns</h1>
    <p style="margin:0 0 16px;color:#475569">Most fitness equipment failures we see in Dallas Fort Worth were completely preventable. Here are three things you can check right now:</p>
    <div style="background:#f8fafc;border-left:3px solid #0891b2;padding:16px 20px;margin:0 0 16px">
      <strong style="color:#0f172a">1. Belt lubrication</strong><br>
      <span style="color:#64748b;font-size:14px">Treadmill belts need silicone lubricant every 3 months or 130 hours of use. A dry belt causes motor strain and is the single most common reason treadmills fail early.</span>
    </div>
    <div style="background:#f8fafc;border-left:3px solid #0891b2;padding:16px 20px;margin:0 0 16px">
      <strong style="color:#0f172a">2. Belt tension and tracking</strong><br>
      <span style="color:#64748b;font-size:14px">If the belt drifts to one side or slips under load, it needs adjustment. Ignoring this puts stress on the rollers and motor board.</span>
    </div>
    <div style="background:#f8fafc;border-left:3px solid #0891b2;padding:16px 20px;margin:0 0 28px">
      <strong style="color:#0f172a">3. Listen for new sounds</strong><br>
      <span style="color:#64748b;font-size:14px">Squeaking, grinding, or clicking that wasn't there before almost always means a bearing, roller, or drive component is starting to fail. Catching it early is the difference between a small repair and a major one.</span>
    </div>
    <p style="margin:0 0 24px;color:#475569">Not sure what you're hearing or feeling? 2EZ TEK can diagnose any issue on-site across DFW. We come to you.</p>
    <a href="${SITE}/contact" style="display:inline-block;background:#22d3ee;color:#000;font-weight:900;font-size:12px;letter-spacing:0.15em;text-transform:uppercase;padding:14px 28px;text-decoration:none">Book a Maintenance Check</a>
  `)
}

function welcomeDay7Html() {
  return wrap(`
    <img src="${SITE}/images/2eztek-logo.webp" alt="2EZ TEK" width="120" style="margin-bottom:28px" onerror="this.style.display='none'"/>
    <p style="font-size:11px;font-weight:900;letter-spacing:0.25em;text-transform:uppercase;color:#0891b2;margin:0 0 12px">Equipment Care</p>
    <h1 style="font-size:26px;font-weight:900;margin:0 0 20px;line-height:1.3;color:#0f172a">Most equipment failures we see in DFW were preventable</h1>
    <p style="margin:0 0 16px;color:#475569">After years of repairs across Dallas Fort Worth, the pattern is clear: the majority of the equipment we service failed because of deferred maintenance, not defective parts.</p>
    <p style="margin:0 0 24px;color:#475569">A treadmill that gets lubricated every quarter and has its belt checked annually can run for 10+ years. The same machine neglected for 18 months often needs a motor, a deck, and sometimes both.</p>
    <div style="background:#0f172a;color:#fff;padding:24px 28px;margin:0 0 28px;border-radius:4px">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
        <div>
          <div style="font-size:28px;font-weight:900;color:#22d3ee">2x</div>
          <div style="font-size:13px;color:#94a3b8;margin-top:4px">longer equipment lifespan with preventative maintenance</div>
        </div>
        <div>
          <div style="font-size:28px;font-weight:900;color:#22d3ee">60%</div>
          <div style="font-size:13px;color:#94a3b8;margin-top:4px">of repairs we do could have been avoided</div>
        </div>
      </div>
    </div>
    <p style="margin:0 0 24px;color:#475569">We offer preventative maintenance visits for both residential and commercial clients across DFW. One visit per year is usually enough to keep most home gym equipment running reliably.</p>
    <a href="${SITE}/services/preventative-maintenance-dallas" style="display:inline-block;background:#22d3ee;color:#000;font-weight:900;font-size:12px;letter-spacing:0.15em;text-transform:uppercase;padding:14px 28px;text-decoration:none;margin-right:12px">Learn About Maintenance</a>
    <a href="tel:${PHONE_TEL}" style="display:inline-block;border:2px solid #e2e8f0;color:#475569;font-weight:900;font-size:12px;letter-spacing:0.15em;text-transform:uppercase;padding:12px 28px;text-decoration:none">${PHONE}</a>
  `)
}

function welcomeDay14Html() {
  return wrap(`
    <img src="${SITE}/images/2eztek-logo.webp" alt="2EZ TEK" width="120" style="margin-bottom:28px" onerror="this.style.display='none'"/>
    <p style="font-size:11px;font-weight:900;letter-spacing:0.25em;text-transform:uppercase;color:#0891b2;margin:0 0 12px">2EZ TEK</p>
    <h1 style="font-size:26px;font-weight:900;margin:0 0 20px;line-height:1.3;color:#0f172a">We're ready when you need us</h1>
    <p style="margin:0 0 24px;color:#475569">Whether your equipment is making a new noise, something stopped working, or you just want a professional to check things over, 2EZ TEK covers all of Dallas Fort Worth.</p>
    <div style="display:grid;gap:12px;margin:0 0 28px">
      ${[
        ['Treadmill Repair', 'Belt, motor, deck, incline, console'],
        ['Elliptical Repair', 'Resistance, stride, drive, bearings'],
        ['Exercise Bike Repair', 'Flywheel, resistance, console, pedals'],
        ['Strength Equipment', 'Cables, pulleys, weight stacks, frames'],
        ['Fitness Equipment Assembly', 'Rogue, PRX, NordicTrack, Bowflex, and more'],
        ['Commercial Maintenance', 'Preventative contracts for gyms and facilities'],
      ].map(([title, desc]) => `
        <div style="border:1px solid #e2e8f0;padding:14px 18px;display:flex;gap:12px;align-items:start">
          <span style="color:#22d3ee;font-weight:900;margin-top:2px">&#8594;</span>
          <div><strong style="color:#0f172a">${title}</strong><br><span style="color:#64748b;font-size:13px">${desc}</span></div>
        </div>
      `).join('')}
    </div>
    <p style="margin:0 0 8px;color:#64748b;font-size:14px">500+ five-star reviews &nbsp;&middot;&nbsp; Dallas Fort Worth &nbsp;&middot;&nbsp; Home gyms and commercial facilities</p>
    <a href="${SITE}/contact" style="display:inline-block;background:#22d3ee;color:#000;font-weight:900;font-size:12px;letter-spacing:0.15em;text-transform:uppercase;padding:14px 28px;text-decoration:none">Book Service</a>
  `)
}

function manualFollowupHtml(brandName: string) {
  return wrap(`
    <img src="${SITE}/images/2eztek-logo.webp" alt="2EZ TEK" width="120" style="margin-bottom:28px" onerror="this.style.display='none'"/>
    <p style="font-size:11px;font-weight:900;letter-spacing:0.25em;text-transform:uppercase;color:#0891b2;margin:0 0 12px">${brandName} Equipment</p>
    <h1 style="font-size:26px;font-weight:900;margin:0 0 20px;line-height:1.3;color:#0f172a">Having trouble with your ${brandName} equipment?</h1>
    <p style="margin:0 0 16px;color:#475569">You recently looked up a ${brandName} manual on our site. If you're working through an issue and the manual isn't solving it, that's exactly what 2EZ TEK is here for.</p>
    <p style="margin:0 0 24px;color:#475569">We service ${brandName} equipment across Dallas Fort Worth, including repairs, assembly, and preventative maintenance, at your home or facility.</p>
    <div style="background:#f0f9ff;border:1px solid #bae6fd;padding:20px 24px;margin:0 0 28px">
      <strong style="color:#0f172a">What we can do for your ${brandName} equipment:</strong>
      <ul style="margin:12px 0 0;padding-left:20px;color:#475569;font-size:14px;line-height:2">
        <li>On-site diagnosis and repair</li>
        <li>Assembly and installation</li>
        <li>Error code troubleshooting</li>
        <li>Preventative maintenance</li>
        <li>Part sourcing and replacement</li>
      </ul>
    </div>
    <a href="${SITE}/contact" style="display:inline-block;background:#22d3ee;color:#000;font-weight:900;font-size:12px;letter-spacing:0.15em;text-transform:uppercase;padding:14px 28px;text-decoration:none;margin-right:12px">Request Service</a>
    <a href="tel:${PHONE_TEL}" style="display:inline-block;border:2px solid #e2e8f0;color:#475569;font-weight:900;font-size:12px;letter-spacing:0.15em;text-transform:uppercase;padding:12px 28px;text-decoration:none">${PHONE}</a>
  `)
}

async function sendEmail(to: string, subject: string, html: string) {
  if (!process.env.RESEND_API_KEY) return
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from: FROM, to: [to], subject, html }),
  }).catch(() => null)
}

export async function GET(req: Request) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: due, error } = await supabase
    .from('email_sequences')
    .select('*')
    .lte('next_send_at', new Date().toISOString())
    .lt('step', 99)
    .limit(50)

  if (error) {
    console.error('email-sequences cron error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const day = 86_400_000
  let sent = 0
  let skipped = 0

  for (const seq of due || []) {
    const createdAt = new Date(seq.created_at).getTime()
    const nextStep = seq.step + 1

    if (seq.sequence === 'welcome') {
      if (nextStep === 1) {
        await sendEmail(seq.email, '3 quick checks that prevent most equipment breakdowns', welcomeDay3Html())
        await supabase.from('email_sequences').update({
          step: 1,
          next_send_at: new Date(createdAt + 7 * day).toISOString(),
        }).eq('id', seq.id)
        sent++
      } else if (nextStep === 2) {
        await sendEmail(seq.email, 'Most equipment failures in DFW were preventable', welcomeDay7Html())
        await supabase.from('email_sequences').update({
          step: 2,
          next_send_at: new Date(createdAt + 14 * day).toISOString(),
        }).eq('id', seq.id)
        sent++
      } else if (nextStep === 3) {
        await sendEmail(seq.email, "We're ready when you need us", welcomeDay14Html())
        await supabase.from('email_sequences').update({ step: 99 }).eq('id', seq.id)
        sent++
      } else {
        await supabase.from('email_sequences').update({ step: 99 }).eq('id', seq.id)
        skipped++
      }
    } else if (seq.sequence === 'manual_followup') {
      const brand = seq.brand_name || 'fitness'
      await sendEmail(seq.email, `Having trouble with your ${brand} equipment?`, manualFollowupHtml(brand))
      await supabase.from('email_sequences').update({ step: 99 }).eq('id', seq.id)
      sent++
    }
  }

  return NextResponse.json({ sent, skipped, total: (due || []).length })
}
