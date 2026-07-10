import { NextRequest, NextResponse } from 'next/server'
import { requireAdminRequest } from '@/lib/serverSecurity'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 300

const SITE = 'https://www.2eztek.com'

export async function POST(req: NextRequest) {
  const unauthorized = requireAdminRequest(req)
  if (unauthorized) return unauthorized

  const { brand, count } = await req.json()
  if (!brand) return NextResponse.json({ success: false, error: 'brand required' }, { status: 400 })

  const max = Math.min(Math.max(1, Number(count) || 20), 20)
  const results: Array<{ success: boolean; title?: string; message?: string; error?: string }> = []

  for (let i = 0; i < max; i++) {
    try {
      const res = await fetch(`${SITE}/api/cron/auto-blog?brand=${encodeURIComponent(brand)}`, {
        headers: { Authorization: `Bearer ${process.env.CRON_SECRET}` },
      })
      const data = await res.json()

      // Stop if no more topics available for this brand
      if (!data.success || data.published === 0) {
        results.push({ success: false, message: data.message || 'No more topics available' })
        break
      }

      results.push({ success: true, title: data.post?.title || data.title })
    } catch (err: any) {
      results.push({ success: false, error: err.message })
    }

    // Small delay between generations to avoid rate limits
    if (i < max - 1) await new Promise(r => setTimeout(r, 2000))
  }

  const succeeded = results.filter(r => r.success).length
  return NextResponse.json({ success: true, generated: succeeded, results })
}
