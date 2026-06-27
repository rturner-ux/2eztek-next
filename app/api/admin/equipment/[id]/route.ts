import { NextResponse } from 'next/server'
import { getEquipmentById } from '@/lib/equipment'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function auth(req: Request) {
  const pw = req.headers.get('x-admin-password')
  if (!pw || pw !== process.env.ADMIN_BLOG_PASSWORD) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  }
  return null
}

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const denied = auth(req)
  if (denied) return denied

  const { id } = await context.params

  try {
    const data = await getEquipmentById(id)
    return NextResponse.json({ success: true, ...data })
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 })
  }
}
