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
  'French Fitness',
  'Hammer Strength',
  'Keiser',
  'Landice',
  'Life Fitness',
  'Matrix',
  'Nautilus',
  'NordicTrack',
  'Octane Fitness',
  'Peloton',
  'Precor',
  'ProForm',
  'Rogue',
  'Schwinn',
  'Sole',
  'StairMaster',
  'Technogym',
  'True Fitness',
  'Woodway',
]

function stripHtml(value: string) {
  return value
    .replace(/<[^>]*>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim()
}

function cleanModel(title: string, brand: string) {
  return title
    .replace(new RegExp(brand, 'gi'), '')
    .replace(/\buser'?s manual\b/gi, '')
    .replace(/\bowner'?s manual\b/gi, '')
    .replace(/\bmanual\b/gi, '')
    .replace(/\binstallation\b/gi, '')
    .replace(/\boperation\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim()
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
  if (lower.includes('bike')) return 'Bike'
  if (lower.includes('rower')) return 'Rower'
  if (lower.includes('bench')) return 'Bench'
  if (lower.includes('strength')) return 'Strength'
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

  return 'Manual'
}

function absoluteUrl(href: string, sourceUrl: string) {
  return new URL(href, sourceUrl).toString()
}

function extractPdfRecords(html: string, sourceUrl: string): ImportRecord[] {
  const records: ImportRecord[] = []
  const seen = new Set<string>()

  const anchorRegex =
    /<a[^>]+href=["']([^"']*\.pdf[^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi

  let match: RegExpExecArray | null

  while ((match = anchorRegex.exec(html)) !== null) {
    const href = match[1]
    const anchorText = stripHtml(match[2])
    const pdfUrl = absoluteUrl(href, sourceUrl)

    if (seen.has(pdfUrl)) continue
    seen.add(pdfUrl)

    const start = html.lastIndexOf('<tr', match.index)
    const end = html.indexOf('</tr>', match.index)
    const rowHtml =
      start !== -1 && end !== -1 ? html.slice(start, end + 5) : anchorText

    const rowText = stripHtml(rowHtml)

    const brand = detectBrand(rowText) || detectBrand(anchorText)
    const category = detectCategory(anchorText)
    const manualType = detectManualType(anchorText)
    const model = cleanModel(anchorText, brand)

    records.push({
      title: anchorText,
      brand,
      model,
      category,
      manual_type: manualType,
      manual_url: pdfUrl,
      description: `${brand || 'Fitness equipment'} ${model} ${manualType}.`.trim(),
    })
  }

  return records
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
    .insert({ name: cleanName })
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
    .insert({ name: cleanName })
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

    const brandId = await getOrCreateBrand(supabase, record.brand)
    const categoryId = await getOrCreateCategory(supabase, record.category)

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

    const { error } = await supabase.from('equipment_manuals_v2').insert({
      model_id: modelId,
      manual_url: record.manual_url,
      manual_type: record.manual_type || 'Manual',
      description: record.description || null,
    })

    if (error) throw error

    imported++
  }

  return imported
}

export async function POST(req: Request) {
  try {
    const body = await req.json()

    if (body.action === 'scan') {
      const sourceUrl = body.sourceUrl

      if (!sourceUrl) {
        return NextResponse.json(
          { error: 'Source URL is required.' },
          { status: 400 }
        )
      }

      const response = await fetch(sourceUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 SmartGymOps Manual Importer',
        },
      })

      if (!response.ok) {
        return NextResponse.json(
          { error: `Failed to fetch source page: ${response.status}` },
          { status: 500 }
        )
      }

      const html = await response.text()
      const records = extractPdfRecords(html, sourceUrl)

      return NextResponse.json({ records })
    }

    if (body.action === 'import') {
      const records = body.records || []
      const imported = await importRecords(records)

      return NextResponse.json({ imported })
    }

    return NextResponse.json(
      { error: 'Invalid action.' },
      { status: 400 }
    )
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Import failed.' },
      { status: 500 }
    )
  }
}