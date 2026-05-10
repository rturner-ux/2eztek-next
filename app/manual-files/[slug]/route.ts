import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  const slug = params.slug

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: manualByManualSlug } = await supabase
    .from('equipment_manuals_v2')
    .select('manual_url, description, slug')
    .eq('slug', slug)
    .maybeSingle()

  let manual = manualByManualSlug

  if (!manual) {
    const cleanedSlug = slug
      .replace(/-[a-f0-9]{32}$/i, '')
      .replace(/-manual$/i, '')

    const { data: manualByModel } = await supabase
      .from('equipment_manuals_v2')
      .select('manual_url, description, slug')
      .ilike('slug', `%${cleanedSlug}%`)
      .maybeSingle()

    manual = manualByModel
  }

  if (!manual?.manual_url) {
    return NextResponse.json(
      {
        success: false,
        error: 'Manual not found',
        slug,
      },
      { status: 404 }
    )
  }

  return NextResponse.redirect(manual.manual_url)
}