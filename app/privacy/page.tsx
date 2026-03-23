import Link from "next/link";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Nav */}
      <header className="border-b border-gray-100 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <Link href="/" className="text-lg font-bold text-blue-600">
            GoodTally
          </Link>
          <Link
            href="/login"
            className="text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            Sign In
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-16">
        <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900">Privacy Policy</h1>
          <p className="mt-2 text-sm text-gray-400">Last updated: March 2026</p>

          <div className="mt-8 space-y-8">
            {/* Intro */}
            <section>
              <p className="text-sm leading-relaxed text-gray-600">
                GoodTally (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) operates
                the goodtally.app website and platform. This Privacy Policy explains
                how we collect, use, and protect your information when you use our
                Service.
              </p>
            </section>

            {/* Information We Collect */}
            <section>
              <h2 className="mb-3 text-lg font-semibold text-gray-900">
                1. Information We Collect
              </h2>
              <p className="text-sm leading-relaxed text-gray-600">
                We collect the following types of information:
              </p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-relaxed text-gray-600">
                <li>
                  <strong>Account information:</strong> Your name, email address,
                  and password when you create an account.
                </li>
                <li>
                  <strong>Organization data:</strong> Information you enter about
                  your nonprofit, volunteers, events, committees, and hours.
                </li>
                <li>
                  <strong>Usage analytics:</strong> Basic usage data such as page
                  views, feature usage, and session duration to help us improve the
                  Service. This data is aggregated and does not include personal
                  volunteer records.
                </li>
                <li>
                  <strong>Payment information:</strong> If you subscribe to a paid
                  plan, payment details are collected and processed by Stripe. We do
                  not store your full credit card number.
                </li>
              </ul>
            </section>

            {/* How We Use Information */}
            <section>
              <h2 className="mb-3 text-lg font-semibold text-gray-900">
                2. How We Use Your Information
              </h2>
              <ul className="list-disc space-y-1 pl-5 text-sm leading-relaxed text-gray-600">
                <li>To provide, maintain, and improve the Service</li>
                <li>To create and manage your account</li>
                <li>To process payments and send billing-related communications</li>
                <li>To send important notices such as security alerts or policy changes</li>
                <li>To respond to your support requests</li>
                <li>To understand how the Service is used so we can make it better</li>
              </ul>
            </section>

            {/* Data Storage */}
            <section>
              <h2 className="mb-3 text-lg font-semibold text-gray-900">
                3. Data Storage
              </h2>
              <p className="text-sm leading-relaxed text-gray-600">
                Your data is stored on cloud infrastructure provided by Supabase,
                which uses Amazon Web Services (AWS) data centers. Data is encrypted
                in transit (TLS) and at rest. We choose infrastructure providers
                that maintain strong security practices and compliance standards.
              </p>
            </section>

            {/* Data Sharing */}
            <section>
              <h2 className="mb-3 text-lg font-semibold text-gray-900">
                4. Data Sharing
              </h2>
              <p className="text-sm leading-relaxed text-gray-600">
                We do not sell, rent, or trade your personal information or
                organization data. We only share data with the following categories
                of service providers, strictly as needed to operate the Service:
              </p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-relaxed text-gray-600">
                <li>
                  <strong>Supabase:</strong> Database hosting and authentication
                </li>
                <li>
                  <strong>Stripe:</strong> Payment processing for paid plans
                </li>
                <li>
                  <strong>Email providers:</strong> Transactional emails such as
                  account confirmation and password resets
                </li>
              </ul>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                We may also disclose information if required by law or to protect
                the rights, safety, or property of GoodTally or its users.
              </p>
            </section>

            {/* Data Retention and Deletion */}
            <section>
              <h2 className="mb-3 text-lg font-semibold text-gray-900">
                5. Data Retention and Deletion
              </h2>
              <p className="text-sm leading-relaxed text-gray-600">
                We retain your data for as long as your account is active or as
                needed to provide the Service. If you delete your account, we will
                remove your personal information and organization data from our
                active systems within 30 days. Some data may be retained in
                encrypted backups for up to 90 days before being permanently
                deleted.
              </p>
            </section>

            {/* Cookies */}
            <section>
              <h2 className="mb-3 text-lg font-semibold text-gray-900">
                6. Cookies
              </h2>
              <p className="text-sm leading-relaxed text-gray-600">
                GoodTally uses minimal cookies. We use essential authentication
                session cookies to keep you signed in. We do not use advertising
                cookies or third-party tracking cookies. No cookie consent banner is
                needed because we only use strictly necessary cookies for the
                Service to function.
              </p>
            </section>

            {/* Children's Privacy */}
            <section>
              <h2 className="mb-3 text-lg font-semibold text-gray-900">
                7. Children&apos;s Privacy
              </h2>
              <p className="text-sm leading-relaxed text-gray-600">
                GoodTally is not directed at children under the age of 13. We do not
                knowingly collect personal information from children under 13. If we
                learn that we have collected information from a child under 13, we
                will delete it promptly. If you believe a child has provided us with
                personal information, please contact us at{" "}
                <a
                  href="mailto:support@goodtally.app"
                  className="text-blue-600 hover:underline"
                >
                  support@goodtally.app
                </a>
                .
              </p>
            </section>

            {/* Security */}
            <section>
              <h2 className="mb-3 text-lg font-semibold text-gray-900">
                8. Security Measures
              </h2>
              <p className="text-sm leading-relaxed text-gray-600">
                We take reasonable measures to protect your data, including
                encryption in transit and at rest, secure authentication through
                Supabase, and role-based access controls within the application. No
                system is perfectly secure, but we are committed to following
                industry best practices to safeguard your information.
              </p>
            </section>

            {/* Your Rights */}
            <section>
              <h2 className="mb-3 text-lg font-semibold text-gray-900">
                9. Your Rights
              </h2>
              <p className="text-sm leading-relaxed text-gray-600">
                You have the right to:
              </p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-relaxed text-gray-600">
                <li>
                  <strong>Access</strong> the personal information we hold about you
                </li>
                <li>
                  <strong>Export</strong> your organization data at any time using
                  our CSV export feature
                </li>
                <li>
                  <strong>Correct</strong> inaccurate information in your account
                  settings
                </li>
                <li>
                  <strong>Delete</strong> your account and all associated data by
                  contacting us
                </li>
              </ul>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                To exercise any of these rights, email us at{" "}
                <a
                  href="mailto:support@goodtally.app"
                  className="text-blue-600 hover:underline"
                >
                  support@goodtally.app
                </a>
                .
              </p>
            </section>

            {/* Changes */}
            <section>
              <h2 className="mb-3 text-lg font-semibold text-gray-900">
                10. Changes to This Policy
              </h2>
              <p className="text-sm leading-relaxed text-gray-600">
                We may update this Privacy Policy from time to time. When we make
                significant changes, we will notify you by email or through a notice
                in the Service. We encourage you to review this page periodically
                for the latest information.
              </p>
            </section>

            {/* Contact */}
            <section>
              <h2 className="mb-3 text-lg font-semibold text-gray-900">
                11. Contact Us
              </h2>
              <p className="text-sm leading-relaxed text-gray-600">
                If you have questions or concerns about this Privacy Policy, please
                contact us at{" "}
                <a
                  href="mailto:support@goodtally.app"
                  className="text-blue-600 hover:underline"
                >
                  support@goodtally.app
                </a>
                .
              </p>
            </section>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-white mt-8">
        <div className="mx-auto max-w-5xl px-4 py-6 text-xs text-gray-400">
          <div className="flex items-center justify-between">
            <span>GoodTally&trade;</span>
            <div className="flex gap-4">
              <Link href="/pricing" className="hover:text-gray-600">
                Pricing
              </Link>
              <Link href="/terms" className="hover:text-gray-600">
                Terms of Service
              </Link>
              <Link href="/login" className="hover:text-gray-600">
                Sign In
              </Link>
            </div>
          </div>
          <p className="mt-3 text-center text-gray-300">
            &copy; {new Date().getFullYear()} GoodTally. All rights reserved. GoodTally is a trademark of its respective owners.
          </p>
        </div>
      </footer>
    </div>
  );
}
