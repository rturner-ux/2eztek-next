import { NextResponse, after } from 'next/server'
import { Resend } from 'resend'
import { captureNewCustomer } from '@/lib/newCustomers'
import { syncCustomerContact } from '@/lib/contactSync'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function escapeHtml(value: unknown) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function isValidName(value: string) {
  const trimmed = value.trim()

  if (trimmed.length < 2 || trimmed.length > 60) return false

  if (!/^[a-zA-Z\s.'-]+$/.test(trimmed)) return false

  const vowels = trimmed.match(/[aeiou]/gi) || []
  if (vowels.length < 1) return false

  if (/[A-Z]{8,}/.test(trimmed.replace(/\s/g, ''))) return false

  return true
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function isBlockedEmailDomain(value: string) {
  const domain = value.toLowerCase().split('@')[1] || ''

  const blockedDomains = [
    'txt.att.net',
    'vtext.com',
    'tmomail.net',
    'messaging.sprintpcs.com',
    'pm.sprint.com',
    'tmomail.net',
    'mms.att.net',
    'myboostmobile.com',
    'sms.mycricket.com',
    'mailinator.com',
    'tempmail.com',
    '10minutemail.com',
    'guerrillamail.com'
  ]

  return blockedDomains.includes(domain)
}

function looksLikeGibberish(value: string) {
  const text = value.trim()

  if (!text) return false
  if (text.length < 12) return false

  const lettersOnly = text.replace(/[^a-zA-Z]/g, '')
  if (lettersOnly.length < 12) return false

  const vowels = lettersOnly.match(/[aeiou]/gi) || []
  const vowelRatio = vowels.length / lettersOnly.length

  const hasLongRandomCapitalPattern = /[a-z][A-Z][a-z][A-Z]|[A-Z][a-z][A-Z][a-z]/.test(lettersOnly)
  const hasNoSpacesAndLong = !/\s/.test(text) && lettersOnly.length > 18

  if (vowelRatio < 0.22 && lettersOnly.length > 14) return true
  if (hasLongRandomCapitalPattern && hasNoSpacesAndLong) return true

  return false
}

function cleanPhone(value: string) {
  return value.replace(/[^\d]/g, '')
}

function isValidPhone(value: string) {
  const digits = cleanPhone(value)
  return digits.length >= 10 && digits.length <= 11
}

async function verifyRecaptcha(token: string | undefined) {
  if (!process.env.RECAPTCHA_SECRET_KEY) {
    return true
  }

  if (!token) {
    return false
  }

  const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      secret: process.env.RECAPTCHA_SECRET_KEY,
      response: token
    })
  })

  const data = await response.json()

  if (!data.success) return false

  if (typeof data.score === 'number' && data.score < 0.5) {
    return false
  }

  return true
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    if (body.companyWebsite) {
      return NextResponse.json({ success: true })
    }

    if (
      typeof body.submittedInMs === 'number' &&
      body.submittedInMs < 3000
    ) {
      return NextResponse.json(
        { success: false, message: 'Submission rejected.' },
        { status: 400 }
      )
    }

    const recaptchaPassed = await verifyRecaptcha(body.recaptchaToken)

    if (!recaptchaPassed) {
      return NextResponse.json(
        { success: false, message: 'Security verification failed.' },
        { status: 400 }
      )
    }

    const isCareers = body.source === 'Careers Page'

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

    const rawName = String(body.name || '').trim()
    const rawEmail = String(body.email || '').trim().toLowerCase()
    const rawPhone = String(body.phone || '').trim()
    const rawExperience = String(body.experience || '').trim()
    const rawDetails = String(
      body.details ||
      body.issueDescription ||
      body.message ||
      ''
    ).trim()

    if (!isValidName(rawName) || looksLikeGibberish(rawName)) {
      return NextResponse.json(
        { success: false, message: 'Invalid name.' },
        { status: 400 }
      )
    }

    if (!isValidEmail(rawEmail) || isBlockedEmailDomain(rawEmail)) {
      return NextResponse.json(
        { success: false, message: 'Invalid email.' },
        { status: 400 }
      )
    }

    if (!isValidPhone(rawPhone)) {
      return NextResponse.json(
        { success: false, message: 'Invalid phone number.' },
        { status: 400 }
      )
    }

    if (rawDetails && looksLikeGibberish(rawDetails)) {
      return NextResponse.json(
        { success: false, message: 'Invalid message.' },
        { status: 400 }
      )
    }

    if (isCareers && rawExperience && looksLikeGibberish(rawExperience)) {
      return NextResponse.json(
        { success: false, message: 'Invalid experience field.' },
        { status: 400 }
      )
    }

    if (isCareers && rawDetails && rawDetails.length < 15) {
      return NextResponse.json(
        { success: false, message: 'Application message is too short.' },
        { status: 400 }
      )
    }

    if (!isCareers && rawDetails && rawDetails.length < 10) {
      return NextResponse.json(
        { success: false, message: 'Request details are too short.' },
        { status: 400 }
      )
    }

    if (!isCareers) {
      await captureNewCustomer({
        name: rawName,
        email: rawEmail,
        phone: rawPhone,
        address: body.address,
        serviceType: body.serviceType || body.requestType,
        equipmentType: body.equipmentType,
        brandModel: body.brandModel,
        details: rawDetails,
        source: body.source || 'Contact Page',
        page: body.page || '/contact',
      })

      // Add the customer to Outlook + Google contacts (mirrors the old
      // Zapier flow). Deferred via after() so it never blocks the response.
      after(() => syncCustomerContact({ name: rawName, phone: rawPhone, email: rawEmail, address: body.address }))
    }

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'Missing RESEND_API_KEY.' },
        { status: 500 }
      )
    }

    const resend = new Resend(process.env.RESEND_API_KEY)

    const name = escapeHtml(rawName)
    const firstName = escapeHtml(rawName.split(' ')[0] || 'there')
    const email = escapeHtml(rawEmail)
    const phone = escapeHtml(rawPhone)
    const address = escapeHtml(body.address)
    const serviceType = escapeHtml(body.serviceType || body.requestType || '')
    const equipmentType = escapeHtml(body.equipmentType || '')
    const brandModel = escapeHtml(body.brandModel || '')
    const role = escapeHtml(body.role || 'Open Role')
    const experience = escapeHtml(rawExperience || 'Not specified')
    const details = escapeHtml(rawDetails)
    const submittedAt = new Date().toLocaleString('en-US', {
      timeZone: 'America/Chicago'
    })

    const subject = isCareers
      ? `New 2EZ TEK Application: ${body.role || 'Open Role'} from ${rawName}`
      : `New 2EZ TEK Request: ${body.serviceType || body.requestType || 'Service'} from ${rawName}`

    const internalHtml = isCareers
      ? `
        <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111">
          <h2>New Job Application — 2EZ TEK</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Phone:</strong> ${phone}</p>
          <p><strong>Email:</strong> ${email}</p>
          <hr />
          <p><strong>Role Applied For:</strong> ${role}</p>
          <p><strong>Experience:</strong> ${experience}</p>
          <hr />
          <p><strong>Message:</strong></p>
          <p style="white-space:pre-wrap">${details}</p>
          <hr />
          <p><strong>Source:</strong> Careers Page</p>
          <p><strong>Submitted:</strong> ${submittedAt}</p>
        </div>
      `
      : `
        <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111">
          <h2>New 2EZ TEK Service Request</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Phone:</strong> ${phone}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Address:</strong> ${address}</p>
          <hr />
          <p><strong>Service Type:</strong> ${serviceType}</p>
          <p><strong>Equipment Type:</strong> ${equipmentType}</p>
          <p><strong>Brand / Model:</strong> ${brandModel}</p>
          <hr />
          <p><strong>Details:</strong></p>
          <p style="white-space:pre-wrap">${details}</p>
          <hr />
          <p><strong>Source:</strong> ${escapeHtml(body.source || 'Contact Page')}</p>
          <p><strong>Page:</strong> ${escapeHtml(body.page || '/contact')}</p>
          <p><strong>Submitted:</strong> ${submittedAt}</p>
        </div>
      `

    const confirmationHtml = isCareers
      ? `
        <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111;max-width:600px">
          <div style="background:#070B12;padding:32px;border-radius:16px;text-align:center">
            <h1 style="color:#22D3EE;font-size:28px;margin:0">Application Received</h1>
          </div>
          <div style="padding:32px">
            <p>Hi ${firstName},</p>
            <p>Thank you for applying to join the 2EZ TEK team. We've received your application for the <strong>${role}</strong> role and will review it shortly.</p>
            <p>If your background looks like a good fit, someone from our team will reach out to you directly.</p>
            <p>Questions? Email us at <a href="mailto:jobs@2eztek.com" style="color:#22D3EE">jobs@2eztek.com</a>.</p>
            <hr style="border:none;border-top:1px solid #eee;margin:24px 0" />
            <p style="color:#666;font-size:14px">2EZ TEK · Dallas Fort Worth, TX<br />(972) 807-7232 · <a href="https://2eztek.com" style="color:#22D3EE">2eztek.com</a></p>
          </div>
        </div>
      `
      : `
        <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111;max-width:600px">
          <div style="background:#070B12;padding:32px;border-radius:16px;text-align:center">
            <h1 style="color:#22D3EE;font-size:28px;margin:0">Request Received</h1>
          </div>
          <div style="padding:32px">
            <p>Hi ${firstName},</p>
            <p>Thank you for reaching out to 2EZ TEK. We've received your service request and our team will follow up shortly.</p>
            <div style="background:#f7f7f7;border-radius:12px;padding:20px;margin:24px 0">
              <p style="margin:0 0 8px"><strong>Service Requested:</strong> ${serviceType || 'General Service'}</p>
              ${equipmentType ? `<p style="margin:0 0 8px"><strong>Equipment:</strong> ${equipmentType}</p>` : ''}
              ${brandModel ? `<p style="margin:0"><strong>Brand / Model:</strong> ${brandModel}</p>` : ''}
            </div>
            <p>If you need us sooner, call or text <a href="tel:9728077232" style="color:#22D3EE">(972) 807-7232</a> or email <a href="mailto:support@2eztek.com" style="color:#22D3EE">support@2eztek.com</a>.</p>
            <hr style="border:none;border-top:1px solid #eee;margin:24px 0" />
            <p style="color:#666;font-size:14px">2EZ TEK · Dallas Fort Worth, TX<br />(972) 807-7232 · <a href="https://2eztek.com" style="color:#22D3EE">2eztek.com</a></p>
          </div>
        </div>
      `

    const internalResult = await resend.emails.send({
      from: '2EZ TEK <support@2eztek.com>',
      to: ['support@2eztek.com', 'rturner@2eztek.com'],
      replyTo: rawEmail,
      subject,
      html: internalHtml
    })

    if (internalResult.error) {
      return NextResponse.json(
        {
          success: false,
          error: internalResult.error.message || 'Internal email failed.'
        },
        { status: 500 }
      )
    }

    const confirmationResult = await resend.emails.send({
      from: '2EZ TEK <support@2eztek.com>',
      to: [rawEmail],
      subject: isCareers
        ? 'Your 2EZ TEK Application Was Received'
        : 'Your 2EZ TEK Service Request Was Received',
      html: confirmationHtml
    })

    if (confirmationResult.error) {
      console.error('Confirmation email failed:', confirmationResult.error)
    }

    return NextResponse.json({
      success: true,
      message: 'Request submitted successfully.'
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Server error.'
      },
      { status: 500 }
    )
  }
}
