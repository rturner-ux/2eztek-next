// Google Contacts (People API) -- reuses the same OAuth refresh-token setup
// already configured for Google Business Profile (lib/googleBusinessProfile.ts).
// The refresh token must include the contacts scope
// (https://www.googleapis.com/auth/contacts) or these calls will fail.

const TOKEN_URL = 'https://oauth2.googleapis.com/token'
const API_BASE = 'https://people.googleapis.com/v1'

async function getAccessToken(): Promise<string> {
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_OAUTH_CLIENT_ID!,
      client_secret: process.env.GOOGLE_OAUTH_CLIENT_SECRET!,
      refresh_token: process.env.GOOGLE_OAUTH_REFRESH_TOKEN!,
      grant_type: 'refresh_token',
    }),
  })
  const data = await res.json()
  if (!data.access_token) throw new Error(`Token refresh failed: ${JSON.stringify(data)}`)
  return data.access_token
}

export async function createGoogleContact(opts: {
  name: string
  phone?: string
  email?: string
  address?: string
}): Promise<string | null> {
  if (!process.env.GOOGLE_OAUTH_CLIENT_ID || !process.env.GOOGLE_OAUTH_REFRESH_TOKEN) return null

  try {
    const token = await getAccessToken()

    // Best-effort duplicate check -- skip creating a second contact if one
    // with this email is already indexed. Newly created contacts can take a
    // little while to become searchable, so this isn't airtight.
    if (opts.email) {
      const searchRes = await fetch(
        `${API_BASE}/people:searchContacts?query=${encodeURIComponent(opts.email)}&readMask=emailAddresses`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (searchRes.ok) {
        const searchData = await searchRes.json()
        const existing = searchData.results?.[0]?.person?.resourceName
        if (existing) return existing
      }
    }

    const nameParts = opts.name.trim().split(/\s+/)
    const givenName = nameParts[0] || opts.name
    const familyName = nameParts.slice(1).join(' ')

    const body: Record<string, any> = {
      names: [{ givenName, ...(familyName && { familyName }) }],
    }
    if (opts.phone) body.phoneNumbers = [{ value: opts.phone, type: 'mobile' }]
    if (opts.email) body.emailAddresses = [{ value: opts.email }]
    if (opts.address) body.addresses = [{ streetAddress: opts.address }]

    const res = await fetch(`${API_BASE}/people:createContact`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      console.error('GOOGLE CONTACT CREATE ERROR:', res.status, await res.text())
      return null
    }
    const data = await res.json()
    return data.resourceName || null
  } catch (err) {
    console.error('GOOGLE CONTACT ERROR:', err)
    return null
  }
}
