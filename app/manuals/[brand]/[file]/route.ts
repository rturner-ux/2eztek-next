import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

function extractStoragePath(url: string) {
  const marker = '/storage/v1/object/public/manuals/'

  if (url.includes(marker)) {
    return decodeURIComponent(url.split(marker)[1] || '')
  }

  const brandedMarker = '/manuals/'

  if (url.includes(brandedMarker)) {
    const brandedPath = decodeURIComponent(url.split(brandedMarker)[1] || '')
    const parts = brandedPath.split('/')

    if (parts.length >= 2) {
      const brand = parts[0]
      const file = parts[parts.length - 1]

      return `mirrored-manuals/${brand}/${file}`
    }
  }

  return null
}

export async function GET(
  request: NextRequest,
  context: {
    params: Promise<{
      brand: string
      file: string
    }>
  }
) {
  const { brand, file } = await context.params

  const safeBrand = decodeURIComponent(brand)
  const safeFile = decodeURIComponent(file)
  const slug = safeFile.replace(/\.pdf$/i, '')

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: manual } = await supabase
    .from('equipment_manuals_v2')
    .select('manual_url, slug')
    .eq('slug', slug)
    .maybeSingle()

  const storagePath =
    manual?.manual_url
      ? extractStoragePath(manual.manual_url) ||
        `mirrored-manuals/${safeBrand}/${safeFile}`
      : `mirrored-manuals/${safeBrand}/${safeFile}`

  const { data, error } = await supabase.storage
    .from('manuals')
    .download(storagePath)

  if (error || !data) {
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Object not found',
        slug,
        storagePath,
        manualUrl: manual?.manual_url || null,
      },
      { status: 404 }
    )
  }

  const arrayBuffer = await data.arrayBuffer()

  return new NextResponse(arrayBuffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${safeFile}"`,
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  })
}