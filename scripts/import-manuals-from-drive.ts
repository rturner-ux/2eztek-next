console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log(
  'SERVICE:',
  process.env.SUPABASE_SERVICE_ROLE_KEY?.substring(0, 20)
)
import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'

const ROOT = 'D:\\Assembly Manuals'
const BUCKET = 'manuals'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function walk(dir: string): string[] {
  const results: string[] = []

  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, item.name)

    if (/spaldin|spalding/i.test(fullPath)) continue

    if (item.isDirectory()) {
      results.push(...walk(fullPath))
    } else if (item.isFile() && item.name.toLowerCase().endsWith('.pdf')) {
      results.push(fullPath)
    }
  }

  return results
}

async function getOrCreateBrand(name: string) {
  const cleanName = name.trim()

  const { data: existing } = await supabase
    .from('brands')
    .select('id')
    .ilike('name', cleanName)
    .maybeSingle()

  if (existing?.id) return existing.id

  const { data, error } = await supabase
    .from('brands')
    .insert({ name: cleanName })
    .select('id')
    .single()

  if (error) throw error
  return data.id
}

async function getOrCreateModel(brandId: string, model: string, category: string) {
  const cleanModel = model.trim() || 'Unknown Model'

  const { data: existing } = await supabase
    .from('equipment_models')
    .select('id')
    .eq('brand_id', brandId)
    .eq('model', cleanModel)
    .maybeSingle()

  if (existing?.id) return existing.id

  const { data, error } = await supabase
    .from('equipment_models')
    .insert({
      brand_id: brandId,
      model: cleanModel,
      category_id: null,
    })
    .select('id')
    .single()

  if (error) throw error
  return data.id
}

async function manualExists(publicUrl: string) {
  const { data } = await supabase
    .from('equipment_manuals_v2')
    .select('id')
    .eq('manual_url', publicUrl)
    .maybeSingle()

  return Boolean(data?.id)
}

async function main() {
  const files = walk(ROOT)

  console.log(`Found ${files.length} PDF manuals.`)

  let imported = 0
  let skipped = 0
  let failed = 0

  for (const filePath of files) {
    try {
      const relative = path.relative(ROOT, filePath)
      const parts = relative.split(path.sep)

      const brand = parts[0]?.trim()
      const category = parts.length > 2 ? parts[1]?.trim() : 'General'
      const fileName = path.basename(filePath)
      const model = fileName.replace(/\.pdf$/i, '').replace(/[_-]+/g, ' ').trim()

      if (!brand || /spaldin|spalding/i.test(brand)) {
        skipped++
        continue
      }

      const storagePath = `drive-import/${slugify(brand)}/${slugify(category)}/${slugify(model)}.pdf`

      const {
        data: publicData,
      } = supabase.storage.from(BUCKET).getPublicUrl(storagePath)

      const publicUrl = publicData.publicUrl

      if (await manualExists(publicUrl)) {
        skipped++
        console.log(`Skipped duplicate: ${brand} | ${model}`)
        continue
      }

      const fileBuffer = fs.readFileSync(filePath)

      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(storagePath, fileBuffer, {
          contentType: 'application/pdf',
          upsert: false,
        })

      if (uploadError && !uploadError.message.includes('already exists')) {
        throw uploadError
      }

      const brandId = await getOrCreateBrand(brand)
      const modelId = await getOrCreateModel(brandId, model, category)

      const { error: insertError } = await supabase
        .from('equipment_manuals_v2')
        .insert({
          model_id: modelId,
          manual_url: publicUrl,
          manual_type: 'Manual',
          description: `${brand} ${model} ${category} manual and technician reference.`,
        })

      if (insertError) throw insertError

      imported++
      console.log(`Imported: ${brand} | ${category} | ${model}`)
    } catch (error: any) {
      failed++
      console.error(`Failed: ${filePath}`)
      console.error(error.message || error)
    }
  }

  console.log('Import complete.')
  console.log({ imported, skipped, failed })
}

main()