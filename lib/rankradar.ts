import 'server-only'
import { createClient } from '@supabase/supabase-js'

export function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export type SeoAccount = {
  id: string
  access_token: string
  business_name: string
  website_url: string
  owner_email: string
  owner_name: string
  location: string
  industry: string
  plan: string
  stripe_customer_id: string
  stripe_subscription_id: string
  subscription_status: string
  keywords_limit: number
  competitors_limit: number
  blog_generation: boolean
  onboarded: boolean
  last_scanned_at: string | null
  created_at: string
}

export const PLANS = {
  starter: {
    name: 'Starter',
    price: 49,
    priceId: process.env.STRIPE_PRICE_STARTER!,
    keywords: 15,
    competitors: 5,
    blog: false,
    description: '15 keywords, 5 competitors, weekly scan + email report',
  },
  pro: {
    name: 'Pro',
    price: 99,
    priceId: process.env.STRIPE_PRICE_PRO!,
    keywords: 50,
    competitors: 10,
    blog: true,
    description: '50 keywords, 10 competitors, blog post generation included',
  },
}

export async function getAccountByToken(token: string): Promise<SeoAccount | null> {
  const { data } = await db()
    .from('seo_accounts')
    .select('*')
    .eq('access_token', token)
    .single()
  return data ?? null
}

export async function getAccountById(id: string): Promise<SeoAccount | null> {
  const { data } = await db()
    .from('seo_accounts')
    .select('*')
    .eq('id', id)
    .single()
  return data ?? null
}
