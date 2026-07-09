import { NextRequest, NextResponse } from 'next/server'
import { verifyBookingToken, approveOutlookEvent, deleteOutlookEvent } from '@/app/api/service-request/route'
import { createOutlookTask } from '@/lib/msGraph'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

async function sendEmail(to: string, subject: string, html: string) {
  const resendApiKey = process.env.RESEND_API_KEY
  if (!resendApiKey) return
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${resendApiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: '2EZ TEK <support@2eztek.com>',
      to: [to],
      reply_to: 'rturner@2eztek.com',
      subject,
      html,
    }),
  })
}

function confirmationEmail(name: string, serviceType: string, preferredDate: string, preferredWindow: string, address: string) {
  const firstName = name.trim().split(' ')[0]
  const reviewUrl = process.env.GOOGLE_REVIEW_URL || 'https://g.page/r/2eztek/review'
  return `
    <div style="font-family:Arial,sans-serif;background:#f8fafc;padding:32px 16px;">
      <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,0.08);">
        <div style="background:#050B14;padding:28px 32px;text-align:center;">
          <p style="margin:0;font-size:28px;font-weight:900;letter-spacing:-0.5px;color:#ffffff;">2EZ<span style="color:#22d3ee;">TEK</span></p>
          <p style="margin:6px 0 0;font-size:12px;font-weight:600;letter-spacing:0.18em;text-transform:uppercase;color:rgba(255,255,255,0.4);">Fitness Equipment Repair · DFW</p>
        </div>
        <div style="padding:32px;">
          <h2 style="margin:0 0 8px;font-size:22px;font-weight:900;color:#0f172a;">Your appointment is confirmed, ${firstName}!</h2>
          <p style="margin:0 0 24px;font-size:15px;color:#475569;line-height:1.7;">
            Your 2EZ TEK service appointment for <strong>${serviceType}</strong> has been confirmed. Our technician will come to you.
          </p>
          <div style="background:#052a1a;border:2px solid #22c55e;border-radius:12px;padding:20px 24px;margin-bottom:24px;">
            <p style="margin:0 0 4px;font-size:10px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:#4ade80;">Confirmed Appointment</p>
            ${preferredDate ? `<p style="margin:6px 0 0;font-size:20px;font-weight:900;color:#ffffff;">📅 ${preferredDate}</p>` : ''}
            ${preferredWindow ? `<p style="margin:4px 0 0;font-size:16px;font-weight:700;color:#4ade80;">🕐 ${preferredWindow}</p>` : ''}
            ${address ? `<p style="margin:6px 0 0;font-size:14px;color:#86efac;">📍 ${address}</p>` : ''}
          </div>
          <div style="background:#f1f5f9;border-radius:12px;padding:20px 24px;margin-bottom:24px;">
            <p style="margin:0 0 12px;font-size:11px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:#64748b;">What happens next</p>
            <div style="display:flex;flex-direction:column;gap:10px;">
              <div style="display:flex;align-items:flex-start;gap:12px;">
                <span style="background:#22d3ee;color:#050B14;font-weight:900;font-size:11px;border-radius:100px;padding:2px 8px;flex-shrink:0;margin-top:1px;">1</span>
                <p style="margin:0;font-size:14px;color:#334155;">Our technician will arrive at your address during the confirmed time window</p>
              </div>
              <div style="display:flex;align-items:flex-start;gap:12px;">
                <span style="background:#22d3ee;color:#050B14;font-weight:900;font-size:11px;border-radius:100px;padding:2px 8px;flex-shrink:0;margin-top:1px;">2</span>
                <p style="margin:0;font-size:14px;color:#334155;">We diagnose and repair on-site in most cases, same visit</p>
              </div>
              <div style="display:flex;align-items:flex-start;gap:12px;">
                <span style="background:#22d3ee;color:#050B14;font-weight:900;font-size:11px;border-radius:100px;padding:2px 8px;flex-shrink:0;margin-top:1px;">3</span>
                <p style="margin:0;font-size:14px;color:#334155;">After your visit, we would love to hear how it went</p>
              </div>
            </div>
          </div>

          <!-- Google Review Request -->
          <div style="background:#fffbeb;border:2px solid #fbbf24;border-radius:12px;padding:20px 24px;margin-bottom:24px;text-align:center;">
            <p style="margin:0 0 4px;font-size:18px;">⭐⭐⭐⭐⭐</p>
            <p style="margin:6px 0 4px;font-size:15px;font-weight:900;color:#92400e;">After your service, please leave us a Google review</p>
            <p style="margin:0 0 16px;font-size:13px;color:#78350f;line-height:1.6;">We are a small local business and every review helps real customers in DFW find honest, reliable service. It takes less than a minute.</p>
            <a href="${reviewUrl}" style="display:inline-block;background:#f59e0b;color:#000000;text-decoration:none;padding:12px 28px;border-radius:100px;font-weight:900;font-size:14px;">
              Leave a Google Review
            </a>
          </div>

          <a href="tel:9728077232" style="display:inline-block;background:#050B14;color:#22d3ee;text-decoration:none;padding:13px 28px;border-radius:100px;font-weight:900;font-size:14px;">
            Call (972) 807-7232
          </a>
        </div>
        <div style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:20px 32px;text-align:center;">
          <p style="margin:0;font-size:12px;color:#94a3b8;">2EZ TEK · Dallas Fort Worth · <a href="https://www.2eztek.com" style="color:#22d3ee;text-decoration:none;">www.2eztek.com</a></p>
        </div>
      </div>
    </div>
  `
}

