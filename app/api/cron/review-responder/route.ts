// app/api/cron/review-responder/route.ts
// Fetches unreplied Google Business Profile reviews, generates AI responses, auto-posts them.
// Negative reviews (1-2 stars) are skipped and emailed for manual handling.
import { NextResponse } from 'next/server'
import { callClaude, cleanJsonOutput } from '@/lib/claude'
import {
  listUnrepliedReviews,
  replyToReview,
  starRatingToNumber,
  GmbReview,
} from '@/lib/googleBusinessProfile'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const RESPONSE_SYSTEM = `You are a professional customer relations specialist for 2EZ TEK, a fitness equipment repair company in Dallas Fort Worth, TX.

You write personalized, warm, professional Google review responses that:
- Thank the reviewer by first name if available
- Reference something specific they mentioned (equipment type, service, outcome)
- Reinforce the brand: 2EZ TEK, Dallas Fort Worth area, professional service
- Invite future business naturally
- Stay under 120 words
- Sound human and genuine, never robotic or template-like
- Never use em dashes in any writing
- Never be defensive or argue with any reviewer

Return ONLY valid JSON: { "response": "" }`

async function draftResponse(review: GmbReview): Promise<string> {
  const rating = starRatingToNumber(review.starRating)
  const sentiment = rating >= 4 ? 'positive' : rating === 3 ? 'neutral' : 'negative'

  const userMessage = `Draft a Google review response for this ${sentiment} review.

Reviewer: ${review.reviewer.displayName}
Rating: ${rating}/5 stars
Review: "${review.comment || '(No text provided)'}"

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

async function emailNegativeReviews(
  reviews: Array<{ review: GmbReview; rating: number }>
): Promise<void> {
  if (!process.env.RESEND_API_KEY || reviews.length === 0) return

  const starsHtml = (n: number) => '★'.repeat(n) + '☆'.repeat(5 - n)

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: '2EZ TEK <support@2eztek.com>',
      to: ['rturner@2eztek.com'],
      subject: `Action Required: ${reviews.length} negative Google review${reviews.length > 1 ? 's' : ''} need a reply`,
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111;max-width:640px">
          <h2 style="color:#dc2626">Negative Reviews — Manual Reply Required</h2>
          <p>These reviews were not auto-replied because they are 1 or 2 stars. A personal response from you will carry more weight.</p>
          <p style="color:#666;font-size:13px">Reply at <a href="https://business.google.com">business.google.com</a></p>
          <hr/>
          ${reviews
            .map(
              ({ review, rating }) => `
            <div style="margin:24px 0;padding:20px;border-radius:12px;background:#fff5f5;border:1px solid #fecaca">
              <strong>${review.reviewer.displayName}</strong>
              <span style="margin-left:10px;color:#ef4444">${starsHtml(rating)}</span>
              <p style="margin:10px 0 0;font-style:italic;color:#444">"${review.comment || '(No text)'}"</p>
            </div>
          `
            )
            .join('')}
          <hr/>
          <p style="color:#999;font-size:12px">2EZ TEK Review Responder</p>
        </div>
      `,
    }),
  })
}

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const unreplied = await listUnrepliedReviews()

    if (unreplied.length === 0) {
      return NextResponse.json({ success: true, message: 'All reviews have replies', replied: 0 })
    }

    const batch = unreplied.slice(0, 10)
    let replied = 0
    const skippedNegative: Array<{ review: GmbReview; rating: number }> = []
    const results: Array<{ reviewer: string; rating: number; status: string; error?: string }> = []

    for (const review of batch) {
      const rating = starRatingToNumber(review.starRating)

      if (rating <= 2) {
        skippedNegative.push({ review, rating })
        results.push({ reviewer: review.reviewer.displayName, rating, status: 'skipped_negative' })
        continue
      }

      try {
        const response = await draftResponse(review)
        if (!response) {
          results.push({ reviewer: review.reviewer.displayName, rating, status: 'no_draft' })
          continue
        }

        await replyToReview(review.name, response)
        replied++
        results.push({ reviewer: review.reviewer.displayName, rating, status: 'replied' })
      } catch (err: any) {
        results.push({
          reviewer: review.reviewer.displayName,
          rating,
          status: 'error',
          error: err.message,
        })
      }

      await new Promise((r) => setTimeout(r, 600))
    }

    await emailNegativeReviews(skippedNegative)

    return NextResponse.json({
      success: true,
      replied,
      skipped_negative: skippedNegative.length,
      pending: Math.max(0, unreplied.length - replied - skippedNegative.length),
      results,
    })
  } catch (error: any) {
    console.error('REVIEW RESPONDER ERROR:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
