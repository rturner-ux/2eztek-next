import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  return NextResponse.json({
    success: true,
    apiLive: true,
    zapierConfigured: Boolean(process.env.ZAPIER_SERVICE_REQUEST_WEBHOOK),
  })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const {
      name,
      phone,
      email,
      address,
      serviceType,
      equipmentType,
      brandModel,
      details,
    } = body

    const { data, error } = await supabase
      .from('service_requests')
      .insert({
        contact_name: name,
        contact_phone: phone,
        contact_email: email,
        service_address: address,
        request_type: serviceType,
        equipment_type: equipmentType,
        machine_brand: brandModel,
        machine_model: brandModel,
        issue_description: details,
        request_source: '2EZ TEK Website',
        source: '2EZ TEK Website',
        status: 'new',
      })
      .select()

    if (error) {
      console.error('SUPABASE INSERT ERROR:', error)
      return NextResponse.json({ success: false, message: error.message }, { status: 500 })
    }

    const zapierUrl = process.env.ZAPIER_SERVICE_REQUEST_WEBHOOK

    console.log('ZAPIER CONFIGURED:', Boolean(zapierUrl))

    if (zapierUrl) {
      const zapierResponse = await fetch(zapierUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...body,
          source: '2EZ TEK Website',
          submittedAt: new Date().toISOString(),
        }),
      })

      console.log('ZAPIER RESPONSE STATUS:', zapierResponse.status)
    }

    return NextResponse.json({
      success: true,
      request: data,
    })
  } catch (error) {
    console.error('SERVICE REQUEST ERROR:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to submit service request.' },
      { status: 500 }
    )
  }
}