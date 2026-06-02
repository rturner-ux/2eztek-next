import { NextResponse } from 'next/server'
import { publishFacebookPagePost } from '@/lib/facebook'
import { requireAdminRequest } from '@/lib/serverSecurity'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function getOptionalLink(value: unknown) {
  if (!value) return undefined
  if (typeof value !== 'string') throw new Error('Facebook post link is invalid.')

  const url = new URL(value)

  if (url.protocol !== 'https:') {
    throw new Error('Facebook post link must use HTTPS.')
  }

  return url.toString()
}

export async function POST(request: Request) {
  try {
    const unauthorized = requireAdminRequest(request)
    if (unauthorized) return unauthorized

    const body = await request.json()
    const message = typeof body.message === 'string' ? body.message.trim() : ''

    if (!message) {
      return NextResponse.json(
        { success: false, message: 'Facebook post message is required.' },
        { status: 400 }
      )
    }

    const post = await publishFacebookPagePost({
      message,
      link: getOptionalLink(body.link),
    })

    return NextResponse.json({ success: true, post })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to publish Facebook post.'

    return NextResponse.json({ success: false, message }, { status: 500 })
  }
}
