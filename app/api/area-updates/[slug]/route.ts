// app/api/area-updates/[slug]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { data, error } = await supabase
      .from('area_updates')
      .select('seasonal_intro, trending_issues, local_tip, updated_at')
      .eq('area_slug', slug)
      .single()

    if (error || !data) {
      return NextResponse.json({ success: false }, { status: 404 })
    }

    return NextResponse.json({ success: true, update: data })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}