import { createHmac } from 'crypto'

export function unsubToken(email: string): string {
  return createHmac('sha256', process.env.CRON_SECRET || 'fallback-secret')
    .update(email.toLowerCase().trim())
    .digest('hex')
    .slice(0, 32)
}

export function unsubscribeUrl(email: string): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.2eztek.com'
  const params = new URLSearchParams({ email: email.toLowerCase().trim(), token: unsubToken(email) })
  return `${base}/api/newsletter/unsubscribe?${params.toString()}`
}
