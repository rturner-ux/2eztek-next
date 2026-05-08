import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params

  const { data: manualByManualSlug } = await supabase
    .from('equipment_manuals_v2')
    .select('manual_url, description, slug')
    .eq('slug', slug)
    .maybeSingle()

  let manual = manualByManualSlug

  if (!manual) {
    const { data: model } = await supabase
      .from('equipment_models')
      .select('id, slug')
      .eq('slug', slug)
      .maybeSingle()

    if (model?.id) {
      const { data: manualByModel } = await supabase
        .from('equipment_manuals_v2')
        .select('manual_url, description, slug')
        .eq('model_id', model.id)
        .limit(1)
        .maybeSingle()

      manual = manualByModel
    }
  }

  if (!manual?.manual_url) {
    return NextResponse.json(
      { success: false, error: 'Manual not found', slug },
      { status: 404 }
    )
  }

  const pdfResponse = await fetch(manual.manual_url)

  if (!pdfResponse.ok) {
    return NextResponse.json(
      { success: false, error: 'Failed to load PDF', slug },
      { status: 500 }
    )
  }

  const pdfBuffer = await pdfResponse.arrayBuffer()

  return new NextResponse(pdfBuffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${slug}.pdf"`,
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  })
}