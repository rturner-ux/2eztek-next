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

function isExternalUrl(url: string) {
  return (
    url.includes('fitnesssuperstore.info') ||
    url.includes('fitnesssuperstore.com') ||
    url.startsWith('http://')
  )
}

function getSourceUrl(manual: ManualToMirror) {
  return manual.original_manual_url || manual.manual_url || ''
}

function buildFilePath(manual: ManualToMirror) {
  const brand = manual.equipment_models?.brands?.name || 'unknown-brand'
  const model = manual.equipment_models?.model || 'unknown-model'
  const manualType = manual.manual_type || 'manual'

  const fileName = `${slugify(brand)}-${slugify(model)}-${slugify(
    manualType
  )}.pdf`

  return `mirrored-manuals/${slugify(brand)}/${fileName}`
}

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
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

export async function GET(req: Request) {
  try {
    const supabase = getSupabaseAdmin()
    const { searchParams } = new URL(req.url)
    const limit = Number(searchParams.get('limit') || 250)

    const { data, error } = await supabase
      .from('equipment_manuals_v2')
      .select(manualSelect)
      .or(
        'manual_url.ilike.%fitnesssuperstore%,original_manual_url.ilike.%fitnesssuperstore%'
      )
      .limit(limit)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const manuals = (data || []).filter((manual: any) =>
      isExternalUrl(getSourceUrl(manual))
    )

    const normalized = manuals.map((manual: any) => ({
      id: manual.id,
      brand: manual.equipment_models?.brands?.name || '',
      model: manual.equipment_models?.model || '',
      equipment_type:
        manual.equipment_models?.equipment_categories?.name || '',
      manual_type: manual.manual_type || '',
      manual_url: manual.manual_url || '',
      original_manual_url: manual.original_manual_url || '',
      mirrored_at: manual.mirrored_at || null,
    }))

    return NextResponse.json({
      manuals: normalized,
      count: normalized.length,
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
    const batchSize = Number(body.batchSize || 10)

    const { data, error } = await supabase
      .from('equipment_manuals_v2')
      .select(manualSelect)
      .or(
        'manual_url.ilike.%fitnesssuperstore%,original_manual_url.ilike.%fitnesssuperstore%'
      )
      .limit(batchSize * 5)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const manualsToMirror = (data || [])
      .filter((manual: any) => {
        const sourceUrl = getSourceUrl(manual)
        return isExternalUrl(sourceUrl)
      })
      .slice(0, batchSize)

    let mirrored = 0
    let failed = 0
    const errors: string[] = []

    for (const manual of manualsToMirror as ManualToMirror[]) {
      try {
        const sourceUrl = getSourceUrl(manual)

        if (!sourceUrl) {
          throw new Error('Missing source URL')
        }

        const response = await fetch(sourceUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 2EZ TEK Manual Mirror',
            Accept: 'application/pdf,*/*',
          },
        })

        if (!response.ok) {
          throw new Error(`Download failed ${response.status}`)
        }

        const contentType = response.headers.get('content-type') || ''

        if (
          !contentType.includes('application/pdf') &&
          !sourceUrl.toLowerCase().includes('.pdf')
        ) {
          throw new Error(`Source did not return a PDF: ${contentType}`)
        }

        const arrayBuffer = await response.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        const filePath = buildFilePath(manual)

        const { error: uploadError } = await supabase.storage
          .from('manuals')
          .upload(filePath, buffer, {
            contentType: 'application/pdf',
            upsert: true,
          })

        if (uploadError) {
          throw uploadError
        }

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

        if (updateError) {
          throw updateError
        }

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