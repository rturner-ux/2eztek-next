import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

type BrandRecord = {
  name?: string | null
}

type EquipmentModelRecord = {
  brands?: BrandRecord | BrandRecord[] | null
}

function slugify(value: string) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

function isBrandedManualUrl(url: string) {
  return (
    url.includes('2eztek.com/manuals/') &&
    url.toLowerCase().endsWith('.pdf')
  )
}

function isSupabaseMirroredUrl(url: string) {
  return url.includes(
    '/storage/v1/object/public/manuals/mirrored-manuals/'
  )
}

function buildBrandedUrlFromSupabaseUrl(url: string) {
  const marker = '/storage/v1/object/public/manuals/mirrored-manuals/'
  const parts = url.split(marker)

  if (parts.length < 2) {
    return null
  }

  const path = parts[1]
  const [brandSlug, fileName] = path.split('/')

  if (!brandSlug || !fileName) {
    return null
  }

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    'https://www.2eztek.com'

  return `${appUrl}/manuals/${brandSlug}/${fileName}`
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

  const manual = data as {
    slug: string
    manual_url: string | null
    equipment_models?: EquipmentModelRecord | EquipmentModelRecord[] | null
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

  if (isBrandedManualUrl(manualUrl)) {
    return NextResponse.redirect(manualUrl)
  }

  if (isSupabaseMirroredUrl(manualUrl)) {
    const brandedUrl = buildBrandedUrlFromSupabaseUrl(manualUrl)

    if (brandedUrl) {
      return NextResponse.redirect(brandedUrl)
    }
  }

  const equipmentModel = Array.isArray(manual.equipment_models)
    ? manual.equipment_models[0]
    : manual.equipment_models

  const brandData = Array.isArray(equipmentModel?.brands)
    ? equipmentModel?.brands[0]
    : equipmentModel?.brands

  const brandName = brandData?.name || 'manuals'

  const fileName = manualUrl.split('/').pop()

  if (!fileName || !fileName.toLowerCase().endsWith('.pdf')) {
    return NextResponse.json(
      {
        success: false,
        error: 'Invalid manual file',
        slug,
        manual_url: manualUrl,
      },
      { status: 500 }
    )
  }

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    'https://www.2eztek.com'

  return NextResponse.redirect(
    `${appUrl}/manuals/${slugify(brandName)}/${fileName}`
  )
}