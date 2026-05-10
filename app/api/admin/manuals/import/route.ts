import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

type ImportRecord = {
  title: string
  brand: string
  model: string
  category: string
  manual_type: string
  manual_url: string
  description: string
}

const knownBrands = [
  'Balanced Body',
  'Biodex',
  'Body Solid',
  'Bowflex',
  'Cybex',
  'Echelon',
  'FreeMotion',
  'Hammer Strength',
  'Inspire Fitness',
  'Keiser',
  'Landice',
  'Life Fitness',
  'Matrix',
  'Muscle D',
  'Nautilus',
  'NordicTrack',
  'Octane Fitness',
  'Peloton',
  'Power Plate',
  'Precor',
  'ProForm',
  'Rogue',
  'Schwinn',
  'SciFit',
  'Sole',
  'SportsArt',
  'Spirit',
  'StairMaster',
  'Star Trac',
  'Technogym',
  'Torque Fitness',
  'True Fitness',
  'VersaClimber',
  'Woodway',
]

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

function cleanManualUrl(url: string) {
  return decodeURIComponent(url.split('?')[0].trim())
}

function detectBrand(text: string) {
  const lower = text.toLowerCase()

  if (
    lower.includes('jhtbrand.co') ||
    lower.includes('matrix')
  ) {
    return 'Matrix'
  }

  const match = knownBrands.find((brand) =>
    lower.includes(brand.toLowerCase())
  )

  return match || 'Unknown Brand'
}

function detectCategory(text: string) {
  const lower = text.toLowerCase()

  if (lower.includes('treadmill')) return 'Treadmill'
  if (lower.includes('elliptical')) return 'Elliptical'
  if (lower.includes('bike')) return 'Bike'
  if (lower.includes('cycle')) return 'Cycle'
  if (lower.includes('rower')) return 'Rower'
  if (lower.includes('bench')) return 'Bench'
  if (lower.includes('rack')) return 'Rack'
  if (lower.includes('trainer')) return 'Functional Trainer'
  if (lower.includes('strength')) return 'Strength'

  return 'Commercial Fitness Equipment'
}

function detectManualType(text: string) {
  const lower = text.toLowerCase()

  if (lower.includes('installation'))
    return 'Installation Manual'

  if (lower.includes('operation'))
    return 'Operation Manual'

  if (lower.includes('owner'))
    return 'Owner Manual'

  if (lower.includes('user'))
    return 'User Manual'

  if (lower.includes('parts'))
    return 'Parts Manual'

  if (lower.includes('service'))
    return 'Service Manual'

  if (lower.includes('assembly'))
    return 'Assembly Manual'

  return 'Manual'
}

