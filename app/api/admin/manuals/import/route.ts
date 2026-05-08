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

function decodeUrl(value: string) {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

function detectBrand(text: string) {
  const lower = text.toLowerCase()

  const match = knownBrands.find((brand) =>
    lower.includes(brand.toLowerCase())
  )

  return match || ''
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
  const cleanName = name.trim() || 'Commercial Fitness Equipment'

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
  const cleanModelName = model.trim() || 'Unknown Model'

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

    const brandId = await getOrCreateBrand(
      supabase,
      record.brand
    )

    const categoryId = await getOrCreateCategory(
      supabase,
      record.category
    )

    const modelId = await getOrCreateModel(
      supabase,
      brandId,
      categoryId,
      record.model
    )

    await supabase
      .from('equipment_manuals_v2')
      .delete()
      .eq('manual_url', record.manual_url)

    const { error } = await supabase
      .from('equipment_manuals_v2')
      .insert({
        model_id: modelId,
        manual_url: record.manual_url,
        manual_type: record.manual_type || 'Manual',
        description: record.description || null,
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

      const objectRegex =
        /\{[\s\S]*?manualUrl:[\s\S]*?\}/g

      const matches =
        pastedData.match(objectRegex) || []

      const records: ImportRecord[] = matches.map(
        (block: string) => {
          const model =
            block.match(/model:\s*"([^"]+)"/)?.[1] || ''

          const manualUrl =
            block.match(/manualUrl:\s*"([^"]+)"/)?.[1] || ''

          const brand =
            block.match(/brand:\s*"([^"]+)"/)?.[1] || ''

          const lower = model.toLowerCase()

          let category =
            'Commercial Fitness Equipment'

          if (lower.includes('treadmill')) {
            category = 'Treadmill'
          } else if (lower.includes('elliptical')) {
            category = 'Elliptical'
          } else if (lower.includes('bike')) {
            category = 'Bike'
          } else if (lower.includes('rower')) {
            category = 'Rower'
          } else if (lower.includes('gym')) {
            category = 'Home Gym'
          } else if (lower.includes('strength')) {
            category = 'Strength'
          }

          let manualType = 'Manual'

          if (lower.includes('assembly')) {
            manualType = 'Assembly Manual'
          } else if (lower.includes('owner')) {
            manualType = 'Owner Manual'
          } else if (lower.includes('user')) {
            manualType = 'User Manual'
          } else if (lower.includes('service')) {
            manualType = 'Service Manual'
          }

          return {
            title: model,
            brand,
            model: cleanModel(model, brand),
            category,
            manual_type: manualType,
            manual_url: decodeUrl(manualUrl),
            description: `${brand} ${model}`.trim(),
          }
        }
      )

      return NextResponse.json({
        records: dedupeRecords(records),
      })
    }

    if (body.action === 'import') {
      const records = body.records || []

      const imported = await importRecords(records)

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