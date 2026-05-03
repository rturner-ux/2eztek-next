import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    console.log('NEW 2EZ TEK SERVICE REQUEST:', {
      ...body,
      submittedAt: new Date().toISOString(),
    })

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