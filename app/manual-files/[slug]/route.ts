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

  const { data: manual } = await supabase
    .from('equipment_manuals_v2')
    .select(`
      slug,
      manual_url,
      equipment_models (
        brands (
          name
        )
      )
    `)
    .eq('slug', slug)
    .maybeSingle()

  if (!manual) {
    return NextResponse.json(
      {
        success: false,
        error: 'Manual not found',
      },
      { status: 404 }
    )
  }

  const brand =
    manual.equipment_models?.brands?.name ||
    'manuals'

  const brandSlug = brand
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')

  const fileName =
    manual.manual_url
      ?.split('/')
      .pop()

  if (!fileName) {
    return NextResponse.json(
      {
        success: false,
        error: 'Invalid manual file',
      },
      { status: 500 }
    )
  }

  return NextResponse.redirect(
    `${process.env.NEXT_PUBLIC_APP_URL}/manuals/${brandSlug}/${fileName}`
  )
}