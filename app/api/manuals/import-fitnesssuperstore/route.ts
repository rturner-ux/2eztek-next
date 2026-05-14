import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const SOURCE_URL = 'https://www.fitnesssuperstore.com/pages/all-manuals'

function slugify(value: string) {
  return String(value || '')
    .toLowerCase()
    .replace(/&amp;/g, 'and')
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

function decodeHtml(value: string) {
  return String(value || '')
    .replace(/&amp;/g, '&')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&rsquo;/g, "'")
    .replace(/&lsquo;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\\"/g, '"')
    .replace(/\\\//g, '/')
    .replace(/\s+/g, ' ')
    .trim()
}

function normalizeUrl(url: string) {
  const cleaned = decodeHtml(url)

  if (cleaned.startsWith('//')) {
    return `https:${cleaned}`
  }

  if (cleaned.startsWith('/')) {
    return `https://www.fitnesssuperstore.com${cleaned}`
  }

  return cleaned
}

function detectManualType(text: string) {
  const lower = text.toLowerCase()

  if (lower.includes('assembly')) return 'Assembly Manual'
  if (lower.includes('service')) return 'Service Manual'
  if (lower.includes('owner')) return 'Owner Manual'
  if (lower.includes('parts')) return 'Parts Manual'
  if (lower.includes('guide')) return 'Guide'
  if (lower.includes('installation')) return 'Installation Manual'
  if (lower.includes('operation')) return 'Operation Manual'
  if (lower.includes('technical')) return 'Technical Specifications'
  if (lower.includes('video')) return 'Video'

  return 'Manual'
}

function detectBrand(text: string) {
  const brands = [
    'Balanced Body',
    'Biodex',
    'Body-Solid',
    'Body Solid',
    'Bowflex',
    'Cybex',
    'Expresso Fitness',
    'First Degree Fitness',
    'FreeMotion',
    'Freemotion',
    'French Fitness',
    'Hammer Strength',
    'Jacobs Ladder',
    'Life Fitness',
    'Matrix',
    'Monark',
    'Nautilus',
    'NuStep',
    'Octane Fitness',
    'Octane',
    'Precor',
    'Schwinn',
    'SCIFIT',
    'SportsArt',
    'Stairmaster',
    'StairMaster',
    'Star Trac',
    'Technogym',
    'True Fitness',
    'TRUE',
    'Versaclimber',
    'Woodway',
  ]

  const found = brands.find((brand) =>
    text.toLowerCase().includes(brand.toLowerCase())
  )

  if (!found) return 'Unknown'
  if (found === 'Body Solid') return 'Body-Solid'
  if (found === 'Freemotion') return 'FreeMotion'
  if (found === 'StairMaster') return 'Stairmaster'
  if (found === 'TRUE') return 'True Fitness'

  return found
}

function extractFileName(url: string) {
  const cleanUrl = normalizeUrl(url)
    .split('#')[0]
    .split('?')[0]
    .replace(/\/$/, '')

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

function extractManualRecordsFromScript(html: string) {
  const records: {
    model: string
    manualUrl: string
    brand: string
    brandUrl: string
    brandLogo: string
  }[] = []

  const objectPattern =
    /model\s*:\s*["']([\s\S]*?)["']\s*,\s*manualUrl\s*:\s*["']([\s\S]*?)["']\s*,\s*brand\s*:\s*["']([\s\S]*?)["']\s*,\s*brandUrl\s*:\s*["']([\s\S]*?)["']\s*,\s*brandLogo\s*:\s*["']([\s\S]*?)["']/gi

  let match: RegExpExecArray | null

  while ((match = objectPattern.exec(html)) !== null) {
    const model = decodeHtml(match[1])
    const manualUrl = normalizeUrl(match[2])
    const brand = decodeHtml(match[3])
    const brandUrl = normalizeUrl(match[4])
    const brandLogo = normalizeUrl(match[5])

    if (model && manualUrl && brand) {
      records.push({
        model,
        manualUrl,
        brand,
        brandUrl,
        brandLogo,
      })
    }
  }

  return records
}

function extractManualLinks(html: string) {
  const urls = new Set<string>()

  const patterns = [
    /href=["']([^"']+)["']/gi,
    /manualUrl\s*:\s*["']([^"']+)["']/gi,
    /"(https?:\/\/[^"]+\.pdf[^"]*)"/gi,
    /'(https?:\/\/[^']+\.pdf[^']*)'/gi,
    /(https?:\/\/[^"'\s<>]+\.pdf[^"'\s<>]*)/gi,
  ]

  for (const pattern of patterns) {
    let match: RegExpExecArray | null

    while ((match = pattern.exec(html)) !== null) {
      const url = normalizeUrl(match[1] || match[0])

      if (
        url.toLowerCase().includes('.pdf') ||
        url.toLowerCase().includes('youtube.com') ||
        url.toLowerCase().includes('youtu.be')
      ) {
        urls.add(url)
      }
    }
  }

  return Array.from(urls)
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message:
      'Use POST with {"dryRun":true} to preview or {"dryRun":false} to import.',
    endpoint: '/api/manuals/import-fitnesssuperstore',
  })
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
      method: 'GET',
      headers: {
        accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'accept-language': 'en-US,en;q=0.9',
        'cache-control': 'no-cache',
        pragma: 'no-cache',
        'user-agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',
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

    const hasManualsData =
      html.includes('const manualsData')

    const hasManualUrl =
      html.includes('manualUrl')

    const htmlLength = html.length

    const scriptRecords =
      extractManualRecordsFromScript(html)

    const rawLinkRecords =
      extractManualLinks(html)

    const fallbackRecords = rawLinkRecords.map(
      (url) => {
        const readableName =
          extractReadableName(url)

        return {
          model: readableName,
          manualUrl: url,
          brand: detectBrand(readableName),
          brandUrl: '',
          brandLogo: '',
        }
      }
    )

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
      const brand =
        item.brand || detectBrand(item.model)

      const model = item.model

      const manualType =
        detectManualType(model)

      return {
        slug: slugify(`${brand} ${model}`),
        manual_url: item.manualUrl,
        manual_type: manualType,
        description: model,
      }
    })

    if (dryRun) {
      return NextResponse.json({
        success: true,
        dryRun: true,
        sourceUrl: SOURCE_URL,
        htmlLength,
        hasManualsData,
        hasManualUrl,
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

    let imported = 0
    let skipped = 0
    let failed = 0

    const errors: unknown[] = []

    for (const record of records) {
      const { error } = await supabase
        .from('equipment_manuals_v2')
        .insert(record)

      if (!error) {
        imported += 1
        continue
      }

      const isDuplicate =
        error.code === '23505' ||
        error.message
          .toLowerCase()
          .includes('duplicate key')

      if (isDuplicate) {
        skipped += 1
        continue
      }

      failed += 1

      errors.push({
        slug: record.slug,
        manual_url: record.manual_url,
        error: error.message,
      })
    }

    return NextResponse.json({
      success: failed === 0,
      totalRecords: records.length,
      imported,
      skipped,
      failed,
      errors: errors.slice(0, 25),
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