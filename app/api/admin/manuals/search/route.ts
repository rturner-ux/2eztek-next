import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const q = searchParams.get('q')?.trim() || ''

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
            id,
            name
          ),
          equipment_categories (
            id,
            name
          )
        )
      `)
      .order('created_at', { ascending: false })
      .limit(50)

    if (q) {
      query = query.or(
        `description.ilike.%${q}%,manual_type.ilike.%${q}%,manual_url.ilike.%${q}%,slug.ilike.%${q}%`
      )
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    const manuals = (data || []).map((manual: any) => ({
      id: manual.id,
      manual_url: manual.manual_url,
      manual_type: manual.manual_type,
      description: manual.description,
      slug: manual.slug,
      created_at: manual.created_at,
      model_id: manual.equipment_models?.id || null,
      model: manual.equipment_models?.model || 'Unknown Model',
      brand: manual.equipment_models?.brands?.name || 'Unknown Brand',
      category:
        manual.equipment_models?.equipment_categories?.name ||
        'Fitness Equipment',
    }))

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