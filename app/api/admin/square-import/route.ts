import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

function requireAuth(request: NextRequest) {
  const password = request.headers.get('x-admin-password')
  if (!password || password !== process.env.ADMIN_BLOG_PASSWORD) {
    return NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 401 })
  }
  return null
}

// Thumbtack review names used for matching
const THUMBTACK_NAMES = [
  'Jordan C.', 'Ron W.', 'Jessie C.', 'Josh G.', 'Rex K.', 'Holly L.',
  'David S.', 'Jasmin', 'Hope J.', 'Miguel E.', 'Stephanie A.', 'Erin C.',
  'Tommy L.', 'Courtney N.', 'Robert', 'Mohamed', 'Deb R.', 'Rebecca J.',
  'Lesley T.', 'Kevin C.', 'Krisanne H.', 'Lon B.', 'Melissa A.', 'Kevin G.',
  'Rolanda J.', 'Kyra D.', 'Krishna S.', 'Chelsea C.', 'Laura L.', 'Conrad P.',
  'Ron P.', 'Tony', 'Eric E.', 'Justin M.', 'Kaylyn R.', 'Joshua J.',
  'Andrew M.', 'Sean N.', 'Penny H.', 'Rose C.', 'Heather M.', 'Raja M.',
  'Jose R.', 'Shannon L.', 'Pamela H.', 'David G.', 'Rupesh S.', 'Marcus M.',
  'Ivan D.', 'Rasheeda G.', 'Grant R.', 'Dale H.', 'Demona H.', 'Jenae D.',
  'Jacki K.', 'John G.', 'Ketan', 'Gabriel G.', 'Francisco V.', 'Chandler P.',
  'John W.', 'Rob W.', 'Sylvia U.', 'Taylor R.', 'Aiyappa M.', 'Charles L.',
  'Demetria H.', 'Rahman', 'Adrianna B.', 'Rebecca', 'Anup R.', 'Tracey L.',
  'Ethan L.', 'Nikul S.', 'Mae C.', 'Al R.', 'Laura H.', 'Sean M.', 'Jeremy R.',
  'Gordon C.', 'Jacey B.', 'Leslie S.', 'Naveen Y.', 'Samantha A.', 'Norman B.',
  'Cecilia C.', 'Jana S.', 'James D.', 'Bill H.', 'Cynthia C.', 'Tamaron S.',
  'Rehnuma A.', 'Ryan C.', 'Jay B.', 'Ron B.', 'Brandon S.', 'Reza A.',
  'Theis R.', 'Jeanette', 'Linda G.', 'Matt Z.', 'Siyan F.', 'Michael G.',
  'Carla N.', 'Kathy B.', 'Shariot M.', 'Martha R.', 'Scott R.', 'Jake',
  'Daisy K.', 'Ruben C.', 'Andy F.', 'Jessica M.', 'Anita R.', 'Casie L.',
  'Taylor E.', 'Mona S.', 'Derick J.', 'Jessie G.', 'Ganesh B.', 'Treyon M.',
  'Amy D.', 'Claudia M.', 'Jamie M.', 'Edwin E.', 'Dan A.', 'Andy W.',
  'Sashi S.', 'Kristen H.', 'Easter M.', 'John C.', 'Lincoya Y.', 'Alexander W.',
  'Ray M.', 'Muslim N.', 'Eric B.', 'Barry I.', 'Jan S.', 'Jeff P.', 'Wendy C.',
  'Daniel M.', 'Norman S.', 'Pamela J.', 'Kassandra D.', 'Greg P.', 'Debi T.',
  'Billy G.', 'Festus A.', 'Jim M.', 'Shawnte B.', 'Ravi S.', 'Nidaa',
  'Besem O.', 'Angela H.', 'Willie T.', 'Kim', 'Sameer V.', 'Nancy F.',
  'Walter W.', 'Roy W.', 'Jeff B.', 'Varadha R.', 'Ely K.', 'Jana S.',
  'Debbie', 'Heath D.', 'Charlie P.', 'Ricky S.', 'Meeta B.', 'Bob F.',
  'Sergio C.', 'Michael', 'Prashanth N.', 'Michele F.', 'Bryan', 'Devia W.',
  'Kevin D.', 'Nicholas B.', 'Susanne B.', 'Regan D.', 'Robert M.', 'Angel P.',
  'San S.', 'Adam R.', 'Bradley S.', 'David F.', 'Adrienne B.', 'Chris M.',
  'Vivian M.', 'Mike F.',
]

