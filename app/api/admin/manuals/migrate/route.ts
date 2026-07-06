import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAdminRequest } from '@/lib/serverSecurity'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

function makeSlug(brand: string, model: string, type = 'manual') {
  return `${brand}-${model}-${type}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

export async function POST(req: Request) {
  try {
    const unauthorized = requireAdminRequest(req)
    if (unauthorized) return unauthorized

    const supabase = getSupabaseAdmin()

    // Fetch everything from the old flat table
    const { data: oldRecords, error: fetchErr } = await supabase
      .from('equipment_manuals')
      .select('*')
      .order('created_at', { ascending: true })

    if (fetchErr) throw fetchErr

    const results = []

    for (const rec of oldRecords || []) {
      const brand     = String(rec.brand || '').trim()
      const model     = String(rec.model || '').trim()
      const equip     = String(rec.equipment_type || 'Fitness Equipment').trim()
      const manUrl    = String(rec.manual_url || '').trim()
      const desc      = String(rec.description || '').trim()
      const manType   = String(rec.manual_type || 'Manual').trim()

      if (!brand || !model || !manUrl) {
        results.push({ id: rec.id, skipped: true, reason: 'missing brand/model/url' })
        continue
      }

      // Check if already migrated (same manual_url in v2)
      const { data: existing } = await supabase
        .from('equipment_manuals_v2')
        .select('id')
        .eq('manual_url', manUrl)
        .maybeSingle()

      if (existing) {
        results.push({ id: rec.id, skipped: true, reason: 'already in v2', brand, model })
        continue
      }

      // Find or create brand
      let brandId: string
      const { data: existingBrand } = await supabase
        .from('brands').select('id').ilike('name', brand).maybeSingle()
      if (existingBrand) {
        brandId = existingBrand.id
      } else {
        const { data: nb, error: be } = await supabase
          .from('brands').insert({ name: brand }).select('id').single()
        if (be || !nb) { results.push({ id: rec.id, error: `brand: ${be?.message}`, brand, model }); continue }
        brandId = nb.id
      }

      // Find or create category
      let categoryId: string
      const { data: existingCat } = await supabase
        .from('equipment_categories').select('id').ilike('name', equip).maybeSingle()
      if (existingCat) {
        categoryId = existingCat.id
      } else {
        const { data: nc, error: ce } = await supabase
          .from('equipment_categories').insert({ name: equip }).select('id').single()
        if (ce || !nc) { results.push({ id: rec.id, error: `category: ${ce?.message}`, brand, model }); continue }
        categoryId = nc.id
      }

      // Find or create model
      let modelId: string
      const { data: existingModel } = await supabase
        .from('equipment_models').select('id').eq('brand_id', brandId).ilike('model', model).maybeSingle()
      if (existingModel) {
        modelId = existingModel.id
      } else {
        const { data: nm, error: me } = await supabase
          .from('equipment_models').insert({ model, brand_id: brandId, category_id: categoryId }).select('id').single()
        if (me || !nm) { results.push({ id: rec.id, error: `model: ${me?.message}`, brand, model }); continue }
        modelId = nm.id
      }

      // Insert into v2
      const slug = makeSlug(brand, model, manType)
      const { error: insErr } = await supabase
        .from('equipment_manuals_v2')
        .insert({ model_id: modelId, manual_url: manUrl, manual_type: manType, description: desc, slug })

      if (insErr) {
        results.push({ id: rec.id, error: `v2 insert: ${insErr.message}`, brand, model })
      } else {
        results.push({ id: rec.id, migrated: true, brand, model })
      }
    }

    const migrated = results.filter((r: any) => r.migrated).length
    const skipped  = results.filter((r: any) => r.skipped).length
    const errors   = results.filter((r: any) => r.error).length

    return NextResponse.json({ success: true, total: oldRecords?.length || 0, migrated, skipped, errors, results })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
