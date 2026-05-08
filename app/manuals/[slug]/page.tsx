import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export default async function ManualDetailPage({
  params,
}: {
  params: { slug: string }
}) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data: model } = await supabase
    .from('equipment_models')
    .select(`
      id,
      model,
      slug,
      brands ( name ),
      equipment_categories ( name )
    `)
    .eq('slug', params.slug)
    .single()

  if (!model) notFound()

  const { data: manuals } = await supabase
    .from('equipment_manuals_v2')
    .select('id, manual_url, manual_type, description, created_at')
    .eq('model_id', model.id)
    .order('created_at', { ascending: false })

  const brand = (model.brands as any)?.name || 'Fitness Equipment'
  const category =
    (model.equipment_categories as any)?.name || 'Fitness Equipment'

  return (
    <main className="min-h-screen bg-[#050B14] text-white">
      <section className="border-b border-white/10 bg-gradient-to-b from-cyan-500/10 to-transparent">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <Link href="/manuals" className="text-sm font-bold text-cyan-300">
            ← Back to Manuals
          </Link>

          <div className="mt-8 max-w-4xl">
            <div className="mb-4 inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-1 text-xs font-black uppercase tracking-[0.25em] text-cyan-300">
              {brand} Manual Library
            </div>

            <h1 className="text-5xl font-black leading-tight md:text-6xl">
              {brand} {model.model}
            </h1>

            <p className="mt-6 text-lg leading-8 text-white/70">
              Access manuals, service references, assembly guides, and
              troubleshooting resources for the {brand} {model.model}.
            </p>

            <div className="mt-6 text-sm font-bold uppercase tracking-wide text-white/40">
              {category}
            </div>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/request-service"
                className="rounded-2xl bg-cyan-400 px-8 py-4 text-sm font-black uppercase tracking-wide text-black"
              >
                Request Service
              </Link>

              <a
                href="tel:9728077232"
                className="rounded-2xl border border-white/15 bg-white/5 px-8 py-4 text-sm font-black uppercase tracking-wide text-white"
              >
                Call 972-807-7232
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <h2 className="text-4xl font-black">Available Documents</h2>

        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {(manuals || []).map((manual) => (
            <div
              key={manual.id}
              className="rounded-3xl border border-white/10 bg-white/5 p-7"
            >
              <div className="text-xs font-black uppercase tracking-[0.25em] text-cyan-300">
                {manual.manual_type || 'Manual'}
              </div>

              <h3 className="mt-4 text-2xl font-black">
                {model.model}
              </h3>

              {manual.description && (
                <p className="mt-4 leading-7 text-white/60">
                  {manual.description}
                </p>
              )}

              <a
                href={manual.manual_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-flex rounded-2xl bg-cyan-400 px-5 py-3 text-sm font-black uppercase tracking-wide text-black"
              >
                Open Manual
              </a>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}