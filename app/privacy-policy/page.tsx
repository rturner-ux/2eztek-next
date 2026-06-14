// app/privacy-policy/page.tsx
import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy | 2EZ TEK',
  description: 'Privacy policy for 2EZ TEK fitness equipment repair and service company serving Dallas Fort Worth.',
  alternates: { canonical: 'https://www.2eztek.com/privacy-policy' },
  openGraph: {
    title: 'Privacy Policy | 2EZ TEK',
    url: 'https://www.2eztek.com/privacy-policy',
    siteName: '2EZ TEK',
    type: 'website',
  },
}

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-white px-6 py-32 text-slate-900 lg:px-16">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 inline-flex rounded-full border border-cyan-200 bg-cyan-50 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-cyan-600">
          Legal
        </div>
        <h1 className="text-4xl font-black leading-tight md:text-6xl">
          Privacy Policy
        </h1>
        <p className="mt-4 text-sm text-slate-400">Last updated: May 2026</p>

        <div className="mt-12 space-y-10 leading-8 text-slate-600">

          <section>
            <h2 className="mb-4 text-2xl font-black text-slate-900">1. Overview</h2>
            <p>2EZ TEK LLC ("2EZ TEK", "we", "us", or "our") operates the website located at 2eztek.com and provides fitness equipment repair, assembly, installation, and maintenance services across Dallas Fort Worth, Texas. This Privacy Policy explains how we collect, use, and protect your personal information when you use our website or services.</p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-black text-slate-900">2. Information We Collect</h2>
            <p>We collect information you provide directly to us, including:</p>
            <ul className="mt-4 list-none space-y-2">
              {[
                'Name, phone number, and email address when you submit a service request or contact form',
                'Service address when you request an in-home or commercial service visit',
                'Equipment details including brand, model, and issue description',
                'Payment information processed through secure third-party payment processors',
                'Communications you send us via email, phone, or the website chat',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-cyan-400" />
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-4">We also automatically collect certain technical information when you visit our website, including IP address, browser type, pages visited, and time spent on pages through analytics tools including Google Analytics and PostHog.</p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-black text-slate-900">3. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul className="mt-4 list-none space-y-2">
              {[
                'Schedule and fulfill fitness equipment repair, assembly, and maintenance service requests',
                'Contact you about your service request, appointment, or follow-up',
                'Send confirmation emails and service updates',
                'Improve our website, services, and customer experience',
                'Respond to your inquiries and provide customer support',
                'Comply with legal obligations',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-cyan-400" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-black text-slate-900">4. Information Sharing</h2>
            <p>We do not sell, rent, or trade your personal information to third parties. We may share your information only in the following circumstances:</p>
            <ul className="mt-4 list-none space-y-2">
              {[
                'With service technicians and staff to fulfill your service request',
                'With third-party tools we use to operate our business (email delivery, analytics, CRM)',
                'When required by law or to protect the rights and safety of 2EZ TEK or others',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-cyan-400" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-black text-slate-900">5. Data Retention</h2>
            <p>We retain your personal information for as long as necessary to provide services, maintain business records, and comply with legal obligations. Service request records may be retained for up to 7 years for business and tax purposes.</p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-black text-slate-900">6. Cookies and Analytics</h2>
            <p>Our website uses cookies and similar tracking technologies to analyze traffic and improve user experience. We use Google Analytics and PostHog for website analytics. You can opt out of Google Analytics by installing the Google Analytics opt-out browser add-on. Most browsers allow you to control cookies through their settings.</p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-black text-slate-900">7. Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="mt-4 list-none space-y-2">
              {[
                'Request access to the personal information we hold about you',
                'Request correction of inaccurate personal information',
                'Request deletion of your personal information, subject to legal obligations',
                'Opt out of marketing communications at any time',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-cyan-400" />
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-4">To exercise any of these rights, contact us at <a href="mailto:support@2eztek.com" className="text-cyan-600 hover:underline">support@2eztek.com</a>.</p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-black text-slate-900">8. Security</h2>
            <p>We implement reasonable technical and organizational measures to protect your personal information. However, no method of transmission over the internet or electronic storage is 100% secure. We encourage you to use caution when sharing personal information online.</p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-black text-slate-900">9. Children's Privacy</h2>
            <p>Our website and services are not directed to children under the age of 13. We do not knowingly collect personal information from children under 13.</p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-black text-slate-900">10. Changes to This Policy</h2>
            <p>We may update this Privacy Policy from time to time. We will post the updated policy on this page with a revised date. Continued use of our website or services after changes are posted constitutes your acceptance of the updated policy.</p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-black text-slate-900">11. Contact Us</h2>
            <p>If you have questions about this Privacy Policy or how we handle your personal information, contact us:</p>
            <div className="mt-4 space-y-2 rounded-2xl border border-slate-200 bg-slate-50 p-6">
              <p><span className="font-black text-slate-900">2EZ TEK LLC</span></p>
              <p>Dallas Fort Worth, Texas</p>
              <p>Email: <a href="mailto:support@2eztek.com" className="text-cyan-600 hover:underline">support@2eztek.com</a></p>
              <p>Phone: <a href="tel:9728077232" className="text-cyan-600 hover:underline">(972) 807-7232</a></p>
            </div>
          </section>

        </div>

        <div className="mt-16 flex flex-wrap gap-4">
          <Link href="/terms-of-service" className="rounded-2xl border border-slate-200 bg-white px-6 py-4 text-sm font-black uppercase tracking-[0.12em] text-slate-700 shadow-sm transition hover:border-cyan-300 hover:bg-cyan-50">
            Terms of Service
          </Link>
          <Link href="/contact" className="rounded-2xl bg-cyan-400 px-6 py-4 text-sm font-black uppercase tracking-[0.12em] text-black transition hover:bg-cyan-300">
            Contact Us
          </Link>
        </div>
      </div>
    </main>
  )
}
