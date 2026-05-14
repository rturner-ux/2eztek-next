import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const SOURCE_URL =
  'https://www.fitnesssuperstore.com/pages/all-manuals'

function slugify(value: string) {
  return String(value || '')
    .toLowerCase()
    .replace(/&amp;/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

function detectManualType(text: string) {
  const lower = text.toLowerCase()

  if (lower.includes('assembly')) {
    return 'Assembly Manual'
  }

  if (lower.includes('service')) {
    return 'Service Manual'
  }

  if (lower.includes('owner')) {
    return 'Owner Manual'
  }

  if (lower.includes('parts')) {
    return 'Parts Manual'
  }

  if (lower.includes('guide')) {
    return 'Guide'
  }

  return 'Manual'
}

function normalizeUrl(url: string) {
  if (url.startsWith('//')) {
    return `https:${url}`
  }

  if (url.startsWith('/')) {
    return `https://www.fitnesssuperstore.com${url}`
  }

  return url
}

function extractManualRecordsFromScript(html: string) {
  const records: {
    model: string
    manualUrl: string
    brand: string
    brandUrl: string
    brandLogo: string
  }[] = []

  const objectPattern =
    /model:\s*"([\s\S]*?)"\s*,\s*manualUrl:\s*"([\s\S]*?)"\s*,\s*brand:\s*"([\s\S]*?)"\s*,\s*brandUrl:\s*"([\s\S]*?)"\s*,\s*brandLogo:\s*"([\s\S]*?)"/g

  let match: RegExpExecArray | null

  while ((match = objectPattern.exec(html)) !== null) {
    records.push({
      model: match[1].trim(),
      manualUrl: normalizeUrl(match[2].trim()),
      brand: match[3].trim(),
      brandUrl: normalizeUrl(match[4].trim()),
      brandLogo: normalizeUrl(match[5].trim()),
    })
  }

  return records
}

function extractManualLinks(html: string) {
  const urls = new Set<string>()

  const patterns = [
    /href=["']([^"']+)["']/gi,
    /"(https?:\/\/[^"]+\.pdf[^"]*)"/gi,
    /'(https?:\/\/[^']+\.pdf[^']*)'/gi,
    /(https?:\/\/[^"'\s<>]+\.pdf[^"'\s<>]*)/gi,
  ]

  for (const pattern of patterns) {
    let match: RegExpExecArray | null

    while ((match = pattern.exec(html)) !== null) {
      const url = normalizeUrl(match[1] || match[0])

      if (url.toLowerCase().includes('.pdf')) {
        urls.add(url)
      }
    }
  }

  return Array.from(urls)
}

function extractFileName(url: string) {
  const cleanUrl = url.split('?')[0].replace(/\/$/, '')

  return decodeURIComponent(
    cleanUrl.split('/').pop() || 'manual.pdf'
  )
}

function extractReadableName(url: string) {
  return extractFileName(url)
    .replace(/\.pdf$/i, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function detectBrand(text: string) {
  const brands = [
    'Balanced Body',
    'Biodex',
    'Body-Solid',
    'Bowflex',
    'Cybex',
    'Expresso Fitness',
    'First Degree Fitness',
    'FreeMotion',
    'French Fitness',
    'Hammer Strength',
    'Jacobs Ladder',
    'Life Fitness',
    'Matrix',
    'Nautilus',
    'Octane',
    'Precor',
    'Schwinn',
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))

    const dryRun = body?.dryRun !== false

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing Supabase environment variables',
        },
        { status: 500 }
      )
    }

    const pageResponse = await fetch(SOURCE_URL, {
      headers: {
        accept: 'text/html,*/*',
        'user-agent':
          'Mozilla/5.0 (compatible; 2EZTEKImporter/1.0; +https://www.2eztek.com)',
      },
      cache: 'no-store',
    })

    if (!pageResponse.ok) {
      return NextResponse.json(
        {
          success: false,
          error: `Failed to fetch page: ${pageResponse.status}`,
        },
        { status: 502 }
      )
    }

    const html = await pageResponse.text()

    console.log('HTML LENGTH:', html.length)

    const scriptRecords =
      extractManualRecordsFromScript(html)

    console.log(
      'SCRIPT RECORDS FOUND:',
      scriptRecords.length
    )

    const rawLinkRecords = extractManualLinks(html)

    console.log(
      'RAW PDF LINKS FOUND:',
      rawLinkRecords.length
    )

    const fallbackRecords = rawLinkRecords.map((url) => {
      const readableName = extractReadableName(url)

      return {
        model: readableName,
        manualUrl: url,
        brand: detectBrand(readableName),
        brandUrl: '',
        brandLogo: '',
      }
    })

    const combinedRecords = [
      ...scriptRecords,
      ...fallbackRecords,
    ]

    const uniqueRecords = Array.from(
      new Map(
        combinedRecords.map((item) => [
          item.manualUrl,
          item,
        ])
      ).values()
    )

    const records = uniqueRecords.map((item) => {
      const manualType = detectManualType(item.model)

      return {
        slug: slugify(
          `${item.brand} ${item.model}`
        ),
        manual_url: item.manualUrl,
        manual_type: manualType,
        description: item.model,
        source: 'fitnesssuperstore',
      }
    })

    if (dryRun) {
      return NextResponse.json({
        success: true,
        dryRun: true,
        sourceUrl: SOURCE_URL,
        htmlLength: html.length,
        scriptRecords: scriptRecords.length,
        rawLinks: rawLinkRecords.length,
        finalRecords: records.length,
        sample: records.slice(0, 25),
      })
    }

    const supabase = createClient(
      supabaseUrl,
      serviceRoleKey
    )

    const { data, error } = await supabase
      .from('equipment_manuals_v2')
      .upsert(records, {
        onConflict: 'slug',
        ignoreDuplicates: false,
      })
      .select('id, slug')

    if (error) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          count: records.length,
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      dryRun: false,
      imported: data?.length || 0,
      totalRecords: records.length,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Unknown importer error',
      },
      { status: 500 }
    )
  }
}