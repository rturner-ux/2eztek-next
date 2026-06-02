// app/api/faqs/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data, error } = await supabase
      .from('faqs')
      .select('question, answer, category')
      .eq('active', true)
      .order('sort_order', { ascending: true })
      .limit(8)

    if (error) throw error

    return NextResponse.json({
      success: true,
      faqs: data || [],
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to load FAQs.',
      },
      { status: 500 }
    )
  }
}
