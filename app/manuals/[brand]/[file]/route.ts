import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

function extractStoragePath(url: string) {
  const marker = '/storage/v1/object/public/manuals/'

  if (!url.includes(marker)) {
    return null
  }

  return decodeURIComponent(url.split(marker)[1] || '')
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
  const { file } = await context.params

  const slug = file.replace('.pdf', '')

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: manual, error: manualError } = await supabase
    .from('equipment_manuals_v2')
    .select('manual_url, slug')
    .eq('slug', slug)
    .maybeSingle()

  if (manualError || !manual?.manual_url) {
    return NextResponse.json(
      {
        success: false,
        error: 'Manual record not found',
        slug,
      },
      { status: 404 }
    )
  }

  const storagePath = extractStoragePath(manual.manual_url)

  if (!storagePath) {
    return NextResponse.json(
      {
        success: false,
        error: 'Invalid storage path',
        slug,
      },
      { status: 404 }
    )
  }

  const { data, error } = await supabase.storage
    .from('manuals')
    .download(storagePath)

  if (error || !data) {
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Object not found',
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
      'Content-Disposition': `inline; filename="${file}"`,
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  })
}