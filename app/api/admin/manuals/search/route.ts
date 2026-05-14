import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceKey) {
    throw new Error('Missing Supabase environment variables')
  }

  return createClient(supabaseUrl, serviceKey)
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q')?.trim() || ''
    const limit = Number(searchParams.get('limit') || 50)

    const supabase = getSupabaseAdmin()

    let query = supabase
      .from('equipment_manuals_v2')
      .select(`
        id,
        manual_url,
        manual_type,
        description,
        slug,
        created_at,
        equipment_models (
          id,
          model,
          brands (
            name
          ),
          equipment_categories (
            name
          )
        )
      `)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (q) {
      query = query.or(
        `description.ilike.%${q}%,manual_type.ilike.%${q}%,manual_url.ilike.%${q}%,slug.ilike.%${q}%`
      )
    }

    const { data, error } = await query

    if (error) {
      throw error
    }

    const manuals = (data || []).map((manual: any) => {
      const model = Array.isArray(manual.equipment_models)
        ? manual.equipment_models[0]
        : manual.equipment_models

      const brand = Array.isArray(model?.brands)
        ? model.brands[0]
        : model?.brands

      const category = Array.isArray(model?.equipment_categories)
        ? model.equipment_categories[0]
        : model?.equipment_categories

      return {
        id: manual.id,
        manual_url: manual.manual_url,
        manual_type: manual.manual_type,
        description: manual.description,
        slug: manual.slug,
        created_at: manual.created_at,
        model_id: model?.id || null,
        model: model?.model || 'Unknown Model',
        brand: brand?.name || 'Unknown Brand',
        equipment_type: category?.name || 'Fitness Equipment',
      }
    })

    return NextResponse.json({
      success: true,
      manuals,
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Manual search failed.',
      },
      { status: 500 }
    )
  }
}