import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { db, PLANS } from '@/lib/rankradar'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-05-28.basil' })

export async function POST(req: Request) {
  const body = await req.json()
  const { plan, ownerEmail, ownerName, businessName } = body

  if (!plan || !ownerEmail || !businessName) {
    return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 })
  }

  const planConfig = PLANS[plan as keyof typeof PLANS]
  if (!planConfig) {
    return NextResponse.json({ success: false, message: 'Invalid plan' }, { status: 400 })
  }

  // Create a pending account first so we have the token for the success redirect
  const { data: account, error } = await db()
    .from('seo_accounts')
    .insert({
      business_name: businessName,
      owner_email: ownerEmail.toLowerCase().trim(),
      owner_name: ownerName || '',
      plan,
      keywords_limit: planConfig.keywords,
      competitors_limit: planConfig.competitors,
      blog_generation: planConfig.blog,
      subscription_status: 'pending',
    })
    .select('id, access_token')
    .single()

  if (error || !account) {
    return NextResponse.json({ success: false, message: error?.message || 'Failed to create account' }, { status: 500 })
  }

  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.2eztek.com'

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: planConfig.priceId, quantity: 1 }],
    customer_email: ownerEmail,
    metadata: {
      account_id: account.id,
      access_token: account.access_token,
      plan,
    },
    subscription_data: {
      metadata: {
        account_id: account.id,
        access_token: account.access_token,
      },
      trial_period_days: 7,
    },
    success_url: `${base}/rankradar/setup?token=${account.access_token}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${base}/rankradar?cancelled=true`,
  })

  return NextResponse.json({ success: true, url: session.url })
}