function cleanModel(title: string, brand: string) {
  return title
    .replace(new RegExp(brand, 'gi'), '')
    .replace(/\bmanual\b/gi, '')
    .replace(/\bowner\b/gi, '')
    .replace(/\buser\b/gi, '')
    .replace(/\bservice\b/gi, '')
    .replace(/\bassembly\b/gi, '')
    .replace(/\bparts\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function buildDescription(record: ImportRecord) {
  return `${record.brand} ${record.model} ${record.category} ${record.manual_type}`
    .replace(/\s+/g, ' ')
    .trim()
}

function dedupeRecords(records: ImportRecord[]) {
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

function createRecord(
  manualUrl: string,
  titleHint?: string,
  forcedBrand?: string
): ImportRecord {
  const cleanUrl = cleanManualUrl(manualUrl)

  const filename =
    titleHint ||
    decodeURIComponent(
      cleanUrl
        .split('/')
        .pop()
        ?.replace('.pdf', '') || ''
    )
      .replace(/[-_]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()

  const brand =
    forcedBrand ||
    detectBrand(`${filename} ${cleanUrl}`)

  const category = detectCategory(filename)

  const manualType =
    detectManualType(filename)

  const model = cleanModel(
    filename,
    brand
  )

  const record: ImportRecord = {
    title: filename,
    brand,
    model,
    category,
    manual_type: manualType,
    manual_url: cleanUrl,
    description: '',
  }

  record.description =
    buildDescription(record)

  return record
}

function parseDirectPdfLinks(
  pastedData: string
) {
  const matches = [
    ...pastedData.matchAll(
      /https?:\/\/[^\s"'<>]+\.pdf(?:\?[^\s"'<>]*)?/gi
    ),
  ]

  return matches.map((match) =>
    createRecord(match[0])
  )
}

function parseHtmlLinks(
  pastedData: string
) {
  const matches = [
    ...pastedData.matchAll(
      /href=["'](https?:\/\/[^"']+)["']/gi
    ),
  ]

  return matches.map((match) =>
    createRecord(match[1])
  )
}

function parseMatrixGraphql(
  pastedData: string
): ImportRecord[] {
  try {
    const parsed = JSON.parse(pastedData)

    const frames =
      parsed?.[0]?.data?.getProductManuals
        ?.frames ||
      parsed?.data?.getProductManuals
        ?.frames ||
      []

    const records: ImportRecord[] = []

    for (const frame of frames) {
      const displayName =
        frame.displayName || ''

      const model =
        frame.sku ||
        frame.model ||
        displayName

      const manuals =
        frame.manuals || []

      for (const manual of manuals) {
        if (
          !manual.cdnUrl ||
          !manual.mediaUrl
        ) {
          continue
        }

        const manualUrl =
          cleanManualUrl(
            `${manual.cdnUrl}${manual.mediaUrl.replace(
              /^\/+/,
              ''
            )}`
          )

        const record: ImportRecord = {
          title: `${displayName} ${
            manual.title || ''
          }`.trim(),

          brand: 'Matrix',

          model,

          category: detectCategory(
            displayName
          ),

          manual_type:
            detectManualType(
              `${manual.mediaType || ''} ${
                manual.title || ''
              }`
            ),

          manual_url: manualUrl,

          description: '',
        }

        record.description =
          buildDescription(record)

        records.push(record)
      }
    }

    return records
  } catch {
    return []
  }
}

async function getOrCreateBrand(
  supabase: any,
  name: string
) {
  const { data: existing } =
    await supabase
      .from('brands')
      .select('id')
      .eq('name', name)
      .maybeSingle()

  if (existing?.id) {
    return existing.id
  }

  const { data, error } =
    await supabase
      .from('brands')
      .insert({
        name,
      })
      .select('id')
      .single()

  if (error) throw error

  return data.id
}

async function getOrCreateCategory(
  supabase: any,
  name: string
) {
  const { data: existing } =
    await supabase
      .from('equipment_categories')
      .select('id')
      .eq('name', name)
      .maybeSingle()

  if (existing?.id) {
    return existing.id
  }

  const { data, error } =
    await supabase
      .from('equipment_categories')
      .insert({
        name,
      })
      .select('id')
      .single()

  if (error) throw error

  return data.id
}

async function getOrCreateModel(
  supabase: any,
  brandId: string,
  categoryId: string,
  model: string
) {
  const { data: existing } =
    await supabase
      .from('equipment_models')
      .select('id')
      .eq('brand_id', brandId)
      .eq('model', model)
      .maybeSingle()

  if (existing?.id) {
    return existing.id
  }

  const { data, error } =
    await supabase
      .from('equipment_models')
      .insert({
        brand_id: brandId,
        category_id: categoryId,
        model,
      })
      .select('id')
      .single()

  if (error) throw error

  return data.id
}

async function importRecords(
  records: ImportRecord[]
) {
  const supabase = createClient(
    process.env
      .NEXT_PUBLIC_SUPABASE_URL!,
    process.env
      .SUPABASE_SERVICE_ROLE_KEY!
  )

  let imported = 0

  for (const record of records) {
    const slug = slugify(
      `${record.brand} ${record.model} ${record.manual_type}`
    )

    const brandId =
      await getOrCreateBrand(
        supabase,
        record.brand
      )

    const categoryId =
      await getOrCreateCategory(
        supabase,
        record.category
      )

    const modelId =
      await getOrCreateModel(
        supabase,
        brandId,
        categoryId,
        record.model
      )

    await supabase
      .from('equipment_manuals_v2')
      .delete()
      .eq(
        'manual_url',
        record.manual_url
      )

    const { error } = await supabase
      .from('equipment_manuals_v2')
      .insert({
        model_id: modelId,
        manual_url:
          record.manual_url,
        manual_type:
          record.manual_type,
        description:
          record.description,
        slug,
      })

    if (error) {
      throw error
    }

    imported++
  }

  return imported
}

export async function POST(
  req: Request
) {
  try {
    const body = await req.json()

    if (
      body.action === 'parse-pasted'
    ) {
      const pastedData =
        body.pastedData || ''

      const records =
        dedupeRecords([
          ...parseMatrixGraphql(
            pastedData
          ),
          ...parseHtmlLinks(
            pastedData
          ),
          ...parseDirectPdfLinks(
            pastedData
          ),
        ])

      return NextResponse.json({
        records,
      })
    }

    if (body.action === 'import') {
      const imported =
        await importRecords(
          body.records || []
        )

      return NextResponse.json({
        imported,
      })
    }

    return NextResponse.json(
      {
        error: 'Invalid action.',
      },
      {
        status: 400,
      }
    )
  } catch (error: any) {
    return NextResponse.json(
      {
        error:
          error.message ||
          'Import failed.',
      },
      {
        status: 500,
      }
    )
  }
}