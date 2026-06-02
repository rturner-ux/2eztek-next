import 'server-only'

const DEFAULT_GRAPH_API_VERSION = 'v24.0'

type FacebookPostInput = {
  message: string
  link?: string
}

type FacebookPostResult = {
  id: string
}

type FacebookApiResponse = {
  id?: unknown
  error?: {
    message?: unknown
  }
}

function getFacebookConfig() {
  const pageId = process.env.FACEBOOK_PAGE_ID
  const pageAccessToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN
  const graphApiVersion =
    process.env.FACEBOOK_GRAPH_API_VERSION || DEFAULT_GRAPH_API_VERSION

  if (!pageId || !pageAccessToken) {
    throw new Error(
      'Facebook publishing is not configured. Add FACEBOOK_PAGE_ID and FACEBOOK_PAGE_ACCESS_TOKEN.'
    )
  }

  return { pageId, pageAccessToken, graphApiVersion }
}

export function isFacebookAutoPostEnabled() {
  return process.env.FACEBOOK_AUTO_POST_ENABLED === 'true'
}

export async function publishFacebookPagePost({
  message,
  link,
}: FacebookPostInput): Promise<FacebookPostResult> {
  const cleanMessage = message.trim()

  if (!cleanMessage) {
    throw new Error('Facebook post message is required.')
  }

  const { pageId, pageAccessToken, graphApiVersion } = getFacebookConfig()
  const body = new URLSearchParams({
    message: cleanMessage,
    access_token: pageAccessToken,
  })

  if (link) {
    body.set('link', link)
  }

  const response = await fetch(
    `https://graph.facebook.com/${graphApiVersion}/${pageId}/feed`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body,
      cache: 'no-store',
    }
  )

  const data = (await response.json()) as FacebookApiResponse

  if (!response.ok || typeof data.id !== 'string') {
    const message =
      typeof data.error?.message === 'string'
        ? data.error.message
        : 'Facebook rejected the Page post.'

    throw new Error(message)
  }

  return { id: data.id }
}
