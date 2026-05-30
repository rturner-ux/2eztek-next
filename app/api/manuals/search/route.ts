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
        equipment_models!inner (
          model,
          equipment_categories (
            name
          ),
          brands!inner (
            name,
            logo_url
          )
        )
      `)
      .not('manual_url', 'is', null)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (brand !== 'All') {
      query = query.eq('equipment_models.brands.name', brand)
    }

    if (equipmentType !== 'All') {
      query = query.eq('equipment_models.equipment_categories.name', equipmentType)
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