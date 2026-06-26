import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function checkPassword(req: Request) {
  const password = req.headers.get('x-admin-password')
  return Boolean(password && password === process.env.ADMIN_BLOG_PASSWORD)
}

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function GET(req: Request) {
  if (!checkPassword(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('faqs')
    .select('id, question, answer, category, active, sort_order')
    .order('sort_order', { ascending: true })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, faqs: data || [] })
}

export async function POST(req: Request) {
  if (!checkPassword(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const { question, answer, category } = body
  if (!question?.trim() || !answer?.trim()) {
    return NextResponse.json({ error: 'Question and answer are required.' }, { status: 400 })
  }
  const supabase = getSupabase()

  // Get next sort_order
  const { data: last } = await supabase.from('faqs').select('sort_order').order('sort_order', { ascending: false }).limit(1)
  const nextOrder = ((last?.[0]?.sort_order) ?? 0) + 1

  const { data, error } = await supabase
    .from('faqs')
    .insert({ question: question.trim(), answer: answer.trim(), category: category || 'General', active: true, sort_order: nextOrder })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, faq: data })
}
