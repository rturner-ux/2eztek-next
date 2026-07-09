import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAdminRequest } from '@/lib/serverSecurity'

export const runtime = 'nodejs'

function makeSlug(brand: string, model: string, type = 'manual') {
  return `${brand}-${model}-${type}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

export async function POST(req: Request) {
  const unauthorized = requireAdminRequest(req)
  if (unauthorized) return unauthorized

  const { ids, brand } = await req.json()
  if (!ids?.length || !brand) return NextResponse.json({ error: 'ids and brand required' }, { status: 400 })

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Find or create brand row
  const { data: brandRows } = await supabase.from('brands').select('id').ilike('name', brand)
  let brandId: string
  if (brandRows && brandRows.length > 0) {
    brandId = brandRows[0].id
  } else {
    const { data: nb, error: be } = await supabase.from('brands').insert({ name: brand }).select('id').single()
    if (be || !nb) return NextResponse.json({ error: `brand: ${be?.message}` }, { status: 500 })
    brandId = nb.id
  }

  let updated = 0
  let errors = 0

  for (const id of ids) {
    // Get the manual to find its current model
    const { data: manual } = await supabase
      .from('equipment_manuals_v2')
      .select('id, slug, manual_type, model_id, equipment_models(id, model, brand_id)')
      .eq('id', id)
      .maybeSingle()

    if (!manual) { errors++; continue }

    const modelData = Array.isArray((manual as any).equipment_models)
      ? (manual as any).equipment_models[0]
      : (manual as any).equipment_models

    const modelName: string = modelData?.model || manual.slug || 'Manual'

    // Find or create model under the correct brand
    const { data: existingModels } = await supabase
      .from('equipment_models')
      .select('id')
      .eq('brand_id', brandId)
      .ilike('model', modelName)

    let modelId: string
    if (existingModels && existingModels.length > 0) {
      modelId = existingModels[0].id
    } else {
      const { data: nm, error: me } = await supabase
        .from('equipment_models')
        .insert({ model: modelName, brand_id: brandId })
        .select('id')
        .single()
      if (me || !nm) { errors++; continue }
      modelId = nm.id
    }

    const newSlug = makeSlug(brand, modelName, manual.manual_type || 'manual')
    const { error: ue } = await supabase
      .from('equipment_manuals_v2')
      .update({ model_id: modelId, slug: newSlug })
      .eq('id', id)

    if (ue) { errors++ } else { updated++ }
  }

  return NextResponse.json({ success: true, updated, errors })
}
