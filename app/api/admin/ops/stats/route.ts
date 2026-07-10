import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAdminRequest } from '@/lib/serverSecurity'

export const dynamic = 'force-dynamic'

const DFW_CITIES: Record<string, { lat: number; lng: number; label: string }> = {
  'dallas':        { lat: 32.7767, lng: -96.7970, label: 'Dallas' },
  'fort worth':    { lat: 32.7555, lng: -97.3308, label: 'Fort Worth' },
  'arlington':     { lat: 32.7357, lng: -97.1081, label: 'Arlington' },
  'plano':         { lat: 33.0198, lng: -96.6989, label: 'Plano' },
  'frisco':        { lat: 33.1584, lng: -96.8236, label: 'Frisco' },
  'mckinney':      { lat: 33.1972, lng: -96.6397, label: 'McKinney' },
  'allen':         { lat: 33.1032, lng: -96.6705, label: 'Allen' },
  'garland':       { lat: 32.9126, lng: -96.6389, label: 'Garland' },
  'irving':        { lat: 32.8140, lng: -96.9489, label: 'Irving' },
  'richardson':    { lat: 32.9483, lng: -96.7299, label: 'Richardson' },
  'carrollton':    { lat: 32.9537, lng: -96.8903, label: 'Carrollton' },
  'denton':        { lat: 33.2148, lng: -97.1331, label: 'Denton' },
  'addison':       { lat: 32.9615, lng: -96.8289, label: 'Addison' },
  'mesquite':      { lat: 32.7668, lng: -96.5992, label: 'Mesquite' },
  'lewisville':    { lat: 33.0462, lng: -96.9942, label: 'Lewisville' },
  'grand prairie': { lat: 32.7459, lng: -97.0089, label: 'Grand Prairie' },
  'euless':        { lat: 32.8371, lng: -97.0794, label: 'Euless' },
  'grapevine':     { lat: 32.9343, lng: -97.0781, label: 'Grapevine' },
  'southlake':     { lat: 32.9415, lng: -97.1322, label: 'Southlake' },
  'keller':        { lat: 32.9343, lng: -97.2294, label: 'Keller' },
  'flower mound':  { lat: 33.0146, lng: -97.0964, label: 'Flower Mound' },
  'rowlett':       { lat: 32.9029, lng: -96.5636, label: 'Rowlett' },
  'rockwall':      { lat: 32.9312, lng: -96.4597, label: 'Rockwall' },
  'cedar hill':    { lat: 32.5882, lng: -96.9561, label: 'Cedar Hill' },
  'desoto':        { lat: 32.5898, lng: -96.8572, label: 'DeSoto' },
  'duncanville':   { lat: 32.6518, lng: -96.9083, label: 'Duncanville' },
  'mansfield':     { lat: 32.5632, lng: -97.1417, label: 'Mansfield' },
  'bedford':       { lat: 32.8443, lng: -97.1431, label: 'Bedford' },
  'hurst':         { lat: 32.8234, lng: -97.1883, label: 'Hurst' },
  'colleyville':   { lat: 32.8887, lng: -97.0800, label: 'Colleyville' },
  'north richland hills': { lat: 32.8343, lng: -97.2289, label: 'N. Richland Hills' },
  'burleson':      { lat: 32.5421, lng: -97.3208, label: 'Burleson' },
  'coppell':       { lat: 32.9543, lng: -97.0150, label: 'Coppell' },
  'the colony':    { lat: 33.0859, lng: -96.8939, label: 'The Colony' },
  'wylie':         { lat: 33.0151, lng: -96.5388, label: 'Wylie' },
  'murphy':        { lat: 33.0151, lng: -96.6108, label: 'Murphy' },
  'sachse':        { lat: 32.9765, lng: -96.5930, label: 'Sachse' },
  'prosper':       { lat: 33.2362, lng: -96.8003, label: 'Prosper' },
  'celina':        { lat: 33.3229, lng: -96.7836, label: 'Celina' },
}

function parseCity(address: string): string | null {
  if (!address) return null
  const lower = address.toLowerCase()
  // Find longest matching city name (to avoid "allen" matching "carrollton")
  let best: string | null = null
  let bestLen = 0
  for (const city of Object.keys(DFW_CITIES)) {
    if (lower.includes(city) && city.length > bestLen) {
      best = city
      bestLen = city.length
    }
  }
  return best
}

export async function GET(req: NextRequest) {
  const unauthorized = requireAdminRequest(req)
  if (unauthorized) return unauthorized

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const now = new Date()
  const todayStr = now.toISOString().split('T')[0]
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()

  const [
    { data: customers },
    { data: todayAppts },
    { data: recentComms },
    { data: weekBlog },
    { data: allBlog },
  ] = await Promise.all([
    supabase.from('new_customers').select('job_status, parts_status, address, created_at, brand_model, equipment_type').order('created_at', { ascending: false }).limit(1000),
    supabase.from('new_customers').select('name, appointment_time, equipment_type, job_status, address').eq('appointment_date', todayStr).order('appointment_time', { ascending: true }),
    supabase.from('customer_comms_log').select('channel, trigger_type, sent_at').order('sent_at', { ascending: false }).limit(20),
    supabase.from('blog_posts').select('id').eq('published', true).gte('created_at', weekAgo),
    supabase.from('blog_posts').select('id').eq('published', true),
  ])

  // Job status counts normalized to display stages
  const raw: Record<string, number> = {}
  for (const c of (customers || [])) {
    const s = (c.job_status || 'new').toLowerCase().trim()
    raw[s] = (raw[s] || 0) + 1
  }

  const stages = {
    new:            (raw['new'] || 0) + (raw['pending'] || 0) + (raw[''] || 0),
    scheduled:      raw['scheduled'] || 0,
    in_progress:    (raw['in_progress'] || 0) + (raw['on_site'] || 0) + (raw['active'] || 0),
    parts_ordered:  (raw['parts_ordered'] || 0) + (raw['parts_delayed'] || 0),
    parts_received: raw['parts_received'] || 0,
    completed:      (raw['completed'] || 0) + (raw['done'] || 0),
    closed:         (raw['closed'] || 0) + (raw['invoiced'] || 0),
  }

  // Monthly volume
  const monthCustomers = (customers || []).filter(c => c.created_at >= monthAgo)

  // Geographic breakdown
  const cityCounts: Record<string, number> = {}
  for (const c of (customers || [])) {
    const city = parseCity(c.address || '')
    if (city) cityCounts[city] = (cityCounts[city] || 0) + 1
  }

  // Build geo data with coordinates
  const geoData = Object.entries(cityCounts)
    .map(([key, count]) => ({
      key,
      label: DFW_CITIES[key]?.label || key,
      lat: DFW_CITIES[key]?.lat || 0,
      lng: DFW_CITIES[key]?.lng || 0,
      count,
    }))
    .filter(d => d.lat !== 0)
    .sort((a, b) => b.count - a.count)

  // Recent comms summary
  const commsByChannel: Record<string, number> = {}
  for (const c of (recentComms || [])) {
    commsByChannel[c.channel] = (commsByChannel[c.channel] || 0) + 1
  }

  return NextResponse.json({
    stages,
    totalActive: Object.values(stages).reduce((a, b) => a + b, 0),
    monthLeads: monthCustomers.length,
    todayAppointments: (todayAppts || []).length,
    todayDetails: (todayAppts || []).slice(0, 6),
    partsInFlight: stages.parts_ordered + stages.parts_received,
    weekBlogPosts: (weekBlog || []).length,
    totalBlogPosts: (allBlog || []).length,
    geoData,
    commsByChannel,
  })
}