function rescheduleEmail(name: string, serviceType: string) {
  const firstName = name.trim().split(' ')[0]
  return `
    <div style="font-family:Arial,sans-serif;background:#f8fafc;padding:32px 16px;">
      <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,0.08);">
        <div style="background:#050B14;padding:28px 32px;text-align:center;">
          <p style="margin:0;font-size:28px;font-weight:900;letter-spacing:-0.5px;color:#ffffff;">2EZ<span style="color:#22d3ee;">TEK</span></p>
          <p style="margin:6px 0 0;font-size:12px;font-weight:600;letter-spacing:0.18em;text-transform:uppercase;color:rgba(255,255,255,0.4);">Fitness Equipment Repair · DFW</p>
        </div>
        <div style="padding:32px;">
          <h2 style="margin:0 0 8px;font-size:22px;font-weight:900;color:#0f172a;">We need to find a better time, ${firstName}.</h2>
          <p style="margin:0 0 24px;font-size:15px;color:#475569;line-height:1.7;">
            We are not able to confirm your <strong>${serviceType}</strong> appointment for the date you requested. Our schedule in your area on that day is full. Please call us and we will get you on the calendar as soon as possible.
          </p>
          <a href="tel:9728077232" style="display:inline-block;background:#22d3ee;color:#050B14;text-decoration:none;padding:13px 28px;border-radius:100px;font-weight:900;font-size:16px;">
            Call (972) 807-7232
          </a>
          <p style="margin:20px 0 0;font-size:13px;color:#94a3b8;">We are open Monday through Saturday, 8am to 6pm across all of DFW.</p>
        </div>
        <div style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:20px 32px;text-align:center;">
          <p style="margin:0;font-size:12px;color:#94a3b8;">2EZ TEK · Dallas Fort Worth · <a href="https://www.2eztek.com" style="color:#22d3ee;text-decoration:none;">www.2eztek.com</a></p>
        </div>
      </div>
    </div>
  `
}

function htmlPage(title: string, message: string, color: string) {
  return new Response(
    `<!DOCTYPE html><html><head><title>${title}</title><meta name="viewport" content="width=device-width,initial-scale=1"></head>
    <body style="margin:0;font-family:Arial,sans-serif;background:#050B14;display:flex;align-items:center;justify-content:center;min-height:100vh;padding:24px;">
      <div style="max-width:480px;text-align:center;">
        <p style="font-size:32px;font-weight:900;color:#fff;">2EZ<span style="color:#22d3ee;">TEK</span></p>
        <div style="background:${color}22;border:2px solid ${color};border-radius:20px;padding:32px;margin-top:16px;">
          <p style="margin:0;font-size:20px;font-weight:900;color:#fff;">${message}</p>
        </div>
        <p style="margin-top:24px;color:rgba(255,255,255,0.4);font-size:13px;">You can close this window.</p>
      </div>
    </body></html>`,
    { headers: { 'Content-Type': 'text/html' } }
  )
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token  = searchParams.get('token') || ''
  const action = searchParams.get('action') || ''

  const data = verifyBookingToken(token)
  if (!data) {
    return htmlPage('Invalid Link', 'This link is invalid or has expired.', '#ef4444')
  }

  const { eventId, customerName, customerEmail, serviceType, preferredDate, preferredWindow, address } = data

  if (action === 'approve') {
    if (eventId) await approveOutlookEvent(eventId, `2EZ TEK: ${serviceType} | ${customerName} | ${customerEmail}`)
    if (customerEmail) {
      await sendEmail(
        customerEmail,
        'Your 2EZ TEK appointment is confirmed',
        confirmationEmail(customerName, serviceType, preferredDate, preferredWindow, address)
      )
    }

    // Create a follow-up task due the day after the appointment
    const taskDueIso = (() => {
      if (!preferredDate) return undefined
      try {
        const d = new Date(preferredDate)
        d.setDate(d.getDate() + 1)
        return d.toISOString().split('T')[0]
      } catch { return undefined }
    })()
    createOutlookTask({
      title: `Follow up: ${customerName} — ${serviceType}`,
      body: `Customer: ${customerName}\nPhone: ${data.customerPhone || ''}\nEmail: ${customerEmail}\nService: ${serviceType}\nDate: ${preferredDate}\nAddress: ${address}`,
      dueDateIso: taskDueIso,
      importance: 'high',
    }).catch(() => {})

    return htmlPage('Appointment Approved', `Approved. Confirmation sent to ${customerEmail}.`, '#22c55e')
  }

  if (action === 'reject') {
    if (eventId) await deleteOutlookEvent(eventId)
    if (customerEmail) {
      await sendEmail(
        customerEmail,
        'Regarding your 2EZ TEK service request',
        rescheduleEmail(customerName, serviceType)
      )
    }
    return htmlPage('Appointment Declined', `Declined. Reschedule email sent to ${customerEmail}.`, '#f97316')
  }

  return htmlPage('Unknown Action', 'Unknown action. Please use the approve or decline link from your email.', '#ef4444')
}
