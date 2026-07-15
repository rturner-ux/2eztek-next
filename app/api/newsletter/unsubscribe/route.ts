import { createClient } from '@supabase/supabase-js'
import { unsubToken } from '@/lib/newsletterUnsub'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function page(heading: string, body: string) {
  return `<!DOCTYPE html><html><head><title>${heading} | 2EZ TEK</title></head>
<body style="font-family:Arial,sans-serif;max-width:480px;margin:100px auto;text-align:center;color:#111;padding:0 24px">
  <div style="font-size:11px;font-weight:900;letter-spacing:0.3em;color:#0891B2;margin-bottom:24px">2EZ TEK</div>
  <h2 style="margin:0 0 16px">${heading}</h2>
  <p style="color:#666">${body}</p>
  <a href="https://www.2eztek.com" style="display:inline-block;margin-top:28px;color:#0891B2;font-weight:bold;text-decoration:none">Return to 2eztek.com</a>
</body></html>`
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const email = searchParams.get('email')?.toLowerCase().trim()
  const token = searchParams.get('token')

  if (!email || !token || token !== unsubToken(email)) {
    return new Response(page('Invalid unsubscribe link.', 'This link is invalid or has expired.'), {
      headers: { 'Content-Type': 'text/html' },
      status: 400,
    })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const now = new Date().toISOString()

  await supabase
    .from('newsletter_subscribers')
    .update({ unsubscribed_at: now })
    .eq('email', email)

  // Stop any in-flight welcome/follow-up sequence immediately, not just future sends
  await supabase
    .from('email_sequences')
    .update({ step: 99 })
    .eq('email', email)

  return new Response(page("You've been unsubscribed.", 'You will no longer receive equipment tips or update emails from 2EZ TEK.'), {
    headers: { 'Content-Type': 'text/html' },
  })
}
