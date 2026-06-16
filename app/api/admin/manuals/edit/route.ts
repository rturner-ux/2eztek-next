import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAdminRequest } from '@/lib/serverSecurity'

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
}

async function findOrCreate(supabase: ReturnType<typeof getServiceClient>, table: string, field: string, value: string) {
  const { data: existing } = await supabase.from(table).select('id').eq(field, value).maybeSingle()
  if (existing?.id) return existing.id as string
  const { data, error } = await supabase.from(table).insert({ [field]: value }).select('id').single()
  if (error) throw error
  return data.id as string
}

async function makeUniqueSlug(supabase: ReturnType<typeof getServiceClient>, base: string, excludeId?: string) {
  let slug = base
  let n = 2
  while (true) {
    const q = supabase.from('equipment_manuals_v2').select('id').eq('slug', slug)
    if (excludeId) q.neq('id', excludeId)
    const { data } = await q.maybeSingle()
    if (!data?.id) return slug
    slug = `${base}-${n++}`
  }
}

export async function POST(req: Request) {
  try {
    const unauthorized = requireAdminRequest(req)
    if (unauthorized) return unauthorized

    const body = await req.json()
    const supabase = getServiceClient()

    if (body.action === 'update') {
      const { id, brand, model, category, manual_type, description } = body

      if (!id) return NextResponse.json({ error: 'id required.' }, { status: 400 })

      const brandId   = await findOrCreate(supabase, 'brands', 'name', brand || 'Unknown Brand')
      const catId     = await findOrCreate(supabase, 'equipment_categories', 'name', category || 'Fitness Equipment')

      const { data: existingModel } = await supabase
        .from('equipment_models')
        .select('id')
        .eq('brand_id', brandId)
        .eq('model', (model || 'Unknown Model').trim())
        .maybeSingle()

      let modelId: string
      if (existingModel?.id) {
        modelId = existingModel.id
        await supabase.from('equipment_models').update({ category_id: catId }).eq('id', modelId)
      } else {
        const { data: newModel, error } = await supabase
          .from('equipment_models')
          .insert({ brand_id: brandId, category_id: catId, model: (model || 'Unknown Model').trim() })
          .select('id')
          .single()
        if (error) throw error
        modelId = newModel.id
      }

      const baseSlug = slugify(`${brand} ${model} ${manual_type}`)
      const slug = await makeUniqueSlug(supabase, baseSlug, id)

      const { error: updateError } = await supabase
        .from('equipment_manuals_v2')
        .update({ model_id: modelId, manual_type, description, slug })
        .eq('id', id)

      if (updateError) throw updateError

      return NextResponse.json({ success: true })
    }

    if (body.action === 'delete') {
      const { id } = body
      if (!id) return NextResponse.json({ error: 'id required.' }, { status: 400 })
      await supabase.from('equipment_manuals_v2').delete().eq('id', id)
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Invalid action.' }, { status: 400 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed.' }, { status: 500 })
  }
}
