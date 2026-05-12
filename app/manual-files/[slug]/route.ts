import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

function slugify(value: string) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

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

  const { data, error } = await supabase
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

  if (error || !data) {
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Manual not found',
        slug,
      },
      { status: 404 }
    )
  }

  const manual = data as any

  const equipmentModel = Array.isArray(manual.equipment_models)
  ? manual.equipment_models[0]
  : manual.equipment_models

        const brandData = Array.isArray(equipmentModel?.brands)
        ? equipmentModel.brands[0]
        : equipmentModel?.brands

        const brandName =
        brandData?.name || 'manuals'

  const fileName = String(manual.manual_url || '').split('/').pop()

  if (!fileName) {
    return NextResponse.json(
      {
        success: false,
        error: 'Invalid manual file',
        slug,
      },
      { status: 500 }
    )
  }

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL || 'https://www.2eztek.com'

  return NextResponse.redirect(
    `${appUrl}/manuals/${slugify(brandName)}/${fileName}`
  )
}