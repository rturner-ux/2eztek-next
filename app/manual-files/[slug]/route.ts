import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params

  if (!slug) {
    return NextResponse.json(
      { error: 'Missing manual slug' },
      { status: 400 }
    )
  }

  return NextResponse.json({
    success: true,
    slug,
    message: 'Manual file route is working',
  })
}