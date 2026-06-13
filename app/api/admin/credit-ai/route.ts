import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

function requireAuth(req: NextRequest) {
  const pw = req.headers.get('x-admin-password')
  if (!pw || pw !== process.env.ADMIN_BLOG_PASSWORD) {
    return NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 401 })
  }
  return null
}

export async function GET(req: NextRequest) {
  const unauth = requireAuth(req)
  if (unauth) return unauth
  return NextResponse.json({ success: true })
}

export async function POST(req: NextRequest) {
  const unauth = requireAuth(req)
  if (unauth) return unauth

  try {
    const { prompt, imageBase64, imageType, system } = await req.json()

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return NextResponse.json({ success: false, message: 'ANTHROPIC_API_KEY not configured.' }, { status: 500 })
    }

    const isPdf = imageType === 'application/pdf'
    const content = imageBase64
      ? isPdf
        ? [
            { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: imageBase64 } },
            { type: 'text', text: prompt },
          ]
        : [
            { type: 'image', source: { type: 'base64', media_type: imageType || 'image/jpeg', data: imageBase64 } },
            { type: 'text', text: prompt },
          ]
      : prompt

    const extraHeaders: Record<string, string> = isPdf
      ? { 'anthropic-beta': 'pdfs-2024-09-25' }
      : {}

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        ...extraHeaders,
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 8192,
        ...(system ? { system } : {}),
        messages: [{ role: 'user', content }],
      }),
    })

    const data = await res.json()
    if (!res.ok) {
      return NextResponse.json(
        { success: false, message: data.error?.message || 'AI request failed.' },
        { status: 502 }
      )
    }

    const text = (data.content as { text?: string }[])?.map((b) => b.text || '').join('') || ''
    return NextResponse.json({ success: true, text })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Failed.' },
      { status: 500 }
    )
  }
}
