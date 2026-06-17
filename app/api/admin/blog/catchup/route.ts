import { NextRequest, NextResponse } from 'next/server'
import { requireAdminRequest } from '@/lib/serverSecurity'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 300

const SITE = 'https://www.2eztek.com'

export async function POST(req: NextRequest) {
  const unauthorized = requireAdminRequest(req)
  if (unauthorized) return unauthorized

  const { count = 1 } = await req.json()
  const n = Math.min(Math.max(1, Number(count)), 10)

  const results: Array<{ success: boolean; title?: string; error?: string }> = []

  for (let i = 0; i < n; i++) {
    try {
      const res = await fetch(`${SITE}/api/cron/auto-blog`, {
        headers: { Authorization: `Bearer ${process.env.CRON_SECRET}` },
      })
      const data = await res.json()
      results.push({ success: data.success, title: data.post?.title || data.title, error: data.error })
    } catch (err: any) {
      results.push({ success: false, error: err.message })
    }
    if (i < n - 1) await new Promise((r) => setTimeout(r, 3000))
  }

  return NextResponse.json({ success: true, results })
}
