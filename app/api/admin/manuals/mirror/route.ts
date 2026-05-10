import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

type ManualToMirror = {
  id: string
  manual_url: string | null
  original_manual_url: string | null
  manual_type: string | null
  description: string | null
  mirrored_at?: string | null
  equipment_models?: {
    model?: string | null
    brands?: {
      name?: string | null
    } | null
    equipment_categories?: {
      name?: string | null
    } | null
  } | null
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

function isAlreadyMirrored(url: string) {
  return url.includes('/storage/v1/object/public/manuals/')
}

function isExternalUrl(url: string) {
  if (!url) return false
  if (isAlreadyMirrored(url)) return false

  return (
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('files/product/') ||
    url.startsWith('/files/product/')
  )
}

function normalizeSourceUrl(url: string) {
  const clean = String(url || '').trim()

  if (clean.startsWith('http://') || clean.startsWith('https://')) {
    return clean
  }

  if (clean.startsWith('files/product/')) {
    return `https://assets.jhtbrand.co/${clean}`
  }

  if (clean.startsWith('/files/product/')) {
    return `https://assets.jhtbrand.co${clean}`
  }

  return clean
}

function getSourceUrl(manual: ManualToMirror) {
  return normalizeSourceUrl(manual.original_manual_url || manual.manual_url || '')
}

function buildFilePath(manual: ManualToMirror) {
  const brand = manual.equipment_models?.brands?.name || 'unknown-brand'
  const model = manual.equipment_models?.model || 'unknown-model'
  const manualType = manual.manual_type || 'manual'

  const fileName = `${slugify(brand)}-${slugify(model)}-${slugify(
    manualType
  )}-${manual.id}.pdf`

  return `mirrored-manuals/${slugify(brand)}/${fileName}`
}

const manualSelect = `
  id,
  manual_url,
  original_manual_url,
  manual_type,
  description,
  mirrored_at,
  equipment_models (
    model,
    brands (
      name
    ),
    equipment_categories (
      name
    )
  )
`

function normalizeManual(manual: any) {
  const sourceUrl = getSourceUrl(manual)

  return {
    id: manual.id,
    brand: manual.equipment_models?.brands?.name || '',
    model: manual.equipment_models?.model || '',
    equipment_type: manual.equipment_models?.equipment_categories?.name || '',
    manual_type: manual.manual_type || '',
    manual_url: manual.manual_url || '',
    original_manual_url: manual.original_manual_url || '',
    source_url: sourceUrl,
    mirrored_at: manual.mirrored_at || null,
  }
}

async function getPendingManuals(limit: number) {
  const supabase = getSupabaseAdmin()

  const { data, error } = await supabase
    .from('equipment_manuals_v2')
    .select(manualSelect)
    .is('mirrored_at', null)
    .limit(limit)

  if (error) throw error

  return (data || []).filter((manual: any) => {
    const sourceUrl = getSourceUrl(manual)
    return isExternalUrl(sourceUrl)
  }) as ManualToMirror[]
}

async function downloadPdf(sourceUrl: string) {
  const response = await fetch(sourceUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 2EZ TEK Manual Mirror',
      Accept: 'application/pdf,text/html,*/*',
    },
  })

  if (!response.ok) {
    throw new Error(`Download failed ${response.status}`)
  }

  const contentType = response.headers.get('content-type') || ''

  if (contentType.includes('application/pdf') || sourceUrl.toLowerCase().includes('.pdf')) {
    const arrayBuffer = await response.arrayBuffer()
    return Buffer.from(arrayBuffer)
  }

  const text = await response.text()

  const pdfMatch = text.match(/https?:\/\/[^\s"'<>]+\.pdf(?:\?[^\s"'<>]*)?/i)

  if (!pdfMatch) {
    throw new Error(`No PDF found at source URL. Content type: ${contentType}`)
  }

  const pdfResponse = await fetch(pdfMatch[0], {
    headers: {
      'User-Agent': 'Mozilla/5.0 2EZ TEK Manual Mirror',
      Accept: 'application/pdf,*/*',
    },
  })

  if (!pdfResponse.ok) {
    throw new Error(`Resolved PDF download failed ${pdfResponse.status}`)
  }

  const arrayBuffer = await pdfResponse.arrayBuffer()
  return Buffer.from(arrayBuffer)
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const limit = Number(searchParams.get('limit') || 250)

    const manuals = await getPendingManuals(limit)

    return NextResponse.json({
      manuals: manuals.map(normalizeManual),
      count: manuals.length,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to load manuals.' },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const supabase = getSupabaseAdmin()
    const body = await req.json()
    const batchSize = Number(body.batchSize || 5)

    const manualsToMirror = (await getPendingManuals(batchSize * 5)).slice(
      0,
      batchSize
    )

    let mirrored = 0
    let failed = 0
    const errors: string[] = []

    for (const manual of manualsToMirror) {
      try {
        const sourceUrl = getSourceUrl(manual)

        if (!sourceUrl) {
          throw new Error('Missing source URL')
        }

        const buffer = await downloadPdf(sourceUrl)
        const filePath = buildFilePath(manual)

        const { error: uploadError } = await supabase.storage
          .from('manuals')
          .upload(filePath, buffer, {
            contentType: 'application/pdf',
            upsert: true,
          })

        if (uploadError) throw uploadError

        const {
          data: { publicUrl },
        } = supabase.storage.from('manuals').getPublicUrl(filePath)

        const { error: updateError } = await supabase
          .from('equipment_manuals_v2')
          .update({
            original_manual_url: manual.original_manual_url || sourceUrl,
            manual_url: publicUrl,
            mirrored_at: new Date().toISOString(),
          })
          .eq('id', manual.id)

        if (updateError) throw updateError

        mirrored++
      } catch (error: any) {
        failed++
        errors.push(`${manual.id}: ${error.message || 'Unknown mirror error'}`)
      }
    }

    return NextResponse.json({
      mirrored,
      failed,
      attempted: manualsToMirror.length,
      errors,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Mirror failed.' },
      { status: 500 }
    )
  }
}