import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import ManualsDirectory from './ManualsDirectory'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata = {
  title: 'Fitness Equipment Manuals & Troubleshooting | 2EZ TEK',
  description:
    'Search fitness equipment manuals, troubleshooting resources, repair guidance, assembly support, preventative maintenance information, videos, and exploded diagrams.',
}

type ManualRecord = {
  id: string
  manual_url: string | null
  manual_type: string | null
  description: string | null
  created_at: string | null
  model: string | null
  brand: string | null
  brand_logo: string | null
  equipment_type: string | null
  slug: string | null
  mirrored_path?: string | null
}

type ManualV2Record = {
  id: string
  slug: string | null
  manual_url: string | null
  manual_type: string | null
  description: string | null
  created_at: string | null
  mirrored: boolean | null
  mirrored_path: string | null
}

type DirectoryManual = {
  id: string
  brand: string
  brand_logo: string
  model: string
  slug: string
  equipment_type: string
  manual_url: string
  manual_type: string | null
  description: string | null
  created_at: string | null
}

const STORAGE_BUCKET = 'manuals'
const STORAGE_ROOT = 'mirrored-manuals'

const BRAND_MAP: Record<string, string> = {
  'balanced-body': 'Balanced Body',
  biodex: 'Biodex',
  'body-solid': 'Body-Solid',
  bowflex: 'Bowflex',
  cybex: 'Cybex',
  'dynamic-fluid-fitness': 'Dynamic Fluid Fitness',
  'expresso-fitness': 'Expresso Fitness',
  'first-degree-fitness': 'First Degree Fitness',
  'first-degree': 'First Degree',
  freemotion: 'FreeMotion',
  'free-motion': 'FreeMotion',
  'french-fitness': 'French Fitness',
  'green-series': 'Green Series',
  'hammer-strength': 'Hammer Strength',
  'inspire-fitness': 'Inspire Fitness',
  'jacobs-ladder': 'Jacobs Ladder',
  keiser: 'Keiser',
  landice: 'Landice',
  'landmark-athletics': 'Landmark Athletics',
  'life-fitness': 'Life Fitness',
  'marpo-kinetics': 'Marpo Kinetics',
  matrix: 'Matrix',
  monark: 'Monark',
  'muscle-d': 'Muscle D',
  nautilus: 'Nautilus',
  nustep: 'Nustep',
  'octane-fitness': 'Octane Fitness',
  'paramount-fitness': 'Paramount Fitness',
  pneumap: 'Pneumap',
  'power-plate': 'Power Plate',
  powerblock: 'PowerBlock',
  precor: 'Precor',
  prx: 'PRX',
  rom: 'ROM',
  schwinn: 'Schwinn',
  scifit: 'SciFit',
  sportsart: 'SportsArt',
  stairmaster: 'Stairmaster',
  'star-trac': 'Star Trac',
  technogym: 'Technogym',
  theracycle: 'Theracycle',
  'total-gym': 'Total Gym',
  'true-fitness': 'True Fitness',
  'unknown-brand': 'Unknown Brand',
  versaclimber: 'Versaclimber',
  woodway: 'Woodway USA',
  'woodway-usa': 'Woodway USA',
}

