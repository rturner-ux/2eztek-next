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

  // Create pending account first so we have the token ready
  const trialEnd = new Date()
  trialEnd.setDate(trialEnd.getDate() + 7)

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
      subscription_status: 'trialing',
      next_billing_date: trialEnd.toISOString(),
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

    // 2. Save card on file using the nonce — no charge yet (7-day trial)
    const { card } = await client.cards.create({
      idempotencyKey: randomUUID(),
      sourceId: nonce,
      card: { customerId },
    })
    const cardId = card!.id!

    // 3. Activate account with Square IDs
    await db()
      .from('seo_accounts')
      .update({
        square_customer_id: customerId,
        square_card_id: cardId,
        subscription_status: 'trialing',
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
    const msg = err?.errors?.[0]?.detail || err.message || 'Card could not be saved'
    return NextResponse.json({ success: false, message: msg }, { status: 500 })
  }
}
