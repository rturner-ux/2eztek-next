import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const {
      search = '',
      brand = 'All',
      equipmentType = 'All',
      limit = 50,
    } = body

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
        equipment_models (
          model,
          equipment_categories (
            name
          ),
          brands (
            name,
            logo_url
          )
        )
      `)
      .limit(limit)

    if (search.trim()) {
      query = query.or(
        `description.ilike.%${search}%,slug.ilike.%${search}%`
      )
    }

    const { data, error } = await query

    if (error) {
      throw error
    }

    const manuals = (data || [])
      .map((row: any) => {
        const modelData = Array.isArray(row.equipment_models)
          ? row.equipment_models[0]
          : row.equipment_models

        const brandData = Array.isArray(modelData?.brands)
          ? modelData.brands[0]
          : modelData?.brands

        const categoryData = Array.isArray(
          modelData?.equipment_categories
        )
          ? modelData.equipment_categories[0]
          : modelData?.equipment_categories

        return {
          id: row.id,
          slug: row.slug,
          manual_url: row.manual_url,
          manual_type: row.manual_type,
          description: row.description,
          created_at: row.created_at,
          brand: brandData?.name || 'Unknown Brand',
          brand_logo: brandData?.logo_url || '',
          model: modelData?.model || '',
          equipment_type:
            categoryData?.name || 'Fitness Equipment',
        }
      })
      .filter((manual: any) => {
        const brandMatch =
          brand === 'All' ||
          manual.brand === brand

        const typeMatch =
          equipmentType === 'All' ||
          manual.equipment_type === equipmentType

        return brandMatch && typeMatch
      })

    return NextResponse.json({
      success: true,
      manuals,
    })
  } catch (error: any) {
    console.error(error)

    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      {
        status: 500,
      }
    )
  }
}