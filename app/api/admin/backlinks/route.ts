import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function checkPassword(req: Request) {
  const pw = req.headers.get('x-admin-password')
  return Boolean(pw && pw === process.env.ADMIN_BLOG_PASSWORD)
}

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

const SEED_TARGETS = [
  // Citations
  { name: 'Google Business Profile',  url: 'https://business.google.com',   category: 'citation',      priority: 'high',   notes: 'Most important local citation. Ensure photos, hours, and services are complete.' },
  { name: 'Yelp Business',            url: 'https://biz.yelp.com',           category: 'citation',      priority: 'high',   notes: '' },
  { name: 'Better Business Bureau',   url: 'https://www.bbb.org',            category: 'citation',      priority: 'high',   notes: 'BBB accreditation adds trust signals.' },
  { name: 'Angi (Angie\'s List)',     url: 'https://pro.angi.com',           category: 'citation',      priority: 'high',   notes: '' },
  { name: 'Facebook Business Page',   url: 'https://business.facebook.com',  category: 'citation',      priority: 'high',   notes: '' },
  { name: 'Nextdoor Business',        url: 'https://business.nextdoor.com',  category: 'citation',      priority: 'high',   notes: 'High-intent local audience in DFW neighborhoods.' },
  { name: 'Apple Maps Connect',       url: 'https://mapsconnect.apple.com',  category: 'citation',      priority: 'high',   notes: 'Critical for iPhone users.' },
  { name: 'Bing Places',             url: 'https://www.bingplaces.com',     category: 'citation',      priority: 'medium', notes: '' },
  { name: 'HomeAdvisor',             url: 'https://pro.homeadvisor.com',    category: 'citation',      priority: 'medium', notes: '' },
  { name: 'Houzz Pro',               url: 'https://www.houzz.com/pro',      category: 'citation',      priority: 'low',    notes: '' },
  // Manufacturers
  { name: 'NordicTrack / iFIT Service Provider', url: 'https://www.nordictrack.com', category: 'manufacturer', priority: 'high', notes: 'Contact iFIT (parent of NordicTrack + ProForm) to be listed as authorized DFW service provider. One contact covers both brands.' },
  { name: 'Peloton Repair Partner',  url: 'https://www.onepeloton.com',     category: 'manufacturer',  priority: 'high',   notes: 'Peloton has a local repair partner program. High-value customers with premium equipment.' },
  { name: 'Bowflex / Nautilus',      url: 'https://www.bowflex.com',        category: 'manufacturer',  priority: 'medium', notes: '' },
  { name: 'Life Fitness Dealer',     url: 'https://www.lifefitness.com',    category: 'manufacturer',  priority: 'medium', notes: '' },
  { name: 'Precor Service Network',  url: 'https://www.precor.com',         category: 'manufacturer',  priority: 'medium', notes: '' },
  { name: 'Matrix Fitness',          url: 'https://www.matrixfitness.com',  category: 'manufacturer',  priority: 'low',    notes: '' },
  // Press
  { name: 'Dallas Morning News',     url: 'https://www.dallasnews.com',     category: 'press',         priority: 'high',   notes: 'Pitch a local business spotlight or home gym trend story.' },
  { name: 'CultureMap Dallas',       url: 'https://dallas.culturemap.com',  category: 'press',         priority: 'medium', notes: 'Lifestyle publication, covers local business features.' },
  { name: 'D Magazine Dallas',       url: 'https://www.dmagazine.com',      category: 'press',         priority: 'medium', notes: 'Best of Dallas lists and service business features.' },
  { name: 'Fort Worth Star-Telegram', url: 'https://www.star-telegram.com', category: 'press',         priority: 'low',    notes: '' },
  // Content / Community
  { name: 'Reddit r/homegym Manual Links', url: 'https://reddit.com/r/homegym',  category: 'content', priority: 'high',   notes: 'Drop helpful links to specific manual pages in threads where people ask for them. Organic, not promotional.' },
  { name: 'Reddit r/Fitness',        url: 'https://reddit.com/r/Fitness',   category: 'content',       priority: 'medium', notes: '' },
  { name: 'YouTube Reviewer Outreach', url: '',                             category: 'content',        priority: 'medium', notes: 'Reach out to YouTube reviewers of NordicTrack/Peloton/Bowflex gear to link to your manuals pages in video descriptions.' },
  { name: 'HomeGym Reddit Manual Thread', url: 'https://reddit.com/r/homegym', category: 'content',   priority: 'high',   notes: 'Create a post: "Free PDF manuals for 50+ equipment brands" linking to 2eztek.com/manuals' },
]

export async function GET(req: Request) {
  if (!checkPassword(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('backlink_targets')
    .select('*')
    .order('priority', { ascending: true })
    .order('category', { ascending: true })
    .order('created_at', { ascending: true })
  if (error) return NextResponse.json({ error: error.message, needsSetup: error.code === '42P01' }, { status: 500 })
  return NextResponse.json({ success: true, targets: data || [] })
}

export async function POST(req: Request) {
  if (!checkPassword(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const supabase = getSupabase()

  if (body.seed) {
    const { error } = await supabase.from('backlink_targets').insert(
      SEED_TARGETS.map(t => ({ ...t, status: 'not_started' }))
    )
    if (error) return NextResponse.json({ error: error.message, needsSetup: error.code === '42P01' }, { status: 500 })
    return NextResponse.json({ success: true, count: SEED_TARGETS.length })
  }

  const { name, url, category, priority, notes } = body
  if (!name?.trim()) return NextResponse.json({ error: 'Name is required.' }, { status: 400 })
  const { data, error } = await supabase
    .from('backlink_targets')
    .insert({ name: name.trim(), url: url?.trim() || '', category: category || 'citation', priority: priority || 'medium', notes: notes?.trim() || '', status: 'not_started' })
    .select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, target: data })
}
