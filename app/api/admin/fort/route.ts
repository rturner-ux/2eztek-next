import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

function checkPassword(req: NextRequest) {
  return req.headers.get('x-admin-password') === process.env.ADMIN_BLOG_PASSWORD
}

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function GET(req: NextRequest) {
  if (!checkPassword(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = db()

  const [
    { data: recent },
    { data: stats },
    { count: totalToday },
    { count: critical },
  ] = await Promise.all([
    // Last 100 incidents
    supabase.from('security_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100),

    // Top attacking IPs (aggregated)
    supabase.from('security_log')
      .select('ip, threat_type, severity')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),

    // Total blocked today
    supabase.from('security_log')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),

    // Critical threats today
    supabase.from('security_log')
      .select('*', { count: 'exact', head: true })
      .eq('severity', 'CRITICAL')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),
  ])

  // Build IP threat summary
  const ipMap: Record<string, { count: number; severity: string; types: Set<string> }> = {}
  for (const row of (stats ?? [])) {
    if (!ipMap[row.ip]) ipMap[row.ip] = { count: 0, severity: 'ELEVATED', types: new Set() }
    ipMap[row.ip].count++
    ipMap[row.ip].types.add(row.threat_type)
    if (row.severity === 'CRITICAL') ipMap[row.ip].severity = 'CRITICAL'
    else if (row.severity === 'HIGH' && ipMap[row.ip].severity !== 'CRITICAL') ipMap[row.ip].severity = 'HIGH'
  }
  const topIPs = Object.entries(ipMap)
    .map(([ip, v]) => ({ ip, count: v.count, severity: v.severity, types: [...v.types] }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  // Threat type breakdown
  const typeMap: Record<string, number> = {}
  for (const row of (stats ?? [])) {
    typeMap[row.threat_type] = (typeMap[row.threat_type] || 0) + 1
  }

  return NextResponse.json({
    incidents: recent ?? [],
    topIPs,
    typeBreakdown: typeMap,
    totalToday:   totalToday ?? 0,
    criticalToday: critical ?? 0,
  })
}
