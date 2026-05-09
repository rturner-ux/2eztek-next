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
  'Expresso Fitness',
  'First Degree Fitness',
  'FreeMotion',
  'French Fitness',
  'Goalrilla',
  'Green Series',
  'Hammer Strength',
  'Impetus',
  'Inspire Fitness',
  'Jacobs Ladder',
  'Keiser',
  'Landice',
  'Life Fitness',
  'Lifetime',
  'Marcy',
  'Matrix',
  'Monark',
  'Muscle D',
  'Nautilus',
  'NordicTrack',
  'NuStep',
  'Octane Fitness',
  'Paramount Fitness',
  'Peloton',
  'Physiostep',
  'Power Plate',
  'Precor',
  'ProForm',
  'PRX',
  'Rogue',
  'Schwinn',
  'SciFit',
  'Sole',
  'SportsArt',
  'Spirit',
  'StairMaster',
  'Star Trac',
  'Technogym',
  'Theracycle',
  'Torque Fitness',
  'Total Gym',
  'True Fitness',
  'VersaClimber',
  'Weider',
  'Woodway',
]

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

function decodeUrl(value: string) {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

function cleanManualUrl(url: string) {
  return url.split('?')[0].trim()
}

function detectBrand(text: string) {
  const lower = text.toLowerCase()

  const match = knownBrands.find((brand) =>
    lower.includes(brand.toLowerCase())
  )

  return match || 'Unknown Brand'
}

function detectCategory(text: string) {
  const lower = text.toLowerCase()

  if (lower.includes('treadmill')) return 'Treadmill'
  if (lower.includes('elliptical')) return 'Elliptical'
  if (lower.includes('cross trainer')) return 'Cross Trainer'
  if (lower.includes('exercise bike')) return 'Exercise Bike'
  if (lower.includes('bike')) return 'Bike'
  if (lower.includes('rower')) return 'Rower'
  if (lower.includes('bench')) return 'Bench'
  if (lower.includes('rack')) return 'Rack'
  if (lower.includes('trainer')) return 'Functional Trainer'
  if (lower.includes('strength')) return 'Strength'
  if (lower.includes('home gym')) return 'Home Gym'
  if (lower.includes('gym')) return 'Home Gym'

  return 'Commercial Fitness Equipment'
}

function detectManualType(title: string) {
  const lower = title.toLowerCase()

  if (lower.includes('installation')) return 'Installation Manual'
  if (lower.includes('operation')) return 'Operation Manual'
  if (lower.includes('owner')) return 'Owner Manual'
  if (lower.includes('user')) return 'User Manual'
  if (lower.includes('parts')) return 'Parts Manual'
  if (lower.includes('explosion')) return 'Exploded Diagram'
  if (lower.includes('exploded')) return 'Exploded Diagram'
  if (lower.includes('diagram')) return 'Diagram'
  if (lower.includes('service')) return 'Service Manual'
  if (lower.includes('assembly')) return 'Assembly Manual'

  return 'Manual'
}

function cleanModel(title: string, brand: string) {
  return title
    .replace(new RegExp(brand, 'gi'), '')
    .replace(/\buser'?s manual\b/gi, '')
    .replace(/\bowner'?s manual\b/gi, '')
    .replace(/\bmanual\b/gi, '')
    .replace(/\binstallation\b/gi, '')
    .replace(/\boperation\b/gi, '')
    .replace(/\bparts\b/gi, '')
    .replace(/\bdiagram\b/gi, '')
    .replace(/\bexploded\b/gi, '')
    .replace(/\bexplosion\b/gi, '')
    .replace(/\bservice\b/gi, '')
    .replace(/\bassembly\b/gi, '')
    .replace(/\bprint\b/gi, '')
    .replace(/\bweb\b/gi, '')
    .replace(/\bv[0-9]+\b/gi, '')
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

async function getOrCreateBrand(supabase: any, name: string) {
  const cleanName = name.trim() || 'Unknown Brand'

  const { data: existing } = await supabase
    .from('brands')
    .select('id')
    .eq('name', cleanName)
    .maybeSingle()

  if (existing?.id) return existing.id

  const { data, error } = await supabase
    .from('brands')
    .insert({
      name: cleanName,
    })
    .select('id')
    .single()

  if (error) throw error

  return data.id
}

async function getOrCreateCategory(supabase: any, name: string) {
  const cleanName =
    name.trim() || 'Commercial Fitness Equipment'

  const { data: existing } = await supabase
    .from('equipment_categories')
    .select('id')
    .eq('name', cleanName)
    .maybeSingle()

  if (existing?.id) return existing.id

  const { data, error } = await supabase
    .from('equipment_categories')
    .insert({
      name: cleanName,
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
  const cleanModelName =
    model.trim() || 'Unknown Model'

  const { data: existing } = await supabase
    .from('equipment_models')
    .select('id')
    .eq('brand_id', brandId)
    .eq('model', cleanModelName)
    .maybeSingle()

  if (existing?.id) return existing.id

  const { data, error } = await supabase
    .from('equipment_models')
    .insert({
      brand_id: brandId,
      category_id: categoryId,
      model: cleanModelName,
    })
    .select('id')
    .single()

  if (error) throw error

  return data.id
}

async function importRecords(records: ImportRecord[]) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  let imported = 0

  for (const record of records) {
    if (!record.manual_url) continue

    const cleanRecord = {
      ...record,
      manual_url: cleanManualUrl(record.manual_url),
    }

    cleanRecord.description =
      buildDescription(cleanRecord)

    const slug = slugify(
      `${cleanRecord.brand} ${cleanRecord.model} ${cleanRecord.manual_type}`
    )

    const brandId = await getOrCreateBrand(
      supabase,
      cleanRecord.brand
    )

    const categoryId =
      await getOrCreateCategory(
        supabase,
        cleanRecord.category
      )

    const modelId = await getOrCreateModel(
      supabase,
      brandId,
      categoryId,
      cleanRecord.model
    )

    await supabase
      .from('equipment_manuals_v2')
      .delete()
      .eq('manual_url', cleanRecord.manual_url)

    const { error } = await supabase
      .from('equipment_manuals_v2')
      .insert({
        model_id: modelId,
        manual_url: cleanRecord.manual_url,
        manual_type:
          cleanRecord.manual_type || 'Manual',
        description:
          cleanRecord.description || null,
        slug,
      })

    if (error) {
      throw error
    }

    imported++
  }

  return imported
}

export async function POST(req: Request) {
  try {
    const body = await req.json()

    if (body.action === 'parse-pasted') {
      const pastedData = body.pastedData || ''

      const urlMatches = [
        ...pastedData.matchAll(
          /href=["'](https?:\/\/[^"']+)["']/gi
        ),
      ]

      const records: ImportRecord[] =
        urlMatches.map((match) => {
          const manualUrl = cleanManualUrl(
            decodeUrl(match[1])
          )

          const filename = decodeURIComponent(
            manualUrl
              .split('/')
              .pop()
              ?.replace('.pdf', '') || ''
          )
            .replace(/[-_]+/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()

          const brand = detectBrand(
            `${filename} ${manualUrl}`
          )

          const category =
            detectCategory(filename)

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
            manual_url: manualUrl,
            description: '',
          }

          record.description =
            buildDescription(record)

          return record
        })

      return NextResponse.json({
        records: dedupeRecords(records),
      })
    }

    if (body.action === 'import') {
      const records = body.records || []

      const imported =
        await importRecords(records)

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
          error.message || 'Import failed.',
      },
      {
        status: 500,
      }
    )
  }
}