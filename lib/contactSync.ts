import 'server-only'
import { createOutlookContact } from '@/lib/msGraph'
import { createGoogleContact } from '@/lib/googleContacts'

/**
 * Add a new customer to both Outlook and Google contacts, mirroring the old
 * Zapier-based flow. Fire-and-forget: failures are logged, never thrown, so
 * this never blocks or fails the request it's called from.
 */
export async function syncCustomerContact(opts: {
  name: string
  phone?: string
  email?: string
  address?: string
}): Promise<void> {
  await Promise.allSettled([
    createOutlookContact(opts),
    createGoogleContact(opts),
  ])
}
