import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data, error } = await supabase
    .from('equipment_manuals_v2')
    .select('manual_url')
    .eq('slug', slug)
    .maybeSingle()

  if (error || !data?.manual_url) {
    return NextResponse.json(
      {
        success: false,
        error: 'Manual not found',
        slug,
      },
      { status: 404 }
    )
  }

  return NextResponse.redirect(data.manual_url)
}