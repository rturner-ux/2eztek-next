// app/api/cron/review-responder/route.ts
// Fetches recent Google reviews, drafts AI responses, emails them for one-click approval.
import { NextResponse } from 'next/server'
import { callClaude, cleanJsonOutput } from '@/lib/claude'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const RESPONSE_SYSTEM = `You are a professional customer relations specialist for 2EZ TEK, a highly rated fitness equipment repair company in Dallas Fort Worth, TX with 500+ five-star reviews.

You write personalized, warm, professional Google review responses that:
- Thank the reviewer by first name if available
- Reference something specific they mentioned (equipment type, service, outcome)
- Reinforce the brand: 2EZ TEK, Dallas Fort Worth, professional service
- Invite future business naturally
- Stay under 150 words
- Sound human and genuine — never robotic or generic
- For negative reviews: acknowledge the concern empathetically, offer to resolve it, provide phone (972) 807-7232
- Never be defensive or argue about negative reviews

Return ONLY valid JSON: { "response": "" }`

type GoogleReview = {
  author_name: string
  rating: number
  text: string
  time: number
  relative_time_description: string
}

async function fetchGoogleReviews(): Promise<GoogleReview[]> {
  const placeId = process.env.GOOGLE_PLACE_ID
  const apiKey = process.env.GOOGLE_PLACES_API_KEY

  if (!placeId || !apiKey) return []

  try {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=reviews&key=${apiKey}`
    const res = await fetch(url)
    if (!res.ok) return []
    const data = await res.json()
    return data.result?.reviews || []
  } catch {
    return []
  }
}

async function draftResponse(review: GoogleReview): Promise<string> {
  const sentiment = review.rating >= 4 ? 'positive' : review.rating === 3 ? 'neutral' : 'negative'
  const userMessage = `Draft a Google review response for this ${sentiment} review.

Reviewer: ${review.author_name}
Rating: ${review.rating}/5 stars
Review: "${review.text || '(No text provided)'}"
Posted: ${review.relative_time_description}

Return ONLY valid JSON: { "response": "" }`

  const outputText = await callClaude({
    system: RESPONSE_SYSTEM,
    userMessage,
    maxTokens: 384,
    temperature: 0.7,
  })

  try {
    const parsed = JSON.parse(cleanJsonOutput(outputText))
    return parsed.response || ''
  } catch {
    return outputText.trim()
  }
}

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const reviews = await fetchGoogleReviews()

    if (reviews.length === 0) {
      return NextResponse.json({ success: true, message: 'No reviews fetched (check GOOGLE_PLACE_ID and GOOGLE_PLACES_API_KEY)', drafted: 0 })
    }

    // Focus on the 5 most recent reviews
    const recent = reviews.slice(0, 5)
    const drafts: Array<{ reviewer: string; rating: number; review: string; response: string }> = []

    for (const review of recent) {
      try {
        const response = await draftResponse(review)
        if (response) {
          drafts.push({
            reviewer: review.author_name,
            rating: review.rating,
            review: review.text || '(No text)',
            response,
          })
        }
        await new Promise((r) => setTimeout(r, 300))
      } catch (err) {
        console.error('Draft failed for review from:', review.author_name, err)
      }
    }

    if (drafts.length === 0) {
      return NextResponse.json({ success: true, message: 'No response drafts generated', drafted: 0 })
    }

    // Email all drafted responses for human review
    if (process.env.RESEND_API_KEY) {
      const starsHtml = (rating: number) =>
        '★'.repeat(rating) + '☆'.repeat(5 - rating)

      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: '2EZ TEK <support@2eztek.com>',
          to: ['support@2eztek.com'],
          subject: `Google Review Responses Ready: ${drafts.length} drafted for approval`,
          html: `
            <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111;max-width:640px">
              <h2 style="color:#0891B2">Google Review Responses — Ready for Approval</h2>
              <p>${drafts.length} AI-drafted responses are ready. Copy each response and paste it into Google Maps to reply.</p>
              <p style="color:#666;font-size:13px">Go to <a href="https://business.google.com">business.google.com</a> → Reviews → Reply</p>
              <hr/>

              ${drafts.map((d, i) => `
                <div style="margin:24px 0;padding:20px;border-radius:12px;background:#f9f9f9;border:1px solid #e5e5e5">
                  <div style="margin-bottom:12px">
                    <strong style="font-size:16px">${i + 1}. ${d.reviewer}</strong>
                    <span style="margin-left:10px;color:#f59e0b;font-size:18px">${starsHtml(d.rating)}</span>
                  </div>

                  <div style="padding:12px;background:#fff;border-radius:8px;border:1px solid #e5e5e5;margin-bottom:12px">
                    <strong style="color:#666;font-size:12px;text-transform:uppercase;letter-spacing:0.08em">Customer Review:</strong>
                    <p style="margin:6px 0 0;font-style:italic;color:#444">"${d.review}"</p>
                  </div>

                  <div style="padding:12px;background:#e0f9ff;border-radius:8px;border:1px solid #b2e8f7">
                    <strong style="color:#0891B2;font-size:12px;text-transform:uppercase;letter-spacing:0.08em">Drafted Response (copy &amp; paste):</strong>
                    <p style="margin:8px 0 0;color:#111;white-space:pre-wrap">${d.response}</p>
                  </div>
                </div>
              `).join('')}

              <hr/>
              <p style="color:#999;font-size:12px">Auto-drafted by 2EZ TEK Review Responder (Claude Sonnet). Always review before posting.</p>
            </div>
          `,
        }),
      })
    }

    return NextResponse.json({ success: true, drafted: drafts.length, reviews: recent.length })
  } catch (error: any) {
    console.error('REVIEW RESPONDER ERROR:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
