import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAdminRequest } from '@/lib/serverSecurity'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const unauthorized = requireAdminRequest(req)
  if (unauthorized) return unauthorized

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const url = new URL(req.url)
  const brand = url.searchParams.get('brand') || ''

  // Step 1: find all brand rows matching the name
  const { data: brandRows, error: brandErr } = await supabase
    .from('brands').select('id, name').ilike('name', `%${brand}%`)
  if (brandErr) return NextResponse.json({ error: brandErr.message }, { status: 500 })

  const brandIds = (brandRows || []).map((b: any) => b.id)

  // Step 2: get all models for those brands
  const { data: modelRows } = await supabase
    .from('equipment_models').select('id, model, brand_id').in('brand_id', brandIds.length ? brandIds : ['__none__'])
  const modelIds = (modelRows || []).map((m: any) => m.id)

  // Step 3: get all v2 manuals for those models
  const { data: manuals } = await supabase
    .from('equipment_manuals_v2')
    .select('id, slug, manual_url, manual_type, model_id, created_at')
    .in('model_id', modelIds.length ? modelIds : ['__none__'])
    .order('created_at', { ascending: false })

  // Build lookup maps
  const modelMap: Record<string, any> = {}
  for (const m of modelRows || []) modelMap[m.id] = m
  const brandMap: Record<string, any> = {}
  for (const b of brandRows || []) brandMap[b.id] = b

  const results = (manuals || []).map((m: any) => {
    const model = modelMap[m.model_id]
    const brand = model ? brandMap[model.brand_id] : null
    return {
      v2_id: m.id,
      slug: m.slug,
      manual_url: m.manual_url,
      manual_type: m.manual_type,
      model: model?.model || '(none)',
      brand: brand?.name || '(none)',
      created_at: m.created_at,
    }
  })

  return NextResponse.json({
    success: true,
    brand_rows: brandRows || [],
    model_count: modelIds.length,
    manual_count: results.length,
    manuals: results,
  })
}
