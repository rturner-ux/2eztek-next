import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function getFileName(slug: string) {
  return `${slug}.pdf`
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params

    if (!slug) {
      return new NextResponse('Missing slug', { status: 400 })
    }

    const { data: manual, error } = await supabase
      .from('equipment_manuals_v2')
      .select('manual_url, description, manual_type')
      .eq('slug', slug)
      .single()

    if (error || !manual?.manual_url) {
      return new NextResponse('Manual not found', { status: 404 })
    }

    const pdfResponse = await fetch(manual.manual_url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 2EZ TEK Manual Gateway',
      },
      cache: 'force-cache',
    })

    if (!pdfResponse.ok) {
      return new NextResponse('Failed to load manual PDF', { status: 500 })
    }

    const contentType =
      pdfResponse.headers.get('content-type') || 'application/pdf'

    const pdfBuffer = await pdfResponse.arrayBuffer()

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `inline; filename="${getFileName(slug)}"`,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'X-Robots-Tag': 'index, follow',
      },
    })
  } catch (error) {
    console.error('Manual route error:', error)
    return new NextResponse('Server error', { status: 500 })
  }
}