import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'

function clean(value: unknown) {
  return String(value || '').trim()
}

function getOne(value: any) {
  return Array.isArray(value) ? value[0] || null : value || null
}

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const search = clean(body.search)
    const brand = clean(body.brand || 'All')
    const equipmentType = clean(body.equipmentType || 'All')
    const limit = Number(body.limit || 50)

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Resolve brand filter → model IDs (avoids unreliable nested join filter)
    let modelIdFilter: string[] | null = null
    if (brand !== 'All') {
      const { data: brandRows } = await supabase
        .from('brands').select('id').ilike('name', brand)
      const brandIds = (brandRows || []).map((b: any) => b.id)
      if (brandIds.length > 0) {
        const { data: modelRows } = await supabase
          .from('equipment_models').select('id').in('brand_id', brandIds)
        modelIdFilter = (modelRows || []).map((m: any) => m.id)
      } else {
        modelIdFilter = [] // brand not found — return nothing
      }
    }

    // Resolve equipment type filter → model IDs
    let categoryModelIds: string[] | null = null
    if (equipmentType !== 'All') {
      const { data: catRows } = await supabase
        .from('equipment_categories').select('id').ilike('name', equipmentType)
      const catIds = (catRows || []).map((c: any) => c.id)
      if (catIds.length > 0) {
        const { data: modelRows } = await supabase
          .from('equipment_models').select('id').in('category_id', catIds)
        categoryModelIds = (modelRows || []).map((m: any) => m.id)
      } else {
        categoryModelIds = []
      }
    }

    // Intersect model ID filters
    let finalModelIds: string[] | null = null
    if (modelIdFilter !== null && categoryModelIds !== null) {
      const catSet = new Set(categoryModelIds)
      finalModelIds = modelIdFilter.filter((id) => catSet.has(id))
    } else if (modelIdFilter !== null) {
      finalModelIds = modelIdFilter
    } else if (categoryModelIds !== null) {
      finalModelIds = categoryModelIds
    }

    let query = supabase
      .from('equipment_manuals_v2')
      .select(`
        id,
        slug,
        manual_url,
        manual_type,
        description,
        created_at,
        mirrored_path,
        equipment_models (
          model,
          equipment_categories ( name ),
          brands ( name, logo_url )
        )
      `)
      .not('manual_url', 'is', null)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (finalModelIds !== null) {
      if (finalModelIds.length === 0) {
        return NextResponse.json({ success: true, manuals: [] })
      }
      query = query.in('model_id', finalModelIds)
    }

    if (search) {
      query = query.or(
        `slug.ilike.%${search}%,description.ilike.%${search}%`
      )
    }

    const { data, error } = await query

    if (error) throw error

    const manuals = (data || []).map((row: any) => {
      const modelData = getOne(row.equipment_models)
      const brandData = getOne(modelData?.brands)
      const categoryData = getOne(modelData?.equipment_categories)

      return {
        id: row.id,
        slug: row.slug || row.id,
        manual_url: row.manual_url,
        manual_type: row.manual_type || 'Manual',
        description: row.description,
        created_at: row.created_at,
        brand: brandData?.name || 'Unknown Brand',
        brand_logo: brandData?.logo_url || '',
        model: modelData?.model || 'Manual Resource',
        equipment_type: categoryData?.name || 'Fitness Equipment',
      }
    })

    return NextResponse.json({
      success: true,
      manuals,
    })
  } catch (error: any) {
    console.error('MANUAL SEARCH ERROR:', error)

    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Manual search failed.',
      },
      { status: 500 }
    )
  }
}