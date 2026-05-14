import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

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
  context: {
    params: Promise<{
      brand: string
      file: string
    }>
  }
) {
  try {
    const { brand, file } = await context.params

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { success: false, error: 'Missing Supabase environment variables' },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey)

    const safeBrand = slugify(decodeURIComponent(brand))
    const safeFile = decodeURIComponent(file)
    const slug = safeFile.replace(/\.pdf$/i, '')
    const storagePath = `mirrored-manuals/${safeBrand}/${safeFile}`

    const { data: existingFile } = await supabase.storage
      .from('manuals')
      .download(storagePath)

    if (existingFile) {
      return servePdf(existingFile, safeFile)
    }

    const { data: manual, error: manualError } = await supabase
      .from('equipment_manuals_v2')
      .select('id, slug, manual_url')
      .eq('slug', slug)
      .maybeSingle()

    if (manualError || !manual?.manual_url) {
      return NextResponse.json(
        {
          success: false,
          error: manualError?.message || 'Manual record not found',
          slug,
          storagePath,
        },
        { status: 404 }
      )
    }

    const storedPath = extractStoragePath(manual.manual_url)

    if (storedPath) {
      const { data: storedFile, error: storedError } = await supabase.storage
        .from('manuals')
        .download(storedPath)

      if (storedFile) {
        return servePdf(storedFile, safeFile)
      }

      return NextResponse.json(
        {
          success: false,
          error: storedError?.message || 'Stored manual file not found',
          slug,
          storedPath,
        },
        { status: 404 }
      )
    }

    const externalResponse = await fetch(manual.manual_url, {
      redirect: 'follow',
      headers: {
        accept: 'application/pdf,*/*',
        'user-agent':
          'Mozilla/5.0 (compatible; 2EZTEKBot/1.0; +https://www.2eztek.com)',
      },
    })

    if (!externalResponse.ok) {
      return NextResponse.json(
        {
          success: false,
          error: `External manual fetch failed: ${externalResponse.status}`,
          sourceUrl: manual.manual_url,
        },
        { status: 502 }
      )
    }

    const contentType =
      externalResponse.headers.get('content-type') || 'application/pdf'

    const arrayBuffer = await externalResponse.arrayBuffer()

    const { error: uploadError } = await supabase.storage
      .from('manuals')
      .upload(storagePath, arrayBuffer, {
        contentType,
        upsert: true,
      })

    if (uploadError) {
      return NextResponse.json(
        {
          success: false,
          error: uploadError.message,
          storagePath,
        },
        { status: 500 }
      )
    }

    const { data: publicUrlData } = supabase.storage
      .from('manuals')
      .getPublicUrl(storagePath)

    await supabase
      .from('equipment_manuals_v2')
      .update({ manual_url: publicUrlData.publicUrl })
      .eq('id', manual.id)

    const { data: finalFile, error: finalError } = await supabase.storage
      .from('manuals')
      .download(storagePath)

    if (!finalFile) {
      return NextResponse.json(
        {
          success: false,
          error: finalError?.message || 'Uploaded file could not be read',
          storagePath,
        },
        { status: 500 }
      )
    }

    return servePdf(finalFile, safeFile)
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown route error',
      },
      { status: 500 }
    )
  }
}