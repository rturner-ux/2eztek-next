'use client'

import { useMemo, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const brandOptions = [
  'NordicTrack',
  'ProForm',
  'Landmark Athletics',
  'Bowflex',
  'Marcy',
  'Peloton',
  'Life Fitness',
  'Precor',
  'Matrix',
  'Keiser',
  'Landice',
  'Octane Fitness',
  'Nautilus',
]

const equipmentTypeOptions = [
  'Treadmill',
  'Elliptical',
  'Bike',
  'Home Gym',
  'Strength Equipment',
  'Rower',
  'Commercial Fitness Equipment',
]

type PreviewManual = {
  file: File
  originalName: string
  brand: string
  model: string
  equipmentType: string
  cleanFileName: string
  description: string
  status: 'pending' | 'uploading' | 'success' | 'error'
  error?: string
}

function cleanText(value: string) {
  return value
    .replace(/\.[^/.]+$/, '')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

function detectBrand(path: string) {
  const lower = path.toLowerCase()

  if (lower.includes('nordic')) return 'NordicTrack'
  if (lower.includes('proform')) return 'ProForm'
  if (lower.includes('landmark')) return 'Landmark Athletics'
  if (lower.includes('bowflex')) return 'Bowflex'
  if (lower.includes('marcy')) return 'Marcy'
  if (lower.includes('peloton')) return 'Peloton'
  if (lower.includes('life fitness')) return 'Life Fitness'
  if (lower.includes('precor')) return 'Precor'
  if (lower.includes('matrix')) return 'Matrix'
  if (lower.includes('keiser')) return 'Keiser'
  if (lower.includes('landice')) return 'Landice'
  if (lower.includes('octane')) return 'Octane Fitness'
  if (lower.includes('nautilus')) return 'Nautilus'

  return ''
}

function detectEquipmentType(path: string) {
  const lower = path.toLowerCase()

  if (lower.includes('treadmill')) return 'Treadmill'
  if (lower.includes('elliptical')) return 'Elliptical'
  if (lower.includes('bike')) return 'Bike'
  if (lower.includes('home gym')) return 'Home Gym'
  if (lower.includes('gym')) return 'Home Gym'
  if (lower.includes('rower')) return 'Rower'
  if (lower.includes('strength')) return 'Strength Equipment'

  return ''
}

function detectModel(fileName: string) {
  return cleanText(fileName)
    .replace(/\bmanual\b/gi, '')
    .replace(/\buser'?s\b/gi, '')
    .replace(/\bowner'?s\b/gi, '')
    .replace(/\bassembly\b/gi, '')
    .replace(/\bexplosion chart\b/gi, '')
    .replace(/\bexploded diagram\b/gi, '')
    .replace(/\bcommercial\b/gi, 'Commercial')
    .replace(/\s+/g, ' ')
    .trim()
}

function buildCleanFileName(brand: string, model: string, equipmentType: string) {
  return `${slugify(brand || 'unknown-brand')}-${slugify(
    model || 'manual'
  )}-${slugify(equipmentType || 'fitness-equipment')}.pdf`
}

function buildDescription(brand: string, model: string, equipmentType: string) {
  return `${brand || 'Fitness equipment'} ${model || 'manual'} ${
    equipmentType || ''
  } manual and technician reference.`.trim()
}

export default function BulkManualUploadPage() {
  const [manuals, setManuals] = useState<PreviewManual[]>([])
  const [globalMessage, setGlobalMessage] = useState('')

  const [bulkBrand, setBulkBrand] = useState('')
  const [bulkEquipmentType, setBulkEquipmentType] = useState('')

  const pendingCount = useMemo(
    () => manuals.filter((item) => item.status === 'pending').length,
    [manuals]
  )

  function handleFiles(files: FileList | null) {
    if (!files) return

    const selected = Array.from(files).filter(
      (file) => file.type === 'application/pdf'
    )

    const previews: PreviewManual[] = selected.map((file) => {
      const relativePath =
        (file as File & { webkitRelativePath?: string }).webkitRelativePath ||
        file.name

      const detectedBrand = detectBrand(relativePath)
      const detectedEquipmentType = detectEquipmentType(relativePath)
      const detectedModel = detectModel(file.name)

      const brand = detectedBrand || bulkBrand
      const equipmentType = detectedEquipmentType || bulkEquipmentType
      const model = detectedModel

      return {
        file,
        originalName: relativePath,
        brand,
        model,
        equipmentType,
        cleanFileName: buildCleanFileName(brand, model, equipmentType),
        description: buildDescription(brand, model, equipmentType),
        status: 'pending',
      }
    })

    setManuals(previews)
    setGlobalMessage(`${previews.length} PDF manual(s) ready for review.`)
  }

  function updateManual(index: number, field: keyof PreviewManual, value: string) {
    setManuals((current) =>
      current.map((item, itemIndex) => {
        if (itemIndex !== index) return item

        const updated = {
          ...item,
          [field]: value,
        }

        if (
          field === 'brand' ||
          field === 'model' ||
          field === 'equipmentType'
        ) {
          updated.cleanFileName = buildCleanFileName(
            updated.brand,
            updated.model,
            updated.equipmentType
          )
          updated.description = buildDescription(
            updated.brand,
            updated.model,
            updated.equipmentType
          )
        }

        return updated
      })
    )
  }

  function applyBulkDefaults() {
    setManuals((current) =>
      current.map((item) => {
        const updated = {
          ...item,
          brand: bulkBrand || item.brand,
          equipmentType: bulkEquipmentType || item.equipmentType,
        }

        updated.cleanFileName = buildCleanFileName(
          updated.brand,
          updated.model,
          updated.equipmentType
        )

        updated.description = buildDescription(
          updated.brand,
          updated.model,
          updated.equipmentType
        )

        return updated
      })
    )

    setGlobalMessage('Bulk defaults applied.')
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
      if (!item.brand.trim() || !item.model.trim()) {
        throw new Error('Brand and model are required before upload.')
      }

      const filePath = `manuals/${slugify(item.brand)}/${item.cleanFileName}`

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

      const { error: insertError } = await supabase
        .from('equipment_manuals')
        .insert({
          brand: item.brand.trim(),
          model: item.model.trim(),
          equipment_type: item.equipmentType.trim(),
          description: item.description.trim(),
          manual_url: publicUrl,
        })

      if (insertError) throw insertError

      setManuals((current) =>
        current.map((manual, manualIndex) =>
          manualIndex === index
            ? { ...manual, status: 'success', error: undefined }
            : manual
        )
      )
    } catch (error: any) {
      setManuals((current) =>
        current.map((manual, manualIndex) =>
          manualIndex === index
            ? {
                ...manual,
                status: 'error',
                error: error.message || 'Upload failed.',
              }
            : manual
        )
      )
    }
  }

  async function uploadAll() {
    setGlobalMessage('Uploading manuals...')

    for (let index = 0; index < manuals.length; index++) {
      if (manuals[index].status === 'pending') {
        await uploadOne(manuals[index], index)
      }
    }

    setGlobalMessage('Bulk upload finished. Check any error messages below.')
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
            SmartGymOps Bulk Manual Importer
          </div>

          <h1 className="text-5xl font-black">Bulk Upload Manuals</h1>

          <p className="mt-4 max-w-3xl text-white/60">
            Upload multiple PDF manuals at once. Apply a brand and equipment
            type to all selected files, review the model names, and upload them
            into the public manuals database.
          </p>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8">
          <div className="mb-8 grid gap-5 md:grid-cols-3">
            <label>
              <span className="mb-2 block text-xs font-black uppercase tracking-[0.2em] text-cyan-300">
                Default Brand
              </span>

              <select
                value={bulkBrand}
                onChange={(event) => setBulkBrand(event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-black/30 px-5 py-4 text-white outline-none"
              >
                <option value="" className="bg-[#050B14]">
                  Select Brand
                </option>

                {brandOptions.map((brand) => (
                  <option
                    key={brand}
                    value={brand}
                    className="bg-[#050B14]"
                  >
                    {brand}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span className="mb-2 block text-xs font-black uppercase tracking-[0.2em] text-cyan-300">
                Default Equipment Type
              </span>

              <select
                value={bulkEquipmentType}
                onChange={(event) =>
                  setBulkEquipmentType(event.target.value)
                }
                className="w-full rounded-2xl border border-white/10 bg-black/30 px-5 py-4 text-white outline-none"
              >
                <option value="" className="bg-[#050B14]">
                  Select Type
                </option>

                {equipmentTypeOptions.map((type) => (
                  <option key={type} value={type} className="bg-[#050B14]">
                    {type}
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
              Select multiple PDFs. Use the default brand and equipment type
              above to speed up the upload process.
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
                {manuals.length} manual(s) loaded. {pendingCount} pending.
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
                  disabled={pendingCount === 0}
                  className="rounded-2xl bg-cyan-400 px-6 py-3 text-sm font-black uppercase tracking-wide text-black disabled:opacity-50"
                >
                  Upload All Pending
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
                    value={manual.brand}
                    onChange={(event) =>
                      updateManual(index, 'brand', event.target.value)
                    }
                    className="rounded-2xl border border-white/10 bg-black/30 px-5 py-4 text-white outline-none"
                  >
                    <option value="" className="bg-[#050B14]">
                      Select Brand
                    </option>

                    {brandOptions.map((brand) => (
                      <option
                        key={brand}
                        value={brand}
                        className="bg-[#050B14]"
                      >
                        {brand}
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
                    value={manual.equipmentType}
                    onChange={(event) =>
                      updateManual(index, 'equipmentType', event.target.value)
                    }
                    className="rounded-2xl border border-white/10 bg-black/30 px-5 py-4 text-white outline-none"
                  >
                    <option value="" className="bg-[#050B14]">
                      Select Type
                    </option>

                    {equipmentTypeOptions.map((type) => (
                      <option
                        key={type}
                        value={type}
                        className="bg-[#050B14]"
                      >
                        {type}
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