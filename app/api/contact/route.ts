import { NextResponse } from 'next/server'
import { Resend } from 'resend'

export const runtime = 'nodejs'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const isCareers = body.source === 'Careers Page'

    // Careers page only requires name, email, phone
    const requiredFields = isCareers
      ? ['name', 'email', 'phone']
      : ['name', 'email', 'phone', 'address']

    const missingFields = requiredFields.filter((field) => {
      const value = body[field]
      return !value || String(value).trim() === ''
    })

    if (missingFields.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields.', missingFields },
        { status: 400 }
      )
    }

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'Missing RESEND_API_KEY.' },
        { status: 500 }
      )
    }

    const details = body.details || body.issueDescription || body.message || ''

    const subject = isCareers
      ? `New 2EZ TEK Application: ${body.role || 'Open Role'} from ${body.name}`
      : `New 2EZ TEK Request: ${body.serviceType || body.requestType || 'Service'} from ${body.name}`

    // ── Internal notification email ──────────────────────────────────────────
    const internalHtml = isCareers
      ? `
        <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111">
          <h2>New Job Application — 2EZ TEK</h2>
          <p><strong>Name:</strong> ${body.name}</p>
          <p><strong>Phone:</strong> ${body.phone}</p>
          <p><strong>Email:</strong> ${body.email}</p>
          <hr />
          <p><strong>Role Applied For:</strong> ${body.role || 'Not specified'}</p>
          <p><strong>Experience:</strong> ${body.experience || 'Not specified'}</p>
          <hr />
          <p><strong>Message:</strong></p>
          <p style="white-space:pre-wrap">${body.message || ''}</p>
          <hr />
          <p><strong>Source:</strong> Careers Page</p>
          <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
        </div>
      `
      : `
        <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111">
          <h2>New 2EZ TEK Service Request</h2>
          <p><strong>Name:</strong> ${body.name}</p>
          <p><strong>Phone:</strong> ${body.phone}</p>
          <p><strong>Email:</strong> ${body.email}</p>
          <p><strong>Address:</strong> ${body.address}</p>
          <hr />
          <p><strong>Service Type:</strong> ${body.serviceType || body.requestType || ''}</p>
          <p><strong>Equipment Type:</strong> ${body.equipmentType || ''}</p>
          <p><strong>Brand / Model:</strong> ${body.brandModel || ''}</p>
          <hr />
          <p><strong>Details:</strong></p>
          <p style="white-space:pre-wrap">${details}</p>
          <hr />
          <p><strong>Source:</strong> ${body.source || 'Contact Page'}</p>
          <p><strong>Page:</strong> ${body.page || '/contact'}</p>
          <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
        </div>
      `

    // ── Confirmation email to applicant/customer ──────────────────────────────
    const confirmationHtml = isCareers
      ? `
        <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111;max-width:600px">
          <div style="background:#070B12;padding:32px;border-radius:16px;text-align:center">
            <img src="https://2eztek.com/logo.png" alt="2EZ TEK" style="height:60px;margin-bottom:24px" />
            <h1 style="color:#22D3EE;font-size:28px;margin:0">Application Received</h1>
          </div>
          <div style="padding:32px">
            <p>Hi ${body.name.split(' ')[0]},</p>
            <p>Thank you for applying to join the 2EZ TEK team. We've received your application for the <strong>${body.role || 'open position'}</strong> role and will review it shortly.</p>
            <p>If your background looks like a good fit, someone from our team will reach out to you directly.</p>
            <p>In the meantime, feel free to email us at <a href="mailto:jobs@2eztek.com" style="color:#22D3EE">jobs@2eztek.com</a> if you have any questions.</p>
            <hr style="border:none;border-top:1px solid #eee;margin:24px 0" />
            <p style="color:#666;font-size:14px">2EZ TEK · Dallas Fort Worth, TX<br />(972) 807-7232 · <a href="https://2eztek.com" style="color:#22D3EE">2eztek.com</a></p>
          </div>
        </div>
      `
      : `
        <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111;max-width:600px">
          <div style="background:#070B12;padding:32px;border-radius:16px;text-align:center">
            <img src="https://2eztek.com/logo.png" alt="2EZ TEK" style="height:60px;margin-bottom:24px" />
            <h1 style="color:#22D3EE;font-size:28px;margin:0">Request Received</h1>
          </div>
          <div style="padding:32px">
            <p>Hi ${body.name.split(' ')[0]},</p>
            <p>Thank you for reaching out to 2EZ TEK. We've received your service request and our team will follow up with you shortly.</p>
            <div style="background:#f7f7f7;border-radius:12px;padding:20px;margin:24px 0">
              <p style="margin:0 0 8px"><strong>Service Requested:</strong> ${body.serviceType || body.requestType || 'General Service'}</p>
              ${body.equipmentType ? `<p style="margin:0 0 8px"><strong>Equipment:</strong> ${body.equipmentType}</p>` : ''}
              ${body.brandModel ? `<p style="margin:0"><strong>Brand / Model:</strong> ${body.brandModel}</p>` : ''}
            </div>
            <p>If you need to reach us sooner, call or text us at <a href="tel:9728077232" style="color:#22D3EE">(972) 807-7232</a> or email <a href="mailto:support@2eztek.com" style="color:#22D3EE">support@2eztek.com</a>.</p>
            <hr style="border:none;border-top:1px solid #eee;margin:24px 0" />
            <p style="color:#666;font-size:14px">2EZ TEK · Dallas Fort Worth, TX<br />(972) 807-7232 · <a href="https://2eztek.com" style="color:#22D3EE">2eztek.com</a></p>
          </div>
        </div>
      `

    // Send both emails
    const [internalResult, confirmationResult] = await Promise.all([
      resend.emails.send({
        from: '2EZ TEK <support@2eztek.com>',
        to: ['support@2eztek.com'],
        replyTo: body.email,
        subject,
        html: internalHtml,
      }),
      resend.emails.send({
        from: '2EZ TEK <support@2eztek.com>',
        to: [body.email],
        subject: isCareers
          ? 'Your 2EZ TEK Application Was Received'
          : 'Your 2EZ TEK Service Request Was Received',
        html: confirmationHtml,
      }),
    ])

    if (internalResult.error) {
      return NextResponse.json(
        { success: false, error: internalResult.error.message || 'Email failed.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Request submitted successfully.',
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Server error.' },
      { status: 500 }
    )
  }
}
