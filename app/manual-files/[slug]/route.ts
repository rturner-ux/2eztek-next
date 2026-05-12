import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  context: {
    params: Promise<{
      slug: string
    }>
  }
) {
  const { slug } = await context.params

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: manual, error } = await supabase
    .from('equipment_manuals_v2')
    .select('slug, manual_url')
    .eq('slug', slug)
    .maybeSingle()

  if (error || !manual) {
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Manual not found',
        slug,
      },
      { status: 404 }
    )
  }

  const manualUrl = String(manual.manual_url || '').trim()

  if (!manualUrl) {
    return NextResponse.json(
      {
        success: false,
        error: 'Invalid manual URL',
        slug,
      },
      { status: 500 }
    )
  }

  return NextResponse.redirect(manualUrl)
}