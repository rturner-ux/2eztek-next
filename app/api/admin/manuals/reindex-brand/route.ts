import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAdminRequest } from '@/lib/serverSecurity'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function makeSlug(brand: string, model: string, type = 'manual') {
  return `${brand}-${model}-${type}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

export async function POST(req: Request) {
  const unauthorized = requireAdminRequest(req)
  if (unauthorized) return unauthorized

  const body = await req.json().catch(() => ({}))
  const targetBrand: string = String(body.brand || '').trim()
  if (!targetBrand) return NextResponse.json({ error: 'brand required' }, { status: 400 })

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Pull all records from old flat table matching this brand
  const { data: oldRecords, error: fetchErr } = await supabase
    .from('equipment_manuals')
    .select('*')
    .ilike('brand', targetBrand)

  if (fetchErr) return NextResponse.json({ error: fetchErr.message }, { status: 500 })

  const found = oldRecords?.length || 0
  const log: string[] = [`Found ${found} records in old table for "${targetBrand}"`]

  // Find or create the canonical brand row
  const { data: brandRows } = await supabase.from('brands').select('id, name').ilike('name', targetBrand)
  let brandId: string

  if (brandRows && brandRows.length > 0) {
    brandId = brandRows[0].id
    log.push(`Brand row found: "${brandRows[0].name}" (id: ${brandId})`)
    if (brandRows.length > 1) log.push(`Warning: ${brandRows.length} duplicate brand rows found - using first`)
  } else {
    const { data: nb, error: be } = await supabase.from('brands').insert({ name: targetBrand }).select('id').single()
    if (be || !nb) return NextResponse.json({ error: `brand create: ${be?.message}` }, { status: 500 })
    brandId = nb.id
    log.push(`Created new brand row (id: ${brandId})`)
  }

  let fixed = 0
  let created = 0
  let errors = 0

  for (const rec of oldRecords || []) {
    const model   = String(rec.model || '').trim()
    const equip   = String(rec.equipment_type || 'Fitness Equipment').trim()
    const manUrl  = String(rec.manual_url || '').trim()
    const desc    = String(rec.description || '').trim()
    const manType = String(rec.manual_type || 'Owner Manual').trim()

    if (!model || !manUrl) {
      log.push(`Skipped record ${rec.id}: missing model or url`)
      continue
    }

    // Find or create category
    const { data: catRows } = await supabase.from('equipment_categories').select('id').ilike('name', equip)
    let categoryId: string
    if (catRows && catRows.length > 0) {
      categoryId = catRows[0].id
    } else {
      const { data: nc, error: ce } = await supabase.from('equipment_categories').insert({ name: equip }).select('id').single()
      if (ce || !nc) { log.push(`Category error for ${model}: ${ce?.message}`); errors++; continue }
      categoryId = nc.id
    }

    // Find or create model under the CORRECT brand
    const { data: modelRows } = await supabase.from('equipment_models').select('id').eq('brand_id', brandId).ilike('model', model)
    let modelId: string
    if (modelRows && modelRows.length > 0) {
      modelId = modelRows[0].id
    } else {
      const { data: nm, error: me } = await supabase.from('equipment_models').insert({ model, brand_id: brandId, category_id: categoryId }).select('id').single()
      if (me || !nm) { log.push(`Model error for ${model}: ${me?.message}`); errors++; continue }
      modelId = nm.id
      log.push(`Created model "${model}" (id: ${modelId})`)
    }

    // Check if v2 record exists for this URL
    const { data: existing } = await supabase
      .from('equipment_manuals_v2')
      .select('id, model_id')
      .eq('manual_url', manUrl)
      .maybeSingle()

    if (existing) {
      if (existing.model_id === modelId) {
        log.push(`"${model}" already correctly linked`)
        continue
      }
      // Update model_id to correct one
      const { error: ue } = await supabase
        .from('equipment_manuals_v2')
        .update({ model_id: modelId })
        .eq('id', existing.id)
      if (ue) { log.push(`Update error for "${model}": ${ue.message}`); errors++; continue }
      log.push(`Fixed link for "${model}"`)
      fixed++
    } else {
      // Insert new v2 record
      const slug = makeSlug(targetBrand, model, manType)
      const { error: ie } = await supabase
        .from('equipment_manuals_v2')
        .insert({ model_id: modelId, manual_url: manUrl, manual_type: manType, description: desc, slug })
      if (ie) { log.push(`Insert error for "${model}": ${ie.message}`); errors++; continue }
      log.push(`Created v2 entry for "${model}"`)
      created++
    }
  }

  return NextResponse.json({ success: true, found, fixed, created, errors, log })
}
