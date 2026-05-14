import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const SOURCE_URL = 'https://www.fitnesssuperstore.com/pages/all-manuals'

function slugify(value: string) {
  return String(value || '')
    .toLowerCase()
    .replace(/&amp;/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

function cleanText(value: string) {
  return String(value || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim()
}

function detectBrand(text: string) {
  const brands = [
    'Body-Solid',
    'Bowflex',
    'Cybex',
    'FreeMotion',
    'French Fitness',
    'Hammer Strength',
    'Jacobs Ladder',
    'Life Fitness',
    'Matrix',
    'Monark',
    'Nautilus',
    'Nustep',
    'Octane Fitness',
    'Power Plate',
    'Precor',
    'Schwinn',
    'SciFit',
    'SportsArt',
    'Stairmaster',
    'Star Trac',
    'Technogym',
    'True Fitness',
    'Versaclimber',
    'Woodway',
  ]

  const match = brands.find((brand) =>
    text.toLowerCase().includes(brand.toLowerCase())
  )

  return match || 'Unknown'
}

function detectManualType(text: string) {
  const lower = text.toLowerCase()

  if (lower.includes('assembly')) return 'Assembly Manual'
  if (lower.includes('owner')) return 'Owner Manual'
  if (lower.includes('service')) return 'Service Manual'
  if (lower.includes('parts')) return 'Parts Manual'
  if (lower.includes('guide')) return 'Guide'

  return 'Manual'
}

function extractFileName(url: string) {
  const cleanUrl = url.split('?')[0].replace(/\/$/, '')
  return decodeURIComponent(cleanUrl.split('/').pop() || 'manual.pdf')
}

function normalizeUrl(url: string) {
  if (url.startsWith('//')) return `https:${url}`
  if (url.startsWith('/')) return `https://www.fitnesssuperstore.com${url}`
  return url
}

function extractManualLinks(html: string) {
  const urls = new Set<string>()

  const patterns = [
    /href=["']([^"']+)["']/gi,
    /"([^"]+\.pdf[^"]*)"/gi,
    /'(https?:\/\/[^']+\.pdf[^']*)'/gi,
    /(https?:\/\/assets[^"'\s<>]+)/gi,
    /(https?:\/\/cdn[^"'\s<>]+\.pdf[^"'\s<>]*)/gi,
  ]

  for (const pattern of patterns) {
    let match: RegExpExecArray | null

    while ((match = pattern.exec(html)) !== null) {
      const url = normalizeUrl(match[1] || match[0])

      if (
        url.toLowerCase().includes('.pdf') ||
        url.toLowerCase().includes('assets.jhtbrand.co/files/product')
      ) {
        urls.add(url)
      }
    }
  }

  return Array.from(urls)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const dryRun = body?.dryRun !== false

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { success: false, error: 'Missing Supabase environment variables' },
        { status: 500 }
      )
    }

    const pageResponse = await fetch(SOURCE_URL, {
      headers: {
        accept: 'text/html,*/*',
        'user-agent':
          'Mozilla/5.0 (compatible; 2EZTEKManualImporter/1.0; +https://www.2eztek.com)',
      },
      cache: 'no-store',
    })

    if (!pageResponse.ok) {
      return NextResponse.json(
        {
          success: false,
          error: `Failed to fetch Fitness Superstore page: ${pageResponse.status}`,
        },
        { status: 502 }
      )
    }

    const html = await pageResponse.text()
    const links = extractManualLinks(html)

    const records = links.map((manualUrl) => {
      const fileName = extractFileName(manualUrl)
      const readableName = cleanText(fileName.replace(/\.pdf$/i, '').replace(/[-_]+/g, ' '))
      const brand = detectBrand(readableName)
      const manualType = detectManualType(readableName)
      const slug = slugify(`${brand} ${readableName} ${manualType}`)

      return {
        slug,
        manual_url: manualUrl,
        manual_type: manualType,
        description: `${brand} ${readableName} ${manualType}`,
        source: 'fitnesssuperstore',
      }
    })

    if (dryRun) {
      return NextResponse.json({
        success: true,
        dryRun: true,
        sourceUrl: SOURCE_URL,
        found: records.length,
        records,
      })
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey)

    const { data, error } = await supabase
      .from('equipment_manuals_v2')
      .upsert(records, {
        onConflict: 'slug',
        ignoreDuplicates: false,
      })
      .select('id, slug, manual_url')

    if (error) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          found: records.length,
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      dryRun: false,
      sourceUrl: SOURCE_URL,
      found: records.length,
      imported: data?.length || 0,
      records: data,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown importer error',
      },
      { status: 500 }
    )
  }
}