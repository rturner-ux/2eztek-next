import { NextResponse } from 'next/server'
import { SquareClient, SquareEnvironment } from 'square'
import { db, PLANS } from '@/lib/rankradar'
import { randomUUID } from 'crypto'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function squareClient() {
  return new SquareClient({
    token: process.env.SQUARE_ACCESS_TOKEN!,
    environment: SquareEnvironment.Production,
  })
}

export async function POST(req: Request) {
  const body = await req.json()
  const { plan, ownerEmail, ownerName, businessName, nonce } = body

  if (!plan || !ownerEmail || !businessName || !nonce) {
    return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 })
  }

  const planConfig = PLANS[plan as keyof typeof PLANS]
  if (!planConfig) {
    return NextResponse.json({ success: false, message: 'Invalid plan' }, { status: 400 })
  }

  const client = squareClient()

  // Create pending account to get access token
  const { data: account, error: accountError } = await db()
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

  if (accountError || !account) {
    return NextResponse.json({ success: false, message: accountError?.message || 'Failed to create account' }, { status: 500 })
  }

  try {
    const nameParts = (ownerName || businessName).trim().split(/\s+/)

    // 1. Create Square customer
    const { customer } = await client.customers.create({
      idempotencyKey: randomUUID(),
      emailAddress: ownerEmail,
      givenName: nameParts[0] || businessName,
      familyName: nameParts.slice(1).join(' ') || '',
      companyName: businessName,
      referenceId: account.id,
    })
    const customerId = customer!.id!

    // 2. Save card on file using the nonce from Square Web Payments SDK
    const { card } = await client.cards.create({
      idempotencyKey: randomUUID(),
      sourceId: nonce,
      card: { customerId },
    })
    const cardId = card!.id!

    // 3. Create subscription (handles first charge + all renewals)
    const { subscription } = await client.subscriptions.create({
      idempotencyKey: randomUUID(),
      locationId: process.env.SQUARE_LOCATION_ID!,
      planVariationId: planConfig.squarePlanId,
      customerId,
      cardId,
      startDate: new Date().toISOString().split('T')[0],
    })
    const subscriptionId = subscription!.id!

    // 4. Activate account
    await db()
      .from('seo_accounts')
      .update({
        square_customer_id: customerId,
        square_subscription_id: subscriptionId,
        subscription_status: 'active',
        updated_at: new Date().toISOString(),
      })
      .eq('id', account.id)

    return NextResponse.json({
      success: true,
      token: account.access_token,
      redirectUrl: `/rankradar/setup?token=${account.access_token}`,
    })
  } catch (err: any) {
    await db().from('seo_accounts').delete().eq('id', account.id)
    const msg = err?.errors?.[0]?.detail || err.message || 'Payment failed'
    return NextResponse.json({ success: false, message: msg }, { status: 500 })
  }
}
