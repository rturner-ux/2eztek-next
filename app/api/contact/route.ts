import { NextResponse } from 'next/server'
import { Resend } from 'resend'

export const runtime = 'nodejs'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const requiredFields = ['name', 'email', 'phone', 'address']

    const missingFields = requiredFields.filter((field) => {
      const value = body[field]
      return !value || String(value).trim() === ''
    })

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields.',
          missingFields,
        },
        { status: 400 }
      )
    }

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing RESEND_API_KEY.',
        },
        { status: 500 }
      )
    }

    const details =
      body.details ||
      body.issueDescription ||
      body.message ||
      ''

    const subject = `New 2EZ TEK Request: ${body.serviceType || body.requestType || 'Service'} from ${body.name}`

    const bookingSection =
      details.includes('Preferred Service Window')
        ? ''
        : ''

    const emailHtml = `
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

        ${bookingSection}

        <hr />

        <p><strong>Source:</strong> ${body.source || 'Contact Page'}</p>
        <p><strong>Page:</strong> ${body.page || '/contact'}</p>
        <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
      </div>
    `

    const { error } = await resend.emails.send({
      from: '2EZ TEK <support@2eztek.com>',
      to: ['support@2eztek.com'],
      replyTo: body.email,
      subject,
      html: emailHtml,
    })

    if (error) {
      return NextResponse.json(
        {
          success: false,
          error: error.message || 'Resend email failed.',
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Contact request submitted successfully.',
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Server error.',
      },
      { status: 500 }
    )
  }
}