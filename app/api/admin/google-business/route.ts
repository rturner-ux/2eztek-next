// app/api/admin/google-business/route.ts
// Lists Google Business accounts and locations to find your ACCOUNT_ID and LOCATION_ID
import { NextResponse } from 'next/server'
import { listAccountsAndLocations } from '@/lib/googleBusinessProfile'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const data = await listAccountsAndLocations()
    return NextResponse.json({ success: true, ...data })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
