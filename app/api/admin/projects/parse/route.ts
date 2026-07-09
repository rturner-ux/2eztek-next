import { NextResponse } from 'next/server'
import { requireAdminRequest } from '@/lib/serverSecurity'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function POST(request: Request) {
  const denied = requireAdminRequest(request)
  if (denied) return denied

  try {
    const { text } = await request.json()
    if (!text?.trim()) return NextResponse.json({ success: false, error: 'No text provided' }, { status: 400 })

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) return NextResponse.json({ success: false, error: 'ANTHROPIC_API_KEY not configured' }, { status: 500 })

    const system = `You are a work order parser for 2EZ TEK, a fitness equipment repair and installation company in Dallas Fort Worth. Extract all relevant information from work order emails and return a JSON object with these exact field names. Return ONLY the JSON object, no explanation or markdown.`

    const prompt = `Parse this work order email and extract all available information into this JSON structure:

{
  "name": "short descriptive job name like 'April Johnson - FSR90 Install' or 'ROM 4 Repair - Carrollton'",
  "project_type": "install OR repair OR maintenance OR dispatch",
  "job_source": "dispatch",
  "customer_name": "full customer name",
  "customer_phone": "phone number",
  "customer_email": "email address",
  "site_address": "full address including apt/unit if present",
  "dispatch_company": "name of company sending the work order",
  "dispatch_job_number": "order or job number",
  "dispatch_contact": "contact person name and title",
  "dispatch_billing_email": "billing or invoice email address",
  "dispatch_tech_support": "tech support phone number",
  "equipment_type": "type of equipment (Treadmill, Functional Trainer, etc)",
  "equipment_brand": "brand name",
  "equipment_model": "model name or number",
  "issue_description": "full description of the issue or work to be done including technician to-do list",
  "quote_amount": null,
  "pod_required": true,
  "status": "new",
  "priority": "medium",
  "notes": "any special instructions, access notes, sticker instructions, return labels, or other important info",
  "internal_notes": "payment terms, invoice instructions, parts shipping info, tech support hours"
}

Rules:
- For dispatch jobs, pod_required should be true unless stated otherwise
- Extract the FULL issue description and technician to-do list into issue_description
- Put invoice/billing instructions and payment terms in internal_notes
- Put access notes, special requirements, customer instructions in notes
- If something is not present in the email, use null for that field
- quote_amount should be null (the user will set this separately)
- Return only valid JSON, no markdown code blocks

Work order email:
${text}`

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 2048,
        system,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    const data = await res.json()
    const raw = data?.content?.[0]?.text?.trim() || ''

    // Strip markdown code fences if model added them
    const cleaned = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()

    let parsed: Record<string, unknown>
    try {
      parsed = JSON.parse(cleaned)
    } catch {
      return NextResponse.json({ success: false, error: 'Could not parse AI response', raw }, { status: 500 })
    }

    return NextResponse.json({ success: true, parsed })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Parse failed'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
