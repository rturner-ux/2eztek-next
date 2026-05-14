import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

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

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const safeBrand = decodeURIComponent(brand)
  const safeFile = decodeURIComponent(file)

  const storagePath = `mirrored-manuals/${safeBrand}/${safeFile}`

  const { data, error } = await supabase.storage
    .from('manuals')
    .download(storagePath)

  if (error || !data) {
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Manual not found',
        storagePath,
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