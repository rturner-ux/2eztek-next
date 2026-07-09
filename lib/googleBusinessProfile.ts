// Google Business Profile API -- OAuth 2.0 token management and review reply
const TOKEN_URL = 'https://oauth2.googleapis.com/token'
const API_BASE = 'https://mybusiness.googleapis.com/v4'

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

export type GmbReview = {
  name: string
  reviewId: string
  reviewer: { displayName: string; profilePhotoUrl?: string }
  starRating: 'ONE' | 'TWO' | 'THREE' | 'FOUR' | 'FIVE'
  comment?: string
  createTime: string
  updateTime: string
  reviewReply?: { comment: string; updateTime: string }
}

export function starRatingToNumber(rating: GmbReview['starRating']): number {
  return { ONE: 1, TWO: 2, THREE: 3, FOUR: 4, FIVE: 5 }[rating]
}

export async function listUnrepliedReviews(): Promise<GmbReview[]> {
  const accountId = process.env.GOOGLE_BUSINESS_ACCOUNT_ID
  const locationId = process.env.GOOGLE_BUSINESS_LOCATION_ID
  if (!accountId || !locationId) {
    throw new Error('Missing GOOGLE_BUSINESS_ACCOUNT_ID or GOOGLE_BUSINESS_LOCATION_ID env vars')
  }

  const token = await getAccessToken()
  const parent = `${accountId}/${locationId}`
  const res = await fetch(`${API_BASE}/${parent}/reviews?pageSize=50`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) {
    throw new Error(`Reviews fetch failed: ${res.status} ${await res.text()}`)
  }
  const data = await res.json()
  const reviews: GmbReview[] = data.reviews || []
  return reviews.filter((r) => !r.reviewReply)
}

export async function replyToReview(reviewName: string, reply: string): Promise<void> {
  const token = await getAccessToken()
  const res = await fetch(`${API_BASE}/${reviewName}/reply`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ comment: reply }),
  })
  if (!res.ok) {
    throw new Error(`Reply failed: ${res.status} ${await res.text()}`)
  }
}

export async function listAccountsAndLocations(): Promise<{
  accounts: Array<{ name: string; accountName: string }>
  locations: Array<{ name: string; title: string }>
}> {
  const token = await getAccessToken()

  const accRes = await fetch('https://mybusinessaccountmanagement.googleapis.com/v1/accounts', {
    headers: { Authorization: `Bearer ${token}` },
  })
  const accData = await accRes.json()
  const accounts = accData.accounts || []

  let locations: Array<{ name: string; title: string }> = []
  if (accounts.length > 0) {
    const locRes = await fetch(
      `https://mybusinessbusinessinformation.googleapis.com/v1/${accounts[0].name}/locations?readMask=name,title`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    const locData = await locRes.json()
    locations = locData.locations || []
  }

  return { accounts, locations }
}
