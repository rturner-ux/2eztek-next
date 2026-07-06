import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAdminRequest } from '@/lib/serverSecurity'

export const runtime = 'nodejs'

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

function makeSlug(brand: string, model: string) {
  return `${brand}-${model}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

export async function POST(req: Request) {
  try {
    const unauthorized = requireAdminRequest(req)
    if (unauthorized) return unauthorized

    const formData = await req.formData()
    const brand         = String(formData.get('brand') || '').trim()
    const model         = String(formData.get('model') || '').trim()
    const equipment_type = String(formData.get('equipment_type') || 'Fitness Equipment').trim()
    const description   = String(formData.get('description') || '').trim()
    const manual_type   = String(formData.get('manual_type') || 'Manual').trim()
    const file          = formData.get('file') as File | null

    if (!file)  return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 })
    if (!brand) return NextResponse.json({ error: 'Brand is required.' }, { status: 400 })
    if (!model) return NextResponse.json({ error: 'Model is required.' }, { status: 400 })

    const supabase = getSupabaseAdmin()

    // 1. Upload PDF to storage
    const safeFileName = `${makeSlug(brand, model)}.pdf`
    const filePath = `manuals/${safeFileName}`
    const bytes = await file.arrayBuffer()

    const { error: uploadError } = await supabase.storage
      .from('manuals')
      .upload(filePath, Buffer.from(bytes), {
        contentType: 'application/pdf',
        upsert: true,
      })

    if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 })

    const { data: { publicUrl } } = supabase.storage.from('manuals').getPublicUrl(filePath)

    // 2. Find or create brand
    const { data: existingBrand } = await supabase
      .from('brands')
      .select('id')
      .ilike('name', brand)
      .single()

    let brandId: string
    if (existingBrand) {
      brandId = existingBrand.id
    } else {
      const { data: newBrand, error: brandErr } = await supabase
        .from('brands')
        .insert({ name: brand })
        .select('id')
        .single()
      if (brandErr || !newBrand) return NextResponse.json({ error: `Brand insert failed: ${brandErr?.message}` }, { status: 500 })
      brandId = newBrand.id
    }

    // 3. Find or create equipment category
    const { data: existingCat } = await supabase
      .from('equipment_categories')
      .select('id')
      .ilike('name', equipment_type)
      .single()

    let categoryId: string
    if (existingCat) {
      categoryId = existingCat.id
    } else {
      const { data: newCat, error: catErr } = await supabase
        .from('equipment_categories')
        .insert({ name: equipment_type })
        .select('id')
        .single()
      if (catErr || !newCat) return NextResponse.json({ error: `Category insert failed: ${catErr?.message}` }, { status: 500 })
      categoryId = newCat.id
    }

    // 4. Find or create equipment model
    const { data: existingModel } = await supabase
      .from('equipment_models')
      .select('id')
      .eq('brand_id', brandId)
      .ilike('model', model)
      .single()

    let modelId: string
    if (existingModel) {
      modelId = existingModel.id
    } else {
      const { data: newModel, error: modelErr } = await supabase
        .from('equipment_models')
        .insert({ model, brand_id: brandId, category_id: categoryId })
        .select('id')
        .single()
      if (modelErr || !newModel) return NextResponse.json({ error: `Model insert failed: ${modelErr?.message}` }, { status: 500 })
      modelId = newModel.id
    }

    // 5. Insert into equipment_manuals_v2
    const slug = `${makeSlug(brand, model)}-${manual_type.toLowerCase().replace(/\s+/g, '-')}`
    const { data: manual, error: manualErr } = await supabase
      .from('equipment_manuals_v2')
      .insert({
        model_id: modelId,
        manual_url: publicUrl,
        manual_type,
        description,
        slug,
      })
      .select('id, slug')
      .single()

    if (manualErr) return NextResponse.json({ error: `Manual insert failed: ${manualErr.message}` }, { status: 500 })

    return NextResponse.json({
      success: true,
      manual_url: publicUrl,
      slug: manual.slug,
      id: manual.id,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Upload failed.' }, { status: 500 })
  }
}
