import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAdminRequest } from '@/lib/serverSecurity'

export const runtime = 'nodejs'

function slugify(value: string) {
  return String(value || 'image')
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

export async function POST(request: Request) {
  try {
    const unauthorized = requireAdminRequest(request)
    if (unauthorized) return unauthorized

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const folder = String(formData.get('folder') || 'blog').trim()

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'No file uploaded.' },
        { status: 400 }
      )
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json(
        { success: false, message: 'Missing Supabase environment variables.' },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, serviceKey)

    const extension = file.name.split('.').pop() || 'jpg'
    const fileName = `${slugify(file.name.replace(`.${extension}`, ''))}-${Date.now()}.${extension}`
    const path = `${folder}/${fileName}`

    const arrayBuffer = await file.arrayBuffer()

    const { error } = await supabase.storage
      .from('blog-images')
      .upload(path, arrayBuffer, {
        contentType: file.type || 'image/jpeg',
        upsert: true,
      })

    if (error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      )
    }

    const { data } = supabase.storage.from('blog-images').getPublicUrl(path)

    return NextResponse.json({
      success: true,
      url: data.publicUrl,
      path,
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Upload failed.' },
      { status: 500 }
    )
  }
}
