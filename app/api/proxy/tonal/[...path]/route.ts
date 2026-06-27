import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const ORIGIN = 'https://knowledge.tonal.com'
const PROXY_BASE = '/api/proxy/tonal'

function rewriteHtml(html: string): string {
  html = html.replace('<head>', `<head><base href="${ORIGIN}/">`)

  // Rewrite absolute knowledge.tonal.com links to stay inside our proxy
  html = html.replace(
    /href="https:\/\/knowledge\.tonal\.com\/kb\//g,
    `href="${PROXY_BASE}/kb/`
  )
  // Rewrite root-relative /kb/ links
  html = html.replace(/href="\/kb\//g, `href="${PROXY_BASE}/kb/`)

  // Remove X-Frame-Options meta tags so the iframe renders
  html = html.replace(/<meta[^>]*x-frame-options[^>]*>/gi, '')
  html = html.replace(/<meta[^>]*content-security-policy[^>]*>/gi, '')

  return html
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path } = await context.params
  const targetPath = '/' + path.join('/')
  const targetUrl = `${ORIGIN}${targetPath}`

  try {
    const upstream = await fetch(targetUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      redirect: 'follow',
    })

    const contentType = upstream.headers.get('content-type') || ''

    if (contentType.includes('text/html')) {
      const html = await upstream.text()
      const rewritten = rewriteHtml(html)

      return new NextResponse(rewritten, {
        status: upstream.status,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
          'X-Frame-Options': 'SAMEORIGIN',
          'Content-Security-Policy': '',
        },
      })
    }

    // For non-HTML assets (CSS, JS, images, fonts) pass through directly
    const body = await upstream.arrayBuffer()
    return new NextResponse(body, {
      status: upstream.status,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, s-maxage=3600',
      },
    })
  } catch (err: any) {
    return new NextResponse(`Proxy error: ${err.message}`, { status: 502 })
  }
}
