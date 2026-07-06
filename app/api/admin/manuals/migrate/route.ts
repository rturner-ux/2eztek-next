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

export async function GET(req: Request) {
  try {
    const unauthorized = requireAdminRequest(req)
    if (unauthorized) return unauthorized

    const supabase = getSupabaseAdmin()
    const url = new URL(req.url)
    const brandFilter = url.searchParams.get('brand') || ''

    // Find all records in old table matching brand filter
    let oldQuery = supabase.from('equipment_manuals').select('*').order('created_at', { ascending: false })
    if (brandFilter) oldQuery = oldQuery.ilike('brand', `%${brandFilter}%`)

    const { data: oldRecords, error } = await oldQuery.limit(50)
    if (error) throw error

    // For each, check if it exists in v2 and what brand it's linked to
    const diagnostics = []
    for (const rec of oldRecords || []) {
      const { data: v2Match } = await supabase
        .from('equipment_manuals_v2')
        .select(`id, slug, manual_url, equipment_models (model, brands (name))`)
        .eq('manual_url', rec.manual_url)
        .maybeSingle()

      const modelData = Array.isArray((v2Match as any)?.equipment_models) ? (v2Match as any).equipment_models[0] : (v2Match as any)?.equipment_models
      const brandData = Array.isArray(modelData?.brands) ? modelData.brands[0] : modelData?.brands

      diagnostics.push({
        old_id: rec.id,
        old_brand: rec.brand,
        old_model: rec.model,
        manual_url: rec.manual_url,
        in_v2: !!v2Match,
        v2_id: v2Match?.id || null,
        v2_brand: brandData?.name || null,
        v2_model: modelData?.model || null,
      })
    }

    return NextResponse.json({ success: true, count: diagnostics.length, diagnostics })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
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
        // Check if the existing v2 record is linked to the CORRECT brand
        const { data: linkedModel } = await supabase
          .from('equipment_manuals_v2')
          .select(`id, equipment_models ( id, model, brands ( name ) )`)
          .eq('manual_url', manUrl)
          .maybeSingle()

        const modelData = Array.isArray((linkedModel as any)?.equipment_models)
          ? (linkedModel as any).equipment_models[0]
          : (linkedModel as any)?.equipment_models
        const brandData = Array.isArray(modelData?.brands)
          ? modelData.brands[0]
          : modelData?.brands
        const linkedBrand: string = brandData?.name || ''

        if (linkedBrand.toLowerCase() === brand.toLowerCase()) {
          results.push({ id: rec.id, skipped: true, reason: 'already correctly indexed', brand, model })
          continue
        }

        // Wrong brand — find/create correct brand+model and re-link
        let fixBrandId: string
        const { data: fb } = await supabase.from('brands').select('id').ilike('name', brand).maybeSingle()
        if (fb) {
          fixBrandId = fb.id
        } else {
          const { data: nb, error: be } = await supabase.from('brands').insert({ name: brand }).select('id').single()
          if (be || !nb) { results.push({ id: rec.id, error: `brand fix: ${be?.message}`, brand, model }); continue }
          fixBrandId = nb.id
        }

        let fixCatId: string
        const { data: fc } = await supabase.from('equipment_categories').select('id').ilike('name', equip).maybeSingle()
        if (fc) {
          fixCatId = fc.id
        } else {
          const { data: nc, error: ce } = await supabase.from('equipment_categories').insert({ name: equip }).select('id').single()
          if (ce || !nc) { results.push({ id: rec.id, error: `cat fix: ${ce?.message}`, brand, model }); continue }
          fixCatId = nc.id
        }

        let fixModelId: string
        const { data: fm } = await supabase.from('equipment_models').select('id').eq('brand_id', fixBrandId).ilike('model', model).maybeSingle()
        if (fm) {
          fixModelId = fm.id
        } else {
          const { data: nm, error: me } = await supabase.from('equipment_models').insert({ model, brand_id: fixBrandId, category_id: fixCatId }).select('id').single()
          if (me || !nm) { results.push({ id: rec.id, error: `model fix: ${me?.message}`, brand, model }); continue }
          fixModelId = nm.id
        }

        const { error: updateErr } = await supabase
          .from('equipment_manuals_v2')
          .update({ model_id: fixModelId })
          .eq('manual_url', manUrl)

        if (updateErr) {
          results.push({ id: rec.id, error: `relink: ${updateErr.message}`, brand, model })
        } else {
          results.push({ id: rec.id, relinked: true, brand, model, was: linkedBrand })
        }
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

    const migrated  = results.filter((r: any) => r.migrated).length
    const relinked  = results.filter((r: any) => r.relinked).length
    const skipped   = results.filter((r: any) => r.skipped).length
    const errors    = results.filter((r: any) => r.error).length

    return NextResponse.json({ success: true, total: oldRecords?.length || 0, migrated, relinked, skipped, errors, results })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
