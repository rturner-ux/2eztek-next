import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function slugify(value: string) {
  return String(value || '')
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

function listFromText(value: FormDataEntryValue | null) {
  return String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

function boolFromForm(value: FormDataEntryValue | null) {
  return String(value) === 'true'
}

async function uploadImage(
  supabase: any,
  file: File | null,
  folder: string,
  slug: string
) {
  if (!file) return ''

  const extension = file.name.split('.').pop() || 'jpg'
  const path = `${folder}/${slug}-${Date.now()}.${extension}`
  const arrayBuffer = await file.arrayBuffer()

  const { error } = await supabase.storage
    .from('facility-spotlights')
    .upload(path, arrayBuffer, {
      contentType: file.type || 'image/jpeg',
      upsert: true,
    })

  if (error) {
    throw new Error(error.message)
  }

  const { data } = supabase.storage
    .from('facility-spotlights')
    .getPublicUrl(path)

  return data.publicUrl
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    const facilityName = String(formData.get('facility_name') || '').trim()
    const slug = slugify(String(formData.get('slug') || facilityName))

    if (!facilityName || !slug) {
      return NextResponse.json(
        { success: false, error: 'Facility name and slug are required.' },
        { status: 400 }
      )
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { success: false, error: 'Missing Supabase environment variables.' },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey)

    const imageFile = formData.get('image') as File | null
    const logoFile = formData.get('logo') as File | null

    const imageUrl = await uploadImage(supabase, imageFile, 'images', slug)
    const logoUrl = await uploadImage(supabase, logoFile, 'logos', slug)

    const payload = {
      facility_name: facilityName,
      slug,
      city: String(formData.get('city') || '').trim(),
      state: String(formData.get('state') || 'TX').trim(),
      facility_type: String(formData.get('facility_type') || '').trim(),
      image_url: imageUrl || null,
      logo_url: logoUrl || null,
      headline: String(formData.get('headline') || '').trim(),
      description: String(formData.get('description') || '').trim(),
      services: listFromText(formData.get('services')),
      equipment_types: listFromText(formData.get('equipment_types')),
      spotlight_month: String(formData.get('spotlight_month') || '').trim(),
      uptime_award: boolFromForm(formData.get('uptime_award')),
      is_featured: boolFromForm(formData.get('is_featured')),
      is_published: boolFromForm(formData.get('is_published')),
    }

    const { data, error } = await supabase
      .from('facility_spotlights')
      .upsert(payload, {
        onConflict: 'slug',
      })
      .select('id, slug')
      .single()

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      facility: data,
      url: `/facility-spotlight/${slug}`,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown server error.',
      },
      { status: 500 }
    )
  }
}