type ParsedName = { first: string; lastInitial: string | null }

function parseReviewName(raw: string): ParsedName | null {
  const name = raw.trim()
  if (!name || name === 'Verified Customer') return null
  const parts = name.split(/\s+/)
  if (parts.length === 1) return { first: parts[0], lastInitial: null }
  const last = parts[parts.length - 1].replace(/\.$/, '')
  return { first: parts[0], lastInitial: last[0]?.toUpperCase() || null }
}

const PARSED_REVIEW_NAMES: ParsedName[] = THUMBTACK_NAMES
  .map(parseReviewName)
  .filter((n): n is ParsedName => n !== null)

export function matchesThumbtrack(fullName: string): boolean {
  const parts = fullName.trim().split(/\s+/)
  const sqFirst = parts[0]?.toLowerCase()
  const sqLast = parts.length > 1 ? parts[parts.length - 1] : ''
  const sqInitial = sqLast[0]?.toUpperCase() || null

  return PARSED_REVIEW_NAMES.some((rn) => {
    if (rn.first.toLowerCase() !== sqFirst) return false
    if (rn.lastInitial && sqInitial && rn.lastInitial !== sqInitial) return false
    return true
  })
}

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim())
  if (lines.length < 2) return []

  function parseLine(line: string): string[] {
    const values: string[] = []
    let cur = ''
    let inQ = false
    for (let i = 0; i < line.length; i++) {
      const c = line[i]
      if (c === '"') {
        if (inQ && line[i + 1] === '"') { cur += '"'; i++ }
        else inQ = !inQ
      } else if (c === ',' && !inQ) {
        values.push(cur.trim()); cur = ''
      } else {
        cur += c
      }
    }
    values.push(cur.trim())
    return values
  }

  const rawHeaders = parseLine(lines[0])
  const headers = rawHeaders.map((h) =>
    h.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
  )

  return lines.slice(1).map((line) => {
    const vals = parseLine(line)
    const record: Record<string, string> = {}
    headers.forEach((h, i) => { record[h] = vals[i] || '' })
    return record
  })
}

function getCol(row: Record<string, string>, ...keys: string[]): string {
  for (const k of keys) {
    if (row[k]?.trim()) return row[k].trim()
  }
  return ''
}

export async function POST(request: NextRequest) {
  try {
    const unauthorized = requireAuth(request)
    if (unauthorized) return unauthorized

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    if (!file) {
      return NextResponse.json({ success: false, message: 'No file uploaded.' }, { status: 400 })
    }

    const text = await file.text()
    const rows = parseCSV(text)
    if (rows.length === 0) {
      return NextResponse.json({ success: false, message: 'CSV appears empty or unreadable.' }, { status: 400 })
    }

    const supabase = getSupabase()
    let imported = 0
    let matched = 0
    let skipped = 0
    const matchedNames: string[] = []

    for (const row of rows) {
      const firstName = getCol(row, 'first_name', 'firstname', 'given_name')
      const lastName = getCol(row, 'last_name', 'lastname', 'family_name', 'surname')
      const email = getCol(row, 'email_address', 'email')
      const phone = getCol(row, 'phone_number', 'phone', 'mobile', 'mobile_phone')

      if (!email || !firstName) { skipped++; continue }

      const fullName = [firstName, lastName].filter(Boolean).join(' ')

      const isMatch = matchesThumbtrack(fullName)
      if (!isMatch) { skipped++; continue }

      matched++
      matchedNames.push(fullName)

      // Upsert by normalized email
      const normalizedEmail = email.toLowerCase().trim()
      const { error } = await supabase.from('new_customers').upsert(
        {
          name: fullName,
          email: normalizedEmail,
          normalized_email: normalizedEmail,
          phone: phone || 'unknown',
          source: 'Square',
          status: 'square-import',
          last_request_at: new Date().toISOString(),
        },
        { onConflict: 'normalized_email', ignoreDuplicates: false }
      )

      if (!error) imported++
    }

    return NextResponse.json({
      success: true,
      total: rows.length,
      matched,
      imported,
      skipped,
      matchedNames,
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Import failed.' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const unauthorized = requireAuth(request)
    if (unauthorized) return unauthorized

    const supabase = getSupabase()
    const { data, error } = await supabase
      .from('new_customers')
      .select('id, name, email, status, source, last_request_at')
      .eq('source', 'Square')
      .order('name')

    if (error) throw error

    return NextResponse.json({ success: true, customers: data || [] })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Failed to load.' },
      { status: 500 }
    )
  }
}
