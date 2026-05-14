import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function slugify(value: string) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

function getPdfFileName(slug: string) {
  return `${slugify(slug)}.pdf`
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const slug = body.slug

    if (!slug) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing slug',
        },
        { status: 400 }
      )
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: manual, error: manualError } = await supabase
      .from('equipment_manuals_v2')
      .select(`
        id,
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

    if (manualError || !manual) {
      return NextResponse.json(
        {
          success: false,
          error: manualError?.message || 'Manual not found',
          slug,
        },
        { status: 404 }
      )
    }

    if (!manual.manual_url) {
      return NextResponse.json(
        {
          success: false,
          error: 'Manual URL missing',
          slug,
        },
        { status: 400 }
      )
    }

    const equipmentModel = Array.isArray(manual.equipment_models)
      ? manual.equipment_models[0]
      : manual.equipment_models

    const brandData = Array.isArray(equipmentModel?.brands)
      ? equipmentModel?.brands[0]
      : equipmentModel?.brands

    const brandSlug = slugify(brandData?.name || 'manuals')
    const fileName = getPdfFileName(manual.slug)
    const storagePath = `mirrored-manuals/${brandSlug}/${fileName}`

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
          error: `Failed to fetch external manual: ${externalResponse.status}`,
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

    const brandedUrl = `https://www.2eztek.com/manuals/${brandSlug}/${fileName}`

    const { error: updateError } = await supabase
      .from('equipment_manuals_v2')
      .update({
        manual_url: publicUrlData.publicUrl,
      })
      .eq('id', manual.id)

    if (updateError) {
      return NextResponse.json(
        {
          success: false,
          error: updateError.message,
          uploaded: true,
          storagePath,
          brandedUrl,
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      slug,
      storagePath,
      supabaseUrl: publicUrlData.publicUrl,
      brandedUrl,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown server error',
      },
      { status: 500 }
    )
  }
}