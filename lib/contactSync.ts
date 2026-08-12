import 'server-only'
import { createOutlookContact } from '@/lib/msGraph'
import { createGoogleContact } from '@/lib/googleContacts'
import { createSquareCustomer } from '@/lib/square'

/**
 * Add a new customer to Outlook, Google contacts, and Square, mirroring the
 * old Zapier-based flow. The Square customer means the technician can create
 * an invoice after a job without first adding the customer there by hand.
 * Fire-and-forget: failures are logged, never thrown, so this never blocks
 * or fails the request it's called from.
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
    createSquareCustomer(opts),
  ])
}
