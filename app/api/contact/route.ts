import { NextResponse } from 'next/server'

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

    const zapierWebhookUrl = process.env.ZAPIER_SERVICE_REQUEST_WEBHOOK

    if (!zapierWebhookUrl) {
      return NextResponse.json(
        {
          success: false,
          error: 'Zapier webhook is not configured.',
        },
        { status: 500 }
      )
    }

    const details =
      body.details ||
      body.message ||
      body.issueDescription ||
      ''

    const zapierResponse = await fetch(zapierWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: body.name,
        email: body.email,
        phone: body.phone,
        address: body.address,
        serviceAddress: body.serviceAddress || body.address,
        serviceType: body.serviceType || body.requestType || '',
        requestType: body.requestType || body.serviceType || '',
        equipmentType: body.equipmentType || '',
        brandModel: body.brandModel || '',
        details,
        message: details,
        issueDescription: body.issueDescription || details,
        source: body.source || '2EZ TEK Contact Form',
        page: body.page || '/contact',
        submittedAt: new Date().toISOString(),
      }),
    })

    if (!zapierResponse.ok) {
      const zapierText = await zapierResponse.text()

      return NextResponse.json(
        {
          success: false,
          error: 'Zapier webhook failed.',
          status: zapierResponse.status,
          details: zapierText,
        },
        { status: 502 }
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