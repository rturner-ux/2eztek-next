import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params

    if (!slug) {
      return NextResponse.json(
        { error: 'Missing manual slug' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('equipment_manuals')
      .select('*')
      .eq('slug', slug)
      .single()

    if (error || !data) {
      return NextResponse.json(
        {
          success: false,
          error: 'Manual not found',
          slug,
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      manual: data,
    })
  } catch (err) {
    console.error('Manual lookup error:', err)

    return NextResponse.json(
      {
        success: false,
        error: 'Server error',
      },
      { status: 500 }
    )
  }
}