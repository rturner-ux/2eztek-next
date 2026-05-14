import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

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
}

function clean(value: unknown) {
  return String(value || '').trim()
}

function buildEmailHtml(payload: ServiceRequestPayload) {
  const serviceType = clean(payload.requestType || payload.serviceType)
  const address = clean(payload.serviceAddress || payload.address)
  const details = clean(payload.issueDescription || payload.details)

  return `
    <div style="font-family:Arial,sans-serif;background:#050B14;color:#ffffff;padding:24px;">
      <div style="max-width:680px;margin:0 auto;background:#07101D;border:1px solid rgba(255,255,255,0.12);border-radius:18px;padding:24px;">
        <h1 style="margin:0 0 10px;color:#67e8f9;">New 2EZ TEK Service Request</h1>
        <p style="color:#cbd5e1;">A customer submitted a request from the website.</p>

        <table style="width:100%;border-collapse:collapse;margin-top:20px;">
          <tr><td><strong>Name:</strong></td><td>${clean(payload.name)}</td></tr>
          <tr><td><strong>Phone:</strong></td><td>${clean(payload.phone)}</td></tr>
          <tr><td><strong>Email:</strong></td><td>${clean(payload.email)}</td></tr>
          <tr><td><strong>Service Type:</strong></td><td>${serviceType}</td></tr>
          <tr><td><strong>Address:</strong></td><td>${address}</td></tr>
          <tr><td><strong>Equipment Type:</strong></td><td>${clean(payload.equipmentType)}</td></tr>
          <tr><td><strong>Brand / Model:</strong></td><td>${clean(payload.brandModel)}</td></tr>
          <tr><td><strong>Source:</strong></td><td>${clean(payload.source)}</td></tr>
          <tr><td><strong>Page:</strong></td><td>${clean(payload.page)}</td></tr>
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

    if (!name || !phone || !email || !serviceType || !details) {
      return NextResponse.json(
        {
          success: false,
          message: 'Missing required service request fields.',
        },
        { status: 400 }
      )
    }

    const resendApiKey = process.env.RESEND_API_KEY
    const alertEmail = process.env.SERVICE_ALERT_EMAIL || 'support@2eztek.com'
    const fromEmail = process.env.SERVICE_FROM_EMAIL || '2EZ TEK <info@2eztek.com>'

    if (!resendApiKey) {
      return NextResponse.json(
        {
          success: false,
          message: 'Missing RESEND_API_KEY environment variable.',
        },
        { status: 500 }
      )
    }

    const subject = `New 2EZ TEK Request: ${serviceType} from ${name}`

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
        html: buildEmailHtml(payload),
      }),
    })

    const emailResult = await emailResponse.json()

    if (!emailResponse.ok) {
      return NextResponse.json(
        {
          success: false,
          message: 'Email alert failed.',
          details: emailResult,
        },
        { status: 502 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Service request received.',
      emailId: emailResult?.id || null,
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