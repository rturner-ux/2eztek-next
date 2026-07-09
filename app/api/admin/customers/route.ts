import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { saveNewCustomer } from '@/lib/newCustomers'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase environment variables.')
  }

  return createClient(supabaseUrl, serviceRoleKey)
}

function requireBlogAdminRequest(request: Request) {
  const configuredSecret = process.env.ADMIN_BLOG_PASSWORD
  const suppliedSecret = request.headers.get('x-admin-password')

  if (!configuredSecret) {
    return NextResponse.json(
      { success: false, message: 'Customer admin is not configured.' },
      { status: 503 }
    )
  }

  if (!suppliedSecret || suppliedSecret !== configuredSecret) {
    return NextResponse.json(
      { success: false, message: 'Unauthorized.' },
      { status: 401 }
    )
  }

  return null
}

type ResendEmailSummary = {
  id: string
  created_at: string
  subject: string
}

type ResendEmail = ResendEmailSummary & {
  html?: string | null
  reply_to?: string | string[] | null
}

function decodeHtml(value: string) {
  return value
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .trim()
}

function getEmailField(html: string, label: string) {
  const escapedLabel = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const match = html.match(
    new RegExp(
      `<strong>${escapedLabel}:<\\/strong>(?:<\\/td><td>)?\\s*([^<]*)`,
      'i'
    )
  )

  return decodeHtml(match?.[1] || '')
}

async function resendRequest<T>(path: string): Promise<T> {
  const apiKey = process.env.RESEND_API_KEY

  if (!apiKey) {
    throw new Error('Missing RESEND_API_KEY.')
  }

  const response = await fetch(`https://api.resend.com${path}`, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    cache: 'no-store',
  })
  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || 'Resend request failed.')
  }

  return data as T
}

function wait(milliseconds: number) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds))
}

export async function GET(request: Request) {
  try {
    const unauthorized = requireBlogAdminRequest(request)
    if (unauthorized) return unauthorized

    const supabase = getSupabaseAdmin()
    // Try with new columns first, fall back to base columns if they don't exist yet
    let data, error
    ;({ data, error } = await supabase
      .from('new_customers')
      .select('id, name, email, phone, address, service_type, equipment_type, brand_model, details, source, page, status, created_at, updated_at, last_request_at, distance_miles, triage_score, triage_priority')
      .order('last_request_at', { ascending: false })
      .limit(500))

    if (error) {
      // Fall back without the newer columns if migration hasn't been run yet
      ;({ data, error } = await supabase
        .from('new_customers')
        .select('id, name, email, phone, address, service_type, equipment_type, brand_model, details, source, page, status, created_at, updated_at, last_request_at')
        .order('last_request_at', { ascending: false })
        .limit(500))
    }

    if (error) throw error

    return NextResponse.json({ success: true, customers: data || [] })
  } catch (error) {
    const rawMessage =
      error instanceof Error ? error.message : 'Failed to load customers.'
    const message =
      rawMessage.includes('new_customers') ||
      rawMessage.includes('schema cache') ||
      rawMessage.includes('relation')
        ? 'Customer database setup is incomplete. Run supabase/new_customers.sql in the Supabase SQL Editor.'
        : rawMessage

    return NextResponse.json({ success: false, message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const unauthorized = requireBlogAdminRequest(request)
    if (unauthorized) return unauthorized

    const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000
    const listed = await resendRequest<{ data?: ResendEmailSummary[] }>(
      '/emails?limit=100'
    )
    const candidates = (listed.data || []).filter(
      (email) =>
        new Date(email.created_at).getTime() >= cutoff &&
        email.subject.startsWith('New 2EZ TEK Request:')
    )

    let imported = 0
    let skipped = 0

    for (const candidate of candidates) {
      // Resend allows five requests per second. Leave a little headroom.
      await wait(250)
      const email = await resendRequest<ResendEmail>(`/emails/${candidate.id}`)
      const html = email.html || ''
      const replyTo = Array.isArray(email.reply_to)
        ? email.reply_to[0]
        : email.reply_to
      const customerEmail = getEmailField(html, 'Email') || replyTo || ''
      const name = getEmailField(html, 'Name')
      const phone = getEmailField(html, 'Phone')

      if (!name || !phone || !customerEmail) {
        skipped += 1
        continue
      }

      await saveNewCustomer({
        name,
        phone,
        email: customerEmail,
        address: getEmailField(html, 'Address'),
        serviceType: getEmailField(html, 'Service Type'),
        equipmentType: getEmailField(html, 'Equipment Type'),
        brandModel: getEmailField(html, 'Brand / Model'),
        source: getEmailField(html, 'Source') || 'Resend Backfill',
        page: getEmailField(html, 'Page'),
      })
      imported += 1
    }

    return NextResponse.json({
      success: true,
      matched: candidates.length,
      imported,
      skipped,
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to import customers.'

    return NextResponse.json({ success: false, message }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const unauthorized = requireBlogAdminRequest(request)
    if (unauthorized) return unauthorized

    const body = await request.json()
    const { id, ...fields } = body
    if (!id) return NextResponse.json({ success: false, message: 'Customer ID is required.' }, { status: 400 })

    const allowed = ['name', 'email', 'phone', 'address', 'service_type', 'equipment_type', 'brand_model', 'details', 'status']
    const update: Record<string, string> = { updated_at: new Date().toISOString() }
    for (const key of allowed) {
      if (key in fields) update[key] = fields[key]
    }

    const supabase = getSupabaseAdmin()
    const { error } = await supabase.from('new_customers').update(update).eq('id', id)
    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ success: false, message: error instanceof Error ? error.message : 'Failed to update customer.' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const unauthorized = requireBlogAdminRequest(request)
    if (unauthorized) return unauthorized

    const body = await request.json()
    const id = typeof body.id === 'string' ? body.id.trim() : ''

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Customer ID is required.' },
        { status: 400 }
      )
    }

    const supabase = getSupabaseAdmin()
    const { error } = await supabase.from('new_customers').delete().eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to delete customer.'

    return NextResponse.json({ success: false, message }, { status: 500 })
  }
}
