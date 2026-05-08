import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params.slug

    const { data: manual, error } = await supabase
      .from('equipment_manuals_v2')
      .select('manual_url, description')
      .eq('slug', slug)
      .single()

    if (error || !manual?.manual_url) {
      return new NextResponse('Manual not found', {
        status: 404,
      })
    }

    const pdfResponse = await fetch(manual.manual_url)

    if (!pdfResponse.ok) {
      return new NextResponse('Failed to load PDF', {
        status: 500,
      })
    }

    const pdfBuffer = await pdfResponse.arrayBuffer()

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${slug}.pdf"`,
        'Cache-Control': 'public, max-age=31536000',
      },
    })
  } catch (error) {
    return new NextResponse('Server error', {
      status: 500,
    })
  }
}