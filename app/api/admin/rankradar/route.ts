import { NextResponse } from 'next/server'
import { db } from '@/lib/rankradar'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const pw = req.headers.get('x-admin-password')
  if (!pw || pw !== process.env.ADMIN_BLOG_PASSWORD) {
    return NextResponse.json({ success: false }, { status: 401 })
  }

  const { data, error } = await db()
    .from('seo_accounts')
    .select('id, access_token, business_name, owner_email, location, industry, plan, subscription_status, onboarded, last_scanned_at, created_at')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  return NextResponse.json({ success: true, accounts: data ?? [] })
}
