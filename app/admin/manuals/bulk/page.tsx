'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Brand = {
  id: string
  name: string
}

type Category = {
  id: string
  name: string
}

type ManualStatus = 'pending' | 'uploading' | 'success' | 'error'

type PreviewManual = {
  file: File
  originalName: string
  brandName: string
  categoryName: string
  model: string
  cleanFileName: string
  description: string
  status: ManualStatus
  error?: string
  uploadedUrl?: string
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

function cleanText(value: string) {
  return value
    .replace(/\.[^/.]+$/, '')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function detectBrand(path: string, brands: Brand[]) {
  const lower = path.toLowerCase()

  const match = brands.find((brand) =>
    lower.includes(brand.name.toLowerCase())
  )

  if (match) return match.name

  if (lower.includes('nordic')) return 'NordicTrack'
  if (lower.includes('proform')) return 'ProForm'
  if (lower.includes('landmark')) return 'Landmark Athletics'

  return ''
}

function detectCategory(path: string, categories: Category[]) {
  const lower = path.toLowerCase()

  const match = categories.find((category) =>
    lower.includes(category.name.toLowerCase())
  )

  if (match) return match.name

  if (lower.includes('treadmill')) return 'Treadmill'
  if (lower.includes('elliptical')) return 'Elliptical'
  if (lower.includes('cross trainer')) return 'Cross Trainer'
  if (lower.includes('exercise bike')) return 'Exercise Bike'
  if (lower.includes('bike')) return 'Bike'
  if (lower.includes('bench')) return 'Bench'
  if (lower.includes('strength')) return 'Strength'
  if (lower.includes('home gym')) return 'Home Gym'
  if (lower.includes('rower')) return 'Rower'
  if (lower.includes('skier')) return 'Skier'
  if (lower.includes('commercial')) return 'Commercial Fitness Equipment'

  return ''
}

function detectModel(fileName: string) {
  return cleanText(fileName)
    .replace(/\bmanual\b/gi, '')
    .replace(/\buser'?s\b/gi, '')
    .replace(/\bowner'?s\b/gi, '')
    .replace(/\bassembly\b/gi, '')
    .replace(/\binstructions?\b/gi, '')
    .replace(/\bexplosion chart\b/gi, '')
    .replace(/\bexploded diagram\b/gi, '')
    .replace(/\bparts list\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function buildCleanFileName(
  brandName: string,
  model: string,
  categoryName: string
) {
  return `${slugify(brandName || 'unknown-brand')}-${slugify(
    model || 'manual'
  )}-${slugify(categoryName || 'fitness-equipment')}.pdf`
}

function buildDescription(
  brandName: string,
  model: string,
  categoryName: string
) {
  return `${brandName || 'Fitness equipment'} ${model || 'manual'} ${
    categoryName || ''
  } manual and technician reference.`.trim()
}

export default function BulkManualUploadPage() {
  const [brands, setBrands] = useState<Brand[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [manuals, setManuals] = useState<PreviewManual[]>([])
  const [globalMessage, setGlobalMessage] = useState('')
  const [bulkBrandName, setBulkBrandName] = useState('')
  const [bulkCategoryName, setBulkCategoryName] = useState('')
  const [loadingOptions, setLoadingOptions] = useState(true)

  useEffect(() => {
    async function loadOptions() {
      setLoadingOptions(true)

      const { data: brandData } = await supabase
        .from('brands')
        .select('id, name')
        .order('name', { ascending: true })

      const { data: categoryData } = await supabase
        .from('equipment_categories')
        .select('id, name')
        .order('name', { ascending: true })

      setBrands(brandData || [])
      setCategories(categoryData || [])
      setLoadingOptions(false)
    }

    loadOptions()
  }, [])

  const pendingCount = useMemo(
    () => manuals.filter((item) => item.status === 'pending').length,
    [manuals]
  )

  const errorCount = useMemo(
    () => manuals.filter((item) => item.status === 'error').length,
    [manuals]
  )

  function buildPreview(file: File): PreviewManual {
    const relativePath =
      (file as File & { webkitRelativePath?: string }).webkitRelativePath ||
      file.name

    const brandName =
      detectBrand(relativePath, brands) || bulkBrandName

    const categoryName =
      detectCategory(relativePath, categories) || bulkCategoryName

    const model = detectModel(file.name)

    return {
      file,
      originalName: relativePath,
      brandName,
      categoryName,
      model,
      cleanFileName: buildCleanFileName(brandName, model, categoryName),
      description: buildDescription(brandName, model, categoryName),
      status: 'pending',
    }
  }

  function handleFiles(files: FileList | null) {
    if (!files) return

    const selected = Array.from(files).filter(
      (file) =>
        file.type === 'application/pdf' ||
        file.name.toLowerCase().endsWith('.pdf')
    )

    const previews = selected.map(buildPreview)

    setManuals(previews)
    setGlobalMessage(`${previews.length} PDF manual(s) ready for review.`)
  }

  function updateManual(
    index: number,
    field: 'brandName' | 'categoryName' | 'model' | 'description',
    value: string
  ) {
    setManuals((current) =>
      current.map((item, itemIndex) => {
        if (itemIndex !== index) return item

        const updated: PreviewManual = {
          ...item,
          [field]: value,
          status: item.status === 'success' ? 'success' : 'pending',
          error: undefined,
        }

        if (
          field === 'brandName' ||
          field === 'categoryName' ||
          field === 'model'
        ) {
          updated.cleanFileName = buildCleanFileName(
            updated.brandName,
            updated.model,
            updated.categoryName
          )

          updated.description = buildDescription(
            updated.brandName,
            updated.model,
            updated.categoryName
          )
        }

        return updated
      })
    )
  }

  function applyBulkDefaults() {
    setManuals((current) =>
      current.map((item) => {
        const updated: PreviewManual = {
          ...item,
          brandName: bulkBrandName || item.brandName,
          categoryName: bulkCategoryName || item.categoryName,
          status: item.status === 'success' ? 'success' : 'pending',
          error: undefined,
        }

        updated.cleanFileName = buildCleanFileName(
          updated.brandName,
          updated.model,
          updated.categoryName
        )

        updated.description = buildDescription(
          updated.brandName,
          updated.model,
          updated.categoryName
        )

        return updated
      })
    )

    setGlobalMessage('Bulk defaults applied.')
  }

  async function getOrCreateModel(item: PreviewManual) {
    const brand = brands.find((brandItem) => brandItem.name === item.brandName)
    const category = categories.find(
      (categoryItem) => categoryItem.name === item.categoryName
    )

    if (!brand) {
      throw new Error(`Brand not found: ${item.brandName}`)
    }

    const { data: existingModel, error: existingError } = await supabase
      .from('equipment_models')
      .select('id')
      .eq('brand_id', brand.id)
      .eq('model', item.model.trim())
      .maybeSingle()

    if (existingError) throw existingError

    if (existingModel?.id) {
      return existingModel.id as string
    }

    const { data: createdModel, error: createError } = await supabase
      .from('equipment_models')
      .insert({
        brand_id: brand.id,
        category_id: category?.id || null,
        model: item.model.trim(),
      })
      .select('id')
      .single()

    if (createError) throw createError

    return createdModel.id as string
  }

  async function uploadOne(item: PreviewManual, index: number) {
    setManuals((current) =>
      current.map((manual, manualIndex) =>
        manualIndex === index
          ? { ...manual, status: 'uploading', error: undefined }
          : manual
      )
    )

    try {
      if (!item.brandName.trim() || !item.model.trim()) {
        throw new Error('Brand and model are required before upload.')
      }

      const modelId = await getOrCreateModel(item)

      const filePath = `manuals/${slugify(item.brandName)}/${item.cleanFileName}`

      const { error: uploadError } = await supabase.storage
        .from('manuals')
        .upload(filePath, item.file, {
          cacheControl: '3600',
          upsert: true,
        })

      if (uploadError) throw uploadError

      const {
        data: { publicUrl },
      } = supabase.storage.from('manuals').getPublicUrl(filePath)

      await supabase
        .from('equipment_manuals_v2')
        .delete()
        .eq('manual_url', publicUrl)

      const { error: insertError } = await supabase
        .from('equipment_manuals_v2')
        .insert({
          model_id: modelId,
          manual_url: publicUrl,
          manual_type: 'Manual',
          description: item.description.trim(),
        })

      if (insertError) throw insertError

      setManuals((current) =>
        current.map((manual, manualIndex) =>
          manualIndex === index
            ? {
                ...manual,
                status: 'success',
                error: undefined,
                uploadedUrl: publicUrl,
              }
            : manual
        )
      )
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Upload failed.'

      setManuals((current) =>
        current.map((manual, manualIndex) =>
          manualIndex === index
            ? {
                ...manual,
                status: 'error',
                error: message,
              }
            : manual
        )
      )
    }
  }

  async function uploadAll() {
    setGlobalMessage('Uploading manuals...')

    for (let index = 0; index < manuals.length; index++) {
      const item = manuals[index]

      if (item.status === 'pending' || item.status === 'error') {
        await uploadOne(item, index)
      }
    }

    setGlobalMessage('Bulk upload finished. Review any error messages below.')
  }

  function resetManuals() {
    setManuals([])
    setGlobalMessage('')
  }

  return (
    <main className="min-h-screen bg-[#050B14] px-6 py-20 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10">
          <div className="mb-4 inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-1 text-xs font-black uppercase tracking-[0.25em] text-cyan-300">
            SmartGymOps Bulk Manual Importer V2
          </div>

          <h1 className="text-5xl font-black">Bulk Upload Manuals</h1>

          <p className="mt-4 max-w-3xl text-white/60">
            Upload multiple PDF manuals into the normalized SmartGymOps
            equipment library using brands, equipment categories, models, and
            manual records.
          </p>
        </div>

        {loadingOptions && (
          <div className="mb-6 rounded-2xl border border-white/10 bg-white/5 p-5 text-white/70">
            Loading brands and categories...
          </div>
        )}

        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8">
          <div className="mb-8 grid gap-5 md:grid-cols-3">
            <label>
              <span className="mb-2 block text-xs font-black uppercase tracking-[0.2em] text-cyan-300">
                Default Brand
              </span>

              <select
                value={bulkBrandName}
                onChange={(event) => setBulkBrandName(event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-black/30 px-5 py-4 text-white outline-none"
              >
                <option value="" className="bg-[#050B14]">
                  Select Brand
                </option>

                {brands.map((brand) => (
                  <option
                    key={brand.id}
                    value={brand.name}
                    className="bg-[#050B14]"
                  >
                    {brand.name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span className="mb-2 block text-xs font-black uppercase tracking-[0.2em] text-cyan-300">
                Default Equipment Category
              </span>

              <select
                value={bulkCategoryName}
                onChange={(event) => setBulkCategoryName(event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-black/30 px-5 py-4 text-white outline-none"
              >
                <option value="" className="bg-[#050B14]">
                  Select Category
                </option>

                {categories.map((category) => (
                  <option
                    key={category.id}
                    value={category.name}
                    className="bg-[#050B14]"
                  >
                    {category.name}
                  </option>
                ))}
              </select>
            </label>

            <div className="flex items-end">
              <button
                type="button"
                onClick={applyBulkDefaults}
                disabled={manuals.length === 0}
                className="w-full rounded-2xl border border-cyan-400/30 bg-cyan-400/10 px-5 py-4 text-sm font-black uppercase tracking-wide text-cyan-300 disabled:opacity-50"
              >
                Apply To Loaded Files
              </button>
            </div>
          </div>

          <label className="block rounded-3xl border border-dashed border-cyan-400/30 bg-cyan-400/5 p-10 text-center">
            <div className="text-2xl font-black">Select PDF Manuals</div>

            <p className="mt-3 text-white/60">
              Select multiple PDF files. Apply default brand and category first
              if the files do not include folder path information.
            </p>

            <input
              type="file"
              accept="application/pdf"
              multiple
              onChange={(event) => handleFiles(event.target.files)}
              className="mt-8 w-full rounded-2xl border border-white/10 bg-black/30 px-5 py-4 text-white file:mr-4 file:rounded-xl file:border-0 file:bg-cyan-400 file:px-4 file:py-2 file:text-sm file:font-black file:text-black"
            />
          </label>

          {globalMessage && (
            <div className="mt-6 rounded-2xl border border-white/10 bg-black/30 p-4 text-white/70">
              {globalMessage}
            </div>
          )}

          {manuals.length > 0 && (
            <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
              <div className="text-sm text-white/50">
                {manuals.length} loaded. {pendingCount} pending. {errorCount}{' '}
                error(s).
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={resetManuals}
                  className="rounded-2xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-black uppercase tracking-wide text-white"
                >
                  Clear List
                </button>

                <button
                  type="button"
                  onClick={uploadAll}
                  disabled={manuals.length === 0}
                  className="rounded-2xl bg-cyan-400 px-6 py-3 text-sm font-black uppercase tracking-wide text-black disabled:opacity-50"
                >
                  Upload Pending And Failed
                </button>
              </div>
            </div>
          )}
        </div>

        {manuals.length > 0 && (
          <div className="mt-10 grid gap-6">
            {manuals.map((manual, index) => (
              <div
                key={`${manual.originalName}-${index}`}
                className="rounded-[2rem] border border-white/10 bg-white/5 p-6"
              >
                <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <div className="text-xs font-black uppercase tracking-[0.2em] text-cyan-300">
                      Original File
                    </div>

                    <div className="mt-2 break-all text-white/70">
                      {manual.originalName}
                    </div>
                  </div>

                  <div
                    className={`rounded-full px-4 py-2 text-xs font-black uppercase tracking-wide ${
                      manual.status === 'success'
                        ? 'bg-emerald-400/15 text-emerald-300'
                        : manual.status === 'error'
                          ? 'bg-red-400/15 text-red-300'
                          : manual.status === 'uploading'
                            ? 'bg-yellow-400/15 text-yellow-300'
                            : 'bg-white/10 text-white/60'
                    }`}
                  >
                    {manual.status}
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <select
                    value={manual.brandName}
                    onChange={(event) =>
                      updateManual(index, 'brandName', event.target.value)
                    }
                    className="rounded-2xl border border-white/10 bg-black/30 px-5 py-4 text-white outline-none"
                  >
                    <option value="" className="bg-[#050B14]">
                      Select Brand
                    </option>

                    {brands.map((brand) => (
                      <option
                        key={brand.id}
                        value={brand.name}
                        className="bg-[#050B14]"
                      >
                        {brand.name}
                      </option>
                    ))}
                  </select>

                  <input
                    value={manual.model}
                    onChange={(event) =>
                      updateManual(index, 'model', event.target.value)
                    }
                    placeholder="Model"
                    className="rounded-2xl border border-white/10 bg-black/30 px-5 py-4 text-white outline-none"
                  />

                  <select
                    value={manual.categoryName}
                    onChange={(event) =>
                      updateManual(index, 'categoryName', event.target.value)
                    }
                    className="rounded-2xl border border-white/10 bg-black/30 px-5 py-4 text-white outline-none"
                  >
                    <option value="" className="bg-[#050B14]">
                      Select Category
                    </option>

                    {categories.map((category) => (
                      <option
                        key={category.id}
                        value={category.name}
                        className="bg-[#050B14]"
                      >
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <textarea
                  value={manual.description}
                  onChange={(event) =>
                    updateManual(index, 'description', event.target.value)
                  }
                  placeholder="Description"
                  className="mt-4 min-h-[110px] w-full rounded-2xl border border-white/10 bg-black/30 px-5 py-4 text-white outline-none"
                />

                <div className="mt-4 rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-white/60">
                  Clean filename:{' '}
                  <span className="font-bold text-cyan-300">
                    {manual.cleanFileName}
                  </span>
                </div>

                {manual.uploadedUrl && (
                  <a
                    href={manual.uploadedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 block rounded-2xl border border-emerald-400/30 bg-emerald-400/10 p-4 text-sm font-bold text-emerald-300"
                  >
                    Open uploaded manual
                  </a>
                )}

                {manual.error && (
                  <div className="mt-4 rounded-2xl border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-200">
                    {manual.error}
                  </div>
                )}

                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => uploadOne(manual, index)}
                    disabled={manual.status === 'uploading'}
                    className="rounded-2xl bg-cyan-400 px-5 py-3 text-sm font-black uppercase tracking-wide text-black disabled:opacity-50"
                  >
                    Upload This Manual
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}