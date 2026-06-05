import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAdminRequest } from '@/lib/serverSecurity'

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
  try {
    return decodeURIComponent(url.split('?')[0].trim())
  } catch {
    return url.split('?')[0].trim()
  }
}

function detectBrand(text: string) {
  const lower = text.toLowerCase()

  if (lower.includes('horizon')) {
    return 'Horizon Fitness'
  }

  if (lower.includes('vision')) {
    return 'Vision Fitness'
  }

  if (lower.includes('jhtbrand.co') || lower.includes('matrix')) {
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
  if (lower.includes('gym')) return 'Home Gym'

  return 'Commercial Fitness Equipment'
}

function detectManualType(text: string) {
  const lower = text.toLowerCase()

  if (lower.includes('installation')) return 'Installation Manual'
  if (lower.includes('operation')) return 'Operation Manual'
  if (lower.includes('owner')) return 'Owner Manual'
  if (lower.includes('user')) return 'User Manual'
  if (lower.includes('parts')) return 'Parts Manual'
  if (lower.includes('service')) return 'Service Manual'
  if (lower.includes('assembly')) return 'Assembly Manual'

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
    .replace(/\binstallation\b/gi, '')
    .replace(/\boperation\b/gi, '')
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
    const key = `${record.manual_url}|${record.manual_type}|${record.model}`

    if (!record.manual_url) return false
    if (seen.has(key)) return false

    seen.add(key)
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
    decodeURIComponent((cleanUrl.split('/').pop() || '').replace('.pdf', ''))
      .replace(/[-_]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()

  const brand = forcedBrand || detectBrand(`${filename} ${cleanUrl}`)
  const category = detectCategory(filename)
  const manualType = detectManualType(filename)
  const model = cleanModel(filename, brand)

  const record: ImportRecord = {
    title: filename,
    brand,
    model,
    category,
    manual_type: manualType,
    manual_url: cleanUrl,
    description: '',
  }

  record.description = buildDescription(record)

  return record
}

function parseDirectPdfLinks(pastedData: string) {
  const matches = [
    ...pastedData.matchAll(
      /https?:\/\/[^\s"'<>]+\.pdf(?:\?[^\s"'<>]*)?/gi
    ),
  ]

  return matches.map((match) => createRecord(match[0]))
}

function parseHtmlLinks(pastedData: string) {
  const matches = [
    ...pastedData.matchAll(/href=["'](https?:\/\/[^"']+)["']/gi),
  ]

  return matches
    .map((match) => match[1])
    .filter((url) => /\.pdf(?:[?#].*)?$/i.test(url))
    .map((url) => createRecord(url))
}

function toAbsoluteUrl(url: string, baseUrl: string) {
  try {
    return new URL(url, baseUrl).toString()
  } catch {
    return ''
  }
}

function extractAssetUrls(html: string, baseUrl: string) {
  const matches = [
    ...html.matchAll(/(?:src|href)=["']([^"']+)["']/gi),
  ]

  return matches
    .map((match) => toAbsoluteUrl(match[1], baseUrl))
    .filter((url) => url && /\.(?:js|json)(?:[?#].*)?$/i.test(url))
}

function extractSupportPageUrls(pastedData: string) {
  const matches = [
    ...pastedData.matchAll(
      /https?:\/\/(?:www\.)?jhtsupport\.com\/[a-z]{2,3}\/[a-z]{3}\/[^"'\s<>]+\/manuals/gi
    ),
  ]

  return [...new Set(matches.map((match) => match[0]))].slice(0, 3)
}

function parseJsonLikeManualUrls(text: string, forcedBrand?: string) {
  const records: ImportRecord[] = []

  const fieldPatterns = [
    /"(?:cdnUrl|manualUrl|manual_url|url|href)"\s*:\s*"([^"]+?\.pdf(?:\?[^"]*)?)"/gi,
    /'(?:cdnUrl|manualUrl|manual_url|url|href)'\s*:\s*'([^']+?\.pdf(?:\?[^']*)?)'/gi,
  ]

  for (const pattern of fieldPatterns) {
    for (const match of text.matchAll(pattern)) {
      records.push(createRecord(match[1].replace(/\\\//g, '/'), undefined, forcedBrand))
    }
  }

  return records
}

async function fetchText(url: string) {
  const response = await fetch(url, {
    headers: {
      'User-Agent': '2EZTEK manual importer',
    },
  })

  if (!response.ok) return ''

  return response.text()
}

async function parseJohnsonSupportShell(pastedData: string) {
  const pageUrls = extractSupportPageUrls(pastedData)

  if (pageUrls.length === 0 && !pastedData.includes('jhtsupport.com')) {
    return []
  }

  const records: ImportRecord[] = []
  const urlsToScan = new Set<string>()

  records.push(...parseDirectPdfLinks(pastedData))
  records.push(...parseJsonLikeManualUrls(pastedData, 'Horizon Fitness'))

  for (const pageUrl of pageUrls) {
    urlsToScan.add(pageUrl)
  }

  for (const pageUrl of pageUrls) {
    const html = await fetchText(pageUrl)
    if (!html) continue

    records.push(...parseDirectPdfLinks(html))
    records.push(...parseJsonLikeManualUrls(html, 'Horizon Fitness'))

    for (const assetUrl of extractAssetUrls(html, pageUrl)) {
      urlsToScan.add(assetUrl)
    }
  }

  for (const assetUrl of [...urlsToScan].filter((url) => /\.(?:js|json)(?:[?#].*)?$/i.test(url)).slice(0, 12)) {
    const text = await fetchText(assetUrl)
    if (!text) continue

    records.push(...parseDirectPdfLinks(text))
    records.push(...parseJsonLikeManualUrls(text, 'Horizon Fitness'))
  }

  return records
}

function parseProductManualsGraphql(pastedData: string): ImportRecord[] {
  try {
    const parsed = JSON.parse(pastedData)

    const manualGroup =
      parsed?.[0]?.data?.getProductManuals ||
      parsed?.data?.getProductManuals ||
      {}

    const products = [
      ...(manualGroup.frames || []),
      ...(manualGroup.consoles || []),
    ]

    const forcedBrand = detectBrand(pastedData)

    const records: ImportRecord[] = []

    for (const product of products) {
      const displayName = product.displayName || ''
      const model = product.sku || product.model || displayName || 'Unknown Model'
      const manuals = product.manuals || []

      for (const manual of manuals) {
        const cdnUrl = String(
          manual.cdnUrl || manual.mediaUrl || manual.linkAddress || ''
        ).trim()

        if (!cdnUrl) continue

        const manualUrl = cleanManualUrl(cdnUrl)

        const manualType = detectManualType(
          `${manual.mediaType || ''} ${manual.title || ''} ${manual.mediaUrl || ''}`
        )

        const record: ImportRecord = {
          title: `${displayName} ${manual.title || manualType}`.trim(),
          brand: forcedBrand,
          model,
          category: detectCategory(displayName),
          manual_type: manualType,
          manual_url: manualUrl,
          description: '',
        }

        record.description = buildDescription(record)
        records.push(record)
      }
    }

    return records
  } catch {
    return []
  }
}

async function getOrCreateBrand(supabase: any, name: string) {
  const cleanName = name || 'Unknown Brand'

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
  const cleanName = name || 'Commercial Fitness Equipment'

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
  const cleanModelName = model || 'Unknown Model'

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

async function makeUniqueSlug(supabase: any, baseSlug: string) {
  let slug = baseSlug
  let suffix = 2

  while (true) {
    const { data } = await supabase
      .from('equipment_manuals_v2')
      .select('id')
      .eq('slug', slug)
      .maybeSingle()

    if (!data?.id) return slug

    slug = `${baseSlug}-${suffix}`
    suffix++
  }
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

    const baseSlug = slugify(
      `${record.brand} ${record.model} ${record.manual_type}`
    )

    const slug = await makeUniqueSlug(supabase, baseSlug)

    await supabase
      .from('equipment_manuals_v2')
      .delete()
      .eq('manual_url', record.manual_url)
      .eq('manual_type', record.manual_type)

    const { error } = await supabase.from('equipment_manuals_v2').insert({
      model_id: modelId,
      manual_url: record.manual_url,
      manual_type: record.manual_type,
      description: record.description,
      slug,
    })

    if (error) {
      console.error(error)
      continue
    }

    imported++
  }

  return imported
}

export async function POST(req: Request) {
  try {
    const unauthorized = requireAdminRequest(req)
    if (unauthorized) return unauthorized

    const body = await req.json()

    if (body.action === 'parse-pasted') {
      const pastedData = body.pastedData || ''

      const records = dedupeRecords([
        ...parseProductManualsGraphql(pastedData),
        ...(await parseJohnsonSupportShell(pastedData)),
        ...parseHtmlLinks(pastedData),
        ...parseDirectPdfLinks(pastedData),
      ])

      const isClientShell =
        /<om-root-layout|<app-root|main\.js|api\/graphql/i.test(pastedData)

      return NextResponse.json({
        records,
        message:
          records.length > 0
            ? `${records.length} manuals parsed successfully.`
            : isClientShell
              ? 'This paste is a JavaScript app shell, not the manual data itself. I scanned the page assets but did not find direct PDF/manual URLs. Paste the GraphQL/manual API JSON response or direct PDF links from the Network tab.'
              : 'No manuals found. Paste direct PDF links, manufacturer manual JSON, or GraphQL manual data.',
      })
    }

    if (body.action === 'import') {
      const imported = await importRecords(body.records || [])

      return NextResponse.json({ imported })
    }

    return NextResponse.json({ error: 'Invalid action.' }, { status: 400 })
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error.message || 'Import failed.',
      },
      { status: 500 }
    )
  }
}
