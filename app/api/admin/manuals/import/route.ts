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

function stripHtml(value: string) {
  return value
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim()
}

function decodeUrl(value: string) {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

function absoluteUrl(href: string, sourceUrl: string) {
  return new URL(href, sourceUrl).toString()
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

  return 'Manual'
}

function cleanTitleFromUrl(url: string) {
  const last = url.split('/').pop() || 'Manual'
  return decodeUrl(last)
    .replace(/\?.*$/, '')
    .replace(/\.pdf$/i, '')
    .replace(/[-_]+/g, ' ')
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
    .replace(/\bparts\b/gi, '')
    .replace(/\bdiagram\b/gi, '')
    .replace(/\bexploded\b/gi, '')
    .replace(/\bexplosion\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function makeRecord(title: string, pdfUrl: string, context: string): ImportRecord {
  const combined = `${title} ${context}`
  const brand = detectBrand(combined)
  const category = detectCategory(combined)
  const manualType = detectManualType(combined)
  const model = cleanModel(title, brand)

  return {
    title,
    brand,
    model,
    category,
    manual_type: manualType,
    manual_url: pdfUrl,
    description: `${brand || 'Fitness equipment'} ${model || title} ${manualType}.`.trim(),
  }
}

function extractPdfRecordsFromHtml(html: string, sourceUrl: string): ImportRecord[] {
  const records: ImportRecord[] = []
  const seen = new Set<string>()

  const anchorRegex =
    /<a[^>]+href=["']([^"']*\.pdf(?:\?[^"']*)?)["'][^>]*>([\s\S]*?)<\/a>/gi

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
    const title = anchorText || cleanTitleFromUrl(pdfUrl)

    records.push(makeRecord(title, pdfUrl, rowText))
  }

  return records
}

function extractPdfRecordsFromAnyText(text: string, sourceUrl: string): ImportRecord[] {
  const records: ImportRecord[] = []
  const seen = new Set<string>()

  const pdfRegex =
    /https?:\/\/[^\s"'<>\\]+\.pdf(?:\?[^\s"'<>\\]+)?|\/[^\s"'<>\\]+\.pdf(?:\?[^\s"'<>\\]+)?/gi

  let match: RegExpExecArray | null

  while ((match = pdfRegex.exec(text)) !== null) {
    const raw = match[0]
    const pdfUrl = absoluteUrl(raw, sourceUrl)

    if (seen.has(pdfUrl)) continue
    seen.add(pdfUrl)

    const title = cleanTitleFromUrl(pdfUrl)
    records.push(makeRecord(title, pdfUrl, title))
  }

  return records
}

function extractPdfRecordsFromJson(value: unknown, sourceUrl: string): ImportRecord[] {
  const records: ImportRecord[] = []
  const seen = new Set<string>()

  function walk(node: any, context: string[] = []) {
    if (!node) return

    if (typeof node === 'string') {
      if (node.toLowerCase().includes('.pdf')) {
        const matches = node.match(
          /https?:\/\/[^\s"'<>\\]+\.pdf(?:\?[^\s"'<>\\]+)?|\/[^\s"'<>\\]+\.pdf(?:\?[^\s"'<>\\]+)?/gi
        )

        if (matches) {
          for (const raw of matches) {
            const pdfUrl = absoluteUrl(raw, sourceUrl)
            if (seen.has(pdfUrl)) continue
            seen.add(pdfUrl)

            const title = context.join(' ') || cleanTitleFromUrl(pdfUrl)
            records.push(makeRecord(title, pdfUrl, title))
          }
        }
      }

      return
    }

    if (Array.isArray(node)) {
      node.forEach((item) => walk(item, context))
      return
    }

    if (typeof node === 'object') {
      const possibleTitle =
        node.title ||
        node.name ||
        node.label ||
        node.model ||
        node.product_title ||
        node.productTitle ||
        ''

      const nextContext = possibleTitle
        ? [...context, String(possibleTitle)]
        : context

      Object.values(node).forEach((child) => walk(child, nextContext))
    }
  }

  walk(value)

  return records
}

function dedupeRecords(records: ImportRecord[]) {
  const seen = new Set<string>()

  return records.filter((record) => {
    if (!record.manual_url) return false
    if (seen.has(record.manual_url)) return false
    seen.add(record.manual_url)
    return true
  })
}

async function getOrCreateBrand(supabase: any, name: string) {
  const cleanName = name.trim() || 'Unknown Brand'

  const { data: existing, error: existingError } = await supabase
    .from('brands')
    .select('id')
    .eq('name', cleanName)
    .maybeSingle()

  if (existingError) throw existingError
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

  const { data: existing, error: existingError } = await supabase
    .from('equipment_categories')
    .select('id')
    .eq('name', cleanName)
    .maybeSingle()

  if (existingError) throw existingError
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

  const { data: existing, error: existingError } = await supabase
    .from('equipment_models')
    .select('id')
    .eq('brand_id', brandId)
    .eq('model', cleanModelName)
    .maybeSingle()

  if (existingError) throw existingError
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
          Accept:
            'text/html,application/xhtml+xml,application/xml,application/json,text/plain,*/*',
        },
      })

      if (!response.ok) {
        return NextResponse.json(
          { error: `Failed to fetch source: ${response.status}` },
          { status: 500 }
        )
      }

      const contentType = response.headers.get('content-type') || ''
      const text = await response.text()

      let records: ImportRecord[] = []

      if (contentType.includes('application/json')) {
        try {
          const json = JSON.parse(text)
          records = extractPdfRecordsFromJson(json, sourceUrl)
        } catch {
          records = extractPdfRecordsFromAnyText(text, sourceUrl)
        }
      } else {
        records = [
          ...extractPdfRecordsFromHtml(text, sourceUrl),
          ...extractPdfRecordsFromAnyText(text, sourceUrl),
        ]
      }

      records = dedupeRecords(records)

      return NextResponse.json({
        records,
        count: records.length,
      })
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