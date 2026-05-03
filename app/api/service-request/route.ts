import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  try {
    const body = await request.json()

    console.log('NEW WEBSITE SERVICE REQUEST:', body)

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

    const [machine_brand = '', machine_model = ''] =
      brandModel?.split(' ') || []

    const { data, error } = await supabase
      .from('service_requests')
      .insert({
        contact_name: name,
        contact_phone: phone,
        contact_email: email,
        service_address: address,
        request_type: serviceType,
        equipment_type: equipmentType,
        machine_brand,
        machine_model,
        issue_description: details,
        request_source: '2EZ TEK Website',
        source: '2EZ TEK Website',
        status: 'new',
      })
      .select()

    if (error) {
      console.error('SUPABASE INSERT ERROR:', error)

      return NextResponse.json(
        {
          success: false,
          message: error.message,
        },
        { status: 500 }
      )
    }

    console.log(
      'ZAPIER WEBHOOK:',
      process.env.ZAPIER_SERVICE_REQUEST_WEBHOOK
    )

    if (process.env.ZAPIER_SERVICE_REQUEST_WEBHOOK) {
      const zapResponse = await fetch(
        process.env.ZAPIER_SERVICE_REQUEST_WEBHOOK,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...body,
            submittedAt: new Date().toISOString(),
            source: '2EZ TEK Website',
          }),
        }
      )

      console.log('ZAPIER STATUS:', zapResponse.status)
    }

    return NextResponse.json({
      success: true,
      request: data,
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