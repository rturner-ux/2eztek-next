import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

type ParsedRecord = {
  title: string
  brand: string
  model: string
  category: string
  manual_type: string
  manual_url: string
  description: string
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function cleanManualUrl(url: string) {
  return String(url || '')
    .replace(/\\/g, '')
    .trim()
}

function detectManualType(text: string) {
  const value = text.toLowerCase()

  if (value.includes('installation')) {
    return 'Installation Manual'
  }

  if (value.includes('operation')) {
    return 'Operation Manual'
  }

  if (value.includes('owner')) {
    return 'Owner Manual'
  }

  if (value.includes('user')) {
    return 'User Manual'
  }

  if (value.includes('parts')) {
    return 'Parts Manual'
  }

  if (value.includes('service')) {
    return 'Service Manual'
  }

  if (value.includes('assembly')) {
    return 'Assembly Manual'
  }

  return 'Manual'
}

function detectBrand(text: string) {
  const lower = text.toLowerCase()

  if (lower.includes('matrix')) return 'Matrix'
  if (lower.includes('vision')) return 'Vision Fitness'
  if (lower.includes('horizon')) return 'Horizon Fitness'

  return 'Unknown Brand'
}

function buildDescription(record: ParsedRecord) {
  return `${record.brand} ${record.model} ${record.category} ${record.manual_type}`
    .replace(/\s+/g, ' ')
    .trim()
}

function uniqueRecords(records: ParsedRecord[]) {
  const seen = new Set<string>()

  return records.filter((record) => {
    if (!record.manual_url) return false

    if (seen.has(record.manual_url)) {
      return false
    }

    seen.add(record.manual_url)

    return true
  })
}

function parseMatrixGraphQL(payload: any) {
  const records: ParsedRecord[] = []

  const frames =
    payload?.data?.getProductManuals?.frames ||
    payload?.getProductManuals?.frames ||
    []

  for (const frame of frames) {
    const frameName =
      frame?.name ||
      frame?.title ||
      ''

    const manuals =
      frame?.manuals || []

    for (const manual of manuals) {
      const cdnUrl = String(
        manual.cdnUrl || ''
      ).trim()

      const mediaUrl = String(
        manual.mediaUrl || ''
      ).trim()

      if (!cdnUrl || !mediaUrl) {
        continue
      }

      const normalizedCdn =
        cdnUrl.endsWith('/')
          ? cdnUrl.slice(0, -1)
          : cdnUrl

      const normalizedMedia =
        mediaUrl.startsWith('/')
          ? mediaUrl
          : `/${mediaUrl}`

      const manualUrl = cleanManualUrl(
        `${normalizedCdn}${normalizedMedia}`
      )

      const filename =
        mediaUrl.split('/').pop() || ''

      const model =
        frameName ||
        filename
          .replace('.pdf', '')
          .replace(/_/g, ' ')
          .replace(/-/g, ' ')

      const brand =
        detectBrand(
          `${frameName} ${filename}`
        )

      const manualType =
        detectManualType(
          `${manual.mediaType || ''} ${
            manual.title || ''
          } ${filename}`
        )

      const category =
        'Fitness Equipment'

      const record: ParsedRecord = {
        title: model,
        brand,
        model,
        category,
        manual_type: manualType,
        manual_url: manualUrl,
        description: '',
      }

      record.description =
        buildDescription(record)

      records.push(record)
    }
  }

  return uniqueRecords(records)
}

function parseDirectPdfLinks(text: string) {
  const records: ParsedRecord[] = []

  const regex =
    /https?:\/\/[^\s"']+\.pdf(?:\?[^\s"']*)?/gi

  const matches = text.match(regex) || []

  for (const url of matches) {
    const cleanUrl =
      cleanManualUrl(url)

    const filename =
      cleanUrl.split('/').pop() || ''

    const model =
      filename
        .replace('.pdf', '')
        .replace(/_/g, ' ')
        .replace(/-/g, ' ')

    const brand =
      detectBrand(filename)

    const manualType =
      detectManualType(filename)

    const record: ParsedRecord = {
      title: model,
      brand,
      model,
      category: 'Fitness Equipment',
      manual_type: manualType,
      manual_url: cleanUrl,
      description: '',
    }

    record.description =
      buildDescription(record)

    records.push(record)
  }

  return uniqueRecords(records)
}

export async function POST(
  request: NextRequest
) {
  try {
    const body =
      await request.json()

    const action =
      body.action || 'parse'

    if (
      action === 'parse-pasted'
    ) {
      const pastedData =
        body.pastedData || ''

      let parsedRecords: ParsedRecord[] =
        []

      try {
        const parsedJson =
          JSON.parse(pastedData)

        parsedRecords =
          parseMatrixGraphQL(
            parsedJson
          )
      } catch {
        parsedRecords =
          parseDirectPdfLinks(
            pastedData
          )
      }

      return NextResponse.json({
        success: true,
        records: parsedRecords,
        count:
          parsedRecords.length,
      })
    }

    if (action === 'import') {
      const records =
        body.records || []

      let imported = 0

      for (const record of records) {
        if (
          !record.manual_url
        ) {
          continue
        }

        const filenamePart =
          record.manual_url
            .split('/')
            .pop()
            ?.replace('.pdf', '') ||
          'manual'

        const slugBase =
          slugify(
            `${record.brand} ${record.model} ${record.manual_type} ${filenamePart}`
          )

        const slug = `${slugBase}-${crypto.randomUUID().replace(/-/g, '').slice(0, 32)}`

        const {
          data: existing,
        } = await supabase
          .from(
            'equipment_manuals_v2'
          )
          .select('id')
          .eq(
            'manual_url',
            record.manual_url
          )
          .maybeSingle()

        if (existing) {
          continue
        }

        const {
          error,
        } = await supabase
          .from(
            'equipment_manuals_v2'
          )
          .insert({
            manual_url:
              record.manual_url,
            manual_type:
              record.manual_type,
            description:
              record.description,
            slug,
          })

        if (!error) {
          imported++
        }
      }

      return NextResponse.json({
        success: true,
        imported,
      })
    }

    return NextResponse.json(
      {
        success: false,
        error:
          'Invalid action.',
      },
      { status: 400 }
    )
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error:
          error.message ||
          'Import failed.',
      },
      { status: 500 }
    )
  }
}