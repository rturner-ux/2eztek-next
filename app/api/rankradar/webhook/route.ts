import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { db } from '@/lib/rankradar'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-06-24.dahlia' })
  const sig = req.headers.get('stripe-signature')!
  const raw = await req.arrayBuffer()
  const buf = Buffer.from(raw)

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }

  const supabase = db()

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const accountId = session.metadata?.account_id
    if (!accountId) return NextResponse.json({ received: true })

    await supabase.from('seo_accounts').update({
      stripe_customer_id: session.customer as string,
      stripe_subscription_id: session.subscription as string,
      subscription_status: 'active',
      updated_at: new Date().toISOString(),
    }).eq('id', accountId)
  }

  if (event.type === 'customer.subscription.updated') {
    const sub = event.data.object as Stripe.Subscription
    const accountId = sub.metadata?.account_id
    if (!accountId) return NextResponse.json({ received: true })

    await supabase.from('seo_accounts').update({
      subscription_status: sub.status,
      updated_at: new Date().toISOString(),
    }).eq('id', accountId)
  }

  if (event.type === 'customer.subscription.deleted') {
    const sub = event.data.object as Stripe.Subscription
    const accountId = sub.metadata?.account_id
    if (!accountId) return NextResponse.json({ received: true })

    await supabase.from('seo_accounts').update({
      subscription_status: 'cancelled',
      updated_at: new Date().toISOString(),
    }).eq('id', accountId)
  }

  return NextResponse.json({ received: true })
}