function slugify(value: string) {
  return String(value || '')
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

function cleanText(value: string) {
  return String(value || '')
    .replace(/\.[a-z0-9]+$/i, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function titleCase(value: string) {
  return cleanText(value)
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function detectBrandFromSlug(value: string) {
  const normalized = slugify(value)

  const sortedBrands = Object.entries(BRAND_MAP).sort(
    (a, b) => b[0].length - a[0].length
  )

  for (const [key, brand] of sortedBrands) {
    if (normalized.startsWith(key)) {
      return brand
    }
  }

  return 'Unknown Brand'
}

function cleanManualSlug(value: string, brand: string) {
  const brandSlug = slugify(brand)

  return slugify(value)
    .replace(/^manuals-/, '')
    .replace(/^mirrored-manuals-/, '')
    .replace(new RegExp(`^${brandSlug}-${brandSlug}-`), `${brandSlug}-`)
}

function modelFromSlug(slug: string, brand: string) {
  const brandSlug = slugify(brand)

  const cleaned = cleanManualSlug(slug, brand).replace(
    new RegExp(`^${brandSlug}-?`),
    ''
  )

  return titleCase(cleaned) || 'Manual Resource'
}

function isSupportedFile(fileName: string) {
  const lowerName = fileName.toLowerCase()

  return (
    lowerName.endsWith('.pdf') ||
    lowerName.endsWith('.mp4') ||
    lowerName.endsWith('.mov') ||
    lowerName.endsWith('.webm')
  )
}

function normalizeStoragePath(path: string) {
  return String(path || '')
    .trim()
    .replace(/^\/+/, '')
    .replace(/^manuals\//, '')
}

function normalizeManual(
  manual: Partial<ManualRecord & ManualV2Record>,
  buildStorageUrl: (path: string | null | undefined) => string
): DirectoryManual {
  const sourceValue =
    manual.slug ||
    manual.model ||
    manual.description ||
    manual.mirrored_path ||
    manual.manual_url ||
    manual.id ||
    'manual-resource'

  const baseSlug = slugify(sourceValue)
  const detectedBrand = detectBrandFromSlug(baseSlug)
  const brand = cleanText(manual.brand || detectedBrand) || 'Unknown Brand'
  const slug = cleanManualSlug(baseSlug, brand)

  const model =
    cleanText(manual.model || '') ||
    cleanText(manual.description || '') ||
    modelFromSlug(slug, brand)

  const storedManualUrl = String(manual.manual_url || '').trim()
  const storageManualUrl = buildStorageUrl(manual.mirrored_path)

  return {
    id: String(manual.id || slug),
    brand,
    brand_logo: manual.brand_logo || '',
    model,
    slug,
    equipment_type: manual.equipment_type || 'Fitness Equipment',
    manual_type: manual.manual_type || 'Manual',
    description: cleanText(manual.description || '') || model,
    created_at: manual.created_at || '',
    manual_url: storedManualUrl || storageManualUrl,
  }
}

async function getStorageManuals(
  supabase: any,
  buildStorageUrl: (path: string | null | undefined) => string
) {
  const storageManuals: DirectoryManual[] = []

  const { data: folders, error: folderError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .list(STORAGE_ROOT, {
      limit: 1000,
      sortBy: { column: 'name', order: 'asc' },
    })

  if (folderError || !folders) {
    return storageManuals
  }

  for (const folder of folders) {
    if (!folder.name || folder.name.includes('.')) continue

    const folderPath = `${STORAGE_ROOT}/${folder.name}`

    const { data: files } = await supabase.storage
      .from(STORAGE_BUCKET)
      .list(folderPath, {
        limit: 1000,
        sortBy: { column: 'name', order: 'asc' },
      })

    if (!files) continue

    for (const file of files) {
      if (!file.name || file.name.startsWith('.')) continue
      if (!isSupportedFile(file.name)) continue

      const fullPath = `${folderPath}/${file.name}`
      const brand = BRAND_MAP[folder.name] || titleCase(folder.name)
      const fileSlug = cleanManualSlug(slugify(file.name), brand)
      const model = modelFromSlug(fileSlug, brand)
      const lowerName = file.name.toLowerCase()

      storageManuals.push({
        id: `storage-${folder.name}-${file.name}`,
        brand,
        brand_logo: '',
        model,
        slug: fileSlug,
        equipment_type: 'Fitness Equipment',
        manual_type: lowerName.endsWith('.pdf') ? 'Manual' : 'Video',
        description: model,
        created_at: file.created_at || '',
        manual_url: buildStorageUrl(fullPath),
      })
    }
  }

  return storageManuals
}

export default async function ManualsPage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  function buildStorageUrl(path: string | null | undefined) {
    const cleanedPath = normalizeStoragePath(String(path || ''))

    if (!cleanedPath) {
      return ''
    }

    const { data } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(cleanedPath)

    return data.publicUrl
  }

  const { data: viewData, error: viewError } = await supabase
    .from('manuals_directory_view')
    .select(
      'id, manual_url, manual_type, description, created_at, model, brand, brand_logo, equipment_type, slug'
    )
    .order('brand', { ascending: true })
    .order('model', { ascending: true })
    .limit(5000)

  const { data: v2Data, error: v2Error } = await supabase
    .from('equipment_manuals_v2')
    .select(
      'id, slug, manual_url, manual_type, description, created_at, mirrored, mirrored_path'
    )
    .order('created_at', { ascending: false })
    .limit(5000)

  const viewManuals = (viewData || []).map((manual) =>
    normalizeManual(manual as ManualRecord, buildStorageUrl)
  )

  const v2Manuals = (v2Data || []).map((manual) =>
    normalizeManual(manual as ManualV2Record, buildStorageUrl)
  )

  const storageManuals = await getStorageManuals(supabase, buildStorageUrl)

  const manuals = Array.from(
    new Map(
      [...viewManuals, ...v2Manuals, ...storageManuals]
        .filter((manual) => manual.manual_url)
        .map((manual) => [
          `${slugify(manual.brand)}-${slugify(manual.model)}-${manual.manual_url}`,
          manual,
        ])
    ).values()
  ).sort((a, b) => {
    const brandCompare = a.brand.localeCompare(b.brand)

    if (brandCompare !== 0) return brandCompare

    return a.model.localeCompare(b.model)
  })

  const totalManuals = manuals.length
  const totalBrands = new Set(manuals.map((manual) => manual.brand)).size

  return (
    <main className="min-h-screen bg-[#050B14] text-white">
      <section className="relative overflow-hidden border-b border-white/10 bg-[#050B14]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.22),transparent_34%),linear-gradient(180deg,rgba(34,211,238,0.08),transparent_45%)]" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-cyan-300/40 to-transparent" />

        <div className="relative mx-auto max-w-7xl px-6 pb-20 pt-32">
          <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <div className="mb-5 inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-xs font-black uppercase tracking-[0.25em] text-cyan-300">
                Fitness Equipment Resource Center
              </div>

              <h1 className="max-w-5xl text-5xl font-black leading-[0.95] tracking-tight md:text-7xl">
                Manuals, Repair Help
                <span className="block text-cyan-300">
                  & Troubleshooting.
                </span>
              </h1>

              <p className="mt-7 max-w-3xl text-lg leading-8 text-white/70">
                Search owner manuals, assembly guides, troubleshooting resources,
                preventative maintenance documentation, exploded diagrams, videos,
                and service references for residential and commercial fitness equipment.
              </p>

              <div className="mt-10 flex flex-wrap gap-4">
                <Link
                  href="/contact"
                  prefetch={false}
                  className="rounded-2xl bg-cyan-400 px-8 py-4 text-sm font-black uppercase tracking-wide text-black shadow-[0_0_35px_rgba(34,211,238,0.22)] transition hover:scale-105 hover:bg-cyan-300"
                >
                  Request Service
                </Link>

                <a
                  href="tel:9728077232"
                  className="rounded-2xl border border-white/15 bg-white/5 px-8 py-4 text-sm font-black uppercase tracking-wide text-white transition hover:border-cyan-400/50 hover:bg-cyan-400/10"
                >
                  Call 972-807-7232
                </a>
              </div>

              {(viewError || v2Error) && (
                <div className="mt-8 rounded-2xl border border-red-400/30 bg-red-500/10 p-5 text-sm text-red-200">
                  Some database manuals could not load, but Supabase Storage was still checked.
                </div>
              )}
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 shadow-[0_30px_100px_rgba(0,0,0,0.35)] backdrop-blur-xl">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-3xl border border-white/10 bg-black/25 p-5">
                  <div className="text-4xl font-black text-cyan-300">
                    {totalManuals}
                  </div>

                  <div className="mt-2 text-xs font-black uppercase tracking-[0.18em] text-white/50">
                    Files
                  </div>
                </div>

                <div className="rounded-3xl border border-white/10 bg-black/25 p-5">
                  <div className="text-4xl font-black text-cyan-300">
                    {totalBrands}
                  </div>

                  <div className="mt-2 text-xs font-black uppercase tracking-[0.18em] text-white/50">
                    Brands
                  </div>
                </div>

                <div className="rounded-3xl border border-white/10 bg-black/25 p-5">
                  <div className="text-4xl font-black text-cyan-300">
                    24/7
                  </div>

                  <div className="mt-2 text-xs font-black uppercase tracking-[0.18em] text-white/50">
                    Access
                  </div>
                </div>
              </div>

              <div className="mt-5 rounded-3xl border border-cyan-400/20 bg-cyan-400/10 p-5">
                <h2 className="text-xl font-black text-white">
                  Storage Files Now Included
                </h2>

                <p className="mt-3 text-sm leading-6 text-white/65">
                  This page now checks both your database records and the Supabase
                  Storage bucket directly, including mirrored manual folders like
                  Precor, Octane Fitness, Life Fitness, Matrix, Power Plate, and more.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <ManualsDirectory manuals={manuals} />
    </main>
  )
}