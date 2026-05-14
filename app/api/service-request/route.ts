import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase environment variables')
  }

  return createClient(supabaseUrl, serviceRoleKey)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const supabase = getSupabaseAdmin()

    const { data, error } = await supabase
      .from('service_requests')
      .insert({
        name: body.name || '',
        email: body.email || '',
        phone: body.phone || '',
        company_name: body.company_name || '',
        service_address: body.service_address || '',
        equipment_type: body.equipment_type || '',
        issue_description: body.issue_description || '',
        status: 'new',
        request_source: 'website',
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      request: data,
    })
  } catch (error: any) {
    console.error('SERVICE REQUEST ERROR:', error)

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to submit request.',
      },
      { status: 500 }
    )
  }
}