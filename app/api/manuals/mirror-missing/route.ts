import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function slugify(value: string) {
  return String(value || '')
    .toLowerCase()
    .replace(/&amp;/g, 'and')
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

function isExternalManualUrl(url: string) {
  if (!url) return false

  if (url.includes('2eztek.com/manuals')) return false
  if (url.includes('supabase.co/storage/v1/object/public/manuals')) return false

  return (
    url.includes('fitnesssuperstore.info') ||
    url.includes('assets.jhtbrand.co')
  )
}

function getBrandFromSlug(slug: string) {
  const parts = slug.split('-')

  if (parts.length < 2) {
    return 'manuals'
  }

  const knownTwoWordBrands = [
    'balanced-body',
    'body-solid',
    'expresso-fitness',
    'first-degree',
    'free-motion',
    'french-fitness',
    'hammer-strength',
    'jacobs-ladder',
    'life-fitness',
    'octane-fitness',
    'star-trac',
    'true-fitness',
  ]

  const firstTwo = parts.slice(0, 2).join('-')

  if (knownTwoWordBrands.includes(firstTwo)) {
    return firstTwo
  }

  return parts[0] || 'manuals'
}

function getFileNameFromSlug(slug: string) {
  return `${slugify(slug)}.pdf`
}

async function downloadExternalManual(url: string) {
  const response = await fetch(url, {
    redirect: 'follow',
    headers: {
      accept: 'application/pdf,*/*',
      'user-agent':
        'Mozilla/5.0 (compatible; 2EZTEKManualMirror/1.0; +https://www.2eztek.com)',
    },
  })

  if (!response.ok) {
    throw new Error(`External fetch failed: ${response.status}`)
  }

  const contentType = response.headers.get('content-type') || 'application/pdf'
  const arrayBuffer = await response.arrayBuffer()

  return {
    arrayBuffer,
    contentType,
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const limit = Number(body?.limit || 25)

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { success: false, error: 'Missing Supabase environment variables' },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey)

    const { data: manuals, error: fetchError } = await supabase
        .from('equipment_manuals_v2')
        .select('id, slug, manual_url, mirror_failed')
        .not('manual_url', 'is', null)
        .eq('mirror_failed', false)
        .limit(limit)

    if (fetchError) {
      return NextResponse.json(
        { success: false, error: fetchError.message },
        { status: 500 }
      )
    }

    const candidates =
      manuals?.filter((manual) => isExternalManualUrl(manual.manual_url || '')) || []

    let mirrored = 0
    let skipped = 0
    let failed = 0

    const results: unknown[] = []

    for (const manual of candidates) {
      try {
        if (!manual.slug || !manual.manual_url) {
          skipped += 1
          continue
        }

        const brandSlug = getBrandFromSlug(manual.slug)
        const fileName = getFileNameFromSlug(manual.slug)
        const storagePath = `mirrored-manuals/${brandSlug}/${fileName}`

        const downloaded = await downloadExternalManual(manual.manual_url)

        const { error: uploadError } = await supabase.storage
          .from('manuals')
          .upload(storagePath, downloaded.arrayBuffer, {
            contentType: downloaded.contentType,
            upsert: true,
          })

        if (uploadError) {
          throw new Error(uploadError.message)
        }

        const { data: publicUrlData } = supabase.storage
          .from('manuals')
          .getPublicUrl(storagePath)

        const { error: updateError } = await supabase
          .from('equipment_manuals_v2')
          .update({
            manual_url: publicUrlData.publicUrl,
            mirrored: true,
            mirrored_path: storagePath,
          })
          .eq('id', manual.id)

        if (updateError) {
          throw new Error(updateError.message)
        }

        mirrored += 1

        results.push({
          slug: manual.slug,
          storagePath,
          publicUrl: publicUrlData.publicUrl,
        })
      } catch (error) {
        failed += 1

        results.push({
          slug: manual.slug,
          manual_url: manual.manual_url,
          error: error instanceof Error ? error.message : 'Unknown mirror error',
        })
      }
    }

    return NextResponse.json({
      success: failed === 0,
      checked: manuals?.length || 0,
      candidates: candidates.length,
      mirrored,
      skipped,
      failed,
      results: results.slice(0, 50),
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