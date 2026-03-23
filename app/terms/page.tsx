import Link from "next/link";

export default function TermsOfServicePage() {
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
          <h1 className="text-2xl font-bold text-gray-900">Terms of Service</h1>
          <p className="mt-2 text-sm text-gray-400">Last updated: March 2026</p>

          <div className="mt-8 space-y-8">
            {/* Acceptance */}
            <section>
              <h2 className="mb-3 text-lg font-semibold text-gray-900">
                1. Acceptance of Terms
              </h2>
              <p className="text-sm leading-relaxed text-gray-600">
                By accessing or using GoodTally (&quot;the Service&quot;), operated at
                goodtally.app, you agree to be bound by these Terms of Service. If
                you are using the Service on behalf of an organization, you represent
                that you have the authority to bind that organization to these terms.
                If you do not agree, please do not use the Service.
              </p>
            </section>

            {/* Description of Service */}
            <section>
              <h2 className="mb-3 text-lg font-semibold text-gray-900">
                2. Description of Service
              </h2>
              <p className="text-sm leading-relaxed text-gray-600">
                GoodTally is a volunteer management platform designed for small
                nonprofits. The Service allows organizations to track volunteers,
                log hours, manage events, organize committees, and export data. We
                offer both free and paid plans as described on our pricing page.
              </p>
            </section>

            {/* User Accounts */}
            <section>
              <h2 className="mb-3 text-lg font-semibold text-gray-900">
                3. User Accounts and Responsibilities
              </h2>
              <p className="text-sm leading-relaxed text-gray-600">
                To use GoodTally, you must create an account with a valid email
                address and a secure password. You are responsible for maintaining
                the confidentiality of your login credentials and for all activity
                that occurs under your account. You agree to provide accurate
                information during registration and to keep it up to date. Please
                notify us immediately at{" "}
                <a
                  href="mailto:support@goodtally.app"
                  className="text-blue-600 hover:underline"
                >
                  support@goodtally.app
                </a>{" "}
                if you suspect unauthorized access to your account.
              </p>
            </section>

            {/* Acceptable Use */}
            <section>
              <h2 className="mb-3 text-lg font-semibold text-gray-900">
                4. Acceptable Use
              </h2>
              <p className="text-sm leading-relaxed text-gray-600">
                You agree to use the Service only for lawful purposes and in
                accordance with these terms. You may not:
              </p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-relaxed text-gray-600">
                <li>Use the Service to store or transmit malicious code</li>
                <li>
                  Attempt to gain unauthorized access to other accounts or systems
                </li>
                <li>
                  Use the Service to harass, abuse, or harm others
                </li>
                <li>
                  Resell or redistribute the Service without written permission
                </li>
                <li>
                  Interfere with or disrupt the integrity or performance of the
                  Service
                </li>
              </ul>
            </section>

            {/* Data Ownership */}
            <section>
              <h2 className="mb-3 text-lg font-semibold text-gray-900">
                5. Data and Content Ownership
              </h2>
              <p className="text-sm leading-relaxed text-gray-600">
                You retain full ownership of all data and content you upload or
                create through the Service, including volunteer records, event
                information, and hour logs. We do not claim any intellectual
                property rights over your content. You grant GoodTally a limited
                license to host, store, and display your data solely to operate and
                provide the Service to you.
              </p>
            </section>

            {/* Service Availability */}
            <section>
              <h2 className="mb-3 text-lg font-semibold text-gray-900">
                6. Service Availability
              </h2>
              <p className="text-sm leading-relaxed text-gray-600">
                The Service is provided on an &quot;as is&quot; and &quot;as
                available&quot; basis. While we strive to keep GoodTally reliable
                and available, we do not guarantee uninterrupted or error-free
                operation. We may perform scheduled maintenance, and the Service may
                experience occasional downtime. We do not offer formal service level
                agreements (SLAs).
              </p>
            </section>

            {/* Limitation of Liability */}
            <section>
              <h2 className="mb-3 text-lg font-semibold text-gray-900">
                7. Limitation of Liability
              </h2>
              <p className="text-sm leading-relaxed text-gray-600">
                To the maximum extent permitted by law, GoodTally and its operators
                shall not be liable for any indirect, incidental, special,
                consequential, or punitive damages, including loss of data, revenue,
                or profits, arising from your use of the Service. Our total
                liability for any claim related to the Service shall not exceed the
                amount you paid us in the twelve months prior to the claim.
              </p>
            </section>

            {/* Termination */}
            <section>
              <h2 className="mb-3 text-lg font-semibold text-gray-900">
                8. Termination
              </h2>
              <p className="text-sm leading-relaxed text-gray-600">
                You may close your account at any time by contacting us. We reserve
                the right to suspend or terminate your access if you violate these
                terms or use the Service in a way that could harm other users or the
                platform. Upon termination, you may request an export of your data
                within 30 days, after which we may delete it from our systems.
              </p>
            </section>

            {/* Changes to Terms */}
            <section>
              <h2 className="mb-3 text-lg font-semibold text-gray-900">
                9. Changes to These Terms
              </h2>
              <p className="text-sm leading-relaxed text-gray-600">
                We may update these terms from time to time. When we make
                significant changes, we will notify you by email or through a notice
                in the Service. Your continued use of GoodTally after changes take
                effect constitutes acceptance of the updated terms.
              </p>
            </section>

            {/* Contact */}
            <section>
              <h2 className="mb-3 text-lg font-semibold text-gray-900">
                10. Contact Us
              </h2>
              <p className="text-sm leading-relaxed text-gray-600">
                If you have questions about these terms, please reach out to us at{" "}
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
              <Link href="/privacy" className="hover:text-gray-600">
                Privacy Policy
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
