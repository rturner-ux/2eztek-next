import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default async function EquipmentListingsPage() {
  const { data: listings } = await supabase
    .from('equipment_listings')
    .select('*')
    .eq('status', 'approved')
    .order('created_at', { ascending: false })

  return (
    <main className="min-h-screen bg-[#050B14] text-white">
      <section className="border-b border-white/10 bg-gradient-to-b from-cyan-500/10 to-transparent">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="max-w-4xl">
            <div className="mb-4 inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-1 text-xs font-black uppercase tracking-[0.25em] text-cyan-300">
              SmartGymOps Marketplace
            </div>

            <h1 className="text-5xl font-black md:text-6xl">
              Fitness Equipment Marketplace
            </h1>

            <p className="mt-6 text-lg leading-8 text-white/65">
              Browse fitness equipment listings from local sellers. Need
              delivery, installation, diagnostics, repairs, or preventative
              maintenance? 2EZ TEK can help.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/equipment-for-sale/new"
                className="rounded-2xl bg-cyan-400 px-8 py-4 text-sm font-black uppercase tracking-wide text-black"
              >
                List Equipment
              </Link>

              <Link
                href="/contact"
                className="rounded-2xl border border-white/15 bg-white/5 px-8 py-4 text-sm font-black uppercase tracking-wide text-white"
              >
                Request Service
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        {listings?.length ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {listings.map((listing: any) => (
              <div
                key={listing.id}
                className="rounded-[2rem] border border-white/10 bg-white/5 p-7"
              >
                <div className="mb-3 inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-black uppercase tracking-wide text-cyan-300">
                  {listing.category || 'Fitness Equipment'}
                </div>

                <h2 className="text-2xl font-black">
                  {listing.title}
                </h2>

                <div className="mt-4 space-y-2 text-white/65">
                  <p>
                    <span className="font-bold text-white">
                      Brand:
                    </span>{' '}
                    {listing.brand || 'N/A'}
                  </p>

                  <p>
                    <span className="font-bold text-white">
                      Model:
                    </span>{' '}
                    {listing.model || 'N/A'}
                  </p>

                  <p>
                    <span className="font-bold text-white">
                      Condition:
                    </span>{' '}
                    {listing.condition || 'N/A'}
                  </p>

                  <p>
                    <span className="font-bold text-white">
                      Location:
                    </span>{' '}
                    {listing.city}, {listing.state}
                  </p>
                </div>

                {listing.price && (
                  <div className="mt-6 text-4xl font-black text-cyan-300">
                    ${Number(listing.price).toLocaleString()}
                  </div>
                )}

                {listing.description && (
                  <p className="mt-6 line-clamp-4 leading-7 text-white/60">
                    {listing.description}
                  </p>
                )}

                <div className="mt-8 flex flex-wrap gap-3">
                  <a
                    href={`mailto:${listing.seller_email}`}
                    className="rounded-2xl bg-cyan-400 px-5 py-3 text-sm font-black uppercase tracking-wide text-black"
                  >
                    Contact Seller
                  </a>

                  <Link
                    href="/contact"
                    className="rounded-2xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-black uppercase tracking-wide text-white"
                  >
                    Need Delivery?
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-12 text-center">
            <h2 className="text-3xl font-black">
              No Listings Available
            </h2>

            <p className="mt-4 text-white/60">
              Be the first to list fitness equipment on the SmartGymOps
              marketplace.
            </p>

            <Link
              href="/equipment-for-sale/new"
              className="mt-8 inline-flex rounded-2xl bg-cyan-400 px-8 py-4 text-sm font-black uppercase tracking-wide text-black"
            >
              Create Listing
            </Link>
          </div>
        )}
      </section>
    </main>
  )
}