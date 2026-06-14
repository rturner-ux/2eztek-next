import Link from 'next/link'
import Image from 'next/image'
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
  photo_url: string | null
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
    .select('id, title, category, brand, model, condition, city, state, price, description, photo_url, created_at')
    .eq('status', 'approved')
    .order('created_at', { ascending: false })

  const listings = (data || []) as EquipmentListing[]

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-50 text-slate-900">
      <div className="fixed inset-0 z-0 overflow-hidden">
        <img
          src="/images/project-3.webp"
          alt="Marketplace Background"
          className="h-full w-[112%] max-w-none object-cover opacity-[0.85]"
        />

        <div className="absolute inset-0 bg-black/30" />

        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,11,20,0.1)_0%,rgba(5,11,20,0.7)_100%)]" />
      </div>

      <section className="relative z-10 border-b border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="grid gap-12 lg:grid-cols-[1fr_0.82fr] lg:items-center">
            <div className="max-w-5xl">
              <div className="inline-flex rounded-full border border-cyan-200 bg-cyan-50 px-5 py-2 text-xs font-black uppercase tracking-[0.24em] text-cyan-600">
                SmartGymOps Marketplace
              </div>

              <h1 className="mt-8 text-5xl font-black leading-[0.92] tracking-tight text-white md:text-7xl">
                Buy & Sell
                <span className="block text-white/55">Fitness Equipment.</span>
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
                  className="rounded-2xl border border-slate-200 bg-white px-8 py-4 text-sm font-black uppercase tracking-[0.14em] text-slate-700 shadow-sm transition hover:border-cyan-300 hover:bg-cyan-50"
                >
                  Request Delivery
                </Link>
              </div>

              <div className="mt-12 flex flex-wrap gap-4">
                <div className="rounded-2xl border border-white/10 bg-black/25 px-6 py-5">
                  <div className="text-xs font-black uppercase tracking-[0.18em] text-cyan-400">
                    Active Listings
                  </div>
                  <div className="mt-2 text-3xl font-black text-white">{listings.length}</div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/25 px-6 py-5">
                  <div className="text-xs font-black uppercase tracking-[0.18em] text-cyan-400">
                    Services Available
                  </div>
                  <div className="mt-2 text-sm leading-7 text-white/70">
                    Delivery • Assembly • Repairs • Installation
                  </div>
                </div>
              </div>
            </div>

            <div className="relative hidden lg:block">
              <div className="absolute -inset-4 rounded-[3rem] bg-cyan-400/10 blur-3xl" />
              <div className="relative overflow-hidden rounded-[3rem] border border-white/10 bg-black/25 shadow-[0_30px_110px_rgba(0,0,0,0.45)]">
                <Image
                  src="/images/fire.webp"
                  alt="First responder fitness facility with equipment serviced by 2EZ TEK"
                  width={900}
                  height={620}
                  priority
                  className="h-[520px] w-full object-cover"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_35%,rgba(5,11,20,0.86)_100%)]" />
                <div className="absolute bottom-0 p-7">
                  <div className="text-xs font-black uppercase tracking-[0.24em] text-cyan-400">
                    Equipment Support
                  </div>
                  <div className="mt-3 text-2xl font-black text-white">
                    Delivery, setup, repair, and maintenance for every listing.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 bg-slate-50 px-6 py-20">
        <div className="mx-auto max-w-7xl">
          {listings.length > 0 ? (
            <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
              {listings.map((listing) => (
                <Link
                  key={listing.id}
                  href={`/equipment-for-sale/listings/${listing.id}`}
                  className="group block overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white shadow-sm transition duration-500 hover:-translate-y-2 hover:border-cyan-300 hover:shadow-md"
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={listing.photo_url || '/images/blog-gym-background.webp'}
                      alt={listing.title}
                      className="h-[240px] w-full object-cover transition duration-[1800ms] group-hover:scale-110"
                    />

                    <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_20%,rgba(0,0,0,0.60)_100%)]" />

                    <div className="absolute left-6 top-6 inline-flex rounded-full border border-cyan-200 bg-cyan-50 px-4 py-2 text-[10px] font-black uppercase tracking-[0.22em] text-cyan-600">
                      {listing.category || 'Fitness Equipment'}
                    </div>
                  </div>

                  <div className="p-7">
                    <h2 className="text-3xl font-black leading-tight text-slate-900">{listing.title}</h2>

                    <div className="mt-5 grid gap-3 text-sm text-slate-500">
                      <div>
                        <span className="font-black text-slate-900">Brand:</span>{' '}
                        {listing.brand || 'N/A'}
                      </div>

                      <div>
                        <span className="font-black text-slate-900">Condition:</span>{' '}
                        {listing.condition || 'N/A'}
                      </div>

                      <div>
                        <span className="font-black text-slate-900">Location:</span>{' '}
                        {listing.city || 'N/A'}
                        {listing.state ? `, ${listing.state}` : ''}
                      </div>
                    </div>

                    {listing.price && (
                      <div className="mt-7 text-4xl font-black text-cyan-600">
                        {formatPrice(listing.price)}
                      </div>
                    )}

                    {listing.description && (
                      <p className="mt-6 line-clamp-3 leading-7 text-slate-600">
                        {listing.description}
                      </p>
                    )}

                    <div className="mt-8">
                      <span className="inline-flex rounded-2xl bg-cyan-400 px-5 py-3 text-sm font-black uppercase tracking-[0.14em] text-black transition group-hover:bg-cyan-300">
                        View &amp; Message Seller
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-[3rem] border border-slate-200 bg-white p-16 text-center shadow-sm">
              <h2 className="text-4xl font-black text-slate-900">No Listings Available</h2>

              <p className="mt-5 text-lg text-slate-600">
                Be the first to post fitness equipment in the SmartGymOps marketplace.
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
