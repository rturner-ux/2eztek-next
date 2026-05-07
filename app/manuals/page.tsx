import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import ManualsDirectory from './ManualsDirectory'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Fitness Equipment Manuals & Troubleshooting | 2EZ TEK',
  description:
    'Search fitness equipment manuals, troubleshooting resources, repair guidance, assembly support, and preventative maintenance information.',
}

type ManualRecord = {
  id: string
  manual_url: string
  manual_type: string | null
  description: string | null
  created_at: string | null
  model: string | null
  brand: string | null
  equipment_type: string | null
}

export default async function ManualsPage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data, error } = await supabase
    .from('manuals_directory_view')
    .select(
      'id, manual_url, manual_type, description, created_at, model, brand, equipment_type'
    )
    .order('created_at', { ascending: false })

  const manuals =
    data?.map((manual: ManualRecord) => ({
      id: manual.id,
      manual_url: manual.manual_url || '',
      manual_type: manual.manual_type || 'Manual',
      description: manual.description || '',
      created_at: manual.created_at || '',
      model: manual.model || '',
      brand: manual.brand || '',
      equipment_type: manual.equipment_type || '',
    })) || []

  return (
    <main className="min-h-screen bg-[#050B14] text-white">
      <section className="border-b border-white/10 bg-gradient-to-b from-cyan-500/10 to-transparent">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="max-w-4xl">
            <div className="mb-4 inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-1 text-xs font-black uppercase tracking-[0.25em] text-cyan-300">
              Fitness Equipment Resource Center
            </div>

            <h1 className="text-5xl font-black leading-tight md:text-6xl">
              Fitness Equipment Manuals & Troubleshooting
            </h1>

            <p className="mt-6 text-lg leading-8 text-white/70">
              Search fitness equipment manuals, assembly guides,
              troubleshooting resources, repair references, and preventative
              maintenance information for residential and commercial fitness
              equipment.
            </p>

            <p className="mt-4 max-w-3xl text-white/60">
              More equipment manuals are being added regularly. If you do not
              see your brand or model listed, 2EZ TEK can still help with
              diagnostics, assembly, repair, and preventative maintenance.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/request-service"
                className="rounded-2xl bg-cyan-400 px-8 py-4 text-sm font-black uppercase tracking-wide text-black transition hover:scale-105"
              >
                Request Service
              </Link>

              <a
                href="tel:9728077232"
                className="rounded-2xl border border-white/15 bg-white/5 px-8 py-4 text-sm font-black uppercase tracking-wide text-white transition hover:border-cyan-400/50"
              >
                Call 972-807-7232
              </a>
            </div>

            {error && (
              <div className="mt-8 rounded-2xl border border-red-400/30 bg-red-500/10 p-5 text-sm text-red-200">
                Manuals could not load from the equipment library. Check the
                Supabase view named manuals_directory_view.
              </div>
            )}
          </div>
        </div>
      </section>

      <ManualsDirectory manuals={manuals} />
    </main>
  )
}