import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const { password } = await req.json()
  const correct = process.env.ADMIN_BLOG_PASSWORD
  if (!correct || !password || password !== correct) {
    return NextResponse.json({ success: false }, { status: 401 })
  }
  return NextResponse.json({ success: true })
}
