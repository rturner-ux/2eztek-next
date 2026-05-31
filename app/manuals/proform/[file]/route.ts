import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const BRAND = 'proform'

function slugify(value: string) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

function extractStoragePath(url: string) {
  const marker = '/storage/v1/object/public/manuals/'
  if (url.includes(marker)) {
    return decodeURIComponent(url.split(marker)[1] || '')
  }
  return null
}

async function servePdf(fileData: Blob, fileName: string) {
  const arrayBuffer = await fileData.arrayBuffer()
  return new NextResponse(arrayBuffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${fileName}"`,
      'Cache-Control': 'public, max-age=86400',
    },
  })
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ file: string }> }
) {
  try {
    const { file } = await context.params
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const safeFile = decodeURIComponent(file)
    const slug = safeFile.replace(/\.pdf$/i, '')
    const storagePath = `mirrored-manuals/${BRAND}/${safeFile}`

    const { data: existingFile } = await supabase.storage.from('manuals').download(storagePath)
    if (existingFile) return servePdf(existingFile, safeFile)

    const fileBaseName = slugify(safeFile.replace(/\.pdf$/i, ''))

    let { data: manual } = await supabase
      .from('equipment_manuals_v2')
      .select('id, slug, manual_url')
      .eq('slug', slug)
      .maybeSingle()

    if (!manual?.manual_url) {
      const fallback = await supabase
        .from('equipment_manuals_v2')
        .select('id, slug, manual_url')
        .ilike('manual_url', `%/${fileBaseName}.pdf`)
        .maybeSingle()
      manual = fallback.data
    }

    if (!manual?.manual_url) {
      return NextResponse.json({ success: false, error: 'Manual not found', slug }, { status: 404 })
    }

    const storedPath = extractStoragePath(manual.manual_url)

    if (storedPath) {
      const { data: storedFile } = await supabase.storage.from('manuals').download(storedPath)
      if (storedFile) return servePdf(storedFile, safeFile)
      return NextResponse.json({ success: false, error: 'Stored file not found' }, { status: 404 })
    }

    const externalResponse = await fetch(manual.manual_url, {
      redirect: 'follow',
      headers: { accept: 'application/pdf,*/*', 'user-agent': 'Mozilla/5.0 (compatible; 2EZTEKBot/1.0)' },
    })

    if (!externalResponse.ok) {
      return NextResponse.json({ success: false, error: 'External fetch failed' }, { status: 502 })
    }

    const arrayBuffer = await externalResponse.arrayBuffer()
    const contentType = externalResponse.headers.get('content-type') || 'application/pdf'

    await supabase.storage.from('manuals').upload(storagePath, arrayBuffer, { contentType, upsert: true })

    const { data: publicUrlData } = supabase.storage.from('manuals').getPublicUrl(storagePath)
    await supabase.from('equipment_manuals_v2').update({ manual_url: publicUrlData.publicUrl }).eq('id', manual.id)

    const { data: finalFile } = await supabase.storage.from('manuals').download(storagePath)
    if (!finalFile) return NextResponse.json({ success: false, error: 'Upload failed' }, { status: 500 })

    return servePdf(finalFile, safeFile)
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}