import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import ListingContact from './ListingContact'

export const dynamic = 'force-dynamic'

type PageProps = {
  params: Promise<{ id: string }>
}

type Listing = {
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
  seller_name: string | null
  status: string
  created_at: string
}

function formatPrice(price: number | null) {
  if (!price) return null
  return Number(price).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  })
}

export default async function ListingDetailPage({ params }: PageProps) {
  const { id } = await params

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data } = await supabase
    .from('equipment_listings')
    .select('id, title, category, brand, model, condition, city, state, price, description, photo_url, seller_name, status, created_at')
    .eq('id', id)
    .maybeSingle()

  if (!data) notFound()

  const listing = data as Listing

  const isAvailable = listing.status === 'approved'

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050B14] text-white">
      <div className="fixed inset-0 z-0 overflow-hidden">
        <img
          src="/images/blog-gym-background.webp"
          alt="Marketplace Background"
          className="h-full w-[112%] max-w-none object-cover opacity-[0.25]"
        />
        <div className="absolute inset-0 bg-black/70" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,11,20,0.3)_0%,rgba(5,11,20,0.97)_100%)]" />
      </div>

      <div className="relative z-10 px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <Link
            href="/equipment-for-sale/listings"
            className="text-sm font-bold text-cyan-300"
          >
            ← Back to Listings
          </Link>

          {!isAvailable ? (
            <div className="mt-12 rounded-[2rem] border border-white/10 bg-black/30 p-12 text-center">
              <h1 className="text-3xl font-black">Listing Not Available</h1>
              <p className="mt-4 text-white/60">
                This listing is pending review or has been removed.
              </p>
              <Link
                href="/equipment-for-sale/listings"
                className="mt-8 inline-flex rounded-2xl bg-cyan-400 px-8 py-4 text-sm font-black uppercase tracking-[0.14em] text-black"
              >
                Browse All Listings
              </Link>
            </div>
          ) : (
            <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_420px]">
              {/* Left: listing details */}
              <div>
                <div className="overflow-hidden rounded-[2.5rem] border border-white/10 bg-black/25 backdrop-blur-2xl">
                  {/* Photo */}
                  <div className="relative h-[360px] overflow-hidden">
                    <img
                      src={listing.photo_url || '/images/blog-gym-background.webp'}
                      alt={listing.title}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_40%,rgba(0,0,0,0.75)_100%)]" />

                    {listing.category && (
                      <div className="absolute left-7 top-7 inline-flex rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-cyan-200 backdrop-blur-xl">
                        {listing.category}
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="p-8 md:p-10">
                    <h1 className="text-4xl font-black leading-tight md:text-5xl">
                      {listing.title}
                    </h1>

                    {listing.price && (
                      <div className="mt-6 text-5xl font-black text-cyan-300">
                        {formatPrice(listing.price)}
                      </div>
                    )}

                    <div className="mt-8 grid gap-4 text-sm sm:grid-cols-2">
                      {listing.brand && (
                        <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4">
                          <div className="text-xs font-black uppercase tracking-[0.18em] text-white/40">Brand</div>
                          <div className="mt-1 font-bold">{listing.brand}</div>
                        </div>
                      )}
                      {listing.model && (
                        <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4">
                          <div className="text-xs font-black uppercase tracking-[0.18em] text-white/40">Model</div>
                          <div className="mt-1 font-bold">{listing.model}</div>
                        </div>
                      )}
                      {listing.condition && (
                        <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4">
                          <div className="text-xs font-black uppercase tracking-[0.18em] text-white/40">Condition</div>
                          <div className="mt-1 font-bold">{listing.condition}</div>
                        </div>
                      )}
                      {(listing.city || listing.state) && (
                        <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4">
                          <div className="text-xs font-black uppercase tracking-[0.18em] text-white/40">Location</div>
                          <div className="mt-1 font-bold">
                            {[listing.city, listing.state].filter(Boolean).join(', ')}
                          </div>
                        </div>
                      )}
                    </div>

                    {listing.description && (
                      <div className="mt-8">
                        <div className="mb-3 text-xs font-black uppercase tracking-[0.18em] text-white/40">
                          Description
                        </div>
                        <p className="leading-8 text-white/75">{listing.description}</p>
                      </div>
                    )}

                    <div className="mt-8 rounded-2xl border border-cyan-400/20 bg-cyan-400/5 p-5 text-sm leading-7 text-white/65">
                      Need delivery, assembly, or a pre-purchase inspection?{' '}
                      <Link href="/contact" className="font-bold text-cyan-300 hover:underline">
                        Contact 2EZ TEK
                      </Link>{' '}
                      for white-glove service in Dallas Fort Worth.
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: contact form */}
              <div className="lg:sticky lg:top-8 lg:self-start">
                <ListingContact listingId={listing.id} listingTitle={listing.title} />

                <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-6 text-center text-sm text-white/50">
                  Listed by <span className="font-bold text-white/70">{listing.seller_name || 'Seller'}</span>
                  <br />
                  Contact info is kept private.
                  All messages monitored by 2EZ TEK.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
