import { NextResponse } from 'next/server'
import { getEquipmentList } from '@/lib/equipment'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function auth(req: Request) {
  const pw = req.headers.get('x-admin-password')
  if (!pw || pw !== process.env.ADMIN_BLOG_PASSWORD) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  }
  return null
}

export async function GET(req: Request) {
  const denied = auth(req)
  if (denied) return denied

  try {
    const equipment = await getEquipmentList(200)
    return NextResponse.json({ success: true, equipment })
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 })
  }
}
