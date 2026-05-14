import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

type EquipmentListing = {
  id: string
  title: string
  category: string | null
  brand: string | null
  model: string | null
  condition: string | null
  city: string | null
  state: string | null
  price: number | null
  description: string | null
  seller_email: string | null
  created_at: string
}

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables')
  }

  return createClient(supabaseUrl, supabaseKey)
}

function formatPrice(price: number | null) {
  if (!price) return null

  return Number(price).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  })
}

export default async function EquipmentListingsPage() {
  const supabase = getSupabaseClient()

  const { data } = await supabase
    .from('equipment_listings')
    .select('*')
    .eq('status', 'approved')
    .order('created_at', { ascending: false })

  const listings = (data || []) as EquipmentListing[]

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050B14] text-white">
      <div className="fixed inset-0 z-0 overflow-hidden">
        <img
          src="/images/blog-gym-background.webp"
          alt="Marketplace Background"
          className="h-full w-[112%] max-w-none object-cover opacity-[0.35]"
        />

        <div className="absolute inset-0 bg-black/60" />

        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,11,20,0.25)_0%,rgba(5,11,20,0.96)_100%)]" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.14),transparent_34%)]" />
      </div>

      <section className="relative z-10 border-b border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="max-w-5xl">
            <div className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-5 py-2 text-xs font-black uppercase tracking-[0.24em] text-cyan-300 backdrop-blur-xl">
              SmartGymOps Marketplace
            </div>

            <h1 className="mt-8 text-5xl font-black leading-[0.92] tracking-tight md:text-7xl">
              Buy & Sell
              <span className="block text-white/55">
                Fitness Equipment.
              </span>
            </h1>

            <p className="mt-8 max-w-3xl text-lg leading-8 text-white/70 md:text-xl">
              Browse commercial and residential fitness equipment listings.
              Need delivery, assembly, installation, diagnostics, repairs,
              or preventative maintenance? 2EZ TEK can handle the full process.
            </p>

            <div className="mt-12 flex flex-wrap gap-4">
              <Link
                href="/equipment-for-sale/new"
                className="rounded-2xl bg-cyan-400 px-8 py-4 text-sm font-black uppercase tracking-[0.14em] text-black transition hover:bg-cyan-300"
              >
                List Equipment
              </Link>

              <Link
                href="/contact"
                className="rounded-2xl border border-white/15 bg-white/5 px-8 py-4 text-sm font-black uppercase tracking-[0.14em] text-white backdrop-blur-xl"
              >
                Request Delivery
              </Link>
            </div>

            <div className="mt-12 flex flex-wrap gap-4">
              <div className="rounded-2xl border border-white/10 bg-black/25 px-6 py-5 backdrop-blur-xl">
                <div className="text-xs font-black uppercase tracking-[0.18em] text-cyan-300">
                  Active Listings
                </div>

                <div className="mt-2 text-3xl font-black">
                  {listings.length}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/25 px-6 py-5 backdrop-blur-xl">
                <div className="text-xs font-black uppercase tracking-[0.18em] text-cyan-300">
                  Services Available
                </div>

                <div className="mt-2 text-sm leading-7 text-white/70">
                  Delivery • Assembly • Repairs • Installation
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 px-6 py-20">
        <div className="mx-auto max-w-7xl">
          {listings.length > 0 ? (
            <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
              {listings.map((listing) => (
                <div
                  key={listing.id}
                  className="group overflow-hidden rounded-[2.5rem] border border-white/10 bg-black/25 shadow-[0_25px_90px_rgba(0,0,0,0.35)] backdrop-blur-2xl transition duration-500 hover:-translate-y-2 hover:border-cyan-300/20"
                >
                  <div className="relative overflow-hidden">
                    <img
                      src="/images/blog-gym-background.webp"
                      alt={listing.title}
                      className="h-[240px] w-full object-cover transition duration-[1800ms] group-hover:scale-110"
                    />

                    <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_20%,rgba(0,0,0,0.82)_100%)]" />

                    <div className="absolute left-6 top-6 inline-flex rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.22em] text-cyan-200 backdrop-blur-xl">
                      {listing.category || 'Fitness Equipment'}
                    </div>
                  </div>

                  <div className="p-7">
                    <h2 className="text-3xl font-black leading-tight">
                      {listing.title}
                    </h2>

                    <div className="mt-5 grid gap-3 text-sm text-white/70">
                      <div>
                        <span className="font-black text-white">
                          Brand:
                        </span>{' '}
                        {listing.brand || 'N/A'}
                      </div>

                      <div>
                        <span className="font-black text-white">
                          Model:
                        </span>{' '}
                        {listing.model || 'N/A'}
                      </div>

                      <div>
                        <span className="font-black text-white">
                          Condition:
                        </span>{' '}
                        {listing.condition || 'N/A'}
                      </div>

                      <div>
                        <span className="font-black text-white">
                          Location:
                        </span>{' '}
                        {listing.city || 'N/A'}
                        {listing.state ? `, ${listing.state}` : ''}
                      </div>
                    </div>

                    {listing.price && (
                      <div className="mt-7 text-4xl font-black text-cyan-300">
                        {formatPrice(listing.price)}
                      </div>
                    )}

                    {listing.description && (
                      <p className="mt-6 line-clamp-4 leading-7 text-white/65">
                        {listing.description}
                      </p>
                    )}

                    <div className="mt-8 flex flex-wrap gap-3">
                      {listing.seller_email && (
                        <a
                          href={`mailto:${listing.seller_email}`}
                          className="rounded-2xl bg-cyan-400 px-5 py-3 text-sm font-black uppercase tracking-[0.14em] text-black transition hover:bg-cyan-300"
                        >
                          Contact Seller
                        </a>
                      )}

                      <Link
                        href="/contact"
                        className="rounded-2xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-black uppercase tracking-[0.14em] text-white backdrop-blur-xl"
                      >
                        Need Delivery?
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-[3rem] border border-white/10 bg-black/25 p-16 text-center backdrop-blur-2xl">
              <h2 className="text-4xl font-black">
                No Listings Available
              </h2>

              <p className="mt-5 text-lg text-white/65">
                Be the first to post fitness equipment in the
                SmartGymOps marketplace.
              </p>

              <Link
                href="/equipment-for-sale/new"
                className="mt-10 inline-flex rounded-2xl bg-cyan-400 px-8 py-4 text-sm font-black uppercase tracking-[0.14em] text-black"
              >
                Create Listing
              </Link>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}