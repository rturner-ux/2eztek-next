import { NextResponse } from 'next/server'
import { SquareClient, SquareEnvironment } from 'square'
import { createClient } from '@supabase/supabase-js'
import { randomUUID } from 'crypto'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Runs daily at 9 AM UTC — charges accounts whose trial or billing period has ended
// Schedule in vercel.json: "0 9 * * *"

const PLAN_AMOUNTS: Record<string, number> = {
  starter: 4900, // $49.00 in cents
  pro: 9900,     // $99.00 in cents
}

function supabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

function squareClient() {
  return new SquareClient({
    token: process.env.SQUARE_ACCESS_TOKEN!,
    environment: SquareEnvironment.Production,
  })
}

export async function GET(req: Request) {
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const db = supabase()
  const client = squareClient()
  const now = new Date().toISOString()

  // Find all accounts due for billing
  const { data: accounts, error } = await db
    .from('seo_accounts')
    .select('id, business_name, owner_email, plan, square_customer_id, square_card_id, next_billing_date, subscription_status')
    .in('subscription_status', ['trialing', 'active'])
    .lte('next_billing_date', now)
    .not('square_card_id', 'is', null)

  if (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }

  if (!accounts || accounts.length === 0) {
    return NextResponse.json({ success: true, charged: 0, message: 'No accounts due for billing' })
  }

  let charged = 0
  let failed = 0
  const results: { email: string; status: string; amount?: number; error?: string }[] = []

  for (const account of accounts) {
    const amountCents = PLAN_AMOUNTS[account.plan] ?? 4900
    const nextBilling = new Date()
    nextBilling.setMonth(nextBilling.getMonth() + 1)

    try {
      const { payment } = await client.payments.create({
        idempotencyKey: randomUUID(),
        sourceId: account.square_card_id,
        customerId: account.square_customer_id,
        amountMoney: {
          amount: BigInt(amountCents),
          currency: 'USD',
        },
        note: `RankRadar ${account.plan} — ${account.business_name}`,
        referenceId: account.id,
      })

      // Payment succeeded — mark active, set next billing date
      await db
        .from('seo_accounts')
        .update({
          subscription_status: 'active',
          next_billing_date: nextBilling.toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', account.id)

      results.push({ email: account.owner_email, status: 'charged', amount: amountCents / 100 })
      charged++
    } catch (err: any) {
      const msg = err?.errors?.[0]?.detail || err.message || 'Payment failed'

      // Mark past_due so we can follow up
      await db
        .from('seo_accounts')
        .update({
          subscription_status: 'past_due',
          updated_at: new Date().toISOString(),
        })
        .eq('id', account.id)

      results.push({ email: account.owner_email, status: 'failed', error: msg })
      failed++
    }
  }

  // Send yourself a billing summary email
  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'RankRadar <noreply@2eztek.com>',
        to: 'rturner@2eztek.com',
        subject: `RankRadar Billing — ${charged} charged, ${failed} failed`,
        html: `
          <h2>RankRadar Monthly Billing</h2>
          <p><strong>${charged}</strong> accounts charged &bull; <strong>${failed}</strong> failed</p>
          <table border="1" cellpadding="6" style="border-collapse:collapse;">
            <tr><th>Email</th><th>Status</th><th>Amount</th><th>Note</th></tr>
            ${results.map((r) => `
              <tr>
                <td>${r.email}</td>
                <td style="color:${r.status === 'charged' ? 'green' : 'red'}">${r.status}</td>
                <td>${r.amount ? `$${r.amount}` : '—'}</td>
                <td>${r.error || ''}</td>
              </tr>
            `).join('')}
          </table>
        `,
      }),
    })
  } catch {
    // Non-fatal — billing already processed
  }

  return NextResponse.json({ success: true, charged, failed, results })
}
