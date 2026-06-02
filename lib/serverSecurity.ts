import 'server-only'

import { NextResponse } from 'next/server'

export function requireAdminRequest(request: Request) {
  const configuredSecret =
    process.env.ADMIN_API_KEY || process.env.ADMIN_BLOG_PASSWORD
  const suppliedSecret =
    request.headers.get('x-admin-password') ||
    request.headers.get('authorization')?.replace(/^Bearer\s+/i, '')

  if (!configuredSecret) {
    return NextResponse.json(
      { success: false, error: 'Admin API is not configured.' },
      { status: 503 }
    )
  }

  if (!suppliedSecret || suppliedSecret !== configuredSecret) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized.' },
      { status: 401 }
    )
  }

  return null
}

export function escapeHtml(value: unknown) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}
