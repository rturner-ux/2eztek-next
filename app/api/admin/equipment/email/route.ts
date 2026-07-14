import { NextResponse } from 'next/server'
import { sendAssetTagEmail } from '@/lib/equipment'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function auth(req: Request) {
  const pw = req.headers.get('x-admin-password')
  if (!pw || pw !== process.env.ADMIN_BLOG_PASSWORD) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  }
  return null
}

export async function POST(req: Request) {
  const denied = auth(req)
  if (denied) return denied

  try {
    const body = await req.json()
    const ids: string[] = Array.isArray(body.ids) ? body.ids : []

    const result = await sendAssetTagEmail(ids)
    if (!result.success) {
      return NextResponse.json(result, { status: 400 })
    }

    return NextResponse.json(result)
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 })
  }
}
