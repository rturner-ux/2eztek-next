// app/api/admin/competitor-intel/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAdminRequest } from '@/lib/serverSecurity'

export const runtime = 'nodejs'

export async function GET(req: Request) {
  const unauthorized = requireAdminRequest(req)
  if (unauthorized) return unauthorized

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data, error } = await supabase
    .from('competitor_rankings')
    .select('id, keyword, our_rank, competitor_rank, competitor_domain, checked_at')
    .order('checked_at', { ascending: false })
    .limit(500)

  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, rankings: data || [] })
}
