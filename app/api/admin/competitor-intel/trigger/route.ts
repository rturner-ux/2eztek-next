import { NextResponse } from 'next/server'
import { requireAdminRequest } from '@/lib/serverSecurity'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  const unauthorized = requireAdminRequest(req)
  if (unauthorized) return unauthorized

  const base = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.2eztek.com'

  const response = await fetch(`${base}/api/cron/competitor-gap`, {
    headers: { Authorization: `Bearer ${process.env.CRON_SECRET}` },
  })

  const data = await response.json()
  return NextResponse.json(data, { status: response.status })
}
