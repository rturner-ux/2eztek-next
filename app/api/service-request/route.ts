import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    success: true,
    message: '2EZ TEK service request API is live.',
  })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const payload = {
      ...body,
      source: '2EZ TEK Website',
      submittedAt: new Date().toISOString(),
    }

    console.log('NEW 2EZ TEK SERVICE REQUEST:', payload)

    if (process.env.ZAPIER_SERVICE_REQUEST_WEBHOOK) {
      const zapierResponse = await fetch(
        process.env.ZAPIER_SERVICE_REQUEST_WEBHOOK,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      )

      if (!zapierResponse.ok) {
        throw new Error('Zapier webhook failed')
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Service request received.',
    })
  } catch (error) {
    console.error('SERVICE REQUEST ERROR:', error)

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to submit service request.',
      },
      { status: 500 }
    )
  }
}