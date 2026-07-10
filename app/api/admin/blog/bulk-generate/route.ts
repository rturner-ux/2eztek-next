import { NextRequest, NextResponse } from 'next/server'
import { requireAdminRequest } from '@/lib/serverSecurity'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

const SITE = 'https://www.2eztek.com'

// Generates exactly ONE article for the given brand.
// The client loops and calls this endpoint repeatedly for a series.
export async function POST(req: NextRequest) {
  const unauthorized = requireAdminRequest(req)
  if (unauthorized) return unauthorized

  const { brand } = await req.json()
  if (!brand) return NextResponse.json({ success: false, error: 'brand required' }, { status: 400 })

  try {
    const res = await fetch(`${SITE}/api/cron/auto-blog?brand=${encodeURIComponent(brand)}`, {
      headers: { Authorization: `Bearer ${process.env.CRON_SECRET}` },
    })

    if (!res.ok) {
      const text = await res.text()
      return NextResponse.json({ success: false, error: `auto-blog returned ${res.status}`, detail: text.slice(0, 200) })
    }

    const data = await res.json()

    if (!data.success) {
      return NextResponse.json({ success: false, done: true, message: data.message || data.error || 'No more topics' })
    }

    if (data.published === 0 || !data.post) {
      return NextResponse.json({ success: false, done: true, message: data.message || 'No new topics available for this brand' })
    }

    return NextResponse.json({ success: true, title: data.post.title, slug: data.post.slug })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message })
  }
}
