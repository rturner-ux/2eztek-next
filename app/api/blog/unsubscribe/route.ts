import { createClient } from '@supabase/supabase-js'
import { createHmac } from 'crypto'

function unsubToken(email: string) {
  return createHmac('sha256', process.env.CRON_SECRET || 'fallback-secret')
    .update(email.toLowerCase().trim())
    .digest('hex')
    .slice(0, 32)
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

  await supabase
    .from('blog_followers')
    .update({ unsubscribed: true })
    .eq('email', email)

  return new Response(page("You've been unsubscribed.", 'You will no longer receive new article emails from 2EZ TEK.'), {
    headers: { 'Content-Type': 'text/html' },
  })
}

function page(heading: string, body: string) {
  return `<!DOCTYPE html><html><head><title>${heading} | 2EZ TEK</title></head>
<body style="font-family:Arial,sans-serif;max-width:480px;margin:100px auto;text-align:center;color:#111;padding:0 24px">
  <div style="font-size:11px;font-weight:900;letter-spacing:0.3em;color:#0891B2;margin-bottom:24px">2EZ TEK</div>
  <h2 style="margin:0 0 16px">${heading}</h2>
  <p style="color:#666">${body}</p>
  <a href="https://www.2eztek.com/blog" style="display:inline-block;margin-top:28px;color:#0891B2;font-weight:bold;text-decoration:none">Return to blog</a>
</body></html>`
}
