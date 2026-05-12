import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

type BrandRecord = {
  name?: string | null
}

type EquipmentModelRecord = {
  model?: string | null
  brands?: BrandRecord | BrandRecord[] | null
}

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
      id,
      slug,
      manual_type,
      manual_url,
      equipment_models (
        model,
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

  const manual = data as {
    id: string
    slug: string
    manual_type: string | null
    manual_url: string | null
    equipment_models?: EquipmentModelRecord | EquipmentModelRecord[] | null
  }

  const equipmentModel = Array.isArray(manual.equipment_models)
    ? manual.equipment_models[0]
    : manual.equipment_models

  const brandData = Array.isArray(equipmentModel?.brands)
    ? equipmentModel?.brands[0]
    : equipmentModel?.brands

  const brandSlug = slugify(brandData?.name || 'manuals')

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL || 'https://www.2eztek.com'

  const fileName = `${manual.slug}.pdf`

  return NextResponse.redirect(
    `${appUrl}/manuals/${brandSlug}/${fileName}`
  )
}