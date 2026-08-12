// Square Customers API -- reuses the same SQUARE_ACCESS_TOKEN already
// configured for RankRadar billing (lib/rankradar.ts, app/api/rankradar/*).
// Same Square account, just the Customers surface instead of Payments.

import 'server-only'
import { SquareClient, SquareEnvironment } from 'square'

function squareClient() {
  return new SquareClient({
    token: process.env.SQUARE_ACCESS_TOKEN!,
    environment: SquareEnvironment.Production,
  })
}

export async function createSquareCustomer(opts: {
  name: string
  phone?: string
  email?: string
  address?: string
}): Promise<string | null> {
  if (!process.env.SQUARE_ACCESS_TOKEN) return null

  try {
    const client = squareClient()

    // Best-effort duplicate check by email, mirrors the Google Contacts flow
    // -- skip creating a second Square customer if one with this email
    // already exists.
    if (opts.email) {
      const searchResult = await client.customers.search({
        query: { filter: { emailAddress: { exact: opts.email } } },
      })
      const existing = searchResult.customers?.[0]?.id
      if (existing) return existing
    }

    const nameParts = opts.name.trim().split(/\s+/)
    const givenName = nameParts[0] || opts.name
    const familyName = nameParts.slice(1).join(' ') || undefined

    let phoneNumber: string | undefined
    if (opts.phone) {
      const cleaned = opts.phone.replace(/\D/g, '')
      phoneNumber = cleaned.startsWith('1') ? `+${cleaned}` : `+1${cleaned}`
    }

    const result = await client.customers.create({
      givenName,
      familyName,
      emailAddress: opts.email,
      phoneNumber,
      note: opts.address,
    })

    return result.customer?.id || null
  } catch (err) {
    console.error('SQUARE CUSTOMER ERROR:', err)
    return null
  }
}
