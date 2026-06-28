import { NextResponse } from 'next/server'
import { createHmac } from 'crypto'
import { db } from '@/lib/rankradar'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  const signature = req.headers.get('x-square-hmacsha256-signature') || ''
  const rawBody = await req.text()

  // Verify Square webhook signature
  const webhookKey = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY || ''
  if (webhookKey) {
    const url = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.2eztek.com'}/api/rankradar/webhook`
    const expected = createHmac('sha256', webhookKey).update(url + rawBody).digest('base64')
    if (signature !== expected) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }
  }

  const event = JSON.parse(rawBody)
  const supabase = db()

  const type = event.type as string
  const data = event.data?.object

  if (type === 'subscription.updated' && data?.subscription) {
    const sub = data.subscription
    const subId = sub.id
    const status = sub.status?.toLowerCase()

    const statusMap: Record<string, string> = {
      active: 'active',
      paused: 'past_due',
      canceled: 'cancelled',
      pending: 'pending',
      deactivated: 'cancelled',
    }

    const mapped = statusMap[status] || status

    await supabase
      .from('seo_accounts')
      .update({ subscription_status: mapped, updated_at: new Date().toISOString() })
      .eq('square_subscription_id', subId)
  }

  if (type === 'subscription.created' && data?.subscription) {
    const sub = data.subscription
    await supabase
      .from('seo_accounts')
      .update({ subscription_status: 'active', updated_at: new Date().toISOString() })
      .eq('square_subscription_id', sub.id)
  }

  return NextResponse.json({ received: true })
}
