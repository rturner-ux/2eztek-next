import { JWT } from 'google-auth-library'

const SITE_URL = 'https://www.2eztek.com/'

function getClient() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_KEY
  if (!raw) throw new Error('GOOGLE_SERVICE_ACCOUNT_KEY not set')
  const key = JSON.parse(raw)
  return new JWT({
    email: key.client_email,
    key: key.private_key,
    scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
  })
}

export type GscRow = {
  query: string
  clicks: number
  impressions: number
  position: number
}

export async function fetchTopQueries(days = 90, limit = 100): Promise<GscRow[]> {
  const client = getClient()
  const token = await client.getAccessToken()

  const end = new Date()
  const start = new Date()
  start.setDate(end.getDate() - days)
  const fmt = (d: Date) => d.toISOString().split('T')[0]

  const res = await fetch(
    `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(SITE_URL)}/searchAnalytics/query`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        startDate: fmt(start),
        endDate: fmt(end),
        dimensions: ['query'],
        rowLimit: limit,
        orderBy: [{ fieldName: 'impressions', sortOrder: 'DESCENDING' }],
      }),
    }
  )

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`GSC API error ${res.status}: ${err}`)
  }

  const data = await res.json()
  return (data.rows || []).map((r: any) => ({
    query: r.keys[0],
    clicks: r.clicks,
    impressions: r.impressions,
    position: Math.round(r.position),
  }))
}
