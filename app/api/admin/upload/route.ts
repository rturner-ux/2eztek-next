import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  try {
    const formData = await req.formData()

    const brand = formData.get('brand') as string
    const model = formData.get('model') as string
    const equipment_type = formData.get('equipment_type') as string
    const description = formData.get('description') as string

    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded.' },
        { status: 400 }
      )
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const safeFileName = file.name
      .toLowerCase()
      .replace(/\s+/g, '-')

    const filePath = `manuals/${safeFileName}`

    const { error: uploadError } = await supabase.storage
      .from('manuals')
      .upload(filePath, buffer, {
        contentType: 'application/pdf',
        upsert: true,
      })

    if (uploadError) {
      return NextResponse.json(
        { error: uploadError.message },
        { status: 500 }
      )
    }

    const {
      data: { publicUrl },
    } = supabase.storage
      .from('manuals')
      .getPublicUrl(filePath)

    const { error: insertError } = await supabase
      .from('equipment_manuals')
      .insert({
        brand,
        model,
        equipment_type,
        description,
        manual_url: publicUrl,
      })

    if (insertError) {
      return NextResponse.json(
        { error: insertError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      manual_url: publicUrl,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Upload failed.' },
      { status: 500 }
    )
  }
}